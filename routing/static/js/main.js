Ext.ns('App.main');
Ext.ns('App.main.panel');

App.main = Ext.extend(Ext.Viewport, {
    title: 'Operation and article',
    maximized: true,
    closable: false,
    layout: 'fit',

    initComponent: function () {
        Ext.applyIf(this, {
            items: this.buildItems()
        });

        App.main.superclass.initComponent.call(this);
    },

    buildItems: function () {
        panels = [

            new App.main.panel({
                ref: 'panel',
                parent: this
            })
        ]
        return panels;
    },
});

App.main.panel = Ext.extend(Ext.TabPanel, {
    activeTab: 0,

    initComponent: function () {
        Ext.applyIf(this, {
            items: this.buildItems()
        });

        App.main.panel.superclass.initComponent.call(this);
    },

    buildItems: function () {
        panelItem = [

            new App.main.panel.opGrid({
                ref: 'opGrid',
                parent: this
            })
        ]
        return panelItem;
    }

});

var myData = {
    records: [
        { name: "Rec 0", column1: "0", column2: "0" },
        { name: "Rec 1", column1: "1", column2: "1" },
        { name: "Rec 2", column1: "2", column2: "2" },
        { name: "Rec 3", column1: "3", column2: "3" },
        { name: "Rec 4", column1: "4", column2: "4" },
        { name: "Rec 5", column1: "5", column2: "5" },
        { name: "Rec 6", column1: "6", column2: "6" },
        { name: "Rec 7", column1: "7", column2: "7" },
        { name: "Rec 8", column1: "8", column2: "8" },
        { name: "Rec 9", column1: "9", column2: "9" }
    ]
};

var fields = [
    { name: 'name', mapping: 'name' },
    { name: 'column1', mapping: 'column1' },
    { name: 'column2', mapping: 'column2' }
];

var firstGridStore = new Ext.data.JsonStore({
    fields: fields,
    data: myData,
    root: 'records'
});

var col = new Ext.grid.ColumnModel({
    columns: [
        { id: 'id_op_column', width: 70, hideable: false, header: "id_op", dataIndex: 'name' },
        { header: "opnumber", dataIndex: 'column1' },
        { header: "test", dataIndex: 'column2' }
    ],
    defaults: {
        sortable: true,
        menuDisabled: false
    },

    defaultWidth: 150
});

App.main.panel.opGrid = Ext.extend(Ext.grid.GridPanel, {
    ddGroup: 'secondGridDDGroup',
    store: firstGridStore,
    colModel: col,
    title: 'test',
    forceFit: true
});

Ext.onReady(function () {
    var main = new App.main();
    main.show();
});