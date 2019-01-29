// TODO: Раскидать нэймспейсы
Ext.ns('App.main');
Ext.ns('App.main.panel');
Ext.ns('App.main.panel.addOperation');

// Вьюпорт - корневой объект
App.main = Ext.extend(Ext.Viewport, {
    title: 'Operation and article',
    // Весь экран, не закрываемый, первый дочерний объект занимает все пространство
    maximized: true,
    closable: false,
    layout: 'fit',

    initComponent: function () {
        Ext.applyIf(this, {
            items: this.buildItems()
        });

        App.main.superclass.initComponent.call(this);
    },

    buildItems: function () {
        panels = [
            // Дочерний объект - таб панель
            // TODO: Навести порядок в именах
            new App.main.panel({
                ref: 'panel',
                parent: this
            })
        ]
        return panels;
    },
});

// Панелька с вкладками
App.main.panel = Ext.extend(Ext.TabPanel, {
    activeTab: 0,
    // Инициализация ВКЛАДОК
    initComponent: function () {
        Ext.applyIf(this, {
            items: this.buildItems(),
        });

        App.main.panel.superclass.initComponent.call(this);
    },

    buildItems: function () {
        panelItem = [
            // Вкладки - любой объект, заголовки передаются в ярлычки
            new App.main.panel.opGrid({
                ref: 'opGrid',
                parent: this
            })
        ]
        return panelItem;
    },


});


// Табличка операций
// TODO: Перетащить к операциям
App.main.panel.opGrid = Ext.extend(Ext.grid.GridPanel, {

    ddGroup: 'firstGridDDGroup',
    title: 'Operation',
    // Данные с бэка
    store: firstGridStore,
    // Модель столбцов
    colModel: col,
    // Кнопочка, которая должна вызывать окно добавления операций
    // Но пока она просто вызывает окна.
    // Много окон
    buttons: [
        {
            xtype: 'button',
            text: 'add operation',
            parent: function () {
                return this;
            },
            handler: function () {
                new App.main.panel.addOperation({
                    ref: 'addOperation',
                    parent: this.parent()
                });
            }
        },
    ]
});

// Вот этих окон
App.main.panel.addOperation = Ext.extend(Ext.Window, {
    title: 'Add op',
    width: 350,
    height: 135,
    layout: 'fit',
});

// Если готовы - показываем вьюпорт
Ext.onReady(function () {
    var main = new App.main();
    main.show();
});