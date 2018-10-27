/**
 * @class Fancy.Form
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.Form', 'FancyForm'], {
  extend: Fancy.Widget,
  mixins: [
    'Fancy.form.mixin.Form',
    Fancy.panel.mixin.PrepareConfig,
    Fancy.panel.mixin.methods,
    'Fancy.form.mixin.PrepareConfig'
  ],
  type: 'form',
  theme: 'default',
  i18n: 'en',
  //labelWidth: 100,
  maxLabelNumber: 11,
  minWidth: 200,
  minHeight: 200,
  barScrollEnabled: true,
  scrollable: false,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(renderTo, config){
    var me = this;

    if(Fancy.isDom(renderTo)){
      config = config || {};
      config.renderTo = renderTo;
    }
    else{
      config = renderTo;
    }

    config = config || {};

    var fn = function(params){
      if(params){
        Fancy.apply(config, params);
      }

      config = me.prepareConfig(config, me);
      Fancy.applyConfig(me, config);

      me.Super('const', arguments);
    };

    var preInit = function(){
      var i18n = config.i18n || me.i18n;

      if( Fancy.loadLang(i18n, fn) === true ) {
        fn({
          //lang: Fancy.i18n[i18n]
        });
      }
    };

    Fancy.loadStyle();

    if(!Fancy.modules['form'] && !Fancy.fullBuilt && Fancy.MODULELOAD !== false && Fancy.MODULESLOAD !== false && me.fullBuilt !== true && me.neededModules !== true){
      if(Fancy.modules['grid']){
        Fancy.loadModule('form', function(){
          preInit();
        });
      }
      else{
        me.loadModules(preInit, config);
      }
    }
    else{
      preInit();
    }
  },
  /*
   * @param {Function} preInit
   * @param {Object} config
   */
  loadModules: function(preInit, config){
    var me = this,
      requiredModules = {
        form: true
      };

    Fancy.modules = Fancy.modules || {};

    if(Fancy.nojQuery){
      requiredModules.dom = true;
    }

    if(Fancy.isTouch){
      requiredModules.touch = true;
    }

    if(config.url){
      requiredModules.ajax = true;
    }

    var containsMenu = function (item) {
      if(item.menu){
        requiredModules['menu'] = true;
        return true;
      }
    };

    Fancy.each(config.tbar, containsMenu);
    Fancy.each(config.bbar, containsMenu);
    Fancy.each(config.buttons, containsMenu);
    Fancy.each(config.subTBar, containsMenu);

    var readItems = function (items) {
      var i = 0,
        iL = items.length,
        item;

      for(;i<iL;i++){
        item = items[i];

        if(item.type === 'combo' && item.data && item.data.proxy){
          requiredModules.ajax = true;
        }

        if(item.type === 'date'){
          requiredModules.grid = true;
          requiredModules.date = true;
          requiredModules.selection = true;
        }

        if(item.items){
          readItems(item.items);
        }
      }
    };

    readItems(config.items || []);

    me.neededModules = {
      length: 0
    };

    for(var p in requiredModules){
      if(Fancy.modules[p] === undefined) {
        me.neededModules[p] = true;
        me.neededModules.length++;
      }
    }

    if(me.neededModules.length === 0){
      me.neededModules = true;
      preInit();
      return;
    }

    var onLoad = function(name){
      delete me.neededModules[name];
      me.neededModules.length--;

      if(me.neededModules.length === 0){
        me.neededModules = true;
        preInit();
      }
    };

    if(me.neededModules.dom){
      Fancy.loadModule('dom', function(){
        delete me.neededModules.dom;
        me.neededModules.length--;

        for(var p in me.neededModules){
          if(p === 'length'){
            continue;
          }

          Fancy.loadModule(p, onLoad);
        }
      });
    }
    else {
      for (var p in me.neededModules) {
        if (p === 'length') {
          continue;
        }

        Fancy.loadModule(p, onLoad);
      }
    }
  }
});
/*
 * @param {String} id
 */
FancyForm.get = function(id){
  var el = Fancy.get(id);

  if(!el.dom){
    return;
  }

  var formId = el.select('.fancy-form').dom.id;

  return Fancy.getWidget(formId);
};

FancyForm.defineTheme = Fancy.defineTheme;
FancyForm.defineController = Fancy.defineController;
FancyForm.addValid = Fancy.addValid;

if(!Fancy.nojQuery && Fancy.$){
  Fancy.$.fn.FancyForm = function(o){
    if(this.selector){
      o.renderTo = Fancy.$(this.selector)[0].id;
    }
    else{
      o.renderTo = this.attr('id');
    }

    return new Fancy.Form(o);
  };
}