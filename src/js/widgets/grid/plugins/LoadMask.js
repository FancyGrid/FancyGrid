/*
 * @class Fancy.grid.plugin.LoadMask
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.LoadMask', {
  extend: Fancy.Plugin,
  ptype: 'grid.loadmask',
  inWidgetName: 'loadmask',
  cls: 'fancy-loadmask',
  innerCls: 'fancy-loadmask-inner',
  imageCls: 'fancy-loadmask-image',
  textCls: 'fancy-loadmask-text',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(){
    this.Super('const', arguments);
  },
  /*
   *
   */
  init(){
    this.Super('init', arguments);
    this.ons();
  },
  /*
   *
   */
  ons(){
    const me = this,
      w = me.widget,
      s = w.store;

    w.once('render', () => {
      me.render();
      if (s.loading) {
        me.onBeforeLoad();
      }
      w.on('beforeload', me.onBeforeLoad, me);
      w.on('load', me.onLoad, me);
    });
  },
  /*
   *
   */
  render(){
    var me = this,
      w = me.widget,
      wEl = w.el,
      renderTo = wEl,
      width,
      height,
      el = Fancy.get( document.createElement('div')),
      lang = w.lang;

    if(w.panel){
      renderTo = w.panel.el;
    }

    width = renderTo.width();
    height = renderTo.height();

    el.addCls(me.cls);

    if( w.theme !== 'default' ){
      el.addCls(Fancy.getThemeCSSCls(w.theme));
    }

    el.css({
      width,
      height,
      opacity: 0
    });

    if(me.loadText){
      el.update([
        '<div class="' + me.innerCls + '">' +
          '<div class="' + me.textCls + '">' + me.loadText + '</div>' +
        '</div>'
      ].join(' '));
    }
    else {
      el.update([
        '<div class="' + me.innerCls + '">' +
          '<div class="' + me.imageCls + '"></div>' +
          '<div class="' + me.textCls + '">' + lang.loadingText + '</div>' +
        '</div>'
      ].join(' '));
    }

    me.el = Fancy.get(renderTo.dom.appendChild(el.dom));
    me.innerEl = me.el.select('.' + me.innerCls);
    me.textEl = me.el.select('.'+me.textCls);

    var innerWidth = me.innerEl.width(),
      innerHeight = me.innerEl.height(),
      left = width/2 - innerWidth/2;

    if(left < 10){
      me.intLeft = setInterval(function(){
        if(me.el.css('display') === 'none'){
          clearInterval(me.intLeft);
        }

        innerWidth = me.innerEl.width();
        innerHeight = me.innerEl.height();
        left = width/2 - innerWidth/2;

        if(left < 10){
          return;
        }

        me.innerEl.css({
          left
        });

        clearInterval(me.intLeft);
      }, 100);
    }

    me.innerEl.css({
      left,
      top: height/2 - innerHeight/2
    });

    if(w.store.loading !== true){
      el.css('display', 'none');
    }
    else{
      if(me.showOnWaitingServer === false){
        el.css('display', 'none');
      }
      else {
        el.css('display', 'block');
      }
      //me.show();
    }

    //el.css('opacity', 1);
  },
  /*
   *
   */
  onBeforeLoad(){
    if(this.showOnWaitingServer){
      this.show();
    }
  },
  /*
   *
   */
  onLoad(){
    const me = this,
      w = me.widget;

    if (me.showOnWaitingServer) {
      w.once('update', () => me.hide());
    }
  },
  /*
   * @param {String} text
   */
  show(text){
    const me = this,
      el = me.el,
      w = me.widget,
      lang = w.lang;

    el.stop();
    el.css('opacity', 1);

    me.el.css('display', 'block');

    me.updateSize();

    if (text) {
      me.textEl.update(text);
      me.el.css('display', 'block');
      return;
    }

    me.loaded = false;

    setTimeout(() => {
      if(me.loaded !== true){
        me.textEl.update(me.loadText || lang.loadingText);

        me.el.css('display', 'block');
      }
    }, 50);
  },
  /*
   *
   */
  hide(){
    const me = this,
      el = me.el;

    el.stop();
    el.css('opacity', 1);
    el.animate({
      opacity: 0,
      force: true
    }, {
      complete(){
        me.loaded = true;
        el.css('display', 'none');
      }
    });
  },
  /*
   *
   */
  updateSize(){
    const me = this,
      w = me.widget,
      width = w.getWidth(),
      height = w.getHeight();

    me.el.css({
      height,
      width
    });

    const innerWidth = Math.abs(me.innerEl.width()),
      innerHeight = Math.abs(me.innerEl.height());

    const left = width / 2 - innerWidth / 2,
      top = height / 2 - innerHeight / 2;

    me.innerEl.css({
      left,
      top
    });
  }
});
