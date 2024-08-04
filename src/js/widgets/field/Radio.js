/*
 * @class Fancy.Radio
 * @extends Fancy.Widget
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  //CONSTANTS
  const CLEARFIX_CLS = F.CLEARFIX_CLS;
  const FIELD_CLS = F.FIELD_CLS;
  const FIELD_RADIO_CLS = F.FIELD_RADIO_CLS;
  const FIELD_RADIO_COLUMN_CLS = F.FIELD_RADIO_COLUMN_CLS;
  const FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;
  const FIELD_RADIO_ON_CLS = F.FIELD_RADIO_ON_CLS;
  const FIELD_RADIO_INPUT_CLS = F.FIELD_RADIO_INPUT_CLS;
  const FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  const FIELD_ERROR_CLS = F.FIELD_ERROR_CLS;

  F.define(['Fancy.form.field.Radio', 'Fancy.Radio'], {
    mixins: [
      F.form.field.Mixin
    ],
    extend: F.Widget,
    type: 'field.radio',
    /*
     * @private
     */
    radioRows: 1,
    /*
     * @constructor
     */
    constructor: function(){
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function(){
      const me = this;

      me.addEvents('focus', 'blur', 'input', 'up', 'down', 'change', 'key');
      me.Super('init', arguments);

      let itemsHTML = '';

      if (me.column) {
        me.cls += ' ' + FIELD_RADIO_COLUMN_CLS;
        itemsHTML += '<div style="margin-left: ' + ( me.labelWidth ) + 'px;">';
      }

      F.each(me.items, (item, i) => {
        let marginLeft = '',
          itemCls = FIELD_TEXT_CLS;

        if (!me.column && i !== 0) {
          marginLeft = 'margin-left:10px;';
        }

        if (item.value === me.value) {
          itemCls += ' ' + FIELD_RADIO_ON_CLS;
        }

        itemsHTML += [
          '<div class="' + itemCls + '" value=' + item.value + '>',
          '<div class="' + FIELD_RADIO_INPUT_CLS + '" style="float:left;' + marginLeft + '"></div>',
          '<div style="float:left;margin:7px 0 0 0;">' + item.text + '</div>',
          '</div>'
        ].join('');
      });

      if (me.column) {
        itemsHTML += '</div>';
      }

      me.itemsHTML = itemsHTML;

      me.preRender();
      me.render();
      me.setColumnsStyle();
      me.acceptedValue = me.value;
      me.set(me.value);

      me.ons();
    },
    labelText: '',
    labelWidth: 60,
    value: false,
    checkedCls: FIELD_RADIO_ON_CLS,
    fieldCls: FIELD_CLS + ' ' + FIELD_RADIO_CLS,
    tpl: [
      '<div class="' + FIELD_LABEL_CLS + '" style="{labelWidth}{labelDisplay}">',
        '{label}',
        '<div class="' + FIELD_ERROR_CLS + '" style="{errorTextStyle}"></div>',
      '</div>',
        '{itemsHTML}',
      '<div class="' + CLEARFIX_CLS + '"></div>'
    ],
    /*
     *
     */
    ons(){
      const me = this,
        el = this.el;

      el.$dom.delegate(`.${FIELD_TEXT_CLS}`, 'click', function(){
        if(me.disabled){
          return;
        }
        me.set(F.get(this).attr('value'));
      });

      el.on('mousedown', me.onMouseDown, me);

      el.on('mouseenter', me.onMouseOver, me);
      el.on('mouseleave', me.onMouseOut, me);

      if (me.tip){
        el.on('mousemove', me.onMouseMove, me);
      }
    },
    /*
     *
     */
    onClick(){
      const me = this,
        checkedCls = me.checkedCls;

      if(me.disabled){
        return;
      }

      me.addCls(checkedCls);
      me.toggleCls(checkedCls);

      me.value = me.hasCls(checkedCls);

      me.fire('change', me.value);
    },
    /*
     * @param {Object} e
     */
    onMouseDown(e){
      if(this.disabled){
        e.stopPropagation();
      }
      e.preventDefault();
    },
    /*
     * @param {*} value
     * @param {Boolean} onInput
     */
    set(value, fire){
      const me = this,
        el = me.el,
        checkedCls = me.checkedCls,
        radioEls = el.select(`.${FIELD_TEXT_CLS}`);

      radioEls.removeCls(checkedCls);

      el.select('[value=' + value + ']').addCls(checkedCls);

      me.value = value;
      if (fire !== false){
        me.fire('change', me.value);
      }
    },
    /*
     * @param {*} value
     * @param {Boolean} onInput
     */
    setValue(value, onInput){
      this.set(value, onInput);
    },
    /*
     * @return {*} value
     */
    getValue(){
      return this.value;
    },
    /*
     * @return {*} value
     */
    get(){
      return this.getValue();
    },
    /*
     *
     */
    clear(){
      this.set(false);
    },
    /*
     *
     */
    calcColumns(){
      var me = this,
        maxChars = 0,
        inputWidth = me.width;

      if (me.labelAlign !== 'top' && me.label){
        inputWidth -= me.labelWidth;
        inputWidth -= 20;
      }

      F.Array.each(me.items, function(item){
        if (item.text.length > maxChars){
          maxChars = item.text.length;
        }
      });

      let columns = Math.floor(inputWidth / (maxChars * 7 + 30));

      if (me.columns && me.columns <= columns){
        columns = me.columns;
      }
      else {
        me.columns = columns;
      }

      me.columnWidth = Math.ceil(inputWidth / columns);
      me.rows = Math.ceil(me.items.length / columns);
    },
    /*
     *
     */
    setColumnsStyle(){
      const me = this;

      if (!me.columns || me.rows === 1) {
        return;
      }

      const radioEls = me.el.select(`.${FIELD_TEXT_CLS}`),
        radioInputs = me.el.select(`.${FIELD_TEXT_CLS} .${FIELD_RADIO_INPUT_CLS}`);

      radioEls.each((item, i) => {
        if (i % me.columns === 0){
          radioInputs.item(i).css('margin-left', '0px');
        }

        item.css('width', me.columnWidth);
      });
    }
  });

})();
