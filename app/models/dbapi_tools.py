import sqlite3
from app.config import db_path
from app.logs import db_logger, debug_logger


def execute_sql_file(sql_path):
    with open(sql_path, 'r') as sql_file:
        connect = sqlite3.connect(db_path)
        cursor = connect.cursor()
        query = ''
        # Запросы можно выполнять только по одному, поэтому собираем запрос построчно,
        # и выполняем
        for line in sql_file:
            query = f'{query} {line}'
            if line.endswith(';\n'):
                try:
                    debug_logger.info(query)
                    cursor.execute(query)
                except sqlite3.OperationalError:
                    debug_logger.info('DB exists')
                    break
                query = ''
    db_logger.info(f'DB {db_path} ready')

    sql_file.close()
