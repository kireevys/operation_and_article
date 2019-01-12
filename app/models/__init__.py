from app.config import db_path
from app.models.dbapi_tools import execute_sql_file
import os


def db_exists(file_path):
    try:
        file = open(file_path)
        file.close()
        return True
    except FileNotFoundError:
        return False


create_db_sql_path = f'{os.getcwd()}/static_sql/create_db.sql'
if not db_exists(create_db_sql_path):
    execute_sql_file(create_db_sql_path)
