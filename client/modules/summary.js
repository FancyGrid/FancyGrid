/*
 * @class Fancy.grid.plugin.Summary
 * @extend Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_CELL_CLS = F.GRID_CELL_CLS;
  var GRID_CELL_INNER_CLS = F.GRID_CELL_INNER_CLS;
  var GRID_CELL_EVEN_CLS = F.GRID_CELL_EVEN_CLS;
  var GRID_ROW_SUMMARY_CLS = F.GRID_ROW_SUMMARY_CLS;
  var GRID_ROW_SUMMARY_CONTAINER_CLS = F.GRID_ROW_SUMMARY_CONTAINER_CLS;
  var GRID_ROW_SUMMARY_BOTTOM_CLS = F.GRID_ROW_SUMMARY_BOTTOM_CLS;
  var GRID_COLUMN_SPARKLINE_CLS = F.GRID_COLUMN_SPARKLINE_CLS;
  var GRID_COLUMN_SPARKLINE_BULLET_CLS = F.GRID_COLUMN_SPARKLINE_BULLET_CLS;
  var GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS = F.GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS;
  var GRID_COLUMN_GROSSLOSS_CLS = F.GRID_COLUMN_GROSSLOSS_CLS;

  var ANIMATE_DURATION = F.ANIMATE_DURATION;

  F.define('Fancy.grid.plugin.Summary', {
    extend: F.Plugin,
    ptype: 'grid.summary',
    inWidgetName: 'summary',
    position: 'top',
    sumDisplayed: true,
    topOffSet: 0,
    bottomOffSet: 0,
    striped: false,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      this.Super('init', arguments);

      this.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget;

      w.once('render', function () {
        me.calcOffSets();
      });

      w.once('init', function () {
        me.render();
        me.update();

        w.on('update', function () {
          me.update();
        });

        w.on('set', function () {
          me.update();
        });
      });

      w.on('columnresize', me.onColumnResize, me);

      if (me.sumDisplayed) {
        w.on('changepage', me.onChangePage, me);
      }

      w.on('columndrag', me.onColumnDrag, me);
    },
    /*
     *
     */
    render: function () {
      var me = this,
        w = me.widget,
        body = w.body,
        leftBody = w.leftBody,
        rightBody = w.rightBody,
        width = w.getCenterFullWidth(),
        leftWidth = w.getLeftFullWidth(),
        rightWidth = w.getRightFullWidth(),
        el,
        method = me.position === 'top' ? 'before' : 'after';

      el = me.generateRow('center');
      el.css('width', w.startWidths.center);
      el.firstChild().css('width', width);
      el.css('height', w.cellHeight);
      el.firstChild().css('height', w.cellHeight);

      me.el = el;

      body.el[method](el.dom);

      if (leftWidth) {
        el = me.generateRow('left');
        el.css('width', leftWidth - 2);
        el.firstChild().css('width', leftWidth);
        el.css('height', w.cellHeight);

        me.leftEl = el;

        leftBody.el[method](el.dom);
      }

      if (rightWidth) {
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
    generateRow: function (side) {
      var me = this,
        w = me.widget,
        cellHeight = w.cellHeight,
        columnsWidth = w.getColumnsWidth(side),
        el = F.get(document.createElement('div')),
        cells = '';

      F.each(w.getColumns(side), function (column) {
        cells += [
          '<div style="width:' + column.width + 'px;height:' + cellHeight + 'px;'+(column.cellAlign? 'text-align:' + column.cellAlign + ';': '') +'" class="' + GRID_CELL_CLS + '">',
          '<div class="' + GRID_CELL_INNER_CLS + '"></div>',
          '</div>'
        ].join("");
      });

      var inner = [
        '<div style="position: relative;" class="' + GRID_ROW_SUMMARY_CLS + '">',
        cells,
        '</div>'
      ].join("");

      el.update(inner);

      el.css('width', columnsWidth + 'columnsWidth');
      el.addCls(GRID_ROW_SUMMARY_CONTAINER_CLS);
      if (me.position === 'bottom') {
        el.addCls(GRID_ROW_SUMMARY_BOTTOM_CLS);
      }

      return el;
    },
    /*
     *
     */
    calcPlusScroll: function () {
      var me = this,
        w = me.widget;

      me.plusScroll = me.groups.length * w.groupRowHeight;
    },
    /*
     * @param {Number} value
     */
    scrollLeft: function (value) {
      this.el.firstChild().css('left', value);
    },
    /*
     *
     */
    update: function () {
      var me = this,
        w = me.widget;

      me.updateSide('center');
      if (w.leftColumns.length) {
        me.updateSide('left');
      }

      if (w.rightColumns.length) {
        me.updateSide('right');
      }

      if(me.striped && me.position === 'bottom'){
        var cells = w.el.select('.' + GRID_ROW_SUMMARY_BOTTOM_CLS + ' .' + GRID_CELL_CLS);
        if(w.getViewTotal() % 2 === 1){
          cells.addCls(GRID_CELL_EVEN_CLS);
        }
        else{
          cells.removeCls(GRID_CELL_EVEN_CLS);
        }
      }
    },
    /*
     * @param {String} side
     * @return {Fancy.Element}
     */
    getEl: function (side) {
      var me = this;

      switch (side) {
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
    updateSide: function (side) {
      var me = this,
        w = me.widget,
        body = w.body,
        s = w.store,
        cellInners = me.getEl(side).select('.' + GRID_CELL_INNER_CLS),
        dataProperty = 'data';

      if (me.sumDisplayed) {
        dataProperty = 'dataView';
      }

      F.each(w.getColumns(side), function (column, i) {
        if (!column.summary) {
          return;
        }

        var columnIndex = column.index,
          columnValues = s.getColumnOriginalValues(columnIndex, {
            smartIndexFn: column.smartIndexFn,
            dataProperty: dataProperty
          }),
          value = '',
          cell = cellInners.item(i).parent();

        switch (F.typeOf(column.summary)) {
          case 'string':
            value = F.Array[column.summary](columnValues);
            break;
          case 'object':
            value = F.Array[column.summary.type](columnValues);
            if (column.summary.fn) {
              value = column.summary.fn(value);
            }
            break;
          case 'function':
            value = column.summary(columnValues);
            break;
        }

        switch(column.type){
          case 'sparklineline':
          case 'sparklinebar':
          case 'sparklinetristate':
          case 'sparklinebullet':
          case 'sparklinebox':
          case 'sparklinepie':
          case 'sparklinediscrete':
            cell.addCls(GRID_COLUMN_SPARKLINE_CLS);

            var columnWidth = column.width,
              sparkHeight = w.cellHeight - 1,
              sparkWidth = columnWidth - 20,
              widthName,
              type = column.type.replace('sparkline', '');

            switch (type) {
              case 'line':
              case 'pie':
              case 'box':
                widthName = 'width';
                break;
              case 'bullet':
                widthName = 'width';
                sparkHeight -= 11;
                cell.addCls(GRID_COLUMN_SPARKLINE_BULLET_CLS);
                break;
              case 'discrete':
                widthName = 'width';
                sparkWidth = columnWidth;
                sparkHeight -= 2;
                break;
              case 'bar':
              case 'tristate':
                widthName = 'barWidth';
                break;
            }

            var _sparkConfig = column.sparkConfig || {};
            var sparkConfig = {
              type: type,
              fillColor: 'transparent',
              height: sparkHeight
            };

            F.apply(sparkConfig, _sparkConfig);

            if (type === 'bar' || type === 'tristate') {
              sparkWidth = columnWidth - 20;
              sparkWidth = sparkWidth / value.length;
            }

            sparkConfig[widthName] = sparkWidth;
            cellInners.item(i).$dom.sparkline(value, sparkConfig);
            break;
          case 'progressdonut':
            cell.addCls(GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS);

            var sparkConfig = column.sparkConfig || {};

            F.apply(sparkConfig, {
              renderTo: cellInners.item(i).dom,
              value: value
            });

            if (!sparkConfig.size && !sparkConfig.height && !sparkConfig.width) {
              sparkConfig.size = w.cellHeaderHeight - 3 * 2;
            }

            F.get(sparkConfig.renderTo).update('');

            new F.spark.ProgressDonut(sparkConfig);
            break;
          case 'grossloss':
            cell.addCls(GRID_COLUMN_GROSSLOSS_CLS);

            var sparkConfig = column.sparkConfig || {};

            if (sparkConfig.showOnMax) {
              sparkConfig.maxValue = Math.max.apply(Math, columnValues);
            }

            if(value > 50){
              value = 50;
            }

            F.apply(sparkConfig, {
              renderTo: cellInners.item(i).dom,
              value: value,
              column: column
            });

            new F.spark.GrossLoss(sparkConfig);
            break;
          default:
            if (column.format) {
              value = body.format(value, column.format);
            }

            cellInners.item(i).update(value);
        }
      });
    },
    /*
     *
     */
    onColumnResize: function () {
      var me = this,
        w = me.widget;

      me.updateSizes('center');

      if (w.leftColumns.length) {
        me.updateSizes('left');
      }

      if (w.rightColumns.length) {
        me.updateSizes('right');
      }
    },
    /*
     * @param {String} side
     */
    updateSizes: function (side) {
      var me = this,
        w = me.widget,
        el = me.getEl(side),
        cells = el.select('.' + GRID_CELL_CLS),
        totalWidth = 0;

      F.each(w.getColumns(side), function (column, i) {
        totalWidth += column.width;
        cells.item(i).animate({width: column.width}, ANIMATE_DURATION);
      });

      el.firstChild().animate({width: totalWidth}, ANIMATE_DURATION);

      switch (side) {
        case 'center':
          me.el.animate({width: parseInt(w.centerEl.css('width'))}, ANIMATE_DURATION);
          break;
        case 'left':
          me.leftEl.animate({width: parseInt(w.leftEl.css('width')) - 2}, ANIMATE_DURATION);
          break;
        case 'right':
          me.rightEl.animate({width: parseInt(w.rightEl.css('width')) - 1}, ANIMATE_DURATION);
          break;
      }
    },
    /*
     *
     */
    calcOffSets: function () {
      var me = this,
        w = me.widget;

      switch (me.position) {
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
    removeColumn: function (index, side) {
      var el = this.getEl(side),
        cells = el.select('.' + GRID_CELL_CLS),
        cell = cells.item(index);

      cell.destroy();

      this.updateSizes(side);
    },
    /*
     * @param {Number} index
     * @param {String} side
     */
    insertColumn: function (index, side) {
      var me = this,
        w = me.widget,
        columns = w.getColumns(side),
        column = columns[index],
        el = me.getEl(side),
        cells = el.select('.' + GRID_CELL_CLS),
        cell = cells.item(index - 1),
        newCell = F.get(document.createElement('div'));

      if (index === 0) {
        cell = cells.item(0);
      }

      newCell.css({
        width: column.width,
        height: w.cellHeight
      });

      newCell.addCls(GRID_CELL_CLS);
      newCell.update('<div class="' + GRID_CELL_INNER_CLS + '"></div>');

      if (index === 0) {
        cell.before(newCell.dom);
      }
      else {
        cell.after(newCell.dom);
      }


      me.updateSizes(side);
      me.updateSide(side);
    },
    /*
     *
     */
    onChangePage: function () {
      var me = this;

      setTimeout(function () {
        me.update();
      }, 100);
    },
    /*
     *
     */
    onColumnDrag: function () {
      var me = this,
        w = me.widget;

      me.updateSizes('center');

      if (w.leftColumns.length) {
        me.updateSizes('left');
      }

      if (w.rightColumns.length) {
        me.updateSizes('right');
      }
    }
  });

})();