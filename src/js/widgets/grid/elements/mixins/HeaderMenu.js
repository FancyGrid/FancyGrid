/*
 * @mixin Fancy.grid.header.mixin.Menu
 */
Fancy.Mixin('Fancy.grid.header.mixin.Menu', {
  triggeredColumnCls: 'fancy-grid-header-column-triggered',
  triggerUpCls: 'fancy-grid-header-cell-trigger-up',
  triggerDownCls: 'fancy-grid-header-cell-trigger-down',
  /*
   * @param {Object} cell
   * @param {Number} index
   * @param {Object} column
   * @param {Array} columns
   */
  showMenu: function(cell, index, column, columns){
    var me = this,
      w = me.widget,
      offset = cell.offset();

    me.hideMenu();
    cell.addCls(me.triggeredColumnCls);
    
    if(!column.menu.rendered){
      column.menu = me.generateMenu(column, columns);
      column.menu = new Fancy.Menu({
        column: column,
        items: column.menu,
        theme: w.theme,
        events: [{
          hide: me.onMenuHide,
          scope: me
        }]
      });
    }
    else{
      me.updateColumnsMenu(column, columns);
    }

    column.menu.showAt(offset.left + parseInt(cell.css('width')) - 26, offset.top + parseInt(cell.css('height')) - 1);

    me.activeMenu = column.menu;
    me.activeCell = cell;
  },
  /*
   *
   */
  hideMenu: function(){
    var me = this,
      w = me.widget,
      triggeredColumnCls = me.triggeredColumnCls;

    switch(me.side){
      case 'left':
        if(w.header.activeMenu){
          w.header.activeMenu.hide();
          w.header.activeCell.removeCls(triggeredColumnCls);
          delete w.header.activeMenu;
          delete w.header.activeCell;
        }

        if(w.rightHeader.activeMenu){
          w.rightHeader.activeMenu.hide();
          w.rightHeader.activeCell.removeCls(triggeredColumnCls);
          delete w.rightHeader.activeMenu;
          delete w.rightHeader.activeCell;
        }
        break;
      case 'center':
        if(w.leftHeader.activeMenu){
          w.leftHeader.activeMenu.hide();
          w.leftHeader.activeCell.removeCls(triggeredColumnCls);
          delete w.leftHeader.activeMenu;
          delete w.leftHeader.activeCell;
        }

        if(w.rightHeader.activeMenu){
          w.rightHeader.activeMenu.hide();
          w.rightHeader.activeCell.removeCls(triggeredColumnCls);
          delete w.rightHeader.activeMenu;
          delete w.rightHeader.activeCell;
        }
        break;
      case 'right':
        if(w.leftHeader.activeMenu){
          w.leftHeader.activeMenu.hide();
          w.leftHeader.activeCell.removeCls(triggeredColumnCls);
          delete w.leftHeader.activeMenu;
          delete w.leftHeader.activeCell;
        }

        if(w.header.activeMenu){
          w.header.activeMenu.hide();
          w.header.activeCell.removeCls(triggeredColumnCls);
          delete w.header.activeMenu;
          delete w.header.activeCell;
        }
        break;
    }

    if(me.activeMenu){
      me.activeMenu.hide();
      me.activeCell.removeCls(triggeredColumnCls);
    }

    delete me.activeMenu;
    delete me.activeCell;
  },
  /*
   * @param {Object} column
   * @param {Array} columns
   */
  generateMenu: function(column, columns){
    var me = this,
      w = me.widget,
      lang = w.lang,
      menu = [],
      cls = '',
      indexOrder,
      i = 0,
      iL = columns.length;

    for(;i<iL;i++){
      if(column.index === columns[i].index){
        indexOrder = i;
        break;
      }
    }

    if(column.sortable === false){
      cls = 'fancy-menu-item-disabled';
    }

    if(column.sortable){
      menu.push({
        text: lang.sortAsc,
        cls: cls,
        imageCls: me.triggerUpCls,
        handler: function () {
          w.sorter.sort('asc', column.index, me.side);
          column.menu.hide();
        }
      });

      menu.push({
        text: lang.sortDesc,
        cls: cls,
        imageCls: w.triggerDownCls,
        handler: function () {
          w.sorter.sort('desc', column.index, me.side);
          column.menu.hide();
        }
      });
    }

    menu.push({
      text: lang.columns,
      index: 'columns',
      items: me.prepareColumns(columns)
    });

    switch(me.side){
      case 'left':
      case 'right':
        if(column.lockable !== false) {
          menu.push({
            text: 'Unlock',
            handler: function () {
              column.menu.hide();
              w.unLockColumn(indexOrder, me.side);
            }
          });
        }
        break;
      case 'center':
        if(columns.length > 1 && (w.leftColumns.length) && column.lockable !== false){
          menu.push({
            text: 'Lock',
            handler: function(){
              column.menu.hide();
              w.lockColumn(indexOrder, me.side);
            }
          });
        }

        if(columns.length > 1 && w.rightColumns.length && column.lockable !== false){
          menu.push({
            text: 'Right Lock',
            handler: function(){
              column.menu.hide();
              w.rightLockColumn(indexOrder, me.side);
            }
          });
        }
        break;
    }

    return menu;
  },
  /*
   * @param {Array} columns
   */
  prepareColumns: function(columns) {
    var me = this,
      w = me.widget,
      _columns = [],
      i = 0,
      iL = columns.length,
      group = [],
      groupName;

    for(;i<iL;i++){
      var value = true,
        column = columns[i];

      if(column.hidden){
        value = false;
      }

      var columnConfig = {
        text: column.title,
        checked: value,
        index: column.index,
        handler: function(menu, item){
          if(item.checked === true && !item.checkbox.get()){
            item.checkbox.set(true);
          }

          if(item.checked && menu.el.select('.fancy-checkbox-on').length === 1){
            item.checkbox.set(true);
            return;
          }

          item.checked = !item.checked;
          item.checkbox.set(item.checked);

          if(item.checked){
            w.showColumn(me.side, item.index);
          }
          else{
            w.hideColumn(me.side, item.index);
          }
        }
      };

      if(column.grouping){
        group = group || [];
        group.push(columnConfig);
        groupName = column.grouping;
        continue;
      }
      else if(group.length){
        _columns.push({
          text: groupName,
          items: group
        });
        groupName = undefined;
        group = [];
      }

      _columns.push(columnConfig);
    }

    if(group.length){
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
  onMenuHide: function(){
    var me = this,
      triggerCls = me.triggeredColumnCls;

    me.el.select('.'+triggerCls).removeCls(triggerCls);
  },
  /*
   * @param {Object} column
   * @param {Array} columns
   * @param {Boolean} hard
   */
  updateColumnsMenu: function(column, columns, hard){
    var me = this,
      menu = column.menu,
      columnsMenu,
      i = 0,
      iL = menu.items.length,
      item;

    for(;i<iL;i++){
      item = menu.items[i];

      if(item.index === 'columns'){
        columnsMenu = item;
        break;
      }
    }

    i = 0;
    iL = columnsMenu.items.length;
    var rendered = false;

    for(;i<iL;i++){
      item = columnsMenu.items[i];
      var _column = columns[i];

      if(item.checkbox){
        item.checkbox.set(!_column.hidden, false);
        rendered = true;
      }
    }

    if(!rendered && !hard){
      columnsMenu.items = me.prepareColumns(columns);
    }
  },
  /*
   *
   */
  destroyMenus: function(){
    var me = this,
      w = me.widget,
      columns = w.getColumns(me.side),
      i = 0,
      iL = columns.length,
      column;

    for(;i<iL;i++){
      column = columns[i];

      if(Fancy.isObject(column.menu)){
        column.menu.destroy();
      }
    }
  }
});