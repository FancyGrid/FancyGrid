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

    me.Super('init', arguments);

    var i = 0,
      iL = me.items.length,
      isItemTop,
      lineName = Fancy.id(null, 'fancy-line-');

    if(me.parentSet){
      var averageWidth = me.width  / me.items.length;
    }

    for(;i<iL;i++){
      var item = me.items[i];

      if(item.width === undefined){
        item.width = averageWidth;
      }

      item.style = item.style || {};
      item.lineName = lineName;

      if( item.labelAlign === 'top' ){
        isItemTop = true;

        if(me.parentSet){
          item.style['padding'] = '0px';
        }

        if(item.label){
          item.labelWidth = item.width - 16;
          if(item.labelWidth === 100){
            item.labelWidth = 7 * (item.label.length + 1 + 1);
          }

          if(item.width < item.labelWidth){
            item.labelWidth = 7 * (item.label.length + 1 + 1);
          }
        }
      }
      else{
        item.style['padding-top'] = '0px';

        if(!item.labelWidth && item.label){
          item.labelWidth = 7 * (item.label.length + 1 + 1);
        }
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