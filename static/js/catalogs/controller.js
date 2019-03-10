var deleterWindow = Ext.extend(Ext.Window, {
    title: 'Удалить узел',
    width: 200,
    height: 200,
    bodyStyle: 'background:transparent;',
    layout: 'fit',
    region: 'west',
    closable: false,
    disabled: true,
    
    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems()
        });
        deleterWindow.superclass.initComponent.call(this);
    },

    buildItems: function () {
        var windowScope = this;
        var grid = new Ext.grid.GridPanel({
            store: new Ext.data.ArrayStore({
                fields: ['name']
            }),
            columns: [
                {
                    id: 'name_column',
                    header: 'Бросать сюда',
                    dataIndex: 'name',
                    resizable: false,
                    width: 200
                }
            ],
            viewConfig: {
                forceFit: true
            },
            id: 'grid',
            // title: 'Корзина',
            region: 'center',
            layout: 'fit',
            enableDragDrop: true,
            ddGroup: 'treeWs',
            parent: windowScope,
            ref: 'dropZone'
        });
        return [grid,];
    },
});

var centerPanel = Ext.extend(Ext.tree.TreePanel, {
    title: 'Добавить узел',
    flex: 1,
    region: 'east',
    rootVisible: false,
    enableDrag: true,
    copy: true,
    ddGroup: 'treeWs',
    collapsible: false,
    useArrows: true,
    // bodyPadding: 10,
    layout: 'form',
    width: 150,
    dataUrl: 'get_adder_warehouse',
    root: {
        nodeType: 'async',
        text: 'new_ws',
        id: 'root',
        draggable: false
    },


//    listeners: {
//         enddrag(a, b, c) {
            // this.superclass.enddrag(a, b, c);
//             this.getRootNode().reload();
//         },
//     }, 

    initComponent: function () {
        Ext.apply(this, {
            // items: this.buildItems()

        });

        centerPanel.superclass.initComponent.call(this);
    },
});