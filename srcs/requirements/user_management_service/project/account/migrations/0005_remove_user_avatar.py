# Generated by Django 5.0 on 2023-12-16 22:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0004_user_avatar'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='avatar',
        ),
    ]
