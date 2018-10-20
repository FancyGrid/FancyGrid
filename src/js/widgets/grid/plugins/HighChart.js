/*
 * @class Fancy.grid.plugin.HighChart
 */
Fancy.define('Fancy.grid.plugin.HighChart', {
  extend: Fancy.Plugin,
  ptype: 'grid.highchart',
  inWidgetName: 'highchart',
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
    this.Super('init', arguments);
    this.ons();
  },
  /*
   *
   */
  ons: function(){},
  /*
   * @param {Object} chartConfig
   */
  setData: function(chartConfig){
    var me = this,
      w = me.widget,
      s = w.store,
      data = s.getDataView(),
      fields = chartConfig.fields,
      j = 0,
      jL = data.length,
      i = 0,
      iL = fields.length,
      chart = me.getChart(chartConfig.id),
      series = chart.series,
      read = chartConfig.read;

    if(read){
      if(read.rowIndex !== undefined){
        data = [data[read.rowIndex]];
        iL = 1;
      }
    }

    if(Fancy.isString(fields)){
      for (; i < iL; i++) {
        var indexData = data[i][fields],
          sery = series[i],
          seryData = [],
          j = 0,
          jL = indexData.length;

        if(chartConfig.names){
          for (; j < jL; j++) {
            var seryConfig = {
              name: chartConfig.names[j],
              value: indexData[j]
            };

            seryData.push(seryConfig);
          }
        }
        else {
          for (; j < jL; j++) {
            seryData.push(indexData[j]);
          }
        }

        if(sery) {
          sery.setData(seryData);

          if(chartConfig.name){
            sery.update({
              name: data[i][chartConfig.name]
            });
          }
        }
        else{
          break;
        }
      }
    }
    else {
      for (; i < iL; i++) {
        var fieldName = fields[i],
          sery = series[i],
          seryData = [];

        j = 0;
        for (; j < jL; j++) {
          seryData.push(data[j][fieldName]);
        }

        sery.setData(seryData);
      }
    }
  },
  /*
   * @param {String} id
   * @param {Array} data
   */
  setSeriesData: function(id, data){
    var chart = this.getChart(id),
      sery = chart.series[0];

    sery.setData(data.data);
  },
  /*
   * @param {Object} chartConfig
   * @param {Object} o
   */
  set: function(chartConfig, o){
    var fieldsMap = this.getFieldsMap(chartConfig),
      _chart = this.getChart(chartConfig.id),
      series = _chart.series,
      sery;

    sery = series[fieldsMap[o.key]];
    sery.data[o.rowIndex].update(Number(o.value));
  },
  /*
   * @param {Object} chartConfig
   * @return {Object}
   */
  sort: function(chartConfig){
    var me = this,
      w = me.widget,
      s = w.store,
      _chart = me.getChart(chartConfig.id),
      categories = chartConfig.categories?chartConfig.categories : _chart.xAxis[0].categories,
      order = s.order,
      newCategories = [],
      i = 0,
      iL = order? order.length:categories.length;

    if(!order){
      for (; i < iL; i++) {
        newCategories.push(categories[i]);
      }
    }
    else {
      for (; i < iL; i++) {
        newCategories.push(categories[order[i]]);
      }
    }
    _chart.xAxis[0].update({categories: newCategories}, true);

    me.update(chartConfig);

    return {
      original: categories,
      newCategories: newCategories
    };
  },
  /*
   * @param {Object} chartConfig
   */
  update: function(chartConfig){
    var me = this,
      w = me.widget,
      s = w.store,
      data = s.getDataView(),
      fields = chartConfig.fields,
      j = 0,
      jL = data.length,
      i = 0,
      iL,
      chart = me.getChart(chartConfig.id),
      series = chart.series,
      _data = [],
      k = 0,
      kL = fields.length;

    for(;k<kL;k++){
      var fieldName = fields[k];
      j = 0;
      var row = [];
      for(;j<jL;j++){

        row.push(data[j][fieldName]);
      }

      _data.push(row);
    }

    iL = series.length;
    for(;i<iL;i++){
      var sery = series[i];

      sery.setData(_data[i], false);
    }

    chart.redraw();
  },
  /*
   * @param {Object} chartConfig
   * @return {Array}
   */
  getData: function(chartConfig){
    var me = this,
      chart = me.getChart(chartConfig.id),
      fields =  fields = chartConfig.fields,
      i = 0,
      iL = fields.length,
      series = chart.series,
      jL = series[0].data.length,
      data = [];

    for(;i<iL;i++){
      var fieldName = fields[i],
        j = 0,
        sery = series[i];

      for(;j<jL;j++){
        if( data[j] === undefined ){
          data[j] = {};
        }

        data[j][fieldName] = sery.data[j].y;
      }
    }

    var indexes = me.getColumnsChartIndexes();
    i = 0;
    iL = indexes.length;

    for(;i<iL;i++){
      var index = indexes[i],
        splited = index.split('.'),
        values = chart[splited[0]][0][splited[1]];

      j = 0;
      jL = values.length;

      for(;j<jL;j++){
        data[j][index] = values[j];
      }
    }

    return data;
  },
  /*
   * @return {Array}
   */
  getColumnsChartIndexes: function(){
    var w = this.widget,
      indexes = [],
      columns = w.columns,
      i = 0,
      iL = columns.length;

    for(;i<iL;i++){
      var index = columns[i].index;

      if(/xAxis\../.test(index)){
        indexes.push(index)
      }
    }

    return indexes;
  },
  /*
   * @param {Object} chartConfig
   * @return {Object}
   */
  getFieldsMap: function(chartConfig){
    var fieldsMap = {},
      fields = chartConfig.fields,
      j = 0,
      jL = fields.length;

    for(;j<jL;j++){
      fieldsMap[fields[j]] = j;
    }

    return fieldsMap;
  },
  /*
   * @param {String} id
   * @param {Object} o
   */
  addSeries: function(id, o){
    var chart = this.getChart(id);

    chart.addSeries(o);
  },
  /*
   * @param {String} id
   * @return {Number}
   */
  getNumberSeries: function(id){
    var chart = this.getChart(id);

    return chart.series.length;
  },
  /*
   * @param {String} id
   */
  removeLastSeries: function(id){
    var chart = this.getChart(id);

    chart.series[chart.series.length - 1].remove();
  },
  /*
   * @param {String} id
   * @param {String} index
   */
  removeSeries: function(id, index){
    var chart = this.getChart(id);

    chart.series[index].remove();
  },
  /*
   * @param {String} id
   * @param {String} name
   * @return {false|Number}
   */
  doesSeriesExist: function(id, name){
    var me= this,
      chart = me.getChart(id),
      i = 0,
      iL = chart.series.length;

    for(;i<iL;i++){
      if( chart.series[i].name === name ){
        return i;
      }
    }

    return false;
  },
  /*
   * @param {String} id
   * @return {Boolean}
   */
  isTreeMap: function(id){
    var chart = this.getChart(id);

    if( chart.series[0] === undefined ){
      return false;
    }

    return chart.series[0].type === 'treemap';
  },
  /*
   * @param {String} id
   * @return {Object}
   */
  getChart: function(id){
    var charts = Highcharts.charts,
      chosenChart;

    charts.forEach(function(chart, index){
      if(chart.renderTo.id === id){
        chosenChart = chart;
      }
    });

    return chosenChart;
  }
});