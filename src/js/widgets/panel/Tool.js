/**
 * @class Fancy.Tool
 * @extends Fancy.Widget
 */
(function(){
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var BUTTON_CLS = F.BUTTON_CLS;

  F.define('Fancy.Tool', {
    extend: F.Widget,
    /*
     * @constructor
     * @param {Object} config
     * @param {Object} scope
     */
    constructor: function (config, scope) {
      this.scope = scope;
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
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
    ons: function () {
      this.el.on('click', this.onClick, this);
    },
    cls: BUTTON_CLS,
    text: '',
    height: 28,
    paddingTextWidth: 5,
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = F.get(me.renderTo || document.body).dom,
        el = document.createElement('div');

      me.fire('beforerender');

      el.className = 'fancy-tool-button';
      el.innerHTML = me.text;
      me.el = F.get(renderTo.appendChild(el));

      me.fire('afterrender');
      me.fire('render');
    },
    /*
     *
     */
    onClick: function () {
      var me = this;

      me.fire('click');
      if (me.handler) {
        if (me.scope) {
          me.handler.apply(me.scope, [me]);
        }
        else {
          me.handler(me);
        }
      }
    },
    /*
     * @param {String} value
     */
    setText: function (value) {
      this.el.update(value)
    }
  });

})();