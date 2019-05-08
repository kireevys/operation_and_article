var treeWs = Ext.extend(Ext.tree.TreePanel, {
    title: 'Warehouse',
    autoScroll: true,
    collapsible: true,
    height: 150,
    useArrows: true,
    rootVisible: false,
    id: 'wsTree',
    dataUrl: 'warehouse',
    requestMethod: 'GET',

    root: {
        nodeType: 'async',
        text: 'warehouse',
        id: 'warehouse',
        draggable: false
    },

    initComponent: function () {
        Ext.apply({
            bbar: this.buildToolBar()
        });

        treeWs.superclass.initComponent.call(this);

    },

    buildToolBar: function () {
        var me = this;
        var bar = Ext.extend(Ext.Toolbar, {
            layout: 'form',
            initComponent: function () {
                Ext.apply({
                    items: this.buildItems()
                });

                bar.superclass.initComponent.call(this);
            },
            buildItems: function () {
                var me = this;
                var wsField = new Ext.form.NumberField({
                    id: 'selWs',
                    fieldLabel: 'Selected warehouse',
                    disabled: true,
                    allowBlank: false,
                    ref: 'selWs',
                    parent: me
                })
                return [wsField, ]
            },
        });
        return new bar({
            ref: 'treeTb',
            parent: this
        });
    },
});