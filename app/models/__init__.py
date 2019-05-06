import random

from os.path import isfile

from app.models.orm import Base
from app.models.tables import OpArt, Operation
from logs import db_logger
from datetime import datetime

all_tables = [('warehouse',), ('sqlite_sequence',), ('contractor',), ('opstatus_tbl',), ('optype',), ('unit_tab',),
              ('article',), ('operation',), ('op_art',)]


def db_exists():
    """
    Проверяет существование файла БД и наличие всех ожидаемых таблиц
    Указанных в all_tables
    :return: bool
    """
    db = Base()
    sql = """
          select s.name
              from sqlite_master s
            where s.type = 'table'
          """
    return isfile(db.db_path) and all_tables == db.get_new_session().execute(sql).fetchall()


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


def execute_sql_file(sql_path):
    db = Base()
    with open(sql_path, 'r') as sql_file:
        query = sql_file.read()
    db.get_new_session().executescript(query)
    db_logger.info(f'DB {db.db_path} ready')

    sql_file.close()


create_db_sql_path = f'app/models/static_sql/create_db.sql'
if not db_exists():
    start = datetime.now()
    db_logger.info(f'Первоначальное наполнение БД...')
    execute_sql_file(create_db_sql_path)
    db_logger.info(f'Залили create_db за {(datetime.now() - start).total_seconds()} секунд')
    create_operations()
    db_logger.info(f'Успешно завершено за {(datetime.now() - start).total_seconds()} секунд')
