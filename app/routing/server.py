import json
import traceback

from flask import request, send_file
from datetime import datetime

from app import flask_app
from app.models.tables import OpType, Contractor, Warehouse, OpStatus, Articles

from app.logick.catalogs_logick import WarehouseTools
from app.logick.operation_logick import OperationTools

from logs import debug_logger
from config import version


# FIXME: ОПТИМИЗАЦИЯ!!!! РЕФАКТИРИНГ!!! ЗДЕСЬ ЧТО ТО УЖАСНОЕ!!!


@flask_app.route('/tt')
def index2():
    return flask_app.send_static_file('ext_js_examples/index.html'), 200


@flask_app.route('/contr_add', methods=['POST', 'GET'])
def contr_add():
    data = json.loads(request.values['contractors'])
    for rec in data:
        try:
            rec['id_contr']
            WarehouseTools.update_contractor(**rec)
        except KeyError:
            WarehouseTools.add_contractor(**rec)
        except:
            return traceback.format_exc(limit=1), 409
    return 'OK', 200


@flask_app.route('/del_contr', methods=['POST', 'GET'])
def del_contr():
    data = request.values.to_dict()
    WarehouseTools.delete_contractor(**data)
    return 'ok', 200


@flask_app.route('/del_article', methods=['POST', 'GET'])
def del_article():
    data = request.values.to_dict()
    WarehouseTools.delete_article(**data)
    return 'ok', 200


@flask_app.route('/change_art', methods=['POST', 'GET'])
def change_art():
    data = json.loads(request.values['articles'])
    if isinstance(data, dict):
        data = [data, ]
    for rec in data:
        print(rec)
        try:
            rec['id_art']
            WarehouseTools.update_article(**rec)
        except KeyError:
            WarehouseTools.add_article(**rec)
        except:
            return traceback.format_exc(limit=1), 409
    return 'OK', 200


@flask_app.route('/test')
def test():
    """Тестовый роут, просто говорит, что все хорошо"""
    return 'OK', 200


@flask_app.route('/version')
def get_version():
    """Возвращает текущую версию приложения для установки в заголовок"""
    return version, 200


@flask_app.route('/set_new_ws_name', methods=['POST', ])
def set_new_ws_name():
    ws = WarehouseTools()
    req = request.values.to_dict()
    try:
        ws.set_new_name(**req)
    except Exception:
        return 'Bad', 418
    return 'OK', 200


@flask_app.route('/favicon.ico')
def get_icon():
    return send_file(filename_or_fp='static/icons/label_magnit.png', as_attachment=True,
                     attachment_filename='favicon.ico')


@flask_app.route('/')
def index():
    return flask_app.send_static_file('index.html'), 200


@flask_app.route('/getop')
def send_operation():
    op = OperationTools()
    s = op.get_operation_grid()
    return json.dumps(s), 200


@flask_app.route('/get_op_art')
def send_op_art():
    data = request.values
    id_op = data['id_op']
    op = OperationTools()
    all_art = op.get_all_opart(id_op)
    return json.dumps(all_art), 200


@flask_app.route('/get_optypes_arr')
def get_optypes():
    optype = OpType()
    types = optype.select_expression()
    s = [[1, 'test1'], [2, 'test2']]
    return json.dumps(s), 200


@flask_app.route('/get_optypes')
def get_optypes_arr():
    optype = OpType()
    types = optype.select_expression()
    types = optype.db_obj_to_dict(*types)
    result = dict(optype=types)
    return json.dumps(result), 200


@flask_app.route('/get_contractors', methods=['POST'])
def get_contractors():
    contr = Contractor()
    contrs = contr.select_expression()
    contrs = contr.db_obj_to_dict(*contrs)
    resp = dict(contractors=contrs)
    return json.dumps(resp), 200


@flask_app.route('/get_warehouses', methods=['POST'])
def get_warehouses():
    warehouse = Warehouse()
    warehouses = warehouse.select_expression()
    warehouses = warehouse.db_obj_to_dict(*warehouses)
    resp = dict(warehouses=warehouses)
    return json.dumps(resp), 200


@flask_app.route('/get_ws_tree', methods=['POST'])
def get_ws_tree():
    warehouse = Warehouse()
    ws_tree = warehouse.get_full_tree()
    return json.dumps(ws_tree), 200


@flask_app.route('/add_op', methods=['POST'])
def add_operation():
    new_op = request.values.to_dict()
    # Преобразуем формат даты в пайтоновский
    new_op['opdate'] = datetime.strptime(
        new_op['opdate'], '%Y-%m-%dT%H:%M:%S').date()
    op = OperationTools()
    op.add_operation(**new_op)
    return 'OK', 200


@flask_app.route('/get_op_status', methods=['POST'])
def get_op_status():
    status = OpStatus()
    statuses = status.select_expression()
    statuses = status.db_obj_to_dict(*statuses)
    resp = dict(opstatus=statuses)
    return json.dumps(resp), 200


@flask_app.route('/change_opstatus', methods=['POST', ])
def change_opstatus():
    data = request.form.to_dict()
    debug_logger.info(data)
    OperationTools.update_status(**data)
    return 'OK', 200


@flask_app.route('/delete_op', methods=['GET', 'POST'])
def delete_op():
    OperationTools.delete_operation(**request.form.to_dict())
    return 'OK', 200


@flask_app.route('/get_articles', methods=['GET', 'POST'])
def get_articles():
    # ОПТИМИЗАЦИЯ
    op_art = Articles()
    if request.method == 'GET':
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
        js = dict(articles=opart)
        return json.dumps(js), 200
    else:
        sess = op_art.get_new_session()
        sql = '''SELECT a.id_art,
                        a.name,
                        a.price CURRENT_price,
                        a.code,
                       -- u.fullname unit
                        a.unit
                     from article a
                     --join unit_tab u on id_unit = unit
                order by a.id_art;'''
        result = sess.execute(sql).fetchall()
        opart = []
        fields = ['id_art', 'name', 'price', 'code', 'unit']
        for row in result:
            row_dict = {k: v for k, v in zip(fields, row)}
            opart.append(row_dict)
        js = dict(articles=opart)
        return json.dumps(js), 200


@flask_app.route('/edit_opart', methods=['POST', ])
def edit_opart():
    data = list(request.form)[0]
    opart_data = json.loads(data)
    op = OperationTools()
    op.edit_op_art(**opart_data)
    return 'OK', 200


@flask_app.route('/get_adder_warehouse', methods=['POST', ])
def get_adder_warehouse():
    data = dict(text='Новый магазин',
                leaf=True)
    tree = [data, ]
    return json.dumps(tree), 200


@flask_app.route('/delete_ws', methods=['POST', ])
def delete_ws():
    ws_tool = WarehouseTools()
    try:
        ws_tool.delete_warehouse(**request.form.to_dict())
    except Exception as e:
        return traceback.format_exc(limit=1), 409
    else:
        return 'OK', 200


@flask_app.route('/add_ws', methods=['POST', ])
def add_ws():
    try:
        WarehouseTools.add_warehouse(**request.form.to_dict())
    except Exception as e:
        return traceback.format_exc(limit=1), 409
    else:
        return 'ok', 200


@flask_app.route('/move_warehouse', methods=['POST', ])
def move_warehouse():
    try:
        WarehouseTools.move_warehouse(**request.form.to_dict())
    except Exception:
        return traceback.format_exc(limit=1), 409
    else:
        return 'ok', 200
