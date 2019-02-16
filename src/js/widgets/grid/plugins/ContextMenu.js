/*
 * @class Fancy.grid.plugin.ContextMenu
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var MENU_ITEM_IMG_COPY_CLS = F.MENU_ITEM_IMG_COPY_CLS;
  var MENU_ITEM_IMG_DELETE_CLS = F.MENU_ITEM_IMG_DELETE_CLS;
  var MENU_ITEM_IMG_DUPLICATE_CLS = F.MENU_ITEM_IMG_DUPLICATE_CLS;
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
    constructor: function () {
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
        var type = item,
          _item = {};

        if(item.type){
          type = item.type;
          F.apply(_item, item);
        }

        switch (type){
          case 'copy':
            F.applyIf(_item, {
              text: 'Copy',
              sideText: 'CTRL+C',
              imageCls: MENU_ITEM_IMG_COPY_CLS,
              handler: function(){
                w.copy();
              }
            });

            items.push(_item);
            break;
          case 'copyWidthHeader':
          case 'copy+':
            F.applyIf(_item, {
              text: 'Copy with Headers',
              imageCls: MENU_ITEM_IMG_COPY_CLS,
              handler: function(){
                w.copy(true);
              }
            });

            items.push(_item);
            break;
          case 'delete':
            F.applyIf(_item, {
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

            items.push(_item);
            break;
          case 'edit':
            me.editItemIndex = i;
            F.applyIf(_item, {
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

            items.push(_item);
            break;
          case 'export':
            F.applyIf(_item, {
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

            items.push(_item);
            break;
          case 'duplicate':
            F.applyIf(_item, {
              text: 'Duplicate',
              imageCls: MENU_ITEM_IMG_DUPLICATE_CLS,
              handler: function(){
                switch(w.selection.selModel){
                  case 'rows':
                  case 'row':
                    var selection = w.getSelection(),
                      data = [],
                      rowIndex;

                    if(!selection.length){
                      return;
                    }

                    rowIndex = w.getRowById(selection[selection.length - 1].id) + 1;

                    F.each(selection, function (item) {
                      var _item = F.Object.copy(item);
                      _item.id = F.id(null, 'TEMP-');
                      data.push(_item);
                    });

                    w.insert(rowIndex, data);

                    F.each(data, function (item) {
                      var rowIndex = w.getRowById(item.id);

                      w.flashRow(rowIndex);
                    });
                    break;
                }
              }
            });

            items.push(_item);
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

      me.menu.css('z-index', 1000 + F.zIndex++);

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

})();