from django.contrib import admin
from .models import Year, Memory, LoveLetter, AnimeRating, AnimeCategory, YearFunFacts, CoupleGameScore, QuizQuestion, QuizScore, SongRecommendation, BucketListItem

@admin.register(Year)
class YearAdmin(admin.ModelAdmin):
    list_display = ['id', 'couple', 'get_year_number', 'description', 'created_at']
    search_fields = ['couple__name', 'description']
    ordering = ['couple', 'year_number']

    @admin.display(description='Year Number')
    def get_year_number(self, obj):
        return f"Year {obj.year_number}"

@admin.register(Memory)
class MemoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'get_year', 'memory_type', 'is_favorite', 'couple']
    list_filter = ['memory_type', 'is_favorite', 'year__year_number']
    search_fields = ['title', 'description', 'location', 'couple__name']
    ordering = ['-date']

    @admin.display(description='Year')
    def get_year(self, obj):
        return f"{obj.year.couple.name} - Year {obj.year.year_number}" if obj.year else None

@admin.register(LoveLetter)
class LoveLetterAdmin(admin.ModelAdmin):
    list_display = ['title', 'couple', 'created_at', 'is_active']
    list_filter = ['is_active']
    search_fields = ['title', 'content']

@admin.register(AnimeRating)
class AnimeRatingAdmin(admin.ModelAdmin):
    list_display = ['title', 'media_type', 'year', 'combined_overall', 'couple']
    search_fields = ['title', 'genre']
    list_filter = ['media_type', 'watched_together']

@admin.register(AnimeCategory)
class AnimeCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'year', 'media_type', 'couple']
    search_fields = ['name']
    list_filter = ['media_type']

@admin.register(YearFunFacts)
class YearFunFactsAdmin(admin.ModelAdmin):
    list_display = ['year', 'couple']
    search_fields = ['year__couple__name']

@admin.register(CoupleGameScore)
class CoupleGameScoreAdmin(admin.ModelAdmin):
    list_display = ['game_name', 'year', 'my_score', 'shaira_score', 'couple']
    search_fields = ['game_name']
    list_filter = ['year']

@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ['question', 'year', 'difficulty', 'created_by', 'is_used']
    search_fields = ['question', 'answer']
    list_filter = ['difficulty', 'category', 'is_used']

@admin.register(QuizScore)
class QuizScoreAdmin(admin.ModelAdmin):
    list_display = ['year', 'my_score', 'shaira_score', 'couple']
    search_fields = ['year__couple__name']

@admin.register(SongRecommendation)
class SongRecommendationAdmin(admin.ModelAdmin):
    list_display = ['title', 'artist', 'year', 'get_creator_display', 'mood', 'is_listened', 'rating', 'created_at']
    list_filter = ['mood', 'is_listened', 'rating', 'created_at']
    search_fields = ['title', 'artist']
    readonly_fields = ['created_at', 'couple', 'creator']
    
    @admin.display(description='Creator')
    def get_creator_display(self, obj):
        if obj.creator:
            return obj.creator.display_name
        return 'Unknown'

@admin.register(BucketListItem)
class BucketListItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'status', 'priority', 'couple']
    list_filter = ['category', 'status', 'priority']
    search_fields = ['title', 'description']