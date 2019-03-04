from routing import app
import json
from flask import request, send_file
from logick.operation_logick import OperationTools
from logick.catalogs_logick import WarehouseTools
from werkzeug.datastructures import ImmutableMultiDict
from models.tables import OpType, Contractor, Warehouse, OpStatus, Articles
from datetime import datetime
from logs import debug_logger
from config import version


@app.route('/tt')
def index2():
    return app.send_static_file('index.html'), 200


@app.route('/test', methods=['POST', 'GET'])
def test():
    """Тестовый роут, просто говорит, что все хорошо"""
    return 'OK', 200


@app.route('/version')
def get_version():
    """Возвращает текущую версию приложения для установки в заголовок"""
    return version, 200


@app.route('/set_new_ws_name', methods=['POST', ])
def set_new_ws_name():
    ws = WarehouseTools()
    req = request.values.to_dict()
    try:
        ws.set_new_name(**req)
    except Exception:
        return 'Bad', 418
    return 'OK', 200


@app.route('/favicon.ico')
def get_icon():
    return send_file(filename_or_fp='../static/label_magnit.png', as_attachment=True, attachment_filename='favicon.ico')


@app.route('/')
def index():
    return app.send_static_file('index.html'), 200


@app.route('/getop')
def send_operation():
    op = OperationTools()
    s = op.get_operation_grid()
    return json.dumps(s), 200


@app.route('/get_op_art')
def send_op_art():
    data = request.values
    id_op = data['id_op']
    op = OperationTools()
    all_art = op.get_all_opart(id_op)
    return json.dumps(all_art), 200


@app.route('/get_optypes')
def get_optypes():
    optype = OpType()
    types = optype.select_expression()
    types = optype.db_obj_to_dict(*types)
    result = dict(optype=types)
    return json.dumps(result), 200


@app.route('/get_contractors')
def get_contractors():
    contr = Contractor()
    contrs = contr.select_expression()
    contrs = contr.db_obj_to_dict(*contrs)
    resp = dict(contractors=contrs)
    return json.dumps(resp), 200


@app.route('/get_warehouses', methods=['POST'])
def get_warehouses():
    warehouse = Warehouse()
    warehouses = warehouse.select_expression()
    warehouses = warehouse.db_obj_to_dict(*warehouses)
    resp = dict(warehouses=warehouses)
    return json.dumps(resp), 200


@app.route('/get_ws_tree', methods=['POST'])
def get_ws_tree():
    warehouse = Warehouse()
    ws_tree = warehouse.get_full_tree()
    return json.dumps(ws_tree), 200


@app.route('/add_op', methods=['POST'])
def add_operation():
    new_op = request.values.to_dict()
    # Преобразуем формат даты в пайтоновский
    new_op['opdate'] = datetime.strptime(
        new_op['opdate'], '%Y-%m-%dT%H:%M:%S').date()
    op = OperationTools()
    op.add_operation(**new_op)
    return 'OK', 200


@app.route('/get_op_status', methods=['POST'])
def get_op_status():
    status = OpStatus()
    statuses = status.select_expression()
    statuses = status.db_obj_to_dict(*statuses)
    resp = dict(opstatus=statuses)
    return json.dumps(resp), 200


@app.route('/change_opstatus', methods=['POST', ])
def change_opstatus():
    data = request.form.to_dict()
    debug_logger.info(data)
    OperationTools.update_status(**data)
    return 'OK', 200


@app.route('/delete_op', methods=['GET', 'POST'])
def delete_op():
    OperationTools.delete_operation(**request.form.to_dict())
    return 'OK', 200


@app.route('/get_articles', methods=['GET', ])
def get_articles():
    data = request.values
    id_op = data['id_op']
    op_art = Articles()
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
    fields = ['id_opart', 'id_op', 'id_art', 'name', 'op_price', 'price', 'quantity', 'summ']
    for row in result:
        row_dict = {k: v for k, v in zip(fields, row)}
        opart.append(row_dict)
    js = dict(articles=opart)
    return json.dumps(js), 200


@app.route('/edit_opart', methods=['POST', ])
def edit_opart():
    data = list(request.form)[0]
    opart_data = json.loads(data)
    op = OperationTools()
    op.edit_op_art(**opart_data)
    return 'OK', 200
