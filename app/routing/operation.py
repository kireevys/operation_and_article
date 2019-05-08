import json

from flask import request
from datetime import datetime

from app import flask_app
from app.models.tables import OpType, OpStatus

from app.logick.operation_logick import OperationTools
from app.routing import exceptions_decorator, json_decorator, MethodNotAllowed

from logs import debug_logger


@flask_app.route('/optypes', methods=['GET'])
@json_decorator
@exceptions_decorator
def optypes():
    if request.method == 'GET':
        optype = OpType()
        types = optype.select_expression()
        types = optype.db_obj_to_dict(*types)
        return dict(optype=types)
    else:
        raise MethodNotAllowed(f'Method {request.method} not allowed here')


@flask_app.route('/op_status', methods=['CHANGE', 'GET'])
@json_decorator
@exceptions_decorator
def op_status():
    if request.method == 'CHANGE':
        data = request.form.to_dict()
        debug_logger.info(data)
        OperationTools.update_status(**data)
        return True
    elif request.method == 'GET':
        status = OpStatus()
        statuses = status.select_expression()
        statuses = status.db_obj_to_dict(*statuses)
        return dict(opstatus=statuses)
    else:
        raise MethodNotAllowed(f'Method {request.method} not allowed here')


@flask_app.route('/operation', methods=['GET', 'DELETE', 'ADD'])
@json_decorator
@exceptions_decorator
def operation():
    if request.method == 'DELETE':
        OperationTools.delete_operation(**request.form.to_dict())
        return True
    elif request.method == 'ADD':
        new_op = request.values.to_dict()
        # Преобразуем формат даты в пайтоновский
        new_op['opdate'] = datetime.strptime(
            new_op['opdate'], '%Y-%m-%dT%H:%M:%S').date()
        op = OperationTools()
        op.add_operation(**new_op)
        return True
    elif request.method == 'GET':
        op = OperationTools()
        s = op.get_operation_grid()
        return s
    else:
        raise MethodNotAllowed(f'Method {request.method} not allowed here')


@flask_app.route('/op_art', methods=['GET', 'EDIT', ])
@json_decorator
@exceptions_decorator
def op_art():
    if request.method == 'EDIT':
        opart_data = json.loads(list(request.form)[0])
        op = OperationTools()
        op.edit_op_art(**opart_data)
        return True
    elif request.method == 'GET':
        data = request.values
        id_op = data['id_op']
        op = OperationTools()
        all_art = op.get_all_opart(id_op)
        return all_art
    else:
        raise MethodNotAllowed(f'Method {request.method} not allowed here')
