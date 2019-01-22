from app.models.tables import Operation, OpArt, Articles
from datetime import datetime as dt
from app.logs import db_logger


class OperationTools(Operation):
    def add_operation(self, opdate=f'{dt.now(): %d.%m.%Y}', code=0, optype=0, id_ws=0, id_contr=0,
                      gm_res=0, id_rack=0):
        kwarg = dict(opdate=opdate,
                     code=code,
                     optype=optype,
                     id_ws=id_ws,
                     id_contr=id_contr,
                     opsumm=0,
                     gm_res=gm_res,
                     id_rack=id_rack,
                     id_status=1)
        new_op = Operation(**kwarg)
        new_op.insert()
        new_op = new_op.select_expression(**kwarg)
        return new_op

    def delete_operation(self, id_op):
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


if __name__ == '__main__':
    op = OperationTools()
    op.add_op_art(id_op=1, **{'1': 3, '2': 10, '8': 50})
    print(op.get_my_opsum())
