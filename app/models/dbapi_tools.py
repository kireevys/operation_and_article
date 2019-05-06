import sqlite3
from config import db_path
from logs import db_logger, debug_logger


def execute_sql_file(sql_path):
    with open(sql_path, 'r') as sql_file:
        connect = sqlite3.connect(db_path)
        cursor = connect.cursor()
        query = sql_file.read()
        debug_logger.debug(query)
        cursor.executescript(query)
        connect.commit()
        sql_file.close()
    db_logger.info(f'DB {db_path} ready')

    sql_file.close()