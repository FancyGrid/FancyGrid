/**
 * @class Fancy.Tool
 * @extends Fancy.Widget
 */
Fancy.define('Fancy.Tool', {
  extend: Fancy.Widget,
  /*
   * @constructor
   * @param {Object} config
   * @param {Object} scope
   */
  constructor: function(config, scope){
    var me = this;

    me.scope = scope;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('click', 'mousedown', 'mouseup', 'mouseover', 'mouseout');
    me.Super('init', arguments);

    me.style = me.style || {};

    me.render();
    me.ons();
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      el = me.el;

    el.on('click', me.onClick, me);
  },
  cls: 'fancy fancy-button',
  text: '',
  height: 28,
  paddingTextWidth: 5,
  /*
   *
   */
  render: function(){
    var me = this,
      renderTo = Fancy.get(me.renderTo || document.body).dom,
      el = document.createElement('div');

    me.fire('beforerender');

    el.className = 'fancy-tool-button';
    el.innerHTML = me.text;
    me.el = Fancy.get( renderTo.appendChild(el) );

    me.fire('afterrender');
    me.fire('render');
  },
  /*
   *
   */
  onClick: function(){
    var me = this;

    me.fire('click');
    if( me.handler ){
      if( me.scope ){
        me.handler.apply(me.scope, [me]);
      }
      else{
        me.handler(me);
      }
    }
  },
  /*
   * @param {String} value
   */
  setText: function(value){
    var me = this;

    me.el.update(value)
  }
});