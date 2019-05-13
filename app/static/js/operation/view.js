// Create first Tab container
App.tab.operationPanel = Ext.extend(Ext.Panel, {
    title: 'Операции',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems()
        });
        App.tab.operationPanel.superclass.initComponent.call(this);
    },

    buildItems: function () {
        var op = new App.tab.operationPanel.operation({
            ref: 'operationGrid',
            parent: this
        });
        var opArt = new App.tab.operationPanel.opArtPanel({
            ref: 'opArtPanel',
            parent: this
        });
        mainItems = [
            op,
            opArt,
        ];
        return mainItems;
    },

});

App.tab.operationPanel.operation = Ext.extend(Ext.grid.GridPanel, {
    title: 'Операции',
    autoExpandColumn: 'contrName',
    flex: 3,
    stripeRows: true,
    columnLines: true,

    initComponent: function () {
        Ext.apply(this, {
            colModel: this.buildColModel(),
            tbar: this.buildToolBar().top,
            bbar: this.buildToolBar().bottom,
            store: this.buildStore(),
            statusStore: this.buildStatusStore(),
            plugins: this.buildFilters(),
        });
        App.tab.operationPanel.operation.superclass.initComponent.call(this);
        this.loadOp();
    },

    buildFilters: function () {
        var filters = new Ext.ux.grid.GridFilters({
            // encode and local configuration options defined previously for easier reuse
            // encode: true, // json encode the filter query
            local: true, // defaults to false (remote filtering)
            filters: [{
                type: 'numeric',
                dataIndex: 'id_op'
            }, {
                type: 'string',
                dataIndex: 'contr_name',
            }, {
                type: 'list',
                dataIndex: 'optype',
                options: [
                    'От поставщика',
                    'На гипермаркете',
                    'На у дома',
                    'На косметике',
                    'На аптеке',
                    'Складская',
                    'Приход',
                ],
                showMenu: true
            }, {
                type: 'date',
                dataIndex: 'opdate'
            }]
        });
        return filters;
    },

    buildColModel: function () {
        return operationColumns;
    },

    buildToolBar: function () {
        var me = this;
        var opToolbar = new Ext.Toolbar({
            height: 55,
            layout: 'anchor',
            buttons: [{
                xtype: 'button', // default for Toolbars, same as 'tbbutton'
                // text: 'Create operation',
                iconCls: 'action-add',
                anchor: '99.8% 95%',
                // TODO: не вылезают подсказки
                tooltip: 'Добавить операцию',
                handler: function () {
                    var adder = new addop({
                        ref: 'adder',
                        parent: me
                    });
                    adder.show();
                }
            }]
        });

        var operationControl = new Ext.Toolbar({
            height: 55,
            layout: 'hbox',
            ref: 'opControl',
            parent: me,
            buttons: [{
                    xtype: 'button', // default for Toolbars, same as 'tbbutton'
                    // text: 'Up status',
                    iconCls: 'action-up',
                    ref: 'up',
                    flex: 1,
                    height: 55,
                    parent: this,
                    disabled: true,
                    handler: function () {
                        this.parent.upStatus();
                    }
                },
                '-',
                {
                    xtype: 'button', // default for Toolbars, same as 'tbbutton'
                    //  text: 'Down status',
                    iconCls: 'action-down',
                    ref: 'down',
                    flex: 1,
                    height: 55,
                    parent: this,
                    disabled: true,
                    handler: function () {
                        this.parent.downStatus();
                    }
                },
                '-', {
                    xtype: 'button', // default for Toolbars, same as 'tbbutton'
                    // text: 'Delete op',
                    iconCls: 'action-trash',
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
        return opFields;
    },

    buildStore: function () {
        return operationStore;
    },

    buildStatusStore: function () {
        return opStatusStore;
    },

    loadOp: function () {
        this.store.load();
        this.statusStore.load();
    },

    setNewStatus: function (newStatus) {
        var me = this;
        var currensSelection = this.getSelectedOp();
        var id_op = currensSelection.id_op;
        Ext.Ajax.request({
            url: 'op_status',
            method: 'CHANGE',
            params: {
                id_op: id_op,
                id_status: newStatus.id
            },
            success: function (response, options) {
                Ext.MessageBox.alert('Успех', `Статус обновлен на : ${newStatus.name}`);
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
            url: 'operation',
            method: 'DELETE',
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
        } else {
            isDisable = false;
        }
        return isDisable;
    },
    checkDown: function (opRecord) {
        var isDisable = true;
        if (opRecord.get('id_status') <= 1) {
            isDisable = true;
        } else {
            isDisable = false;
        }
        return isDisable;
    },
    checkDelete: function (opRecord) {
        var isDisable = true;
        var currentStatus = opRecord.get('id_status');
        if (this.statusStore.data.map[currentStatus].data.on_delete == 0) {
            isDisable = true;
        } else {
            isDisable = false;
        }
        return isDisable;
    },

    listeners: {
        // Событие, считывающее id_op при нажатии строку
        // Далее id должен уходить на бэк, получать данные о товарах в операции
        // И грузить товары в стор нижнего грида
        cellclick(grid, rowIndex, columnIndex, e) {
            var record = grid.getStore().getAt(rowIndex);
            currentIdOp = record.get('id_op');
            // Запросим товары по операции в грид опТоваров
            this.parent.opArtPanel.loadOp({
                id_op: currentIdOp
            });
            this.activateButtons(record);
        },

    }
});

App.tab.operationPanel.opArtPanel = Ext.extend(Ext.Panel, {
    // title: 'Товары в операции',
    flex: 2,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    enableDragDrop: true,


    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems()
        });

        App.tab.operationPanel.opArtPanel.superclass.initComponent.call(this);
    },

    buildItems: function () {
        var opArt = new App.tab.operationPanel.opArticles({
            ref: 'opArtGrid',
            parent: this
        });
        var articles = new App.tab.operationPanel.articlesGrid({
            ref: 'articles',
            parent: this
        });

        mainItems = [
            opArt,
            articles,
        ];
        return mainItems;
    },


    buildDD: function () {
        var me = this;
        // Dd group
        // used to add records to the destination stores
        // var blankRecord = Ext.data.Record.create(fields);
        var firstGridDropTargetEl = me.opArtGrid.getView().el.dom.childNodes[0].childNodes[1];

        new Ext.dd.DropTarget(firstGridDropTargetEl, {
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

        new Ext.dd.DropTarget(secondGridDropTargetEl, {
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
                        record.phantom = false;
                        ddSource.grid.store.remove(record);
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
    // height: 250,
    id_op: 0,
    ddGroup: 'opArtDDGroup',
    enableDragDrop: true,
    stripeRows: true,
    title: 'Текущие товары в операции',
    autoExpandColumn: 'artName',


    initComponent: function () {
        Ext.applyIf(this, {
            colModel: this.buildColModel(),
            store: this.buildStore(),
            bbar: this.buildToolBar(),
            plugins: this.buildFilters(),
        });
        App.tab.operationPanel.opArticles.superclass.initComponent.call(this);
        this.on('afteredit', this.setOpSumm, this);
    },

    buildFilters: function () {
        var opArtFilters = new Ext.ux.grid.GridFilters({
            // encode and local configuration options defined previously for easier reuse
            // encode: true, // json encode the filter query
            local: true, // defaults to false (remote filtering)
            filters: [{
                type: 'numeric',
                dataIndex: 'id_art'
            }, {
                type: 'string',
                dataIndex: 'name'
            }]
        });
        return opArtFilters;
    },

    buildToolBar: function () {
        var me = this;
        var opToolbar = new Ext.Toolbar({
            height: 55,
            layout: 'border',
            ref: 'opArtBar',
            parent: me,
            items: [
                new Ext.Button({
                    // text: 'Update opart',
                    // anchor: '50% 50%',
                    iconCls: 'action-save',
                    region: 'west',
                    disabled: true,
                    handler: function () {
                        console.log(me.forDelete);
                        me.sendNewOpArt();
                    }
                }),
                {

                    region: 'center', // center region is required, no width/height specified
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
        e.record.set('summ', (record.op_price || record.price) * record.quantity);
        e.record.set('modified', true);
        e.record.set('op_price', record.op_price || record.price);
        e.record.set('quantity', record.quantity);
        e.record.set('id_op', e.record.id_op || this.id_op);
        // e.record.commit();
    },

    buildColModel: function () {
        return opArticleColumns;
    },

    buildStore: function () {
        opArtStore.parent = this;
        return opArtStore;
    },

    loadOp: function (op, opsumm) {
        var loadOption = op
        this.store.load({
            params: loadOption
        });
        this.getBottomToolbar().items.items[0].setDisabled(false);
        // this.setOpSumm();
        this.id_op = op.id_op;
    },

    setOpSumm: function () {
        var s = this.store.data.items;
        var opsumm = 0;
        for (var i = 0; i < s.length; i++) {
            opsumm = opsumm + s[i].data.summ || 0;
        }
        this.getBottomToolbar().items.items[2].setValue(opsumm);
    },

    sendNewOpArt: function () {
        this.store.save();
    },
});


App.tab.operationPanel.articlesGrid = Ext.extend(Ext.grid.GridPanel, {
    flex: 1,
    // height: 350,
    ddGroup: 'opArtDDGroup',
    enableDragDrop: true,
    stripeRows: true,
    title: 'Товары к добавлению',
    collapsible: true,

    autoExpandColumn: 'artName',

    initComponent: function () {
        Ext.apply(this, {
                colModel: this.buildColModel(),
                store: this.buildStore(),
                plugins: this.buildFilters(),
            }),
            App.tab.operationPanel.articlesGrid.superclass.initComponent.call(this);
        // this.loadOp({ id_op: 1 });

    },

    buildColModel: function () {
        return articleColumns;
    },

    buildFilters: function () {
        return new Ext.ux.grid.GridFilters({
            // encode and local configuration options defined previously for easier reuse
            // encode: true, // json encode the filter query
            local: true, // defaults to false (remote filtering)
            filters: [{
                type: 'numeric',
                dataIndex: 'id_art'
            }, {
                type: 'string',
                dataIndex: 'name'
            }]
        });
    },

    buildStore: function () {
        return articlesStore;
    },

    loadOp: function (op) {
        var loadOption = op
        this.store.load({
            params: loadOption
        });
    },
});