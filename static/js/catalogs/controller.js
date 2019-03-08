var deleterWindow = Ext.extend(Ext.Window, {
    title: 'Удалить узел',
    width: 200,
    height: 200,
    bodyStyle: 'background:transparent;',
    layout: 'fit',
    region: 'west',
    closable: false,

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

var tree = new Ext.tree.TreePanel({
    loader: new Ext.tree.TreeLoader({
        preloadChildren: true
    }),
    enableDD: true,
    ddGroup: 'treeWs',
    id: 'tree',
    region: 'east',
    title: 'Список товаров',
    layout: 'fit',
    width: 300,
    split: true,
    collapsible: true,
    autoScroll: true,
});

var centerPanel = Ext.extend(Ext.tree.TreePanel, {
    title: 'Добавить узел',
    flex: 1,
    region: 'east',
    // rootVisible: false,
    enableDD: true,
    copy: true,
    ddGroup: 'treeWs',
    collapsible: false,
    // bodyPadding: 10,
    layout: 'form',
    // height: 70,
    root: {
        text: 'Товары',
        id: 'root',
        expanded: true,
        children: [{
            text: 'Новая нода',
            disable: true,
            expanded: false,
        }, {
            text: 'Новый магазин',
            leaf: true,
            price: 7000,
            unit: 'бут'
        }]
    },
    loader: new Ext.tree.TreeLoader({
        preloadChildren: true
    }),

    initComponent: function () {
        Ext.apply(this, {
            // items: this.buildItems()

        });

        centerPanel.superclass.initComponent.call(this);
    },
});