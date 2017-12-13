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

  var ANIMATE_DURATION = F.ANIMATE_DURATION;

  F.define('Fancy.grid.Header', {
    extend: F.Widget,
    cls: GRID_HEADER_CLS,
    mixins: [
      'Fancy.grid.header.mixin.Menu'
    ],
    cellTpl: [
      '<div class="' + GRID_HEADER_CELL_CLS + ' {cls}" style="display:{display};width:{columnWidth}px;height: {height};left: {left};" {groupIndex} index="{index}">',
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
    constructor: function (config) {
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

        if (column.index === '$selected') {
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

        html += me.cellTpl.getHTML({
          cls: cls,
          columnName: title,
          columnWidth: column.width,
          index: i,
          height: height,
          left: 'initial',
          groupIndex: groupIndex,
          display: column.hidden ? 'none' : ''
        });
      }

      el.css({
        height: cellHeight * numRows + 'px',
        width: me.getColumnsWidth()
      });

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
        cellHeight = parseInt(cells.item(0).css('height')),
        groupIndex = '',
        left = 0;

      if(me.side === 'center'){
        left = -w.scroller.scrollLeft;
      }

      if (w.groupheader) {
        cellHeight = w.cellHeight * 2;
        var groupUpCells = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS);

        //BUG: possible bug for dragging column
        if (index !== w.columns.length - 1) {
          groupUpCells.each(function (cell) {
            var left = parseInt(cell.css('left') || 0) + column.width;

            cell.css('left', left);
          });
        }
      }

      if (column.index === '$selected') {
        cls += ' ' + GRID_HEADER_CELL_SELECT_CLS;
      }

      if (!column.menu) {
        cls += ' ' + GRID_HEADER_CELL_TRIGGER_DISABLED_CLS;
      }

      var j = 0,
        jL = index;

      for (; j < jL; j++) {
        left += columns[j].width;
      }

      var i = index,
        iL = columns.length - 1;

      for (; i < iL; i++) {
        var _cell = cells.item(i),
          _left = parseInt(_cell.css('left') || 0) + column.width;

        _cell.css('left', _left);
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

      me.css('width', parseInt(me.css('width')) + column.width);
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
     *
     */
    setCellsPosition: function () {
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

        cellEl.css({
          top: top,
          left: cellsWidth + 'px'
        });

        if (!column.hidden) {
          cellsWidth += column.width;
        }
      });

      if (w.groupheader) {
        var groupCells = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS);

        groupCells.each(function (groupCell) {
          var groupName = groupCell.attr('index');

          var underGroupCells = me.el.select('[group-index="' + groupName + '"]'),
            groupCellLeft = parseInt(underGroupCells.item(0).css('left')),
            groupCellWidth = 0;

          F.each(columns, function (column) {
            if (column.grouping === groupName && !column.hidden) {
              groupCellWidth += column.width;
            }
          });

          groupCell.css('left', groupCellLeft);
          groupCell.css('width', groupCellWidth);
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
        index = parseInt(F.get(cell).attr('index'));

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

      w.fire('headercellclick', {
        e: e,
        side: me.side,
        cell: cell,
        index: index
      });
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

      if (targetEl.prop("tagName") === 'INPUT') {
      }
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
     */
    scroll: function (value) {
      this.scrollLeft = value;
      this.setCellsPosition();
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
        cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')'),
        cell = cells.item(orderIndex),
        cellWidth = parseInt(cell.css('width')),
        i = orderIndex + 1,
        iL = cells.length,
        columns = me.getColumns();

      if (cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS)) {
        var groupIndex = cell.attr('group-index'),
          groupCell = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + '[index="' + groupIndex + '"]').item(0),
          groupCellWidth = parseInt(groupCell.css('width'));

        groupCell.css('width', groupCellWidth - cellWidth);
      }

      cell.hide();

      var groups = {};

      for (; i < iL; i++) {
        var _cell = cells.item(i),
          left = parseInt(_cell.css('left')) - cellWidth,
          column = columns[i];

        if (column.grouping) {
          if (columns[orderIndex].grouping !== column.grouping) {
            groups[column.grouping] = true;
          }
        }

        _cell.css('left', left);
      }

      F.each(groups, function (group, p) {
        var groupCell = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + '[index="' + p + '"]').item(0);

        groupCell.css('left', parseInt(groupCell.css('left')) - cellWidth);
      });
    },
    /*
     * @param {Number} orderIndex
     */
    showCell: function (orderIndex) {
      var me = this,
        cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')'),
        cell = cells.item(orderIndex),
        cellWidth,
        i = orderIndex + 1,
        iL = cells.length,
        columns = me.getColumns();

      cell.show();

      cellWidth = parseInt(cell.css('width'));

      if (cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS)) {
        var groupIndex = cell.attr('group-index'),
          groupCell = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + '[index="' + groupIndex + '"]').item(0),
          groupCellWidth = parseInt(groupCell.css('width'));

        groupCell.css('width', groupCellWidth + cellWidth);
      }

      var groups = {};

      for (; i < iL; i++) {
        var _cell = cells.item(i),
          left = parseInt(_cell.css('left')) + cellWidth,
          column = columns[i];

        if (column.grouping) {
          if (columns[orderIndex].grouping !== column.grouping) {
            groups[column.grouping] = true;
          }
        }
        _cell.css('left', left);
      }

      for (var p in groups) {
        var groupCell = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + '[index="' + p + '"]').item(0);
        groupCell.css('left', parseInt(groupCell.css('left')) + cellWidth);
      }
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

        if (column.headerCheckBox === true) {
          var cell = cells.item(i),
            headerCellContainer = cell.firstChild(),
            textEl = cell.select('.' + GRID_HEADER_CELL_TEXT_CLS),
            text = textEl.dom.innerHTML,
            label = !text ? false : text,
            labelWidth = 0;

          cell.addCls('fancy-grid-header-cell-checkbox');
          textEl.update('');

          if (label.length) {
            labelWidth = label.width * 15;
          }

          column.headerCheckBox = new F.CheckBox({
            renderTo: headerCellContainer.dom,
            renderId: true,
            labelWidth: labelWidth,
            value: false,
            label: label,
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

    /*
     *
     */
    updateTitles: function(){
      var me = this,
        columns = me.getColumns();

      F.each(columns, function (column, i) {
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
        left = -w.scroller.scrollLeft;
      }

      F.each(columns, function (column, i){
        var cell = me.el.select('div.' + GRID_HEADER_CELL_CLS + '[index="'+i+'"]'),
          currentLeft = parseInt(cell.css('left')),
          currentWidth = parseInt(cell.css('width'));

        if(currentLeft === left && currentWidth === column.width){
          left += column.width;
          return;
        }

        if(Fancy.nojQuery){
          //Bug fix for dom fx without jQuery
          cell.animate({width: column.width}, ANIMATE_DURATION);
          cell.animate({left: left}, ANIMATE_DURATION);
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
        w = me.widget,
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
    }
  });

})();