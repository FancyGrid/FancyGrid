Fancy.modules['menu'] = true;

(function(){
  //SHORTCUTS
  const F = Fancy;

  //CONSTANTS
  const MENU_CLS = F.MENU_CLS;
  const MENU_ITEM_CLS = F.MENU_ITEM_CLS;
  const MENU_ITEM_IMAGE_CLS = F.MENU_ITEM_IMAGE_CLS;
  const MENU_ITEM_TEXT_CLS = F.MENU_ITEM_TEXT_CLS;
  const MENU_ITEM_SIDE_TEXT_CLS = F.MENU_ITEM_SIDE_TEXT_CLS;
  const MENU_ITEM_ACTIVE_CLS = F.MENU_ITEM_ACTIVE_CLS;
  const MENU_ITEM_RIGHT_IMAGE_CLS = F.MENU_ITEM_RIGHT_IMAGE_CLS;
  const MENU_ITEM_EXPAND_CLS = F.MENU_ITEM_EXPAND_CLS;
  const MENU_ITEM_DISABLED_CLS = F.MENU_ITEM_DISABLED_CLS;
  const MENU_ITEM_SEP_CLS = F.MENU_ITEM_SEP_CLS;
  const MENU_ITEM_NO_IMAGE_CLS = F.MENU_ITEM_NO_IMAGE_CLS;

  /**
   * @class Fancy.Menu
   * @extends Fancy.Widget
   */
  Fancy.define('Fancy.Menu', {
    extend: Fancy.Widget,
    /*
     * @constructor
     * @param {Object} config
     * @param {Object} scope
     */
    constructor: function(config){
      Fancy.applyConfig(this, config);

      if(this.theme){
        this.itemHeight = Fancy.themes[this.theme].config.menuItemHeight;
      }

      this.Super('const', arguments);
    },
    /*
     *
     */
    init(){
      const me = this;

      me.addEvents('hide');
      me.Super('init', arguments);

      if (me.width < me.minWidth) {
        me.width = me.minWidth;
      }

      me.applyDefaults();
      me.render();
      me.ons();
    },
    /*
     *
     */
    ons(){
      const me = this,
        el = me.el;

      el.on('mousedown', me.onItemMouseDown, me, `.${MENU_ITEM_CLS}`);
      el.on('click', me.onItemClick, me, `.${MENU_ITEM_CLS}`);
      el.on('mouseenter', me.onItemEnter, me, `.${MENU_ITEM_CLS}`);
      el.on('mouseleave', me.onItemLeave, me, `.${MENU_ITEM_CLS}`);
    },
    widgetCls: MENU_CLS,
    itemCls: MENU_ITEM_CLS,
    itemImageCls: MENU_ITEM_IMAGE_CLS,
    cls: '',
    extraCls: '',
    width: 142,
    minWidth: 50,
    itemHeight: 30,
    maxHeight: 200,
    rendered: false,
    theme: 'default',
    render(){
      const me = this,
        el = Fancy.newEl('div');

      let renderTo;

      me.fire('beforerender');

      if (me.theme !== 'default') {
        el.addCls(Fancy.getThemeCSSCls(me.theme));
      }

      el.addClass(
        Fancy.cls,
        me.widgetCls,
        me.cls,
        me.extraCls
      );

      if (me.width < me.minWidth) {
        me.width = me.minWidth;
      }

      el.css({
        width: me.width,
        height: me.getItemsHeight()
      });

      if (me.height) {
        el.css({
          'height': me.height,
          'overflow-y': 'scroll'
        });
      }

      renderTo = Fancy.get(me.renderTo || document.body);

      me.el = renderTo.dom.appendChild(el.dom);
      me.el = Fancy.get(me.el);

      me.renderItems();

      if (!me.items.length) {
        me.el.css('border', '0px');
      }

      me.fire('afterrender');
      me.fire('render');

      me.rendered = true;

      me.checkHeight();
    },
    /*
     *
     */
    checkHeight(){
      const me = this,
        height = parseInt(me.el.css('height'));

      if (height > me.maxHeight) {
        me.el.css({
          height: me.maxHeight,
          'overflow-y': 'scroll'
        });
      }
    },
    /*
     * @return {Number}
     */
    getItemsHeight(){
      var me = this,
        items = me.items,
        itemHeight = me.itemHeight,
        height = 0,
        i = 0,
        iL = items.length;

      for (; i < iL; i++){
        var item = items[i];

        if(item.type === 'sep' || item.type === '-' || item === '-'){
          height += 2;
        }
        else {
          height += itemHeight;
        }
      }

      return height;
    },
    /*
     *
     */
    renderItems(){
      var me = this,
        i = 0,
        iL = me.items.length,
        item;

      for(; i < iL; i++){
        item = me.items[i];

        if (item === '-') {
          item = {
            type: 'sep'
          };
        }

        const itemEl = Fancy.newEl('div');
        itemEl.attr('index', i);

        itemEl.addCls(me.itemCls);
        if (item.type === 'sep') {
          itemEl.addCls(MENU_ITEM_SEP_CLS);
        }
        else {
          itemEl.css('height', me.itemHeight);
        }
        me.el.dom.appendChild(itemEl.dom);
        item.el = itemEl;

        const imageCls = item.imageCls || '';

        item.cls && itemEl.addCls(item.cls);

        if (item.type !== 'sep' && item.type !== '-') {
          const text = [
            item.image === false ? '' : '<div class="' + MENU_ITEM_IMAGE_CLS + ' ' + imageCls + '"></div>',
            '<div class="' + MENU_ITEM_TEXT_CLS + '"></div>'
          ];

          if (item.sideText) {
            text.push('<div class="' + MENU_ITEM_SIDE_TEXT_CLS + '">' + item.sideText + '</div>');
          }

          text.push('<div class="' + MENU_ITEM_RIGHT_IMAGE_CLS + ' ' + (item.items ? MENU_ITEM_EXPAND_CLS : '') + '"></div>');

          itemEl.update(text.join(''));
        }

        if (item.image === false) {
          itemEl.addCls(MENU_ITEM_NO_IMAGE_CLS);
        }

        if (item.disabled === true) {
          itemEl.addCls(MENU_ITEM_DISABLED_CLS);
        }

        switch (item.type){
          case '':
          case '-':
          case 'sep':
            break;
          case 'number':
            me.items[i].field = new Fancy.NumberField({
              label: false,
              theme: me.theme,
              padding: '1px 0px 0px',
              width: 90,
              renderAfter: itemEl.select('.' + MENU_ITEM_IMAGE_CLS).item(0).dom,
              events: me.items[i].events,
              value: item.value || ''
            });
            break;
          case 'string':
            me.items[i].field = new Fancy.StringField({
              label: false,
              theme: me.theme,
              padding: '1px 0px 0px',
              width: 90,
              renderAfter: itemEl.select('.' + MENU_ITEM_IMAGE_CLS).item(0).dom,
              events: me.items[i].events,
              value: item.value || ''
            });
            break;
          default:
            itemEl.select('.' + MENU_ITEM_TEXT_CLS).item(0).update(item.text || '');
        }

        if (item.checked !== undefined) {
          me.items[i].checkbox = new Fancy.CheckBox({
            label: false,
            theme: me.theme,
            padding: '1px 8px 0px',
            renderTo: itemEl.select('.' + MENU_ITEM_IMAGE_CLS).item(0).dom,
            value: item.checked
          });
        }
      }
    },
    /*
     *
     */
    applyDefaults(){
      var me = this,
        i = 0,
        iL = me.items.length;

      if (!me.defaults) {
        return;
      }

      for (; i < iL; i++) {
        Fancy.applyIf(me.items[i], me.defaults);
      }
    },
    /*
     * @param {Object} e
     */
    onItemClick(e){
      var me = this,
        target = Fancy.get(e.currentTarget),
        index = target.attr('index'),
        item = me.items[index],
        args = [me, item];

      if (item.handler && !item.disabled){
        if (item.scope){
          item.handler.apply(item.scope, args);
        }
        else {
          item.handler(me, item);
        }
      }
    },
    /*
     * @param {Object} e
     */
    onItemEnter(e){
      var me = this,
        target = Fancy.get(e.currentTarget),
        index = target.attr('index'),
        item = me.items[index],
        offset = target.offset();

      if(me.shownSubMenu){
        me.shownSubMenu.hide();
      }

      me.deActivateItem();
      me.activateItem(index);

      if (item.items) {
        if (!item.menu) {
          const itemConfig = me.items[index];

          Fancy.apply(itemConfig, {
            parentItem: item,
            parentMenu: me,
            defaults: item.defaults,
            items: item.items,
            theme: me.theme
          });

          me.items[index].menu = new Fancy.Menu(itemConfig);
        }

        item.menu.showAt(offset.left + parseInt(target.width()), offset.top);

        me.shownSubMenu = item.menu;
      }
    },
    /*
     *
     */
    onItemLeave(){},
    /*
     * @param {Number} x
     * @param {Number} y
     * @param {Boolean} [checkPosition]
     */
    showAt(x, y, checkPosition){
      const me = this;

      me.css('position', 'absolute');
      me.css('left', x);
      me.css('top', y);
      me.css('z-index', 1000 + F.zIndex++);

      me.el.show();

      if (checkPosition !== false) {
        if(!me.parentMenu && Fancy.MenuManager.activeMenu && Fancy.MenuManager.activeMenu.id !== me.id){
          Fancy.MenuManager.remove();
        }

        me.checkPosition();
      }

      if(me.parentMenu){
        return;
      }

      Fancy.MenuManager.add(me);
    },
    /*
     *
     */
    hide(){
      const me = this;

      me.el.hide();
      me.deActivateItem();

      if(me.shownSubMenu){
        me.shownSubMenu.hide();
      }

      me.fire('hide');
    },
    /*
     *
     */
    hideAll(){
      const parentMenu = this.parentMenu;

      if (parentMenu && parentMenu.el.css('display') !== 'none') {
        parentMenu.hide();
      }

      this.hide();
    },
    /*
     * @param {Number} index
     */
    activateItem(index){
      const me = this,
        item = me.items[index];

      if (item.type === 'sep' || item === '-' || item.disabled) {
        return;
      }

      me.activeItem = item;
      item.el.addCls(MENU_ITEM_ACTIVE_CLS);
    },
    /*
     *
     */
    deActivateItem(){
      const activeItem = this.activeItem;

      if (!activeItem) {
        return;
      }

      activeItem.el.removeClass(MENU_ITEM_ACTIVE_CLS);
      delete this.activeItem;
    },
    /*
     * @param {Object} e
     */
    onItemMouseDown(e){
      const target = e.target;

      if (target.tagName.toLocaleLowerCase() === 'input') {}
      else{
        e.preventDefault();
      }
    },
    /*
     * @param {Number} index
     */
    enableItem(index){
      const me = this,
        item = me.items[index];

      item.el.removeCls(MENU_ITEM_DISABLED_CLS);
      item.disabled = false;
    },
    /*
     * @param {Number} index
     */
    disableItem(index){
      const me = this,
        item = me.items[index];

      item.el.addCls(MENU_ITEM_DISABLED_CLS);
      item.disabled = true;
    },
    /*
     *
     */
    checkPosition(){
      var me = this,
        el = me.el,
        offset = el.offset(),
        height = parseInt(el.css('height')),
        width = parseInt(el.css('width')),
        viewSize = F.getViewSize(),
        scroll = F.getScroll(),
        rightBottomPointTop = offset.top + height,
        rightBottomPointLeft = offset.left + width,
        newTop = offset.top,
        newLeft = offset.left,
        scrollingWidth = 20;

      if(rightBottomPointTop > viewSize[0] + scroll[0] - scrollingWidth){
        newTop = offset.top - (rightBottomPointTop - (viewSize[0] + scroll[0])) - scrollingWidth;
      }

      if(rightBottomPointLeft > viewSize[1] + scroll[1] - scrollingWidth){
        if(me.parentMenu){
          var parentLeft = parseInt(me.parentMenu.el.css('left'));

          newLeft = parentLeft - width;
        }
        else{
          newLeft = offset.left - (rightBottomPointLeft - (viewSize[1] + scroll[1])) - scrollingWidth;
        }
      }

      me.showAt(newLeft, newTop, false);
    },
    /*
     *
     */
    setChecked(index, clear){
      const me = this;

      if (clear) {
        me.clearChecked();
      }

      const item = me.el.select('.fancy-menu-item').item(index),
        checkBox = F.getWidget(item.select('.fancy-field-checkbox').attr('id'));

      checkBox.set(true);
    },
    /*
     *
     */
    clearChecked(){
      const me = this;

      me.el.select('.fancy-checkbox-on').each((el) => {
        const id = el.attr('id'),
          checkBox = F.getWidget(id);

        checkBox.set(false);
      });
    }
  });

  Fancy.define('Fancy.MenuManager', {
    singleton: true,
    inited: false,
    constructor: function(){},
    /*
     *
     */
    init(){
      const docEl = Fancy.get(document);

      docEl.on('click', this.onDocClick, this);
    },
    /*
     * @param {Object} menu
     */
    add(menu){
      const me = this;

      if (!me.inited) {
        me.init();
      }

      me.activeMenu = menu;
    },
    remove(){
      const me = this;

      if (!me.activeMenu) {
        return;
      }

      me.activeMenu.hide();
      delete me.activeMenu;
    },
    /*
     * @param {Object} e
     */
    onDocClick(e){
      var me = this,
        target = Fancy.get(e.target),
        maxDepth = 10,
        parentEl = target;

      if (!me.activeMenu) {
        return;
      }

      while(maxDepth > 0){
        if( !parentEl.dom ){
          break;
        }

        if( parentEl.hasCls(MENU_CLS) ){
          return;
        }

        parentEl = parentEl.parent();
        maxDepth--;
      }

      me.remove();
    }
  });

})();
