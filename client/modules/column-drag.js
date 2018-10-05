/*
 * @class Fancy.grid.plugin.ColumnDrag
 * @extend Fancy.Plugin
 */
(function () {

  //SHORTCUTS
  var F = Fancy;
  var DOC = F.get(document);

  //CONSTANTS
  var HIDDEN_CLS = F.HIDDEN_CLS;
  var GRID_HEADER_CELL_CLS = F.GRID_HEADER_CELL_CLS;
  var GRID_HEADER_CELL_TEXT_CLS = F.GRID_HEADER_CELL_TEXT_CLS;
  var GRID_HEADER_CELL_TRIGGER_CLS = F.GRID_HEADER_CELL_TRIGGER_CLS;
  var GRID_HEADER_CELL_TRIGGER_IMAGE_CLS = F.GRID_HEADER_CELL_TRIGGER_IMAGE_CLS;
  var GRID_HEADER_CELL_GROUP_LEVEL_1_CLS = F.GRID_HEADER_CELL_GROUP_LEVEL_1_CLS;
  var GRID_HEADER_CELL_GROUP_LEVEL_2_CLS = F.GRID_HEADER_CELL_GROUP_LEVEL_2_CLS;
  var GRID_STATE_DRAG_COLUMN_CLS = F.GRID_STATE_DRAG_COLUMN_CLS;
  var FIELD_TEXT_INPUT_CLS = F.FIELD_TEXT_INPUT_CLS;
  var FIELD_CHECKBOX_INPUT_CLS =  F.FIELD_CHECKBOX_INPUT_CLS;

  F.define('Fancy.grid.plugin.ColumnDrag', {
    extend: F.Plugin,
    ptype: 'grid.columndrag',
    inWidgetName: 'columndrag',
    activeSide: undefined,
    activeCell: undefined,
    activeIndex: undefined,
    activeColumn: undefined,
    inCell: undefined,
    inIndex: undefined,
    inSide: undefined,
    ok: false,
    status: 'none', //none/dragging
    /*
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

      w.on('render', function(){
        me.ons();
        me.initHint();
      });
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget;

      w.el.on('mousedown', me.onMouseDownCell, me, 'div.' + GRID_HEADER_CELL_CLS);
    },
    onMouseDownCell: function (e) {
      var me = this,
        w = me.widget,
        cell = Fancy.get(e.currentTarget),
        index = Number(cell.attr('index')),
        side = w.getSideByCell(cell),
        columns = w.getColumns(side),
        column = columns[index],
        targetEl = F.get(e.target);

      if(column && column.titleEditable){
        return;
      }

      if(targetEl.hasCls(GRID_HEADER_CELL_TRIGGER_CLS) || targetEl.hasCls(GRID_HEADER_CELL_TRIGGER_IMAGE_CLS)){
        return;
      }

      if(targetEl.hasCls(FIELD_TEXT_INPUT_CLS) || targetEl.hasCls(FIELD_CHECKBOX_INPUT_CLS)){
        return;
      }

      if(cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS)){
        //TODO: write realization
        me.activeCellTopGroup = me.getGroupStartEnd(cell, side);
        me.activeCellTopGroup.cell = cell;
      }

      if(w.startResizing){
        return;
      }

      if(!me.activeCellTopGroup && column.draggable === false){
        return;
      }

      if(cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS)){
        me.activeUnderGroup = true;
      }

      me.activeSide = side;
      me.inSide = side;
      me.activeCell = cell;
      me.inCell = cell;
      me.activeIndex = Number(cell.attr('index'));
      me.inIndex = me.activeIndex;
      me.activeColumn = columns[me.activeIndex];

      me.mouseDownX = e.pageX;
      me.mouseDownY = e.pageY;

      DOC.once('mouseup', me.onMouseUp, me);
      DOC.on('mousemove', me.onMouseMove, me);

      w.el.on('mouseleave', me.onMouseLeave, me);
      w.el.on('mouseenter', me.onMouseEnterCell, me, 'div.' + GRID_HEADER_CELL_CLS);
      w.el.on('mousemove', me.onMouseMoveCell, me, 'div.' + GRID_HEADER_CELL_CLS);
    },
    onMouseLeave: function () {
      this.hideHint();
    },
    onMouseUp: function () {
      var me = this,
        w = me.widget,
        dragged = false;

      DOC.un('mousemove', me.onMouseMove, me);

      w.el.un('mouseleave', me.onMouseLeave, me);
      w.el.un('mouseenter', me.onMouseEnterCell, me, 'div.' + GRID_HEADER_CELL_CLS);
      w.el.un('mousemove', me.onMouseMoveCell, me, 'div.' + GRID_HEADER_CELL_CLS);

      if(me.ok){
        if(me.inSide === me.activeSide){
          me.dragColumn(me.inSide);
        }
        else if(me.activeSide === 'center'){
          var inIndex = me.inIndex;
          if(me.okPosition === 'right'){
            inIndex++;
          }
          w.moveColumn(me.activeSide, me.inSide, me.activeIndex, inIndex, me.activeCellTopGroup);
        }
        else{
          var inIndex = me.inIndex;
          if(me.okPosition === 'right'){
            inIndex++;
          }
          w.moveColumn(me.activeSide, me.inSide, me.activeIndex, inIndex, me.activeCellTopGroup);
        }

        dragged = true;
      }

      var columnDragParams = {
        column: me.activeColumn,
        fromSide: me.activeSide,
        toSide: me.inSide
      };

      delete me.inUpGroupCell;
      delete me.inUnderGroup;
      delete me.activeCellTopGroup;
      delete me.activeUnderGroup;
      delete me.activeSide;
      delete me.activeCell;
      delete me.activeIndex;
      delete me.activeColumn;
      delete me.mouseDownX;
      delete me.mouseDownY;
      me.ok = false;
      delete me.okPosition;

      F.tip.hide();
      setTimeout(function () {
        me.status = 'none';
      }, 1);
      me.removeDragState();

      if(me.status === 'dragging'){
        setTimeout(function () {
          me.status = 'none';
          if(dragged) {
            w.fire('columndrag', columnDragParams);
            //w.scroller.update();
            if(w.sorter){
              w.sorter.updateSortedHeader();
            }
          }
        }, 10);
      }

      me.hideHint();
      setTimeout(function () {
        w.updateColumnsVisibilty();
      }, 100);

      w.scroller.update();
    },
    onMouseMove: function (e) {
      var me = this,
        w = me.widget,
        header = w.header,
        leftHeader = w.leftHeader,
        rightHeader = w.rightHeader,
        x = e.pageX,
        y = e.pageY,
        columns = w.getColumns(me.activeSide),
        targetEl = F.get(e.target);

      if(targetEl.hasCls(GRID_HEADER_CELL_TRIGGER_CLS) || targetEl.hasCls(GRID_HEADER_CELL_TRIGGER_IMAGE_CLS)){
        return;
      }

      if(Math.abs(x - me.mouseDownX) > 10 || Math.abs(y - me.mouseDownY)){
        if(me.activeCellTopGroup){
          F.tip.update(me.activeCellTopGroup.cell.select('.' + GRID_HEADER_CELL_TEXT_CLS).item(0).dom.innerHTML || '&nbsp;');
          me.status = 'dragging';
          me.addDragState();
        }
        else {
          F.tip.update(me.activeColumn.title || '&nbsp;');
          me.status = 'dragging';
          me.addDragState();
        }
      }
      else{
        return;
      }

      if(columns.length === 1 && me.activeSide === 'center'){
        F.tip.hide();
        setTimeout(function () {
          me.status = 'none';
        }, 1);
        me.removeDragState();
        return;
      }

      F.tip.show(e.pageX + 15, e.pageY + 15);
      if(header.hideMenu){
        header.hideMenu();

        if(w.leftColumns && leftHeader.hideMenu()){
          leftHeader.hideMenu();
        }

        if(w.rightColumns && rightHeader.hideMenu()){
          rightHeader.hideMenu();
        }
      }
    },
    addDragState: function () {
      var me = this,
        w = me.widget;

      w.el.addClass(GRID_STATE_DRAG_COLUMN_CLS);
    },
    removeDragState: function () {
      var me = this,
        w = me.widget;

      w.el.removeClass(GRID_STATE_DRAG_COLUMN_CLS);
    },
    onMouseEnterCell: function(e){
      var me = this,
        w = me.widget,
        cell = Fancy.get(e.currentTarget),
        side = w.getSideByCell(cell);

      me.hideHint();

      if(cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS)){
        me.inUnderGroup = true;
      }
      else{
        delete me.inUnderGroup;
      }

      if(cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS)){
        me.inUpGroupCell = cell;
      }
      else{
        delete me.inUpGroupCell;
      }

      me.inSide = side;
      me.inCell = cell;
      me.inIndex = Number(cell.attr('index'));
    },
    onMouseMoveCell: function(e){
      var me = this,
        w = me.widget,
        cell = me.inCell,
        cellWidth = parseInt(cell.css('width')),
        triggerEl = cell.select('.' + GRID_HEADER_CELL_TRIGGER_CLS),
        targetEl = Fancy.get(e.target),
        inTriggerEl = triggerEl.within(targetEl) || targetEl.hasClass(GRID_HEADER_CELL_TRIGGER_CLS),
        fromGroup = me.activeUnderGroup !== me.inUnderGroup && me.inUnderGroup === true,
        toGroup = me.activeUnderGroup !== me.inUnderGroup && me.activeUnderGroup === true;

      var columns = w.getColumns(me.activeSide);
      if(columns.length === 1 && me.activeSide === 'center'){
        me.ok = false;
        me.hideHint();
        return;
      }

      if(me.activeCellTopGroup){
        if(me.inUpGroupCell){}
        else{
          var startIndex = me.activeCellTopGroup.start,
            endIndex = me.activeCellTopGroup.end;

          if(me.activeSide !== me.inSide){
            me.ok = true;
            if(e.offsetX > cellWidth/2 || inTriggerEl){
              me.showHint('right');
            }
            else{
              me.showHint('left');
            }
          }
          else{
            if(isNaN(me.inIndex)){
              me.hideHint();
            }
            else{
              if(me.inIndex < startIndex){
                if (e.offsetX > cellWidth / 2) {
                  if(me.inIndex + 1 === startIndex){
                    me.hideHint();
                  }
                  else{
                    me.ok = true;
                    me.showHint('right');
                  }
                }
                else{
                  me.ok = true;
                  me.showHint('left');
                }
              }
              else if(me.inIndex > endIndex){
                if (e.offsetX < cellWidth / 2) {
                  if(me.inIndex === endIndex + 1){
                    me.hideHint();
                  }
                  else{
                    me.ok = true;
                    me.showHint('left');
                  }
                }
                else{
                  me.ok = true;
                  me.showHint('right');
                }
              }
              else{
                me.hideHint();
              }
            }
          }
        }
      }
      else if(me.inUpGroupCell){
        var o = me.getGroupStartEnd(),
          startIndex = o.start,
          endIndex = o.end;

        if(me.activeSide !== me.inSide){
          me.ok = true;
          if(e.offsetX > cellWidth/2 || inTriggerEl){
            me.showHint('right');
          }
          else{
            me.showHint('left');
          }
        }
        else{
          if (e.offsetX > cellWidth / 2) {
            if(me.activeIndex > endIndex && me.activeIndex - 1 === endIndex){
              me.hideHint();
            }
            else {
              me.ok = true;
              me.showHint('right');
            }
          }
          else {
            if(me.activeIndex < startIndex && me.activeIndex + 1 === startIndex){
              me.hideHint();
            }
            else {
              me.ok = true;
              me.showHint('left');
            }
          }
        }
      }
      else if(me.activeSide !== me.inSide){
        me.ok = true;
        if(e.offsetX > cellWidth/2 || inTriggerEl){
          me.showHint('right');
        }
        else{
          me.showHint('left');
        }
      }
      else if(me.activeIndex === me.inIndex){
        me.ok = false;
      }
      else if(me.activeIndex < me.inIndex){
        if(e.offsetX > cellWidth/2 || inTriggerEl){
          me.ok = true;
          me.showHint('right');
        }
        else{
          if(e.offsetX < cellWidth/2 && (me.activeIndex + 1) !== me.inIndex){
            me.ok = true;
            me.showHint('left');
          }
          else {
            if(me.activeIndex + 1 === me.inIndex && (fromGroup || toGroup) ){
              me.ok = true;
              me.showHint('left');
            }
            else{
              me.ok = false;
              me.hideHint();
            }
          }
        }
      }
      else if(me.activeIndex > me.inIndex){
        if(e.offsetX < cellWidth/2){
          if(inTriggerEl){
            if(fromGroup || toGroup){
              me.ok = true;
              me.showHint('right');
            }
            else if(me.activeIndex - 1 === me.inIndex || me.inUpGroupCell) {
              me.ok = false;
              me.hideHint();
            }
            else{
              me.ok = true;
              me.showHint('right');
            }
          }
          else {
            me.ok = true;
            me.showHint('left');
          }
        }
        else{
          if(e.offsetX > cellWidth/2){
            if((me.activeIndex - 1) === me.inIndex && (fromGroup || toGroup)){
              me.ok = true;
              me.showHint('right');
            }
            else{
              if((me.activeIndex - 1) !== me.inIndex || me.activeUnderGroup){
                me.ok = true;
                me.showHint('right');
              }
              else{
                me.ok = false;
                me.hideHint();
              }
            }
          }
          else {
            me.ok = false;
            me.hideHint();
          }
        }
      }
    },
    showHint: function(position){
      var me = this,
        w = me.widget,
        CELL_HEADER_HEIGHT = w.cellHeaderHeight,
        cell = me.inCell,
        topEl = me.topEl,
        bottomEl = me.bottomEl,
        o = cell.offset(),
        cellWidth = parseInt(cell.css('width')),
        cellHeight = parseInt(cell.css('height'));

      me.okPosition = position;

      topEl.removeCls(HIDDEN_CLS);
      bottomEl.removeCls(HIDDEN_CLS);

      var plusWidth = 0;

      if(position === 'right'){
        plusWidth += cellWidth;
      }

      topEl.css({
        left: o.left + plusWidth - Math.ceil(parseInt(topEl.css('width'))/2),
        top: o.top - parseInt(topEl.css('height'))
      });

      var bottomTop = o.top + cellHeight;

      if(me.inUpGroupCell){
        var rows = w.header.calcRows();
        bottomTop = o.top + rows * CELL_HEADER_HEIGHT;
      }

      bottomEl.css({
        left: o.left + plusWidth - Math.ceil(parseInt(bottomEl.css('width'))/2),
        top: bottomTop
      });

      if(w.window){
        var zIndex = 1000 + F.zIndex++;

        topEl.css('z-index', zIndex);
        bottomEl.css('z-index', zIndex);
      }
    },
    hideHint: function(){
      var me = this;

      me.topEl.addCls(HIDDEN_CLS);
      me.bottomEl.addCls(HIDDEN_CLS);
    },
    initHint: function(){
      var me = this,
        w = me.widget,
        themeCls = 'fancy-theme-' + w.theme,
        renderTo = F.get(document.body).dom,
        topEl = F.get(document.createElement('div')),
        bottomEl = F.get(document.createElement('div'));

      topEl.addCls('fancy-drag-hint-top', HIDDEN_CLS, themeCls);
      bottomEl.addCls('fancy-drag-hint-bottom', HIDDEN_CLS, themeCls);

      me.topEl = F.get(renderTo.appendChild(topEl.dom));
      me.bottomEl = F.get(renderTo.appendChild(bottomEl.dom));
    },
    /*
     * @param {String} side
     */
    dragColumn: function (side) {
      var me = this,
        w = me.widget,
        header = w.getHeader(side),
        body = w.getBody(side),
        activeIndex = me.activeIndex,
        inIndex = me.inIndex,
        position = me.okPosition,
        columns = w.getColumns(side),
        column = columns[activeIndex],
        rows = header.calcRows();

      if(me.activeCellTopGroup){
        var startIndex = me.activeCellTopGroup.start,
          endIndex = me.activeCellTopGroup.end,
          _columns = columns.splice(startIndex, endIndex - startIndex + 1),
          inIndex = me.inIndex;

        if(position === 'right'){
          inIndex++;
        }

        if(me.inIndex < startIndex){
          columns = Fancy.Array.insert(columns, inIndex, _columns);
        }
        else{
          columns = Fancy.Array.insert(columns, inIndex - _columns.length, _columns);
        }

        w.setColumns(columns, side);
      }
      else if(me.inUpGroupCell){
        var o = me.getGroupStartEnd();

        inIndex = o.start;

        if(position === 'right'){
          inIndex = o.end + 1;
        }
      }
      else if(position === 'right'){
        if(me.inUnderGroup){
          var groupName = columns[inIndex].grouping,
            nextColumn = columns[inIndex + 1];

          if(nextColumn && nextColumn.grouping === groupName){
            inIndex++;
          }
        }
        else {
          inIndex++;
        }
      }

      if(w.groupheader && !me.activeCellTopGroup){
        var inColumn = columns[inIndex];

        if(inColumn && inColumn.grouping && me.inUnderGroup){
          column.grouping = inColumn.grouping;

          if(column.filter && column.filter.header && rows < 3){
            delete column.filter;
          }
        }
        else{
          delete column.grouping;
        }
      }

      if(!me.activeCellTopGroup){
        columns.splice(activeIndex, 1);

        if(activeIndex<inIndex){
          inIndex--;
        }

        columns.splice(inIndex, 0, column);
      }

      body.clearColumnsStyles();
      header.updateTitles();
      header.updateCellsSizes();
      header.reSetCheckBoxes();
      if(w.groupheader){
        w.header.fixGroupHeaderSizing();
        if(w.leftColumns){
          w.leftHeader.fixGroupHeaderSizing();
        }

        if(w.rightColumns){
          w.rightHeader.fixGroupHeaderSizing();
        }

        header.reSetGroupIndexes();
      }

      setTimeout(function () {
        header.reSetColumnsAlign();
        header.reSetColumnsCls();
        body.reSetColumnsAlign();
        body.reSetColumnsCls();
        body.updateColumnsSizes();
      }, 100);
      w.update();
    },
    /*
     * @param {Object} [cell]
     * @param {String} [side]
     * @return {Object}
     */
    getGroupStartEnd: function (cell, side) {
      var me = this,
        w = me.widget,
        header = w.getHeader(side || me.inSide),
        groupName = (cell || me.inUpGroupCell).attr('index'),
        inUpGroupCells = header.el.select('[group-index="' + groupName + '"]'),
        values = [];

      inUpGroupCells.each(function(cell){
        values.push(Number(cell.attr('index')));
      });

      return {
        start: F.Array.min(values),
        end: F.Array.max(values)
      };
    }
  });

})();/*
 * @class Fancy.grid.plugin.ColumnDrag
 * @extend Fancy.Plugin
 */
(function () {

  //SHORTCUTS
  var F = Fancy;
  var DOC = F.get(document);

  //CONSTANTS
  var HIDDEN_CLS = F.HIDDEN_CLS;
  var GRID_HEADER_CELL_CLS = F.GRID_HEADER_CELL_CLS;
  var GRID_HEADER_CELL_TEXT_CLS = F.GRID_HEADER_CELL_TEXT_CLS;
  var GRID_HEADER_CELL_TRIGGER_CLS = F.GRID_HEADER_CELL_TRIGGER_CLS;
  var GRID_HEADER_CELL_TRIGGER_IMAGE_CLS = F.GRID_HEADER_CELL_TRIGGER_IMAGE_CLS;
  var GRID_HEADER_CELL_GROUP_LEVEL_1_CLS = F.GRID_HEADER_CELL_GROUP_LEVEL_1_CLS;
  var GRID_HEADER_CELL_GROUP_LEVEL_2_CLS = F.GRID_HEADER_CELL_GROUP_LEVEL_2_CLS;
  var GRID_STATE_DRAG_COLUMN_CLS = F.GRID_STATE_DRAG_COLUMN_CLS;
  var FIELD_TEXT_INPUT_CLS = F.FIELD_TEXT_INPUT_CLS;
  var FIELD_CHECKBOX_INPUT_CLS =  F.FIELD_CHECKBOX_INPUT_CLS;

  F.define('Fancy.grid.plugin.ColumnDrag', {
    extend: F.Plugin,
    ptype: 'grid.columndrag',
    inWidgetName: 'columndrag',
    activeSide: undefined,
    activeCell: undefined,
    activeIndex: undefined,
    activeColumn: undefined,
    inCell: undefined,
    inIndex: undefined,
    inSide: undefined,
    ok: false,
    status: 'none', //none/dragging
    /*
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

      w.on('render', function(){
        me.ons();
        me.initHint();
      });
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget;

      w.el.on('mousedown', me.onMouseDownCell, me, 'div.' + GRID_HEADER_CELL_CLS);
    },
    onMouseDownCell: function (e) {
      var me = this,
        w = me.widget,
        cell = Fancy.get(e.currentTarget),
        index = Number(cell.attr('index')),
        side = w.getSideByCell(cell),
        columns = w.getColumns(side),
        column = columns[index],
        targetEl = F.get(e.target);

      if(column && column.titleEditable){
        return;
      }

      if(targetEl.hasCls(GRID_HEADER_CELL_TRIGGER_CLS) || targetEl.hasCls(GRID_HEADER_CELL_TRIGGER_IMAGE_CLS)){
        return;
      }

      if(targetEl.hasCls(FIELD_TEXT_INPUT_CLS) || targetEl.hasCls(FIELD_CHECKBOX_INPUT_CLS)){
        return;
      }

      if(cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS)){
        //TODO: write realization
        me.activeCellTopGroup = me.getGroupStartEnd(cell, side);
        me.activeCellTopGroup.cell = cell;
      }

      if(w.startResizing){
        return;
      }

      if(!me.activeCellTopGroup && column.draggable === false){
        return;
      }

      if(cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS)){
        me.activeUnderGroup = true;
      }

      me.activeSide = side;
      me.inSide = side;
      me.activeCell = cell;
      me.inCell = cell;
      me.activeIndex = Number(cell.attr('index'));
      me.inIndex = me.activeIndex;
      me.activeColumn = columns[me.activeIndex];

      me.mouseDownX = e.pageX;
      me.mouseDownY = e.pageY;

      DOC.once('mouseup', me.onMouseUp, me);
      DOC.on('mousemove', me.onMouseMove, me);

      w.el.on('mouseleave', me.onMouseLeave, me);
      w.el.on('mouseenter', me.onMouseEnterCell, me, 'div.' + GRID_HEADER_CELL_CLS);
      w.el.on('mousemove', me.onMouseMoveCell, me, 'div.' + GRID_HEADER_CELL_CLS);
    },
    onMouseLeave: function () {
      this.hideHint();
    },
    onMouseUp: function () {
      var me = this,
        w = me.widget,
        dragged = false;

      DOC.un('mousemove', me.onMouseMove, me);

      w.el.un('mouseleave', me.onMouseLeave, me);
      w.el.un('mouseenter', me.onMouseEnterCell, me, 'div.' + GRID_HEADER_CELL_CLS);
      w.el.un('mousemove', me.onMouseMoveCell, me, 'div.' + GRID_HEADER_CELL_CLS);

      if(me.ok){
        if(me.inSide === me.activeSide){
          me.dragColumn(me.inSide);
        }
        else if(me.activeSide === 'center'){
          var inIndex = me.inIndex;
          if(me.okPosition === 'right'){
            inIndex++;
          }
          w.moveColumn(me.activeSide, me.inSide, me.activeIndex, inIndex, me.activeCellTopGroup);
        }
        else{
          var inIndex = me.inIndex;
          if(me.okPosition === 'right'){
            inIndex++;
          }
          w.moveColumn(me.activeSide, me.inSide, me.activeIndex, inIndex, me.activeCellTopGroup);
        }

        dragged = true;
      }

      var columnDragParams = {
        column: me.activeColumn,
        fromSide: me.activeSide,
        toSide: me.inSide
      };

      delete me.inUpGroupCell;
      delete me.inUnderGroup;
      delete me.activeCellTopGroup;
      delete me.activeUnderGroup;
      delete me.activeSide;
      delete me.activeCell;
      delete me.activeIndex;
      delete me.activeColumn;
      delete me.mouseDownX;
      delete me.mouseDownY;
      me.ok = false;
      delete me.okPosition;

      F.tip.hide();
      setTimeout(function () {
        me.status = 'none';
      }, 1);
      me.removeDragState();

      if(me.status === 'dragging'){
        setTimeout(function () {
          me.status = 'none';
          if(dragged) {
            w.fire('columndrag', columnDragParams);
            //w.scroller.update();
            if(w.sorter){
              w.sorter.updateSortedHeader();
            }
          }
        }, 10);
      }

      me.hideHint();
      setTimeout(function () {
        w.updateColumnsVisibilty();
      }, 100);

      w.scroller.update();
    },
    onMouseMove: function (e) {
      var me = this,
        w = me.widget,
        header = w.header,
        leftHeader = w.leftHeader,
        rightHeader = w.rightHeader,
        x = e.pageX,
        y = e.pageY,
        columns = w.getColumns(me.activeSide),
        targetEl = F.get(e.target);

      if(targetEl.hasCls(GRID_HEADER_CELL_TRIGGER_CLS) || targetEl.hasCls(GRID_HEADER_CELL_TRIGGER_IMAGE_CLS)){
        return;
      }

      if(Math.abs(x - me.mouseDownX) > 10 || Math.abs(y - me.mouseDownY)){
        if(me.activeCellTopGroup){
          F.tip.update(me.activeCellTopGroup.cell.select('.' + GRID_HEADER_CELL_TEXT_CLS).item(0).dom.innerHTML || '&nbsp;');
          me.status = 'dragging';
          me.addDragState();
        }
        else {
          F.tip.update(me.activeColumn.title || '&nbsp;');
          me.status = 'dragging';
          me.addDragState();
        }
      }
      else{
        return;
      }

      if(columns.length === 1 && me.activeSide === 'center'){
        F.tip.hide();
        setTimeout(function () {
          me.status = 'none';
        }, 1);
        me.removeDragState();
        return;
      }

      F.tip.show(e.pageX + 15, e.pageY + 15);
      if(header.hideMenu){
        header.hideMenu();

        if(w.leftColumns && leftHeader.hideMenu()){
          leftHeader.hideMenu();
        }

        if(w.rightColumns && rightHeader.hideMenu()){
          rightHeader.hideMenu();
        }
      }
    },
    addDragState: function () {
      var me = this,
        w = me.widget;

      w.el.addClass(GRID_STATE_DRAG_COLUMN_CLS);
    },
    removeDragState: function () {
      var me = this,
        w = me.widget;

      w.el.removeClass(GRID_STATE_DRAG_COLUMN_CLS);
    },
    onMouseEnterCell: function(e){
      var me = this,
        w = me.widget,
        cell = Fancy.get(e.currentTarget),
        side = w.getSideByCell(cell);

      me.hideHint();

      if(cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS)){
        me.inUnderGroup = true;
      }
      else{
        delete me.inUnderGroup;
      }

      if(cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS)){
        me.inUpGroupCell = cell;
      }
      else{
        delete me.inUpGroupCell;
      }

      me.inSide = side;
      me.inCell = cell;
      me.inIndex = Number(cell.attr('index'));
    },
    onMouseMoveCell: function(e){
      var me = this,
        w = me.widget,
        cell = me.inCell,
        cellWidth = parseInt(cell.css('width')),
        triggerEl = cell.select('.' + GRID_HEADER_CELL_TRIGGER_CLS),
        targetEl = Fancy.get(e.target),
        inTriggerEl = triggerEl.within(targetEl) || targetEl.hasClass(GRID_HEADER_CELL_TRIGGER_CLS),
        fromGroup = me.activeUnderGroup !== me.inUnderGroup && me.inUnderGroup === true,
        toGroup = me.activeUnderGroup !== me.inUnderGroup && me.activeUnderGroup === true;

      var columns = w.getColumns(me.activeSide);
      if(columns.length === 1 && me.activeSide === 'center'){
        me.ok = false;
        me.hideHint();
        return;
      }

      if(me.activeCellTopGroup){
        if(me.inUpGroupCell){}
        else{
          var startIndex = me.activeCellTopGroup.start,
            endIndex = me.activeCellTopGroup.end;

          if(me.activeSide !== me.inSide){
            me.ok = true;
            if(e.offsetX > cellWidth/2 || inTriggerEl){
              me.showHint('right');
            }
            else{
              me.showHint('left');
            }
          }
          else{
            if(isNaN(me.inIndex)){
              me.hideHint();
            }
            else{
              if(me.inIndex < startIndex){
                if (e.offsetX > cellWidth / 2) {
                  if(me.inIndex + 1 === startIndex){
                    me.hideHint();
                  }
                  else{
                    me.ok = true;
                    me.showHint('right');
                  }
                }
                else{
                  me.ok = true;
                  me.showHint('left');
                }
              }
              else if(me.inIndex > endIndex){
                if (e.offsetX < cellWidth / 2) {
                  if(me.inIndex === endIndex + 1){
                    me.hideHint();
                  }
                  else{
                    me.ok = true;
                    me.showHint('left');
                  }
                }
                else{
                  me.ok = true;
                  me.showHint('right');
                }
              }
              else{
                me.hideHint();
              }
            }
          }
        }
      }
      else if(me.inUpGroupCell){
        var o = me.getGroupStartEnd(),
          startIndex = o.start,
          endIndex = o.end;

        if(me.activeSide !== me.inSide){
          me.ok = true;
          if(e.offsetX > cellWidth/2 || inTriggerEl){
            me.showHint('right');
          }
          else{
            me.showHint('left');
          }
        }
        else{
          if (e.offsetX > cellWidth / 2) {
            if(me.activeIndex > endIndex && me.activeIndex - 1 === endIndex){
              me.hideHint();
            }
            else {
              me.ok = true;
              me.showHint('right');
            }
          }
          else {
            if(me.activeIndex < startIndex && me.activeIndex + 1 === startIndex){
              me.hideHint();
            }
            else {
              me.ok = true;
              me.showHint('left');
            }
          }
        }
      }
      else if(me.activeSide !== me.inSide){
        me.ok = true;
        if(e.offsetX > cellWidth/2 || inTriggerEl){
          me.showHint('right');
        }
        else{
          me.showHint('left');
        }
      }
      else if(me.activeIndex === me.inIndex){
        me.ok = false;
      }
      else if(me.activeIndex < me.inIndex){
        if(e.offsetX > cellWidth/2 || inTriggerEl){
          me.ok = true;
          me.showHint('right');
        }
        else{
          if(e.offsetX < cellWidth/2 && (me.activeIndex + 1) !== me.inIndex){
            me.ok = true;
            me.showHint('left');
          }
          else {
            if(me.activeIndex + 1 === me.inIndex && (fromGroup || toGroup) ){
              me.ok = true;
              me.showHint('left');
            }
            else{
              me.ok = false;
              me.hideHint();
            }
          }
        }
      }
      else if(me.activeIndex > me.inIndex){
        if(e.offsetX < cellWidth/2){
          if(inTriggerEl){
            if(fromGroup || toGroup){
              me.ok = true;
              me.showHint('right');
            }
            else if(me.activeIndex - 1 === me.inIndex || me.inUpGroupCell) {
              me.ok = false;
              me.hideHint();
            }
            else{
              me.ok = true;
              me.showHint('right');
            }
          }
          else {
            me.ok = true;
            me.showHint('left');
          }
        }
        else{
          if(e.offsetX > cellWidth/2){
            if((me.activeIndex - 1) === me.inIndex && (fromGroup || toGroup)){
              me.ok = true;
              me.showHint('right');
            }
            else{
              if((me.activeIndex - 1) !== me.inIndex || me.activeUnderGroup){
                me.ok = true;
                me.showHint('right');
              }
              else{
                me.ok = false;
                me.hideHint();
              }
            }
          }
          else {
            me.ok = false;
            me.hideHint();
          }
        }
      }
    },
    showHint: function(position){
      var me = this,
        w = me.widget,
        CELL_HEADER_HEIGHT = w.cellHeaderHeight,
        cell = me.inCell,
        topEl = me.topEl,
        bottomEl = me.bottomEl,
        o = cell.offset(),
        cellWidth = parseInt(cell.css('width')),
        cellHeight = parseInt(cell.css('height'));

      me.okPosition = position;

      topEl.removeCls(HIDDEN_CLS);
      bottomEl.removeCls(HIDDEN_CLS);

      var plusWidth = 0;

      if(position === 'right'){
        plusWidth += cellWidth;
      }

      topEl.css({
        left: o.left + plusWidth - Math.ceil(parseInt(topEl.css('width'))/2),
        top: o.top - parseInt(topEl.css('height'))
      });

      var bottomTop = o.top + cellHeight;

      if(me.inUpGroupCell){
        var rows = w.header.calcRows();
        bottomTop = o.top + rows * CELL_HEADER_HEIGHT;
      }

      bottomEl.css({
        left: o.left + plusWidth - Math.ceil(parseInt(bottomEl.css('width'))/2),
        top: bottomTop
      });

      if(w.window){
        var zIndex = 1000 + F.zIndex++;

        topEl.css('z-index', zIndex);
        bottomEl.css('z-index', zIndex);
      }
    },
    hideHint: function(){
      var me = this;

      me.topEl.addCls(HIDDEN_CLS);
      me.bottomEl.addCls(HIDDEN_CLS);
    },
    initHint: function(){
      var me = this,
        w = me.widget,
        themeCls = 'fancy-theme-' + w.theme,
        renderTo = F.get(document.body).dom,
        topEl = F.get(document.createElement('div')),
        bottomEl = F.get(document.createElement('div'));

      topEl.addCls('fancy-drag-hint-top', HIDDEN_CLS, themeCls);
      bottomEl.addCls('fancy-drag-hint-bottom', HIDDEN_CLS, themeCls);

      me.topEl = F.get(renderTo.appendChild(topEl.dom));
      me.bottomEl = F.get(renderTo.appendChild(bottomEl.dom));
    },
    /*
     * @param {String} side
     */
    dragColumn: function (side) {
      var me = this,
        w = me.widget,
        header = w.getHeader(side),
        body = w.getBody(side),
        activeIndex = me.activeIndex,
        inIndex = me.inIndex,
        position = me.okPosition,
        columns = w.getColumns(side),
        column = columns[activeIndex],
        rows = header.calcRows();

      if(me.activeCellTopGroup){
        var startIndex = me.activeCellTopGroup.start,
          endIndex = me.activeCellTopGroup.end,
          _columns = columns.splice(startIndex, endIndex - startIndex + 1),
          inIndex = me.inIndex;

        if(position === 'right'){
          inIndex++;
        }

        if(me.inIndex < startIndex){
          columns = Fancy.Array.insert(columns, inIndex, _columns);
        }
        else{
          columns = Fancy.Array.insert(columns, inIndex - _columns.length, _columns);
        }

        w.setColumns(columns, side);
      }
      else if(me.inUpGroupCell){
        var o = me.getGroupStartEnd();

        inIndex = o.start;

        if(position === 'right'){
          inIndex = o.end + 1;
        }
      }
      else if(position === 'right'){
        if(me.inUnderGroup){
          var groupName = columns[inIndex].grouping,
            nextColumn = columns[inIndex + 1];

          if(nextColumn && nextColumn.grouping === groupName){
            inIndex++;
          }
        }
        else {
          inIndex++;
        }
      }

      if(w.groupheader && !me.activeCellTopGroup){
        var inColumn = columns[inIndex];

        if(inColumn && inColumn.grouping && me.inUnderGroup){
          column.grouping = inColumn.grouping;

          if(column.filter && column.filter.header && rows < 3){
            delete column.filter;
          }
        }
        else{
          delete column.grouping;
        }
      }

      if(!me.activeCellTopGroup){
        columns.splice(activeIndex, 1);

        if(activeIndex<inIndex){
          inIndex--;
        }

        columns.splice(inIndex, 0, column);
      }

      body.clearColumnsStyles();
      header.updateTitles();
      header.updateCellsSizes();
      header.reSetCheckBoxes();
      if(w.groupheader){
        w.header.fixGroupHeaderSizing();
        if(w.leftColumns){
          w.leftHeader.fixGroupHeaderSizing();
        }

        if(w.rightColumns){
          w.rightHeader.fixGroupHeaderSizing();
        }

        header.reSetGroupIndexes();
      }

      setTimeout(function () {
        header.reSetColumnsAlign();
        header.reSetColumnsCls();
        body.reSetColumnsAlign();
        body.reSetColumnsCls();
        body.updateColumnsSizes();
      }, 100);
      w.update();
    },
    /*
     * @param {Object} [cell]
     * @param {String} [side]
     * @return {Object}
     */
    getGroupStartEnd: function (cell, side) {
      var me = this,
        w = me.widget,
        header = w.getHeader(side || me.inSide),
        groupName = (cell || me.inUpGroupCell).attr('index'),
        inUpGroupCells = header.el.select('[group-index="' + groupName + '"]'),
        values = [];

      inUpGroupCells.each(function(cell){
        values.push(Number(cell.attr('index')));
      });

      return {
        start: F.Array.min(values),
        end: F.Array.max(values)
      };
    }
  });

})();