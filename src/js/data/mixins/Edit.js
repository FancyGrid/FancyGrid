/*
 * @mixin Fancy.store.mixin.Edit
 */
Fancy.Mixin('Fancy.store.mixin.Edit', {
  //TODO: too slow for big data, needs redo. Add some map.
  //idSeed: 0,
  /*
   * @param {Object} o
   */
  remove: function(o){
    var me = this,
      id = o.id,
      index,
      orderIndex,
      itemData;

    switch(Fancy.typeOf(o)){
      case 'string':
      case 'number':
        id = o;
        break;
      default:
        id = o.id || o.data.id;
    }

    if(me.isTree && me.treeCollapsing !== true){
      var item = me.getById(id),
        parentItem = me.getById(item.get('parentId'));

      if(item.get('leaf') === false && item.get('expanded')){
        var _i = item.data.child.length - 1;

        Fancy.each(item.data.child, function (child, i, children) {
          me.remove(children[_i]);
          _i--;
        });
      }

      if(parentItem){
        Fancy.each(parentItem.data.child, function (child, i) {
          if(child.id === id){
            parentItem.data.child.splice(i, 1);
            return true;
          }
        });
      }
    }

    if(me.proxyType === 'server' && me.autoSave && me.proxy.api.destroy){
      me.proxyCRUD('DESTROY', id);
      return;
    }

    if(o.rowIndex){
      index = me.dataViewIndexes[o.rowIndex];
      orderIndex = o.rowIndex;
    }
    else{
      //index = o.$index;
      index = me.getDataIndex(id);
      orderIndex = me.getRow(id);
      //TODO: absent orderIndex, need to learn where to take it.
    }

    itemData = me.data.splice(index, 1)[0];

    if(me.paging){
      orderIndex += me.showPage * me.pageSize;
    }

    if(me.order){
      me.order.splice(orderIndex, 1);
    }

    //SLOW, needs all redo to another approach
    //Almost the same as resorting
    if(me.changeOrderIndexes){
      me.changeOrderIndexes(index);
    }

    if(me.paging){
      if(me.showPage !== 0 && me.showPage * me.pageSize === me.getTotal()){
        me.showPage--;
      }
      me.calcPages();
    }

    delete me.map[id];

    me.fire('remove', id, itemData, index);
    me.changeDataView();
  },
  /*
   * @param {Number} index
   */
  removeAt: function(index){
    //NOT FINISHED!!!
    var me = this;

    me.remove({
      rowIndex: index,
      id: me.getId(index)
    });
  },
  /*
   *
   */
  removeAll: function () {
    var me = this;

    me.data = [];
    me.dataView = [];
    delete me.order;

    if(me.paging){
      me.showPage = 0;
      me.calcPages();
    }

    if(me.filters){
      delete me.filters;
      delete me.filteredData;
      delete me.filterOrder;
    }
  },
  /*
   * @param {Object} o
   * @return {Fancy.Model}
   */
  add: function(o){
    var me = this;

    return me.insert(me.getTotal(), o);
  },
  /*
   * @param {Number} index
   * @param {Object} o
   * @return {Fancy.Model}
   */
  insert: function(index, o){
    var me = this;

    //Bug fix for empty data on start with grouping
    if(me.grouping && !me.bugFixGrouping){
      me.defineModel(o, true);
      me.bugFixGrouping = true;
    }

    me.addIndex = index;

    if(o.id === undefined){
      Fancy.idSeed++;
      var id = Fancy.idSeed + 1000;
      if(me.proxyType === 'server'){
        o.id = 'Temp-' + id;
      }
      else {
        o.id = id;
      }
    }

    if(me.getById(o.id)){
      me.remove(o.id);
    }

    if(me.proxyType === 'server' && me.autoSave && me.proxy.api.create){
      me.once('create', me.onCreate, me);
      me.proxyCRUD('CREATE', o);
    }
    else{
      return me.insertItem(o, index);
    }
  },
  /*
   * @param {Object} o
   * @return {Fancy.Model}
   */
  insertItem: function(o){
    var me = this,
      model = me.model,
      item = new model(o),
      index = me.addIndex;

    me.fire('beforeinsert');

    delete me.addIndex;
    item.$index = index;
    me.data.splice(index, 0, item);

    if(me.order){
      me.order.splice(index, 0, index);
      me.changeOrderIndexes(index, '+');
      me.order[index]--;
    }

    me.changeDataView();
    me.map[o.id] = item;
    me.fire('insert', item);
    return item;
  },
  /*
   * @param {Object} store
   * @param {Object} o
   */
  onCreate: function(store, o){
    return this.insertItem(o);
  }
});