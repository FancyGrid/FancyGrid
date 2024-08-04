/**
 * @class Fancy.SegButton
 * @extends Fancy.Widget
 */
Fancy.define('Fancy.SegButton', {
  extend: Fancy.Widget,
  /*
   * @param {Object} config
   * @param {Object} scope
   */
  constructor: function(config, scope){
    this.scope = scope;
    this.Super('const', arguments);
  },
  /*
   *
   */
  init(){
    const me = this;

    me.addEvents('toggle');
    me.Super('init', arguments);

    me.style = me.style || {};

    me.render();
  },
  /*
   *
   */
  widgetCls: Fancy.SEG_BUTTON_CLS,
  cls: '',
  extraCls: '',
  text: '',
  /*
   *
   */
  render(){
    var me = this,
      renderTo,
      el = Fancy.get(document.createElement('div'));

    me.fire('beforerender');

    renderTo = Fancy.get(me.renderTo || document.body).dom;

    el.addCls(
      Fancy.cls,
      me.widgetCls,
      me.cls,
      me.extraCls
    );

    if(me.hidden){
      el.css('display', 'none');
    }

    me.el = Fancy.get(renderTo.appendChild(el.dom));

    Fancy.each(me.style, function(value, p){
      me.el.css(p, value);
    });

    me.renderButtons();

    me.fire('afterrender');
    me.fire('render');
  },
  /*
   *
   */
  renderButtons(){
    var me = this,
      items = me.items,
      i = 0,
      iL = items.length,
      toggleGroup = Fancy.id(null, 'fancy-toggle-group-');

    for(;i<iL;i++){
      const item = items[i];
      item.renderTo = me.el.dom;

      if(me.allowToggle !== false){
        item.enableToggle = true;
        if(me.multiToggle !== true){
          item.toggleGroup = toggleGroup;
        }
      }

      if(i === 0){
        item.style = {
          'border-right-width': 0,
          'border-top-right-radius': 0,
          'border-bottom-right-radius': 0
        };

        if(iL === 1){
          delete item.style['border-right-width'];
        }
      }
      else if(i > 1){
        item.style = {
          'border-left-width': 0,
          'border-top-left-radius': 0,
          'border-bottom-left-radius': 0
        };
      }
      else{
        item.style = {
          'border-top-left-radius': 0,
          'border-bottom-left-radius': 0
        };
      }

      if(items.length > 2 && i !== 0 && i !== iL - 1){
        Fancy.apply(item.style, {
          'border-top-right-radius': 0,
          'border-bottom-right-radius': 0,
          'border-top-left-radius': 0,
          'border-bottom-left-radius': 0
        });
      }

      me.items[i] = new Fancy.Button(item);
      me.items[i].on('pressedchange', function(button, value){
        me.fire('toggle', button, value, me.getValues());
      });
    }
  },
  getValues(){
    var me = this,
      values = [],
      items = me.items,
      i = 0,
      iL = items.length;

    for(;i<iL;i++){
      values.push(items[i].pressed);
    }

    return values;
  },
  /*
   *
   */
  clear(fire){
    var me = this,
      items = me.items,
      i = 0,
      iL = items.length;

    for(;i<iL;i++){
      items[i].setPressed(false, fire);
    }
  },
  /*
   *
   */
  setItems(values){
    const me = this;

    me.el.update('');

    me.items = values;
    me.renderButtons();
  },
  /*
   *
   */
  setActiveItem(index, fire){
    const me = this,
      items = me.items;

    items[index].setPressed(true, fire);
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
        Fancy.each(value, function(v){
          switch (Fancy.typeOf(v)){
            case 'string':
              Fancy.each(items, function(item){
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
        Fancy.each(items, function(item){
          if(item.value === value){
            item.setPressed(true, true);
          }
        });
        break;
      case 'number':
        var button = items[value];
        if(button){
          button.setPressed(true, true);
        }
        break;
    }
  }
});
