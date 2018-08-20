/*
 * @mixin Fancy.store.mixin.Dirty
 */
Fancy.Mixin('Fancy.store.mixin.Dirty', {
  /*
   *
   */
  initTrackDirty: function(){
    var me = this;

    me.changed = {
      length: 0
    };

    me.removed = {
      length: 0
    };

    me.inserted = {
      length: 0
    };

    me.undoActions = [];
    me.redoActions = [];

    me.on('remove', me.onDirtyRemove, me);
    me.on('set', me.onDirtySet, me);
    me.on('insert', me.onDirtyInsert, me);
  },
  /*
   *
   */
  onDirtySet: function(store, o){
    var me = this,
      id = o.id;

    if(o.key === '$selected'){
      return;
    }

    if(me.changed[id] === undefined){
      me.changed[id] = {
        length: 1
      };
      me.changed.length++;
    }
    else{
      me.changed[id].length++;
    }

    if(me.changed[id][o.key] === undefined){
      me.changed[id][o.key] = {
        originValue: o.oldValue
      };
    }

    me.changed[id][o.key].value = o.value;

    if(me.changed[id][o.key].value === me.changed[id][o.key].originValue){
      delete me.changed[id][o.key];
      me.changed[id].length--;

      var i = 0,
        iL = me.undoActions.length - 1;

      for(;i<=iL;i++){
        var _i = iL - i,
          action = me.undoActions[_i];

        if(action.id === id && o.key === action.key){
          var redoAction = me.undoActions.splice(_i, 1);
          me.redoActions.push(redoAction);
        }
      }
    }
    else{
      if(!me.redoing){
        me.redoActions = [];
      }
      me.undoActions.push({
        id: id,
        type: 'edit',
        key: o.key,
        value: o.value,
        oldValue: o.oldValue
      });
    }

    if(me.changed[id].length === 0){
      delete me.changed[id];
      me.changed.length--;
    }
  },
  /*
   *
   */
  onDirtyRemove: function(store, id, record, rowIndex){
    var me = this;

    me.removed[id] = record.data;
    me.removed.length++;

    if(me.undoStoppped !== true){
      if(!me.redoing){
        me.redoActions = [];
      }
      me.undoActions.push({
        id: id,
        type: 'remove',
        data: record.data,
        rowIndex: rowIndex
      });
    }
  },
  /*
   *
   */
  onDirtyInsert: function(store, o){
    var me = this;

    if(me.treeExpanding){
      return;
    }

    me.inserted[o.id] = o;
    me.inserted.length++;

    if(me.undoStoppped !== true) {
      if(!me.redoing){
        me.redoActions = [];
      }
      me.undoActions.push({
        id: o.id,
        type: 'insert',
        data: o.data
      });
    }
  },
  clearDirty: function () {
    var me = this;

    me.changed = {
      length: 0
    };

    me.removed = {
      length: 0
    };

    me.inserted = {
      length: 0
    };

    me.undoActions = [];
    me.redoActions = [];
  }
});