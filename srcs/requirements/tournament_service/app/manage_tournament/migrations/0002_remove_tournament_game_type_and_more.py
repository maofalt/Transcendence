# Generated by Django 5.0.3 on 2024-03-25 16:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('manage_tournament', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tournament',
            name='game_type',
        ),
        migrations.RemoveField(
            model_name='tournament',
            name='registration',
        ),
        migrations.RemoveField(
            model_name='tournament',
            name='tournament_type',
        ),
    ]
