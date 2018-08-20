/*
 * @mixin Fancy.store.mixin.Grouping
 */
Fancy.Mixin('Fancy.store.mixin.Grouping', {
  /*
   * @param {String} group
   * @param {*} value
   */
  expand: function(group, value){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      dataView = [],
      dataViewMap = {},
      dataViewIndexes = {};

    if(me.filteredData){
      data = me.filteredData;
      iL = data.length;
    }

    me.expanded = me.expanded || {};
    me.expanded[value] = true;

    for(;i<iL;i++){
      var item = data[i];

      if(me.expanded[ item.data[group] ]){
        dataView.push(item);
        dataViewMap[item.id] = dataView.length - 1;
        dataViewIndexes[dataView.length - 1] = i;
      }
    }

    me.dataView = dataView;
    me.dataViewMap = dataViewMap;
    me.dataViewIndexes = dataViewIndexes;
  },
  /*
   * @param {String} group
   * @param {*} value
   */
  collapse: function(group, value){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      dataView = [],
      dataViewMap = {},
      dataViewIndexes = {};

    me.expanded = me.expanded || {};
    delete me.expanded[value];

    for(;i<iL;i++){
      var item = data[i];

      if(me.expanded[ item.data[group] ]){
        dataView.push(item);
        dataViewMap[item.id] = dataView.length - 1;
        dataViewIndexes[dataView.length - 1] = i;
      }
    }

    me.dataView = dataView;
    me.dataViewMap = dataViewMap;
    me.dataViewIndexes = dataViewIndexes;
  },
  /*
   * @param {Array} groups
   * @param {String} by
   */
  changeOrderByGroups: function(groups, by){
    var me = this,
      grouped = {},
      data = [];

    Fancy.each(groups, function(group){
      grouped[group] = [];
    });

    if(Fancy.isArray(me.data)){
      Fancy.each(me.data, function(item){
        var group = item.data[by];

        if(grouped[group]){
          grouped[group].push(item);
        }
      });
    }

    Fancy.each(groups, function (group){
      data = data.concat(grouped[group]);
    });

    me.grouping = {
      by: by
    };

    me.data = data;
  },
  /*
   * @param {String} key
   * @param {String} group
   */
  getColumnOriginalValuesByGroup: function(key, group, options){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      result = [],
      values = [],
      groupName = data[0].data[group];

    if(options && options.format && options.type === 'date'){
      for (; i < iL; i++) {
        if (data[i].data[group] === groupName) {
          values.push(Fancy.Date.parse(data[i].data[key], options.format, options.mode));
        }
        else {
          result.push({
            values: values,
            groupName: groupName
          });
          values = [];
          groupName = data[i].data[group];
          i--;
        }
      }
    }
    else {
      for (; i < iL; i++) {
        if (data[i].data[group] === groupName) {
          values.push(data[i].data[key]);
        }
        else {
          result.push({
            values: values,
            groupName: groupName
          });
          values = [];
          groupName = data[i].data[group];
          i--;
        }
      }
    }

    if(iL > 0) {
      result.push({
        values: values,
        groupName: groupName
      });
    }

    return result;
  },
  /*
   * @param {String} [dataProperty]
   * @return {Object}
   */
  initGroups: function(dataProperty){
    var me = this,
      w = me.widget,
      grouping = w.grouping,
      dataProperty = dataProperty || 'data',
      by = grouping.by;

    if(!by){
      throw new Error('[FancyGrid Error] - not set by param in grouping');
    }

    var values = me.getColumnOriginalValues(by, {
        dataProperty: dataProperty,
        groupMap: true
      }),
      _groups = {};

    Fancy.each(values, function(value){
      if(_groups[value] === undefined){
        _groups[value] = 0;
      }

      _groups[value]++;
    });

    var groups = [];

    for(var p in _groups){
      groups.push(p);
    }

    return {
      groups: groups,
      _groups: _groups
    };
  },
  /*
   *
   */
  orderDataByGroupOnStart: function(){
    var me = this,
      grouping = me.widget.grouping,
      o = me.initGroups(),
      groups = o.groups,
      groupNameUpperCase = {},
      upperGroups = [];

    Fancy.each(groups, function(group){
      var upperGroup = group.toLocaleUpperCase();

      groupNameUpperCase[upperGroup] = group;
      upperGroups.push(upperGroup);
    });

    upperGroups = upperGroups.sort();

    var i = 0,
      iL = groups.length;

    for(;i<iL;i++){
      groups[i] = groupNameUpperCase[ upperGroups[i] ];
    }

    me.changeOrderByGroups(groups, grouping.by);

    me.expanded = {};
    if(grouping.collapsed){
      me.collapsed = true;
    }
    else{
      Fancy.each(groups, function(group){
        if( !grouping.expanded || grouping.expanded[group] === undefined ){
          me.expanded[group] = true;
        }
      });
    }

    me.changeDataView({
      doNotFired: true
    });
  },
  /*
   * @param {String} groupName
   */
  /*
   * TODO: needs some map of elements for fast getting elements.
   */
  getItemsByGroup: function (groupName) {
    var me = this,
      items = me.findItem(me.grouping.by, groupName);

    return items;
  }
});/*
 * @class Fancy.grid.plugin.Grouping
 * @extend Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;
  var E = Fancy.each;

  //CONSTANTS
  var GRID_ROW_GROUP_INNER_CLS = F.GRID_ROW_GROUP_INNER_CLS;
  var GRID_ROW_GROUP_CLS = F.GRID_ROW_GROUP_CLS;
  var GRID_ROW_GROUP_COLLAPSED_CLS = F.GRID_ROW_GROUP_COLLAPSED_CLS;
  var GRID_CELL_CLS = F.GRID_CELL_CLS;

  F.define('Fancy.grid.plugin.Grouping', {
    extend: F.Plugin,
    ptype: 'grid.grouping',
    inWidgetName: 'grouping',
    tpl: '{text}:{number}',
    _renderFirstTime: true,
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
      var me = this,
        w = me.widget;

      me.Super('init', arguments);

      me._expanded = {};

      me.initTpl();
      me.initGroups();
      me.initOrder();
      me.calcPlusScroll();
      me.configParams();

      me.ons();

      if (!me.collapsed && w.store.data) {
        setTimeout(function () {
          w.store.changeDataView({
            doNotFired: true
          });

          w.update();
        }, 100);
      }
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget,
        s = w.store;

      w.once('render', function () {
        me.renderGroupedRows();
        me.update();

        w.el.on('click', me.onClick, me, 'div.' + GRID_ROW_GROUP_CLS);
        w.el.on('mousedown', me.onMouseDown, me, 'div.' + GRID_ROW_GROUP_CLS);
        w.on('scroll', me.onScroll, me);

        w.on('columnresize', me.onColumnResize, me);

        s.on('insert', me.onInsert, me);
        s.on('remove', me.onRemove, me);

        w.on('columndrag', me.onColumnDrag, me);
      });
    },
    onInsert: function () {
      this.reGroup();
    },
    onRemove: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        groups = me.groups;

      me.initGroups();
      me.update();
      me.updateGroupRowsText();

      if (groups.length > me.groups.length) {
        var removedGroup;

        E(groups, function (group, i) {
          if (group !== me.groups[i]) {
            removedGroup = group;
            return true;
          }
        });

        delete s.expanded[removedGroup];
        delete me.expanded[removedGroup];
        delete me._expanded[removedGroup];
      }
    },
    /*
     * @param {String} [dataProperty]
     */
    initGroups: function (dataProperty) {
      var me = this,
        w = me.widget,
        s = w.store,
        o = s.initGroups(dataProperty);

      me.groups = o.groups;
      me.groupsCounts = o._groups;
    },
    /*
     * @param {String|Number} id
     * @return {String}
     */
    getGroupById: function (id) {
      var w = this.widget,
        s = w.store;

      return s.groupMap[id];
    },
    /*
     * @param {String} group
     * @return {Number}
     */
    getGroupOrderIndex: function (group) {
      var groups = this.groups,
        i = 0,
        iL = groups.length;

      for (; i < iL; i++) {
        if (groups[i] === group) {
          return i
        }
      }
    },
    /*
     *
     */
    initOrder: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        groups = [],
        i,
        iL,
        groupNameUpperCase = {},
        upperGroups = [];

      if (me.order && me.order.length !== 0) {
        switch (F.typeOf(me.order)) {
          case 'string':
            //TODO
            break;
          case 'array':
            //TODO
            break;
        }
      }
      else {
        groups = me.groups;
        i = 0;
        iL = groups.length;

        E(groups, function (group) {
          var upperGroup = group.toLocaleUpperCase();

          groupNameUpperCase[upperGroup] = group;
          upperGroups.push(upperGroup);
        });

        upperGroups = upperGroups.sort();

        for (; i < iL; i++) {
          groups[i] = groupNameUpperCase[upperGroups[i]];
        }
      }

      me.groups = groups;
      s.changeOrderByGroups(groups, me.by);
    },
    /*
     *
     */
    calcPlusScroll: function () {
      var w = this.widget;

      this.plusScroll = this.groups.length * w.groupRowHeight;
    },
    /*
     *
     */
    configParams: function () {
      var me = this,
        w = me.widget,
        s = w.store;

      me.expanded = me.expanded || {};
      s.expanded = s.expanded || {};

      if (me.collapsed) {
        s.collapsed = true;
      }
      else {
        E(me.groups, function (group) {
          if (me.expanded[group] === undefined) {
            s.expanded[group] = true;
            me.expanded[group] = true;
            me._expanded[group] = true;
          }
        });
      }
    },
    /*
     *
     */
    renderGroupedRows: function () {
      var me = this,
        w = me.widget,
        body = w.body,
        leftBody = w.leftBody,
        rightBody = w.rightBody,
        width = w.getCenterFullWidth(),
        leftWidth = w.getLeftFullWidth(),
        rightWidth = w.getRightFullWidth(),
        el,
        passedTop = 0;

      E(me.groups, function (groupText) {
        var groupCount = me.groupsCounts[groupText];

        if (leftWidth) {
          el = me.generateGroupRow(groupText, groupCount, true, passedTop);
          el.css('width', leftWidth);
          leftBody.el.dom.appendChild(el.dom);

          el = me.generateGroupRow(groupText, groupCount, false, passedTop);
          el.css('width', width);
          body.el.dom.appendChild(el.dom);
        }
        else {
          el = me.generateGroupRow(groupText, groupCount, true, passedTop);
          el.css('width', width);
          body.el.dom.appendChild(el.dom);
        }

        if (rightWidth) {
          el = me.generateGroupRow(groupText, groupCount, false, passedTop);
          el.css('width', rightWidth);
          rightBody.el.dom.appendChild(el.dom);
        }

        if (me.collapsed) {
          passedTop += w.groupRowHeight;
        }
      });
    },
    /*
     * Light render method to add group rows for case when lock columns.
     *
     * @param {String} side
     */
    softRenderGroupedRows: function(side){
      var me = this,
        w = me.widget,
        body = w.body,
        leftBody = w.leftBody,
        rightBody = w.rightBody,
        leftWidth,
        rightWidth,
        groupEls;

      switch(side){
        case 'left':
          if( leftBody.el.select('.' + GRID_ROW_GROUP_CLS).length ){
            var groupInnerEls = body.el.select('.' + GRID_ROW_GROUP_INNER_CLS);

            if(groupInnerEls.length){
              groupInnerEls.destroy();
            }
            return;
          }

          groupEls = body.el.select('.' + GRID_ROW_GROUP_CLS);
          leftWidth = w.getLeftFullWidth();

          E(me.groups, function (groupText, i) {
            var groupCount = me.groupsCounts[groupText],
              groupEl = groupEls.item(i),
              top = parseInt(groupEl.css('top')),
              el = me.generateGroupRow(groupText, groupCount, true, top);

            if(!groupEl.hasClass(GRID_ROW_GROUP_COLLAPSED_CLS)){
              el.removeCls(GRID_ROW_GROUP_COLLAPSED_CLS);
            }

            groupEl.select('.'+ GRID_ROW_GROUP_INNER_CLS).destroy();

            el.css('width', leftWidth);
            leftBody.el.dom.appendChild(el.dom);
          });

          break;
        case 'right':
          if( rightBody.el.select('.' + GRID_ROW_GROUP_CLS).length ){
            return;
          }

          rightWidth = w.getRightFullWidth();
          groupEls = body.el.select('.' + GRID_ROW_GROUP_CLS);

          E(me.groups, function (groupText, i) {
            var groupCount = me.groupsCounts[groupText],
              groupEl = groupEls.item(i),
              top = parseInt(groupEl.css('top')),
              el = me.generateGroupRow(groupText, groupCount, false, top);


            el.css('width', rightWidth);
            rightBody.el.dom.appendChild(el.dom);
          });
          break;
      }
    },
    /*
     *
     */
    removeGroupRows: function () {
      var me = this,
        w = me.widget,
        columns = w.columns,
        leftColumns = w.leftColumns,
        rightColumns = w.rightColumns,
        body = w.body,
        leftBody = w.leftBody,
        rightBody = w.rightBody;

      if (columns.length) {
        body.el.select('.' + GRID_ROW_GROUP_CLS).remove();
      }

      if (leftColumns.length) {
        leftBody.el.select('.' + GRID_ROW_GROUP_CLS).remove();
      }

      if (rightColumns.length) {
        rightBody.el.select('.' + GRID_ROW_GROUP_CLS).remove();
      }
    },
    /*
    *
    */
    removeLastGroupRow: function () {
      var me = this,
        w = me.widget,
        columns = w.columns,
        groups = me.groups,
        lastItemIndex = groups.length,
        leftColumns = w.leftColumns,
        rightColumns = w.rightColumns,
        body = w.body,
        leftBody = w.leftBody,
        rightBody = w.rightBody;

      if (columns.length) {
        var el = body.el.select('.' + GRID_ROW_GROUP_CLS).item(lastItemIndex);
        el.remove();
      }

      if (leftColumns.length) {
        leftBody.el.select('.' + GRID_ROW_GROUP_CLS).item(lastItemIndex).remove();
      }

      if (rightColumns.length) {
        rightBody.el.select('.' + GRID_ROW_GROUP_CLS).item(lastItemIndex).remove();
      }
    },
    /*
     *
     */
    removeCells: function () {
      var me = this,
        w = me.widget,
        columns = w.columns,
        leftColumns = w.leftColumns,
        rightColumns = w.rightColumns,
        body = w.body,
        leftBody = w.leftBody,
        rightBody = w.rightBody;

      if (columns.length) {
        body.el.select('.' + GRID_CELL_CLS).remove();
      }

      if (leftColumns.length) {
        leftBody.el.select('.' + GRID_CELL_CLS).remove();
      }

      if (rightColumns.length) {
        rightBody.el.select('.' + GRID_CELL_CLS).remove();
      }
    },
    /*
     * @param {String} groupText
     * @param {Number} groupCount
     * @param {Boolean} addText
     * @param {Number} top
     */
    generateGroupRow: function (groupText, groupCount, addText, top) {
      var me = this,
        el = F.get(document.createElement('div'));

      el.addCls(GRID_ROW_GROUP_CLS);
      el.attr('group', groupText);
      if (addText) {
        var text = me.tpl.getHTML({
          text: groupText,
          number: groupCount
        });
        el.update('<div class="' + GRID_ROW_GROUP_INNER_CLS + '"> ' + text + '</div>');
      }

      if (me.collapsed) {
        el.css('top', top + 'px');
        el.addCls(GRID_ROW_GROUP_COLLAPSED_CLS);
      }
      else {
        el.css('top', '0px');
      }

      return el;
    },
    /*
     *
     */
    insertGroupEls: function () {
      var me = this,
        w = me.widget,
        leftBody = w.leftBody,
        body = w.body;

      if (w.leftColumns.length) {
        leftBody.el.select('.' + GRID_ROW_GROUP_CLS).each(function (el) {
          var groupText = me.groups[i];

          el.update('<div class="' + GRID_ROW_GROUP_INNER_CLS + '">' + groupText + '</div>');
        });
      }
      else {
        body.el.select('.' + GRID_ROW_GROUP_CLS).each(function (el, i) {
          var groupText = me.groups[i],
            groupCount = me.groupsCounts[groupText],
            text = me.tpl.getHTML({
              text: groupText,
              number: groupCount
            });

          el.update('<div class="' + GRID_ROW_GROUP_INNER_CLS + '">' + text + '</div>');
        });
      }
    },
    /*
     * @param {Object} e
     */
    onClick: function (e) {
      var me = this,
        w = me.widget,
        rowEl = F.get(e.currentTarget),
        isCollapsed,
        group = rowEl.attr('group');

      w.el.select('.' + GRID_ROW_GROUP_CLS + '[group="' + group + '"]').toggleCls(GRID_ROW_GROUP_COLLAPSED_CLS);

      isCollapsed = rowEl.hasCls(GRID_ROW_GROUP_COLLAPSED_CLS);

      if (isCollapsed) {
        me.collapse(me.by, group);
      }
      else {
        me.expand(me.by, group);
      }

      //update works very slow in this case
      //it needs some fast solution without update
      //me.fastCollapse();
      me.update();
    },
    /*
     *
     */
    fastCollapse: function () {
    },
    /*
     * @param {Object} e
     */
    onMouseDown: function (e) {
      e.preventDefault();
    },
    /*
     *
     */
    onScroll: function () {
      this.setPositions();
    },
    /*
     * @param {String} group
     * @param {String} value
     */
    collapse: function (group, value) {
      var me = this,
        w = me.widget,
        s = w.store;

      s.collapse(group, value);
      delete me._expanded[value];
      delete me.expanded[value];

      w.fire('collapse', group, value);
    },
    /*
     * @param {String} group
     * @param {String} value
     */
    expand: function (group, value) {
      var me = this,
        w = me.widget,
        s = w.store;

      s.expand(group, value);
      me._expanded[value] = true;
      me.expanded[value] = true;

      w.fire('expand', group, value);
    },
    /*
     *
     */
    setPositions: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        top = -w.scroller.scrollTop || 0,
        leftRows = w.leftBody.el.select('.' + GRID_ROW_GROUP_CLS),
        rows = w.body.el.select('.' + GRID_ROW_GROUP_CLS),
        rightRows = w.rightBody.el.select('.' + GRID_ROW_GROUP_CLS);

      E(me.groups, function (groupName, i) {
        if (leftRows.length) {
          leftRows.item(i).css('top', top + 'px');
        }

        if (rows.length) {
          rows.item(i).css('top', top + 'px');
        }

        if (rightRows.length) {
          rightRows.item(i).css('top', top + 'px');
        }

        if (w.expander) {
          var expanded = w.expander.expandedGroups[groupName];

          for (var p in expanded) {
            var item = expanded[p];

            top += parseInt(item.el.css('height'));
          }
        }

        top += w.groupRowHeight;

        if (me._expanded[groupName] === true) {
          if(w.rowheight){
            var items = s.getItemsByGroup(groupName),
              groupRowsHeight = w.rowheight.getRowsHeight(items);

            if(isNaN(top)){
              return true;
            }

            top += groupRowsHeight;
          }
          else {
            top += me.groupsCounts[groupName] * w.cellHeight;
          }
        }
      });
    },
    /*
     * @param {Number} index
     * @param {String} side
     */
    setCellsPosition: function (index, side) {
      var me = this,
        w = me.widget,
        i = 0,
        iL = me.groups.length,
        j = 0,
        jL,
        body = w.body,
        leftBody = w.leftBody,
        rightBody = w.rightBody,
        row = 0,
        top = w.groupRowHeight,
        rows = [],
        cell,
        marginedRows = {},
        rowExpanderGroupMargined = {},
        by = me.by;

      for (; i < iL; i++) {
        var groupName = me.groups[i];

        if (me._expanded[groupName] === true) {
          rows.push(row);
          marginedRows[row] = true;

          if (side === undefined || side === 'center') {
            j = 0;
            jL = w.columns.length;

            if (index !== undefined) {
              j = index;
              jL = index + 1;
            }

            if (w.expander) {
              var dataItem = w.get(row),
                _itemGroupName = dataItem.get(by),
                expandedGroups = w.expander.expandedGroups,
                groupOrderIndex = me.getGroupOrderIndex(groupName),
                plusHeight = 0;

              for (var p in expandedGroups) {
                var _groupOrderIndex = me.getGroupOrderIndex(p);

                if (groupOrderIndex <= _groupOrderIndex) {
                  continue;
                }

                var groupItems = expandedGroups[p];

                for (var q in groupItems) {
                  var _item = groupItems[q];

                  if (_item.el.css('display') !== 'none' && !rowExpanderGroupMargined[q]) {
                    var prevRow = row - 1;
                    if (row < 0) {
                      row = 0;
                    }
                    prevRow = w.get(prevRow);
                    var prevRowGroupName = prevRow.get(by);
                    if (_itemGroupName !== prevRowGroupName) {
                      if (prevRow.id === q) {
                        rowExpanderGroupMargined[q] = true;
                        plusHeight += parseInt(_item.el.css('height'));
                      }
                    }
                    else {
                      rowExpanderGroupMargined[q] = true;
                      plusHeight += parseInt(_item.el.css('height'));
                    }
                  }
                }
              }

              top += plusHeight;

              cell = body.getCell(row, j);

              for (; j < jL; j++) {
                cell = body.getCell(row, j);
                cell.css('margin-top', top + 'px');
              }
            }
            else {
              for (; j < jL; j++) {
                cell = body.getCell(row, j);

                cell.css('margin-top', top + 'px');
              }
            }
          }

          if (side === undefined || side === 'left') {
            j = 0;
            jL = w.leftColumns.length;

            if (index !== undefined) {
              j = index;
              jL = index + 1;
            }

            for (; j < jL; j++) {
              cell = leftBody.getCell(row, j);

              cell.css('margin-top', top + 'px');
            }
          }

          if (side === undefined || side === 'right') {
            j = 0;
            jL = w.rightColumns.length;

            if (index !== undefined) {
              j = index;
              jL = index + 1;
            }

            for (; j < jL; j++) {
              cell = rightBody.getCell(row, j);

              cell.css('margin-top', top + 'px');
            }
          }

          row += me.groupsCounts[groupName];
          top = w.groupRowHeight;
        }
        else {
          top += w.groupRowHeight;
        }
      }

      if (me._renderFirstTime) {
        me._renderFirstTime = false;
      }
      else {
        var toClearMargins = [];

        E(me.prevRows, function (rowIndex) {
          if (marginedRows[rowIndex] !== true) {
            toClearMargins.push(rowIndex);
          }
        });

        me.clearMargins(toClearMargins);
      }

      me.prevRows = rows;
    },
    /*
     * It is used only to collapse groups of 'grouping row' with 'row expander'.
     */
    setExpanderCellsPosition: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        dataView = s.dataView,
        body = w.body,
        leftBody = w.leftBody,
        rightBody = w.rightBody,
        cell,
        expandedGroups = w.expander.expandedGroups,
        groupsCounts = me.groupsCounts,
        dataItem,
        top = w.groupRowHeight,
        rowIndex = 0,
        nextPlusTop = 0;

      E(me.groups, function (groupName) {
        if (me._expanded[groupName] === true) {
          var iL = rowIndex + groupsCounts[groupName];

          for (; rowIndex < iL; rowIndex++) {
            dataItem = dataView[rowIndex];
            if (!dataItem) {
              continue;
            }

            var dataItemId = dataItem.id,
              expandedItem = expandedGroups[groupName][dataItemId];

            if (nextPlusTop) {
              top += nextPlusTop;
              nextPlusTop = 0;
            }

            if (expandedItem) {
              nextPlusTop = parseInt(expandedItem.el.css('height'));
            }

            E(w.columns, function (column, i) {
              cell = body.getCell(rowIndex, i);
              cell.css('margin-top', top + 'px');
            });

            E(w.leftColumns, function (column, i) {
              cell = leftBody.getCell(rowIndex, i);
              cell.css('margin-top', top + 'px');
            });

            E(w.rightColumns, function (column, i) {
              cell = rightBody.getCell(rowIndex, i);
              cell.css('margin-top', top + 'px');
            });

            top = 0;
          }

          top = w.groupRowHeight;
        }
        else {
          top += w.groupRowHeight;
        }
      });
    },
    /*
     * @params {Array|undefined} rows
     */
    clearMargins: function (rows) {
      var me = this,
        rows = rows || me.prevRows;

      if (rows === undefined) {
        return;
      }

      var w = me.widget,
        body = w.body,
        leftBody = w.leftBody,
        rightBody = w.rightBody,
        cell;

      E(rows, function (row) {
        E(w.columns, function (column, j) {
          cell = body.getCell(row, j);
          if (cell.dom === undefined) {
            return true;
          }

          cell.css('margin-top', '0px');
        });

        E(w.leftColumns, function (column, j) {
          cell = leftBody.getCell(row, j);

          if (cell.dom === undefined) {
            return true;
          }

          cell.css('margin-top', '0px');
        });

        E(w.rightColumns, function (column, j) {
          cell = rightBody.getCell(row, j);

          if (cell.dom === undefined) {
            return true;
          }

          cell.css('margin-top', '0px');
        });
      });
    },
    /*
     *
     */
    onColumnResize: function () {
      this.updateGroupRows();
    },
    /*
     *
     */
    updateGroupRows: function () {
      var me = this,
        w = me.widget,
        leftColumns = w.leftColumns,
        rightColumns = w.rightColumns,
        body = w.body,
        leftBody = w.leftBody,
        rightBody = w.rightBody,
        width = 0;

      width += w.getCenterFullWidth();

      body.el.select('.' + GRID_ROW_GROUP_CLS).css('width', width + 'px');

      width += w.getLeftFullWidth();

      if (leftColumns.length) {
        leftBody.el.select('.' + GRID_ROW_GROUP_CLS).css('width', width + 'px');
      }

      width += w.getRightFullWidth();

      if (rightColumns.length) {
        rightBody.el.select('.' + GRID_ROW_GROUP_CLS).css('width', width + 'px');
      }
    },
    /*
     * @param {Boolean} loaded
     */
    update: function (loaded) {
      var me = this,
        w = me.widget,
        s = w.store;

      if (!loaded && (s.loading === true || s.autoLoad === false) && !s.data.length) {
        //s.once('load', function(){
        s.on('load', function () {
          me.initGroups();
          me.initOrder();
          me.calcPlusScroll();
          me.configParams();
          s.changeDataView({
            doNotFired: true
          });

          me.renderGroupedRows();
          me.update(true);
        }, me);
      }
      else if (loaded && s.data.length && s.loadedTimes > 1) {
        me.reGroup();
      }
      else {
        me.setPositions();
        w.update();
        w.scroller.update();
        me.setCellsPosition();
        w.setSidesHeight();
      }
    },
    /*
     * @param {Number} rowIndex
     * @return {Number}
     */
    getOffsetForRow: function (rowIndex) {
      var me = this,
        w = me.widget,
        top = 0,
        rows = 0;

      E(me.groups, function (groupName) {
        top += w.groupRowHeight;

        if (me._expanded[groupName] === true) {
          rows += me.groupsCounts[groupName];
        }

        if (rowIndex < rows) {
          return true;
        }
      });

      return top;
    },
    /*
     * @param {Number} rowIndex
     * @return {Number}
     */
    getSpecialRowsUnder: function (rowIndex) {
      var me = this,
        w = me.widget,
        top = 0,
        rows = 0,
        rowsAfter = 0;

      E(me.groups, function (groupName) {
        if (rowIndex < rows) {
          rowsAfter++;
        }

        top += w.groupRowHeight;

        if (me._expanded[groupName] === true) {
          rows += me.groupsCounts[groupName];
        }
      });

      return rowsAfter;
    },
    /*
     * @param {Number} rowIndex
     * @return {Number}
     */
    getSpecialRowsAbove: function (rowIndex) {
      var me = this,
        w = me.widget,
        item = w.get(rowIndex),
        group = me.getGroupById(item.id),
        rows = 0;

      Fancy.each(me.groups, function (_group) {
        rows++;
        if(group === _group){
          return true;
        }
      });

      return rows;
    },
    /*
     *
     */
    reGroup: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        dataProperty = 'data';

      me.expanded = {};
      me._expanded = {};
      w.store.expanded = {};
      w.store.dataView = [];

      me.collapsed = true;

      if (w.store.filteredData) {
        dataProperty = 'filteredData';
      }

      me.removeGroupRows();
      me.removeCells();

      me.initGroups(dataProperty);
      if (s.remoteFilter) {
        me.initOrder();
      }
      me.calcPlusScroll();
      me.configParams();
      me.renderGroupedRows();
      w.setSidesHeight();
    },
    /*
     * @param {Number} value
     */
    scrollLeft: function (value) {
      this.widget.body.el.select('.' + GRID_ROW_GROUP_CLS).css('left', value);
    },
    /*
     *
     */
    updateGroupRowsText: function () {
      var me = this,
        w = me.widget,
        groups = me.groups,
        leftBody = w.leftBody,
        body = w.body,
        rightBody = w.rightBody,
        leftGroupInnerEls = leftBody.el.select('.' + GRID_ROW_GROUP_INNER_CLS),
        groupElInners = body.el.select('.' + GRID_ROW_GROUP_INNER_CLS),
        leftGroupEls = leftBody.el.select('.' + GRID_ROW_GROUP_CLS),
        groupEls = body.el.select('.' + GRID_ROW_GROUP_CLS),
        rightGroupEls = rightBody.el.select('.' + GRID_ROW_GROUP_CLS);

      E(groups, function (groupText, i) {
        var groupCount = me.groupsCounts[groupText],
          text = me.tpl.getHTML({
            text: groupText,
            number: groupCount
          }),
          groupEl;

        if (w.leftColumns.length) {
          leftGroupInnerEls.item(i).update(text);
          groupEl = leftGroupEls.item(i);
          groupEl.attr('group', groupText);

          if (me.expanded[groupText]) {
            groupEl.removeClass(GRID_ROW_GROUP_COLLAPSED_CLS);
          }
          else {
            groupEl.addClass(GRID_ROW_GROUP_COLLAPSED_CLS);
          }
        }
        else {
          groupElInners.item(i).update(text);
          groupEl = groupEls.item(i);

          if (me.expanded[groupText]) {
            groupEl.removeClass(GRID_ROW_GROUP_COLLAPSED_CLS);
          }
          else {
            groupEl.addClass(GRID_ROW_GROUP_COLLAPSED_CLS);
          }
        }

        groupEls.item(i).attr('group', groupText);

        if (w.rightColumns.length) {
          rightGroupEls.item(i).attr('group', groupText);
        }
      });

      if (groups.length < body.el.select('.' + GRID_ROW_GROUP_CLS).length) {
        setTimeout(function () {
          me.removeLastGroupRow();
        }, 10);
      }
    },
    onColumnDrag: function () {
      var me = this,
        w = me.widget,
        groupRowEls = w.el.select('.' + GRID_ROW_GROUP_CLS),
        notCollapsedEls = w.el.select('.' + GRID_ROW_GROUP_CLS + ':not(.' + GRID_ROW_GROUP_COLLAPSED_CLS + ')'),
        expandedGroups = {};

      notCollapsedEls.each(function(cell){
        expandedGroups[cell.attr('group')] = true;
      });

      if(!w.leftColumns.length && groupRowEls.length){
        groupRowEls.destroy();
        me.renderGroupedRows();
        me.update();

        for(var p in expandedGroups){
          var groupEl = w.el.select('.' + GRID_ROW_GROUP_CLS + '[group="' + p + '"]');

          groupEl.removeCls(GRID_ROW_GROUP_COLLAPSED_CLS);
        }
      }
    },
    /*
     *
     */
    getGroupRowsHeight: function () {
      var me = this,
        w = me.widget,
        numberFilledGroups = 0;

      F.each(me.groupsCounts, function (value) {
        if(value){
          numberFilledGroups++;
        }
      });

      return numberFilledGroups * w.groupRowHeight;
    }
  });

})();