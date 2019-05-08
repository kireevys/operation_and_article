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
        var tab = new App.tab({
            ref: 'tab',
            parent: this
        });
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
        var operations = new App.tab.operationPanel({
            ref: 'operationPanel',
            parent: this
        });
        var catalogs = new App.tab.catalogs({
            ref: 'catalogsPanel',
            parent: this
        });
        tabs = [
            operations,
            catalogs
        ];
        return tabs;
    },
});

function setAppTitle() {
    var header = 'Операции и товары'
    Ext.Ajax.request({
        url: 'version',
        success: function (response, options) {
            document.title = `${header} v.${JSON.parse(response.responseText)}`;
        },
        failure: function (response, options) {
            document.title = header;
        }
    });
};

// Мы готовы? Установим заголовок - и стартуем
Ext.onReady(function () {
    setAppTitle();
    new App({
        ref: 'main'
    });
});