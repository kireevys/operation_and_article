var textFieldEditor = Ext.extend(Ext.form.TextField, {
    allowBlank: false,
});

var numericFieldEditor = Ext.extend(Ext.form.NumberField, {
    allowBlank: false,
    minLength: 10,
    maxLength: 10,
    allowNegative: false,
    allowDecimals: false,
    invalidText: 'ИНН содержит 10 чисел'
});

var contractorsColumn = new Ext.grid.ColumnModel({
    columns: [
        { header: 'Идентификатор', dataIndex: 'id_contr', id: 'id_contr', width: 100, hideable: false },
        { header: 'Имя', dataIndex: 'name', width: 150, id: 'contrName', editor: new textFieldEditor() },
        { header: 'Код', dataIndex: 'code', width: 75, },
        { header: 'ИНН', dataIndex: 'inn', width: 150, editor: new numericFieldEditor() },
        { header: 'Адрес', dataIndex: 'address', width: 175, editor: new textFieldEditor() },
    ],
    defaults: {
        sortable: true,
        menuDisabled: false
    },

    defaultWidth: 80
});

var contrFields = [
    { name: 'id_contr', mapping: 'id_contr' },
    { name: 'name', mapping: 'name' },
    { name: 'code', mapping: 'code' },
    { name: 'inn', mapping: 'inn' },
    { name: 'address', mapping: 'address' },
];

var articleFields = [
    { name: 'id_art', mapping: 'id_art' },
    { name: 'name', mapping: 'name' },
    { name: 'code', mapping: 'code' },
    { name: 'price', mapping: 'price' },
    { name: 'unit', mapping: 'unit' },
];

var articleColumn = new Ext.grid.ColumnModel({
    columns: [
        { header: 'id_art', dataIndex: 'id_art', id: 'id_art', width: 100, hideable: false },
        { header: 'name', dataIndex: 'name', width: 150, id: 'artName', editor: new textFieldEditor() },
        { header: 'code', dataIndex: 'code', width: 75, },
        { header: 'price', dataIndex: 'price', width: 150, editor: new numericFieldEditor() },
        { header: 'unit', dataIndex: 'unit', width: 175},
    ],
    defaults: {
        sortable: true,
        menuDisabled: false
    },

    defaultWidth: 80
});