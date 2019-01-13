from app.models.orm import Column, Base
from sqlite3 import IntegrityError

from app.logs import db_logger, debug_logger


class Warehouse(Base):
    __tablename__ = 'warehouse'
    _column_separator_width = 7

    def __init__(self, level=None, name=None, id_higher=None):
        # Columns
        self.id_ws = Column('id_ws', primary=True)
        self.code = Column('code')
        self.id_higher = Column('id_higher')
        self.level = Column('level')
        self.name = Column('name')
        self.row = [self.id_ws, self.code, self.id_higher, self.level, self.name]
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
        # now_ws = self.get_max_field_value(self.__tablename__, "id_ws") + 1
        # return f'{self.level.value}{now_ws}'
        return 'test'


class Contractor(Base):
    __tablename__ = 'contractor'
    _column_separator_width = 6

    def __init__(self, name=None, inn=None, address=None):
        # Columns
        self.id_contr = Column('id_contr', primary=True)
        self.name = Column('name')
        self.level = Column('level', 0)  # Не помню, зачем он был нужен
        self.inn = Column('inn')
        self.address = Column('address')
        self.row = (self.id_contr, self.name, self.level, self.inn, self.address)
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
