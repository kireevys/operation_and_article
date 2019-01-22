import sqlite3
from app.config import db_path
from app.logs import db_logger, debug_logger
from app.models.tables import Contractor, Warehouse, Base


def execute_sql_file(sql_path):
    with open(sql_path, 'r') as sql_file:
        connect = sqlite3.connect(db_path)
        cursor = connect.cursor()
        query = ''
        # Запросы можно выполнять только по одному, поэтому собираем запрос построчно,
        # и выполняем
        for line in sql_file:
            query = f'{query} {line}'
            if line.strip().endswith(';'):
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

    def get_ws(self, **kwargs):
        result = self.select_expression('warehouse', **kwargs)
        ws_list = []
        for i in result.values():
            ws_list.append(Warehouse.__construct__(i))
        return ws_list


if __name__ == '__main__':
    ws2 = Contractor().select_expression(id_contr=1)[0]
    print(ws2.id_contr)
    ws1 = Contractor().select_expression(id_contr=2)[0]
    ws1.delete_data()
    ws1 = Contractor().select_expression(id_contr=2)
    print(ws1)
