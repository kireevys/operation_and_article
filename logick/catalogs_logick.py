from models.tables import Warehouse
from logs import db_logger


class WarehouseTools(Warehouse):

    def set_new_name(self, id_ws, name):
        ws = super().select_expression(id_ws=id_ws)[0]
        ws.name.set_value(name)
        ws.update_data()
        return True

    def delete_warehouse(self, id_ws, name):
        ws = super().select_expression(id_ws=id_ws)[0]
        for child in super().select_expression(id_higher=id_ws):
            for child_child in super().select_expression(id_higher=child.id_ws.value):
                child_child.delete_data()
            child.delete_data()
        ws.delete_data()
        return True

    @staticmethod
    def add_warehouse(id_higher, name):
        ws = Warehouse(name=name, id_higher=id_higher)
        try:
            ws_parent = ws.select_expression(id_ws=id_higher)[0]
            parent_level = ws_parent.level.value + 1
        except IndexError:
            parent_level = 1
            id_higher = None
        ws.level.set_value(parent_level)
        ws.id_higher.set_value(id_higher)
        ws.insert()
        return True

    @staticmethod
    def move_warehouse(id_ws, id_higher):
        if id_higher == '':
            id_higher = None
        ws = Warehouse()
        ws = ws.select_expression(id_ws=id_ws)[0]
        ws.id_higher.set_value(id_higher)
        ws.update_data()
        return True
