/*
 * @mixin Fancy.grid.mixin.Edit
 */
Fancy.Mixin('Fancy.grid.mixin.Edit', {
  /*
   * @param {*} o
   * @param {Boolean} [at]
   * @param {Boolean} [fire]
   */
  remove: function(o, at, fire){
    var me = this,
      store = me.store,
      method = 'remove';

    if(!me.store){
      setTimeout(function(){
        me.remove(o, at)
      }, 100);
      return;
    }

    if(at){
      method = 'removeAt';
    }

    if(Fancy.isArray(o)){
      var i = 0,
        iL = o.length;

      for(;i<iL;i++){
        store[method](o[i], fire);
      }
    }
    else{
      store[method](o);
    }

    if(fire !== false){
      me.setSidesHeight();
    }
  },
  /*
   * @param {*} o
   */
  removeAt: function(o){
    this.remove(o, true);
  },
  /*
   * @param {Number} row
   */
  removeRow: function(row){
    this.remove(row, true);
  },
  /*
   * @param {*} id
   */
  removeRowById: function(id){
    this.remove(id);
  },
  /*
   * @param {*} id
   */
  removeRowByID: function(id){
    this.remove(id);
  },
  /*
   *
   */
  removeAll: function () {
    var me = this;

    me.store.removeAll();
    me.update();
    me.scroller.update();

    if(me.paging){
      me.paging.updateBar();
    }

    if(me.grouping){
      me.grouping.reGroup();
    }
  },
  /*
   * @param {*} o
   */
  add: function(o){
    var me = this;

    if(!me.store){
      setTimeout(function(){
        me.add(o)
      }, 100);
      return;
    }

    if(Fancy.isArray(o)){
      var i = 0,
        iL = o.length;

      for(;i<iL;i++){
        me.add(o[i]);
      }

      return;
    }

    me.store.add(o);
    me.setSidesHeight();
  },
  /*
   * @param {Number} index
   * @param {Object} o
   * @param {Boolean} fire
   */
  insert: function(index, o, fire){
    var me = this,
      s = me.store;

    if(!me.store){
      setTimeout(function(){
        me.insert(index, o, fire)
      }, 100);
      return;
    }

    if(Fancy.isArray(o)){
      var i = o.length - 1;

      for(;i !== -1;i--){
        me.insert(o[i], index, fire);
      }

      if(fire !== false){
        me.setSidesHeight();
      }
      return;
    }
    else if(Fancy.isArray(index)){
      var i = index.length - 1;

      for(;i !== -1;i--){
        me.insert(index[i], 0, fire);
      }

      if(fire !== false){
        me.setSidesHeight();
      }
      return;
    }
    else if(Fancy.isObject(index) && o === undefined){
      o = index;
      index = 0;
    }
    else if(Fancy.isObject(index) && Fancy.isNumber(o)){
      var _index = o;
      o = index;
      index = _index;
    }

    if(me.paging && s.proxyType !== 'server'){
      index += s.showPage * s.pageSize;
    }

    s.insert(index, o, fire);
    if(fire !== false){
      me.setSidesHeight();
    }
  },
  /*
   * @param {Number} rowIndex
   * @param {String} key
   * @param {*} value
   */
  set: function(rowIndex, key, value){
    var me = this,
      s = me.store;

    if(!me.store){
      setTimeout(function(){
        me.set(rowIndex, key, value)
      }, 100);
      return;
    }

    if(Fancy.isObject(key) && value === undefined){
      s.setItemData(rowIndex, key, value);
    }
    else {
      s.set(rowIndex, key, value);
    }
  },
  /*
   * @param {Number} rowIndex
   * @param {String} key
   * @param {*} value
   * @return {Number}
   */
  setById: function(id, key, value){
    var me = this,
      s = me.store,
      rowIndex = s.getRow(id);

    if(rowIndex === undefined){
      var item = s.getById(id);

      if(item === undefined){
        return false;
      }

      rowIndex = -1;
    }

    if(!me.store){
      setTimeout(function(){
        if(rowIndex === -1){
          me.setById(rowIndex, key, value)
        }
        else{
          me.set(rowIndex, key, value)
        }
      }, 100);
      return rowIndex;
    }

    if(Fancy.isObject(key) && value === undefined){
      for(var p in key){
        var column = me.getColumnByIndex(p);

        if(column && column.type === 'date'){
          var format = column.format,
            newDate = Fancy.Date.parse(key[p], format.read, format.mode),
            oldDate = Fancy.Date.parse(s.getById(id).get(p), format.edit, format.mode);

          if(+newDate === +oldDate){
            delete key[p];
          }
        }

        s.setItemData(rowIndex, key, value, id);

        if(rowIndex === -1){
          s.getById(id).set(key);
        }
      }
    }
    else {
      s.set(rowIndex, key, value, id);

      if(rowIndex === -1){
        s.getById(id).set(key, value);
      }
    }

    return rowIndex;
  },
  /*
   * TODO: undo by id and key
   */
  undo: function () {
    var me = this,
      s = me.store,
      action = s.undoActions.splice(s.undoActions.length - 1, 1)[0];

    switch(action.type){
      case 'edit':
        me.setById(action.id, action.key, action.oldValue);
        var value = action.value;
        action.value = action.oldValue;
        action.oldValue = value;
        s.redoActions.push(action);
        me.fire('undo');
        break;
      case 'insert':
        s.undoStoppped = true;
        me.remove(action.id);
        s.undoStoppped = false;
        s.redoActions.push(action);
        break;
      case 'remove':
        s.undoStoppped = true;
        me.insert(action.rowIndex, action.data);
        s.undoStoppped = false;
        s.redoActions.push(action);
        break;
    }
  },
  /*
   *
   */
  redo: function () {
    var me = this,
      s = me.store,
      action = s.redoActions.splice(s.redoActions.length - 1, 1)[0];

    s.redoing = true;
    switch(action.type){
      case 'edit':
        me.setById(action.id, action.key, action.oldValue);
        break;
      case 'insert':
        me.insert(action.rowIndex, action.data);
        break;
      case 'remove':
        me.remove(action.id);
        break;
    }

    delete s.redoing;
  },
  /*
   *
   */
  undoAll: function () {
    var me = this,
      s = me.store,
      i = 0,
      iL = s.undoActions.length;

    for(;i<iL;i++){
      me.undo();
    }
  }
});