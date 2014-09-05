from models import _registred_models
from rest_framework import routers, viewsets

#from rest_framework.response import Response
#from rest_framework.views import APIView

router = routers.DefaultRouter()

for model in _registred_models:
    name = model.__name__.lower()
    router.register(
        name, type(name, (viewsets.ModelViewSet,), {'model': model})) 

