/**
 * @class Fancy.TagField
 * @extends Fancy.Widget
 */

Fancy.define(['Fancy.form.field.Tag', 'Fancy.TagField'], {
  type: 'field.tagfield',
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  activeListItemCls: 'fancy-tag-field-list-active',
  width: 250,
  height: 42,
  labelWidth: 60,
  inputWidth: 180,
  inputHeight: 30,
  listRowHeight: 25,
  emptyText: '',
  editable: true,
  typeAhead: true, // not right name
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      '<div>',
        '<input placeholder="{emptyText}" class="fancy-field-text-input" style="{inputWidth}{inputHeight}cursor:default;" value="{value}">',
        '<div class="fancy-tag-field-dropdown-button">&nbsp;</div>',
      '</div>',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   * @constructor
   */
  constructor: function () {
    var me = this;

    me.tags = me.tags || [];
    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function () {
    var me = this;

    me.addEvents('focus', 'blur', 'input', 'up', 'down', 'change', 'key', 'enter', 'up', 'down', 'esc');
    me.Super('init', arguments);

    me.preRender();
    me.render();

    me.ons();

    me.applySize();
    me.applyStyle();
    me.applyTheme();
    me.initListItems();
  },
  /*
   *
   */
  calcSize: function(){
    var me = this;

    me.inputHeight = me.height - 2 * 7;

    if(me.label === false || me.labelAlign === 'top'){
      me.inputWidth = me.width;
      me.height *= 1.5;
    }
    else{
      me.inputWidth = me.width - me.labelWidth;
    }
  },
  /*
   *
   */
  applySize: function(){
    var me = this;

    me.css({
      width: me.width,
      height: me.height
    });
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
      me.addCls('fancy-theme-' + me.theme);
      me.list.addCls('fancy-theme-' + me.theme);
    }
  },
  fieldCls: 'fancy fancy-field fancy-tag-field',
  /*
   *
   */
  ons: function(){
    var me = this,
      drop = me.el.select('.fancy-tag-field-dropdown-button');

    me.input = me.el.getByTag('input');

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
  onInputClick: function(e){
    var me = this,
      list = me.list;

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
      docEl = Fancy.get(document);

    list.css({
      display: '',
      left: xy[0] + 'px',
      top: xy[1] + 'px',
      width: el.width(),
      "z-index": 2000 + Fancy.zIndex++
    });

    if(!me.docSpy){
      me.docSpy = true;
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
    }
  },
  /*
   *
   */
  hideList: function(){
    var me = this;

    me.list.css('display', 'none');

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
    if(this.editable === false){
      e.preventDefault();
    }
  },
  /*
   * @param {Object} e
   */
  onDropMouseDown: function(e){
    e.preventDefault();
  },
  /*
   *
   */
  onsList: function(){
    var me = this,
      list = me.list,
      liEls = list.select('li');

    liEls.hover(function (e) {
      if (me.listItemOver) {
        me.listItemOver.removeCls('fancy-tag-field-list-active');
      }
      Fancy.get(e.target).addCls('fancy-tag-field-list-active');
      me.listItemOver = Fancy.get(e.target);
    });

    liEls.on('click', me.onListItemClick, me);
  },
  /*
   * @param {Object} e
   */
  onListItemClick: function(e){
    var me = this,
      li = Fancy.get(e.currentTarget),
      value = li.attr('value');

    me.set(value);
    me.hideList();

    me.onBlur();
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  set: function (value, onInput) {
    var me = this,
      i = 0,
      iL = me.data.length;

    for (; i < iL; i++) {
      if (me.data[i][me.valueKey] == value) {
        me.valueIndex = i;
        break;
      }
    }

    me.value = value;

    if (onInput !== false) {
      me.onInput();
    }
  },
  /*
   *
   */
  initListItems: function(){
    if(this.itemCheckBox){
      this.renderListCheckBoxes();
    }
  },
  /*
   *
   */
  renderListCheckBoxes: function(){
    var me = this,
      list = me.list,
      liEls = list.select('li'),
      i = 0,
      iL = liEls.length;

    for(;i<iL;i++){
      var renderTo = liEls.item(i);

      renderTo.css('position', 'relative');
      renderTo.select('.fancy-tag-field-list-value').css('margin-left', '25px');

      var checkBox = new Fancy.CheckBox({
        renderTo: renderTo.dom,
        value: false,
        label: false,
        style: {
          position: 'absolute',
          top: '-7px',
          left: '-2px'
        },
        tagValue: me.data[i][me.valueKey],
        events: [{
          change: me.onChange,
          scope: me
        }]
      });

      checkBox.el.hover(function () {
        var el = Fancy.get(this);
        me.clearListActive();

        el.parent().addCls(me.activeListItemCls);
      });
    }

    me.on('change', function (me, value) {
      var checkBox = Fancy.getWidget(me.list.select('li[value="' + me.value + '"] .fancy-field-checkbox').attr('id'));

      checkBox.toggle();
    });
  },
  /*
   * @param {Object} checkbox
   * @param {Boolean} value
   */
  onChange: function(checkbox, value){
    var me = this,
      tagValue = checkbox.tagValue;

    if(value === true){
      me.tags.push(tagValue);

      me.renderTags();
    }
  },
  /*
   *
   */
  renderTags: function(){
    var me = this,
      inputWidth = me.input.width(),
      item,
      newInputWidth,
      tagValue = me.tags[me.tags.length - 1];

    if(me.isFull){
      return;
    }

    if (me.tags.length > 1) {
      item = me.el.select('input').item(0).before([
        '<span data-tag="fancy-tag-full" class="fancy-tag-field-item">',
        '...',
        '</span>'
      ].join(""));

      newInputWidth = 0;
      me.isFull = true;
    }
    else {
      item = me.el.select('input').item(0).before([
        '<span data-tag="' + tagValue + '" class="fancy-tag-field-item">',
          tagValue,
        '</span>'
      ].join(""));

      item = me.el.select('[data-tag="' + tagValue + '"]').item(0);
      newInputWidth = inputWidth - item.width();
    }

    if (newInputWidth < 0) {
      newInputWidth = 0;
    }

    if (newInputWidth === 0) {
      me.input.css('display', 'none');
    }

    me.input.css('width', newInputWidth + 'px');
  },
  /*
   *
   */
  render: function(){
    var me = this,
      renderTo = Fancy.get(me.renderTo || document.body).dom,
      el = Fancy.get(document.createElement('div')),
      list = Fancy.get( document.createElement('div') ),
      value = me.value;

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
    el.addCls(me.cls, me.fieldCls);

    var labelWidth = '';

    if (me.labelWidth) {
      labelWidth = 'width:' + me.labelWidth + 'px;';
    }

    var listHtml = [
      '<ul style="position: relative;">'
    ];

    Fancy.each(me.data, function (row, i) {
      var isActive = '',
        value = row[me.displayKey];

      if (i === 0) {
        isActive = 'fancy-tag-field-list-active';
      }

      if (value === '' || value === ' ') {
        value = '&nbsp;';
      }

      listHtml.push('<li value="' + row[me.valueKey] + '" class="' + isActive + '"><span class="fancy-tag-field-list-value">' + value + '</span></li>');
    });

    listHtml.push('</ul>');

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
      inputWidth: 'width:' + (me.inputWidth - 20) + 'px;',
      inputHeight: 'height:' + me.inputHeight + 'px;',
      value: value,
      height: me.height
    }) );

    renderTo.appendChild(el.dom);
    me.el = el;

    list.addCls('fancy fancy-tag-field-result-list');
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

    if (me.labelAlign === 'top') {
      me.el.addCls('fancy-field-label-align-top');
    }
    else if (me.labelAlign === 'right') {
      me.el.addCls('fancy-field-label-align-right');
      $(el).find('.fancy-field-label').insertAfter($(el).find('.fancy-tag-field-text'));
    }

    if (me.valueIndex) {
      me.acceptedValue = me.value;
    }

    me.fire('afterrender');
    me.fire('render');
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
    this.set(-1, false);
  },
  /*
   *
   */
  clearListActive: function(){
    var me = this,
      activeListItemCls = me.activeListItemCls;

    me.list.select('.' + activeListItemCls).removeCls(activeListItemCls);
  },
  /*
   *
   */
  onInput: function(){
    var me = this,
      value = me.getValue();

    me.input.dom.value = value;
    me.acceptedValue = me.get();
    me.fire('change', value);
  },
  /*
   * @param {Array} data
   */
  setData: function(data){
    var me = this,
      listHtml = [],
      activeListItemCls = me.activeListItemCls;

    me.data = data;

    Fancy.each(me.data, function (row, i) {
      var isActive = '',
        value = row[me.displayKey];

      if (i === 0) {
        isActive = activeListItemCls;
      }

      if (value === '' || value === ' ') {
        value = '&nbsp;';
      }

      listHtml.push('<li value="' + row[me.valueKey] + '" class="' + isActive + '">' + value + '</li>');
    });

    me.list.select('ul').update(listHtml.join(""));
    me.onsList();
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  setValue: function(value, onInput){
    this.set(value, onInput);
  },
  /*
   * @param {*} value
   */
  getDisplayValue: function(value){
    var me = this,
      i = 0,
      iL = me.data.length;

    for(; i < iL; i++){
      if (me.data[i][me.valueKey] == value) {
        return me.data[i][me.displayKey];
      }
    }
  },
  /*
   * @param {*} value
   */
  getValueKey: function(value){
    var me = this,
      i = 0,
      iL = me.data.length;

    for(; i < iL; i++){
      if (me.data[i][me.displayKey] === value) {
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

    if(me.value === -1 || me.value === undefined){
      return '';
    }

    if(me.valueKey !== undefined){
      return me.value;
    }

    return me.value;
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
   * @param {Object} field
   * @param {Object} e
   */
  onEnter: function(field, e){
    var me = this,
      list = me.getActiveList();

    if(list){
      var displayValue = list.select('.' + me.selectedItemCls + ' .fancy-combo-list-value').dom.innerHTML;

      me.set(displayValue);
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
    this.hideList();
    this.hideAheadList();
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
        top = nextActiveLi.offset().top;

      if(index === lis.length - 1){
        list.dom.scrollTop = 10000;
      }
      else if(top - parseInt( nextActiveLi.css('height') ) <  parseInt( nextActiveLi.css('height') ) ){
        list.dom.scrollTop = list.dom.scrollTop - parseInt(activeLi.css('height'));
      }

      activeLi.removeCls(selectedItemCls);
      nextActiveLi.addCls(selectedItemCls);
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
        index = activeLi.index(),
        lis = list.select('li'),
        top = activeLi.offset().top,
        height = parseInt(list.css('height'));

      if(index !== lis.length - 1){
        index++;
      }
      else{
        index = 0;
      }

      var nextActiveLi = lis.item(index);

      if(top - height > 0){
        list.dom.scrollTop = 0;
      }
      else if(top - height > -parseInt( activeLi.css('height') ) ) {
        list.dom.scrollTop = list.dom.scrollTop + (top - height) + parseInt(activeLi.css('height'));
      }

      activeLi.removeCls(selectedItemCls);
      nextActiveLi.addCls(selectedItemCls);
    }
    else{
      me.showList();
    }
  },
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

    if (me.aheadData.length > 9) {
      list.css({
        height: me.listRowHeight * 9 + 'px',
        overflow: 'auto'
      });
    }

    if(presented === false){
      list.addCls('fancy fancy-combo-result-list');
      document.body.appendChild(list.dom);
      me.aheadList = list;

      me.onsAheadList();
    }
  },
  onsAheadList: function(){
    var me = this;

    me.aheadList.on('click', me.onListItemClick, me, 'li');
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