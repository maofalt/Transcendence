# Generated by Django 5.0.3 on 2024-03-22 19:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('manage_tournament', '0003_alter_tournament_tournament_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournament',
            name='registration',
            field=models.CharField(choices=[('Public', 'Open game'), ('Private', 'Invitation required')], default='Public', max_length=15),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='tournament_name',
            field=models.CharField(max_length=255),
        ),
    ]
