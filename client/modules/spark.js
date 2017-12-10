/*
 * @class Fancy.spark.ProgressDonut
 */
Fancy.define('Fancy.spark.ProgressDonut', {
  svgns: 'http://www.w3.org/2000/svg',
  sum: 100,
  prefix: 'fancy-spark-progress-donut-',
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
    me.initChart();    
    me.setSize();
    me.setRadius();
    me.setInnerRadius();
    me.setParams();
    
    me.iniColors();
    
    me.preRender();    
    me.render();

    if( me.inited !== true ) {
      me.renderTo.appendChild(me.chart);
      me.ons();
    }
  },
  /**
   * generate unique id for class
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
  ons: function(){
    var me = this;

    me.el.on('mouseenter', me.onMouseEnter, me);
    me.el.on('mouseleave', me.onMouseLeave, me);
    me.el.on('mousemove', me.onMouseMove, me);
  },
  /*
   * @param {Object} e
   */
  onMouseEnter: function(e){
    var me = this,
      value = me.el.attr('value');

    if(me.tipTpl){
      var tpl = new Fancy.Template(me.tipTpl);
      value = tpl.getHTML({
        value: value
      });
    }

    me.tooltip = new Fancy.ToolTip({
      text: '<span style="color: '+me.color+';">●</span> ' + value
    });
  },
  /*
   * @param {Object} e
   */
  onMouseLeave: function(e){
    var me = this;

    me.tooltip.destroy();
  },
  /*
   * @param {Object} e
   */
  onMouseMove:  function(e){
    var me = this;

    //Fix IE 9-10 bug
    if(!me.tooltip){
      return;
    }

    me.tooltip.css('display', 'block');
    me.tooltip.show(e.pageX + 15, e.pageY - 25);
  },
  /*
   *
   */
  iniColors: function(){
    var me = this;
    
    if(me.value < 0){
      me.backColor = '#F9DDE0';
      me.color = '#EA7369';
    }
    else{
      me.backColor = '#eee';
      me.color = '#44A4D3';
    }
  },
  /*
   *
   */
  preRender: function(){
    var me = this,
      size = me.size,
      chart = me.chart;
      
    chart.setAttribute('width', size);
    chart.setAttribute('height', size);
    chart.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
  },
  /*
   *
   */
  render: function(){
    var me = this;
    
    //render 100% progress
    me.renderBack();
    
    //render progress
    me.renderProgress();
  },
  /*
   *
   */
  renderBack: function(){
    //render 100% progress
    var me = this,
      radius = me.radius,
      innerRadius = me.innerRadius,
      d = [
        'M', me.cx, me.y1,
        'A', radius, radius, 0, 1, 1, me.x2, me.y1,
        'L', me.x2, me.y2,
        'A', innerRadius, innerRadius, 0, 1, 0, me.cx, me.y2
      ].join(' '),
      path = document.createElementNS(me.svgns, "path");
    
    path.setAttribute('d', d);
    path.setAttribute('fill', me.backColor);

    me.chart.appendChild(path);
  },
  /*
   *
   */
  renderProgress: function(){
    //render progress
    var me = this,
      radius = me.radius,
      innerRadius = me.innerRadius,
      path = document.createElementNS(me.svgns, "path"),
      value = me.value,
      cumulative = 0;
      
    if(value > 99){
      value = 99.99999
    }
    
    if(value < -99){
      value = 99.99999
    }
    
    if(value < 0){
      cumulative = 100 + value;
      value *= -1;
    }
    
    var portion = value / me.sum,
      cumulativePlusValue = cumulative + value;
    
    var d = ['M'].concat(
      me.scale(cumulative, radius),
      'A', radius, radius, 0, portion > 0.5 ? 1 : 0, 1,
      me.scale(cumulativePlusValue, radius),
      'L'
    );
    
    if (innerRadius) {
      d = d.concat(
        me.scale(cumulativePlusValue, innerRadius),
        'A', innerRadius, innerRadius, 0, portion > 0.5 ? 1 : 0, 0,
        me.scale(cumulative, innerRadius)
      )
    }
    else{
      d.push(cx, cy)
    }
    
    d = d.join(" ");
    
    path.setAttribute('d', d);
    path.setAttribute("fill", me.color);
    
    me.chart.appendChild(path);
  },
  /*
   *
   */
  initChart: function(){
    var me = this,
      el = Fancy.get(me.renderTo);

    me.renderTo = Fancy.get(me.renderTo).dom;

    if(el.select('svg').length === 0) {
       me.chart = document.createElementNS(me.svgns, "svg:svg");
    }
    else{
      me.chart = el.select('svg').dom;
      me.chart.innerHTML = '';
      me.inited = true;
    }

    me.el = Fancy.get(me.chart);
    me.el.attr('id', me.id);
    if(me.value < 1 && me.value > 0){
      me.el.attr('value', me.value.toFixed(1));
    }
    else if(me.value > -1 && me.value < 0){
      me.el.attr('value', me.value.toFixed(1));
    }
    else {
      me.el.attr('value', me.value.toFixed(0));
    }
  },
  /*
   * @param {Number} value
   * @param {Number} radius
   * @return {Object}
   */
  scale: function(value, radius){
    var me = this,
      pi = Math.PI,
      sum = me.sum,   
      radians = value / sum * pi * 2 - pi / 2;

    return [
      radius * Math.cos(radians) + me.cx,
      radius * Math.sin(radians) + me.cy
    ]    
  },
  /*
   * @param {Number} degrees
   * @return {Number}
   */
  radians: function(degrees) {
    return degrees * Math.PI / 180;
  },
  /*
   *
   */
  setSize: function(){
    var me = this;
    
    me.width = me.width || me.height || me.size || 30;
    me.height = me.height || me.width || me.size || 30;
    me.size = me.size || me.height;
  },
  /*
   *
   */
  setRadius: function(){
    var me = this;
    
    me.radius = me.radius || me.height/2;
  },
  /*
   *
   */
  setInnerRadius: function(){
    var me = this;
    
    me.innerRadius = me.innerRadius || me.height/2 - me.height/4;
  },
  /*
   *
   */
  setParams: function(){
    var me = this,
      radius = me.radius,
      innerRadius = me.innerRadius,
      height = me.height,
      width = me.width;
      
    me.cy = height / 2;
    me.y1 = me.cy - radius;
    me.y2 = me.cy - innerRadius;
     
    me.cx = width / 2;
    me.x2 = me.cx - 0.01;
  }
});/*
 * @class Fancy.spark.GrossLoss
 */
Fancy.define('Fancy.spark.GrossLoss', {
  maxValue: 100,
  tipTpl: '<span style="color: {color};">●</span> {value} {suffix}',
  /*
   * @constructor
   * @param {Object} o
   */
  constructor: function(o){
    Fancy.apply(this, o);
    this.init();
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.preRender();    
    me.render();

    if( me.inited !== true ) {
      me.ons();
    }
  },
  /*
   *
   */
  ons: function(){
    var me = this;

    me.el.on('mouseenter', me.onMouseEnter, me);
    me.el.on('mouseleave', me.onMouseLeave, me);
    me.el.on('mousemove', me.onMouseMove, me);
  },
  /*
   *
   */
  onMouseEnter: function(){
    var me = this,
      value = me.el.attr('value'),
      color = me.el.css('background-color'),
      suffix = '',
      text;

    if(me.percents){
      suffix = ' %';
    }

    var tpl = new Fancy.Template(me.tipTpl);
    text = tpl.getHTML({
      value: value,
      color: color,
      suffix: suffix
    });

    me.tooltip = new Fancy.ToolTip({
      text: text
    });
  },
  /*
   *
   */
  onMouseLeave: function(){
    this.tooltip.destroy();
  },
  /*
   * @param {Object} e
   */
  onMouseMove:  function(e){
    this.tooltip.el.css('display', 'block');
    this.tooltip.show(e.pageX + 15, e.pageY - 25);
  },
  /*
   *
   */
  preRender: function(){},
  /*
   *
   */
  render: function(){
    var me = this,
      column = me.column,
      width = column.width,
      percent = width / me.maxValue,
      minusBarWidth = 0,
      plusBarWidth = 0,
      value = me.value,
      color = '';

    if(value < 0){
      minusBarWidth = (-value * percent)/2;
      if(me.lossColor){
        color = 'background-color:' + me.lossColor + ';';
      }
      value = '<div class="fancy-grid-grossloss-loss" style="'+color+'width:'+minusBarWidth+'%">&nbsp;</div>';
    }
    else{
      plusBarWidth = (value * percent)/2;
      if(me.grossColor){
        color = 'background-color:' + me.grossColor + ';';
      }
      value = '<div class="fancy-grid-grossloss-gross" style="'+color+'width:'+plusBarWidth+'%">&nbsp;</div>';
    }

    me.renderTo.innerHTML = value;

    if(me.value < 0) {
      me.el = Fancy.get(me.renderTo).select('.fancy-grid-grossloss-loss').item(0);
    }
    else{
      me.el = Fancy.get(me.renderTo).select('.fancy-grid-grossloss-gross').item(0);
    }

    me.el.attr('value', me.value.toFixed(2));
  }
});/*
 * @class Fancy.spark.ProgressBar
 */
Fancy.define('Fancy.spark.ProgressBar', {
  tipTpl: '{value} {suffix}',
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
      me.el.on('mouseenter', me.onMouseEnter, me);
      me.el.on('mouseleave', me.onMouseLeave, me);
      me.el.on('mousemove', me.onMouseMove, me);
    }
  },
  /*
   * @param {Object} e
   */
  onMouseEnter: function(e){
    var me = this,
      value = me.el.attr('value'),
      suffix = '%';

    if(me.percents === false){
      suffix = '';
    }

    var tpl = new Fancy.Template(me.tipTpl),
      text = tpl.getHTML({
        value: value,
        suffix: suffix
      });

    Fancy.tip.update(text);
  },
  /*
   * @param {Object} e
   */
  onMouseLeave: function(e){
    Fancy.tip.hide(500);
  },
  /*
   * @param {Object} e
   */
  onMouseMove:  function(e){
    Fancy.tip.show(e.pageX + 15, e.pageY - 25);
  },
  /*
   *
   */
  render: function(){
    var me = this,
      column = me.column,
      width = column.width - 18,
      percent = width / me.maxValue,
      barWidth = me.value * percent,
      value,
      attrValue = me.value,
      spark = column.sparkConfig;

    if(me.percents === false){
      attrValue = me.value;
    }
    else {
      if (attrValue < 1) {
        attrValue = me.value.toFixed(1);
      }
      else {
        attrValue = me.value.toFixed(0);
      }
    }

    var inside = '&nbsp;',
      outside = '',
      outSideLeft = '';

    if(spark.label){
      switch(spark.label.type){
        case 'left':
          inside = '<div class="fancy-grid-bar-label" style="float: left;">'+attrValue+'</div>';
          if(barWidth < String(attrValue).length * 7){
            inside = '&nbsp;';
            outside = '<div class="fancy-grid-bar-label-out" style="">'+attrValue+'</div>';
          }
          break;
        case 'right':
          inside = '<div class="fancy-grid-bar-label" style="float: right;">'+attrValue+'</div>';
          if(barWidth < String(attrValue).length * 7){
            inside = '&nbsp;';
            if(spark.align === 'right'){
              outside = '<div class="fancy-grid-bar-label-out-left" style="">'+attrValue+'</div>';
            }
            else{
              outside = '<div class="fancy-grid-bar-label-out" style="">'+attrValue+'</div>';
            }
          }
          break;
        default:
          inside = '<div class="fancy-grid-bar-label" style="float: left;">'+attrValue+'</div>';
          if(barWidth < String(attrValue).length * 7){
            inside = '&nbsp;';
            outSideLeft = '<div class="fancy-grid-bar-label-out-left" style="">'+attrValue+'</div>';
          }
      }
    }

    var _width = 'width:'+(barWidth)+'px;',
      _float = '';

    if(spark.align){
      _float = 'float:' + spark.align + ';';
    }

    value = '<div id="'+me.id+'" value="' + attrValue + '" class="fancy-grid-column-progress-bar" style="' + _width + _float + '">' + inside + '</div>' + outside + outSideLeft;

    me.renderTo.innerHTML = value;
    me.el = Fancy.get(me.renderTo).select('.fancy-grid-column-progress-bar').item(0);

    if(Fancy.isFunction(me.style)){
      var _style = me.style({
        value: me.value,
        column: me.column,
        rowIndex: me.rowIndex,
        data: me.data
      });

      me.el.css(_style)
    }
  },
  /*
   *
   */
  update: function(){
    var me = this,
      column = me.column,
      width = column.width - 18,
      charLength = 10,
      percent = width / me.maxValue,
      value = me.value,
      barWidth = value * percent,
      spark = column.sparkConfig,
      cellInnerEl = me.el.parent();

    me.el.css('width', barWidth);
    me.el.attr('value', value);

    if(spark.label){
      if(spark.label.type === 'right'){
        var labelBar = cellInnerEl.select('.fancy-grid-column-progress-bar'),
          labelEl = cellInnerEl.select('.fancy-grid-bar-label'),
          labelOutEl = cellInnerEl.select('.fancy-grid-bar-label-out');

        if(String(value).length * charLength + 5*2 > barWidth){
          if(labelEl.dom){
            labelBar.update('&nbsp;');
            labelEl.destroy();
          }
          if(!labelOutEl.dom){
            cellInnerEl.append('<div class="fancy-grid-bar-label-out">' + value + '</div>');
          }
          else {
            labelOutEl.update(value);
          }
        }
        else{
          if(!labelEl.dom){
            labelBar.append('<div class="fancy-grid-bar-label" style="float: right;"></div>');
            labelEl = cellInnerEl.select('.fancy-grid-bar-label');
          }

          labelEl.update(value);
          if(labelOutEl.dom){
            labelOutEl.destroy();
          }
        }
      }
      else{
        var labelBar = cellInnerEl.select('.fancy-grid-column-progress-bar'),
          labelEl = cellInnerEl.select('.fancy-grid-bar-label'),
          labelOutLeftEl = cellInnerEl.select('.fancy-grid-bar-label-out-left');

        if(String(value).length * charLength + 5*2 > barWidth){
          if(labelEl.dom){
            labelBar.update('&nbsp;');
            labelEl.destroy();
          }
          if(!labelOutLeftEl.dom){
            cellInnerEl.append('<div class="fancy-grid-bar-label-out-left">' + value + '</div>');
          }
          else {
            labelOutLeftEl.update(value);
          }
        }
        else{
          if(!labelEl.dom){
            labelBar.append('<div class="fancy-grid-bar-label" style="float: left;"></div>');
            labelEl = cellInnerEl.select('.fancy-grid-bar-label');
          }

          labelEl.update(value);
          if(labelOutLeftEl.dom){
            labelOutLeftEl.destroy();
          }
        }
      }
    }
  }
});/*
 * @class Fancy.spark.HBar
 */
Fancy.define('Fancy.spark.HBar', {
  tipTpl: '{value}',
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
    Fancy.tip.hide(500);
  },
  /*
   * @param {Object} e
   */
  onMouseMove:  function(e){
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