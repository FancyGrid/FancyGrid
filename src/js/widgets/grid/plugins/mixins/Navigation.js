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
        case key.PAGE_UP:
          //me.keyNavigating = true;
          e.preventDefault();
          me.scrollPageUP();
          break;
        case key.PAGE_DOWN:
          //me.keyNavigating = true;
          e.preventDefault();
          me.scrollPageDOWN();
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
            if(w.rightColumns && w.rightColumns.length){
              info.columnIndex = 0;
              body = w.getBody('right');
              info.side = 'right';
              nextCell = body.getCell(info.rowIndex, info.columnIndex);
            }
            break;
          case 'right':
            return;
        }
      }

      if(!nextCell.dom){
        return;
      }

      switch(info.side){
        case 'left':
          var _column = w.leftColumns[info.columnIndex];

          if(_column.hidden) {
            var i = info.columnIndex,
              iL = w.leftColumns.length,
              foundVisibleColumn = false;

            for(;i<iL;i++){
              _column = w.leftColumns[i];

              if(!_column.hidden){
                foundVisibleColumn = true;
                info.columnIndex = i;
                break;
              }
            }

            if(!foundVisibleColumn){
              info.columnIndex--;
              //TODO for center side
              var i = info.columnIndex,
                iL = w.columns.length,
                foundVisibleColumn = false;

              for(;i<iL;i++){
                _column = w.columns[i];

                if(!_column.hidden){
                  foundVisibleColumn = true;
                  info.columnIndex = i;
                  break;
                }
              }

              if(foundVisibleColumn){
                info.side = 'center';
                body = w.getBody(info.side);
              }
            }

            nextCell = body.getCell(info.rowIndex, info.columnIndex);
          }
          break;
        case 'center':
          //TODO
          var _column = w.columns[info.columnIndex];

          if(_column.hidden) {
            var i = info.columnIndex,
              iL = w.columns.length,
              foundVisibleColumn = false;

            for(;i<iL;i++){
              _column = w.columns[i];

              if(!_column.hidden){
                foundVisibleColumn = true;
                info.columnIndex = i;
                break;
              }
            }

            if(!foundVisibleColumn){
              info.columnIndex--;
              //TODO for right side
            }

            nextCell = body.getCell(info.rowIndex, info.columnIndex);
          }
          break;
        case 'right':
          var _column = w.rightColumns[info.columnIndex];

          if(_column.hidden) {
            var i = info.columnIndex,
              iL = w.rightColumns.length,
              foundVisibleColumn = false;

            for(;i<iL;i++){
              _column = w.rightColumns[i];

              if(!_column.hidden){
                foundVisibleColumn = true;
                info.columnIndex = i;
                break;
              }
            }

            if(!foundVisibleColumn){
              info.columnIndex--;
            }

            nextCell = body.getCell(info.rowIndex, info.columnIndex);
          }
          break;
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
        nextCell,
        side;

      info.columnIndex--;

      if (info.columnIndex < 0) {
        switch (info.side) {
          case 'left':
            return;
          case 'center':
            if (w.leftColumns && w.leftColumns.length) {
              info.columnIndex = w.leftColumns.length - 1;
              body = w.getBody('left');
              info.side = 'left';
              nextCell = body.getCell(info.rowIndex, info.columnIndex);

              var _column = w.leftColumns[info.columnIndex];
              if(_column.hidden){
                var i = info.columnIndex - 1,
                  foundVisibleColumn = false;

                for(;i>=0;i--){
                  _column = w.leftColumns[i];

                  if(!_column.hidden){
                    foundVisibleColumn = true;
                    info.columnIndex = i;
                    break;
                  }
                }
              }

              nextCell = body.getCell(info.rowIndex, info.columnIndex);
            }
            else{
              return;
            }
            break;
          case 'right':
            if (w.columns && w.columns.length) {
              info.columnIndex = w.columns.length - 1;
              body = w.getBody('center');
              info.side = 'center';
              nextCell = body.getCell(info.rowIndex, info.columnIndex);
            }
            break;
        }
      }
      else {
        switch (info.side) {
          case 'left':
            var _column = w.leftColumns[info.columnIndex];

            if(_column.hidden){
              var i = info.columnIndex - 1,
                foundVisibleColumn = false;

              for(;i>=0;i--){
                _column = w.leftColumns[i];

                if(!_column.hidden){
                  foundVisibleColumn = true;
                  info.columnIndex = i;
                  break;
                }
              }

              if(!foundVisibleColumn){
                info.columnIndex++;
              }
            }
            break;
          case 'center':
            var _column = w.columns[info.columnIndex];

            if(_column.hidden){
              var i = info.columnIndex - 1,
                foundVisibleColumn = false;

              for(;i>=0;i--){
                _column = w.columns[i];

                if(!_column.hidden){
                  foundVisibleColumn = true;
                  info.columnIndex = i;
                  break;
                }
              }

              if(!foundVisibleColumn){
                info.columnIndex++;

                if(w.leftColumns){
                  var i = w.leftColumns.length - 1,
                    foundVisibleColumn = false;

                  for(;i>=0;i--){
                    _column = w.leftColumns[i];

                    if(!_column.hidden){
                      foundVisibleColumn = true;
                      info.columnIndex = i;
                      break;
                    }
                  }

                  if(foundVisibleColumn){
                    side = 'left';
                    body = w.getBody(side);
                  }
                }
              }
            }
            break;
          case 'right':
            var _column = w.rightColumns[info.columnIndex];

            if(_column.hidden){
              var i = info.columnIndex - 1,
                foundVisibleColumn = false;

              for(;i>=0;i--){
                _column = w.rightColumns[i];

                if(!_column.hidden){
                  foundVisibleColumn = true;
                  info.columnIndex = i;
                  break;
                }
              }

              if(!foundVisibleColumn){
                info.columnIndex++;
                //TODO for center side

                var i = w.columns.length - 1,
                  foundVisibleColumn = false;

                side = 'center';
                body = w.getBody(side);

                for(;i>=0;i--){
                  _column = w.columns[i];

                  if(!_column.hidden){
                    foundVisibleColumn = true;
                    info.columnIndex = i;
                    break;
                  }
                }
              }
            }
            break;
        }
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
          if(me.selModel === 'rows'){
            me.updateHeaderCheckBox();
          }
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
          if(me.selModel === 'rows'){
            me.updateHeaderCheckBox();
          }
          break;
      }
    },
    /*
     *
     */
    scrollPageUP: function () {
      var me = this,
        w = me.widget,
        bodyHeight = parseInt(w.body.el.height()),
        scroller = w.scroller,
        newScroll = scroller.scrollTop - bodyHeight;

      if(newScroll < 0){
        newScroll = 0;
      }

      w.scroll(newScroll);
    },
    /*
     *
     */
    scrollPageDOWN: function () {
      var me = this,
        w = me.widget,
        gridBorders = w.gridBorders,
        bodyViewHeight = w.getBodyHeight() - gridBorders[0] - gridBorders[2],
        viewHeight = w.getCellsViewHeight() - gridBorders[0] - gridBorders[2],
        scroller = w.scroller,
        newScroll = scroller.scrollTop + bodyViewHeight;

      if(newScroll > viewHeight - bodyViewHeight){
        newScroll = viewHeight - bodyViewHeight;
      }

      if(newScroll < 0){
        newScroll = 0;
      }

      w.scroll(newScroll);
    }
  });

})();