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

    def update_opart(self, **kwargs):
        opart = OpArt()
        opart.update_data(id_opart=kwargs['id_opart'], id_op=kwargs['id_op'], id_art=kwargs['id_art'],
                          price=kwargs['op_price'],
                          quantity=kwargs['quantity'])

    def insert_opart(self, **kwargs):
        new_opart = OpArt(id_op=kwargs['id_op'], id_art=kwargs['id_art'], price=kwargs['op_price'],
                          quantity=kwargs['quantity'])
        new_opart.insert()

    def get_all_operation(self):
        op_all = self.select_expression()
        di = [k.to_dict() for k in op_all]
        js = dict(operation=di)
        return js

    def get_all_opart(self, id_op):
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
        for row in result:
            row_dict = dict(
                id_opart=row[0],
                id_op=row[1],
                id_art=row[2],
                name=row[3],
                op_price=row[4],
                price=row[5],
                quantity=row[6],
                summ=row[7]
            )
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
        # TODO: Почему range не умеет в __next__?
        def my_gen():
            for i in range(16):
                yield i

        sql = self.get_template('operation_grid.sql').render()
        grid = self.get_new_session().execute(sql).fetchall()
        operation_grid = []
        for row in grid:
            gen = my_gen()
            row_dict = dict(
                id_op=row[gen.__next__()],
                opdate=row[gen.__next__()],
                code=row[gen.__next__()],
                id_status=row[gen.__next__()],
                status=row[gen.__next__()],
                id_type=row[gen.__next__()],
                optype=row[gen.__next__()],
                id_ws=row[gen.__next__()],
                id_contr=row[gen.__next__()],
                opsumm=row[gen.__next__()],
                gm_res=row[gen.__next__()],
                doccount=row[gen.__next__()],
                id_rack=row[gen.__next__()],
                contr_name=row[gen.__next__()],
                inn=row[gen.__next__()],
                ws_name=row[gen.__next__()])
            operation_grid.append(row_dict)
        to_dict = dict(operation=operation_grid)
        return to_dict
