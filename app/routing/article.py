from json import loads
from flask import request

from app import flask_app
from app.models.tables import Articles
from app.logick.catalogs_logick import ArticleTools
from app.routing import exceptions_decorator, json_decorator, routes, add_route, MethodNotAllowed

url = '/article'


@add_route(url, 'ADD')
def change_art():
    data = loads(request.values['articles'])
    if isinstance(data, dict):
        data = [data, ]
    for rec in data:
        if 'id_art' in rec:
            ArticleTools.update_article(**rec)
        else:
            ArticleTools.add_article(**rec)
    return True


@add_route(url, 'GETARTOP')
def get_articles():
    # TODO: декомпозиция
    op_art = Articles()
    data = request.values
    id_op = data['id_op']
    sess = op_art.get_new_session()
    sql = '''SELECT oa.id_opart,
                       oa.id_op, 
                       a.id_art,
                       a.name, 
                       oa.price,
                       a.price CURRENT_price,
                       0,
                       0
                     from article a
                left join op_art oa on oa.id_art = a.id_art and oa.id_op = :id_op
                where oa.id_opart is null
                order by a.id_art;'''
    result = sess.execute(sql, dict(id_op=id_op)).fetchall()
    opart = []
    fields = ['id_opart', 'id_op', 'id_art', 'name',
              'op_price', 'price', 'quantity', 'summ']
    for row in result:
        row_dict = {k: v for k, v in zip(fields, row)}
        opart.append(row_dict)
    return dict(articles=opart)


@add_route(url, 'GET')
def get_all_article():
    op_art = Articles()
    result = op_art.select_expression()
    return dict(articles=[i.to_dict() for i in result])


@add_route(url, 'DELETE')
def del_article():
    data = request.values.to_dict()
    ArticleTools.delete_article(**data)
    return True


@flask_app.route(url, methods=routes[url]['methods'].keys())
@json_decorator
@exceptions_decorator
def article():
    try:
        return routes[url]['methods'][request.method]()
    except KeyError:
        raise MethodNotAllowed(f'Method {request.method} not allowed here')
