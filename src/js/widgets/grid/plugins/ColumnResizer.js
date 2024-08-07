/*
 * @class Fancy.grid.plugin.ColumnResizer
 * @extend Fancy.Plugin
 */
(function(){
  //SHORTCUTS
  const F = Fancy;
  const G = F.get;

  //CONSTANTS
  const FIELD_CLS = F.FIELD_CLS;
  const GRID_RESIZER_LEFT_CLS = F.GRID_RESIZER_LEFT_CLS;
  const GRID_RESIZER_RIGHT_CLS = F.GRID_RESIZER_RIGHT_CLS;
  const GRID_HEADER_CELL_TRIGGER_CLS = F.GRID_HEADER_CELL_TRIGGER_CLS;
  const GRID_HEADER_CELL_TRIGGER_IMAGE_CLS = F.GRID_HEADER_CELL_TRIGGER_IMAGE_CLS;
  const GRID_HEADER_CELL_CLS = F.GRID_HEADER_CELL_CLS;
  const GRID_COLUMN_RESIZER_CLS = F.GRID_COLUMN_RESIZER_CLS;
  const GRID_COLUMN_CLS = F.GRID_COLUMN_CLS;
  const GRID_HEADER_CELL_GROUP_LEVEL_2_CLS = F.GRID_HEADER_CELL_GROUP_LEVEL_2_CLS;
  const GRID_STATE_RESIZE_COLUMN_CLS = F.GRID_STATE_RESIZE_COLUMN_CLS;

  const ANIMATE_DURATION = F.ANIMATE_DURATION;

  //TEMPLATES
  const T_GRID_HEADER_CELL = `.${GRID_HEADER_CELL_CLS}`;

  F.define('Fancy.grid.plugin.ColumnResizer', {
    extend: F.Plugin,
    ptype: 'grid.columnresizer',
    inWidgetName: 'columnresizer',
    /*
     * @param {Object} config
     */
    constructor: function(){
      this.Super('const', arguments);
    },
    /*
     *
     */
    init(){
      const me = this,
        w = me.widget;

      me.Super('init', arguments);

      if(!w.header){
        return;
      }

      w.on('render', function(){
        me.render();
        me.ons();
      });
    },
    /*
     *
     */
    ons(){
      const me = this,
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
    onCellMouseMove(grid, o){
      var me = this,
        w = me.widget,
        e = o.e,
        cellEl = G(o.cell),
        offsetX = e.offsetX,
        cellWidth = cellEl.width(),
        target = G(e.target),
        isInTrigger = target.hasCls(GRID_HEADER_CELL_TRIGGER_CLS),
        isInTriggerImage = target.hasCls(GRID_HEADER_CELL_TRIGGER_IMAGE_CLS),
        triggerEl = cellEl.select('.' + GRID_HEADER_CELL_TRIGGER_CLS).item(0),
        triggerImageEl = cellEl.select('.' + GRID_HEADER_CELL_TRIGGER_IMAGE_CLS).item(0),
        hasFieldInSide = G(e.target).closest('.' + FIELD_CLS).hasCls(FIELD_CLS),
        triggerWidth = parseInt(triggerEl.css('width')),
        triggerImageWidth = parseInt(triggerImageEl.css('width')),
        _width = cellWidth,
        inOffsetX = 7;

      if (isInTrigger){
        _width = triggerWidth;
      }

      if (isInTriggerImage){
        _width = triggerImageWidth;
      }

      if (w.startResizing){
        return;
      }

      if(isInTriggerImage){
        me.removeCellResizeCls(o.cell);
        return;
      }

      if (o.side === 'left' && o.index === w.leftColumns.length - 1 && (_width - offsetX) < inOffsetX + 2){
        inOffsetX += 2;
      }

      if (!isInTrigger && !isInTriggerImage && o.side === 'right' && o.index === 0 && offsetX < inOffsetX){
        if (me.isColumnResizable(o)){
          if (!hasFieldInSide){
            me.addCellResizeCls(o.cell);
          }
        }
      }
      else if (!isInTrigger && !isInTriggerImage && offsetX < inOffsetX && o.side === 'center' && o.index === 0 && w.leftColumns.length){
        o.side = 'left';
        o.index = w.leftColumns.length - 1;
        if (me.isColumnResizable(o)){
          if (!hasFieldInSide){
            me.addCellResizeCls(o.cell);
          }
        }
      }
      else if (!isInTrigger && !isInTriggerImage && ( (_width - offsetX) < inOffsetX || offsetX < inOffsetX) && o.index !== 0){
        const isLeft = offsetX < inOffsetX;

        if (me.isColumnResizable(o, isLeft)){
          if (!hasFieldInSide){
            me.addCellResizeCls(o.cell);
          }
        }
      }
      else if ((_width - offsetX) < inOffsetX){
        if (isInTriggerImage){
          if (triggerImageWidth - offsetX > 2){
            me.removeCellResizeCls(o.cell);
          }
          else {
            me.addCellResizeCls(o.cell);
          }
        }
        else if (me.isColumnResizable(o)){
          me.addCellResizeCls(o.cell);
        }
      }
      else {
        me.removeCellResizeCls(o.cell);
      }
    },
    /*
     * @param {Fancy.Element} cell
     */
    addCellResizeCls(cell){
      const me = this,
        w = me.widget,
        columndrag = w.columndrag;

      if(columndrag && columndrag.status === 'dragging'){
        return;
      }

      G(cell).addCls(GRID_COLUMN_RESIZER_CLS);
      G(cell).select('.' + GRID_HEADER_CELL_TRIGGER_CLS).addCls(GRID_COLUMN_RESIZER_CLS);
    },
    /*
     * @param {Fancy.Element} cell
     */
    removeCellResizeCls(cell){
      G(cell).removeClass(GRID_COLUMN_RESIZER_CLS);
      G(cell).select('.' + GRID_HEADER_CELL_TRIGGER_CLS).item(0).removeClass(GRID_COLUMN_RESIZER_CLS);
    },
    /*
     * @param {Object} e
     * @param {Object} o
     */
    onHeaderCellMouseDown(e, o){
      e = o.e;

      var me = this,
        w = me.widget,
        target = G(e.target),
        cellEl = G(o.cell),
        offsetX = e.offsetX,
        cellWidth = cellEl.width(),
        field = cellEl.select('.' + FIELD_CLS),
        isInTrigger = target.hasCls(GRID_HEADER_CELL_TRIGGER_CLS),
        isInTriggerImage = target.hasCls(GRID_HEADER_CELL_TRIGGER_IMAGE_CLS),
        triggerEl = cellEl.select('.' + GRID_HEADER_CELL_TRIGGER_CLS).item(0),
        triggerImageEl = cellEl.select('.' + GRID_HEADER_CELL_TRIGGER_IMAGE_CLS).item(0),
        triggerWidth = parseInt(triggerEl.css('width')),
        triggerImageWidth = parseInt(triggerImageEl.css('width')),
        _width = cellWidth,
        inOffsetX = 7;

      if (isInTrigger){
        _width = triggerWidth;
      }

      if (isInTriggerImage){
        _width = triggerImageWidth;
        return;
      }

      if (field.length > 0 && field.item(0).within(target.dom)){
        return;
      }

      if (o.side === 'left' && o.index === w.leftColumns.length - 1 && (_width - offsetX) < inOffsetX + 2){
        inOffsetX += 2;
      }

      if (!isInTrigger && !isInTriggerImage && o.side === 'right' && o.index === 0 && offsetX < inOffsetX){
        w.startResizing = true;
        F.apply(me, {
          cell: o.cell,
          activeSide: o.side,
          clientX: e.clientX,
          columnIndex: o.index,
          moveLeftResizer: true
        });
      }
      else if (offsetX < 7 && o.side === 'center' && o.index === 0 && w.leftColumns.length){
        w.startResizing = true;
        o.side = 'left';
        o.index = w.leftColumns.length - 1;
        F.apply(me, {
          cell: me.getCell(o),
          activeSide: o.side,
          clientX: e.clientX,
          columnIndex: o.index
        });
      }
      else if (!isInTrigger && !isInTriggerImage && offsetX < inOffsetX && o.index !== 0){
        w.startResizing = true;
        F.apply(me, {
          cell: me.getPrevCell(o),
          activeSide: o.side,
          clientX: e.clientX,
          columnIndex: o.index - 1
        });
      }
      else if ((_width - offsetX) < inOffsetX){
        w.startResizing = true;
        F.apply(me, {
          cell: o.cell,
          activeSide: o.side,
          clientX: e.clientX,
          columnIndex: o.index
        });
      }

      if (w.startResizing){
        me.isColumnResizable();
      }
    },
    /*
     * @param {Object} o
     * @param {Boolean} isLeft
     * @return {Boolean}
     */
    isColumnResizable(o, isLeft){
      var me = this,
        w = me.widget,
        columns,
        column,
        index;

      if (o){
        columns = w.getColumns(o.side);
        index = o.index;
        if (isLeft){
          index--;

          column = columns[index];
          if(index > 0 && columns[index].hidden){
            index--;
          }
        }
        if (isNaN(index)){
          return;
        }

        column = columns[index];

        if(index === 0 && column.hidden){
          if(o.side === 'center' && w.leftColumns){}
          else {
            return false;
          }
        }

        if(column.hidden){
          return false;
        }

        return column.resizable === true;
      }
      else {
        columns = w.getColumns(me.activeSide);
        if (columns[me.columnIndex].resizable !== true){
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
    getMinColumnWidth(){
      var me = this,
        w = me.widget,
        minCellWidth = w.minCellWidth,
        columns,
        column;

      if (me.columnIndex === undefined){
        return minCellWidth;
      }

      columns = w.getColumns(me.activeSide);
      column = columns[me.columnIndex];

      if (column.minWidth){
        return column.minWidth;
      }

      return minCellWidth;
    },
    /*
     * @return {Number|false}
     */
    getMaxColumnWidth(){
      var me = this,
        w = me.widget,
        columns,
        column;

      if (me.columnIndex === undefined){
        return false;
      }

      columns = w.getColumns(me.activeSide);
      column = columns[me.columnIndex];

      if (column.maxWidth){
        return column.maxWidth;
      }

      return false;
    },
    /*
     *
     */
    onDocClick(){
      this.widget.startResizing = false;
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} e
     */
    onDocMove(grid, e){
      if (this.widget.startResizing){
        this.moveResizeEls(e);
      }
    },
    /*
     *
     */
    render(){
      const me = this,
        w = me.widget,
        leftEl = F.newEl('div'),
        rightEl = F.newEl('div');

      leftEl.addCls(GRID_RESIZER_LEFT_CLS);
      rightEl.addCls(GRID_RESIZER_RIGHT_CLS);

      me.leftEl = G(w.el.dom.appendChild(leftEl.dom));
      me.rightEl = G(w.el.dom.appendChild(rightEl.dom));
    },
    /*
     * @param {Object} e
     */
    moveResizeEls(e){
      var me = this,
        w = me.widget,
        cellEl = G(me.cell),
        left = parseInt(cellEl.css('left')),
        minWidth = me.getMinColumnWidth(),
        maxWidth = me.getMaxColumnWidth();

      if(w.header.hideMenu){
        w.header.hideMenu();
      }

      w.el.addCls(GRID_STATE_RESIZE_COLUMN_CLS);
      F.get(document.body).addCls(GRID_STATE_RESIZE_COLUMN_CLS);

      switch (me.activeSide){
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

      if (cellWidth < minWidth){
        cellWidth = minWidth;
      }

      if (maxWidth && cellWidth > maxWidth){
        cellWidth = maxWidth;
      }

      me.deltaWidth = cellEl.width() - cellWidth;

      if (me.moveLeftResizer){
        deltaClientX = clientX - me.clientX;
        cellWidth = cellEl.width() - deltaClientX;

        if (cellWidth < minWidth){
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
    onDocMouseUp(){
      const me = this,
        w = me.widget;

      if (w.startResizing === false){
        return;
      }

      w.el.removeCls(GRID_STATE_RESIZE_COLUMN_CLS);
      F.get(document.body).removeCls(GRID_STATE_RESIZE_COLUMN_CLS);

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

      w.scroller.update();
    },
    /*
     *
     */
    fixSidesWidth(){
      var me = this,
        w = me.widget,
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

      if (cellWidth === undefined){
        return;
      }

      var leftFix = 1;
      if (F.nojQuery){
        leftFix = 0;
      }

      switch (me.activeSide){
        case 'left':
          newCenterWidth = parseInt(centerEl.css('width')) + delta + leftFix;

          if (newCenterWidth < minCenterWidth){
            return;
          }

          column = w.leftColumns[index];

          w.leftColumns[me.columnIndex].width = cellWidth;
          domColumns = w.leftBody.el.select('.' + GRID_COLUMN_CLS);
          domHeaderCells = w.leftHeader.el.select(T_GRID_HEADER_CELL );
          var columnEl = domColumns.item(index);
          columnEl.animate({width: cellWidth}, ANIMATE_DURATION);
          //Bug fix: jQuery add overflow. It causes bad side effect for column cells.
          columnEl.css('overflow', '');

          var i = me.columnIndex + 1,
            iL = domHeaderCells.length,
            _i = 0,
            _iL = i;

          for (; _i < _iL; _i++){
            var domHeaderCell = domHeaderCells.item(_i),
              groupIndex = domHeaderCell.attr('group-index');

            if (groupIndex){
              ignoreGroupIndexes[groupIndex] = true;
            }
          }

          for (; i < iL; i++){
            var domColumnEl = domColumns.item(i),
              domHeaderCell = domHeaderCells.item(i);

            domColumnEl.animate({left: parseInt(domColumnEl.css('left')) - delta - leftFix}, ANIMATE_DURATION);
            if (domHeaderCell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS) && ignoreGroupIndexes[domHeaderCell.attr('index')]){}
            else {
              domHeaderCell.animate({left: parseInt(domHeaderCell.css('left')) - delta - leftFix}, ANIMATE_DURATION);
            }
          }

          leftEl.animate({width: parseInt(leftEl.css('width')) - delta - leftFix}, ANIMATE_DURATION);
          leftHeaderEl.animate({width: parseInt(leftHeaderEl.css('width')) - delta - leftFix + 'px'}, ANIMATE_DURATION);

          if (w.columns.length){
            //Bug fix for dom fx without jQuery
            centerEl.animate({
              left: parseInt(centerEl.css('left')) - delta - leftFix,
              width: newCenterWidth
            }, ANIMATE_DURATION);
            centerHeaderEl.animate({width: parseInt(centerHeaderEl.css('width')) + delta + leftFix}, ANIMATE_DURATION);
            centerBodyEl.animate({width: parseInt(centerBodyEl.css('width')) + delta + leftFix}, ANIMATE_DURATION);
          }
          break;
        case 'center':
          column = w.columns[index];
          w.columns[me.columnIndex].width = cellWidth;
          domColumns = w.body.el.select('.' + GRID_COLUMN_CLS);
          domHeaderCells = w.header.el.select(T_GRID_HEADER_CELL);
          var columnEl = domColumns.item(index);
          columnEl.animate({width: cellWidth}, ANIMATE_DURATION);
          //Bug fix: jQuery add overflow. It causes bad side effect for column cells.
          columnEl.css('overflow', '');

          var i = me.columnIndex + 1,
            iL = domHeaderCells.length,
            _i = 0,
            _iL = i;

          for (; _i < _iL; _i++){
            var domHeaderCell = domHeaderCells.item(_i),
              groupIndex = domHeaderCell.attr('group-index');

            if (groupIndex){
              ignoreGroupIndexes[groupIndex] = true;
            }
          }

          for (; i < iL; i++){
            var domColumnEl = domColumns.item(i),
              domHeaderCell = domHeaderCells.item(i),
              left = parseInt(domColumnEl.css('left')) - delta - leftFix,
              _left = parseInt(domHeaderCell.css('left')) - delta - leftFix;

            if (domHeaderCell.attr('group-index')){
              groupMove[domHeaderCell.attr('group-index')] = {};
            }

            domColumnEl.animate({left: left}, ANIMATE_DURATION);

            if (domHeaderCell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS) && ignoreGroupIndexes[domHeaderCell.attr('index')]){}
            else {
              domHeaderCell.animate({left: _left}, ANIMATE_DURATION);
            }
          }
          break;
        case 'right':
          newCenterWidth = parseInt(centerEl.css('width')) + delta + leftFix;

          if (newCenterWidth < minCenterWidth){
            return;
          }

          column = w.rightColumns[index];

          w.rightColumns[me.columnIndex].width = cellWidth;
          domColumns = w.rightBody.el.select('.' + GRID_COLUMN_CLS);
          domHeaderCells = w.rightHeader.el.select(T_GRID_HEADER_CELL);
          var columnEl = domColumns.item(index);
          columnEl.animate({width: cellWidth + 'px'}, ANIMATE_DURATION);
          //Bug fix: jQuery add overflow. It causes bad side effect for column cells.
          columnEl.css('overflow', '');

          var i = me.columnIndex + 1,
            iL = domHeaderCells.length,
            _i = 0,
            _iL = i;

          for (; _i < _iL; _i++){
            var domHeaderCell = domHeaderCells.item(_i),
              groupIndex = domHeaderCell.attr('group-index');

            if (groupIndex){
              ignoreGroupIndexes[groupIndex] = true;
            }
          }

          for (; i < iL; i++){
            var domColumnEl = domColumns.item(i),
              domHeaderCell = domHeaderCells.item(i);

            domColumnEl.animate({left: parseInt(domColumnEl.css('left')) - delta - leftFix}, ANIMATE_DURATION);

            if (domHeaderCell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS) && ignoreGroupIndexes[domHeaderCell.attr('index')]){}
            else {
              domHeaderCell.animate({left: parseInt(domHeaderCell.css('left')) - delta - leftFix}, ANIMATE_DURATION);
            }
          }

          rightEl.animate({width:  parseInt(rightEl.css('width')) - delta - leftFix}, ANIMATE_DURATION);
          rightHeaderEl.animate({width: parseInt(rightHeaderEl.css('width')) - delta - leftFix + 'px'}, ANIMATE_DURATION);

          if (w.columns.length){
            centerEl.animate({width: newCenterWidth}, ANIMATE_DURATION);
            centerHeaderEl.animate({width: parseInt(centerHeaderEl.css('width')) + delta + leftFix}, ANIMATE_DURATION);
            centerBodyEl.animate({width: parseInt(centerBodyEl.css('width')) + delta + leftFix}, ANIMATE_DURATION);
          }
          break;
      }


      var cellEl = G(me.cell),
        groupName = cellEl.attr('group-index'),
        groupCell;

      cellEl.animate({width: cellWidth + 'px'}, ANIMATE_DURATION);

      if (groupName){
        groupCell = w.el.select("[index='" + groupName + "']");
        groupCell.animate({width: parseInt(groupCell.css('width')) - delta - leftFix}, ANIMATE_DURATION);
      }
      else {
          for (var p in groupMove){
            groupCell = w.el.select("[index='" + p + "']");
            //groupCell.animate({left: parseInt(groupCell.css('left')) - (groupMove[p].delta || 0) - leftFix}, ANIMATE_DURATION);
            groupCell.css('left', parseInt(groupCell.css('left')) - (groupMove[p].delta || 0) - leftFix);
          }
      }

      w.fire('columnresize', {
        cell: cellEl.dom,
        width: cellWidth,
        column,
        side: me.activeSide
      });

      if (/sparkline/.test(column.type)){
        switch (me.activeSide){
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
      else{
        switch(column.type){
          case 'progressbar':
          case 'hbar':
            w.update();
            break;
        }
      }
    },
    /*
     * @param {Object} o
     * @return {Fancy.Element}
     */
    getPrevCell(o){
      var me = this,
        w = me.widget,
        header;

      switch (o.side){
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

      const cell = header.el.select(T_GRID_HEADER_CELL).item(o.index - 1).dom,
        cellEl = F.get(cell);

      if(cellEl.css('display') === 'none' && o.index !== 0){
        o.cell = cell;
        o.index--;
        return me.getPrevCell(o);
      }

      return cell;
    },
    /*
     * @param {Object} o
     * @return {HTMLElement}
     */
    getCell(o){
      var me = this,
        w = me.widget,
        header;

      switch (o.side){
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

      return header.el.select(T_GRID_HEADER_CELL).item(o.index).dom;
    },
    /*
     * @param {String} [side]
     */
    updateColumnsWidth: function(side){
      if(side === 'all'){
        this.updateColumnsWidth('left');
        this.updateColumnsWidth('right');
        this.updateColumnsWidth('center');
        return;
      }

      var leftFix = 1;
      if (F.nojQuery){
        leftFix = 0;
      }

      var me = this,
        w = me.widget,
        side = side || 'center',
        header = w.getHeader(side),
        body = w.getBody(side),
        columns = w.getColumns(side),
        i = 0,
        iL = columns.length,
        columnsWidth = 0,
        leftEl = w.leftEl,
        rightEl = w.rightEl,
        leftHeaderEl = w.leftHeader.el,
        rightHeaderEl = w.rightHeader.el;

      for (; i < iL; i++){
        const column = columns[i];

        if (column.hidden){
          continue;
        }

        columnsWidth += column.width;

        me.setColumnWidth(i, column.width, side);
      }

      if (w.header){
        header.setCellsPosition();
        header.updateCellsSizes();
      }

      body.updateColumnsSizes();

      switch (side){
        case 'center':
          break;
        case 'left':
          var oldLeftElWidth = parseInt(leftEl.css('width')),
            oldHeaderElWidth = parseInt(leftHeaderEl.css('width')),
            delta = oldLeftElWidth - columnsWidth;

          leftEl.animate({width: oldLeftElWidth - delta - leftFix}, ANIMATE_DURATION);
          leftHeaderEl.animate({width: oldHeaderElWidth - delta - leftFix}, ANIMATE_DURATION);

          if (w.columns.length){
            this.updateCenterSideWidth();
          }
          break;
        case 'right':
          var oldRightElWidth = parseInt(leftEl.css('width')),
            oldHeaderElWidth = parseInt(leftHeaderEl.css('width')),
            delta = oldRightElWidth - columnsWidth;

          rightEl.animate({width: oldRightElWidth - delta}, ANIMATE_DURATION);
          rightHeaderEl.animate({width: oldHeaderElWidth - delta}, ANIMATE_DURATION);

          if (w.columns.length){
            this.updateCenterSideWidth();
          }
          break;
      }
    },
    updateCenterSideWidth(){
      var me = this,
        w = me.widget,
        centerEl = w.centerEl,
        centerHeaderEl = w.header.el,
        centerBodyEl = w.body.el,
        leftColumnsWidth = 0,
        rightColumnsWidth = 0,
        leftColumns = w.getColumns('left'),
        rightColumns = w.getColumns('right'),
        centerWidth = w.width;

      if(w.panel){
        centerWidth -= w.panelBodyBorders[1];
        centerWidth -= w.panelBodyBorders[3];
        centerWidth -= w.gridBorders[1];
        centerWidth -= w.gridBorders[3];
      }
      else{
        centerWidth -= w.gridWithoutPanelBorders[1];
        centerWidth -= w.gridWithoutPanelBorders[3];
      }

      var leftFix = 1;
      if (F.nojQuery){
        leftFix = 0;
      }

      F.each(leftColumns, (column) => {
        if (column.hidden){
          return;
        }

        leftColumnsWidth += column.width;
      });

      F.each(rightColumns, (column) => {
        if (column.hidden){
          return;
        }

        rightColumnsWidth += column.width;
      });

      centerWidth -= leftColumnsWidth;
      centerWidth -= rightColumnsWidth;
      centerWidth += leftFix;

      centerEl.animate({
        left: leftColumnsWidth - leftFix,
        width: centerWidth
      }, ANIMATE_DURATION);
      centerEl.animate({width: centerWidth}, ANIMATE_DURATION);
      centerHeaderEl.animate({width: centerWidth}, ANIMATE_DURATION);
      centerBodyEl.animate({width: centerWidth}, ANIMATE_DURATION);
    },
    /*
     * @param {Number} index
     * @param {Number} width
     * @param {String} side
     */
    setColumnWidth(index, width, side = 'center') {
      var me = this,
        w = me.widget,
        columns = w.getColumns(side),
        header,
        body = w.getBody(side),
        columnEl = G(body.getDomColumn(index)),
        headerCellEl;

      if(w.header){
        header = w.getHeader(side);
        headerCellEl = header.getCell(index);
      }

      var columnOldWidth = parseInt(columnEl.css('width'));
      if(columnOldWidth === width){
        return;
      }

      var headerCellElDom;

      if(w.header){
        headerCellElDom = headerCellEl.dom;
      }

      w.fire('columnresize', {
        cell: headerCellElDom,
        width,
        column: columns[index],
        side
      });
    },
    getNextVisibleIndex(index, side){
      var me = this,
        w = me.widget,
        columns = w.getColumns(side),
        i = index + 1,
        iL = columns.length;

      for(;i<iL;i++){
        const column = columns[i];

        if(!column.hidden){
          return i;
        }
      }
    }
  });

})();
