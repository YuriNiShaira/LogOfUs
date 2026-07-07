from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import (
    Year, Memory, LoveLetter, AnimeRating, YearFunFacts, 
    AnimeCategory, CoupleGameScore, QuizScore, QuizQuestion, 
    SongRecommendation, BucketListItem, PetPhoto
)
from .serializers import (
    YearSerializer, MemorySerializer, LoveLetterSerializer, 
    AnimeRatingSerializer, YearFunFactsSerializer, AnimeCategorySerializer, 
    CoupleGameScoreSerializer, QuizScoreSerializer, QuizQuestionSerializer, 
    SongRecommendationSerializer, BucketListItemSerializer, PetPhotoSerializer
)
from .permissions import IsCoupleMember
from django.db.models import Avg
import os
import uuid
import requests
from rest_framework import serializers as drf_serializers

def upload_to_supabase(file, folder="memories"):
    """Upload file to Supabase Storage and return public URL"""
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    bucket = "memories"  
    
    if not supabase_url or not supabase_key or not file:
        return None
    
    file_ext = file.name.split('.')[-1] if '.' in file.name else 'jpg'
    file_name = f"{folder}/{uuid.uuid4()}.{file_ext}"
    
    try:
        response = requests.post(
            f"{supabase_url}/storage/v1/object/{bucket}/{file_name}",  
            headers={
                "Authorization": f"Bearer {supabase_key}",
                "Content-Type": file.content_type or "image/jpeg",
            },
            data=file.read(),
        )
        
        if response.status_code == 200:
            return f"{supabase_url}/storage/v1/object/public/{bucket}/{file_name}"  
        else:
            print(f"Upload failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Upload error: {e}")
        return None
    
# ============================================
# HELPER
# ============================================

def get_couple(request):
    """Get couple from authenticated user's profile"""
    if request.user.is_authenticated and hasattr(request.user, 'profile'):
        return request.user.profile.couple
    return None


# ============================================
# BASE VIEWSET (auto-filters by couple)
# ============================================

class CoupleFilteredViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsCoupleMember]
    
    def get_queryset(self):
        couple = get_couple(self.request)
        if couple:
            return self.queryset.filter(couple=couple)
        return self.queryset.none()
    
    def perform_create(self, serializer):
        couple = get_couple(self.request)
        if not couple:
            raise drf_serializers.ValidationError({'detail': 'Your user profile does not have a couple assigned.'})
        serializer.save(couple=couple)


# ============================================
# VIEWSETS
# ============================================

class YearViewSet(CoupleFilteredViewSet):
    queryset = Year.objects.all()
    serializer_class = YearSerializer

    def perform_create(self, serializer):
        couple = get_couple(self.request)
        year_number = serializer.validated_data.get('year_number')

        if year_number is not None and year_number < 0:
            raise drf_serializers.ValidationError({'year_number': 'Year number cannot be negative.'})

        if Year.objects.filter(couple=couple, year_number=year_number).exists():
            label = "Prequel" if year_number == 0 else f"Year {year_number}"
            raise drf_serializers.ValidationError({'year_number': f'{label} already exists for your relationship.'})

        image_file = self.request.FILES.get('cover_image')
        image_url = None
        if image_file:
            image_url = upload_to_supabase(image_file, folder='year_covers')

        year = serializer.save(couple=couple)
        if image_url:
            year.cover_image = image_url
            year.save(update_fields=['cover_image'])

    def update(self, request, *args, **kwargs):
        year = self.get_object()
        couple = get_couple(request)
        
        new_year_number = request.data.get('year_number')
        if new_year_number is not None:
            new_year_number = int(new_year_number)
            if new_year_number < 0:
                return Response(
                    {'error': 'Year number cannot be negative.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if Year.objects.filter(couple=couple, year_number=new_year_number).exclude(id=year.id).exists():
                label = "Prequel" if new_year_number == 0 else f"Year {new_year_number}"
                return Response(
                    {'error': f'{label} already exists for your relationship.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        image_file = request.FILES.get('cover_image')
        if image_file:
            image_url = upload_to_supabase(image_file, folder='year_covers')
            request.data._mutable = True
            request.data['cover_image'] = image_url
            request.data._mutable = False
        
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def memories(self, request, pk=None):
        year = self.get_object()
        memories = year.memories.all()
        serializer = MemorySerializer(memories, many=True)
        return Response(serializer.data)


class MemoryViewSet(CoupleFilteredViewSet):
    queryset = Memory.objects.all()
    serializer_class = MemorySerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        year_id = request.query_params.get('year', None)
        if year_id:
            queryset = queryset.filter(year_id=year_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        couple = get_couple(self.request)
        year_id = self.request.data.get('year')
        memory_date = serializer.validated_data.get('date')
        image_file = self.request.FILES.get('image')

        if memory_date and memory_date > timezone.now().date():
            raise drf_serializers.ValidationError({
                'date': 'You cannot create a memory in the future!'
            })

        if year_id and memory_date:
            try:
                year_obj = Year.objects.get(id=year_id, couple=couple)
                start, end = year_obj.get_date_range()
                if not (start <= memory_date <= end):
                    raise drf_serializers.ValidationError({
                        'date': f'This date must be between {start.strftime("%b %d, %Y")} and {end.strftime("%b %d, %Y")} for Year {year_obj.year_number}.'
                    })
            except Year.DoesNotExist:
                pass

        image_url = None
        if image_file:
            image_url = upload_to_supabase(image_file)

        validated = serializer.validated_data.copy()
        validated.pop('image', None)
        memory = serializer.save(couple=couple, **validated)
        if image_url:
            memory.image = image_url
            memory.save(update_fields=['image'])

    def update(self, request, *args, **kwargs):
        memory = self.get_object()
        couple = get_couple(request)
        
        delete_image = request.data.get('delete_image') == 'true'
        image_file = request.FILES.get('image')
        
        if delete_image:
            memory.image = None
            memory.save(update_fields=['image'])
        elif image_file:
            image_url = upload_to_supabase(image_file)
            if image_url:
                memory.image = image_url
                memory.save(update_fields=['image'])
        
        serializer = self.get_serializer(memory, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        memory_date = serializer.validated_data.get('date')
        if memory_date and memory_date > timezone.now().date():
            raise drf_serializers.ValidationError({'date': 'You cannot set a memory in the future!'})
        
        year_id = request.data.get('year') or memory.year_id
        if year_id and memory_date:
            try:
                year_obj = Year.objects.get(id=year_id, couple=couple)
                start, end = year_obj.get_date_range()
                if not (start <= memory_date <= end):
                    raise drf_serializers.ValidationError({'date': f'This date must be between {start.strftime("%b %d, %Y")} and {end.strftime("%b %d, %Y")} for Year {year_obj.year_number}.'})
            except Year.DoesNotExist:
                pass
        
        self.perform_update(serializer)
        
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()


class LoveLetterViewSet(CoupleFilteredViewSet):
    queryset = LoveLetter.objects.filter(is_active=True)
    serializer_class = LoveLetterSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        if not queryset.exists():
            couple = get_couple(request)
            display_name = request.user.profile.display_name
            
            anniversary_date = "our special day"
            if couple and couple.anniversary_date:
                anniversary_date = couple.anniversary_date.strftime('%B %d, %Y')
            
            LoveLetter.objects.create(
                couple=couple,
                title=f"My Dearest {display_name}",
                content=f"""My love,

Every day with you feels like a beautiful dream come true. From the moment we met, my life has been filled with more joy, laughter, and love than I ever thought possible.

You are my sunshine on cloudy days, my comfort in difficult times, and my favorite person to share every moment with. Your smile lights up my world, and your love makes me a better person.

This diary is my gift to you - a collection of our beautiful memories together. Every photo, every story, every little moment captured here is a testament to our love story.

I can't wait to create many more memories with you, my love. Here's to our past, our present, and our beautiful future together.

Forever yours,
Your Love""",
                is_active=True
            )
            queryset = LoveLetter.objects.filter(couple=couple)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        active_letter = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_letter, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stats(request):
    couple = get_couple(request)
    
    if not couple:
        return Response({
            'total_years': 0,
            'total_memories': 0,
            'favorite_memories': 0,
            'days_together': 0
        })
    
    total_years = Year.objects.filter(couple=couple).exclude(year_number=0).count()
    total_memories = Memory.objects.filter(couple=couple).count()
    favorite_memories = Memory.objects.filter(couple=couple, is_favorite=True).count()
    
    return Response({
        'total_years': total_years,
        'total_memories': total_memories,
        'favorite_memories': favorite_memories,
        'days_together': calculate_days_together(couple)
    })


def calculate_days_together(couple):
    if couple and couple.anniversary_date:
        delta = timezone.now().date() - couple.anniversary_date
        return delta.days
    return 0


class AnimeRatingViewSet(CoupleFilteredViewSet):
    queryset = AnimeRating.objects.all()
    serializer_class = AnimeRatingSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        year_id = self.request.query_params.get('year', None)
        media_type = self.request.query_params.get('media_type', None)

        if year_id:
            try:
                queryset = queryset.filter(year_id=int(year_id))
            except (TypeError, ValueError):
                pass

        if media_type and media_type.strip().lower() != 'all':
            queryset = queryset.filter(media_type__iexact=media_type.strip())

        return queryset


class AnimeCategoryViewSet(CoupleFilteredViewSet):
    queryset = AnimeCategory.objects.all()
    serializer_class = AnimeCategorySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        year_id = self.request.query_params.get('year', None)
        media_type = self.request.query_params.get('media_type', None)

        if year_id:
            try:
                queryset = queryset.filter(year_id=int(year_id))
            except (TypeError, ValueError):
                pass

        if media_type and media_type.strip().lower() != 'all':
            queryset = queryset.filter(media_type__iexact=media_type.strip())

        return queryset


class YearFunFactsViewSet(CoupleFilteredViewSet):
    queryset = YearFunFacts.objects.all()
    serializer_class = YearFunFactsSerializer
    
    @action(detail=False, methods=['get'])
    def by_year(self, request):
        year_id = request.query_params.get('year_id')
        if year_id:
            fun_facts = self.get_queryset().filter(year_id=year_id).first()
            if fun_facts:
                serializer = self.get_serializer(fun_facts)
                return Response(serializer.data)
        return Response({})


class CoupleGameScoreViewSet(CoupleFilteredViewSet):
    queryset = CoupleGameScore.objects.all()
    serializer_class = CoupleGameScoreSerializer

    @action(detail=False, methods=['post'])
    def record_win(self, request):
        year_id = request.data.get('year_id')
        game_name = request.data.get('game_name')
        winner = request.data.get('winner')
        couple = get_couple(request)

        score, created = CoupleGameScore.objects.get_or_create(
            couple=couple,
            year_id=year_id,
            game_name=game_name,
            defaults={'my_score': 0, 'shaira_score': 0}
        )

        score.add_win(winner)
        serializer = self.get_serializer(score)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        year_id = request.query_params.get('year_id')
        scores = self.get_queryset().filter(year_id=year_id)

        total_my_wins = sum(s.my_score for s in scores)
        total_shaira_wins = sum(s.shaira_score for s in scores)

        return Response({
            'my_total': total_my_wins,
            'shaira_total': total_shaira_wins,
            'leader': 'me' if total_my_wins > total_shaira_wins else ('shaira' if total_shaira_wins > total_my_wins else 'tie'),
            'games': CoupleGameScoreSerializer(scores, many=True).data
        })


class QuizQuestionViewSet(CoupleFilteredViewSet):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        year_id = self.request.query_params.get('year', None)
        if year_id:
            queryset = queryset.filter(year_id=year_id)

        unused_only = self.request.query_params.get('unused', None)
        if unused_only == 'true':
            queryset = queryset.filter(is_used=False)
        
        created_by = self.request.query_params.get('created_by', None)
        if created_by:
            queryset = queryset.filter(created_by=created_by)

        return queryset
    
    @action(detail=False, methods=['get'])
    def random_question(self, request):
        year_id = request.query_params.get('year_id')
        difficulty = request.query_params.get('difficulty', None)

        queryset = self.get_queryset().filter(year_id=year_id, is_used=False)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)

        question = queryset.order_by('?').first()
        if question:
            serializer = self.get_serializer(question)
            return Response(serializer.data)
        return Response({'message': 'No questions available'}, status=404)


class QuizScoreViewSet(CoupleFilteredViewSet):
    queryset = QuizScore.objects.all()
    serializer_class = QuizScoreSerializer

    @action(detail=False, methods=['post'])
    def answer_question(self, request):
        year_id = request.data.get('year_id')
        question_id = request.data.get('question_id')
        player = request.data.get('player')
        answer = request.data.get('answer', '').strip()
        couple = get_couple(request)

        question = QuizQuestion.objects.get(id=question_id)
        score, _ = QuizScore.objects.get_or_create(
            couple=couple,
            year_id=year_id,
            defaults={'my_score': 0, 'shaira_score': 0}
        )

        is_correct = answer.lower() == question.answer.lower()

        if is_correct:
            points = question.get_points()
            score.add_points(player, points, question)
            return Response({
                'correct': True,
                'points_earned': points,
                'message': f'Correct! +{points} points!',
                'score': QuizScoreSerializer(score).data
            })
        else:
            return Response({
                'correct': False,
                'message': 'Not quite right! Try again or pick another question',
                'hint': question.hint if question.hint else None
            })
        
    @action(detail=False, methods=['post'])
    def reset_score(self, request):
        year_id = request.data.get('year_id')
        score = self.get_queryset().filter(year_id=year_id).first()
        if score:
            score.my_score = 0
            score.shaira_score = 0
            score.answered_questions.clear()
            score.save()
            QuizQuestion.objects.filter(year_id=year_id, couple=score.couple).update(
                is_used=False, last_used=None
            )
        return Response({'message': 'Scores reset successfully'})


class SongRecommendationViewSet(CoupleFilteredViewSet):
    queryset = SongRecommendation.objects.all()
    serializer_class = SongRecommendationSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        couple = get_couple(self.request)
        year_id = self.request.data.get('year')
        user_profile = self.request.user.profile

        if not couple:
            raise drf_serializers.ValidationError({'detail': 'Unable to determine your couple.'})

        if year_id:
            try:
                Year.objects.get(id=year_id, couple=couple)
            except Year.DoesNotExist:
                raise drf_serializers.ValidationError({'year': 'The selected year is not valid for your relationship.'})
        else:
            year_id = None

        rating = self.request.data.get('rating')
        if rating == 0:
            serializer.validated_data['rating'] = None

        serializer.save(
            couple=couple,
            year_id=year_id,
            creator=user_profile  
        )

    def perform_update(self, serializer):
        couple = get_couple(self.request)
        year_id = self.request.data.get('year')

        if not couple:
            raise drf_serializers.ValidationError({'detail': 'Unable to determine your couple.'})

        if year_id:
            try:
                Year.objects.get(id=year_id, couple=couple)
            except Year.DoesNotExist:
                raise drf_serializers.ValidationError({'year': 'The selected year is not valid for your relationship.'})

        rating = self.request.data.get('rating')
        if rating == 0:
            serializer.validated_data['rating'] = None

        serializer.save()

    def get_queryset(self):
        queryset = super().get_queryset()
        year_id = self.request.query_params.get('year', None)
        if year_id:
            queryset = queryset.filter(year_id=year_id)

        creator = self.request.query_params.get('creator', None)
        if creator:
            queryset = queryset.filter(creator__display_name=creator)

        is_listened = self.request.query_params.get('is_listened', None)
        if is_listened is not None:
            queryset = queryset.filter(is_listened=is_listened == 'true')

        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        couple = get_couple(request)
        if not couple:
            return Response({
                'total_songs': 0,
                'listened_count': 0,
                'my_recommendations': 0,
                'shaira_recommendations': 0,
            })
        
        year_id = request.query_params.get('year_id')
        queryset = self.get_queryset()
        
        if year_id:
            try:
                queryset = queryset.filter(year_id=year_id)
            except:
                pass

        members = list(couple.members.all())
        me = members[0] if len(members) > 0 else None
        partner = members[1] if len(members) > 1 else None

        my_count = queryset.filter(creator=me).count() if me else 0
        partner_count = queryset.filter(creator=partner).count() if partner else 0
        
        no_creator_count = queryset.filter(creator__isnull=True).count()
        if no_creator_count > 0:
            my_count += no_creator_count

        return Response({
            'total_songs': queryset.count(),
            'listened_count': queryset.filter(is_listened=True).count(),
            'my_recommendations': my_count,
            'shaira_recommendations': partner_count,
            'average_rating': queryset.filter(rating__gt=0).aggregate(avg=Avg('rating'))['avg'] or 0,
        })


class BucketListViewSet(CoupleFilteredViewSet):
    queryset = BucketListItem.objects.all()
    serializer_class = BucketListItemSerializer

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        item = self.get_object()
        completed_by = request.data.get('completed_by', 'both')
        notes = request.data.get('notes', '')
        item.complete(completed_by, notes)

        return Response({
            'success': True,
            'message': f'Bucket list item completed! "{item.title}"',
            'item': self.get_serializer(item).data
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.get_queryset()

        return Response({
            'total': queryset.count(),
            'completed': queryset.filter(status='completed').count(),
            'pending': queryset.filter(status='pending').count(),
            'planned': queryset.filter(status='planned').count(),
            'by_category': {
                'travel': queryset.filter(category='travel').count(),
                'date': queryset.filter(category='date').count(),
                'adventure': queryset.filter(category='adventure').count(),
                'food': queryset.filter(category='food').count(),
                'learning': queryset.filter(category='learning').count(),
                'milestone': queryset.filter(category='milestone').count(),
            },
            'completion_rate': round(
                queryset.filter(status='completed').count() / queryset.count() * 100 
                if queryset.count() > 0 else 0
            )
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calendar_memories(request):
    """Get memories grouped by date - FILTERED BY COUPLE"""
    couple = get_couple(request)
    
    if not couple:
        return Response({'memories': {}, 'total_dates': 0, 'total_memories': 0})
    
    year = request.query_params.get('year', None)
    month = request.query_params.get('month', None)

    queryset = Memory.objects.filter(couple=couple)

    if year:
        queryset = queryset.filter(date__year=year)
    if month:
        queryset = queryset.filter(date__month=month)

    from collections import defaultdict

    memories_by_date = defaultdict(list)
    for memory in queryset:
        date_key = memory.date.isoformat()
        
        image_url = memory.image if memory.image else None
        
        memories_by_date[date_key].append({
            'id': memory.id,
            'title': memory.title,
            'description': memory.description[:100],
            'image': image_url,
            'memory_type': memory.memory_type,
            'is_favorite': memory.is_favorite,
            'location': memory.location,
            'year_id': memory.year_id,
            'year': memory.year.year_number if memory.year else None, 
        })

    return Response({
        'memories': dict(memories_by_date),
        'total_dates': len(memories_by_date),
        'total_memories': queryset.count(),
    })


class PetPhotoViewSet(CoupleFilteredViewSet):
    queryset = PetPhoto.objects.all()
    serializer_class = PetPhotoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        year_id = self.request.query_params.get('year', None)
        if year_id:
            try:
                queryset = queryset.filter(year_id=int(year_id))
            except (TypeError, ValueError):
                pass
        return queryset

    def perform_create(self, serializer):
        couple = get_couple(self.request)
        year_id = self.request.data.get('year')

        if not couple:
            raise drf_serializers.ValidationError({'detail': 'Unable to determine your couple.'})

        if not year_id:
            raise drf_serializers.ValidationError({'year': 'Year is required.'})
        
        try:
            year_obj = Year.objects.get(id=year_id, couple=couple)
        except Year.DoesNotExist:
            raise drf_serializers.ValidationError({'year': 'The selected year is not valid for your relationship.'})
        
        image_file = self.request.FILES.get('image')
        if not image_file:
            raise drf_serializers.ValidationError({'image': 'Image file is required.'})
        
        image_url = upload_to_supabase(image_file, folder='pet_photos')
        
        date_taken = self.request.data.get('date_taken')
        if date_taken:
            try:
                from datetime import datetime
                date_taken_obj = datetime.strptime(date_taken, '%Y-%m-%d').date()
                if date_taken_obj > timezone.now().date():
                    raise drf_serializers.ValidationError({'date_taken': 'Date cannot be in the future!'})
            except ValueError:
                pass
        
        serializer.save(
            couple=couple,
            year=year_obj,
            image=image_url
        )