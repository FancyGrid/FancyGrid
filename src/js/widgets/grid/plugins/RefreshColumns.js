(function(){
  //SHORTCUTS
  var F = Fancy;
  var renderInt;

  var COLUMNS_PROPERTIES_FN = {
    title: function(grid, value, order, side){
      grid.setColumnTitle(order, value, side);
    },
    width: function(grid, value, order, side){
      grid.setColumnWidth(order, value, side);
    },
    hidden: function(grid, value, order, side, id){
      if(value){
        grid.hideColumn(id);
      }
      else{
        grid.showColumn(id);
      }
    },
    render: function(grid, value, order, side, id){
      clearInterval(renderInt);
      var column = grid.getColumnById(id);
      column.render = value;

      renderInt = setTimeout(function(){
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
    setColumns: function(newColumns){
      var me = this,
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
    },
    applyChanges: function(newColumns){
      var me = this,
        newColumnsIds = {},
        newColumnsWithoutIds = [];

      F.each(newColumns, function(column){
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
    setChangesByIds: function(newColumnsIds){
      var me = this,
        w = me.widget,
        currentColumns = w.getColumns();

      // Check missed columns by id-s and indexes
      F.each(currentColumns, function(column){
        if(column.id && !/col-id-/.test(column.id) && !newColumnsIds[column.id]){
          w.removeColumn(column.id);
        }
      });

      for(var id in newColumnsIds){
        var currentColumn = w.getColumnById(id),
          info = w.getColumnOrderById(id),
          newColumn = newColumnsIds[id];

        if(!currentColumn){
          continue;
        }

        for(var p in COLUMNS_PROPERTIES_FN){
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
    setChangesWithoutIds: function(newColumns){
      var me = this,
        w = me.widget,
        columns = w.getColumns();

      F.each(newColumns, function(newColumn){
        if(newColumn.render){
          var equalRenders = [],
            renderStr = newColumn.render.toString();

          F.each(columns, function(currentColumn){
            if(currentColumn.render && renderStr === currentColumn.render.toString()){
              equalRenders.push(currentColumn);
            }
          });

          if(equalRenders.length === 1){
            var currentColumn = equalRenders[0],
              info = w.getColumnOrderById(currentColumn.id);

            for(var p in COLUMNS_PROPERTIES_FN){
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
    setChangesToNotCheckedColumns: function(newColumns){
      var me = this,
        w = me.widget,
        columns = w.getColumns(),
        notCheckedColumns = [],
        types = {},
        newTypes = {};

      F.each(columns, function(column){
        if(!column.$checked){
          notCheckedColumns.push(column);
          types[column.type] = types[column.type] || [];
          types[column.type].push(column);
        }
      });

      F.each(newColumns, function(column){
        if(!column.$checked){
          newTypes[column.type] = newTypes[column.type] || [];
          newTypes[column.type].push(column);
        }
      });

      for(var type in types){
        var columnsOfType = types[type];
        F.each(columnsOfType, function(column){
          var newColumnsOfType = newTypes[type];

          F.each(newColumnsOfType, function(newColumn){
            var equalProperties = true;
            for(var p in newColumn){
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
      F.each(columns, function(column){
        if(!column.$checked){
          notCheckedColumns.push(column);
        }
      });

      F.each(notCheckedColumns, function(column){
        w.removeColumn(column.id);
      });

      F.each(newColumns, function(column){
        delete column.$checked;
      });

      F.each(columns, function(column){
        delete column.$checked;
      });
    },
    /*
     * @param {Array} newColumns
     */
    setColumnsByOrder: function(newColumns){
      var me = this,
        newLeftColumns = [],
        newRightColumns = [],
        newCenterColumns = [];

      F.each(newColumns, function(column){
        if(column.locked){
          newLeftColumns.push(column);
        }
        else if(column.rightLocked){
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
    setColumnsByOrderInSide: function(newColumns, side){
      var me = this,
        w = me.widget,
        columns = w.getColumns(side);

      F.each(newColumns, function(newColumn, i){
        var isColumnEqualToCurrent = true,
          column = columns[i];

        if(column !== undefined){
          for(var p in newColumn){
            if(newColumn.id !== undefined && newColumn.id === column.id){
              break;
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
          w.addColumn(newColumn, side, i, false);
        }
      });
    }
  });

})();