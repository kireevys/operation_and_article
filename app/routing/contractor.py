import json

from flask import request

from app import flask_app
from app.logick.catalogs_logick import ContractorTools
from app.routing import exceptions_decorator, json_decorator, routes, add_route, MethodNotAllowed

url = '/contractor'


@add_route(url, 'ADD')
def contr_add():
    data = json.loads(request.values['contractors'])
    for rec in data:
        if 'id_contr' in rec:
            ContractorTools.update_contractor(**rec)
        else:
            ContractorTools.add_contractor(**rec)
    return True


@add_route(url, 'DELETE')
def contr_del():
    data = request.values.to_dict()
    ContractorTools.delete_contractor(**data)
    return True


@add_route(url, 'GET')
def get_contractors():
    return ContractorTools.get_contractors()


@flask_app.route(url, methods=routes[url]['methods'].keys())
@json_decorator
@exceptions_decorator
def contractor():
    try:
        return routes[url]['methods'][request.method]()
    except KeyError:
        raise MethodNotAllowed(f'Method {request.method} not allowed here')
