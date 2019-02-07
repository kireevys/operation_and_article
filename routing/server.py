from routing import app
import json
from flask import request
from logick.operation_logick import OperationTools
from werkzeug.datastructures import ImmutableMultiDict
from models.tables import OpType, Contractor, Warehouse
from datetime import datetime


@app.route('/tt')
def index():
    return app.send_static_file('index.html'), 200


@app.route('/test', methods=['POST'])
def test():
    form = request
    rq = form.form.to_dict()
    rq['test'] = 'ss'
    return json.dumps(rq), 200


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
    # data = data.to_dict()
    id_op = data['id_op']
    op = OperationTools()
    all_art = op.get_all_opart(id_op)
    print(all_art)
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
    print(warehouses)
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
    new_op['opdate'] = datetime.strptime(new_op['opdate'], '%Y-%m-%dT%H:%M:%S').date()
    op = OperationTools()
    op.add_operation(**new_op)
    print(new_op)
    return 'OK', 200
