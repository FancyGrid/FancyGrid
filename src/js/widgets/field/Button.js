/*
 * @class Fancy.ButtonField
 * @extends Fancy.Widget
 */
(function() {
  /*
   * CONSTANTS
   */
  var CLEARFIX_CLS = Fancy.CLEARFIX_CLS;
  var FIELD_CLS = Fancy.FIELD_CLS;
  var FIELD_LABEL_CLS = Fancy.FIELD_LABEL_CLS;
  var FIELD_TEXT_CLS = Fancy.FIELD_TEXT_CLS;
  var FIELD_BUTTON_CLS= Fancy.FIELD_BUTTON_CLS;

  Fancy.define(['Fancy.form.field.Button', 'Fancy.ButtonField'], {
    mixins: [
      Fancy.form.field.Mixin
    ],
    extend: Fancy.Widget,
    type: 'field.button',
    pressed: false,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      var me = this,
        config = config || {};

      Fancy.apply(me, config);

      me.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents('click');

      me.Super('init', arguments);

      me.preRender();
      me.render();
      me.renderButton();

      me.ons();

      if (me.hidden) {
        me.css('display', 'none');
      }

      if (me.style) {
        me.css(me.style);
      }
    },
    fieldCls: FIELD_CLS + ' ' + FIELD_BUTTON_CLS,
    value: '',
    width: 100,
    emptyText: '',
    tpl: [
      '<div class="'+FIELD_LABEL_CLS+'" style="{labelWidth}{labelDisplay}">',
      '{label}',
      '</div>',
      '<div class="'+FIELD_TEXT_CLS+'">',
      '</div>',
      '<div class="'+CLEARFIX_CLS+'"></div>'
    ],
    /*
     *
     */
    renderButton: function(){
      var me = this;

      new Fancy.Button({
        renderTo: me.el.select('.' + FIELD_TEXT_CLS).item(0).dom,
        text: me.buttonText,
        handler: function () {
          if (me.handler) {
            me.handler();
          }
        }
      });
    },
    /*
     *
     */
    ons: function () {
    },
    /*
     *
     */
    onClick: function () {
      var me = this;

      me.fire('click');

      if (me.handler) {
        me.handler();
      }
    }
  });
})();