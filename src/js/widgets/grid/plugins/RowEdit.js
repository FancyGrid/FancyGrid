/*
 * @class Fancy.grid.plugin.RowEdit
 */
(function(){
  //SHORTCUTS
  const F = Fancy;
  const E = F.each;

  //CONSTANTS
  const GRID_CELL_CLS = F.GRID_CELL_CLS;
  const FIELD_CLS = F.FIELD_CLS;
  const GRID_ROW_EDIT_CLS = F.GRID_ROW_EDIT_CLS;
  const GRID_ROW_EDIT_BUTTONS_CLS = F.GRID_ROW_EDIT_BUTTONS_CLS;
  const GRID_ROW_EDIT_BUTTON_UPDATE_CLS = F.GRID_ROW_EDIT_BUTTON_UPDATE_CLS;
  const GRID_ROW_EDIT_BUTTON_CANCEL_CLS = F.GRID_ROW_EDIT_BUTTON_CANCEL_CLS;
  const GRID_ACTIVE_CELL_ENABLED = F.GRID_ACTIVE_CELL_ENABLED;

  const ANIMATE_DURATION = F.ANIMATE_DURATION;

  F.define('Fancy.grid.plugin.RowEdit', {
    extend: F.Plugin,
    ptype: 'grid.rowedit',
    inWidgetName: 'rowedit',
    rendered: false,
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

      w.on('scroll', me.onScroll, me);
      w.on('columnresize', me.onColumnResize, me);

      w.on('lockcolumn', me.onLockColumn, me);
      w.on('rightlockcolumn', me.onRightLockColumn, me);
      w.on('unlockcolumn', me.onUnLockColumn, me);

      w.on('beforecolumndrag', me.onBeforeColumnDrag, me);
      w.on('columndrag', me.onColumnDrag, me);
      w.on('columnhide', me.onColumnHide, me);
      w.on('columnshow', me.onColumnShow, me);

      if(w.grouping && w.grouping.by){
        w.on('collapse', me.onCollapse, me);
        w.on('expand', me.onExpand, me);
      }
    },
    /*
     *
     */
    onCollapse(){
      this.hide();
    },
    /*
     *
     */
    onExpand(){
      this.hide();
    },
    /*
     * @param {Object} o
     */
    edit(o){
      const me = this,
        w = me.widget,
        column = o.column;

      if (column && column.index === '$selected'){
        return;
      }

      me.activeCellEditParams = o;

      w.scroller.scrollToCell(o.cell);
      me.showEditor(o);
    },
    /*
     * @param {Object} o
     */
    showEditor(o){
      const me = this,
        w = me.widget;

      if(w.selection && w.selection.activeCell){
        w.el.removeCls(GRID_ACTIVE_CELL_ENABLED);
      }

      w.fire('beforeedit', o);

      if(w.edit.stopped === true){
        w.edit.stopped = false;
        return;
      }

      me.changed = {};

      for(var p in o.data){
        if(o.data[p] === null){
          o.data[p] = '';
        }
      }

      if (!me.rendered){
        me.render();
        me.changePosition(o.rowIndex, false);
        me.setValues(o);
      }
      else {
        const isHidden = me.el.css('display') === 'none';
        me.show();
        me.changePosition(o.rowIndex, !isHidden);

        if(!isHidden){
          setTimeout(function(){
            me.setValues(o);
          }, F.ANIMATE_DURATION);
        }
        else {
          me.setValues(o);
        }
      }

      me.setSizes(o);
    },
    /*
     *
     */
    render(){
      const me = this,
        w = me.widget;

      if (w.leftColumns){
        me.leftEl = me.renderTo(w.leftBody.el, w.leftColumns);
      }

      if (w.columns){
        me.el = me.renderTo(w.body.el, w.columns);
      }

      if (w.rightColumns){
        me.rightEl = me.renderTo(w.rightBody.el, w.rightColumns);
      }

      me.renderButtons();

      me.rendered = true;
    },
    /*
     * @param {Object} renderTo
     * @param {Array} columns
     *  @param {Number} order
     * @param {String} side
     * @param {String} fromSide
     * @return {Fancy.Element}
     */
    renderTo(renderTo, columns, order, side, fromSide){
      const fieldEls = renderTo.select('.' + FIELD_CLS);
      var me = this,
        w = me.widget,
        container = F.get(document.createElement('div')),
        el,
        i = 0,
        iL = columns.length,
        theme = w.theme,
        column,
        style = {
          'float': 'left',
          margin: '0px',
          padding: '0px'
        },
        renderAfter,
        renderBefore;

      if (!side){
        container.addCls(GRID_ROW_EDIT_CLS);
        el = F.get(renderTo.dom.appendChild(container.dom));
      }
      else {

        i = order;
        iL = order + 1;

        switch (side){
          case 'right':
            if(fieldEls.length){
              renderBefore = fieldEls.item(order);
            }
            break;
          case 'left':
            if(fieldEls.length){
              renderAfter = fieldEls.item(order);
            }
            break;
          case 'center':
            switch (fromSide){
              case 'left':
                renderBefore = fieldEls.item(0);
                break;
              case 'right':
                renderAfter = fieldEls.item(fieldEls.length - 1);
                break;
            }
            break;
        }
      }

      if(i === -1){
        i = 0;
        iL = 1;
      }

      for (; i < iL; i++){
        column = columns[i];

        const columnWidth = column.width;

        const itemConfig = {
          index: column.index,
          label: false,
          style,
          width: columnWidth,
          vtype: column.vtype,
          format: column.format,
          stopPropagation: true,
          theme,
          checkValidOnTyping: true,
          events: [{
            change: me.onFieldChange,
            delay: 100,
            scope: me
          }, {
            empty: me.onFieldEmpty,
            delay: 100,
            scope: me
          }, {
            enter: me.onFieldEnter,
            scope: me
          }]
        };

        switch (side){
          case 'left':
            if(renderAfter){
              itemConfig.renderAfter = renderAfter;
            }
            else{
              itemConfig.renderTo = renderTo.dom;
            }
            break;
          case 'right':
            if(renderBefore){
              itemConfig.renderBefore = renderBefore;
            }
            else{
              itemConfig.renderTo = renderTo.dom;
            }
            break;
          case 'center':
            switch (fromSide){
              case 'left':
                itemConfig.renderBefore = fieldEls.item(0);
                break;
              case 'right':
                itemConfig.renderAfter = fieldEls.item(fieldEls.length - 1);
                break;
            }
            break;
          default:
            itemConfig.renderTo = el.dom;
        }

        var editor;

        if (column.editable === false){
          switch (column.type){
            case 'string':
            case 'number':
              editor = new F.TextField(itemConfig);
              break;
            default:
              editor = new F.EmptyField(itemConfig);
          }
        }
        else {
          switch (column.type){
            case 'date':
              if (column.format){
                itemConfig.format = column.format;
              }

              editor = new F.DateField(itemConfig);
              break;
            case 'image':
            case 'string':
            case 'text':
            case 'color':
              editor = new F.StringField(itemConfig);
              break;
            case 'number':
            case 'currency':
              if (column.spin){
                itemConfig.spin = column.spin;
              }

              if (column.step){
                itemConfig.step = column.step;
              }

              if (column.min){
                itemConfig.min = column.min;
              }

              if (column.max){
                itemConfig.max = column.max;
              }

              editor = new F.NumberField(itemConfig);
              break;
            case 'combo':
              F.apply(itemConfig, {
                data: column.data,
                value: -1,
                padding: false
              });

              if (column.displayKey){
                itemConfig.displayKey = column.displayKey;
                itemConfig.valueKey = column.valueKey || column.displayKey;
              }
              else {
                itemConfig.displayKey = 'text';
                itemConfig.valueKey = 'text';
              }

              if(column.minListWidth){
                itemConfig.minListWidth = column.minListWidth;
              }

              if(column.subSearch){
                itemConfig.subSearch = column.subSearch;
              }

              editor = new F.Combo(itemConfig);
              break;
            case 'checkbox':
              var paddingLeft;
              switch (column.cellAlign){
                case 'left':
                  paddingLeft = 7;
                  break;
                case 'center':
                  paddingLeft = (column.width - 20 - 2) / 2;
                  break;
                case 'right':
                  paddingLeft = (column.width - 20) / 2 + 11;
                  break;
              }

              F.apply(itemConfig, {
                renderId: true,
                value: false,
                style: {
                  padding: '0px',
                  display: 'inline-block',
                  'padding-left': paddingLeft,
                  'float': 'left',
                  margin: '0px'
                }
              });

              editor = new F.CheckBox(itemConfig);
              break;
            case 'switcher':
              var paddingLeft;
              switch (column.cellAlign){
                case 'left':
                case undefined:
                  paddingLeft = 7;
                  break;
                case 'center':
                  paddingLeft = (column.width - 20 - 2) / 2;
                  break;
                case 'right':
                  paddingLeft = (column.width - 20) / 2 + 11;
                  break;
              }

              F.apply(itemConfig, {
                renderId: true,
                value: false,
                style: {
                  padding: '0px',
                  display: 'inline-block',
                  'padding-left': paddingLeft,
                  'float': 'left',
                  margin: '0px'
                }
              });

              editor = new F.Switcher(itemConfig);
              break;
            default:
              editor = new F.EmptyField(itemConfig);
          }
        }

        if(editor.input && column.cellAlign){
          editor.input.css('text-align', column.cellAlign);
        }

        column.rowEditor = editor;

        if(column.hidden){
          editor.hide();
        }
      }

      return el;
    },
    /*
     *
     */
    renderButtons(){
      var me = this,
        w = me.widget,
        lang = w.lang,
        container = F.get(document.createElement('div')),
        el;

      container.addCls(GRID_ROW_EDIT_BUTTONS_CLS);

      el = F.get(w.body.el.dom.appendChild(container.dom));

      me.buttonsEl = el;

      me.buttonUpdate = new F.Button({
        cls: GRID_ROW_EDIT_BUTTON_UPDATE_CLS,
        renderTo: el.dom,
        text: lang.update,
        events: [{
          click: me.onClickUpdate,
          scope: me
        }]
      });

      me.buttonCancel = new F.Button({
        cls: GRID_ROW_EDIT_BUTTON_CANCEL_CLS,
        renderTo: el.dom,
        text: lang.cancel,
        events: [{
          click: me.onClickCancel,
          scope: me
        }]
      });
    },
    /*
     *
     */
    setSizes(o){
      const me = this,
        w = me.widget;

      if (w.leftColumns){
        me._setSizes(w.leftBody.el.select('.' + GRID_CELL_CLS + '[index="0"]'), w.leftColumns, 'left');
      }

      if (w.columns){
        me._setSizes(w.body.el.select('.' + GRID_CELL_CLS + '[index="0"]'), w.columns);
      }

      if (w.rightColumns){
        me._setSizes(w.rightBody.el.select('.' + GRID_CELL_CLS + '[index="0"]'), w.rightColumns, 'right');
      }

      me.setElSize(o);
    },
    /*
     *
     */
    setElSize(o){
      var me = this,
        w = me.widget,
        centerWidth = w.getCenterViewWidth(),
        centerFullWidth = w.getCenterFullWidth(),
        rowHeight;

      if (centerWidth < centerFullWidth){
        me.el.css('width', centerFullWidth + 2);
      }

      if(o && o.cell){
        //rowHeight = o.cell.clientHeight + 2;
        rowHeight = o.cell.clientHeight + 3;

        me.el.css( 'height', rowHeight + 'px' );

        if (w.leftColumns){
          me.leftEl.css( 'height', rowHeight + 'px' );
        }

        if (w.rightColumns){
          me.rightEl.css( 'height', rowHeight + 'px' );
        }
      }

      //me.el.css('height', '');
    },
    /*
     * @private
     * @param {Fancy.Elements} firstRowCells
     * @param {Array} columns
     * @param {String} side
     */
    _setSizes(firstRowCells, columns, side){
      var me = this,
        i = 0,
        iL = columns.length,
        column,
        cellSize,
        cell,
        editor,
        borderWidth = 1,
        offset = 2;

      for (; i < iL; i++){
        column = columns[i];
        cell = firstRowCells.item(i).dom;
        cellSize = me.getCellSize(cell);
        editor = column.rowEditor;

        if (!editor){
          continue;
        }

        if ((side === 'left' || side === 'right') && i === iL - 1){
          cellSize.width--;
        }

        if(side === 'left' && column.type === 'select'){
          cellSize.width--;
        }

        cellSize.height -= 1;

        if (i === iL - 1){
          editor.el.css('width', (cellSize.width - 2));
        }
        else {
          editor.el.css('width', (cellSize.width - 1));
        }

        editor.el.css('height', (cellSize.height));

        cellSize.width -= borderWidth * 2;
        cellSize.width -= offset * 2;

        cellSize.height -= offset * 2;

        me.setEditorSize(editor, cellSize);
      }
    },
    //Dublication code from Fancy.grid.plugin.CellEdit
    /*
     * @param {Fancy.Element} cell
     * @return {Object}
     */
    getCellSize(cell){
      var cellEl = F.get(cell),
        width = cellEl.width(),
        height = cellEl.height(),
        coeficient = 2;

      //if (F.nojQuery && w.panelBorderWidth === 2){
      if (F.nojQuery){
        coeficient = 1;
      }

      width += parseInt(cellEl.css('border-right-width')) * coeficient;
      height += parseInt(cellEl.css('border-bottom-width')) * coeficient;

      return {
        width,
        height
      };
    },
    /*
     * @param {Object} editor
     * @param {Number} size
     */
    setEditorSize(editor, size){
      if (editor.wtype === 'field.combo'){
        editor.size(size);

        editor.el.css('width', size.width + 5);
      }
      else {
        editor.setInputSize({
          width: size.width,
          height: size.height
        });
      }
    },
    /*
     * @param {Number} rowIndex
     * @param {Boolean} animate
     */
    changePosition(rowIndex, animate){
      var me = this,
        w = me.widget,
        scrollTop = w.infinite? 0 : w.scroller.getScroll(),
        bottomScroll = w.scroller.getBottomScroll(),
        newTop = w.cellHeight * rowIndex - 1 - scrollTop,
        plusTop = 0;

      if(w.grouping && w.grouping.by){
        plusTop += w.grouping.getOffsetForRow(rowIndex);
        newTop += plusTop;
      }

      if (me.leftEl){
        if (animate !== false){
          me.leftEl.animate({
            top: newTop
          }, ANIMATE_DURATION);
        }
        else {
          me.leftEl.css('top', newTop);
        }
      }

      if (me.el){
        if (animate !== false){
          me.el.animate({
            top: newTop
          }, ANIMATE_DURATION);
        }
        else {
          me.el.css('top', newTop);
        }
      }

      if (me.rightEl){
        if (animate !== false){
          me.rightEl.animate({
            top: newTop
          }, ANIMATE_DURATION);
        }
        else {
          me.rightEl.css('top', newTop);
        }
      }

      var showOnTop = w.getViewTotal() - 3 < rowIndex,
        buttonTop = newTop;

      if (rowIndex < 3){
        showOnTop = false;
      }

      if (showOnTop){
        if(w.grouping && w.grouping.by){
          if (w.getViewTotal() - 3 < rowIndex - w.grouping.getSpecialRowsUnder(rowIndex)){
            buttonTop = newTop - parseInt(me.buttonsEl.css('height')) + 1;
          }
          else {
            buttonTop = newTop + w.cellHeight;
            showOnTop = false;
          }
        }
        else {
          buttonTop = newTop - parseInt(me.buttonsEl.css('height')) + 1;
        }
      }
      else {
        buttonTop = newTop + w.cellHeight;
      }

      if(F.nojQuery){
        buttonTop += 1;
      }

      if (animate !== false){
        me.buttonsEl.animate({
          top: buttonTop
        }, ANIMATE_DURATION);
      }
      else {
        me.buttonsEl.css('top', buttonTop);
      }

      me.el.css('left', -bottomScroll);

      me.changeButtonsLeftPos();

      me.activeRowIndex = rowIndex;
    },
    /*
     *
     */
    changeButtonsLeftPos(){
      const me = this,
        w = me.widget,
        viewWidth = w.getCenterViewWidth(),
        buttonsElWidth = parseInt(me.buttonsEl.css('width'));

      me.buttonsEl.css('left', (viewWidth - buttonsElWidth) / 2);
    },
    /*
     * @param {Object} o
     */
    setValues(o){
      const me = this,
        w = me.widget;

      if (w.leftColumns){
        me._setValues(o.data, w.leftColumns);
      }

      if (w.columns){
        me._setValues(o.data, w.columns);
      }

      if (w.rightColumns){
        me._setValues(o.data, w.rightColumns);
      }

      me.activeId = o.id;
      me.activeRowIndex = o.rowIndex;
    },
    /*
     * @private
     * @param {Array} data
     * @param {Array} columns
     */
    _setValues(data, columns){
      const me = this;

      E(columns, function(column){
        const editor = column.rowEditor;

        if (editor) {
          switch (column.type){
            case 'action':
            case 'button':
            case 'order':
            case 'select':
            case 'expand':
            case 'rowdrag':
              break;
            default:
              var value = data[column.index];
              if(value === undefined){
                value = '';
              }

              if(column.editFormat){
                switch (F.typeOf(column.editFormat)){
                  case 'function':
                    value = column.editFormat(value, {column: column});
                    break;
                  case 'string':
                    value = me.getEditFormat(column.editFormat)(value, {column: column});
                    break;
                }
              }

              editor.set(value, false);
          }
        }
      });
    },
    /*
     *
     */
    onScroll(){
      const me = this,
        w = me.widget;

      if (me.rendered === false){
        return;
      }

      if(w.infinite){
        me.hide();
      }

      if (me.activeRowIndex !== undefined){
        me.changePosition(me.activeRowIndex, false);
      }
    },
    /*
     *
     */
    onColumnResize(){
      const me = this;

      if (me.rendered === false){
        return;
      }

      if(F.nojQuery){
        setTimeout(() => {
          me.setSizes();
        }, 400);
      }
      else {
        setTimeout(() => {
          me.setSizes();
        }, ANIMATE_DURATION);
      }
    },
    /*
     *
     */
    onClickUpdate(){
      this.saveChanges();
    },
    /*
     *
     */
    saveChanges(){
      var me = this,
        w = me.widget,
        s = w.store,
        data = me.prepareChanged(),
        rowIndex = s.getRow(me.activeId),
        values = me.getComboNewValues();

      for(const p in values){
        const _values = s.getColumnUniqueData(p);
        if(F.isString(_values[0])){
          _values.push(values[p]);
        }
        else{
          _values.push({
            value: values[p],
            text: values[p]
          });
        }
        w.setColumnComboData(p, _values);
      }

      F.apply(data, values);
      s.setItemData(rowIndex, data);
      w.update();

      me.hide();
    },
    /*
     *
     */
    prepareChanged(){
      const me = this,
        w = me.widget,
        data = me.changed;

      for (const p in data){
        const column = w.getColumnByIndex(p);

        switch (column.type){
          case 'date':
            const date = F.Date.parse(data[p], column.format.edit, column.format.mode),
              formattedValue = F.Date.format(date, column.format.read, column.format.mode);

            data[p] = formattedValue;
            break;
        }
      }

      return data;
    },
    /*
     *
     */
    onClickCancel(){
      this.hide();
    },
    /*
     *
     */
    hide(){
      const me = this,
        w = me.widget;

      w.fire('beforeendedit', me.activeCellEditParams);

      if(w.selection && w.selection.activeCell){
        w.el.addCls(GRID_ACTIVE_CELL_ENABLED);
      }

      if (!me.el){
        return;
      }

      if (me.leftEl){
        me.leftEl.hide();
      }

      me.el.hide();

      if (me.rightEl){
        me.rightEl.hide();
      }

      me.buttonsEl.hide();

      w.fire('endedit', me.activeCellEditParams);
    },
    /*
     *
     */
    show(){
      const me = this;

      if (me.leftEl){
        if(me.leftEl.css('display') === 'none'){
          me.leftEl.css('opacity', 0);
        }
        me.leftEl.show();
        me.leftEl.animate({opacity: 1 }, ANIMATE_DURATION);
      }

      if(me.el.css('display') === 'none'){
        me.el.css('opacity', 0);
      }
      me.el.show();
      me.el.animate({opacity: 1 }, ANIMATE_DURATION);

      if (me.rightEl){
        if(me.rightEl.css('display') === 'none'){
          me.rightEl.css('opacity', 0);
        }
        me.rightEl.show();
        me.rightEl.animate({opacity: 1 }, ANIMATE_DURATION);
      }

      if(me.buttonsEl.css('display') === 'none'){
        me.buttonsEl.css('opacity', 0);
      }
      me.buttonsEl.show();
      me.buttonsEl.animate({opacity: 1 }, ANIMATE_DURATION);
    },
    /*
     * @param {Object} field
     * @param {*} newValue
     * @param {*} oldValue
     */
    onFieldChange(field, newValue){
      const me = this;

      if (!field.isValid()){
        delete me.changed[field.index];
      }
      else {
        me.changed[field.index] = newValue;
      }
    },
    onFieldEmpty(field){
      const me = this;

      if (field.vtype && !field.isValid()){
        delete me.changed[field.index];
      }
      else {
        me.changed[field.index] = '';
      }
    },
    /*
     *
     */
    onFieldEnter(){
      this.saveChanges();
    },
    /*
     * @param {Number} index
     * @param {String} side
     */
    hideField(index, side){
      const w = this.widget,
        columns = w.getColumns(side),
        column = columns[index];

      if (column.rowEditor){
        column.rowEditor.hide();
      }
    },
    /*
     * @param {Number} index
     * @param {String} side
     */
    showField(index, side){
      const w = this.widget,
        columns = w.getColumns(side),
        column = columns[index];

      if (column.rowEditor){
        column.rowEditor.show();
      }
    },
    /*
     * @param {Object} column
     * @param {Number} index
     * @param {String} side
     * @param {String} fromSide
     */
    moveEditor(column, index, side, fromSide){
      var me = this,
        w = me.widget,
        s = w.store,
        columns = w.getColumns(side),
        editor = column.rowEditor,
        body = w.getBody(side),
        rowEditRowEl = body.el.select('.' + GRID_ROW_EDIT_CLS),
        item = s.getById(me.activeId),
        value = item.get(column.index),
        field;

      if(!rowEditRowEl.dom){
        return;
      }

      if (me.activeId === undefined){
        value = s.ge1t(me.activeRowIndex)[column.index];
      }

      editor.destroy();
      me.renderTo(rowEditRowEl, columns, index, side, fromSide);

      field = me.getField(index, side);
      column.rowEditor = field;

      field.set(value);
      me.setSizes();

      me.changeButtonsLeftPos();
      me.reSetColumnsEditorsLinks();
    },
    /*
     * @param {Number} index
     * @param {String} side
     * @return {Object}
     */
    getField(index, side){
      var w = this.widget,
        body = w.getBody(side),
        field;

      switch (side){
        case 'left':
          index++;
          break;
      }

      field = F.getWidget(body.el.select('.' + GRID_ROW_EDIT_CLS + ' .' + FIELD_CLS).item(index).attr('id'));

      return field;
    },
    /*
     *
     */
    reSetColumnsEditorsLinks(){
      var me = this,
        w = me.widget,
        cells = w.body.el.select('.' + GRID_ROW_EDIT_CLS + ' .' + FIELD_CLS);

      E(w.columns, (column, i) => {
        column.rowEditor = F.getWidget(cells.item(i).attr('id'));
      });

      cells = w.leftBody.el.select('.' + GRID_ROW_EDIT_CLS + ' .' + FIELD_CLS);

      E(w.leftColumns, (column, i) => {
        column.rowEditor = F.getWidget(cells.item(i).attr('id'));
      });

      cells = w.rightBody.el.select('.' + GRID_ROW_EDIT_CLS + ' .' + FIELD_CLS);

      E(w.rightColumns, (column, i) => {
        column.rowEditor = F.getWidget(cells.item(i).attr('id'));
      });
    },
    onBeforeColumnDrag(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    onColumnDrag(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    onColumnHide(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    onColumnShow(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    onLockColumn(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    onRightLockColumn(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    onUnLockColumn(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    destroyEls(){
      const me = this,
        w = me.widget;

      if(me.rendered){
        me.rendered = false;

        if (w.leftColumns){
          F.each(w.leftColumns, (column) => {
            column.rowEditor.destroy();
            delete column.rowEditor;
          });
          me.leftEl.destroy();
        }

        if (w.columns){
          F.each(w.columns, (column) => {
            column.rowEditor.destroy();
            delete column.rowEditor;
          });
          me.el.destroy();
        }

        if (w.rightColumns){
          F.each(w.rightColumns, (column) => {
            column.rowEditor.destroy();
            delete column.rowEditor;
          });
          me.rightEl.destroy();
        }
      }
    },
    /*
     * @return {Boolean}
     */
    isVisible(){
      return this.el.css('display') !== 'none';
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
    /*
     *
     */
    getComboNewValues(){
      const me = this,
        w = me.widget,
        columns = w.getColumns(),
        values = {};

      F.each(columns, (column) => {
        if(column.type === 'combo' && column.editable && column.rowEditor){
          const editor = column.rowEditor,
            value = editor.get();

          if(editor.value === -1 && F.isString(value) && value.length){
            values[column.index] = value;
          }
          else if(editor.getInputValue() !== value){
            values[column.index] = editor.getInputValue();
          }
        }
      });

      return values;
    }
  });

})();
