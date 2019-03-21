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
        { header: 'Идентификатор', dataIndex: 'id_contr', id: 'id_contr', width: 75, hideable: false },
        { header: 'Имя', dataIndex: 'name', width: 150, editor: new textFieldEditor() },
        { header: 'Код', dataIndex: 'level', width: 75, },
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
    { name: 'level', mapping: 'level' },
    { name: 'inn', mapping: 'inn' },
    { name: 'address', mapping: 'address' },
];