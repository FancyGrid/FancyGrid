/*
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
});