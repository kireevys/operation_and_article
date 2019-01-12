import sqlite3
from app.config import db_path
from app.logs import db_logger, debug_logger
from app.models.tables import *


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


class DBTools(Base):
    """
    Класс содержит методы для работы со справочниками
    """

    @staticmethod
    def add_warehouse(level, name, id_higher=None):
        new_ws = Warehouse(level=level, name=name, id_higher=id_higher)
        new_ws.insert()

    def get_ws(self, **kwargs):
        result = self.select_expression('warehouse', **kwargs)
        ws_list = []
        for i in result.values():
            ws_list.append(Warehouse.__construct__(i))
        return ws_list


if __name__ == '__main__':
    test = DBTools()
    l = test.get_ws(level=1)
    print(l)
