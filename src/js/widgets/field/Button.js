/*
 * @class Fancy.ButtonField
 * @extends Fancy.Widget
 */
(function() {
  //SHORTCUTS
  var F = Fancy;
  /*
   * CONSTANTS
   */
  var CLEARFIX_CLS = F.CLEARFIX_CLS;
  var FIELD_CLS = F.FIELD_CLS;
  var FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  var FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;
  var FIELD_BUTTON_CLS= F.FIELD_BUTTON_CLS;

  F.define(['Fancy.form.field.Button', 'Fancy.ButtonField'], {
    mixins: [
      F.form.field.Mixin
    ],
    extend: F.Widget,
    type: 'field.button',
    pressed: false,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      F.apply(this, config);
      this.Super('const', arguments);
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

      new F.Button({
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