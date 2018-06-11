/*
 * @class Fancy.grid.plugin.Exporter
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.Exporter', {
  extend: Fancy.Plugin,
  ptype: 'grid.exporter',
  inWidgetName: 'exporter',
  csvSeparator: ',',
  csvHeader: false,
  csvFileName: 'export',
  excelFileName: 'export',
  /*
   * @param {Object} config
   */
  constructor: function(config){
    this.Super('const', arguments);

    if(Fancy.fullBuilt){
      Fancy.loadModule('excel');
    }
  },
  /*
   *
   */
  init: function(){},
  /*
   *
   */
  exportToExcel: function(o){
    var me = this,
      w = me.widget,
      o = o || {},
      columnsData = me.getColumnsData(),
      data = me.getData(),
      dataToExport = o.header === false? data : [columnsData].concat(data),
      Workbook = function(){
        if(!(this instanceof Workbook)) return new Workbook();
        this.SheetNames = [];
        this.Sheets = {};
      },
      wb = new Workbook(),
      ws = me.sheet_from_array_of_arrays(dataToExport);

    ws['!cols'] = [];

    Fancy.each(me.widths, function(width){
      ws['!cols'].push({
        wch: width
      });
    });

    var title = w.title;

    if(o.fileName){
      title = o.fileName;
    }
    else if(Fancy.isObject(title)){
      title = title.text;
    }

    var ws_name = title || me.excelFileName;

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});

    function s2ab(s){
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }

    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), ws_name + ".xlsx")
  },
  /*
   * @return {Array}
   */
  getColumnsData: function(){
    var me = this,
      w = me.widget,
      columns = [].concat(w.leftColumns).concat(w.columns).concat(w.rightColumns),
      data = [];

    me.widths = [];

    Fancy.each(columns, function(column){
      if(column.index === '$selected'){
        return;
      }

      me.widths.push(column.width);
      data.push(column.title || '');
    });

    return data;
  },
  /*
   * @return {Array}
   */
  getData: function(){
    var me = this,
      w = me.widget,
      data = [],
      displayedData = w.getDisplayedData();

    Fancy.each(displayedData, function(rowData){
      var _rowData = [];

      Fancy.each(rowData, function(value){
        _rowData.push(value);
      });

      data.push(_rowData);
    });

    return data;
  },
  /*
   * @param {Array} data
   * @param {Array} opts
   * @return {Object}
   */
  sheet_from_array_of_arrays: function(data, opts){
    var ws = {},
      range = {
        s: {
          c:10000000,
          r:10000000
        },
        e: {
          c:0,
          r:0
        }
      },
      R = 0,
      RL = data.length;

    var datenum = function(v, date1904){
      if(date1904){
        v += 1462;
      }
      var epoch = Date.parse(v);

      return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
    };

    for(;R != RL;++R){
      for(var C = 0; C != data[R].length; ++C) {
        if(range.s.r > R) {
          range.s.r = R;
        }

        if(range.s.c > C) {
          range.s.c = C;
        }

        if(range.e.r < R) {
          range.e.r = R;
        }

        if(range.e.c < C) {
          range.e.c = C;
        }

        var cell = {
          v: data[R][C]
        };

        if(cell.v == null) {
          continue;
        }

        var cell_ref = XLSX.utils.encode_cell({
          c:C,
          r:R
        });

        if(typeof cell.v === 'number') {
          cell.t = 'n';
        }
        else if(typeof cell.v === 'boolean') {
          cell.t = 'b';
        }
        else if(cell.v instanceof Date) {
          cell.t = 'n'; cell.z = XLSX.SSF._table[14];
          cell.v = datenum(cell.v);
        }
        else {
          cell.t = 's';
        }

        ws[cell_ref] = cell;
      }
    }

    if(range.s.c < 10000000) {
      ws['!ref'] = XLSX.utils.encode_range(range);
    }

    return ws;
  },
  /*
   * @param {Object} o
   * @return {String}
   */
  getDataAsCsv: function (o) {
    var me = this,
      w = me.widget,
      data = me.getData(),
      str = '',
      o = o || {},
      separator = o.separator || me.csvSeparator,
      header = o.header || me.csvHeader;

    if(header){
      var fn = function(column){
        if(column.hidden){
          return;
        }

        str += '"' + (column.title || '') + '"' + separator;
      };

      Fancy.each(w.leftColumns, fn);
      Fancy.each(w.columns, fn);
      Fancy.each(w.rightColumns, fn);

      str = str.substring(0, str.length - 1);
      str += '\r\n';
    }

    Fancy.each(data, function (row, i) {
      Fancy.each(row, function (value, j) {
        if(Fancy.isString(value)){
          value = '"' + value + '"';
        }
        str += value + separator;
      });

      str = str.substring(0, str.length - 1);

      str += '\r\n';
    });
    
    return str;
  },
  /*
   * @param {Object} o
   * @return {String}
   */
  exportToCSV: function (o) {
    var me = this,
      w = me.widget,
      o = o || {},
      csvData = me.getDataAsCsv(o),
      fileName = o.fileName || me.csvFileName;

    //var blobObject = new Blob(["\ufeff", csvData], {
    var blobObject = new Blob([csvData], {
      type: "text/csv;charset=utf-8;"
    });

    // Internet Explorer
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blobObject, fileName);
    }
    else {
      // Chrome
      var downloadLink = document.createElement("a");
      downloadLink.href = window.URL.createObjectURL(blobObject);
      downloadLink.download = fileName + '.csv';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }
});