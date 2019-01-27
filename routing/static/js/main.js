Ext.ns('App.main');

App.main = Ext.extend(Ext.Window, {
    title: 'Operation and article',
    maximized: true,
    closable: false,

    initComponent: function(){
        Ext.applyIf(this, {
            items: this.buildItems()
        });

        App.main.superclass.initComponent.call(this);
    },

    buildItems: function() {
        panels = [

            new App.main.panel({
                ref: 'main',
                parent: this
            })
        ]
        return panels;
    },
    layout: new Ext.layout.HBoxLayout({
        pack: 'end'
    }),
});

App.main.panel = Ext.extend(Ext.Panel, {
    title: 'test',
    width: 300,
    collapsed: true,
    collapsible: true,



    initComponent: function() {
        Ext.applyIf(this, {
            items: this.buildItems()
        });

        App.main.panel.superclass.initComponent.call(this);
    },

    buildItems: function(){
        panelItem = [
            {
                xtype: 'textfield',
                id: 'user'
            }
        ]
        return panelItem;
    }

});

Ext.onReady(function(){
    var main = new App.main();
    main.show();
});