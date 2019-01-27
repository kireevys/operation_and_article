Ext.ns('App.login.win');
Ext.ns('App.login.win.form');
Ext.ns('App.login.win.test');

App.login.win = Ext.extend(Ext.Window, {
  title: 'Auth',
  width: 350,
  height: 135,
  closeAction: 'close',
  layout: 'fit',
  closable: false,

  initComponent: function () {
    Ext.applyIf(this, {
      items: this.buildItems(),
    });

    App.login.win.superclass.initComponent.call(this);

  },

  buildItems: function () {
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
  style: {
    "padding": "7px 0px 10px 0px"
  },
  labelAlign: 'right',
  baseCls: "x-plain",
  // labelWidth: 150,

  initComponent: function () {
    Ext.applyIf(this, {
      items: this.buildItems(),
      buttons: this.buildButtons(),
    });

    App.login.win.form.superclass.initComponent.call(this);
  },

  buildButtons: function () {
    var me = this;
    return [{
      xtype: 'button',
      id: 'login-button',
      text: 'login',
      width: 50,
      height: 25,
      renderTo: Ext.getBody(),
      handler: function () {
        var form = me.getForm();

        var inputValues = form.getFieldValues();
        if (inputValues['userField'] && inputValues['passwordField']) {
          Ext.Ajax.request({
            url: '/test',
            method: 'POST',
            params: inputValues,
            success: function(form, action){
              console.log(form);
            }
          });
        }
      }
    }]
  },

  buildItems: function () {

    panelItem = [{
      xtype: 'textfield',
      id: 'userField',
      fieldLabel: 'Username',
      allowBlank: false,
      padding: '10',
      autoScroll: true
    },
    {
      xtype: 'textfield',
      id: 'passwordField',
      fieldLabel: 'Password',
      inputType: 'password',
      allowBlank: false,
    }
    ]
    return panelItem
  }

});

Ext.onReady(function () {
  var mainWindow = new App.login.win();
  mainWindow.show();
});
