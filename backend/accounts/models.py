from django.db import models
from django.contrib.auth.models import User
import random
import string

def generate_invite_code():
    """Generate a 6-character invite code"""
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=6))


class Couple(models.Model):
    name = models.CharField(max_length=100)
    invite_code = models.CharField(
        max_length=6,
        unique=True,
        default=generate_invite_code 
    )
    anniversary_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='members', null=True)
    display_name = models.CharField(max_length=50)
    profile_picture = models.URLField(max_length=500, null=True, blank=True) 
    hover_profile_picture = models.URLField(max_length=500, null=True, blank=True)
    
    def __str__(self):
        return f"{self.display_name} ({self.couple.name if self.couple else 'No couple'})"