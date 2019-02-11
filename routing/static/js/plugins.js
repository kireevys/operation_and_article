Ext.create('Ext.grid.Panel', {
    title: 'Пользователи',
    plugins: [{
        ptype: 'rowediting',
        clicksToEdit: 1
    }],
    selType: 'rowmodel',
    height: 250,
    width: 550,
    margin: 10,
    store: store,
    columns: [{
        xtype: 'rownumberer'
    }, {
        text: 'Имя',
        xtype: 'templatecolumn',
        flex: 1,
        dataIndex: 'name',
        tpl: '<b>{name} {surname}</b>'
    }, {
        header: 'Дата рождения',
        dataIndex: 'date',
        xtype: 'datecolumn',
        format: 'd/m/Y',
        flex: 1,
        editor: {
            xtype: 'datefield',
            allowBlank: false
        }
    }, {
        header: 'E-mail',
        dataIndex: 'email',
        flex: 1,
        editor: {
            xtype: 'textfield',
            allowBlank: false
        }
    }, {
        text: 'Женат/Замужем',
        xtype: 'booleancolumn',
        width: 90,
        dataIndex: 'married',
        trueText: 'Да',
        falseText: 'Нет',
        editor: {
            xtype: 'checkbox',
            checked: false
        }
    }, {
        xtype: 'actioncolumn',
        width: 40,
        items: [{
            icon: 'del.png',
            handler: function (grid, rowIndex, colIndex) {
                store.removeAt(rowIndex);
            }
        }]
    }],
    renderTo: Ext.getBody()
});