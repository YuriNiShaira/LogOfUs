from rest_framework import serializers
from .models import Year, Memory, LoveLetter, AnimeRating, YearFunFacts, AnimeCategory, CoupleGameScore, QuizScore, QuizQuestion, SongRecommendation, BucketListItem, PetPhoto

class MemorySerializer(serializers.ModelSerializer):
    image = serializers.CharField(max_length=500, required=False, allow_null=True, allow_blank=True, read_only=True)
    
    class Meta:
        model = Memory
        fields = '__all__'
        read_only_fields = ['couple']

class YearSerializer(serializers.ModelSerializer):
    memories = MemorySerializer(many=True, read_only=True)
    memory_count = serializers.SerializerMethodField()
    cover_image = serializers.CharField(max_length=500, required=False, allow_null=True, allow_blank=True, read_only=True)

    class Meta:
        model = Year
        fields = '__all__'
        read_only_fields = ['couple']

    def get_memory_count(self, obj):
        return obj.memories.count()


class LoveLetterSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoveLetter
        fields = '__all__'
        read_only_fields = ['couple']  

class AnimeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimeCategory
        fields = '__all__'
        read_only_fields = ['couple']  

class AnimeRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimeRating
        fields = '__all__'
        read_only_fields = ['couple']  

class YearFunFactsSerializer(serializers.ModelSerializer):
    class Meta:
        model = YearFunFacts
        fields = '__all__'
        read_only_fields = ['couple']  #

class CoupleGameScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoupleGameScore
        fields = '__all__'
        read_only_fields = ['couple']  

class QuizQuestionSerializer(serializers.ModelSerializer):
    points = serializers.SerializerMethodField()
    difficulty_display = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()

    class Meta:
        model = QuizQuestion
        fields = '__all__'
        read_only_fields = ['couple']  
    
    def get_points(self, obj):
        return obj.get_points()
    
    def get_difficulty_display(self, obj):
        return obj.get_difficulty_display()
    
    def get_category_display(self, obj):
        return obj.get_category_display()

class QuizScoreSerializer(serializers.ModelSerializer):
    total_questions = serializers.SerializerMethodField()

    class Meta:
        model = QuizScore
        fields = '__all__'
        read_only_fields = ['couple']  
    
    def get_total_questions(self, obj):
        return obj.answered_questions.count()
    
class SongRecommendationSerializer(serializers.ModelSerializer):
    recommended_by_display = serializers.SerializerMethodField()
    recommended_to_display = serializers.SerializerMethodField()
    mood_display = serializers.SerializerMethodField()

    class Meta:
        model = SongRecommendation
        fields = '__all__'
        read_only_fields = ['couple']

    def get_recommended_by_display(self, obj):
        return obj.get_recommended_by_display()

    def get_recommended_to_display(self, obj):
        return obj.get_recommended_to_display()

    def get_mood_display(self, obj):
        return obj.get_mood_display() if obj.mood else ''
    

class BucketListItemSerializer(serializers.ModelSerializer):
    category_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    priority_display = serializers.SerializerMethodField()
    added_by_display = serializers.SerializerMethodField()

    class Meta:
        model = BucketListItem
        fields = '__all__'
        read_only_fields = ['couple']  

    def get_category_display(self, obj):
        return obj.get_category_display()
    
    def get_status_display(self, obj):
        return obj.get_status_display()
    
    def get_priority_display(self, obj):
        return obj.get_priority_display()
    
    def get_added_by_display(self, obj):
        return obj.get_added_by_display()


class PetPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetPhoto
        fields = '__all__'
        read_only_fields = ['couple']