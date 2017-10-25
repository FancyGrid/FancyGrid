/*
 * @mixin Fancy.grid.mixin.ActionColumn
 */
Fancy.Mixin('Fancy.grid.mixin.ActionColumn', {
  /*
   *
   */
  initActionColumnHandler: function(){
    var me = this;

    me.on('cellclick', me.onCellClickColumnAction, me);
  },
  /*
   * @param {Object} grid
   * @param {Object} o
   */
  onCellClickColumnAction: function(grid, o){
    var me = this,
      column = o.column,
      activeItem,
      columnItems = column.items,
      item;

    if(column.type !== 'action'){
      return;
    }

    activeItem = me.getActiveActionColumnItem(o);

    if(columnItems && activeItem !== undefined){
      item = columnItems[activeItem];
      if(item.handler){
        item.handler(me, o);
      }
    }
  },
  /*
   * @param {Object} o
   * @return {Number}
   */
  getActiveActionColumnItem: function(o){
    var cell = Fancy.get(o.cell),
      target = o.e.target,
      actionEls = cell.select('.' + Fancy.GRID_COLUMN_ACTION_ITEM_CLS),
      i = 0,
      iL = actionEls.length;

    for(;i<iL;i++){
      if(actionEls.item(i).within(target)){
        return i;
      }
    }
  }
});