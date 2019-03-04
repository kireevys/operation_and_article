from models.tables import Warehouse
from logs import db_logger


class WarehouseTools(Warehouse):

    def set_new_name(self, id_ws, name):
        ws = super().select_expression(id_ws=id_ws)[0]
        ws.name.set_value(name)
        ws.update_data()
        return True
