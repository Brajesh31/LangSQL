from django.db import models

class UserMetadata(models.Model):
    userId = models.CharField(max_length=255, unique=True)
    db_info = models.JSONField()

    def _str_(self):
        return f"User {self.userId} Metadata"
# Create your models here.