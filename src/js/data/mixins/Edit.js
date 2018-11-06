/*
 * @mixin Fancy.store.mixin.Edit
 */
Fancy.Mixin('Fancy.store.mixin.Edit', {
  //TODO: too slow for big data, needs redo. Add some map.
  //idSeed: 0,
  /*
   * @param {Object} o
   * @param {Boolean} [fire]
   */
  remove: function(o, fire) {
    var me = this,
      id = o.id,
      index,
      orderIndex,
      itemData;

    switch (Fancy.typeOf(o)) {
      case 'string':
      case 'number':
        id = o;
        break;
      default:
        id = o.id || o.data.id;
    }

    if (me.isTree && me.treeCollapsing !== true) {
      var item = me.getById(id),
        parentItem = me.getById(item.get('parentId'));

      if (item.get('leaf') === false && item.get('expanded')) {
        var _i = item.data.child.length - 1;

        Fancy.each(item.data.child, function (child, i, children) {
          me.remove(children[_i]);
          _i--;
        });
      }

      if (parentItem) {
        Fancy.each(parentItem.data.child, function (child, i) {
          if (child.id === id) {
            parentItem.data.child.splice(i, 1);
            return true;
          }
        });
      }
    }

    if (me.proxyType === 'server' && me.autoSave && me.proxy.api.destroy) {
      if(fire !== false){
        me.proxyCRUD('DESTROY', id);
      }
      return;
    }

    if (o.rowIndex) {
      index = me.dataViewIndexes[o.rowIndex];
      orderIndex = o.rowIndex;
    }
    else {
      index = me.getDataIndex(id);
      orderIndex = me.getRow(id);
      //TODO: absent orderIndex, need to learn where to take it.
      if(index === undefined && orderIndex === undefined){
        return;
      }
    }

    if (me.isTree && me.treeCollapsing && me.filteredData) {
      //TODO:
      var _index;
      Fancy.each(me.data, function (item, i) {
        if(item.data.id === id){
          _index = i;
          return true;
        }
      });

      itemData = me.data.splice(_index, 1)[0];
    }
    else {
      itemData = me.data.splice(index, 1)[0];
    }


    if (me.paging) {
      orderIndex += me.showPage * me.pageSize;
    }

    if (me.order) {
      me.order.splice(orderIndex, 1);
    }

    //SLOW, needs all redo to another approach
    //Almost the same as resorting
    if (me.changeOrderIndexes) {
      me.changeOrderIndexes(index);
    }

    if (me.paging) {
      if (me.showPage !== 0 && me.showPage * me.pageSize === me.getTotal()) {
        me.showPage--;
      }
      me.calcPages();
    }

    delete me.map[id];

    if (!me.treeCollapsing && fire !== false) {
      me.fire('remove', id, itemData, index);
    }

    if(fire !== false) {
      me.changeDataView();
    }
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
   * @param {Boolean} [fire]
   * @return {Fancy.Model}
   */
  insert: function(index, o, fire){
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
      if(fire !== false) {
        me.once('create', me.onCreate, me);
        me.proxyCRUD('CREATE', o);
      }
    }
    else{
      return me.insertItem(o, index, fire);
    }
  },
  /*
   * @param {Object} o
   * @param {Number} index
   * @param {Boolean} fire
   * @return {Fancy.Model}
   */
  insertItem: function(o, index, fire){
    var me = this,
      model = me.model,
      item = new model(o),
      index = me.addIndex;

    if(!me.treeExpanding && fire !== false) {
      me.fire('beforeinsert');
    }

    delete me.addIndex;
    me.data.splice(index, 0, item);

    if(me.order){
      me.order.splice(index, 0, index);
      me.changeOrderIndexes(index, '+');
      me.order[index]--;
    }

    if(fire !== false) {
      me.changeDataView();
    }

    me.map[o.id] = item;
    if(!me.treeExpanding &&  fire !== false) {
      me.fire('insert', item);
    }
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