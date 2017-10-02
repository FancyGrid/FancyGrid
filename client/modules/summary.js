/*
 * @class Fancy.grid.plugin.Summary
 * @extend Fancy.Plugin
 *
 */
Fancy.define('Fancy.Summary',{
  singleton: true,
  count: function(values){
    return values.length;
  },
  sum: function(values){
    var i = 0,
      iL = values.length,
      value = 0;

    if(Fancy.isArray(values[0])){
      value = [];
      for (;i<iL;i++){
        var j = 0,
          jL = values[i].length;

        for(;j<jL;j++){
          if(value[j] === undefined){
            value[j] = 0;
          }

          value[j] += values[i][j];
        }
      }
    }
    else {
      for (; i < iL; i++) {
        value += values[i];
      }
    }

    return value;
  },
  min: function(values){
    return Math.min.apply(this, values);
  },
  max: function(values){
    return Math.max.apply(this, values);
  }
});

Fancy.define('Fancy.grid.plugin.Summary', {
  extend: Fancy.Plugin,
  ptype: 'grid.summary',
  inWidgetName: 'summary',
  position: 'top',
  sumDisplayed: true,
  topOffSet: 0,
  bottomOffSet: 0,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);

    me.ons();
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget;

    w.once('render', function(){
      me.calcOffSets();
    });

    w.once('init', function(){
      me.render();
      me.update();

      w.on('update', function(){
        me.update();
      });
    });

    w.on('columnresize', me.onColumnResize, me);

    if(me.sumDisplayed){
      w.on('changepage', me.onChangePage, me);
    }
  },
  render: function(){
    var me = this,
      w = me.widget,
      body = w.body,
      leftBody = w.leftBody,
      rightBody = w.rightBody,
      width = w.getCenterFullWidth(),
      leftWidth = w.getLeftFullWidth(),
      rightWidth = w.getRightFullWidth(),
      el,
      method = me.position === 'top'? 'before': 'after';

    el = me.generateRow('center');
    el.css('width', w.startWidths.center);
    el.firstChild().css('width', width);
    el.css('height', w.cellHeight);
    el.firstChild().css('height', w.cellHeight);

    me.el = el;

    body.el[method](el.dom);

    if(leftWidth){
      el = me.generateRow('left');
      el.css('width', leftWidth - 2);
      el.firstChild().css('width', leftWidth);
      el.css('height', w.cellHeight);

      me.leftEl = el;

      leftBody.el[method](el.dom);
    }

    if(rightWidth){
      el = me.generateRow('right');
      el.css('width', rightWidth - 1);
      el.firstChild().css('width', rightWidth);
      el.css('height', w.cellHeight);

      me.rightEl = el;

      rightBody.el[method](el.dom);
    }
  },
  generateRow: function(side){
    var me = this,
      w = me.widget,
      cellHeight = w.cellHeight,
      columns = w.getColumns(side),
      columnsWidth = w.getColumnsWidth(side),
      clsSummaryRow = w.clsSummaryRow,
      clsSummaryContainer = w.clsSummaryContainer,
      el = Fancy.get(document.createElement('div'));

    var i = 0,
      iL = columns.length,
      cells = '';

    for(;i<iL;i++){
      var column = columns[i];

      cells += [
        '<div style="width:'+column.width+'px;height:'+ cellHeight +'px;" class="fancy-grid-cell">',
          '<div class="fancy-grid-cell-inner"></div>',
        '</div>'
      ].join("");
    }

    var inner = [
      '<div style="position: relative;" class="'+clsSummaryRow+'">',
        cells,
      '</div>'
    ].join("");

    el.update(inner);

    el.css('width', columnsWidth + 'columnsWidth');
    el.addClass(clsSummaryContainer);
    if(me.position === 'bottom'){
      el.addClass('fancy-grid-summary-row-bottom');
    }

    return el;
  },
  /*
   *
   */
  calcPlusScroll: function(){
    var me = this,
      w = me.widget;

    me.plusScroll = me.groups.length * w.groupRowHeight;
  },
  scrollLeft: function(value){
    var me = this;

    me.el.firstChild().css('left', value);
  },
  update: function(){
    var me = this,
      w = me.widget;

    me.updateSide('center');
    if(w.leftColumns.length){
      me.updateSide('left');
    }

    if(w.rightColumns.length){
      me.updateSide('right');
    }
  },
  getEl: function (side) {
    var me = this;

    switch(side){
      case 'center':
        return me.el;
      case 'left':
        return me.leftEl;
      case 'right':
        return me.rightEl;
      default:
        return me.el;
    }
  },
  updateSide: function(side){
    var me = this,
      w = me.widget,
      body = w.body,
      s = w.store,
      columns = w.getColumns(side),
      cellInners = me.getEl(side).select('.fancy-grid-cell-inner'),
      i = 0,
      iL = columns.length,
      dataProperty = 'data';

    if(me.sumDisplayed){
      dataProperty = 'dataView';
    }

    for(;i<iL;i++){
      var column = columns[i];

      if(!column.summary){
        continue;
      }

      var columnIndex = column.index,
        columnValues = s.getColumnOriginalValues(columnIndex, {
          smartIndexFn: column.smartIndexFn,
          dataProperty: dataProperty
        }),
        value = '';

      switch(Fancy.typeOf(column.summary)){
        case 'string':
          value = Fancy.Summary[column.summary](columnValues);
          break;
        case 'object':
          value = Fancy.Summary[column.summary.type](columnValues);
          if(column.summary.fn){
            value = column.summary.fn(value);
          }
          break;
        case 'function':
          value = column.summary(columnValues);
          break;
      }

      if(column.format){
        value = body.format(value, column.format);
      }

      cellInners.item(i).update(value);
    }
  },
  onColumnResize: function(){
    var me = this,
      w = me.widget;

    me.updateSizes('center');

    if(w.leftColumns.length){
      me.updateSizes('left');
    }

    if(w.rightColumns.length){
      me.updateSizes('right');
    }
  },
  updateSizes: function(side){
    var me = this,
      w = me.widget,
      el = me.getEl(side),
      cells = el.select('.fancy-grid-cell'),
      columns = w.getColumns(side),
      i = 0,
      iL = columns.length,
      totalWidth = 0;

    for(;i<iL;i++){
      var column = columns[i],
        cell = cells.item(i);

      totalWidth += column.width;

      cell.css('width', column.width + 'px');
    }

    el.firstChild().css('width', totalWidth);

    switch(side){
      case 'center':
        me.el.css('width', w.centerEl.css('width'));
        break;
      case 'left':
        me.leftEl.css('width', parseInt(w.leftEl.css('width')) - 2);
        break;
      case 'right':
        me.rightEl.css('width', parseInt(w.rightEl.css('width')) - 1);
        break;
    }
  },
  calcOffSets: function(){
    var me = this,
      w = me.widget;

    switch(me.position){
      case 'top':
        me.topOffSet = w.cellHeight;
        break;
      case 'bottom':
        me.bottomOffSet = w.cellHeight;
        break;
      case 'both':
        me.topOffSet = w.cellHeight;
        me.bottomOffSet = w.cellHeight;
        break;
    }
  },
  removeColumn: function(index, side){
    var me = this,
      el = me.getEl(side),
      cells = el.select('.fancy-grid-cell'),
      cell = cells.item(index);

    cell.destroy();

    me.updateSizes(side);
  },
  insertColumn: function(index, side){
    var me = this,
      w = me.widget,
      columns = w.getColumns(side),
      column = columns[index],
      el = me.getEl(side),
      cells = el.select('.fancy-grid-cell'),
      cell = cells.item(index - 1),
      newCell = Fancy.get(document.createElement('div'));

    if(index === 0){
      cell = cells.item(0);
    }

    newCell.css({
      width: column.width,
      height: w.cellHeight
    });

    newCell.addClass(w.cellCls);
    newCell.update('<div class="fancy-grid-cell-inner"></div>');

    if(index === 0){
      cell.before(newCell.dom);
    }
    else{
      cell.after(newCell.dom);
    }

    me.updateSizes(side);
    me.updateSide(side);
  },
  onChangePage: function(){
    var me = this;

    me.update();
  }
});