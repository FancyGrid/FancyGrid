(function() {

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
      var me = this;

      Fancy.applyConfig(me, config || {});

      me.Super('const', arguments);
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

      el.on('mousedown', me.onItemMouseDown, me, '.fancy-menu-item');
      el.on('click', me.onItemClick, me, '.fancy-menu-item');
      el.on('mouseenter', me.onItemEnter, me, '.fancy-menu-item');
      el.on('mouseleave', me.onItemLeave, me, '.fancy-menu-item');
    },
    widgetCls: 'fancy-menu',
    itemCls: 'fancy-menu-item',
    itemImageCls: 'fancy-menu-item-image',
    itemContainerCls: 'fancy-menu-item-text',
    activeItemCls: 'fancy-menu-item-active',
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
        el.addClass('fancy-theme-' + me.theme);
      }

      el.addClass(Fancy.cls);
      el.addClass(me.widgetCls);
      el.addClass(me.cls);
      el.addClass(me.extraCls);

      el.css('width', me.width);
      el.css('height', me.getItemsHeight());

      renderTo = Fancy.get(me.renderTo || document.body);

      me.el = renderTo.dom.appendChild(el.dom);
      me.el = Fancy.get(me.el);

      me.renderItems();

      me.fire('afterrender');
      me.fire('render');

      me.rendered = true;
    },
    /*
     *
     */
    getItemsHeight: function () {
      var me = this,
        height = 0,
        i = 0,
        iL = me.items.length;

      for (; i < iL; i++) {
        height += me.itemHeight;
      }

      return height;
    },
    renderItems: function () {
      var me = this,
        i = 0,
        iL = me.items.length,
        item;

      for(; i < iL; i++){
        item = me.items[i];
        var itemEl = Fancy.get(document.createElement('div'));
        itemEl.attr('index', i);

        itemEl.addClass(me.itemCls);
        itemEl.css('height', me.itemHeight);
        me.el.dom.appendChild(itemEl.dom);
        item.el = itemEl;

        var imageCls = item.imageCls || '';

        if(item.cls){
          itemEl.addClass(item.cls);
        }

        itemEl.update([
          item.image === false ? '' : '<div class="fancy-menu-item-image ' + imageCls + '"></div>',
          '<div class="fancy-menu-item-text"></div>',
          '<div class="fancy-menu-item-right-image ' + (item.items ? 'fancy-menu-item-expand' : '') + '"></div>'
        ].join(""));

        if (item.image === false) {
          itemEl.addClass('fancy-menu-item-no-image');
        }

        switch (item.type) {
          case '':
            break;
          default:
            itemEl.select('.fancy-menu-item-text').item(0).update(item.text || '');
        }

        if(item.checked !== undefined){
          me.items[i].checkbox = new Fancy.CheckBox({
            label: false,
            theme: me.theme,
            padding: '1px 8px 0px',
            renderTo: itemEl.select('.fancy-menu-item-image').item(0).dom,
            value: item.checked
          });
        }
      }
    },
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
    onItemClick: function (e) {
      var me = this,
        target = Fancy.get(e.currentTarget),
        index = target.attr('index'),
        item = me.items[index],
        args = [me, item];

      if (item.handler) {
        if (item.scope) {
          item.handler.apply(item.scope, args);
        }
        else {
          item.handler(me, item);
        }
      }
    },
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
    onItemLeave: function (e) {},
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
    hide: function () {
      var me = this;

      me.el.hide();
      me.deActivateItem();

      if(me.shownSubMenu){
        me.shownSubMenu.hide();
      }

      me.fire('hide');
    },
    hideAll: function(){
      var me = this;

      if(me.parentMenu && me.parentMenu.el.css('display') !== 'none'){
        me.parentMenu.hide();
      }

      me.hide();
    },
    activateItem: function (index) {
      var me = this,
        item = me.items[index];

      me.activeItem = item;
      item.el.addClass(me.activeItemCls);
    },
    deActivateItem: function () {
      var me = this;

      if (!me.activeItem) {
        return;
      }

      me.activeItem.el.removeClass(me.activeItemCls);
      delete me.activeItem;
    },
    onItemMouseDown: function(e) {
      e.preventDefault();
    }
  });

  Fancy.define('Fancy.MenuManager', {
    singleton: true,
    inited: false,
    constructor: function(){},
    init: function(){
      var me = this,
        docEl = Fancy.get(document);

      docEl.on('click', me.onDocClick, me);
    },
    add: function(menu){
      var me = this;

      if(!me.inited){
        me.init();
      }

      me.activeMenu = menu;
    },
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

        if( parentEl.hasClass('fancy-menu') ){
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