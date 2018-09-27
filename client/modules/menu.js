(function() {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var MENU_CLS = F.MENU_CLS;
  var MENU_ITEM_CLS = F.MENU_ITEM_CLS;
  var MENU_ITEM_IMAGE_CLS =  F.MENU_ITEM_IMAGE_CLS;
  var MENU_ITEM_TEXT_CLS = F.MENU_ITEM_TEXT_CLS;
  var MENU_ITEM_SIDE_TEXT_CLS = F.MENU_ITEM_SIDE_TEXT_CLS;
  var MENU_ITEM_ACTIVE_CLS = F.MENU_ITEM_ACTIVE_CLS;
  var MENU_ITEM_RIGHT_IMAGE_CLS = F.MENU_ITEM_RIGHT_IMAGE_CLS;
  var MENU_ITEM_EXPAND_CLS = F.MENU_ITEM_EXPAND_CLS;
  var MENU_ITEM_DISABLED_CLS = F.MENU_ITEM_DISABLED_CLS;
  var MENU_ITEM_SEP_CLS = F.MENU_ITEM_SEP_CLS;
  var MENU_ITEM_NO_IMAGE_CLS = F.MENU_ITEM_NO_IMAGE_CLS;

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
    maxHeight: 200,
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

      if(me.height){
        el.css({
          'height': me.height,
          'overflow-y': 'scroll'
        });
      }

      renderTo = Fancy.get(me.renderTo || document.body);

      me.el = renderTo.dom.appendChild(el.dom);
      me.el = Fancy.get(me.el);

      me.renderItems();

      me.fire('afterrender');
      me.fire('render');

      me.rendered = true;

      me.checkHeight();
    },
    /*
     *
     */
    checkHeight: function(){
      var me = this,
        height = parseInt(me.el.css('height'));

      if(height > me.maxHeight){
        me.el.css({
          height: me.maxHeight,
          'overflow-y': 'scroll'
        });
      }
    },
    /*
     * @return {Number}
     */
    getItemsHeight: function () {
      var me = this,
        items = me.items,
        itemHeight = this.itemHeight,
        height = 0,
        i = 0,
        iL = items.length;

      for (; i < iL; i++) {
        var item = items[i];

        if(item.type === 'sep' || item.type === '-' || item === '-'){
          height += 2;
        }
        else {
          height += itemHeight;
        }
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

        if(item === '-'){
          item = {
            type: 'sep'
          };
        }

        var itemEl = Fancy.get(document.createElement('div'));
        itemEl.attr('index', i);

        itemEl.addCls(me.itemCls);
        if(item.type === 'sep'){
          itemEl.addCls(MENU_ITEM_SEP_CLS);
        }
        else{
          itemEl.css('height', me.itemHeight);
        }
        me.el.dom.appendChild(itemEl.dom);
        item.el = itemEl;

        var imageCls = item.imageCls || '';

        if(item.cls){
          itemEl.addCls(item.cls);
        }

        if(item.type !== 'sep' && item.type !== '-') {
          var text = [
            item.image === false ? '' : '<div class="' + MENU_ITEM_IMAGE_CLS + ' ' + imageCls + '"></div>',
            '<div class="' + MENU_ITEM_TEXT_CLS + '"></div>'
          ];

          if(item.sideText){
            text.push('<div class="' + MENU_ITEM_SIDE_TEXT_CLS + '">' + item.sideText + '</div>');
          }

          text.push('<div class="' + MENU_ITEM_RIGHT_IMAGE_CLS + ' ' + (item.items ? MENU_ITEM_EXPAND_CLS : '') + '"></div>');

          itemEl.update(text.join(""));
        }

        if (item.image === false) {
          itemEl.addCls(MENU_ITEM_NO_IMAGE_CLS);
        }

        if(item.disabled === true){
          itemEl.addCls(MENU_ITEM_DISABLED_CLS);
        }

        switch (item.type) {
          case '':
          case '-':
          case 'sep':
            break;
          case 'number':
            me.items[i].field = new Fancy.NumberField({
              label: false,
              theme: me.theme,
              padding: '1px 0px 0px',
              width: 90,
              renderAfter: itemEl.select('.' + MENU_ITEM_IMAGE_CLS).item(0).dom,
              events: me.items[i].events,
              value: item.value || ''
            });
            break;
          case 'string':
            me.items[i].field = new Fancy.StringField({
              label: false,
              theme: me.theme,
              padding: '1px 0px 0px',
              width: 90,
              renderAfter: itemEl.select('.' + MENU_ITEM_IMAGE_CLS).item(0).dom,
              events: me.items[i].events,
              value: item.value || ''
            });
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

      if (item.handler && !item.disabled) {
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
     * @param {Boolean} [checkPostion]
     */
    showAt: function(x, y, checkPostion){
      var me = this;

      me.css('position', 'absolute');
      me.css('left', x);
      me.css('top', y);
      me.css('z-index', 1000 + F.zIndex++);

      me.el.show();

      if(checkPostion !== false){
        me.checkPosition();
      }

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
      var me = this,
        item = me.items[index];

      if(item.type === 'sep' || item === '-' || item.disabled){
        return;
      }

      me.activeItem = item;
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
      var target = e.target;

      if(target.tagName.toLocaleLowerCase() === 'input'){}
      else{
        e.preventDefault();
      }
    },
    /*
     * @param {Number} index
     */
    enableItem: function (index) {
      var me = this,
        item = me.items[index];

      item.el.removeCls(MENU_ITEM_DISABLED_CLS);
      item.disabled = false;
    },
    /*
     * @param {Number} index
     */
    disableItem: function (index) {
      var me = this,
        item = me.items[index];

      item.el.addCls(MENU_ITEM_DISABLED_CLS);
      item.disabled = true;
    },
    /*
     *
     */
    checkPosition: function () {
      var me = this,
        el = me.el,
        offset = el.offset(),
        height = parseInt(el.css('height')),
        width = parseInt(el.css('width')),
        viewSize = F.getViewSize(),
        scroll = F.getScroll(),
        rightBottomPointTop = offset.top + height,
        rightBottomPointLeft = offset.left + width,
        newTop = offset.top,
        newLeft = offset.left,
        scrollingWidth = 20;

      if(rightBottomPointTop > viewSize[0] + scroll[0] - scrollingWidth){
        newTop = offset.top - (rightBottomPointTop - (viewSize[0] + scroll[0])) - scrollingWidth;
      }

      if(rightBottomPointLeft > viewSize[1] + scroll[1] - scrollingWidth){
        if(me.parentMenu){
          var parentLeft = parseInt(me.parentMenu.el.css('left'));

          newLeft = parentLeft - width;
        }
        else{
          newLeft = offset.left - (rightBottomPointLeft - (viewSize[1] + scroll[1])) - scrollingWidth;
        }
      }

      me.showAt(newLeft, newTop, false);
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
 * @class Fancy.grid.plugin.ContextMenu
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var MENU_ITEM_IMG_COPY_CLS = F.MENU_ITEM_IMG_COPY_CLS;
  var MENU_ITEM_IMG_DELETE_CLS = F.MENU_ITEM_IMG_DELETE_CLS;
  var MENU_ITEM_IMG_EDIT_CLS =  F.MENU_ITEM_IMG_EDIT_CLS;

  F.define('Fancy.grid.plugin.ContextMenu', {
    extend: F.Plugin,
    ptype: 'grid.contextmenu',
    inWidgetName: 'contextmenu',
    defaultItems: [
      'copy',
      'copy+',
      'delete',
      '-',
      'export'
    ],
    width: 200,
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
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget;

      w.on('contextmenu', me.onContextMenu, me);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onContextMenu: function (grid, o) {
      var me = this,
        e = o.e;

      e.preventDefault();

      if(!me.menu){
        me.initMenu();
      }

      setTimeout(function (){
        me.showMenu(e, true);
      }, 50);

    },
    initMenu: function () {
      var me = this,
        w = me.widget,
        items = [],
        _items =  me.items || F.Array.copy(me.defaultItems);

      F.each(_items, function (item, i) {
        switch (item){
          case 'copy':
            items.push({
              text: 'Copy',
              sideText: 'CTRL+C',
              imageCls: MENU_ITEM_IMG_COPY_CLS,
              handler: function(){
                w.copy();
              }
            });
            break;
          case 'copyWidthHeader':
          case 'copy+':
            items.push({
              text: 'Copy with Headers',
              imageCls: MENU_ITEM_IMG_COPY_CLS,
              handler: function(){
                w.copy(true);
              }
            });
            break;
          case 'delete':
            items.push({
              text: 'Delete',
              imageCls: MENU_ITEM_IMG_DELETE_CLS,
              handler: function(){
                switch(w.selection.selModel){
                  case 'rows':
                  case 'row':
                    var selection = w.getSelection();
                    w.remove(selection);
                    w.clearSelection();
                    break;
                }
              }
            });
            break;
          case 'edit':
            me.editItemIndex = i;
            items.push({
              text: 'Edit',
              imageCls: MENU_ITEM_IMG_EDIT_CLS,
              disabled: true,
              handler: function(){
                if(w.rowEdit){
                  var activeCell = w.selection.getActiveCell(),
                    side = w.getSideByCell(activeCell),
                    body = w.getBody(side),
                    o = body.getEventParams({
                      currentTarget: activeCell.dom
                    });

                  w.rowedit.edit(o);
                }
              }
            });
            break;
          case 'export':
            items.push({
              text: 'Export',
              items: [{
                text: 'CSV Export',
                handler: function(){
                  w.exportToCSV({
                    header: true
                  });
                }
              },{
                text: 'Excel Export',
                handler: function(){
                  w.exportToExcel({
                    header: true
                  });
                }
              }]
            });
            break;
          default:
            items.push(item);
        }
      });

      me.menu = new Fancy.Menu({
        width: me.width,
        theme: w.theme,
        items: items
      });
    },
    showMenu: function (e, eventPosition) {
      var me = this,
        w = me.widget,
        selection = w.selection,
        listEl = me.menu.el,
        el = Fancy.get(e.target),
        offset = el.offset(),
        top = offset.top + 40,
        left = offset.left;

      if(eventPosition){
        top = e.pageY + 40;
        left = e.pageX;
      }

      listEl.css({
        position: 'absolute',
        top: top,
        left: left
      });

      me.menu.show();

      listEl.animate({
        duration: 200,
        top: top - 20
      });

      if(selection && me.editItemIndex){
        switch(selection.selModel){
          case 'rows':
          case 'row':
            var selected = w.getSelection();

            if(selected.length === 0 || selected.length > 1){
              me.menu.disableItem(me.editItemIndex);
            }
            else{
              me.menu.enableItem(me.editItemIndex);
            }
            break;
        }
      }

      setTimeout(function(){
        Fancy.get(document).once('click', function(e){
          me.hideMenu();
        });
      }, 50);
    },
    hideMenu: function(){
      var me = this;

      setTimeout(function(){
        me.menu.hide();
      }, 50);
    }
  });

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