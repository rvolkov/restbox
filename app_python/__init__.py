import os
from flask import Flask
from werkzeug.contrib.fixers import ProxyFix

app = Flask(__name__, static_url_path = '', static_folder='../public')

app.config.update(SEND_FILE_MAX_AGE_DEFAULT=0)
app.config.update(SECRET_KEY='place-your-any-string-for-key-gen-here')
app.config.update(BASEDIR=os.path.abspath(os.path.dirname(__file__)))

app.wsgi_app = ProxyFix(app.wsgi_app)
from app_python import views
