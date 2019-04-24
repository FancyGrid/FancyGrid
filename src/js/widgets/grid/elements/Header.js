/**
 * @class Fancy.grid.Header
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_HEADER_CLS = F.GRID_HEADER_CLS;
  var GRID_HEADER_CELL_CLS = F.GRID_HEADER_CELL_CLS;
  var GRID_HEADER_CELL_CONTAINER_CLS = F.GRID_HEADER_CELL_CONTAINER_CLS;
  var GRID_HEADER_CELL_TEXT_CLS = F.GRID_HEADER_CELL_TEXT_CLS;
  var GRID_HEADER_CELL_TRIGGER_CLS  = F.GRID_HEADER_CELL_TRIGGER_CLS;
  var GRID_HEADER_CELL_TRIGGER_IMAGE_CLS  = F.GRID_HEADER_CELL_TRIGGER_IMAGE_CLS;
  var GRID_HEADER_CELL_TRIGGER_DISABLED_CLS = F.GRID_HEADER_CELL_TRIGGER_DISABLED_CLS;
  var GRID_HEADER_CELL_GROUP_LEVEL_1_CLS = F.GRID_HEADER_CELL_GROUP_LEVEL_1_CLS;
  var GRID_HEADER_CELL_GROUP_LEVEL_2_CLS = F.GRID_HEADER_CELL_GROUP_LEVEL_2_CLS;
  var GRID_HEADER_CELL_SELECT_CLS = F.GRID_HEADER_CELL_SELECT_CLS;
  var GRID_HEADER_CELL_FILTER_FULL_CLS = F.GRID_HEADER_CELL_FILTER_FULL_CLS;
  var GRID_HEADER_CELL_FILTER_SMALL_CLS = F.GRID_HEADER_CELL_FILTER_SMALL_CLS;
  var GRID_HEADER_CELL_TRIPLE_CLS =  F.GRID_HEADER_CELL_TRIPLE_CLS;
  var GRID_HEADER_CELL_CHECKBOX_CLS = F.GRID_HEADER_CELL_CHECKBOX_CLS;
  var FIELD_CHECKBOX_CLS = F.FIELD_CHECKBOX_CLS;

  var ANIMATE_DURATION = F.ANIMATE_DURATION;

  F.define('Fancy.grid.Header', {
    extend: F.Widget,
    cls: GRID_HEADER_CLS,
    mixins: [
      'Fancy.grid.header.mixin.Menu'
    ],
    cellTpl: [
      '<div role="columnheader" class="' + GRID_HEADER_CELL_CLS + ' {cls}" style="display:{display};width:{columnWidth}px;height: {height};left: {left};" {groupIndex} index="{index}">',
        '<div class="' + GRID_HEADER_CELL_CONTAINER_CLS + '" style="height: {height};">',
          '<span class="' + GRID_HEADER_CELL_TEXT_CLS + '">{columnName}</span>',
          '<span class="' + GRID_HEADER_CELL_TRIGGER_CLS + '">',
            '<div class="' + GRID_HEADER_CELL_TRIGGER_IMAGE_CLS + '"></div>',
          '</span>',
        '</div>',
      '</div>'
    ],
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
      var me = this;

      me.Super('init', arguments);

      me.initTpl();
      me.render();

      me.renderHeaderCheckBox();

      me.setAlign();
      me.setCellsPosition();
      me.ons();
    },
    /*
     *
     */
    initTpl: function () {
      this.cellTpl = new F.Template(this.cellTpl);
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget,
        el = me.el,
        headerCellSelector = 'div.' + GRID_HEADER_CELL_CLS;

      w.on('render', me.onAfterRender, me);
      w.on('docmove', me.onDocMove, me);
      el.on('click', me.onTriggerClick, me, 'span.' + GRID_HEADER_CELL_TRIGGER_CLS);
      el.on('click', me.onCellClick, me, headerCellSelector);
      el.on('mousemove', me.onCellMouseMove, me, headerCellSelector);
      el.on('mousedown', me.onCellMouseDown, me, headerCellSelector);
      el.on('mousedown', me.onMouseDown, me);
      el.on('dblclick', me.onCellTextDBLClick, me, '.' + GRID_HEADER_CELL_TEXT_CLS);
      el.on('mouseenter', me.onCellMouseEnter, me, headerCellSelector);
      el.on('mouseleave', me.onCellMouseLeave, me, headerCellSelector);
    },
    /*
     *
     */
    render: function () {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        renderTo,
        el = F.get(document.createElement('div')),
        html = '',
        i = 0,
        iL = columns.length,
        numRows = 1,
        groups = {},
        passedWidth = 0,
        isFilterHeader = w.filter && w.filter.header,
        cellFilterGroupType = 'full',
        cellHeight = w.cellHeaderHeight;

      if (w.groupheader) {
        if (isFilterHeader && !w.filter.groupHeader) {
          cellFilterGroupType = 'small';
        }
        else {
          numRows = 2;
        }
      }

      if (isFilterHeader) {
        numRows++;
      }

      for (; i < iL; i++) {
        var column = columns[i],
          title = column.title || column.header,
          height = cellHeight,
          cls = '',
          groupIndex = '';

        if (numRows !== 1) {
          if (!column.grouping) {
            height = (numRows * cellHeight) + 'px';
          }
          else {
            if (!groups[column.grouping]) {
              groups[column.grouping] = {
                width: 0,
                title: column.grouping,
                left: passedWidth
              };
            }

            if (isFilterHeader && w.filter.groupHeader) {
              height = (2 * cellHeight) + 'px';
            }
            else {
              height = cellHeight + 'px';
            }

            if (!column.hidden) {
              groups[column.grouping].width += column.width;
            }

            groupIndex = 'group-index="' + column.grouping + '"';

            cls = GRID_HEADER_CELL_GROUP_LEVEL_1_CLS;
          }
        }

        passedWidth += column.width;

        if (column.index === '$selected' || column.select) {
          cls += ' ' + GRID_HEADER_CELL_SELECT_CLS;
        }

        if (!column.menu) {
          cls += ' ' + GRID_HEADER_CELL_TRIGGER_DISABLED_CLS;
        }

        if (column.filter && column.filter.header) {
          switch (cellFilterGroupType) {
            case 'small':
              cls += ' ' + GRID_HEADER_CELL_FILTER_SMALL_CLS;
              break;
            case 'full':
              cls += ' ' + GRID_HEADER_CELL_FILTER_FULL_CLS;
              break;
          }
        }

        if(F.isNumber(height)){
          height += 'px';
        }

        var cellConfig = {
          cls: cls,
          columnName: title,
          columnWidth: column.width,
          index: i,
          height: height,
          left: 'initial',
          groupIndex: groupIndex,
          display: column.hidden ? 'none' : ''
        };

        html += me.cellTpl.getHTML(cellConfig);
      }

      el.css({
        height: cellHeight * numRows + 'px',
        width: me.getColumnsWidth()
      });

      el.attr('role', 'presentation');
      el.addCls(me.cls);

      if (w.groupheader) {
        el.addCls('fancy-grid-header-grouped');
        html += me.getGroupingCellsHTML(groups);
      }

      el.update(html);

      renderTo = w.el.select('.fancy-grid-' + me.side).dom;
      me.el = F.get(renderTo.appendChild(el.dom));
    },
    /*
     * @param {Number} index
     * @param {Object} column
     */
    insertCell: function (index, column) {
      var me = this,
        w = me.widget,
        cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')'),
        columns = me.getColumns(),
        cls = '',
        title = column.title || column.header,
        cellHeight,
        groupIndex = '',
        left = 0;

      if(cells.length){
        cellHeight = parseInt(cells.item(0).css('height'));
      }
      else{
        var _cells = w.header.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');
        //cellHeight = parseInt(_cells.item(0).css('height'));
        //cellHeight = parseInt(w.header.el.css('height'));
      }

      cellHeight = parseInt(w.header.el.css('height'));

      if(me.side === 'center'){
        left = -w.scroller.scrollLeft;
      }

      if (w.groupheader) {
        //cellHeight = w.cellHeight * 2;
        var groupUpCells = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS);

        //BUG: possible bug for dragging column
        if (index !== w.columns.length - 1) {
          groupUpCells.each(function (cell) {
            var left = parseInt(cell.css('left') || 0) + column.width;

            cell.css('left', left);
          });
        }
      }

      if (column.index === '$selected' || column.select) {
        cls += ' ' + GRID_HEADER_CELL_SELECT_CLS;
      }

      if (!column.menu) {
        cls += ' ' + GRID_HEADER_CELL_TRIGGER_DISABLED_CLS;
      }

      var j = 0,
        jL = index;

      for (; j < jL; j++) {
        if(!columns[j].hidden){
          left += columns[j].width;
        }
      }

      if(me.side === 'center'){
        left += w.scroller.scrollLeft || 0;
      }

      var cellHTML = me.cellTpl.getHTML({
        cls: cls,
        columnName: title,
        columnWidth: column.width,
        index: index,
        height: String(cellHeight) + 'px',
        left: String(left) + 'px',
        groupIndex: groupIndex
      });

      if (index === 0 && cells.length) {
        F.get(cells.item(0).before(cellHTML));
      }
      else if (index !== 0 && cells.length) {
        if(index === cells.length) {
          me.el.append(cellHTML);
        }
        else{
          F.get(cells.item(index).before(cellHTML));
        }
      }
      else{
        me.el.append(cellHTML);
      }

      //var i = index,
      var i = 0,
        iL = columns.length,
        width = 0,
        left = 0;

      if(me.side === 'center'){
        left -= w.scroller.scrollLeft;
      }

      cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      for (; i < iL; i++) {
        var column = columns[i];

        if (column.hidden) {
          continue;
        }

        var cell = cells.item(i);

        cell.css('left', left);
        left += column.width;
        width += column.width;
      }

      var oldWidth = parseInt(me.css('width'));

      if(oldWidth > width){
        width = oldWidth;
      }

      //me.css('width', parseInt(me.css('width')) + column.width);
      me.css('width', width);
    },
    /*
     *
     */
    setAlign: function () {
      var me = this,
        columns = me.getColumns(),
        i = 0,
        iL = columns.length;

      for (; i < iL; i++) {
        var column = columns[i];

        if (column.align) {
          me.getDomCell(i).css('text-align', column.align);
        }
      }
    },
    onAfterRender: function () {},
    /*
     * @param {Boolean} [animate]
     */
    setCellsPosition: function (animate) {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        cellsWidth = 0,
        cellsDom = me.el.select('.' + GRID_HEADER_CELL_CLS);

      cellsWidth += me.scrollLeft || 0;

      F.each(columns, function (column, i) {
        var cellEl = cellsDom.item(i),
          top = '0px';

        if (column.grouping) {
          top = w.cellHeaderHeight + 'px';
        }

        if(animate && !F.nojQuery){
          cellEl.animate({
            top: top,
            left: cellsWidth + 'px'
          }, F.ANIMATE_DURATION);
        }
        else {
          cellEl.css({
            top: top,
            left: cellsWidth + 'px'
          });
        }

        if (!column.hidden) {
          cellsWidth += column.width;
        }
      });

      if (w.groupheader) {
        var groupCells = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS);

        groupCells.each(function (groupCell) {
          var groupName = groupCell.attr('index');

          var underGroupCells = me.el.select('[group-index="' + groupName + '"]'),
            groupCellLeft = me.scrollLeft || 0,
            groupCellWidth = 0;

          F.each(columns, function (column) {
            if (column.grouping === groupName) {
              return true;
            }

            if(!column.hidden){
              groupCellLeft += column.width;
            }
          });

          F.each(columns, function (column) {
            if (column.grouping === groupName && !column.hidden) {
              groupCellWidth += column.width;
            }
          });

          if(animate && !F.nojQuery){
            groupCell.animate({
              left: groupCellLeft,
              width: groupCellWidth
            }, ANIMATE_DURATION);
          }
          else{
            groupCell.css({
              left: groupCellLeft,
              width: groupCellWidth
            });
          }
        });
      }
    },
    /*
     *
     */
    fixGroupHeaderSizing: function () {
      var me = this,
        w = me.widget,
        CELL_HEADER_HEIGHT = w.cellHeaderHeight,
        columns = me.getColumns(),
        cellsDom = me.el.select('.' + GRID_HEADER_CELL_CLS),
        left = 0,
        groups = {},
        groupsWidth = {},
        groupsLeft = {},
        rows = me.calcRows();

      if(me.side === 'center'){
        left = w.scroller.scrollLeft;
      }

      F.each(columns, function (column, i) {
        var cell = cellsDom.item(i),
          grouping = column.grouping,
          top = '0px',
          height = CELL_HEADER_HEIGHT * rows;

        groups[grouping] = true;

        if(grouping){
          if(groupsWidth[grouping] === undefined){
            groupsWidth[grouping] = column.width;
            groupsLeft[grouping] = left;
          }
          else{
            groupsWidth[grouping] += column.width;
          }

          cell.addCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS);
          top = CELL_HEADER_HEIGHT + 'px';
          height = CELL_HEADER_HEIGHT;

          if(column.filter && column.filter.header){
            height = CELL_HEADER_HEIGHT * 2;
            setTimeout(function () {
              cell.addCls(GRID_HEADER_CELL_FILTER_FULL_CLS);
            }, 30);
          }
        }
        else{
          cell.removeCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS);
          if(column.filter && column.filter.header){
            setTimeout(function () {
              cell.addCls(GRID_HEADER_CELL_FILTER_SMALL_CLS);
            }, 30);
            cell.addCls(GRID_HEADER_CELL_FILTER_SMALL_CLS);
          }
        }

        if(w.groupheader && height === CELL_HEADER_HEIGHT && !grouping && !column.filter){
          height = CELL_HEADER_HEIGHT * 2;
        }

        //TODO: case for ungroup all cells over column drag with filtering

        cell.css({
          top: top,
          height: height
        });

        left += column.width;
      });

      for(var p in groupsWidth){
        var groupCell = me.el.select('[index="'+p+'"]');

        groupCell.css({
          left: groupsLeft[p],
          width: groupsWidth[p]
        });
      }

      var groupCells = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS);

      groupCells.each(function (cell) {
        var groupName = cell.attr('index');

        if(!groups[groupName]){
          cell.destroy();
        }
      });
    },
    /*
     * @return {Number}
     */
    getColumnsWidth: function () {
      var me = this,
        columns = me.getColumns(),
        cellsWidth = 0,
        i = 0,
        iL = columns.length;

      for (; i < iL; i++) {
        var column = columns[i];

        cellsWidth += column.width;
      }

      return cellsWidth;
    },
    /*
     * @return {Array}
     */
    getColumns: function () {
      var me = this,
        w = me.widget,
        columns;

      switch (me.side) {
        case 'left':
          columns = w.leftColumns;
          break;
        case 'center':
          columns = w.columns;
          break;
        case 'right':
          columns = w.rightColumns;
          break;
      }

      return columns;
    },
    /*
     * @param {Number} index
     * @return {Fancy.Element}
     */
    getDomCell: function (index) {
      return this.el.select('.' + GRID_HEADER_CELL_CLS).item(index);
    },
    /*
     * @param {Event} e
     */
    onCellClick: function (e) {
      var me = this,
        w = me.widget,
        columndrag = w.columndrag,
        cell = e.currentTarget,
        target = F.get(e.target),
        index = parseInt(F.get(cell).attr('index')),
        columns = me.getColumns(),
        column = columns[index];

      if(columndrag && columndrag.status === 'dragging'){
        return;
      }

      if (target.hasCls(GRID_HEADER_CELL_TRIGGER_CLS)) {
        return
      }

      if (target.hasCls(GRID_HEADER_CELL_TRIGGER_IMAGE_CLS)) {
        return
      }

      if (F.get(cell).hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS)) {
        return;
      }

      if(me.textDBLClick){
        return;
      }

      if(column.titleEditable){
        setTimeout(function(){
          if(me.textDBLClick){
            setTimeout(function(){
              delete me.textDBLClick;
            }, 400);
          }
          else{
            w.fire('headercellclick', {
              e: e,
              side: me.side,
              cell: cell,
              index: index
            });
          }

        }, 300);
      }
      else {
        w.fire('headercellclick', {
          e: e,
          side: me.side,
          cell: cell,
          index: index
        });
      }
    },
    /*
     * @param {Event} e
     */
    onCellMouseMove: function (e) {
      var me = this,
        w = me.widget,
        cell = e.currentTarget,
        cellEl = F.get(cell),
        isGroupCell = cellEl.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS),
        index = parseInt(F.get(cell).attr('index'));

      if (isGroupCell) {
        return;
      }

      w.fire('headercellmousemove', {
        e: e,
        side: me.side,
        cell: cell,
        index: index
      });
    },
    /*
     * @param {Event} e
     */
    onMouseDown: function (e) {
      var targetEl = F.get(e.target);

      if (targetEl.prop("tagName") === 'INPUT') {}
      else {
        e.preventDefault();
      }
    },
    /*
     * @param {Event} e
     */
    onCellMouseDown: function (e) {
      var w = this.widget,
        cell = e.currentTarget,
        index = parseInt(F.get(cell).attr('index'));

      w.fire('headercellmousedown', {
        e: e,
        side: this.side,
        cell: cell,
        index: index
      });
    },
    /*
     * @param {Number} value
     * @param {Boolean} [animate]
     */
    scroll: function (value, animate) {
      this.scrollLeft = value;
      this.setCellsPosition(animate);
    },
    /*
     * @param {Array} groups
     * @return {String}
     */
    getGroupingCellsHTML: function (groups) {
      var me = this,
        w = me.widget,
        html = '';

      F.each(groups, function (group, p) {
        html += me.cellTpl.getHTML({
          cls: GRID_HEADER_CELL_GROUP_LEVEL_2_CLS,
          columnName: group.title,
          columnWidth: group.width,
          index: p,
          height: w.cellHeaderHeight + 'px',
          left: group.left + 'px',
          groupIndex: ''
        });
      });

      return html;
    },
    /*
     *
     */
    destroy: function () {
      var me = this,
        el = me.el,
        cellSelector = 'div.' + GRID_HEADER_CELL_CLS;

      el.un('click', me.onCellClick, me, cellSelector);
      el.un('mousemove', me.onCellMouseMove, me, cellSelector);
      el.un('mousedown', me.onCellMouseDown, me, cellSelector);
      el.un('mousedown', me.onMouseDown, me);
      el.un('mouseenter', me.onCellMouseEnter, me, cellSelector);
      el.un('mouseleave', me.onCellMouseLeave, me, cellSelector);
    },
    /*
     * @param {Number} index
     * @return {Fancy.Element}
     */
    getCell: function (index) {
      return this.el.select('.' + GRID_HEADER_CELL_CLS + '[index="' + index + '"]');
    },
    /*
     * @param {Event} e
     */
    onTriggerClick: function (e) {
      var me = this,
        target = F.get(e.currentTarget),
        cell = target.parent().parent(),
        index = parseInt(cell.attr('index')),
        columns = me.getColumns(),
        column = columns[index];

      e.stopPropagation();

      me.showMenu(cell, index, column, columns);
    },
    /*
     * @param {Number} orderIndex
     */
    hideCell: function (orderIndex) {
      var me = this,
        w = me.widget,
        cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')'),
        cell = cells.item(orderIndex),
        cellWidth = parseInt(cell.css('width')),
        i = 0,
        iL = cells.length,
        columns = me.getColumns();

      if (cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS)) {
        var groupIndex = cell.attr('group-index'),
          groupCell = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + '[index="' + groupIndex + '"]').item(0),
          groupCellWidth = parseInt(groupCell.css('width'));

        groupCell.animate({
          width: groupCellWidth - cellWidth
        }, ANIMATE_DURATION);
      }

      cell.hide();

      var groups = {},
        left = 0,
        scrollLeft = 0;

      if(me.side === 'center'){
        scrollLeft = w.scroller.scrollLeft;
        left -= scrollLeft;
      }

      for (; i < iL; i++) {
        var _cell = cells.item(i),
          cellLeft = parseInt(_cell.css('left')),
          column = columns[i];

        if(column.hidden){
          continue;
        }

        if (column.grouping) {
          if (columns[orderIndex].grouping !== column.grouping) {
            groups[column.grouping] = true;
          }
        }

        if(cellLeft !== left){
          _cell.animate({
            left: left
          }, ANIMATE_DURATION);
        }

        left += column.width;
      }

      F.each(groups, function (value, group) {
        var groupCell = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + '[index="' + group + '"]').item(0),
          left = 0;

        if(me.side === 'center'){
          scrollLeft = w.scroller.scrollLeft;
          left -= scrollLeft;
        }

        F.each(columns, function (column, i) {
          if(column.hidden){
            return;
          }

          if(column.grouping === group){
            return true;
          }

          left += column.width;
        });

        groupCell.animate({
          left: left
        }, ANIMATE_DURATION);
      });
    },
    /*
     * @param {Number} orderIndex
     */
    showCell: function (orderIndex) {
      var me = this,
        w = me.widget,
        cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')'),
        cell = cells.item(orderIndex),
        cellWidth,
        left = 0,
        i = 0,
        iL = cells.length,
        columns = me.getColumns();

      cell.show();

      cellWidth = parseInt(cell.css('width'));

      if (cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS)) {
        var groupIndex = cell.attr('group-index'),
          groupCell = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + '[index="' + groupIndex + '"]').item(0),
          groupCellWidth = parseInt(groupCell.css('width'));

        groupCell.animate({
          width: groupCellWidth + cellWidth
        }, ANIMATE_DURATION);
      }

      var scrollLeft = 0;

      if(me.side === 'center'){
        scrollLeft = w.scroller.scrollLeft;
        left -= scrollLeft;
      }

      var groups = {};

      for (; i < iL; i++) {
        var _cell = cells.item(i),
          cellLeft = parseInt(_cell.css('left')),
          column = columns[i];

        if(column.hidden){
          continue;
        }

        if (column.grouping) {
          if (columns[orderIndex].grouping !== column.grouping) {
            groups[column.grouping] = true;
          }
        }

        if(cellLeft !== left){
          _cell.animate({
            left: left
          }, ANIMATE_DURATION);
        }

        left += column.width;
      }

      F.each(groups, function (value, group) {
        var groupCell = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + '[index="' + group + '"]').item(0),
          left = 0;

        if(me.side === 'center'){
          scrollLeft = w.scroller.scrollLeft;
          left -= scrollLeft;
        }

        F.each(columns, function (column) {
          if(column.hidden){
            return;
          }

          if(column.grouping === group){
            return true;
          }

          left += column.width;
        });

        groupCell.animate({
          left: left
        }, ANIMATE_DURATION);
      });
    },
    /*
     * @param {Number} orderIndex
     */
    removeCell: function (orderIndex) {
      var me = this,
        cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')'),
        cell = cells.item(orderIndex),
        cellWidth = parseInt(cell.css('width')),
        i = orderIndex + 1,
        iL = cells.length,
        groupCells = {},
        isGroupCell = false;

      if (cell.attr('group-index')) {
        isGroupCell = cell.attr('group-index');
        groupCells[isGroupCell] = true;
      }

      cell.destroy();

      for (; i < iL; i++) {
        var _cell = cells.item(i),
          left = parseInt(_cell.css('left')) - cellWidth;

        if (_cell.attr('group-index')) {
          groupCells[_cell.attr('group-index')] = true;
        }

        _cell.attr('index', i - 1);

        _cell.css('left', left);
      }

      for (var p in groupCells) {
        var groupCell = me.el.select('[index="' + p + '"]'),
          newCellWidth = parseInt(groupCell.css('width')) - cellWidth,
          newCellLeft = parseInt(groupCell.css('left')) - cellWidth;

        if (isGroupCell && groupCell) {
          groupCell.css('width', newCellWidth);

          if (groupCell.attr('index') !== isGroupCell) {
            groupCell.css('left', newCellLeft);
          }
        }
        else {
          groupCell.css('left', newCellLeft);
        }
      }

      if (isGroupCell) {
        if (me.el.select('[group-index="' + isGroupCell + '"]').length === 0) {
          var groupCell = me.el.select('[index="' + isGroupCell + '"]');

          groupCell.destroy();
        }
      }

      if (me.side !== 'center') {
        me.css('width', parseInt(me.css('width')) - cellWidth);
      }
    },
    /*
     *
     */
    renderHeaderCheckBox: function () {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        i = 0,
        iL = columns.length,
        cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      for (; i < iL; i++) {
        var column = columns[i];

        if(F.isObject(column.headerCheckBox)){
          var el = column.headerCheckBox.el,
            elId = el.attr('id');

          el = F.get(elId);

          if(!el.dom){
            column.headerCheckBox = true;
          }
        }

        if (column.headerCheckBox === true && column.type !== 'select') {
          var cell = cells.item(i),
            headerCellContainer = cell.firstChild(),
            textEl = cell.select('.' + GRID_HEADER_CELL_TEXT_CLS),
            label = column.title ? column.title : false,
            labelWidth = 0;

          switch(column.type) {
            case 'checkbox':
            case 'switcher':
              cell.addCls(GRID_HEADER_CELL_CHECKBOX_CLS);
              break;
            case 'select':
              cell.addCls(GRID_HEADER_CELL_SELECT_CLS);
              break;
          }

          textEl.update('');

          if (label.length) {
            labelWidth = label.width * 15;
          }

          column.headerCheckBox = new F.CheckBox({
            renderTo: headerCellContainer.dom,
            renderId: true,
            labelWidth: labelWidth,
            value: false,
            //label: label,
            label: false,
            labelAlign: 'right',
            style: {
              padding: '0px',
              display: 'inline-block'
            },
            events: [{
              change: function (checkbox, value) {
                var i = 0,
                  iL = w.getViewTotal();

                for (; i < iL; i++) {
                  w.set(i, column.index, value);
                }
              }
            }]
          });
        }
      }
    },
    /*
     *
     */
    reSetIndexes: function () {
      var cells = this.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      cells.each(function (cell, i) {
        cell.attr('index', i);
      })
    },
    /*
     *
     */
    reSetGroupIndexes: function () {
      var me = this,
        columns = me.getColumns(),
        cells = this.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      cells.each(function (cell, i) {
        var column = columns[i],
          grouping = column.grouping;

        if(cell.attr('group-index') && !grouping){
          cell.removeAttr('group-index');
        }
        else if(grouping && cell.attr('group-index') !== grouping){
          cell.attr('group-index', grouping);
        }
      });
    },
    /*
     *
     */
    updateTitles: function(){
      var me = this,
        columns = me.getColumns();

      F.each(columns, function (column, i) {
        if(column.headerCheckBox){
          return;
        }

        me.el.select('div.' + GRID_HEADER_CELL_CLS + '[index="'+i+'"] .' + GRID_HEADER_CELL_TEXT_CLS).update(column.title || '');
      });
    },
    /*
     *
     */
    updateCellsSizes: function(){
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        left = 0;

      if(me.side === 'center'){
        if(w.nativeScroller){
          left = -w.body.el.dom.scrollLeft;
        }
        else {
          left = -w.scroller.scrollLeft;
        }
      }

      F.each(columns, function (column, i){
        if(column.hidden){
          return;
        }

        var cell = me.el.select('div.' + GRID_HEADER_CELL_CLS + '[index="'+i+'"]'),
          currentLeft = parseInt(cell.css('left')),
          currentWidth = parseInt(cell.css('width'));

        if(currentLeft === left && currentWidth === column.width){
          left += column.width;
          return;
        }

        if(Fancy.nojQuery){
          //Bug fix for dom fx without jQuery
          //It is not fix.
          //cell.animate({width: column.width}, ANIMATE_DURATION);
          //cell.animate({left: left}, ANIMATE_DURATION);
          cell.css({
            width: column.width,
            left: left
          });
        }
        else {
          cell.animate({
            width: column.width,
            left: left
          }, ANIMATE_DURATION);
        }

        left += column.width;
      });
    },
    /*
     * @return {Number}
     */
    calcRows: function(){
      var me = this,
        w = me.widget,
        columns = w.columns.concat(w.leftColumns).concat(w.rightColumns),
        rows = 1;

      Fancy.each(columns, function(column){
        if(column.grouping){
          if(rows < 2){
             rows = 2;
          }

          if(column.filter && column.filter.header){
            if(rows < 3){
              rows = 3;
            }
          }
        }

        if(column.filter && column.filter.header){
          if(rows < 2){
            rows = 2;
          }
        }
      });

      if(w.groupheader && rows === 2){
        var tripleCells = w.el.select('.' + GRID_HEADER_CELL_TRIPLE_CLS);
        if(tripleCells.length){
          //TODO: redo this case to decrease header height
          //Also needs to work with case of 1 row
          rows = 3;
        }
      }

      return rows;
    },
    /*
     *
     */
    reSetColumnsAlign: function () {
      var me = this,
        columns = me.getColumns(),
        cells = this.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      cells.each(function(cell, i){
        var column = columns[i];

        cell.css('text-align', column.align || '');
      });
    },
    /*
     * Bug Fix: Empty method that is rewritten in HeaderMenu mixin
     */
    destroyMenus: function () {},
    onDocMove: function () {
      var me = this,
        w = me.widget;

      if(w.el.css('display') === 'none' || (w.panel && w.panel.el && w.panel.el.css('display') === 'none') && me.hideMenu){
        me.hideMenu();
      }
    },
    /*
     *
     */
    reSetColumnsCls: function () {
      var me = this,
        columns = me.getColumns(),
        cells = this.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      cells.each(function(cell, i){
        var column = columns[i];

        if(column.menu){
          cell.removeCls(GRID_HEADER_CELL_TRIGGER_DISABLED_CLS);
        }
        else{
          cell.addCls(GRID_HEADER_CELL_TRIGGER_DISABLED_CLS);
        }
      });
    },
    updateCellsVisibility: function () {
      var me = this,
        columns = me.getColumns(),
        cells = this.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      cells.each(function(cell, i) {
        var column = columns[i];

        if(column.hidden){
          cell.hide();
        }
        else if(cell.css('display') === 'none'){
          cell.show();
        }
      });
    },
    reSetCheckBoxes: function(){
      var me = this,
        columns = me.getColumns(),
        cells = this.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      F.each(columns, function (column, i) {
        var cell = cells.item(i),
          checkBoxEl = cell.select('.' + FIELD_CHECKBOX_CLS);

        if(checkBoxEl.length){
          if(column.type === 'select' || column.select){
            return;
          }

          var checkBox = F.getWidget(checkBoxEl.item(0).attr('id'));
          cell.removeCls(GRID_HEADER_CELL_CHECKBOX_CLS);
          cell.removeCls(GRID_HEADER_CELL_SELECT_CLS);
          switch(column.type){
            case 'select':
              cell.addCls(GRID_HEADER_CELL_SELECT_CLS);
              break;
            case 'checkbox':
              cell.addCls(GRID_HEADER_CELL_CHECKBOX_CLS);
              break;
            default:
              if(!column.headerCheckBox){
                checkBox.destroy();
              }
          }
        }
      });

      me.renderHeaderCheckBox();
    },
    onCellTextDBLClick: function (e) {
      var me = this,
        w = me.widget,
        targetEl = Fancy.get(e.target),
        cell = targetEl.parent().parent(),
        index = cell.attr('index'),
        columns = me.getColumns(),
        column = columns[index],
        oldValue = column.title;

      if(!column.titleEditable){
        return;
      }

      me.textDBLClick = true;

      if(me.activeEditColumnField){
        me.activeEditColumnField.destroy();
        delete me.activeEditColumnField;
      }

      me.activeEditColumnField = new Fancy.StringField({
        renderTo: me.el.dom,
        label: false,
        theme: w.theme,
        padding: '0px 0px 0px',
        width: column.width + 1,
        value: column.title || '',
        inputHeight: w.cellHeaderHeight + 1,
        events: [{
          enter: function (field) {
            field.destroy();
          }
        }, {
          esc: function (field) {
            w.setColumnTitle(column.index, oldValue, me.side);
            field.destroy();
            delete me.activeEditColumnField;
          }
        }, {
          input: function (field, value) {
            w.setColumnTitle(column.index, value, me.side);
            delete me.activeEditColumnField;
          }
        },{
          render: function(field){
            field.focus();
            delete me.activeEditColumnField;
          }
        }],
        style: {
          position: 'absolute',
          top: -1,
          left: parseInt(cell.css('left')) - 1
        }
      });

      w.once('scroll', function(){
        if(me.activeEditColumnField){
          me.activeEditColumnField.destroy();
          delete me.activeEditColumnField;
        }
      });
    },
    onCellMouseEnter: function (e) {
      var me = this,
        w = me.widget,
        params = me.getEventParams(e),
        prevCellOver = me.prevCellOver;

      if (F.nojQuery && prevCellOver) {
        if (me.fixZeptoBug) {
          if (params.columnIndex !== prevCellOver.columnIndex || params.side !== prevCellOver.side) {
            w.fire('headercellleave', prevCellOver);
          }
          else{
            return;
          }
        }
      }

      w.fire('headercellenter', params);

      me.prevCellOver = params;
    },

    /*
    * @param {Object} e
    */
    onCellMouseLeave: function (e) {
      var me = this,
        w = me.widget,
        params = me.getEventParams(e),
        prevCellOver = me.prevCellOver;

      if(!e.toElement || !me.el.within(e.toElement)){
        w.fire('headercellleave', prevCellOver);
        delete me.prevCellOver;
      }

      if (F.nojQuery) {
        if (prevCellOver === undefined) {
          return;
        }

        me.fixZeptoBug = params;
        return;
      }

      w.fire('headercellleave', prevCellOver);
      delete me.prevCellOver;
    },
    /*
     * @param {Object} e
     * @return {false|Object}
     */
    getEventParams: function (e) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        cell = e.currentTarget,
        cellEl = F.get(e.currentTarget);

      if (cellEl.parent().dom === undefined) {
        return false;
      }

      if (s.getLength() === 0) {
        return false;
      }

      if(cellEl.attr('index') === undefined){
        //Touch bug
        return false;
      }

      var columnIndex = parseInt(cellEl.attr('index')),
        column = columns[columnIndex];

      return {
        e: e,
        side: me.side,
        cell: cell,
        column: column,
        columnIndex: columnIndex
      };
    }
  });

})();