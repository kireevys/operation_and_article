from routing import app
import json
from flask import request
from logick.operation_logick import OperationTools
from werkzeug.datastructures import ImmutableMultiDict
from models.tables import OpType, Contractor, Warehouse, OpStatus, Articles
from datetime import datetime
from logs import debug_logger


@app.route('/tt')
def index():
    return app.send_static_file('index.html'), 200


@app.route('/test', methods=['POST', 'GET'])
def test():
    """Тестовый роут, просто говорит, что все хорошо"""
    return 'OK', 200


@app.route('/')
def index2():
    return app.send_static_file('index2.html'), 200


@app.route('/getop')
def send_operation():
    op = OperationTools()
    s = op.get_all_operation()
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
    new_op = dict(request.values)
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
    data = dict(request.form)
    debug_logger.info(data)
    OperationTools.update_status(**data)
    return 'OK', 200


@app.route('/delete_op', methods=['GET', ])
def delete_op():
    OperationTools.delete_operation(**dict(request.form))
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
    for row in result:
        row_dict = dict(
            id_opart=row[0],
            id_op=row[1],
            id_art=row[2],
            name=row[3],
            op_price=row[4],
            price=row[5],
            quantity=row[6],
            summ=row[7]
        )
        opart.append(row_dict)
    js = dict(articles=opart)
    return json.dumps(js), 200
