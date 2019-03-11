addop = Ext.extend(Ext.Window, {
    title: 'Создание операций',
    modal: true,
    width: 500,
    height: 450,
    layout: 'fit',

    initComponent: function () {
        Ext.applyIf(this, {
            items: this.buildItems()
        }),
            addop.superclass.initComponent.call(this);
    },

    buildItems: function () {
        // add form to array
        var arr = [
            new addOpForm({
                ref: 'addOpForm',
                parent: this
            })
        ];
        return arr;
    },
});

addOpForm = Ext.extend(Ext.form.FormPanel, {
    id: 'addOpForm',

    getChildValues: function () {
        var me = this;
    },

    initComponent: function () {
        Ext.applyIf(this, {
            items: this.buildItems(),
            buttons: this.buildButtons(),
        });
        addOpForm.superclass.initComponent.call(this);

        this.wsTree.on('beforedblclick', this.setWs, this);
    },
    formData: {
        optype: null,
        ws: null,
    },

    setWs: function (node, e) {
        if (node.attributes.leaf) {
            this.wsValue.setValue(node.attributes.id_ws);
        }
    },

    buildItems: function () {
        var me = this;
        var comboOptypes = Ext.extend(Ext.form.ComboBox, {
            id: 'optype',
            typeAhead: true,
            triggerAction: 'all',
            valueField: 'id_type',
            displayField: 'name',
            fieldLabel: 'Тип операции',
            allowBlank: false,

            setStatusAdditionalField: function (data) {
                var allFields = [
                    { id: 'gm_res', expected: 'На гипермаркете' },
                    { id: 'id_rack', expected: 'Складская' },
                    { id: 'doccount', expected: 'От поставщика' },
                ];

                for (var i in allFields) {
                    if (i === 'remove') { break };
                    var currentField = allFields[i];
                    var fildObj = Ext.getCmp(currentField.id);
                    fildObj.setValue(null);
                    if (data.name === currentField.expected) {
                        fildObj.setDisabled(false);
                    }
                    else {
                        fildObj.setDisabled(true);
                    };

                };
            },

            listeners: {
                beforeselect: function (record, index) {
                    this.setStatusAdditionalField(index.data);
                }
            },

            initComponent: function () {
                Ext.applyIf(this, {
                    store: this.buildStore(),
                });
                comboOptypes.superclass.initComponent.call(this);
                this.store.load()
            },

            buildStore: function () {
                var optypeStore = new Ext.data.JsonStore({
                    fields: [
                        'id_type',
                        'name',],
                    proxy: new Ext.data.HttpProxy({
                        api: {
                            read: {
                                url: 'get_optypes',
                                method: 'GET'
                            }
                        }
                    }),
                    root: 'optype',
                });
                return optypeStore;
            },
        });


        var comboCA = Ext.extend(Ext.form.ComboBox, {
            id: 'id_contr',
            typeAhead: true,
            triggerAction: 'all',
            // lazyRender: true,
            mode: 'local',
            valueField: 'id_contr',
            displayField: 'name',
            fieldLabel: 'Conractor',

            initComponent: function () {
                Ext.applyIf(this, {
                    store: this.buildStore(),
                });
                comboCA.superclass.initComponent.call(this);
                this.store.load()
            },

            buildStore: function () {
                var caStore = new Ext.data.JsonStore({
                    fields: [
                        'id_contr',
                        'name',],
                    proxy: new Ext.data.HttpProxy({
                        api: {
                            read: {
                                url: 'get_contractors',
                                method: 'GET'
                            }
                        }
                    }),
                    root: 'contractors',
                });
                return caStore;
            },
        });

        var opdateField = Ext.extend(Ext.form.DateField, {
            fieldLabel: 'opdate',
            format: 'd.m.Y',
            id: 'opdate',
            allowBlank: false,

            initComponent: function () {
                Date.monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
                Date.dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
                var today = new Date();
                this.setValue(today);
                Ext.apply(this, {
                    minValue: new Date(today.getFullYear() - 1, 1, 1),
                    maxValue: new Date(today.getFullYear() + 2, 1, 1),
                })
            }
        });

        var settPanel = Ext.extend(Ext.form.FieldSet, {
            disabled: false,
            layout: 'form',
            title: 'Доп поля',
            id: 'additionsField',

            initComponent: function () {
                Ext.apply(this, {
                    items: [
                        {
                            xtype: 'numberfield',
                            id: 'gm_res',
                            fieldLabel: 'Резерв на ГМ',
                            blankText: '0',
                            emptyText: 'Только для типа "На Гипермаркете"',
                            disabled: true,
                            parent: this.parent
                        },
                        {
                            xtype: 'numberfield',
                            id: 'doccount',
                            fieldLabel: 'Документов',
                            blankText: '0',
                            disabled: true,
                            minValue: 0,
                            maxValue: 15,
                            emptyText: 'Только для типа "От поставщика"',
                            parent: this.parent
                        },
                        {
                            xtype: 'numberfield',
                            id: 'id_rack',
                            fieldLabel: 'Стеллаж',
                            blankText: '0',
                            disabled: true,
                            emptyText: 'Только для типа "Складская"',
                            ref: 'rack',
                            parent: this.parent,
                        },
                    ]
                })
                settPanel.superclass.initComponent.call(this);
            },

        });
        // Create all items, add to items array and return it
        var itemArr = [
            new comboOptypes({
                ref: 'comboOptypes',
                parent: this,
                allowBlank: false,
            }),

            new treeWs({
                ref: 'wsTree',
                parent: this,
            }),

            new comboCA({
                ref: 'comboCa',
                parent: this,
                allowBlank: false,
            }),
            new opdateField({
                ref: 'opdateField',
                parent: this,
                allowBlank: false,
            }),
            new settPanel({
                ref: 'settPanel',
                parent: this
            }),

            {
                xtype: 'numberfield',
                id: 'id_ws',
                hidden: true,
                value: null,
                allowBlank: false,
                ref: 'wsValue',
                parent: this
            },
            {
                xtype: 'numberfield',
                id: 'id_status',
                hidden: true,
                value: null,
                allowBlank: false,
                ref: 'newOpStatus',
                emptyText: 1,
                parent: this
            }
        ];
        return itemArr;
    },

    buildButtons: function () {
        var me = this;
        var buttonsArr = [
            {
                xtype: 'button',
                id: 'apply',
                text: 'done',
                disabled: false,
                handler: function () {
                    var myForm = me.getForm()
                    if (myForm.isValid()) {
                        Ext.Ajax.request({
                            url: 'add_op',
                            method: 'POST',
                            params: myForm.getFieldValues(),
                            success: function (response, options) {
                                Ext.MessageBox.alert('Успех', 'Операция добавлена');
                                me.parent.parent.store.load();
                                me.parent.close();
                            }
                        });
                    }
                },
            }
        ];
        return buttonsArr;
    },
});
