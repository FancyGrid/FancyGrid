/**
 * @class Fancy.toolbar.Tab
 * @extends Fancy.Button
 */
Fancy.define('Fancy.toolbar.Tab', {
  extend: Fancy.Button,
  /*
   * @constructor
   * @param config
   */
  constructor: function(config){
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    this.Super('init', arguments);

    Fancy.loadStyle();
  },
  cls: Fancy.BUTTON_CLS + ' ' + Fancy.TAB_TBAR_CLS,
  /*
   *
   */
  render: function(){
    this.Super('render', arguments);
  }
});/*
 * @mixin Fancy.form.mixin.Form
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var MODAL_CLS = F.MODAL_CLS;
  var FIELD_NOT_VALID_CLS = F.FIELD_NOT_VALID_CLS;
  var FORM_CLS = F.FORM_CLS;
  var FORM_BODY_CLS = F.FORM_BODY_CLS;
  var PANEL_BODY_INNER_CLS = F.PANEL_BODY_INNER_CLS;
  var PANEL_GRID_INSIDE_CLS = F.PANEL_GRID_INSIDE_CLS;
  var PANEL_SHADOW_CLS =  F.PANEL_SHADOW_CLS;
  var FIELD_BLANK_ERR_CLS = F.FIELD_BLANK_ERR_CLS;
  var FIELD_TAB_CLS = F.FIELD_TAB_CLS;
  var FIELD_TAB_ACTIVE_CLS = F.FIELD_TAB_ACTIVE_CLS;
  var TAB_TBAR_ACTIVE_CLS = F.TAB_TBAR_ACTIVE_CLS;
  var PANEL_CLS = F.PANEL_CLS;
  var PANEL_TBAR_CLS = F.PANEL_TBAR_CLS;
  var PANEL_BBAR_CLS = F.PANEL_BBAR_CLS;
  var PANEL_SUB_TBAR_CLS = F.PANEL_SUB_TBAR_CLS;
  var PANEL_BUTTONS_CLS = F.PANEL_BUTTONS_CLS;
  var TAB_TBAR_CLS = F.TAB_TBAR_CLS;
  var FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;

  F.Mixin('Fancy.form.mixin.Form', {
    tabScrollStep: 50,
    /*
     *
     */
    init: function () {
      var me = this;

      me.calcFieldSize();
      me.Super('init', arguments);

      me.addEvents('init', 'set', 'changetab');

      if (F.fullBuilt !== true && F.MODULELOAD !== false && F.MODULESLOAD !== false && me.fullBuilt !== true && me.neededModules !== true) {
        me.loadModules();
        return;
      }

      me.fire('beforerender');

      me.applyDefaults();
      me.preRender();
      me.render();
      me.ons();
      me.fire('init');
    },
    cls: '',
    widgetCls: FORM_CLS,
    value: '',
    width: 200,
    height: 300,
    emptyText: '',
    tpl: ['<div class="'+FORM_BODY_CLS+'"></div>'],
    /*
     *
     */
    preRender: function () {
      var me = this;

      me.initRenderTo();

      if (me.title || me.tbar || me.bbar || me.buttons) {
        me.renderPanel();
      }
    },
    /*
     *
     */
    renderPanel: function () {
      var me = this,
        panelConfig = {
          renderTo: me.renderTo,
          renderOuter: me.renderOuter,
          title: me.title,
          subTitle: me.subTitle,
          subTitleHeight: me.subTitleHeight,
          width: me.width,
          height: me.height,
          titleHeight: me.titleHeight,
          barHeight: me.barHeight,
          theme: me.theme,
          shadow: me.shadow,
          style: me.style || {},
          window: me.window,
          modal: me.modal,
          frame: me.frame,
          items: [me],
          tabs: me.tabs,
          draggable: me.draggable,
          minWidth: me.minWidth,
          minHeight: me.minHeight,
          panelBodyBorders: me.panelBodyBorders,
          resizable: me.resizable,
          tabScrollStep: me.tabScrollStep
        };

      F.each(me.buttons, function (item) {
        if(F.isObject(item)){
         item.scope = item.scope || me;
        }
      });

      F.each(me.bbar, function (item) {
        if(F.isObject(item)){
          item.scope = item.scope || me;
        }
      });

      F.each(me.tbar, function (item) {
        if(F.isObject(item)){
          item.scope = item.scope || me;
        }
      });

      F.each(me.tbar, function (item) {
        if(F.isObject(item)){
          item.scope = item.scope || me;
        }
      });

      F.each(me.subTBar, function (item) {
        if(F.isObject(item)){
          item.scope = item.scope || me;
        }
      });

      if(me.cls){
        panelConfig.cls = me.cls;
        delete me.cls;
      }

      if (me.tabs) {
        panelConfig.tbar = me.generateTabs();
        me.height -= me.barHeight;
      }

      if (me.bbar) {
        panelConfig.bbar = me.bbar;
        me.height -= me.barHeight;
      }

      if (me.tbar) {
        panelConfig.tbar = me.tbar;
        me.height -= me.barHeight;
      }

      if (me.buttons) {
        panelConfig.buttons = me.buttons;
        me.height -= me.barHeight;
        panelConfig.buttons = me.buttons;
      }

      if (me.footer) {
        panelConfig.footer = me.footer;
        me.height -= me.barHeight;
      }

      me.panel = new F.Panel(panelConfig);

      me.bbar = me.panel.bbar;
      me.tbar = me.panel.tbar;
      me.buttons = me.panel.buttons;

      if (!me.wrapped) {
        me.panel.addCls(PANEL_GRID_INSIDE_CLS);
      }

      if (me.extraCls && me.panel) {
        me.panel.addCls(me.extraCls);
      }

      if (me.title) {
        me.height -= me.titleHeight;
      }

      if (me.subTitle) {
        me.height -= me.subTitleHeight;
        me.height += me.panelBodyBorders[2];
      }

      //me.height -= me.panelBorderWidth;
      me.height -= me.panelBodyBorders[0];

      me.renderTo = me.panel.el.select('.' + PANEL_BODY_INNER_CLS).dom;
    },
    /*
     *
     */
    initRenderTo: function () {
      var me = this,
        renderTo = me.renderTo || document.body;

      if (F.isString(renderTo)) {
        renderTo = document.getElementById(renderTo);
        if (!renderTo) {
          renderTo = F.select(renderTo).item(0);
        }
      }

      me.renderTo = renderTo;
    },
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = F.get(me.renderTo || document.body),
        el = F.get(document.createElement('div'));

      if (me.renderOuter && !me.panel) {
        el = renderTo;
      }

      if (!renderTo.dom) {
        throw new Error('[FancyGrid Error 1] - Could not find renderTo element: ' + me.renderTo);
      }

      el.addCls(
        me.cls,
        F.cls,
        me.widgetCls
      );

      if(!el.attr('id')){
        el.attr('id', me.id);
      }

      el.css({
        width: me.width + 'px',
        height: me.height + 'px'
      });

      el.update(me.tpl.join(' '));

      if (me.renderOuter && !me.panel) {
        me.el = el;

        if(F.isObject(me.style)){
          me.el.css(me.style);
        }
      }
      else {
        me.el = F.get(renderTo.dom.appendChild(el.dom));
      }

      if (me.panel === undefined) {
        if (me.shadow) {
          el.addCls(PANEL_SHADOW_CLS);
        }

        if (me.theme !== 'default') {
          el.addCls('fancy-theme-' + me.theme);
        }
      }

      me._items = [];
      me.renderItems();
      me.items = me._items;
      delete me._items;

      if (me.tabs || me.tabbed) {
        me.setActiveTab();
      }

      if(me.$tabs){
        me.$prepareTabs();
      }

      me.fire('afterrender');
      me.fire('render');

      me.rendered = true;
    },
    /*
     * @param {Array} tbar
     */
    generateTabs: function () {
      var me = this,
        tbar = [];

      if (me.tabs) {
        var i = 0,
          iL = me.tabs.length;

        for (; i < iL; i++) {
          var tabConfig = {
            type: 'tab'
          };

          if (F.isString(me.tabs[i])) {
            tabConfig.text = me.tabs[i];
          }
          else {
            tabConfig = me.tabs[i];
          }

          me.tabs[i] = tabConfig;

          if (me.tabs[i].handler === undefined) {
            me.tabs[i].handler = (function (i) {
              return function () {
                me.setActiveTab(i);
              }
            })(i);
          }

          tbar.push(me.tabs[i]);
        }
      }

      return tbar;
    },
    /*
     * @param {Number} newActiveTab
     */
    setActiveTab: function (newActiveTab) {
      var me = this,
        tabs = me.el.select('.' + FIELD_TAB_CLS),
        oldActiveTab = me.el.select('.' + FIELD_TAB_ACTIVE_CLS);

      if (newActiveTab !== undefined) {
        me.activeTab = newActiveTab;
      }

      if (me.activeTab === undefined) {
        me.activeTab = 0;
      }

      oldActiveTab.removeCls(FIELD_TAB_ACTIVE_CLS);
      tabs.item(me.activeTab).addCls(FIELD_TAB_ACTIVE_CLS);

      if (me.tabs) {
        var toolbarTabs = me.panel.el.select('.' + PANEL_TBAR_CLS + ' .' + TAB_TBAR_CLS);
        toolbarTabs.removeCls(TAB_TBAR_ACTIVE_CLS);
        toolbarTabs.item(me.activeTab).addCls(TAB_TBAR_ACTIVE_CLS);
      }

      me.fire('changetab', me.activeTab);
    },
    /*
     * @param {HTMLElement} renderTo
     * @param {Array} [items]
     */
    renderItems: function (renderTo, items) {
      var me = this,
        i = 0,
        iL;

      items = items || me.items;
      iL = items.length;
      renderTo = renderTo || me.el.getByClass(FORM_BODY_CLS);

      for (; i < iL; i++) {
        var item = items[i],
          field;

        item.theme = me.theme;
        item.i18n = me.i18n;

        switch (item.type) {
          case 'pass':
          case 'password':
            field = F.form.field.String;
            item.type = 'string';
            item.isPassword = true;
            break;
          case 'hidden':
            field = F.form.field.String;
            item.hidden = true;
            break;
          case 'line':
          case 'row':
            field = F.form.field.Line;
            item = me.applyDefaults(item);
            break;
          case 'set':
          case 'fieldset':
            item.form = me;
            field = F.form.field.Set;
            item = me.applyDefaults(item);
            break;
          case 'tab':
            field = F.form.field.Tab;
            item = me.applyDefaults(item);
            me.$tabs = me.$tabs || [];
            me.$tabs.push(item.items);
            break;
          case 'string':
          case undefined:
            field = F.form.field.String;
            break;
          case 'number':
            field = F.form.field.Number;
            break;
          case 'textarea':
            field = F.form.field.TextArea;
            break;
          case 'checkbox':
            field = F.form.field.CheckBox;
            break;
          case 'switcher':
            field = F.form.field.Switcher;
            break;
          case 'combo':
            field = F.form.field.Combo;
            break;
          case 'html':
            field = F.form.field.HTML;
            break;
          case 'radio':
            field = F.form.field.Radio;
            break;
          case 'date':
            field = F.form.field.Date;
            break;
          case 'recaptcha':
            field = F.form.field.ReCaptcha;
            break;
          case 'button':
            field = F.form.field.Button;
            break;
          case 'segbutton':
            field = F.form.field.SegButton;
            break;
          default:
            throw new Error('type ' + item.type + ' is not set');
        }

        item.renderTo = item.renderTo || renderTo;

        var _item = new field(item);

        switch (item.type) {
          case 'line':
          case 'row':
          case 'set':
          case 'fieldset':
            me.renderItems(_item.el.select('.' + FIELD_TEXT_CLS).dom, _item.items);
            break;
          case 'tab':
            me.renderItems(_item.el.select('.fancy-field-tab-items').dom, _item.items);
            break;
          default:
            me._items.push(_item);
        }
      }
    },
    /*
     * @param {Object} item
     * @return {Object}
     */
    applyDefaults: function (item) {
      var me = this;

      if (item === undefined) {
        var items = me.items,
          i = 0,
          iL = items.length,
          defaults = me.defaults || {};

        for (; i < iL; i++) {
          F.applyIf(items[i], defaults);
        }

        return;
      }

      var j,
        jL;

      if (item.defaults) {
        j = 0;
        jL = item.items.length;

        for (; j < jL; j++) {
          F.applyIf(item.items[j], item.defaults);
        }
      }

      return item;
    },
    /*
     *
     */
    ons: function () {
      var me = this;

      F.each(me.items, function (item) {
        switch (item.type) {
          case 'line':
          case 'row':
            break;
          case 'set':
          case 'fieldset':
            break;
          case 'tab':
          case 'button':
          case 'segbutton':
            break;
          default:
            item.on('change', me.onChange, me);
        }
      });

      if (me.responsive) {
        F.$(window).bind('resize', function () {
          me.onWindowResize();

          if(me.intWindowResize){
            clearInterval(me.intWindowResize);
          }

          me.intWindowResize = setTimeout(function(){
            me.onWindowResize();
            delete me.intWindowResize;

            //Bug fix for Mac
            setTimeout(function () {
              me.onWindowResize();
            }, 300);
          }, 30);
        });
      }
    },
    /*
     * @param {Object} field
     * @param {*} value
     * @param {*} oldValue
     */
    onChange: function (field, value, oldValue) {
      this.fire('set', {
        name: field.name,
        value: value,
        oldValue: oldValue
      });
    },
    /*
     * @return {Object}
     */
    getValues: function(){
      return this.get();
    },
    /*
     * @param {String} name
     * @return {Array|String|Number|Object}
     */
    get: function (name) {
      var me = this;

      if (name) {
        var value;
        F.each(me.items, function (item) {
          switch (item.type) {
            case 'html':
            case 'button':
              return;
              break;
          }

          if (item.name === name) {
            value = item.get();
            return true;
          }
        });
        return value;
      }
      else {
        var values = {};

        F.each(me.items, function (item) {
          switch (item.type) {
            case 'html':
            case 'button':
              return;
              break;
          }

          if (item.name === undefined) {
            return;
          }

          values[item.name] = item.get();
        });

        return values;
      }
    },
    /*
     * @param {String} name
     * @param {*} value
     */
    set: function (name, value) {
      var me = this;

      if (F.isObject(name)) {
        for (var p in name) {
          me.set(p, name[p]);
        }
        return;
      }

      if (name) {
        F.each(me.items, function (item) {
          if (item.name !== name) {
            return;
          }

          item.set(value);
        });
        return value;
      }
    },
    /*
     * @param {Boolean} clear
     */
    clear: function (clear) {
      var me = this;

      F.each(me.items, function (item) {
        switch (item.type) {
          case 'html':
          case 'recaptcha':
          case 'button':
            return;
            break;
        }

        if (clear !== false) {
          item.clear();
        }

        delete item.acceptValue;

        if (me.hasCls(FIELD_NOT_VALID_CLS)) {
          me.removeCls(FIELD_NOT_VALID_CLS);
          me.css('height', ( parseInt(me.css('height')) - 6) + 'px');
        }
        if (me.hasCls(FIELD_BLANK_ERR_CLS)) {
          me.removeCls(FIELD_BLANK_ERR_CLS);
          me.css('height', ( parseInt(me.css('height')) - 6) + 'px');
        }

        if (item.name && me.params && me.params[item.name]) {
          delete me.params[item.name];
        }
      });
    },
    /*
     * @param {Object} o
     */
    submit: function (o) {
      var me = this,
        o = o || {},
        params = o.params || {},
        values = me.get();

      if(o.method){
        me.method = o.method;
      }
      else{
        me.method = 'GET';
      }

      if(o.failure){
        me.failure = o.failure;
      }
      else{
        delete me.failure;
      }

      if(o.success){
        me.success = o.success;
      }
      else{
        delete me.success;
      }

      if(o.url){
        me.url = o.url;
      }

      me.clear(false);
      if (me.valid() === false) {
        return;
      }

      if (me.params && me.params.recaptcha === 'wait') {
        me.submit(o);
        return;
      }

      if (me.params && me.params.recaptcha === '') {
        return;
      }

      F.applyIf(params, values);

      me.params = me.params || {};

      F.applyIf(params, values);
      F.applyIf(params, me.params);

      me.params = params;

      me.params['g-recaptcha-response'] = me.params.recaptcha;
      delete me.params.recaptcha;

      F.Ajax(me);
    },
    /*
     * @return {Boolean}
     */
    valid: function () {
      var valid = true;

      F.each(this.items, function (item) {
        switch(item.type){
          case 'string':
          case 'number':
            break;
          default:
            return;
        }

        if (valid === true) {
          valid = item.onBlur();
        }
        else {
          item.onBlur();
        }
      });

      return !!valid;
    },
    /*
     * @param {String} name
     * @return {Object}
     */
    getItem: function (name) {
      var item = false;

      F.each(this.items, function (_item) {
        if (_item.name === name) {
          item = _item;
          return true;
        }
      });

      return item;
    },
    /*
     *
     */
    showAt: function () {
      var panel = this.panel;

      if (panel) {
        panel.showAt.apply(panel, arguments);
      }
    },
    /*
     *
     */
    show: function () {
      var me = this,
        panel = me.panel;

      setTimeout(function () {
        if (panel) {
          panel.show.apply(panel, arguments);
        }
        else {
          me.el.show();
        }
      }, 30);
    },
    /*
     *
     */
    hide: function () {
      var me = this;

      if (me.panel) {
        me.panel.css({
          display: 'none'
        });
      }
      else {
        me.css({
          display: 'none'
        });
      }

      var modal = F.select('.' + MODAL_CLS);

      if (modal.dom) {
        modal.css('display', 'none');
      }

      var i = 0,
        iL = me.items.length;

      for (; i < iL; i++) {
        if (me.items[i].type === 'combo') {
          me.items[i].hideList();
        }
      }
    },
    /*
     * @param {Number} height
     */
    setHeight: function (height) {
      var me = this;

      if (me.panel) {
        me.panel.css('height', height);

        if (me.buttons) {
          height -= me.barHeight;
        }

        if (me.bbar) {
          height -= me.barHeight;
        }

        if (me.tbar || me.tabs) {
          height -= me.barHeight;
        }

        if (me.title) {
          height -= me.titleHeight;
        }

        height -= me.panelBodyBorders[0];
        height -= me.panelBodyBorders[2];
      }

      me.css('height', height);
    },
    /*
     * @param {Number} value
     */
    setWidth: function (value) {
      var me = this;

      if (me.panel) {
        me.panel.css('width', value);

        value -= me.panelBodyBorders[1];
        value -= me.panelBodyBorders[3];
      }

      me.css('width', value);

      var inLineFields = {};

      F.each(me.items, function (item) {
        if(item.lineName){
          inLineFields[item.lineName] = inLineFields[item.lineName] || [];
          inLineFields[item.lineName].push(item);
          return;
        }

        switch(item.type){
          case 'line':
            var _value = value,
              lineFieldNumber = 0,
              _itemsWidth = 0;

            _value -= parseInt(item.css('margin-left'));
            _value -= parseInt(item.css('margin-right'));

            F.each(item.items, function (_item) {
              switch(_item.type){
                case 'button':
                  _value -= _item.css('width');

                  _value -= parseInt(_item.css('margin-left'));
                  _value -= parseInt(_item.css('margin-right'));

                  break;
                default:
                  lineFieldNumber++;
                  _itemsWidth += _item.css('width');
              }
            });
            break;
          default:
            var _value = value;

            _value -= parseInt(item.css('margin-left'));
            _value -= parseInt(item.css('margin-right'));

            item.setWidth(_value);
        }
      });

      F.each(inLineFields, function (lineFields) {
        var widths = [],
          _value = value,
          totalWidth = 0;

        F.each(lineFields, function (item, i) {
          var width = parseInt(item.el.css('width'));

          _value -= parseInt(item.css('padding-left'));

          if(i === lineFields.length - 1){
            _value -= parseInt(item.css('padding-right'));
          }

          switch(item.type){
            case 'button':
              _value -= width;
              return;
              break;
            case 'textarea':
              //_value -= parseInt(item.css('padding-right'));
              break;
          }

          totalWidth += width;

          widths.push(width);
        });

        var _lineFields = [];

        F.each(lineFields, function (item) {
          switch(item.type){
            case 'button':
              break;
            default:
              _lineFields.push(item);
          }
        });

        var percent = totalWidth/100,
          newPercent = _value/100;

        F.each(widths, function (value, i) {
          var percents = value/percent,
            newValue = percents * newPercent,
            item = _lineFields[i];

          item.setWidth(newValue);
        });
      });
    },
    /*
     * @return {Number}
     */
    getHeight: function () {
      var panel = this.panel;

      if (panel) {
        return panel.getHeight();
      }

      return parseInt(this.css('height'));
    },
    /*
     *
     */
    calcFieldSize: function () {
      var me = this,
        width = me.width,
        defaults = me.defaults || {},
        labelWidth,
        maxLabelNumber = me.maxLabelNumber;

      defaults.width = width - me.panelBorderWidth * 2;

      F.each(me.items, function (item) {
        switch (item.type) {
          case 'set':
          case 'tab':
            if (item.type === 'tab') {
              me.tabbed = true;
            }

            var minusWidth = item.type === 'set' ? 62 : 20;

            F.each(item.items, function (_item) {
              if (_item.width === undefined) {
                _item.width = width - minusWidth;
              }

              if (_item.label && _item.label.length > maxLabelNumber) {
                maxLabelNumber = _item.label.length;
              }
            });

            item.defaults = item.defaults || {};
            item.defaults.labelWidth = item.defaults.labelWidth || (maxLabelNumber + 1) * 8;

            break;
          case 'line':
            var numOfFields = item.items.length,
              isWidthInit = false,
              avaliableWidth = width,
              averageWidth;

            F.each(item.items, function(_item){
              if(_item.label === undefined && _item.labelAlign !== 'top'){
                _item.label = false;
              }

              if(_item.width){
                avaliableWidth -= _item.width;
                numOfFields--;
              }
            });

            averageWidth = (avaliableWidth - 8 - 8 - 8) / numOfFields;

            F.each(item.items, function (_item) {
              if(!_item.width){
                _item.width = averageWidth;
              }
              else{
                //isWidthInit = true;
              }

              if (_item.labelWidth || _item.inputWidth) {
                isWidthInit = true;
              }
            });

            if (isWidthInit === false) {
              F.each(item.items, function (_item) {
                if (_item.labelAlign === 'top') {
                  _item.labelWidth = averageWidth;
                }
                else {
                  //Bad bug fix
                  _item.labelWidth = 100;
                }
              });
            }

            item.defaults = item.defaults || {};
            if (item.defaults.labelWidth === undefined) {
              item.defaults.labelWidth = me.labelWidth;
            }
            break;
          default:
            if (item.label && item.label.length > maxLabelNumber) {
              maxLabelNumber = item.label.length;
            }
        }
      });

      maxLabelNumber++;

      labelWidth = maxLabelNumber * 6;
      if (labelWidth < 80) {
        labelWidth = 80;
      }

      defaults.labelWidth = labelWidth;

      if (me.inputWidth) {
        defaults.inputWidth = me.inputWidth;
      }

      me.defaults = defaults;
    },
    /*
     *
     */
    destroy: function () {
      var me = this;

      me.el.destroy();

      if (me.panel) {
        me.panel.el.destroy();
      }
    },
    /*
     * @param {Function} fn
     * @param {Object} scope
     */
    each: function (fn, scope) {
      var me = this,
        items = me.items,
        i = 0,
        iL = items.length;

      if (scope) {
        for (; i < iL; i++) {
          fn.apply(this, [items[i]]);
        }
      }
      else {
        for (; i < iL; i++) {
          fn(items[i]);
        }
      }
    },
    /*
     *
     */
    loadModules: function () {
      var me = this,
        existedModules = F.modules || {},
        requiredModules = {},
        fields = me.items || [];

      F.modules = existedModules;

      if (F.nojQuery) {
        requiredModules.dom = true;
      }

      if (F.isTouch) {
        requiredModules.touch = true;
      }

      var i = 0,
        iL = fields.length;

      for (; i < iL; i++) {
        var field = fields[i];
        if (field.type === 'date') {
          requiredModules.grid = true;
          requiredModules.selection = true;
          requiredModules.date = true;
        }

        if (field.items) {
          var j = 0,
            jL = field.items.length;

          for (; j < jL; j++) {
            var _field = field.items[j];

            if (_field.type === 'date') {
              requiredModules.grid = true;
              requiredModules.selection = true;
              requiredModules.date = true;
            }
          }
        }
      }

      me.neededModules = {
        length: 0
      };

      for (var p in requiredModules) {
        if (F.modules[p] === undefined) {
          me.neededModules[p] = true;
          me.neededModules.length++;
        }
      }

      if (me.neededModules.length === 0) {
        me.neededModules = true;
        me.init();
        return;
      }

      var onLoad = function (name) {
        delete me.neededModules[name];
        me.neededModules.length--;

        if (me.neededModules.length === 0) {
          me.neededModules = true;
          me.init();
        }
      };

      for (var p in me.neededModules) {
        if (p === 'length') {
          continue;
        }

        F.loadModule(p, onLoad);
      }
    },
    /*
     *
     */
    prevTab: function () {
      var me = this;

      me.activeTab--;
      if (me.activeTab < 0) {
        me.activeTab = 0;
      }

      me.setActiveTab();
    },
    /*
     *
     */
    nextTab: function () {
      var me = this,
        tabNumber = me.el.select('.' + FIELD_TAB_CLS).length;

      me.activeTab++;

      if (me.activeTab >= tabNumber) {
        me.activeTab = tabNumber - 1;
      }

      me.setActiveTab();
    },
    onWindowResize: function () {
      var me = this,
        renderTo = me.renderTo,
        el;

      if (me.panel) {
        renderTo = me.panel.renderTo;
      }

      if(me.responsive) {
        el = F.get(renderTo);
      }
      else if(me.panel){
        el = me.panel.el;
      }
      else{
        el = F.get(renderTo);
      }

      if(el.hasClass(PANEL_CLS) || el.hasClass(FORM_CLS)){
        el = el.parent();
      }

      var newWidth = el.width();

      if(el.dom === undefined){
        return;
      }

      if(newWidth === 0){
        newWidth = el.parent().width();
      }

      if(me.responsive) {
        me.setWidth(newWidth);
      }
    },
    /*
     * @param {String} bar
     */
    hideBar: function (bar) {
      var me = this,
        barCls,
        barEl;

      switch(bar){
        case 'tbar':
          barCls = PANEL_TBAR_CLS;
          break;
        case 'subtbar':
          barCls = PANEL_SUB_TBAR_CLS;
          break;
        case 'bbar':
          barCls = PANEL_BBAR_CLS;
          break;
        case 'buttons':
          barCls = PANEL_BUTTONS_CLS;
          break;
        default:
          throw new Error('FancyGrid Error: bar does not exist');
      }

      barEl = me.panel.el.select('.' + barCls);

      if(barEl.css('display') !== 'none'){
        barEl.hide();

        var panelHeight = parseInt(me.panel.el.css('height'));
        me.panel.el.css('height', panelHeight - me.barHeight);
      }
    },
    /*
     * @param {String} bar
     */
    showBar: function (bar) {
      var me = this,
        barCls,
        barEl;

      switch(bar){
        case 'tbar':
          barCls = PANEL_TBAR_CLS;
          break;
        case 'subtbar':
          barCls = PANEL_SUB_TBAR_CLS;
          break;
        case 'bbar':
          barCls = PANEL_BBAR_CLS;
          break;
        case 'buttons':
          barCls = PANEL_BUTTONS_CLS;
          break;
        default:
          throw new Error('FancyGrid Error: bar does not exist');
      }

      barEl = me.panel.el.select('.' + barCls);

      if(barEl.css('display') == 'none'){
        barEl.show();

        var panelHeight = parseInt(me.panel.el.css('height'));
        me.panel.el.css('height', panelHeight + me.barHeight);
      }
    },
    /*
     *
     */
    $prepareTabs: function () {
      var me = this,
        i = 0,
        tabIndex = 0;

      F.each(me.items, function (item) {
        me.$tabs[tabIndex][i] = item;
        i++;

        if(!me.$tabs[tabIndex][i]){
          i = 0;
          tabIndex++;
        }
      });
    }
  });

})();/*
 * @mixin Fancy.form.mixin.PrepareConfig
 */
Fancy.Mixin('Fancy.form.mixin.PrepareConfig', {
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfig: function(config, originalConfig){
    var me = this;

    if(config.renderOuter){
      config.renderTo = config.renderOuter;
    }

    config = me.prepareConfigTheme(config, originalConfig);
    config = me.prepareConfigSize(config, originalConfig);
    config = me.prepareConfigLang(config, originalConfig);
    config = me.prepareConfigDefaults(config);
    config = me.prepareConfigItems(config);
    config = me.prepareConfigFooter(config);

    return config;
  },
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfigSize: function (config, originalConfig) {
    var el,
      me = this,
      renderTo = config.renderTo;

    if(config.width === undefined) {
      if (renderTo) {
        config.responsive = true;
        el = Fancy.get(renderTo);

        config.width = parseInt(el.width());
      }
    }

    if(config.height === undefined){

    }
    else if(config.height === 'fit'){
      setTimeout(function () {
        me.setHeightFit();
        me.on('changetab', me.onChangeTab, me);
      });
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigDefaults: function(config){
    if( config.defaults ){
      for(var p in config.defaults){
        Fancy.each(config.items, function(item){
          if( item[p] === undefined ){
            item[p] = config.defaults[p];
          }
        });
      }
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigItems: function(config){
    var me = this,
      fn = function(item){
        item.theme = me.theme || '';

        if( item.labelWidth === undefined ){
          item.labelWidth = me.labelWidth;
        }

        if( item.inputWidth === undefined ){
          item.inputWidth = me.inputWidth;
        }

        if( item.type === 'pass' || item.type === 'password' ){
          item.type = 'string';
          item.isPassword = true;
        }

        if(item.items){
          Fancy.each(item.items, fn);
        }
      };

    Fancy.each(config.items, fn);

    return config;
  },
  /*
   *
   */
  setHeightFit: function () {
    var me = this,
      isPanel = !!( me.title ||  me.subTitle || me.tbar || me.bbar || me.buttons || me.panel),
      panelBodyBorders = me.panelBodyBorders,
      gridWithoutPanelBorders = me.gridWithoutPanelBorders,
      gridBorders = me.gridBorders;

    me.heightFit = true;

    var height = me.fieldHeight;
    var items = me.items;

    if(me.$tabs){
      var activeTab = me.activeTab || 0;

      items = me.$tabs[activeTab];
    }

    Fancy.each(items, function(field){
      if(field.hidden){}
      else{
        height += parseInt(field.css('height'));
      }
    });

    if(me.title){
      height += me.titleHeight;
    }

    if(me.tbar || me.tabs){
      height += me.barHeight;
    }

    if(me.bbar){
      height += me.barHeight;
    }

    if(me.buttons){
      height += me.barHeight;
    }

    if(me.subTBar){
      height += me.barHeight;
    }

    if(me.footer){
      height += me.barHeight;
    }

    if( isPanel ){
      height += panelBodyBorders[0] + panelBodyBorders[2] + gridBorders[0] + gridBorders[2];
    }
    else{
      height += gridWithoutPanelBorders[0] + gridWithoutPanelBorders[2] + gridBorders[0] + gridBorders[2];
    }

    if(me.minHeight && height < me.minHeight){
      height = me.minHeight;
    }

    me.setHeight(height);
  },
  /*
   *
   */
  onChangeTab: function () {
    var me = this;

    me.setHeightFit();
  }
});/*
 * @class Fancy.FieldLine
 * @extend Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Line', 'Fancy.FieldLine'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.line',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);

    var i = 0,
      iL = me.items.length,
      isItemTop,
      lineName = Fancy.id(null, 'fancy-line-');

    if(me.parentSet){
      var averageWidth = me.width  / me.items.length;
    }

    for(;i<iL;i++){
      var item = me.items[i];

      if(item.width === undefined){
        item.width = averageWidth;
      }

      item.style = item.style || {};
      item.lineName = lineName;

      if( item.labelAlign === 'top' ){
        isItemTop = true;

        if(me.parentSet){
          item.style['padding'] = '0px';
        }

        if(item.label){
          item.labelWidth = item.width - 16;
          if(item.labelWidth === 100){
            item.labelWidth = 7 * (item.label.length + 1 + 1);
          }

          if(item.width < item.labelWidth){
            item.labelWidth = 7 * (item.label.length + 1 + 1);
          }
        }
      }
      else{
        item.style['padding-top'] = '0px';

        if(!item.labelWidth && item.label){
          item.labelWidth = 7 * (item.label.length + 1 + 1);
        }
      }

      if( i === 0 ){
        item.style['padding-left'] = '0px';
      }
    }

    me.preRender();
    me.render();

    if( isItemTop ){
      me.css('height', '48px');
    }
  },
  fieldCls: 'fancy fancy-field fancy-field-line',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-text fancy-field-line-items">',
    '</div>'
  ]
});/*
 * @class Fancy.SetField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Set', 'Fancy.SetField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.set',
  padding: '8px 11px 0px 8px',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('beforecollapse', 'collapse', 'expanded', 'expand', 'beforeexpand', 'beforeexpanded');

    me.Super('init', arguments);

    Fancy.each(me.items, function(item, i){
      if( item.labelAlign === 'top' ){
        if( i === 0 ){
          item.style = {
            'padding-left': '0px'
          };
        }
      }

      if(item.type === 'line'){
        item.padding = false;
        item.parentSet = true;
      }
    });

    me.preRender();
    me.render();
    if( me.checkbox !== undefined ){
      me.initCheckBox();
    }

    me.on('beforecollapse', me.onBeforeCollapsed, me);
    me.on('expanded', me.onExpanded, me);
  },
  fieldCls: 'fancy-field-set',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<fieldset>',
      '<legend>',
        '<div class="fancy-field-checkbox-input" style="float:left;margin-top: 4px;display: none;"></div>',
        '<div class="fancy-field-set-label" style="float:left;">{label}</div>',
        '<div class="fancy-clearfix"></div>',
      '</legend>',
      '<div class="fancy-field-text fancy-field-set-items">',

      '</div>',
    '</fieldset>'
  ],
  /*
   *
   */
  initCheckBox: function(){
    var me = this,
      checkbox = me.el.select('.fancy-field-checkbox-input');

    checkbox.css('display', '');

    if( me.checkbox === true ){
      me.addCls('fancy-checkbox-on');
    }

    var itemsEl = me.el.select('.fancy-field-set-items');

    setTimeout(function(){
      if( me.checkbox === true ){}
      else{
        me.fire('collapse');
      }
    }, 1);

    if( me.checkbox === true ){
      itemsEl.css('display', '');
      me.removeCls('fancy-set-collapsed');
    }
    else{
      itemsEl.css('display', 'none');
      me.addCls('fancy-set-collapsed');
    }

    checkbox.on('click', function(){
      me.toggleCls('fancy-checkbox-on');

      var isChecked = me.el.hasCls('fancy-checkbox-on'),
        itemsEl = me.el.select('.fancy-field-set-items');

      if( isChecked ){
        me.fire('beforeexpanded');
        me.fire('beforeexpand');
        itemsEl.css('display', '');
        me.removeCls('fancy-set-collapsed');
        me.fire('expanded');
        me.fire('expand');
      }
      else{
        me.fire('beforecollapse');
        itemsEl.css('display', 'none');
        me.addCls('fancy-set-collapsed');
        me.fire('collapse');
      }
    });
  },
  /*
   *
   */
  onBeforeCollapsed: function(){
    var me = this,
      form = me.form,
      itemsEl = me.el.select('.fancy-field-set-items'),
      itemsHeight = parseInt(itemsEl.css('height'));

    form.setHeight(form.getHeight() - itemsHeight);
  },
  /*
   *
   */
  onExpanded: function(){
    var me = this,
      form = me.form,
      itemsEl = me.el.select('.fancy-field-set-items'),
      itemsHeight = parseInt(itemsEl.css('height'));

    form.setHeight(form.getHeight() + itemsHeight);
  }
});/*
 * @class Fancy.HTMLField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.HTML', 'Fancy.HTMLField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.html',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'change', 'key');

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
  fieldCls: 'fancy-field-html',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="" style="">',
      '{value}',
    '</div>'
  ],
  /*
   *
   */
  render: function(){
    var me = this,
      renderTo = me.renderTo || document.body,
      el = document.createElement('div');

    me.fire('beforerender');

    el.innerHTML = me.tpl.getHTML({
      value: me.value,
      height: me.height
    });

    me.el = renderTo.appendChild(el);
    me.el = Fancy.get(me.el);

    me.el.addCls(me.cls, Fancy.cls, me.fieldCls);

    me.acceptedValue = me.value;
    me.fire('afterrender');
    me.fire('render');
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  set: function(value, onInput){
    var me = this;

    me.el.firstChild().update(value);
    if(onInput !== false){
      me.onInput();
    }
  },
  /*
   * @return {String}
   */
  get: function(){
    return this.el.firstChild().dom.innerHTML;
  }
});/**
 * @class Fancy.ReCaptcha
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.ReCaptcha', 'Fancy.ReCaptcha'], {
  type: 'field.recaptcha',
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'change', 'key');

    me.Super('init', arguments);

    me.tpl = new Fancy.Template(me.tpl);
    me.render();

    me.name = 'recaptcha';

    //me.ons();

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }

    var s = document.createElement("script");

    s.type = "text/javascript";
    s.src = 'https://www.google.com/recaptcha/api.js';

    Fancy.get(document.head).append(s);
  },
  /*
   * @return {'wait'|*}
   */
  get: function(){
    var me = this,
      formReCaptchaEl = me.el.select('form');

    if( me.value ){
      return me.value;
    }

    me.value = 'wait';

    formReCaptchaEl.one('submit', function(e){
      e.preventDefault();
      me.value = Fancy.$(this).serialize().replace('g-recaptcha-response=', '');
    });

    formReCaptchaEl.submit();

    return me.value;
  },
  fieldCls: Fancy.FIELD_CLS,
  value: '',
  width: 100,
  tpl: [
    '<form method="POST">',
    '<div class="g-recaptcha" data-sitekey="{key}"></div>',
    '</form>'
  ]
});