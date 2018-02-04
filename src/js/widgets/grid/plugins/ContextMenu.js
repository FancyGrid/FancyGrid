/*
 * @class Fancy.grid.plugin.ContextMenu
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  F.define('Fancy.grid.plugin.ContextMenu', {
    extend: F.Plugin,
    ptype: 'grid.contextmenu',
    inWidgetName: 'contextmenu',
    defaultItems: [
      'copy',
      'copy+',
      '-',
      'delete',
      'edit',
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
        w = me.widget,
        docEl = F.get(document);

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
              //sideText: 'CTRL+C',
              imageCls: 'fancy-menu-item-img-copy',
              handler: function(){
                w.copy();
              }
            });
            break;
          case 'copyWidthHeader':
          case 'copy+':
            items.push({
              text: 'Copy with Headers',
              imageCls: 'fancy-menu-item-img-copy',
              handler: function(){
                w.copy(true);
              }
            });
            break;
          case 'delete':
            items.push({
              text: 'Delete',
              imageCls: 'fancy-menu-item-img-delete',
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
              imageCls: 'fancy-menu-item-img-edit',
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
                text: 'Excel Export',
                handler: function(){
                  w.exportToExcel();
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

      if(selection){
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