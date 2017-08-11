Fancy.ns('Fancy.form.field');

/*
 * @mixin Fancy.form.field.Mixin
 */
Fancy.form.field.Mixin = function(){};

Fancy.form.field.Mixin.prototype = {
  padding: '8px 8px 0px 8px',
  inputHeight: 29,
  labelHeight: 18,
  failedValidCls: 'fancy-field-not-valid',
  cls: '',
  /*
   *
   */
  ons: function(){
    var me = this,
      el = me.el,
      input = me.el.getByTag('input');

    me.input = input;
    input.on('blur', me.onBlur, me);
    input.on('focus', me.onFocus, me);
    input.on('input', me.onInput, me);
    input.on('keydown', me.onKeyDown, me);
    el.on('mouseenter', me.onMouseOver, me);
    el.on('mouseleave', me.onMouseOut, me);
    me.on('key', me.onKey, me);

    if(me.tip){
      el.on('mousemove', me.onMouseMove, me);
    }

    if(me.format && me.format.inputFn){
      switch(me.value){
        case '':
        case undefined:
          break;
        default:
          me.formatValue(me.value);
      }
      me.on('key', me.onKeyInputFn);
    }

    if(me.stopPropagation){
      el.on('mousedown', function(e){
        e.stopPropagation();
      });
    }
  },
  /*
   * @param {Object} field
   * @param {*} value
   * @param {Object} e
   */
  onKeyInputFn: function(field, value, e){
    var keyCode = e.keyCode,
      key = Fancy.key;

    switch(keyCode){
      case key.ENTER:
      case key.ESC:
      case key.LEFT:
      case key.RIGHT:
        return;
        break;
    }

    this.formatValue(value);
  },
  /*
   * @param {*} value
   */
  formatValue: function(value){
    var me = this;

    value = me.format.inputFn(value);
    me.input.dom.value = value;
  },
  /*
   * @param {Object} e
   */
  onMouseOver: function(e){
    var me = this;

    me.fire('mouseover');

    if(me.tip){
      me.renderTip(e);
    }
  },
  /*
   * @param {Object} e
   */
  onMouseOut: function(e){
    var me = this;

    me.fire('mouseout');

    if(me.tip && me.tooltip){
      me.tooltipToDestroy = true;
      me.tooltip.destroy();
      delete me.tooltip;
    }
  },
  /*
   *
   */
  render: function(){
    var me = this,
      renderTo = me.renderTo || document.body,
      renderAfter = me.renderAfter,
      renderBefore = me.renderBefore,
      el = Fancy.get(document.createElement('div'));

    if(Fancy.isString(renderTo)){
      renderTo = document.getElementById(renderTo);
      if(!renderTo){
        renderTo = Fancy.select(renderTo).item(0);
      }
    }

    me.fire('beforerender');
    el.addClass( me.cls );
    el.addClass( me.fieldCls );

    el.attr('id', me.id);

    var labelWidth = '',
      itemsHTML = '';

    if (me.itemsHTML) {
      itemsHTML = me.itemsHTML;
    }

    if (me.labelAlign === 'top' && me.label) {
      //auto fixing of wrang labelWidth.
      //will not fix right if user change color of label font-size to bigger
      if (me.labelWidth < me.label.length * 7) {
        me.labelWidth = (me.label.length + 2) * 7;
      }
    }

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

    var labelDisplay = '',
      inputLabelDisplay = '',
      inputLabel = '';

    if (me.label === false) {
      labelDisplay = 'display:none;';
    }

    if (!me.inputLabel) {
      inputLabelDisplay = 'display:none;';
    }
    else {
      inputLabel = me.inputLabel;
    }

    if (me.type === 'recaptcha') {
      el.update( me.tpl.getHTML({
          key: me.key
        })
      );
    }
    else{
      el.update(
        me.tpl.getHTML({
          labelWidth: labelWidth,
          label: label,
          labelDisplay: labelDisplay,
          inputLabelDisplay: inputLabelDisplay,
          inputLabel: inputLabel,
          emptyText: me.emptyText,
          value: me.value,
          height: me.height,
          itemsHTML: itemsHTML,
          errorTextStyle: '',
          buttonText: me.buttonText
        })
      );
    }

    me.el = el;
    me.setStyle();

    if(me.renderId === true){
      el.attr('id', me.id);
    }

    if(renderAfter){
      el = renderAfter.after(el.dom.outerHTML).next();
    }
    else if(renderBefore){
      el = renderBefore.before(el.dom.outerHTML).prev();
    }
    else {
      renderTo.appendChild(el.dom);
    }
    me.el = el;

    if(me.type === 'textarea'){
      me.input = me.el.getByTag('textarea');
    }
    else{
      me.input = me.el.getByTag('input');
    }

    if(me.name) {
      me.input.name = me.name;
    }

    me.setSize();

    if( me.labelAlign === 'top' ){
      me.el.addClass('fancy-field-label-align-top');
      me.el.select('.fancy-field-text').css('float', 'none');
    }
    else if( me.labelAlign === 'right' ){
      me.el.addClass('fancy-field-label-align-right');
      switch (me.type){
        case 'radio':
          $(el.dom).find('.fancy-field-label').insertAfter($(el.dom).find('.fancy-field-text:last'));
          break;
        case 'textarea':
          $(el.dom).find('.fancy-field-label').insertAfter($(el.dom).find('.fancy-textarea-text'));
          break;
        default:
          $(el.dom).find('.fancy-field-label').insertAfter($(el.dom).find('.fancy-field-text'));
      }
    }
    else if(me.type !== 'radio'){}

    me.acceptedValue = me.value;
    me.fire('afterrender');
    me.fire('render');

    if( me.type !== 'recaptcha' && me.type !== 'chat' ){
      setTimeout(function(){
        if( me.input && me.input.dom){
          if( me.input.dom.value.length === 0 ){
            if( me.prevColor === undefined ){
              me.prevColor = me.input.css('color');
            }

            //me.input.css('color', 'grey');
          }
        }
      }, 1);
    }
  },
  /*
   * @param {Object} e
   */
  onKeyDown: function(e){
    var me = this,
      keyCode = e.keyCode,
      key = Fancy.key;

    if( me.type === 'number' ){
      if( Fancy.Key.isNumControl(keyCode, e) === false ){
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    switch(keyCode){
      case key.TAB:
        me.fire('tab', e);
        break;
      case key.ENTER:
        me.fire('enter', me.getValue());
        if( me.type !== 'textarea' ){
          e.preventDefault();
          e.stopPropagation();
        }
        break;
      case key.UP:
        switch(me.type){
          case 'number':
          case 'field.number':
            me.spinUp();
            break;
        }

        me.fire('up', me.getValue());

        if( me.type !== 'textarea' ){
          e.preventDefault();
          e.stopPropagation();
        }
        break;
      case key.DOWN:
        switch(me.type){
          case 'number':
          case 'field.number':
            me.spinDown();
            break;
        }

        me.fire('up', me.getValue());

        if( me.type !== 'textarea' ){
          e.preventDefault();
          e.stopPropagation();
        }
        break;
      case key.LEFT:
        break;
      case key.RIGHT:
        e.stopPropagation();
        break;
      default:
        setTimeout(function(){
          if( me.input ){
            if( me.input.dom.value.length === 0 ){
              if( me.prevColor === undefined ){
                me.prevColor = me.input.css('color');
              }

              me.input.css('color', 'grey');
            }
            else{
              if( me.prevColor ){
                me.input.css('color', me.prevColor);
              }
              else{
                me.input.css('color', ' ');
              }
            }
          }
        }, 1);
    }

    setTimeout(function(){
      //me.fire('key', me.getValue(), e);
      me.fire('key', me.input.dom.value, e);
    }, 1);
  },
  /*
   * @param {Object} me
   * @param {*} value
   */
  onKey: function(me, value){
    me.validate(value);
  },
  /*
   *
   */
  onBlur: function(){
    var me = this;

    me.fire('blur');
  },
  /*
   * @param {*} value
   */
  validate: function(value){
    var me = this,
      vtype = me.vtype;

    if(vtype === undefined){}
    else{
      var valid = Fancy.isValid(vtype, value);
      if( valid !== true ){
        me.errorText = new Fancy.Template(valid.text).getHTML(valid);
        me.failedValid();
      }
      else{
        me.successValid();
      }
    }
  },
  /*
   *
   */
  isValid: function(){
    var me = this;

    return !me.hasClass(me.failedValidCls);
  },
  /*
   *
   */
  onFocus: function(){
    var me = this;

    me.fire('focus');
  },
  /*
   *
   */
  onInput: function(){
    var me = this,
      input = me.input,
      value = me.getValue(),
      oldValue = me.acceptedValue;

    me.acceptedValue = me.get();
    me.fire('input', value);
    me.fire('change', value, oldValue);
  },
  /*
   *
   */
  get: function(){
    var me = this;

    if(me.format){
      //Place of bugs
      if(Fancy.isString(me.format)){}
      else if(Fancy.isObject(me.format)){
        if(me.format.inputFn){
          if(me.type === 'number' || me.type === 'field.number'){
            if(isNaN(parseFloat(me.value))){
              return me.value;
            }

            return Number(me.value);
          }
        }
      }
      else {
        return me.value;
      }
    }

    return me.input.dom.value;
  },
  /*
   *
   */
  getValue: function(){
    return this.get();
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  set: function(value, onInput){
    var me = this;

    me.value = value;

    if(me.format && me.format.inputFn){
      me.formatValue(value);
    }
    else{
      me.input.dom.value = value;
    }

    if(onInput !== false){
      me.onInput();
    }

    me.validate(value);
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  setValue: function(value, onInput){
    this.set(value, onInput);
  },
  /*
   *
   */
  clear: function(){
    this.set('');
  },
  /*
   *
   */
  failedValid: function(){
    var me = this;

    if(me.hasClass(me.failedValidCls)){
      if(me.tooltip && me.errorText){
        me.tooltip.update(me.errorText);
      }
    }
    else{
      if(!me.tooltip && me.errorText){
        me.showErrorTip();

        me.el.on('mousemove', me.onMouseMove, me);
        me.input.hover(function(e){
          if(me.errorText){
            me.showErrorTip();
            me.tooltip.show(e.pageX + 15, e.pageY - 25);
          }
        }, function(){
          me.hideErrorTip();
        });
      }

      me.addClass(me.failedValidCls);
    }
  },
  /*
   *
   */
  successValid: function(){
    var me = this;

    me.removeClass(me.failedValidCls);
    me.hideErrorTip();
    delete me.errorText;
  },
  /*
   *
   */
  showErrorTip: function(){
    var me = this;

    if(!me.tooltip){
      me.tooltip = new Fancy.ToolTip({
        text: me.errorText
      });
    }
  },
  /*
   *
   */
  hideErrorTip: function(){
    var me = this;

    if(me.tooltip) {
      me.tooltip.destroy();
      delete me.tooltip;
    }
  },
  /*
   * @param {Object} o
   */
  setInputSize: function(o){
    var me = this;

    if(o.width) {
      me.input.css('width', o.width);
    }

    if(o.height) {
      me.input.css('height', o.height);
    }
  },
  /*
   *
   */
  focus: function(){
    var me = this;

    me.input.focus();
    setTimeout(function(){
      me.input.dom.selectionStart = me.input.dom.selectionEnd = 10000;
    }, 0);
  },
  /*
   *
   */
  hide: function(){
    var me = this;

    me.fire('beforehide');
    me.css('display', 'none');
    me.fire('hide');
  },
  /*
   *
   */
  show: function(){
    var me = this;

    me.css('display', 'block');
  },
  /*
   * @param {Number|Object} width
   * @param {Number} height
   */
  setSize: function(width, height){
    var me = this;

    if(me.type === 'set'){
      return;
    }

    if(width === undefined && height === undefined){
      width = me.width;
      height = me.height;
    }
    else if(height === undefined){
      var o = width;
      if(o.width){
        width = o.width;
      }
      else{
        width = me.width;
      }

      if(o.height){
        height = o.height;
      }
      else{
        height = me.height;
      }
    }

    if(me.size){
      me.size({
        width: width,
        height: height
      });

      return;
    }

    if(width !== undefined) {
      me.css('width', width);
    }

    if(me.labelAlign === 'top'){
      me.css('height', height * 1.5);
    }
    else{
      me.css('height', height);
    }

    me.setInputSize({
      width: me.inputWidth,
      height: me.inputHeight
    });
  },
  /*
   *
   */
  setStyle: function(){
    var me = this,
      style = me.style || {},
      padding = me.padding;

    if(padding){
      if(Fancy.isNumber(padding)){
        padding = padding + 'px';
      }
      else if(Fancy.isString(padding)){}

      if(style.padding === undefined){
        style.padding = padding;
      }
    }
    else{
      style.padding = '0px';
    }

    if(me.hidden){
      me.css('display', 'none')
    }

    me.css(style);
  },
  /*
   *
   */
  preRender: function(){
    var me = this;

    if(me.tpl && Fancy.isObject(me.tpl) === false){
      me.tpl = new Fancy.Template(me.tpl);
    }

    me.calcSize();
  },
  /*
   *
   */
  calcSize: function(){
    var me = this,
      inputWidth = me.inputWidth,
      padding = me.padding,
      value,
      value1,
      value2,
      value3;

    if(Fancy.isString(padding)){
      padding = padding.replace(/px/g, '');
      padding = padding.split(' ');
      switch(padding.length){
        case 1:
          value = Number(padding[0]);
          padding = [value, value, value, value];
          break;
        case 2:
          value1 = Number(padding[0]);
          value2 = Number(padding[1]);

          padding = [value1, value2, value1, value2];
          break;
        case 3:
          value1 = Number(padding[0]);
          value2 = Number(padding[1]);
          value3 = Number(padding[2]);

          padding = [value1, value2, value3, value1];
          break;
        case 4:
          padding = [Number(padding[0]), Number(padding[1]), Number(padding[2]), Number(padding[3])];
          break;
      }
    }
    else if(Fancy.isNumber(padding)){
      padding = [padding, padding, padding, padding];
    }
    else if(padding === false){
      padding = [0, 0, 0, 0];
    }

    if(me.labelAlign === 'top'){
      me.height *= 1.5;
    }

    inputWidth = me.width;

    if(me.labelAlign !== 'top' && me.label){
      inputWidth -= me.labelWidth;
    }

    if(me.height === me.inputHeight && me.padding !== false){
      me.inputHeight -= padding[0] + padding[2];
    }

    me.inputWidth = inputWidth -  padding[1] - padding[3];
    me.height = me.inputHeight + padding[0] + padding[2];
  },
  /*
   * @param {Number} value
   */
  setWidth: function(value){
    var me = this;

    me.width = value;
    me.calcSize();

    me.css('width', value);
    me.setInputSize({
      width: me.inputWidth
    });
  },
  /*
   * @param {Object} e
   */
  onMouseMove: function(e){
    var me = this;

    delete me.tooltipToDestroy;

    if(me.tip){
      me.renderTip(e);
    }
    else if(me.tooltip){
      me.tooltip.show(e.pageX + 15, e.pageY - 25);
    }
  },
  /*
   * @param {Object} e
   */
  renderTip: function(e){
    var me = this,
      value = '',
      tpl = new Fancy.Template(me.tip || me.tooltip);

    if(me.getValue){
      value = me.getValue();
    }

    var text = tpl.getHTML({
      value: value
    });

    if(me.tooltip){
      me.tooltip.update(text);
    }
    else {
      me.tooltip = new Fancy.ToolTip({
        text: text
      });
    }

    me.tooltip.show(e.pageX + 15, e.pageY - 25);
  }
};