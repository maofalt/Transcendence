# Generated by Django 5.0.4 on 2024-04-20 18:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('manage_tournament', '0002_default_tournaments'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournament',
            name='tournament_name',
            field=models.CharField(max_length=30),
        ),
    ]
