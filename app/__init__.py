import config

from flask import Flask

flask_app = Flask(__name__)
flask_app.config.from_object(config)

from app.routing import *