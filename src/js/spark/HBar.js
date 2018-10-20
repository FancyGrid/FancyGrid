/*
 * @class Fancy.spark.HBar
 */
Fancy.define('Fancy.spark.HBar', {
  tipTpl: '{value}',
  tip: true,
  maxValue: 100,
  stacked: false,
  fullStack: false,
  /*
   * @constructor
   * @param {Object} o
   */
  constructor: function(o){
    var me = this;

    Fancy.apply(me, o);
    
    me.init();
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.initId();
    me.render();

    if( me.inited !== true ) {
      me.ons();
    }
  },
  /*
   *
   */
  initId: function(){
    var me = this,
      prefix = me.prefix || Fancy.prefix;

    me.id = me.id || Fancy.id(null, prefix);

    Fancy.addWidget(me.id, me);
  },
  /*
   *
   */
  ons: function() {
    var me = this;
    
    if(me.tip !== false){
      me.el.on('mouseenter', me.onMouseEnter, me, '.fancy-grid-column-h-bar-node');
      me.el.on('mouseleave', me.onMouseLeave, me, '.fancy-grid-column-h-bar-node');
      me.el.on('mousemove', me.onMouseMove, me, '.fancy-grid-column-h-bar-node');
    }
  },
  /*
   * @param {Object} e
   */
  onMouseEnter: function(e){
    var me = this,
      el = Fancy.get(e.target),
      key = el.attr('key'),
      title = el.attr('data-title'),
      value = Number(el.attr('value')),
      percents = Number(el.attr('percents'));

    if(!me.tip || !me.tipTpl){
      return;
    }

    if(me.tipFormat){
      var config = {
        value: value,
        percents: percents,
        key: key,
        column: me.column,
        data: me.data,
        title: title
      };

      value = me.tipFormat(config);
    }

    var tpl = new Fancy.Template(me.tipTpl),
      text = tpl.getHTML({
        value: value
      });

    Fancy.tip.update(text);
  },
  /*
   * @param {Object} e
   */
  onMouseLeave: function(e){
    var me = this;

    if(!me.tip || !me.tipTpl){
      return;
    }

    Fancy.tip.hide(500);
  },
  /*
   * @param {Object} e
   */
  onMouseMove:  function(e){
    var me = this;
    if(!me.tip || !me.tipTpl){
      return;
    }

    Fancy.tip.show(e.pageX + 15, e.pageY - 25);
  },
  /*
   *
   */
  render: function(){
    var me = this,
      column = me.column,
      width = column.width - 18,
      widthPercent = width/100,
      fields = column.index,
      totalValue = 0,
      percent,
      value,
      disabled = column.disabled || {},
      lineHeight = '',
      margin = '',
      marginTop = 2,
      i = 0,
      iL = fields.length;

    if(column.fields){
      iL = column.fields.length;
      Fancy.each(column.fields, function (field) {
        var key = column.index + '.' + field;

        if(disabled[key]){
          return;
        }

        totalValue += me.data[column.index][key];
      });
    }
    else{
      Fancy.each(fields, function (key) {
        if(disabled[key]){
          return;
        }

        totalValue += me.data[key];
      });
    }

    if(!me.stacked){
      totalValue = me.maxItemValue;
      lineHeight = 'line-height:' + ((me.height - 1) / fields.length - marginTop) + 'px;';
    }
    else if(!me.fullStack){
      totalValue = me.maxValue;
    }

    percent = totalValue/100;

    i = 0;

    var sparkCls = 'fancy-spark-hbar';

    if(me.stacked){
      sparkCls += ' fancy-spark-stacked ';
    }

    value = '<div id="'+me.id+'" class="' + sparkCls + '">';

    for(;i<iL;i++){
      if(column.fields){
        var key = column.fields[i],
          _value = me.data[column.index][key];
      }
      else{
        var key = fields[i],
          _value = me.data[key];
      }

      var percents = _value/percent,
        columnWidth = percents * widthPercent;

      if(disabled[key]){
        continue;
      }

      if(i !== 0){
        columnWidth--;
      }

      if(!me.stacked){
        if(i === 0){
          margin = 'margin-top:' + (marginTop) + 'px;';
        }
        else{
          margin = 'margin-top:' + marginTop + 'px;';
        }
      }

      if(columnWidth > 0 && columnWidth < 1){
        columnWidth = 2;
      }

      var color = 'background: '+Fancy.COLORS[i] + ';',
        _width = 'width:'+(columnWidth)+';',
        display = '',
        title = 'data-title=""';

      if(columnWidth === 0){
        display = 'display: none;';
      }

      if(me.title){
        title = 'data-title="'+me.title[i]+'" ';
      }

      var _key = 'key="' + key + '" ';
      _value = 'value="' + _value + '" ';
      var _percents = 'percents="' + percents + '" ';

      value += '<div ' + title + _key + _value + _percents + '" class="fancy-grid-column-h-bar-node" style="' + display + _width + color + lineHeight + margin + '">&nbsp;</div>';
    }

    value += '</div>';

    me.renderTo.innerHTML = value;
    me.el = Fancy.get(me.renderTo);
  },
  /*
   * @param {Array} data
   */
  update: function(data){
    var me = this,
      column = me.column,
      width = column.width - 18,
      widthPercent = width/100,
      fields = column.index,
      totalValue = 0,
      percent,
      disabled = column.disabled || {},
      lineHeight,
      marginTop = 2;

    me.data = data;

    var i = 0,
      iL = fields.length,
      dLength = 0;

    if(column.fields){
      iL = column.fields.length;

      Fancy.each(column.fields, function(key){
        if(disabled[column.index + '.' + key]){
          dLength++;
          return;
        }

        totalValue += me.data[column.index][key];
      });
    }
    else{
      Fancy.each(fields, function(key){
        if(disabled[key]){
          dLength++;
          return;
        }

        totalValue += me.data[key];
      });
    }

    if(!me.stacked){
      totalValue = me.maxItemValue;
      lineHeight = (me.height - 1) / (fields.length - dLength) - marginTop;
    }
    else if(!me.fullStack){
      totalValue = me.maxValue;
    }

    percent = totalValue/100;

    i = 0;

    for(;i<iL;i++) {
      if(column.fields){
        var key = column.fields[i],
          _value = me.data[column.index][key];
      }
      else{
        var key = fields[i],
          _value = me.data[key];
      }

      var percents = _value / percent,
        columnWidth = percents * widthPercent,
        item = me.el.select('.fancy-grid-column-h-bar-node[key="' + key + '"]');

      if(column.fields && disabled[column.index + '.' + key]){
        item.css('width', '0px');
        item.hide();
        continue;
      }
      else if(disabled[key]){
        item.css('width', '0px');
        item.hide();
        continue;
      }

      if(i !== 0){
        columnWidth--;
      }

      if(!me.stacked){
        item.css('line-height', lineHeight + 'px');
        if(i === 0){
          item.css('margin-top', (marginTop) + 'px');
        }
        else {
          item.css('margin-top', marginTop + 'px');
        }
      }

      if(columnWidth === 0 || columnWidth === -1){
        item.css('display', 'none');
      }
      else{
        item.css('display', 'block');
      }

      if(columnWidth > 0 && columnWidth < 2){
        columnWidth = 2;
      }

      item.animate({
        duration: 2,
        width: columnWidth
      });
    }
  }
});