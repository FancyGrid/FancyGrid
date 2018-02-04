(function() {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var MENU_CLS = F.MENU_CLS;
  var MENU_ITEM_CLS = F.MENU_ITEM_CLS;
  var MENU_ITEM_IMAGE_CLS =  F.MENU_ITEM_IMAGE_CLS;
  var MENU_ITEM_TEXT_CLS = F.MENU_ITEM_TEXT_CLS;
  var MENU_ITEM_SIDE_TEXT_CLS = F.MENU_ITEM_SIDE_TEXT_CLS;
  var MENU_ITEM_ACTIVE_CLS = F.MENU_ITEM_ACTIVE_CLS;
  var MENU_ITEM_RIGHT_IMAGE_CLS = F.MENU_ITEM_RIGHT_IMAGE_CLS;
  var MENU_ITEM_EXPAND_CLS = F.MENU_ITEM_EXPAND_CLS;
  var MENU_ITEM_DISABLED_CLS = F.MENU_ITEM_DISABLED_CLS;
  var MENU_ITEM_SEP_CLS = F.MENU_ITEM_SEP_CLS;
  var MENU_ITEM_NO_IMAGE_CLS = F.MENU_ITEM_NO_IMAGE_CLS;

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
    constructor: function (config, scope) {
      Fancy.applyConfig(this, config);
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents('hide');
      me.Super('init', arguments);

      me.applyDefaults();
      me.render();
      me.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        el = me.el;

      el.on('mousedown', me.onItemMouseDown, me, '.' + MENU_ITEM_CLS);
      el.on('click', me.onItemClick, me, '.' + MENU_ITEM_CLS);
      el.on('mouseenter', me.onItemEnter, me, '.' + MENU_ITEM_CLS);
      el.on('mouseleave', me.onItemLeave, me, '.' + MENU_ITEM_CLS);
    },
    widgetCls: MENU_CLS,
    itemCls: MENU_ITEM_CLS,
    itemImageCls: MENU_ITEM_IMAGE_CLS,
    cls: '',
    extraCls: '',
    width: 142,
    itemHeight: 30,
    rendered: false,
    theme: 'default',
    render: function(){
      var me = this,
        renderTo,
        el = Fancy.get(document.createElement('div'));

      me.fire('beforerender');

      if( me.theme !== 'default' ){
        el.addCls('fancy-theme-' + me.theme);
      }

      el.addClass(
        Fancy.cls,
        me.widgetCls,
        me.cls,
        me.extraCls
    );

      el.css({
        width: me.width,
        height: me.getItemsHeight()
      });

      renderTo = Fancy.get(me.renderTo || document.body);

      me.el = renderTo.dom.appendChild(el.dom);
      me.el = Fancy.get(me.el);

      me.renderItems();

      me.fire('afterrender');
      me.fire('render');

      me.rendered = true;
    },
    /*
     * @return {Number}
     */
    getItemsHeight: function () {
      var me = this,
        items = me.items,
        itemHeight = this.itemHeight,
        height = 0,
        i = 0,
        iL = items.length;

      for (; i < iL; i++) {
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
    renderItems: function () {
      var me = this,
        i = 0,
        iL = me.items.length,
        item;

      for(; i < iL; i++){
        item = me.items[i];

        if(item === '-'){
          item = {
            type: 'sep'
          };
        }

        var itemEl = Fancy.get(document.createElement('div'));
        itemEl.attr('index', i);

        itemEl.addCls(me.itemCls);
        if(item.type === 'sep'){
          itemEl.addCls(MENU_ITEM_SEP_CLS);
        }
        else{
          itemEl.css('height', me.itemHeight);
        }
        me.el.dom.appendChild(itemEl.dom);
        item.el = itemEl;

        var imageCls = item.imageCls || '';

        if(item.cls){
          itemEl.addCls(item.cls);
        }

        if(item.type !== 'sep' && item.type !== '-') {
          var text = [
            item.image === false ? '' : '<div class="' + MENU_ITEM_IMAGE_CLS + ' ' + imageCls + '"></div>',
            '<div class="' + MENU_ITEM_TEXT_CLS + '"></div>'
          ];

          if(item.sideText){
            text.push('<div class="' + MENU_ITEM_SIDE_TEXT_CLS + '">' + item.sideText + '</div>');
          }

          text.push('<div class="' + MENU_ITEM_RIGHT_IMAGE_CLS + ' ' + (item.items ? MENU_ITEM_EXPAND_CLS : '') + '"></div>');

          itemEl.update(text.join(""));
        }

        if (item.image === false) {
          itemEl.addCls(MENU_ITEM_NO_IMAGE_CLS);
        }

        if(item.disabled === true){
          itemEl.addCls(MENU_ITEM_DISABLED_CLS);
        }

        switch (item.type) {
          case '':
          case '-':
          case 'sep':
            break;
          default:
            itemEl.select('.' + MENU_ITEM_TEXT_CLS).item(0).update(item.text || '');
        }

        if(item.checked !== undefined){
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
    applyDefaults: function () {
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
    onItemClick: function (e) {
      var me = this,
        target = Fancy.get(e.currentTarget),
        index = target.attr('index'),
        item = me.items[index],
        args = [me, item];

      if (item.handler && !item.disabled) {
        if (item.scope) {
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
    onItemEnter: function (e) {
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

      if(item.items){
        if(!item.menu){
          var itemConfig = me.items[index];

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
     * @param {Object} e
     */
    onItemLeave: function (e) {},
    /*
     * @param {Number} x
     * @param {Number} y
     */
    showAt: function(x, y){
      var me = this;

      me.css('position', 'absolute');
      me.css('left', x);
      me.css('top', y);

      me.el.show();

      if(me.parentMenu){
        return;
      }

      Fancy.MenuManager.add(me);
    },
    /*
     *
     */
    hide: function () {
      var me = this;

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
    hideAll: function(){
      var parentMenu = this.parentMenu;

      if(parentMenu && parentMenu.el.css('display') !== 'none'){
        parentMenu.hide();
      }

      this.hide();
    },
    /*
     * @param {Number} index
     */
    activateItem: function (index) {
      var me = this,
        item = me.items[index];

      if(item.type === 'sep' || item === '-' || item.disabled){
        return;
      }

      me.activeItem = item;
      item.el.addCls(MENU_ITEM_ACTIVE_CLS);
    },
    /*
     *
     */
    deActivateItem: function () {
      var activeItem = this.activeItem;

      if (!activeItem) {
        return;
      }

      activeItem.el.removeClass(MENU_ITEM_ACTIVE_CLS);
      delete this.activeItem;
    },
    /*
     * @param {Object} e
     */
    onItemMouseDown: function(e) {
      e.preventDefault();
    },
    /*
     * @param {Number} index
     */
    enableItem: function (index) {
      var me = this,
        item = me.items[index];

      item.el.removeCls(MENU_ITEM_DISABLED_CLS);
      item.disabled = false;
    },
    /*
     * @param {Number} index
     */
    disableItem: function (index) {
      var me = this,
        item = me.items[index];

      item.el.addCls(MENU_ITEM_DISABLED_CLS);
      item.disabled = true;
    }
  });

  Fancy.define('Fancy.MenuManager', {
    singleton: true,
    inited: false,
    constructor: function(){},
    /*
     *
     */
    init: function(){
      var docEl = Fancy.get(document);

      docEl.on('click', this.onDocClick, this);
    },
    /*
     * @param {Object} menu
     */
    add: function(menu){
      var me = this;

      if(!me.inited){
        me.init();
      }

      me.activeMenu = menu;
    },
    /*
     * @param {Object} e
     */
    onDocClick: function(e){
      var me = this,
        target = Fancy.get(e.target),
        maxDepth = 10,
        parentEl = target;

      if(!me.activeMenu){
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

      me.activeMenu.hide();
      delete me.activeMenu;
    }
  })

})();