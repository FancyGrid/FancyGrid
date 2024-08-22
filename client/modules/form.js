/*
 * @mixin Fancy.form.mixin.Form
 */
Fancy.modules['form'] = true;
(function(){
  //SHORTCUTS
  const F = Fancy;

  //CONSTANTS
  const MODAL_CLS = F.MODAL_CLS;
  const FIELD_NOT_VALID_CLS = F.FIELD_NOT_VALID_CLS;
  const FORM_CLS = F.FORM_CLS;
  const FORM_BODY_CLS = F.FORM_BODY_CLS;
  const PANEL_BODY_INNER_CLS = F.PANEL_BODY_INNER_CLS;
  const FORM_PANEL_CLS = F.FORM_PANEL_CLS;
  const PANEL_SHADOW_CLS = F.PANEL_SHADOW_CLS;
  const FIELD_BLANK_ERR_CLS = F.FIELD_BLANK_ERR_CLS;
  const FIELD_TAB_CLS = F.FIELD_TAB_CLS;
  const FIELD_TAB_ACTIVE_CLS = F.FIELD_TAB_ACTIVE_CLS;
  const TAB_TBAR_ACTIVE_CLS = F.TAB_TBAR_ACTIVE_CLS;
  const PANEL_CLS = F.PANEL_CLS;
  const PANEL_TBAR_CLS = F.PANEL_TBAR_CLS;
  const PANEL_BBAR_CLS = F.PANEL_BBAR_CLS;
  const PANEL_SUB_TBAR_CLS = F.PANEL_SUB_TBAR_CLS;
  const PANEL_BUTTONS_CLS = F.PANEL_BUTTONS_CLS;
  const TAB_TBAR_CLS = F.TAB_TBAR_CLS;
  const FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;

  F.Mixin('Fancy.form.mixin.Form', {
    tabScrollStep: 80,
    /*
     *
     */
    init(){
      const me = this;

      me.calcFieldSize();
      me.Super('init', arguments);

      me.addEvents('init', 'set', 'changetab');

      if (F.fullBuilt !== true && F.MODULELOAD !== false && F.MODULESLOAD !== false && me.fullBuilt !== true && me.neededModules !== true){
        me.loadModules();
        return;
      }

      me.fire('beforerender');

      me.applyDefaults();
      me.preRender();
      me.render();
      if(me.scrollable){
        me.checkScroll();
      }
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
    preRender(){
      const me = this;

      me.initRenderTo();

      if (me.title || me.tbar || me.bbar || me.buttons){
        me.renderPanel();
      }
    },
    /*
     *
     */
    renderPanel(){
      const me = this,
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
          subTBarHeight: me.subTBarHeight || me.barHeight,
          tbarHeight: me.tbarHeight || me.barHeight,
          bbarHeight: me.bbarHeight || me.barHeight,
          buttonsHeight: me.buttonsHeight || me.barHeight,
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

      F.each(me.buttons, item => {
        if (F.isObject(item)) {
         item.scope = item.scope || me;
        }
      });

      F.each(me.bbar, item => {
        if(F.isObject(item)){
          item.scope = item.scope || me;
        }
      });

      F.each(me.tbar, item => {
        if(F.isObject(item)){
          item.scope = item.scope || me;
        }
      });

      F.each(me.subTBar, item => {
        if (F.isObject(item)) {
          item.scope = item.scope || me;
        }
      });

      if (me.cls) {
        panelConfig.cls = me.cls;
        delete me.cls;
      }

      if (me.tabs) {
        panelConfig.tbar = me.generateTabs();
        me.height -= me.barHeight;
      }

      if (me.bbar) {
        panelConfig.bbar = me.bbar;
        me.height -= me.bbarHeight || me.barHeight;
      }

      if (me.tbar) {
        panelConfig.tbar = me.tbar;
        me.height -= me.tbarHeight || me.barHeight;
      }

      if (me.subTBar) {
        panelConfig.subTBar = me.subTBar;
        me.height -= me.subTBarHeight || me.barHeight;
      }

      if (me.buttons) {
        panelConfig.buttons = me.buttons;
        me.height -= me.buttonsHeight || me.barHeight;
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

      if (me.extraCls && me.panel) {
        me.panel.addCls(me.extraCls);
      }

      if(me.panel){
        me.panel.addCls(FORM_PANEL_CLS);
      }

      if (me.title){
        me.height -= me.titleHeight;
      }

      if (me.subTitle){
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
    initRenderTo(){
      let me = this,
        renderTo = me.renderTo || document.body;

      if (F.isString(renderTo)){
        renderTo = document.getElementById(renderTo);
        if (!renderTo){
          renderTo = F.select(renderTo).item(0);
        }
      }

      me.renderTo = renderTo;
    },
    /*
     *
     */
    render(){
      let me = this,
        renderTo = F.get(me.renderTo || document.body),
        el = F.newEl('div');

      if (me.renderOuter && !me.panel) {
        el = renderTo;
      }

      if (!renderTo.dom) {
        throw new Error(`[FancyGrid Error 1] - Could not find renderTo element: ${me.renderTo}`);
      }

      el.addCls(
        me.cls,
        F.cls,
        me.widgetCls
      );

      if( Fancy.loadingStyle ){
        if(me.panel){
          me.panel.el.css('opacity', 0);
          me.intervalStyleLoad = setInterval(() => {
            if (!Fancy.loadingStyle) {
              clearInterval(me.intervalStyleLoad);
              me.panel.el.animate({
                'opacity': 1,
                force: true
              });
            }
          }, 100);
        }
        else {
          el.css('opacity', 0);
          me.intervalStyleLoad = setInterval(() => {
            if(!Fancy.loadingStyle){
              clearInterval(me.intervalStyleLoad);
              me.el.animate({
                'opacity': 1,
                force: true
              });
            }
          }, 100);
        }
      }

      if(!el.attr('id')){
        el.attr('id', me.id);
      }

      el.css({
        width: me.width + 'px',
        height: me.height + 'px'
      });

      el.update(me.tpl.join(' '));

      if (me.renderOuter && !me.panel){
        me.el = el;

        if(F.isObject(me.style)){
          me.el.css(me.style);
        }
      }
      else {
        me.el = F.get(renderTo.dom.appendChild(el.dom));
      }

      if (me.panel === undefined){
        if (me.shadow){
          el.addCls(PANEL_SHADOW_CLS);
        }

        if (me.theme !== 'default'){
          el.addCls(Fancy.getThemeCSSCls(me.theme));
        }
      }

      me._items = [];
      me.renderItems();
      me.items = me._items;
      delete me._items;

      if (me.tabs || me.tabbed){
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
    generateTabs(){
      const me = this,
        tbar = [];

      if (me.tabs) {
        let i = 0,
          iL = me.tabs.length;

        for (; i < iL; i++){
          let tabConfig = {
            type: 'tab'
          };

          if (F.isString(me.tabs[i])){
            tabConfig.text = me.tabs[i];
          }
          else {
            tabConfig = me.tabs[i];
          }

          me.tabs[i] = tabConfig;

          if (me.tabs[i].handler === undefined){
            me.tabs[i].handler = (function(i){
              return function(){
                me.setActiveTab(i);
              };
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
    setActiveTab(newActiveTab){
      const me = this,
        tabs = me.el.select(`.${FIELD_TAB_CLS}`),
        oldActiveTab = me.el.select(`.${FIELD_TAB_ACTIVE_CLS}`);

      if (newActiveTab !== undefined) {
        me.activeTab = newActiveTab;
      }

      if (me.activeTab === undefined){
        me.activeTab = 0;
      }

      oldActiveTab.removeCls(FIELD_TAB_ACTIVE_CLS);
      tabs.item(me.activeTab).addCls(FIELD_TAB_ACTIVE_CLS);

      if (me.tabs) {
        const toolbarTabs = me.panel.el.select(`.${PANEL_TBAR_CLS} .${TAB_TBAR_CLS}`);
        toolbarTabs.removeCls(TAB_TBAR_ACTIVE_CLS);
        toolbarTabs.item(me.activeTab).addCls(TAB_TBAR_ACTIVE_CLS);
      }

      me.fire('changetab', me.activeTab);
    },
    /*
     * @param {HTMLElement} renderTo
     * @param {Array} [items]
     */
    renderItems(renderTo, items){
      let me = this,
        i = 0,
        iL;

      items = items || me.items;
      iL = items.length;
      renderTo = renderTo || me.el.getByClass(FORM_BODY_CLS);

      for (; i < iL; i++){
        let item = items[i],
          field;

        item.theme = me.theme;
        item.i18n = me.i18n;

        switch (item.type){
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
            throw new Error(`type ${item.type} is not set`);
        }

        item.renderTo = item.renderTo || renderTo;

        const _item = new field(item);

        switch (item.type){
          case 'line':
          case 'row':
          case 'set':
          case 'fieldset':
            me.renderItems(_item.el.select(`.${FIELD_TEXT_CLS}`).dom, _item.items);
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
    applyDefaults(item){
      const me = this;

      if (item === undefined) {
        var items = me.items,
          i = 0,
          iL = items.length,
          defaults = me.defaults || {};

        for (; i < iL; i++){
          F.applyIf(items[i], defaults);
        }

        return;
      }

      var j,
        jL;

      if (item.defaults) {
        j = 0;
        jL = item.items.length;

        for (; j < jL; j++){
          F.applyIf(item.items[j], item.defaults);
        }
      }

      return item;
    },
    /*
     *
     */
    ons(){
      const me = this;

      F.each(me.items, item => {
        switch (item.type){
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
        F.$(window).bind('resize', function(){
          me.onWindowResize();

          clearInterval(me.intWindowResize);

          me.intWindowResize = setTimeout(() => {
            me.onWindowResize();
            delete me.intWindowResize;

            //Bug fix for Mac
            setTimeout(() => {
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
    onChange(field, value, oldValue){
      this.fire('set', {
        name: field.name,
        value,
        oldValue
      });
    },
    /*
     * @return {Object}
     */
    getValues(){
      return this.get();
    },
    /*
     * @param {String} name
     * @return {Array|String|Number|Object}
     */
    get(name){
      const me = this;

      if (name) {
        let value;
        F.each(me.items, item => {
          switch (item.type) {
            case 'html':
            case 'button':
              return;
          }

          if (item.name === name){
            value = item.get();

            if(item.type === 'number' && value !== '' && value !== ' ' && F.isString(value)){
              value = Number(value);
            }
            return true;
          }
        });
        return value;
      }
      else {
        const values = {};

        F.each(me.items, item => {
          switch (item.type) {
            case 'html':
            case 'button':
              return;
          }

          if (item.name === undefined){
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
    set(name, value){
      const me = this;

      if (F.isObject(name)) {
        for (const p in name){
          me.set(p, name[p]);
        }
        return;
      }

      if (name){
        F.each(me.items, item => {
          if (item.name !== name){
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
    clear(clear){
      const me = this;

      F.each(me.items, item => {
        switch (item.type) {
          case 'html':
          case 'recaptcha':
          case 'button':
            return;
        }

        if (clear !== false){
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

        if (item.name && me.params && me.params[item.name]){
          delete me.params[item.name];
        }
      });
    },
    /*
     * @param {Object} o
     */
    submit(o = {}){
      const me = this,
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
      if (me.valid() === false){
        return;
      }

      if (me.params && me.params.recaptcha === 'wait'){
        me.submit(o);
        return;
      }

      if (me.params && me.params.recaptcha === ''){
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
    valid(){
      let valid = true;

      F.each(this.items, item => {
        switch(item.type){
          case 'field.string':
          case 'string':
          case 'number':
          case 'field.number':
          case 'textarea':
          case 'field.textarea':
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
    getItem(name, returnOrder){
      let item = false,
        order;

      F.each(this.items, (_item, i) => {
        if (_item.name === name) {
          item = _item;
          order = i;
          return true;
        }
      });

      if(returnOrder){
        return {
          item,
          order
        };
      }

      return item;
    },
    /*
     *
     */
    showAt(){
      const panel = this.panel;

      if (panel) {
        panel.showAt.apply(panel, arguments);
      }
    },
    /*
     *
     */
    show(){
      const me = this,
        panel = me.panel;

      setTimeout(() => {
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
    hide(){
      const me = this;

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

      const modal = F.select(`.${MODAL_CLS}`);

      if (modal.dom) {
        modal.css('display', 'none');
      }

      let i = 0,
        iL = me.items.length;

      for (; i < iL; i++){
        if (me.items[i].type === 'combo'){
          me.items[i].hideList();
        }
      }
    },
    /*
     * @param {Number} height
     */
    setHeight(height){
      const me = this;

      if (me.panel) {
        me.panel.css('height', height);

        if (me.buttons) {
          height -= me.buttonsHeight || me.barHeight;
        }

        if (me.bbar) {
          height -= me.bbarHeight || me.barHeight;
        }

        if (me.tbar || me.tabs) {
          height -= me.tbarHeight || me.barHeight;
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
    setWidth(value){
      const me = this;

      if (me.panel) {
        me.panel.css('width', value);

        value -= me.panelBodyBorders[1];
        value -= me.panelBodyBorders[3];
      }

      me.css('width', value);

      const inLineFields = {};

      F.each(me.items, item => {
        if (item.lineName) {
          inLineFields[item.lineName] = inLineFields[item.lineName] || [];
          inLineFields[item.lineName].push(item);
          return;
        }

        let _value;switch(item.type){
          case 'line':
            _value = value;
            var lineFieldNumber = 0,
              _itemsWidth = 0;

            _value -= parseInt(item.css('margin-left'));
            _value -= parseInt(item.css('margin-right'));

            F.each(item.items, _item => {
              switch (_item.type) {
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
            _value = value;

            _value -= parseInt(item.css('margin-left'));
            _value -= parseInt(item.css('margin-right'));

            item.setWidth(_value);
        }
      });

      F.each(inLineFields, lineFields => {
        var widths = [],
          _value = value,
          totalWidth = 0;

        F.each(lineFields, (item, i) => {
          const width = parseInt(item.el.css('width'));

          _value -= parseInt(item.css('padding-left'));

          if(i === lineFields.length - 1){
            _value -= parseInt(item.css('padding-right'));
          }

          switch (item.type) {
            case 'button':
              _value -= width;
              return;
            case 'textarea':
              //_value -= parseInt(item.css('padding-right'));
              break;
          }

          totalWidth += width;

          widths.push(width);
        });

        var _lineFields = [];

        F.each(lineFields, item => {
          switch (item.type) {
            case 'button':
              break;
            default:
              _lineFields.push(item);
          }
        });

        const percent = totalWidth / 100,
          newPercent = _value / 100;

        F.each(widths, (value, i) => {
          const percents = value / percent,
            newValue = percents * newPercent,
            item = _lineFields[i];

          item.setWidth(newValue);
        });
      });
    },
    /*
     * @return {Number}
     */
    getHeight(){
      const panel = this.panel;

      if (panel){
        return panel.getHeight();
      }

      return parseInt(this.css('height'));
    },
    /*
     * @return {Number}
     */
    getWidth(){
      let me = this,
        value;

      if (me.panel){
        value = parseInt(me.panel.css('width'));
      }
      else {
        value = parseInt(me.css('width'));
      }

      return value;
    },
    /*
     *
     */
    calcFieldSize(){
      var me = this,
        width = me.width,
        defaults = me.defaults || {},
        labelWidth,
        maxLabelNumber = me.maxLabelNumber;

      defaults.width = width - me.panelBorderWidth * 2;

      F.each(me.items, item => {
        switch (item.type) {
          case 'set':
          case 'tab':
            if (item.type === 'tab') {
              me.tabbed = true;
            }

            const minusWidth = item.type === 'set' ? 62 : 20;

            F.each(item.items, _item => {
              _item.width === undefined && (_item.width = width - minusWidth);

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

            F.each(item.items, _item => {
              if(_item.label === undefined && _item.labelAlign !== 'top'){
                _item.label = false;
              }

              if(_item.width){
                avaliableWidth -= _item.width;
                numOfFields--;
              }
            });

            averageWidth = (avaliableWidth - 8 - 8 - 8) / numOfFields;

            F.each(item.items, _item => {
              if (!_item.width) {
                _item.width = averageWidth;
              }
              else{
                //isWidthInit = true;
              }

              if (_item.labelWidth || _item.inputWidth){
                isWidthInit = true;
              }
            });

            if (isWidthInit === false){
              F.each(item.items, _item => {
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
            if (item.defaults.labelWidth === undefined){
              item.defaults.labelWidth = me.labelWidth;
            }
            break;
          default:
            if (item.label && item.label.length > maxLabelNumber){
              maxLabelNumber = item.label.length;
            }
        }
      });

      maxLabelNumber++;

      labelWidth = maxLabelNumber * 6;
      if (labelWidth < 80){
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
    destroy(){
      const me = this;

      me.el.destroy();

      if (me.panel) {
        me.panel.el.destroy();
      }
    },
    /*
     * @param {Function} fn
     * @param {Object} scope
     */
    each(fn, scope){
      let me = this,
        items = me.items,
        i = 0,
        iL = items.length;

      if (scope) {
        for (; i < iL; i++) {
          fn.apply(this, [items[i]]);
        }
      }
      else {
        for (; i < iL; i++){
          fn(items[i]);
        }
      }
    },
    /*
     *
     */
    loadModules(){
      const me = this,
        existedModules = F.modules || {},
        requiredModules = {},
        fields = me.items || [];

      F.modules = existedModules;

      if (F.nojQuery){
        requiredModules.dom = true;
      }

      if (F.isTouch){
        requiredModules.touch = true;
      }

      let i = 0,
        iL = fields.length;

      for (; i < iL; i++) {
        const field = fields[i];
        if (field.type === 'date'){
          requiredModules.grid = true;
          requiredModules.selection = true;
          requiredModules.date = true;
        }

        if (field.items){
          let j = 0,
            jL = field.items.length;

          for (; j < jL; j++){
            const _field = field.items[j];

            if (_field.type === 'date'){
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

      for (var p in requiredModules){
        if (F.modules[p] === undefined){
          me.neededModules[p] = true;
          me.neededModules.length++;
        }
      }

      if (me.neededModules.length === 0){
        me.neededModules = true;
        me.init();
        return;
      }

      const onLoad = function (name) {
        delete me.neededModules[name];
        me.neededModules.length--;

        if (me.neededModules.length === 0) {
          me.neededModules = true;
          me.init();
        }
      };

      for (var p in me.neededModules){
        if (p === 'length'){
          continue;
        }

        F.loadModule(p, onLoad);
      }
    },
    /*
     *
     */
    prevTab(){
      const me = this;

      me.activeTab--;
      if (me.activeTab < 0) {
        me.activeTab = 0;
      }

      me.setActiveTab();
    },
    /*
     *
     */
    nextTab(){
      const me = this,
        tabNumber = me.el.select(`.${FIELD_TAB_CLS}`).length;

      me.activeTab++;

      if (me.activeTab >= tabNumber) {
        me.activeTab = tabNumber - 1;
      }

      me.setActiveTab();
    },
    onWindowResize(){
      let me = this,
        renderTo = me.renderTo,
        el;

      if (me.panel) {
        renderTo = me.panel.renderTo;
      }

      if (me.responsive) {
        el = F.get(renderTo);
      }
      else if(me.panel) {
        el = me.panel.el;
      }
      else{
        el = F.get(renderTo);
      }

      if(el.hasClass(PANEL_CLS) || el.hasClass(FORM_CLS)){
        el = el.parent();
      }

      let newWidth = el.width();

      if (el.dom === undefined) {
        return;
      }

      if (newWidth === 0) {
        newWidth = el.parent().width();
      }

      if(me.responsive){
        me.setWidth(newWidth);
      }
    },
    /*
     * @param {String} bar
     */
    hideBar(bar){
      let me = this,
        barCls,
        barEl;

      switch (bar) {
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
          throw new Error('[FancyGrid Error]: bar does not exist');
      }

      barEl = me.panel.el.select('.' + barCls);

      if (barEl.css('display') !== 'none') {
        barEl.hide();

        const panelHeight = parseInt(me.panel.el.css('height'));
        me.panel.el.css('height', panelHeight - me.barHeight);
      }
    },
    /*
     * @param {String} bar
     */
    showBar(bar){
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
          throw new Error('[FancyGrid Error]: bar does not exist');
      }

      barEl = me.panel.el.select(`.${barCls}`);

      if(barEl.css('display') == 'none'){
        barEl.show();

        const panelHeight = parseInt(me.panel.el.css('height'));
        me.panel.el.css('height', panelHeight + me.barHeight);
      }
    },
    /*
     *
     */
    $prepareTabs(){
      let me = this,
        i = 0,
        tabIndex = 0;

      F.each(me.items, item => {
        me.$tabs[tabIndex][i] = item;
        i++;

        if(!me.$tabs[tabIndex][i]){
          i = 0;
          tabIndex++;
        }
      });
    },
    /*
     * @param {String|Number} name
     */
    remove(name){
      let me = this,
        itemInfo;
      //itemInfo = me.getItem(name, true);

      if(F.isString(name)){
        itemInfo = me.getItem(name, true);
      }
      else{
        itemInfo = {
          item: me.items[name],
          order: name
        };
      }

      itemInfo.item.destroy();
      me.items.splice(itemInfo.order, 1);
    },
    /*
     *
     */
    checkScroll(){
      let me = this,
        bodyEl = me.el.select(`.${FORM_BODY_CLS}`).item(0),
        availableHeight = parseInt(bodyEl.css('height')),
        fieldsHeight = 0;

      F.each(me.items, item => {
        fieldsHeight += parseInt(item.css('height'));
      });

      if (availableHeight < fieldsHeight) {
        bodyEl.css({
          'overflow-y': 'scroll',
          'overflow-x': 'hidden'
        });
      }
    }
  });

})();
/*
 * @mixin Fancy.form.mixin.PrepareConfig
 */
Fancy.Mixin('Fancy.form.mixin.PrepareConfig', {
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfig(config, originalConfig){
    const me = this;

    if (config.renderOuter) {
      config.renderTo = config.renderOuter;
    }

    config = me.prepareConfigTheme(config, originalConfig);
    config = me.prepareConfigSize(config, originalConfig);
    config = me.prepareConfigLang(config, originalConfig);
    config = me.prepareConfigBars(config, originalConfig);
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
  prepareConfigSize(config) {
    let el,
      me = this,
      renderTo = config.renderTo;

    if(config.width === undefined){
      if (renderTo){
        config.responsive = true;
        el = Fancy.get(renderTo);

        config.width = parseInt(el.width());
      }
    }

    if(config.height === undefined){

    }
    else if(config.height === 'fit'){
      setTimeout(() => {
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
  prepareConfigDefaults(config){
    if( config.defaults ){
      for(const p in config.defaults){
        Fancy.each(config.items, item => {
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
  prepareConfigBars(config){
    const fn = function (bar) {
      var i = 0,
        iL = bar.length;

      for (; i < iL; i++) {
        switch (bar[i].type) {
          case 'date':
            if (!bar[i].format) {
              var date = config.lang.date;
              bar[i].format = {
                read: date.read,
                write: date.write,
                edit: date.edit
              };
            }

            if (config.i18n) {
              bar[i].i18n = config.i18n;
            }
            break;
        }
      }
    };

    fn(config.tbar || []);
    fn(config.subTBar || []);
    fn(config.bbar || []);
    fn(config.buttons || []);

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigItems(config){
    const me = this,
      fn = function (item) {
        item.theme = me.theme || '';

        if (item.labelWidth === undefined) {
          item.labelWidth = me.labelWidth;
        }

        if (item.inputWidth === undefined) {
          item.inputWidth = me.inputWidth;
        }

        if (item.type === 'pass' || item.type === 'password') {
          item.type = 'string';
          item.isPassword = true;
        }

        if (item.items) {
          Fancy.each(item.items, fn);
        }
      };

    Fancy.each(config.items, fn);

    return config;
  },
  /*
   *
   */
  setHeightFit(){
    const me = this,
      isPanel = !!(me.title || me.subTitle || me.tbar || me.bbar || me.buttons || me.panel),
      panelBodyBorders = me.panelBodyBorders,
      gridWithoutPanelBorders = me.gridWithoutPanelBorders,
      gridBorders = me.gridBorders;

    me.heightFit = true;

    let height = me.fieldHeight;
    let items = me.items;

    if(me.$tabs){
      var activeTab = me.activeTab || 0;

      items = me.$tabs[activeTab];
    }

    Fancy.each(items, field => {
      if (field.hidden) {}
      else{
        height += parseInt(field.css('height'));
      }
    });

    if (me.title) {
      height += me.titleHeight;
    }

    if (me.tbar || me.tabs) {
      height += me.tbarHeight || me.barHeight;
    }

    if(me.bbar){
      height += me.bbarHeight || me.barHeight;
    }

    if(me.buttons){
      height += me.buttonsHeight || me.barHeight;
    }

    if(me.subTBar){
      height += me.subTBarHeight || me.barHeight;
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
  onChangeTab(){
    this.setHeightFit();
  }
});
/*
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
  init(){
    const me = this;

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

      if (i === 0) {
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
});
/*
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
  init(){
    const me = this;

    me.addEvents('beforecollapse', 'collapse', 'expanded', 'expand', 'beforeexpand', 'beforeexpanded');

    me.Super('init', arguments);

    Fancy.each(me.items, (item, i) => {
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
  initCheckBox() {
    const me = this,
      checkbox = me.el.select('.fancy-field-checkbox-input');

    checkbox.css('display', '');

    if( me.checkbox === true ){
      me.addCls('fancy-checkbox-on');
    }

    const itemsEl = me.el.select('.fancy-field-set-items');

    setTimeout(() => {
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

      const isChecked = me.el.hasCls('fancy-checkbox-on'),
        itemsEl = me.el.select('.fancy-field-set-items');

      if (isChecked) {
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
  onBeforeCollapsed(){
    const me = this,
      form = me.form,
      itemsEl = me.el.select('.fancy-field-set-items'),
      itemsHeight = parseInt(itemsEl.css('height'));

    form.setHeight(form.getHeight() - itemsHeight);
  },
  /*
   *
   */
  onExpanded(){
    const me = this,
      form = me.form,
      itemsEl = me.el.select('.fancy-field-set-items'),
      itemsHeight = parseInt(itemsEl.css('height'));

    form.setHeight(form.getHeight() + itemsHeight);
  }
});
/*
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
  init(){
    const me = this;

    me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'esc', 'change', 'key');

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
  render(){
    const me = this,
      renderTo = me.renderTo || document.body,
      el = Fancy.newDomEl('div');

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
  set(value, onInput){
    const me = this;

    me.el.firstChild().update(value);
    if(onInput !== false){
      me.onInput();
    }
  },
  /*
   * @return {String}
   */
  get() {
    return this.el.firstChild().dom.innerHTML;
  }
});
/**
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
  init(){
    const me = this;

    me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'esc', 'change', 'key');

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

    const s = document.createElement('script');

    s.type = 'text/javascript';
    s.src = 'https://www.google.com/recaptcha/api.js';

    Fancy.get(document.head).append(s);
  },
  /*
   * @return {'wait'|*}
   */
  get(){
    const me = this,
      formReCaptchaEl = me.el.select('form');

    if (me.value) {
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
