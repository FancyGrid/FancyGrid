/*
 * @class Fancy.SegButtonField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.SegButton', 'Fancy.SegButtonField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.button',
  allowToggle: true,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('click', 'change');

    me.Super('init', arguments);

    me.preRender();
    me.render();
    me.renderButton();

    me.ons();

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }
  },
  fieldCls: 'fancy fancy-field fancy-field-button',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   *
   */
  renderButton: function(){
    var me = this;

    me.button = new Fancy.SegButton({
      renderTo: me.el.select('.fancy-field-text').item(0).dom,
      items: me.items,
      disabled: me.disabled,
      multiToggle: me.multiToggle,
      allowToggle: me.allowToggle
    });
  },
  /*
   *
   */
  ons: function(){
    var me = this;

    me.button.on('toggle', function(){
      if(me.disabled){
        return;
      }
      me.fire('toggle');
    });
  },
  /*
   *
   */
  onClick: function(){
    var me = this;

    if(me.disabled){
      return;
    }

    me.fire('click');

    if(me.handler){
      me.handler();
    }
  },
  /*
   * @return {String}
   */
  get: function(){
    var me = this,
      pressed = [];

    Fancy.each(me.items, function (item, i) {
      if(item.pressed){
        if(item.value){
          pressed.push(item.value);
        }
        else {
          pressed.push(i);
        }
      }
    });

    return pressed.toString();
  },
  /*
   * @param {Boolean} [fire]
   */
  clear: function(fire){
    if(this.allowToggle){
      Fancy.each(this.items, function (item){
        item.setPressed(false, fire);
      });
    }
  }
});