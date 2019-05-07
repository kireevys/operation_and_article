from app.models.tables import Warehouse


def get_child(table, parent_id, root=list()):
    all_head = table.select_expression(id_higher=parent_id)
    for i in all_head:
        node = dict(
            id_ws=None,
            text=None,
            leaf=False,
            children=[]
        )
        node['children'] = get_child(table, i.id_ws.get_value(), node['children'])
        node['id_ws'] = i.id_ws.get_value()
        node['text'] = i.name.get_value()
        node['leaf'] = len(node['children']) == 0
        root.append(node)
    return root


if __name__ == '__main__':
    ws = Warehouse()
    # print(ws.get_full_tree())
    # sess = ws.get_new_session()
    # all_ws = ws.select_expression()
    s = get_child(ws, None)
    pass
