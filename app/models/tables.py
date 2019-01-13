from sqlite3 import connect, IntegrityError
from jinja2 import Template
from app.config import db_path as config_path_db
from app.logs import db_logger, debug_logger
import re


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

    def insert_data(self):
        db_logger.info(self)
        template = self.get_template('insert_into.sql')
        row_dict = self.to_dict_without_primary()
        values = self.values_to_string(row_dict)
        sql = template.render(tablename=self.__tablename__, fields=list(row_dict.keys()),
                              value=values)
        debug_logger.info(sql)
        try:
            self.get_new_session().execute(sql)
        except IntegrityError as error:
            db_logger.error(f'Дубль по уникальному полю: {error}')
            raise
        self.conn.commit()



    @staticmethod
    def parse_constraint_fail(error):
        error_text = error.__repr__()[:-3]
        return re.findall('UNIQUE constraint failed: (\S+)',
                          error_text)

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

    def select_expression(self, **kwargs):
        template = self.get_template('select_exp.sql')
        data = self.kwargs_to_predicate_exp('and', **kwargs)
        sql = template.render(table=self.__tablename__, data=data)
        db_logger.info(sql)
        result = self.get_new_session().execute(sql).fetchall()
        result_list = []
        for result_row in result:
            result_list.append(self.__construct__(result_row))
        return result_list

    def update_data(self, **kwargs):
        db_logger.info(self)
        template = self.get_template('update_exp.sql')

    def kwargs_to_predicate_exp(self, separator, **kwargs):
        values = list(kwargs.keys())
        fields = self.values_to_string(kwargs)
        expression = str()
        pack = zip(fields, values)
        for value, field in pack:
            expression = (f'{expression} {field} = {value} {separator}')
        expression = expression[:-3]
        return expression


class Column(object):
    """
    Класс столбца таблицы
    """

    def __init__(self, name, value=None, primary=False):
        self.name = name
        self.value = value
        self.primary = primary

    def to_dict(self):
        return {self.name: self.value}

    def __str__(self):
        return f'[{self.name} = {self.value}]'

    def __repr__(self):
        return f'[{self.name} = {self.value}]'


class TableRow(Base):
    """
    Класс cтроки таблицы
    По сути - фабрикой создает объект строки
    Также - служит формочкой
    """
    _column_separator_width = 5

    def _factory(self, table_name, **kwargs):
        """Собирает переданную строку переданной таблицы"""
        self.__tablename__ = table_name
        self.column = None
        self.row = []
        added_primary = False
        for field, value in kwargs.items():
            new_str = f'self.{field} = Column("{field}", {value})'
            if added_primary:
                added_primary = True
                new_str = f'{new_str[:-1]}, {added_primary})'
            exec(f'self.column = {new_str}')
            debug_logger.info(self.column)
            self.row.append(self.column)
        del self.column

    def _sync_myself(self):
        """
        Функция делает выборку к базе по ключевым полям
        и синхронизует текущий объект с БД
        :return:
        """
        d = self.to_dict_without_primary()
        new_me = self.select_expression(**d)[0]
        for old, new in zip(self.row, new_me.row):
            old = new

    def to_dict(self):
        d = {column.name: column.value for column in self.row}
        return d

    def to_dict_without_primary(self):
        d = {column.name: column.value for column in self.row if not column.primary}
        return d

    @classmethod
    def __construct__(cls, values):
        """Собирает строку переданного класса таблицы"""
        new_ws = cls()
        my_row = dict(zip(new_ws.row, values))
        for field, value in my_row.items():
            field.value = value
        debug_logger.info(f'{new_ws}')
        return new_ws

    def __repr__(self):
        table_str = f'<{self.__tablename__.title()}: '

        for field in self.row:
            table_str = f'{table_str} | {str(field.value): <{self._column_separator_width}}'
        return f'{table_str} >'


class Warehouse(TableRow):
    __tablename__ = 'warehouse'
    _column_separator_width = 7
    # Columns
    id_ws = Column('id_ws', primary=True)
    code = Column('code')
    id_higher = Column('id_higher')
    level = Column('level')
    name = Column('name')
    row = [id_ws, code, id_higher, level, name]

    def __init__(self, level=None, name=None, id_higher=None):
        self.level.value = level
        self.code.value = self.generate_code()
        self.name.value = name
        self.id_higher.value = id_higher

    def insert(self):
        self.insert_data()
        self._sync_myself()

    def generate_code(self):
        """
        Рассчитывает код для МХ по правилу:
        :return: str(level + id_ws)
        """
        now_ws = self.get_max_field_value(self.__tablename__, "id_ws") + 1
        return f'{self.level.value}{now_ws}'


class Contractor(TableRow):
    __tablename__ = 'contractor'
    _column_separator_width = 6
    # Columns
    id_contr = Column('id_contr', primary=True)
    name = Column('name')
    level = Column('level', 0)  # Не помню, зачем он был нужен
    inn = Column('inn')
    address = Column('address')
    row = (id_contr, name, level, inn, address)

    def __init__(self, name=None, inn=None, address=None):
        self.name.value = name
        self.inn.value = inn
        self.address.value = address

    def insert(self):
        debug_logger.info(f'{self} old row')
        try:
            self.insert_data()
        except IntegrityError as e:
            error_field = self.parse_constraint_fail(e)
            db_logger.error(error_field)
        self._sync_myself()
        debug_logger.info(f'{self} new row')
        return True


class OpStatus(Base):
    __tablename__ = 'opstatus_tbl'

    def __init__(self, name, stat_order, on_delete=1):
        self.name = name
        self.stat_order = stat_order
        self.on_delete = on_delete

    def insert(self):
        self.insert_data()


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
