from models.tables import Operation, OpArt, Articles
from datetime import datetime as dt
from logs import db_logger


class OperationTools(Operation):
    def add_operation(self, **kwargs):
        new_op = Operation(**kwargs)
        new_op.insert()
        new_op = new_op.select_expression(**kwargs)
        return new_op

    @staticmethod
    def delete_operation(id_op):
        deleting_op = Operation()
        deleting_op = deleting_op.select_expression(id_op=id_op)[0]
        db_logger.info(deleting_op)
        deleting_op.delete_data()

    def edit_op_art(self, **new_opart):
        """Принимает на вход заначения вида
        id_art=quantity"""
        extending_op = Operation()
        # Проверка существования операции
        id_op = new_opart['id_op']
        art_quantity = new_opart['opart']
        try:
            extending_op = extending_op.select_expression(id_op=id_op)[0]
        except IndexError:
            db_logger.error(f'Операции {id_op} не существует')
            raise

        self.delete_opart(*new_opart['forDelete'])

        for opart in art_quantity:
            try:
                opart['modified']
            except KeyError:
                continue
            new_art = Articles()
            # Проверим, что ТП существует
            try:
                new_art = new_art.select_expression(id_art=opart['id_art'])[0]
            except IndexError:
                db_logger.error(f'ТП {opart["id_art"]} - {opart["name"]} не существует')
                raise
            # Вставим или обновим ТП
            if opart['id_opart'] is None:
                opart['id_op'] = id_op
                self.insert_opart(**opart)
            else:
                self.update_opart(**opart)
        return True

    def delete_opart(self, *args):
        opart_ids = ', '.join([str(i) for i in args])
        db_logger.info(opart_ids)
        sql = f'delete from op_art where id_opart in ({opart_ids})'
        self.get_new_session().execute(sql)
        self.conn.commit()

    @staticmethod
    def update_opart(**kwargs):
        opart = OpArt()
        opart.update_data(id_opart=kwargs['id_opart'], id_op=kwargs['id_op'], id_art=kwargs['id_art'],
                          price=kwargs['op_price'],
                          quantity=kwargs['quantity'])

    @staticmethod
    def insert_opart(**kwargs):
        new_opart = OpArt(id_op=kwargs['id_op'], id_art=kwargs['id_art'], price=kwargs['op_price'],
                          quantity=kwargs['quantity'])
        new_opart.insert()

    def get_all_operation(self):
        op_all = self.select_expression()
        di = [k.to_dict() for k in op_all]
        js = dict(operation=di)
        return js

    @staticmethod
    def get_all_opart(id_op):
        op_art = OpArt()
        sess = op_art.get_new_session()
        sql = '''SELECT oa.id_opart,
                       oa.id_op, 
                       a.id_art,
                       a.name, 
                       oa.price,
                       a.price CURRENT_price,
                       oa.quantity,
                       oa.summ  
                     from article a
                join op_art oa on oa.id_art = a.id_art and oa.id_op = :id_op
                order by a.id_art;'''
        result = sess.execute(sql, dict(id_op=id_op)).fetchall()
        opart = []
        fields = ['id_opart', 'id_op', 'id_art', 'name', 'op_price', 'price', 'quantity', 'summ', ]
        for row in result:
            row_dict = {k: v for k, v in zip(fields, row)}
            opart.append(row_dict)
        js = dict(opart=opart)
        return js

    @staticmethod
    def update_status(id_op, id_status):
        op = Operation()
        op = op.select_expression(id_op=id_op)[0]
        op.id_status.value = id_status
        op.update_data()
        return True

    def get_operation_grid(self):
        sql = self.get_template('operation_grid.sql').render()
        grid = self.get_new_session().execute(sql).fetchall()
        operation_grid = []
        fields = ['id_op', 'opdate', 'code', 'id_status',
                  'status', 'id_type', 'optype', 'id_ws',
                  'id_contr', 'opsumm', 'gm_res', 'doccount',
                  'id_rack', 'contr_name', 'inn', 'ws_name']
        for row in grid:
            row_dict = {k: v for k, v in zip(fields, row)}
            operation_grid.append(row_dict)
        to_dict = dict(operation=operation_grid)
        return to_dict
