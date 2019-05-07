from app.models.orm import Column, Base
from sqlite3 import IntegrityError

from logs import db_logger, debug_logger
import datetime


class Warehouse(Base):
    __tablename__ = 'warehouse'
    _column_separator_width = 7

    def __init__(self, level=None, name=None, id_higher=None):
        # Columns
        self.id_ws = Column('id_ws', primary=True)
        self.code = Column('code', self.generate_code())
        self.id_higher = Column('id_higher', id_higher)
        self.level = Column('level', level)
        self.name = Column('name', name)
        self.row = (self.id_ws,
                    self.code,
                    self.name,
                    self.level,
                    self.id_higher,)

    def insert(self):
        self.insert_data()

    def generate_code(self):
        """
        Рассчитывает код для МХ
        """
        # now_ws = self.get_max_field_value(self.__tablename__, "id_ws") + 1
        # return f'{self.level.value}{now_ws}'
        return 'test'

    def get_child(self, parent_id, root):
        all_head = self.select_expression(id_higher=parent_id)
        for row in all_head:
            node = dict(
                id_ws=None,
                text=None,
                leaf=False,
                children=[]
            )
            node['children'] = self.get_child(row.id_ws.get_value(), node['children'])
            node['id_ws'] = row.id_ws.get_value()
            node['text'] = row.name.get_value()
            node['leaf'] = row.level.get_value() == 3
            root.append(node)
        return root

    def get_full_tree(self):
        return self.get_child(None, list())


class Contractor(Base):
    __tablename__ = 'contractor'
    _column_separator_width = 6

    def __init__(self, id_contr=None, name=None, inn=None, code=None, address=None):
        # Columns
        self.id_contr = Column('id_contr', id_contr, primary=True)
        self.name = Column('name', name)
        self.code = Column('code', code)
        self.inn = Column('inn', inn)
        self.address = Column('address', address)

        self.row = (self.id_contr, self.name,
                    self.code, self.inn, self.address)

    def insert(self):
        debug_logger.info(f'{self} old row')
        try:
            self.insert_data()
        except IntegrityError as e:
            error_field = self.parse_constraint_fail(e)
            db_logger.error(error_field)
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

        self.row = (self.id_status,
                    self.name,
                    self.stat_order,
                    self.on_delete)

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

    def __init__(self, id_art=None, code=None, name=None, price=None, unit=None, ):
        self.id_art = Column('id_art', id_art, primary=True)
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

    def __init__(self, name=None):
        self.id_type = Column('id_type', primary=True)
        self.name = Column('name', name)
        self.row = (
            self.id_type,
            self.name
        )

    def insert(self):
        self.insert_data()


class OpArt(Base):
    __tablename__ = 'op_art'

    def __init__(self, id_opart=None, id_op=None, id_art=None, price=None, quantity=0):
        self.id_opart = Column('id_opart', id_opart, primary=True)
        self.id_op = Column('id_op', id_op)
        self.id_art = Column('id_art', id_art)
        self.price = Column('price', self.get_art_price())
        self.quantity = Column('quantity', quantity)
        self.summ = Column('summ', round(self.price.value * quantity, 3))
        self.row = (self.id_opart,
                    self.id_op,
                    self.id_art,
                    self.price,
                    self.quantity,
                    self.summ)

    def insert(self):
        self.insert_data()
        self.update_my_operation_opsumm()

    def update_data(self, **kwargs):
        self.__init__(**kwargs)
        super().update_data()
        self.update_my_operation_opsumm()

    def update_my_operation_opsumm(self):
        op = Operation()
        op = op.select_expression(id_op=self.id_op.value)[0]
        op.opsumm.value = op.get_my_opsum()
        op.update_data()

    def get_art_price(self):
        if self.id_art.value is None:
            return 0
        art = Articles()
        art = art.select_expression(id_art=self.id_art.value)[0]
        return art.price.value


class Operation(Base):
    __tablename__ = 'operation'
    get_code = range(1000)

    def __init__(self, opdate=datetime.datetime.now().date(), code=None, optype=None, id_status=None, id_ws=None,
                 id_contr=None, gm_res=None,
                 id_rack=None, opsumm=0, doccount=None):
        self.id_op = Column('id_op', primary=True)
        self.opdate = Column('opdate', opdate)
        # TODO: Что может пойти не так?
        self.code = Column(
            'code', code if code is not None else f'{opdate}{id_ws}{id_contr}{Operation.get_code.step}')
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
                    self.id_status,
                    self.optype,
                    self.id_ws,
                    self.id_contr,
                    self.opsumm,
                    self.gm_res,
                    self.doccount,
                    self.id_rack)

    def insert(self):
        self.insert_data()

    def get_my_opsum(self):
        my_opsum = 0
        my_arts = OpArt(id_op=self.id_op.value)
        my_arts = my_arts.select_expression(id_op=self.id_op.value)
        for i in my_arts:
            my_opsum += i.summ.value
        self.opsumm.value = round(my_opsum, 3)
        return my_opsum
