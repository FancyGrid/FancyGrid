/*
 * @class Fancy.FieldLine
 * @extend Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Line', 'Fancy.FieldLine'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.line',
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

    me.addEvents();

    me.Super('init', arguments);

    var i = 0,
      iL = me.items.length,
      isItemTop;

    for(;i<iL;i++){
      var item = me.items[i];

      item.style = item.style || {};

      if( item.labelAlign === 'top' ){
        isItemTop = true;
      }
      else{
        item.style['padding-top'] = '0px'
      }

      if( i === 0 ){
        item.style['padding-left'] = '0px';
      }
    }

    me.preRender();
    me.render();

    if( isItemTop ){
      me.css('height', '48px');
    }
  },
  fieldCls: 'fancy fancy-field fancy-field-line',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-text fancy-field-line-items">',
    '</div>'
  ]
});