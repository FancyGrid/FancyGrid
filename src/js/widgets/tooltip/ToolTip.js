/*
 * @class Fancy.ToolTip
 * @extends Fancy.Widget
 */
Fancy.define('Fancy.ToolTip', {
  extend: Fancy.Widget,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.initTpl();
    me.render();
  },
  tpl: [
    '<div class="{innerCls}">{text}</div>'
  ],
  widgetCls: 'fancy-tooltip',
  cls: '',
  extraCls: '',
  innerCls: 'fancy-tooltip-inner',
  /*
   *
   */
  render: function(){
    var me = this,
      renderTo = Fancy.get(me.renderTo || document.body).dom,
      el = Fancy.get(document.createElement('div'));

    el.addCls(
      Fancy.cls,
      me.widgetCls,
      me.cls,
      me.extraCls
    );

    el.update(me.tpl.getHTML({
      text: me.text,
      innerCls: me.innerCls
    }));

    me.el = Fancy.get(renderTo.appendChild(el.dom));
  },
  /*
   * @param {Number} x
   * @param {Number} y
   */
  show: function(x, y){
    var me = this;

    if(me.timeout){
      clearInterval(me.timeout);
      delete me.timeout;
    }

    if(me.css('display') === 'none'){
      me.css({
        display: 'block'
      });
    }

    me.css({
      left: x,
      top: y
    });
  },
  /*
   * @param {Number} [delay]
   */
  hide: function(delay){
    var me = this;

    if(me.timeout){
      clearInterval(me.timeout);
      delete me.timeout;
    }

    if(delay){
      me.timeout = setTimeout(function(){
        me.el.hide();
      }, delay);
    }
    else {
      me.el.hide();
    }
  },
  /*
   *
   */
  destroy: function(){
    var me = this;

    me.el.destroy();
  },
  /*
   * @param {String} html
   */
  update: function(html){
    var me = this;

    me.el.select('.' + me.innerCls).update(html);
  }
});

Fancy.tip = {
  update: function(text){
    Fancy.tip = new Fancy.ToolTip({
      text: text
    });
  },
  show: function(x, y){
    Fancy.tip = new Fancy.ToolTip({
      text: ' '
    });
    Fancy.tip.show(x, y);
  },
  hide: function(){
    Fancy.tip = new Fancy.ToolTip({
      text: ' '
    });
  }
};