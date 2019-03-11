var centerPanel = Ext.extend(Ext.tree.TreePanel, {
    title: 'Управление МХ',

    enableDrag: true,
    ddGroup: 'treeWs',
    copy: true,

    collapsible: false,

    flex: 1,
    width: 150,
    region: 'west',

    dataUrl: 'get_adder_warehouse',
    root: {
        nodeType: 'async',
        text: 'new_ws',
        id: 'root',
        draggable: false
    },
    rootVisible: false,

    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems()

        });

        centerPanel.superclass.initComponent.call(this);
    },

    buildItems: function () {
        var me = this;
        // TODO: Вынести отсюда, здесь только создавать экземпляр
        var grid = Ext.extend(Ext.grid.GridPanel, {
            height: 200,
            disabled: true,

            store: new Ext.data.ArrayStore({
                fields: ['name']
            }),
            columns: [
                {
                    id: 'name_column',
                    header: 'Удалить узел',
                    dataIndex: 'name',
                    resizable: false,
                    width: 200
                }
            ],
            viewConfig: {
                forceFit: true
            },
            id: 'grid',
            enableDragDrop: true,
            ddGroup: 'treeWs',

            buildDD: function () {
                var me = this;

                // Создаем новую цель для сброса ДД дерева - DOM-кишки окошка удаления
                var deleterDropTarget = me.centerPan.dropZone.getView().scroller.dom;
                var destGridDropTarget = new Ext.dd.DropTarget(deleterDropTarget, {
                    ddGroup: 'treeWs',
                    copy: true,
                    notifyDrop: function (ddSource, e, data) {
                        if (ddSource.tree.ref == 'warehouses') {
                            var data = data;
                            Ext.Msg.show(
                                {
                                    title: 'Удалить',
                                    msg: 'Вы хотите удалить этот элемент?',
                                    buttons: Ext.Msg.OKCANCEL,
                                    icon: Ext.MessageBox.QUESTION,
                                    animEl: 'elId',
                                    fn: function (buttonId, text) {
                                        if (buttonId == 'cancel') {
                                            Ext.MessageBox.show(
                                                {
                                                    title: 'Операция отменена',
                                                    msg: 'Удаление отменено',
                                                    icon: Ext.MessageBox.WARNING,
                                                    buttons: Ext.MessageBox.OK
                                                }
                                            );
                                        }
                                        else if (buttonId == 'ok') {
                                            me.warehouses.deleteWs(me.warehouses.getSelectionModel().selNode);
                                        }
                                    }
                                }
                            );
                        }
                    }
                });
            },
        });

        return [new grid({
            parent: me.centerPan,
            ref: 'dropZone',
        })];
    }
});