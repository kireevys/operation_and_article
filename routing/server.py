from routing import app
import json
from flask import request
from logick.operation_logick import OperationTools
from werkzeug.datastructures import ImmutableMultiDict


@app.route('/')
def index():
    return app.send_static_file('index.html'), 200


@app.route('/test', methods=['POST'])
def test():
    form = request
    rq = form.form.to_dict()
    rq['test'] = 'ss'
    return json.dumps(rq), 200


@app.route('/tt')
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
