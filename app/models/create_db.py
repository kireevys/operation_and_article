from app.config import db_path

import sqlite3
import os

connect = sqlite3.connect(db_path)
cursor = connect.cursor()

with open(f'{os.getcwd()}/static_sql/create_db.sql', 'r') as sql_file:
    query = ''
    # Запросы можно выполнять только по одному, поэтому собираем запрос построчно,
    # и выполняем
    for line in sql_file:
        query = f'{query} {line}'
        if line.endswith(';\n'):
            cursor.execute(query)
            # print(query, end=f'\n {5 * "*"}')
            query = ''

sql_file.close()
