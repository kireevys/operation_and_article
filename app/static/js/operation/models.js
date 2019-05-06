var treeWs = Ext.extend(Ext.tree.TreePanel, {
    title: 'Warehouse',
    autoScroll: true,
    collapsible: true,
    height: 150,
    useArrows: true,
    rootVisible: false,
    id: 'wsTree',
    dataUrl: 'get_ws_tree',
    
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
    // listeners: {
    //     // После двойного клика по листу:
    //     // Выводим МХ для наглядности, и записываем его id для формы
    //     beforedblclick(node, e) {
    //         if (node.attributes.leaf) {
    //             var selNodeText = node.text;
    //             var selector = Ext.getCmp('selWs');
    //             selector.setValue(selNodeText);
    //         }

    //     }
    // },
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
                return [wsField,]
            },
        });
        return new bar(
            {
                ref: 'treeTb',
                parent: this
            });
    },
    // TODO: Ниработаит
    /* bbar: [
        new Ext.Toolbar({
            layout: 'form',
            ref: 'treeTb',
            items: [
                {
                    xtype: 'textfield',
                    id: 'selWs',
                    fieldLabel: 'Selected warehouse',
                    disabled: true,
                    allowBlank: false,
                    ref: 'selWs',
                }
            ]
        })
    ] */
});