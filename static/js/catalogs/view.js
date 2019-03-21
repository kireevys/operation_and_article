var contrFootBar = Ext.extend(Ext.Toolbar, {
    height: 75,
    layout: 'form',

    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems()
        });
        contrFootBar.superclass.initComponent.call(this);
    },

    buildItems: function () {
        var addButton = [
            {
                xtype: 'button',
                iconCls: 'action-save',
                scale: 'large',
                autoWidth: true,
                autoHeight: true,
                tooltip: 'Сохраненение изменений'
            },
            {
                xtype: 'button',
                iconCls: 'action-add',
                scale: 'large',
                autoWidth: true,
                autoHeight: true,
                tooltip: 'Добавить КА'
            },
            {
                xtype: 'button',
                iconCls: 'action-delete',
                scale: 'large',
                autoWidth: true,
                autoHeight: true,
                tooltip: 'Удалить выделенное'
            },
        ]
        return addButton;
    }
});