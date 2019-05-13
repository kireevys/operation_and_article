var treeWs = Ext.extend(Ext.tree.TreePanel, {
    title: 'Warehouse',
    autoScroll: true,
    collapsible: true,
    height: 150,
    useArrows: true,
    rootVisible: false,
    id: 'wsTree',
    dataUrl: 'warehouse',
    requestMethod: 'GET',

    root: {
        nodeType: 'async',
        text: 'warehouse',
        id: 'warehouse',
        draggable: false
    },

    initComponent: function () {
        Ext.apply({
            bbar: this.buildToolBar()
        });

        treeWs.superclass.initComponent.call(this);

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
                return [wsField, ]
            },
        });
        return new bar({
            ref: 'treeTb',
            parent: this
        });
    },
});

// Operations
var operationColumns = new Ext.grid.ColumnModel({
    columns: [{
            header: 'ИД операции',
            dataIndex: 'id_op',
            id: 'id_op',
            width: 50,
            hideable: false
        },
        {
            header: 'Дата операции',
            dataIndex: 'opdate',
            type: 'date',
            renderer: Ext.util.Format.dateRenderer('d-m-Y'),
        },
        {
            header: 'Код',
            dataIndex: 'code'
        },
        {
            header: 'Код статуса',
            dataIndex: 'id_status',
            hidden: true
        },
        {
            header: 'Статус',
            dataIndex: 'status',
            width: 150
        },
        {
            header: 'Код типа',
            dataIndex: 'id_type',
            hidden: true,
        },
        {
            header: 'Тип операции',
            dataIndex: 'optype',
            width: 150
        },
        {
            header: 'Сумма по операции',
            dataIndex: 'opsumm'
        },
        {
            header: 'На ГМ',
            dataIndex: 'gm_res'
        },
        {
            header: 'Количество документов',
            dataIndex: 'doccount'
        },
        {
            header: 'Номер стеллажа РЦ',
            dataIndex: 'id_rack'
        },
        {
            header: 'ИД КА',
            dataIndex: 'id_contr',
            hidden: true
        },
        {
            header: 'Имя поставщика',
            dataIndex: 'contr_name',
            id: 'contrName'
        },
        {
            header: 'ИНН поставщика',
            dataIndex: 'inn',
            hidden: true
        },
        {
            header: 'ИД МХ',
            dataIndex: 'id_ws',
            hidden: true
        },
        {
            header: 'Название МХ',
            dataIndex: 'ws_name'
        },

    ],
    defaults: {
        sortable: true,
        menuDisabled: false
    },

    defaultWidth: 80
});

var opFields = [{
        name: 'id_op',
        mapping: 'id_op'
    },
    {
        name: 'opdate',
        mapping: 'opdate',
        type: 'date'
    },
    {
        name: 'code',
        mapping: 'code'
    },
    {
        name: 'id_status',
        mapping: 'id_status'
    },
    {
        name: 'status',
        mapping: 'status'
    },
    {
        name: 'optype',
        mapping: 'optype'
    },
    {
        name: 'id_type',
        mapping: 'id_type'
    },
    {
        name: 'id_ws',
        mapping: 'id_ws'
    },
    {
        name: 'id_contr',
        mapping: 'id_contr'
    },
    {
        name: 'opsumm',
        mapping: 'opsumm'
    },
    {
        name: 'gm_res',
        mapping: 'gm_res'
    },
    {
        name: 'doccount',
        mapping: 'doccount'
    },
    {
        name: 'id_rack',
        mapping: 'id_rack'
    },
    {
        name: 'contr_name',
        mapping: 'contr_name'
    },
    {
        name: 'inn',
        mapping: 'inn'
    },
    {
        name: 'ws_name',
        mapping: 'ws_name'
    },
];

var operationStore = new Ext.data.JsonStore({
    fields: opFields,
    proxy: new Ext.data.HttpProxy({
        url: 'operation',
        method: 'GET'
    }),
    root: 'operation',
});

// Statuses
var statusField = [{
        name: 'id_status',
        mapping: 'id_status'
    },
    {
        name: 'name',
        mapping: 'name'
    },
    {
        name: 'stat_order',
        mapping: 'stat_order'
    },
    {
        name: 'on_delete',
        mapping: 'on_delete'
    }
];

var opStatusStore = new Ext.data.JsonStore({
    fields: statusField,
    idProperty: 'id_status',
    ref: 'opStatusStore',
    proxy: new Ext.data.HttpProxy({
        api: {
            read: {
                url: 'op_status',
                method: 'GET'
            }
        }
    }),
    root: 'opstatus'
});

var opArticleColumns = new Ext.grid.ColumnModel({
    columns: [{
            header: 'ИД в базе',
            dataIndex: 'id_opart',
            id: 'id_opart',
            width: 70,
            hidden: true
        },
        {
            header: 'Идентификатор операции',
            dataIndex: 'id_op',
            hideable: false
        },
        {
            header: 'ИД товара',
            dataIndex: 'id_art',
            hidden: true
        },
        {
            header: 'Название ТП',
            dataIndex: 'name',
            id: 'artName'
        },
        // { header: 'price', dataIndex: 'price' },
        {
            header: 'Цена',
            dataIndex: 'op_price'
        },
        {
            header: 'Текущая Цена',
            dataIndex: 'price',
            hidden: true,
        },
        {
            header: 'Количество',
            dataIndex: 'quantity',
            editor: {
                xtype: 'numberfield',
                allowBlank: false,
                allowNegative: false,
                minValue: 1,
            },
        },
        {
            header: 'Сумма по операции',
            dataIndex: 'summ'
        },
    ],
    // plugins: this.buildPlugins(),
    defaults: {
        sortable: true,
        menuDisabled: false
    },

    defaultWidth: 150
});

// OpArt
var opArtFields = [{
        name: 'id_opart',
        mapping: 'id_opart'
    },
    {
        name: 'id_op',
        mapping: 'id_op'
    },
    {
        name: 'id_art',
        mapping: 'id_art'
    },
    {
        name: 'name',
        mapping: 'name'
    },
    {
        name: 'price',
        mapping: 'price'
    },
    {
        name: 'op_price',
        mapping: 'op_price'
    },
    {
        name: 'quantity',
        mapping: 'quantity'
    },
    {
        name: 'summ',
        mapping: 'summ'
    },
    {
        name: 'modified'
    }
];

var opArtStore = new Ext.data.JsonStore({
    autoSave: false,
    autoLoad: false,
    proxy: new Ext.data.HttpProxy({
        api: {
            read: {
                url: 'op_art',
                method: 'GET'
            },
            destroy: {
                url: 'op_art',
                method: 'DELETE',
            },
            create: {
                url: 'op_art',
                method: 'EDIT',
            },
            update: {
                url: 'op_art',
                method: 'EDIT',
            },
        },
    }),

    listeners: {
        save: function () {
            this.parent.store.load({
                params: {
                    id_op: this.parent.id_op
                }
            });
        }
    },

    writer: new Ext.data.JsonWriter({
        encode: true,
        encodeDelete: false,
        listful: true,
        writeAllFields: true
    }),
    root: 'opart',
    fields: opArtFields,
    idProperty: 'id_opart',
});

// Articles
var articleColumns = new Ext.grid.ColumnModel({
    columns: [
        // { header: 'id_opart', dataIndex: 'id_opart', id: 'id_opart', width: 70, hidden: true },
        // { header: 'id_op', dataIndex: 'id_op', hidden: true },
        {
            header: 'ИД ТП',
            dataIndex: 'id_art',
            hideable: false
        },
        {
            header: 'Название товара',
            dataIndex: 'name',
            id: 'artName'
        },
        {
            header: 'Цена',
            dataIndex: 'price'
        },
        // { header: 'Цена в операции', dataIndex: 'op_price', hidden: false },
        // { header: 'quantity', dataIndex: 'quantity',hidden: true },
        // { header: 'summ', dataIndex: 'summ',hidden: true },
    ],
    defaults: {
        sortable: true,
        menuDisabled: false
    },

    defaultWidth: 75
});

var articlesStore = new Ext.data.JsonStore({
    fields: opArtFields,
    proxy: new Ext.data.HttpProxy({
        api: {
            read: {
                url: 'article',
                method: 'GETARTOP'
            }
        }
    }),
    root: 'articles',
});

var optypeStore = new Ext.data.JsonStore({
    fields: [
        'id_type',
        'name',
    ],
    proxy: new Ext.data.HttpProxy({
        api: {
            read: {
                url: 'optypes',
                method: 'GET'
            }
        }
    }),
    root: 'optype',
});