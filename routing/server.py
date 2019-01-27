from routing import app
from routing.forms import AuthForm
import json
from flask import request


@app.route('/')
def index():
    return app.send_static_file('index.html'), 200


@app.route('/test', methods=['POST'])
def test():
    form = AuthForm()
    print(form)
    return 'ok', 200
