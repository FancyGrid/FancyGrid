/*
 * @class Fancy.grid.plugin.CellEdit
 * @extends Fancy.Plugin
 */
(function(){
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_CELL_CLS = F.GRID_CELL_CLS;

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
    init: function(){
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons: function(){
      var me = this,
        w = me.widget;

      w.once('render', function(){
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
    onDocClick: function(grid, e){
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
        var cellEl = targetEl.closest('.' + GRID_CELL_CLS);

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
    initEditorContainer: function(){
      var me = this,
        w = me.widget;

      me.editorsContainer = w.el.select('.' + me.editorsCls);
    },
    /*
     * @param {Object} o
     */
    edit: function(o){
      var me = this,
        w = me.widget,
        s = w.store,
        column = o.column;

      if (column.index === '$selected'){
        return;
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
    generateEditor: function(column){
      var me = this,
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

      var itemConfig = {
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
            }, {
              beforekey: me.onBeforeKey,
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
            valueKey = displayKey;
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
    showEditor: function(o){
      var me = this,
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
        setTimeout(function(){
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

      editor.focus();

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
      }

      w.fire('startedit', o);
    },
    /*
     * @param {Number} side
     */
    setEditorSize: function(size){
      var me = this;

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
    hideEditor: function(){
      var me = this,
        w = me.widget,
        s = w.store,
        key,
        value,
        o = me.activeCellEditParams,
        editor = me.activeEditor,
        column;

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

        var editorValue = editor.getValue();

        if(editorValue !== value){
          editor.setValue(value);
        }
        editor.hide();
        editor.hideErrorTip();
      }

      delete me.activeEditor;

      //Bug fix: when editor is out of side, grid el scrolls
      if (w.el.dom.scrollTop){
        w.el.dom.scrollTop = 0;
      }
    },
    /*
     * @param {Fancy.Element} cell
     * @return {Object}
     */
    getCellPosition: function(cell){
      var me = this,
        w = me.widget,
        cellEl = F.get(cell),
        cellOffset = cellEl.offset(),
        gridOffset = w.el.offset(),
        //leftBorder = w.panel?  parseInt(w.el.css('border-left-width')),
        leftBorder = parseInt(w.el.css('border-left-width')),
        //topBorder = parseInt(w.el.css('border-top-width')),
        topBorder = parseInt(getComputedStyle(w.el.dom)['border-top-width']),
        topFix = w.panel && F.nojQuery? 1 : 1,
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
    getCellSize: function(cell){
      var cellEl = F.get(cell),
        width = cellEl.dom.clientWidth + 2,
        height = cellEl.dom.clientHeight + 2;

      return {
        width: width,
        height: height
      };
    },
    /*
     * @param {Object} o
     */
    setEditorValue: function(o){
      var me = this,
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
          var format = o.column.format,
            date = F.Date.parse(o.value, format.read, format.mode);

          editor.set(date);
          break;
        default:
          editor.set(o.value);
      }
    },
    /*
     * @param {Object} editor
     * @param {String} value
     */
    onEditorEnter: function(){
      var me = this,
        w = me.widget,
        selection = w.selection || {};

      me.hideEditor();

      if(selection.selectBottomCellAfterEdit){
        w.selectCellDown();
        setTimeout(function(){
          w.el.select('.' + F.GRID_CELL_OVER_CLS).removeCls(F.GRID_CELL_OVER_CLS);
        }, 1);
      }
    },
    /*
     *
     */
    onHeaderCellMouseDown: function(){
      this.hideEditor();
    },
    /*
     * @param {String} value
     */
    setValue: function(value){
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

      //if(o.column.autoHeight){
      if(w.rowheight){
        //It could slow
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
    onEditorBeforeHide: function(editor){
      if (editor.isValid()){
        this.setValue(editor.getValue());
      }
    },
    /*
     *
     */
    onScroll: function(){
      this.hideEditor();
    },
    /*
     *
     */
    onNativeScroll: function(){
      this.hideEditor();
    },
    /*
     * @param {Object} field
     */
    onBlur: function(field){
      var me = this;

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
    prepareValue: function(value){
      var me = this,
        type = me.getActiveColumnType(),
        o = me.activeCellEditParams,
        column = o.column,
        format = column.format;

      if(format && format.beforeSaveFn){
        var editor = me.activeEditor;
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
            var date = column.editor.getDate();

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
    getActiveColumnType: function(){
      var o = this.activeCellEditParams,
        column = o.column;

      return column.type;
    },
    /*
     * @return {String}
     */
    getActiveColumnKey: function(){
      var o = this.activeCellEditParams,
        column = o.column,
        key = column.index;

      return key;
    },
    /*
     * @param {Object} o
     */
    onCheckBoxChange: function(o){
      var me = this,
        w = me.widget,
        column = o.column,
        key = column.index,
        s = w.store,
        value = me.checkBoxChangedValue;

      if (me.activeEditor){
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
    onComboChange: function(combo, value){
      var me = this,
        w = me.widget,
        s = w.store,
        o = me.activeCellEditParams,
        key = me.getActiveColumnKey(),
        newValue = combo.getDisplayValue(value);

      s.set(o.rowIndex, key, newValue);
      me.hideEditor();
    },
    /*
     *
     */
    checkAutoInitEditors: function(){
      var me = this,
        w = me.widget;

      F.each(w.columns, function(column){
        if (column.editorAutoInit){
          column.editor = me.generateEditor(column);
        }
      });
    },
    /*
     * @param {Object} editor
     * @param {String} value
     * @param {Object} e
     */
    onBeforeKey: function(field, value, e){
      var me = this,
        w = me.widget,
        selection = w.selection || {},
        key = F.key;

      switch (e.keyCode){
        case key.UP:
          if(selection.selectUpCellOnUp){
            me.hideEditor();
            w.selectCellUp();
            setTimeout(function(){
              w.el.select('.' + F.GRID_CELL_OVER_CLS).removeCls(F.GRID_CELL_OVER_CLS);
            }, 1);
          }
          break;
        case key.DOWN:
          if(selection.selectBottomCellOnDown){
            me.hideEditor();
            w.selectCellDown();
            setTimeout(function(){
              w.el.select('.' + F.GRID_CELL_OVER_CLS).removeCls(F.GRID_CELL_OVER_CLS);
            }, 1);
          }
          break;
        case key.LEFT:
          if(selection.selectLeftCellOnLeftEnd){
            var carret = field.getInputSelection();

            if(carret.start === 0 && carret.end === 0){
              me.hideEditor();
              w.selectCellLeft();
              setTimeout(function(){
                w.el.select('.' + F.GRID_CELL_OVER_CLS).removeCls(F.GRID_CELL_OVER_CLS);
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
              setTimeout(function(){
                w.el.select('.' + F.GRID_CELL_OVER_CLS).removeCls(F.GRID_CELL_OVER_CLS);
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
    getEditFormat: function(type){
      var me = this,
        w = me.widget,
        lang = w.lang,
        decimalSeparator = lang.decimalSeparator,
        thousandSeparator = lang.thousandSeparator;

      switch(type){
        case 'currency':
          return function(value, params){
            var currencySign = params.column.currency || lang.currencySign,
              precision = params.column.precision || 0;

            value = F.Number.currencyFormat(value, decimalSeparator, thousandSeparator, precision);

            if(value !== ''){
              value = currencySign + value;
            }

            return value;
          };
      }
    },
    getBeforeSaveFormat: function(type){
      var me = this,
        w = me.widget,
        lang = w.lang,
        thousandSeparator = lang.thousandSeparator;

      switch(type){
        case 'currency':
          return function(value, params){
            var currencySign = params.column.currency || lang.currencySign;

            value = value.replace(currencySign, '').replace(thousandSeparator, '');
            if(value !== ''){
              value = Number(value);
            }

            return value;
          };
      }
    },
    onComboAddNewValue: function(field, value){
      var me = this,
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