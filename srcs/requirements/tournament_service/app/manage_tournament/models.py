from django.db import models

# Create your models here.
class Tournament(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    rules = models.TextField()