/*
 * @class Fancy.grid.plugin.CellEdit
 * @extends Fancy.Plugin
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  //CONSTANTS
  const GRID_CELL_CLS = F.GRID_CELL_CLS;
  const GRID_ACTIVE_CELL_ENABLED = F.GRID_ACTIVE_CELL_ENABLED;

  F.define('Fancy.grid.plugin.CellEdit', {
    extend: F.Plugin,
    ptype: 'grid.celledit',
    inWidgetName: 'celledit',
    editorsCls: 'fancy-grid-editors',
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function(){
      this.Super('const', arguments);
    },
    /*
     *
     */
    init(){
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons(){
      const me = this,
        w = me.widget;

      w.once('render', () => {
        me.initEditorContainer();
        me.checkAutoInitEditors();
        w.on('scroll', me.onScroll, me);
        w.on('nativescroll', me.onNativeScroll, me);
        w.on('docclick', me.onDocClick, me);
        w.on('headercellmousedown', me.onHeaderCellMouseDown, me);
      });
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} e
     */
    onDocClick(grid, e){
      var me = this,
        o = me.activeCellEditParams,
        editor = me.activeEditor,
        inCombo = true,
        target = e.target,
        targetEl = F.get(target);

      if (editor === undefined){
        return;
      }
      else if (o.column.type === 'date'){
        return;
      }
      else if (o.column.type === 'combo'){}
      else {
        const cellEl = targetEl.closest(`.${GRID_CELL_CLS}`);

        if (!cellEl.dom && !editor.el.within(target)){
          editor.hide();
        }
        return;
      }

      if (editor.el.within(target) === false && editor.list.within(target) === false && me.comboClick !== true){
        inCombo = false;
      }

      if (inCombo === false){
        editor.hide();
      }

      me.comboClick = false;
    },
    /*
     *
     */
    initEditorContainer(){
      const me = this,
        w = me.widget;

      me.editorsContainer = w.el.select(`.${me.editorsCls}`);
    },
    /*
     * @param {Object} o
     */
    edit(o){
      const me = this,
        w = me.widget,
        s = w.store,
        column = o.column;

      if (column.index === '$selected'){
        return;
      }

      if(w.selection && w.selection.activeCell){
        w.el.removeCls(GRID_ACTIVE_CELL_ENABLED);
      }

      me.activeCellEditParams = o;
      w.edit.activeCellEditParams = o;

      column.editor = me.generateEditor(column);

      //me.hideEditor();
      if(!s.infiniteScrolledToRow){
        w.scroller.scrollToCell(o.cell);
      }
      me.showEditor(o);
    },
    /*
     * @param {Object} column
     * @return {Object}
     */
    generateEditor(column){
      let me = this,
        w = me.widget,
        style = {
          position: 'absolute',
          left: '0px',
          top: '0px',
          display: 'none',
          padding: '0px'
        },
        type = column.type,
        editor,
        vtype = column.vtype,
        renderTo,
        theme = w.theme;

      if (column.editor){
        return column.editor;
      }

      renderTo = me.editorsContainer.dom;

      const itemConfig = {
        renderTo: renderTo,
        label: false,
        style: style,
        checkValidOnTyping: true,
        column: column
      };

      switch (type){
        case 'combo':
          var displayKey = 'text',
            valueKey = 'text',
            data = column.data,
            events = [{
              change: me.onComboChange,
              scope: me
            },{
              esc: me.onComboEsc,
              scope: me
            }, {
              beforekey: me.onBeforeKey,
              scope: me
            },{
              'add-new-value': me.onComboAddNewValue,
              scope: me
            }];

          if (column.editorEvents){
            var i = 0,
              iL = column.editorEvents.length;

            for (; i < iL; i++){
              events.push(column.editorEvents[i]);
            }
          }

          if (column.displayKey !== undefined){
            displayKey = column.displayKey;
            valueKey = column.valueKey || displayKey;
          }

          if (theme === 'default'){
            theme = undefined;
          }

          if(column.minListWidth){
            itemConfig.minListWidth = column.minListWidth;
          }

          if(column.subSearch){
            itemConfig.subSearch = column.subSearch;
          }

          Fancy.apply(itemConfig, {
            theme: theme,
            data: data,
            displayKey: displayKey,
            valueKey: valueKey,
            value: 0,
            padding: false,
            vtype: vtype,
            events: events
          });

          if(column.emptyText){
            itemConfig.emptyText = column.emptyText;
          }

          if(column.displayTpl){
            itemConfig.displayTpl = column.displayTpl;
          }

          if(column.listItemTpl){
            itemConfig.listItemTpl = column.listItemTpl;
          }

          if(column.leftTpl){
            itemConfig.leftTpl = column.leftTpl;
          }

          if(column.leftWidth){
            itemConfig.leftWidth = column.leftWidth;
          }

          editor = new F.Combo(itemConfig);
          break;
        case 'text':
          editor = new F.TextArea({
            renderTo: renderTo,
            label: false,
            style: style,
            vtype: vtype,
            checkValidOnTyping: true,
            events: [{
              enter: me.onEditorEnter,
              scope: me
            },{
              esc: me.onEditorEsc,
              scope: me
            }, {
              beforehide: me.onEditorBeforeHide,
              scope: me
            }, {
              blur: me.onBlur,
              scope: me
            },{
              beforekey: me.onBeforeKey,
              scope: me
            }]
          });
          break;
        case 'image':
        case 'string':
        case 'tree':
        case 'color':
          editor = new F.StringField({
            renderTo: renderTo,
            label: false,
            style: style,
            vtype: vtype,
            format: column.format,
            checkValidOnTyping: true,
            events: [{
              enter: me.onEditorEnter,
              scope: me
            },{
              esc: me.onEditorEsc,
              scope: me
            }, {
              beforehide: me.onEditorBeforeHide,
              scope: me
            }, {
              blur: me.onBlur,
              scope: me
            },{
              beforekey: me.onBeforeKey,
              scope: me
            }]
          });
          break;
        case 'number':
        case 'currency':
          F.apply(itemConfig, {
            vtype: vtype,
            format: column.format,
            events: [{
              enter: me.onEditorEnter,
              scope: me
            },{
              esc: me.onEditorEsc,
              scope: me
            }, {
              beforehide: me.onEditorBeforeHide,
              scope: me
            }, {
              blur: me.onBlur,
              scope: me
            },{
              beforekey: me.onBeforeKey,
              scope: me
            }]
          });

          if (column.spin !== undefined){
            itemConfig.spin = column.spin;
          }

          if (column.step !== undefined){
            itemConfig.step = column.step;
          }

          if (column.min !== undefined){
            itemConfig.min = column.min;
          }

          if (column.max !== undefined){
            itemConfig.max = column.max;
          }

          editor = new F.NumberField(itemConfig);
          break;
        case 'date':
          editor = new F.DateField({
            renderTo: renderTo,
            label: false,
            style: style,
            format: column.format,
            lang: w.lang,
            i18n: w.i18n,
            vtype: vtype,
            theme: theme,
            checkValidOnTyping: true,
            events: [{
              enter: me.onEditorEnter,
              scope: me
            },{
              esc: me.onEditorEsc,
              scope: me
            }, {
              beforehide: me.onEditorBeforeHide,
              scope: me
            }, {
              blur: me.onBlur,
              scope: me
            },{
              beforekey: me.onBeforeKey,
              scope: me
            }]
          });
          break;
        case 'checkbox':
        case 'switcher':
          break;
        default:
          F.error('Type ' + type + ' editor does not exit');
      }

      return editor;
    },
    /*
     * @param {Object} o
     */
    showEditor(o){
      const me = this,
        w = me.widget,
        column = o.column,
        type = column.type,
        //editor = me[type + 'Editor'],
        editor = column.editor,
        cell = o.cell,
        cellXY = me.getCellPosition(cell),
        cellSize = me.getCellSize(cell);

      w.fire('beforeedit', o);

      if(w.edit.stopped === true){
        w.edit.stopped = false;
        return;
      }

      if (type === 'combo'){
        me.comboClick = true;
      }

      if(!editor){
        if(column.editable !== false && column.index){
          switch (type){
            case 'checkbox':
            case 'switcher':
              w.setById(o.item.id, column.index, !o.value);
              break;
          }
        }
        return;
      }

      me.activeEditor = editor;

      me.setEditorValue(o);
      //Bug fix with wrong validation on start
      if(o.value === ''){
        setTimeout(() => {
          var value = editor.get();

          if(value === '' && editor.input){
            value = editor.input.dom.value;
          }

          editor.validate(value);
        }, 1);
      }

      if(o.rowIndex === 0){
        cellSize.height++;
      }

      if(column.minEditorWidth && cellSize.width < column.minEditorWidth){
        cellSize.width = column.minEditorWidth;
      }

      me.setEditorSize(cellSize);
      editor.show();
      editor.el.css(cellXY);

      if (type === 'combo' && editor.subSearch){}
      else{
        editor.focus();
      }

      if(editor.input && column.cellAlign){
        editor.input.css('text-align', column.cellAlign);

        if(column.type === 'date' && column.cellAlign === 'right'){
          editor.input.css('padding-right', '23px');
        }
      }

      if (type === 'combo'){
        if (o.value !== undefined){
          editor.set(o.value, false);
        }

        if(editor.subSearch){
          editor.showList();
        }
      }

      w.fire('startedit', o);
    },
    /*
     * @param {Number} side
     */
    setEditorSize(size){
      const me = this;

      if (me.activeEditor.wtype === 'field.combo'){
        me.activeEditor.size(size);
      }
      else {
        me.activeEditor.setInputSize({
          width: size.width,
          height: size.height
        });
      }
    },
    /*
     *
     */
    hideEditor(){
      var me = this,
        w = me.widget,
        s = w.store,
        key,
        value,
        o = me.activeCellEditParams,
        editor = me.activeEditor,
        column;

      if(!editor){
        return;
      }

      if(!editor.isVisible()){
        return;
      }

      w.fire('beforeendedit', o);

      if(w.selection && w.selection.activeCell){
        w.el.addCls(GRID_ACTIVE_CELL_ENABLED);
      }

      if (editor){
        column = o.column;
        value = editor.get();

        if(o.column.beforeSaveFormat){
          switch (F.typeOf(o.column.beforeSaveFormat)){
            case 'string':
              value = this.getBeforeSaveFormat(o.column.beforeSaveFormat)(value, o);
              break;
            case 'function':
              value = o.column.beforeSaveFormat(value, o);
              break;
          }
        }

        if (s.proxyType === 'server' && column.type !== 'combo'){
          key = me.getActiveColumnKey();
          value = me.prepareValue(value);

          //date field when data item value is null
          if(value === '' && s.get(o.rowIndex, key) === null){}
          else{
            s.set(o.rowIndex, key, value);
          }
        }

        const editorValue = editor.getValue();

        if(editorValue !== value){
          editor.setValue(value);
        }
        editor.hide();
        editor.hideErrorTip();
      }

      setTimeout(() => {
        delete me.activeEditor;
        w.fire('endedit', o);
      },1);

      //Bug fix: when editor is out of side, grid el scrolls
      if (w.el.dom.scrollTop){
        w.el.dom.scrollTop = 0;
      }
    },
    /*
     * @param {Fancy.Element} cell
     * @return {Object}
     */
    getCellPosition(cell){
      const me = this,
        w = me.widget,
        cellEl = F.get(cell),
        cellOffset = cellEl.offset(),
        gridOffset = w.el.offset(),
        //leftBorder = w.panel?  parseInt(w.el.css('border-left-width')),
        leftBorder = parseInt(w.el.css('border-left-width')),
        //topBorder = parseInt(w.el.css('border-top-width')),
        topBorder = parseInt(getComputedStyle(w.el.dom)['border-top-width']),
        topFix = w.panel && F.nojQuery ? 1 : 1,
        offset = {
          left: parseInt(cellOffset.left) - parseInt(gridOffset.left) - 1 - leftBorder + 'px',
          top: parseInt(cellOffset.top) - parseInt(gridOffset.top) - topFix - topBorder + 'px'
        };

      return offset;
    },
    /*
     * @param {Fancy.Element} cell
     * @return {Object}
     */
    getCellSize(cell){
      const cellEl = F.get(cell),
        width = cellEl.dom.clientWidth + 2,
        height = cellEl.dom.clientHeight + 2;

      return {
        width,
        height
      };
    },
    /*
     * @param {Object} o
     */
    setEditorValue(o){
      const me = this,
        editor = me.activeEditor;

      if(o.column.editFormat){
        switch (F.typeOf(o.column.editFormat)){
          case 'function':
            o.value = o.column.editFormat(o.value, o);
            break;
          case 'string':
            o.value = me.getEditFormat(o.column.editFormat)(o.value, o);
            break;
        }
      }

      switch (o.column.type){
        case 'combo':
          if (editor.valueIndex !== -1){
            editor.set(editor.getValueKey(o.value), false);
          }
          break;
        case 'date':
          if(!o.value){
            o.value = '';
          }
          const format = o.column.format,
            date = F.Date.parse(o.value, format.read, format.mode);

          editor.set(date);
          break;
        default:
          editor.set(o.value);
      }
    },
    /*
     * @param {Object} editor
     */
    onEditorEsc(){
      this.hideEditor();
    },
    /*
     * @param {Object} editor
     */
    onComboEsc(editor){
      const me = this;

      if(editor.list && editor.list.css('display') === 'block'){
        return;
      }

      if(editor.aheadList && editor.aheadList.css('display') === 'block'){
        return;
      }

      me.hideEditor();
    },
    /*
     * @param {Object} editor
     * @param {String} value
     */
    onEditorEnter(){
      const me = this,
        w = me.widget,
        selection = w.selection || {};

      me.hideEditor();

      if(selection.selectBottomCellAfterEdit){
        var cell = w.selectCellDown();
        setTimeout(()=> {
          w.el.select(`.${F.GRID_CELL_OVER_CLS}`).removeCls(F.GRID_CELL_OVER_CLS);
        }, 1);
      }

      switch(selection.continueEditOnEnter){
        case 'right':
          var cell = selection.moveRight();

          if(cell){
            setTimeout(() =>{
              w.editCell(cell);
            }, 100);
          }
          break;
        case 'bottom':
          var cell = selection.moveDown();

          if(cell){
            setTimeout(() => {
              w.editCell(cell);
            }, 100);
          }
          break;
      }
    },
    /*
     *
     */
    onHeaderCellMouseDown(){
      this.hideEditor();
    },
    /*
     * @param {String} value
     */
    setValue(value){
      var me = this,
        w = me.widget,
        s = w.store,
        key,
        o = me.activeCellEditParams,
        editor = me.activeEditor;

      if (editor === undefined){
        return;
      }

      if (editor.isValid() === false){
        return;
      }

      if (s.proxyType === 'server'){
        return;
      }

      if(w.rowheight){
        //It could be slow
        setTimeout(function(){
          w.update();
        },1);
      }

      key = me.getActiveColumnKey();

      value = me.prepareValue(value);

      if (editor.type === 'field.date' && editor.isEqual(s.get(o.rowIndex, key))){
        return;
      }

      s.set(o.rowIndex, key, value);
    },
    /*
     * @param {Object} editor
     */
    onEditorBeforeHide(editor){
      if (editor.isValid()){
        this.setValue(editor.getValue());
      }
    },
    /*
     *
     */
    onScroll(){
      this.hideEditor();
    },
    /*
     *
     */
    onNativeScroll(){
      this.hideEditor();
    },
    /*
     * @param {Object} field
     */
    onBlur(field){
      const me = this;

      if (!me.activeEditor || field.id === me.activeEditor.id){
        if (field.mouseDownSpinUp === true || field.mouseDownSpinDown){
          return;
        }

        me.hideEditor();
      }
    },
    /*
     * @param {*} value
     * @return {*}
     */
    prepareValue(value){
      const me = this,
        type = me.getActiveColumnType(),
        o = me.activeCellEditParams,
        column = o.column,
        format = column.format;

      if(format && format.beforeSaveFn){
        const editor = me.activeEditor;
        value = editor.input.dom.value;

        return format.beforeSaveFn(value);
      }

      switch (type){
        case 'number':
        case 'currency':
          if (format && format.inputFn){
            var _value = '',
              i = 0,
              iL = value.length;

            if (F.isNumber(value)){
              return value;
            }

            for (; i < iL; i++){
              if (!isNaN(Number(value[i]))){
                _value += value[i];
              }
            }

            value = _value;
          }
          else if (value !== ''){
            value = Number(value);
          }
          break;
        case 'date':
          if (column.format && column.format.read){
            const date = column.editor.getDate();

            if(value){
              value = F.Date.format(date, column.format.read, undefined, column.format.mode);
            }
          }
          break;
      }

      return value;
    },
    /*
     * @return {String}
     */
    getActiveColumnType(){
      const o = this.activeCellEditParams,
        column = o.column;

      return column.type;
    },
    /*
     * @return {String}
     */
    getActiveColumnKey(){
      const o = this.activeCellEditParams,
        column = o.column,
        key = column.index;

      return key;
    },
    /*
     * @param {Object} o
     */
    onCheckBoxChange(o){
      const me = this,
        w = me.widget,
        column = o.column,
        key = column.index,
        s = w.store,
        value = me.checkBoxChangedValue;

      if (me.activeEditor) {
        me.hideEditor();
      }

      if (me.checkBoxChangedValue === undefined){
        return;
      }

      delete me.checkBoxChangedValue;

      me.activeCellEditParams = o;
      w.edit.activeCellEditParams = o;
      s.set(o.rowIndex, key, value);
    },
    /*
     * @param {Object} combo
     * @param {*} value
     */
    onComboChange(combo, value){
      const me = this,
        w = me.widget,
        s = w.store,
        o = me.activeCellEditParams,
        key = me.getActiveColumnKey();//,
        //newValue = combo.getDisplayValue(value);

      //s.set(o.rowIndex, key, newValue);
      s.set(o.rowIndex, key, value);
      me.hideEditor();
    },
    /*
     *
     */
    checkAutoInitEditors(){
      const me = this,
        w = me.widget;

      F.each(w.columns, (column) => {
        if (column.editorAutoInit) {
          column.editor = me.generateEditor(column);
        }
      });
    },
    /*
     * @param {Object} editor
     * @param {String} value
     * @param {Object} e
     */
    onBeforeKey(field, value, e){
      const me = this,
        w = me.widget,
        selection = w.selection || {},
        key = F.key;

      switch (e.keyCode){
        case key.UP:
          if(selection.selectUpCellOnUp){
            me.hideEditor();
            w.selectCellUp();
            setTimeout(() => {
              w.el.select(`.${F.GRID_CELL_OVER_CLS}`).removeCls(F.GRID_CELL_OVER_CLS);
            }, 1);
          }
          break;
        case key.DOWN:
          if(selection.selectBottomCellOnDown){
            me.hideEditor();
            w.selectCellDown();
            setTimeout(() => {
              w.el.select(`.${F.GRID_CELL_OVER_CLS}`).removeCls(F.GRID_CELL_OVER_CLS);
            }, 1);
          }
          break;
        case key.LEFT:
          if(selection.selectLeftCellOnLeftEnd){
            var carret = field.getInputSelection();

            if(carret.start === 0 && carret.end === 0){
              me.hideEditor();
              w.selectCellLeft();
              setTimeout(() => {
                w.el.select(`.${F.GRID_CELL_OVER_CLS}`).removeCls(F.GRID_CELL_OVER_CLS);
              }, 1);
            }
          }
          break;
        case key.RIGHT:
          if(selection.selectRightCellOnEnd){
            var carret = field.getInputSelection(),
              length = field.input.dom.value.length;

            if(carret.start === length && carret.end === length){
              me.hideEditor();
              w.selectCellRight();
              setTimeout(() => {
                w.el.select(`.${F.GRID_CELL_OVER_CLS}`).removeCls(F.GRID_CELL_OVER_CLS);
              }, 1);
            }
          }
          break;
      }
    },
    /*
     * @param {String} value
     * @return Function
     */
    getEditFormat(type){
      const me = this,
        w = me.widget,
        lang = w.lang,
        decimalSeparator = lang.decimalSeparator,
        thousandSeparator = lang.thousandSeparator;

      switch(type){
        case 'currency':
          return function(value, params){
            const currencySign = params.column.currency || lang.currencySign,
              precision = params.column.precision || 0;

            value = F.Number.currencyFormat(value, decimalSeparator, thousandSeparator, precision);

            if(value !== ''){
              value = currencySign + value;
            }

            return value;
          };
      }
    },
    getBeforeSaveFormat(type){
      const me = this,
        w = me.widget,
        lang = w.lang,
        thousandSeparator = lang.thousandSeparator;

      switch(type){
        case 'currency':
          return function(value, params){
            const currencySign = params.column.currency || lang.currencySign;

            value = value.replace(currencySign, '').replace(thousandSeparator, '');
            if(value !== ''){
              value = Number(value);
            }

            return value;
          };
      }
    },
    onComboAddNewValue(field, value){
      const me = this,
        w = me.widget,
        column = field.column,
        index = column.index,
        data = column.data;

      if(F.isObject(data[0])){
        data.push({
          text: value,
          value: value
        });
      }
      else{
        data.push(value);
      }

      w.setColumnComboData(index, data);
    }
  });

})();
