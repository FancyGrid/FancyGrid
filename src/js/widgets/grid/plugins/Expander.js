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

    me.initTpl();
    
    me.ons();
  },
  /*
   *
   */
  initTpl: function(){
    var me = this;

    if(!me.tpl){
      return;
    }

    me.tpl = new Fancy.Template(me.tpl);
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget,
      s = w.store;

    w.on('scroll', me.onScroll, me);
    w.on('sort', me.onSort, me);
    w.on('columnresize', me.onColumnReSize, me);

    w.on('rowdblclick', me.onRowDBlClick, me);

    w.on('rowtrackenter', me.onRowTrackOver, me);
    w.on('rowtrackleave', me.onRowTrackLeave, me);

    w.on('render', function() {
      w.el.on('mouseenter', me.onExpandRowMouseEnter, me, 'div.fancy-grid-expand-row');
      w.el.on('mouseleave', me.onExpandRowMouseLeave, me, 'div.fancy-grid-expand-row');
    });

    w.on('select', me.onSelect, me);
    w.on('clearselect', me.onClearSelect, me);
  },
  /*
   * @param {Number} rowIndex
   */
  expand: function(rowIndex){
    var me = this,
      w = me.widget,
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

    var checkBoxEls = w.el.select('.fancy-grid-column[grid="'+ w.id +'"] .fancy-grid-cell[index="' + rowIndex + '"] .fancy-checkbox-expander'),
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

    var checkBoxEls = w.el.select('.fancy-grid-column[grid="'+ w.id +'"] .fancy-grid-cell[index="' + rowIndex + '"] .fancy-checkbox-expander'),
      i = 0,
      iL = checkBoxEls.length;

    for(;i<iL;i++){
      var checkBox = Fancy.getWidget(checkBoxEls.item(i).attr('id'));

      if(checkBox.get() === true){
        checkBox.set(false, false);
      }
    }
  },
  /*
   * @param {Number} rowIndex
   * @param {String} id
   */
  expandRow: function(rowIndex, id){
    var me = this,
      w = me.widget,
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

    el.addClass('fancy-grid-expand-row');
    el.css('left', left + 'px');
    el.css('width', width + 'px');
    el.attr('index', rowIndex);

    var expandRowDom = w.body.el.dom.appendChild(el.dom);

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

      leftEl.addClass('fancy-grid-expand-row');
      w.leftBody.el.dom.appendChild(leftEl.dom);

      me._expandedIds[id].leftEl = leftEl;
    }

    if(w.rightColumns){
      var rightEl = Fancy.get(document.createElement('div'));

      rightEl.css('left', '0px');
      rightEl.css('height', height);
      rightEl.css('width', w.getLeftFullWidth());
      rightEl.attr('index', rowIndex);

      rightEl.addClass('fancy-grid-expand-row');
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
      items = w.el.select('.fancy-grid-column[grid="' + w.id + '"] .fancy-grid-cell[index="' + rowIndex + '"]');

    items.css('margin-top', height);
  },
  /*
   * @param {Number} rowIndex
   * @param {String} id
   */
  clearMargin: function(rowIndex, id){
    var me = this,
      w = me.widget,
      height = me._expandedIds[id].height;

    w.el.select('.fancy-grid-column[grid="'+ w.id +'"] .fancy-grid-cell[index="' + rowIndex + '"]').css('margin-top', '0');
  },
  /*
   *
   */
  onScroll: function(){
    var me = this,
      w = me.widget,
      top = -w.scroller.scrollTop || 0,
      left = -w.scroller.scrollLeft || 0,
      cellHeight = w.cellHeight;

    for(var p in me._expandedIds){
      var item = me._expandedIds[p],
        beforeHeight = me.getBeforeHeight(item.rowIndex),
        _top = top + (item.rowIndex + 1) * cellHeight + beforeHeight;

      item.el.css('top', _top);

      if(w.leftColumns){
        item.leftEl.css('top', _top);
      }

      if(w.rightColumns){
        item.rightEl.css('top', _top);
      }

      item.el.css('left', left);
    }
  },
  /*
   *
   */
  onSort: function(){
    var me = this,
      w = me.widget;

    for(var p in me._expandedIds){
      var item = me._expandedIds[p];

      item.el.destroy();
      me.clearMargin(Number(item.rowIndex) + 1, p);
    }

    me._expandedIds = {};
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

      if( item.rowIndex < rowIndex && !item.hidden){
        height += item.height;
      }
    }

    return height;
  },
  /*
   *
   */
  reSetTop: function(){
    var me = this,
      w = me.widget,
      cellHeight = w.cellHeight,
      top = -w.scroller.scrollTop || 0,
      left = -w.scroller.scrollLeft || 0;

    for(var p in me._expandedIds){
      var item = me._expandedIds[p],
        beforeHeight = me.getBeforeHeight(item.rowIndex),
        _top = top + (item.rowIndex + 1) * cellHeight + beforeHeight;

      item.el.css('top', _top);
      item.el.css('left', left);

      if(w.leftColumns){
        item.leftEl.css('top', _top);
      }

      if(w.rightColumns){
        item.rightEl.css('top', _top);
      }
    }
  },
  /*
   *
   */
  reSetPlusScroll: function(){
    var me = this,
      w = me.widget;

    me.plusScroll = me.getPlusHeight();
    w.scroller.setRightKnobSize();
  },
  /*
   * @return {Number}
   */
  getPlusHeight: function(){
    var me = this,
      w = me.widget,
      plusHeight = 0;

    for(var p in me._expandedIds){
      var item = me._expandedIds[p];

      if(!item.hidden){
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
    var me = this,
      w = me.widget,
      scroller = w.scroller;

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
      if(item.hidden === true){
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
      item.el.addClass(w.expandRowOverCls);

      if(w.leftColumns){
        item.leftEl.addClass(w.expandRowOverCls);
      }

      if(w.rightColumns){
        item.rightEl.addClass(w.expandRowOverCls);
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
      item.el.removeClass(w.expandRowOverCls);

      if(w.leftColumns){
        item.leftEl.removeClass(w.expandRowOverCls);
      }

      if(w.rightColumns){
        item.rightEl.removeClass(w.expandRowOverCls);
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

    w.el.select('.fancy-grid-expand-row[index="'+index+'"]').addClass(w.expandRowOverCls);

    if(!w.trackOver || scroller.bottomKnobDown || scroller.rightKnobDown){}
    else{
      w.el.select('.fancy-grid-column[grid="'+ w.id +'"] .fancy-grid-cell[index="'+index+'"]').addClass(w.rowOverCls);
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

    w.el.select('.fancy-grid-expand-row[index="'+index+'"]').removeClass(w.expandRowOverCls);

    if(!w.trackOver || scroller.bottomKnobDown || scroller.rightKnobDown){}
    else{
      w.el.select('.fancy-grid-column[grid="'+ w.id +'"] .fancy-grid-cell[index="'+index+'"]').removeClass(w.rowOverCls);
    }
  },
  /*
   *
   */
  onSelect: function(){
    var me = this,
      w = me.widget,
      selection = w.selection;

    if(!selection.row && !selection.rows){
      return;
    }

    me.onClearSelect();

    selection = w.getSelection(true);
    var rows = selection.rows,
      i = 0,
      iL = rows.length;

    for(;i<iL;i++){
      var rowIndex = rows[i];

      w.el.select('.fancy-grid-expand-row[index="'+rowIndex+'"]').addClass(w.expandRowSelectedCls);
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

    var selected = w.el.select('.fancy-grid-expand-row-selected'),
      i = 0,
      iL = selected.length;

    for(;i<iL;i++){
      var index = selected.item(i).attr('index');

      if(!shouldBeSelected[index]){
        w.el.select('.fancy-grid-expand-row[index="'+index+'"]').removeClass(w.expandRowSelectedCls);
      }
    }
  }
});