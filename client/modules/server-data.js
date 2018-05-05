/*
 * @mixin Fancy.store.mixin.Proxy
 */
Fancy.Mixin('Fancy.store.mixin.Proxy', {
  pageParam: 'page',
  startParam: 'start',
  limitParam: 'limit',
  sortParam: 'sort',
  directionParam: 'dir',
  keyParam: 'key',
  valueParam: 'value',
  filterParam: 'filter',
  autoLoad: true,
  autoSave: true,
  saveOrder: ['create', 'update', 'destroy'],
  batch: true,
  filterOperators: {
    '<': 'lt',
    '>': 'gt',
    '<=': 'lteq',
    '>=': 'gteq',
    '=': 'eq',
    '==': 'eq',
    '===': 'stricteq',
    '!=': 'noteq',
    '!==': 'notstricteq',
    '': 'like',
    '*': 'likeor',
    '|': 'or'
  },
  loadedTimes: 0,
  /*
   *
   */
  initProxy: function(){
    var me = this;

    me.proxy = me.data.proxy || {};
    var proxy = me.proxy;
    if(proxy.autoLoad !== undefined){
      me.autoLoad = proxy.autoLoad;
    }

    if(proxy.autoSave !== undefined){
      me.autoSave = proxy.autoSave;
    }

    if(proxy.batch !== undefined){
      me.batch = proxy.batch;
    }

    me.initReader();
    me.initWriter();
    if(me.proxy.type === 'rest'){
      me.initRest();
    }
    else {
      me.initServerAPI();
      me.initActionMethods();
      me.checkProxy();
    }

    if(me.autoLoad) {
      me.loadData();
    }
  },
  /*
   *
   */
  checkProxy: function(){
    var me = this,
      proxy = me.proxy;

    if(proxy.api.read === undefined){
      throw new Error('[FancyGrid Error] - in data proxy there is not url');
    }
  },
  /*
   * used only in Fancy.store.mixin.Rest
   */
  checkUrl: function(){
    var me = this,
      proxy = me.proxy;

    if(proxy.url === undefined){
      throw new Error('[FancyGrid Error] - in data proxy there is not url');
    }
  },
  /*
   *
   */
  initServerAPI: function(){
    var me = this,
      proxy = me.proxy;

    proxy.api = proxy.api || {};

    if(proxy.url){
      proxy.api.read = proxy.url;
    }

    if(proxy.api.update || proxy.api.read || proxy.api.create && proxy.api.destroy){
      //IDEA: maybe crudType
      me.proxyType = 'server';
    }
  },
  /*
   *
   */
  initActionMethods: function(){
    var me = this,
      proxy = me.proxy,
      methods = proxy.methods || {},
      method = proxy.method || 'GET';

    methods.create = methods.create || method;
    methods.read = methods.read || method;
    methods.update = methods.update || method;
    methods.destroy = methods.destroy || method;

    proxy.methods = methods;
  },
  /*
   *
   */
  loadData: function(){
    var me = this,
      proxy = me.proxy,
      params = {},
      headers = proxy.headers || {};

    Fancy.apply(params, me.params);
    Fancy.applyIf(params, proxy.params);

    me.fire('beforeload');
    //IDEA: sortType === 'server'
    //IDEA: remoteSort
    //IDEA: remotePaging

    if(me.pageType === 'server'){
      params[me.pageParam] = me.showPage;
      params[me.limitParam] = me.pageSize;
      params[me.startParam] = me.showPage * me.pageSize;
    }

    me.loading = true;

    Fancy.Ajax({
      url: proxy.api.read,
      method: proxy.methods.read,
      params: params,
      getJSON: true,
      headers: headers,
      success: function(o, status, request){
        me.loadedTimes++;
        me.loading = false;
        me.defineModel(o[me.readerRootProperty]);

        if(me.widget.isTreeData){
          me.data = o[me.readerRootProperty];
          me.initTreeData();

          me.widget.setSidesHeight();

          me.fire('change');
          me.fire('load');

          me.fire('serversuccess', o, request);
          return;
        }

        if(me.paging) {
          me.processPagingData(o);
        }
        else {
          me.setData(o[me.readerRootProperty]);
          me.widget.setSidesHeight();
        }
        me.fire('change');
        me.fire('load');

        me.fire('serversuccess', o, request);
      },
      error: function (request, errorTitle, errorMessage) {
        me.fire('servererror', errorTitle, errorMessage, request);
      }
    });
  },
  /*
   * @param {String} type
   * @param {String} id
   * @param {String} key
   * @param {*} value
   */
  proxyCRUD: function(type, id, key, value){
    var me = this;

    switch(type){
      case 'UPDATE':
        me.proxyServerUpdate(id, key, value);
        break;
      case 'DESTROY':
        me.proxyServerDestroy(id, key);
        break;
      case 'CREATE':
        me.proxyServerCreate(id, key);
        break;
    }
  },
  /*
   * @param {String} id
   * @param {String} key
   * @param {*} value
   */
  proxyServerUpdate: function(id, key, value){
    var me = this,
      proxy = me.proxy,
      params = {},
      sendJSON = me.writerType === 'json';

    Fancy.apply(params, me.params);
    Fancy.applyIf(params, proxy.params);

    if(!proxy.api.update){
      return;
    }

    if(sendJSON){
      if(Fancy.isArray(id) && key === undefined && value === undefined){
        params = id;
      }
      else {
        params = me.prepareWriterJSONParams(id, key, value);
      }
    }
    else{
      params.id = id;
      params[me.keyParam] = key;
      params[me.valueParam] = value;
      params.action = 'update';
    }

    me.loading = true;

    me.fire('beforeupdate', id, key, value);

    Fancy.Ajax({
      url: proxy.api.update,
      method: proxy.methods.update,
      params: params,
      sendJSON: sendJSON,
      success: function(o, status, request){
        me.loading = false;

        me.fire('update', id, key, value);
        me.fire('serversuccess', o, request);
      },
      error: function (request, errorTitle, errorMessage) {
        me.fire('servererror', errorTitle, errorMessage, request);
      }
    });
  },
  /*
   * @param {String} id
   * @param {*} data
   */
  proxyServerDestroy: function(id, data){
    var me = this,
      proxy = me.proxy,
      params = {},
      sendJSON = me.writerType === 'json' || me.autoSave === false;

    Fancy.apply(params, me.params);
    Fancy.applyIf(params, proxy.params);

    if(sendJSON && Fancy.isArray(id)){
      params = id;
    }
    else if(data){
      params = data;
    }
    else {
      params.id = id;
    }

    me.loading = true;

    me.fire('beforedestroy');

    Fancy.Ajax({
      url: proxy.api.destroy,
      method: proxy.methods.destroy,
      params: params,
      sendJSON: sendJSON,
      success: function(o, status, request){
        me.loading = false;

        me.fire('destroy', id, o);
        me.fire('serversuccess', o, request);
      },
      error: function (request, errorTitle, errorMessage) {
        me.fire('servererror', errorTitle, errorMessage, request);
      }
    });
  },
  /*
   * @param {String} id
   * @param {*} data
   */
  proxyServerCreate: function(id, data){
    var me = this,
      proxy = me.proxy,
      params = {},
      sendJSON = me.writerType === 'json' || me.autoSave === false;

    Fancy.apply(params, me.params);
    Fancy.applyIf(params, proxy.params);

    if(sendJSON && Fancy.isArray(id)){
      params = id;
    }
    else if(data){
      params = data;
    }
    else {
      params.id = id;
      if(params.id === undefined){
        delete params.id;
      }
    }

    me.loading = true;

    me.fire('beforecreate');

    Fancy.Ajax({
      url: proxy.api.create,
      method: proxy.methods.create,
      params: params,
      sendJSON: sendJSON,
      success: function(o, status, request){
        me.loading = false;

        if(Fancy.isObject(o.data) && String(id) !== String(o.data.id)){
          me.changeItemId(id, o.data.id);
        }
        else if(Fancy.isArray(o.data)){
          var i = 0,
            iL = id.length;

          for(;i<iL;i++){
            if(String(id[i].id) !== String(o.data[i].id)) {
              me.changeItemId(String(id[i].id), String(o.data[i].id));
            }
          }
        }

        me.fire('create', o.data);
        me.fire('serversuccess', o, request);
      },
      error: function (request, errorTitle, errorMessage) {
        me.fire('servererror', errorTitle, errorMessage, request);
      }
    });
  },
  /*
   *
   */
  save: function(){
    var me = this,
      removed = me.removed,
      changed = me.changed,
      inserted = me.inserted,
      i = 0,
      iL = me.saveOrder.length;

    for(;i<iL;i++){
      switch(me.saveOrder[i]){
        case 'create':
          me.saveInsertActions(inserted);
          break;
        case 'update':
          me.saveChangeActions(changed);
          break;
        case 'destroy':
          me.saveRemoveActions(removed);
          break;
      }
    }

    me.changed = {
      length: 0
    };

    me.removed = {
      length: 0
    };

    me.inserted = {
      length: 0
    };
  },
  /*
   * @param {Array} actions
   */
  saveChangeActions: function(actions){
    var me = this;

    if(!actions.length){
      return;
    }

    if(me.batch){
      var data = [];

      for(var p in actions){
        if(p === 'length'){
          continue;
        }

        var action = actions[p],
          itemData = {id: p};

        if(me.writeAllFields){
          itemData = me.getById(p).data;
        }
        else {
          for (var q in action) {
            if(q === 'length'){
              continue;
            }
            itemData[q] = action[q].value;
          }
        }

        data.push(itemData);
      }

      if(data.length === 1){
        data = data[0];
        me.proxyCRUD('UPDATE', data.id, data);
      }
      else {
        me.proxyCRUD('UPDATE', data);
      }
    }
    else {
      for(var p in actions){
        if(p === 'length'){
          continue;
        }

        var action = actions[p],
          data = {};

        if(me.writeAllFields){
          data = me.getById(p).data;
        }
        else {
          for (var q in action) {
            if(q === 'length'){
              continue;
            }

            data[q] = {id: action.id};
          }
        }

        me.proxyCRUD('UPDATE', p, data);
      }
    }
  },
  /*
   * @param {Array} actions
   */
  saveRemoveActions: function(actions){
    var me = this;

    if(actions.length === 0){
      return;
    }

    if(me.batch){
      var data = [];

      for(var p in actions){
        if(p === 'length'){
          continue;
        }

        var action = actions[p],
          itemData = {id: p};

        if(me.writeAllFields){
          itemData = me.getById(p).data;
        }
        else {
          for (var q in action) {
            if(q === 'length'){
              continue;
            }

            itemData = {
              id: action.id
            };
          }
        }

        data.push(itemData);
      }

      if(data.length === 1){
        data = data[0];
        me.proxyCRUD('DESTROY', data.id, data);
      }
      else {
        me.proxyCRUD('DESTROY', data);
      }
    }
    else{
      for(var p in actions){
        if(p === 'length'){
          continue;
        }

        var action = actions[p],
          data = {};

        if(me.writeAllFields){
          data = action;
        }
        else {
          for (var q in action) {
            if(q === 'length'){
              continue;
            }

            data[q] = action[q].value;
          }
        }

        me.proxyCRUD('DESTROY', p, data);
      }
    }
  },
  /*
   * @param {Array} actions
   */
  saveInsertActions: function(actions){
    var me = this;

    if(actions.length === 0){
      return;
    }

    if(me.batch){
      var data = [];

      for(var p in actions){
        if(p === 'length'){
          continue;
        }

        var action = actions[p],
          itemData = {id: p};

        if(me.writeAllFields){
          itemData = me.getById(p).data;
        }
        else {
          for (var q in action.data) {

            itemData[q] = action.data[q];
          }
        }

        data.push(itemData);
      }

      if(data.length === 1){
        data = data[0];
        me.proxyCRUD('CREATE', data.id, data);
      }
      else {
        me.proxyCRUD('CREATE', data);
      }
    }
    else{
      for(var p in actions){
        if(p === 'length'){
          continue;
        }

        var action = actions[p],
          data = {};

        if(me.writeAllFields){
          data = action;
        }
        else {
          for (var q in action) {
            if(q === 'length'){
              continue;
            }

            data[q] = action[q].value;
          }
        }

        me.proxyCRUD('CREATE', p, data);
      }
    }
  }
});/*
 * @mixin Fancy.store.mixin.Rest
 */
Fancy.Mixin('Fancy.store.mixin.Rest', {
  /*
   *
   */
  initRest: function(){
    var me = this;

    me.proxyType = 'server';

    me.checkUrl();
    me.initRestServerAPI();
    me.initRestActionMethods();
  },
  /*
   *
   */
  initRestServerAPI: function(){
    var me = this,
      proxy = me.proxy,
      url = proxy.url;

    proxy.api = proxy.api || {};

    proxy.api.create = url;
    proxy.api.read = url;
    proxy.api.update = url;
    proxy.api.destroy = url;
  },
  /*
   *
   */
  initRestActionMethods: function(){
    var me = this,
      proxy = me.proxy,
      methods = proxy.methods || {};

    methods.create = methods.create || proxy.method || 'POST';
    methods.read = methods.read || proxy.method || 'GET';
    methods.update = methods.update || proxy.method || 'PUT';
    methods.destroy = methods.destroy || proxy.method || 'DELETE';

    proxy.methods = methods;
  }
});/*
 *  @mixin Fancy.store.mixin.Reader
 */
Fancy.Mixin('Fancy.store.mixin.Reader', {
  readerType: 'json',
  readerRootProperty: 'data',
  /*
   *
   */
  initReader: function(){
    var me = this,
      proxy = me.proxy;

    if(proxy.reader){
      me.configReader(proxy.reader);
    }
  },
  /*
   * @param {String|Object} reader
   */
  configReader: function(reader){
    var me = this;

    switch(Fancy.typeOf(reader)){
      case 'string':

        switch(reader){
          case 'json':
            me.readerType = reader;
            break;
          default:
            throw new Error('[FancyGrid Error] - reader ' + reader + ' does not exist');
        }

        break;
      case 'object':

        switch(reader.type){
          case undefined:
            me.readerType = 'json';
            break;
          case 'json':
            me.readerType = reader.type;
            break;
          default:
            throw new Error('[FancyGrid Error] - reader ' + reader.type + ' does not exist');
        }

        if(reader.root){
          me.readerRootProperty = reader.root;
        }

        break;
    }
  }
});/*
 * @mixin Fancy.store.mixin.Writer
 */
Fancy.Mixin('Fancy.store.mixin.Writer', {
  writerType: 'string',
  writeAllFields: false,
  /*
   *
   */
  initWriter: function(){
    var me = this,
      proxy = me.proxy;

    if(proxy.writer){
      me.configWriter(proxy.writer);
    }
  },
  /*
   * @param writer
   */
  configWriter: function(writer){
    var me = this;

    if(writer.allFields){
      me.writeAllFields = writer.allFields;
      writer.writeAllFields = writer.allFields;
    }

    switch(Fancy.typeOf(writer)){
      case 'string':

        switch(writer){
          case 'json':
          case 'string':
            me.writerType = writer;
            break;
          default:
            throw new Error('[FancyGrid Error] - writer ' + writer.type + ' does not exist');
        }

        break;
      case 'object':

        switch(writer.type){
          case undefined:
            me.writerType = 'string';
            break;
          case 'json':
          case 'string':
            me.writerType = writer.type;
            break;
          default:
            throw new Error('[FancyGrid Error] - writer ' + writer + ' does not exist');
        }

        if(writer.writeFields){
          me.writeFields = true;
        }

        if(writer.root){
          me.writerRootProperty = writer.root;
        }

        break;
    }
  },
  /*
   * @param {String} id
   * @param {String} key
   * @param {*} value
   */
  prepareWriterJSONParams: function(id, key, value){
    var me = this,
      params = me.params || {},
      data = {};

    data.id = id;

    if(me.writeAllFields){
      Fancy.applyIf(data, me.getById(id).data);
    }
    else if(value === undefined && Fancy.isObject(key)){
      Fancy.applyIf(data, key);
    }
    else if(value === undefined && Fancy.isArray(key)){
      data = key;
    }
    else{
      data[key] = value;
    }

    if(me.rootProperty){
      params[me.rootProperty] = data;
    }
    else{
      return data;
    }

    return params;
  }
});