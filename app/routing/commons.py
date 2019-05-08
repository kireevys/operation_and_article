from flask import send_file

from app import flask_app
from app.routing import exceptions_decorator, json_decorator
from config import version


@flask_app.route('/tt')
def index2():
    return flask_app.send_static_file('ext_js_examples/index.html'), 200


@flask_app.route('/')
def index():
    return flask_app.send_static_file('index.html'), 200


@flask_app.route('/test')
@json_decorator
@exceptions_decorator
def test():
    """Тестовый роут, просто говорит, что все хорошо"""
    return True


@flask_app.route('/version')
@json_decorator
@exceptions_decorator
def get_version():
    """Возвращает текущую версию приложения для установки в заголовок"""
    return version


@flask_app.route('/favicon.ico')
def get_icon():
    return send_file(filename_or_fp='static/icons/label_magnit.png', as_attachment=True,
                     attachment_filename='favicon.ico')
