from django.conf.urls import patterns, include, url

from mainapp import rest_api

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'test140903.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^$', 'mainapp.views.get_home_page'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^rest_api/', include(rest_api.router.urls)),
)
