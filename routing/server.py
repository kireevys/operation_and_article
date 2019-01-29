from routing import app
import json
from flask import request
from logick.operation_logick import OperationTools


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
    print(s)
    return json.dumps(s), 200
