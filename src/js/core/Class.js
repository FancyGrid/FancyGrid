(function(){

var $classes = {},
  $types = {};

/**
 * Apply method and properties of Parent prototype to Child prototype
 * @private
 * @param {Object} Child
 * @param {Object} Parent
 */
var applyIf = function(Child, Parent){
  for(var p in Parent.prototype){
    if(Child.prototype[p] === undefined){
      Child.prototype[p] = Parent.prototype[p];
    }
  }
};

/**
 * @class ClassManager manage all classes, helps to manipulate
 * @private
 * @constructor
 */
var ClassManager = function(){

  this.waitMixins = {};
};
ClassManager.prototype = {
  items: new Fancy.Collection(),
  /*
   * Define class in global scope with it namespace
   * @param {String} key
   */
  add: function(key, value){
    var parts = key.split("."),
      i = 1,
      iL = parts.length - 1;
    
    Fancy.ns(key);
    
    var ref = Fancy.global[parts[0]];
    
    for(;i<iL;i++){
      ref = ref[parts[i]];
    }
    
    if(parts.length > 1){
      ref[parts[parts.length - 1]] = value;
    }
    else{
      Fancy.global[parts[0]] = value;
    }
    
    this.items.add(key, value);
  },
  /*
   * Returns class by key
   * @param {String} key
   * @return {Object}
   */
  get: function(key){
    return this.items.get(key);
  },
  /*
   * @param {String} whatWait
   * @param {String} whoWait
   */
  waitMixin: function(whatWait, whoWait){
    var me = this;

    me.waitMixins[whatWait] = me.waitMixins[whatWait] || {
        waiters: []
      };

    me.waitMixins[whatWait].waiters.push(whoWait);
  },
  /*
   * @param {String} name
   * @return {Object}
   */
  getMixin: function(name){
    var parts = name.split("."),
      j = 1,
      jL = parts.length;

    var namespace = Fancy.global[parts[0]];

    if(namespace === undefined){
      return false;
    }

    for(;j<jL;j++){
      namespace = namespace[parts[j]];

      if(namespace === undefined){
        return false;
      }
    }

    return namespace;
  }
};

/**
 * @class Fancy.ClassManager manages all classes, helps to manipulate
 * @private
 * @singleton
 */
Fancy.ClassManager = new ClassManager();

/*
 * Define class
 * @method
 * @param {String|Array} name
 * @param {Object} config
 */
Fancy.define = function(name, config){
  config = config || {};
  var names = [];
  
  if( Fancy.isArray(name) ){
    names = name;
    name = names[0];
  }
  
  if(config.constructor === Object){
    if(config.extend === undefined){
      config.constructor = function(){
        
      };
    }
    else{
      config.constructor = function(){
        this.Super('constructor', arguments);
      };
    }
  }
  
  if(config.extend === undefined){
    $classes[name] = config.constructor;
  }
  else{
    $classes[name] = config.constructor;
    
    var extendClass;
    switch(typeof config.extend){
      case 'string':
        extendClass = Fancy.ClassManager.get(config.extend);
        $classes[name].prototype.$Super = Fancy.ClassManager.get(config.extend);
        break;
      case 'function':
        extendClass = config.extend;
        $classes[name].prototype.$Super = config.extend;
        break;
    }
    delete config.extend;
    
    $classes[name].prototype.Super = function(method, args){
      var me = this;
      if( me.$Iam ){
        me.$Iam = Fancy.ClassManager.get( me.$Iam.prototype.$Super.prototype.$name );
      }
      else{
        me.$Iam = Fancy.ClassManager.get( me.$Super.prototype.$name );
      }

      switch(method){
        case 'const':
        case 'constructor':
          me.$Iam.apply(me, args);
        break;
        default:
          me.$Iam.prototype[method].apply(me, args);
      }
      
      delete me.$Iam;
    };
    applyIf($classes[name], extendClass);
  }
  
  $classes[name].prototype.$name = name;
  
  if(config.mixins){
    Fancy.mixin( $classes[name].prototype, config.mixins );
    delete $classes[name].prototype.mixins;
  }

  if(config.plugins !== undefined){
    if( $classes[name].prototype.$plugins === undefined ){
      $classes[name].prototype.$plugins = [];
    }

    $classes[name].prototype.$plugins = $classes[name].prototype.$plugins.concat( config.plugins );
    delete $classes[name].prototype.plugins;
  }

  for(var p in config){
    $classes[name].prototype[p] = config[p];
  }
  
  var _classRef = $classes[name];
  
  if( config.singleton === true ){
    delete $classes[name];
    _classRef = new _classRef(config);
    $classes[name] = _classRef;
    
  }
  
  if( names.length > 1 ){
    Fancy.each(names, function(name){
      Fancy.ClassManager.add(name, _classRef);
    });
  }
  else{
    Fancy.ClassManager.add(name, _classRef);
  }
  
  if(config.type){
    $types[config.type] = _classRef;
    Fancy.addWidgetType(config.type, _classRef);
  }
  else if(config.ptype){
    $types[config.type] = _classRef;
    Fancy.addPluginByType(config.ptype, _classRef);
  }
};

/*
 * Returns class by it's type
 * @param {String} type
 * @return {Object}
 */
Fancy.getClassByType = function(type){
  return $types[type];
};

})();