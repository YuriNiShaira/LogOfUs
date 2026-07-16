from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Couple, UserProfile


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer for registration"""
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']
    
    def create(self, validated_data):
        """Create user with hashed password"""
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile with display name"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'display_name', 'couple']


class CoupleSerializer(serializers.ModelSerializer):
    """Couple data with member info"""
    member_count = serializers.SerializerMethodField()
    partner1_name = serializers.SerializerMethodField()
    partner2_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Couple
        fields = [
            'id', 'name', 'anniversary_date', 'invite_code',
            'member_count', 'partner1_name', 'partner2_name',
            'created_at'
        ]
        read_only_fields = ['invite_code']
    
    def get_member_count(self, obj):
        return obj.members.count()
    
    def get_partner1_name(self, obj):
        first_member = obj.members.first()
        return first_member.display_name if first_member else None
    
    def get_partner2_name(self, obj):
        members = obj.members.all()
        if members.count() > 1:
            return members[1].display_name
        return None


# ============================================
# REGISTRATION SERIALIZERS
# ============================================

class RegisterSerializer(serializers.Serializer):
    """Handles registration - creates couple with placeholder for partner"""
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    display_name = serializers.CharField(max_length=50)
    anniversary_date = serializers.DateField()
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                f"Username '{value}' is already taken."
            )
        return value
    
    def validate_anniversary_date(self, value):
        from django.utils import timezone

        if value > timezone.now().date():
            raise serializers.ValidationError("Anniversary date cannot be in the future!")
    
        if value.year < 1950:
            raise serializers.ValidationError("Please enter a valid anniversary date (1950 or later).")
        
        if value.year < 1900:
            raise serializers.ValidationError("Please enter a realistic anniversary date.")
        
        return value
    
    def create(self, validated_data):
        display_name = validated_data.pop('display_name')
        anniversary_date = validated_data.pop('anniversary_date')
        
        # Create couple with placeholder partner name
        couple = Couple.objects.create(
            name=f"{display_name} & Partner",  
            anniversary_date=anniversary_date
        )
        
        # Create user
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create profile
        UserProfile.objects.create(
            user=user,
            couple=couple,
            display_name=display_name
        )
        
        return {
            'user': user,
            'couple': couple,
            'invite_code': couple.invite_code
        }


class JoinCoupleSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    display_name = serializers.CharField(max_length=50)
    invite_code = serializers.CharField(max_length=6)
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(f"Username '{value}' is already taken.")
        return value
    
    def validate_invite_code(self, value):
        try:
            couple = Couple.objects.get(invite_code=value)
        except Couple.DoesNotExist:
            raise serializers.ValidationError("Invalid invite code.")
        
        if couple.members.count() >= 2:
            raise serializers.ValidationError("This couple already has 2 members!")
        
        self.couple = couple
        return value
    
    def create(self, validated_data):
        invite_code = validated_data.pop('invite_code')
        display_name = validated_data.pop('display_name')
        couple = self.couple
        
        # Create user
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Link to couple
        UserProfile.objects.create(
            user=user,
            couple=couple,
            display_name=display_name
        )
        
        # UPDATE couple name with real partner name!
        first_member = couple.members.exclude(user=user).first()
        if first_member:
            couple.name = f"{first_member.display_name} & {display_name}"
            couple.save()
        
        return {
            'user': user,
            'couple': couple,
            'display_name': display_name
        }


# ============================================
# LOGIN SERIALIZER
# ============================================

class LoginSerializer(serializers.Serializer):
    """Simple login with username/password"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        from django.contrib.auth import authenticate
        
        user = authenticate(username=data['username'], password=data['password'])
        
        if not user:
            raise serializers.ValidationError("Invalid username or password. Please try again.")
        
        # Check if user has a profile and is linked to a couple
        if not hasattr(user, 'profile'):
            raise serializers.ValidationError("Account is not properly set up. Please contact support." )
        
        if not user.profile.couple:
            raise serializers.ValidationError("You haven't joined a couple yet! Ask your partner for the invite code.")
        
        data['user'] = user
        data['couple'] = user.profile.couple
        data['display_name'] = user.profile.display_name
        
        return data


# ============================================
# RESPONSE SERIALIZER
# ============================================

class LoginResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    username = serializers.CharField()
    display_name = serializers.CharField()
    couple_name = serializers.CharField()
    couple_id = serializers.IntegerField()
    anniversary_date = serializers.DateField()
    partner_name = serializers.SerializerMethodField()
    
    def get_partner_name(self, obj):
        """Get the other partner's name"""
        couple = obj.get('couple')
        current_user = obj.get('user')
        if couple and current_user:
            other_member = couple.members.exclude(user=current_user).first()
            if other_member:
                return other_member.display_name
        return "Your Partner"