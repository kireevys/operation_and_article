from flask import request

from app import flask_app
from app.logick.catalogs_logick import WarehouseTools
from app.routing import exceptions_decorator, json_decorator, routes, add_route, MethodNotAllowed

url = '/warehouse'


@add_route(url, 'RENAME')
def set_new_ws_name():
    ws = WarehouseTools()
    req = request.values.to_dict()
    ws.set_new_name(**req)
    return True


@add_route(url, 'ADDER')
def get_adder_warehouse():
    """
    Возвращает листок с шаблоном нового магазина,
    Который можно будет подсунуть в дерево
    :return:
    """
    data = dict(text='Новый магазин',
                leaf=True)
    tree = [data, ]
    return tree


@add_route(url, 'DELETE')
def delete_ws():
    """
    Удаляет магазин
    :return:
    """
    ws_tool = WarehouseTools()
    ws_tool.delete_warehouse(**request.form.to_dict())
    return True


@add_route(url, 'ADD')
def add_ws():
    """
    Добавляет новый магазин
    :return:
    """
    WarehouseTools.add_warehouse(**request.form.to_dict())
    return True


@add_route(url, 'MOVE')
def move_warehouse():
    """
    Передвигает магазин
    :return:
    """
    WarehouseTools.move_warehouse(**request.form.to_dict())
    return True


@add_route(url, 'GET')
def get_ws_tree():
    """
    Возвращает дерево магазинов
    :return: dict
    """
    return WarehouseTools.get_ws_tree()


@flask_app.route(url, methods=routes[url]['methods'].keys())
@json_decorator
@exceptions_decorator
def warehouse():
    try:
        return routes[url]['methods'][request.method]()
    except KeyError:
        raise MethodNotAllowed(f'Method {request.method} not allowed here')
