/*
 * @class Fancy.grid.plugin.Summary
 * @extend Fancy.Plugin
 */
Fancy.modules['summary'] = true;
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
    constructor: function () {
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

        if(me.options){
          me.initOptions();
        }
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

      w.on('columnresize', function(){
        me.onColumnResize();
      }, me);

      w.on('columnhide', me.onColumnHide, me);

      w.on('columnshow', me.onColumnShow, me);

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
        centerEl = w.centerEl,
        leftEl = w.leftEl,
        rightEl = w.rightEl,
        body = w.body,
        leftBody = w.leftBody,
        rightBody = w.rightBody,
        width = w.getCenterFullWidth(),
        leftWidth = w.getLeftFullWidth(),
        rightWidth = w.getRightFullWidth(),
        el,
        method = me.position === 'top' ? 'before' : 'after';

      if(centerEl.select('.' + GRID_ROW_SUMMARY_CONTAINER_CLS).length) {}
      else if(centerEl.select('.' + GRID_ROW_SUMMARY_BOTTOM_CLS).length) {}
      else {
        el = me.generateRow('center');
        el.css('width', w.startWidths.center);
        el.firstChild().css('width', width);
        el.css('height', w.cellHeight);
        el.firstChild().css('height', w.cellHeight);

        me.el = el;

        body.el[method](el.dom);
      }

      if (leftWidth) {
        if(leftEl.select('.' + GRID_ROW_SUMMARY_CONTAINER_CLS).length) {}
        else if(leftEl.select('.' + GRID_ROW_SUMMARY_BOTTOM_CLS).length) {}
        else {
          el = me.generateRow('left');
          if(me.position === 'bottom'){
            el.css('width', leftWidth);
          }
          else{
            el.css('width', leftWidth - 2);
          }

          el.firstChild().css('width', leftWidth);
          el.css('height', w.cellHeight);

          me.leftEl = el;

          leftBody.el[method](el.dom);
        }
      }

      if (rightWidth) {
        if(rightEl.select('.' + GRID_ROW_SUMMARY_CONTAINER_CLS).length) {}
        else if(rightEl.select('.' + GRID_ROW_SUMMARY_BOTTOM_CLS).length) {}
        else {
          el = me.generateRow('right');
          if(me.position === 'bottom'){
            el.css('width', rightWidth);
          }
          else {
            el.css('width', rightWidth - 1);
          }
          el.firstChild().css('width', rightWidth);
          el.css('height', w.cellHeight);

          me.rightEl = el;

          rightBody.el[method](el.dom);
        }
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
        cells = '',
        extraWidth = 0;

      F.each(w.getColumns(side), function (column, i) {
        cells += [
          '<div index="' + i + '" style="width:' + column.width + 'px;height:' + cellHeight + 'px;'+(column.cellAlign? 'text-align:' + column.cellAlign + ';': '') +'" class="' + GRID_CELL_CLS + '">',
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
        body = w.getBody(side),
        s = w.store,
        cellInners = me.getEl(side).select('.' + GRID_CELL_INNER_CLS),
        dataProperty = 'data';

      if (me.sumDisplayed) {
        dataProperty = 'dataView';
      }

      F.each(w.getColumns(side), function (column, i) {
        if (!column.summary) {
          cellInners.item(i).update('');
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
            if(column.summary === 'none'){
              value = '&nbsp;';
            }
            else {
              value = F.Array[column.summary](columnValues);
            }
            break;
          case 'object':
            value = F.Array[column.summary.type](columnValues);
            if (column.summary.fn) {
              value = column.summary.fn(value, column.summary.type);
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

      me.update();
    },
    onColumnHide: function (grid, options) {
      var me = this,
        w = me.widget;

      me.updateSizes('center');

      if (w.leftColumns.length) {
        me.updateSizes('left');
      }

      if (w.rightColumns.length) {
        me.updateSizes('right');
      }

      me.update();
    },
    onColumnShow: function (grid, options) {
      var me = this,
        w = me.widget;

      me.updateSizes('center');

      if (w.leftColumns.length) {
        me.updateSizes('left');
      }

      if (w.rightColumns.length) {
        me.updateSizes('right');
      }

      me.update();
    },
    /*
     * @param {String} side
     */
    updateSizes: function (side) {
      var me = this,
        w = me.widget,
        el = me.getEl(side),
        cells = el.select('.' + GRID_CELL_CLS),
        totalWidth = 0,
        columns = w.getColumns(side);

      F.each(columns, function (column, i) {
        totalWidth += column.width;

        var cell = cells.item(i);

        if(column.hidden){
          //cell.css('display', 'none');
        }
        else{
          //cell.css('display', '');
        }

        cell.animate({width: column.width}, ANIMATE_DURATION);
      });

      el.firstChild().animate({width: totalWidth}, ANIMATE_DURATION);

      switch (side) {
        case 'center':
          me.el.animate({width: totalWidth}, ANIMATE_DURATION);
          break;
        case 'left':
          if(me.position === 'bottom'){
            me.leftEl.animate({width: totalWidth}, ANIMATE_DURATION);
          }
          else{
            me.leftEl.animate({width: totalWidth - 2}, ANIMATE_DURATION);
          }
          break;
        case 'right':
          if(me.position === 'bottom'){
            me.rightEl.animate({width: totalWidth}, ANIMATE_DURATION);
          }
          else {
            me.rightEl.animate({width: totalWidth - 1}, ANIMATE_DURATION);
          }
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
        columns = w.getColumns(side);

      if((side === 'left' || side === 'right') && columns.length === 1){
        me.render();
      }

      var columns = w.getColumns(side),
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
    },
    /*
     *
     */
    initOptions: function () {
      var me = this,
        w = me.widget,
        docEl = F.get(document.body);

      w.addCls('fancy-grid-summary-options');
      w.el.on('click', me.onOptionClick, me, '.fancy-grid-summary-container .fancy-grid-cell');

      docEl.on('click', function (e) {
        var el = F.get(e.target);

        if(me.justShownSummaryMenu){
          delete me.justShownSummaryMenu;
          return;
        }

        if(!el.closest('.fancy-menu').dom && me.activeSummaryMenu){
          me.activeSummaryMenu.hide();
          delete me.activeSummaryMenu;
        }
      });
    },
    /*
     * @param {Object} e
     */
    onOptionClick: function (e) {
      var me = this,
        w = me.widget,
        cellEl = F.get(e.currentTarget),
        column = me.getColumnBySummaryCell(cellEl),
        menu,
        minMenuWidth = 100;

      me.justShownSummaryMenu = true;

      if(me.activeSummaryMenu){
        me.activeSummaryMenu.hide();
        delete me.activeSummaryMenu;
      }

      if(column.summaryMenu){
        menu = column.summaryMenu;
      }
      else {
        var items = me.generateColumnSummaryItems(column);

        menu = new Fancy.Menu({
          minWidth: minMenuWidth,
          width: parseInt(cellEl.css('width')) + 1,
          theme: w.theme,
          items: items
        });
      }

      var offset = cellEl.offset(),
        top = offset.top + parseInt(cellEl.css('height')),
        left = offset.left,
        animationDistance = 20,
        positionFix = -1;

      if(me.position === 'bottom'){
        //var menuHeight = menu.items.length * 30;
        var menuHeight = parseInt(menu.el.css('height'));
        top = top - menuHeight - parseInt(cellEl.css('height'));
        animationDistance *= -1;
        positionFix = 1;
      }
      
      var menuWidth = parseInt(cellEl.css('width')) + 1;
      if(menuWidth < minMenuWidth){
        menuWidth = minMenuWidth;
      }

      menu.el.css({
        position: 'absolute',
        width: menuWidth,
        minWidth: 70,
        top: top + animationDistance,
        left: left - 1
      });

      menu.show();

      menu.el.animate({
        duration: 200,
        top: top + positionFix
      });

      column.summaryMenu = menu;

      me.activeSummaryMenu = menu;
    },
    /*
     *
     */
    generateColumnSummaryItems: function (column) {
      var me = this,
        items = [],
        numberSummaries = ['None', 'Sum', 'Average', 'Count', 'Min', 'Max'],
        stringSummaries = ['None'],
        summaryVarType = F.typeOf(column.summary);

      switch(column.type){
        case 'number':
          switch(summaryVarType){
            case 'string':
              F.each(numberSummaries, function (item, i) {
                items.push({
                  text: item,
                  checked: item.toLocaleLowerCase() === column.summary,
                  handler: function () {
                    column.summary = item.toLocaleLowerCase();
                    me.update();
                    me.activeSummaryMenu.setChecked(i, true);
                    me.activeSummaryMenu.hide();
                    delete me.activeSummaryMenu;
                  }
                });
              });
              break;
            case 'function':
            case 'object':
              F.each(numberSummaries, function (item, i) {
                items.push({
                  text: item,
                  checked: false,
                  handler: function () {
                    switch(summaryVarType){
                      case 'function':
                        column.summary = {
                          type: item.toLocaleLowerCase(),
                          fn: column.summary
                        };
                        break;
                      case 'object':
                        column.summary.type = item.toLocaleLowerCase();
                        break;
                    }
                    me.update();
                    me.activeSummaryMenu.setChecked(i, true);
                    me.activeSummaryMenu.hide();
                    delete me.activeSummaryMenu;
                  }
                });
              });

              if(summaryVarType !== 'object'){
                items.push({
                  text: 'Custom',
                  checked: true,
                  handler: function () {
                    column.summary = column._summary;
                    me.update();
                    me.activeSummaryMenu.hide();
                    me.activeSummaryMenu.setChecked(items.length - 1, true);
                    delete me.activeSummaryMenu;
                  }
                });
              }
              break;
          }
          break;
        case 'string':
          switch(summaryVarType){
            case 'string':
              F.each(stringSummaries, function (item, i) {
                items.push({
                  text: item,
                  checked: item.toLocaleLowerCase() === column.summary,
                  handler: function () {
                    column.summary.type = item.toLocaleLowerCase();
                    me.update();
                    me.activeSummaryMenu.setChecked(i, true);
                    me.activeSummaryMenu.hide();
                    delete me.activeSummaryMenu;
                  }
                });
              });
              break;
            case 'function':
            case 'object':
              F.each(stringSummaries, function (item, i) {
                items.push({
                  text: item,
                  checked: false,
                  handler: function () {
                    if(!column._summary){
                      column._summary = column.summary;
                    }
                    column.summary = 'none';
                    me.update();
                    me.activeSummaryMenu.setChecked(i, true);
                    me.activeSummaryMenu.hide();
                    delete me.activeSummaryMenu;
                  }
                });
              });

              items.push({
                text: 'Custom',
                checked: true,
                handler: function () {
                  column.summary = column._summary;
                  me.update();
                  me.activeSummaryMenu.setChecked(items.length - 1, true);
                  me.activeSummaryMenu.hide();
                  delete me.activeSummaryMenu;
                }
              });
              break;
          }
          break;
        default:

      }

      return items;
    },
    /*
     * @param {Object} cell
     * @return Object
     */
    getColumnBySummaryCell: function (cell) {
      var me = this,
        w = me.widget,
        index = cell.attr('index'),
        column;

      if(cell.closest('.fancy-grid-center').dom){
        column = w.columns[index];
      }
      else if(cell.closest('.fancy-grid-left').dom){
        column = w.leftColumns[index];
      }
      else if(cell.closest('.fancy-grid-right')){
        column = w.rightColumns[index];
      }

      return column;
    }
  });

})();