from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'years', views.YearViewSet)
router.register(r'memories', views.MemoryViewSet)
router.register(r'love-letters', views.LoveLetterViewSet)
router.register(r'anime-ratings', views.AnimeRatingViewSet)
router.register(r'anime-categories', views.AnimeCategoryViewSet)
router.register(r'fun-facts', views.YearFunFactsViewSet)
router.register(r'game-scores', views.CoupleGameScoreViewSet)
router.register(r'quiz-questions', views.QuizQuestionViewSet)
router.register(r'quiz-scores', views.QuizScoreViewSet)
router.register(r'song-recommendations', views.SongRecommendationViewSet)
router.register(r'bucketlist', views.BucketListViewSet)
router.register(r'pet-photos', views.PetPhotoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', views.get_stats, name='stats'),
    path('calendar/', views.calendar_memories, name='calendar-memories'),
]