from app.models.tables import Operation
from datetime import datetime as dt


class OperationTools(Operation):
    def add_operation(self, opdate=f'{dt.now(): %d.%m.%Y}', code=0, optype=0, id_ws=0, id_contr=0,
                      gm_res=0, id_rack=0):
        kwarg = dict(opdate=opdate,
                     code=0,
                     optype=0,
                     id_ws=0,
                     id_contr=0,
                     gm_res=0,
                     id_rack=0,
                     id_status=1)
        print(kwarg)
        new_op = Operation()


if __name__ == '__main__':
    op = OperationTools()
    op.add_operation()
