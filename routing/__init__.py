from flask import Flask
import flask_config as config

app = Flask(__name__)
app.config.from_object(config)
