// Вложенная таб панель справочников
App.tab.catalogs = Ext.extend(Ext.TabPanel, {
    title: 'Справочники',
    activeTab: 0,
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

        var warehouses = new App.tab.catalogs.warehous({
            ref: 'warehouses',
            parent: this
        });

        var articles = new App.tab.catalogs.articles({
            ref: 'articles',
            parent: this
        });

        var catalogsView = [
            contractors,
            warehouses,
            articles
        ]
        return catalogsView;
    }
});

App.tab.catalogs.warehous = Ext.extend(Ext.Panel, {
    title: 'Места хранения',
    layout: 'border',

    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems(),

        });

        App.tab.catalogs.contractors.superclass.initComponent.call(this);
        // this.centerPan.tree = this.warehouses;
        this.centerPan.dropZone.on('afterrender', this.centerPan.dropZone.buildDD, this);
    },

    buildItems: function () {
        var warehouseTree = new App.tab.catalogs.warehouses({
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


// FIXME: Все гриды должны наследоваться от кастомного родителя
// Articles
App.tab.catalogs.articles = Ext.extend(Ext.grid.EditorGridPanel, {
    title: 'Товары',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    stripeRows: true,
    disableSelection: false,
    columnLines: true,

    autoExpandColumn: 'artName',


    initComponent: function () {
        Ext.apply(this, {
            store: this.buildStore(),
            colModel: this.buildColModel(),
            bbar: this.buildFootBar()

        });

        App.tab.catalogs.contractors.superclass.initComponent.call(this);
    },

    buildColModel: function () {
        return articleColumn;
    },

    buildStore: function () {
        var artStore = new Ext.data.JsonStore({
            fields: articleFields,
            autoSave: false,
            autoLoad: true,

            listeners: {
                save: function () {
                    this.load()
                }
            },

            proxy: new Ext.data.HttpProxy({
                api: {
                    read: {
                        url: 'get_articles',
                        method: 'POST'
                    },

                    create: {
                        url: 'change_art',
                        method: 'POST',
                    },

                    destroy: {
                        url: 'test',
                        method: 'DELETE'
                    },
                }
            }),
            root: 'articles',

            writer: new Ext.data.JsonWriter({
                encode: true,
                encodeDelete: false,
                listful: true
            }),
        });
        // caStore.load();
        return artStore;
    },

    buildFootBar: function () {
        var me = this;
        return new articleFootBar({
            ref: 'articleFootBar',
            parent: me
        });
    }
});

// Contractors
App.tab.catalogs.contractors = Ext.extend(Ext.grid.EditorGridPanel, {
    title: 'Контрагенты',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    stripeRows: true,
    disableSelection: false,
    columnLines: true,
    autoExpandColumn: 'contrName',


    initComponent: function () {
        Ext.apply(this, {
            store: this.buildStore(),
            colModel: this.buildColModel(),
            bbar: this.buildFootBar()

        });

        App.tab.catalogs.contractors.superclass.initComponent.call(this);
    },

    buildColModel: function () {
        return contractorsColumn;
    },

    buildStore: function () {
        var caStore = new Ext.data.JsonStore({
            autoSave: false,
            autoLoad: true,
            root: 'contractors',
            fields: contrFields,

            listeners: {
                save: function () {
                    this.load()
                }
            },

            proxy: new Ext.data.HttpProxy({
                idProperty: 'id_contr',
                url: 'get_contractors',
                // TODO: Понять, почему при store.remove(rec) не уходит запрос к серверу
                // Далее сделать норм методы
                // На стороне сервера - сделать единый метод, и действия в зависимости от метода
                api: {
                    read: {
                        url: 'get_contractors',
                        method: 'POST'
                    },

                    create: {
                        url: 'contr_add',
                        method: 'POST'
                    },

                    destroy: {
                        url: 'contr_del',
                        method: 'POST'
                    },

                    update: {
                        url: 'contr_del',
                        method: 'POST'
                    },
                }
            }),
            
            writer: new Ext.data.JsonWriter({
                encode: true,
                encodeDelete: false,
                listful: true
            }),
            
            reader: new Ext.data.JsonReader({
                idProperty: 'id_contr',
            }),

        });
        // caStore.load();
        return caStore;
    },

    buildFootBar: function () {
        var me = this;
        return new contrFootBar({
            ref: 'contrFootBar',
            parent: me
        });
    }
});

App.tab.catalogs.warehouses = Ext.extend(treeWs, {
    enableDD: true,
    ddGroup: 'treeWs',
    autoScroll: true,
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
            // deleter: this.buildDeleter(),
        });

        App.tab.catalogs.warehouses.superclass.initComponent.call(this);


        // this.deleter.show(this, this.buildDD, this);

        // this.deleter.setVisible(false);
    },

    listeners: {

        startdrag: function (node, e) {
            e.currentParent = e.parentNode;
            this.parent.centerPan.dropZone.setDisabled(false);
        },

        dragdrop(node, dd, e) {
            // TODO: Перемещение в "пустоту" определяется как перемещение в вышестоящую ноду
            // e.currentParent = e.parentNode;
            // if (e.currentParent !== e.parentNode){
            var oldParent = dd.currentParent.attributes.text || null;
            var newParent = e.dragOverData.target.attributes.text;
            if (oldParent != newParent) {
                this.moveWs(dd, e.dragOverData.target);
                Ext.MessageBox.alert(`Old parent : ${oldParent} New: ${newParent}`);
            } else {
                this.getRootNode().reload();
            };

            // };
        },

        enddrag() {
            this.parent.centerPan.dropZone.setDisabled(true);
        },

        dblclick(node, e) {
            this.onTreeNodeDblClick(node);
        },

        beforenodedrop(dropEvent) {
            var me = this;
            if (dropEvent.source.tree != this) {
                Ext.MessageBox.prompt(
                    'Введите имя',
                    'Имя нового элемента',
                    function (btn, text, mb) {
                        if (btn == 'ok') {
                            var newNode = dropEvent.dropNode
                            me.parent.centerPan.getRootNode().reload();
                            newNode.setText(text || dropEvent.dropNode.text);
                            me.addWs(newNode);
                        } else {
                            Ext.MessageBox.show({
                                title: 'Операция отменена',
                                msg: 'Новый элемент не создан',
                                icon: Ext.MessageBox.WARNING,
                                buttons: Ext.MessageBox.OK
                            });
                            me.parent.centerPan.getRootNode().reload();
                            me.getRootNode().reload();
                        }
                    }
                );
            };
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
        // this.parent.addToChanged(this.editNode);
        var title = 'Вы уверены?'
        Ext.Msg.show({
            title: title,
            msg: message,
            buttons: Ext.Msg.OKCANCEL,
            icon: Ext.MessageBox.QUESTION,
            animEl: 'elId',
            fn: function (buttonId, text) {
                if (buttonId == 'cancel') {
                    me.editNode.setText(oldText);
                    Ext.MessageBox.show({
                        title: 'Операция отменена',
                        msg: 'Оставили название: ' + oldText,
                        icon: Ext.MessageBox.WARNING,
                        buttons: Ext.MessageBox.OK
                    });
                } else if (buttonId == 'ok') {
                    me.setNewWsName(me.editNode);
                }
            }
        });

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
                    params: {
                        id_ws: node.attributes.id_ws,
                        name: node.attributes.text
                    },
                    success: function (response, options) {
                        Ext.Msg.show({
                            title: 'Операция успешна',
                            msg: 'Установили название: ' + node.attributes.text,
                            icon: Ext.MessageBox.INFO,
                            buttons: Ext.MessageBox.OK
                        });
                    },
                    failure: function (response, options) {
                        Ext.MessageBox.show({
                            title: 'Не удалось записать данные',
                            msg: 'Оставили текущее название',
                            icon: Ext.MessageBox.ERROR,
                            buttons: Ext.MessageBox.OK
                        });
                    },
                    callback: function () {
                        me.getRootNode().reload();
                    }
                });
            },
        });

        return editor;
    },

    addWs: function (node) {
        var parent = node.parentNode;
        var me = this;
        var node = node;
        Ext.Ajax.request({
            url: 'add_ws',
            method: 'POST',
            params: {
                id_higher: parent.attributes.id_ws || null,
                name: node.text
            },
            success: function (response, options) {
                Ext.Msg.show({
                    title: 'Операция успешна',
                    msg: 'Добавлено ' + node.attributes.text,
                    icon: Ext.MessageBox.INFO,
                    buttons: Ext.MessageBox.OK
                });
            },
            failure: function (response, options) {
                var msg = response.responseText || 'Не удалось добавить данные'
                Ext.MessageBox.show({
                    title: 'Не удалось',
                    msg: msg,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.MessageBox.OK
                });
            },
            callback: function () {
                me.getRootNode().reload();
            }
        });
    },

    moveWs: function (node, newParent) {
        var me = this;
        Ext.Ajax.request({
            url: 'move_warehouse',
            method: 'POST',
            params: {
                id_ws: node.attributes.id_ws,
                id_higher: newParent.attributes.id_ws || null
            },
            success: function (response, options) {
                Ext.Msg.show({
                    title: 'Операция успешна',
                    msg: 'Родитель изменен',
                    icon: Ext.MessageBox.INFO,
                    buttons: Ext.MessageBox.OK
                });
            },
            failure: function (response, options) {
                Ext.MessageBox.show({
                    title: 'Не удалось изменить родителя',
                    msg: response.responseText,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.MessageBox.OK
                });
            },
            callback: function () {
                me.getRootNode().reload();
            }
        });
    },

    deleteWs: function (node) {
        var me = this;
        var parent = node.parentNode;
        Ext.Ajax.request({
            url: 'delete_ws',
            method: 'POST',
            params: {
                id_ws: node.attributes.id_ws,
                name: node.attributes.text
            },
            success: function (response, options) {
                Ext.Msg.show({
                    title: 'Операция успешна',
                    msg: 'Удалено ' + node.attributes.text,
                    icon: Ext.MessageBox.INFO,
                    buttons: Ext.MessageBox.OK
                });
            },
            failure: function (response, options) {
                Ext.MessageBox.show({
                    title: 'Не удалось удалить данные',
                    msg: 'Удалить не удалось',
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.MessageBox.OK
                });
            },
            callback: function () {
                me.getRootNode().reload();
            }
        });
    },

    // buildDeleter: function () {
    //     return new deleterWindow(
    //         {
    //             ref: 'deleter',
    //             parent: this
    //         }
    //     );
    // }

});