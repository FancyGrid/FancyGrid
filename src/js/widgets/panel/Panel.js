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
      '{titleImg}',
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

    var imgCls = '';

    if(Fancy.isObject(me.title) && me.title.imgCls){
      imgCls = '<div class="fancy-panel-header-img ' + me.title.imgCls + '"></div>';
    }

    el.update(me.tpl.getHTML({
      titleImg: imgCls,
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
   * @return {String}
   */
  getTitle: function(){
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
   * @return {String}
   */
  getSubTitle: function(){
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