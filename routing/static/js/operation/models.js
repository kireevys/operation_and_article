Ext.ns('App.tab.operation.models');

// Модел для операций
// Поля операций
// mapping с Моделью стобцов для грида
operationsFields = [
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

// Operation columns model
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

// Store
var operationStore = new Ext.data.JsonStore({
    fields: operationsFields,

    proxy: new Ext.data.HttpProxy({
        url: 'getop',
        method: 'GET'
    }),
    autoLoad: true,
    root: 'data'
});




var opToolbar = new Ext.Toolbar({
    height: 40,
    layout: 'anchor',
    buttons: [
        {
            // xtype: 'button', // default for Toolbars, same as 'tbbutton'
            text: 'Add operation',
            anchor: '100% 95%',
            handler: function () {
                var adder = new opToolbar.addOp({
                    ref: 'addOperation',
                    parent: this
                });
                adder.show();
            }
        }
    ]
});

opToolbar.addOp = Ext.extend(Ext.Window, {
    title: 'Add operation',
    width: 300,
    height: 400,
    layout: 'fit',
    initComponent: function () {
        Ext.applyIf(this, {
            items: this.buildItems(),
        });

        opToolbar.addOp.superclass.initComponent.call(this);

    },
    buildItems: function () {
        var opForm = new opToolbar.addOp.opForm;
        var winArr = [
            opForm
        ];
        return winArr;
    }

});

opToolbar.addOp.opForm = Ext.extend(Ext.form.FormPanel, {
    style: {
        "padding": "7px 0px 10px 0px"
    },
    labelAlign: 'right',
    baseCls: "x-plain",
    // labelWidth: 150,

    initComponent: function () {
        Ext.applyIf(this, {
            items: this.buildItems(),
        });

        opToolbar.addOp.opForm.superclass.initComponent.call(this);
    },

    buildItems: function () {
        panelItem = [{
            xtype: 'textfield',
            id: 'user-field',
            fieldLabel: 'Username',
            emptyText: 'Your login',
            allowBlank: false,
            padding: '10'
        },
        {
            xtype: 'textfield',
            id: 'password-field',
            fieldLabel: 'Password',
            emptyText: 'Some password',
            inputType: 'password',
            allowBlank: false,
        },
        {
            xtype: 'button',
            id: 'login-button',
            text: 'login',
            width: 50,
            height: 25,
            region: 'center',
        }
        ]
        return panelItem
    }

});


// Модель Товаров в операции
var opArtFields = [
    { name: 'id_opart', mapping: 'id_opart' },
    { name: 'id_op', mapping: 'id_op' },
    { name: 'id_art', mapping: 'id_art' },
    { name: 'price', mapping: 'price' },
    { name: 'quantity', mapping: 'quantity' },
    { name: 'summ', mapping: 'summ' },
];

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


var opArtStore = new Ext.data.JsonStore({
    url: 'get_op_art/',
    fields: opArtFields,
    storeId: 'opArtStore',
    root: 'data',
    // proxy: new Ext.data.HttpProxy(
    //     fExt.Ajax.request({
    //         url: this.url + 1,
    //         method: 'GET',
    //     })),
});