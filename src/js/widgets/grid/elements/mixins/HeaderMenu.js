/*
 * @mixin Fancy.grid.header.mixin.Menu
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_HEADER_COLUMN_TRIGGERED_CLS = F.GRID_HEADER_COLUMN_TRIGGERED_CLS;
  var GRID_HEADER_CELL_TRIGGER_UP_CLS = F.GRID_HEADER_CELL_TRIGGER_UP_CLS;
  var GRID_HEADER_CELL_TRIGGER_DOWN_CLS = F.GRID_HEADER_CELL_TRIGGER_DOWN_CLS;

  F.Mixin('Fancy.grid.header.mixin.Menu', {
    triggeredColumnCls: GRID_HEADER_COLUMN_TRIGGERED_CLS,
    triggerUpCls: GRID_HEADER_CELL_TRIGGER_UP_CLS,
    triggerDownCls: GRID_HEADER_CELL_TRIGGER_DOWN_CLS,
    /*
     * @param {Object} cell
     * @param {Number} index
     * @param {Object} column
     * @param {Array} columns
     */
    showMenu: function (cell, index, column, columns) {
      var me = this,
        w = me.widget,
        offset = cell.offset();

      if(column.menu && column.menu.rendered){
        if(column.menu.el.css('display') === 'block'){
          me.hideMenu();
          return;
        }
      }

      me.hideMenu();
      cell.addCls(GRID_HEADER_COLUMN_TRIGGERED_CLS);

      if (!column.menu.rendered) {
        column.menu = me.generateMenu(column, columns);
        column.menu = new F.Menu({
          column: column,
          items: column.menu,
          theme: w.theme,
          events: [{
            hide: me.onMenuHide,
            scope: me
          }]
        });
      }
      else {
        if(column.menuColumns !== false){
          me.updateColumnsMenu(column, columns);
        }
      }

      column.menu.showAt(offset.left + parseInt(cell.css('width')) - 26, offset.top + parseInt(cell.css('height')) - 1);

      me.activeMenu = column.menu;
      me.activeCell = cell;
    },
    /*
     *
     */
    hideMenu: function () {
      var me = this,
        w = me.widget,
        header = w.header,
        rightHeader = w.rightHeader,
        leftHeader = w.leftHeader;

      switch (me.side) {
        case 'left':
          if (header.activeMenu) {
            header.activeMenu.hide();
            header.activeCell.removeCls(GRID_HEADER_COLUMN_TRIGGERED_CLS);
            delete header.activeMenu;
            delete header.activeCell;
          }

          if (rightHeader.activeMenu) {
            rightHeader.activeMenu.hide();
            rightHeader.activeCell.removeCls(GRID_HEADER_COLUMN_TRIGGERED_CLS);
            delete rightHeader.activeMenu;
            delete rightHeader.activeCell;
          }
          break;
        case 'center':
          if (leftHeader.activeMenu) {
            leftHeader.activeMenu.hide();
            leftHeader.activeCell.removeCls(GRID_HEADER_COLUMN_TRIGGERED_CLS);
            delete leftHeader.activeMenu;
            delete leftHeader.activeCell;
          }

          if (rightHeader.activeMenu) {
            rightHeader.activeMenu.hide();
            rightHeader.activeCell.removeCls(GRID_HEADER_COLUMN_TRIGGERED_CLS);
            delete rightHeader.activeMenu;
            delete rightHeader.activeCell;
          }
          break;
        case 'right':
          if (leftHeader.activeMenu) {
            leftHeader.activeMenu.hide();
            leftHeader.activeCell.removeCls(GRID_HEADER_COLUMN_TRIGGERED_CLS);
            delete leftHeader.activeMenu;
            delete leftHeader.activeCell;
          }

          if (header.activeMenu) {
            header.activeMenu.hide();
            header.activeCell.removeCls(GRID_HEADER_COLUMN_TRIGGERED_CLS);
            delete header.activeMenu;
            delete header.activeCell;
          }
          break;
      }

      if (me.activeMenu) {
        me.activeMenu.hide();
        me.activeCell.removeCls(GRID_HEADER_COLUMN_TRIGGERED_CLS);
      }

      delete me.activeMenu;
      delete me.activeCell;
    },
    /*
     * @param {Object} column
     * @param {Array} columns
     */
    generateMenu: function (column, columns) {
      var me = this,
        w = me.widget,
        lang = w.lang,
        menu = [],
        cls = column.sortable === false? 'fancy-menu-item-disabled' : '',
        indexOrder,
        menuSortable = column.sortable && column.menuSortable !== false,
        menuLockable = column.lockable !== false && column.menuLockable !== false,
        menuColumns = column.menuColumns !== false,
        i = 0,
        iL = columns.length,
        itemSortAsc = {
          text: lang.sortAsc,
          cls: cls,
          imageCls: GRID_HEADER_CELL_TRIGGER_UP_CLS,
          handler: function () {
            w.sorter.sort('asc', column.index, me.side);
            column.menu.hide();
          }
        },
        itemSortDesc = {
          text: lang.sortDesc,
          cls: cls,
          imageCls: GRID_HEADER_CELL_TRIGGER_DOWN_CLS,
          handler: function () {
            w.sorter.sort('desc', column.index, me.side);
            column.menu.hide();
          }
        },
        itemColumns = {
          text: lang.columns,
          index: 'columns',
          items: me.prepareColumns(columns)
        };

      for (; i < iL; i++) {
        if (column.index === columns[i].index) {
          indexOrder = i;
          break;
        }
      }

      if(column.menu === 'columns'){
        menu = itemColumns.items;
        return menu;
      }

      if(Fancy.isArray(column.menu)){
        F.each(column.menu, function (item) {
          switch (item){
            case '|':
              menu.push('-');
              break;
            case 'sort':
              menu.push(itemSortAsc);
              menu.push(itemSortDesc);
              break;
            case 'columns':
              menu.push(itemColumns);
              break;
            case 'lock':
              switch (me.side) {
                case 'left':
                case 'right':
                  menu.push({
                    text: lang.unlock,
                    handler: function () {
                      column.menu.hide();
                      w.unLockColumn(indexOrder, me.side);
                    }
                  });
                  break;
                case 'center':
                  menu.push({
                    text: lang.lock,
                    handler: function () {
                      column.menu.hide();
                      w.lockColumn(indexOrder, me.side);
                    }
                  });

                  menu.push({
                    text: lang.rightLock,
                    handler: function () {
                      column.menu.hide();
                      w.rightLockColumn(indexOrder, me.side);
                    }
                  });
                  break;
              }
              break;
            default:
              menu.push(item);
          }
        });
      }
      else {
        if (menuSortable) {
          menu.push(itemSortAsc);
          menu.push(itemSortDesc);
          menu.push('-');
        }

        if (menuColumns) {
          menu.push(itemColumns);
        }

        if (menuLockable) {
          switch (me.side) {
            case 'left':
            case 'right':
              if (column.menuColumns !== false) {
                menu.push('-');
              }

              menu.push({
                text: lang.unlock,
                handler: function () {
                  column.menu.hide();
                  w.unLockColumn(indexOrder, me.side);
                }
              });
              break;
            case 'center':
              if (column.menuColumns !== false) {
                menu.push('-');
              }

              menu.push({
                text: lang.lock,
                handler: function () {
                  column.menu.hide();
                  w.lockColumn(indexOrder, me.side);
                }
              });

              menu.push({
                text: lang.rightLock,
                handler: function () {
                  column.menu.hide();
                  w.rightLockColumn(indexOrder, me.side);
                }
              });
              break;
          }
        }
      }

      return menu;
    },
    /*
     * @param {Array} columns
     */
    prepareColumns: function (columns) {
      var me = this,
        w = me.widget,
        _columns = [],
        i = 0,
        iL = columns.length,
        group = [],
        groupName;

      for (; i < iL; i++) {
        var value = true,
          column = columns[i];

        if(column.columnMenu === false){
          continue;
        }

        if (column.hidden) {
          value = false;
        }

        var columnConfig = {
          text: column.title,
          checked: value,
          index: column.index,
          handler: function (menu, item) {
            if (item.checked === true && !item.checkbox.get()) {
              item.checkbox.set(true);
            }

            if (item.checked && menu.el.select('.fancy-checkbox-on').length === 1) {
              item.checkbox.set(true);
              return;
            }

            item.checked = !item.checked;
            item.checkbox.set(item.checked);

            if (item.checked) {
              w.showColumn(me.side, item.index);
            }
            else {
              w.hideColumn(me.side, item.index);
            }

            if(w.responsive){
              w.onWindowResize();
            }
          }
        };

        if (column.grouping) {
          group = group || [];
          group.push(columnConfig);
          groupName = column.grouping;
          continue;
        }
        else if (group.length) {
          _columns.push({
            text: groupName,
            items: group
          });
          groupName = undefined;
          group = [];
        }

        _columns.push(columnConfig);
      }

      if (group.length) {
        _columns.push({
          text: groupName,
          items: group
        });
      }

      return _columns;
    },
    /*
     *
     */
    onMenuHide: function () {
      this.el.select('.' + GRID_HEADER_COLUMN_TRIGGERED_CLS).removeCls(GRID_HEADER_COLUMN_TRIGGERED_CLS);
    },
    /*
     * @param {Object} column
     * @param {Array} columns
     * @param {Boolean} hard
     */
    updateColumnsMenu: function (column, columns, hard) {
      var me = this,
        menu = column.menu,
        columnsMenu,
        i = 0,
        iL = menu.items.length,
        item;

      for (; i < iL; i++) {
        item = menu.items[i];

        if (item.index === 'columns') {
          columnsMenu = item;
          break;
        }
      }

      if(!columnsMenu){
        return;

      }

      i = 0;
      iL = columnsMenu.items.length;
      var rendered = false;

      for (; i < iL; i++) {
        item = columnsMenu.items[i];
        var _column = columns[i];

        if (item.checkbox) {
          item.checkbox.set(!_column.hidden, false);
          rendered = true;
        }
      }

      if (!rendered && !hard) {
        columnsMenu.items = me.prepareColumns(columns);
      }
    },
    /*
     *
     */
    destroyMenus: function () {
      var me = this,
        w = me.widget,
        columns = w.getColumns(me.side),
        i = 0,
        iL = columns.length,
        column;

      for (; i < iL; i++) {
        column = columns[i];

        if (F.isObject(column.menu)) {
          column.menu.destroy();
        }
      }
    }
  });

})();