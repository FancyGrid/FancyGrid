/*
 * @class Fancy.SetField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Set', 'Fancy.SetField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.set',
  padding: '8px 11px 0px 8px',
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

    me.addEvents('beforecollapse', 'collapse', 'expanded', 'expand', 'beforeexpand', 'beforeexpanded');

    me.Super('init', arguments);

    Fancy.each(me.items, function(item, i){
      if( item.labelAlign === 'top' ){
        if( i === 0 ){
          item.style = {
            'padding-left': '0px'
          };
        }
      }

      if(item.type === 'line'){
        item.padding = false;
        item.parentSet = true;
      }
    });

    me.preRender();
    me.render();
    if( me.checkbox !== undefined ){
      me.initCheckBox();
    }

    me.on('beforecollapse', me.onBeforeCollapsed, me);
    me.on('expanded', me.onExpanded, me);
  },
  fieldCls: 'fancy-field-set',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<fieldset>',
      '<legend>',
        '<div class="fancy-field-checkbox-input" style="float:left;margin-top: 4px;display: none;"></div>',
        '<div class="fancy-field-set-label" style="float:left;">{label}</div>',
        '<div class="fancy-clearfix"></div>',
      '</legend>',
      '<div class="fancy-field-text fancy-field-set-items">',

      '</div>',
    '</fieldset>'
  ],
  /*
   *
   */
  initCheckBox: function(){
    var me = this,
      checkbox = me.el.select('.fancy-field-checkbox-input');

    checkbox.css('display', '');

    if( me.checkbox === true ){
      me.addCls('fancy-checkbox-on');
    }

    var itemsEl = me.el.select('.fancy-field-set-items');

    setTimeout(function(){
      if( me.checkbox === true ) {}
      else{
        me.fire('collapse');
      }
    }, 1);

    if( me.checkbox === true ){
      itemsEl.css('display', '');
      me.removeCls('fancy-set-collapsed');
    }
    else{
      itemsEl.css('display', 'none');
      me.addCls('fancy-set-collapsed');
    }

    checkbox.on('click', function(){
      me.toggleCls('fancy-checkbox-on');

      var isChecked = me.el.hasCls('fancy-checkbox-on'),
        itemsEl = me.el.select('.fancy-field-set-items');

      if( isChecked ){
        me.fire('beforeexpanded');
        me.fire('beforeexpand');
        itemsEl.css('display', '');
        me.removeCls('fancy-set-collapsed');
        me.fire('expanded');
        me.fire('expand');
      }
      else{
        me.fire('beforecollapse');
        itemsEl.css('display', 'none');
        me.addCls('fancy-set-collapsed');
        me.fire('collapse');
      }
    });
  },
  /*
   *
   */
  onBeforeCollapsed: function(){
    var me = this,
      form = me.form,
      itemsEl = me.el.select('.fancy-field-set-items'),
      itemsHeight = parseInt(itemsEl.css('height'));

    form.setHeight(form.getHeight() - itemsHeight);
  },
  /*
   *
   */
  onExpanded: function(){
    var me = this,
      form = me.form,
      itemsEl = me.el.select('.fancy-field-set-items'),
      itemsHeight = parseInt(itemsEl.css('height'));

    form.setHeight(form.getHeight() + itemsHeight);
  }
});