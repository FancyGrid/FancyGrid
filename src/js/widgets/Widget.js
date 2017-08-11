/**
 * @class Fancy.Widget
 * @extends Fancy.Event
 */
Fancy.define('Fancy.Widget', {
  extend: Fancy.Event,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    Fancy.applyConfig(me, config || {});

    me.preInitControls();
    me.Super('const', arguments);

    me.init();
    me.initControls();
  },
  /*
   *
   */
  init: function(){
    //not runned in grid
    //maybe to redo that run
    var me = this;

    me.initId();
    me.addEvents(
      'beforerender', 'afterrender', 'render', 'show', 'beforehide', 'hide', 'destroy'
    );
    me.initPlugins();
  },
  /*
   * @param {String|HTMLElement}
   */
  renderItems: function(renderTo){
    var me = this,
      i = 0,
      iL = me.items.length;

    for(;i<iL;i++){
      var item = me.items[i],
        w = Fancy.getClassByType(item.type);

      item.renderTo = renderTo;
      me.items[i] = new w(item);
    }
  },
  /*
   *
   */
  preInitControls: function(){
    var me = this,
      controller = me.controller || me.controllers;

    if(controller){
      switch(Fancy.typeOf(controller)){
        case 'string':
          controller = Fancy.getController(controller);

          for(var p in controller){
            if(me[p] === undefined ) {
              me[p] = controller[p];
            }
          }
          break;
        case 'array':
          var controls = [],
            i = 0,
            iL = controller.length;

          for(;i<iL;i++){
            var _controller = Fancy.getController(controller[i]);

            for(var p in _controller){
              if(p === 'controls'){
                controls = controls.concat(_controller.controls);
                continue;
              }

              if(me[p] === undefined ) {
                me[p] = _controller[p];
              }
            }
          }

          me.controls = controls;

          break;
      }
    }
  },
  /*
   *
   */
  initControls: function(){
    var me = this;

    if(me.controls === undefined){
      return;
    }

    var controls = me.controls,
      i = 0,
      iL = controls.length;

    for(;i<iL;i++){
      var control = controls[i];

      if(control.event === undefined){
        throw new Error('[FancyGrid Error]: - not set event name for control');
      }

      if(control.handler === undefined){
        throw new Error('[FancyGrid Error]: - not set handler for control');
      }

      var event = control.event,
        handler = control.handler,
        scope = control.scope || me,
        selector = control.selector;

      if(Fancy.isString(handler)){
        handler = me[handler];
      }

      if(selector) {
        (function (event, handler, scope, selector) {
          if(me.$events[event]){
            me.on(event, function(grid, o){
              var target = o.e.target,
                el = Fancy.get(target),
                parentEl = el.parent(),
                selectored = parentEl.select(selector);

              if(selectored.length === 1 && selectored.within(target)){
                handler.apply(scope, arguments);
              }
              else if(selectored.length > 1){
                var j = 0,
                  jL = selectored.length;

                for(;j<jL;j++){
                  if( selectored.item(j).within(target) ){
                    handler.apply(scope, arguments);
                  }
                }
              }
            }, scope);
          }
          else {
            me.on('render', function () {
              me.el.on(event, handler, scope, selector);
            });
          }
        })(event, handler, scope, selector);
      }
      else if(selector === undefined && control.widget === undefined){
        me.on(event, handler, scope);
      }
    }
  },
  css: function(o1, o2){
    var me = this;

    return me.el.css(o1, o2);
  },
  addClass: function(value){
    this.el.addClass(value);
  },
  removeClass: function(value){
    this.el.removeClass(value);
  },
  hasClass: function(value){
    return this.el.hasClass(value);
  },
  toggleClass: function(value){
    this.el.toggleClass(value);
  },
  destroy: function(){
    var me = this;

    if(me.el){
      me.el.destroy();
    }
  },
  show: function() {
    this.el.show();
  },
  hide: function() {
    this.el.hide();
  }
});