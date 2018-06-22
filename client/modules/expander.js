/*
 * @class Fancy.grid.plugin.Expander
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;
  var G = F.get;

  //CONSTANTS
  var GRID_CELL_CLS = F.GRID_CELL_CLS;
  var GRID_COLUMN_CLS = F.GRID_COLUMN_CLS;
  var GRID_ROW_EXPAND_CLS = F.GRID_ROW_EXPAND_CLS;
  var GRID_ROW_EXPAND_OVER_CLS = F.GRID_ROW_EXPAND_OVER_CLS;
  var GRID_ROW_EXPAND_SELECTED_CLS = F.GRID_ROW_EXPAND_SELECTED_CLS;
  var GRID_ROW_OVER_CLS = F.GRID_ROW_OVER_CLS;

  F.define('Fancy.grid.plugin.Expander', {
    extend: F.Plugin,
    ptype: 'grid.expander',
    inWidgetName: 'expander',
    plusScroll: 0,
    enabledCollapse: true,
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

      me._expanded = {};
      me._expandedIds = {};
      // For grid grouping
      me.expandedGroups = {};

      me.initTpl();

      me.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget,
        s = w.store;

      w.on('scroll', me.onScroll, me);
      //w.on('sort', me.onSort, me);
      w.on('beforesort', me.onBeforeSort, me);
      w.on('changepage', me.onChangePage, me);
      w.on('filter', me.onFilter, me);
      w.on('columnresize', me.onColumnReSize, me);

      w.on('rowdblclick', me.onRowDBlClick, me);

      w.on('rowtrackenter', me.onRowTrackOver, me);
      w.on('rowtrackleave', me.onRowTrackLeave, me);

      w.on('collapse', me.onGroupCollapse, me);
      w.on('expand', me.onGroupExpand, me);
      w.on('remove', me.onRemove, me);

      w.on('render', function () {
        w.el.on('mouseenter', me.onExpandRowMouseEnter, me, 'div.' + GRID_ROW_EXPAND_CLS);
        w.el.on('mouseleave', me.onExpandRowMouseLeave, me, 'div.' + GRID_ROW_EXPAND_CLS);
      });

      w.on('select', me.onSelect, me);
      w.on('clearselect', me.onClearSelect, me);

      s.on('beforeinsert', me.onBeforeInsert, me);
      w.on('columndrag', me.onColumnDrag, me);
      w.on('lockcolumn', me.onLockColumn, me);
      w.on('rightlockcolumn', me.onRightLockColumn, me);
      w.on('unlockcolumn', me.onUnLockColumn, me);

      if (me.expanded) {
        if (s.proxyType) {
          w.once('load', function () {
            me.expandAll();
          });
        }
        else {
          w.on('init', function () {
            me.expandAll();
          });
        }
      }
    },
    /*
     * @param {Number} rowIndex
     */
    expand: function (rowIndex) {
      var me = this,
        w = me.widget,
        id = w.get(rowIndex).id;

      if (me._expandedIds[id] === undefined) {
        me._expandedIds[id] = {};
        me.expandRow(Number(rowIndex), id);
        me.addMargin(Number(rowIndex) + 1, id);
      }
      else {
        me.showRow(Number(rowIndex), id);
      }

      delete me._expandedIds[id].hidden;

      me.reSetTop();
      me.reSetPlusScroll();

      var checkBoxEls = w.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + rowIndex + '"] .fancy-checkbox-expander'),
        i = 0,
        iL = checkBoxEls.length;

      for (; i < iL; i++) {
        var checkBox = F.getWidget(checkBoxEls.item(i).attr('id'));

        if (checkBox.get() === false) {
          checkBox.set(true, false);
        }
      }

      me.changeSidesSize();
      me.onSelect();
    },
    /*
     * @param {Number} rowIndex
     */
    collapse: function (rowIndex) {
      var me = this,
        w = me.widget,
        scroller = w.scroller,
        id = w.get(rowIndex).id;

      me.collapseRow(Number(rowIndex), id);
      me.clearMargin(Number(rowIndex) + 1, id);
      delete me._expandedIds[id];

      me.reSetTop();
      me.reSetPlusScroll();

      me.changeSidesSize();

      scroller.scrollDelta(1);
      scroller.scrollRightKnob();
    },
    /*
     * @param {Number} rowIndex
     * @param {String} id
     */
    collapseRow: function (rowIndex, id) {
      var me = this,
        w = me.widget,
        item = me._expandedIds[id];

      if(me._expandedIds[id].timeOutCheckHeight1){
        clearTimeout(me._expandedIds[id].timeOutCheckHeight1);
        delete me._expandedIds[id].timeOutCheckHeight1;
      }

      if(me._expandedIds[id].timeOutCheckHeight2){
        clearTimeout(me._expandedIds[id].timeOutCheckHeight2);
        delete me._expandedIds[id].timeOutCheckHeight2;
      }

      if(me._expandedIds[id].timeOutCheckHeight3){
        clearTimeout(me._expandedIds[id].timeOutCheckHeight3);
        delete me._expandedIds[id].timeOutCheckHeight3;
      }

      if(me._expandedIds[id].timeOutCheckHeight4){
        clearTimeout(me._expandedIds[id].timeOutCheckHeight4);
        delete me._expandedIds[id].timeOutCheckHeight4;
      }

      item.el.hide();
      item.hidden = true;

      if (w.leftColumns) {
        item.leftEl.hide();
      }

      if (w.rightColumns) {
        item.rightEl.hide();
      }

      var checkBoxEls = w.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + rowIndex + '"] .fancy-checkbox-expander'),
        i = 0,
        iL = checkBoxEls.length;

      for (; i < iL; i++) {
        var checkBox = F.getWidget(checkBoxEls.item(i).attr('id'));

        if (checkBox.get() === true) {
          checkBox.set(false, false);
          checkBox.collapsedTime = new Date();
        }
      }
    },
    /*
     *
     */
    _hideAllSideExpandedRow: function () {
      var me = this,
        w = me.widget;

      for (var p in me._expandedIds) {
        var item = me._expandedIds[p];

        item.el.hide();
        item.hidden = true;

        if (w.leftColumns) {
          item.leftEl.hide();
        }

        if (w.rightColumns) {
          item.rightEl.hide();
        }
      }
    },
    /*
     *
     */
    expandAll: function () {
      var w = this.widget,
        viewTotal = w.getViewTotal(),
        i = 0;

      for (; i < viewTotal; i++) {
        this.expand(i);
      }
    },
    /*
     * @param {Number} rowIndex
     * @param {String} id
     */
    expandRow: function (rowIndex, id) {
      var me = this,
        w = me.widget,
        el = G(document.createElement('div')),
        item = w.getById(id),
        data = me.prepareData(item),
        html,
        left = -w.scroller.scrollLeft || 0,
        width = w.getCenterFullWidth(),
        height;

      if (me.tpl) {
        html = me.tpl.getHTML(data);
        el.update(html);
      }

      el.addCls(GRID_ROW_EXPAND_CLS);
      el.css({
        left: left,
        width: width
      });
      el.attr('index', rowIndex);

      w.body.el.dom.appendChild(el.dom);

      if (me.render) {
        /*renderTo, data, width*/
        me.render(el.dom, data, w.getCenterFullWidth());

        var checkHeight = function(){
          var _height = parseInt(el.css('height'));

          if(height !== _height && me._expandedIds[id]){
            me._expandedIds[id].height = _height;
            leftEl.css('height', _height);
            rightEl.css('height', _height);

            me.addMargin(Number(rowIndex) + 1, id);
          }
        };

        me._expandedIds[id].timeOutCheckHeight1 = setTimeout(checkHeight, 100);
        me._expandedIds[id].timeOutCheckHeight2 = setTimeout(checkHeight, 500);
        me._expandedIds[id].timeOutCheckHeight3 = setTimeout(checkHeight, 1000);
        me._expandedIds[id].timeOutCheckHeight4 = setTimeout(checkHeight, 3000);
      }

      height = parseInt(el.css('height'));

      me._expandedIds[id].rowIndex = rowIndex;
      me._expandedIds[id].el = el;
      me._expandedIds[id].height = height;
      me._expandedIds[id].width = width;

      if (w.leftColumns) {
        var leftEl = G(document.createElement('div'));

        leftEl.css('left', '0px');
        leftEl.css('height', height);
        leftEl.css('width', w.getLeftFullWidth());
        leftEl.attr('index', rowIndex);

        leftEl.addCls(GRID_ROW_EXPAND_CLS);
        w.leftBody.el.dom.appendChild(leftEl.dom);

        me._expandedIds[id].leftEl = leftEl;
      }

      if (w.rightColumns) {
        var rightEl = G(document.createElement('div'));

        rightEl.css('left', '0px');
        rightEl.css('height', height);
        rightEl.css('width', w.getRightFullWidth());
        rightEl.attr('index', rowIndex);

        rightEl.addCls(GRID_ROW_EXPAND_CLS);
        w.rightBody.el.dom.appendChild(rightEl.dom);

        me._expandedIds[id].rightEl = rightEl;
      }

      setTimeout(function () {
        w.scroller.update();
      }, 100);
    },
    /*
     * @param {Number} rowIndex
     * @param {String} id
     */
    addMargin: function (rowIndex, id) {
      var me = this,
        w = me.widget,
        height = me._expandedIds[id].height,
        items = w.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + rowIndex + '"]');

      items.css('margin-top', height);
    },
    /*
     * @param {Number} rowIndex
     */
    clearMargin: function (rowIndex) {
      var w = this.widget;

      w.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + rowIndex + '"]').css('margin-top', '0');
    },
    /*
     *
     */
    onBeforeSort: function () {
      this.reSet();
    },
    /*
     *
     */
    onChangePage: function () {
      this.reSet();
    },
    /*
     *
     */
    onFilter: function () {
      this.reSet();
    },
    /*
     *
     */
    onRemove: function () {
      this.reSet();
    },
    /*
     *
     */
    reSet: function () {
      var me = this,
        w = me.widget;

      if(me.enabledCollapse === false){
        return;
      }

      for (var p in me._expandedIds) {
        var item = me._expandedIds[p];

        item.el.destroy();
        me.clearMargin(Number(item.rowIndex) + 1, p);
      }

      me._hideAllSideExpandedRow();

      me._expandedIds = {};

      me.reSetTop();
      me.reSetPlusScroll();
      me.changeSidesSize();
      w.scroller.scrollDelta(1);
      w.setSidesHeight();
      setTimeout(function () {
        w.setSidesHeight();
      }, 100);
    },
    /*
     * @param {Number} rowIndex
     * @param {String} id
     */
    showRow: function (rowIndex, id) {
      var me = this,
        w = me.widget,
        item = me._expandedIds[id];

      item.el.show();

      if (w.leftColumns) {
        item.leftEl.show();
      }

      if (w.rightColumns) {
        item.rightEl.show();
      }

      me.addMargin(rowIndex + 1, id);
    },
    /*
     * @param {Number} rowIndex
     * @return {Number}
     */
    getBeforeHeight: function (rowIndex) {
      var height = 0;

      for (var p in this._expandedIds) {
        var item = this._expandedIds[p];

        if (item.rowIndex < rowIndex && !item.hidden && item.el.css('display') !== 'none') {
          height += item.height;
        }
      }

      return height;
    },
    /*
     * @param {Boolean} [grouping]
     */
    reSetTop: function (grouping) {
      var me = this,
        w = me.widget,
        cellHeight = w.cellHeight,
        top = -w.scroller.scrollTop || 0,
        left = -w.scroller.scrollLeft || 0;

      if (w.grouping) {
        me.expandedGroups = {};
        var expanded = w.grouping.expanded;

        for (var p in expanded) {
          me.expandedGroups[p] = me.expandedGroups[p] || {};
        }
      }

      for (var p in me._expandedIds) {
        var item = me._expandedIds[p];

        if (item.el.css('display') === 'none') {
          continue;
        }

        //BUG: item.rowIndex has wrong value, if it has collapsed rows on top

        var beforeHeight = me.getBeforeHeight(item.rowIndex),
          rowIndex = me.getDisplayedRowsBefore(item, p),
          _top = top + (rowIndex) * cellHeight + beforeHeight;

        if (w.grouping) {
          var id = p,
            groupName = w.grouping.getGroupById(id),
            orderIndex = w.grouping.getGroupOrderIndex(groupName);

          if (item.el.css('display') !== 'none') {
            me.expandedGroups[groupName] = me.expandedGroups[groupName] || {};
            me.expandedGroups[groupName][p] = item;

            _top += (orderIndex + 1) * w.groupRowHeight;
          }
        }

        item.el.css({
          top: _top,
          left: left
        });

        if (w.leftColumns) {
          item.leftEl.css('top', _top);
        }

        if (w.rightColumns) {
          item.rightEl.css('top', _top);
        }
      }

      if (w.grouping && grouping !== false) {
        w.grouping.setPositions();
        w.grouping.setExpanderCellsPosition();
      }
    },
    /*
     * @param {Object} item
     * @param {String|Number} id
     * @return {Number}
     */
    getDisplayedRowsBefore: function (item, id) {
      var w = this.widget;

      if (w.grouping) {
        var rowIndex = 0;

        if (item.el.css('display') !== 'none') {
          rowIndex = w.store.getRow(id);
        }

        return rowIndex + 1;
      }

      return item.rowIndex + 1;
    },
    /*
     *
     */
    onScroll: function () {
      this.reSetTop();
    },
    /*
     *
     */
    reSetPlusScroll: function () {
      var me = this,
        w = me.widget;

      me.plusScroll = me.getPlusHeight();
      w.scroller.setRightKnobSize();

      setTimeout(function () {
        if (w.scroller.isRightScrollable() === false) {
          w.scroller.scroll(0);
        }
      }, 1);
    },
    /*
     * @return {Number}
     */
    getPlusHeight: function () {
      var me = this,
        plusHeight = 0;

      for (var p in me._expandedIds) {
        var item = me._expandedIds[p];

        if (!item.hidden && item.el.css('display') !== 'none') {
          plusHeight += item.height;
        }
      }

      me.plusHeight = plusHeight;

      return me.plusHeight;
    },
    /*
     *
     */
    onColumnReSize: function () {
      var me = this,
        w = me.widget;

      for (var p in me._expandedIds) {
        var item = me._expandedIds[p],
          width = w.getCenterFullWidth();

        item.el.css('width', width);

      }
    },
    /*
     * @param {Object} item
     * @return {Object}
     */
    prepareData: function (item) {
      var me = this,
        w = me.widget,
        data = item.data;

      if (me.dataFn) {
        data = me.dataFn(w, data);
      }

      return data;
    },
    /*
     *
     */
    changeSidesSize: function () {
      var w = this.widget;

      w.setSidesHeight();
      w.scroller.checkRightScroll();
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onRowDBlClick: function (grid, o) {
      var me = this,
        w = me.widget,
        rowIndex = Number(o.rowIndex),
        id = o.id,
        item = me._expandedIds[id];

      if (w.edit) {
        w.un('rowdblclick', me.onRowDBlClick, me);
        return;
      }

      if (item === undefined) {
        me.expand(rowIndex);
      }
      else {
        if (item.hidden === true && item.el.css('display') === 'none') {
          me.expand(rowIndex);
        }
        else {
          me.collapse(rowIndex);
        }
      }
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onRowTrackOver: function (grid, o) {
      var me = this,
        w = me.widget,
        item = me._expandedIds[o.id];

      if (item) {
        item.el.addCls(GRID_ROW_EXPAND_OVER_CLS);

        if (w.leftColumns) {
          item.leftEl.addCls(GRID_ROW_EXPAND_OVER_CLS);
        }

        if (w.rightColumns) {
          item.rightEl.addCls(GRID_ROW_EXPAND_OVER_CLS);
        }
      }
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onRowTrackLeave: function (grid, o) {
      var me = this,
        w = me.widget,
        item = me._expandedIds[o.id];

      if (item) {
        item.el.removeCls(GRID_ROW_EXPAND_OVER_CLS);

        if (w.leftColumns) {
          item.leftEl.removeCls(GRID_ROW_EXPAND_OVER_CLS);
        }

        if (w.rightColumns) {
          item.rightEl.removeCls(GRID_ROW_EXPAND_OVER_CLS);
        }
      }
    },
    /*
     * @param {Object} e
     */
    onExpandRowMouseEnter: function (e) {
      var me = this,
        w = me.widget,
        scroller = w.scroller,
        expandRowEl = G(e.currentTarget),
        index = expandRowEl.attr('index');

      w.el.select('.' + GRID_ROW_EXPAND_CLS + '[index="' + index + '"]').addCls(GRID_ROW_EXPAND_OVER_CLS);

      if (!w.trackOver || scroller.bottomKnobDown || scroller.rightKnobDown) {
      }
      else {
        w.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + index + '"]').addCls(GRID_ROW_OVER_CLS);
      }
    },
    /*
     * @param {Object} e
     */
    onExpandRowMouseLeave: function (e) {
      var me = this,
        w = me.widget,
        scroller = w.scroller,
        expandRowEl = G(e.currentTarget),
        index = expandRowEl.attr('index');

      w.el.select('.' + GRID_ROW_EXPAND_CLS + '[index="' + index + '"]').removeCls(GRID_ROW_EXPAND_OVER_CLS);

      if (!w.trackOver || scroller.bottomKnobDown || scroller.rightKnobDown) {
      }
      else {
        w.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + index + '"]').removeCls(GRID_ROW_OVER_CLS);
      }
    },
    /*
     *
     */
    onSelect: function () {
      var me = this,
        w = me.widget,
        selection = w.selection;

      if (!selection || (!selection.row && !selection.rows)) {
        return;
      }

      me.onClearSelect();

      selection = w.getSelection(true);
      var rows = selection.rows,
        i = 0,
        iL = rows.length;

      for (; i < iL; i++) {
        var rowIndex = rows[i];

        w.el.select('.' + GRID_ROW_EXPAND_CLS + '[index="' + rowIndex + '"]').addCls(GRID_ROW_EXPAND_SELECTED_CLS);
      }
    },
    /*
     *
     */
    onClearSelect: function () {
      var me = this,
        w = me.widget,
        selection = w.selection;

      if (!selection.row && !selection.rows) {
        return;
      }

      selection = w.getSelection(true);

      var shouldBeSelected = {},
        rows = selection.rows,
        i = 0,
        iL = rows.length;

      for (; i < iL; i++) {
        shouldBeSelected[rows[i]] = true;
      }

      var selected = w.el.select('.' + GRID_ROW_EXPAND_SELECTED_CLS),
        i = 0,
        iL = selected.length;

      for (; i < iL; i++) {
        var index = selected.item(i).attr('index');

        if (!shouldBeSelected[index]) {
          w.el.select('.' + GRID_ROW_EXPAND_CLS + '[index="' + index + '"]').removeCls(GRID_ROW_EXPAND_SELECTED_CLS);
        }
      }
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Number} index
     * @param {String} groupName
     */
    onGroupCollapse: function (grid, index, groupName) {
      var me = this,
        w = me.widget,
        expandedGroups = me.expandedGroups;

      if (expandedGroups[groupName]) {
        var items = expandedGroups[groupName];

        for (var q in items) {
          var item = items[q];

          if (me._expandedIds[q]) {
            delete me._expandedIds[q];
          }

          item.el.hide();
          if (item.leftEl.dom) {
            item.leftEl.hide();
          }

          if (item.rightEl.dom) {
            item.rightEl.hide();
          }
        }
      }

      me.reSetTop(false);
      me.reSetIndexes();
      setTimeout(function () {
        w.grouping.setExpanderCellsPosition();
      }, 1);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Number} index
     * @param {String} groupName
     */
    onGroupExpand: function (grid, index, groupName) {
      var me = this,
        w = me.widget;

      me.reSetTop(false);
      me.reSetIndexes();
      setTimeout(function () {
        w.grouping.setExpanderCellsPosition();
      }, 1);
    },
    /*
     *
     */
    reSetIndexes: function () {
      var me = this,
        w = me.widget,
        s = w.store;

      for (var id in me._expandedIds) {
        me._expandedIds[id].rowIndex = s.getRow(id);
      }
    },
    onAdd: function(){
      this.reSet();
    },
    onBeforeInsert: function(){
      this.reSet();
    },
    onColumnDrag: function () {
      this.reSet();
      this.clearExpandedCheckBoxes();
    },
    onLockColumn: function () {
      this.reSet();
      this.clearExpandedCheckBoxes();
    },
    onRightLockColumn: function () {
      this.reSet();
      this.clearExpandedCheckBoxes();
    },
    onUnLockColumn: function () {
      this.reSet();
      this.clearExpandedCheckBoxes();
    },
    clearExpandedCheckBoxes: function () {
      var me = this,
        w = me.widget;

      w.el.select('.fancy-checkbox-expander.fancy-checkbox-on').each(function (cell) {
        var id = cell.attr('id'),
          checkBox = Fancy.getWidget(id);

        checkBox.setValue(false, false);
      });
    }
  });

})();