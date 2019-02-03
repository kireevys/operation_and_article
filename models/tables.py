from models.orm import Column, Base
from sqlite3 import IntegrityError

from logs import db_logger, debug_logger
import datetime


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
        self.row = (self.id_ws,
                    self.code,
                    self.name,
                    self.level,
                    self.id_higher,)

        # Set value
        self.level.value = level
        self.code.value = self.generate_code()
        self.name.value = name
        self.id_higher.value = id_higher

    def insert(self):
        self.insert_data()

    def generate_code(self):
        """
        Рассчитывает код для МХ по правилу:
        :return: str(level + id_ws)
        """
        # now_ws = self.get_max_field_value(self.__tablename__, "id_ws") + 1
        # return f'{self.level.value}{now_ws}'
        return 'test'

    # TODO: Сделать тру рекурсивный запрос
    def get_full_tree(self):
        sess = self.get_new_session()
        header = ('id_ws', 'code', 'name', 'level', 'id_higher')
        # Get root ws
        sql = 'select * from warehouse w where w.id_higher is null;'
        sql_equal = 'select * from warehouse w where w.id_higher = :id_ws;'
        res = sess.execute(sql).fetchall()

        def to_dict(*args):
            dict_arr = []
            for i in args:
                d = dict(zip(header, i))
                dict_arr.append(d)
            return dict_arr

        tree = []
        root_ws = to_dict(*res)
        for parent in root_ws:
            node = []
            # print(f'-{parent["name"]}')
            sess = self.get_new_session()
            res = sess.execute(sql_equal, dict(
                id_ws=parent['id_ws'])).fetchall()
            second_level = to_dict(*res)
            parent_node = dict(id_ws=parent['id_ws'],
                               text=parent['name'],
                               leaf=False,
                               children=[])
            for sec in second_level:
                # print(f'--{sec["name"]}')
                res = sess.execute(sql_equal, dict(
                    id_ws=sec['id_ws'])).fetchall()
                second_level = to_dict(*res)
                second_node = dict(id_ws=sec['id_ws'],
                                   text=sec['name'],
                                   leaf=False,
                                   children=[])

                for child in second_level:
                    # print(f'---{child["name"]}')
                    sheet_node = dict(id_ws=child['id_ws'],
                                      text=child['name'],
                                      leaf=True)
                    second_node['children'].append(sheet_node)
                parent_node['children'].append(second_node)
            tree.append(parent_node)

        # tr = dict(warehouse=tree)
        return tree


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

        self.row = (self.id_contr, self.name,
                    self.level, self.inn, self.address)
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

    def __init__(self, id_op=None, id_art=None, price=None, quantity=0):
        self.id_opart = Column('id_opart', primary=True)
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
        self.update_data(**kwargs)
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

    def __init__(self, opdate=datetime.datetime.now().date(), code=None, optype=None, id_status=None, id_ws=None,
                 id_contr=None, gm_res=None,
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
