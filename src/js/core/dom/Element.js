/*
 * file is not used, but could be used in future
 */

(function(){

var opacityRe = /alpha\(opacity=(.*)\)/gi,
		trimRe = /^\s+|\s+$/g,
		view = document.defaultView,
		propCache = {},
		camelRe = /(-[a-z])/gi;
	
	function camelFn(m, a){
    return a.charAt(1).toUpperCase();
  }
	
	function chkCache(prop){
    return propCache[prop] || (propCache[prop] = prop.replace(camelRe, camelFn));
  }
	
	var classNameREFn = function(className){
		return new RegExp('^' + className+'$| '+className+' |^'+className+' | ' + className + '$');
	};
 
function isWindow( obj ){
	return obj != null && obj === obj.window;
}

function getWindow(dom){
	return isWindow(dom) ? dom : dom.nodeType === 9 && dom.defaultView;
}

Fancy.$ = function(selector){ 
  return new El(selector);
};

var guid = 1;

Fancy.proxy = function( fn, context ){
  var tmp, args, proxy;

  if ( typeof context === "string" ) {
    tmp = fn[ context ];
    context = fn;
    fn = tmp;
  }

  if ( !Fancy.isFunction( fn ) ) {
    return undefined;
  }
  
  args = slice.call( arguments, 2 );
  proxy = function() {
    return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
  };

  proxy.guid = fn.guid = fn.guid || guid++;

  return proxy;
};

var El = function(selector){
  var me = this,
    els = [];
  
  switch(Fancy.typeOf(selector)){
    case 'string':
      els = document.querySelectorAll(selector);
      break;
    case 'object':
      els[0] = selector;
      break;
  }
  
  var i = 0,
    iL = els.length;
  
  for(;i<iL;i++){
    me[i] = els[i];
  }
  
  me.length = els.length;
};

/*
unAll
on
un
hover???
within in FancyGrid self
*/

var each = function(fn){
  var i = 0,
    els = this.els,
    iL = els.length;
  
  for(;i<iL;i++){
    fn(els[i]);
  }
};

var remove = function(){
  var me = this,
    parent = me.parent(false);
  
  me.unAll();
  
  if( parent ){
    me.each(function(el){
      parent.removeChild(el);
    });
  }
};

El.prototype = {
  each: each,
  destroy: remove,
  remove: remove,
  parent: function(returnEl){
    var me = this,
      dom = me[0],
			parent = dom.parentNode || dom.parentElement;
			
		if(returnEl === false){
			return parent;
		}
		else{
			return Fancy.get(parent);
		}
  },
  firstChild: function(){
    return Fancy.get(this[0].firstChild);
  },
  getByTag: function(tag){
    return Fancy.get(this[0].getElementsByTagName(tag));
  },
  update: function(html){
    this[0].innerHTML = html;
  },
  focus: function(){
    this[0].focus();
  },
  item: function(index){
    if(this.length === 1){
      return this;
    }
    
    return Fancy.get(this[index]);
  },
  append: function(html){
    var me = this,
      nextSibling = me.next().dom,
      dom = document.createElement(config.tag || 'div');
    
    dom.outerHTML = html;
    
		if(nextSibling === null){
			me[0].appendChild(dom);
		}
		else{
			me[0].insertBefore(dom, nextSibling);
		}
  },
  next: function(){
    return Fancy.get(this[0].nextSibling);
  },
  removeAttr: function(attr){
    this[0].removeAttribute(attr);
  },
  select: function(selector){
    var me = this,
      founded = me[0].querySelectorAll(selector);
    
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
        destroy: function(){}
      };
    }
  },
  hasClass: function(className){
    return className && (' '+this.dom.className+' ').indexOf(' '+className+' ') !== -1;
  },
  addClass: function(className){
    var me = this;
    
    if(typeof className === 'string'){
      me.each(function(dom){
        if( className && !Fancy.get(dom).hasClass(className) ){
          dom.className = dom.className + " " + className;
        }
      });
    }
    else{
      var i = 0,
        iL = className.length;
      
      for(;i<iL;i++){
        me.addClass(className[i]);
      }
    }
    
    return this;
  },
  removeClass: function(className){
    //Not good realization about performance
    var me = this;
    
    if( Fancy.isArray(className) ){
      var i = 0, 
        iL = className.length;
      
      for(;i<iL; i++){
        me.removeClass(className[i]);
      }
    }
    else{
      me.each(function(dom){
        var el = Fancy.get(dom);
        if( el.hasClass(className) ){
          var re = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)', "g");
          
          el[0].className = el[0].className.replace(re, " ");
        }
      });
    }
  },
  toggleClass: function(className){
    var me = this;
    
    return me.hasClass(className) ? me.removeClass(className) : me.addClass(className);
  },
  show: function(){
    this.removeAttr('display');
    this.removeAttr('opacity');
  },
  prop: function(name){
    this[0].getAttribute(name);
  },
  attr: function(o1, o2){
    if(o2 === undefined && Fancy.isString(o1)){
      return this[0].getAttribute(o1);
    }
    
    this.each(function(dom){
      if(Fancy.isString(o1)){
        dom.setAttribute(o1, o2);
      }
      else if(Fancy.isObject(o1)){
        for(var p in o1){
          dom.setAttribute(p, o1[p]);
        }
      }
    });
  },
  css: function(property, value){
    var me = this;
    
    if(Fancy.isObject(property)){
      for(var p in property){
        me.setStyle(p, value);
      }
      
      return this;
		}
		
    if(property && value){
			me.setStyle(property, value);
      return this;
		}
    
		if(property){
			return me.getStyle(property);
		}
  },
  setStyle: function(property, value, isImportant){
    this.each(function(dom){
      if(property === 'float'){
        dom.style.styleFloat = value;
				dom.style.cssFloat = value;
      }
      else{
        dom.style[chkCache(property)] = value;
        if( isImportant && dom.style && dom.style.setProperty ){
          dom.style.setProperty(property, value, 'important');
				}
      }
    });
  },
  getStyle: function(){
    return view && view.getComputedStyle ?
      function(prop){
        var dom = this[0],
          v,
          cs,
          out,
          display;
        
        if(dom == document){
          return null;
        }
        
        prop = chkCache(prop);
        out = (v = dom.style[prop]) ? v :
          (cs = view.getComputedStyle(dom, "")) ? cs[prop] : null;
        
        // Ignore cases when the margin is correctly reported as 0, the bug only shows
        // numbers larger.
        if(prop == 'marginRight' && out != '0px'){
          display = dom.style.display;
          dom.style.display = 'inline-block';
          out = view.getComputedStyle(dom, '').marginRight;
          dom.style.display = display;
        }
        
        if(prop == 'backgroundColor' && out == 'rgba(0, 0, 0, 0)'){
          out = 'transparent';
        }
        return out;
      } :
      function(prop){
        var dom = this.dom,
          m,
          cs;

        if(dom == document){
          return null;
        }
        
        if(prop == 'opacity'){
          if (dom.style.filter.match) {
            m = dom.style.filter.match(opacityRe);
  
            if(m){
              var fv = parseFloat(m[1]);
            
              if(!isNaN(fv)){
                return fv ? fv / 100 : 0;
              }
            }
          }
          
          return 1;
        }
        
        prop = chkCache(prop);
        return dom.style[prop] || ((cs = dom.currentStyle) ? cs[prop] : null);
      };
  }(),
  height: function(value){
    var dom = this[0];
    
    if(value){
      if(Fancy.isNumber(value)){
        value += 'px';
      }
      else if(/px$/.test(value) === false){
        value += 'px';
      }
      
      dom.setStyle('height', value);
      return this;
    }
    
		return Math.max(dom.clientHeight, dom.offsetHeight);
	},
  width: function(value){
    var dom = this[0];
    
    if(value){
      if(Fancy.isNumber(value)){
        value += 'px';
      }
      else if(/px$/.test(value) === false){
        value += 'px';
      }
      
      dom.setStyle('width', value);
      return this;
    }
    
		return Math.max(dom.clientWidth, dom.offsetWidth);
	},
  offset: function(){
    var me = this,
      dom = me[0],
      rect;
    
    // Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !dom.getClientRects().length ) {
			return { top: 0, left: 0 };
		}
    
    rect = dom.getBoundingClientRect();
    
    // Make sure element is not hidden (display: none)
		if( rect.width || rect.height ){
			var doc = dom.ownerDocument,
			  win = getWindow( doc ),
			  docElem = doc.documentElement;

			return {
				top: rect.top + win.pageYOffset - docElem.clientTop,
				left: rect.left + win.pageXOffset - docElem.clientLeft
			};
		}

		// Return zeros for disconnected and hidden elements (gh-2310)
		return rect;
  },
  within: function(child){
    var me = this,
      childId,
      isWithin = true,
      removeId = false,
      dom = me[0];

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

    if(dom.id === child[0].id){
      isWithin = true;
    }

    if(removeId){
      me.removeAttr('id');
    }

    return isWithin;
  },
  on: function(eventName, fn, scope, delegate){
    if (scope) {
      fn = Fancy.proxy(fn, scope);
    }
    
    if(delegate){
      on(this, eventName, delegate, fn);
    }
    else{
      on(this, eventName, fn);
    }
  }
};

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}


})();