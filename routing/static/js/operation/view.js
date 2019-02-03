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
        var opArt = new App.tab.operationPanel.opArticles({ ref: 'opArtGrid', parent: this });
        mainItems = [
            op,
            opArt,
        ];
        return mainItems;
    },
});

App.tab.operationPanel.operation = Ext.extend(Ext.grid.GridPanel, {
    title: 'Operations',
    flex: 1,

    initComponent: function () {
        Ext.apply(this, {
            colModel: this.buildColModel(),
            tbar: this.buildToolBar(),
            store: this.buildStore(),
        }),
            this.store.load();
        App.tab.operationPanel.operation.superclass.initComponent.call(this);


    },

    buildColModel: function () {
        var operationColumns = new Ext.grid.ColumnModel({
            columns: [
                { header: "id_op", dataIndex: 'id_op', id: 'id_op', width: 40, hideable: false },
                { header: 'code', dataIndex: 'code' },
                { header: 'doccount', dataIndex: 'doccount' },
                { header: 'gm_res', dataIndex: 'gm_res' },
                { header: 'id_contr', dataIndex: 'id_contr' },
                { header: 'id_rack', dataIndex: 'id_rack' },
                { header: 'id_status', dataIndex: 'id_status' },
                { header: 'id_ws', dataIndex: 'id_ws' },
                { header: 'opdate', dataIndex: 'opdate' },
                { header: 'opsumm', dataIndex: 'opsumm' },
                { header: 'optype', dataIndex: 'optype' },
            ],
            defaults: {
                sortable: true,
                menuDisabled: false
            },

            defaultWidth: 70
        });
        return operationColumns;
    },

    buildToolBar: function () {
        var opToolbar = new Ext.Toolbar({
            height: 40,
            layout: 'anchor',
            buttons: [
                {
                    xtype: 'button', // default for Toolbars, same as 'tbbutton'
                    text: 'Create operation',
                    anchor: '100% 95%',
                    handler: function () {
                        var adder = new addop();
                        adder.show();
                    }
                }
            ]
        });
        return opToolbar;
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

    listeners: {
        // Событие, считывающее id_op при нажатии строку
        // Далее id должен уходить на бэк, получать данне о товарах в операции
        // И грузить товары в стор нижнего грида
        cellclick(grid, rowIndex, columnIndex, e) {
            var record = grid.getStore().getAt(rowIndex);
            currentIdOp = record.get('id_op');
            // Запросим товары по операции в грид опТоваров
            this.parent.opArtGrid.loadOp({ id_op: currentIdOp });
        }
    }
});

addop = Ext.extend(Ext.Window, {
    title: 'creating of operation',
    modal: true,
    width: 500,
    height: 350,
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
    initComponent: function () {
        Ext.applyIf(this, {
            items: this.buildItems(),
            buttons: this.buildButtons()
        });
        addOpForm.superclass.initComponent.call(this);
    },

    buildItems: function () {
        var testData = [
            [1, 'JavaScript'],
            [2, 'PHP'],
            [3, 'RUBY']
        ];

        var comboOptypes = Ext.extend(Ext.form.ComboBox, {
            typeAhead: true,
            triggerAction: 'all',
            // lazyRender: true,
            mode: 'local',
            valueField: 'id_type',
            displayField: 'name',
            fieldLabel: 'Тип операции',

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

        var ws_tree = new Ext.tree.TreePanel({
            title: 'Warehouse',
            autoScroll: true,
            height: 150,
            loader: new Ext.tree.TreeLoader({ url: 'get_warehouses', method: 'GET' }),
            root: {
                text: 'Страны СНГ',
                expanded: false,
            }
            //     children:
            //         [{
            //             text: "Россия",
            //             children: [{
            //                 text: "Москва",
            //                 leaf: true
            //             }, {
            //                 text: "Санкт-Петербург",
            //                 leaf: true
            //             }, {
            //                 text: "Волгоград",
            //                 leaf: true
            //             }],
            //             leaf: false,
            //             "expanded": true
            //         },
            //         {
            //             text: "Украина",
            //             leaf: false
            //         },
            //         {
            //             text: "Белоруссия"
            //         }]

        })

        var itemArr = [
            new comboOptypes({
                ref: 'comboOptypes',
                parent: this
            }),
            ws_tree,
        ];
        return itemArr;
    },

    buildButtons: function () {
        var buttonsArr = [
            {
                xtype: 'button',
                id: 'apply',
                text: 'done',
                disabled: true
            }
        ];
        return buttonsArr;
    }
});

App.tab.operationPanel.opArticles = Ext.extend(Ext.grid.GridPanel, {
    title: 'Articles in operation',
    flex: 2,

    initComponent: function () {
        Ext.apply(this, {
            colModel: this.buildColModel(),
            store: this.buildStore()
        }),
            App.tab.operationPanel.opArticles.superclass.initComponent.call(this);
        this.loadOp({ id_op: 1 });

    },

    buildColModel: function () {
        var opArticleColumns = new Ext.grid.ColumnModel({
            columns: [
                { header: 'id_opart', dataIndex: 'id_opart', id: 'id_opart', width: 70, hideable: false },
                { header: 'id_op', dataIndex: 'id_op' },
                { header: 'id_art', dataIndex: 'id_art' },
                { header: 'price', dataIndex: 'price' },
                { header: 'quantity', dataIndex: 'quantity' },
                { header: 'summ', dataIndex: 'id_rack' }
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
            { name: 'price', mapping: 'price' },
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
                        url: 'get_op_art',
                        method: 'GET'
                    }
                }
            }),

            onException: function (proxy, type, action, options, response, args) {
                var responseJson = {};

                try {
                    responseJson = Ext.decode(response.responseText);
                } catch (e) {
                    ressponseJson = {
                        error: { message: responseText }
                    };
                }

                errorMessageRpc(response, responseJson);
            },
            root: 'opart',
        });
        return operationStore;
    },

    loadOp: function (op) {
        var loadOption = op
        this.store.load({ params: loadOption });
    },
});