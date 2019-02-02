// TODO: Раскидать нэймспейсы
Ext.ns('App.main');
Ext.ns('App.main.panel');
Ext.ns('App.main.panel.opArt');

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
            new App.main.panel.opPanel({
                ref: 'opPanel',
                parent: this
            })
        ]
        return panelItem;
    },


});

App.main.panel.opPanel = Ext.extend(Ext.Panel, {
    // items: [
    //     App.main.panel.opGrid,
    //     App.main.panel.opArt
    // ],
    initComponent: function () {
        Ext.applyIf(this, {
            items: this.buildItems(),
        });

        App.main.panel.opPanel.superclass.initComponent.call(this);
    },
    buildItems: function () {
        panelItem = [
            // Вкладки - любой объект, заголовки передаются в ярлычки
            new App.main.panel.opGrid({
                ref: 'opGrid',
                parent: this
            }),
            new App.main.panel.opArt({
                ref: 'opArt',
                parent: this
            })
        ]
        return panelItem;
    },

    title: 'Operation'
})

// Табличка операций
// TODO: Перетащить к операциям
App.main.panel.opGrid = Ext.extend(Ext.grid.GridPanel, {
    title: 'Operation',
    height: 500,
    layout: 'vbox',
    layoutConfig: {
        padding: '5',
        align: 'left'
    },
    // Данные с бэка
    store: operationStore,
    // Модель столбцов
    colModel: operationColumns,
    listeners: {
        // Событие, считывающее id_op при нажатии строку
        // Далее id должен уходить на бэк, получать данне о товарах в операции
        // И грузить товары в стор нижнего грида
        cellclick(grid, rowIndex, columnIndex, e) {
            var record = grid.getStore().getAt(rowIndex);
            currentIdOp = record.get('id_op');
            App.main.panel.opArt.call.load(currentIdOp);
        },
    },
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



App.main.panel.opArt = Ext.extend(Ext.grid.GridPanel, {
    title: 'Operation Articles',

    initComponent: function () {
        Ext.applyIf(this, {
            store: this.buidStore()
        });
        App.main.panel.opArt.superclass.initComponent.call(this);

    },
    // Данные с бэка
    buidStore: function () {
        return new opArtStore();
    },
    load: function(opId){
        this.store.load(opId);
    },
    // Модель столбцов
    colModel: operationsArticleColumns,
    height: 500,
    layout: 'vbox',
    layoutConfig: {
        padding: '5',
        align: 'left'
    },
    listeners: {
        // Событие, считывающее id_op при нажатии строку
        // Далее id должен уходить на бэк, получать данне о товарах в операции
        // И грузить товары в стор нижнего грида
        cellclick(grid, rowIndex, columnIndex, e) {
            alert(currentIdOp);
        }
    },
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