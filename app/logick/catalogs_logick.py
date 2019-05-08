from app.models.tables import Warehouse, Contractor, Articles


class ContractorTools(Contractor):
    """
    Работа со справочником КА
    """

    @staticmethod
    def add_contractor(**kwargs):
        ca = Contractor(**kwargs)
        ca.insert()

    @staticmethod
    def delete_contractor(**kwargs):
        ca = Contractor()
        ca = ca.select_expression(id_contr=kwargs['id_contr'])[0]
        ca.delete_data()

    @staticmethod
    def update_contractor(**kwargs):
        ca = Contractor(**kwargs)
        # ca = ca.select_expression(id_contr=kwargs['id_contr'])[0]
        ca.update_data()

    @staticmethod
    def get_contractors():
        contr = Contractor()
        contrs = contr.select_expression()
        contrs = contr.db_obj_to_dict(*contrs)
        return dict(contractors=contrs)


class ArticleTools(Articles):
    """
    Работа со справочником ТП
    """

    @staticmethod
    def add_article(**kwargs):
        ca = Articles(**kwargs)
        ca.insert()

    @staticmethod
    def update_article(**kwargs):
        ca = Articles(**kwargs)
        # ca = ca.select_expression(id_contr=kwargs['id_contr'])[0]
        ca.update_data()

    @staticmethod
    def delete_article(**kwargs):
        ca = Articles()
        ca = ca.select_expression(id_art=kwargs['id_art'])[0]
        ca.delete_data()


class WarehouseTools(Warehouse):
    """
    Работа со справочником МХ
    """

    def set_new_name(self, id_ws, name):
        """
        Переименовывает переданный МХ
        """
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

    @staticmethod
    def get_warehouses():
        warehouse = Warehouse()
        warehouses = warehouse.select_expression()
        warehouses = warehouse.db_obj_to_dict(*warehouses)
        return dict(warehouses=warehouses)

    @staticmethod
    def get_ws_tree():
        warehouse = Warehouse()
        return warehouse.get_full_tree()
