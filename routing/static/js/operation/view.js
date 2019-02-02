Ext.ns('App.tab.operation');
Ext.ns('App.tab.operation.models');
// Create first Tab container
App.tab.operationPanel = Ext.extend(Ext.Panel, {
    title: 'Operations',
    layout: { type: 'vbox', align: 'stretch' },

    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems()
        });
        App.tab.operationPanel.superclass.initComponent.call(this);
    },

    buildItems: function () {
        var op = new App.tab.operationPanel.operation({ ref: 'operationGrid', parent: this });
        var opArt = new App.tab.operationPanel.opArticles({ ref: 'opArtGrid', parent: this });
        mainItems = [
            op,
            opArt,
        ];
        return mainItems;
    },
});

App.tab.operationPanel.operation = Ext.extend(Ext.grid.GridPanel, {
    title: 'Operations',
    store: operationStore,
    colModel: operationColumns,
    tbar: opToolbar,
    flex: 1,
});

App.tab.operationPanel.opArticles = Ext.extend(Ext.grid.GridPanel, {
    title: 'Operation Articles',
    store: opArtStore,
    colModel: opArticleColumns,
    flex: 2
});