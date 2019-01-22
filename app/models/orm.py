from sqlite3 import connect, IntegrityError
from jinja2 import Template
from app.config import db_path as config_path_db
from app.logs import db_logger, debug_logger
import re
import os

os.chdir('/home/kiryu/repos/kireevys/operation_and_article/app')


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

    def __format__(self, format_spec):
        s = f'[{self.name} = {self.value}]'
        return f'{s: {format_spec[1:]}}'


class TableRow(object):
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
    Позваляет добавлять, изменять, удалять данные из БД.
    """
    db_path = config_path_db
    conn = connect(db_path)

    @staticmethod
    def get_template(filename):
        with open(f'models/static_sql/{filename}') as template_file:
            sql = template_file.read()
            template_file.close()
        template = Template(sql)
        return template

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

    def get_new_session(self):
        self.conn = connect(self.db_path)
        session = self.conn.cursor()
        return session

    def insert_data(self):
        db_logger.info(self)
        template = self.get_template('insert_into.sql')
        row_dict = self.to_dict_without_primary()
        values = self.values_to_sql_type(row_dict)
        sql = template.render(tablename=self.__tablename__, fields=list(row_dict.keys()),
                              value=values)
        debug_logger.info(sql)
        try:
            self.get_new_session().execute(sql)
        except IntegrityError as error:
            db_logger.error(f'Дубль по уникальному полю: {error}')
            raise
        self.conn.commit()

    def delete_data(self):
        db_logger.info(self)
        template = self.get_template('delete_exp.sql')
        id_field = self.row[0].to_dict()
        where = self.kwargs_to_predicate_exp('and', **id_field)
        sql = template.render(table=self.__tablename__, where_expression=where)
        db_logger.info(sql)
        self.get_new_session().execute(sql)
        db_logger.info(f'{self} deleted')
        self.conn.commit()

    @staticmethod
    def parse_constraint_fail(error):
        error_text = error.__repr__()[:-3]
        return re.findall('UNIQUE constraint failed: (\S+)',
                          error_text)

    @staticmethod
    def values_to_sql_type(data: dict):
        values_string_list = []
        for value in data.values():
            if value == str:
                values_string_list.append(f'\'{str(value)}\'')
            elif value is None:
                values_string_list.append('null')
            elif value == int:
                values_string_list.append(value)
            else:
                values_string_list.append(f'\'{str(value)}\'')

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

    def update_data(self):
        db_logger.info(self)
        template = self.get_template('update_exp.sql')
        id_field = self.row[0].to_dict()
        all_field = self.to_dict_without_primary()
        where = self.kwargs_to_predicate_exp('and', **id_field)
        set_statement = self.kwargs_to_predicate_exp(',', **all_field)
        sql = template.render(table=self.__tablename__, set_expression=set_statement, where_expression=where)
        db_logger.info(sql)
        self.get_new_session().execute(sql)
        db_logger.info(f'{self} updated')
        self.conn.commit()

    def kwargs_to_predicate_exp(self, separator, **kwargs):
        values = list(kwargs.keys())
        fields = self.values_to_sql_type(kwargs)
        expression = str()
        pack = zip(fields, values)
        for value, field in pack:
            expression = (f'{expression} {field} = {value} {separator}')
        expression = expression[:-len(separator)]
        return expression
