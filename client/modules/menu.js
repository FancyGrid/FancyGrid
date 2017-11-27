(function() {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var MENU_CLS = F.MENU_CLS;
  var MENU_ITEM_CLS = F.MENU_ITEM_CLS;
  var MENU_ITEM_IMAGE_CLS =  F.MENU_ITEM_IMAGE_CLS;
  var MENU_ITEM_TEXT_CLS = F.MENU_ITEM_TEXT_CLS;
  var MENU_ITEM_ACTIVE_CLS = F.MENU_ITEM_ACTIVE_CLS;
  var MENU_ITEM_RIGHT_IMAGE_CLS = F.MENU_ITEM_RIGHT_IMAGE_CLS;
  var MENU_ITEM_EXPAND_CLS = F.MENU_ITEM_EXPAND_CLS;

  /**
   * @class Fancy.Menu
   * @extends Fancy.Widget
   */
  Fancy.define('Fancy.Menu', {
    extend: Fancy.Widget,
    /*
     * @constructor
     * @param {Object} config
     * @param {Object} scope
     */
    constructor: function (config, scope) {
      Fancy.applyConfig(this, config);
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents('hide');
      me.Super('init', arguments);

      me.applyDefaults();
      me.render();
      me.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        el = me.el;

      el.on('mousedown', me.onItemMouseDown, me, '.' + MENU_ITEM_CLS);
      el.on('click', me.onItemClick, me, '.' + MENU_ITEM_CLS);
      el.on('mouseenter', me.onItemEnter, me, '.' + MENU_ITEM_CLS);
      el.on('mouseleave', me.onItemLeave, me, '.' + MENU_ITEM_CLS);
    },
    widgetCls: MENU_CLS,
    itemCls: MENU_ITEM_CLS,
    itemImageCls: MENU_ITEM_IMAGE_CLS,
    cls: '',
    extraCls: '',
    width: 142,
    itemHeight: 30,
    rendered: false,
    theme: 'default',
    render: function(){
      var me = this,
        renderTo,
        el = Fancy.get(document.createElement('div'));

      me.fire('beforerender');

      if( me.theme !== 'default' ){
        el.addCls('fancy-theme-' + me.theme);
      }

      el.addClass(
        Fancy.cls,
        me.widgetCls,
        me.cls,
        me.extraCls
    );

      el.css({
        width: me.width,
        height: me.getItemsHeight()
      });

      renderTo = Fancy.get(me.renderTo || document.body);

      me.el = renderTo.dom.appendChild(el.dom);
      me.el = Fancy.get(me.el);

      me.renderItems();

      me.fire('afterrender');
      me.fire('render');

      me.rendered = true;
    },
    /*
     * @return {Number}
     */
    getItemsHeight: function () {
      var height = 0,
        i = 0,
        iL = this.items.length;

      for (; i < iL; i++) {
        height += this.itemHeight;
      }

      return height;
    },
    /*
     *
     */
    renderItems: function () {
      var me = this,
        i = 0,
        iL = me.items.length,
        item;

      for(; i < iL; i++){
        item = me.items[i];
        var itemEl = Fancy.get(document.createElement('div'));
        itemEl.attr('index', i);

        itemEl.addCls(me.itemCls);
        itemEl.css('height', me.itemHeight);
        me.el.dom.appendChild(itemEl.dom);
        item.el = itemEl;

        var imageCls = item.imageCls || '';

        if(item.cls){
          itemEl.addCls(item.cls);
        }

        itemEl.update([
          item.image === false ? '' : '<div class="'+MENU_ITEM_IMAGE_CLS+' ' + imageCls + '"></div>',
          '<div class="' + MENU_ITEM_TEXT_CLS + '"></div>',
          '<div class="'+MENU_ITEM_RIGHT_IMAGE_CLS+' ' + (item.items ? MENU_ITEM_EXPAND_CLS : '') + '"></div>'
        ].join(""));

        if (item.image === false) {
          itemEl.addCls('fancy-menu-item-no-image');
        }

        switch (item.type) {
          case '':
            break;
          default:
            itemEl.select('.' + MENU_ITEM_TEXT_CLS).item(0).update(item.text || '');
        }

        if(item.checked !== undefined){
          me.items[i].checkbox = new Fancy.CheckBox({
            label: false,
            theme: me.theme,
            padding: '1px 8px 0px',
            renderTo: itemEl.select('.' + MENU_ITEM_IMAGE_CLS).item(0).dom,
            value: item.checked
          });
        }
      }
    },
    /*
     *
     */
    applyDefaults: function () {
      var me = this,
        i = 0,
        iL = me.items.length;

      if (!me.defaults) {
        return;
      }

      for (; i < iL; i++) {
        Fancy.applyIf(me.items[i], me.defaults);
      }
    },
    /*
     * @param {Object} e
     */
    onItemClick: function (e) {
      var me = this,
        target = Fancy.get(e.currentTarget),
        index = target.attr('index'),
        item = me.items[index],
        args = [me, item];

      if (item.handler) {
        if (item.scope) {
          item.handler.apply(item.scope, args);
        }
        else {
          item.handler(me, item);
        }
      }
    },
    /*
     * @param {Object} e
     */
    onItemEnter: function (e) {
      var me = this,
        target = Fancy.get(e.currentTarget),
        index = target.attr('index'),
        item = me.items[index],
        offset = target.offset();

      if(me.shownSubMenu){
        me.shownSubMenu.hide();
      }

      me.deActivateItem();
      me.activateItem(index);

      if(item.items){
        if(!item.menu){
          var itemConfig = me.items[index];

          Fancy.apply(itemConfig, {
            parentItem: item,
            parentMenu: me,
            defaults: item.defaults,
            items: item.items,
            theme: me.theme
          });

          me.items[index].menu = new Fancy.Menu(itemConfig);
        }

        item.menu.showAt(offset.left + parseInt(target.width()), offset.top);

        me.shownSubMenu = item.menu;
      }
    },
    /*
     * @param {Object} e
     */
    onItemLeave: function (e) {},
    /*
     * @param {Number} x
     * @param {Number} y
     */
    showAt: function(x, y){
      var me = this;

      me.css('position', 'absolute');
      me.css('left', x);
      me.css('top', y);

      me.el.show();

      if(me.parentMenu){
        return;
      }

      Fancy.MenuManager.add(me);
    },
    /*
     *
     */
    hide: function () {
      var me = this;

      me.el.hide();
      me.deActivateItem();

      if(me.shownSubMenu){
        me.shownSubMenu.hide();
      }

      me.fire('hide');
    },
    /*
     *
     */
    hideAll: function(){
      var parentMenu = this.parentMenu;

      if(parentMenu && parentMenu.el.css('display') !== 'none'){
        parentMenu.hide();
      }

      this.hide();
    },
    /*
     * @param {Number} index
     */
    activateItem: function (index) {
      var item = this.items[index];

      this.activeItem = item;
      item.el.addCls(MENU_ITEM_ACTIVE_CLS);
    },
    /*
     *
     */
    deActivateItem: function () {
      var activeItem = this.activeItem;

      if (!activeItem) {
        return;
      }

      activeItem.el.removeClass(MENU_ITEM_ACTIVE_CLS);
      delete this.activeItem;
    },
    /*
     * @param {Object} e
     */
    onItemMouseDown: function(e) {
      e.preventDefault();
    }
  });

  Fancy.define('Fancy.MenuManager', {
    singleton: true,
    inited: false,
    constructor: function(){},
    /*
     *
     */
    init: function(){
      var docEl = Fancy.get(document);

      docEl.on('click', this.onDocClick, this);
    },
    /*
     * @param {Object} menu
     */
    add: function(menu){
      var me = this;

      if(!me.inited){
        me.init();
      }

      me.activeMenu = menu;
    },
    /*
     * @param {Object} e
     */
    onDocClick: function(e){
      var me = this,
        target = Fancy.get(e.target),
        maxDepth = 10,
        parentEl = target;

      if(!me.activeMenu){
        return;
      }

      while(maxDepth > 0){
        if( !parentEl.dom ){
          break;
        }

        if( parentEl.hasCls(MENU_CLS) ){
          return;
        }

        parentEl = parentEl.parent();
        maxDepth--;
      }

      me.activeMenu.hide();
      delete me.activeMenu;
    }
  })

})();/*
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
        me.updateColumnsMenu(column, columns);
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
        cls = '',
        indexOrder,
        i = 0,
        iL = columns.length;

      for (; i < iL; i++) {
        if (column.index === columns[i].index) {
          indexOrder = i;
          break;
        }
      }

      if (column.sortable === false) {
        cls = 'fancy-menu-item-disabled';
      }

      if (column.sortable) {
        menu.push({
          text: lang.sortAsc,
          cls: cls,
          imageCls: GRID_HEADER_CELL_TRIGGER_UP_CLS,
          handler: function () {
            w.sorter.sort('asc', column.index, me.side);
            column.menu.hide();
          }
        });

        menu.push({
          text: lang.sortDesc,
          cls: cls,
          imageCls: GRID_HEADER_CELL_TRIGGER_DOWN_CLS,
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

      switch (me.side) {
        case 'left':
        case 'right':
          if (column.lockable !== false) {
            menu.push({
              text: lang.unlock,
              handler: function () {
                column.menu.hide();
                w.unLockColumn(indexOrder, me.side);
              }
            });
          }
          break;
        case 'center':
          if (columns.length > 1 && (w.leftColumns.length) && column.lockable !== false) {
            menu.push({
              text: lang.lock,
              handler: function () {
                column.menu.hide();
                w.lockColumn(indexOrder, me.side);
              }
            });
          }

          if (columns.length > 1 && w.rightColumns.length && column.lockable !== false) {
            menu.push({
              text: lang.rightLock,
              handler: function () {
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