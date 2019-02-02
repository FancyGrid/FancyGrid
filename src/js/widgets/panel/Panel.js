/*
 * @class Fancy.Panel
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  /*
   * CONSTANTS
   */
  var HIDDEN_CLS = F.HIDDEN_CLS;
  var MODAL_CLS = F.MODAL_CLS;
  var PANEL_CLS = F.PANEL_CLS;
  var PANEL_HEADER_CLS = F.PANEL_HEADER_CLS;
  var PANEL_SUB_HEADER_TEXT_CLS = F.PANEL_SUB_HEADER_TEXT_CLS;
  var PANEL_HEADER_TEXT_CLS = F.PANEL_HEADER_TEXT_CLS;
  var PANEL_HEADER_TOOLS_CLS = F.PANEL_HEADER_TOOLS_CLS;
  var PANEL_SUB_HEADER_CLS = F.PANEL_SUB_HEADER_CLS;
  var PANEL_BODY_CLS = F.PANEL_BODY_CLS;
  var PANEL_BODY_INNER_CLS = F.PANEL_BODY_INNER_CLS;
  var PANEL_TBAR_CLS = F.PANEL_TBAR_CLS;
  var PANEL_SUB_TBAR_CLS = F.PANEL_SUB_TBAR_CLS;
  var PANEL_BUTTONS_CLS = F.PANEL_BUTTONS_CLS;
  var PANEL_BBAR_CLS = F.PANEL_BBAR_CLS;
  var PANEL_HEADER_IMG_CLS = F.PANEL_HEADER_IMG_CLS;
  var PANEL_NOFRAME_CLS = F.PANEL_NOFRAME_CLS;
  var PANEL_SHADOW_CLS = F.PANEL_SHADOW_CLS;
  var PANEL_FOOTER_CLS = F.PANEL_FOOTER_CLS;
  var FIELD_PICKER_BUTTON_CLS = F.FIELD_PICKER_BUTTON_CLS;

  F.define('Fancy.Panel', {
    extend: F.Widget,
    barScrollEnabled: true,
    tabScrollStep: 50,
    mixins: [
      'Fancy.panel.mixin.DD',
      'Fancy.panel.mixin.Resize'
    ],
    /*
     * @param {Object} config
     */
    constructor: function (config) {
      F.apply(this, config);
      this.Super('constructor', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.Super('init', arguments);
      me.addEvents('resize');

      me.initTpl();
      me.render();

      if (me.draggable) {
        me.initDD();
      }

      if (me.resizable) {
        me.initResize();
      }

      if (me.window) {
        me.setActiveWindowWatcher();
      }
    },
    cls: '',
    fieldCls: PANEL_CLS,
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
      '<div style="height:{titleHeight}px;" class="'+PANEL_HEADER_CLS+' '+HIDDEN_CLS+'">',
        '{titleImg}',
        '<div class="' + PANEL_HEADER_TEXT_CLS + '">{title}</div>',
        '<div class="' + PANEL_HEADER_TOOLS_CLS + '"></div>',
      '</div>',
      '<div style="height:{subTitleHeight}px;" class="' + PANEL_SUB_HEADER_CLS + ' '+HIDDEN_CLS+'">',
        '<div class="' + PANEL_SUB_HEADER_TEXT_CLS + '">{subTitle}</div>',
      '</div>',
      '<div class="' + PANEL_BODY_CLS + '">',
        '<div class="' + PANEL_TBAR_CLS + ' '+HIDDEN_CLS+'" style="height:{tbarHeight}px;"></div>',
        '<div class="' + PANEL_SUB_TBAR_CLS + ' '+HIDDEN_CLS+'" style="height:{subTBarHeight}px;"></div>',
        '<div class="' + PANEL_BODY_INNER_CLS + '"></div>',
        '<div class="' + PANEL_BBAR_CLS + ' '+HIDDEN_CLS+'" style="height:{bbarHeight}px;"></div>',
        '<div class="' + PANEL_BUTTONS_CLS + ' '+HIDDEN_CLS+'" style="height:{buttonsHeight}px;"></div>',
        '<div class="' + PANEL_FOOTER_CLS + ' '+HIDDEN_CLS+'" style="height:{barHeight}px;"></div>',
      '</div>'
    ],
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = F.get(me.renderTo || document.body),
        el = F.get(document.createElement('div')),
        minusHeight = 0,
        titleHeight = me.titleHeight,
        subTitleHeight = me.subTitleHeight;

      if(me.renderOuter){
        el = renderTo;
      }

      if(!renderTo.dom){
        throw new Error('[FancyGrid Error 1] - Could not find renderTo element: ' + me.renderTo);
      }

      if (me.window === true) {
        el.css({
          display: 'none',
          position: 'absolute'
        });
      }

      if (me.frame === false) {
        el.addCls(PANEL_NOFRAME_CLS);
      }

      el.addCls(F.cls, me.cls, me.fieldCls);
      if (me.theme !== 'default') {
        el.addCls('fancy-theme-' + me.theme);
      }

      if (me.shadow) {
        el.addCls(PANEL_SHADOW_CLS);
      }

      el.css({
        width: me.width + 'px',
        height: (me.height - minusHeight) + 'px'
      });

      if (me.style) {
        el.css(me.style);
      }

      var titleText = '',
        subTitleText = '';

      if (F.isObject(me.title)) {
        titleText = me.title.text
      }
      else if (F.isString(me.title)) {
        titleText = me.title
      }

      if (F.isObject(me.subTitle)) {
        subTitleText = me.subTitle.text
      }
      else if (F.isString(me.subTitle)) {
        subTitleText = me.subTitle
      }

      var imgCls = '';

      if (F.isObject(me.title) && me.title.imgCls) {
        imgCls = '<div class="' + PANEL_HEADER_IMG_CLS + ' ' + me.title.imgCls + '"></div>';
      }

      el.update(me.tpl.getHTML({
        titleImg: imgCls,
        barHeight: me.barHeight,
        subTBarHeight: me.subTBarHeight || me.barHeight,
        tbarHeight: me.tbarHeight || me.barHeight,
        bbarHeight: me.bbarHeight || me.barHeight,
        buttonsHeight: me.buttonsHeight || me.barHeight,
        titleHeight: titleHeight,
        subTitleHeight: subTitleHeight,
        title: titleText,
        subTitle: subTitleText
      }));

      if (F.isObject(me.title)) {
        if (me.title.style) {
          el.select('.' + PANEL_HEADER_CLS).css(me.title.style);
        }

        if (me.title.cls) {
          el.select('.' + PANEL_HEADER_CLS).addCls(me.title.cls);
        }

        if (me.title.tools) {
          me.tools = me.title.tools;
        }
      }

      if (F.isObject(me.subTitle)) {
        if (me.subTitle.style) {
          el.select('.' + PANEL_SUB_HEADER_CLS).css(me.subTitle.style);
        }

        if (me.subTitle.cls) {
          el.select('.' + PANEL_SUB_HEADER_CLS).addCls(me.subTitle.cls);
        }
      }

      if (me.title) {
        el.select('.' + PANEL_HEADER_CLS).removeCls(HIDDEN_CLS);
      }
      else {
        el.select('.' + PANEL_BODY_CLS).css('border-top-width', '0px');
      }

      if (me.subTitle) {
        el.select('.' + PANEL_BODY_CLS).css('border-top-width', '0px');
        el.select('.' + PANEL_SUB_HEADER_CLS).removeCls(HIDDEN_CLS);
      }

      if (me.tbar) {
        el.select('.' + PANEL_TBAR_CLS).removeCls(HIDDEN_CLS);
      }

      if (me.subTBar) {
        el.select('.' + PANEL_SUB_TBAR_CLS).removeCls(HIDDEN_CLS);
      }

      if (me.bbar) {
        el.select('.' + PANEL_BBAR_CLS).removeCls(HIDDEN_CLS);
      }

      if (me.buttons) {
        el.select('.' + PANEL_BUTTONS_CLS).removeCls(HIDDEN_CLS);
      }

      if (me.footer) {
        el.select('.' + PANEL_FOOTER_CLS).removeCls(HIDDEN_CLS);
      }

      if(me.renderOuter){
        me.el = el;
      }
      else {
        me.el = renderTo.dom.appendChild(el.dom);
        me.el = F.get(me.el);
      }

      if (me.modal) {
        if (F.select(MODAL_CLS).length === 0) {
          F.get(document.body).append('<div class="'+MODAL_CLS+'" style="display: none;"></div>');
        }
      }

      if (me.id && !me.el.attr('id')) {
        me.el.attr('id', me.id);
      }

      me.renderTools();
      me.renderBars();

      me.setHardBordersWidth();
    },
    /*
     *
     */
    setHardBordersWidth: function () {
      var panelBodyBorders = this.panelBodyBorders;

      this.el.select('.' + PANEL_BODY_CLS).css({
        'border-top-width': panelBodyBorders[0],
        'border-right-width': panelBodyBorders[1],
        'border-bottom-width': panelBodyBorders[2],
        'border-left-width': panelBodyBorders[3]
      })
    },
    /*
     *
     */
    renderTools: function () {
      var me = this,
        tools = me.tools;

      if (tools === undefined) {
        return;
      }

      F.each(tools, function (tool, i) {
        tool.renderTo = me.el.select('.' + PANEL_HEADER_TOOLS_CLS).dom;
        me.tools[i] = new F.Tool(tool, me.scope || me);
      });
    },
    /*
     *
     */
    renderBars: function () {
      var me = this,
        containsGrid = false,
        theme = me.theme,
        scope = this;

      if (me.items && me.items[0]) {
        if (me.items[0].type === 'grid') {
          containsGrid = true;
        }

        scope = me.items[0];
      }

      if (me.bbar) {
        me._bbar = new F.Bar({
          el: me.el.select('.' + PANEL_BBAR_CLS),
          items: me.bbar,
          height: me.bbarHeight || me.barHeight,
          barContainer: me.barContainer,
          barScrollEnabled: me.barScrollEnabled,
          tabScrollStep: me.tabScrollStep,
          scope: scope,
          theme: theme
        });

        me.bbar = me._bbar.items;
      }

      if (me.buttons) {
        me._buttons = new F.Bar({
          el: me.el.select('.' + PANEL_BUTTONS_CLS),
          items: me.buttons,
          height: me.buttonsHeight || me.barHeight,
          barScrollEnabled: me.barScrollEnabled,
          tabScrollStep: me.tabScrollStep,
          scope: scope,
          theme: theme
        });

        me.buttons = me._buttons.items;
      }

      if (me.tbar) {
        me._tbar = new F.Bar({
          el: me.el.select('.' + PANEL_TBAR_CLS),
          items: me.tbar,
          height: me.tbarHeight || me.barHeight,
          tabEdit: !me.subTBar && containsGrid,
          barScrollEnabled: me.barScrollEnabled,
          tabScrollStep: me.tabScrollStep,
          scope: scope,
          theme: theme
        });

        me.tbar = me._tbar.items;
      }

      if (me.subTBar) {
        me._subTBar = new F.Bar({
          el: me.el.select('.' + PANEL_SUB_TBAR_CLS),
          items: me.subTBar,
          height: me.subTBarHeight || me.barHeight,
          tabEdit: containsGrid,
          barScrollEnabled: me.barScrollEnabled,
          tabScrollStep: me.tabScrollStep,
          scope: scope,
          theme: theme
        });

        me.subTBar = me._subTBar.items;
      }

      if (me.footer) {
        me._footer = new F.Bar({
          disableScroll: true,
          el: me.el.select('.' + PANEL_FOOTER_CLS),
          items: me.footer,
          height: me.barHeight,
          barScrollEnabled: me.barScrollEnabled,
          tabScrollStep: me.tabScrollStep,
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
    showAt: function (x, y) {
      this.css({
        left: x + 'px',
        display: '',
        'z-index': 1000 + F.zIndex++
      });

      if (y !== undefined) {
        this.css({
          top: y + 'px'
        });
      }
    },
    /*
     *
     */
    show: function () {
      var me = this;

      me.el.show();

      if (me.window !== true) {
        return;
      }

      if (me.buttons) {
        me._buttons.checkScroll();
      }

      if (me.tbar) {
        me._tbar.checkScroll();
      }

      if (me.bbar) {
        me._bbar.checkScroll();
      }

      if (me.subTBar) {
        me._subTBar.checkScroll();
      }

      var viewSize = F.getViewSize(),
        height = me.el.height(),
        width = me.el.width(),
        xy = [],
        scroll = F.getScroll(),
        scrollTop = scroll[0],
        scrollLeft = scroll[1];

      xy[0] = (viewSize[1] - width) / 2;
      xy[1] = (viewSize[0] - height) / 2;

      if (xy[0] < 10) {
        xy[0] = 10;
      }

      if (xy[1] < 10) {
        xy[1] = 10;
      }

      me.css({
        left: (xy[0] + scrollLeft) + 'px',
        top: (xy[1] + scrollTop) + 'px',
        display: '',
        'z-index': 1000 + F.zIndex++
      });

      if(me.modal){
        F.select('.' + MODAL_CLS).css({
          'display': '',
          'z-index': 1000 + F.zIndex - 2
        });
      }
    },
    /*
     *
     */
    hide: function () {
      var me = this;

      me.css({
        display: 'none'
      });

      if(me.modal){
        F.select('.' + MODAL_CLS).css('display', 'none');
      }

      F.each(this.items || [], function (item) {
        if (item.type === 'combo') {
          item.hideList();
        }
      });
    },
    /*
     * @param {String} value
     */
    setTitle: function (value) {
      this.el.select('.' + PANEL_HEADER_TEXT_CLS).update(value);
    },
    /*
     * @return {String}
     */
    getTitle: function () {
      return this.el.select('.' + PANEL_HEADER_TEXT_CLS).dom.innerHTML;
    },
    /*
     * @param {String} value
     */
    setSubTitle: function (value) {
      this.el.select('.' + PANEL_SUB_HEADER_TEXT_CLS).update(value);
    },
    /*
     * @return {String}
     */
    getSubTitle: function () {
      return this.el.select('.' + PANEL_SUB_HEADER_TEXT_CLS).dom.innerHTML;
    },
    /*
     * @return {Number}
     */
    getHeight: function () {
      return parseInt(this.css('height'));
    },
    /*
     * @param {String} value
     */
    setWidth: function (value) {
      //TODO: Redo
      this.items[0].setWidth(value);
    },
    /*
     * @param {Number} value
     */
    setHeight: function (value) {
      this.css('height', value);
      this.items[0].setHeight(value, false);
    },
    /*
     *
     */
    setActiveWindowWatcher: function () {
      var me = this;

      me.el.on('mousedown', function (e) {
        var targetEl = F.get(e.target);

        if (targetEl.hasCls(FIELD_PICKER_BUTTON_CLS)) {
          return;
        }

        if (1000 + F.zIndex - 1 > parseInt(me.css('z-index'))) {
          me.css('z-index', 1000 + F.zIndex++);
        }

        F.get(document.body).select('.fancy-active-panel').removeCls('fancy-active-panel');
        me.el.addCls('fancy-active-panel');
      });
    }
  });

})();