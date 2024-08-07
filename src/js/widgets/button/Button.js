(function(){
  const toggleGroups = {};

  //SHORTCUTS
  const F = Fancy;

  //CONSTANTS
  const GRID_CLS = F.GRID_CLS;
  const PANEL_BODY_CLS = F.PANEL_BODY_CLS;
  const BUTTON_CLS = F.BUTTON_CLS;
  const BUTTON_DISABLED_CLS = F.BUTTON_DISABLED_CLS;
  const BUTTON_PRESSED_CLS = F.BUTTON_PRESSED_CLS;
  const BUTTON_IMAGE_CLS = F.BUTTON_IMAGE_CLS;
  const BUTTON_IMAGE_COLOR_CLS = F.BUTTON_IMAGE_COLOR_CLS;
  const BUTTON_TEXT_CLS = F.BUTTON_TEXT_CLS;
  const BUTTON_DROP_CLS = F.BUTTON_DROP_CLS;
  const BUTTON_MENU_CLS = F.BUTTON_MENU_CLS;

  /**
   * @class Fancy.Button
   * @extends Fancy.Widget
   */
  F.define('Fancy.Button', {
    extend: F.Widget,
    minWidth: 30,
    /*
     * @constructor
     * @param {Object} config
     * @param {Object} scope
     */
    constructor: function(config, scope){
      const me = this;

      if (config.toggleGroup) {
        toggleGroups[config.toggleGroup] = toggleGroups[config.toggleGroup] || {
            active: false,
            items: []
          };

        toggleGroups[config.toggleGroup].items.push(me);
      }

      me.scope = scope || config.scope || me.scope || me;

      me.Super('const', arguments);
    },
    /*
     *
     */
    init(){
      const me = this;

      me.addEvents('click', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'pressedchange', 'init-menu');
      me.Super('init', arguments);

      me.style = me.style || {};

      me.initTpl();
      me.render();
      me.setOns();
    },
    /*
     *
     */
    setOns(){
      const me = this,
        el = me.el;

      el.on('click', me.onClick, me);
      el.on('mousedown', me.onMouseDown, me);
      el.on('mouseup', me.onMouseUp, me);
      el.on('mouseover', me.onMouseOver, me);
      el.on('mouseout', me.onMouseOut, me);

      if (me.tip) {
        el.on('mousemove', me.onMouseMove, me);
      }
    },
    widgetCls: BUTTON_CLS,
    cls: '',
    extraCls: '',
    disabledCls: BUTTON_DISABLED_CLS,
    pressedCls: BUTTON_PRESSED_CLS,
    buttonImageCls: BUTTON_IMAGE_CLS,
    buttonImageColorCls: BUTTON_IMAGE_COLOR_CLS,
    textCls: BUTTON_TEXT_CLS,
    dropCls: BUTTON_DROP_CLS,
    text: '',
    height: 28,
    paddingTextWidth: 5,
    imageWidth: 20,
    rightImageWidth: 20,
    pressed: false,
    theme: 'default',
    tpl: [
      '<div class="' + BUTTON_IMAGE_CLS + '"></div>',
      '<a class="' + BUTTON_TEXT_CLS + '">{text}</a>',
      '<div class="' + BUTTON_DROP_CLS + '" style="{dropDisplay}"></div>'
    ],
    /*
     *
     */
    render(){
      var me = this,
        renderTo,
        el = F.newEl('div'),
        width = 0,
        charWidth = 7;

      if (me.theme && Fancy.themes[me.theme]) {
        charWidth = Fancy.themes[me.theme].config.charWidth;
      }

      switch (me.i18n) {
        case 'zh-CN':
        case 'zh-TW':
        case 'ja':
        case 'ko':
          charWidth = 10;
          break;
      }

      me.fire('beforerender');

      me.wrapper && me.renderWrapper();

      renderTo = F.get(me.renderTo || document.body).dom;

      if (me.width) {
        width = me.width;
      }
      else{
        if(me.text !== false && me.text !== undefined){
          width += me.text.length * charWidth + charWidth*2;
        }
      }

      me.imageColor && (me.imageCls = BUTTON_IMAGE_COLOR_CLS);

      if (width < me.minWidth) {
        if (me.text && me.text.length > 0) {
          width = me.minWidth;
        }
        else {
          width = me.minWidth;
        }
      }

      if (me.imageCls && me.text) {
        width += me.imageWidth;
      }

      me.menu && (width += me.rightImageWidth);

      el.addCls(
        F.cls,
        me.widgetCls,
        me.cls,
        me.extraCls
      );

      me.disabled && el.addCls(BUTTON_DISABLED_CLS);

      if (me.menu && me.menuIcon !== false) {
        el.addCls(BUTTON_MENU_CLS);
      }

      el.css({
        width: width + 'px',
        height: me.height + 'px'
      });

      me.hidden && el.css('display', 'none');

      el.css(me.style || {});

      el.update(me.tpl.getHTML({
        text: me.text || ''
      }));

      if (me.imageCls) {
        const imageEl = el.select(`.${BUTTON_IMAGE_CLS}`);
        me.imageColor && imageEl.css('background-color', me.imageColor);
        imageEl.css('display', 'block');
        if (F.isString(me.imageCls)) {
          imageEl.addCls(me.imageCls);
        }
      }

      me.id && el.attr('id', me.id);

      me.el = F.get(renderTo.appendChild(el.dom));

      me.disabled && me.disable();

      me.pressed && me.setPressed(me.pressed);

      me.initToggle();

      me.width = width;

      me.fire('afterrender');
      me.fire('render');
    },
    /*
     *
     */
    renderWrapper(){
      const me = this,
        wrapper = me.wrapper,
        renderTo = F.get(me.renderTo || document.body).dom,
        el = F.newEl('div');

      el.css(wrapper.style || {});
      el.addCls(wrapper.cls || '');

      me.wrapper = F.get(renderTo.appendChild(el.dom));

      me.renderTo = me.wrapper.dom;
    },
    /*
     *
     */
    initToggle(){
      if (!this.enableToggle) {
        return false;
      }
    },
    /*
     * @param {Boolean} value
     */
    setPressed(value, fire){
      const me = this;

      if (value) {
        me.addCls(BUTTON_PRESSED_CLS);
        me.pressed = true;

        if (me.toggleGroup) {
          const active = toggleGroups[me.toggleGroup].active;
          if (active) {
            active.setPressed(false);
          }

          toggleGroups[me.toggleGroup].active = me;
        }
      }
      else {
        me.removeCls(BUTTON_PRESSED_CLS);
        me.pressed = false;
        if (me.toggleGroup) {
          delete toggleGroups[me.toggleGroup].active;
        }
      }

      if (fire !== false) {
        me.fire('pressedchange', me.pressed);
      }
    },
    /*
     *
     */
    toggle(){
      const me = this,
        value = !me.pressed;

      me.setPressed(value);
      me.pressed = value;
    },
    /*
     *
     */
    onClick(e){
      let me = this,
        handler = me.handler;

      me.fire('click');

      if(me.disabled !== true){
        if(handler){
          if(F.isString(handler)){
            handler = me.getHandler(handler);
          }

          if (me.scope){
            handler.apply(me.scope, [me]);
          }
          else {
            handler(me);
          }
        }

        if(me.enableToggle){
          if(me.toggleGroup){
            if(me.pressed){
              me.setPressed(false);
            }
            else {
              me.setPressed(true);
            }
          }
          else {
            me.toggle();
          }
        }

        if(me.menu){
          me.toggleMenuShow(e);
          me.toggle();
        }
      }
    },
    /*
     * @param {String} name
     */
    getHandler(name){
      const me = this,
        grid = F.getWidget(me.el.closest(`.${PANEL_BODY_CLS}`).select(`.${GRID_CLS}`).attr('id'));

      return grid[name] || function(){
          F.error('Handler does not exist');
        };
    },
    /*
     *
     */
    onMouseDown(){
      this.fire('mousedown');
    },
    /*
     *
     */
    onMouseUp(){
      this.fire('mouseup');
    },
    /*
     * @param {Object} e
     */
    onMouseOver(e){
      const me = this;

      me.fire('mouseover');

      if (me.tip) {
        me.renderTip(e);
      }
    },
    /*
     * @param {Object} e
     */
    renderTip(e){
      const me = this;

      if (me.tooltip) {
        me.tooltip.destroy();
      }

      me.tooltip = new F.ToolTip({
        text: me.tip
      });

      me.tooltip.css('display', 'block');
      me.tooltip.show(e.pageX + 15, e.pageY - 25);
    },
    /*
     *
     */
    onMouseOut(){
      const me = this;

      me.fire('mouseout');

      if (me.tooltip) {
        me.tooltip.destroy();
        delete me.tooltip;
      }
    },
    /*
     * @param {String} text
     */
    setText(text, width){
      let me = this,
        el = me.el,
        charWidth = 7;

      me.text = text;

      if (me.theme && Fancy.themes[me.theme]) {
        charWidth = Fancy.themes[me.theme].config.charWidth;
      }

      switch (me.i18n) {
        case 'zh-CN':
        case 'zh-TW':
        case 'ja':
        case 'ko':
          charWidth = 10;
          break;
      }

      if (!width) {
        width = 0;
      }

      if (!width) {
        width += text.length * charWidth + charWidth * 2;

        if (me.imageColor) {
          me.imageCls = BUTTON_IMAGE_COLOR_CLS;
        }

        if (width < me.minWidth) {
          if (me.text && me.text.length > 0){
            width = me.minWidth;
          }
          else {
            width = me.minWidth;
          }
        }

        if (me.imageCls && me.text) {
          width += me.imageWidth;
        }

        if (me.menu){
          width += me.rightImageWidth;
        }
      }

      me.css('width', width);

      el.select(`.${BUTTON_TEXT_CLS}`).update(text);
    },
    /*
     *
     */
    disable(){
      this.disabled = true;
      this.addCls(BUTTON_DISABLED_CLS);
    },
    /*
     *
     */
    enable(){
      this.disabled = false;
      this.removeCls(BUTTON_DISABLED_CLS);
    },
    /*
     *
     */
    onMouseMove(e){
      const me = this;

      if (me.tip && me.tooltip) {
        me.tooltip.show(e.pageX + 15, e.pageY - 25);
      }
    },
    toggleMenuShow(){
      const me = this,
        p = me.el.$dom.offset(),
        xy = [p.left, p.top + me.el.$dom.height()];

      if (me.pressed) {
        me.menu.hide();
        return;
      }

      if (F.isArray(me.menu)) {
        me.initMenu();
      }
      else if (!me.menu.type) {
        me.initMenu();
      }

      setTimeout(() => {
        me.menu.showAt(xy[0], xy[1]);
      }, 100);
    },
    /*
     *
     */
    initMenu(){
      const me = this,
        config = {
          theme: me.theme,
          events: [{
            hide: me.onMenuHide,
            scope: me
          }]
        };

      if (F.isObject(me.menu)) {
        F.apply(config, me.menu);
      }
      else {
        config.items = me.menu;
      }

      me.menu = new F.Menu(config);

      me.fire('init-menu');
    },
    /*
     *
     */
    onMenuHide(){
      this.setPressed(false);
    }
  });
})();
