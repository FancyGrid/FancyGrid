Fancy.$ = window.$ || window.jQuery;
Fancy.nojQuery = Fancy.$ === undefined;

/*
 * @param {String|Number} id
 * @return {Fancy.Element}
 */
Fancy.get = (id) => {
  const type = Fancy.typeOf(id);

  switch(type){
    case 'string':
      return new Fancy.Element(Fancy.$('#'+id)[0]);
    case 'array':
      return new Fancy.Elements(id);
    default:
      return new Fancy.Element(id);
  }
};

/*
 * @class Fancy.Element
 */
Fancy.Element = function(dom){
  const me = this;

  me.dom = dom;
  me.$dom = Fancy.$(dom);

  if (dom && dom.id) {
    me.id = dom.id;
  }

  me.length = 1;
};

Fancy.Element.prototype = {
  /*
   * @return {Fancy.Element}
   */
  last() {
    return Fancy.get(this.$dom);
  },
  /*
   * @param {String} selector
   * @return {Fancy.Element}
   */
  closest(selector) {
    return Fancy.get(this.$dom.closest(selector)[0]);
  },
  /*
   *
   */
  destroy(){
    this.$dom.remove();
  },
  /*
   *
   */
  remove(){
    this.$dom.remove();
  },
  /*
   *
   */
  finish(){
    this.$dom.finish();
  },
  //Not Used
  /*
   *
   */
  prev() {
    return Fancy.get(this.$dom.prev()[0]);
  },
  /*
   * @return {Fancy.Element}
   */
  lastChild() {
    const children = this.$dom.children();

    return Fancy.get(children[children.length - 1]);
  },
  /*
   * @return {Fancy.Element}
   */
  firstChild() {
    return Fancy.get(this.$dom.children()[0]);
  },
  /*
   * @return {Array}
   */
  child() {
    return this.$dom.children().map(child => Fancy.get(child));
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} scope
   * @param {String} delegate
   */
  on(eventName, fn, scope, delegate){
    const me = this;

    if (scope) {
      fn = Fancy.$.proxy(fn, scope);
    }

    if(delegate){
      me.$dom.on(eventName, delegate, fn);
    }
    else{
      me.$dom.on(eventName, fn);
    }

    //bad bug fixes
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
  once(eventName, fn, scope, delegate){
    const me = this;

    if (scope) {
      fn = Fancy.$.proxy(fn, scope);
    }

    if (delegate) {
      me.$dom.one(eventName, delegate, fn);
    }
    else {
      me.$dom.one(eventName, fn);
    }
  },
  /*
   * @param {String} name
   * @return {String}
   */
  prop: function(name) {
    return this.$dom.prop(name);
  },
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} scope
   * @param {String} delegate
   */
  un(eventName, fn, scope, delegate){
    const me = this;

    if (scope) {
      fn = Fancy.$.proxy(fn, scope);
    }

    if (delegate) {
      me.$dom.off(eventName, delegate, fn);
    }
    else{
      me.$dom.off(eventName, fn);
    }
  },
  /*
   *
   */
  show(){
    this.$dom.show();
  },
  /*
   *
   */
  hide(){
    this.$dom.hide();
  },
  /*
   * @param {String} oldCls
   * @param {String} newCls
   */
  replaceClass(oldCls, newCls){
    this.$dom.removeClass(oldCls);
    this.$dom.addClass(newCls);
  },
  /*
   * @param {String} tag
   * @return {Fancy.Element}
   */
  getByTag(tag) {
    return Fancy.get(this.$dom.find(tag)[0]);
  },
  getByClass(cls) {
    return this.$dom.find(`.${cls}`)[0];
  },
  /*
   * @param {...String} args
   */
  addClass(...args){
    this.addCls.apply(this, args);
  },
  /*
   * @param {String} cls
   */
  addCls(cls, ...args){
    this.$dom.addClass(cls);
    args.forEach(arg => this.$dom.addClass(arg));
  },
  /*
   * @param {String} cls
   */
  removeClass(cls, ...args){
    this.$dom.removeClass(cls);
    args.forEach(arg => this.$dom.removeClass(arg));
  },
  /*
   * @param {String} cls
   */
  removeCls(cls, ...args){
    this.$dom.removeClass(cls);
    args.forEach(arg => this.$dom.removeClass(arg));
  },
  /*
   * @param {String} cls
   * @return {Boolean}
   */
  hasClass(cls) {
    return this.$dom.hasClass(cls);
  },
  /*
   * @param {String} cls
   * @return {Boolean}
   */
  hasCls(cls) {
    return this.$dom.hasClass(cls);
  },
  /*
   * @param {String} cls
   */
  toggleClass(cls){
    this.$dom.toggleClass(cls);
  },
  /*
   * @param {String} cls
   */
  toggleCls(cls){
    this.$dom.toggleClass(cls);
  },
  /*
   * @param {String} selector
   * @return {Array}
   */
  select(selector){
    const me = this,
      founded = me.$dom.find(selector);
    //founded = me.dom.querySelectorAll(selector);

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
        addClass: () => {},
        addCls: () => {},
        removeClass: () => {},
        removeCls: () => {},
        destroy: () => {},
        remove: () => {},
        css: () => {},
        each: () => {},
        last: () => {},
        attr: () => {}
      };
    }

    return founded;
  },
  /*
   * @param {*} o1
   * @param {String|Number} o2
   * @return {String|Number}
   */
  css(o1, o2){
    if (o2 === undefined) {
      return this.$dom.css(o1);
    }
    return this.$dom.css(o1, o2);
  },
  /*
   * @param {*} attr
   * @param {String|Number} o2
   * @return {String|Number}
   */
  attr(o1, o2){
    if (o2 === undefined){
      return this.$dom.attr(o1);
    }
    return this.$dom.attr(o1, o2);
  },
  /*
   * @param {String} html
   * @return {Fancy.Element}
   */
  append(html) {
    return Fancy.get(this.$dom.append(html)[0]);
  },
  after(html) {
    return Fancy.get(this.$dom.after(html)[0]);
  },
  next() {
    return Fancy.get(this.$dom.next()[0]);
  },
  /*
   *
   */
  insertAfter(html) {
    return Fancy.get(this.$dom.insertAfter(html)[0]);
  },
  /*
   * @param {String} html
   .* @return {Fancy.Element}
   */
  before(html) {
    return Fancy.get(this.$dom.before(html)[0]);
  },
  /*
   * @param {String|Number} value
   * @return {Number}
   */
  height(value){
    if (value) {
      this.$dom.height(value);
      return this;
    }

    return this.$dom.height();
  },
  /*
   * @param {String|Number} value
   * @return {Number}
   */
  width(value){
    if (value) {
      this.$dom.width(value);
      return this;
    }

    return this.$dom.width();
  },
  /*
   * @param {String} selector
   * @return {Fancy.Element}
   */
  parent(selector) {
    return Fancy.get(this.$dom.parent(selector)[0]);
  },
  /*
   * @param {String} html
   */
  update(html){
    this.dom.innerHTML = html;
  },
  /*
   * @param {Function} overFn
   * @param {Function} outFn
   */
  hover(overFn, outFn){
    if (overFn) {
      this.$dom.on('mouseenter', overFn);
    }

    if (overFn) {
      this.$dom.on('mouseleave', outFn);
    }
  },
  /*
   * @return {Object}
   */
  position() {
    return this.$dom.position();
  },
  /*
   * @return {Object}
   */
  offset() {
    return this.$dom.offset();
  },
  /*
   *
   */
  focus(){
    this.$dom.focus();
  },
  /*
   *
   */
  blur(){
    this.$dom.blur();
  },
  /*
   * @param {HTMLElement} child
   * @return {Boolean}
   */
  within(child){
    var me = this,
      childId,
      isWithin = true,
      removeId = false;

    child = Fancy.get(child);
    childId = child.attr('id');

    if (childId === undefined || childId === '') {
      childId = Fancy.id();
      removeId = true;
    }

    child.attr('id', childId);

    if (me.select(`#${childId}`).length === 0) {
      isWithin = false;
    }

    if (me.dom.id === child.dom.id) {
      isWithin = true;
    }

    if (removeId) {
      me.removeAttr(childId);
    }

    return isWithin;
  },
  /*
   * @param {String} attr
   */
  removeAttr(attr){
    this.$dom.removeAttr(attr);
  },
  /*
   * @return {Fancy.Element}
   */
  item(){
    return this;
  },
  /*
   *
   */
  stop(){
    if (this.$dom.stop) {
      this.$dom.stop();
    }
  },
  /*
   * @param {String} style
   * @param {Number} speed
   * @param {String} easing
   * @param {Function} callback
   */
  animate(style, speed, easing, callback){
    var _style = {},
      doAnimating = false,
      force = style.force;

    if (!Fancy.nojQuery) {
      doAnimating = true;
      force = true;
    }

    if (Fancy.isObject(style)) {
      delete style.force;
    }

    for(const p in style){
      let newValue = style[p];

      if (Fancy.isString(newValue)) {
        newValue = Number(newValue.replace('px', ''));
      }

      let oldValue = this.css(p);

      if (Fancy.isString(oldValue)) {
        oldValue = Number(oldValue.replace('px', ''));
      }

      if(newValue !== oldValue){
        _style[p] = style[p];
        doAnimating = true;
      }
    }

    if (doAnimating === false) {
      return;
    }

    if (force) {
      this.$dom.animate(_style,speed,easing,callback);
    }
    else {
      this.$dom.css(_style);
    }
  },
  /*
   * @return {Number}
   */
  index() {
    return this.$dom.index();
  },
  onTouchEnterEvent(eventName, fn, scope, delegate){
    const me = this,
      docEl = Fancy.get(document.body);

    if(!Fancy.isTouch){
      return;
    }

    var wrappedFn = function(e, target){
      const tempId = Fancy.id(),
        tempAttr = 'fancy-tempt-attr';

      e = e.originalEvent || e;

      me.attr(tempAttr, tempId);

      var touchXY = e.targetTouches[0],
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
  onTouchLeaveEvent(eventName, fn, scope, delegate){
    var me = this,
      docEl = Fancy.get(document.body),
      arr = [];

    if(!Fancy.isTouch){
      return;
    }

    const wrappedFn = function (e, target) {
      var tempId = Fancy.id(),
        tempAttr = 'fancy-tempt-attr',
        e = e.originalEvent || e;

      me.attr(tempAttr, tempId);

      if (me.touchIn !== true) {
        me.removeAttr(tempAttr);
        return;
      }

      var touchXY = e.targetTouches[0],
        xy = [touchXY.pageX, touchXY.pageY],
        targetEl = Fancy.get(document.elementFromPoint(xy[0] - document.body.scrollLeft, xy[1] - document.body.scrollTop));

      if (!delegate) {
        var isWithin = false,
          maxDepth = 10,
          parentEl = targetEl;

        while (maxDepth > 0) {
          if (!parentEl.dom) {
            break;
          }

          if (parentEl.attr(tempAttr) === tempId) {
            isWithin = true;
            break;
          }
          parentEl = parentEl.parent();
          maxDepth--;
        }

        if (isWithin === false) {
          e.pageX = touchXY.pageX;
          e.pageY = touchXY.pageY;

          me.touchIn = false;
          fn(e, target);
          me.removeAttr(tempAttr);
          return;
        }
      }

      if (arr.length > 30) {
        arr = arr.slice(arr.length - 5, arr.length - 1);
      }

      arr.push(targetEl.dom);

      if (delegate && me.touchInDelegate[delegate]) {
        var delegateTarget,
          delegateTempId = Fancy.id();

        if (Fancy.isArray(me.touchInDelegate[delegate])) {
          delegateTarget = Fancy.get(me.touchInDelegate[delegate][0]);
        } else {
          delegateTarget = Fancy.get(me.touchInDelegate[delegate]);
        }

        delegateTarget.attr(tempAttr, delegateTempId);

        maxDepth = 10;
        var found = false;
        parentEl = targetEl;

        while (maxDepth > 0) {
          if (!parentEl.dom) {
            break;
          }

          if (parentEl.attr(tempAttr) === delegateTempId) {
            found = true;
            break;
          }

          parentEl = parentEl.parent();
          maxDepth--;
        }

        delegateTarget.removeAttr(tempAttr);

        if (!found) {
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
  getDelegateTarget(delegate, delegates, arr, _i){
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
  /*
   * @param {String} eventName
   * @param {Function} fn
   * @param {Object} [scope]
   */
  onTouchMove(eventName, fn, scope){
    const me = this,
      docEl = Fancy.get(document.body);

    if (!Fancy.isTouch) {
      return;
    }

    const wrappedFn = function (e, target) {
      const tempId = Fancy.id(),
        tempAttr = 'fancy-tempt-attr';

      e = e.originalEvent || e;

      me.attr(tempAttr, tempId);

      var touchXY = e.targetTouches[0],
        xy = [touchXY.pageX, touchXY.pageY],
        isWithin = false,
        maxDepth = 10,
        targetEl = Fancy.get(document.elementFromPoint(xy[0] - document.body.scrollLeft, xy[1] - document.body.scrollTop)),
        parentEl = targetEl;

      while (maxDepth > 0) {
        if (!parentEl.dom) {
          break;
        }

        if (parentEl.attr(tempAttr) === tempId) {
          isWithin = true;
          break;
        }
        parentEl = parentEl.parent();
        maxDepth--;
      }

      me.removeAttr(tempAttr);

      if (!isWithin) {
        return;
      }

      e.pageX = touchXY.pageX;
      e.pageY = touchXY.pageY;

      fn(e, target);
    };

    docEl.on('touchmove', wrappedFn);
  },
  /*
   * @param {Function} fn
   */
  each(fn){
    fn(this, 0);
  },
  /*
   *
   */
  getCls() {
    return this.dom.className.split(/\s+/);
  }
};

/*
 * @class Fancy.Elements
 * @constructor
 * @param {HTMLElement|HTMLElements} dom
 */
Fancy.Elements = function(dom){
  const me = this;

  me.dom = dom;
  me.$dom = dom;
  me.length = dom.length;
};

Fancy.Elements.prototype = {
  attr(o1, o2){
    var me = this,
      dom = me.$dom;

    if(me.length > 1){
      dom = me.$dom[0];
    }

    if( o2 === undefined ){
      return dom.attr(o1);
    }

    return dom.attr(o1, o2);
  },
  /*
   * @param {...String} args
   */
  addClass(...args){
    this.addCls.apply(this, args);
  },
  /*
   *
   */
  finish(){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).finish();
    }
  },
  /*
   * @param {...String} args
   */
  addCls(cls){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).addClass(cls);
    }

    if(arguments.length > 1){
      i = 1;
      iL = arguments.length;

      for(;i<iL;i++){
        me.addClass(arguments[i]);
      }
    }
  },
  /*
   * @param {String} cls
   */
  removeClass(cls){
    this.removeCls.apply(this, arguments);
  },
  /*
   * @param {String} cls
   */
  removeCls(cls){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).removeCls(cls);
    }
  },
  /*
   * @param {Function} fn
   */
  hover(fn){
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
  item(index) {
    return Fancy.get(this.$dom[index]);
  },
  /*
   * @param {*} o1
   * @param {String|Number} o2
   * @return {String|Number}
   */
  css(o1, o2){
    const me = this;
    let i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).css(o1, o2);
    }
  },
  /*
   * @param {String} cls
   */
  toggleClass(cls){
    const me = this;
    let i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).toggleClass(cls);
    }
  },
  /*
   * @param {String} cls
   */
  toggleCls(cls){
    const me = this;
    let i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).toggleClass(cls);
    }
  },
  /*
   *
   */
  destroy(){
    const me = this;
    let i = 0,
      iL = me.length;

    for(;i<iL;i++){
      Fancy.get(me.$dom[i]).destroy();
    }
  },
  /*
   *
   */
  remove(){
    this.destroy();
  },
  /*
   *
   */
  hide(){
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
  show(){
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
  index(){
    return this.$dom[0].index();
  },
  /*
   * @param {Function} fn
   */
  each(fn){
    var me = this,
      i = 0,
      iL = me.length,
      el;

    for(;i<iL;i++){
      el = new Fancy.Element(me.$dom[i]);

      fn(el, i);
    }
  },
  last(){
    const me = this;

    return new Fancy.Element(me.$dom[me.length - 1]);
  }
};

/*
 * @param {String} selector
 */
Fancy.select = (selector) => {
  return Fancy.get(document.body).select(selector);
};

/*
  Fancy.onReady
*/

/*
 * @param {Function} fn
 */
Fancy.onReady = (fn) => {
  Fancy.$(document).ready(fn);
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
Fancy.Ajax = (o) => {
  const _o = {};

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

  if(o.dataType){
    _o.dataType = o.dataType;
  }

  if(o.sendJSON){
    _o.dataType = 'json';
    _o.contentType = 'application/json; charset=utf-8';
    _o.data = JSON.stringify(_o.data);
  }

  if(o.getJSON){
    _o.dataType = 'json';
    _o.contentType = 'application/json; charset=utf-8';
  }

  if(o.headers){
    _o.headers = o.headers;
  }

  Fancy.$.ajax(_o);
};
