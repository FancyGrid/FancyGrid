/**
 * @class Fancy.Combo
 * @extends Fancy.Widget
 *
 * Note: because multiselection code became overcomplex
 */
(function(){
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var FIELD_CLS = F.FIELD_CLS;
  var FIELD_COMBO_CLS = F.FIELD_COMBO_CLS;
  var FIELD_COMBO_SELECTED_ITEM_CLS = 'fancy-combo-item-selected';
  var FIELD_COMBO_FOCUSED_ITEM_CLS = 'fancy-combo-item-focused';
  var FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  var FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;
  var CLEARFIX_CLS = F.CLEARFIX_CLS;
  var FIELD_ERROR_CLS = F.FIELD_ERROR_CLS;
  var FIELD_TEXT_INPUT_CLS = F.FIELD_TEXT_INPUT_CLS;

  F.define('Fancy.combo.Manager', {
    singleton: true,
    opened: [],
    add: function(combo){
      this.hideLists();

      this.opened.push(combo);
    },
    hideLists: function(){
      F.each(this.opened, function(item){
        item.hideList();
        item.hideAheadList();
      });

      this.opened = [];
    }
  });

  F.define(['Fancy.form.field.Combo', 'Fancy.Combo'], {
    type: 'field.combo',
    mixins: [
      F.form.field.Mixin
    ],
    extend: F.Widget,
    selectedItemCls: FIELD_COMBO_SELECTED_ITEM_CLS,
    focusedItemCls: FIELD_COMBO_FOCUSED_ITEM_CLS,
    fieldCls: FIELD_CLS + ' ' + FIELD_COMBO_CLS,
    width: 250,
    labelWidth: 60,
    listRowHeight: 25,
    dropButtonWidth: 27,
    leftWidth: 20,
    emptyText: '',
    editable: true,
    typeAhead: true, // not right name
    readerRootProperty: 'data',
    valueKey: 'value',
    displayKey: 'text',
    multiSelect: false,
    itemCheckBox: false,
    listCls: '',
    tpl: [
      '<div class="' + FIELD_LABEL_CLS + '" style="{labelWidth}{labelDisplay}">',
        '{label}',
      '</div>',
      '<div class="' + FIELD_TEXT_CLS + '">',
        '<div class="fancy-combo-input-container" style="{inputWidth}{inputHeight}">',
          '<div class="fancy-combo-left-el" style="{inputHeight}cursor:default;">&nbsp;</div>',
          '<input placeholder="{emptyText}" class="' + FIELD_TEXT_INPUT_CLS + '" style="{inputHeight}cursor:default;" value="{value}">',
          '<div class="fancy-combo-dropdown-button">&nbsp;</div>',
        '</div>',
      '</div>',
      '<div class="' + FIELD_ERROR_CLS + '" style="{errorTextStyle}"></div>',
      '<div class="' + CLEARFIX_CLS + '"></div>'
    ],
    /*
     * @constructor
     */
    constructor: function () {
      this.tags = this.tags || [];
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents(
        'focus', 'blur', 'input',
        'up', 'down', 'change', 'key', 'enter', 'esc',
        'empty',
        'load'
      );
      me.Super('init', arguments);

      if (!me.loadListData()) {
        me.data = me.configData(me.data);
      }

      if(me.multiSelect && me.data.length){
        me.initMultiSelect();
      }

      me.preRender();
      me.render();

      me.ons();

      me.applyStyle();
      me.applyTheme();

      /*
       * Bug fix: #1074
       */
      setTimeout(function () {
        me.applyTheme();
      }, 1);
    },
    /*
     * @return {Boolean}
     */
    loadListData: function () {
      var me = this;

      if (!F.isObject(me.data)) {
        return false;
      }

      var proxy = me.data.proxy,
        readerRootProperty = me.readerRootProperty;

      if (!proxy || !proxy.url) {
        throw new Error('[FancyGrid Error]: combo data url is not defined');
      }

      if (proxy.reader && proxy.reader.root) {
        readerRootProperty = proxy.reader.root;
      }

      F.Ajax({
        url: proxy.url,
        params: proxy.params || {},
        method: proxy.method || 'GET',
        getJSON: true,
        success: function (o) {
          me.data = me.configData(o[readerRootProperty]);
          me.renderList();
          me.onsList();

          if(me.multiSelect){
            me.initMultiSelect();

            if(me.value){
              me.updateInput();
            }
          }
          else if (me.value) {
            var displayValue = me.getDisplayValue(me.value);

            if (displayValue) {
              me.input.dom.value = displayValue;
            }
          }

          me.fire('load');
        }
      });

      return true;
    },
    /*
     * @param {Array} data
     * @return {Array}
     */
    configData: function (data) {
      if (F.isObject(data) || data.length === 0) {
        return data;
      }

      if (!F.isObject(data[0])) {
        var _data = [],
          i = 0,
          iL = data.length;

        for (; i < iL; i++) {
          _data.push({
            text: data[i],
            value: i
          });
        }

        return _data;
      }

      return data;
    },
    /*
     *
     */
    applyStyle: function () {
      var me = this;

      if (me.hidden) {
        me.css('display', 'none');
      }

      if (me.style) {
        me.css(me.style);
      }
    },
    /*
     *
     */
    applyTheme: function () {
      var me = this;

      if (me.theme && me.theme !== 'default') {
        me.addCls('fancy-theme-' + me.theme);
        me.list.addCls('fancy-theme-' + me.theme);

        if(me.aheadList){
          me.aheadList.addCls('fancy-theme-' + me.theme);
        }
      }
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        drop = me.el.select('.fancy-combo-dropdown-button');

      me.input = me.el.getByTag('input');
      me.inputContainer = me.el.select('.fancy-combo-input-container');
      me.drop = drop;

      me.onsList();

      me.input.on('mousedown', me.onInputMouseDown, me);
      me.input.on('click', me.onInputClick, me);
      drop.on('mousedown', me.onDropMouseDown, me);
      drop.on('click', me.onDropClick, me);

      if (me.typeAhead && me.editable) {
        me.input.on('keydown', me.onKeyDown, me);
      }

      me.on('esc', me.onEsc, me);
      me.on('enter', me.onEnter, me);
      me.on('up', me.onUp, me);
      me.on('down', me.onDown, me);
    },
    /*
     * @param {Object} e
     */
    onKeyDown: function (e) {
      var me = this,
        keyCode = e.keyCode,
        key = F.key;

      switch (keyCode) {
        case key.ESC:
          me.fire('esc', e);
          break;
        case key.ENTER:
          me.fire('enter', e);
          break;
        case key.UP:
          me.fire('up', e);
          break;
        case key.DOWN:
          me.fire('down', e);
          break;
        case key.TAB:
          break;
        case key.BACKSPACE:
          setTimeout(function () {
            if (me.input.dom.value.length === 0) {
              me.value = -1;
              me.valueIndex = -1;
              me.hideAheadList();

              if (me.multiSelect) {
                me.values = [];
                me.clearListActive();
              }

              me.fire('empty');
            }
            else {
              if(me.multiSelect){
                if(me.input.dom.value.split(',').length !== me.valuesIndex.length){
                  var newValues = me.getFromInput();

                  me.set(newValues);
                }
              }

              if (me.generateAheadData().length === 0) {
                me.hideAheadList();
                return;
              }

              me.renderAheadList();
              me.showAheadList();
            }
          }, 100);
          break;
        default:
          setTimeout(function () {
            if (me.generateAheadData().length === 0) {
              me.hideAheadList();
              return;
            }

            me.renderAheadList();
            me.showAheadList();
          }, 1);
      }
    },
    /*
     * @param {Object} e
     */
    onInputClick: function (e) {
      var me = this,
        list = me.list;

      if (me.editable === true) {
        return;
      }

      if (list.css('display') === 'none') {
        me.showList();
      }
      else {
        me.hideList();
      }
    },
    /*
     * @param {Object} e
     */
    onDropClick: function (e) {
      var me = this,
        list = me.list;

      if (list.css('display') === 'none') {
        F.combo.Manager.add(this);
        
        me.showList();
      }
      else {
        me.hideList();
      }

      if (me.editable === true) {
        me.input.focus();
      }
    },
    /*
     *
     */
    showList: function () {
      var me = this,
        list = me.list,
        el = me.input.parent().parent(),
        p = el.$dom.offset(),
        xy = [p.left, p.top + el.$dom.height()],
        docEl = F.get(document),
        selectedItemCls = me.selectedItemCls,
        focusedItemCls = me.focusedItemCls;

      me.hideAheadList();

      if (!me.list) {
        return;
      }

      list.css({
        display: '',
        left: xy[0] + 'px',
        top: xy[1] + 3 + 'px',
        opacity: 0,
        width: me.getListWidth(),
        "z-index": 2000 + F.zIndex++
      });

      if(me.listCls){
        list.addCls(me.listCls);
      }

      list.animate({
        opacity: 1,
        top: xy[1]
      }, F.ANIMATE_DURATION);

      var index;

      me.clearFocused();

      var selected = list.select('.' + selectedItemCls);

      if (selected.length === 0) {
        if(me.multiSelect && me.values.length){
          me.valuesIndex.each(function (i, value, length) {
            if(index === undefined){
              index = i;
            }

            list.select('li').item(i).addCls(selectedItemCls);
          });
        }
        else {
          index = 0;
        }
      }
      else {
        if(me.multiSelect && selected.length !== me.valuesIndex.length){
          list.select('.' + selectedItemCls).removeCls(selectedItemCls);

          me.valuesIndex.each(function (i, value, length) {
            if(index === undefined){
              index = i;
            }
            list.select('li').item(i).addCls(selectedItemCls);
          });
        }

        index = selected.item(0).index();
      }

      if(index === -1){
        index = 0;
      }

      list.select('li').item(index).addCls(focusedItemCls);
      me.scrollToListItem(index);

      if (!me.docSpy) {
        me.docSpy = true;
        docEl.on('click', me.onDocClick, me);
      }
    },
    /*
     *
     */
    showAheadList: function () {
      var me = this,
        list = me.aheadList,
        el = me.input.parent().parent(),
        p = el.$dom.offset(),
        xy = [p.left, p.top + el.$dom.height()],
        docEl = F.get(document);

      me.hideList();

      if (!list) {
        return;
      }

      list.css({
        display: '',
        left: xy[0] + 'px',
        top: xy[1] + 'px',
        width: me.getListWidth(),
        "z-index": 2000 + F.zIndex++
      });

      if (!me.docSpy2) {
        me.docSpy2 = true;
        docEl.on('click', me.onDocClick, me);
      }
    },
    /*
     * @param {Object} e
     */
    onDocClick: function (e) {
      var me = this;

      if (me.input.parent().parent().within(e.target) === false) {
        if (me.list.within(e.target) === true) {
          return;
        }
        me.hideList();
        me.hideAheadList();
      }
    },
    /*
     *
     */
    hideList: function () {
      var me = this;

      if (!me.list) {
        return;
      }

      me.list.css('display', 'none');

      if (me.docSpy) {
        var docEl = F.get(document);
        me.docSpy = false;
        docEl.un('click', me.onDocClick, me);
      }
    },
    /*
     *
     */
    hideAheadList: function () {
      var me = this;

      if (!me.aheadList) {
        return;
      }

      me.aheadList.css('display', 'none');

      if (me.docSpy) {
        var docEl = F.get(document);
        me.docSpy = false;
        docEl.un('click', me.onDocClick, me);
      }
    },
    /*
     * @param {Object} e
     */
    onInputMouseDown: function (e) {
      if (this.editable === false) {
        e.preventDefault();
      }
    },
    /*
     * @param {Object} e
     */
    onDropMouseDown: function (e) {
      e.preventDefault();
    },
    /*
     *
     */
    onsList: function () {
      var me = this;

      me.list.on('click', me.onListItemClick, me, 'li');
      me.list.on('mouseenter', me.onListItemOver, me, 'li');
      me.list.on('mouseleave', me.onListItemLeave, me, 'li');
    },
    /*
     *
     */
    onsAheadList: function () {
      var me = this;

      me.aheadList.on('click', me.onListItemClick, me, 'li');
    },
    /*
     * @param {Object} e
     */
    onListItemOver: function (e) {
      var li = F.get(e.target);

      li.addCls(this.focusedItemCls);
    },
    /*
     *
     */
    onListItemLeave: function () {
      this.clearFocused();
    },
    /*
     * @param {Object} e
     */
    onListItemClick: function (e) {
      var me = this,
        li = F.get(e.currentTarget),
        value = li.attr('value'),
        selectedItemCls = me.selectedItemCls,
        focusedItemCls = me.focusedItemCls;

      if (F.nojQuery && value === 0) {
        value = '';
      }

      if (me.multiSelect) {
        if (me.values.length === 0) {
          me.clearListActive();
        }

        me.clearFocused();

        li.toggleCls(selectedItemCls);

        if (li.hasCls(selectedItemCls)) {
          me.addValue(value);
          li.addCls(focusedItemCls);
        }
        else {
          me.removeValue(value);
          me.clearFocused()
        }

        me.updateInput();
      }
      else {
        me.set(value);
        me.hideList();
      }

      if (me.editable) {
        me.input.focus();
      }
      else {
        me.onBlur();
      }
    },
    /*
     * @param {*} value
     * @param {Boolean} onInput
     */
    set: function (value, onInput) {
      var me = this,
        valueStr = '',
        index;

      if(me.multiSelect && !F.isArray(value)){
        if(value === -1){
          value = [];
        }
        else {
          value = [value];
        }
      }

      if(F.isArray(value) && me.multiSelect){
        var displayedValues = [];

        me.valuesIndex.removeAll();

        F.each(value, function(v, i){
          var _index = me.getIndex(v);

          if(_index === -1){
            return;
          }

          me.valuesIndex.add(_index, value[i]);

          displayedValues.push(me.data[_index][me.displayKey]);

          valueStr = displayedValues.join(', ');
        });

        me.values = value;
        index = me.getIndex(value[0]);
        me.value = value[0];
        me.valueIndex = index;
      }
      else{
        index = me.getIndex(value);

        if(index !== -1) {
          me.valueIndex = index;
          valueStr = me.data[index][me.displayKey];
          me.selectItem(index);
        }
        else{
          if (value !== -1 && value && value.length > 0) {
            valueStr = '';
            //valueStr = value;
            me.value = -1;
            me.valueIndex = -1;
          }
          else {
            valueStr = '';
          }
        }

        me.value = value;
      }

      me.input.dom.value = valueStr;

      if (onInput !== false) {
        me.onInput();
      }

      if(me.left){
        me.updateLeft();
      }
    },
    /*
     * Method used only for multiSelect
     *
     * @param {*} v
     */
    addValue: function(v){
      var me = this,
        index = me.getIndex(v);

      if(index !== -1 && !me.valuesIndex.get(index)){
        me.value = v;
        me.values.push(v);
        me.valuesIndex.add(index, v);
      }
    },
    /*
     * Method used only for multiSelect
     *
     * @param {*} v
     */
    removeValue: function(v){
      var me = this,
        index = -1;

      F.each(me.values, function(value, i){
        if( value === v ){
          index = i;
        }
      });

      if(index !== -1) {
        me.values.splice(index, 1);
        me.valuesIndex.remove(me.getIndex(v));
      }

      if (me.values.length) {
        me.value = me.values[me.values.length - 1];
      }
      else {
        me.value = -1;
        me.valueIndex = -1;
      }
    },
    /*
     * Method used only for multiSelect
     *
     * @param {Boolean} onInput
     */
    updateInput: function(onInput){
      var me = this,
        displayValues = [];

      me.valuesIndex.each(function (i, v, length) {
        displayValues.push(me.data[i][me.displayKey]);
      });

      me.input.dom.value = displayValues.join(", ");

      if (onInput !== false) {
        me.onInput();
      }
    },
    /*
     * @param {Number} index
     */
    selectItem: function(index){
      var me = this;

      if (!me.list) {
        return;
      }

      if (!me.multiSelect) {
        me.clearListActive();
      }

      me.clearFocused();

      var item = me.list.select('li').item(index);

      item.addCls(me.focusedItemCls, me.selectedItemCls);
    },
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = F.get(me.renderTo || document.body).dom,
        el = F.get(document.createElement('div')),
        value = me.value,
        index = -1;

      el.attr('id', me.id);

      if (value === undefined) {
        value = '';
      }
      else {
        if(me.multiSelect && F.isArray(me.data) && me.data.length > 0){
          value = '';

          me.valuesIndex.each(function(i, v){
            if(index === -1){
              index = i;
              me.valueIndex = i;
            }

            value += me.data[i][me.displayKey] + ', ';
          });

          value = value.replace(/, $/, '');
        }
        else {
          index = me.getIndex(value);

          if (index !== -1) {
            me.valueIndex = index;
            value = me.data[index][me.displayKey];
          }
          else {
            value = '';
          }
        }
      }

      me.fire('beforerender');
      el.addCls(
        F.cls,
        me.cls,
        me.fieldCls
      );

      var labelWidth = '';

      if (me.labelWidth) {
        labelWidth = 'width:' + me.labelWidth + 'px;';
      }

      var label = me.label;

      if (me.label === '') {
        label = '&nbsp;';
      }
      else if (me.label === undefined) {
        label = '&nbsp;';
      }
      else if (me.labelAlign !== 'right') {
        label += ':';
      }

      el.update(me.tpl.getHTML({
        labelWidth: labelWidth,
        labelDisplay: me.label === false ? 'display: none;' : '',
        label: label === false ? '' : label,
        emptyText: me.emptyText,
        inputHeight: 'height:' + me.inputHeight + 'px;',
        value: value
      }));

      me.el = el;
      me.setStyle();

      me.input = me.el.getByTag('input');
      me.inputContainer = me.el.select('.fancy-combo-input-container');
      me.drop = me.el.select('.fancy-combo-dropdown-button');

      if(me.leftTpl){
        me.left = me.el.select('.fancy-combo-left-el');

        me.left.css({
          display: 'block',
          width: me.leftWidth
        });

        if(value){
          me.updateLeft();
        }

      }

      me.setSize();
      renderTo.appendChild(el.dom);

      if (me.labelAlign === 'top') {
        me.el.addCls('fancy-field-label-align-top');
      }
      else if (me.labelAlign === 'right') {
        me.el.addCls('fancy-field-label-align-right');
        F.$(el.dom).find('.fancy-field-label').insertAfter(F.$(el.dom).find('.fancy-field-text'));
      }

      if (me.valueIndex) {
        me.acceptedValue = me.value;
      }

      if (me.editable) {
        me.input.css('cursor', 'auto');
      }

      me.renderList();

      me.fire('afterrender');
      me.fire('render');
    },
    /*
     *
     */
    renderList: function () {
      var me = this,
        list = F.get(document.createElement('div')),
        listHtml = [
          '<ul style="position: relative;">'
        ];

      if (me.list) {
        me.list.destroy();
      }

      F.each(me.data, function (row, i) {
        var isActive = '',
          displayValue = row[me.displayKey],
          value = row[me.valueKey];

        if (me.value === value) {
          isActive = me.selectedItemCls;
        }

        if (displayValue === '' || displayValue === ' ') {
          displayValue = '&nbsp;';
        }
        else if (me.listItemTpl) {
          var listTpl = new F.Template(me.listItemTpl);
          displayValue = listTpl.getHTML(row);
        }

        if (me.multiSelect && me.itemCheckBox) {
          listHtml.push('<li value="' + value + '" class="' + isActive + '"><div class="fancy-field-checkbox-input" style=""></div><span class="fancy-combo-list-value">' + displayValue + '</span></li>');
        }
        else {
          listHtml.push('<li value="' + value + '" class="' + isActive + '"><span class="fancy-combo-list-value">' + displayValue + '</span></li>');
        }
      });

      listHtml.push('</ul>');

      list.addCls('fancy fancy-combo-result-list');
      list.update(listHtml.join(""));

      list.css({
        display: 'none',
        left: '0px',
        top: '0px',
        width: me.getListWidth()
      });

      if (me.data.length > 9) {
        list.css({
          height: me.listRowHeight * 9 + 'px',
          overflow: 'auto'
        });
      }

      document.body.appendChild(list.dom);
      me.list = list;
    },
    /*
     * @return {Number}
     */
    getListWidth: function(){
      var me = this,
        el,
        listWidth = me.inputWidth + 14,
        minListWidth = me.minListWidth;

      if (me.input) {
        el = me.input.parent().parent();
        listWidth = el.width();
      }

      if (minListWidth && minListWidth > listWidth) {
        listWidth = minListWidth;
      }

      return listWidth;
    },
    /*
     * @return {Array}
     */
    generateAheadData: function(){
      var me = this,
        inputValue = me.input.dom.value.toLocaleLowerCase(),
        aheadData = [];

      if (me.multiSelect) {
        var splitted = inputValue.split(', '),
          inputSelection = me.getInputSelection(),
          passedCommas = 0;

        F.each(inputValue, function (v, i) {
          if(inputSelection.start <= i){
            return true;
          }

          if(inputValue[i] === ','){
            passedCommas++;
          }
        });

        inputValue = splitted[passedCommas];
      }

      F.each(me.data, function (item){
        if (new RegExp('^' + inputValue).test(item[me.displayKey].toLocaleLowerCase())) {
          aheadData.push(item);
        }
      });

      if (me.data.length === aheadData.length) {
        aheadData = [];
      }

      me.aheadData = aheadData;

      return aheadData;
    },
    /*
     *
     */
    renderAheadList: function () {
      var me = this,
        list,
        listHtml = [
          '<ul style="position: relative;">'
        ],
        presented = false;

      if (me.aheadList) {
        me.aheadList.firstChild().destroy();
        list = me.aheadList;
        presented = true;
      }
      else {
        list = F.get(document.createElement('div'));
      }

      F.each(me.aheadData, function (row, i) {
        var isActive = '',
          displayValue = row[me.displayKey],
          value = row[me.valueKey];

        if (i === 0) {
          isActive = me.selectedItemCls;
        }

        if (displayValue === '' || displayValue === ' ') {
          displayValue = '&nbsp;';
        }
        else if (me.listItemTpl) {
          var listTpl = new F.Template(me.listItemTpl);
          displayValue = listTpl.getHTML(row);
        }

        listHtml.push('<li value="' + value + '" class="' + isActive + '"><span class="fancy-combo-list-value">' + displayValue + '</span></li>');
      });

      listHtml.push('</ul>');

      list.update(listHtml.join(""));
      list.css({
        display: 'none',
        left: '0px',
        top: '0px',
        width: me.getListWidth()
      });

      list.css({
        'max-height': me.listRowHeight * 9 + 'px',
        overflow: 'auto'
      });

      if (presented === false) {
        list.addClass(F.cls, 'fancy-combo-result-list');
        document.body.appendChild(list.dom);
        me.aheadList = list;

        me.onsAheadList();
      }

      me.applyTheme();
    },
    /*
     *
     */
    hide: function () {
      var me = this;

      me.css('display', 'none');
      me.hideList();
      me.hideAheadList();
    },
    /*
     *
     */
    clear: function () {
      var me = this;

      if(me.multiSelect){
        me.set([], false);
      }
      else {
        me.set(-1, false);
      }
    },
    /*
     *
     */
    clearListActive: function () {
      var me = this,
        selectedItemCls = me.selectedItemCls,
        focusedItemCls = me.focusedItemCls;

      me.list.select('.' + focusedItemCls).removeCls(focusedItemCls);
      me.list.select('.' + selectedItemCls).removeCls(selectedItemCls);
    },
    clearFocused: function () {
      var me = this,
        focusedItemCls = me.focusedItemCls;

      if(me.list) {
        me.list.select('.' + focusedItemCls).removeCls(focusedItemCls);
      }

      if(me.aheadList) {
        me.aheadList.select('.' + focusedItemCls).removeCls(focusedItemCls);
      }
    },
    /*
     *
     */
    onInput: function () {
      var me = this,
        value = me.getValue(),
        oldValue = me.acceptedValue;

      me.acceptedValue = me.get();
      me.fire('change', value, oldValue);

      if(me.left){
        me.updateLeft();
      }
    },
    /*
     * @param {*} value
     * @param {Boolean} onInput
     */
    setValue: function (value, onInput) {
      this.set(value, onInput);
    },
    /*
     * @param {key} value
     * @return {*}
     */
    getDisplayValue: function (value, returnPosition) {
      var me = this,
        index = me.getIndex(value);

      if(returnPosition){
        return index;
      }
      else{
        if(!me.data[index]){
          return '';
        }
        return me.data[index][me.displayKey];
      }
    },
    /*
     * @param {key} value
     * @param {Boolean} [returnPosition]
     */
    getValueKey: function (value, returnPosition) {
      var me = this,
        i = 0,
        iL = me.data.length;

      for(;i<iL;i++){
        if (me.data[i][me.displayKey] === value) {
          if (returnPosition) {
            return i;
          }

          return me.data[i][me.valueKey];
        }
      }
    },
    /*
     * @return {*}
     */
    get: function () {
      return this.getValue();
    },
    /*
     * @return {*}
     */
    getValue: function () {
      var me = this;

      if (me.multiSelect) {
        return me.values;
      }

      if (me.value === -1 || me.value === undefined) {
        if (me.value === -1 && me.input.dom.value) {
          return me.input.dom.value;
        }
        return '';
      }

      if (me.valueKey !== undefined) {
        return me.value;
      }

      return me.value;
    },
    /*
     * @param {Object} o
     */
    size: function (o) {
      var me = this,
        width = o.width,
        height = o.height,
        input = me.input,
        inputContainer = me.inputContainer,
        drop = me.drop;

      if (me.labelAlign !== 'top') {
        me.inputHeight = height;
      }

      if (height !== undefined) {
        me.height = height;
      }

      if (width !== undefined) {
        me.width = width;
      }

      me.calcSize();

      if (me.labelAlign === 'top') {
        me.css({
          height: me.height * 1.5,
          width: me.width
        });
      }
      else {
        me.css({
          height: me.height,
          width: me.width
        });
      }

      var inputWidth = me.inputWidth,
        minusWidth = 2;

      if(me.theme === 'dark'){
        minusWidth = 0;
      }

      var _inputWidth = inputWidth - minusWidth;

      if(me.left){
        _inputWidth -= me.leftWidth;
      }

      input.css({
        width: _inputWidth,
        height: me.inputHeight,
        'margin-left': me.left? me.leftWidth: 0
      });

      inputContainer.css({
        width: inputWidth,
        height: me.inputHeight
      });

      drop.css('height', me.inputHeight);
    },
    /*
     * @param {Object} field
     * @param {Object} e
     */
    onEnter: function (field, e) {
      var me = this,
        list = me.getActiveList(),
        focusedItemCls = me.focusedItemCls,
        selectedItemCls = me.selectedItemCls,
        value;

      if (me.multiSelect) {
        if (!list) {
          return;
        }

        var item = list.select('.' + focusedItemCls);

        if (!item || !item.dom) {
          item = list.select('.' + selectedItemCls).last();
        }

        if (item && item.dom) {
          value = item.attr('value');

          me.addValue(value);

          var position = me.getDisplayValue(value, true);
          me.selectItem(position);

          me.updateInput();
        }
      }
      else if (list) {
        var item = list.select('.' + focusedItemCls);

        if(!item || !item.dom){
          item = list.select('.' + selectedItemCls);
        }

        value = item.attr('value');

        me.set(value);
      }
      else {
        me.set(me.input.dom.value);
      }

      me.hideList();
      me.hideAheadList();
    },
    /*
     * @param {Object} field
     * @param {Object} e
     */
    onEsc: function (field, e) {
      var me = this;

      me.hideList();
      me.hideAheadList();
    },
    /*
     * @param {Object} field
     * @param {Object} e
     */
    onUp: function (field, e) {
      var me = this,
        list = me.getActiveList(),
        focusedItemCls = me.focusedItemCls;

      if (list) {
        e.preventDefault();
        var activeLi = list.select('.' + focusedItemCls),
          notFocused = false;

        if (!activeLi.dom) {
          notFocused = true;
          activeLi = list.lastChild();
        }

        var index = activeLi.index(),
          lis = list.select('li'),
          height = parseInt(list.css('height'));

        if (index !== 0 && !notFocused) {
          index--;
        }
        else {
          index = lis.length - 1;
        }

        var nextActiveLi = lis.item(index),
          top = nextActiveLi.position().top;

        if (top - list.dom.scrollTop > height) {
          list.dom.scrollTop = 10000;
        }
        else if (top - list.dom.scrollTop < 0) {
          list.dom.scrollTop = top;
        }

        me.clearFocused();

        nextActiveLi.addClass(focusedItemCls);
      }
    },
    /*
     * @param {Object} field
     * @param {Object} e
     */
    onDown: function (field, e) {
      var me = this,
        list = me.getActiveList(),
        focusedItemCls = me.focusedItemCls;

      if (list) {
        e.preventDefault();

        var activeLi = list.select('.' + focusedItemCls),
          notFocused = false;

        if (!activeLi.dom) {
          notFocused = true;
          activeLi = list.firstChild();
        }

        var activeLiHeight = parseInt(activeLi.css('height')),
          index = activeLi.index(),
          lis = list.select('li'),
          height = parseInt(list.css('height'));

        if (index !== lis.length - 1 && !notFocused) {
          index++;
        }
        else {
          index = 0;
        }

        var nextActiveLi = lis.item(index),
          top = nextActiveLi.position().top,
          nextActiveLiHeight = parseInt(nextActiveLi.css('height'));

        if (top - list.dom.scrollTop < 0) {
          list.dom.scrollTop = 0;
        }
        else if (top + nextActiveLiHeight + 3 - list.dom.scrollTop > height) {
          list.dom.scrollTop = top - height + activeLiHeight + nextActiveLiHeight;
        }

        me.clearFocused();

        nextActiveLi.addClass(focusedItemCls);
      }
      else {
        me.showList();
      }
    },
    /*
     * @param {Number} index
     */
    scrollToListItem: function (index) {
      var me = this,
        list = me.getActiveList(),
        lis = list.select('li'),
        item = lis.item(index),
        top = item.position().top,
        height = parseInt(list.css('height'));

      if (index === 0) {
        list.dom.scrollTop = 0;
      }
      else if (index === lis.length - 1) {
        list.dom.scrollTop = 10000;
      }
      else {
        list.dom.scrollTop = top;
      }
    },
    /*
     * @return {Fancy.Element}
     */
    getActiveList: function () {
      var me = this,
        list = false;

      if (me.list && me.list.css('display') !== 'none') {
        list = me.list;
      }
      else if (me.aheadList && me.aheadList.css('display') !== 'none') {
        list = me.aheadList;
      }

      return list;
    },
    /*
     *
     */
    initMultiSelect: function () {
      var me = this,
        value = me.value;

      me.values = [];
      me.valuesIndex = new F.Collection();

      if(me.value !== undefined && value !== null && value !== ''){
        if(F.isArray(value)){
          me.values = value;
          me.value = value[0];
        }
        else{
          me.values = [me.value];
        }

        F.each(me.values, function(value){
          me.valuesIndex.add(me.getIndex(value), value);
        });
      }
    },
    /*
     * @param {*} value
     * @return {Number}
     */
    getIndex: function(value){
      var me = this,
        data = me.data,
        i = 0,
        iL = data.length,
        index = -1;

      for(;i<iL;i++){
        if(data[i][me.valueKey] == value) {
          return i;
        }
      }

      return index;
    },
    /*
     * Method used only for multiSelect
     *
     * @return {Array}
     */
    getFromInput: function(){
      var me = this,
        value = me.input.dom.value,
        values = value.split(','),
        _values = [];

      F.each(values, function(v){
        var displayValue = v.replace(/ $/, '').replace(/^ /, ''),
          _value = me.getValueKey(displayValue);

        if(_value){
          _values.push(_value);
        }
      });

      return _values;
    },
    updateLeft: function () {
      var me = this,
        item = me.data[me.getIndex(me.getValue())];

      me.left.update(new F.Template(me.leftTpl).getHTML(item));
    }
  });

})();