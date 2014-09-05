from django.contrib import admin
from django.db import models
import glob
from django.conf import settings
import os
import yaml

field_type_dict = {
    'int': (models.IntegerField, {b'blank': True, b'null':True}),
    'char': (models.CharField, {b'max_length': 100, b'blank': True, b'null':True}),
    'date': (models.DateTimeField, {b'blank': True, b'null':True}),
}

def create_model(name, title, fields):
    class Meta:
        pass
    
    attrs = {}
    for field in fields:
        field_class, field_attrs = field_type_dict[field['type']]
        attrs[field['id']] = field_class(field['title'], **field_attrs)

    attrs.update({'__module__': __name__, 'Meta': Meta})

    return type(str(name), (models.Model,), attrs)

def pars_uamls():
    result = {}
    for filename in glob.glob1(settings.YAML_DIR, '*.yaml'):
        full_path = os.path.join(settings.YAML_DIR, filename)
        result.update(yaml.load(open(full_path, 'r')))
    return result

def get_models():
    result = []
    for name, value in pars_uamls().items():
        title = value.get('title', '')
        result.append(create_model(name, title, value['fields']))
    return result

_registred_models = []
for model in get_models():
    admin.site.register(model)
    _registred_models.append(model)
