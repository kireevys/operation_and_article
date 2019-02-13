Ext.ns('App.tab.operation');
Ext.ns('App.tab.operation.models');
// Create first Tab container
App.tab.operationPanel = Ext.extend(Ext.Panel, {
    title: 'Operations',
    layout: { type: 'vbox', align: 'stretch' },

    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems()
        });
        App.tab.operationPanel.superclass.initComponent.call(this);
    },

    buildItems: function () {
        var op = new App.tab.operationPanel.operation({ ref: 'operationGrid', parent: this });
        var opArt = new App.tab.operationPanel.opArtPanel({ ref: 'opArtPanel', parent: this });
        mainItems = [
            op,
            opArt,
        ];
        return mainItems;
    },

});

App.tab.operationPanel.operation = Ext.extend(Ext.grid.GridPanel, {
    title: 'Operations',
    flex: 3,
    stripeRows: true,

    initComponent: function () {
        Ext.apply(this, {
            colModel: this.buildColModel(),
            tbar: this.buildToolBar().top,
            bbar: this.buildToolBar().bottom,
            store: this.buildStore(),
            statusStore: this.buildStatusStore()
        });
        App.tab.operationPanel.operation.superclass.initComponent.call(this);
        this.loadOp();
    },

    buildColModel: function () {
        var operationColumns = new Ext.grid.ColumnModel({
            columns: [
                // TODO: Сделать вывод названий - добавить джойны на бэк
                { header: "id_op", dataIndex: 'id_op', id: 'id_op', width: 50, hideable: false },
                { header: 'code', dataIndex: 'code' },
                { header: 'id_status', dataIndex: 'id_status' },
                { header: 'optype', dataIndex: 'optype' },
                { header: 'id_contr', dataIndex: 'id_contr' },
                { header: 'id_ws', dataIndex: 'id_ws' },
                { header: 'opdate', dataIndex: 'opdate' },
                { header: 'opsumm', dataIndex: 'opsumm' },
                { header: 'id_rack', dataIndex: 'id_rack' },
                { header: 'doccount', dataIndex: 'doccount' },
                { header: 'gm_res', dataIndex: 'gm_res' },
            ],
            defaults: {
                sortable: true,
                menuDisabled: false
            },

            defaultWidth: 80
        });
        return operationColumns;
    },

    buildToolBar: function () {
        var me = this;
        var opToolbar = new Ext.Toolbar({
            height: 40,
            layout: 'anchor',
            buttons: [
                {
                    xtype: 'button', // default for Toolbars, same as 'tbbutton'
                    text: 'Create operation',
                    anchor: '100% 95%',
                    handler: function () {
                        var adder = new addop(
                            {
                                ref: 'adder',
                                parent: me
                            }
                        );
                        adder.show();
                    }
                }
            ]
        });

        var operationControl = new Ext.Toolbar({
            height: 40,
            layout: 'hbox',
            ref: 'opControl',
            parent: me,
            buttons: [
                {
                    xtype: 'button', // default for Toolbars, same as 'tbbutton'
                    text: 'Up status',
                    ref: 'up',
                    flex: 1,
                    height: 35,
                    parent: this,
                    disabled: true,
                    handler: function () {
                        this.parent.upStatus();
                    }
                }, {
                    xtype: 'button', // default for Toolbars, same as 'tbbutton'
                    text: 'Down status',
                    ref: 'down',
                    flex: 1,
                    height: 35,
                    parent: this,
                    disabled: true,
                    handler: function () {
                        this.parent.downStatus();
                    }
                }, {
                    xtype: 'button', // default for Toolbars, same as 'tbbutton'
                    text: 'Delete op',
                    ref: 'del',
                    flex: 1,
                    height: 35,
                    parent: this,
                    disabled: true,
                    handler: function () {
                        this.parent.deleteOp()
                    }
                }
            ]
        });
        return {
            top: opToolbar,
            bottom: operationControl
        };
    },

    buildFields: function () {
        var opFields = [
            { name: 'code', mapping: 'code' },
            { name: 'doccount', mapping: 'doccount' },
            { name: 'gm_res', mapping: 'gm_res' },
            { name: 'id_contr', mapping: 'id_contr' },
            { name: 'id_op', mapping: 'id_op' },
            { name: 'id_rack', mapping: 'id_rack' },
            { name: 'id_status', mapping: 'id_status' },
            { name: 'id_ws', mapping: 'id_ws' },
            { name: 'opdate', mapping: 'opdate' },
            { name: 'opsumm', mapping: 'opsumm' },
            { name: 'optype', mapping: 'optype' },
        ];
        return opFields;
    },

    buildStore: function () {
        var operationStore = new Ext.data.JsonStore({
            fields: this.buildFields(),
            proxy: new Ext.data.HttpProxy({
                url: 'getop',
                method: 'GET'
            }),
            root: 'operation'
        });
        return operationStore;
    },

    buildStatusStore: function () {
        var me = this;
        var statusField = [
            { name: 'id_status', mapping: 'id_status' },
            { name: 'name', mapping: 'name' },
            { name: 'stat_order', mapping: 'stat_order' },
            { name: 'on_delete', mapping: 'on_delete' }
        ];

        var opStatusStore = new Ext.data.JsonStore({
            fields: statusField,
            parent: me,
            idProperty: 'id_status',
            ref: 'opStatusStore',
            proxy: new Ext.data.HttpProxy({
                api: {
                    read: {
                        url: 'get_op_status',
                        method: 'POST'
                    }
                }
            }),
            root: 'opstatus'
        });

        return opStatusStore;
    },

    loadOp: function () {
        this.store.load();
        this.statusStore.load();
    },

    setNewStatus: function (newStatus) {
        var me = this;
        var currensSelection = this.getSelectedOp();
        var currentIdStatus = currensSelection.id_status;
        var id_op = currensSelection.id_op;
        Ext.Ajax.request({
            url: 'change_opstatus',
            method: 'POST',
            params: {
                id_op: id_op,
                id_status: newStatus.id
            },
            success: function (response, options) {
                Ext.MessageBox.alert('Успех', 'Статус обновлен на : ' + newStatus.name);
                me.store.load();
            }
        });
    },

    getSelectedOp: function () {
        return this.selModel.getSelected().data;
    },

    upStatus: function () {
        var currensSelection = this.getSelectedOp();
        var currentStatus = currensSelection.id_status;
        //TODO: ++/-- Ведет себя очень странно, такое ощущение, что nextId не очищается из скоупа
        var nextId = this.statusStore.data.map[currentStatus].data.stat_order + 1;
        var nextStatus = {
            id: nextId,
            name: this.statusStore.data.map[nextId].data.name
        };
        this.setNewStatus(nextStatus);
    },

    downStatus: function () {
        var currensSelection = this.getSelectedOp();
        var currentStatus = currensSelection.id_status;
        var nextId = this.statusStore.data.map[currentStatus].data.stat_order - 1;
        var nextStatus = {
            id: nextId,
            name: this.statusStore.data.map[nextId].data.name
        };
        this.setNewStatus(nextStatus);
    },

    deleteOp: function () {
        var me = this;
        var currenSelection = this.getSelectedOp();
        Ext.Ajax.request({
            url: 'delete_op',
            method: 'POST',
            params: {
                id_op: currenSelection.id_op
            },
            success: function (response, options) {
                Ext.MessageBox.alert('Успех', 'Операция удалена');
                me.store.load();
            }
        });
    },

    activateButtons: function (opRecord) {
        var toolBarButtons = this.bottomToolbar;
        toolBarButtons.up.setDisabled(this.checkUp(opRecord));
        toolBarButtons.down.setDisabled(this.checkDown(opRecord));
        toolBarButtons.del.setDisabled(this.checkDelete(opRecord));
    },

    checkUp: function (opRecord) {
        var isDisable = true;
        var currentStatus = opRecord.get('id_status');
        if (this.statusStore.data.map[currentStatus].data.stat_order >= 6) {
            isDisable = true;
        }
        else {
            isDisable = false;
        }
        return isDisable;
    },
    checkDown: function (opRecord) {
        var isDisable = true;
        if (opRecord.get('id_status') <= 1) {
            isDisable = true;
        }
        else {
            isDisable = false;
        }
        return isDisable;
    },
    checkDelete: function (opRecord) {
        var isDisable = true;
        var currentStatus = opRecord.get('id_status');
        if (this.statusStore.data.map[currentStatus].data.on_delete == 0) {
            isDisable = true;
        }
        else {
            isDisable = false;
        }
        return isDisable;
    },

    listeners: {
        // Событие, считывающее id_op при нажатии строку
        // Далее id должен уходить на бэк, получать данне о товарах в операции
        // И грузить товары в стор нижнего грида
        cellclick(grid, rowIndex, columnIndex, e) {
            var record = grid.getStore().getAt(rowIndex);
            currentIdOp = record.get('id_op');
            // Запросим товары по операции в грид опТоваров
            this.parent.opArtPanel.loadOp({ id_op: currentIdOp });
            this.activateButtons(record);
        },

    }
});

addop = Ext.extend(Ext.Window, {
    title: 'creating of operation',
    modal: true,
    width: 500,
    height: 450,
    layout: 'fit',

    initComponent: function () {
        Ext.applyIf(this, {
            items: this.buildItems()
        }),
            addop.superclass.initComponent.call(this);
    },

    buildItems: function () {
        // add form to array
        var arr = [
            new addOpForm({
                ref: 'addOpForm',
                parent: this
            })
        ];
        return arr;
    },
});

addOpForm = Ext.extend(Ext.form.FormPanel, {
    id: 'addOpForm',

    getChildValues: function () {
        var me = this;
    },

    initComponent: function () {
        Ext.applyIf(this, {
            items: this.buildItems(),
            buttons: this.buildButtons(),
        });
        addOpForm.superclass.initComponent.call(this);

        this.wsTree.on('beforedblclick', this.setWs, this);
    },
    formData: {
        optype: null,
        ws: null,
    },

    setWs: function (node, e) {
        if (node.attributes.leaf) {
            this.wsValue.setValue(node.attributes.id_ws);
        }
    },

    buildItems: function () {
        var me = this;
        var comboOptypes = Ext.extend(Ext.form.ComboBox, {
            id: 'optype',
            typeAhead: true,
            triggerAction: 'all',
            // lazyRender: true,
            mode: 'local',
            valueField: 'id_type',
            displayField: 'name',
            fieldLabel: 'Тип операции',
            allowBlank: false,
            listeners: {
                beforeselect: function (record, index) {

                    var gmRes = Ext.getCmp('gm_res');
                    var rack = Ext.getCmp('id_rack');
                    var docCount = Ext.getCmp('doccount');

                    // При выборе другого типа операции
                    // Очищаем доп поля
                    gmRes.setValue(null);
                    rack.setValue(null);
                    docCount.setValue(null);

                    var gmIsDisable = true;
                    var rackIsDisable = true;
                    var docIsDisable = true;
                    if (index.data.name === 'На гипермаркете') {
                        gmIsDisable = false;
                        rackIsDisable = true;
                        docIsDisable = true;
                    }
                    else if (index.data.name === 'Складская') {
                        gmIsDisable = true;
                        rackIsDisable = false;
                        docIsDisable = true;
                    }
                    else if (index.data.name === 'От поставщика') {
                        gmIsDisable = true;
                        rackIsDisable = true;
                        docIsDisable = false;
                    };
                    gmRes.setDisabled(gmIsDisable);
                    rack.setDisabled(rackIsDisable);
                    docCount.setDisabled(docIsDisable);
                }
            },

            initComponent: function () {
                Ext.applyIf(this, {
                    store: this.buildStore(),
                });
                comboOptypes.superclass.initComponent.call(this);
                this.store.load()
            },

            buildStore: function () {
                var optypeStore = new Ext.data.JsonStore({
                    fields: [
                        'id_type',
                        'name',],
                    proxy: new Ext.data.HttpProxy({
                        api: {
                            read: {
                                url: 'get_optypes',
                                method: 'GET'
                            }
                        }
                    }),
                    root: 'optype',
                });
                return optypeStore;
            },
        });
        // TODO: Вынести для переиспользования в добавление МХ
        var treeWs = Ext.extend(Ext.tree.TreePanel, {
            title: 'Warehouse',
            autoScroll: true,
            collapsible: true,
            height: 150,
            useArrows: true,
            id: 'wsTree',
            dataUrl: 'get_ws_tree',
            root: {
                nodeType: 'async',
                text: 'warehouse',
                id: 'warehouse'
            },

            initComponent: function () {
                Ext.apply({
                    bbar: this.buildToolBar()
                });

                treeWs.superclass.initComponent.call(this);
            },
            listeners: {
                // После двойного клика по листу:
                // Выводим МХ для наглядности, и записываем его id для формы
                beforedblclick(node, e) {
                    if (node.attributes.leaf) {
                        var selNodeText = node.text;
                        var selector = Ext.getCmp('selWs');
                        selector.setValue(selNodeText);
                    }

                }
            },
            buildToolBar: function () {
                var me = this;
                var bar = Ext.extend(Ext.Toolbar, {
                    layout: 'form',
                    initComponent: function () {
                        Ext.apply({
                            items: this.buildItems()
                        });

                        bar.superclass.initComponent.call(this);
                    },
                    buildItems: function () {
                        var me = this;
                        var wsField = new Ext.form.NumberField({
                            id: 'selWs',
                            fieldLabel: 'Selected warehouse',
                            disabled: true,
                            allowBlank: false,
                            ref: 'selWs',
                            parent: me
                        })
                        return [wsField,]
                    },
                });
                return new bar(
                    {
                        ref: 'treeTb',
                        parent: this
                    });
            },
            // TODO: Ниработаит
            /* bbar: [
                new Ext.Toolbar({
                    layout: 'form',
                    ref: 'treeTb',
                    items: [
                        {
                            xtype: 'textfield',
                            id: 'selWs',
                            fieldLabel: 'Selected warehouse',
                            disabled: true,
                            allowBlank: false,
                            ref: 'selWs',
                        }
                    ]
                })
            ] */
        });

        var comboCA = Ext.extend(Ext.form.ComboBox, {
            id: 'id_contr',
            typeAhead: true,
            triggerAction: 'all',
            // lazyRender: true,
            mode: 'local',
            valueField: 'id_contr',
            displayField: 'name',
            fieldLabel: 'Conractor',

            initComponent: function () {
                Ext.applyIf(this, {
                    store: this.buildStore(),
                });
                comboCA.superclass.initComponent.call(this);
                this.store.load()
            },

            buildStore: function () {
                var caStore = new Ext.data.JsonStore({
                    fields: [
                        'id_contr',
                        'name',],
                    proxy: new Ext.data.HttpProxy({
                        api: {
                            read: {
                                url: 'get_contractors',
                                method: 'GET'
                            }
                        }
                    }),
                    root: 'contractors',
                });
                return caStore;
            },
        });

        var opdateField = Ext.extend(Ext.form.DateField, {
            fieldLabel: 'opdate',
            format: 'd.m.Y',
            id: 'opdate',
            allowBlank: false,

            initComponent: function () {
                Date.monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
                Date.dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
                var today = new Date();
                this.setValue(today);
                Ext.apply(this, {
                    minValue: new Date(today.getFullYear() - 1, 1, 1),
                    maxValue: new Date(today.getFullYear() + 2, 1, 1),
                })
            }
        });

        var settPanel = Ext.extend(Ext.form.FieldSet, {
            disabled: false,
            layout: 'form',
            title: 'Доп поля',
            id: 'additionsField',

            initComponent: function () {
                Ext.apply(this, {
                    items: [
                        {
                            xtype: 'numberfield',
                            id: 'gm_res',
                            fieldLabel: 'Резерв на ГМ',
                            blankText: '0',
                            emptyText: 'Только для типа "На Гипермаркете"',
                            disabled: true,
                            parent: this.parent
                        },
                        {
                            xtype: 'numberfield',
                            id: 'doccount',
                            fieldLabel: 'Документов',
                            blankText: '0',
                            disabled: true,
                            minValue: 0,
                            maxValue: 15,
                            emptyText: 'Только для типа "От поставщика"',
                            parent: this.parent
                        },
                        {
                            xtype: 'numberfield',
                            id: 'id_rack',
                            fieldLabel: 'Стеллаж',
                            blankText: '0',
                            disabled: true,
                            emptyText: 'Только для типа "Складская"',
                            parent: this.parent,
                            ref: 'rack'
                        },
                    ]
                })
                settPanel.superclass.initComponent.call(this);
            },

        });
        // Create all items, add to items array and return it
        var itemArr = [
            new comboOptypes({
                ref: 'comboOptypes',
                parent: this,
                allowBlank: false,
            }),

            new treeWs({
                ref: 'wsTree',
                parent: this,
            }),

            new comboCA({
                ref: 'comboCa',
                parent: this,
                allowBlank: false,
            }),
            new opdateField({
                ref: 'opdateField',
                parent: this,
                allowBlank: false,
            }),
            new settPanel({
                ref: 'settPanel',
                parent: this
            }),

            {
                xtype: 'numberfield',
                id: 'id_ws',
                hidden: true,
                value: null,
                allowBlank: false,
                ref: 'wsValue',
                parent: this
            },
            {
                xtype: 'numberfield',
                id: 'id_status',
                hidden: true,
                value: null,
                allowBlank: false,
                ref: 'newOpStatus',
                emptyText: 1,
                parent: this
            }
        ];
        return itemArr;
    },

    buildButtons: function () {
        var me = this;
        var buttonsArr = [
            {
                xtype: 'button',
                id: 'apply',
                text: 'done',
                disabled: false,
                handler: function () {
                    var myForm = me.getForm()
                    if (myForm.isValid()) {
                        Ext.Ajax.request({
                            url: 'add_op',
                            method: 'POST',
                            params: myForm.getFieldValues(),
                            success: function (response, options) {
                                Ext.MessageBox.alert('Успех', 'Операция добавлена');
                                me.parent.parent.store.load();
                                me.parent.close();
                            }
                        });
                    }
                },
            }
        ];
        return buttonsArr;
    },
});

App.tab.operationPanel.opArtPanel = Ext.extend(Ext.Panel, {
    title: 'Articles in operation',
    flex: 2,
    layout: 'hbox',
    enableDragDrop: true,


    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems()
        });

        App.tab.operationPanel.opArtPanel.superclass.initComponent.call(this);
    },

    buildItems: function () {
        var opArt = new App.tab.operationPanel.opArticles({ ref: 'opArtGrid', parent: this });
        var articles = new App.tab.operationPanel.articlesGrid({ ref: 'articles', parent: this });
        mainItems = [
            opArt,
            articles,
        ];
        return mainItems;
    },


    // TODO: working
    buildDD: function () {
        var me = this;
        var opArt = me.opArtGrid;
        var art = me.articles
        // Dd group
        // used to add records to the destination stores
        // var blankRecord = Ext.data.Record.create(fields);
        var firstGridDropTargetEl = me.opArtGrid.getView().el.dom.childNodes[0].childNodes[1];

        var firstGridDropTarget = new Ext.dd.DropTarget(firstGridDropTargetEl, {
            ddGroup: 'opArtDDGroup',
            copy: true,
            notifyDrop: function (ddSource, e, data) {

                // Generic function to add records.
                function addRow(record, index, allItems) {

                    // Search for duplicates
                    var foundItem = me.opArtGrid.store.findExact('id_art', record.data.id_art);
                    // if not found
                    if (foundItem == -1) {
                        me.opArtGrid.store.add(record);

                        // Call a sort dynamically
                        me.opArtGrid.store.sort('id_opart', 'DESC');

                        //Remove Record from the source
                        ddSource.grid.store.remove(record);
                        // Extract from deleting array
                        if (record.data.id_opart !== null) {
                            me.opArtGrid.removeFromDelete(record.data.id_opart);
                        };
                        // Recalc new opsumm
                        me.opArtGrid.setOpSumm();

                    }
                }

                // Loop through the selections
                Ext.each(ddSource.dragData.selections, addRow);
                return (true);
            }
        });


        // This will make sure we only drop to the view container
        var secondGridDropTargetEl = me.articles.getView().el.dom.childNodes[0].childNodes[1]

        var destGridDropTarget = new Ext.dd.DropTarget(secondGridDropTargetEl, {
            ddGroup: 'opArtDDGroup',
            copy: false,
            notifyDrop: function (ddSource, e, data) {

                // Generic function to add records.
                function addRow(record, index, allItems) {

                    // Search for duplicates
                    var foundItem = me.articles.store.findExact('id_art', record.data.id_art);
                    // if not found
                    if (foundItem == -1) {
                        me.articles.store.add(record);
                        // Call a sort dynamically
                        me.articles.store.sort('id_opart', 'ASC');

                        //Remove Record from the source
                        ddSource.grid.store.remove(record);
                        if (record.data.id_opart !== null) {
                            ddSource.grid.addOpartToDeleting(record.data.id_opart);
                        };
                        ddSource.grid.setOpSumm();

                    }
                }
                // Loop through the selections
                Ext.each(ddSource.dragData.selections, addRow);
                return (true);
            }
        });
    },
    loadOp: function (op) {
        this.opArtGrid.loadOp(op);
        this.articles.loadOp(op);
        this.buildDD();
    },
});

App.tab.operationPanel.opArticles = Ext.extend(Ext.grid.EditorGridPanel, {
    flex: 3,
    height: 250,
    id_op: 0,
    ddGroup: 'opArtDDGroup',
    enableDragDrop: true,
    stripeRows: true,
    title: 'Current opart',


    initComponent: function () {
        Ext.applyIf(this, {
            colModel: this.buildColModel(),
            store: this.buildStore(),
            // buttons: this.buildButtons(),
            bbar: this.buildToolBar(),
        });
        App.tab.operationPanel.opArticles.superclass.initComponent.call(this);
        // this.parent.loadOp({ id_op: 1 });
        this.on('afteredit', this.setOpSumm, this);

    },

    buildToolBar: function () {
        var me = this;
        var opToolbar = new Ext.Toolbar({
            height: 40,
            layout: 'border',
            ref: 'opArtBar',
            parent: me,
            items: [
                new Ext.Button({
                    text: 'Update opart',
                    // anchor: '50% 50%',
                    region: 'west',
                    disabled: true,
                    handler: function () {
                        console.log(me.forDelete);
                        me.sendNewOpArt();
                    }
                }),
                {

                    region: 'center',     // center region is required, no width/height specified
                    xtype: 'container',
                    // margins: '5 5 0 0'
                },
                new Ext.form.NumberField({
                    // anchor: '50% 50%',
                    region: 'east',
                    width: 50,
                    height: 50,
                    disabled: true,
                    fieldLabel: 'Operation summ',
                    margins: '5 5 50 50'
                })
            ]
        });
        return opToolbar
    },

    listeners: {
        afteredit: function (e) {
            this.getNewOpSumm(e);
        },
    },

    getNewOpSumm: function (e) {
        // TODO: есть чувство, что это костыль, но не могу понять - почему при перемещении запись получает null стор
        if (!e.record.store) {
            e.record.store = this.store;
        };
        var record = e.record.data;
        record.summ = record.price * record.quantity;
        e.record.json.modified = true;
        e.record.json.price = record.price;
        e.record.json.quantity = record.quantity;
        e.record.json.summ = record.summ;
        e.record.commit();
    },

    buildColModel: function () {
        var me = this;
        var opArticleColumns = new Ext.grid.ColumnModel({
            columns: [
                { header: 'id_opart', dataIndex: 'id_opart', id: 'id_opart', width: 70, hidden: true },
                { header: 'id_op', dataIndex: 'id_op', hideable: false },
                { header: 'id_art', dataIndex: 'id_art', hidden: true },
                { header: 'name', dataIndex: 'name' },
                // { header: 'price', dataIndex: 'price' },
                { header: 'price', dataIndex: 'op_price' },
                {
                    header: 'quantity', dataIndex: 'quantity', editor: {
                        xtype: 'numberfield',
                        allowBlank: false,
                    },
                },
                { header: 'summ', dataIndex: 'summ' },
            ],
            // plugins: this.buildPlugins(),
            defaults: {
                sortable: true,
                menuDisabled: false
            },

            defaultWidth: 150
        });
        return opArticleColumns;
    },

    buildFields: function () {
        var opArtFields = [
            { name: 'id_opart', mapping: 'id_opart' },
            { name: 'id_op', mapping: 'id_op' },
            { name: 'id_art', mapping: 'id_art' },
            { name: 'name', mapping: 'name' },
            { name: 'price', mapping: 'price' },
            { name: 'op_price', mapping: 'op_price' },
            { name: 'quantity', mapping: 'quantity' },
            { name: 'summ', mapping: 'summ' },
            { name: 'modified' }
        ];

        return opArtFields;
    },

    buildStore: function () {
        var proxy = new Ext.data.HttpProxy({
            api: {
                read: {
                    url: 'get_op_art',
                    method: 'GET'
                },
                update: {
                    url: 'edit_opart',
                    method: 'POST',
                }
            },
        });
        var operationStore = new Ext.data.JsonStore({
            fields: this.buildFields(),
            proxy: proxy,
            root: 'opart',
        });
        return operationStore;
    },
    // Удаляемые опарты
    forDelete: [],

    addOpartToDeleting: function (id_opart) {
        this.forDelete.push(id_opart);
    },

    removeFromDelete: function (id_opart) {
        this.forDelete.pop(id_opart);
    },

    clearFromDelete: function () {
        this.forDelete = [];
    },

    loadOp: function (op, opsumm) {
        var loadOption = op
        this.store.load({ params: loadOption });
        this.getBottomToolbar().items.items[0].setDisabled(false);
        // this.setOpSumm();
        this.id_op = op.id_op;
        this.clearFromDelete();
    },

    setOpSumm: function () {
        var s = this.store.data.items;
        var opsumm = 0;
        for (var i = 0; i < s.length; i++) {
            opsumm = opsumm + s[i].data.summ || 0;
        }
        this.getBottomToolbar().items.items[2].setValue(opsumm);
    },
    getJsonFromStore: function () {
        // TODO: Можно сделать более глобальную функцию и на вход давать стор
        var s = this.store.data.items;
        var jsonData = {
            id_op: this.id_op,
            opart: [],
            forDelete: this.forDelete
        };
        var opsumm = 0;
        for (var i = 0; i < s.length; i++) {
            jsonData.opart.push(s[i].json);
            // opsumm = opsumm + s[i].data.summ || 0;
        };
        return JSON.stringify(jsonData);
    },

    sendNewOpArt: function () {
        var me = this;
        var allData = me.getJsonFromStore();
        // this.store.update();
        Ext.Ajax.request({
            url: 'edit_opart',
            method: 'POST',
            params: allData,
            success: function (response, options) {
                // Ext.MessageBox.alert('Успех', 'Статус обновлен на : ' + newStatus.name);
                me.parent.loadOp({ id_op: me.id_op });
                me.parent.parent.operationGrid.loadOp();
                Ext.MessageBox.alert('sended');
            }
        });
    },
});

App.tab.operationPanel.articlesGrid = Ext.extend(Ext.grid.GridPanel, {
    flex: 1,
    height: 250,
    ddGroup: 'opArtDDGroup',
    enableDragDrop: true,
    stripeRows: true,
    title: 'Articles',
    collapsible: true,
    initComponent: function () {
        Ext.apply(this, {
            colModel: this.buildColModel(),
            store: this.buildStore()
        }),
            App.tab.operationPanel.articlesGrid.superclass.initComponent.call(this);
        // this.loadOp({ id_op: 1 });

    },

    buildColModel: function () {
        var opArticleColumns = new Ext.grid.ColumnModel({
            columns: [
                // { header: 'id_opart', dataIndex: 'id_opart', id: 'id_opart', width: 70, hidden: true },
                // { header: 'id_op', dataIndex: 'id_op', hidden: true },
                { header: 'id_art', dataIndex: 'id_art', hideable: false },
                { header: 'name', dataIndex: 'name' },
                { header: 'price', dataIndex: 'price' },
                // { header: 'op_price', dataIndex: 'op_price',hidden: true },
                // { header: 'quantity', dataIndex: 'quantity',hidden: true },
                // { header: 'summ', dataIndex: 'summ',hidden: true },
            ],
            defaults: {
                sortable: true,
                menuDisabled: false
            },

            defaultWidth: 150
        });
        return opArticleColumns;
    },

    buildFields: function () {
        var opArtFields = [
            { name: 'id_opart', mapping: 'id_opart' },
            { name: 'id_op', mapping: 'id_op' },
            { name: 'id_art', mapping: 'id_art' },
            { name: 'name', mapping: 'name' },
            { name: 'price', mapping: 'price' },
            { name: 'op_price', mapping: 'price' },
            { name: 'quantity', mapping: 'quantity' },
            { name: 'summ', mapping: 'summ' },
        ];

        return opArtFields;
    },

    buildStore: function () {
        var operationStore = new Ext.data.JsonStore({
            fields: this.buildFields(),
            proxy: new Ext.data.HttpProxy({
                api: {
                    read: {
                        url: 'get_articles',
                        method: 'GET'
                    }
                }
            }),
            root: 'articles',
        });
        return operationStore;
    },

    loadOp: function (op) {
        var loadOption = op
        this.store.load({ params: loadOption });
    },
});