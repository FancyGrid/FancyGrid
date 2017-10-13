/*
 * @class Fancy.grid.plugin.ColumnResizer
 * @extend Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.ColumnResizer', {
  extend: Fancy.Plugin,
  ptype: 'grid.columnresizer',
  inWidgetName: 'columnresizer',
  resizerLeftCls: 'fancy-grid-resizer-left',
  resizerRightCls: 'fancy-grid-resizer-right',
  /*
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
    var me = this,
      w = me.widget;

    me.Super('init', arguments);

    w.on('render', function() {
      me.render();
      me.ons();
    });
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget;

    w.on('headercellmousemove', me.onCellMouseMove, me);
    w.on('headercellmousedown', me.onHeaderCellMouseDown, me);
    w.on('docclick', me.onDocClick, me);
    w.on('docmove', me.onDocMove, me);
    w.on('docmouseup', me.onDocMouseUp, me);
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onCellMouseMove: function(grid, o){
    var me = this,
      w = me.widget,
      FIELD_CLS = Fancy.FIELD_CLS,
      cellHeaderTriggerCls = w.cellHeaderTriggerCls,
      cellHeaderTriggerImageCls = w.cellHeaderTriggerImageCls,
      e = o.e,
      cellEl = Fancy.get(o.cell),
      offsetX = e.offsetX,
      cellWidth = cellEl.width(),
      target = Fancy.get(e.target),
      isInTrigger = target.hasCls(cellHeaderTriggerCls),
      isInTriggerImage = target.hasCls(cellHeaderTriggerImageCls),
      triggerEl = cellEl.select('.' + cellHeaderTriggerCls).item(0),
      triggerImageEl = cellEl.select('.' + cellHeaderTriggerImageCls).item(0),
      hasFieldInSide = Fancy.get(e.target).closest('.' + FIELD_CLS).hasCls(FIELD_CLS),
      triggerWidth = parseInt(triggerEl.css('width')),
      triggerImageWidth = parseInt(triggerImageEl.css('width')),
      _width = cellWidth,
      inOffsetX = 7;

    if(isInTrigger){
      _width = triggerWidth;
    }

    if(isInTriggerImage){
      _width = triggerImageWidth;
    }

    if(w.startResizing){
      return;
    }

    if(o.side === 'left' && o.index === w.leftColumns.length - 1 && (_width - offsetX) < inOffsetX + 2){
      inOffsetX += 2;
    }

    if(!isInTrigger && !isInTriggerImage && o.side === 'right' && o.index === 0 && offsetX < inOffsetX){
      if(me.isColumnResizable(o)){
        if( !hasFieldInSide ){
          me.addCellResizeCls(o.cell);
        }
      }
    }
    else if(!isInTrigger && !isInTriggerImage && offsetX < inOffsetX && o.side === 'center' && o.index === 0 && w.leftColumns.length){
      o.side = 'left';
      o.index = w.leftColumns.length - 1;
      if(me.isColumnResizable(o)){
        if( !hasFieldInSide ){
          me.addCellResizeCls(o.cell);
        }
      }
    }
    else if(!isInTrigger && !isInTriggerImage && ( (_width - offsetX) < inOffsetX || offsetX < inOffsetX) && o.index !== 0){
      var isLeft = offsetX < inOffsetX;

      if(me.isColumnResizable(o, isLeft)){
        if( !hasFieldInSide ){
          me.addCellResizeCls(o.cell);
        }
      }
    }
    else if((_width - offsetX)<inOffsetX){
      if(isInTriggerImage){
        if(triggerImageWidth - offsetX > 2){
          me.removeCellResizeCls(o.cell);
        }
        else{
          me.addCellResizeCls(o.cell);
        }
      }
      else if(me.isColumnResizable(o)){
        me.addCellResizeCls(o.cell);
      }
    }
    else{
      me.removeCellResizeCls(o.cell);
    }
  },
  /*
   * @param {Fancy.Element} cell
   */
  addCellResizeCls: function(cell){
    var me = this,
      w = me.widget,
      columnResizerCls = w.columnResizerCls,
      cellHeaderTriggerCls = w.cellHeaderTriggerCls;

    Fancy.get(cell).addCls(columnResizerCls);
    Fancy.get(cell).select('.' + cellHeaderTriggerCls).addCls(columnResizerCls);
  },
  /*
   * @param {Fancy.Element} cell
   */
  removeCellResizeCls: function(cell){
    var me = this,
      w = me.widget,
      columnResizerCls = w.columnResizerCls,
      cellHeaderTriggerCls = w.cellHeaderTriggerCls;

    Fancy.get(cell).removeClass(columnResizerCls);
    Fancy.get(cell).select('.' + cellHeaderTriggerCls).item(0).removeClass(columnResizerCls);
  },
  /*
   * @param {Object} e
   * @param {Object} o
   */
  onHeaderCellMouseDown: function(e, o){
    var me = this,
      w = me.widget,
      cellHeaderTriggerCls = w.cellHeaderTriggerCls,
      cellHeaderTriggerImageCls = w.cellHeaderTriggerImageCls,
      e = o.e,
      target = Fancy.get(e.target),
      cellEl = Fancy.get(o.cell),
      offsetX = e.offsetX,
      cellWidth = cellEl.width(),
      field = cellEl.select('.' + Fancy.FIELD_CLS),
      isInTrigger = target.hasCls(cellHeaderTriggerCls),
      isInTriggerImage = target.hasCls(cellHeaderTriggerImageCls),
      triggerEl = cellEl.select('.' + cellHeaderTriggerCls).item(0),
      triggerImageEl = cellEl.select('.' + cellHeaderTriggerImageCls).item(0),
      triggerWidth = parseInt(triggerEl.css('width')),
      triggerImageWidth = parseInt(triggerImageEl.css('width')),
      _width = cellWidth,
      inOffsetX = 7;

    if(isInTrigger){
      _width = triggerWidth;
    }

    if(isInTriggerImage){
      _width = triggerImageWidth;
      return;
    }

    if(field.length > 0 && field.item(0).within(target.dom)){
      return;
    }

    if(o.side === 'left' && o.index === w.leftColumns.length - 1 && (_width - offsetX) < inOffsetX + 2){
      inOffsetX += 2;
    }

    if(!isInTrigger && !isInTriggerImage && o.side === 'right' && o.index === 0 && offsetX < inOffsetX){
      w.startResizing = true;
      me.cell = o.cell;
      me.activeSide = o.side;
      me.clientX = e.clientX;
      me.columnIndex = o.index;
      me.moveLeftResizer = true;
    }
    else if(offsetX < 7 && o.side === 'center' && o.index === 0 && w.leftColumns.length){
      w.startResizing = true;
      o.side = 'left';
      o.index = w.leftColumns.length - 1;
      me.cell = me.getCell(o);
      me.activeSide = o.side;
      me.clientX = e.clientX;
      me.columnIndex = o.index;
    }
    else if(!isInTrigger && !isInTriggerImage && offsetX < inOffsetX && o.index !== 0){
      w.startResizing = true;
      me.cell = me.getPrevCell(o);
      me.activeSide = o.side;
      me.clientX = e.clientX;
      me.columnIndex = o.index - 1;
    }
    else if((_width - offsetX) < inOffsetX){
      w.startResizing = true;
      me.cell = o.cell;
      me.activeSide = o.side;
      me.clientX = e.clientX;
      me.columnIndex = o.index;
    }

    if(w.startResizing){
      me.isColumnResizable();
    }
  },
  /*
   * @param {Object} o
   * @param {Boolean} isLeft
   * @return {Boolean}
   */
  isColumnResizable: function(o, isLeft) {
    var me = this,
      w = me.widget,
      columns,
      column,
      index;

    if(o){
      columns = w.getColumns(o.side);
      index = o.index;
      if(isLeft){
        index--;
      }
      if(isNaN(index)){
        return;
      }
      column = columns[index];
      return column.resizable === true;
    }
    else{
      columns = w.getColumns(me.activeSide);
      if (columns[me.columnIndex].resizable !== true) {
        w.startResizing = false;
        delete me.cell;
        delete me.activeSide;
        delete me.clientX;
        delete me.columnIndex;
      }
    }
  },
  /*
   * @return {Number}
   */
  getMinColumnWidth: function(){
    var me = this,
      w = me.widget,
      minCellWidth = w.minCellWidth,
      columns,
      column;

    if(me.columnIndex === undefined){
      return minCellWidth;
    }

    columns = w.getColumns(me.activeSide);
    column = columns[me.columnIndex];

    if(column.minWidth){
      return column.minWidth;
    }

    return minCellWidth;
  },
  /*
   * @return {Number|false}
   */
  getMaxColumnWidth: function(){
    var me = this,
      w = me.widget,
      columns,
      column;

    if(me.columnIndex === undefined){
      return false;
    }

    columns = w.getColumns(me.activeSide);
    column = columns[me.columnIndex];

    if(column.maxWidth){
      return column.maxWidth;
    }

    return false;
  },
  /*
   *
   */
  onDocClick: function(){
    var me = this,
      w = me.widget;

    w.startResizing = false;
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} e
   */
  onDocMove: function(grid, e){
    var me = this,
      w = me.widget;

    if(w.startResizing){
      me.moveResizeEls(e);
    }
  },
  /*
   *
   */
  render: function(){
    var me = this,
      w = me.widget,
      leftEl = Fancy.get( document.createElement('div')),
      rightEl = Fancy.get( document.createElement('div') );

    leftEl.addCls(me.resizerLeftCls);
    rightEl.addCls(me.resizerRightCls);

    me.leftEl = Fancy.get(w.el.dom.appendChild(leftEl.dom));
    me.rightEl = Fancy.get(w.el.dom.appendChild(rightEl.dom));
  },
  /*
   * @param {Object} e
   */
  moveResizeEls: function(e){
    var me = this,
      w = me.widget,
      cellEl = Fancy.get(me.cell),
      left = parseInt(cellEl.css('left')),
      minWidth = me.getMinColumnWidth(),
      maxWidth = me.getMaxColumnWidth();

    switch(me.activeSide){
      case 'left':
        break;
      case 'center':
        left += parseInt(w.leftEl.css('width'));
        break;
      case 'right':
        left += parseInt(w.leftEl.css('width'));
        left += parseInt(w.centerEl.css('width'));
        break;
    }

    var clientX = e.clientX,
      deltaClientX = clientX - me.clientX,
      cellWidth = cellEl.width() + deltaClientX;

    if(cellWidth < minWidth){
      cellWidth = minWidth;
    }

    if(maxWidth && cellWidth > maxWidth){
      cellWidth = maxWidth;
    }

    me.deltaWidth = cellEl.width() - cellWidth;

    if(me.moveLeftResizer){
      deltaClientX = clientX - me.clientX;
      cellWidth = cellEl.width() - deltaClientX;

      if(cellWidth < minWidth){
        cellWidth = minWidth;
      }

      me.deltaWidth = cellEl.width() - cellWidth;

      me.leftEl.css({
        display: 'block',
        left: left + deltaClientX + 'px'
      });

      me.rightEl.css({
        display: 'block',
        left: (left + cellEl.width() - 1) + 'px'
      });
    }
    else {
      me.leftEl.css({
        display: 'block',
        left: left + 'px'
      });

      me.rightEl.css({
        display: 'block',
        left: left + cellWidth + 'px'
      });
    }

    me.cellWidth = cellWidth;
  },
  /*
   *
   */
  onDocMouseUp: function(){
    var me = this,
      w = me.widget;

    if (w.startResizing === false) {
      return;
    }

    me.leftEl.css({
      display: 'none'
    });

    me.rightEl.css({
      display: 'none'
    });

    me.fixSidesWidth();
    w.startResizing = false;
    me.moveLeftResizer = false;
    delete me.cellWidth;
  },
  /*
   *
   */
  fixSidesWidth: function(){
    var me = this,
      w = me.widget,
      cellHeaderCls = w.cellHeaderCls,
      cellHeaderGroupLevel2 = w.cellHeaderGroupLevel2,
      columnCls = w.columnCls,
      cellWidth = me.cellWidth,
      index = me.columnIndex,
      delta = me.deltaWidth,
      domColumns,
      domHeaderCells,
      leftEl = w.leftEl,
      centerEl = w.centerEl,
      rightEl = w.rightEl,
      leftHeaderEl = w.leftHeader.el,
      centerHeaderEl = w.header.el,
      rightHeaderEl = w.rightHeader.el,
      centerBodyEl = w.body.el,
      groupMove = {},
      ignoreGroupIndexes = {},
      column,
      newCenterWidth,
      minCenterWidth = me.minCenterWidth;

    if(cellWidth === undefined){
      return;
    }

    var leftFix = 1;
    if(Fancy.nojQuery){
      leftFix = 0;
    }

    switch(me.activeSide){
      case 'left':
        newCenterWidth = parseInt(centerEl.css('width')) + delta + leftFix;

        if(newCenterWidth < minCenterWidth){
          return;
        }

        column = w.leftColumns[index];

        w.leftColumns[me.columnIndex].width = cellWidth;
        domColumns = w.leftBody.el.select('.' + columnCls);
        domHeaderCells = w.leftHeader.el.select('.' + cellHeaderCls);
        domColumns.item(index).css('width', cellWidth + 'px');

        var i = me.columnIndex + 1,
          iL = domHeaderCells.length,
          _i = 0,
          _iL = i;

        for(;_i<_iL;_i++){
          var domHeaderCell = domHeaderCells.item(_i),
            groupIndex = domHeaderCell.attr('group-index');

          if(groupIndex){
            ignoreGroupIndexes[groupIndex] = true;
          }
        }

        for(;i<iL;i++){
          var domColumnEl = domColumns.item(i),
            domHeaderCell = domHeaderCells.item(i);

          domColumnEl.css('left', parseInt(domColumnEl.css('left')) - delta - leftFix);
          if(domHeaderCell.hasCls(cellHeaderGroupLevel2) && ignoreGroupIndexes[domHeaderCell.attr('index')]){}
          else{
            domHeaderCell.css('left', parseInt(domHeaderCell.css('left')) - delta - leftFix);
          }
        }

        leftEl.css('width', parseInt(leftEl.css('width')) - delta - leftFix);
        leftHeaderEl.css('width', parseInt(leftHeaderEl.css('width')) - delta - leftFix + 'px');

        if(w.columns.length){
          centerEl.css('left', parseInt(centerEl.css('left')) - delta - leftFix);
          centerEl.css('width', newCenterWidth);
          centerHeaderEl.css('width', parseInt(centerHeaderEl.css('width')) + delta + leftFix);
          centerBodyEl.css('width', parseInt(centerBodyEl.css('width')) + delta + leftFix);
        }

        break;
      case 'center':
        column = w.columns[index];
        w.columns[me.columnIndex].width = cellWidth;
        domColumns = w.body.el.select('.' + columnCls);
        domHeaderCells = w.header.el.select('.' + cellHeaderCls);
        domColumns.item(index).css('width', cellWidth + 'px');

        var i = me.columnIndex + 1,
          iL = domHeaderCells.length,
          _i = 0,
          _iL = i;

        for(;_i<_iL;_i++){
          var domHeaderCell = domHeaderCells.item(_i),
            groupIndex = domHeaderCell.attr('group-index');

          if(groupIndex){
            ignoreGroupIndexes[groupIndex] = true;
          }
        }

        for(;i<iL;i++){
          var domColumnEl = domColumns.item(i),
            domHeaderCell = domHeaderCells.item(i),
            left = parseInt(domColumnEl.css('left')) - delta - leftFix,
            _left = parseInt(domHeaderCell.css('left')) - delta - leftFix;

          if(domHeaderCell.attr('group-index')){
            groupMove[domHeaderCell.attr('group-index')] = {};
          }

          domColumnEl.css('left', left);

          if(domHeaderCell.hasCls(cellHeaderGroupLevel2) && ignoreGroupIndexes[domHeaderCell.attr('index')]){}
          else{
            domHeaderCell.css('left', _left);
          }
        }

        break;
      case 'right':
        newCenterWidth = parseInt(centerEl.css('width')) + delta + leftFix;

        if(newCenterWidth < minCenterWidth){
          return;
        }

        column = w.rightColumns[index];

        w.rightColumns[me.columnIndex].width = cellWidth;
        domColumns = w.rightBody.el.select('.' + columnCls);
        domHeaderCells = w.rightHeader.el.select('.' + cellHeaderCls);
        domColumns.item(index).css('width', cellWidth + 'px');

        var i = me.columnIndex + 1,
          iL = domHeaderCells.length,
          _i = 0,
          _iL = i;

        for(;_i<_iL;_i++){
          var domHeaderCell = domHeaderCells.item(_i),
            groupIndex = domHeaderCell.attr('group-index');

          if(groupIndex){
            ignoreGroupIndexes[groupIndex] = true;
          }
        }

        for(;i<iL;i++){
          var domColumnEl = domColumns.item(i),
            domHeaderCell = domHeaderCells.item(i);

          domColumnEl.css('left', parseInt(domColumnEl.css('left')) - delta - leftFix);

          if(domHeaderCell.hasCls(cellHeaderGroupLevel2) && ignoreGroupIndexes[domHeaderCell.attr('index')]){}
          else{
            domHeaderCell.css('left', parseInt(domHeaderCell.css('left')) - delta - leftFix);
          }
        }

        rightEl.css('width', parseInt(rightEl.css('width')) - delta - leftFix);
        rightHeaderEl.css('width', parseInt(rightHeaderEl.css('width')) - delta - leftFix + 'px');

        if(w.columns.length){
          centerEl.css('width', newCenterWidth);
          centerHeaderEl.css('width', parseInt(centerHeaderEl.css('width')) + delta + leftFix);
          centerBodyEl.css('width', parseInt(centerBodyEl.css('width')) + delta + leftFix);
        }
        break;
    }

    var cellEl = Fancy.get(me.cell),
      groupName = cellEl.attr('group-index'),
      groupCell;

    cellEl.css('width', cellWidth + 'px');

    if(groupName){
      groupCell = w.el.select("[index='" + groupName + "']");
      groupCell.css('width', parseInt(groupCell.css('width')) - delta - leftFix);
    }
    else {
      for (var p in groupMove) {
        groupCell = w.el.select("[index='" + p + "']");
        groupCell.css('left', parseInt(groupCell.css('left')) - groupMove[p].delta - leftFix);
      }
    }

    w.fire('columnresize', {
      cell: cellEl.dom,
      width: cellWidth
    });

    if(/sparkline/.test(column.type) ){
      switch(me.activeSide) {
        case 'left':
          w.leftBody.updateRows(undefined, index);
          break;
        case 'center':
          w.body.updateRows(undefined, index);
          break;
        case 'right':
          w.rightBody.updateRows(undefined, index);
          break;
      }
    }
  },
  /*
   * @param {Object} o
   * @return {Fancy.Element}
   */
  getPrevCell: function(o){
    var me = this,
      w = me.widget,
      cellHeaderCls = w.cellHeaderCls,
      header;

    switch(o.side){
      case 'left':
        header = w.leftHeader;
        break;
      case 'center':
        header = w.header;
        break;
      case 'right':
        header = w.rightHeader;
        break;
    }

    return header.el.select('.' + cellHeaderCls).item(o.index - 1).dom;
  },
  /*
   * @param {Object} o
   * @return {HTMLElement}
   */
  getCell: function(o){
    var me = this,
      w = me.widget,
      cellHeaderCls = w.cellHeaderCls,
      header;

    switch(o.side){
      case 'left':
        header = w.leftHeader;
        break;
      case 'center':
        header = w.header;
        break;
      case 'right':
        header = w.rightHeader;
        break;
    }

    return header.el.select('.' + cellHeaderCls).item(o.index).dom;
  },
  /*
   * @param {String} side
   */
  updateColumnsWidth: function(side){
    var me = this,
      w = me.widget,
      side = side || 'center',
      header = w.getHeader(side),
      columns = w.getColumns(side),
      i = 0,
      iL = columns.length;

    for(;i<iL;i++){
      var column = columns[i];

      me.setColumnWidth(i, column.width, side);
    }

    header.setCellsPosition();
  },
  /*
   * @param {Number} index
   * @param {Number} width
   * @param {String} side
   */
  setColumnWidth: function(index, width, side){
    var me = this,
      w = me.widget,
      columns = w.getColumns(side),
      header = w.getHeader(side),
      body = w.getBody(side),
      columnEl = Fancy.get(body.getDomColumn(index)),
      headerCellEl = header.getCell(index),
      nextHeaderCellEl,
      nextColumnEl,
      left = parseInt(columnEl.css('left'));

    columnEl.css('width', width);
    headerCellEl.css('width', width);

    if(columns[index + 1]){
      left += width;

      nextColumnEl = Fancy.get(body.getDomColumn(index + 1));
      nextColumnEl.css('left', left);

      nextHeaderCellEl = header.getCell(index + 1);
      nextHeaderCellEl.css('left', left);
    }
  }
});