

// //Start example
// var myObj = {
//     param1: 'something',
//     obj1: {
//         a: 'something in obj1'
//     }

// }
// Ext.Ajax.request({
//     url: 'test',
//     method: 'POST',
//     params: {
//         ajax_req: Ext.util.JSON.encode(myObj)
//     },
//     success: function (transport) {
//         // do something
//     },
//     failure: function (transport) {
//         // alert("Error: " - transport.responseText);
//     }
// });
// //End example

// Объявление полей для реквеста с бэка
// mapping с Моделью стобцов для грида
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
// Модель столбцов для грида 
// dataIndex - то, на что смотрит маппер полей при наполнении грида
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

//Внешний объект данных, заполняется в реквесте
var operationStore = new Ext.data.JsonStore({
    fields: opFields,
    root: 'records'
});


var opArtFields = [
    { name: 'id_opart', mapping: 'id_opart' },
    { name: 'id_op', mapping: 'id_op' },
    { name: 'id_art', mapping: 'id_art' },
    { name: 'price', mapping: 'price' },
    { name: 'quantity', mapping: 'quantity' },
    { name: 'summ', mapping: 'summ' },
];

var operationsArticleColumns = new Ext.grid.ColumnModel({
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


//Внешний объект данных, заполняется в реквесте
opArtStore = Ext.extend(Ext.data.JsonStore, {
    url: '/get_op_art/1',
    method: '',
    constructor: function () {
        Ext.apply( {
            proxy: this.buildProxy(),
        });

        opArtStore.superclass.constructor.call(this);
    },

    load: function () {
        opArtStore.superclass.call(this, options);
    },
    buildProxy: function () {
        var me = this;

        return new Ext.data.HttpProxy(me.buildConnection());
    },

    buildConnection: function () {
        var me = this;
        return new Ext.data.Connection({
            url: me.url,
            method: 'GET',
        });
    }
});

// Выполняем запрос операций к серверу
// Наверное, когда их будет очень много их не стоит хранить на фронте
// И запрашивать по явному требованию (Например - переход на вкладку)
// Но пока - вот так
// TODO: Что то можно сделать с прокси
Ext.Ajax.request({
    url: 'getop',
    success: function (response, options) {
        // Преобразуем ответ к требуемому JsonStore формату
        var test = Ext.decode(response.responseText);
        var jsonDate = { records: test['data'] }
        // Создание инкапсулированного объекта данных
        var store = new Ext.data.JsonStore({
            fields: opFields,
            data: jsonDate,
            root: 'records'
        })
        // Отдадим данные во внешний объект
        operationStore.data = store.data
    }
});

var currentIdOp;


