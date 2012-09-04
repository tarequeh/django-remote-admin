from django.db import models


class UserProfile(models.Model):
    user = models.ForeignKey('auth.User', related_name='profile')
    date_of_birth = models.DateField(null=True, blank=True)
    zipcode = models.CharField(max_length=15, null=True, blank=True)

    def __unicode__(self):
        return u'Profile for User %s' % self.user.username
