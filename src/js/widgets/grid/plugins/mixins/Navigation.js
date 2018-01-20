/*
 * @class Fancy.grid.selection.mixin.Navigation
 * TODO: write realization for key navigation
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  /*
   * CONSTANTS
   */
  var GRID_CELL_ACTIVE_CLS = F.GRID_CELL_ACTIVE_CLS;
  var GRID_CELL_SELECTED_CLS = F.GRID_CELL_SELECTED_CLS;

  F.Mixin('Fancy.grid.selection.mixin.Navigation', {
    /*
     *
     */
    initNavigation: function () {
      this.addEvents('up', 'down', 'left', 'right');
      this.onsNav();
    },
    /*
     *
     */
    onsNav: function () {
      var me = this,
        doc = Fancy.get(document);

      doc.on('keydown', me.onKeyDown, me);
    },
    /*
     * @param {Object} e
     */
    onKeyDown: function (e) {
      var me = this,
        w = me.widget,
        keyCode = e.keyCode,
        key = Fancy.key;

      if(w.activated === false){
        return;
      }

      if(!me.keyNavigating){
        var docEl = F.get(document);

        docEl.once('keyup', function () {
          delete me.keyNavigating;
        });
      }

      switch (keyCode) {
        case key.TAB:
          break;
        case key.UP:
          me.keyNavigating = true;
          e.preventDefault();
          me.moveUp();
          break;
        case key.DOWN:
          me.keyNavigating = true;
          e.preventDefault();
          me.moveDown();
          break;
        case key.LEFT:
          me.keyNavigating = true;
          e.preventDefault();
          me.moveLeft();
          break;
        case key.RIGHT:
          me.keyNavigating = true;
          e.preventDefault();
          me.moveRight();
          break;
      }
    },
    moveRight: function () {
      var me = this,
        w = me.widget,
        info = me.getActiveCellInfo(),
        body = w.getBody(info.side),
        nextCell;

      info.columnIndex++;
      nextCell = body.getCell(info.rowIndex, info.columnIndex);

      if(!nextCell.dom){
        switch(info.side){
          case 'left':
            if(w.columns){
              info.columnIndex = 0;
              body = w.getBody('center');
              info.side = 'center';
              nextCell = body.getCell(info.rowIndex, info.columnIndex);
            }
            break;
          case 'center':
            if(w.rightColumns){
              info.columnIndex = 0;
              body = w.getBody('right');
              info.side = 'right';
              nextCell = body.getCell(info.rowIndex, info.columnIndex);
            }
            break;
          case 'right':
            return;
            break;
        }
      }

      if(!nextCell.dom){
        return;
      }

      switch(me.selModel){
        case 'cell':
        case 'cells':
          me.clearSelection();
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
        case 'column':
        case 'columns':
          me.clearSelection();
          me.selectColumn(info.columnIndex, info.side);
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
      }
    },
    moveLeft: function () {
      var me = this,
        w = me.widget,
        info = me.getActiveCellInfo(),
        body = w.getBody(info.side),
        nextCell;

      info.columnIndex--;

      if (info.columnIndex < 0) {
        switch (info.side) {
          case 'left':
            return;
            break;
          case 'center':
            if (w.leftColumns) {
              info.columnIndex = w.leftColumns.length - 1;
              body = w.getBody('left');
              info.side = 'left';
              nextCell = body.getCell(info.rowIndex, info.columnIndex);
            }
            break;
          case 'right':
            if (w.columns) {
              info.columnIndex = w.columns.length - 1;
              body = w.getBody('center');
              info.side = 'center';
              nextCell = body.getCell(info.rowIndex, info.columnIndex);
            }
            break;
        }
      }
      else {
        nextCell = body.getCell(info.rowIndex, info.columnIndex);
      }

      if(!nextCell.dom){
        return;
      }

      switch(me.selModel){
        case 'cell':
        case 'cells':
          me.clearSelection();
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
        case 'column':
        case 'columns':
          me.clearSelection();
          me.selectColumn(info.columnIndex, info.side);
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
      }
    },
    moveUp: function () {
      var me = this,
        w = me.widget,
        info = me.getActiveCellInfo(),
        body = w.getBody(info.side),
        nextCell;

      info.rowIndex--;
      if(info.rowIndex < 0){
        return;
      }
      nextCell = body.getCell(info.rowIndex, info.columnIndex);

      if(!nextCell.dom){
        return;
      }

      switch(me.selModel){
        case 'cell':
        case 'cells':
          me.clearSelection();
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
        case 'row':
        case 'rows':
          me.clearSelection();
          me.selectRow(info.rowIndex);
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
      }
    },
    moveDown: function () {
      var me = this,
        w = me.widget,
        info = me.getActiveCellInfo(),
        body = w.getBody(info.side),
        nextCell;

      info.rowIndex++;
      nextCell = body.getCell(info.rowIndex, info.columnIndex);

      if(!nextCell.dom){
        return;
      }

      switch(me.selModel){
        case 'cell':
        case 'cells':
          me.clearSelection();
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
        case 'row':
        case 'rows':
          me.clearSelection();
          me.selectRow(info.rowIndex);
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
      }
    }
  });

})();