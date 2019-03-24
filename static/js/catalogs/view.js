var catalogFootBar = Ext.extend(Ext.Toolbar, {
    height: 75,
    layout: 'form',

    initComponent: function () {
        Ext.apply(this, {
            items: this.buildItems()
        });
        catalogFootBar.superclass.initComponent.call(this);

        this.parent.on('rowclick', this.deleteButton.activateDeleter, this.deleteButton);

        // Button action control
        this.parent.on('afteredit', this.cancelButton.activate, this.cancelButton);
        this.parent.on('afteredit', this.saveButton.activate, this.saveButton);

        this.parent.on('load', this.cancelButton.deactivate, this.cancelButton);
        this.parent.on('load', this.saveButton.deactivate, this.saveButton);
    },

    buildItems: function () {

        var me = this;

        var editGroupButton = Ext.extend(Ext.Button, {
            parent: me,
            scale: 'large',
            autoWidth: true,
            // disabled: true,
            autoHeight: true,

            activate: function () {
                this.setDisabled(false);
            },

            deactivate: function () {
                this.setDisabled(true);
            },
        });

        var save = new editGroupButton({
            ref: 'saveButton',
            parent: me,
            iconCls: 'action-save',
            tooltip: 'Сохраненение изменений',

            handler: function () {
                me.parent.store.save();
            },
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
                me.adder().show();
            }
        });

        var del = new Ext.Button({
            ref: 'deleteButton',
            parent: me,
            disabled: true,
            iconCls: 'action-trash',
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

        var cancel = new editGroupButton({
            ref: 'cancelButton',
            parent: me,
            // disabled: true,
            iconCls: 'action-delete',
            tooltip: 'Отменить изменения',

            handler: function () {
                me.parent.store.load();
                // this.setDisabled(true);
            }
        });


        var barItems = [save, '-', ' ', add, '-', '->', '-', cancel, '-', del]
        return barItems;
    },

});

var contrFootBar = Ext.extend(catalogFootBar, {

    initComponent: function () {
        Ext.apply(this, {
            adder: this.buildAdder
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

var articleFootBar = Ext.extend(catalogFootBar, {

    initComponent: function () {
        Ext.apply(this, {
            adder: this.buildAdder
        });
        articleFootBar.superclass.initComponent.call(this);
    },

    buildAdder: function () {
        var me = this;
        var adder = new addToCatalog({
            ref: 'articleAdder',
            parent: me,
            catalog: 'Товар',
            windowType: 'article',
            addForm: articleAddForm
        });

        return adder;
    },

});

