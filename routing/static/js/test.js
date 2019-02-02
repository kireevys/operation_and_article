App = Ext.extend(Ext.Viewport, {
    title: 'Operation and article',
    // Весь экран, не закрываемый, первый дочерний объект занимает все пространство
    maximized: true,
    closable: false,
    layout: 'fit',

    initComponent: function () {
        Ext.applyIf(this, {
            items: this.buildItems()
        });

        App.superclass.initComponent.call(this);
    },

    buildItems: function () {
        panels = [
            // Дочерний объект - таб панель
            // TODO: Навести порядок в именах
            new App.panel({
                ref: 'panel',
                parent: this
            })
        ]
        return panels;
    },
});

App.panel = Ext.extend(Ext.TabPanel, {
    width: 300,
    height: 330,
    padding: 10,
    title: 'Приложение Ext JS 4',
    // layout: {
    //     type: 'vbox',
    //     align: 'stretch'
    // },
    initComponent: function () {
        Ext.apply(this, {
            items: [{
                xtype: 'button',
                title: 'Первая панель',
                height: 100
            }, {
                xtype: 'panel',
                title: 'Вторая панель',
                height: 80
            }, {
                xtype: 'panel',
                title: 'Третья панель',
                height: 100
            }]
        });

        App.panel.superclass.initComponent.call(this);
    },

});

Ext.onReady(function () {
    var main = new App.panel();
    main.show();
});