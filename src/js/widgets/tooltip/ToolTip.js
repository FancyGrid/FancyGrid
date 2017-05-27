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
    '<div class="fancy-tooltip-inner">{text}</div>'
  ],
  widgetCls: 'fancy-tooltip',
  cls: '',
  extraCls: '',
  /*
   *
   */
  initTpl: function(){
    var me = this;

    me.tpl = new Fancy.Template(me.tpl);
  },
  /*
   *
   */
  render: function(){
    var me = this,
      renderTo = Fancy.get(me.renderTo || document.body).dom,
      el = Fancy.get(document.createElement('div'));

    //console.log('render');

    el.addClass(Fancy.cls);
    el.addClass(me.widgetCls);
    el.addClass(me.cls);
    el.addClass(me.extraCls);

    el.update(me.tpl.getHTML({
      text: me.text
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
   *
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
    this.el.select('.fancy-tooltip-inner').update(html);
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