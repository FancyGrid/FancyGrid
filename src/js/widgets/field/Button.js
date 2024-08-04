/*
 * @class Fancy.ButtonField
 * @extends Fancy.Widget
 */
(function(){
  //SHORTCUTS
  const F = Fancy;
  /*
   * CONSTANTS
   */
  const CLEARFIX_CLS = F.CLEARFIX_CLS;
  const FIELD_CLS = F.FIELD_CLS;
  const FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  const FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;
  const FIELD_BUTTON_CLS = F.FIELD_BUTTON_CLS;

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
    constructor: function(config){
      F.apply(this, config);
      this.Super('const', arguments);
    },
    /*
     *
     */
    init(){
      const me = this;

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
    fieldCls: `${FIELD_CLS} ${FIELD_BUTTON_CLS}`,
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
    renderButton(){
      const me = this;

      me.button = new F.Button({
        renderTo: me.el.select(`.${FIELD_TEXT_CLS}`).item(0).dom,
        text: me.buttonText,
        disabled: me.disabled,
        pressed: me.pressed,
        enableToggle: me.enableToggle,
        imageCls: me.imageCls,
        handler: function(){
          if (me.disabled) {
            return;
          }

          if (me.scope){
            me.handler.apply(me.scope, [me]);
          }
          else {
            me.handler(me);
          }
        }
      });
    },
    /*
     *
     */
    ons(){
      const me = this,
        el = me.el;

      me.button.on('pressedchange', function(button, value){
        me.fire('pressedchange', value);
      });

      el.on('mouseenter', me.onMouseOver, me);
      el.on('mouseleave', me.onMouseOut, me);

      if (me.tip) {
        el.on('mousemove', me.onMouseMove, me);
      }
    },
    /*
     *
     */
    onClick(){
      const me = this;

      if (me.disabled) {
        return;
      }

      me.fire('click');

      if (me.handler) {
        me.handler();
      }
    },
    setPressed(value){
      this.button.setPressed(value);
    }
  });
})();
