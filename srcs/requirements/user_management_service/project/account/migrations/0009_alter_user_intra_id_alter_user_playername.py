# Generated by Django 5.0 on 2023-12-16 23:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0008_user_avatar_user_intra_id_user_is_online_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='intra_id',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='playername',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
    ]
