from app.models.dbapi_tools import execute_sql_file
from app.models.tables import Base
from sqlite3 import OperationalError
import os
os.chdir('/home/kiryu/repos/kireevys/operation_and_article/app')


def db_exists():
    try:
        db = Base()
        db.get_new_session().execute('select * from warehouse w;')
        return True
    except OperationalError:
        return False


create_db_sql_path = f'/static_sql/create_db.sql'
if not db_exists():
    execute_sql_file(create_db_sql_path)
