Ext.ns('App');
// Create main Viewport
App = Ext.extend(Ext.Viewport, {
    maximized: true,
    closable: false,
    layout: 'fit',

    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems()
        });
        App.superclass.initComponent.call(this);
    },

    buildItems: function () {
        var tab = new App.tab({ ref: 'tab', parent: this });
        mainItems = [
            tab,
        ];
        return mainItems;
    },
});
// Create tab contaner: Table Panel
App.tab = Ext.extend(Ext.TabPanel, {
    activeTab: 0,

    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems()
        });
        App.tab.superclass.initComponent.call(this);
    },

    buildItems: function () {
        var firstTab = new App.tab.operationPanel({ ref: 'operationPanel', parent: this });
        tabs = [
            firstTab,
        ];
        return tabs;
    },
});



Ext.onReady(function () {
    var appRun = new App();
    // appRun.show();
});