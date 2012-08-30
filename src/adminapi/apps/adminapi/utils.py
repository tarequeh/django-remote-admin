from django.utils.functional import Promise
from django.utils.translation import force_unicode

from django.core.serializers.json import DjangoJSONEncoder


class LazyEncoder(DjangoJSONEncoder):
    def default(self, o):
        if isinstance(o, Promise):
            return force_unicode(o)
        else:
            if callable(o):
                o = o()
            return super(LazyEncoder, self).default(o)
