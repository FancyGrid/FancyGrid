/**
 * @class Fancy utilities and functions.
 * @singleton
 */
var Fancy = {
  global: this,
  cls: 'fancy',
  /**
   * The version of the framework
   * @type String
   */
  version: '1.6.2',
  site: 'fancygrid.com',
  COLORS: ["#9DB160", "#B26668", "#4091BA", "#8E658E", "#3B8D8B", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"]
};

/**
 * Copies all the properties of `from` to the specified `to`.
 * 
 * @param {Object} to The receiver of the properties.
 * @param {Object} from The primary source of the properties.
 */
Fancy.apply = function(to, from){
  for(var p in from){
    to[p] = from[p];
  }
};

/**
 * Copies all the properties of `from` to the specified `to`.
 * 
 * @param {Object} to The receiver of the properties.
 * @param {Object} from The primary source of the properties.
 */
Fancy.applyIf = function(to, from){
  for(var p in from){
    if( to[p] === undefined ){
      to[p] = from[p];
    }
  }
};

/**
 * Creates namespaces to be used for scoping variables and classes so that they are not global.
 * Specifying the last node of a namespace implicitly creates all other nodes.
 * @param {String} namespace1
 * @param {String} namespace2
 * @param {String} etc
 */
Fancy.namespace = function(){
  var i = 0,
    iL = arguments.length;
  
  for(;i<iL;i++){
    var value = arguments[i],
      parts = value.split("."),
      j = 1,
      jL = parts.length;
    
    Fancy.global[parts[0]] = Fancy.global[parts[0]] || {};
    var namespace = Fancy.global[parts[0]];
    
    for(;j<jL;j++){
      namespace[parts[j]] = namespace[parts[j]] || {};
      namespace = namespace[parts[j]];
    }
  }
};

/**
 * Creates namespaces to be used for scoping variables and classes so that they are not global.
 * Specifying the last node of a namespace implicitly creates all other nodes. 
 * @param {String} namespace1
 * @param {String} namespace2
 * @param {String} etc
 */
Fancy.ns = Fancy.namespace;

/**
 * Returns the type of the given variable in string format. List of possible values are:
 *
 * - `undefined`: If the given value is `undefined`
 * - `string`: If the given value is a string
 * - `number`: If the given value is a number
 * - `boolean`: If the given value is a boolean value
 * - `date`: If the given value is a `Date` object
 * - `function`: If the given value is a function reference
 * - `object`: If the given value is an object
 * - `array`: If the given value is an array
 * - `regexp`: If the given value is a regular expression
 *
 * @param {*} value
 * @return {String}
 */
Fancy.typeOf = function(value){
  if(value === null) {
    return 'null';
  }

  var type = typeof value;
  if(type === 'undefined' || type === 'string' || type === 'number' || type === 'boolean') {
    return type;
  }

  var toString = Object.prototype.toString,
    typeToString = toString.call(value);

  if(value.length !== undefined && typeof value !== 'function'){
    return 'array';
  }

  switch(typeToString){
    case '[object Array]':
      return 'array';
    case '[object Date]':
      return 'date';
    case '[object Boolean]':
      return 'boolean';
    case '[object Number]':
      return 'number';
    case '[object RegExp]':
      return 'regexp';
  }

  if(type === 'function'){
    return 'function';
  }

  if(type === 'object'){
    return 'object';
  }
};

/**
 * Returns true if the passed value is a JavaScript array, otherwise false.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isArray = ('isArray' in Array) ? Array.isArray : function(value){
  var toString = Object.prototype.toString;
  
  return toString.call(value) === '[object Array]';
};

/**
 * Returns true if the passed value is a JavaScript Object, otherwise false.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isObject = function(value){
  var toString = Object.prototype.toString;
  
  return toString.call(value) === '[object Object]';
};

/**
 * Returns true if the passed value is a JavaScript Function, otherwise false.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isFunction = function(value){
  var toString = Object.prototype.toString;
  
  return toString.apply(value) === '[object Function]';
};

/**
 * Returns true if the passed value is a string.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isString = function(value){
  return typeof value === 'string';
};

/**
 * Returns true if the passed value is a number. Returns false for non-finite numbers.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isNumber = function(value){
  return typeof value === 'number' && isFinite(value);
};

/**
 * Returns true if the passed value is a boolean.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isBoolean = function(value){
  return typeof value === 'boolean';
};

/**
 * Returns true if the passed value is a boolean.
 * @param {*} value The value to test
 * @return {Boolean}
 */
Fancy.isDate = function(value){
  return Fancy.typeOf(value) === 'date';
};

/**
 * Iterates an array calling the supplied function.
 * @param {Array} arrayObject The array to be iterated. If this
 * argument is not really an array, the supplied function is called once.
 * @param {Function} fn The function to be called with each item.
 * @return See description for the fn parameter.
 */
Fancy.each = function(arrayObject, fn){
  var type = Fancy.typeOf(arrayObject);

  switch(type){
    case 'array':
      var i = 0,
        iL = arrayObject.length;

      for(;i<iL;i++){
        fn(arrayObject[i], i, arrayObject);
      }
      break;
    case 'object':
      for(var p in arrayObject){
        fn(arrayObject[p], p, arrayObject);
      }
      break;
  }
};

/**
 * Helps in OOP for light mixins.
 *
 * @private
 * Iterates an array calling the supplied function.
 * @param {Array} proto The array to be iterated. If this
 * argument is not really an array, the supplied function is called once.
 * @param {Function} classes The function to be called with each item.
 * @return See description for the fn parameter.
 */
Fancy.mixin = function(proto, classes){
   var i = 0,
    iL = classes.length;

  if( Fancy.typeOf( classes[0] ) === 'object' ){
    for(;i<iL;i++){
      var item = classes[i],
        _class = item._class,
        methods = item.methods,
        j = 0,
        jL = methods.length;

      for(;j<jL;j++){
        var methodName = methods[j];
        proto[methodName] = _class['prototype'][methodName];
      }
    }
  }
  else{
    for(;i<iL;i++){
      var item = classes[i];

      if(Fancy.isString(item)){
        var _item = Fancy.ClassManager.getMixin(item);

        if(_item){
          Fancy.apply(proto, _item['prototype']);
        }
        else{
          Fancy.ClassManager.waitMixin(item, proto);
        }
      }
      else {
        Fancy.apply(proto, item['prototype']);
      }
    }
  }
};

Fancy.Mixin = function(name, config){
  var parts = name.split("."),
    i = 1,
    iL = parts.length - 1;

  Fancy.ns(name);

  var ref = Fancy.global[parts[0]];

  for(;i<iL;i++){
    ref = ref[parts[i]];
  }

  if(parts.length > 1){
    ref[parts[parts.length - 1]] = function(){};
    ref[parts[parts.length - 1]].prototype = config;
  }
  else{
    Fancy.global[parts[0]] = function(){};
    Fancy.global[parts[0]].prototype = config;
  }

  var waiters = Fancy.ClassManager.waitMixins[name];

  if(waiters){
    waiters = waiters.waiters;

    var i = 0,
        iL = waiters.length;

    for(;i<iL;i++){
      Fancy.apply(waiters[i], config);
    }
  }
};

/**
 * Help function for OOP
 * Help to avoid multiple applying in deep class inheritance
 * Copies all the properties of `config` to the specified `object`.
 * @param {Object} object The receiver of the properties.
 * @param {Object} config The primary source of the properties.
 * @return {Object}
 */
Fancy.applyConfig = function(object, config){
  var property,
    config = config || {};

  if(object.plugins && config.plugins){
    object.plugins = object.plugins.concat(config.plugins);
    delete config.plugins;
  }

  if(object._isConfigApplied === true){
    return object;
  }
  
  for(property in config){
    object[property] = config[property];
  }
  object._isConfigApplied = true;
  
  return object;
};

/**
 * @param {Object} o
 * @return {Object}
 */
Fancy.styleToString = function(o){
  var str = '';

  o = o || {};

  for(var p in o){
    str += p + ': ' + o[p] + ';';
  }

  return str;
};

Fancy.apply(Fancy, {
  prefix: 'fancy-gen-',
  idSeed: 0,
  zIndex: 1,
  id: function(el, prefix){
    if(!el){
      return (prefix || Fancy.prefix) + (++Fancy.idSeed);
    }
    el = el.dom || {};
    if(!el.id){
      el.id = (prefix || Fancy.prefix) + (++Fancy.idSeed);
    }
    return el.id;
  }
});

(function(){

var userAgent = navigator.userAgent.toLowerCase(),
  check = function(regex){
    return regex.test(userAgent);
  },
  isOpera = check(/opera/),
  isIE = !isOpera && check(/msie/);

Fancy.apply(Fancy, {
  isOpera: isOpera,
  isIE: isIE
});

/**
 *
 * @return {Array}
 */
Fancy.getViewSize = function(){
  var xy = [];
  
  if(Fancy.isIE){
    xy[0] = document.documentElement.clientHeight;
    xy[1] = document.documentElement.clientWidth;
  }
  else{
    xy[0] = window.innerHeight;
    xy[1] = window.innerWidth;
  }
  
  return xy;
};

/**
 * @return {Object}
 */
Fancy.getScroll = function() {
  var dd = document.documentElement,
    db = document.body;

  if (dd && (dd.scrollTop || dd.scrollLeft)) {
    return [dd.scrollTop, dd.scrollLeft];
  } else if (db) {
    return [db.scrollTop, db.scrollLeft];
  } else {
    return [0, 0];
  }
};

/**
 * @return {String}
 */
Fancy.getMouseWheelEventName = function(){
  if('onmousewheel' in document.body){
    return 'mousewheel';
  }
  else{
    return 'DOMMouseScroll';
  }
};

/**
 * @param {Object} e
 * @return {String}
 */
Fancy.getWheelDelta = function(e) {
  var delta = 0;

  if (e.wheelDelta) { // IE/Opera way
    delta = e.wheelDelta / 120;
  } else if (e.detail) { // Mozilla way
    delta = -e.detail / 3;
  }

  return delta;
};

Fancy.isTouch = (document.ontouchstart !== undefined);

Fancy.i18n = {};

Fancy.currencies = {
  map: { 
    EUR: '€',
    USD: '$',
    GBP: '£',
    RUB: '₽',
    CZK: 'Kč',
    AUD: '$',
    JPY: '¥',
    PLN: 'zł',
    TRY: '₺',
    DKK: 'kr',
    KRW: '₩',
    BRL: 'R$',
    CNY: '¥',
    SEK: 'kr',
    CAD: '$',
    NOK: 'kr',
    IDR: 'Rp'
  }
};

})();

Fancy.modules = {};

/*
var FancyGrid = function(config){
  var grid = config;

  Fancy.loadModule('grid', function(){
    new FancyGrid(config);
  });

  return config;
};

var FancyForm = function(){
  var grid = config;

  Fancy.loadModule('form', function(){
    new FancyForm(config);
  });
};
*/
(function() {
  var moduleNames = {};

  /**
   * @param {String} name
   * @param {Function} fn
   */
  Fancy.loadModule = function (name, fn) {
    var me = this,
      body = document.getElementsByTagName('body')[0],
      _script = document.createElement('script'),
      _name = name,
      endUrl = Fancy.DEBUG ? '.js' : '.min.js',
      fn = fn || function () {},
      protocol = location.protocol,
      _v = Fancy.version.replace(/\./g, ''),
      MODULESDIR = Fancy.MODULESDIR || FancyGrid.MODULESDIR || (protocol + '//code.fancygrid.com/modules/');

    if(Fancy.MODULELOAD === false || Fancy.MODULESLOAD === false){
      return;
    }

    name = name.replace(/ /g, '-');

    if(Fancy.DEBUG){
      endUrl += '?_dc='+(+new Date());
    }
    else{
      endUrl += '?_v=' + _v;
    }

    Fancy.Modules.on('loaded', function(modules, $name){
      if($name === name){
        Fancy.modules[_name] = true;
        fn(name);
      }
    });

    if(moduleNames[name]){
      return;
    }

    moduleNames[name] = true;

    _script.src = MODULESDIR + name + endUrl;

    _script.charset = 'utf-8';

    _script.onload = function () {
      Fancy.Modules.fire('loaded', name);
    };

    _script.onerror = function () {
      throw new Error('[FancyGrid error] - module ' + name + ' was not loaded');
    };

    body.appendChild(_script);
  };

  /**
   * @param {String} i18n
   * @param {Function} fn
   */
  Fancy.loadLang = function(i18n, fn){
    var me = this;

    if(Fancy.i18n[i18n] !== undefined) {
      return true;
    }

    var  body = document.getElementsByTagName('body')[0],
      _script = document.createElement('script'),
      //endUrl = Fancy.DEBUG ? '.js' : '.min.js',
      endUrl = '.js',
      protocol = location.protocol,
      MODULESDIR = Fancy.MODULESDIR || FancyGrid.MODULESDIR || (protocol + '//code.fancygrid.com/modules/');

    _script.src = MODULESDIR + 'i18n/' + i18n + endUrl;
    _script.charset = 'utf-8';
    _script.async = 'true';

    _script.onload = function(){
      fn({
        lang: Fancy.i18n[i18n]
      });
    };

    body.appendChild(_script);
  };
})();
Fancy.themes = {};

/**
 * @param {String} name
 * @param {Object} o
 */
Fancy.defineTheme = function(name, o){
  var themeConfig = {};

  if(o.extend){
    Fancy.apply(themeConfig, Fancy.getTheme(o.extend).config);
  }
  else if(name !== 'default'){
    Fancy.apply(themeConfig, Fancy.getTheme('default').config);
  }

  Fancy.apply(themeConfig, o.config);
  o.config = themeConfig;

  Fancy.themes[name] = o;
};

/**
 * @param {String} name
 * @return {Object} o
 */
Fancy.getTheme = function(name){
  var theme = {
    config: {}
  };

  if(Fancy.isObject(name)){
    Fancy.applyIf(theme, Fancy.themes[name.name || 'default']);
    Fancy.apply(theme.config, Fancy.themes[name.name || 'default'].config);
    Fancy.apply(theme.config, name.config);

    return theme;
  }

  return Fancy.themes[name];
};

Fancy.defineTheme('default', {
  config: {
    cellHeaderHeight: 30,
    cellWidth: 70,
    minCellWidth: 40,
    cellHeight: 32,
    titleHeight: 42,
    subTitleHeight: 42,
    barHeight: 38,
    bottomScrollHeight: 12,
    minCenterWidth: 100,
    panelBorderWidth: 2,
    groupRowHeight: 31,

    gridBorders: [1,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,2,2,2],

    knobOffSet: 2,
    fieldHeight: 37
  }
});

Fancy.defineTheme('blue', {
  config: {
    panelBorderWidth: 1,
    //borders: [1,1,0,1],
    gridBorders: [1,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0]
  }
});

Fancy.defineTheme('gray', {
  config: {
    panelBorderWidth: 0,
    //borders: [0,0,1,0],
    gridBorders: [0,0,1,0],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0]
  }
});

Fancy.defineTheme('dark', {
  config: {
    panelBorderWidth: 1,
    gridBorders: [0,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0]
  }
});

Fancy.defineTheme('sand', {
  config: {
    panelBorderWidth: 1,
    gridBorders: [0,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0]
  }
});

Fancy.defineTheme('bootstrap', {
  config: {
    panelBorderWidth: 1,
    gridBorders: [1,1,1,1],
    gridWithoutPanelBorders: [1,1,1,1],
    panelBodyBorders: [0,0,0,0]
  }
});
/**
 * @class Fancy.String
 * @singleton
 */
Fancy.String = {
  /**
   * @param {String} tpl
   * @return {String}
   */
  format: function(tpl){
    var arr,
      i,
      iL;

    if(Fancy.typeOf(arguments[1]) === 'array'){
      arr = arguments[1];
    }
    else{
      iL = arguments.length;
      arr = [];
      i = 1;

      for(;i<iL;i++){
        arr[i - 1] = arguments[i];
      }
    }

    return tpl.replace(/\[(\d+)]/g, function(m, i) {
      return arr[i];
    });
  },
  /**
   * @param {String} str
   * @return {String}
   */
  upFirstChar: function(str) {
    return str[0].toLocaleUpperCase() + str.substr(1, str.length);
  },
  /**
   * @param {String} str
   * @return {String}
   */
  trim: function(str) {
    return str.replace(/\s/g, '');
  }
};


Fancy.Array = {
  copy: function(a, deep){
    if(!deep) {
      return a.slice();
    }

    var newArray = [],
      i = 0,
      iL = a.length;

    for(;i<iL;i++){

      switch(Fancy.typeOf(a[i])){
        case 'object':
          newArray[i] = Fancy.Object.copy(a[i]);
          break;
        case 'array':
          newArray[i] = Fancy.Array.copy(a[i]);
          break;
        default:
          newArray = a[i];
      }
    }

    return newArray;
  }
};
/**
 * @class Fancy.Object
 * @singleton
 */
Fancy.Object = {
  /**
   * @param {Object} o
   * @return {Object}
   * TODO: deep copy
   */
  copy: function(o){
    var _o = {};

    for(var p in o){
      _o[p] = o[p];
    }

    return _o;
  }
};
/**
 * @class Fancy.Number
 * @singleton
 */
Fancy.Number = {
  /**
   * @param {Number} value
   * @return {Boolean}
   */
  isFloat: function(value){
    return Number(value) === value && value % 1 !== 0;
  },
  getPrecision: function(value){
    return (value + "").split(".")[1].length + 1;
  },
  correctFloat: function(value){
    return parseFloat(value.toPrecision(14));
  }
};
/*
 * @class Fancy.Collection
 * @constructor
 */
Fancy.Collection = function(arr){
  var me = this;

  me.items = [];
  me.keys = [];
  me.map = {};
  me.indexMap = {};
  me.length = 0;

  if( arr ){
    if(arr.length > 0){
      var i = 0,
        iL = arr.length;

      for(;i<iL;i++){
        me.add(i, arr[i]);
      }
    }
    else{
      for(var p in arr){
        me.add(p, arr[p]);
      }
    }
  }
};

Fancy.Collection.prototype = {
  /*
   *
   * @param {String|Number} key
   * @param {*} value
   */
  add: function(key, value){
    var me = this;

    me.items.push(value);
    me.keys.push(key);
    me.map[key] = value;
    me.indexMap[key] = me.length;
    me.length++;
  },
  /*
   * @param {String|Number} key
   */
  remove: function(key){
    var me = this,
      index = me.indexMap[key];

    me.items.splice(index, 1);
    me.keys.splice(index, 1);
    delete me.indexMap[index];
    delete me.map[key];
    me.length--;
  },
  /*
   *
   */
  removeAll: function(){
    var me = this;

    me.items = [];
    me.keys = [];
    me.indexMap = {};
    me.map = {};
    me.length = 0;
  },
  /*
   * @param {String|Number} key
   * @returns {*}
   */
  get: function(key){
    var me = this;

    return me.map[key];
  },
  /*
   *
   * @param {Function} fn
   */
  each: function(fn){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      fn(me.keys[i], me.items[i], i, me.length);
    }
  }
};
/**
 * @class Fancy.Template
 * @constructor
 * @param {Array} html
 */
Fancy.Template = function(html){
  var me = this;

  if(Fancy.isArray(html)){
    me.tpl = html.join('');
  }
  else{
    me.tpl = html;
  }

  me.compile();
};

Fancy.Template.prototype = {
  re: /\{([\w\-]+)\}/g,
  /*
   * @param {Array} values
   */
  getHTML: function(values){
    var me = this;

    return me.compiled(values);
  },
  /*
   * @returns {Fancy.Template}
   */
  compile: function(){
    var me = this,
      sep = "+";

      function fn(m, name){
        name = "values['" + name + "']";
        return "'+(" + name + " === undefined ? '' : " + name + ")+'";
      }

    eval("me.compiled = function(values){ return '" + me.tpl.replace(me.re, fn) + "';};");

    return me;
  }
};
Fancy.key = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  RETURN: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  ESC: 27,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  INSERT: 45,
  DELETE: 46,
  ZERO: 48,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53,
  SIX: 54,
  SEVEN: 55,
  EIGHT: 56,
  NINE: 57,
  NUM_ZERO: 96,
  NUM_ONE: 97,
  NUM_TWO: 98,
  NUM_THREE: 99,
  NUM_FOUR: 100,
  NUM_FIVE: 101,
  NUM_SIX: 102,
  NUM_SEVEN: 103,
  NUM_EIGHT: 104,
  NUM_NINE: 105,
  NUM_PLUS: 107,
  NUM_MINUS: 109,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  DOT: 190
};

Fancy.Key = {
  /*
   * @param {number} c
   * @returns {Boolean}
   */
  isNum: function(c){
    var key = Fancy.key;

    switch(c){
      case key.ZERO:
      case key.ONE:
      case key.TWO:
      case key.THREE:
      case key.FOUR:
      case key.FIVE:
      case key.SIX:
      case key.SEVEN:
      case key.EIGHT:
      case key.NINE:
      case key.NUM_ZERO:
      case key.NUM_ONE:
      case key.NUM_TWO:
      case key.NUM_THREE:
      case key.NUM_FOUR:
      case key.NUM_FIVE:
      case key.NUM_SIX:
      case key.NUM_SEVEN:
      case key.NUM_EIGHT:
      case key.NUM_NINE:
        return true;
      default:
        return false;
    }
  },
  /*
   * @param {Number} c
   * @param {Object} w
   * @returns {Boolean}
   */
  isNumControl: function(c, e){
    var key = Fancy.key;

    if( Fancy.Key.isNum(c) ){
      return true;
    }

    if( e.shiftKey && c === 187){
      return true;
    }

    switch(c){
      case key.NUM_PLUS:
      case 189:
      case key.NUM_MINUS:
      case key.BACKSPACE:
      case key.DELETE:
      case key.TAB:
      case key.ENTER:
      case key.RETURN:
      case key.SHIFT:
      case key.CTRL:
      case key.ALT:
      case key.ESC:
      case key.END:
      case key.HOME:
      case key.LEFT:
      case key.UP:
      case key.RIGHT:
      case key.DOWN:
      case key.INSERT:
      case key.DOT:
        return true;
        break;
      default:
        return false;
    }
  }
};
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
   * @returns {Object}
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
  var config = config || {},
    names = [];
  
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
 * @returns {Object}
 */
Fancy.getClassByType = function(type){
  return $types[type];
};

})();
/**
 * @class Fancy.MixinClass
 * @constructor
 */
Fancy.MixinClass = function(){};

Fancy.MixinClass.prototype = {
  /**
   * generate unique id for class
   */
  initId: function(){
    var me = this,
      prefix = me.prefix || Fancy.prefix;

    me.id = me.id || Fancy.id(null, prefix);

    Fancy.addWidget(me.id, me);
  },
  /*
   * Initialize plugins if they are presented in class
   */
  initPlugins: function(){
    var me = this,
      widget = me,
      plugin,
      objectPlugin,
      pluginConfig;

    me.plugins = me.plugins || [];

    if(me._plugins){
      me.plugins = me.plugins.concat(me._plugins);
    }

    if(me.plugins !== undefined){
      me.$plugins = me.plugins;
      delete me.plugins;
    }

    if(me.$plugins === undefined){
      return;
    }

    var i = 0,
      plugins = me.$plugins,
      iL = plugins.length,
      inWidgetName,
      types = {};

    for(;i<iL;i++){
      pluginConfig = plugins[i];
      pluginConfig.widget = widget;

      var type = pluginConfig.type || pluginConfig.ptype;

      if(types[type] === true){
        continue;
      }

      types[type] = true;
      plugin = Fancy.getPluginByType( type );
      if(plugin === undefined){
        throw new Error('[FancyGrid Error] - some of module was not loaded. Grid plugin does not exist - ' + type);
      }
      objectPlugin = new plugin(pluginConfig);
      inWidgetName = pluginConfig.inWidgetName || objectPlugin.inWidgetName;

      if(inWidgetName !== undefined){
        widget[ inWidgetName ] = objectPlugin;
      }
    }
  }
};
/*
 * @class Fancy.Data
 */
Fancy.define('Fancy.Data', {
  /*
   * @constructor
   * @param {Array} data
   */
  constructor: function(data){
    var me = this;

    me.map = {};

    if(data){
      var i = 0,
        iL = data.length,
        map = me.map;

      for(;i<iL;i++){
        map[i] = data[i];
      }
    }

    me.length = 0;
  },
  /*
   * @param {String|Number} key
   * @param {*} value
   */
  add: function(key, value){
    var me = this;

    me.map[key] = value;
    me.length++;
  },
  /*
   * @param {String|Number} key
   * @returns {*}
   */
  get: function(key){
    return this.map[key];
  }
});
/*
 * @class Fancy.Model
 */
Fancy.define('Fancy.Model', {
  /*
   * @constructor
   * @param {Object|Array} data
   */
  constructor: function(data){
    var me = this,
      row = {},
      fields = me.fields || [],
      j = 0,
      jL = fields.length;

    if( Fancy.isArray(data) ){
      for(;j<jL;j++){
        var p = fields[j];
        row[p] = data[j];
      }

      me.data = row;
      //TODO - id
    }
    else{
      if(data.id){
        me.id = data.id;
      }
      else{
        Fancy.idSeed++;
        me.id = Fancy.idSeed + 1000;
      }

      if( me.fields === undefined ){
        fields = [];
        for(var p in data){
          fields.push(p)
        }
        me.fields = fields;
      }

      jL = fields.length;

      for(;j<jL;j++){
        var p = fields[j];

        if(data[p] === undefined){
          row[p] = '';
        }
        else{
          row[p] = data[p];
        }
      }

      me.data = row;
    }
  },
  /*
   * @param {String} key
   * @return {Object}
   */
  get: function(key){
    var me = this;

    if(key === undefined){
      return me.data;
    }

    return me.data[key];
  },
  /*
   * @param {String} key
   * @param {*} value
   */
  set: function(key, value){
    var me = this;

    if(value === undefined && Fancy.isObject(key)){
      for(var p in key){
        me.set(p, key[p]);
      }
      return;
    }

    me.data[key] = value;
  }
});
/*
 * @class Fancy.Data
 * @singleton
 */
Fancy.define('Fancy.PluginManager', {
  singleton: true,
  /*
   * @constructor
   */
  constructor: function(){
    var me = this;
    me.ptypes = new Fancy.Data();
  },
  /*
   * @param {String} ptype
   * @param {Object} plugin
   */
  addPlugin: function(ptype, plugin){
    this.ptypes.add(ptype, plugin);
  },
  /*
   * @param {String} ptype
   * @return {Object}
   */
  getPlugin: function(ptype){
    return this.ptypes.get(ptype);
  }
});

/*
 * @param {String} ptype
 * @param {Object} plugin
 */
Fancy.addPluginByType = function(ptype, plugin){
  Fancy.PluginManager.addPlugin(ptype, plugin);
};

/*
 * @param {String} ptype
 * @return {Object}
 */
Fancy.getPluginByType = function(ptype){
  return Fancy.PluginManager.getPlugin(ptype);
};
/*
 * @class Fancy.WidgetManager
 * @singleton
 */
Fancy.define('Fancy.WidgetManager', {
  singleton: true,
  /*
   * @constructor
   */
  constructor: function(){
    var me = this;

    me.wtypes = new Fancy.Data();
    me.widgets = new Fancy.Data();
  },
  /*
   * @param {String} wtype
   * @param {Object} widget
   */
  addWidgetType: function(wtype, widget){
    widget.prototype.wtype = wtype;
    this.wtypes.add(wtype, widget);
  },
  /*
   * @param {String} wtype
   * @return {Object}
   */
  getWidgetClassByType: function(wtype){
    return this.wtypes.get(wtype);
  },
  /*
   * @param {String} id
   * @param {Object} widget
   */
  addWidget: function(id, widget){
    this.widgets.add(id, widget);
  },
  /*
   * @param {String} id
   * @return {Object}
   */
  getWidget: function(id){
    return this.widgets.get(id);
  }
});

/*
 * @param {String} wtype
 * @param {Object} widget
 */
Fancy.addWidgetType = function(wtype, widget){
  Fancy.WidgetManager.addWidgetType(wtype, widget);
};

/*
 * @param {String} wtype
 * @return {Object}
 */
Fancy.getWidgetClassByType = function(wtype){
  return Fancy.WidgetManager.getWidgetClassByType(wtype);
};

/*
 * @param {String} id
 * @param {Object} widget
 */
Fancy.addWidget = function(id, widget){
  Fancy.WidgetManager.addWidget(id, widget);
};

/*
 * @param {String} id
 * @return {Object} widget
 */
Fancy.getWidget = function(id){
  return Fancy.WidgetManager.getWidget(id);
};
(function(){
var seedFn = 0,
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
  constructor: function(config){
    var me = this;

    Fancy.applyConfig(me, config || {});

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
          params = [];

        for(var p in lis){
          if(p === 'scope'){
            scope = lis[p];
          }
          else if(p === 'params'){
            params = lis[p];
          }
          else{
            eventName = p;
            handler = lis[p];
          }
        }

        if(eventName === null){
          throw new Error('Event was not set');
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
              throw new Error('Handler has wrong type or not defined');
          }
        }

        if(Fancy.isArray(params) === false){
          throw new Error('params must be array');
        }

        me.addEvent(eventName);
        me.on(eventName, handler, scope, params);
      }
    }
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} scope
   * @param {Object} params
   */
  on: function(eventName, fn, scope, params){

    if( this.$events[eventName] === undefined ){
      throw new Error('Event name is not set: ' + eventName);
    }

    if(fn === undefined){
      throw new Error('Handler is undefined. Name of event is ' + eventName + '.');
    }

    fn.$fancyFnSeed = seedFn;
    fns[seedFn] = fn;
    seedFn++;

    this.$events[eventName].push({
      fn:fn,
      scope: scope,
      params: params || []
    });
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   */
  un: function(eventName, fn){
    var me = this,
      $events = me.$events[eventName];

    if(!$events){
      return false;
    }

    var i = 0,
      iL = $events.length;

    for(;i<iL;i++){
      var lis = $events[i];
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
  once: function(eventName, fn, scope){
    var me = this,
      fnWrapper = function(){
        fn.apply(this, arguments);
        me.un(eventName, fnWrapper);
      };

    me.on(eventName, fnWrapper, scope);
  },
  /*
   *
   */
  unAll: function(){
    this.$events = {};
  },
  /*
   * @param {String} eventName
   */
  unAllByType: function(eventName){
    this.$events[eventName] = [];
  },
  /*
   * @param {String} eventName
   */
  fire: function(eventName){
    var me = this,
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

      lis.fn.apply(lis.scope || me, _args);
    }
  },
  /*
   * @param {String} eventName
   * @return {Array}
   */
  addEvent: function(eventName){
    return this.addEvents(eventName);
  },
  /*
   * @param {String...} eventName
   * @return {Array}
   */
  addEvents: function(eventName){
    var me = this;

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
  has: function(eventName){
    var lis = this.$events[eventName];
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
      var me = this;

      me.Super('const', arguments);
      me.init();
    },
    /*
     *
     */
    init: function(){
      var me = this;

      me.addEvents('loaded');
    }
  });

})();
/*
 * @mixin Fancy.store.mixin.Edit
 */
Fancy.Mixin('Fancy.store.mixin.Edit', {
  //TODO: too slow for big data, needs redo. Add some map.
  idSeed: 0,
  /*
   * @param {Object} o
   */
  remove: function(o){
    var me = this,
      i = 0,
      iL = me.getTotal(),
      //id = o.id || o.data.id,
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

    if(me.proxyType === 'server' && me.autoSave){
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

    me.fire('remove', id, itemData);
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
   * @param {Object} o
   * @return {Fancy.Model}
   */
  add: function(o){
    var me = this,
      model = me.model,
      item;

    return me.insert(me.getTotal(), o);
  },
  /*
   * @param {Number} index
   * @param {Object} o
   * @return {Fancy.Model}
   */
  insert: function(index, o){
    var me = this,
      model = me.model;

    me.addIndex = index;

    if(o.id === undefined){
      me.idSeed++;
      if(me.proxyType === 'server'){
        o.id = 'Temp-' + me.idSeed;
      }
      else {
        o.id = me.getTotal() + me.idSeed;
      }
    }

    if(me.getById(o.id)){
      me.remove(o.id);
    }

    if(me.proxyType === 'server' && me.autoSave){
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
   *
   */
  onCreate: function(store, o){
    return this.insertItem(o);
  }
});
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
    }

    if(me.changed[id].length === 0){
      delete me.changed[id];
      me.changed.length--;
    }
  },
  /*
   *
   */
  onDirtyRemove: function(store, id, record){
    var me = this;

    me.removed[id] = record.data;
    me.removed.length++;
  },
  /*
   *
   */
  onDirtyInsert: function(store, o){
    var me = this;

    me.inserted[o.id] = o;
    me.inserted.length++;
  }
});
/*
 * @class Fancy.Store
 */
Fancy.define('Fancy.Store', {
  extend: Fancy.Event,
  mixins: [
    'Fancy.store.mixin.Paging',
    'Fancy.store.mixin.Proxy',
    'Fancy.store.mixin.Rest',
    'Fancy.store.mixin.Reader',
    'Fancy.store.mixin.Writer',
    'Fancy.store.mixin.Sort',
    'Fancy.store.mixin.Edit',
    'Fancy.store.mixin.Grouping',
    'Fancy.store.mixin.Filter',
    'Fancy.store.mixin.Search',
    'Fancy.store.mixin.Dirty'
  ],
  pageSize: 10,
  showPage: 0,
  pages: 0,
  dirty: false,
  /*
   * @constructor
   */
  constructor: function(){
    var me = this;

    me.Super('const', arguments);
    me.init();

    me.data = me.data || [];
    me.dataView = me.dataView || [];
    me.dataViewMap = me.dataViewMap  || {};
    me.map = {};

    me.setModel();

    if(me.data) {
      if (me.data.proxy) {
        me.initProxy();
      }
      else {
        me.setData(me.data);
      }
    }
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents(
      'add', 'change', 'changepages', 'set',
      //Proxy(server) CRUD-s events, maybe will be used not only for it, but now only for server CRUD-s
      'beforeupdate', 'update',
      'beforeremove',
      'remove',
      'beforedestroy', 'destroy',
      'beforecreate', 'create',
      'sort',
      'beforeload', 'load',
      'filter',
      'insert'
    );
    me.initId();
    me.initPlugins();

    if(me.paging){
      me.initPaging();
    }

    if( me.initTrackDirty ) {
      me.initTrackDirty()
    }
  },
  /*
   *
   */
  setModel: function(){
    var me = this,
      model = me.model;

    if(model === undefined){
      model = Fancy.Model;
    }
    else{
      model = Fancy.ClassManager.get(me.model);
    }

    me.model = model;
    me.fields = model.prototype.fields;
    if( me.fields === undefined){
      throw new Error('needed to set fields in Model of Store');
    }
  },
  /*
   * @param {Array} data
   */
  setData: function(data){
    var me = this,
      i = 0,
      iL = data.length,
      model = me.model,
      item;

    me.data = [];
    me.dataView = [];
    me.dataViewMap = {};
    me.dataViewIndexes = {};


    if(me.collapsed) {
      for (; i < iL; i++) {
        item = new model(data[i]);
        item.$index = i;

        me.data[i] = item;
        me.map[item.id] = item;
      }
    }
    else {
      if(me.expanded){
        for (; i < iL; i++) {
          item = new model(data[i]);
          item.$index = i;

          me.data[i] = item;
          me.map[item.id] = item;
        }
      }
      else {
        if(me.paging ){
          for (; i < iL; i++) {
            item = new model(data[i]);
            item.$index = i;

            me.data[i] = item;
            if(i < me.pageSize){
              me.dataView[i] = item;
              me.dataViewMap[item.id] = i;
              me.dataViewIndexes[i] = i;
            }
            me.map[item.id] = item;
          }
        }
        else {
          for (; i < iL; i++) {
            item = new model(data[i]);
            item.$index = i;

            me.data[i] = item;
            me.dataView[i] = item;
            me.dataViewMap[item.id] = i;
            me.dataViewIndexes[i] = i;
            me.map[item.id] = item;
          }
        }
      }
    }
  },
  /*
   * @param {Number} rowIndex
   * @return {Fancy.Model}
   */
  getItem: function(rowIndex){
    var me = this;

    return me.dataView[rowIndex];
  },
  /*
   * @param {Number} rowIndex
   * @param {String|Number} key
   * @param {Boolean} origin
   */
  get: function(rowIndex, key, origin){
    var me = this,
      data;

    if(rowIndex === undefined){
      return me.data;
    }

    if(key === undefined){
      data = me.dataView[rowIndex].data;
      if(data.id === undefined){
        data.id = me.dataView[rowIndex].id;
      }

      return me.dataView[rowIndex].data;
    }
    else if(key === 'none'){
      return '';
    }

    if(origin){
      return me.data[rowIndex].data[key];
    }
    else {
      return me.dataView[rowIndex].data[key];
    }
  },
  /*
   * @param {Number} rowIndex
   * @return {String|Number}
   */
  getId: function(rowIndex){
    return this.dataView[rowIndex].id;
  },
  /*
   * @param {Number} id
   * @return {Fancy.Model}
   */
  getRow: function(id){
    return this.dataViewMap[id];
  },
  /*
   * @param {Number} rowIndex
   * @param {String|Number} key
   * @param {String|Number} value
   */
  set: function(rowIndex, key, value){
    var me = this,
      item = me.dataView[rowIndex],
      id = item.data.id || item.id,
      oldValue = me.get(rowIndex, key);

    /*
    if(Fancy.isString(rowIndex)){
      id = rowIndex;
      rowIndex = me.getRow(id);
      item = me.dataView[rowIndex];
      oldValue = me.get(rowIndex, key);
    }
    else {
      item = me.dataView[rowIndex];
      id = item.data.id || item.id;
      oldValue = me.get(rowIndex, key);
    }
    */

    if(oldValue == value){
      return;
    }

    me.dataView[rowIndex].data[key] = value;

    if(me.proxyType === 'server' && me.autoSave){
      me.proxyCRUD('UPDATE', id, key, value);
    }

    me.fire('set', {
      id: id,
      data: me.dataView[rowIndex].data,
      rowIndex: rowIndex,
      key: key,
      value: value,
      oldValue: oldValue,
      item: item
    });
  },
  /*
   * @param {Number} rowIndex
   * @param {Object} data
   */
  setItemData: function(rowIndex, data){
    var me = this,
      pastData = me.get(rowIndex);

    for(var p in data){
      if(pastData[p] == data[p]){
        continue;
      }

      me.set(rowIndex, p, data[p]);
    }
  },
  /*
   * @return {Number}
   */
  getLength: function(){
    return this.dataView.length;
  },
  /*
   * @return {Number}
   */
  getTotal: function(){
    var me = this;

    if(me.pageType === 'server'){
      return me.totalCount;
    }

    if(me.filteredData){
      return me.filteredData.length;
    }

    return me.data.length;
  },
  /*
   * @param {Object} data
   */
  defineModel: function(data){
    var me = this,
      s = me.store;

    if(me.model && me.fields && me.fields.length !== 0){
      return;
    }

    var data = data || me.data || s.data,
      fields = me.getFieldsFromData(data),
      modelName = 'Fancy.model.'+Fancy.id();

    Fancy.define(modelName, {
      extend: Fancy.Model,
      fields: fields
    });

    me.model = modelName;
    me.fields = fields;

    me.setModel();
  },
  /*
   * @param {Object} data
   * @return {Array}
   */
  getFieldsFromData: function(data){
    var items = data.items || data;

    if( data.fields){
      return data.fields;
    }

    if( !items ){
      throw new Error('not set fields of data');
    }

    var itemZero = items[0],
      fields = [];

    for(var p in itemZero){
      fields.push(p);
    }

    return fields;
  },
  /*
   * @param {String|Number} key
   * @param {Object} options
   * @return {Array}
   */
  getColumnOriginalValues: function(key, options){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      values = [],
      options = options || {};

    if(options.smartIndexFn){
      for(;i<iL;i++){
        values.push(options.smartIndexFn(data[i].data));
      }
    }
    else{
      if(options.format){
        if(options.type === 'date'){
          for (; i < iL; i++) {
            values.push(Fancy.Date.parse(data[i].data[key], options.format));
          }
        }
        else{
          for (; i < iL; i++) {
            values.push(data[i].data[key]);
          }
        }
      }
      else {
        for (; i < iL; i++) {
          values.push(data[i].data[key]);
        }
      }
    }

    return values;
  },
  changeDataView: function(o){
    var me = this,
      o = o || {},
      groupBy,
      dataView = [],
      dataViewMap = {},
      i = 0,
      iL = me.data.length,
      isFiltered = !!me.filters,
      isSearched = !!me.searches,
      data = me.data;

    if(isFiltered) {
      if (!o.stoppedFilter) {
        me.filterData();
      }
      else if (me.paging && me.pageType === 'server') {
        return;
      }

      if (!me.remoteFilter) {
        data = me.filteredData;
        iL = data.length;
      }
    }

    if(isSearched) {
      me.searchData();
      data = me.searchedData;
      iL = data.length;
    }

    me.dataViewIndexes = {};
    me.dataViewMap = {};

    if(me.paging){
      if( me.pageType === 'server' ){
        i = 0;
      }
      else {
        i = me.showPage * me.pageSize;
      }

      iL = i + me.pageSize;
    }

    var totalCount = me.getTotal();

    if(iL > me.data.length){
      iL = me.data.length;
    }

    if(isFiltered && iL > totalCount){
      iL = totalCount;
    }

    if(Fancy.isObject(me.data)){
      iL = 0;
    }

    var item;

    if(me.order){
      if(me.grouping){
        groupBy = me.grouping.by;

        for(;i<iL;i++){
          if( me.expanded[ me.data[me.order[i]].data[groupBy] ] ){
            if(isFiltered === true){
              me.dataViewIndexes[dataView.length] = me.filterOrder[i];
              item = data[ i ];
            }
            else {
              me.dataViewIndexes[dataView.length] = me.order[i];
              item = data[me.order[i]];
            }

            dataView.push( item );

            dataViewMap[item.id] = dataView.length - 1;
          }
        }
      }
      else {
        for(;i<iL;i++){
          if(isFiltered === true){
            me.dataViewIndexes[dataView.length] = me.filterOrder[i];
            item = data[ i ]
          }
          else {
            me.dataViewIndexes[dataView.length] = me.order[i];
            item = data[me.order[i]];
          }

          dataView.push( item );
          dataViewMap[item.id] = dataView.length - 1;
        }
      }
    }
    else{
      if(me.grouping){
        groupBy = me.grouping.by;

        for(;i<iL;i++){
          if( me.expanded[ me.data[i].data[groupBy] ] ){
            me.dataViewIndexes[dataView.length] = i;
            item = data[i];
            dataView.push(item);
            dataViewMap[item.id] = dataView.length - 1;
          }
        }
      }
      else {
        for(;i<iL;i++){
          me.dataViewIndexes[dataView.length] = i;
          item = data[i];
          dataView.push(data[i]);
          dataViewMap[item.id] = dataView.length - 1;
        }
      }
    }

    me.dataView = dataView;
    me.dataViewMap = dataViewMap;
    me.fire('change');
  },
  /*
   * @param {String|Number} key
   * @param {Function} fn
   * @return {Array}
   */
  getColumnData: function(key, fn){
    var me = this,
      i = 0,
      iL = me.data.length,
      _data = [];

    if(fn){
      for (; i < iL; i++) {
        _data.push(fn(me.data[i].data));
      }
    }
    else {
      for (; i < iL; i++) {
        _data.push(me.data[i].data[key]);
      }
    }

    return _data;
  },
  /*
   * @returns {Array}
   */
  getData: function(){
    var me = this,
      i = 0,
      iL = me.data.length,
      _data = [];

    for(;i<iL;i++){
      _data.push(me.data[i].data);
    }

    return _data;
  },
  /*
   * @returns {Array}
   */
  getDataView: function(){
    var me = this,
      i = 0,
      iL = me.dataView.length,
      _data = [];

    for(;i<iL;i++){
      _data.push(me.dataView[i].data);
    }

    return _data;
  },
  /*
   * @param {String} id
   * @returns {Fancy.Model}
   */
  getById: function(id){
    var me = this;

    return me.map[id];
  },
  /*
   * @param {String} id
   * @param {String} newId
   */
  changeItemId: function(id, newId){
    var me = this,
      item = me.getById(id);

    if(!item){
      return false;
    }

    item.id = newId;
    if(item.data.id !== undefined){
      item.data.id = newId;
    }

    delete  me.map[id];
    me.map[newId] = item;
    me.fire('changeitemid', id, newId);
  },
  /*
   * @param {String|Number} key
   * @param {*} value
   * @returns {Array}
   */
  find: function(key, value){
    var me = this,
      dataView = me.dataView,
      i = 0,
      iL = dataView.length,
      item,
      founded = [];

    for(;i<iL;i++){
      item = dataView[i];

      if(item.data[key] === value){
        founded.push(i);
      }
    }

    return founded;
  },
  /*
   * @param {String} key
   * @param {*} value
   * @return {Array}
   */
  findItem: function(key, value){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      item,
      founded = [];

    for(;i<iL;i++){
      item = data[i];

      if(item.data[key] === value){
        founded.push(item);
      }
    }

    return founded;
  },
  /*
   * @param {String} id
   * @return {Array}
   */
  getDataIndex: function(id){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      item,
      founded;

    for(;i<iL;i++){
      item = data[i];

      if(item.data['id'] === id){
        founded = i;
      }
    }

    return founded;
  },
  /*
   * @param {Function} fn
   * @param {Object} scope
   */
  each: function(fn, scope){
    var me = this,
      dataView = me.dataView,
      i = 0,
      iL = dataView.length;

    if(scope){
      for(;i<iL;i++){
        fn.apply(this, [dataView[i]]);
      }
    }
    else{
      for(;i<iL;i++){
        fn(dataView[i]);
      }
    }
  }
});
Fancy.$ = window.$ || window.jQuery;

if(Fancy.$ === undefined){
  Fancy.nojQuery = true;
}
else{
  Fancy.nojQuery = false;
}

/*
 * @param {String|Number} id
 * @return {Fancy.Element}
 */
Fancy.get = function(id){
  var type = Fancy.typeOf(id);

  switch(type){
    case 'string':
      return new Fancy.Element(Fancy.$('#'+id)[0]);
      break;
    case 'array':
      return new Fancy.Elements(id);
      break;
    default:
      return new Fancy.Element(id);
      break;
  }
};

/*
 * @class Fancy.Element
 */
Fancy.Element = function(dom){
  var me = this;

  me.dom = dom;
  me.$dom = Fancy.$(dom);
  me.length = 1;
};

Fancy.Element.prototype = {
  /*
   * @param {String} selector
   * @return {Fancy.Element}
   */
  closest: function(selector){
    return Fancy.get(this.$dom.closest(selector)[0]);
  },
  /*
   *
   */
  destroy: function(){
    this.$dom.remove();
  },
  /*
   *
   */
  remove: function(){
    this.$dom.remove();
  },
  //Not Used
  /*
   *
   */
  prev: function(){
    return this.$dom.prev();
  },
  /*
   * @return {Fancy.Element}
   */
  firstChild: function(){
    return Fancy.get(this.$dom.children()[0]);
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} scope
   * @param {String} delegate
   */
  on: function(eventName, fn, scope, delegate) {
    var me = this;

    if(scope){
      fn = Fancy.$.proxy(fn, scope);
    }

    if(delegate){
      me.$dom.on(eventName, delegate, fn);
    }
    else{
      me.$dom.on(eventName, fn);
    }

    //bad bug fixies
    switch(eventName){
      case 'mouseenter':
        if(me.onTouchEnterEvent){
          me.onTouchEnterEvent(eventName, fn, scope, delegate);
        }
        break;
      case 'mouseleave':
        if(me.onTouchLeaveEvent){
          me.onTouchLeaveEvent(eventName, fn, scope, delegate);
        }
        break;
      case 'mousemove':
        if(me.onTouchMove){
          me.onTouchMove('touchmove', fn);
        }
        break;
    }
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} scope
   * @param {String} delegate
   */
  once: function(eventName, fn, scope, delegate) {
    var me = this;

    if (scope) {
      fn = Fancy.$.proxy(fn, scope);
    }

    if(delegate){
      me.$dom.one(eventName, delegate, fn);
    }
    else{
      me.$dom.one(eventName, fn);
    }
  },
  /*
   * @param {String} name
   * @return {String}
   */
  prop: function(name){
    return this.$dom.prop(name);
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} scope
   * @param {String} delegate
   */
  un: function(eventName, fn, scope, delegate) {
    var me = this;

    if (scope) {
      fn = Fancy.$.proxy(fn, scope);
    }

    if(delegate){
      me.$dom.off(eventName, delegate, fn);
    }
    else{
      me.$dom.off(eventName, fn);
    }
  },
  /*
   *
   */
  show: function(){
    this.$dom.show();
  },
  /*
   *
   */
  hide: function(){
    this.$dom.hide();
  },
  /*
   * @param {String} oldCls
   * @param {String} newCls
   */
  replaceClass: function(oldCls, newCls){
    var me = this;

    me.$dom.removeClass(oldCls);
    me.$dom.addClass(newCls);
  },
  /*
   * @param {String} tag
   * @return {Fancy.Element}
   */
  getByTag: function(tag){
    var me = this;
    return Fancy.get(me.$dom.find(tag)[0]);
  },
  getByClass: function(cls){
    var me = this;
    return me.$dom.find('.'+cls)[0];
  },
  /*
   * @param {String} cls
   */
  addClass: function(cls){
    var me = this;

    me.$dom.addClass(cls);
  },
  /*
   * @param {String} cls
   */
  removeClass: function(cls){
    var me = this;

    me.$dom.removeClass(cls);
  },
  /*
   * @param {String} cls
   * @return {Boolean}
   */
  hasClass: function(cls){
    var me = this;

    return me.$dom.hasClass(cls);
  },
  /*
   * @param {String} cls
   */
  toggleClass: function(cls){
    var me = this;

    me.$dom.toggleClass(cls);
  },
  /*
   * @param {String} selector
   * @return {Array}
   */
  select: function(selector){
    var me = this,
      founded = me.$dom.find(selector);

    if(founded.length === 1){
      return Fancy.get(founded[0]);
    }
    else if(founded.length > 1){
      return Fancy.get(founded);
    }
    else if(founded.length === 0){
      return {
        length: 0,
        dom: undefined,
        addClass: function(){},
        removeClass: function(){},
        destroy: function(){},
        css: function(){}
      };
    }

    return founded;
  },
  /*
   * @param {*} o1
   * @param {String|Number} o2
   * @return {String|Number}
   */
  css: function(o1, o2){
    if( o2 === undefined ){
      return this.$dom.css(o1);
    }
    return this.$dom.css(o1, o2);
  },
  /*
   * @param {*} attr
   * @param {String|Number} o2
   * @return {String|Number}
   */
  attr: function(o1, o2){
    if( o2 === undefined ){
      return this.$dom.attr(o1);
    }
    return this.$dom.attr(o1, o2);
  },
  /*
   * @param {String} html
   * @return {Fancy.Element}
   */
  append: function(html){
    return Fancy.get(this.$dom.append(html)[0]);
  },
  /*
   * @param {String} html
   * @return {Fancy.Element}
   */
  before: function(html){
    return this.$dom.before(html)[0];
  },
  /*
   * @param {String|Number} value
   * @return {Number}
   */
  height: function(value){
    if(value){
      this.$dom.height(value);
      return this;
    }

    return this.$dom.height();
  },
  /*
   * @param {String|Number} value
   * @return {Number}
   */
  width: function(value){
    if(value){
      this.$dom.width(value);
      return this;
    }

    return this.$dom.width();
  },
  /*
   * @param {String} selector
   * @return {Fancy.Element}
   */
  parent: function(selector){
    return Fancy.get(this.$dom.parent(selector)[0]);
  },
  /*
   * @param {String} html
   */
  update: function(html){
    this.dom.innerHTML = html;
  },
  /*
   * @param {Function} overFn
   * @param {Function} outFn
   */
  hover: function(overFn, outFn){
    if(overFn){
      this.$dom.on('mouseenter', overFn);
    }

    if(overFn){
      this.$dom.on('mouseleave', outFn);
    }
  },
  /*
   * @return {Object}
   */
  position: function(){
    return this.$dom.position();
  },
  /*
   * @return {Object}
   */
  offset: function(){
    return this.$dom.offset();
  },
  /*
   *
   */
  focus: function(){
    this.$dom.focus();
  },
  /*
   *
   */
  blur: function(){
    this.$dom.blur();
  },
  /*
   * @param {HTMLElement} child
   * @return {Boolean}
   */
  within: function(child){
    var me = this,
      childId,
      isWithin = true,
      removeId = false;

    child = Fancy.get(child);
    childId = child.attr('id');

    if(childId === undefined || childId === ''){
      childId = Fancy.id();
      removeId = true;
    }

    child.attr('id', childId);

    if( me.select('#' + childId).length === 0 ){
      isWithin = false;
    }

    if(me.dom.id === child.dom.id){
      isWithin = true;
    }

    if(removeId){
      me.removeAttr(childId);
    }

    return isWithin;
  },
  /*
   * @param {String} attr
   */
  removeAttr: function(attr){
    this.$dom.removeAttr(attr);
  },
  /*
   * @return {Fancy.Element}
   */
  item: function(){
    return this;
  },
  /*
   * @param {String} style
   * @param {Number} speed
   * @param {String} easing
   * @param {Function} callback
   */
  animate: function(style,speed,easing,callback){
    this.$dom.animate(style,speed,easing,callback);
  },
  /*
   * @return {Number}
   */
  index: function(){
    return this.$dom.index();
  },
  onTouchEnterEvent: function(eventName, fn, scope, delegate){
    var me = this,
      docEl = Fancy.get(document.body);

    var wrappedFn = function(e, target){
      var tempId = Fancy.id(),
        tempAttr = 'fancy-tempt-attr';

      me.attr(tempAttr, tempId);

      var touchXY = e.originalEvent.targetTouches[0],
        xy = [touchXY.pageX, touchXY.pageY],
        targetEl = Fancy.get( document.elementFromPoint(xy[0] - document.body.scrollLeft, xy[1] - document.body.scrollTop) ),
        isWithin = false,
        maxDepth = 10,
        parentEl = targetEl;

      while(maxDepth > 0){
        if( !parentEl.dom ){
          break;
        }

        if( parentEl.attr(tempAttr) === tempId ){
          isWithin = true;
          break;
        }
        parentEl = parentEl.parent();
        maxDepth--;
      }

      if( isWithin && !me.touchIn && !delegate){
        e.pageX = touchXY.pageX;
        e.pageY = touchXY.pageY;
        fn(e, target);
        me.touchIn = true;
      }

      if(isWithin && delegate){
        maxDepth = 10;
        parentEl = targetEl;
        var found = false,
          before = targetEl,
          arr = [],
          i = 0;

        while(maxDepth > 0){
          if(!parentEl.dom){
            break;
          }

          var delegates = parentEl.select(delegate);
          if(delegates.length !== 0){
            found = true;
            //var delegateTarget = arr[i - delegate.match(/\./g).length];
            var delegateTarget = me.getDelegateTarget(delegate, delegates, arr, i);

            if(delegateTarget){
              e.currentTarget = delegateTarget;
              e.delegateTarget = delegateTarget;
              e.pageX = touchXY.pageX;
              e.pageY = touchXY.pageY;
              me.touchIn = true;
              me.touchInDelegate = me.touchInDelegate || {};
              if(me.touchInDelegate[delegate] === undefined){
                me.touchInDelegate[delegate] = delegateTarget;
              }
              else if(me.touchInDelegate[delegate] !== delegateTarget){
                me.touchInDelegate[delegate] = [me.touchInDelegate[delegate], delegateTarget];
              }


              fn.apply(scope, [e, delegateTarget]);
            }
            break;
          }

          if(parentEl.attr(tempAttr) === tempId){
            break;
          }

          arr.push(parentEl.dom);
          before = parentEl;
          parentEl = parentEl.parent();
          maxDepth--;
          i++;
        }
      }

      me.removeAttr(tempAttr);
    };

    docEl.on('touchmove', wrappedFn);
  },
  onTouchLeaveEvent: function(eventName, fn, scope, delegate){
    var me = this,
      docEl = Fancy.get(document.body),
      arr = [];

    var wrappedFn = function(e, target){
      var tempId = Fancy.id(),
        tempAttr = 'fancy-tempt-attr';

      me.attr(tempAttr, tempId);

      if(me.touchIn !== true){
        me.removeAttr(tempAttr);
        return;
      }

      var touchXY = e.originalEvent.targetTouches[0],
        xy = [touchXY.pageX, touchXY.pageY],
        targetEl = Fancy.get( document.elementFromPoint(xy[0] - document.body.scrollLeft, xy[1] - document.body.scrollTop) );

      if(!delegate){
        var isWithin = false,
          maxDepth = 10,
          parentEl = targetEl;

        while(maxDepth > 0){
          if( !parentEl.dom ){
            break;
          }

          if( parentEl.attr(tempAttr) === tempId ){
            isWithin = true;
            break;
          }
          parentEl = parentEl.parent();
          maxDepth--;
        }

        if(isWithin === false){
          e.pageX = touchXY.pageX;
          e.pageY = touchXY.pageY;

          me.touchIn = false;
          fn(e, target);
          me.removeAttr(tempAttr);
          return;
        }
      }

      if(arr.length > 30){
        arr = arr.slice(arr.length - 5, arr.length - 1);
      }

      arr.push(targetEl.dom);

      if(delegate && me.touchInDelegate[delegate]){
        var delegateTarget,
          delegateTempId = Fancy.id();

        if(Fancy.isArray(me.touchInDelegate[delegate])){
          delegateTarget = Fancy.get(me.touchInDelegate[delegate][0]);
        }
        else{
          delegateTarget = Fancy.get(me.touchInDelegate[delegate]);
        }

        delegateTarget.attr(tempAttr, delegateTempId);

        maxDepth = 10;
        var found = false;
        parentEl = targetEl;

        while(maxDepth > 0){
          if( !parentEl.dom ){
            break;
          }

          if( parentEl.attr(tempAttr) === delegateTempId ){
            found = true;
            break;
          }

          parentEl = parentEl.parent();
          maxDepth--;
        }

        delegateTarget.removeAttr(tempAttr);

        if(!found){
          delete me.touchInDelegate[delegate];
          me.touchIn = false;

          e.currentTarget = delegateTarget.dom;
          e.delegateTarget = delegateTarget.dom;
          e.pageX = touchXY.pageX;
          e.pageY = touchXY.pageY;

          fn(e, delegateTarget.dom);
        }
      }

      me.removeAttr(tempAttr);
    };

    docEl.on('touchmove', wrappedFn);
  },
  getDelegateTarget: function(delegate, delegates, arr, _i){
    var fastGetDelegate = arr[_i - delegate.match(/\./g).length],
      i = 0,
      iL = delegates.length;

    for(;i<iL;i++){
      if(delegates.item(i).dom === fastGetDelegate){
        return fastGetDelegate;
      }
    }

    return false;
  },
  onTouchMove: function(eventName, fn, scope){
    var me = this,
      docEl = Fancy.get(document.body);

    var wrappedFn = function(e, target){
      var tempId = Fancy.id(),
        tempAttr = 'fancy-tempt-attr';

      me.attr(tempAttr, tempId);

      var touchXY = e.originalEvent.targetTouches[0],
        xy = [touchXY.pageX, touchXY.pageY],
        isWithin = false,
        maxDepth = 10,
        targetEl = Fancy.get( document.elementFromPoint(xy[0] - document.body.scrollLeft, xy[1] - document.body.scrollTop) ),
        parentEl = targetEl;

      while(maxDepth > 0){
        if( !parentEl.dom ){
          break;
        }

        if( parentEl.attr(tempAttr) === tempId ){
          isWithin = true;
          break;
        }
        parentEl = parentEl.parent();
        maxDepth--;
      }

      me.removeAttr(tempAttr);

      if(!isWithin){
        return;
      }

      e.pageX = touchXY.pageX;
      e.pageY = touchXY.pageY;

      fn(e, target);
    };

    docEl.on('touchmove', wrappedFn);
  }
};

/*
 * @class Fancy.Elements
 * @constructor
 * @param {HTMLElement|HTMLElements} dom
 */
Fancy.Elements = function(dom){
  var me = this;

  me.dom = dom;
  me.$dom = dom;
  me.length = dom.length;
};

Fancy.Elements.prototype = {
  /*
   * @param {String} cls
   */
  addClass: function(cls){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).addClass(cls);
    }
  },
  /*
   * @param {String} cls
   */
  removeClass: function(cls){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).removeClass(cls);
    }
  },
  /*
   * @param {Function} fn
   */
  hover: function(fn){
    this.$dom.on('mouseenter', fn);
  },
  /*
   *
   */
  on: Fancy.Element.prototype.on,
  /*
   *
   */
  once: Fancy.Element.prototype.once,
  /*
   * @param {Number} index
   * @return {Fancy.Element}
   */
  item: function(index){
    return Fancy.get(this.$dom[index]);
  },
  /*
   * @param {*} o1
   * @param {String|Number} o2
   * @return {String|Number}
   */
  css: function(o1, o2){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).css(o1, o2);
    }
  },
  /*
   * @param {String} cls
   */
  toggleClass: function(cls){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).toggleClass(cls);
    }
  },
  /*
   *
   */
  destroy: function(){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).destroy();
    }
  },
  /*
   *
   */
  hide: function(){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).hide();
    }
  },
  /*
   *
   */
  show: function(){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).show();
    }
  },
  /*
   * @return {Number}
   */
  index: function(){
    return this.$dom[0].index();
  }
};

/*
 * @param {String} selector
 */
Fancy.select = function(selector){
  return Fancy.get(document.body).select(selector);
};

/*
  Fancy.onReady
*/

/*
 * @param {Function} fn
 */
Fancy.onReady = function(fn){
  $(document).ready(fn);
};

/**
 * @example:
 * Fancy.Ajax({
 *   url: 'users.json',
 *   success: function(){
 *     console.log(arguments);
 *   }
 * });
 */

/*
 * @param {Object} o
 */
Fancy.Ajax = function(o){
  var _o = {};

  if( o.url ){
    _o.url = o.url;
  }

  if( o.success ){
    _o.success = o.success;
  }

  if( o.error ){
    _o.error = o.error;
  }

  if( o.method ){
    //_o.type = o.type;
    _o.type = o.method;
  }

  if( o.params ){
    _o.data = o.params;
  }

  if(o.sendJSON){
    _o.dataType = 'json';
    _o.contentType = "application/json; charset=utf-8";
    _o.data = JSON.stringify(_o.data);
  }

  if(o.getJSON){
    _o.dataType = 'json';
    _o.contentType = "application/json; charset=utf-8";
  }

  if(o.headers){
    _o.headers = o.headers;
  }

  Fancy.$.ajax(_o);
};
/**
 * English Translations
 */

Fancy.i18n.en = {
  paging: {
    first: 'First Page',
    last: 'Last Page',
    prev: 'Previous Page',
    next: 'Next Page',
    info: 'Rows [0] - [1] of [2]',
    page: 'Page',
    of: 'of [0]'
  },
  loadingText: 'Loading...',
  thousandSeparator: ',',
  decimalSeparator: '.',
  currencySign: '$',
  sourceText: 'Source',
  date: {
    read: 'm/d/Y',
    write: 'm/d/Y',
    edit: 'm/d/Y',
    today: 'Today',
    startDay: 0,
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    am: 'am',
    pm: 'pm',
    AM: 'AM',
    PM: 'PM',
    ok: 'OK',
    cancel: 'Cancel'
  },
  yes: 'Yes',
  no: 'No',
  dragText: '[0] selected row[1]',
  update: 'Update',
  cancel: 'Cancel',
  columns: 'Columns',
  sortAsc: 'Sort ASC',
  sortDesc: 'Sort DESC'
};

Fancy.i18n['en-US'] = Fancy.i18n.en;
Fancy.controllers = {

};

/*
 * @param {String} name
 * @param {Object} o
 */
Fancy.defineController = function(name, o){
  Fancy.controllers[name] = o;
};

/*
 * @param {String} name
 * @return {Object}
 */
Fancy.getController = function(name){
  return Fancy.controllers[name];
};
/**
 * @class Fancy.DD
 * @singleton
 * @extends Fancy.Event
 */
Fancy.define('Fancy.DD', {
  extend: Fancy.Event,
  singleton: true,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;
    
    me.Super('const', arguments);    

    me.init();
  },
  /*
   *
   */
  init: function(){
    var me = this;
    
    me.addEvents();
    
    me.els = {};
  },
  /*
   * @param {Object} o
   */
  add: function(o){
    var me = this,
      id = Fancy.id(o.overEl);

    /*
      {
        dragEl: El,
        overEl: El
      }
    */

    me.els[id] = o;
    //o.dragEl.on('mousedown', me.onMouseDown, me);
    o.overEl.on('mousedown', me.onMouseDown, me);
  },
  /*
   * @param {Object} e
   */
  onMouseDown: function(e){
    var me = this,
      doc = Fancy.get(document),
      overEl = Fancy.get(e.currentTarget),
      dragEl = me.els[overEl.attr('id')].dragEl;

    e.preventDefault();

    me.clientX = e.clientX;
    me.clientY = e.clientY;

    me.startX = parseInt(dragEl.css('left'));
    me.startY = parseInt(dragEl.css('top'));

    me.activeId = overEl.attr('id');

    doc.once('mouseup', me.onMouseUp, me);
    doc.on('mousemove', me.onMouseMove, me);
  },
  /*
   *
   */
  onMouseUp: function(){
    var me = this,
      doc = Fancy.get(document);

    doc.un('mousemove', me.onMouseMove, me);
  },
  /*
   * @param {Object} e
   */
  onMouseMove: function(e){
    var me = this,
      activeO = me.els[me.activeId],
      dragEl = activeO.dragEl,
      clientX = e.clientX,
      clientY = e.clientY,
      deltaX = me.clientX - clientX,
      deltaY = me.clientY - clientY;

    dragEl.css({
      left: me.startX - deltaX,
      top: me.startY - deltaY
    });
  }
});
/**
 * @class Fancy.Widget
 * @extends Fancy.Event
 */
Fancy.define('Fancy.Widget', {
  extend: Fancy.Event,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    Fancy.applyConfig(me, config || {});

    me.preInitControls();
    me.Super('const', arguments);

    me.init();
    me.initControls();
  },
  /*
   *
   */
  init: function(){
    //not runned in grid
    //maybe to redo that run
    var me = this;

    me.initId();
    me.addEvents(
      'beforerender', 'afterrender', 'render', 'show', 'beforehide', 'hide', 'destroy'
    );
    me.initPlugins();
  },
  /*
   * @param {String|HTMLElement}
   */
  renderItems: function(renderTo){
    var me = this,
      i = 0,
      iL = me.items.length;

    for(;i<iL;i++){
      var item = me.items[i],
        w = Fancy.getClassByType(item.type);

      item.renderTo = renderTo;
      me.items[i] = new w(item);
    }
  },
  /*
   *
   */
  preInitControls: function(){
    var me = this,
      controller = me.controller || me.controllers;

    if(controller){
      switch(Fancy.typeOf(controller)){
        case 'string':
          controller = Fancy.getController(controller);

          for(var p in controller){
            if(me[p] === undefined ) {
              me[p] = controller[p];
            }
          }
          break;
        case 'array':
          var controls = [],
            i = 0,
            iL = controller.length;

          for(;i<iL;i++){
            var _controller = Fancy.getController(controller[i]);

            for(var p in _controller){
              if(p === 'controls'){
                controls = controls.concat(_controller.controls);
                continue;
              }

              if(me[p] === undefined ) {
                me[p] = _controller[p];
              }
            }
          }

          me.controls = controls;

          break;
      }
    }
  },
  /*
   *
   */
  initControls: function(){
    var me = this;

    if(me.controls === undefined){
      return;
    }

    var controls = me.controls,
      i = 0,
      iL = controls.length;

    for(;i<iL;i++){
      var control = controls[i];

      if(control.event === undefined){
        throw new Error('[FancyGrid Error]: - not set event name for control');
      }

      if(control.handler === undefined){
        throw new Error('[FancyGrid Error]: - not set handler for control');
      }

      var event = control.event,
        handler = control.handler,
        scope = control.scope || me,
        selector = control.selector;

      if(Fancy.isString(handler)){
        handler = me[handler];
      }

      if(selector) {
        (function (event, handler, scope, selector) {
          if(me.$events[event]){
            me.on(event, function(grid, o){
              var target = o.e.target,
                el = Fancy.get(target),
                parentEl = el.parent(),
                selectored = parentEl.select(selector);

              if(selectored.length === 1 && selectored.within(target)){
                handler.apply(scope, arguments);
              }
              else if(selectored.length > 1){
                var j = 0,
                  jL = selectored.length;

                for(;j<jL;j++){
                  if( selectored.item(j).within(target) ){
                    handler.apply(scope, arguments);
                  }
                }
              }
            }, scope);
          }
          else {
            me.on('render', function () {
              me.el.on(event, handler, scope, selector);
            });
          }
        })(event, handler, scope, selector);
      }
      else if(selector === undefined && control.widget === undefined){
        me.on(event, handler, scope);
      }
    }
  },
  css: function(o1, o2){
    var me = this;

    return me.el.css(o1, o2);
  },
  addClass: function(value){
    this.el.addClass(value);
  },
  removeClass: function(value){
    this.el.removeClass(value);
  },
  hasClass: function(value){
    this.el.hasClass(value);
  },
  toggleClass: function(value){
    this.el.toggleClass(value);
  },
  destroy: function(){
    var me = this;

    if(me.el){
      me.el.destroy();
    }
  }
});
/*
 * @class Fancy.Plugin
 */
Fancy.define('Fancy.Plugin', {
  extend: Fancy.Event,
  /*
   * @constructor {Object} config
   */
  constructor: function(config){
    var me = this;

    me.Super('const', arguments);

    me.init();
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.initId();
    me.addEvents('beforerender', 'afterrender', 'render', 'show', 'hide', 'destroy');
  }
});

(function() {
  var toggleGroups = {};

  /**
   * @class Fancy.Button
   * @extends Fancy.Widget
   */
  Fancy.define('Fancy.Button', {
    extend: Fancy.Widget,
    //minWidth: 43,
    minWidth: 30,
    /*
     * @constructor
     * @param {Object} config
     * @param {Object} scope
     */
    constructor: function(config, scope){
      var me = this;

      if (config.toggleGroup) {
        toggleGroups[config.toggleGroup] = toggleGroups[config.toggleGroup] || {
            active: false,
            items: []
          };

        toggleGroups[config.toggleGroup].items.push(me);
      }

      me.scope = scope;

      me.Super('const', arguments);
    },
    /*
     *
     */
    init: function(){
      var me = this;

      me.addEvents('click', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'pressedchange');
      me.Super('init', arguments);

      me.style = me.style || {};

      me.initTpl();
      me.render();
      me.setOns();
    },
    /*
     *
     */
    setOns: function () {
      var me = this,
        el = me.el;

      el.on('click', me.onClick, me);
      el.on('mousedown', me.onMouseDown, me);
      el.on('mouseup', me.onMouseUp, me);
      el.on('mouseover', me.onMouseOver, me);
      el.on('mouseout', me.onMouseOut, me);

      if(me.tip){
        el.on('mousemove', me.onMouseMove, me);
      }
    },
    widgetCls: 'fancy-button',
    cls: '',
    disabledCls: 'fancy-button-disabled',
    extraCls: '',
    text: '',
    height: 28,
    paddingTextWidth: 5,
    imageWidth: 20,
    pressed: false,
    tpl: [
      '<div class="fancy-button-image"></div>',
      '<a class="fancy-button-text">{text}</a>',
      '<div class="fancy-button-drop" style="{dropDisplay}"></div>'
    ],
    /*
     *
     */
    initTpl: function () {
      var me = this;

      me.tpl = new Fancy.Template(me.tpl);
    },
    /*
     *
     */
    render: function(){
      var me = this,
        renderTo,
        el = Fancy.get(document.createElement('div')),
        width = 0;

      me.fire('beforerender');

      if( me.wrapper ){
        me.renderWrapper();
      }

      renderTo = Fancy.get(me.renderTo || document.body).dom;

      if(me.width){
        width = me.width;
      }
      else{
        if(me.text !== false){
          width += me.text.length * 7 + 7*2;
        }
      }

      if(me.imageColor){
        me.imageCls = 'fancy-button-image-color';
      }

      if(width < me.minWidth){
        if(me.text && me.text.length > 0){
          width = me.minWidth;
        }
        else{
          width = me.minWidth;
        }
      }

      if(me.imageCls && me.text){
        width += me.imageWidth;
      }

      el.addClass(Fancy.cls);
      el.addClass(me.widgetCls);
      el.addClass(me.cls);
      el.addClass(me.extraCls);

      if (me.disabled) {
        el.addClass(me.disabledCls);
      }

      el.css({
        width: width + 'px',
        height: me.height + 'px'
      });

      el.css(me.style || {});

      el.update(me.tpl.getHTML({
        text: me.text || ''
      }));

      if(me.imageCls){
        var imageEl = el.select('.fancy-button-image');
        if(me.imageColor){
          imageEl.css('background-color', me.imageColor);
        }
        imageEl.css('display', 'block');
        if(Fancy.isString(me.imageCls)){
          imageEl.addClass(me.imageCls);
        }
      }

      me.el = Fancy.get(renderTo.appendChild(el.dom));

      Fancy.each(me.style, function (value, p) {
        me.el.css(p, value);
      });

      if (me.disabled) {
        me.disable();
      }

      if(me.pressed){
        me.setPressed(me.pressed);
      }

      me.initToggle();

      me.width = width;

      me.fire('afterrender');
      me.fire('render');
    },
    /*
     *
     */
    renderWrapper: function(){
      var me = this,
        wrapper = me.wrapper,
        renderTo = Fancy.get(me.renderTo || document.body).dom,
        el = Fancy.get(document.createElement('div'));

      el.css(wrapper.style || {});
      el.addClass(wrapper.cls || '');

      me.wrapper = Fancy.get(renderTo.appendChild(el.dom));

      me.renderTo = me.wrapper.dom;

    },
    /*
     *
     */
    initToggle: function(){
      var me = this;

      if (!me.enableToggle) {
        return;
      }
    },
    /*
     * @param {Boolean} value
     */
    setPressed: function(value, fire){
      var me = this;

      if (value) {
        me.addClass('fancy-button-pressed');
        //me.el.removeClass('fancy-button-not-pressed');
        me.pressed = true;

        if(me.toggleGroup){
          var active = toggleGroups[me.toggleGroup].active;
          if(active){
            active.setPressed(false);
          }

          toggleGroups[me.toggleGroup].active = me;
        }
      }
      else {
        //me.el.addClass('fancy-button-not-pressed');
        me.removeClass('fancy-button-pressed');
        me.pressed = false;
      }

      if(fire !== false){
        me.fire('pressedchange', me.pressed);
      }
    },
    /*
     *
     */
    toggle: function(){
      var me = this,
        value = !me.pressed;

      me.setPressed(value);
      me.pressed = value;
    },
    /*
     *
     */
    onClick: function(){
      var me = this,
        handler = me.handler;

      me.fire('click');

      if(me.disabled !== true){
        if(handler){
          if(Fancy.isString(handler)){
            handler = me.getHandler(handler);
          }

          if (me.scope) {
            handler.apply(me.scope, [me]);
          }
          else {
            handler(me);
          }
        }

        if(me.enableToggle){
          if(me.toggleGroup){
            me.setPressed(true);
          }
          else {
            me.toggle();
          }
        }
      }
    },
    /*
     * @param {String} name
     */
    getHandler: function(name){
      var me = this,
        grid = Fancy.getWidget(me.el.parent().parent().select('.fancy-grid').attr('id'));

      return grid[name] || function(){
          throw new Error('[FancyGrid Error] - handler does not exist');
        };
    },
    /*
     *
     */
    onMouseDown: function(){
      var me = this;

      me.fire('mousedown');
    },
    /*
     *
     */
    onMouseUp: function(){
      var me = this;

      me.fire('mouseup');
    },
    /*
     * @param {Object} e
     */
    onMouseOver: function(e){
      var me = this;

      me.fire('mouseover');

      if(me.tip){
        me.renderTip(e);
      }
    },
    /*
     * @param {Object} e
     */
    renderTip: function(e){
      var me = this;

      if(me.tooltip){
        me.tooltip.destroy();
      }

      me.tooltip = new Fancy.ToolTip({
        text: me.tip
      });

      me.tooltip.css('display', 'block');
      me.tooltip.show(e.pageX + 15, e.pageY - 25);
    },
    /*
     *
     */
    onMouseOut: function(){
      var me = this;

      me.fire('mouseout');

      if(me.tooltip){
        me.tooltip.destroy();
        delete me.tooltip;
      }
    },
    /*
     * @param {String} text
     */
    setText: function(text){
      var me = this,
        el = me.el;

      me.css('width', ((parseInt(el.css('font-size')) + 2 ) * text.length) + parseInt(me.css('padding-right')) * 2 + 2  );

      el.select('.fancy-button-text').update(text);
    },
    /*
     *
     */
    disable: function(){
      var me = this;

      me.disabled = true;
      me.el.addClass(me.disabledCls);
    },
    /*
     *
     */
    enable: function(){
      var me = this;

      me.disabled = false;
      me.el.removeClass(me.disabledCls);
    },
    /*
     *
     */
    onMouseMove: function(e){
      var me = this;

      if(me.tip && me.tooltip){
        me.tooltip.show(e.pageX + 15, e.pageY - 25);
      }
    }
  });
})();
/**
 * @class Fancy.SegButton
 * @extends Fancy.Widget
 */
Fancy.define('Fancy.SegButton', {
  extend: Fancy.Widget,
  /*
   * @param {Object} config
   * @param {Object} scope
   */
  constructor: function(config, scope){
    var me = this;

    me.scope = scope;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('toggle');
    me.Super('init', arguments);

    me.style = me.style || {};

    me.render();
    me.setOns();
  },
  /*
   *
   */
  setOns: function(){
    var me = this,
      el = me.el;


  },
  widgetCls: 'fancy-seg-button',
  cls: '',
  extraCls: '',
  text: '',
  /*
   *
   */
  render: function(){
    var me = this,
      renderTo,
      el = Fancy.get(document.createElement('div')),
      width = 0;

    me.fire('beforerender');

    renderTo = Fancy.get(me.renderTo || document.body).dom;

    el.addClass(Fancy.cls);
    el.addClass(me.widgetCls);
    el.addClass(me.cls);
    el.addClass(me.extraCls);

    me.el = Fancy.get(renderTo.appendChild(el.dom));

    Fancy.each(me.style, function (value, p) {
      me.el.css(p, value);
    });

    me.renderButtons();

    me.fire('afterrender');
    me.fire('render');
  },
  /*
   *
   */
  renderButtons: function(){
    var me = this,
      items = me.items,
      i = 0,
      iL = items.length,
      toggleGroup = Fancy.id(null, 'fancy-toggle-group-');

    for(;i<iL;i++){
      var item = items[i];
      item.renderTo = me.el.dom;

      if(me.allowToggle !== false) {
        item.enableToggle = true;
        if(me.multiToggle !== true){
          item.toggleGroup = toggleGroup;
        }
      }

      if(i === 0){
        item.style = {
          'border-right-width': 0,
          'border-top-right-radius': 0,
          'border-bottom-right-radius': 0
        };
      }
      else if(i > 1){
        item.style = {
          'border-left-width': 0,
          'border-top-left-radius': 0,
          'border-bottom-left-radius': 0
        };
      }
      else{
        item.style = {
          'border-top-left-radius': 0,
          'border-bottom-left-radius': 0
        };
      }

      if(items.length > 2 && i !== 0 && i !== iL - 1){
        Fancy.apply(item.style, {
          'border-top-right-radius': 0,
          'border-bottom-right-radius': 0,
          'border-top-left-radius': 0,
          'border-bottom-left-radius': 0
        });
      }

      me.items[i] = new Fancy.Button(item);
      me.items[i].on('pressedchange', function(button, value){
        me.fire('toggle', button, value, me.getValues());
      });
    }
  },
  getValues: function(){
    var me = this,
      values = [],
      items = me.items,
      i = 0,
      iL = items.length;

    for(;i<iL;i++){
      values.push(items[i].pressed);
    }

    return values;
  },
  /*
   *
   */
  clear: function(fire){
    var me = this,
      items = me.items,
      i = 0,
      iL = items.length;

    for(;i<iL;i++){
      items[i].setPressed(false, fire);
    }
  }
});
/**
 * @class Fancy.toolbar.Tab
 * @extends Fancy.Button
 */
Fancy.define('Fancy.toolbar.Tab', {
  extend: Fancy.Button,
  /*
   * @constructor
   * @param config
   * @param scope
   */
  constructor: function(config, scope){
    var me = this;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;
  
    me.Super('init', arguments);
  },
  cls: 'fancy fancy-button fancy-toolbar-tab',
  /*
   *
   */
  render: function(){
    var me = this;

    me.Super('render', arguments);
  }
});
/*
 * @mixin Fancy.panel.mixin.PrepareConfig
 */
Fancy.Mixin('Fancy.panel.mixin.PrepareConfig', {
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   */
  prepareConfigTheme: function(config, originalConfig){
    var themeName = config.theme || originalConfig.theme,
      themeConfig = Fancy.getTheme(themeName).config;

    if(Fancy.isObject(themeName)){
      config.theme = themeName.name;
    }

    Fancy.applyIf(config, themeConfig);

    return config;
  },
  //The same in grid
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigFooter: function(config){
    var me = this,
      footer = config.footer,
      lang = config.lang;

    if(footer){
      var bar = [];

      if(Fancy.isString(footer.status)){
        bar.push({
          type: 'text',
          text: footer.status,
          cls: 'fancy-footer-status'
        });
      }

      if(footer.status && footer.source) {
        bar.push('side');
      }

      if(Fancy.isString(footer.source)){
        bar.push({
          type: 'text',
          text: footer.source,
          cls: 'fancy-footer-source'
        });
      }
      else if(Fancy.isObject(footer.source)){
        var text = footer.source.text,
          sourceText = footer.source.sourceText || lang.sourceText;

        if(footer.source.link){
          var link = footer.source.link;

          link = link.replace('http://', '');
          link = 'http://' + link;

          text = '<span class="fancy-status-source-text">'+sourceText+'</span>: <a class="fancy-status-source-link" href="'+link+'">'+text+'</a>';
        }
        else{
          text = '<span>'+sourceText+':</span> ' + text;
        }

        bar.push({
          type: 'text',
          text: text,
          cls: 'fancy-footer-source'
        });
      }

      config.footer = bar;
    }

    return config;
  },
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfigLang:  function(config, originalConfig){
    var i18n = originalConfig.i18n || config.i18n,
      lang = Fancy.Object.copy(Fancy.i18n[i18n]);

    if(config.lang) {
      for(var p in config.lang){
        if(Fancy.isObject(config.lang[p]) === false){
          lang[p] = config.lang[p];
        }
      }

      lang.paging = {};
      if (config.lang.paging) {
        Fancy.apply(lang.paging, config.lang.paging);
      }

      for (var p in config.lang.paging) {
        if (p === 'paging') {
          continue;
        }

        if (Fancy.isObject(p)) {
          continue;
        }

        lang[p] = config.lang.paging[p];
      }

      lang.date = {};
      if (config.lang.date) {
        Fancy.apply(lang.date, config.lang.date);
      }
    }

    config.lang = lang;

    return config;
  }
});
/*
 * @mixin Fancy.panel.mixin.methods
 */
Fancy.Mixin('Fancy.panel.mixin.methods', {
  /*
   * @param {String} value
   */
  setTitle: function(value){
    var me = this;

    if(me.panel){
      me.panel.setTitle(value);
    }
  },
  /*
   * @return {String}
   */
  getTitle: function(){
    var me = this;

    if(me.panel){
      return me.panel.getTitle();
    }
  },
  /*
   * @param {String} value
   */
  setSubTitle: function(value){
    var me = this;

    if(me.panel){
      me.panel.setSubTitle(value);
    }
  },
  /*
   * @return {String}
   */
  getSubTitle: function(){
    var me = this;

    if(me.panel){
      return me.panel.getSubTitle();
    }
  }
});
/*
 * @mixin Fancy.panel.mixin.DD
 */
Fancy.Mixin('Fancy.panel.mixin.DD', {
  ddCls: 'fancy-panel-draggable',
  /*
   *
   */
  initDD: function(){
    var me = this,
      w = me.widget;

    me.addDDCls();
    me.addDD();
  },
  /*
   *
   */
  addDDCls: function(){
    var me = this;

    me.el.addClass(me.ddCls);
  },
  /*
   *
   */
  addDD: function(){
    var me = this;

    Fancy.DD.add({
      dragEl: me.el,
      overEl: me.el.select('.fancy-panel-header').item(0)
    });
  }
});
/*
 * @mixin Fancy.panel.mixin.Resize
 */
Fancy.Mixin('Fancy.panel.mixin.Resize', {
  cornerResizeCls: 'fancy-panel-resize-corner',
  resizeMaskCls: 'fancy-panel-resize-mask',
  /*
   *
   */
  initResize: function(){
    var me = this,
      w = me.widget;

    me.addEvents('resize');
    me.activeResizeEl = undefined;

    me.renderResizeEls();
    me.onsResizeEls();
  },
  /*
   *
   */
  renderResizeEls: function(){
    var me = this,
      el = me.el,
      cornerEl = Fancy.get(document.createElement('div'));

    cornerEl.addClass(me.cornerResizeCls);

    me.cornerResizeEl = Fancy.get(el.dom.appendChild(cornerEl.dom));
  },
  /*
   *
   */
  onResize: function(){
    var me = this;

    if(me.tbar){
      me._tbar.applyScrollChanges();
    }

    if(me.subTBar){
      me._subTBar.applyScrollChanges();
    }

    if(me.bbar){
      me._bbar.applyScrollChanges();
    }

    if(me.footer){
      me._footer.applyScrollChanges();
    }

    if(me.buttons){
      me._buttons.applyScrollChanges();
    }
  },
  /*
   * @param {Boolean} initRun
   */
  onsResizeEls: function(initRun){
    var me = this;

    me.cornerResizeEl.on('mousedown', me.onMouseDownResizeEl, me);

    me.on('resize', me.onResize, me);
  },
  /*
   * @param {Object} e
   */
  onMouseDownResizeEl: function(e){
    var me = this,
      docEl = Fancy.get(document);

    e.preventDefault();
    docEl.once('mouseup', me.onMouseUpResize, me);
    docEl.on('mousemove', me.onMouseMoveResize, me);
    me.renderResizeMask();

    me.startClientX = e.clientX;
    me.startClientY = e.clientY;
  },
  /*
   *
   */
  onMouseUpResize: function(){
    var me = this,
      docEl = Fancy.get(document);

    delete me.activeResizeEl;
    me.resizeMaskEl.destroy();

    delete me.startClientX;
    delete me.startClientY;

    docEl.un('mousemove', me.onMouseMoveResize, me);

    me.setWidth(me.newResizeWidth);
    me.setHeight(me.newResizeHeight);

    me.fire('resize', {
      width: me.newResizeWidth,
      height: me.newResizeHeight
    });
  },
  /*
   * @param {Object} e
   */
  onMouseMoveResize: function(e){
    var me = this,
      el = me.el,
      maskWidth = 2,
      panelWidth = parseInt(el.css('width')) - maskWidth * 2,
      panelHeight = parseInt(el.css('height')) - maskWidth * 2,
      clientX = e.clientX,
      clientY = e.clientY,
      deltaX = me.startClientX - clientX,
      deltaY = me.startClientY - clientY,
      newWidth = me.startResizeWidth - deltaX,
      newHeight = me.startResizeHeight - deltaY;

    e.preventDefault();
    e.stopPropagation();

    if(newWidth < me.minWidth){
      newWidth = me.minWidth;
    }

    if(newHeight < me.minHeight){
      newHeight = me.minHeight;
    }

    me.newResizeWidth = newWidth;
    me.newResizeHeight = newHeight;

    me.resizeMaskEl.css({
      width: newWidth,
      height: newHeight
    })
  },
  /*
   *
   */
  renderResizeMask: function(){
    var me = this,
      el = me.el,
      maskWidth = 2;

    var maskEl = Fancy.get(document.createElement('div')),
      panelTop = parseInt(el.css('top')),
      panelLeft = parseInt(el.css('left')),
      panelWidth = parseInt(el.css('width')) - maskWidth * 2,
      panelHeight = parseInt(el.css('height')) - maskWidth * 2,
      panelZIndex = parseInt(el.css('z-index'));

    me.startResizeWidth = panelWidth;
    me.startResizeHeight = panelHeight;

    if(!me.window && el.css('position') !== 'absolute'){
      var offset = el.offset();

      panelTop = offset.top;
      panelLeft = offset.left;
    }

    maskEl.addClass(me.resizeMaskCls);

    maskEl.css({
      left: panelLeft,
      top: panelTop,
      width: panelWidth,
      height: panelHeight,
      'z-index': panelZIndex
    });

    me.resizeMaskEl = Fancy.get(document.body.appendChild(maskEl.dom));
  }
});
/*
 * @class Fancy.Panel
 * @extends Fancy.Widget
 */
Fancy.define('Fancy.Panel', {
  extend: Fancy.Widget,
  barScrollEnabled: true,
  mixins: [
    'Fancy.panel.mixin.DD',
    'Fancy.panel.mixin.Resize'
  ],
  /*
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);

    me.Super('constructor', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);

    me.initTpl();
    me.render();

    if(me.draggable){
      me.initDD();
    }

    if(me.resizable){
      me.initResize();
    }

    if(me.window){
      me.setActiveWindowWatcher();
    }
  },
  cls: 'fancy fancy-panel',
  panelSubHeaderCls: 'fancy-panel-sub-header-text',
  value: '',
  width: 300,
  height: 200,
  titleHeight: 30,
  subTitleHeight: 30,
  barHeight: 37,
  title: undefined,
  frame: true,
  shadow: true,
  draggable: false,
  minWidth: 200,
  minHeight: 200,
  barContainer: true,
  theme: 'default',
  tpl: [
    '<div style="height:{titleHeight}px;" class="fancy-panel-header fancy-display-none">',
      '<div class="fancy-panel-header-text">{title}</div>',
      '<div class="fancy-panel-header-tools"></div>',
    '</div>',
    '<div style="height:{subTitleHeight}px;" class="fancy-panel-sub-header fancy-display-none">',
      '<div class="fancy-panel-sub-header-text">{subTitle}</div>',
    '</div>',
    '<div class="fancy-panel-body">',
      '<div class="fancy-panel-tbar fancy-display-none" style="height:{barHeight}px;"></div>',
      '<div class="fancy-panel-sub-tbar fancy-display-none" style="height:{barHeight}px;"></div>',
      '<div class="fancy-panel-body-inner"></div>',
      '<div class="fancy-panel-bbar fancy-display-none" style="height:{barHeight}px;"></div>',
      '<div class="fancy-panel-buttons fancy-display-none" style="height:{barHeight}px;"></div>',
      '<div class="fancy-panel-footer fancy-display-none" style="height:{barHeight}px;"></div>',
    '</div>'
  ],
  /*
   *
   */
  render: function(){
    var me = this,
      renderTo = Fancy.get(me.renderTo || document.body),
      el = Fancy.get(document.createElement('div')),
      minusHeight = 0,
      titleHeight = me.titleHeight,
      subTitleHeight = me.subTitleHeight,
      displayNoneCls = 'fancy-display-none';

    if( me.window === true ){
      el.css({
        display: 'none',
        position: 'absolute'
      });
    }

    if(me.frame === false){
      el.addClass('fancy-panel-noframe');
    }

    el.addClass(me.cls);
    if( me.theme !== 'default' ){
      el.addClass('fancy-theme-' + me.theme);
    }

    if( me.shadow ){
      el.addClass('fancy-panel-shadow');
    }

    el.css({
      width: me.width + 'px',
      height: (me.height - minusHeight) + 'px'
    });

    if( me.style ){
      el.css(me.style);
    }

    var titleText = '',
      subTitleText = '';

    if(Fancy.isObject(me.title)){
      titleText = me.title.text
    }
    else if(Fancy.isString(me.title)){
      titleText = me.title
    }

    if(Fancy.isObject(me.subTitle)){
      subTitleText = me.subTitle.text
    }
    else if(Fancy.isString(me.subTitle)){
      subTitleText = me.subTitle
    }

    el.update(me.tpl.getHTML({
      barHeight: me.barHeight,
      titleHeight: titleHeight,
      subTitleHeight: subTitleHeight,
      title: titleText,
      subTitle: subTitleText
    }));

    if(Fancy.isObject(me.title)){
      if(me.title.style){
        el.select('.fancy-panel-header').css(me.title.style);
      }

      if(me.title.cls){
        el.select('.fancy-panel-header').addClass(me.title.cls);
      }

      if(me.title.tools){
        me.tools = me.title.tools;
      }
    }

    if(Fancy.isObject(me.subTitle)){
      if(me.subTitle.style){
        el.select('.fancy-panel-sub-header').css(me.subTitle.style);
      }

      if(me.subTitle.cls){
        el.select('.fancy-panel-sub-header').addClass(me.subTitle.cls);
      }
    }

    if(me.title){
      el.select('.fancy-panel-header').removeClass(displayNoneCls);
    }
    else{
      el.select('.fancy-panel-body').css('border-top-width', '0px');
    }

    if(me.subTitle){
      el.select('.fancy-panel-body').css('border-top-width', '0px');
      el.select('.fancy-panel-sub-header').removeClass(displayNoneCls);
    }

    if(me.tbar){
      el.select('.fancy-panel-tbar').removeClass(displayNoneCls);
    }

    if(me.subTBar){
      el.select('.fancy-panel-sub-tbar').removeClass(displayNoneCls);
    }

    if(me.bbar){
      el.select('.fancy-panel-bbar').removeClass(displayNoneCls);
    }

    if(me.buttons){
      el.select('.fancy-panel-buttons').removeClass(displayNoneCls);
    }

    if(me.footer){
      el.select('.fancy-panel-footer').removeClass(displayNoneCls);
    }

    me.el = renderTo.dom.appendChild(el.dom);
    me.el = Fancy.get(me.el);

    if( me.modal ){
      if( Fancy.select('fancy-modal').length === 0 ){
        Fancy.get(document.body).append('<div class="fancy-modal" style="display: none;"></div>');
      }
    }

    if(me.id){
      me.el.attr('id', me.id);
    }

    me.renderTools();
    me.renderBars();

    me.setHardBordersWidth();
  },
  /*
   *
   */
  setHardBordersWidth: function(){
    var me = this,
      panelBodyBorders = me.panelBodyBorders;

    me.el.select('.fancy-panel-body').css({
      'border-top-width': panelBodyBorders[0],
      'border-right-width': panelBodyBorders[1],
      'border-bottom-width': panelBodyBorders[2],
      'border-left-width': panelBodyBorders[3]
    })
  },
  /*
   *
   */
  renderTools: function(){
    var me = this,
      tools = me.tools;

    if( tools === undefined ){
      return;
    }

    var i = 0,
      iL = tools.length;

    for(;i<iL;i++){
      me.tools[i].renderTo = me.el.select('.fancy-panel-header-tools').dom;
      me.tools[i] = new Fancy.Tool(me.tools[i], me.scope || me);
    }
  },
  /*
   *
   */
  initTpl: function(){
    var me = this;

    me.tpl = new Fancy.Template(me.tpl);
  },
  /*
   *
   */
  renderBars: function(){
    var me = this,
      barEl,
      barItems,
      containsGrid = false,
      theme = me.theme,
      scope = this;

    if(me.items && me.items[0]){
      if(me.items[0].type === 'grid'){
        containsGrid = true;
      }

      scope = me.items[0];
    }

    if(me.bbar){
      me._bbar = new Fancy.Bar({
        el: me.el.select('.fancy-panel-bbar'),
        items: me.bbar,
        height: me.barHeight,
        barContainer: me.barContainer,
        barScrollEnabled: me.barScrollEnabled,
        scope: scope,
        theme: theme
      });

      me.bbar = me._bbar.items;
    }

    if(me.buttons){
      me._buttons = new Fancy.Bar({
        el: me.el.select('.fancy-panel-buttons'),
        items: me.buttons,
        height: me.barHeight,
        barScrollEnabled: me.barScrollEnabled,
        scope: scope,
        theme: theme
      });

      me.buttons = me._buttons.items;
    }

    if(me.tbar){
      me._tbar = new Fancy.Bar({
        el: me.el.select('.fancy-panel-tbar'),
        items: me.tbar,
        height: me.barHeight,
        tabEdit: !me.subTBar && containsGrid,
        barScrollEnabled: me.barScrollEnabled,
        scope: scope,
        theme: theme
      });

      me.tbar = me._tbar.items;
    }

    if(me.subTBar){
      me._subTBar = new Fancy.Bar({
        el: me.el.select('.fancy-panel-sub-tbar'),
        items: me.subTBar,
        height: me.barHeight,
        tabEdit: containsGrid,
        barScrollEnabled: me.barScrollEnabled,
        scope: scope,
        theme: theme
      });

      me.subTBar = me._subTBar.items;
    }

    if(me.footer){
      me._footer = new Fancy.Bar({
        disableScroll: true,
        el: me.el.select('.fancy-panel-footer'),
        items: me.footer,
        height: me.barHeight,
        barScrollEnabled: me.barScrollEnabled,
        scope: scope,
        theme: theme
      });

      me.footer = me._footer.items;
    }
  },
  /*
   * @param {Number} x
   * @param {Number} y
   */
  showAt: function(x, y){
    var me = this;

    me.css({
      left: x + 'px',
      display: '',
      'z-index': 1000 + Fancy.zIndex++
    });

    if(y !== undefined){
      me.css({
        top: y + 'px'
      });
    }
  },
  /*
   *
   */
  show: function(){
    var me = this;

    me.el.show();

    if( me.window !== true ){
      return;
    }

    if(me.buttons){
      me._buttons.checkScroll();
    }

    if(me.tbar){
      me._tbar.checkScroll();
    }

    if(me.bbar){
      me._bbar.checkScroll();
    }

    if(me.subTBar){
      me._subTBar.checkScroll();
    }

    var viewSize = Fancy.getViewSize(),
      height = me.el.height(),
      width = me.el.width(),
      xy = [],
      scroll = Fancy.getScroll(),
      scrollTop = scroll[0],
      scrollLeft = scroll[1];

    xy[0] = (viewSize[1] - width)/2;
    xy[1] = (viewSize[0] - height)/2;

    if( xy[0] < 10 ){
      xy[0] = 10;
    }

    if( xy[1] < 10 ){
      xy[1] = 10;
    }

    me.css({
      left: (xy[0] + scrollLeft) + 'px',
      top: (xy[1] + scrollTop) + 'px',
      display: '',
      'z-index': 1000 + Fancy.zIndex++
    });

    Fancy.select('.fancy-modal').css('display', '');
  },
  /*
   *
   */
  hide: function(){
    var me = this;

    me.css({
      display: 'none'
    });

    Fancy.select('.fancy-modal').css('display', 'none');

    var items = me.items || [],
      i = 0,
      iL = items.length;

    for(;i<iL;i++){
      if(me.items[i].type === 'combo'){
        me.items[i].hideList();
      }
    }
  },
  /*
   * @param {String} value
   */
  setTitle: function(value){
    var me = this;

    me.el.select('.fancy-panel-header-text').update(value);
  },
  /*
   * @param {String} value
   * @return {String}
   */
  getTitle: function(value){
    var me = this;

    return me.el.select('.fancy-panel-header-text').dom.innerHTML;
  },
  /*
   * @param {String} value
   */
  setSubTitle: function(value){
    var me = this;

    me.el.select('.' + me.panelSubHeaderCls ).update(value);
  },
  /*
   * @param {String} value
   * @return {String}
   */
  getSubTitle: function(value){
    var me = this;

    return me.el.select('.' + me.panelSubHeaderCls).dom.innerHTML;
  },
  /*
   * @return {Number}
   */
  getHeight: function(){
    var me = this;

    return parseInt(me.css('height'));
  },
  /*
   * @param {String} value
   */
  setWidth: function(value){
    //TODO: Redo
    var me = this;

    //me.css('width', value);
    me.items[0].setWidth(value);
  },
  /*
   * @param {Number} value
   */
  setHeight: function(value){
    var me = this;

    me.css('height', value);

    me.items[0].setHeight(value, false);
  },
  setActiveWindowWatcher: function(){
    var me = this;

    me.el.on('click', function(e){
      var targetEl = Fancy.get(e.target);

      if(targetEl.hasClass('fancy-field-picker-button')){
        return;
      }

      if(1000 + Fancy.zIndex - 1 > parseInt(me.css('z-index'))){
        me.css('z-index', 1000 + Fancy.zIndex++);
      }
    });
  }
});
/**
 * @class Fancy.Tool
 * @extends Fancy.Widget
 */
Fancy.define('Fancy.Tool', {
  extend: Fancy.Widget,
  /*
   * @constructor
   * @param {Object} config
   * @param {Object} scope
   */
  constructor: function(config, scope){
    var me = this;

    me.scope = scope;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('click', 'mousedown', 'mouseup', 'mouseover', 'mouseout');
    me.Super('init', arguments);

    me.style = me.style || {};

    me.render();
    me.setOns();
  },
  /*
   *
   */
  setOns: function(){
    var me = this,
      el = me.el;

    el.on('click', me.onClick, me);
  },
  cls: 'fancy fancy-button',
  text: '',
  height: 28,
  paddingTextWidth: 5,
  /*
   *
   */
  render: function(){
    var me = this,
      renderTo = Fancy.get(me.renderTo || document.body).dom,
      el = document.createElement('div'),
      width = 0;

    me.fire('beforerender');

    el.className = 'fancy-tool-button';
    el.innerHTML = me.text;
    me.el = Fancy.get( renderTo.appendChild(el) );

    me.fire('afterrender');
    me.fire('render');
  },
  /*
   *
   */
  onClick: function(){
    var me = this;

    me.fire('click');
    if( me.handler ){
      if( me.scope ){
        me.handler.apply(me.scope, [me]);
      }
      else{
        me.handler(me);
      }
    }
  },
  /*
   * @param {String} value
   */
  setText: function(value){
    var me = this;

    me.el.update(value)
  }
});
/**
 * @class Fancy.panel.Tab
 */
Fancy.define(['Fancy.panel.Tab', 'Fancy.Tab', 'FancyTab'], {
  extend: Fancy.Panel,
  /*
   * @constructor
   * @param config
   * @param scope
   */
  constructor: function(config, scope){
    var me = this;

    me.prepareConfigTheme(config);

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.prepareTabs();
    me.Super('init', arguments);

    me.setActiveTab(me.activeTab);
  },
  tabWrapperCls: 'fancy-tab-wrapper',
  activeTabWrapperCls: 'fancy-active-tab-wrapper',
  activeTabTBarButtonCls: 'fancy-toolbar-tab-active',
  activeTab: 0,
  theme: 'default',
  /*
   *
   */
  render: function(){
    var me = this;

    me.Super('render', arguments);

    me.panelBodyEl = me.el.select('.fancy-panel-body-inner').item(0);

    me.setPanelBodySize();

    me.renderTabWrappers();

    if(!me.wrapped){
      me.el.addClass('fancy-panel-grid-inside');
    }
    me.el.addClass('fancy-panel-tab');

    me.rendered = true;
  },
  setPanelBodySize: function(){
    var me = this,
      height = me.height,
      panelBodyBorders = me.panelBodyBorders;

    if(me.title){
      height -= me.titleHeight;
    }

    if(me.subTitle){
      height -= me.subTitleHeight;
      height += panelBodyBorders[2];
    }

    if(me.bbar){
      height -= me.barHeight;
    }

    if(me.tbar){
      height -= me.barHeight;
    }

    if(me.subTBar){
      height -= me.barHeight;
    }

    if(me.buttons){
      height -= me.barHeight;
    }

    if(me.footer){
      height -= me.barHeight;
    }

    height -= panelBodyBorders[0] + panelBodyBorders[2];

    me.panelBodyEl.css({
      height: height
    });

    me.panelBodyHeight = height;
    me.panelBodyWidth = me.width - panelBodyBorders[1] - panelBodyBorders[3];
    //me.panelBodyWidth = me.width;
  },
  prepareConfigTheme: function(config){
    var me = this,
      themeName = config.theme || me.theme,
      themeConfig = Fancy.getTheme(themeName).config,
      wrapped = me.wrapped || config.wrapped;

    if(wrapped){
      config.panelBodyBorders = [0,0,0,0];
      me.panelBodyBorders = [0,0,0,0];
    }

    Fancy.applyIf(config, themeConfig);
    Fancy.apply(me, config);
  },
  prepareTabs: function(){
    var me = this,
      tabs = [],
      i = 0,
      iL = me.items.length;

    for(;i<iL;i++){
      var item = me.items[i],
        tabConfig = {
          type: 'tab'
        };

      if(item.tabTitle){
        tabConfig.text = item.tabTitle;
      }
      else if(item.title){
        tabConfig.text = item.title;
        delete item.title;
      }

      tabConfig.handler = (function(i){
        return function(){
          me.setActiveTab(i);
        }
      })(i);

      tabs.push(tabConfig);
    }

    me.tbar = tabs;
    me.tabs = tabs;
  },
  renderTabWrappers: function(){
    var me = this,
      i = 0,
      iL = me.items.length;

    for(;i<iL;i++){
      var el = Fancy.get( document.createElement('div') );

      el.addClass(me.tabWrapperCls);

      me.items[i].renderTo = me.panelBodyEl.dom.appendChild(el.dom);
    }
  },
  setActiveTab: function(newActiveTab){
    var me = this,
      activeTabWrapperCls = me.activeTabWrapperCls,
      tabs = me.el.select('.' + me.tabWrapperCls),
      oldActiveTab = me.activeTab;

    if(me.items.length === 0){
      return;
    }

    tabs.item(me.activeTab).removeClass(activeTabWrapperCls);
    me.activeTab = newActiveTab;

    tabs.item(me.activeTab).addClass(activeTabWrapperCls);

    var item = me.items[me.activeTab];

    item.theme = me.theme;
    item.wrapped = true;

    item.width = me.panelBodyWidth;
    item.height = me.panelBodyHeight;

    if(!item.rendered){
      switch(item.type){
        case 'grid':
          me.items[me.activeTab] = new FancyGrid(item);
          break;
        case 'tab':
          me.items[me.activeTab] = new FancyTab(item);
          break;
      }
    }
    else{
      me.setActiveItemWidth();
      me.setActiveItemHeight();
    }

    if(me.tabs){
      me.tbar[oldActiveTab].removeClass(me.activeTabTBarButtonCls);
      me.tbar[me.activeTab].addClass(me.activeTabTBarButtonCls);
    }
  },
  /*
   * @param {String} value
   */
  setWidth: function(value){
    var me = this;

    me.width = value;

    me.css('width', value);
    me.setPanelBodySize();

    me.setActiveItemWidth();
  },
  /*
   * @param {Number} value
   */
  setHeight: function(value){
    var me = this;

    me.height = value;

    me.css('height', value);
    me.setPanelBodySize();

    me.setActiveItemHeight();
  },
  setActiveItemWidth: function(){
    var me = this;

    me.items[me.activeTab].setWidth(me.panelBodyWidth);
  },
  setActiveItemHeight: function(){
    var me = this;

    me.items[me.activeTab].setHeight(me.panelBodyHeight, false);
  }
});

FancyTab.get = function(id){
  var tabId = Fancy.get(id).select('.fancy-panel-tab').dom.id;

  return Fancy.getWidget(tabId);
};

if(!Fancy.nojQuery && Fancy.$){
  Fancy.$.fn.FancyTab = function(o){
    o.renderTo = $(this.selector)[0].id;

    return new FancyTab(o);
  };
}
/*
 * @class Fancy.Bar
 * @extends Fancy.Widget
 */
Fancy.define('Fancy.Bar', {
  extend: Fancy.Widget,
  widgetCls: 'fancy-bar',
  containerCls: 'fancy-bar-container',
  cls: '',
  text: '',
  floating: 'left',
  sideRight: 0,
  scrolled: 0,
  tabOffSet: 5,
  barScrollEnabled: true,
  /*
   * constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);

    me.init();
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.roles = {};
    me.render();

    if(me.barScrollEnabled){
      me.initScroll();
      setTimeout(function(){
        me.checkScroll();
      }, 50);
    }
  },
  /*
   *
   */
  render: function(){
    var me = this;

    me.renderEl();
    me.renderItems();
    me.initTabEdit();
  },
  /*
   *
   */
  renderEl: function(){
    var me = this;

    if(!me.el){
      var el = Fancy.get(document.createElement('div'));

      el.addClass(me.widgetCls);
      el.addClass(me.cls);
      el.update(me.text);

      me.el = Fancy.get(me.renderTo.appendChild(el.dom));

      if(me.style){
        me.el.css(me.style);
      }
    }

    var containerEl = Fancy.get(document.createElement('div'));
    containerEl.addClass(me.containerCls);

    me.containerEl = Fancy.get(me.el.dom.appendChild(containerEl.dom));
  },
  /*
   *
   */
  renderItems: function(){
    var me = this,
      el = me.el,
      containerEl = me.containerEl,
      items = me.items || [],
      i = 0,
      iL = items.length,
      isSide = false,
      barItems = [],
      sidePassed = iL - 1;

    for(;i<iL;i++){
      var item = items[i];

      if(isSide){
        item = items[sidePassed];
        sidePassed--;
      }

      if(item.toggleGroup){
        item.enableToggle = true;
      }

      if(Fancy.isObject(item)){
        item.type = item.type || 'button';
      }

      if (isSide) {
        me.floating = 'right';
      }

      //item.renderTo = el.dom;
      item.renderTo = containerEl.dom;

      switch (item) {
        case '|':
          var style = {
            'float': me.floating,
            'margin-right': '5px',
            'margin-top': '6px',
            'padding-left': '0px'
          };

          if(me.floating === 'right'){
            Fancy.applyIf(style, {
              right: '1px',
              position: 'absolute'
            });
          }

          barItems.push(new Fancy.Separator({
            //renderTo: el.dom,
            renderTo: containerEl.dom,
            style: style
          }));
          continue;
          break;
        case 'side':
          isSide = true;
          continue;
          break;
        default:
          if(isSide){
            barItems[sidePassed] = me.renderItem(item);
          }
          else {
            barItems.push( me.renderItem(item) );
          }
      }
    }

    me.items = barItems;
  },
  /*
   * @param {Object} item
   */
  renderItem: function(item){
    var me = this,
      field,
      el = me.el,
      containerEl = me.containerEl,
      theme = me.theme;

    item.style = item.style || {};
    item.label = false;
    item.padding = false;

    Fancy.applyIf(item.style, {
      'float': me.floating
    });

    if(me.floating === 'right'){
      Fancy.applyIf(item.style, {
        right: me.sideRight,
        position: 'absolute'
      });
    }

    if(!item.scope && me.items){
      item.scope = me.items[0];
    }

    switch(item.type){
      case 'wrapper':
        if(item.cls === 'fancy-month-picker-action-buttons'){
          containerEl.destroy();
          containerEl = me.el;
        }

        var renderTo = containerEl.append('<div class="'+(item.cls || '')+'"></div>').select('div').item(0),
          i = 0,
          iL = item.items.length,
          _item,
          width = 0;

        for(;i<iL;i++){
          _item = item.items[i];

          if(Fancy.isObject(_item)){
            _item.type = _item.type || 'button';
          }

          _item.renderTo = renderTo.dom;
          field = me.renderItem(_item);
          var fieldEl = field.el;

          if(i === iL - 1){
            fieldEl.css('margin-right', '0px');
          }
          else{
            width += parseInt(fieldEl.css('margin-right'));
          }

          if(Fancy.nojQuery){
            width += parseInt(fieldEl.width());
            width += parseInt(fieldEl.css('margin-left'));
          }
          else{
            width += parseInt(fieldEl.$dom.outerWidth());
          }

          width += parseInt(fieldEl.css('padding-left'));
          width += parseInt(fieldEl.css('padding-right'));
        }

        renderTo.css('width', width);

        break;
      case undefined:
      case 'button':
        item.extraCls = 'fancy-bar-button';

        item.scope = me.scope;

        field = new Fancy.Button(item);
        break;
      case 'segbutton':
        item.extraCls = 'fancy-bar-seg-button';

        Fancy.applyIf(item.style, {
          'margin-right': '6px'
        });

        field = new Fancy.SegButton(item);
        break;
      case 'tab':
        isTab = true;

        field = new Fancy.toolbar.Tab(item);
        break;
      case 'text':
        Fancy.applyIf(item.style, {
          'margin-right': '10px',
          'padding-left': '0px',
          'padding-top': '11px'
        });

        Fancy.apply(item, {
          renderTo: containerEl.dom,
          cls: item.cls || ''
        });

        field = new Fancy.bar.Text(item);
        break;
      case 'combo':
        item.inputWidth = 18;

        Fancy.applyIf(item.style, {
          'padding-left': '0px',
          'margin-right': '8px',
          'margin-top': '4px'
        });

        Fancy.applyIf(item, {
          width: 70
        });

        field = new Fancy.Combo(item);
        break;
      case 'date':
        item.inputWidth = 18;

        Fancy.applyIf(item.style, {
          'padding-left': '0px',
          'margin-right': '8px',
          'margin-top': '4px'
        });

        Fancy.applyIf(item, {
          width: 100
        });

        field = new Fancy.DateField(item);

        break;
      case 'number':
        item.inputWidth = 18;

        Fancy.applyIf(item.style, {
          'padding-left': '0px',
          'margin-right': '8px',
          'margin-top': '4px'
        });

        Fancy.applyIf(item, {
          width: 35
        });

        field = new Fancy.NumberField(item);

        break;
      case 'switcher':
        Fancy.applyIf(item.style, {
          'padding-left': '0px',
          'margin-right': '8px',
          'margin-top': '4px'
        });

        Fancy.applyIf(item, {
          width: 35
        });

        field = new Fancy.Switcher(item);

        break;
      case 'string':
        item.inputWidth = 18;

        Fancy.applyIf(item.style, {
          'padding-left': '0px',
          'margin-right': '8px',
          'margin-top': '4px'
        });

        Fancy.applyIf(item, {
          width: 100
        });

        field = new Fancy.StringField(item);
        break;
      case 'search':
        item.inputWidth = 18;

        item.events = item.events || [];

        item.events = item.events.concat([{
          enter: function(field, value){
            var grid = Fancy.getWidget( field.el.parent().parent().parent().parent().select('.fancy-grid').attr('id') );
            //this.search(['name', 'surname', 'position'], value);
            //this.search(value);
            //this.search(['a', 'b', 'c']);
            grid.search(value);
          }
        }, {
          key: function (field, value) {
            var me = this,
              grid = Fancy.getWidget(field.el.parent().parent().parent().parent().select('.fancy-grid').attr('id'));

            if (!me.autoEnterTime) {
              me.autoEnterTime = new Date();
            }

            if (me.intervalAutoEnter) {
              clearInterval(me.intervalAutoEnter);
            }
            delete me.intervalAutoEnter;

            me.intervalAutoEnter = setInterval(function () {
              var now = new Date();

              if (now - me.autoEnterTime > 500) {
                clearInterval(me.intervalAutoEnter);
                delete me.intervalAutoEnter;
                value = field.getValue();

                grid.search(value);
              }
            }, 200);
          }
        },{
          render: function(field){
            var me = this,
              isIn = false;

            field.el.on('mouseenter', function(){
              isIn = true;
            }, null, '.fancy-field-search-params-link');

            field.el.on('mousedown', function(e){
              e.preventDefault();
            }, null, '.fancy-field-search-params-link');

            field.el.on('click', function(e){
              var toShow = false,
                grid = Fancy.getWidget(field.el.parent().parent().parent().parent().select('.fancy-grid').attr('id')),
                columns = grid.columns || [],
                leftColumns = grid.leftColumns || [],
                rightColumns = grid.rightColumns || [],
                _columns = columns.concat(leftColumns).concat(rightColumns),
                items = [],
                i = 0,
                iL = _columns.length,
                height = 1;

              for(;i<iL;i++){
                var column = _columns[i],
                  title = column.title;

                if(title === undefined){
                  title = '';
                }

                if(column.searchable === false){
                  continue;
                }

                switch(column.type){
                  case 'color':
                  case 'combo':
                  case 'date':
                  case 'number':
                  case 'string':
                  case 'text':
                  case 'currency':
                    break;
                  default:
                    continue;
                }

                height += grid.fieldHeight;

                items.push({
                  inputLabel: ' &nbsp;&nbsp;' + title,
                  value: true,
                  name: column.index
                });
              }

              if(!me.list){
                me.list = new FancyForm({
                  width: 150,
                  height: height,
                  theme: theme,
                  defaults: {
                    type: 'checkbox',
                    label: false,
                    style: {
                      padding: '8px 16px 0px'
                    }
                  },
                  items: items,
                  cls: 'fancy-field-search-list',
                  events: [{
                    set: function (field, o) {
                      grid.searching.setKeys(me.list.get());
                    }
                  },{
                    init: function(){
                      setTimeout(function() {
                        var listEl = me.list.el;

                        listEl.on('mouseenter', function () {
                          isIn = true;
                        });

                        listEl.on('mouseleave', function () {
                          isIn = false;
                          setTimeout(function () {
                            if (isIn === false) {
                              if (me.list) {
                                listEl.css('display', 'none');
                              }
                            }
                          }, 750);
                        });

                        var el = Fancy.get(e.target),
                          offset = el.offset(),
                          fieldHeight = parseInt(field.el.css('height'));

                        listEl.css({
                          position: 'absolute',
                          top: offset.top + fieldHeight + 20,
                          left: offset.left
                        });

                        me.list.el.css('display', 'block');

                        listEl.animate({
                          duration: 200,
                          top: offset.top + fieldHeight - 1
                        });
                      },50);
                    }

                  }]
                });
              }
              else if(me.list.el.css('display') !== 'none'){
                me.list.el.css('display', 'none');
                return;
              }
              else{
                toShow = true;
              }

              var el = Fancy.get(e.target),
                offset = el.offset(),
                fieldHeight = parseInt(field.el.css('height'));

              if(me.list && me.list.el){
                me.list.css({
                  position: 'absolute',
                  top: offset.top + fieldHeight + 20,
                  left: offset.left
                });

                if (toShow) {
                  me.list.css('display', 'block');
                }

                me.list.el.animate({
                  duration: 200,
                  top: offset.top + fieldHeight - 1
                });
              }
            }, null, '.fancy-field-search-params-link');

            field.el.on('mouseleave', function(){
              isIn = false;
              setTimeout(function(){
                if(isIn === false){
                  if(me.list){
                    me.list.el.css('display', 'none');
                  }
                }
              }, 750);
            }, null, '.fancy-field-search-params-link')
          }
        }]);

        Fancy.applyIf(item.style, {
          'float': me.floating,
          'padding-left': '0px',
          'margin-right': '8px',
          'margin-top': '4px'
        });

        var cls = 'fancy-field-search';

        if(item.paramsMenu){
          item.tpl = [
            '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
            '{label}',
            '</div>',
            '<div class="fancy-field-text">',
              '<input placeholder="{emptyText}" class="fancy-field-text-input" style="{inputWidth}" value="{value}">',
              '<div class="fancy-field-search-params-link" style="">' + (item.paramsText || '&nbsp;') + '</div>',
            '</div>',
            '<div class="fancy-clearfix"></div>'
          ];

          cls += ' fancy-field-search-paramed';
          if(!item.paramsText){
            cls += ' fancy-field-search-paramed-empty';
          }
        }

        Fancy.applyIf(item, {
          padding: false,
          width: 250,
          cls: cls,
          emptyText: 'Search'
        });

        field = new Fancy.StringField(item);
        break;
      default:
    }

    if(me.floating === 'right'){
      me.sideRight += field.width;
      me.sideRight += 7;
    }

    if(item.role){
      me.roles[item.role] = field;
    }

    return field;
  },
  /*
   *
   */
  initScroll: function(){
    var me = this,
      panelBodyBorders = Fancy.getTheme(me.theme).config.panelBodyBorders;

    me.leftScroller = new Fancy.Button({
      imageCls: true,
      renderTo: me.el.dom,
      cls: 'fancy-bar-left-scroller',
      height: me.height + 2,
      minWidth: 20,
      paddingTextWidth: 0,
      imageWidth: 20,
      width: 0,
      text: false,
      id: 'my',
      style: {
        position: 'absolute',
        //left: -panelBodyBorders[3],
        //left: -2,
        left: -1,
        top: -1,
        display: 'none'
      },
      listeners: [{
        click: me.onPrevScrollClick,
        scope: me
      }]
    });

    me.rightScroller = new Fancy.Button({
      imageCls: true,
      renderTo: me.el.dom,
      cls: 'fancy-bar-right-scroller',
      height: me.height + 2,
      minWidth: 20,
      paddingTextWidth: 0,
      imageWidth: 20,
      width: 0,
      text: false,
      style: {
        position: 'absolute',
        //right: -2,
        right: -1,
        top: -1,
        display: 'none'
      },
      listeners: [{
        click: me.onNextScrollClick,
        scope: me
      }]
    });
  },
  /*
   * @return {Number}
   */
  getBarWidth: function(){
    var me = this;

    return parseInt(me.el.css('width'));
  },
  /*
   * @return {Number}
   */
  getItemsWidth: function(){
    var me = this,
      i = 0,
      iL = me.items.length,
      width = 0;

    for(;i<iL;i++){
      var item = me.items[i];
      width += item.el.width();
      width += parseInt(item.el.css('margin-left'));
      width += parseInt(item.el.css('margin-right'));
      width += parseInt(item.el.css('padding-right'));
      width += parseInt(item.el.css('padding-left'));
    }

    return width;
  },
  /*
   *
   */
  onPrevScrollClick: function(){
    var me = this;

    me.scrolled += 30;

    me.applyScrollChanges();
  },
  /*
   *
   */
  onNextScrollClick: function(){
    var me = this;

    me.scrolled -= 30;

    me.applyScrollChanges();
  },
  /*
   *
   */
  applyScrollChanges: function(){
    var me = this,
      itemsWidth = me.getItemsWidth(),
      barWidth = me.getBarWidth() - parseInt(me.leftScroller.el.css('width')) - parseInt(me.rightScroller.el.css('width')),
      scrollPath = itemsWidth - barWidth;

    if(itemsWidth < barWidth){
      me.scrolled = 0;

      me.leftScroller.el.hide();
      me.rightScroller.el.hide();

      me.containerEl.css('margin-left', '0px');

      return;
    }
    else if(me.scrolled > 0){
      me.scrolled = 0;
      me.leftScroller.disable();
      me.rightScroller.enable();
    }
    else if(me.scrolled < -scrollPath){
      me.scrolled = -scrollPath;
      me.leftScroller.enable();
      me.rightScroller.disable();
    }

    me.leftScroller.el.show();
    me.rightScroller.el.show();

    me.containerEl.css('margin-left', (me.scrolled + me.leftScroller.el.width() + me.tabOffSet) + 'px');
  },
  /*
   *
   */
  onDocMouseUp: function () {
    var me = this;

    if(me.scrollInterval){
      clearTimeout(me.scrollInterval);
      delete me.scrollInterval;
    }
  },
  /*
   *
   */
  checkScroll: function(){
    var me = this,
      itemsWidth = me.getItemsWidth(),
      barWidth = me.getBarWidth();

    if(me.disableScroll){
      return;
    }

    if(itemsWidth > barWidth){
      me.enableScroll();
    }
    else{
      me.leftScroller.el.hide();
      me.rightScroller.el.hide();
    }
  },
  /*
   *
   */
  enableScroll: function(){
    var me = this;

    me.leftScroller.el.show();
    me.rightScroller.el.show();

    if(me.scrolled === 0){
      me.leftScroller.disable();
      me.containerEl.css('margin-left', (me.leftScroller.el.width() + me.tabOffSet) + 'px');
    }
  },
  /*
   *
   */
  initTabEdit: function(){
    var me = this;

    if(!me.tabEdit){
      return;
    }

    var i = me.items.length - 1;

    for(;i>-1;i--){
      var item = me.items[i];

      switch(item.type){
        case 'number':
        case 'string':
        case 'date':
          item.on('tab', me.onTabLastInput, me);
          return;
          break;
      }
    }
  },
  /*
   *
   */
  onTabLastInput: function(field, e){
    var me = this,
      grid = Fancy.getWidget(me.el.parent().select('.fancy-grid').attr('id'));

    //NOTE: setTimeout to fix strange bug. It runs second second cell without it.
    e.preventDefault();

    if(grid.leftColumns.length){
      setTimeout(function(){
        grid.leftBody.el.select('.fancy-grid-cell').item(0).dom.click();
      }, 100);
    }
    else{
      setTimeout(function(){
        grid.body.el.select('.fancy-grid-cell').item(0).dom.click();
      }, 100);
    }
  }
});
/*
 * @class Fancy.Separator
 */
Fancy.define('Fancy.Separator', {
  cls: 'fancy-separator',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);

    me.init();
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.render();
  },
  /*
   *
   */
  render: function(){
    var me = this,
      el = Fancy.get(document.createElement('div'));

    el.addClass(me.cls);
    el.update('<div></div>');

    me.el = Fancy.get(me.renderTo.appendChild(el.dom));

    if(me.style){
      me.el.css(me.style);
    }
  }
});
/*
 * @class Fancy.bar.Text
 */
Fancy.define('Fancy.bar.Text', {
  widgetCls: 'fancy-bar-text',
  cls: '',
  text: '',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);

    me.init();
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.render();
  },
  /*
   *
   */
  render: function(){
    var me = this,
      el = Fancy.get(document.createElement('div'));

    el.addClass(me.widgetCls);
    el.addClass(me.cls);
    el.update(me.text);

    me.el = Fancy.get(me.renderTo.appendChild(el.dom));

    if(me.style){
      me.el.css(me.style);
    }
  }
});
/**
 * @class Fancy.Form
 * @extends Fancy.Widget
 */
Fancy.define('Fancy.Form', {
  extend: Fancy.Widget,
  mixins: [
    'Fancy.form.mixin.Form',
    Fancy.panel.mixin.PrepareConfig,
    Fancy.panel.mixin.methods,
    'Fancy.form.mixin.PrepareConfig'
  ],
  type: 'form',
  theme: 'default',
  i18n: 'en',
  maxLabelNumber: 11,
  minWidth: 200,
  minHeight: 200,
  barScrollEnabled: true,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    var fn = function(params){
      if(params){
        Fancy.apply(config, params);
      }

      config = me.prepareConfig(config, me);
      Fancy.applyConfig(me, config);

      me.Super('const', arguments);
    };

    var preInit = function(){
      var i18n = config.i18n || me.i18n;

      if( Fancy.loadLang(i18n, fn) === true ) {
        fn({
          //lang: Fancy.i18n[i18n]
        });
      }
    };

    if(!Fancy.modules['form'] && !Fancy.fullBuilt && Fancy.MODULELOAD !== false){
      Fancy.loadModule('form', function(){
        preInit();
      });
    }
    else{
      preInit();
    }
  }
});

var FancyForm = Fancy.Form;
/*
 * @param {String} id
 */
FancyForm.get = function(id){
  var formId = Fancy.get(id).select('.fancy-form').dom.id;

  return Fancy.getWidget(formId);
};

FancyForm.defineTheme = Fancy.defineTheme;
FancyForm.defineController = Fancy.defineController;
FancyForm.addValid = Fancy.addValid;

if(!Fancy.nojQuery && Fancy.$){
  Fancy.$.fn.FancyForm = function(o){
    o.renderTo = $(this.selector)[0].id;
    return new Fancy.Form(o);
  };
}
Fancy.ns('Fancy.form.field');

/*
 * @mixin Fancy.form.field.Mixin
 */
Fancy.form.field.Mixin = function(){};

Fancy.form.field.Mixin.prototype = {
  padding: '8px 8px 0px 8px',
  inputHeight: 29,
  labelHeight: 18,
  failedValidCls: 'fancy-field-not-valid',
  cls: '',
  /*
   *
   */
  ons: function(){
    var me = this,
      el = me.el,
      input = me.el.getByTag('input');

    me.input = input;
    input.on('blur', me.onBlur, me);
    input.on('focus', me.onFocus, me);
    input.on('input', me.onInput, me);
    input.on('keydown', me.onKeyDown, me);
    el.on('mouseenter', me.onMouseOver, me);
    el.on('mouseleave', me.onMouseOut, me);
    me.on('key', me.onKey, me);

    if(me.tip){
      el.on('mousemove', me.onMouseMove, me);
    }

    if(me.format && me.format.inputFn){
      switch(me.value){
        case '':
        case undefined:
          break;
        default:
          me.formatValue(me.value);
      }
      me.on('key', me.onKeyInputFn);
    }

    if(me.stopPropagation){
      el.on('mousedown', function(e){
        e.stopPropagation();
      });
    }
  },
  /*
   * @param {Object} field
   * @param {*} value
   * @param {Object} e
   */
  onKeyInputFn: function(field, value, e){
    var keyCode = e.keyCode,
      key = Fancy.key;

    switch(keyCode){
      case key.ENTER:
      case key.ESC:
      case key.LEFT:
      case key.RIGHT:
        return;
        break;
    }

    this.formatValue(value);
  },
  /*
   * @param {*} value
   */
  formatValue: function(value){
    var me = this;

    value = me.format.inputFn(value);
    me.input.dom.value = value;
  },
  /*
   * @param {Object} e
   */
  onMouseOver: function(e){
    var me = this;

    me.fire('mouseover');

    if(me.tip){
      me.renderTip(e);
    }
  },
  /*
   * @param {Object} e
   */
  onMouseOut: function(e){
    var me = this;

    me.fire('mouseout');

    if(me.tip && me.tooltip){
      me.tooltipToDestroy = true;
      me.tooltip.destroy();
      delete me.tooltip;
    }
  },
  /*
   *
   */
  render: function(){
    var me = this,
      renderTo = me.renderTo || document.body,
      el = Fancy.get(document.createElement('div')),
      style = me.style;

    if(Fancy.isString(renderTo)){
      renderTo = document.getElementById(renderTo);
      if(!renderTo){
        renderTo = Fancy.select(renderTo).item(0);
      }
    }

    me.fire('beforerender');
    el.addClass( me.cls );
    el.addClass( me.fieldCls );

    el.attr('id', me.id);

    var labelWidth = '',
      itemsHTML = '';

    if (me.itemsHTML) {
      itemsHTML = me.itemsHTML;
    }

    if (me.labelAlign === 'top' && me.label) {
      //auto fixing of wrang labelWidth.
      //will not fix right if user change color of label font-size to bigger
      if (me.labelWidth < me.label.length * 7) {
        me.labelWidth = (me.label.length + 2) * 7;
      }
    }

    if (me.labelWidth) {
      labelWidth = 'width:' + me.labelWidth + 'px;';
    }

    var label = me.label;

    if (me.label === '') {
      label = '&nbsp;';
    }
    else if (me.label === undefined) {
      label = '&nbsp;';
    }
    else if (me.labelAlign !== 'right') {
      label += ':';
    }

    var labelDisplay = '',
      inputLabelDisplay = '',
      inputLabel = '';

    if (me.label === false) {
      labelDisplay = 'display:none;';
    }

    if (!me.inputLabel) {
      inputLabelDisplay = 'display:none;';
    }
    else {
      inputLabel = me.inputLabel;
    }

    if (me.type === 'recaptcha') {
      el.update( me.tpl.getHTML({
          key: me.key
        })
      );
    }
    else{
      el.update(
        me.tpl.getHTML({
          labelWidth: labelWidth,
          label: label,
          labelDisplay: labelDisplay,
          inputLabelDisplay: inputLabelDisplay,
          inputLabel: inputLabel,
          emptyText: me.emptyText,
          value: me.value,
          height: me.height,
          itemsHTML: itemsHTML,
          errorTextStyle: '',
          buttonText: me.buttonText
        })
      );
    }

    me.el = el;
    me.setStyle();

    if(me.renderId === true){
      el.attr('id', me.id);
    }

    renderTo.appendChild(el.dom);
    me.el = el;

    if(me.type === 'textarea'){
      me.input = me.el.getByTag('textarea');
    }
    else{
      me.input = me.el.getByTag('input');
    }

    if(me.name) {
      me.input.name = me.name;
    }

    me.setSize();

    if( me.labelAlign === 'top' ){
      me.el.addClass('fancy-field-label-align-top');
      me.el.select('.fancy-field-text').css('float', 'none');
    }
    else if( me.labelAlign === 'right' ){
      me.el.addClass('fancy-field-label-align-right');
      switch (me.type){
        case 'radio':
          $(el.dom).find('.fancy-field-label').insertAfter($(el.dom).find('.fancy-field-text:last'));
          break;
        case 'textarea':
          $(el.dom).find('.fancy-field-label').insertAfter($(el.dom).find('.fancy-textarea-text'));
          break;
        default:
          $(el.dom).find('.fancy-field-label').insertAfter($(el.dom).find('.fancy-field-text'));
      }
    }
    else if(me.type !== 'radio'){}

    me.acceptedValue = me.value;
    me.fire('afterrender');
    me.fire('render');

    if( me.type !== 'recaptcha' && me.type !== 'chat' ){
      setTimeout(function(){
        if( me.input && me.input.dom){
          if( me.input.dom.value.length === 0 ){
            if( me.prevColor === undefined ){
              me.prevColor = me.input.css('color');
            }

            me.input.css('color', 'grey');
          }
        }
      }, 1);
    }
  },
  /*
   * @param {Object} e
   */
  onKeyDown: function(e){
    var me = this,
      keyCode = e.keyCode,
      key = Fancy.key;

    if( me.type === 'number' ){
      if( Fancy.Key.isNumControl(keyCode, e) === false ){
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    switch(keyCode){
      case key.TAB:
        me.fire('tab', e);
        break;
      case key.ENTER:
        me.fire('enter', me.getValue());
        if( me.type !== 'textarea' ){
          e.preventDefault();
          e.stopPropagation();
        }
        break;
      case key.UP:
        switch(me.type){
          case 'number':
          case 'field.number':
            me.spinUp();
            break;
        }

        me.fire('up', me.getValue());

        if( me.type !== 'textarea' ){
          e.preventDefault();
          e.stopPropagation();
        }
        break;
      case key.DOWN:
        switch(me.type){
          case 'number':
          case 'field.number':
            me.spinDown();
            break;
        }

        me.fire('up', me.getValue());

        if( me.type !== 'textarea' ){
          e.preventDefault();
          e.stopPropagation();
        }
        break;
      case key.LEFT:
        break;
      case key.RIGHT:
        e.stopPropagation();
        break;
      default:
        setTimeout(function(){
          if( me.input ){
            if( me.input.dom.value.length === 0 ){
              if( me.prevColor === undefined ){
                me.prevColor = me.input.css('color');
              }

              me.input.css('color', 'grey');
            }
            else{
              if( me.prevColor ){
                me.input.css('color', me.prevColor);
              }
              else{
                me.input.css('color', ' ');
              }
            }
          }
        }, 1);
    }

    setTimeout(function(){
      //me.fire('key', me.getValue(), e);
      me.fire('key', me.input.dom.value, e);
    }, 1);
  },
  /*
   * @param {Object} me
   * @param {*} value
   */
  onKey: function(me, value){
    me.validate(value);
  },
  /*
   *
   */
  onBlur: function(){
    var me = this;

    me.fire('blur');
  },
  /*
   * @param {*} value
   */
  validate: function(value){
    var me = this,
      vtype = me.vtype;

    if(vtype === undefined){}
    else{
      var valid = Fancy.isValid(vtype, value);
      if( valid !== true ){
        me.errorText = new Fancy.Template(valid.text).getHTML(valid);
        me.failedValid();
      }
      else{
        me.successValid();
      }
    }
  },
  /*
   *
   */
  isValid: function(){
    var me = this;

    return !me.hasClass(me.failedValidCls);
  },
  /*
   *
   */
  onFocus: function(){
    var me = this;

    me.fire('focus');
  },
  /*
   *
   */
  onInput: function(){
    var me = this,
      input = me.input,
      value = me.getValue(),
      oldValue = me.acceptedValue;

    me.acceptedValue = me.get();
    me.fire('input', value);
    me.fire('change', value, oldValue);
  },
  /*
   *
   */
  get: function(){
    var me = this;

    if(me.format){
      //Place of bugs
      if(Fancy.isString(me.format)){}
      else if(Fancy.isObject(me.format)){
        if(me.format.inputFn){
          if(me.type === 'number' || me.type === 'field.number'){
            if(isNaN(parseFloat(me.value))){
              return me.value;
            }

            return Number(me.value);
          }
        }
      }
      else {
        return me.value;
      }
    }

    return me.input.dom.value;
  },
  /*
   *
   */
  getValue: function(){
    return this.get();
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  set: function(value, onInput){
    var me = this;

    me.value = value;

    if(me.format && me.format.inputFn){
      me.formatValue(value);
    }
    else{
      me.input.dom.value = value;
    }

    if(onInput !== false){
      me.onInput();
    }

    me.validate(value);
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  setValue: function(value, onInput){
    this.set(value, onInput);
  },
  /*
   *
   */
  clear: function(){
    this.set('');
  },
  /*
   *
   */
  failedValid: function(){
    var me = this;

    if(me.hasClass(me.failedValidCls)){
      if(me.tooltip && me.errorText){
        me.tooltip.update(me.errorText);
      }
    }
    else{
      if(!me.tooltip && me.errorText){
        me.showErrorTip();

        me.el.on('mousemove', me.onMouseMove, me);
        me.input.hover(function(e){
          if(me.errorText){
            me.showErrorTip();
            me.tooltip.show(e.pageX + 15, e.pageY - 25);
          }
        }, function(){
          me.hideErrorTip();
        });
      }

      me.addClass(me.failedValidCls);
    }
  },
  /*
   *
   */
  successValid: function(){
    var me = this;

    me.removeClass(me.failedValidCls);
    me.hideErrorTip();
    delete me.errorText;
  },
  /*
   *
   */
  showErrorTip: function(){
    var me = this;

    if(!me.tooltip){
      me.tooltip = new Fancy.ToolTip({
        text: me.errorText
      });
    }
  },
  /*
   *
   */
  hideErrorTip: function(){
    var me = this;

    if(me.tooltip) {
      me.tooltip.destroy();
      delete me.tooltip;
    }
  },
  /*
   * @param {Object} o
   */
  setInputSize: function(o){
    var me = this;

    if(o.width) {
      me.input.css('width', o.width);
    }

    if(o.height) {
      me.input.css('height', o.height);
    }
  },
  /*
   *
   */
  focus: function(){
    var me = this;

    me.input.focus();
    setTimeout(function(){
      me.input.dom.selectionStart = me.input.dom.selectionEnd = 10000;
    }, 0);
  },
  /*
   *
   */
  hide: function(){
    var me = this;

    me.fire('beforehide');
    me.css('display', 'none');
    me.fire('hide');
  },
  /*
   *
   */
  show: function(){
    var me = this;

    me.css('display', 'block');
  },
  /*
   * @param {Number|Object} width
   * @param {Number} height
   */
  setSize: function(width, height){
    var me = this;

    if(me.type === 'set'){
      return;
    }

    if(width === undefined && height === undefined){
      width = me.width;
      height = me.height;
    }
    else if(height === undefined){
      var o = width;
      if(o.width){
        width = o.width;
      }
      else{
        width = me.width;
      }

      if(o.height){
        height = o.height;
      }
      else{
        height = me.height;
      }
    }

    if(me.size){
      me.size({
        width: width,
        height: height
      });

      return;
    }

    if(width !== undefined) {
      me.css('width', width);
    }

    if(me.labelAlign === 'top'){
      //me.css('height', height + me.labelHeight);
      me.css('height', height * 1.5);
    }
    else{
      me.css('height', height);
    }

    me.setInputSize({
      width: me.inputWidth,
      height: me.inputHeight
    });
  },
  /*
   *
   */
  setStyle: function(){
    var me = this,
      style = me.style || {},
      padding = me.padding;

    if(padding){
      if(Fancy.isNumber(padding)){
        padding = padding + 'px';
      }
      else if(Fancy.isString(padding)){}

      if(style.padding === undefined){
        style.padding = padding;
      }
    }
    else{
      style.padding = '0px';
    }

    me.css(style);
  },
  /*
   *
   */
  preRender: function(){
    var me = this;

    if(me.tpl && Fancy.isObject(me.tpl) === false){
      me.tpl = new Fancy.Template(me.tpl);
    }

    me.calcSize();
  },
  /*
   *
   */
  calcSize: function(){
    var me = this,
      inputWidth = me.inputWidth,
      padding = me.padding,
      value,
      value1,
      value2,
      value3;

    if(Fancy.isString(padding)){
      padding = padding.replace(/px/g, '');
      padding = padding.split(' ');
      switch(padding.length){
        case 1:
          value = Number(padding[0]);
          padding = [value, value, value, value];
          break;
        case 2:
          value1 = Number(padding[0]);
          value2 = Number(padding[1]);

          padding = [value1, value2, value1, value2];
          break;
        case 3:
          value1 = Number(padding[0]);
          value2 = Number(padding[1]);
          value3 = Number(padding[2]);

          padding = [value1, value2, value3, value1];
          break;
        case 4:
          padding = [Number(padding[0]), Number(padding[1]), Number(padding[2]), Number(padding[3])];
          break;
      }
    }
    else if(Fancy.isNumber(padding)){
      padding = [padding, padding, padding, padding];
    }
    else if(padding === false){
      padding = [0, 0, 0, 0];
    }

    if(me.labelAlign === 'top'){
      me.height *= 1.5;
    }

    inputWidth = me.width;

    if(me.labelAlign !== 'top' && me.label){
      inputWidth -= me.labelWidth;
    }

    if(me.height === me.inputHeight && me.padding !== false){
      me.inputHeight -= padding[0] + padding[2];
    }

    me.inputWidth = inputWidth -  padding[1] - padding[3];
    me.height = me.inputHeight + padding[0] + padding[2];
  },
  /*
   * @param {Number} value
   */
  setWidth: function(value){
    var me = this;

    me.width = value;
    me.calcSize();

    me.css('width', value);
    me.setInputSize({
      width: me.inputWidth
    });
  },
  /*
   * @param {Object} e
   */
  onMouseMove: function(e){
    var me = this;

    delete me.tooltipToDestroy;

    if(me.tip){
      me.renderTip(e);
    }
    else if(me.tooltip){
      me.tooltip.show(e.pageX + 15, e.pageY - 25);
    }
  },
  /*
   * @param {Object} e
   */
  renderTip: function(e){
    var me = this,
      value = '',
      tpl = new Fancy.Template(me.tip || me.tooltip);

    if(me.getValue){
      value = me.getValue();
    }

    var text = tpl.getHTML({
      value: value
    });

    if(me.tooltip){
      me.tooltip.update(text);
    }
    else {
      me.tooltip = new Fancy.ToolTip({
        text: text
      });
    }

    me.tooltip.show(e.pageX + 15, e.pageY - 25);
  }
};
/*
 * @class Fancy.StringField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.String', 'Fancy.StringField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.string',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'tab','change', 'key');

    me.Super('init', arguments);

    me.preRender();
    me.render();

    me.ons();

    if( me.isPassword ){
      me.input.attr({
        "type": "password"
      });
    }

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }
  },
  fieldCls: 'fancy fancy-field',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      '<input placeholder="{emptyText}" class="fancy-field-text-input" style="{inputWidth}" value="{value}">',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ]
});
/*
 * @class Fancy.NumberField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Number', 'Fancy.NumberField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.number',
  allowBlank: true,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'tab', 'change', 'key');

    me.Super('init', arguments);

    me.preRender();
    me.render();

    me.ons();

    if( me.hidden ){
      me.css('display', 'none');
    }

    me.initSpin();
  },
  fieldCls: 'fancy fancy-field',
  value: '',
  width: 100,
  emptyText: '',
  step: 1,
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      '<input placeholder="{emptyText}" class="fancy-field-text-input" style="{inputWidth}" value="{value}">',
      '<div class="fancy-field-spin">',
        '<div class="fancy-field-spin-up"></div>',
        '<div class="fancy-field-spin-down"></div>',
      '</div>',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   *
   */
  onInput: function(){
    var me = this,
      input = me.input,
      value = me.get(),
      oldValue = me.acceptedValue;

    if(me.isValid()){
      var _value = input.dom.value,
        _newValue = '',
        i = 0,
        iL = _value.length;

      for(;i<iL;i++){
        switch(_value[i]){
          case '0':
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
          case '-':
          case '+':
          case '.':
            _newValue += _value[i];
            break;
        }
      }

      //_newValue = Number(_newValue);
      _newValue = _newValue;

      if(!isNaN(Number(_newValue))){
        me.value = _newValue;
        value = _newValue;
      }
    }

    me.acceptedValue = Number(me.get());
    me.fire('input', value);
    me.fire('change', Number(value), Number(oldValue));
  },
  /*
   * @param {String} value
   * @return {Boolean}
   */
  isNumber: function(value){
    var me = this;
    if(value === '' || value === '-'){
      return true;
    }

    return Fancy.isNumber(+value);
  },
  /*
   * @param {Number|String} value
   * @return {Boolean}
   */
  checkMinMax: function(value){
    var me = this;

    if(value === '' || value === '-'){
      return true;
    }

    value = +value;

    return value >= me.min && value <= me.max;
  },
  /*
   * @param {Number} value
   */
  setMin: function(value){
    var me = this;

    me.min = value;
  },
  /*
   * @param {Number} value
   */
  setMax: function(value){
    var me = this;

    me.max = value;
  },
  /*
   *
   */
  initSpin: function(){
    var me = this;

    if(me.spin !== true){
      return;
    }

    me.el.select('.fancy-field-spin').css('display', 'block');

    me.el.select('.fancy-field-spin-up').on('mousedown', me.onMouseDownSpinUp, me);
    me.el.select('.fancy-field-spin-down').on('mousedown', me.onMouseDownSpinDown, me);
  },
  /*
   * @param {Object} e
   */
  onMouseDownSpinUp: function(e){
    var me = this,
      docEl = Fancy.get(document),
      timeInterval = 700,
      time = new Date();

    e.preventDefault();

    me.mouseDownSpinUp = true;

    me.spinUp();

    me.spinInterval = setInterval(function(){
      me.mouseDownSpinUp = false;
      if(new Date() - time > timeInterval){
        if(timeInterval === 700){
          timeInterval = 150;
        }

        time = new Date();
        me.spinUp();
        timeInterval--;
        if(timeInterval < 20){
          timeInterval = 20;
        }
      }
    }, 20);

    docEl.once('mouseup', function(){
      clearInterval(me.spinInterval);
    });
  },
  /*
   *
   */
  onMouseDownSpinDown: function(e){
    var me = this,
      docEl = Fancy.get(document),
      timeInterval = 700,
      time = new Date();

    e.preventDefault();

    me.mouseDownSpinDown = true;

    me.spinDown();

    me.spinInterval = setInterval(function(){
      me.mouseDownSpinDown = false;

      if(new Date() - time > timeInterval){
        if(timeInterval === 700){
          timeInterval = 150;
        }

        time = new Date();
        me.spinDown();
        timeInterval--;
        if(timeInterval < 20){
          timeInterval = 20;
        }
      }
    }, 20);

    docEl.once('mouseup', function(){
      clearInterval(me.spinInterval);
    });
  },
  /*
   *
   */
  spinUp: function(){
    var me = this,
      newValue = +me.get() + me.step;

    if(Fancy.Number.isFloat(me.step)){
      newValue = Fancy.Number.correctFloat(newValue);
    }

    if( isNaN(newValue) ){
      newValue = me.min || 0;
    }

    if( me.max !== undefined && newValue > me.max ){
      newValue = me.max;
    }
    else if(newValue < me.min){
      newValue = me.min;
    }

    me.set(newValue);
  },
  /*
   *
   */
  spinDown: function(){
    var me = this,
      newValue = +me.get() - me.step;

    if(Fancy.Number.isFloat(me.step)){
      newValue = Fancy.Number.correctFloat(newValue);
    }

    if( isNaN(newValue) ){
      newValue = me.min || 0;
    }

    if( me.min !== undefined && newValue < me.min ){
      newValue = me.min;
    }
    else if(newValue > me.max){
      newValue = me.max;
    }

    me.set(newValue);
  }
});
/*
 * @class Fancy.TextField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Text', 'Fancy.TextField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.text',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);

    me.preRender();
    me.render();

    //me.ons();

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }
  },
  fieldCls: 'fancy fancy-field fancy-field-field-text',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      '<div class="fancy-field-text-value">{value}</div>',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   * @param {*} value
   */
  set: function(value){
    var me = this;

    me.el.select('.fancy-field-text-value').item(0).update(value);
  }
});
/*
 * @class Fancy.EmptyField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Empty', 'Fancy.EmptyField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.empty',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents();

    me.Super('init', arguments);

    me.preRender();
    me.render();

    if( me.style ){
      me.css(me.style);
    }
  },
  /*
   *
   */
  ons: function(){},
  fieldCls: 'fancy fancy-field fancy-field-empty',
  width: 100,
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ]
});
/*
 * @class Fancy.TextArea
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.TextArea', 'Fancy.TextArea'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.textarea',
  /*
   * @constructor
   */
  constructor: function(){
    var me = this;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('change');
    me.Super('init', arguments);

    me.preRender();
    me.render();

    me.ons();
  },
  fieldCls: 'fancy fancy-field fancy-textarea',
  value: '',
  width: 250,
  height: 100,
  labelWidth: 60,
  inputWidth: 180,
  minHeight: 100,
  maxHeight: 210,
  lineHeight: 12.5,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-textarea-text">',
      //'<textarea autocomplete="off" placeholder="{emptyText}" type="text" class="fancy-textarea-text-input" style="{inputWidth}height:{height}px;">{value}</textarea>',
      '<textarea autocomplete="off" placeholder="{emptyText}" type="text" class="fancy-textarea-text-input" style="{inputWidth}height:{inputHeight}px;">{value}</textarea>',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   *
   */
  ons: function(){
    var me = this,
      input = me.el.getByTag('textarea');

    me.input = input;
    input.on('blur', me.onBlur, me);
    input.on('focus', me.onFocus, me);
    input.on('input', me.onInput, me);
    input.on('keydown', me.onKeyDown, me);

    if( me.autoHeight ){
      input.on('input', me.onChange, me);
    }
  },
  /*
   *
   */
  preRender: function(){
    var me = this;

    if(me.tpl) {
      me.tpl = new Fancy.Template(me.tpl);
    }

    me.initHeight();
    me.calcSize();
  },
  /*
   *
   */
  initHeight: function(){
    var me = this,
      height;

    if(me.height){
      height = me.height;
      if(me.maxHeight < me.height){
        me.maxHeight = me.height;
        setTimeout(function(){
          me.input.css({
            'overflow-y': 'scroll'
          });
        }, 1);
      }
    }
    else if(me.value){
      var length = me.value.match(/\n/g);

      if(length){
        length = length.length;
      }
      else{
        length = 1;
      }

      height = length * me.lineHeight;
    }
    else{
      height = me.height;
    }

    if( height < me.minHeight ){
      height = me.minHeight;
    }
    else if(height > me.maxHeight){
      height = me.maxHeight;
      setTimeout(function(){
        me.input.css({
          'overflow-y': 'scroll'
        });
      }, 1);
    }

    me.height = height;
    me.inputHeight = height;
  },
  /*
   *
   */
  calcSize: function(){
    var me = this,
      inputWidth = me.inputWidth,
      padding = me.padding,
      value,
      value1,
      value2,
      value3;

    if(Fancy.isString(padding)){
      padding = padding.replace(/px/g, '');
      padding = padding.split(' ');
      switch(padding.length){
        case 1:
          value = Number(padding[0]);
          padding = [value, value, value, value];
          break;
        case 2:
          value1 = Number(padding[0]);
          value2 = Number(padding[1]);

          padding = [value1, value2, value1, value2];
          break;
        case 3:
          value1 = Number(padding[0]);
          value2 = Number(padding[1]);
          value3 = Number(padding[2]);

          padding = [value1, value2, value3, value1];
          break;
        case 4:
          padding = [Number(padding[0]), Number(padding[1]), Number(padding[2]), Number(padding[3])];
          break;
      }
    }
    else if(Fancy.isNumber(padding)){
      padding = [padding, padding, padding, padding];
    }
    else if(padding === false){
      padding = [0, 0, 0, 0];
    }

    if(me.labelAlign === 'top'){
      me.inputHeight -= 40;
    }

    inputWidth = me.width;

    if(me.labelAlign !== 'top' && me.label){
      inputWidth -= me.labelWidth;
    }

    if(me.height === me.inputHeight && me.padding !== false){
      me.inputHeight -= padding[0] + padding[2];
    }

    me.inputWidth = inputWidth -  padding[1] - padding[3];
    me.height = me.inputHeight + padding[0] + padding[2];
  },
  /*
   *
   */
  onChange: function(){
    var me = this,
      value = me.input.dom.value,
      input = me.el.getByTag('textarea'),
      height = value.match(/\n/g).length * me.lineHeight;

    if( height < me.minHeight ){
      height = me.minHeight;
      input.css({
        'overflow-y': 'hidden'
      });
    }
    else if(height > me.maxHeight){
      height = me.maxHeight;
      input.css({
        'overflow-y': 'scroll'
      });
    }
    else{
      input.css({
        'overflow-y': 'hidden'
      });
    }

    me.height = height;
  }
});
/*
 * @class Fancy.CheckBox
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.CheckBox', 'Fancy.CheckBox'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.checkbox',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    Fancy.applyConfig(me, config || {});

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents(
      'focus', 'blur', 'input',
      'up', 'down',
      'beforechange', 'change',
      'key'
    );

    me.Super('init', arguments);

    me.preRender();
    me.render({
      labelWidth: me.labelWidth,
      labelDispay: me.labelText? '': 'none',
      label: me.label
    });

    if(me.expander){
      me.addClass('fancy-checkbox-expander');
    }

    me.acceptedValue = me.value;
    me.set(me.value, false);

    me.ons();
  },
  labelText: '',
  labelWidth: 60,
  value: false,
  editable: true,
  stopIfCTRL: false,
  checkedCls: 'fancy-checkbox-on',
  fieldCls: 'fancy fancy-field fancy-field-checkbox',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      '<div class="fancy-field-checkbox-input" style=""></div>',
    '</div>',
    '<div class="fancy-field-input-label" style="inputLabelDisplay">',
      '{inputLabel}',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   *
   */
  ons: function(){
    var me = this,
      el = me.el;

    el.on('click', me.onClick, me);
    el.on('mousedown', me.onMouseDown, me);
  },
  /*
   *
   */
  onClick: function(e){
    var me = this,
      el = me.el,
      checkedCls = me.checkedCls;

    me.fire('beforechange');

    if(e.ctrlKey && me.stopIfCTRL){
      return
    }

    if(me.editable === false){
      return;
    }

    if(me.canceledChange === true){
      me.canceledChange = true;
      return;
    }

    el.toggleClass(checkedCls);
    var oldValue = me.value;
    me.value = el.hasClass(checkedCls);
    me.fire('change', me.value, oldValue);
  },
  /*
   * @params {Object} e
   */
  onMouseDown: function(e){

    e.preventDefault();
  },
  /*
   * @params {*} value
   * @params {Boolean} fire
   */
  set: function(value, fire){
    var me = this,
      el = me.el,
      checkedCls = me.checkedCls;

    if(value === ''){
      value = false;
    }

    if(value === true || value === 1){
      el.addClass(checkedCls);
      value = true;
    }
    else if(value === false || value === 0){
      el.removeClass(checkedCls);
      value = false;
    }
    else if(value === undefined){
      value = false;
    }
    else{
      throw new Error('not right value for checkbox ' + value);
    }

    me.value = value;
    if(fire !== false){
      me.fire('change', me.value);
    }
  },
  /*
   * @params {*} value
   * @params {Boolean} fire
   */
  setValue: function(value, onInput){
    this.set(value, onInput);
  },
  /*
   * @return {*}
   */
  getValue: function(){
    var me = this;

    return me.value;
  },
  /*
   * @return {*}
   */
  get: function(){
    return this.getValue();
  },
  /*
   *
   */
  clear: function(){
    this.set(false);
  },
  /*
   *
   */
  toggle: function(){
    var me = this;

    me.set(!me.value);
  }
});
/*
 * @class Fancy.Switcher
 */
Fancy.define(['Fancy.form.field.Switcher', 'Fancy.Switcher'], {
  extend: Fancy.CheckBox,
  type: 'field.switcher',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    Fancy.applyConfig(me, config || {});

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    this.Super('init', arguments);
  },
  checkedCls: 'fancy-switcher-on',
  fieldCls: 'fancy fancy-field fancy-field-switcher',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      //'<div class="fancy-field-switcher-input" style=""></div>',
    '</div>',
    '<div class="fancy-field-input-label" style="inputLabelDisplay">',
      '{inputLabel}',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ]
});
/**
 * @class Fancy.Combo
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Combo', 'Fancy.Combo'], {
  type: 'field.combo',
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  selectedItemCls: 'fancy-combo-item-selected',
  width: 250,
  labelWidth: 60,
  listRowHeight: 25,
  dropButtonWidth: 27,
  emptyText: '',
  editable: true,
  typeAhead: true, // not right name
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
    '<div class="fancy-combo-input-container" style="{inputWidth}{inputHeight}">',
      '<input placeholder="{emptyText}" class="fancy-field-text-input" style="{inputWidth}{inputHeight}cursor:default;" value="{value}">',
      '<div class="fancy-combo-dropdown-button">&nbsp;</div>',
    '</div>',
    '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   * @constructor
   */
  constructor: function(){
    var me = this;

    me.tags = me.tags || [];
    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents(
      'focus', 'blur', 'input',
      'up', 'down', 'change', 'key', 'enter', 'esc',
      'load'
    );
    me.Super('init', arguments);

    me.loadListData();

    me.preRender();
    me.render();

    me.ons();

    //me.applySize();
    me.applyStyle();
    me.applyTheme();
  },
  /*
   *
   */
  loadListData: function(){
    var me = this;

    if(!Fancy.isObject(me.data)){
      return;
    }

    var proxy = me.data.proxy;
    if(!proxy || !proxy.url){
      throw new Error('[FancyGrid Error]: combo data url is not defined');
    }

    Fancy.Ajax({
      url: proxy.url,
      params: proxy.params || {},
      method: proxy.method || 'GET',
      getJSON: true,
      success: function(o){
        me.data = me.configData(o.data);
        me.renderList();
        me.onsList();

        me.fire('load');
      }
    });
  },
  /*
   * @param {Array} data
   * @return {Array}
   */
  configData: function(data){
    return data;
  },
  /*
   *
   */
  applyStyle: function(){
    var me = this;

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }
  },
  /*
   *
   */
  applyTheme: function(){
    var me = this;

    if( me.theme && me.theme !== 'default' ){
      me.addClass('fancy-theme-' + me.theme);
      me.list.addClass('fancy-theme-' + me.theme);
    }
  },
  fieldCls: 'fancy fancy-field fancy-combo',
  /*
   *
   */
  ons: function () {
    var me = this,
      drop = me.el.select('.fancy-combo-dropdown-button');

    me.input = me.el.getByTag('input');
    me.inputContainer = me.el.select('.fancy-combo-input-container');
    me.drop = drop;

    me.onsList();

    me.input.on('mousedown', me.onInputMouseDown, me);
    me.input.on('click', me.onInputClick, me);
    drop.on('mousedown', me.onDropMouseDown, me);
    drop.on('click', me.onDropClick, me);

    if(me.typeAhead && me.editable){
      me.input.on('keydown', me.onKeyDown, me);
    }

    me.on('esc', me.onEsc, me);
    me.on('enter', me.onEnter, me);
    me.on('up', me.onUp, me);
    me.on('down', me.onDown, me);
  },
  /*
   * @param {Object} e
   */
  onKeyDown: function(e){
    var me = this,
      keyCode = e.keyCode,
      key = Fancy.key;

    switch(keyCode) {
      case key.ESC:
        me.fire('esc', e);
        break;
      case key.ENTER:
        me.fire('enter', e);
        break;
      case key.UP:
        me.fire('up', e);
        break;
      case key.DOWN:
        me.fire('down', e);
        break;
      case key.TAB:
        break;
      default:
        setTimeout(function() {
          if(me.generateAheadData().length === 0){
            me.hideAheadList();
            return;
          }

          me.renderAheadList();
          me.showAheadList();
        }, 1);
    }
  },
  /*
   * @param {Object} e
   */
  onInputClick: function(e){
    var me = this,
      list = me.list;

    if(me.editable === true){
      return;
    }

    if (list.css('display') === 'none') {
      me.showList();
    }
    else {
      me.hideList();
    }
  },
  /*
   * @param {Object} e
   */
  onDropClick: function(e){
    var me = this,
      list = me.list;

    if (list.css('display') === 'none') {
      me.showList();
    }
    else {
      me.hideList();
    }

    if(me.editable === true){
      me.input.focus();
    }
  },
  /*
   *
   */
  showList: function(){
    var me = this,
      list = me.list,
      el = me.input.parent().parent(),
      p = el.$dom.offset(),
      xy = [p.left, p.top + el.$dom.height()],
      docEl = Fancy.get(document),
      selectedItemCls = me.selectedItemCls;

    me.hideAheadList();

    if(!me.list){
      return;
    }

    list.css({
      display: '',
      left: xy[0] + 'px',
      top: xy[1] + 'px',
      width: el.width(),
      "z-index": 2000 + Fancy.zIndex++
    });

    var index;

    if( list.select('.' + selectedItemCls).length === 0 ){
      list.select('li').item(0).addClass(selectedItemCls);
      index = 0;
    }
    else{
      index = list.select('.' + selectedItemCls).item(0).index();
    }

    //TODO
    //me.scrollToListItem(index);

    if(!me.docSpy){
      me.docSpy = true;
      docEl.on('click', me.onDocClick, me);
    }
  },
  /*
   *
   */
  showAheadList: function(){
    var me = this,
      list = me.aheadList,
      el = me.input.parent().parent(),
      p = el.$dom.offset(),
      xy = [p.left, p.top + el.$dom.height()],
      docEl = Fancy.get(document);

    me.hideList();

    if(!list){
      return;
    }

    list.css({
      display: '',
      left: xy[0] + 'px',
      top: xy[1] + 'px',
      width: el.width(),
      "z-index": 2000 + Fancy.zIndex++
    });

    if(!me.docSpy2){
      me.docSpy2 = true;
      docEl.on('click', me.onDocClick, me);
    }
  },
  /*
   * @param {Object} e
   */
  onDocClick: function(e){
    var me = this;

    if(me.input.parent().parent().within(e.target) === false){
      me.hideList();
      me.hideAheadList();
    }
  },
  /*
   *
   */
  hideList: function(){
    var me = this;

    if(!me.list){
      return;
    }

    me.list.css('display', 'none');

    if(me.docSpy){
      var docEl = Fancy.get(document);
      me.docSpy = false;
      docEl.un('click', me.onDocClick, me);
    }
  },
  /*
   *
   */
  hideAheadList: function(){
    var me = this;

    if(!me.aheadList){
      return;
    }

    me.aheadList.css('display', 'none');

    if(me.docSpy){
      var docEl = Fancy.get(document);
      me.docSpy = false;
      docEl.un('click', me.onDocClick, me);
    }
  },
  /*
   * @param {Object} e
   */
  onInputMouseDown: function(e){
    var me = this;

    if(me.editable === false){
      e.preventDefault();
    }
  },
  /*
   * @param {Object} e
   */
  onDropMouseDown: function(e){
    var me = this;

    e.preventDefault();
  },
  /*
   *
   */
  onsList: function(){
    var me = this;

    me.list.on('click', me.onListItemClick, me, 'li');
  },
  /*
   *
   */
  onsAheadList: function(){
    var me = this;

    me.aheadList.on('click', me.onListItemClick, me, 'li');
  },
  /*
   * @param {Object} e
   */
  onListItemClick: function(e){
    var me = this,
      li = Fancy.get(e.currentTarget),
      value = li.attr('value');

    if(Fancy.nojQuery && value === 0){
      value = '';
    }

    me.set(value);
    me.hideList();

    me.onBlur();
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  set: function(value, onInput){
    var me = this,
      valueStr = '',
      i = 0,
      iL = me.data.length,
      found = false;

    for (; i < iL; i++) {
      if (me.data[i][me.valueKey] == value) {
        me.valueIndex = i;
        valueStr = me.data[i][me.displayKey];
        found = true;
        break;
      }
    }

    me.selectItem(i);

    if (found === false) {
      if(value !== - 1 && value && value.length > 0){
        valueStr = value;
        me.value = -1;
        me.valueIndex = -1;
      }
      else{
        valueStr = '';
      }
    }

    me.input.dom.value = valueStr;
    me.value = value;

    if (onInput !== false) {
      me.onInput();
    }
  },
  /*
   * @param {Number} index
   */
  selectItem: function(index){
    var me = this;

    if(!me.list){
      return;
    }

    me.clearListActive();
    me.list.select('li').item(index).addClass(me.selectedItemCls);
  },
  /*
   *
   */
  render: function () {
    var me = this,
      renderTo = Fancy.get(me.renderTo || document.body).dom,
      el = Fancy.get(document.createElement('div')),
      value = me.value;

    el.attr('id', me.id);

    if (value === undefined) {
      value = '';
    }
    else {
      var i = 0,
        iL = me.data.length,
        found = false;

      for (; i < iL; i++) {
        if (me.data[i][me.valueKey] === value) {
          me.valueIndex = i;
          value = me.data[i][me.displayKey];
          found = true;
          break;
        }
      }

      if (found === false) {
        value = '';
      }
    }

    me.fire('beforerender');
    el.addClass( me.cls );
    el.addClass( me.fieldCls );

    var labelWidth = '',
      inputHeight = '';

    if (me.labelWidth) {
      labelWidth = 'width:' + me.labelWidth + 'px;';
    }

    var left = me.labelWidth + 8 + 10;

    if (me.labelAlign === 'top') {
      left = 8;
    }

    if (me.labelAlign === 'right') {
      left = 8;
    }

    var label = me.label;

    if (me.label === '') {
      label = '&nbsp;';
    }
    else if (me.label === undefined) {
      label = '&nbsp;';
    }
    else if (me.labelAlign !== 'right') {
      label += ':';
    }

    el.update( me.tpl.getHTML({
      labelWidth: labelWidth,
      labelDisplay: me.label === false ? 'display: none;' : '',
      label: label === false ? '' : label,
      emptyText: me.emptyText,
      inputHeight: 'height:' + me.inputHeight + 'px;',
      value: value//,
      //height: me.height
    }) );

    me.el = el;
    me.setStyle();

    me.input = me.el.getByTag('input');
    me.inputContainer = me.el.select('.fancy-combo-input-container');
    me.drop = me.el.select('.fancy-combo-dropdown-button');
    me.setSize();
    renderTo.appendChild(el.dom);

    if (me.labelAlign === 'top') {
      me.el.addClass('fancy-field-label-align-top');
    }
    else if (me.labelAlign === 'right') {
      me.el.addClass('fancy-field-label-align-right');
      $(el.dom).find('.fancy-field-label').insertAfter($(el.dom).find('.fancy-field-text'));
    }

    if (me.valueIndex) {
      me.acceptedValue = me.value;
    }

    if(me.editable){
      me.input.css('cursor', 'auto');
    }

    me.renderList();

    me.fire('afterrender');
    me.fire('render');
  },
  /*
   *
   */
  renderList: function(){
    var me = this,
      list = Fancy.get( document.createElement('div')),
      listHtml = [
        '<ul style="position: relative;">'
      ];

    if(me.list){
      me.list.destroy();
    }

    Fancy.each(me.data, function (row, i) {
      var isActive = '',
        displayValue = row[me.displayKey],
        value = row[me.valueKey];

      if (me.value === value) {
        isActive = me.selectedItemCls;
      }

      if (displayValue === '' || displayValue === ' ') {
        displayValue = '&nbsp;';
      }
      else if(me.listItemTpl){
        var listTpl = new Fancy.Template(me.listItemTpl);
        displayValue = listTpl.getHTML(row);
      }

      listHtml.push('<li value="' + value + '" class="' + isActive + '"><span class="fancy-combo-list-value">' + displayValue + '</span></li>');
    });

    listHtml.push('</ul>');

    list.addClass('fancy fancy-combo-result-list');
    list.update( listHtml.join("") );
    list.css({
      display: 'none',
      left: '0px',
      top: '0px',
      width: me.inputWidth + 14
    });

    if (me.data.length > 9) {
      list.css({
        height: me.listRowHeight * 9 + 'px',
        overflow: 'auto'
      });
    }

    document.body.appendChild(list.dom);
    me.list = list;
  },
  /*
   *
   */
  generateAheadData: function(){
    var me = this,
      inputValue = me.input.dom.value.toLocaleLowerCase(),
      data = me.data,
      aheadData = [],
      i = 0,
      iL = data.length;

    for(;i<iL;i++){
      if(new RegExp('^' + inputValue).test(data[i][me.displayKey].toLocaleLowerCase())){
        aheadData.push(data[i]);
      }
    }

    if(me.data.length === aheadData.length){
      aheadData = [];
    }

    me.aheadData = aheadData;

    return aheadData;
  },
  /*
   *
   */
  renderAheadList: function(){
    var me = this,
      list,
      listHtml = [
        '<ul style="position: relative;">'
      ],
      presented = false;

    if(me.aheadList){
      me.aheadList.firstChild().destroy();
      list = me.aheadList;
      presented = true;
    }
    else{
      list = Fancy.get( document.createElement('div'));
    }

    Fancy.each(me.aheadData, function (row, i) {
      var isActive = '',
        displayValue = row[me.displayKey],
        value = row[me.valueKey];

      if (i === 0) {
        isActive = me.selectedItemCls;
      }

      if (displayValue === '' || displayValue === ' ') {
        displayValue = '&nbsp;';
      }

      listHtml.push('<li value="' + value + '" class="' + isActive + '"><span class="fancy-combo-list-value">' + displayValue + '</span></li>');
    });

    listHtml.push('</ul>');

    list.update( listHtml.join("") );
    list.css({
      display: 'none',
      left: '0px',
      top: '0px',
      width: me.inputWidth + 14
    });

    if (me.aheadData.length > 9) {
      list.css({
        height: me.listRowHeight * 9 + 'px',
        overflow: 'auto'
      });
    }

    if(presented === false){
      list.addClass('fancy fancy-combo-result-list');
      document.body.appendChild(list.dom);
      me.aheadList = list;

      me.onsAheadList();
    }
  },
  /*
   *
   */
  hide: function(){
    var me = this;

    me.css('display', 'none');
    me.hideList();
    me.hideAheadList();
  },
  /*
   *
   */
  clear: function(){
    var me = this;

    me.set(-1, false);
  },
  /*
   *
   */
  clearListActive: function(){
    var me = this,
      selectedItemCls = me.selectedItemCls;

    me.list.select('.' + selectedItemCls).removeClass(selectedItemCls);
  },
  /*
   *
   */
  onInput: function(){
    var me = this,
      value = me.getValue(),
      oldValue = me.acceptedValue;

    me.acceptedValue = me.get();
    me.fire('change', value, oldValue);
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  setValue: function(value, onInput){
    this.set(value, onInput);
  },
  /*
   * @param {key} value
   * @return {*}
   */
  getDisplayValue: function(value){
    var me = this,
      i = 0,
      iL = me.data.length;

    for(; i < iL; i++){
      if(me.data[i][me.valueKey] == value){
        return me.data[i][me.displayKey];
      }
    }
  },
  /*
   * @param {key} value
   */
  getValueKey: function(value){
    var me = this,
      i = 0,
      iL = me.data.length;

    for(; i < iL; i++){
      if(me.data[i][me.displayKey] === value){
        return me.data[i][me.valueKey];
      }
    }
  },
  /*
   * @return {*}
   */
  get: function(){
    return this.getValue();
  },
  /*
   * @return {*}
   */
  getValue: function(){
    var me = this;

    if (me.value === -1 || me.value === undefined) {
      if(me.value === -1 && me.input.dom.value){
        return me.input.dom.value;
      }
      return '';
    }

    if (me.valueKey !== undefined) {
      return me.value;
    }

    return me.value;
  },
  /*
   * @param {Object} o
   */
  size: function(o){
    var me = this,
      width = o.width,
      height = o.height,
      input = me.input,
      inputContainer = me.inputContainer,
      drop = me.drop;

    if(me.labelAlign !== 'top'){
      me.inputHeight = height;
    }

    if(height !== undefined) {
      me.height = height;
    }

    if(width !== undefined){
      me.width = width;
    }

    me.calcSize();

    if(me.labelAlign === 'top'){
      me.css({
        height: me.height * 1.5,
        width: me.width
      });
    }
    else{
      me.css({
        height: me.height,
        width: me.width
      });
    }

    var inputWidth = me.inputWidth;

    if(me.label === false){
      inputWidth = me.width;
    }

    //inputWidth -= me.dropButtonWidth;

    input.css({
      width: inputWidth - 2,
      height: me.inputHeight
    });

    inputContainer.css({
      width: inputWidth,
      height: me.inputHeight
    });

    drop.css('height', me.inputHeight);
  },
  /*
   * @param {Object} field
   * @param {Object} e
   */
  onEnter: function(field, e){
    var me = this,
      list = me.getActiveList();

    if(list){
      var value = list.select('.' + me.selectedItemCls).attr('value');

      me.set(value);
    }
    else{
      me.set(me.input.dom.value);
    }

    me.hideList();
    me.hideAheadList();
  },
  /*
   * @param {Object} field
   * @param {Object} e
   */
  onEsc: function(field, e){
    var me = this;

    me.hideList();
    me.hideAheadList();
  },
  /*
   * @param {Object} field
   * @param {Object} e
   */
  onUp: function(field, e){
    var me = this,
      list = me.getActiveList(),
      selectedItemCls = me.selectedItemCls;
    
    if(list){
      e.preventDefault();
      var activeLi = list.select('.' + selectedItemCls),
        index = activeLi.index(),
        lis = list.select('li'),
        height = parseInt(list.css('height'));

      if(index !== 0){
        index--;
      }
      else{
        index = lis.length - 1;
      }

      var nextActiveLi = lis.item(index),
        top = nextActiveLi.offset().top;

      if(index === lis.length - 1){
        list.dom.scrollTop = 10000;
      }
      else if(top - parseInt( nextActiveLi.css('height') ) <  parseInt( nextActiveLi.css('height') ) ){
        list.dom.scrollTop = list.dom.scrollTop - parseInt(activeLi.css('height'));
      }

      activeLi.removeClass(selectedItemCls);
      nextActiveLi.addClass(selectedItemCls);
    }
  },
  /*
   * @param {Object} field
   * @param {Object} e
   */
  onDown: function(field, e){
    var me = this,
      list = me.getActiveList(),
      selectedItemCls = me.selectedItemCls;

    if(list){
      e.preventDefault();
      var activeLi = list.select('.' + selectedItemCls),
        index = activeLi.index(),
        lis = list.select('li'),
        top = activeLi.offset().top,
        height = parseInt(list.css('height'));

      if(index !== lis.length - 1){
        index++;
      }
      else{
        index = 0;
      }

      var nextActiveLi = lis.item(index);

      if(top - height > 0){
        list.dom.scrollTop = 0;
      }
      else if(top - height > -parseInt( activeLi.css('height') ) ) {
        list.dom.scrollTop = list.dom.scrollTop + (top - height) + parseInt(activeLi.css('height'));
      }

      activeLi.removeClass(selectedItemCls);
      nextActiveLi.addClass(selectedItemCls);
    }
    else{
      me.showList();
    }
  },
  //TODO
  /*
   * @param {Number} index
   */
  scrollToListItem: function(index){
    var me = this,
      list = me.getActiveList(),
      lis = list.select('li'),
      item = lis.item(index),
      top = item.offset().top,
      height = parseInt(list.css('height')),
      scrollTop = list.dom.scrollTop;

    if(index === 0){
      list.dom.scrollTop = 0;
    }
    else if(index === lis.length - 1){
      list.dom.scrollTop = 10000;
    }
    else{
      list.dom.scrollTop = top;
    }
  },
  /*
   * @return {Fancy.Element}
   */
  getActiveList: function(){
    var me = this,
      list = false;

    if(me.list && me.list.css('display') !== 'none'){
      list = me.list;
    }
    else if(me.aheadList && me.aheadList.css('display') !== 'none'){
      list = me.aheadList;
    }

    return list;
  }
});
/*
 * @class Fancy.ButtonField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Button', 'Fancy.ButtonField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.button',
  pressed: false,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('click');

    me.Super('init', arguments);

    me.preRender();
    me.render();
    me.renderButton();

    me.ons();

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }
  },
  fieldCls: 'fancy fancy-field fancy-field-button',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    //'<div class="fancy-field-text fancy-button">',
    '<div class="fancy-field-text">',
      //'<div class="fancy-button-image"></div>',
      //'<a class="fancy-button-text">{buttonText}</a>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  renderButton: function(){
    var me = this;

    new Fancy.Button({
      renderTo: me.el.select('.fancy-field-text').item(0).dom,
      text: me.buttonText,
      handler: function(){
        if(me.handler){
          me.handler();
        }
      }
    });
  },
  /*
   *
   */
  ons: function(){
    var me = this;

    //me.el.select('.fancy-button').item(0).on('click', me.onClick, me);
  },
  /*
   *
   */
  onClick: function(){
    var me = this;

    me.fire('click');

    if(me.handler){
      me.handler();
    }
  }
});
/*
 * @class Fancy.SegButtonField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.SegButton', 'Fancy.SegButtonField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.button',
  allowToggle: true,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('click', 'change');

    me.Super('init', arguments);

    me.preRender();
    me.render();
    me.renderButton();

    me.ons();

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }
  },
  fieldCls: 'fancy fancy-field fancy-field-button',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    //'<div class="fancy-field-text fancy-button">',
    '<div class="fancy-field-text">',
      //'<div class="fancy-button-image"></div>',
      //'<a class="fancy-button-text">{buttonText}</a>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   *
   */
  renderButton: function(){
    var me = this;

    me.button = new Fancy.SegButton({
      renderTo: me.el.select('.fancy-field-text').item(0).dom,
      items: me.items,
      multiToggle: me.multiToggle,
      allowToggle: me.allowToggle
    });
  },
  /*
   *
   */
  ons: function(){
    var me = this;

    me.button.on('toggle', function(){
      me.fire('toggle');
    });
  },
  /*
   *
   */
  onClick: function(){
    var me = this;

    me.fire('click');

    if(me.handler){
      me.handler();
    }
  },
  /*
   * @return {String}
   */
  get: function(){
    var me = this,
      items = me.items,
      i = 0,
      iL = items.length,
      pressed = [];

    for(;i<iL;i++){
      var item = items[i];

      if(item.pressed){
        if(item.value){
          pressed.push(item.value);
        }
        else {
          pressed.push(i);
        }
      }
    }

    return pressed.toString();
  },
  /*
   *
   */
  clear: function(fire){
    var me = this,
      items = me.items,
      i = 0,
      iL = items.length;

    if(me.allowToggle){
      for(;i<iL;i++){
        items[i].setPressed(false, fire);
      }
    }
  }
});
/*
 * @class Fancy.Tab
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Tab', 'Fancy.Tab'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.tab',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('collapsed', 'expanded');

    me.Super('init', arguments);

    var i = 0,
      iL = me.items.length,
      isItemTop;

    for(;i<iL;i++){
      var item = me.items[i];

      if( item.labelAlign === 'top' ){
        isItemTop = true;
        //break;
        if( i === 0 ){
          item.style = {
            'padding-left': '0px'
          };
        }
      }
    }

    me.preRender();
    me.render();
  },
  fieldCls: 'fancy fancy-field-tab',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-text fancy-field-tab-items">',
    '</div>'
  ]
});
/*
 * @class Fancy.Radio
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Radio', 'Fancy.Radio'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.radio',
  /*
   * @constructor
   */
  constructor: function(){
    var me = this;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('focus', 'blur', 'input', 'up', 'down', 'change', 'key');
    me.Super('init', arguments);

    var itemsHTML = '',
      items = me.items,
      i = 0,
      iL = items.length;

    if( me.column ){
      me.cls += ' fancy-field-radio-column';
      itemsHTML += '<div style="margin-left: '+ ( me.labelWidth )+'px;">';
    }

    for(;i<iL;i++){
      var item = items[i],
        marginLeft = '',
        itemCls = 'fancy-field-text';

      if( !me.column && i !== 0 ){
        marginLeft = 'margin-left:10px;';
      }

      if( item.value === me.value ){
        itemCls += ' fancy-field-radio-on';
      }

      itemsHTML += [
        '<div class="'+itemCls+'" value='+item.value+'>',
          '<div class="fancy-field-radio-input" style="float:left;'+marginLeft+'"></div>',
          '<div style="float:left;margin:7px 0px 0px 0px;">'+item.text+'</div>',
        '</div>'
      ].join("");
    }

    if( me.column ){
      itemsHTML += '</div>';
    }

    me.itemsHTML = itemsHTML;

    me.preRender();
    me.render();
    me.acceptedValue = me.value;
    me.set(me.value);

    me.ons();
  },
  labelText: '',
  labelWidth: 60,
  value: false,
  checkedCls: 'fancy-field-radio-on',
  fieldCls: 'fancy fancy-field fancy-field-radio',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '{itemsHTML}',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   *
   */
  ons: function(){
    var me = this,
      el = me.el;

    el.$dom.delegate('.fancy-field-text', 'click', function(){
      me.set(Fancy.get(this).attr('value'));
    });

    el.on('mousedown', me.onMouseDown, me);
  },
  /*
   *
   */
  onClick: function(){
    var me = this,
      checkedCls = me.checkedCls;

    me.addClass(checkedCls);
    me.toggleClass(checkedCls);

    me.value = me.hasClass(checkedCls);

    me.fire('change', me.value);
  },
  /*
   *
   */
  onMouseDown: function(e){

    e.preventDefault();
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  set: function(value, fire){
    var me = this,
      el = me.el,
      checkedCls = me.checkedCls,
      radioEls = el.select('.fancy-field-text');

    radioEls.removeClass(checkedCls);

    el.select('[value='+value+']').addClass(checkedCls);

    me.value = value;
    if(fire !== false){
      me.fire('change', me.value);
    }
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  setValue: function(value, onInput){
    this.set(value, onInput);
  },
  /*
   * @return {*} value
   */
  getValue: function(){
    var me = this;

    return me.value;
  },
  /*
   * @return {*} value
   */
  get: function(){

    return this.getValue();
  },
  /*
   *
   */
  clear: function(){
    this.set(false);
  }
});
(function () {

  Fancy.vtypes = {};

  /*
   * @param {String} name
   * @param {Object} o
   */
  Fancy.addValid = function(name, o){
    Fancy.vtypes[name] = o;
  };


  /*
   * @param {*} type
   * @param {*} value
   * @return {Boolean}
   */
  Fancy.isValid = function(type, value){
    var vtype;

    if (Fancy.isString(type)) {
      vtype = Fancy.vtypes[type];
    }
    else if (Fancy.isObject(type)) {
      if(type.type){
        vtype = Fancy.vtypes[type.type];
        Fancy.applyIf(type, vtype);
      }
      else{
        vtype = type;
      }
    }

    if (vtype.before) {
      var before = vtype.before,
        list = [type];

      if (Fancy.isString(before)) {
        list.push(before);
      }
      else if (Fancy.isArray(before)) {
        list = list.concat(before);
      }

      list.reverse();

      var i = 0,
        iL = list.length;

      for (; i < iL; i++) {
        if (Fancy.isObject(list[i])) {
          vtype = list[i];
        }
        else {
          vtype = Fancy.vtypes[list[i]];
        }

        if (vtype.re) {
          if(vtype.re.test(value) === false){
            return vtype;
          }
        }
        else if (vtype.fn) {
          if (vtype.fn.apply(vtype, [value]) === false) {
            return vtype;
          }
        }
      }
    }
    else {
      if (vtype.re) {
        if(vtype.re.test(value) === false){
          return vtype;
        }
      }
      if (vtype.fn.apply(vtype, [value]) === false) {
        return vtype;
      }
    }

    return true;
  };

})();
Fancy.addValid('notempty', {
  text: 'Must be present',
  fn: function(value){
    if(value === null || value === undefined){
      return false;
    }

    return String(value).length !== 0;
  }
});

Fancy.addValid('notnan', {
  text: 'Must be numeric',
  fn: function(value){
    return !isNaN(value);
  }
});

Fancy.addValid('min', {
  before: ['notempty', 'notnan'],
  text: 'Must be must be at least {param}',
  fn: function(value){
    return value > this.param;
  }
});

Fancy.addValid('max', {
  before: ['notempty', 'notnan'],
  text: 'Must be no more than {param}',
  fn: function(value){
    return value < this.param;
  }
});

Fancy.addValid('range', {
  before: ['notempty', 'notnan'],
  text: 'Must be between {min} and {max}',
  fn: function(value){
    return value >= this.min && value <= this.max;
  }
});

Fancy.addValid('email', {
  before: 'notempty',
  re: /^(")?(?:[^\."])(?:(?:[\.])?(?:[\w\-!#$%&'*+\/=?\^_`{|}~]))*\1@(\w[\-\w]*\.){1,5}([A-Za-z]){2,6}$/,
  text: 'Is not a valid email address'
});
/*
 * @mixin Fancy.grid.mixin.Edit
 */
Fancy.Mixin('Fancy.grid.mixin.Edit', {
  /*
   * @param {*} o
   * @param {Boolean} at
   */
  remove: function(o, at){
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
        store[method](o[i]);
      }
    }
    else{
      store[method](o);
    }

    me.setSidesHeight();
  },
  /*
   * @param {*} o
   */
  removeAt: function(o){
    var me = this;

    me.remove(o, true);
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
   */
  insert: function(index, o){
    var me = this,
      s = me.store;

    if(!me.store){
      setTimeout(function(){
        me.insert(index, o)
      }, 100);
      return;
    }

    if(Fancy.isArray(o)){
      var i = o.length - 1;

      for(;i !== -1;i--){
        me.insert(o[i], index);
      }

      me.setSidesHeight();
      return;
    }
    else if(Fancy.isArray(index)){
      var i = index.length - 1;

      for(;i !== -1;i--){
        me.insert(index[i], 0);
      }

      me.setSidesHeight();
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

    s.insert(index, o);
    me.setSidesHeight();
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
   */
  setById: function(id, key, value){
    var me = this,
      s = me.store,
      rowIndex = s.getRow(id);

    if(!me.store){
      setTimeout(function(){
        me.set(rowIndex, key, value)
      }, 100);
      return;
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
      }

      s.setItemData(rowIndex, key, value);
    }
    else {
      s.set(rowIndex, key, value);
    }
  }
});
/**
 * @class Fancy.Grid
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.Grid', 'FancyGrid'], {
  extend: Fancy.Widget,
  mixins: [
    'Fancy.grid.mixin.Grid',
    Fancy.panel.mixin.PrepareConfig,
    Fancy.panel.mixin.methods,
    'Fancy.grid.mixin.PrepareConfig',
    'Fancy.grid.mixin.ActionColumn',
    Fancy.grid.mixin.Edit
  ],
  plugins: [{
    type: 'grid.updater'
  },{
    type: 'grid.scroller'
  },{
    type: 'grid.licence'
  }],
  type: 'grid',
  theme: 'default',
  i18n: 'en',
  emptyText: '',
  prefix: 'fancy-grid-',
  cls: '',
  widgetCls: 'fancy-grid',
  cellCls: 'fancy-grid-cell',
  pseudoCellCls: 'fancy-grid-pseudo-cell',
  cellInnerCls: 'fancy-grid-cell-inner',
  cellEvenCls: 'fancy-grid-cell-even',
  clsASC: 'fancy-grid-column-sort-ASC',
  clsDESC: 'fancy-grid-column-sort-DESC',
  clsSparkColumn: 'fancy-grid-column-sparkline',
  clsSparkColumnBullet: 'fancy-grid-column-sparkline-bullet',
  clsSparkColumnCircle: 'fancy-grid-column-chart-circle',
  clsSparkColumnDonutProgress: 'fancy-grid-column-spark-progress-donut',
  clsColumnGrossLoss: 'fancy-grid-column-grossloss',
  clsColumnProgress: 'fancy-grid-column-progress',
  clsGroupRow: 'fancy-grid-group-row',
  clsCollapsedRow: 'fancy-grid-group-row-collapsed',
  rowOverCls: 'fancy-grid-cell-over',
  expandRowOverCls: 'fancy-grid-expand-row-over',
  cellOverCls: 'fancy-grid-cell-over',
  cellSelectedCls: 'fancy-grid-cell-selected',
  expandRowSelectedCls: 'fancy-grid-expand-row-selected',
  columnCls: 'fancy-grid-column',
  columnOverCls: 'fancy-grid-column-over',
  columnSelectedCls: 'fancy-grid-column-selected',
  filterHeaderCellCls: 'fancy-grid-header-filter-cell',
  cellHeaderDoubleSize: 'fancy-grid-header-cell-double-size',
  rowEditCls: 'fancy-grid-row-edit',
  rowEditButtonCls: 'fancy-grid-row-edit-buttons',
  clsSparkColumnHBar: 'fancy-grid-column-h-bar',
  header: true,
  shadow: true,
  striped: true,
  columnLines: true,
  textSelection: false,
  width: 200,
  height: 200,
  minWidth: 200,
  minHeight: 200,
  emptyValue: '&nbsp;',
  frame: true,
  keyNavigation: false,
  draggable: false,
  activated: false,
  multiSort: false,
  tabEdit: true,
  dirtyEnabled: true,
  barScrollEnabled: true,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    var fn = function(params){
      if(params){
        Fancy.apply(config, params);
      }

      config = me.prepareConfig(config, me);
      Fancy.applyConfig(me, config);

      me.Super('const', arguments);
    };

    var preInit = function(){
      var i18n = config.i18n || me.i18n;

      if( Fancy.loadLang(i18n, fn) === true ){
        var lang = config.lang;

        fn({
          //lang: Fancy.i18n[i18n]
        });
      }
    };

    if(!Fancy.modules['grid'] && !Fancy.fullBuilt && Fancy.MODULELOAD !== false ){
      Fancy.loadModule('grid', function(){
        preInit();
      });
    }
    else{
      preInit();
    }
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.initId();
    me.addEvents('beforerender', 'afterrender', 'render', 'show', 'hide', 'destroy');
    me.addEvents(
      'headercellclick', 'headercellmousemove', 'headercellmousedown',
      'docmouseup', 'docclick', 'docmove',
      'init',
      'columnresize', 'columnclick', 'columndblclick', 'columnenter', 'columnleave', 'columnmousedown',
      'cellclick', 'celldblclick', 'cellenter', 'cellleave', 'cellmousedown', 'beforecellmousedown',
      'rowclick', 'rowdblclick', 'rowenter', 'rowleave', 'rowtrackenter', 'rowtrackleave',
      'scroll',
      'remove',
      'set',
      'update',
      'sort',
      'beforeload', 'load',
      'select',
      'clearselect',
      'activate', 'deactivate',
      'beforeedit',
      'startedit',
      'changepage',
      'dropitems',
      'collapse', 'expand',
      'filter'
    );

    if(Fancy.fullBuilt !== true && Fancy.MODULELOAD !== false && me.fullBuilt !== true && me.neededModules !== true){
      if(me.wtype !== 'datepicker' && me.wtype !== 'monthpicker') {
        me.loadModules();
        return;
      }
    }

    me.initStore();

    //me.Super('init', arguments);
    me.initPlugins();

    me.ons();

    me.initDateColumn();
    me.fire('beforerender');
    me.preRender();
    me.render();
    me.initElements();
    me.initActionColumnHandler();
    me.fire('render');
    me.fire('afterrender');
    me.setSides();
    me.setSidesHeight();
    me.setColumnsPosition();
    me.update();
    me.initTextSelection();
    me.initTouch();

    setTimeout(function(){
      me.inited = true;
      me.fire('init');
    }, 1);
  },
  /*
   *
   */
  loadModules: function(){
    var me = this,
      requiredModules = {},
      columns = me.columns || [],
      leftColumns = me.leftColumns || [],
      rightColumns = me.rightColumns || [];

    Fancy.modules = Fancy.modules || {};

    if(Fancy.nojQuery){
      requiredModules.dom = true;
    }

    if(Fancy.isTouch){
      requiredModules.touch = true;
    }

    if(me.paging){
      requiredModules.paging = true;
    }

    if(me.filter || me.searching){
      requiredModules.filter = true;
    }

    if(me.data && me.data.proxy){
      requiredModules.edit = true;
    }

    if(me.clicksToEdit){
      requiredModules.edit = true;
    }

    //if(me.searching){
      //requiredModules.search = true;
    //}

    if(Fancy.isObject(me.data)){
      if(me.data.proxy){
        requiredModules['server-data'] = true;
        if(Fancy.nojQuery){
          requiredModules['ajax'] = true;
        }
      }

      if(me.data.chart){
        requiredModules['chart-integration'] = true;
      }
    }

    if(me.expander){
      requiredModules['expander'] = true;
    }

    if(me.isGroupedHeader){
      requiredModules['grouped-header'] = true;
    }

    if(me.grouping){
      requiredModules['grouping'] = true;
    }

    if(me.trackOver || me.columnTrackOver || me.cellTrackOver || me.selection){
      requiredModules['selection'] = true;
    }

    var _columns = columns.concat(leftColumns).concat(rightColumns),
      i = 0,
      iL = _columns.length;

    for(;i<iL;i++){
      var column = _columns[i];

      if(column.sortable === true){
        requiredModules.sort = true;
      }

      if(column.editable === true){
        requiredModules.edit = true;
      }

      if(column.menu === true){
        requiredModules.menu = true;
      }

      if(column.filter){
        requiredModules.filter = true;
      }

      switch(column.type){
        case 'select':
          me.checkboxRowSelection = true;
          requiredModules['selection'] = true;
          break;
        case 'combo':
          if(column.data && column.data.proxy){
            requiredModules['ajax'] = true;
          }
          break;
        case 'progressbar':
        case 'progressdonut':
        case 'grossloss':
        case 'hbar':
          requiredModules.spark = true;
          break;
        case 'date':
          requiredModules.date = true;
          requiredModules.selection = true;
          break;
      }
    }

    if(Fancy.isArray(me.tbar)){
      var i = 0,
        iL = me.tbar.length;

      for(;i<iL;i++){
        switch(me.tbar[i].action){
          case 'add':
          case 'remove':
            requiredModules.edit = true;
            break;
        }
      }
    }

    if(me.gridToGrid){
      requiredModules.dd = true;
    }

    me.neededModules = {
      length: 0
    };

    for(var p in requiredModules){
      if(Fancy.modules[p] === undefined) {
        me.neededModules[p] = true;
        me.neededModules.length++;
      }
    }

    if(me.neededModules.length === 0){
      me.neededModules = true;
      me.init();
      return;
    }

    var onLoad = function(name){
      delete me.neededModules[name];
      me.neededModules.length--;

      if(me.neededModules.length === 0){
        me.neededModules = true;
        me.init();
      }
    };

    for(var p in me.neededModules){
      if(p === 'length'){
        continue;
      }

      Fancy.loadModule(p, onLoad);
    }
  },
  lockColumn: function(indexOrder, side){
    var me = this,
      removedColumn = me.removeColumn(indexOrder, side);

    me.insertColumn(removedColumn, me.leftColumns.length, 'left');
  },
  rightLockColumn: function(indexOrder, side){
    var me = this,
      removedColumn = me.removeColumn(indexOrder, side);

    me.insertColumn(removedColumn, 0, 'right');
  },
  unLockColumn: function(indexOrder, side){
    var me = this,
      removedColumn;

    switch(side){
      case 'left':
        removedColumn = me.removeColumn(indexOrder, side);
        me.insertColumn(removedColumn, 0, 'center');
        break;
      case 'right':
        removedColumn = me.removeColumn(indexOrder, side);
        me.insertColumn(removedColumn, me.columns.length, 'center');
        break;
    }
  }
});

FancyGrid.get = function(id){
  var gridId = Fancy.get(id).select('.fancy-grid').dom.id;

  return Fancy.getWidget(gridId);
};

FancyGrid.defineTheme = Fancy.defineTheme;
FancyGrid.defineController = Fancy.defineController;
FancyGrid.addValid = Fancy.addValid;

if(!Fancy.nojQuery && Fancy.$){
  Fancy.$.fn.FancyGrid = function(o){
    o.renderTo = $(this.selector)[0].id;
    return new Fancy.Grid(o);
  };
}
/*
 * @class Fancy.grid.plugin.CellTip
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.CellTip', {
  extend: Fancy.Plugin,
  ptype: 'grid.celltip',
  inWidgetName: 'celltip',
  cellTip: '{value}',
  stopped: true,
  /*
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);

    me.ons();
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget,
      store = w.store,
      docEl = Fancy.get(document);

    w.on('cellenter', me.onCellEnter, me);
    w.on('cellleave', me.onCellLeave, me);
    docEl.on('touchend', me.onTouchEnd, me);
    docEl.on('mousemove', me.onDocMove, me);
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onCellEnter: function(grid, o){
    var me = this,
      column = o.column,
      cellTip = me.cellTip,
      e = o.e;

    if(column.cellTip){
      if(Fancy.isString(column.cellTip)){
        cellTip = column.cellTip;
      }
      else if(Fancy.isFunction(column.cellTip)){
        cellTip = column.cellTip(o);
        if(cellTip === false){
          return;
        }
      }

      var tpl = new Fancy.Template(cellTip),
        data = {
          title: column.title,
          value: o.value,
          columnIndex: 0,
          rowIndex:0
        };

      me.stopped = false;
      Fancy.apply(data, o.data);

      Fancy.tip.update(tpl.getHTML(data));
      Fancy.tip.show(e.pageX + 15, e.pageY - 25);
    }
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onCellLeave: function(grid, o){
    var me = this;

    me.stopped = true;
    Fancy.tip.hide(1000);
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onTouchEnd: function(grid, o){
    var me = this;

    me.stopped = true;
    Fancy.tip.hide(1000);
  },
  /*
   * @param {Object} e
   */
  onDocMove: function(e){
    var me = this;

    if(me.stopped === true){
      return;
    }

    Fancy.tip.show(e.pageX + 15, e.pageY - 25);
  }
});
/*
 * @class Fancy.ToolTip
 * @extends Fancy.Widget
 */
Fancy.define('Fancy.ToolTip', {
  extend: Fancy.Widget,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.initTpl();
    me.render();
  },
  tpl: [
    '<div class="fancy-tooltip-inner">{text}</div>'
  ],
  widgetCls: 'fancy-tooltip',
  cls: '',
  extraCls: '',
  /*
   *
   */
  initTpl: function(){
    var me = this;

    me.tpl = new Fancy.Template(me.tpl);
  },
  /*
   *
   */
  render: function(){
    var me = this,
      renderTo = Fancy.get(me.renderTo || document.body).dom,
      el = Fancy.get(document.createElement('div'));

    el.addClass(Fancy.cls);
    el.addClass(me.widgetCls);
    el.addClass(me.cls);
    el.addClass(me.extraCls);

    el.update(me.tpl.getHTML({
      text: me.text
    }));

    me.el = Fancy.get(renderTo.appendChild(el.dom));
  },
  /*
   * @param {Number} x
   * @param {Number} y
   */
  show: function(x, y){
    var me = this;

    if(me.timeout){
      clearInterval(me.timeout);
      delete me.timeout;
    }

    if(me.css('display') === 'none'){
      me.css({
        display: 'block'
      });
    }

    me.css({
      left: x,
      top: y
    });
  },
  /*
   *
   */
  hide: function(delay){
    var me = this;

    if(me.timeout){
      clearInterval(me.timeout);
      delete me.timeout;
    }

    if(delay){
      me.timeout = setTimeout(function(){
        me.el.hide();
      }, delay);
    }
    else {
      me.el.hide();
    }
  },
  /*
   *
   */
  destroy: function(){
    var me = this;

    me.el.destroy();
  },
  /*
   * @param {String} html
   */
  update: function(html){
    this.el.select('.fancy-tooltip-inner').update(html);
  }
});

Fancy.tip = {
  update: function(text){
    Fancy.tip = new Fancy.ToolTip({
      text: text
    });
  },
  show: function(x, y){
    Fancy.tip = new Fancy.ToolTip({
      text: ' '
    });
    Fancy.tip.show(x, y);
  },
  hide: function(){
    Fancy.tip = new Fancy.ToolTip({
      text: ' '
    });
  }
};
Fancy.enableCompo = function(){
  var doc = document,
    componentsLength = 0,
    components = {},
    compMap = {},
    interval;

  Fancy.Component = function (selector, o) {
    componentsLength++;
    components[selector] = o;
  };

  Fancy.stopWatch = function(){
    clearInterval(interval);
  };

  function findComponent() {
    if (componentsLength === 0) return;

    for (var p in components) {
      var comp = components[p],
        founded = doc.querySelectorAll(p),
        attrPreSelector = comp.appPreSelector ? comp.appPreSelector + '-' : 'data-',
        preSelector = comp.preSelector ? comp.preSelector + '-' : 'fancy-',
        i = 0,
        iL = founded.length,
        j,
        jL;

      if (founded.length === 0) {
        return;
      }

      for (; i < iL; i++) {
        var itemConfig = {},
          item = founded[i],
          id = item.id || 'rand-id-' + (+new Date()),
          attrs = item.attributes;

        j = 0;
        jL = attrs.length;

        //Get values in attributes values
        for (; j < jL; j++) {
          var attr = attrs[j],
            attrName = attr.name,
            attrValue = attr.value;

          if (new RegExp(attrPreSelector).test(attrName)) {
            attrValue = prePareValue(attrValue);

            itemConfig[attrName.replace(attrPreSelector, '')] = attrValue;
          }
        }

        //Get values in innerHTML tags
        (function getValuesInTags() {
          var childs = item.getElementsByTagName('*');

          j = 0;
          jL = childs.length;

          for (; j < jL; j++) {
            var child = childs[j],
              tagName = child.tagName.toLowerCase(),
              name,
              value;

            if (new RegExp(preSelector).test(tagName)) {
              name = tagName.replace(preSelector, '');
              value = prePareValue(child.innerHTML);

              itemConfig[name.replace(attrPreSelector, '')] = value;
            }
          }

        })(item, itemConfig);

        item.outerHTML = '<div id="' + id + '"></div>';
        comp.init(doc.getElementById(id), itemConfig);
      }
    }
  }

  function prePareValue(v) {
    if (/\[/.test(v) || /\{/.test(v)) {
      v = v.replace(/\n/g, '');
      v = (new Function("return " + v + ";")());
    }
    else if (!isNaN(Number(v))) {
      v = Number(v);
    }
    else {
      v = v.replace(/\n/g, '');
    }

    return v;
  }

  findComponent();

  doc.addEventListener("DOMContentLoaded", function (event) {
    findComponent();
  });

  setTimeout(function(){
    findComponent();
  }, 1);

  interval = setInterval(function(){
    findComponent();
  }, 250);

  Fancy.Component('fancy-grid', {
    preSelector: 'fancy',
    attrPreSelector: 'data',
    init: function (el, config) {
      config.renderTo = el;

      window[el.id] = new FancyGrid(config);
    }
  });

  Fancy.Component('fancy-form', {
    preSelector: 'fancy',
    attrPreSelector: 'data',
    init: function (el, config) {
      config.renderTo = el;

      window[el.id] = new FancyForm(config);
    }
  });

  Fancy.Component('fancy-tab', {
    preSelector: 'fancy',
    attrPreSelector: 'data',
    init: function (el, config) {
      config.renderTo = el;

      window[el.id] = new FancyTab(config);
    }
  });
};
