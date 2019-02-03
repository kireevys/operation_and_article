from models.dbapi_tools import execute_sql_file
from models.tables import Base
from sqlite3 import OperationalError
from models.tables import OpArt, Operation, OpType, OpStatus, Articles
import random
from logs import db_logger
from datetime import datetime


def db_exists():
    try:
        db = Base()
        db.get_new_session().execute('select * from warehouse w;')
        return True
    except OperationalError:
        return False


def create_operations():
    optypes = range(1, 9)
    opstatuses = range(1, 8)
    arts = [i for i in range(1, 9)]
    contr = [1, 2]
    ws = [25, 26, 27, 28, 21, 22, 23, 24, 17, 18, 19, 20, 3, 4, 6, 7, ]

    id_op = 1
    oper = {}
    for t in optypes:

        for s in opstatuses:
            ca = contr[int(round(random.random()))]
            w = ws[random.randrange(0, len(ws))]

            oper.update(optype=t)
            oper.update(id_status=s)
            oper.update(id_contr=ca)
            oper.update(id_ws=w)
            oper.update(code=f'{id_op}{ca}{w}')

            op = Operation(**oper)
            op.insert()

            for a in set([random.randrange(1, len(arts) + 1) for a in range(10)]):
                op_art = OpArt(id_op=id_op, id_art=a, quantity=random.randrange(1, 100))
                op_art.insert()

            oper = {}
            id_op += 1


def test():
    s = 0
    ws = [25, 26, 27, 28, 21, 22, 23, 24, 17, 18, 19, 20, 3, 4, 6, 7, ]
    while s != 7:
        s = ws[random.randrange(0, len(ws))]
        print(s)


create_db_sql_path = f'models/static_sql/create_db.sql'
if not db_exists():
    start = datetime.now()
    db_logger.info(f'Первоначальное наполнение БД...')
    execute_sql_file(create_db_sql_path)
    db_logger.info(f'Залили create_db за {(datetime.now() - start).total_seconds()} секунд')
    create_operations()
    db_logger.info(f'Успешно завершено за {(datetime.now() - start).total_seconds()} секунд')
