Ext.ns('App.login.win');
Ext.ns('App.login.win.form');
Ext.ns('App.login.win.test');


App.login.win = Ext.extend(Ext.Window, {
    title: 'Auth',
    width: 350,
    height: 135,
    closeAction: 'close',
    layout: 'fit',
    closable : false,

    initComponent: function() {
        Ext.applyIf(this, {
            items: this.buildItems(),
        });

        App.login.win.superclass.initComponent.call(this);

    },

    buildItems: function() {
        winItemArr = [
        
        new App.login.win.form({
            ref: 'form',
            parent: this,
        }),
    ]
    return winItemArr
        
    },
});

App.login.win.form = Ext.extend(Ext.form.FormPanel, {
    style:{
        "padding":"7px 0px 10px 0px"
    },
    labelAlign:'right',
    baseCls: "x-plain",
    // labelWidth: 150,

    initComponent: function() {
        Ext.applyIf(this, {
            items: this.buildItems(),
        });
        
        App.login.win.form.superclass.initComponent.call(this);
    },

    buildItems: function() {
        panelItem = [            {    
            xtype: 'textfield',
            id: 'user-field',
            fieldLabel: 'Username',
            emptyText: 'Your login',
            allowBlank: false,
            padding: '10'
        },
        {
            xtype: 'textfield',
            id: 'password-field',
            fieldLabel: 'Password',
            emptyText: 'Some password',
            inputType: 'password',
            allowBlank: false,
        },
        {
            xtype: 'button',
            id: 'login-button',
            text: 'login',
            width: 50,
            height: 25,
            region: 'center',
        }
    ]
        return panelItem
    }
    
});

App.login.win.test = Ext.extend(Ext.form.FormPanel, {

    initComponent: function() {
        Ext.applyIf(this, {
            items: this.buildItems(),
        });
        
        App.login.win.test.superclass.initComponent.call(this);
    },

    buildItems: function() {
        panelItem = [
        ]
        return panelItem
    }
    
});

Ext.onReady(function() {
    var mainWindow = new App.login.win();
    mainWindow.show();
});
