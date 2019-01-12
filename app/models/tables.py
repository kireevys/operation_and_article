from sqlite3 import connect
from jinja2 import Template
from app.config import db_path as config_path_db
from app.logs import db_logger, debug_logger


class Base(object):
    """
    Базовый класс для работы с таблицами.
    Позваляет добавлять, изменять, удалять данные из БД.
    """
    db_path = config_path_db
    conn = connect(db_path)

    @staticmethod
    def get_template(filename):
        with open(f'static_sql/{filename}') as template_file:
            sql = template_file.read()
            template_file.close()
        template = Template(sql)
        return template

    def get_new_session(self):
        self.conn = connect(self.db_path)
        session = self.conn.cursor()
        return session

    def insert_data(self, table_name, **kwargs):
        template = self.get_template('insert_into.sql')
        values = self.values_to_string(kwargs)
        sql = template.render(tablename=table_name, fields=list(kwargs.keys()),
                              value=values)

        self.get_new_session().execute(sql)
        self.conn.commit()

    @staticmethod
    def values_to_string(data: dict):
        values_string_list = [f'\'{str(value)}\'' for value in data.values()]
        return values_string_list

    def get_max_field_value(self, tablename, field):
        template = self.get_template('get_max_value.sql')
        sql = template.render(table=tablename, field=field)
        try:
            result = int(self.get_new_session().execute(sql).fetchall()[0][0])
        except TypeError:
            result = 0
        return result

    def select_expression(self, table_name, **kwargs):
        template = self.get_template('select_exp.sql')
        data = self.kwargs_to_predicate_exp(**kwargs)
        sql = template.render(table=table_name, data=data)
        db_logger.info(sql)
        result = self.get_new_session().execute(sql).fetchall()
        row_count = range(len(result))
        return dict(zip(row_count, result))

    def kwargs_to_predicate_exp(self, **kwargs):
        values = list(kwargs.keys())
        fields = self.values_to_string(kwargs)
        expression = str()
        pack = zip(fields, values)
        for value, field in pack:
            expression = (f'{expression} {field} = {value} and')
        expression = expression[:-3]
        return expression


class Column(object):
    """
    Класс столбца таблицы
    """

    def __init__(self, name, value=None):
        self.name = name
        self.value = value

    def __str__(self):
        return f'[{self.name} = {self.value}]'


class TableRow(Base):
    """
    Класс cтроки таблицы
    По сути - фабрикой создает объект строки
    """
    _column_separator_width = 5

    def _factory(self, table_name, **kwargs):
        self.__tablename__ = table_name
        self.column = None
        self.my_columns = []
        for field, value in kwargs.items():
            new_str = f'self.{field} = Column("{field}", {value})'
            print(new_str)
            exec(f'self.column = {new_str}')
            self.my_columns.append(self.column)
        del self.column

    def __str__(self):
        table_str = f'<{self.__tablename__}: '

        for field in self.my_columns:
            table_str = f'{table_str} | {field.value: <{self._column_separator_width}}'
        return f'{table_str} >'


class Warehouse(TableRow):
    __tablename__ = 'warehouse'
    _column_separator_width = 10
    # Columns
    id_ws = Column('id_ws')
    code = Column('code')
    id_higher = Column('id_higher')
    level = Column('level')
    name = Column('name')

    comm_id_ws = 'id_ws'
    comm_code = 'code'
    comm_id_higher = 'id_higher'
    comm_level = 'level'
    comm_name = 'name'
    my_column = (comm_id_ws,
                 comm_code,
                 comm_id_higher,
                 comm_level,
                 comm_name)

    def __init__(self, level, name, id_higher=None):
        self.level.value = level
        self.code.value = self.generate_code()
        self.name.value = name
        self.id_higher.value = id_higher

    @staticmethod
    def __construct__(values):
        ws = Warehouse(values[0], values[0])
        my_value = dict(zip(ws.my_column, values))
        debug_logger.info(my_value)
        ws.id_ws = my_value['id_ws']
        ws.code = my_value['code']
        ws.id_higher = my_value['id_higher']
        ws.level = my_value['level']
        ws.name = my_value['name']
        return ws

    def insert(self):
        self.insert_data(self.__tablename__,
                         level=self.level,
                         code=self.code,
                         name=self.name,
                         id_higher=self.id_higher)

    def generate_code(self):
        """
        Рассчитывает код для МХ по правилу:
        :return: str(level + id_ws)
        """
        now_ws = self.get_max_field_value(self.__tablename__, "id_ws") + 1
        return f'{self.level}{now_ws}'


class Contractor(Base):
    __tablename__ = 'contractor'

    def __init__(self, name, inn, address):
        self.name = name
        self.inn = inn
        self.address = address

    def insert(self):
        self.insert_data(table_name=self.__tablename__,
                         name=self.name,
                         inn=self.inn,
                         address=self.address)


class OpStatus(Base):
    __tablename__ = 'opstatus_tbl'

    def __init__(self, name, stat_order, on_delete=1):
        self.name = name
        self.stat_order = stat_order
        self.on_delete = on_delete

    def insert(self):
        self.insert_data(table_name=self.__tablename__,
                         name=self.name,
                         stat_order=self.stat_order,
                         on_delete=self.on_delete)


class Unit(Base):
    __tablename__ = 'unit_tab'

    def __int__(self, name):
        self.name = name

    def insert(self):
        self.insert_data(table_name=self.__tablename__,
                         name=self.name)


class Articles(Base):
    __tablename__ = 'article'

    def __init__(self, code, name, price, unit, ):
        self.code = code
        self.name = name
        self.price = price
        self.unit = unit

    def insert(self):
        self.insert_data(table_name=self.__tablename__,
                         code=self.code,
                         name=self.name,
                         price=self.price,
                         unit=self.unit)


class OpType(Base):
    __tablename__ = 'optype'

    def __init__(self, name):
        self.name = name

    def insert(self):
        self.insert_data(table_name=self.__tablename__,
                         name=self.name)


class OpArt(Base):
    __tablename__ = 'op_art'

    def __init__(self, id_op, id_art, price, quantity):
        self.id_op = id_op
        self.id_art = id_art
        self.price = price
        self.quantity = quantity
        self.summ = price * quantity

    def insert(self):
        self.insert_data(self.__tablename__,
                         id_op=self.id_op,
                         id_art=self.id_art,
                         price=self.price,
                         quantity=self.quantity,
                         summ=self.summ)


class Operation(Base):
    __tablename__ = 'operation'
    id_status = 0
    opsumm = 0
    doccount = 0

    def __init__(self, opdate, code, optype, id_ws, id_contr, gm_res, id_rack):
        self.opdate = opdate
        self.code = code
        self.optype = optype
        self.id_ws = id_ws
        self.id_contr = id_contr
        self.gm_res = gm_res
        self.id_rack = id_rack

    def insert(self):
        self.insert_data(self.__tablename__,
                         opdate=self.opdate,
                         code=self.code,
                         optype=self.optype,
                         id_status=self.id_status,
                         id_ws=self.id_ws,
                         id_contr=self.id_contr,
                         opsumm=self.opsumm,
                         gm_res=self.gm_res,
                         doccount=self.doccount,
                         id_rack=self.id_rack)


if __name__ == '__main__':
    # test_data = Base()
    # s = test_data.get_max_field_value('warehouse', "id_ws")
    # print(s)
    table = TableRow('bla', one=1, two='2', third=1)
    print(table)
