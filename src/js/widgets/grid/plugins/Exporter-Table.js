/*
 * @class Fancy.grid.plugin.State
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.Exporter', {
  extend: Fancy.Plugin,
  ptype: 'grid.exporter',
  inWidgetName: 'exporter',
  /*
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){},
  /*
   *
   */
  exportToExcel: function(){
    var me = this,
      tableHead = me.getTableHead(),
      tableBody = me.getTableBody(),
      html,
      data_type = 'data:application/vnd.ms-excel';

    html = [
      '<div>',
      '<table>',
        '<tbody>',
          tableHead,
          tableBody,
        '</tbody>    ',
      '</table>    ',
      '</div>'
    ].join("");

    html = html.replace(/ /g, '%20');

    var fileName = 'grid_data_' + Math.floor((Math.random() * 9999999) + 1000000) + '.xls';

    if (window.navigator.msSaveOrOpenBlob) {
      // Internet Explorer
      //window.navigator.msSaveOrOpenBlob(data_type + ', ' + html, fileName);
      window.navigator.msSaveOrOpenBlob(html, fileName);
    }
    else {
      var a = document.createElement('a');
      a.href = data_type + ', ' + html;
      a.download = fileName;
      a.click();
    }
  },
  getTableHead: function(){
    var me = this,
      w = me.widget,
      str = ['<tr>'];

    Fancy.each(w.leftColumns, function(column){
      str.push('<th style="width:'+column.width+'px;">' + (column.title||'') + '</th>');
    });

    Fancy.each(w.columns, function(column){
      str.push('<th>' + (column.title||'') + '</th>');
    });

    Fancy.each(w.rightColumns, function(column){
      str.push('<th>' + (column.title||'') + '</th>');
    });

    str.push('</tr>');

    return str.join("");
  },
  getTableBody: function(){
    var me = this,
      w = me.widget,
      str = [],
      data = w.getDisplayedData();

    Fancy.each(data, function(rowData){
      str.push('<tr>');
      Fancy.each(rowData, function(value){
        str.push('<td>' + value + '</td>');
      });
      str.push('</tr>');
    });

    return str.join("");
  }
});