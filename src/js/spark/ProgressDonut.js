/*
 * @class Fancy.spark.ProgressDonut
 */
Fancy.define('Fancy.spark.ProgressDonut', {
  svgns: 'http://www.w3.org/2000/svg',
  sum: 100,
  prefix: 'fancy-spark-progress-donut-',
  colorBGPlus: '#eee',
  colorPlus: '#44A4D3',
  colorBGMinus: '#F9DDE0',
  colorMinus: '#EA7369',
  tipTpl: '{value}',
  tip: true,
  tooltip: true,
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

    if(!me.tip || !me.tipTpl){
      return;
    }

    var tpl = new Fancy.Template(me.tipTpl);
    value = tpl.getHTML({
      value: value
    });

    Fancy.tip.update('<span style="color: '+me.color+';">●</span> ' + value);
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

    //Fix IE 9-10 bug
    if(!me.tooltip){
      return;
    }

    if(!me.tip || !me.tipTpl){
      return;
    }

    Fancy.tip.show(e.pageX + 15, e.pageY - 25);
  },
  /*
   *
   */
  iniColors: function(){
    var me = this;
    
    if(me.value < 0){
      me.backColor = me.colorBGMinus;
      me.color = me.colorPlus;
    }
    else{
      me.backColor = me.colorBGPlus;
      me.color = me.colorPlus;
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
});