import re
import os

from sqlite3 import connect, IntegrityError, Row
from jinja2 import Template
from config import db_path as config_path_db
from logs import db_logger, debug_logger


class Column(object):
    """
    Класс столбца таблицы
    """

    def __init__(self, name, value=None, primary=False):
        self.name = name
        self.value = value
        self.primary = primary

    def set_value(self, new_value):
        self.value = new_value

    def get_value(self):
        return self.value

    def to_dict(self):
        return {self.name: self.value}

    def __str__(self):
        return f'[{self.name} = {self.value}]'

    def __repr__(self):
        return self.__str__()

    def __format__(self, format_spec):
        s = f'[{self.name} = {self.value}]'
        return f'{s: {format_spec[1:]}}'


class TableRow(object):
    """
    Класс cтроки таблицы
    По сути - создает объект строки
    Также - служит формочкой
    """
    _column_separator_width = 5
    __tablename__ = None
    row = []

    def to_dict(self):
        d = {column.name: column.value for column in self.row}
        return d

    def to_dict_without_primary(self):
        """
        Возвращает словарь таблицы без первичного ключа
        :return:
        """
        return {column.name: column.value for column in self.row if not column.primary}

    def get_primary(self):
        """
        Возвращает первичный ключ
        :return:
        """
        return {column.name: column.value for column in self.row if column.primary}

    @classmethod
    def __construct__(cls, values):
        """
        Собирает строку переданного класса таблицы
        """
        table = cls()
        my_row = dict(zip(table.row, values))
        for field, value in my_row.items():
            field.value = value
        return table

    @staticmethod
    def db_obj_to_dict(*args):
        return [column.to_dict() for column in args]

    def __repr__(self):
        table_str = f'<{self.__tablename__.title()}: '

        for field in self.row:
            table_str = f'{table_str} | {field: <{self._column_separator_width}}'
        return f'{table_str} >'

    def __eq__(self, other):
        for me, oth in zip(self.row, other.row):
            if me.name != oth.name or me.value != oth.value:
                return False
        else:
            return True


class Base(TableRow):
    """
    Базовый класс для работы с таблицами.
    Позволяет добавлять, изменять, удалять данные из БД.
    """
    db_path = config_path_db
    conn = connect(db_path)
    conn.row_factory = Row

    @staticmethod
    def get_template(filename):
        with open(os.path.join('app/models/static_sql', filename)) as template_file:
            sql = template_file.read()
        return Template(sql)

    def get_new_session(self):
        self.conn = connect(self.db_path)
        return self.conn.cursor()

    def insert_data(self):
        db_logger.info(self)
        template = self.get_template('insert_into.sql')
        row_dict = self.to_dict_without_primary()

        sql = template.render(tablename=self.__tablename__, fields=list(row_dict.keys()))
        debug_logger.info(sql)
        debug_logger.info(row_dict)

        try:
            self.get_new_session().execute(sql, row_dict)
        except IntegrityError as error:
            db_logger.error(f'Дубль по уникальному полю: {error}')
            raise
        finally:
            self.conn.commit()

    def delete_data(self):
        db_logger.info(self)

        template = self.get_template('delete_exp.sql')
        id_field = self.get_primary()
        where = self.kwargs_to_predicate_exp('and', **id_field)
        sql = template.render(table=self.__tablename__, where_expression=where)

        db_logger.info(sql)
        db_logger.info(id_field)

        self.get_new_session().execute(sql, id_field)
        db_logger.info(f'{self} deleted')
        self.conn.commit()

    @staticmethod
    def parse_constraint_fail(error):
        error_text = error.__repr__()[:-3]
        return re.findall(r'UNIQUE constraint failed: (\S+)',
                          error_text)

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
        data = self.kwargs_to_predicate_exp('and', True, **kwargs)
        sql = template.render(table=self.__tablename__, data=data)
        db_logger.info(sql)
        db_logger.info(kwargs)
        result = self.get_new_session().execute(sql, kwargs).fetchall()
        result_list = []
        for result_row in result:
            result_list.append(self.__construct__(result_row))
        db_logger.info(result_list)
        return result_list

    def update_data(self):
        db_logger.info(self)
        template = self.get_template('update_exp.sql')
        id_field = self.row[0].to_dict()
        all_field = self.to_dict_without_primary()
        # Добавляем к общему словарю последний элемент - тот, что будет в предикате
        all_field.update(**id_field)
        where = self.kwargs_to_predicate_exp('and', True, **id_field)
        set_statement = self.kwargs_to_predicate_exp(',', **all_field)
        sql = template.render(table=self.__tablename__, set_expression=set_statement, where_expression=where)
        db_logger.info(sql)
        try:
            self.get_new_session().execute(sql, all_field)
        except IntegrityError as error:
            db_logger.error(f'Дубль по уникальному полю при апдейте: {error}')
            raise
        finally:
            self.conn.commit()
        db_logger.info(f'{self} updated')

    def kwargs_to_predicate_exp(self, separator, isnull=False, **kwargs):
        if len(kwargs) == 0: return '1 = 1'
        symbols = {True: 'is', False: '='}
        values = list(kwargs.keys())
        fields = list(kwargs.values())
        expression = str()
        pack = zip(fields, values)
        for value, field in pack:
            expression = f'{expression} {field} {symbols[isnull and value is None]} :{field} {separator}'
        expression = expression[:-len(separator)]
        return expression
