// Вложенная таб панель справочников
App.tab.catalogs = Ext.extend(Ext.TabPanel, {
    title: 'Справочники',
    activeTab: 1,
    tabPosition: 'top',

    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems(),

        });

        App.tab.catalogs.superclass.initComponent.call(this);


    },

    buildItems: function () {
        var contractors = new App.tab.catalogs.contractors(
            // var contractors = new App.tab.operationPanel(
            {
                ref: 'contractors',
                parent: this
            });
        var warehouses = new App.tab.catalogs.warehous()

        var catalogsView = [
            contractors,
            warehouses
        ]
        return catalogsView;
    }
});

App.tab.catalogs.warehous = Ext.extend(Ext.Panel, {
    title: 'warehous',
    layout: 'border',

    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems(),

        });

        App.tab.catalogs.contractors.superclass.initComponent.call(this);
        this.centerPan.tree = this.warehouses;
    },

    buildItems: function () {
        var warehouseTree = new App.tab.catalogs.warehouses(
            {
                ref: 'warehouses',
                parent: this
            });

        var pan = new centerPanel({
            ref: 'centerPan',
            parent: this
        });

        return [warehouseTree, pan];
    },


});

// Заглушка
App.tab.catalogs.contractors = Ext.extend(Ext.Panel, {
    title: 'Contractors',
    layout: { type: 'vbox', align: 'stretch' },

    initComponent: function () {
        Ext.apply(this, {
            items: [
                {
                    xtype: 'textfield',
                    title: 'test'
                }
            ]
        });

        App.tab.catalogs.contractors.superclass.initComponent.call(this);
    },
});


centerPanel = Ext.extend(Ext.Panel, {
    title: 'Добавить/Удалить узел',
    flex: 1,
    region: 'east',
    collapsible: true,
    // tree: null,
    bodyPadding: 10,
    layout: 'form',
    height: 70,

    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems()

        });

        centerPanel.superclass.initComponent.call(this);
    },

    buildItems: function () {
        var me = this;
        var items = [
            {
                xtype: 'textfield',
                id: 'txt',
                height: 20,
            }, {
                xtype: 'button',
                width: 60,
                height: 20,
                text: 'Добавить',
                handler: function () {
                    // получаем введенное в текстовое поле значение
                    var newNode = me.getComponent('txt').getValue();
                    // Используем метод appendChild для добавления нового объекта
                    me.tree.getSelectionModel().getSelectedNode().appendChild({
                        text: newNode,
                        leaf: true
                    });
                }
            }, {
                xtype: 'button',
                width: 60,
                height: 20,
                margin: '0 0 0 20',
                text: 'Удалить',
                handler: function () {
                    // получаем выделенный узел для удаления
                    var selectedNode = me.tree.getSelectionModel().getSelection()[0];
                    // если таковой имеется, то удаляем
                    if (selectedNode) {
                        selectedNode.remove(true);
                    }
                }
            }];
        return items;
    }
});

App.tab.catalogs.warehouses = Ext.extend(treeWs, {
    // title: 'Warehouses',
    enableDD: true,
    ddGroup: 'treeWs',
    autoScroll: true,
    collapsible: false,
    rootVisible: true,
    centerFrame: true,
    lines: true,
    region: 'center',
    flex: 3,

    useArrows: true,
    borderWidth: Ext.isBorderBox ? 0 : 2, // the combined left/right border for each cell
    cls: 'x-treegrid',

    initComponent: function () {
        Ext.apply(this, {
            editor: this.getEditor(),
            deleter: this.buildDeleter(),
        });

        App.tab.catalogs.warehouses.superclass.initComponent.call(this);
        this.getRootNode().expand();
        this.deleter.show(this, this.buildDD, this);
        
        // this.deleter.setVisible(false);
    },

    listeners: {

        startdrag: function (node, e) {
            e.currentParent = e.parentNode;
            this.deleter.setDisabled(false);
        },

        dragdrop(node, dd, e) {
            // TODO: Перемещение в "пустоту" определяется как перемещение в вышестоящую ноду
            // e.currentParent = e.parentNode;
            // if (e.currentParent !== e.parentNode){
            var oldParent = dd.currentParent.attributes.text || null;
            var newParent = e.dragOverData.target.attributes.text;
            if (oldParent != newParent) {
                Ext.MessageBox.alert(`Old parent : ${oldParent} New: ${newParent}`)
            };

            // };
        },

        enddrag() {
            this.deleter.setDisabled(true);
        },

        dblclick(node, e) {
            this.onTreeNodeDblClick(node);
        },
    },

    onTreeNodeDblClick: function (n) {
        this.editor.editNode = n;
        this.editor.startEdit(n.ui.textNode);
    },

    onTreeEditComplete: function (treeEditor, newText, oldText) {
        if (oldText == newText) {
            return;
        };
        var me = this;
        var editData = this.editNode.attributes
        // TODO: Месседж Бокс не умеет в перевод строки?
        var message = `Старое : ${oldText}\nНовое : ${newText}`
        console.log(message)
        // this.parent.addToChanged(this.editNode);
        var title = 'Вы уверены?'
        Ext.Msg.show(
            {
                title: title,
                msg: message,
                buttons: Ext.Msg.OKCANCEL,
                icon: Ext.MessageBox.QUESTION,
                animEl: 'elId',
                fn: function (buttonId, text) {
                    if (buttonId == 'cancel') {
                        me.editNode.setText(oldText);
                        Ext.MessageBox.show(
                            {
                                title: 'Операция отменена',
                                msg: 'Оставили название: ' + oldText,
                                icon: Ext.MessageBox.WARNING,
                                buttons: Ext.MessageBox.OK
                            }
                        );
                    }
                    else if (buttonId == 'ok') {
                        me.setNewWsName(me.editNode);
                        // TODO: Надо понять, как выполнять эту функцию ПОСЛЕ изменений на бэке
                        // me.parent.getRootNode().reload();
                    }
                }
            }
        );

    },

    getEditor: function () {
        var me = this;
        var editor = new Ext.tree.TreeEditor(this, {}, {
            cancelOnEsc: true,
            completeOnEnter: true,
            selectOnFocus: true,
            allowBlank: false,
            listeners: {
                complete: me.onTreeEditComplete
            },
            ref: 'editor',
            parent: me,

            setNewWsName: function (node) {
                Ext.Ajax.request({
                    url: 'set_new_ws_name',
                    method: 'POST',
                    params: { id_ws: node.attributes.id_ws, name: node.attributes.text },
                    success: function (response, options) {
                        Ext.Msg.show(
                            {
                                title: 'Операция успешна',
                                msg: 'Установили название: ' + node.attributes.text,
                                icon: Ext.MessageBox.INFO,
                                buttons: Ext.MessageBox.OK
                            }
                        );
                        me.getRootNode().reload();
                        // Так делать нельзя, 
                        // потому что подтягиваются новые реальные состояния ноды, 
                        // а вдруг что то переместили до того, как переименовать? 
                        // Будут дубли
                        // node.reload()
                    },
                    failure: function (response, options) {
                        Ext.MessageBox.show(
                            {
                                title: 'Не удалось записать данные',
                                msg: 'Оставили текущее название',
                                icon: Ext.MessageBox.ERROR,
                                buttons: Ext.MessageBox.OK
                            }
                        );
                        me.getRootNode().reload();
                        // node.reload()
                    }
                });
            },
        });

        return editor;
    },

    buildDD: function () {
        var me = this;

        // Создаем новую цель для сброса ДД дерева - DOM-кишки окошка
        var deleterDropTarget = this.deleter.dropZone.getView().scroller.dom;
        var destGridDropTarget = new Ext.dd.DropTarget(deleterDropTarget, {
            ddGroup: 'treeWs',
            copy: true,
            notifyDrop: function (ddSource, e, data) {
                console.log(ddSource);
            }
        });
    },

    buildDeleter: function () {
        var me = this;
        var deleterWindow = Ext.extend(Ext.Window, {
            title: 'Удалить узел',
            width: 200,
            height: 200,
            bodyStyle: 'background:transparent;',
            layout: 'fit',
            region: 'west',
            closable: false,

            initComponent: function () {
                Ext.apply(this, {
                    items: this.buildItems()
                });
                deleterWindow.superclass.initComponent.call(this);
            },

            buildItems: function () {
                var windowScope = this;
                var grid = new Ext.grid.GridPanel({
                    store: new Ext.data.ArrayStore({
                        fields: ['name']
                    }),
                    columns: [
                        {
                            id: 'name_column',
                            header: 'Бросать сюда',
                            dataIndex: 'name',
                            resizable: false,
                            width: 200
                        }
                    ],
                    viewConfig: {
                        forceFit: true
                    },
                    id: 'grid',
                    // title: 'Корзина',
                    region: 'center',
                    layout: 'fit',
                    enableDragDrop: true,
                    ddGroup: 'treeWs',
                    parent: windowScope,
                    ref: 'dropZone'
                });
                return [grid,];
            },
        });

        return new deleterWindow(
            {
                ref: 'deleter',
                parent: this
            }
        );
    }

});