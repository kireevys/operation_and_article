from models.orm import Column, Base
from sqlite3 import IntegrityError

from logs import db_logger, debug_logger


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
        self.row = (self.id_ws, self.code, self.id_higher, self.level, self.name)

        # Set value
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

    def __init__(self, name=None, stat_order=None, on_delete=1):
        # Columns
        self.id_status = Column('id_status', primary=True)
        self.name = Column('name', name)
        self.stat_order = Column('stat_order', stat_order)
        self.on_delete = Column('on_delete', on_delete)

    def insert(self):
        self.insert_data()


class Unit(Base):
    __tablename__ = 'unit_tab'

    def __int__(self, name=None):
        self.id_unit = Column('id_unit', primary=True)
        self.name = Column('name', name)

    def insert(self):
        self.insert_data()


class Articles(Base):
    __tablename__ = 'article'

    def __init__(self, code=None, name=None, price=None, unit=None, ):
        self.id_art = Column('id_art', primary=True)
        self.code = Column('code', code)
        self.name = Column('name', name)
        self.price = Column('price', price)
        self.unit = Column('unit', unit)

        self.row = (self.id_art,
                    self.code,
                    self.name,
                    self.price,
                    self.unit)

    def insert(self):
        self.insert_data()


class OpType(Base):
    __tablename__ = 'optype'

    def __init__(self, name):
        self.id_type = Column('id_type', primary=True)
        self.name = Column('name', name)

    def insert(self):
        self.insert_data()


class OpArt(Base):
    __tablename__ = 'op_art'

    def __init__(self, id_op=None, id_art=None, price=0, quantity=0):
        self.id_opart = Column('id_opart', primary=True)
        self.id_op = Column('id_op', id_op)
        self.id_art = Column('id_art', id_art)
        self.price = Column('price', price)
        self.quantity = Column('quantity', quantity)
        self.summ = Column('summ', price * quantity)
        self.row = (self.id_opart,
                    self.id_op,
                    self.id_art,
                    self.price,
                    self.quantity,
                    self.summ)

    def insert(self):
        self.insert_data()


class Operation(Base):
    __tablename__ = 'operation'

    def __init__(self, opdate=None, code=None, optype=None, id_status=None, id_ws=None, id_contr=None, gm_res=None,
                 id_rack=None, opsumm=0, doccount=None):
        self.id_op = Column('id_op', primary=True)
        self.opdate = Column('opdate', opdate)
        self.code = Column('code', code)
        self.optype = Column('optype', optype)
        self.id_ws = Column('id_ws', id_ws)
        self.id_contr = Column('id_contr', id_contr)
        self.gm_res = Column('gm_res', gm_res)
        self.id_rack = Column('id_rack', id_rack)
        self.id_status = Column('id_status', id_status)
        self.opsumm = Column('opsumm', opsumm)
        self.id_status = Column('id_status', id_status)
        self.doccount = Column('doccount', doccount)

        self.row = (self.id_op,
                    self.opdate,
                    self.code,
                    self.optype,
                    self.id_ws,
                    self.id_contr,
                    self.gm_res,
                    self.id_rack,
                    self.id_status,
                    self.opsumm,
                    self.id_status,
                    self.doccount)

    def insert(self):
        self.insert_data()

    def get_my_opsum(self):
        my_opsum = 0
        my_arts = OpArt(id_op=self.id_op.value)
        my_arts = my_arts.select_expression(id_op=self.id_op.value)
        for i in my_arts:
            my_opsum += i.summ.value
        self.opsumm.value = my_opsum
        return my_opsum

