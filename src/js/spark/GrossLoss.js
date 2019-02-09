/*
 * @class Fancy.spark.GrossLoss
 */
Fancy.modules['spark'] = true;
Fancy.define('Fancy.spark.GrossLoss', {
  maxValue: 100,
  tipTpl: '<span style="color: {color};">●</span> {value} {suffix}',
  tip: true,
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

    if(!me.tipTpl || !me.tip){
      return;
    }

    if(me.percents){
      suffix = ' %';
    }

    var tpl = new Fancy.Template(me.tipTpl);
    text = tpl.getHTML({
      value: value,
      color: color,
      suffix: suffix
    });

    Fancy.tip.update(text);
  },
  /*
   *
   */
  onMouseLeave: function(){
    var me = this;
    if(!me.tipTpl || !me.tip){
      return;
    }

    Fancy.tip.hide(500);
  },
  /*
   * @param {Object} e
   */
  onMouseMove:  function(e){
    var me = this;
    if(!me.tipTpl || !me.tip){
      return;
    }

    Fancy.tip.show(e.pageX + 15, e.pageY - 25);
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
});