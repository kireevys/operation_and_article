Ext.ns('App.tab.operation.models');

// Модел для операций
// Поля операций
// mapping с Моделью стобцов для грида

// var addOp = Ext.extend(Ext.Window, {
//     title: 'Add operation',
//     width: 300,
//     height: 400,
//     layout: 'fit',
//     initComponent: function () {
//         Ext.applyIf(this, {
//             items: this.buildItems(),
//         });

//         opToolbar.addOp.superclass.initComponent.call(this);

//     },
//     buildItems: function () {
//         var opForm = new opToolbar.addOp.opForm;
//         var winArr = [
//             opForm
//         ];
//         return winArr;
//     }

// });

// opToolbar.addOp.opForm = Ext.extend(Ext.form.FormPanel, {
//     style: {
//         "padding": "7px 0px 10px 0px"
//     },
//     labelAlign: 'right',
//     baseCls: "x-plain",
//     // labelWidth: 150,

//     initComponent: function () {
//         Ext.applyIf(this, {
//             items: this.buildItems(),
//         });

//         opToolbar.addOp.opForm.superclass.initComponent.call(this);
//     },

//     buildItems: function () {
//         panelItem = [{
//             xtype: 'textfield',
//             id: 'user-field',
//             fieldLabel: 'Username',
//             emptyText: 'Your login',
//             allowBlank: false,
//             padding: '10'
//         },
//         {
//             xtype: 'textfield',
//             id: 'password-field',
//             fieldLabel: 'Password',
//             emptyText: 'Some password',
//             inputType: 'password',
//             allowBlank: false,
//         },
//         {
//             xtype: 'button',
//             id: 'login-button',
//             text: 'login',
//             width: 50,
//             height: 25,
//             region: 'center',
//         }
//         ]
//         return panelItem
//     }

// });


// Модель Товаров в операции




// var opArtStore = new Ext.data.JsonStore({
//     url: 'get_op_art/',
//     fields: opArtFields,
//     storeId: 'opArtStore',
//     root: 'data',
//     // proxy: new Ext.data.HttpProxy(
//     //     fExt.Ajax.request({
//     //         url: this.url + 1,
//     //         method: 'GET',
//     //     })),
// });