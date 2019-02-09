/*
 * @mixin Fancy.form.field.Mixin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var FIELD_NOT_VALID_CLS = F.FIELD_NOT_VALID_CLS;
  var FIELD_LABEL_ALIGN_TOP_CLS = F.FIELD_LABEL_ALIGN_TOP_CLS;
  var FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;
  var FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  var FIELD_TEXTAREA_TEXT_CLS = F.FIELD_TEXTAREA_TEXT_CLS;
  var FIELD_LABEL_ALIGN_RIGHT_CLS = F.FIELD_LABEL_ALIGN_RIGHT_CLS;
  var FIELD_DISABLED_CLS = F.FIELD_DISABLED_CLS;

  F.ns('Fancy.form.field');

  F.form.field.Mixin = function () {};

  F.form.field.Mixin.prototype = {
    padding: '8px 8px 0px 8px',
    inputHeight: 29,
    labelHeight: 18,
    failedValidCls: FIELD_NOT_VALID_CLS,
    cls: '',
    checkValidOnTyping: false,
    editable: true,
    /*
     *
     */
    ons: function () {
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

      if (me.tip) {
        el.on('mousemove', me.onMouseMove, me);
      }

      if (me.format && me.format.inputFn) {
        switch (me.value) {
          case '':
          case undefined:
            break;
          default:
            me.formatValue(me.value);
        }
        me.on('key', me.onKeyInputFn);
      }

      if (me.stopPropagation) {
        el.on('mousedown', function (e) {
          e.stopPropagation();
        });
      }

      el.on('mousedown', function (e) {
        if(me.disabled){
          e.preventDefault();
          e.stopPropagation();
        }
      });
    },
    /*
     * @param {Object} field
     * @param {*} value
     * @param {Object} e
     */
    onKeyInputFn: function (field, value, e) {
      var me = this,
        keyCode = e.keyCode,
        key = F.key;

      if(me.disabled){
        return;
      }

      switch (keyCode) {
        case key.ENTER:
        case key.ESC:
        case key.LEFT:
        case key.RIGHT:
          return;
      }

      this.formatValue(value);
    },
    /*
     * @param {*} value
     */
    formatValue: function (value) {
      value = this.format.inputFn(value);
      this.input.dom.value = value;
    },
    /*
     * @param {Object} e
     */
    onMouseOver: function (e) {
      var me = this;

      if(me.disabled){
        return;
      }

      me.fire('mouseover');

      if (me.tip) {
        me.renderTip(e);
      }
    },
    /*
     * @param {Object} e
     */
    onMouseOut: function (e) {
      var me = this;

      if(me.disabled){
        return;
      }

      me.fire('mouseout');

      if (me.tip && me.tooltip) {
        me.tooltipToDestroy = true;
        me.tooltip.destroy();
        delete me.tooltip;
      }
    },
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = me.renderTo || document.body,
        renderAfter = me.renderAfter,
        renderBefore = me.renderBefore,
        el = F.get(document.createElement('div'));

      if (F.isString(renderTo)) {
        renderTo = document.getElementById(renderTo);
        if (!renderTo) {
          renderTo = F.select(renderTo).item(0);
        }
      }

      me.fire('beforerender');

      el.addCls(
        F.cls,
        me.cls,
        me.fieldCls
      );

      el.attr('id', me.id);

      var labelWidth = '',
        itemsHTML = '';

      if (me.itemsHTML) {
        itemsHTML = me.itemsHTML;
      }

      if (me.labelAlign === 'top' && me.label) {
        //auto fixing of wrong labelWidth.
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
        el.update(me.tpl.getHTML({
            key: me.key
          })
        );
      }
      else {
        var itemConfig = {
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
        };

        if(me.type === 'set'){
          delete itemConfig.height;
        }

        el.update(
          me.tpl.getHTML(itemConfig)
        );
      }

      me.el = el;
      me.setStyle();

      if (me.renderId === true) {
        el.attr('id', me.id);
      }

      if (renderAfter) {
        renderAfter = F.get(renderAfter);
        el = renderAfter.after(el.dom.outerHTML).next();
      }
      else if (renderBefore) {
        el = renderBefore.before(el.dom.outerHTML).prev();
      }
      else {
        renderTo.appendChild(el.dom);
      }
      me.el = el;

      if (me.type === 'textarea') {
        me.input = me.el.getByTag('textarea');
      }
      else {
        me.input = me.el.getByTag('input');
      }

      if (me.name) {
        me.input.name = me.name;
      }

      me.setSize();

      if (me.labelAlign === 'top') {
        me.el.addCls(FIELD_LABEL_ALIGN_TOP_CLS);
        me.el.select('.' + FIELD_TEXT_CLS).css('float', 'none');
      }
      else if (me.labelAlign === 'right') {
        me.el.addCls(FIELD_LABEL_ALIGN_RIGHT_CLS);
        switch (me.type) {
          case 'radio':
            F.$(el.dom).find('.' + FIELD_LABEL_CLS).insertAfter(F.$(el.dom).find('.' + FIELD_TEXT_CLS + ':last'));
            F.$(el.dom).find('.' + FIELD_LABEL_CLS).css('float', 'right');
            break;
          case 'textarea':
            F.$(el.dom).find('.' + FIELD_LABEL_CLS).insertAfter(F.$(el.dom).find('.' + FIELD_TEXTAREA_TEXT_CLS));
            break;
          case 'checkbox':
            F.$(el.dom).find('.' + FIELD_LABEL_CLS).css('float', 'right');
            break;
          default:
            F.$(el.dom).find('.' + FIELD_LABEL_CLS).insertAfter(F.$(el.dom).find('.' + FIELD_TEXT_CLS));
        }
      }
      else if (me.type !== 'radio') {}

      me.acceptedValue = me.value;
      me.fire('afterrender');
      me.fire('render');

      if (me.type !== 'recaptcha' && me.type !== 'chat') {
        setTimeout(function () {
          if (me.input && me.input.dom) {
            if (me.input.dom.value.length === 0) {
              if (me.prevColor === undefined) {
                me.prevColor = me.input.css('color');
              }

              //me.input.css('color', 'grey');
            }
          }
        }, 1);
      }

      if(me.disabled){
        switch(me.type){
          case 'hidden':
            break;
          default:
            me.addCls(FIELD_DISABLED_CLS);
        }

        if(me.input){
          me.input.attr('tabIndex', -1);
        }
      }
      else{
        if(me.input && me.tabIndex){
          me.input.attr('tabIndex', me.tabIndex);
        }
      }
    },
    /*
     * @param {Object} e
     */
    onKeyDown: function (e) {
      var me = this,
        keyCode = e.keyCode,
        key = F.key;

      if(me.disabled){
        return;
      }

      //This disable filter expressions in number field
      /*
      if (me.type === 'field.number') {
        if (F.Key.isNumControl(keyCode, e) === false) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
      */

      switch (keyCode) {
        case key.BACKSPACE:
        case key.DELETE:
          switch(me.type) {
            case 'field.number':
            case 'field.string':
            case 'field.date':
              setTimeout(function () {
                if(me.getValue() === ''){
                  me.fire('empty');
                }
              }, 1);
              break;
          }
          break;
        case key.TAB:
          me.fire('tab', e);
          break;
        case key.ENTER:
          me.fire('enter', me.getValue());
          if (me.type !== 'textarea') {
            e.preventDefault();
            e.stopPropagation();
          }
          break;
        case key.UP:
          switch (me.type) {
            case 'number':
            case 'field.number':
              me.spinUp();
              break;
          }

          me.fire('up', me.getValue());

          if (me.type !== 'textarea') {
            e.preventDefault();
            e.stopPropagation();
          }
          break;
        case key.DOWN:
          switch (me.type) {
            case 'number':
            case 'field.number':
              me.spinDown();
              break;
          }

          me.fire('down', me.getValue());

          if (me.type !== 'textarea') {
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
          setTimeout(function () {
            if (me.input) {
              if (me.input.dom.value.length === 0) {
                if (me.prevColor === undefined) {
                  me.prevColor = me.input.css('color');
                }

                me.input.css('color', 'grey');
              }
              else {
                if (me.prevColor) {
                  me.input.css('color', me.prevColor);
                }
                else {
                  me.input.css('color', ' ');
                }
              }
            }
          }, 1);
      }

      setTimeout(function () {
        me.fire('key', me.input.dom.value, e);
      }, 1);
    },
    /*
     * @param {Object} me
     * @param {*} value
     */
    onKey: function (me, value) {
      if(me.disabled){
        return;
      }

      if (!me.isValid() || me.checkValidOnTyping) {
        me.validate(value);
      }
    },
    /*
     * It used also for validation.
     * @return {Boolean} - returns true/false if validation passed successful.
     */
    onBlur: function () {
      var me = this;

      if(me.disabled){
        return true;
      }

      me.fire('blur');

      if (me.input) {
        if(me.type === 'combo'){
          setTimeout(function () {
            if(me.listItemClicked){}
            else{
              me.validate(me.input.dom.value);
            }
          }, 100);
        }
        else {
          return me.validate(me.input.dom.value);
        }
      }

      return true;
    },
    /*
     * @param {*} value
     */
    validate: function (value) {
      var me = this,
        vtype = me.vtype;

      if (vtype === undefined) {
        return true;
      }
      else {
        var valid = F.isValid(vtype, value);
        if (valid !== true) {
          me.errorText = new F.Template(valid.text).getHTML(valid);
          me.failedValid();

          return false;
        }
        else {
          me.successValid();
          return true;
        }
      }
    },
    /*
     *
     */
    isValid: function () {
      return !this.hasCls(this.failedValidCls);
    },
    /*
     *
     */
    onFocus: function (e) {
      var me = this;

      if(me.disabled || me.editable === false){
        this.input.blur();
        return;
      }

      me.fire('focus');
    },
    /*
     *
     */
    blur: function () {
      this.input.blur();
    },
    /*
     *
     */
    onInput: function () {
      var me = this,
        value = me.getValue(),
        oldValue = me.acceptedValue;

      if(me.disabled){
        return;
      }

      me.acceptedValue = me.get();
      me.fire('input', value);
      me.fire('change', value, oldValue);
    },
    /*
     *
     */
    get: function () {
      var me = this;

      if (me.format) {
        //Place of bugs
        if (F.isString(me.format)) {}
        else if (F.isObject(me.format)) {
          if (me.format.inputFn) {
            if (me.type === 'number' || me.type === 'field.number') {
              if (isNaN(parseFloat(me.value))) {
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
    getValue: function () {
      return this.get();
    },
    /*
     * @param {*} value
     * @param {Boolean} onInput
     */
    set: function (value, onInput) {
      var me = this;

      me.value = value;

      if (me.format && me.format.inputFn) {
        me.formatValue(value);
      }
      else {
        me.input.dom.value = value;
      }

      if (onInput !== false) {
        me.onInput();
      }

      me.validate(value);
    },
    setLabel: function (value) {
      var me = this;

      me.el.select('.' + FIELD_LABEL_CLS).update(value);
    },
    /*
     * @param {*} value
     * @param {Boolean} onInput
     */
    setValue: function (value, onInput) {
      this.set(value, onInput);
    },
    /*
     *
     */
    clear: function () {
      this.set('');
      this.clearValid();
    },
    /*
     *
     */
    failedValid: function () {
      var me = this;

      if (me.hasCls(me.failedValidCls)) {
        if (me.tooltip && me.errorText) {
          me.tooltip.update(me.errorText);
        }
      }
      else {
        if (!me.tooltip && me.errorText) {
          me.showErrorTip();

          me.el.on('mousemove', me.onMouseMove, me);
          me.input.hover(function (e) {
            if (me.errorText) {
              me.showErrorTip();
              me.tooltip.show(e.pageX + 15, e.pageY - 25);
            }
          }, function () {
            me.hideErrorTip();
          });
        }

        me.addCls(me.failedValidCls);
      }
    },
    clearValid: function () {
      this.removeCls(this.failedValidCls);
    },
    /*
     *
     */
    successValid: function () {
      var me = this;

      me.removeCls(me.failedValidCls);
      me.hideErrorTip();
      delete me.errorText;
    },
    /*
     *
     */
    showErrorTip: function () {
      var me = this;

      if (!me.tooltip) {
        me.tooltip = new F.ToolTip({
          text: me.errorText
        });
      }
    },
    /*
     *
     */
    hideErrorTip: function () {
      var me = this;

      if (me.tooltip) {
        me.tooltip.destroy();
        delete me.tooltip;
      }
    },
    /*
     * @param {Object} o
     */
    setInputSize: function (o) {
      var me = this;

      if(me.type === 'combo'){
        me.inputContainer.css('width', o.width);
      }

      if (o.width) {
        me.input.css('width', o.width);
      }

      if (o.height && me.type !== 'set') {
        me.input.css('height', o.height);
      }
    },
    /*
     *
     */
    focus: function () {
      var me = this;

      me.input.focus();
      setTimeout(function () {
        me.input.dom.selectionStart = me.input.dom.selectionEnd = 10000;
      }, 0);
    },
    /*
     *
     */
    hide: function () {
      var me = this;

      me.fire('beforehide');
      me.css('display', 'none');
      me.fire('hide');
    },
    /*
     *
     */
    show: function () {
      var me = this;

      me.css('display', 'block');
    },
    /*
     * @param {Number|Object} width
     * @param {Number} height
     */
    setSize: function (width, height) {
      var me = this;

      switch (me.type) {
        case 'set':
        case 'line':
      }

      if (width === undefined && height === undefined) {
        width = me.width;
        height = me.height;
      }
      else if (height === undefined) {
        var o = width;
        if (o.width) {
          width = o.width;
        }
        else {
          width = me.width;
        }

        if (o.height) {
          height = o.height;
        }
        else {
          height = me.height;
        }
      }

      if (me.size) {
        me.size({
          width: width,
          height: height
        });

        return;
      }

      if (width !== undefined) {
        me.css('width', width);
      }

      if (me.labelAlign === 'top') {
        me.css('height', height * 1.5);
      }
      else {
        if(me.type !== 'set'){
          me.css('height', height);
        }

        if (me.label) {
          me.el.select('.' + FIELD_LABEL_CLS).css('height', me.inputHeight);
        }
      }

      me.setInputSize({
        width: me.inputWidth,
        height: me.inputHeight
      });
    },
    /*
     *
     */
    setStyle: function () {
      var me = this,
        style = me.style || {},
        padding = me.padding;

      if (padding) {
        if (F.isNumber(padding)) {
          padding = padding + 'px';
        }
        else if (F.isString(padding)) {}

        if (style.padding === undefined) {
          style.padding = padding;
        }
      }
      else {
        style.padding = '0px';
      }

      if (me.hidden) {
        me.css('display', 'none')
      }

      me.css(style);
    },
    /*
     *
     */
    preRender: function () {
      var me = this;

      if (me.tpl && F.isObject(me.tpl) === false) {
        me.tpl = new F.Template(me.tpl);
      }

      me.calcSize();
    },
    /*
     *
     */
    calcSize: function () {
      var me = this,
        inputWidth,
        inputHeight = me.inputHeight,
        padding = me.padding,
        value,
        value1,
        value2,
        value3;

      if (F.isString(padding)) {
        padding = padding.replace(/px/g, '');
        padding = padding.split(' ');
        switch (padding.length) {
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
      else if (F.isNumber(padding)) {
        padding = [padding, padding, padding, padding];
      }
      else if (padding === false) {
        padding = [0, 0, 0, 0];
      }

      if (me.labelAlign === 'top') {
        me.height *= 1.5;
      }

      inputWidth = me.width;

      if (me.labelAlign !== 'top' && me.label) {
        inputWidth -= me.labelWidth;
      }

      if (me.height === me.inputHeight && me.padding !== false) {
        inputHeight -= padding[0] + padding[2];
      }

      if (me.type === 'radio' && !me.column) {
        me.calcColumns();
        if (me.rows !== 1) {
          inputHeight = (inputHeight - padding[0] - padding[2]) * me.rows;
        }
      }

      me.inputHeight = inputHeight;
      me.inputWidth = inputWidth - padding[1] - padding[3];
      me.height = inputHeight + padding[0] + padding[2];
    },
    /*
     * @param {Number} value
     */
    setWidth: function (value) {
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
    onMouseMove: function (e) {
      var me = this,
        //Link on grid if presented
        w = me.widget;

      if(me.disabled){
        return;
      }

      delete me.tooltipToDestroy;

      if(w){
        if(w.startResizing && me.tooltip){
          me.tooltip.destroy();
          return;
        }

        if(w.columndrag && w.columndrag.status === 'dragging'){
          me.tooltip.destroy();
          return;
        }
      }

      if (me.tip) {
        me.renderTip(e);
      }
      else if (me.tooltip) {
        me.tooltip.show(e.pageX + 15, e.pageY - 25);
      }
    },
    /*
     * @param {Object} e
     */
    renderTip: function (e) {
      var me = this,
        value = '',
        tpl = new F.Template(me.tip || me.tooltip);

      if (me.getValue) {
        value = me.getValue();
      }

      var text = tpl.getHTML({
        value: value
      });

      if (me.tooltip) {
        me.tooltip.update(text);
      }
      else {
        me.tooltip = new F.ToolTip({
          text: text
        });
      }

      me.tooltip.show(e.pageX + 15, e.pageY - 25);
    },
    /*
     * @return {Object}
     */
    getInputSelection: function () {
      var me = this,
        start = 0,
        end = 0,
        normalizedValue,
        range,
        textInputRange,
        len,
        endRange,
        el = me.input.dom;

      if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        start = el.selectionStart;
        end = el.selectionEnd;
      }
      else {
        range = document.selection.createRange();

        if (range && range.parentElement() == el) {
          len = el.value.length;
          normalizedValue = el.value.replace(/\r\n/g, "\n");

          // Create a working TextRange that lives only in the input
          textInputRange = el.createTextRange();
          textInputRange.moveToBookmark(range.getBookmark());

          // Check if the start and end of the selection are at the very end
          // of the input, since moveStart/moveEnd doesn't return what we want
          // in those cases
          endRange = el.createTextRange();
          endRange.collapse(false);

          if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
            start = end = len;
          } else {
            start = -textInputRange.moveStart("character", -len);
            start += normalizedValue.slice(0, start).split("\n").length - 1;

            if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
              end = len;
            } else {
              end = -textInputRange.moveEnd("character", -len);
              end += normalizedValue.slice(0, end).split("\n").length - 1;
            }
          }
        }
      }

      return {
        start: start,
        end: end
      };
    },
    /*
     *
     */
    enable: function () {
      var me = this;

      me.disabled = false;
      me.removeCls(FIELD_DISABLED_CLS);

      if(me.button){
        me.button.enable();
      }

      if(me.input){
        me.input.attr('tabIndex', me.tabIndex || 0);
      }
    },
    /*
     *
     */
    disable: function () {
      var me = this;

      me.disabled = true;
      me.addCls(FIELD_DISABLED_CLS);

      if(me.button){
        me.button.disable();
      }

      if(me.input){
        me.input.attr('tabIndex', -1);
      }
    },
    /*
     *
     */
    getInputValue: function () {
      var me = this;

      return me.input.dom.value;
    }
  };

})();