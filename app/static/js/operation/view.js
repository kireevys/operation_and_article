// Create first Tab container
App.tab.operationPanel = Ext.extend(Ext.Panel, {
    title: 'Операции',
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

var filters = new Ext.ux.grid.GridFilters({
    // encode and local configuration options defined previously for easier reuse
    // encode: true, // json encode the filter query
    local: true,   // defaults to false (remote filtering)
    filters: [{
        type: 'numeric',
        dataIndex: 'id_op'
    }, {
        type: 'string',
        dataIndex: 'contr_name',
    }, {
        type: 'list',
        dataIndex: 'optype',
        options: ['От поставщика',
            'На гипермаркете',
            'На у дома',
            'На косметике',
            'На аптеке',
            'Складская',
            'Приход',],
        showMenu: true
    }, {
        type: 'date',
        dataIndex: 'opdate'
    }
    ]
});

App.tab.operationPanel.operation = Ext.extend(Ext.grid.GridPanel, {
    title: 'Операции',
    autoExpandColumn: 'contrName',
    flex: 3,
    stripeRows: true,
    columnLines: true,
    plugins: filters,

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
                { header: 'ИД операции', dataIndex: 'id_op', id: 'id_op', width: 50, hideable: false },
                { header: 'Дата операции', dataIndex: 'opdate', type: 'date', renderer: Ext.util.Format.dateRenderer('d-m-Y'), },
                { header: 'Код', dataIndex: 'code' },
                { header: 'Код статуса', dataIndex: 'id_status', hidden: true },
                { header: 'Статус', dataIndex: 'status', width: 150 },
                { header: 'Код типа', dataIndex: 'id_type', hidden: true, },
                { header: 'Тип операции', dataIndex: 'optype', width: 150 },
                { header: 'Сумма по операции', dataIndex: 'opsumm' },
                { header: 'На ГМ', dataIndex: 'gm_res' },
                { header: 'Количество документов', dataIndex: 'doccount' },
                { header: 'Номер стеллажа РЦ', dataIndex: 'id_rack' },
                { header: 'ИД КА', dataIndex: 'id_contr', hidden: true },
                { header: 'Имя поставщика', dataIndex: 'contr_name', id: 'contrName' },
                { header: 'ИНН поставщика', dataIndex: 'inn', hidden: true },
                { header: 'ИД МХ', dataIndex: 'id_ws', hidden: true },
                { header: 'Название МХ', dataIndex: 'ws_name' },

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
            height: 55,
            layout: 'anchor',
            buttons: [
                {
                    xtype: 'button', // default for Toolbars, same as 'tbbutton'
                    // text: 'Create operation',
                    iconCls: 'action-add',
                    anchor: '99.8% 95%',
                    // TODO: не вылезают подсказки
                    tooltip: 'Добавить операцию',
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
            height: 55,
            layout: 'hbox',
            ref: 'opControl',
            parent: me,
            buttons: [
                {
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
                '-'
                ,
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
                '-'
                , {
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
        var opFields = [
            { name: 'id_op', mapping: 'id_op' },
            { name: 'opdate', mapping: 'opdate', type: 'date' },
            { name: 'code', mapping: 'code' },
            { name: 'id_status', mapping: 'id_status' },
            { name: 'status', mapping: 'status' },
            { name: 'optype', mapping: 'optype' },
            { name: 'id_type', mapping: 'id_type' },
            { name: 'id_ws', mapping: 'id_ws' },
            { name: 'id_contr', mapping: 'id_contr' },
            { name: 'opsumm', mapping: 'opsumm' },
            { name: 'gm_res', mapping: 'gm_res' },
            { name: 'doccount', mapping: 'doccount' },
            { name: 'id_rack', mapping: 'id_rack' },
            { name: 'contr_name', mapping: 'contr_name' },
            { name: 'inn', mapping: 'inn' },
            { name: 'ws_name', mapping: 'ws_name' },


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
            root: 'operation',
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
                // TODO: Перезагружать гриды товаров
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

App.tab.operationPanel.opArtPanel = Ext.extend(Ext.Panel, {
    // title: 'Товары в операции',
    flex: 2,
    layout: { type: 'hbox', align: 'stretch' },
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

var opArtFilters = new Ext.ux.grid.GridFilters({
    // encode and local configuration options defined previously for easier reuse
    // encode: true, // json encode the filter query
    local: true,   // defaults to false (remote filtering)
    filters: [{
        type: 'numeric',
        dataIndex: 'id_art'
    }, {
        type: 'string',
        dataIndex: 'name'
    }
    ]
});

App.tab.operationPanel.opArticles = Ext.extend(Ext.grid.EditorGridPanel, {
    flex: 3,
    // height: 250,
    id_op: 0,
    ddGroup: 'opArtDDGroup',
    enableDragDrop: true,
    stripeRows: true,
    title: 'Текущие товары в операции',
    plugins: opArtFilters,
    autoExpandColumn: 'artName',


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
                { header: 'ИД в базе', dataIndex: 'id_opart', id: 'id_opart', width: 70, hidden: true },
                { header: 'Идентификатор операции', dataIndex: 'id_op', hideable: false },
                { header: 'ИД товара', dataIndex: 'id_art', hidden: true },
                { header: 'Название ТП', dataIndex: 'name', id: 'artName' },
                // { header: 'price', dataIndex: 'price' },
                { header: 'Цена', dataIndex: 'op_price' },
                {
                    header: 'Количество', dataIndex: 'quantity', editor: {
                        xtype: 'numberfield',
                        allowBlank: false,
                        allowNegative: false,
                        minValue: 1,
                    },
                },
                { header: 'Сумма по операции', dataIndex: 'summ' },
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

var artFilters = new Ext.ux.grid.GridFilters({
    // encode and local configuration options defined previously for easier reuse
    // encode: true, // json encode the filter query
    local: true,   // defaults to false (remote filtering)
    filters: [{
        type: 'numeric',
        dataIndex: 'id_art'
    }, {
        type: 'string',
        dataIndex: 'name'
    }
    ]
});

App.tab.operationPanel.articlesGrid = Ext.extend(Ext.grid.GridPanel, {
    flex: 1,
    // height: 350,
    ddGroup: 'opArtDDGroup',
    enableDragDrop: true,
    stripeRows: true,
    title: 'Товары к добавлению',
    collapsible: true,
    plugins: artFilters,
    autoExpandColumn: 'artName',

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
                { header: 'Идентификатор ТП', dataIndex: 'id_art', hideable: false },
                { header: 'Название товара', dataIndex: 'name', id: 'artName' },
                { header: 'Цена', dataIndex: 'price' },
                // { header: 'op_price', dataIndex: 'op_price',hidden: true },
                // { header: 'quantity', dataIndex: 'quantity',hidden: true },
                // { header: 'summ', dataIndex: 'summ',hidden: true },
            ],
            defaults: {
                sortable: true,
                menuDisabled: false
            },

            defaultWidth: 75
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