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
  init(){
    const me = this;

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
  renderButton(){
    const me = this;

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
  ons(){
    const me = this,
      el = me.el;

    me.button.on('toggle', function(){
      if(me.disabled){
        return;
      }
      me.fire('toggle');
    });

    el.on('mouseenter', me.onMouseOver, me);
    el.on('mouseleave', me.onMouseOut, me);

    if (me.tip){
      el.on('mousemove', me.onMouseMove, me);
    }
  },
  /*
   *
   */
  onClick(){
    const me = this;

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
  get(){
    const me = this,
      pressed = [];

    Fancy.each(me.items, (item, i) => {
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
  clear(fire){
    if(this.allowToggle){
      Fancy.each(this.items, (item) => {
        item.setPressed(false, fire);
      });
    }
  },
  /*
   * @param {Array|String|Number} value
   * Note: duplicate code in button SegButton
   */
  setValue(value){
    const me = this,
      items = me.items;

    me.clear(false);

    switch (Fancy.typeOf(value)){
      case 'array':
        Fancy.each(value, (v) => {
          switch (Fancy.typeOf(v)){
            case 'string':
              Fancy.each(items, (item) => {
                if(item.value === v){
                  item.setPressed(true, true);
                }
              });
              break;
            case 'number':
              items[v].setPressed(true, true);
              break;
          }
        });
        break;
      case 'string':
        Fancy.each(items, (item) => {
          if(item.value === value){
            item.setPressed(true, true);
          }
        });
        break;
      case 'number':
        const button = items[value];
        if (button) {
          button.setPressed(true, true);
        }
        break;
    }
  }
});
