(function(){
  let seedFn = 0,
    fns = {};

  /*
   * @class Fancy.Event
   */
Fancy.define(['Fancy.Event', 'Fancy.Observable'], {
  mixins: [
    Fancy.MixinClass
  ],
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config = {}){
    const me = this;

    Fancy.applyConfig(me, config);

    me.$events = {};
    if(me.listeners || me.events){
      var listeners = me.listeners || me.events,
        i = 0,
        iL = listeners.length;

      for(;i<iL;i++){
        var lis = listeners[i],
          eventName = null,
          handler = null,
          scope = null,
          delay = 0,
          params = [];

        for(var p in lis){
          switch(p){
            case 'scope':
              scope = lis[p];
              break;
            case 'params':
              params = lis[p];
              break;
            case 'delay':
              delay = lis[p];
              break;
            default:
              eventName = p;
              handler = lis[p];
          }
        }

        if(eventName === null){
          throw new Error('[FancyGrid Error] - Event was not set');
        }
        else{
          switch(Fancy.typeOf(handler)){
            case 'string':
              handler = me[handler];
              lis.handler = handler;
              if(lis.scope === undefined){
                scope = me;
              }
              lis.scope = scope;
              break;
            case 'function':
              break;
            default:
              throw new Error('[FancyGrid Error] - Handler has wrong type or not defined');
          }
        }

        if(Fancy.isArray(params) === false){
          throw new Error('[FancyGrid Error] - params must be array');
        }

        me.addEvent(eventName);
        me.on(eventName, handler, scope, params, delay);
      }
    }
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} scope
   * @param {Object} params
   */
  on(eventName, fn, scope, params = [], delay){
    if (this.$events[eventName] === undefined) {
      throw new Error(`[FancyGrid Error] - Event name is not set: ${eventName}`);
    }

    if (fn === undefined) {
      throw new Error(`[FancyGrid Error] - Handler is undefined. Name of event is ${eventName}.`);
    }

    fn.$fancyFnSeed = seedFn;
    fns[seedFn] = fn;
    seedFn++;

    this.$events[eventName].push({
      fn:fn,
      scope: scope,
      params: params,
      delay: delay
    });
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   */
  un(eventName, fn){
    const me = this,
      $events = me.$events[eventName];

    if(!$events){
      return false;
    }

    let i = 0,
      iL = $events.length;

    for(;i<iL;i++){
      const lis = $events[i];
      if(lis.fn.$fancyFnSeed === fn.$fancyFnSeed){
        lis.toRemove = true;
        return true;
      }
    }
    return false;
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} scope
   */
  once(eventName, fn, scope){
    const me = this,
      fnWrapper = function () {
        fn.apply(this, arguments);
        me.un(eventName, fnWrapper);
      };

    me.on(eventName, fnWrapper, scope);
  },
  /*
   *
   */
  unAll(){
    this.$events = {};
  },
  /*
   * @param {String} eventName
   */
  unAllByType(eventName){
    this.$events[eventName] = [];
  },
  /*
   * @param {String} eventName
   */
  fire(eventName){
    const me = this,
      $events = me.$events[eventName];

    if(!$events){
      return false;
    }

    var i = 1,
      iL = arguments.length,
      args = [me];

    for(;i<iL;i++){
      args.push(arguments[i]);
    }

    var i = 0,
      iL = $events.length;

    for(;i<iL;i++){
      var lis = $events[i],
        _args = [];

      if( lis.toRemove === true ){
        $events.splice(i, 1);
        i--;
        iL = $events.length;
        continue;
      }

      _args = _args.concat(args);
      if( lis.params ){
        _args = _args.concat(lis.params);
      }

      if(lis.delay){
        setTimeout((function(lis){
          return function(){
            lis.fn.apply(lis.scope || me, _args);
          };
        })(lis), lis.delay);
      }
      else{
        lis.fn.apply(lis.scope || me, _args);
      }
    }
  },
  /*
   * @param {String} eventName
   * @return {Array}
   */
  addEvent(eventName){
    return this.addEvents(eventName);
  },
  /*
   * @param {String...} eventName
   * @return {Array}
   */
  addEvents(eventName){
    const me = this;

    if(arguments.length > 1){
      var tempEventName = [],
        i = 0,
        iL = arguments.length;

      for(;i<iL;i++){
        tempEventName[i] = arguments[i];
      }
      eventName = tempEventName;
    }
    if(Fancy.typeOf(eventName) === 'string'){
      me.$events[eventName] = me.$events[eventName] || [];
    }
    else if(Fancy.typeOf(eventName) === 'array'){
      var i = 0,
        iL = eventName.length;

      for(;i<iL; i++){
        me.$events[eventName[i]] = me.$events[eventName[i]] || [];
      }
    }
  },
  /*
   * @param {String} eventName
   * @return {Boolean}
   */
  has(eventName){
    const lis = this.$events[eventName];
    if(!lis){
      return false;
    }

    return lis.length !== 0;
  }
});

  /*
   * @class Fancy.Modules
   * @singleton
   */
  Fancy.define('Fancy.Modules', {
    extend: Fancy.Event,
    singleton: true,
    /*
     * @constructor
     */
    constructor: function(){
      this.Super('const', arguments);
      this.init();
    },
    /*
     *
     */
    init(){
      this.addEvents('loaded');
    }
  });

})();
