/*
 * @class Fancy.grid.plugin.ChartIntegration
 */
Fancy.modules['chart-integration'] = true;
Fancy.define('Fancy.grid.plugin.ChartIntegration', {
  extend: Fancy.Plugin,
  ptype: 'grid.chartintegration',
  inWidgetName: 'chartintegration',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(){
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);
    me.initKeys();
    me.initBind();

    me.ons();
  },
  /*
   *
   */
  initKeys: function(){
    var me = this,
      chart = me.chart,
      i = 0,
      iL = chart.length;

    for(;i<iL;i++){
      var _chart = chart[i],
        fields = _chart.fields,
        k = 0,
        kL,
        keys = {};

      if(Fancy.isString(fields)){
        keys = fields;
      }
      else {

        kL = fields.length;

        for (; k < kL; k++) {
          keys[fields[k]] = true;
        }
      }

      chart[i].keys = keys;
    }
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget,
      s = w.store;

    w.once('render', function(){
      if(me.toChart){
        me.renderToChart();
      }
      else{
        me.readDataFromChart();
      }

      s.on('set', me.onSet, me);
      s.on('sort', me.onSort, me);
    });
  },
  /*
   *
   */
  renderToChart: function(){
    var me = this,
      w = me.widget,
      chart = me.chart,
      i = 0,
      iL = chart.length;

    for(;i<iL;i++){
      var _chart = chart[i],
        type = _chart.type;

      switch(type){
        case 'highchart':
        case 'highcharts':
          w.highchart.setData(_chart);
          break;
      }
    }
  },
  /*
   * @param {Object} store
   * @param {Object} o
   */
  onSet: function(store, o){
    var me = this,
      w = me.widget,
      chart = me.chart,
      i = 0,
      iL = chart.length,
      key = o.key;

    for(;i<iL;i++){
      var _chart = chart[i],
        type = _chart.type;

      if(_chart.keys[key] !== true){
        continue;
      }

      switch(type){
        case 'highchart':
        case 'highcharts':
          w.highchart.set(_chart, o);
          break;
      }
    }
  },
  /*
   * @param {Object} store
   * @param {Object} o
   */
  onSort: function(store, o){
    var me = this,
      w = me.widget,
      chart = me.chart,
      i = 0,
      iL = chart.length;

    for(;i<iL;i++){
      var _chart = chart[i],
        type = _chart.type;

      switch(type) {
        case 'highchart':
        case 'highcharts':
          if (_chart.sortBind !== false) {
            var categories = w.highchart.sort(_chart, o);
            chart[i].categories = categories.original;
          }
          break;
      }
    }
  },
  /*
   *
   */
  readDataFromChart: function(){
    var me = this,
      w = me.widget,
      s = w.store,
      chart = me.chart,
      _chart = chart[0],
      type = _chart.type,
      data;

    switch(type){
      case 'highchart':
      case 'highcharts':
        data = w.highchart.getData(_chart);
        break;
    }

    w.reConfigStore(data);
    s.setData(data);
  },
  /*
   *
   */
  initBind: function(){
    var me = this,
      chart = me.chart,
      _chart,
      i = 0,
      iL = chart.length;

    for(;i<iL;i++){
      _chart = chart[i];

      if(_chart.bind){
        me.chartBind(_chart);
      }
    }
  },
  /*
   * @param {Object} chart
   */
  chartBind: function(chart){
    var me = this,
      w = me.widget,
      bind = chart.bind;

    w.on(bind.event, me.onBindEvent, {
      chart: chart
    });
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onBindEvent: function(grid, o){
    var me = this,
      w = grid,
      chart = me.chart,
      bind = chart.bind,
      series = bind.series,
      data = o.data,
      id = chart.id;

    switch(bind.action){
      case 'add':
        var existedSeries = w.highchart.doesSeriesExist(id, data[series.name]),
          seriesNumber = w.highchart.getNumberSeries(id);

        if(existedSeries !== false && seriesNumber !== 1){
          w.highchart.removeSeries(id, existedSeries);
          return;
        }

        if(chart.maxToShow){
          if(chart.maxToShow <= seriesNumber){
            w.highchart.removeLastSeries(id);
          }
        }

        if(w.highchart.isTreeMap(id)){
          w.highchart.setSeriesData(id, {
            data: data[series.data]
          });
        }
        else {
          w.highchart.addSeries(id, {
            name: data[series.name],
            data: data[series.data]
          });
        }
        break;
    }
  }
});