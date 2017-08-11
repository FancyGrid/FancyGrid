/**
 * @class Fancy.Combo
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Combo', 'Fancy.Combo'], {
  type: 'field.combo',
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  selectedItemCls: 'fancy-combo-item-selected',
  width: 250,
  labelWidth: 60,
  listRowHeight: 25,
  dropButtonWidth: 27,
  emptyText: '',
  editable: true,
  typeAhead: true, // not right name
  readerRootProperty: 'data',
  valueKey: 'value',
  displayKey: 'text',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
    '<div class="fancy-combo-input-container" style="{inputWidth}{inputHeight}">',
      '<input placeholder="{emptyText}" class="fancy-field-text-input" style="{inputWidth}{inputHeight}cursor:default;" value="{value}">',
      '<div class="fancy-combo-dropdown-button">&nbsp;</div>',
    '</div>',
    '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   * @constructor
   */
  constructor: function(){
    var me = this;

    me.tags = me.tags || [];
    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents(
      'focus', 'blur', 'input',
      'up', 'down', 'change', 'key', 'enter', 'esc',
      'empty',
      'load'
    );
    me.Super('init', arguments);

    if( !me.loadListData() ){
      me.data = me.configData(me.data);
    }

    me.preRender();
    me.render();

    me.ons();

    me.applyStyle();
    me.applyTheme();

    /*
     * Bug fix: #1074
     */
    setTimeout(function(){
      me.applyTheme();
    }, 1)
  },
  /*
   *
   */
  loadListData: function(){
    var me = this;

    if(!Fancy.isObject(me.data)){
      return false;
    }

    var proxy = me.data.proxy,
      readerRootProperty = me.readerRootProperty;

    if(!proxy || !proxy.url){
      throw new Error('[FancyGrid Error]: combo data url is not defined');
    }

    if(proxy.reader && proxy.reader.root){
      readerRootProperty = proxy.reader.root;
    }

    Fancy.Ajax({
      url: proxy.url,
      params: proxy.params || {},
      method: proxy.method || 'GET',
      getJSON: true,
      success: function(o){
        me.data = me.configData(o[readerRootProperty]);
        me.renderList();
        me.onsList();

        if(me.value){
          var displayValue = me.getDisplayValue(me.value);

          if(displayValue){
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
  configData: function(data){
    if(Fancy.isObject(data) || data.length === 0){
      return data;
    }

    if(!Fancy.isObject(data[0])){
      var _data = [],
        i = 0,
        iL = data.length;

      for(;i<iL;i++){
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
  applyStyle: function(){
    var me = this;

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }
  },
  /*
   *
   */
  applyTheme: function(){
    var me = this;

    if( me.theme && me.theme !== 'default' ){
      me.addClass('fancy-theme-' + me.theme);
      me.list.addClass('fancy-theme-' + me.theme);
    }
  },
  fieldCls: 'fancy fancy-field fancy-combo',
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

    if(me.typeAhead && me.editable){
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
  onKeyDown: function(e){
    var me = this,
      keyCode = e.keyCode,
      key = Fancy.key;

    switch(keyCode) {
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
        setTimeout(function(){
          if(me.input.dom.value.length === 0){
            me.fire('empty');
            me.value = -1;
            me.valueIndex = -1;
            //me.set(-1);
            me.hideAheadList();
          }
          else{
            if(me.generateAheadData().length === 0){
              me.hideAheadList();
              return;
            }

            me.renderAheadList();
            me.showAheadList();
          }
        }, 100);
        break;
      default:
        setTimeout(function() {
          if(me.generateAheadData().length === 0){
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
  onInputClick: function(e){
    var me = this,
      list = me.list;

    if(me.editable === true){
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
  onDropClick: function(e){
    var me = this,
      list = me.list;

    if (list.css('display') === 'none') {
      me.showList();
    }
    else {
      me.hideList();
    }

    if(me.editable === true){
      me.input.focus();
    }
  },
  /*
   *
   */
  showList: function(){
    var me = this,
      list = me.list,
      el = me.input.parent().parent(),
      p = el.$dom.offset(),
      xy = [p.left, p.top + el.$dom.height()],
      docEl = Fancy.get(document),
      selectedItemCls = me.selectedItemCls;

    me.hideAheadList();

    if(!me.list){
      return;
    }

    list.css({
      display: '',
      left: xy[0] + 'px',
      top: xy[1] + 'px',
      width: el.width(),
      "z-index": 2000 + Fancy.zIndex++
    });

    var index;

    if( list.select('.' + selectedItemCls).length === 0 ){
      list.select('li').item(0).addClass(selectedItemCls);
      index = 0;
    }
    else{
      index = list.select('.' + selectedItemCls).item(0).index();
    }

    me.scrollToListItem(index);

    if(!me.docSpy){
      me.docSpy = true;
      docEl.on('click', me.onDocClick, me);
    }
  },
  /*
   *
   */
  showAheadList: function(){
    var me = this,
      list = me.aheadList,
      el = me.input.parent().parent(),
      p = el.$dom.offset(),
      xy = [p.left, p.top + el.$dom.height()],
      docEl = Fancy.get(document);

    me.hideList();

    if(!list){
      return;
    }

    list.css({
      display: '',
      left: xy[0] + 'px',
      top: xy[1] + 'px',
      width: el.width(),
      "z-index": 2000 + Fancy.zIndex++
    });

    if(!me.docSpy2){
      me.docSpy2 = true;
      docEl.on('click', me.onDocClick, me);
    }
  },
  /*
   * @param {Object} e
   */
  onDocClick: function(e){
    var me = this;

    if(me.input.parent().parent().within(e.target) === false){
      me.hideList();
      me.hideAheadList();
    }
  },
  /*
   *
   */
  hideList: function(){
    var me = this;

    if(!me.list){
      return;
    }

    me.list.css('display', 'none');

    if(me.docSpy){
      var docEl = Fancy.get(document);
      me.docSpy = false;
      docEl.un('click', me.onDocClick, me);
    }
  },
  /*
   *
   */
  hideAheadList: function(){
    var me = this;

    if(!me.aheadList){
      return;
    }

    me.aheadList.css('display', 'none');

    if(me.docSpy){
      var docEl = Fancy.get(document);
      me.docSpy = false;
      docEl.un('click', me.onDocClick, me);
    }
  },
  /*
   * @param {Object} e
   */
  onInputMouseDown: function(e){
    var me = this;

    if(me.editable === false){
      e.preventDefault();
    }
  },
  /*
   * @param {Object} e
   */
  onDropMouseDown: function(e){
    var me = this;

    e.preventDefault();
  },
  /*
   *
   */
  onsList: function(){
    var me = this;

    me.list.on('click', me.onListItemClick, me, 'li');
  },
  /*
   *
   */
  onsAheadList: function(){
    var me = this;

    me.aheadList.on('click', me.onListItemClick, me, 'li');
  },
  /*
   * @param {Object} e
   */
  onListItemClick: function(e){
    var me = this,
      li = Fancy.get(e.currentTarget),
      value = li.attr('value');

    if(Fancy.nojQuery && value === 0){
      value = '';
    }

    me.set(value);
    me.hideList();

    if(me.editable){
      me.input.focus();
    }
    else{
      me.onBlur();
    }
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  set: function(value, onInput){
    var me = this,
      valueStr = '',
      i = 0,
      iL = me.data.length,
      found = false;

    for(;i<iL;i++){
      if (me.data[i][me.valueKey] == value) {
        me.valueIndex = i;
        valueStr = me.data[i][me.displayKey];
        found = true;
        break;
      }
    }

    me.selectItem(i);

    if (found === false) {
      if(value !== - 1 && value && value.length > 0){
        valueStr = value;
        me.value = -1;
        me.valueIndex = -1;
      }
      else{
        valueStr = '';
      }
    }

    me.input.dom.value = valueStr;
    me.value = value;

    if(onInput !== false){
      me.onInput();
    }
  },
  /*
   * @param {Number} index
   */
  selectItem: function(index){
    var me = this;

    if(!me.list){
      return;
    }

    me.clearListActive();
    me.list.select('li').item(index).addClass(me.selectedItemCls);
  },
  /*
   *
   */
  render: function () {
    var me = this,
      renderTo = Fancy.get(me.renderTo || document.body).dom,
      el = Fancy.get(document.createElement('div')),
      value = me.value;

    el.attr('id', me.id);

    if (value === undefined) {
      value = '';
    }
    else {
      var i = 0,
        iL = me.data.length,
        found = false;

      for (; i < iL; i++) {
        if (me.data[i][me.valueKey] === value) {
          me.valueIndex = i;
          value = me.data[i][me.displayKey];
          found = true;
          break;
        }
      }

      if (found === false) {
        value = '';
      }
    }

    me.fire('beforerender');
    el.addClass( me.cls );
    el.addClass( me.fieldCls );

    var labelWidth = '';

    if (me.labelWidth) {
      labelWidth = 'width:' + me.labelWidth + 'px;';
    }

    var left = me.labelWidth + 8 + 10;

    if (me.labelAlign === 'top') {
      left = 8;
    }

    if (me.labelAlign === 'right') {
      left = 8;
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

    el.update( me.tpl.getHTML({
      labelWidth: labelWidth,
      labelDisplay: me.label === false ? 'display: none;' : '',
      label: label === false ? '' : label,
      emptyText: me.emptyText,
      inputHeight: 'height:' + me.inputHeight + 'px;',
      value: value
    }) );

    me.el = el;
    me.setStyle();

    me.input = me.el.getByTag('input');
    me.inputContainer = me.el.select('.fancy-combo-input-container');
    me.drop = me.el.select('.fancy-combo-dropdown-button');
    me.setSize();
    renderTo.appendChild(el.dom);

    if (me.labelAlign === 'top') {
      me.el.addClass('fancy-field-label-align-top');
    }
    else if (me.labelAlign === 'right') {
      me.el.addClass('fancy-field-label-align-right');
      $(el.dom).find('.fancy-field-label').insertAfter($(el.dom).find('.fancy-field-text'));
    }

    if (me.valueIndex) {
      me.acceptedValue = me.value;
    }

    if(me.editable){
      me.input.css('cursor', 'auto');
    }

    me.renderList();

    me.fire('afterrender');
    me.fire('render');
  },
  /*
   *
   */
  renderList: function(){
    var me = this,
      list = Fancy.get( document.createElement('div')),
      listHtml = [
        '<ul style="position: relative;">'
      ];

    if(me.list){
      me.list.destroy();
    }

    Fancy.each(me.data, function (row, i) {
      var isActive = '',
        displayValue = row[me.displayKey],
        value = row[me.valueKey];

      if (me.value === value) {
        isActive = me.selectedItemCls;
      }

      if (displayValue === '' || displayValue === ' ') {
        displayValue = '&nbsp;';
      }
      else if(me.listItemTpl){
        var listTpl = new Fancy.Template(me.listItemTpl);
        displayValue = listTpl.getHTML(row);
      }

      listHtml.push('<li value="' + value + '" class="' + isActive + '"><span class="fancy-combo-list-value">' + displayValue + '</span></li>');
    });

    listHtml.push('</ul>');

    list.addClass('fancy fancy-combo-result-list');
    list.update( listHtml.join("") );
    list.css({
      display: 'none',
      left: '0px',
      top: '0px',
      width: me.inputWidth + 14
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
   *
   * @return {Array}
   *
   */
  generateAheadData: function(){
    var me = this,
      inputValue = me.input.dom.value.toLocaleLowerCase(),
      data = me.data,
      aheadData = [],
      i = 0,
      iL = data.length;

    for(;i<iL;i++){
      if(new RegExp('^' + inputValue).test(data[i][me.displayKey].toLocaleLowerCase())){
        aheadData.push(data[i]);
      }
    }

    if(me.data.length === aheadData.length){
      aheadData = [];
    }

    me.aheadData = aheadData;

    return aheadData;
  },
  /*
   *
   */
  renderAheadList: function(){
    var me = this,
      list,
      listHtml = [
        '<ul style="position: relative;">'
      ],
      presented = false;

    if(me.aheadList){
      me.aheadList.firstChild().destroy();
      list = me.aheadList;
      presented = true;
    }
    else{
      list = Fancy.get( document.createElement('div'));
    }

    Fancy.each(me.aheadData, function (row, i) {
      var isActive = '',
        displayValue = row[me.displayKey],
        value = row[me.valueKey];

      if (i === 0) {
        isActive = me.selectedItemCls;
      }

      if (displayValue === '' || displayValue === ' ') {
        displayValue = '&nbsp;';
      }

      listHtml.push('<li value="' + value + '" class="' + isActive + '"><span class="fancy-combo-list-value">' + displayValue + '</span></li>');
    });

    listHtml.push('</ul>');

    list.update( listHtml.join("") );
    list.css({
      display: 'none',
      left: '0px',
      top: '0px',
      width: me.inputWidth + 14
    });

    //if (me.aheadData.length > 9) {
      list.css({
        'max-height': me.listRowHeight * 9 + 'px',
        overflow: 'auto'
      });
    //}

    if(presented === false){
      list.addClass('fancy fancy-combo-result-list');
      document.body.appendChild(list.dom);
      me.aheadList = list;

      me.onsAheadList();
    }
  },
  /*
   *
   */
  hide: function(){
    var me = this;

    me.css('display', 'none');
    me.hideList();
    me.hideAheadList();
  },
  /*
   *
   */
  clear: function(){
    var me = this;

    me.set(-1, false);
  },
  /*
   *
   */
  clearListActive: function(){
    var me = this,
      selectedItemCls = me.selectedItemCls;

    me.list.select('.' + selectedItemCls).removeClass(selectedItemCls);
  },
  /*
   *
   */
  onInput: function(){
    var me = this,
      value = me.getValue(),
      oldValue = me.acceptedValue;

    me.acceptedValue = me.get();
    me.fire('change', value, oldValue);
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  setValue: function(value, onInput){
    this.set(value, onInput);
  },
  /*
   * @param {key} value
   * @return {*}
   */
  getDisplayValue: function(value){
    var me = this,
      i = 0,
      iL = me.data.length;

    for(; i < iL; i++){
      if(me.data[i][me.valueKey] == value){
        return me.data[i][me.displayKey];
      }
    }
  },
  /*
   * @param {key} value
   */
  getValueKey: function(value){
    var me = this,
      i = 0,
      iL = me.data.length;

    for(; i < iL; i++){
      if(me.data[i][me.displayKey] === value){
        return me.data[i][me.valueKey];
      }
    }
  },
  /*
   * @return {*}
   */
  get: function(){
    return this.getValue();
  },
  /*
   * @return {*}
   */
  getValue: function(){
    var me = this;

    if (me.value === -1 || me.value === undefined) {
      if(me.value === -1 && me.input.dom.value){
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
  size: function(o){
    var me = this,
      width = o.width,
      height = o.height,
      input = me.input,
      inputContainer = me.inputContainer,
      drop = me.drop;

    if(me.labelAlign !== 'top'){
      me.inputHeight = height;
    }

    if(height !== undefined) {
      me.height = height;
    }

    if(width !== undefined){
      me.width = width;
    }

    me.calcSize();

    if(me.labelAlign === 'top'){
      me.css({
        height: me.height * 1.5,
        width: me.width
      });
    }
    else{
      me.css({
        height: me.height,
        width: me.width
      });
    }

    var inputWidth = me.inputWidth;

    if(me.label === false){
      inputWidth = me.width;
    }

    //inputWidth -= me.dropButtonWidth;

    input.css({
      width: inputWidth - 2,
      height: me.inputHeight
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
  onEnter: function(field, e){
    var me = this,
      list = me.getActiveList();

    if(list){
      var value = list.select('.' + me.selectedItemCls).attr('value');

      me.set(value);
    }
    else{
      me.set(me.input.dom.value);
    }

    me.hideList();
    me.hideAheadList();
  },
  /*
   * @param {Object} field
   * @param {Object} e
   */
  onEsc: function(field, e){
    var me = this;

    me.hideList();
    me.hideAheadList();
  },
  /*
   * @param {Object} field
   * @param {Object} e
   */
  onUp: function(field, e){
    var me = this,
      list = me.getActiveList(),
      selectedItemCls = me.selectedItemCls;
    
    if(list){
      e.preventDefault();
      var activeLi = list.select('.' + selectedItemCls),
        index = activeLi.index(),
        lis = list.select('li'),
        height = parseInt(list.css('height'));

      if(index !== 0){
        index--;
      }
      else{
        index = lis.length - 1;
      }

      var nextActiveLi = lis.item(index),
        top = nextActiveLi.position().top;

      if(top - list.dom.scrollTop > height){
        list.dom.scrollTop = 10000;
      }
      else if(top - list.dom.scrollTop <  0 ){
        list.dom.scrollTop = top;
      }

      activeLi.removeClass(selectedItemCls);
      nextActiveLi.addClass(selectedItemCls);
    }
  },
  /*
   * @param {Object} field
   * @param {Object} e
   */
  onDown: function(field, e){
    var me = this,
      list = me.getActiveList(),
      selectedItemCls = me.selectedItemCls;

    if(list){
      e.preventDefault();
      var activeLi = list.select('.' + selectedItemCls),
        activeLiHeight = parseInt(activeLi.css('height')),
        index = activeLi.index(),
        lis = list.select('li'),
        height = parseInt(list.css('height'));

      if(index !== lis.length - 1){
        index++;
      }
      else{
        index = 0;
      }

      var nextActiveLi = lis.item(index),
        top = nextActiveLi.position().top,
        nextActiveLiHeight = parseInt(nextActiveLi.css('height'));

      if(top - list.dom.scrollTop < 0){
        list.dom.scrollTop = 0;
      }
      else if(top + nextActiveLiHeight + 3 - list.dom.scrollTop > height ) {
        list.dom.scrollTop = top - height + activeLiHeight + nextActiveLiHeight;
      }

      activeLi.removeClass(selectedItemCls);
      nextActiveLi.addClass(selectedItemCls);
    }
    else{
      me.showList();
    }
  },
  /*
   * @param {Number} index
   */
  scrollToListItem: function(index){
    var me = this,
      list = me.getActiveList(),
      lis = list.select('li'),
      item = lis.item(index),
      top = item.position().top,
      height = parseInt(list.css('height'));

    if(index === 0){
      list.dom.scrollTop = 0;
    }
    else if(index === lis.length - 1){
      list.dom.scrollTop = 10000;
    }
    else{
      list.dom.scrollTop = top;
    }
  },
  /*
   * @return {Fancy.Element}
   */
  getActiveList: function(){
    var me = this,
      list = false;

    if(me.list && me.list.css('display') !== 'none'){
      list = me.list;
    }
    else if(me.aheadList && me.aheadList.css('display') !== 'none'){
      list = me.aheadList;
    }

    return list;
  }
});