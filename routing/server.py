from routing import app


@app.route('/test', methods=['GET', 'POST'])
def index():
    return 'good', 200
