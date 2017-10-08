/*
 * @class Fancy.grid.plugin.Expander
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.Expander', {
  extend: Fancy.Plugin,
  ptype: 'grid.expander',
  inWidgetName: 'expander',
  plusScroll: 0,
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
  ons: function(){
    var me = this,
      w = me.widget,
      s = w.store,
      expandRowCls = w.expandRowCls;

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

    w.on('render', function() {
      w.el.on('mouseenter', me.onExpandRowMouseEnter, me, 'div.' + expandRowCls);
      w.el.on('mouseleave', me.onExpandRowMouseLeave, me, 'div.' + expandRowCls);
    });

    w.on('select', me.onSelect, me);
    w.on('clearselect', me.onClearSelect, me);

    if(me.expanded) {
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
  expand: function(rowIndex){
    var me = this,
      w = me.widget,
      cellCls = w.cellCls,
      id = w.get(rowIndex).id;

    if(me._expandedIds[id] === undefined){
      me._expandedIds[id] = {};
      me.expandRow(Number(rowIndex), id);
      me.addMargin(Number(rowIndex) + 1, id);
    }
    else{
      me.showRow(Number(rowIndex), id);
    }

    delete me._expandedIds[id].hidden;

    me.reSetTop();
    me.reSetPlusScroll();

    var checkBoxEls = w.el.select('.' + w.columnCls + '[grid="'+ w.id +'"] .' + cellCls + '[index="' + rowIndex + '"] .fancy-checkbox-expander'),
      i = 0,
      iL = checkBoxEls.length;

    for(;i<iL;i++){
      var checkBox = Fancy.getWidget(checkBoxEls.item(i).attr('id'));

      if(checkBox.get() === false){
        checkBox.set(true, false);
      }
    }

    me.changeSidesSize();
    me.onSelect();
  },
  /*
   * @param {Number} rowIndex
   */
  collapse: function(rowIndex){
    var me = this,
      w = me.widget,
      scroller = w.scroller,
      id = w.get(rowIndex).id;

    me.collapseRow(Number(rowIndex), id);
    me.clearMargin(Number(rowIndex) + 1, id);

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
  collapseRow: function(rowIndex, id){
    var me = this,
      w = me.widget,
      item = me._expandedIds[id];

    item.el.hide();
    item.hidden = true;

    if(w.leftColumns){
      item.leftEl.hide();
    }

    if(w.rightColumns){
      item.rightEl.hide();
    }

    var checkBoxEls = w.el.select('.' + w.columnCls + '[grid="'+ w.id +'"] .' + w.cellCls + '[index="' + rowIndex + '"] .fancy-checkbox-expander'),
      i = 0,
      iL = checkBoxEls.length;

    for(;i<iL;i++){
      var checkBox = Fancy.getWidget(checkBoxEls.item(i).attr('id'));

      if(checkBox.get() === true){
        checkBox.set(false, false);
        checkBox.collapsedTime = new Date();
      }
    }
  },
  /*
   *
   */
  _hideAllSideExpandedRow: function(){
    var me = this,
      w = me.widget;

    for(var p in me._expandedIds){
      var item = me._expandedIds[p];

      item.el.hide();
      item.hidden = true;

      if(w.leftColumns){
        item.leftEl.hide();
      }

      if(w.rightColumns){
        item.rightEl.hide();
      }
    }
  },
  /*
   *
   */
  expandAll: function(){
    var me = this,
      w = me.widget,
      viewTotal = w.getViewTotal(),
      i = 0;

    for(;i<viewTotal;i++){
      me.expand(i);
    }
  },
  /*
   * @param {Number} rowIndex
   * @param {String} id
   */
  expandRow: function(rowIndex, id){
    var me = this,
      w = me.widget,
      expandRowCls = w.expandRowCls,
      el = Fancy.get(document.createElement('div')),
      item = w.getById(id),
      data = me.prepareData(item),
      html,
      left = -w.scroller.scrollLeft || 0,
      width = w.getCenterFullWidth(),
      height;

    if(me.tpl){
      html = me.tpl.getHTML(data);
      el.update(html);
    }

    el.addCls(expandRowCls);
    el.css({
      left: left,
      width: width
    });
    el.attr('index', rowIndex);

    w.body.el.dom.appendChild(el.dom);

    if(me.render){
      /*renderTo, data, width*/
      me.render(el.dom, data, w.getCenterFullWidth());
    }

    height = parseInt(el.css('height'));

    me._expandedIds[id].rowIndex = rowIndex;
    me._expandedIds[id].el = el;
    me._expandedIds[id].height = height;
    me._expandedIds[id].width = width;

    if(w.leftColumns){
      var leftEl = Fancy.get(document.createElement('div'));

      leftEl.css('left', '0px');
      leftEl.css('height', height);
      leftEl.css('width', w.getLeftFullWidth());
      leftEl.attr('index', rowIndex);

      leftEl.addCls(expandRowCls);
      w.leftBody.el.dom.appendChild(leftEl.dom);

      me._expandedIds[id].leftEl = leftEl;
    }

    if(w.rightColumns){
      var rightEl = Fancy.get(document.createElement('div'));

      rightEl.css('left', '0px');
      rightEl.css('height', height);
      rightEl.css('width', w.getRightFullWidth());
      rightEl.attr('index', rowIndex);

      rightEl.addCls(expandRowCls);
      w.rightBody.el.dom.appendChild(rightEl.dom);

      me._expandedIds[id].rightEl = rightEl;
    }
  },
  /*
   * @param {Number} rowIndex
   * @param {String} id
   */
  addMargin: function(rowIndex, id){
    var me = this,
      w = me.widget,
      height = me._expandedIds[id].height,
      items = w.el.select('.' + w.columnCls + '[grid="' + w.id + '"] .' + w.cellCls + '[index="' + rowIndex + '"]');

    items.css('margin-top', height);
  },
  /*
   * @param {Number} rowIndex
   * @param {String} id
   */
  clearMargin: function(rowIndex, id){
    var me = this,
      w = me.widget;

    w.el.select('.' + w.columnCls + '[grid="'+ w.id +'"] .' + w.cellCls + '[index="' + rowIndex + '"]').css('margin-top', '0');
  },
  /*
   *
   */
  onBeforeSort: function(){
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
  reSet: function(){
    var me = this,
      w = me.widget;

    for(var p in me._expandedIds){
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
  },
  /*
   * @param {Number} rowIndex
   * @param {String} id
   */
  showRow: function(rowIndex, id){
    var me = this,
      w = me.widget,
      item = me._expandedIds[id];

    item.el.show();

    if(w.leftColumns){
      item.leftEl.show();
    }

    if(w.rightColumns){
      item.rightEl.show();
    }

    me.addMargin(rowIndex + 1, id);
  },
  /*
   * @param {Number} rowIndex
   * @return {Number}
   */
  getBeforeHeight: function(rowIndex){
    var me = this,
      height = 0;

    for(var p in me._expandedIds){
      var item = me._expandedIds[p];

      if( item.rowIndex < rowIndex && !item.hidden && item.el.css('display') !== 'none'){
        height += item.height;
      }
    }

    return height;
  },
  /*
   * @param {Boolean} [grouping]
   */
  reSetTop: function(grouping){
    var me = this,
      w = me.widget,
      cellHeight = w.cellHeight,
      top = -w.scroller.scrollTop || 0,
      left = -w.scroller.scrollLeft || 0;

    if(w.grouping){
      me.expandedGroups = {};
      var expanded = w.grouping.expanded;

      for(var p in expanded){
        me.expandedGroups[p] = me.expandedGroups[p] || {};
      }
    }

    for(var p in me._expandedIds){
      var item = me._expandedIds[p];

      if(item.el.css('display') === 'none'){
        continue;
      }

      //BUG: item.rowIndex has wrong value, if it has collapsed rows on top

      var beforeHeight = me.getBeforeHeight(item.rowIndex),
        rowIndex = me.getDisplayedRowsBefore(item, p),
        _top = top + (rowIndex) * cellHeight + beforeHeight;

      if(w.grouping){
        var id = p,
          groupName = w.grouping.getGroupById(id),
          orderIndex = w.grouping.getGroupOrderIndex(groupName);

        if(item.el.css('display') !== 'none'){
          me.expandedGroups[groupName] = me.expandedGroups[groupName] || {};
          me.expandedGroups[groupName][p] = item;

          _top += (orderIndex + 1) * w.groupRowHeight;
        }
      }

      item.el.css({
        top: _top,
        left: left
      });

      if(w.leftColumns){
        item.leftEl.css('top', _top);
      }

      if(w.rightColumns){
        item.rightEl.css('top', _top);
      }
    }

    if(w.grouping && grouping !== false){
      w.grouping.setPositions();
      w.grouping.setExpanderCellsPosition();
    }
  },
  /*
   * @param {Object} item
   * @param {String|Number} id
   * @return {Number}
   */
  getDisplayedRowsBefore: function(item, id){
    var me = this,
      w = me.widget;

    if(w.grouping){
      var rowIndex = 0;

      if(item.el.css('display') !== 'none'){
        rowIndex = w.store.getRow(id);
      }

      return rowIndex + 1;
    }

    return item.rowIndex + 1;
  },
  /*
   *
   */
  onScroll: function(){
    this.reSetTop();
  },
  /*
   *
   */
  reSetPlusScroll: function(){
    var me = this,
      w = me.widget;

    me.plusScroll = me.getPlusHeight();
    w.scroller.setRightKnobSize();

    setTimeout(function(){
      if(w.scroller.isRightScrollable() === false){
        w.scroller.scroll(0);
      }
    }, 1);
  },
  /*
   * @return {Number}
   */
  getPlusHeight: function(){
    var me = this,
      plusHeight = 0;

    for(var p in me._expandedIds){
      var item = me._expandedIds[p];

      if(!item.hidden && item.el.css('display') !== 'none'){
        plusHeight += item.height;
      }
    }

    me.plusHeight = plusHeight;

    return me.plusHeight;
  },
  /*
   *
   */
  onColumnReSize: function(){
    var me = this,
      w = me.widget;

    for(var p in me._expandedIds){
      var item = me._expandedIds[p],
        width = w.getCenterFullWidth();

      item.el.css('width', width);

    }
  },
  /*
   * @param {Object} item
   * @return {Object}
   */
  prepareData: function(item){
    var me = this,
      w = me.widget,
      data = item.data;

    if(me.dataFn){
      data = me.dataFn(w, data);
    }

    return data;
  },
  /*
   *
   */
  changeSidesSize: function(){
    var w = this.widget;

    w.setSidesHeight();
    w.scroller.checkRightScroll();
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onRowDBlClick: function(grid, o){
    var me = this,
      w = me.widget,
      rowIndex = Number(o.rowIndex),
      id = o.id,
      item = me._expandedIds[id];

    if(w.edit){
      w.un('rowdblclick', me.onRowDBlClick, me);
      return;
    }

    if(item === undefined){
      me.expand(rowIndex);
    }
    else{
      if(item.hidden === true && item.el.css('display') === 'none'){
        me.expand(rowIndex);
      }
      else{
        me.collapse(rowIndex);
      }
    }
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onRowTrackOver: function(grid, o){
    var me = this,
      w = me.widget,
      item = me._expandedIds[o.id];

    if(item){
      item.el.addCls(w.expandRowOverCls);

      if(w.leftColumns){
        item.leftEl.addCls(w.expandRowOverCls);
      }

      if(w.rightColumns){
        item.rightEl.addCls(w.expandRowOverCls);
      }
    }
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onRowTrackLeave: function(grid, o){
    var me = this,
      w = me.widget,
      item = me._expandedIds[o.id];

    if(item){
      item.el.removeCls(w.expandRowOverCls);

      if(w.leftColumns){
        item.leftEl.removeCls(w.expandRowOverCls);
      }

      if(w.rightColumns){
        item.rightEl.removeCls(w.expandRowOverCls);
      }
    }
  },
  /*
   * @param {Object} e
   */
  onExpandRowMouseEnter: function(e){
    var me = this,
      w = me.widget,
      scroller = w.scroller,
      expandRowEl = Fancy.get(e.currentTarget),
      index = expandRowEl.attr('index');

    w.el.select('.' + w.expandRowCls + '[index="'+index+'"]').addCls(w.expandRowOverCls);

    if(!w.trackOver || scroller.bottomKnobDown || scroller.rightKnobDown){}
    else{
      w.el.select('.' + w.columnCls + '[grid="'+ w.id +'"] .' + w.cellCls + '[index="'+index+'"]').addCls(w.rowOverCls);
    }
  },
  /*
   * @param {Object} e
   */
  onExpandRowMouseLeave: function(e){
    var me = this,
      w = me.widget,
      scroller = w.scroller,
      expandRowEl = Fancy.get(e.currentTarget),
      index = expandRowEl.attr('index');

    w.el.select('.' + w.expandRowCls + '[index="'+index+'"]').removeCls(w.expandRowOverCls);

    if(!w.trackOver || scroller.bottomKnobDown || scroller.rightKnobDown){}
    else{
      w.el.select('.' + w.columnCls + '[grid="'+ w.id +'"] .' + w.cellCls + '[index="'+index+'"]').removeCls(w.rowOverCls);
    }
  },
  /*
   *
   */
  onSelect: function(){
    var me = this,
      w = me.widget,
      selection = w.selection;

    if(!selection || (!selection.row && !selection.rows)){
      return;
    }

    me.onClearSelect();

    selection = w.getSelection(true);
    var rows = selection.rows,
      i = 0,
      iL = rows.length;

    for(;i<iL;i++){
      var rowIndex = rows[i];

      w.el.select('.' + w.expandRowCls + '[index="'+rowIndex+'"]').addCls(w.expandRowSelectedCls);
    }
  },
  /*
   *
   */
  onClearSelect: function(){
    var me = this,
      w = me.widget,
      selection = w.selection;

    if(!selection.row && !selection.rows){
      return;
    }

    selection = w.getSelection(true);

    var shouldBeSelected = {},
      rows = selection.rows,
      i = 0,
      iL = rows.length;

    for(;i<iL;i++){
      shouldBeSelected[rows[i]] = true;
    }

    var selected = w.el.select('.' + w.expandRowSelectedCls),
      i = 0,
      iL = selected.length;

    for(;i<iL;i++){
      var index = selected.item(i).attr('index');

      if(!shouldBeSelected[index]){
        w.el.select('.' + w.expandRowCls + '[index="'+index+'"]').removeCls(w.expandRowSelectedCls);
      }
    }
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Number} index
   * @param {String} groupName
   */
  onGroupCollapse: function(grid, index, groupName){
    var me = this,
      w = me.widget,
      expandedGroups = me.expandedGroups;

    if(expandedGroups[groupName]){
      var items = expandedGroups[groupName];

      for(var q in items){
        var item = items[q];

        if(me._expandedIds[q]){
          delete me._expandedIds[q];
        }

        item.el.hide();
        if(item.leftEl.dom){
          item.leftEl.hide();
        }

        if(item.rightEl.dom){
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
  onGroupExpand: function(grid, index, groupName){
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
  reSetIndexes: function(){
    var me = this,
      w = me.widget,
      s = w.store;

    for(var id in me._expandedIds){
      me._expandedIds[id].rowIndex = s.getRow(id);
    }
  }
});