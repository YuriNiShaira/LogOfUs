from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Couple
from .serializers import (
    RegisterSerializer,
    JoinCoupleSerializer,
    LoginSerializer,
    CoupleSerializer
)


def get_tokens_for_user(user):
    """Generate JWT tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user and return JWT tokens"""
    serializer = RegisterSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Registration failed', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    result = serializer.save()
    user = result['user']
    couple = result['couple']
    
    # Generate tokens for automatic login
    tokens = get_tokens_for_user(user)
    
    return Response({
        'message': f'Welcome, {user.profile.display_name}!',
        'username': user.username,
        'display_name': user.profile.display_name,
        'couple_name': couple.name,
        'couple_id': couple.id,
        'anniversary_date': couple.anniversary_date,
        'invite_code': couple.invite_code,
        'partner_name': 'Waiting for partner to join...',
        'has_partner': False,
        'tokens': tokens,
        'note': f'Share this code with your partner: {couple.invite_code}',
        'created_at': couple.created_at,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Login failed', 'details': serializer.errors},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    validated_data = serializer.validated_data
    user = validated_data['user']
    couple = validated_data['couple']
    
    tokens = get_tokens_for_user(user)
    
    other_member = couple.members.exclude(user=user).first()
    has_partner = other_member is not None
    partner_name = other_member.display_name if has_partner else "Waiting for partner to join..."
    invite_code = couple.invite_code if not has_partner else None
    
    return Response({
        'message': f'Welcome back, {user.profile.display_name}!',
        'username': user.username,
        'display_name': user.profile.display_name,
        'couple_name': couple.name,
        'couple_id': couple.id,
        'anniversary_date': couple.anniversary_date,
        'partner_name': partner_name,
        'has_partner': has_partner,
        'invite_code': invite_code,
        'tokens': tokens,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def join_couple(request):
    serializer = JoinCoupleSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Failed to join couple', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    result = serializer.save()
    user = result['user']
    couple = result['couple']
    
    tokens = get_tokens_for_user(user)
    
    other_member = couple.members.exclude(user=user).first()
    partner_name = other_member.display_name if other_member else 'Your Partner'
    
    return Response({
        'message': f'Successfully joined {couple.name}! 💕',
        'username': user.username,
        'display_name': user.profile.display_name,
        'couple_name': couple.name,
        'couple_id': couple.id,
        'anniversary_date': couple.anniversary_date,
        'partner_name': partner_name,
        'has_partner': True,
        'tokens': tokens,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Blacklist refresh token on logout"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass
    
    return Response({'message': 'See you soon! 💕'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_token(request):
    """Get new access token using refresh token"""
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Refresh token required'}, status=400)
    
    try:
        refresh = RefreshToken(refresh_token)
        return Response({
            'access': str(refresh.access_token),
        })
    except Exception:
        return Response({'error': 'Invalid refresh token'}, status=401)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_couple_info(request):
    """Get current user's couple information"""
    couple = request.user.profile.couple
    if not couple:
        return Response({'error': 'Not part of a couple'}, status=404)
    
    serializer = CoupleSerializer(couple)
    data = serializer.data
    
    other_member = couple.members.exclude(user=request.user).first()
    data['partner_name'] = other_member.display_name if other_member else 'Waiting for partner...'
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invite_code(request):
    """Get the couple's invite code"""
    couple = request.user.profile.couple
    if not couple:
        return Response({'error': 'Not part of a couple'}, status=404)
    
    return Response({
        'invite_code': couple.invite_code,
        'couple_name': couple.name,
        'members': couple.members.count(),
        'message': f'Share this code with your partner: {couple.invite_code}'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def contact(request):
    name = request.data.get('name', 'Anonymous')
    email = request.data.get('email', '')
    message = request.data.get('message', '')
    
    if not message:
        return Response({'error': 'Message is required'}, status=400)
    
    try:
        from django.core.mail import send_mail
        send_mail(
            f'[LogOfUs] Message from {name}',
            f'From: {name} ({email})\n\n{message}',
            email or 'noreply@logofus.com',
            ['yurimauricio0404@gmail.com'],
            fail_silently=True,
        )
    except Exception:
        pass
    
    return Response({'success': True,'message': f'Thanks {name}! Your message has been saved. We\'ll get back to you soon! 💕'})



@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get or update user profile"""
    profile = request.user.profile
    
    if request.method == 'GET':
        return Response({
            'id': profile.id,
            'username': request.user.username,
            'display_name': profile.display_name,
            'couple': {
                'id': profile.couple.id,
                'name': profile.couple.name,
                'anniversary_date': profile.couple.anniversary_date,
                'invite_code': profile.couple.invite_code,
                'member_count': profile.couple.members.count(),
                'partner1_name': profile.couple.members.first().display_name if profile.couple.members.first() else None,
                'partner2_name': profile.couple.members.last().display_name if profile.couple.members.count() > 1 else None,
            } if profile.couple else None
        })
    
    display_name = request.data.get('display_name')
    if display_name:
        profile.display_name = display_name
        profile.save()
    
    return Response({
        'id': profile.id,
        'username': request.user.username,
        'display_name': profile.display_name,
        'couple': {
            'id': profile.couple.id,
            'name': profile.couple.name,
            'anniversary_date': profile.couple.anniversary_date,
        } if profile.couple else None
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user's password - only for the authenticated user"""
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password:
        return Response({'error': 'Current password is required'}, status=400)
    
    if not new_password:
        return Response({'error': 'New password is required'}, status=400)
    
    if not user.check_password(current_password):
        return Response({'error': 'Current password is incorrect'}, status=400)
    
    if len(new_password) < 8:
        return Response({'error': 'Password must be at least 8 characters'}, status=400)
    
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Password changed successfully!'})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_couple(request):
    """Update couple name and anniversary date"""
    couple = request.user.profile.couple
    if not couple:
        return Response({'error': 'Not part of a couple'}, status=404)
    
    name = request.data.get('name')
    anniversary_date = request.data.get('anniversary_date')
    
    if name:
        couple.name = name
    
    if anniversary_date:
        couple.anniversary_date = anniversary_date
    
    couple.save()
    
    return Response({
        'id': couple.id,
        'name': couple.name,
        'anniversary_date': couple.anniversary_date,
        'invite_code': couple.invite_code,
        'member_count': couple.members.count(),
        'partner1_name': couple.members.first().display_name if couple.members.first() else None,
        'partner2_name': couple.members.last().display_name if couple.members.count() > 1 else None,
    })
