# django-remote-admin

A simple API based implementation of django admin.

There are two components of django remote admin:

* The django admin API server (included in the src/ directory)
* The Backbone/ Handlebars application to provide admin UI (included in the ui/ directory)

django Remote Admin is dependent on [django-remote-forms](https://github.com/WiserTogether/django-remote-forms)

### Important

* This is a proof of concept implementation for django-remote-forms
* This is not supposed to be a complete replacement for django admin
    * File/ Image upload is not available (working on it)
    * Haven't yet written the code for deletin instances
    * Doesn't take into account form overrides in ModelAdmin classes (mostly because django has
      a custom ModelAdmin for User model and it's quite annoying)
    * Haven't tested if ModelMultipleChoiceField works (might need some work in forms.js)

## Setup

There are 2 ways of getting the project set up

### No separation between API and app space

If you just want to get the application up and running without much hassle, try this.

* Create a virtual environment (or not)
* Install requirements

        pip install -r requirements.txt
* Change the JS include line in ui/src/html/index.html to

        <script data-main="/static/src/js/main" src="/static/lib/js/require/2.0.4/require.js"></script>
* Sync database

        ./src/manage.py syncdb
* Start the built-in django server

        ./src/manage.py runserver
* Browse to:

        http://localhost:8000


### Proper separation between API and app space

The goal of the django Remote Admin is to demonstrate how you can have a completely independent
web application that communicates with an API server serving django admin apps/ models/ instances
and instance forms

It should be noted that such a web application will still need to run under the same domain that
serves the API

To simulate the scenario, do the following:

* Create a virtual environment (or not)
* Install requirements

        pip install -r requirements.txt
* Edit your Apache config (on Mac):

        sudo pico /etc/apache2/httpd.conf
* Add an Apache config to load the UI:

        <VirtualHost *:80>
            DocumentRoot /Users/username/projects/django-remote-admin/ui/src/html
            Alias /src /Users/username/Projects/django-remote-admin/ui/src
            Alias /lib /Users/username/Projects/django-remote-admin/ui/lib
            <Directory /Users/username/Projects/django-remote-admin/ui>
                Order allow,deny
                Allow from all
            </Directory>
        </VirtualHost>
* Sync database

        ./src/manage.py syncdb
* Start the built-in django server

        ./src/manage.py runserver
* Add the following configuration to proxy API requests to the built-in django server

        <IfModule mod_proxy.c>
            ProxyPreserveHost On
            ProxyPass /adminapi/ http://127.0.0.1:8000/adminapi/
            ProxyPassReverse /adminapi/ http://127.0.0.1:8000/adminapi/
        </IfModule>
* Restart your Apache (on Mac)

        sudo /usr/sbin/apachectl restart
* Browse to:

        http://localhost
