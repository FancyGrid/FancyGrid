/*
 * @class Fancy.form.field.Tab
 * @extends Fancy.Widget
 */
Fancy.define('Fancy.form.field.Tab', {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.tab',
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

    me.addEvents('collapsed', 'expanded');

    me.Super('init', arguments);

    let i = 0,
      iL = me.items.length;

    for(;i<iL;i++){
      const item = me.items[i];

      if( item.labelAlign === 'top' ){
        if( i === 0 ){
          item.style = {
            'padding-left': '0px'
          };
        }
      }
    }

    me.preRender();
    me.render();
  },
  fieldCls: 'fancy fancy-field-tab',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    //'<div class="fancy-field-text fancy-field-tab-items">',
    '<div class="fancy-field-tab-items">',
    '</div>'
  ]
});
