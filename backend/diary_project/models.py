from django.db import models
from accounts.models import Couple
from django.utils import timezone
from datetime import date, timedelta

class Year(models.Model):
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='years')
    year_number = models.IntegerField()   # 0 = prequel, 1, 2, 3... = relationship years
    cover_image = models.URLField(max_length=500, null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['year_number']
        unique_together = ['couple', 'year_number']

    def get_date_range(self):
        """Return (start_date, end_date) for this relationship year.
        - Prequel (0): from the earliest representable date to the day before the anniversary.
        - Normal years (1+): from anniversary + (n-1) years to anniversary + n years - 1 day.
        """
        anniversary = self.couple.anniversary_date
        if self.year_number == 0:
            # Prequel covers any date before the anniversary
            start_date = date.min
            end_date = anniversary - timedelta(days=1)
        else:
            start_date = anniversary.replace(year=anniversary.year + (self.year_number - 1))
            end_date = anniversary.replace(year=anniversary.year + self.year_number) - timedelta(days=1)
        return start_date, end_date

    def __str__(self):
        if self.year_number == 0:
            return f"{self.couple.name} – Prequel"
        return f"{self.couple.name} – Year {self.year_number}"


class Memory(models.Model):
    MEMORY_TYPES = [
        ('milestone', '💫 Milestone'),
        ('date', '💕 Date'),
        ('travel', '✈️ Travel'),
        ('everyday', '🌸 Everyday Magic'),
        ('special', '✨ Special Moment'),
        ('sad', '💙 Sad Moment'),
    ]

    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='memories')
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='memories')
    title = models.CharField(max_length=200)
    date = models.DateField()
    description = models.TextField()
    image = models.URLField(max_length=500, null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
    favorite_quote = models.TextField(blank=True)
    memory_type = models.CharField(max_length=20, choices=MEMORY_TYPES, default='special')
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        verbose_name_plural = 'Memories'

    def __str__(self):
        return f"{self.title} - {self.date}"


class LoveLetter(models.Model):
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='love_letters')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.couple.name} - {self.title}"


class AnimeRating(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('anime', '🎬 Anime'),
        ('movie', '🎥 Movie'),
        ('show', '📺 TV Show'),
    ]

    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='anime_ratings')
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='anime_ratings',null=True,)
    title = models.CharField(max_length=200)
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPE_CHOICES, default='anime')
    my_ratings = models.JSONField(default=dict, blank=True)
    shaira_ratings = models.JSONField(default=dict, blank=True)
    my_overall = models.FloatField(default=0)
    shaira_overall = models.FloatField(default=0)
    combined_overall = models.FloatField(default=0)
    genre = models.CharField(max_length=100, blank=True)
    watched_together = models.BooleanField(default=True)
    my_favorite_character = models.CharField(max_length=100, blank=True)
    shaira_favorite_character = models.CharField(max_length=100, blank=True)
    favorite_moment = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    watched_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-combined_overall', 'title']

    def __str__(self):
        year_label = f"Year {self.year.year_number}" if self.year else "Global"
        return f"[{self.get_media_type_display()}] {self.title} - {year_label}"

    def calculate_overall(self, ratings_dict):
        if not ratings_dict:
            return 0
        values = [v for v in ratings_dict.values() if isinstance(v, (int, float)) and v > 0]
        if not values:
            return 0
        return round(sum(values) / len(values), 1)

    def save(self, *args, **kwargs):
        self.my_overall = self.calculate_overall(self.my_ratings)
        self.shaira_overall = self.calculate_overall(self.shaira_ratings)
        if self.my_overall > 0 and self.shaira_overall > 0:
            self.combined_overall = round((self.my_overall + self.shaira_overall) / 2, 1)
        elif self.my_overall > 0:
            self.combined_overall = self.my_overall
        elif self.shaira_overall > 0:
            self.combined_overall = self.shaira_overall
        else:
            self.combined_overall = 0
        super().save(*args, **kwargs)


class AnimeCategory(models.Model):
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='anime_categories')
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='anime_categories', null=True, blank=True)
    name = models.CharField(max_length=50)
    order = models.IntegerField(default=0)
    media_type = models.CharField(max_length=20, choices=AnimeRating.MEDIA_TYPE_CHOICES, default='anime')

    class Meta:
        ordering = ['order', 'name']
        unique_together = []
        constraints = [
            models.UniqueConstraint(
                fields=['couple', 'year', 'name', 'media_type'],
                name='unique_anime_category_per_year',
                condition=models.Q(year__isnull=False)
            ),
            models.UniqueConstraint(
                fields=['couple', 'name', 'media_type'],
                name='unique_anime_category_global',
                condition=models.Q(year__isnull=True)
            ),
        ]

    def __str__(self):
        year_label = f"Year {self.year.year_number}" if self.year else "Global"
        return f"[{self.get_media_type_display()}] {self.name} - {year_label}"


class YearFunFacts(models.Model):
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='year_fun_facts')
    year = models.OneToOneField(Year, on_delete=models.CASCADE, related_name='fun_facts')
    favorite_food = models.CharField(max_length=100, blank=True)
    favorite_anime = models.CharField(max_length=200, blank=True)
    song_of_the_year = models.CharField(max_length=200, blank=True)
    best_moment = models.TextField(blank=True)
    inside_jokes = models.TextField(blank=True)
    places_visited = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Fun Facts - {self.year.year}"


class CoupleGameScore(models.Model):
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='game_scores')
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='game_scores',null=True, blank=True)
    game_name = models.CharField(max_length=60)
    my_score = models.IntegerField(default=0)
    shaira_score = models.IntegerField(default=0)
    game_history = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = []  
        constraints = [
            models.UniqueConstraint(
                fields=['couple', 'year', 'game_name'],
                name='unique_game_score_per_year',
                condition=models.Q(year__isnull=False)
            ),
            models.UniqueConstraint(
                fields=['couple', 'game_name'],
                name='unique_game_score_global',
                condition=models.Q(year__isnull=True)
            ),
        ]

    def __str__(self):
        year_label = f"Year {self.year.year_number}" if self.year else "Global"
        return f"{self.game_name} - {year_label}"

    def add_win(self, winner: str):
        if winner == 'me':
            self.my_score += 1
        elif winner == 'shaira':
            self.shaira_score += 1
        self.save()

    def get_leader(self):
        if self.my_score > self.shaira_score:
            return 'me'
        elif self.shaira_score > self.my_score:
            return 'shaira'
        return 'tie'


class QuizQuestion(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy (1 point)'),
        ('medium', 'Medium (3 points)'),
        ('hard', 'Hard (5 points)'),
    ]
    CATEGORY_CHOICES = [
        ('about_me', 'About Me'),
        ('about_shaira', 'About Shaira'),
        ('our_relationship', 'Our Relationship'),
        ('fun_facts', 'Fun Facts'),
        ('memories', 'Memories'),
        ('other', 'Other'),
    ]

    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='quiz_questions')
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='quiz_questions')
    question = models.TextField()
    answer = models.CharField(max_length=500)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='easy')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    created_by = models.CharField(max_length=20, choices=[('me', 'Me'), ('shaira', 'Shaira')], default='me')
    hint = models.TextField(blank=True)
    is_used = models.BooleanField(default=False)
    last_used = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['difficulty', '-created_at']

    def __str__(self):
        return f"{self.question[:50]}... ({self.get_difficulty_display()})"

    def get_points(self):
        points_map = {'easy': 1, 'medium': 3, 'hard': 5}
        return points_map.get(self.difficulty, 1)


class QuizScore(models.Model):
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='quiz_scores')
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='quiz_scores')
    my_score = models.IntegerField(default=0)
    shaira_score = models.IntegerField(default=0)
    answered_questions = models.ManyToManyField(QuizQuestion, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['year']

    def __str__(self):
        return f"Quiz Score {self.year.year}"

    def add_points(self, player: str, points: int, question: QuizQuestion):
        if player == "me":
            self.my_score += points
        elif player == "shaira":
            self.shaira_score += points
        self.answered_questions.add(question)
        question.is_used = True
        question.last_used = timezone.now()
        question.save()
        self.save()


class SongRecommendation(models.Model):
    MOOD_CHOICES = [
        ('romantic', 'Romantic'),
        ('sad', 'Sad'),
        ('chill', 'Chill'),
        ('other', 'Other'),
    ]
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='song_recommendations')
    year = models.ForeignKey(
        Year, 
        on_delete=models.CASCADE, 
        related_name='song_recommendations',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=200)
    artist = models.CharField(max_length=200)
    creator = models.ForeignKey(
        'accounts.UserProfile',
        on_delete=models.CASCADE,
        related_name='created_songs',
        null=True,
        blank=True
    )
    youtube_link = models.URLField(blank=True)
    spotify_link = models.URLField(blank=True)
    is_listened = models.BooleanField(default=False)
    rating = models.IntegerField(null=True, blank=True, choices=[(i, str(i)) for i in range(1, 6)])
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES, default='other') 
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.artist}"


class BucketListItem(models.Model):
    CATEGORY_CHOICES = [
        ('travel', '✈️ Travel'),
        ('date', '💕 Date Ideas'),
        ('adventure', '🏔️ Adventure'),
        ('food', '🍽️ Food'),
        ('learning', '📚 Learn Together'),
        ('milestone', '🎯 Milestone'),
        ('other', '✨ Other'),
    ]
    STATUS_CHOICES = [
        ('pending', '⏳ Not Yet'),
        ('planned', '📅 Planned'),
        ('completed', '✅ Completed'),
    ]

    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='bucket_list_items')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    added_by = models.CharField(max_length=20, choices=[('me', 'Me'), ('shaira', 'Shaira')], default='me')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.IntegerField(default=1, choices=[(1, '⭐ Low'), (2, '⭐⭐ Medium'), (3, '⭐⭐⭐ High')])
    
    # for partner-specific completion
    completed_by_me = models.BooleanField(default=False)
    completed_by_shaira = models.BooleanField(default=False)
    
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.CharField(max_length=20, choices=[('me', 'Me'), ('shaira', 'Shaira'), ('both', 'Both')], null=True, blank=True)
    completion_notes = models.TextField(blank=True)
    image = models.URLField(max_length=500, null=True, blank=True)
    target_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['status', '-priority', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"

    def complete(self, completed_by, notes=''):
        self.status = 'completed'
        self.completed_by = completed_by
        self.completed_at = timezone.now()
        if notes:
            self.completion_notes = notes
        
        if completed_by == 'me':
            self.completed_by_me = True
        elif completed_by == 'shaira':
            self.completed_by_shaira = True
        elif completed_by == 'both':
            self.completed_by_me = True
            self.completed_by_shaira = True
        
        self.save()


class PetPhoto(models.Model):
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='pet_photos')
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='pet_photos')
    image = models.URLField(max_length=500)
    pet_name = models.CharField(max_length=100)
    caption = models.TextField(blank=True)
    date_taken = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_taken', '-created_at']

    def __str__(self):
        return f"{self.pet_name} - {self.year.year_number}"

    def save(self, *args, **kwargs):
        if not self.date_taken:
            self.date_taken = timezone.now().date()
        super().save(*args, **kwargs)