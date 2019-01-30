Ext.onReady(function () {
    var grid = new Ext.grid.GridPanel({
        // A groupingStore is required for a GroupingView
        store: new Ext.data.GroupingStore({
            autoDestroy: true,
            reader: reader,
            data: xg.dummyData,
            sortInfo: {field: 'company', direction: 'ASC'},
            groupOnSort: true,
            remoteGroup: true,
            groupField: 'industry'
        }),
        colModel: new Ext.grid.ColumnModel({
            columns:[
                {id:'company',header: 'Company', width: 60, dataIndex: 'company'},
                // groupable, groupName, groupRender are also configurable at column level
                {header: 'Price', renderer: Ext.util.Format.usMoney, dataIndex: 'price', groupable: false},
                {header: 'Change', dataIndex: 'change', renderer: Ext.util.Format.usMoney},
                {header: 'Industry', dataIndex: 'industry'},
                {header: 'Last Updated', renderer: Ext.util.Format.dateRenderer('m/d/Y'), dataIndex: 'lastChange'}
            ],
            defaults: {
                sortable: true,
                menuDisabled: false,
                width: 20
            }
        }),
    
        view: new Ext.grid.GroupingView({
            forceFit: true,
            // custom grouping text template to display the number of items per group
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
        }),
    
        frame:true,
        width: 700,
        height: 450,
        collapsible: true,
        animCollapse: false,
        title: 'Grouping Example',
        iconCls: 'icon-grid',
        renderTo: document.body
    });
});