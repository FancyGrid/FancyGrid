(function(){
  //SHORTCUTS
  const F = Fancy;
  let renderInt;

  const COLUMNS_PROPERTIES_FN = {
    title: function (grid, value, order, side) {
      grid.setColumnTitle(order, value, side);
    },
    width: function (grid, value, order, side) {
      grid.setColumnWidth(order, value, side);
    },
    hidden: function (grid, value, order, side, id) {
      if (value) {
        grid.hideColumn(id);
      } else {
        grid.showColumn(id);
      }
    },
    render: function (grid, value, order, side, id) {
      clearInterval(renderInt);

      var column = grid.getColumnById(id);
      column.render = value;

      renderInt = setTimeout(function () {
        grid.update();
      }, 1);
    }
  };

  /*
   * @class Fancy.grid.plugin.RefreshColumn
   */
  F.define('Fancy.grid.plugin.RefreshColumn', {
    extend: F.Plugin,
    ptype: 'grid.refreshcolumns',
    inWidgetName: 'refreshcolumns',
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function(){
      this.Super('const', arguments);
    },
    /*
     * @param {Array} newColumns
     */
    setColumns(newColumns){
      const me = this,
        w = me.widget;

      me.applyChanges(newColumns);

      newColumns = w.prepareConfigColumnsWidth({
        columns: newColumns,
        width: w.width
      }).columns;

      newColumns = w.prepareConfigColumns({
        columns: newColumns
      }, false).columns;

      me.setColumnsByOrder(newColumns);

      if(w.filter){
        clearInterval(w.intFilterFieldsUpdate);

        w.intFilterFieldsUpdate = setTimeout(() => {
          delete w.intFilterFieldsUpdate;
          w.filter.updateFields();
        }, F.ANIMATE_DURATION);
      }
    },
    applyChanges(newColumns){
      const me = this,
        newColumnsIds = {},
        newColumnsWithoutIds = [];

      F.each(newColumns, (column) => {
        if(column.id){
          newColumnsIds[column.id] = column;
        }
        else if(column.index){
          newColumnsIds[column.index] = column;
        }
        else{
          newColumnsWithoutIds.push(column);
        }
      });

      me.setChangesByIds(newColumnsIds);
      me.setChangesWithoutIds(newColumnsWithoutIds);
      me.setChangesToNotCheckedColumns(newColumns);
    },
    /*
     *
     */
    setChangesByIds(newColumnsIds){
      const me = this,
        w = me.widget,
        currentColumns = w.getColumns();

      // Check missed columns by id-s and indexes
      F.each(currentColumns, (column) => {
        if(column.id && !/col-id-/.test(column.id) && !newColumnsIds[column.id]){
          w.removeColumn(column.id);
        }
      });

      for(const id in newColumnsIds){
        const currentColumn = w.getColumnById(id),
          info = w.getColumnOrderById(id),
          newColumn = newColumnsIds[id];

        if(!currentColumn){
          continue;
        }

        for(const p in COLUMNS_PROPERTIES_FN){
          if(newColumn[p] !== undefined && currentColumn[p] !== newColumn[p]){
            COLUMNS_PROPERTIES_FN[p](w, newColumn[p], info.order, info.side, id);
          }
        }

        newColumn.$checked = true;
        currentColumn.$checked = true;
      }
    },
    /*
     * @param {Array} newColumns
     */
    setChangesWithoutIds(newColumns){
      const me = this,
        w = me.widget,
        columns = w.getColumns();

      F.each(newColumns, (newColumn) => {
        if(newColumn.render){
          const equalRenders = [],
            renderStr = newColumn.render.toString();

          F.each(columns, (currentColumn) => {
            if(currentColumn.render && renderStr === currentColumn.render.toString()){
              equalRenders.push(currentColumn);
            }
          });

          if(equalRenders.length === 1){
            const currentColumn = equalRenders[0],
              info = w.getColumnOrderById(currentColumn.id);

            for(const p in COLUMNS_PROPERTIES_FN){
              if(newColumn[p] !== undefined && currentColumn[p] !== newColumn[p]){
                COLUMNS_PROPERTIES_FN[p](w, newColumn[p], info.order, info.side, currentColumn.id);
              }
            }

            newColumn.$checked = true;
            currentColumn.$checked = true;
          }
        }
      });
    },
    /*
     * @param {Array} newColumns
     */
    setChangesToNotCheckedColumns(newColumns){
      var me = this,
        w = me.widget,
        columns = w.getColumns(),
        notCheckedColumns = [],
        types = {},
        newTypes = {};

      F.each(columns, (column) => {
        if(!column.$checked){
          notCheckedColumns.push(column);
          types[column.type] = types[column.type] || [];
          types[column.type].push(column);
        }
      });

      F.each(newColumns, (column) => {
        if(!column.$checked){
          newTypes[column.type] = newTypes[column.type] || [];
          newTypes[column.type].push(column);
        }
      });

      for(var type in types){
        var columnsOfType = types[type];
        F.each(columnsOfType, (column) => {
          var newColumnsOfType = newTypes[type];

          F.each(newColumnsOfType, (newColumn) => {
            var equalProperties = true;
            for(const p in newColumn){
              if(newColumn[p] !== column[p]){
                equalProperties = false;
                break;
              }
            }

            if(equalProperties){
              newColumnsOfType.$checked = true;
              column.$checked = true;
            }
          });
        });
      }

      notCheckedColumns = [];
      F.each(columns, column => {
        if (!column.$checked) {
          notCheckedColumns.push(column);
        }
      });

      F.each(notCheckedColumns, column => w.removeColumn(column.id));

      F.each(newColumns, column => {
        delete column.$checked;
      });

      F.each(columns, column => {
        delete column.$checked;
      });
    },
    /*
     * @param {Array} newColumns
     */
    setColumnsByOrder(newColumns){
      const me = this,
        newLeftColumns = [],
        newRightColumns = [],
        newCenterColumns = [];

      F.each(newColumns, column => {
        if (column.locked) {
          newLeftColumns.push(column);
        }
        else if(column.rightLocked) {
          newRightColumns.push(column);
        }
        else{
          newCenterColumns.push(column);
        }
      });

      me.setColumnsByOrderInSide(newCenterColumns, 'center');
      me.setColumnsByOrderInSide(newLeftColumns, 'left');
      me.setColumnsByOrderInSide(newRightColumns, 'right');
    },
    /*
     * @param {Array} newColumns
     * @param {String} side
     */
    setColumnsByOrderInSide(newColumns, side){
      const me = this,
        w = me.widget,
        columns = w.getColumns(side);

      F.each(newColumns, (newColumn, i) => {
        var isColumnEqualToCurrent = true,
          column = columns[i];

        if(column !== undefined){
          for(const p in newColumn){
            if(newColumn.id !== undefined && newColumn.id === column.id){
              break;
            }

            switch(p){
              case 'width':
              case 'hidden':
                continue;
            }

            if(newColumn[p] !== column[p]){
              isColumnEqualToCurrent = false;
              break;
            }
          }
        }
        else{
          isColumnEqualToCurrent = false;
        }

        if(!isColumnEqualToCurrent){
          if(column && column.index === newColumn.index){
            w.removeColumn(column.id);
            w.addColumn(newColumn, side, i, false);
          }
          else if(!newColumn.id){
            const _column = w.getColumnByIndex(newColumn.index);

            if(_column){
              w.removeColumn(_column.id);
            }

            w.addColumn(newColumn, side, i, false);
          }
        }
      });
    }
  });

})();
