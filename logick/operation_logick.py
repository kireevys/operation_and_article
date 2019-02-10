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

    def add_op_art(self, id_op, **art_quantity):
        """Принимает на вход заначения вида
        id_art=quantity"""
        extending_op = Operation()
        try:
            extending_op = extending_op.select_expression(id_op=id_op)[0]
        except IndexError:
            db_logger.error(f'Операции {id_op} не существует')
            raise
        for id_art, quantity in art_quantity.items():
            new_art = Articles()
            try:
                new_art = new_art.select_expression(id_art=id_art)[0]
            except IndexError:
                db_logger.error(f'ТП {id_art} не существует')
                raise
            new_opart = OpArt(id_op=extending_op.id_op.value, id_art=new_art.id_art.value, price=new_art.price.value,
                              quantity=quantity)
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
        opart=[]
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
