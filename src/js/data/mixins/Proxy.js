/*
 * @mixin Fancy.store.mixin.Proxy
 */
Fancy.modules['server-data'] = true;
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
    var me = this,
      w = me.widget;

    me.proxy = me.data.proxy || {};
    var proxy = me.proxy;

    if(proxy.words){
      for(var p in proxy.words){
        this[p + 'Param'] = proxy.words[p];
      }
    }

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

    if(me.autoLoad){
      //if(w.stateful && (me.remoteFilter && me.filters){
      if((w.stateful || w.state ) && (me.remoteFilter || me.remoteSort)){
        /*
          When there is server filtering with state and on start it loads data
          that it requires to wait until store will get all filter params that avoid
          many not needed requests to server.
         */
        w.WAIT_FOR_STATE_TO_LOAD = true;
        w.SERVER_FILTER_SORT = true;
      }
      else{
        me.loadData();
      }
    }
  },
  /*
   *
   */
  checkProxy: function(){
    var me = this,
      proxy = me.proxy;

    if(proxy.api.read === undefined){
      Fancy.error('In data proxy there is not url');
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
   * @param {Function} [fn]
   */
  loadData: function(fn){
    var me = this,
      proxy = me.proxy,
      params = {},
      headers = proxy.headers || {},
      activeElement;

    if(document.activeElement){
      activeElement = document.activeElement;
      document.activeElement.blur();
    }

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

    if(proxy.beforeRequest){
      var proccessed = proxy.beforeRequest({
        type: 'read',
        params: params,
        headers: headers
      });

      params = proccessed.params;
      headers = proccessed.headers;
    }

    me.loading = true;

    Fancy.Ajax({
      url: proxy.api.read,
      method: proxy.methods.read,
      params: params,
      getJSON: true,
      headers: headers,
      success: function(o, status, request){
        if(activeElement){
          activeElement.focus();
        }

        if(proxy.afterRequest){
          var proccessed = proxy.afterRequest({
            type: 'read',
            response: o
          });

          o = proccessed.response;
        }

        me.loadedTimes++;
        me.loading = false;

        if(proxy.wrapper === false || o[me.readerRootProperty] === undefined){
          me.defineModel(o);
        }
        else {
          me.defineModel(o[me.readerRootProperty]);
        }

        if(me.widget.isTreeData){
          if(proxy.wrapper === false || o[me.readerRootProperty] === undefined){
            me.data = o;
          }
          else {
            me.data = o[me.readerRootProperty];
          }
          me.initTreeData();

          me.widget.setSidesHeight();

          me.fire('change');
          me.fire('load');

          me.fire('serversuccess', o, request);
          if(fn){
            fn();
          }
          return;
        }

        if(me.paging){
          me.processPagingData(o);
        }
        else {
          if(proxy.wrapper === false || o[me.readerRootProperty] === undefined){
            me.setData(o);
          }
          else {
            me.setData(o[me.readerRootProperty]);
          }
          me.widget.setSidesHeight();
        }
        me.fire('change');
        me.fire('load');

        me.fire('serversuccess', o, request);
        if(fn){
          fn();
        }

        // Fixing chart bars bug.
        // It does not set right width of bars if loaded data from server.
        // This bug is complex to replicate. Only in production.
        me.widget.lightStartUpdate();

        me.widget._setColumnsAutoWidth();
      },
      error: function(request, errorTitle, errorMessage){
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
      headers = proxy.headers || {},
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

    if(proxy.beforeRequest){
      var proccessed = proxy.beforeRequest({
        type: 'update',
        params: params,
        headers: headers
      });

      params = proccessed.params;
      headers = proccessed.headers;
    }

    me.loading = true;

    me.fire('beforeupdate', id, key, value);

    Fancy.Ajax({
      url: proxy.api.update,
      method: proxy.methods.update,
      params: params,
      sendJSON: sendJSON,
      headers: headers,
      success: function(o, status, request){
        if(proxy.afterRequest){
          var proccessed = proxy.afterRequest({
            type: 'update',
            response: o
          });

          o = proccessed.response;
        }

        me.loading = false;

        me.fire('update', id, key, value);
        me.fire('serversuccess', o, request);
      },
      error: function(request, errorTitle, errorMessage){
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
      headers = proxy.headers || {},
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

    if(proxy.beforeRequest){
      var proccessed = proxy.beforeRequest({
        type: 'destroy',
        params: params,
        headers: headers
      });

      params = proccessed.params;
      headers = proccessed.headers;
    }

    Fancy.Ajax({
      url: proxy.api.destroy,
      method: proxy.methods.destroy,
      params: params,
      sendJSON: sendJSON,
      headers: headers,
      success: function(o, status, request){
        if(proxy.afterRequest){
          var proccessed = proxy.afterRequest({
            type: 'destroy',
            response: o
          });

          o = proccessed.response;
        }

        me.loading = false;

        me.fire('destroy', id, o);
        me.fire('serversuccess', o, request);
      },
      error: function(request, errorTitle, errorMessage){
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
      headers = proxy.headers || {},
      sendJSON = me.writerType === 'json' || me.autoSave === false;

    if(Fancy.isObject(id)){
      data = id;
      id = id.id;
    }

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

    if(proxy.beforeRequest){
      var proccessed = proxy.beforeRequest({
        type: 'create',
        params: params,
        headers: headers
      });

      params = proccessed.params;
      headers = proccessed.headers;
    }

    Fancy.Ajax({
      url: proxy.api.create,
      method: proxy.methods.create,
      params: params,
      sendJSON: sendJSON,
      headers: headers,
      success: function(o, status, request){
        if(proxy.afterRequest){
          var proccessed = proxy.afterRequest({
            type: 'create',
            response: o
          });

          o = proccessed.response;
        }

        me.loading = false;

        if(Fancy.isObject(o.data) && String(id) !== String(o.data.id)){
          me.changeItemId(id, o.data.id);
        }
        else if(Fancy.isArray(o.data)){
          var i = 0,
            iL = id.length;

          for(;i<iL;i++){
            if(String(id[i].id) !== String(o.data[i].id)){
              me.changeItemId(String(id[i].id), String(o.data[i].id));
            }
          }
        }

        me.fire('create', o.data);
        me.fire('serversuccess', o, request);
      },
      error: function(request, errorTitle, errorMessage){
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

    for(var p in inserted){
      if(p === 'length'){
        continue;
      }

      if(changed[p] !== undefined){
        delete changed[p];
        changed.length--;
      }
    }

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
          for (var q in action){
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
          for (var q in action){
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
          itemData = actions[p];
        }
        else {
          for (var q in action){
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
          for (var q in action){
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
          for (var q in action.data){

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
          for (var q in action){
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
});