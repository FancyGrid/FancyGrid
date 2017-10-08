/*
 * @class Fancy.grid.plugin.Summary
 * @extend Fancy.Plugin
 */

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
  /*
   *
   */
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
  /*
   * @param {String} side
   * @return {Fancy.Element}
   */
  generateRow: function(side){
    var me = this,
      w = me.widget,
      cellCls = w.cellCls,
      cellInnerCls = w.cellInnerCls,
      cellHeight = w.cellHeight,
      columnsWidth = w.getColumnsWidth(side),
      clsSummaryRow = w.clsSummaryRow,
      clsSummaryContainer = w.clsSummaryContainer,
      el = Fancy.get(document.createElement('div')),
      cells = '';

    Fancy.each(w.getColumns(side), function(column){
      cells += [
        '<div style="width:'+column.width+'px;height:'+ cellHeight +'px;" class="' + cellCls + '">',
          '<div class="' + cellInnerCls + '"></div>',
        '</div>'
      ].join("");
    });

    var inner = [
      '<div style="position: relative;" class="'+clsSummaryRow+'">',
        cells,
      '</div>'
    ].join("");

    el.update(inner);

    el.css('width', columnsWidth + 'columnsWidth');
    el.addCls(clsSummaryContainer);
    if(me.position === 'bottom'){
      el.addCls('fancy-grid-summary-row-bottom');
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
  /*
   * @param {Number} value
   */
  scrollLeft: function(value){
    var me = this;

    me.el.firstChild().css('left', value);
  },
  /*
   *
   */
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
  /*
   * @param {String} side
   * @return {Fancy.Element}
   */
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
  /*
   * @param {String} side
   */
  updateSide: function(side){
    var me = this,
      w = me.widget,
      body = w.body,
      s = w.store,
      cellInners = me.getEl(side).select('.' + w.cellInnerCls),
      dataProperty = 'data';

    if(me.sumDisplayed){
      dataProperty = 'dataView';
    }

    Fancy.each(w.getColumns(side), function(column, i){
      if(!column.summary){
        return;
      }

      var columnIndex = column.index,
        columnValues = s.getColumnOriginalValues(columnIndex, {
          smartIndexFn: column.smartIndexFn,
          dataProperty: dataProperty
        }),
        value = '';

      switch(Fancy.typeOf(column.summary)){
        case 'string':
          value = Fancy.Array[column.summary](columnValues);
          break;
        case 'object':
          value = Fancy.Array[column.summary.type](columnValues);
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
    });
  },
  /*
   *
   */
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
  /*
   * @param {String} side
   */
  updateSizes: function(side){
    var me = this,
      w = me.widget,
      el = me.getEl(side),
      cells = el.select('.' + w.cellCls),
      totalWidth = 0;

    Fancy.each(w.getColumns(side), function (column, i) {
      totalWidth += column.width;
      cells.item(i).css('width', column.width + 'px');
    });

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
  /*
   *
   */
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
  /*
   * @param {Number} index
   * @param {String} side
   */
  removeColumn: function(index, side){
    var me = this,
      w = me.widget,
      el = me.getEl(side),
      cells = el.select('.' + w.cellCls),
      cell = cells.item(index);

    cell.destroy();

    me.updateSizes(side);
  },
  /*
   * @param {Number} index
   * @param {String} side
   */
  insertColumn: function(index, side){
    var me = this,
      w = me.widget,
      columns = w.getColumns(side),
      column = columns[index],
      el = me.getEl(side),
      cells = el.select('.' + w.cellCls),
      cell = cells.item(index - 1),
      newCell = Fancy.get(document.createElement('div'));

    if(index === 0){
      cell = cells.item(0);
    }

    newCell.css({
      width: column.width,
      height: w.cellHeight
    });

    newCell.addCls(w.cellCls);
    newCell.update('<div class="' + w.cellInnerCls + '"></div>');

    if(index === 0){
      cell.before(newCell.dom);
    }
    else{
      cell.after(newCell.dom);
    }

    me.updateSizes(side);
    me.updateSide(side);
  },
  /*
   *
   */
  onChangePage: function(){
    var me = this;

    me.update();
  }
});