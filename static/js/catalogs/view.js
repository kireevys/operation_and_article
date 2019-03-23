var catalogFootBar = Ext.extend(Ext.Toolbar, {
    height: 75,
    layout: 'form',

    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems()
        });
        catalogFootBar.superclass.initComponent.call(this);
        this.parent.on('rowclick', this.deleteButton.activateDeleter, this.deleteButton);
    },

    buildItems: function () {
        var me = this;
        var save = new Ext.Button({
            ref: 'saveButton',
            parent: me,
            iconCls: 'action-save',
            scale: 'large',
            autoWidth: true,
            autoHeight: true,
            tooltip: 'Сохраненение изменений',

            handler: function () {
                me.parent.store.save();
            }
        });
        var add = new Ext.Button({
            ref: 'addButton',
            parent: me,
            iconCls: 'action-add',
            scale: 'large',
            autoWidth: true,
            autoHeight: true,
            tooltip: 'Добавление нового',

            handler: function () {
                // var adder = new this.adder();
                me.adder.show();
            }
        });
        var del = new Ext.Button({
            ref: 'deleteButton',
            parent: me,
            disabled: true,
            iconCls: 'action-delete',
            scale: 'large',
            autoWidth: true,
            autoHeight: true,
            tooltip: 'Удалить выделенное',

            activateDeleter: function () {
                this.setDisabled(false);
            },

            deleteSelectedRow: function () {
                var record = me.parent.getSelectionModel().selection.record;
                me.parent.store.remove(record);

            },

            handler: function () {
                this.deleteSelectedRow();
            }
        });

        var barItems = [save, '-', ' ', add, '-', '->', del]
        return barItems;
    },

    onCreate: function(values){
        this.parent.store.add(new Ext.data.Record(values));
    }
});

var contrFootBar = Ext.extend(catalogFootBar, {

    initComponent: function () {
        Ext.apply(this, {
            adder: this.buildAdder()
        });
        contrFootBar.superclass.initComponent.call(this);
    },

    buildAdder: function () {
        var me = this;
        var adder = new addToCatalog({
            ref: 'contrAdder',
            parent: me,
            catalog: 'Контрагент',
            windowType: 'contractor',
            addForm: contrAddForm
        });

        return adder;
    },

});