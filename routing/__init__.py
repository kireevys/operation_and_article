from flask import Flask
import flask_config as config

app = Flask(__name__, static_folder='../static')
app.config.from_object(config)
