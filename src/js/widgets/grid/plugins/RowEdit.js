/*
 * @class Fancy.grid.plugin.RowEdit
 */
Fancy.define('Fancy.grid.plugin.RowEdit', {
  extend: Fancy.Plugin,
  ptype: 'grid.rowedit',
  inWidgetName: 'rowedit',
  rendered: false,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);

    me.ons();
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget,
      store = w.store;

    w.on('scroll', me.onScroll, me);
    w.on('columnresize', me.onColumnResize, me);

    if(w.grouping){
      w.on('collapse', me.onCollapse, me);
      w.on('expand', me.onExpand, me);
    }
  },
  /*
   *
   */
  onCollapse: function(){
    var me = this;

    me.hide();
  },
  /*
   *
   */
  onExpand: function(){
    var me = this;

    me.hide();
  },
  /*
   * @param {Object} o
   */
  edit: function(o){
    var me = this,
      w = me.widget,
      store = w.store,
      column = o.column,
      columnType = column.type;

    if(column.index === '$selected'){
      return;
    }

    w.scroller.scrollToCell(o.cell);
    me.showEditor(o);
  },
  /*
   * @param {Object} o
   */
  showEditor: function(o){
    var me = this;

    me.changed = {};

    if(!me.rendered){
      me.render();
      me.changePosition(o.rowIndex, false);
    }
    else{
      var isHidden = me.el.css('display') === 'none';
      me.show();
      me.changePosition(o.rowIndex, !isHidden);
    }

    me.setValues(o);

    me.setSizes();
  },
  /*
   *
   */
  render: function(){
    var me = this,
      w = me.widget;

    if(w.leftColumns){
      me.leftEl = me.renderTo(w.leftBody.el, w.leftColumns);
    }

    if(w.columns){
      me.el = me.renderTo(w.body.el, w.columns);
    }

    if(w.rightColumns){
      me.rightEl = me.renderTo(w.rightBody.el, w.rightColumns);
    }

    me.renderButtons();

    me.rendered = true;
  },
  /*
   * @param {Object} renderTo
   * @param {Array} columns
   * @return {Fancy.Element}
   */
  renderTo: function(renderTo, columns, order, side, fromSide){
    var me = this,
      w = me.widget,
      container = Fancy.get(document.createElement('div')),
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

    if(!side){
      container.addClass(w.rowEditCls);
      el = Fancy.get(renderTo.dom.appendChild(container.dom));
    }
    else{
      var body = w.getBody(side),
        fieldEls = renderTo.select('.fancy-field');

      i = order;
      iL = order + 1;

      switch(side){
        case 'right':
          renderBefore = fieldEls.item(order);
          break;
        case 'left':
          renderAfter = fieldEls.item(order);
          break;
        case 'center':
          switch(fromSide){
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

    for(;i<iL;i++){
      column = columns[i];
      var columnWidth = column.width;

      var itemConfig = {
        index: column.index,
        label: false,
        style: style,
        width: columnWidth,
        vtype: column.vtype,
        format: column.format,
        stopPropagation: true,
        theme: theme,
        events: [{
          change: me.onFieldChange,
          delay: 100,
          scope: me
        },{
          enter: me.onFieldEnter,
          scope: me
        }]
      };

      switch(side){
        case 'left':
          itemConfig.renderAfter = renderAfter;
          break;
        case 'right':
          itemConfig.renderBefore = renderBefore;
          break;
        case 'center':
          switch(fromSide){
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

      if(column.editable === false){
         switch(column.type){
          case 'string':
          case 'number':
            editor = new Fancy.TextField(itemConfig);
            break;
          default:
            editor = new Fancy.EmptyField(itemConfig);
        }
      }
      else{
        switch(column.type){
          case 'date':
            if(column.format){
              itemConfig.format = column.format;
            }

            editor = new Fancy.DateField(itemConfig);
            break;
          case 'image':
          case 'string':
          case 'color':
            editor = new Fancy.StringField(itemConfig);
            break;
          case 'number':
            if(column.spin){
              itemConfig.spin = column.spin;
            }

            if(column.step){
              itemConfig.step = column.step;
            }

            if(column.min){
              itemConfig.min = column.min;
            }

            if(column.max){
              itemConfig.max = column.max;
            }

            editor = new Fancy.NumberField(itemConfig);
            break;
          case 'combo':
            Fancy.apply(itemConfig, {
              data: column.data,
              value: -1,
              padding: false
            });

            if(column.displayKey){
              itemConfig.displayKey = column.displayKey;
              itemConfig.valueKey = column.displayKey;
            }
            else{
              itemConfig.displayKey = 'text';
              itemConfig.valueKey = 'text';
            }

            editor = new Fancy.Combo(itemConfig);
            break;
          case 'checkbox':
            var paddingLeft;
            switch(column.cellAlign){
              case 'left':
                paddingLeft = 7;
                break;
              case 'center':
                paddingLeft = (column.width - 20 - 2)/2;
                break;
              case 'right':
                paddingLeft = (column.width - 20)/2 + 11;
                break;
            }

            Fancy.apply(itemConfig, {
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

            editor = new Fancy.CheckBox(itemConfig);
            break;
          default:
            editor = new Fancy.EmptyField(itemConfig);
        }
      }

      column.rowEditor = editor;
    }

    return el;
  },
  /*
   *
   */
  renderButtons: function(){
    var me = this,
      w = me.widget,
      container = Fancy.get(document.createElement('div')),
      el;

    container.addClass(w.rowEditButtonCls);

    el = Fancy.get(w.body.el.dom.appendChild(container.dom));

    me.buttonsEl = el;

    me.buttonUpdate = new Fancy.Button({
      cls: 'fancy-edit-row-button-update',
      renderTo: el.dom,
      text: 'Update',
      events: [{
        click: me.onClickUpdate,
        scope: me
      }]
    });

    me.buttonCancel = new Fancy.Button({
      cls: 'fancy-edit-row-button-cancel',
      renderTo: el.dom,
      text: 'Cancel',
      events: [{
        click: me.onClickCancel,
        scope: me
      }]
    });
  },
  /*
   *
   */
  setSizes: function(){
    var me = this,
      w = me.widget;

    if(w.leftColumns){
      me._setSizes(w.leftBody.el.select('.fancy-grid-cell[index="0"]'), w.leftColumns, 'left');
    }

    if(w.columns){
      me._setSizes(w.body.el.select('.fancy-grid-cell[index="0"]'), w.columns);
    }

    if(w.rightColumns){
      me._setSizes(w.rightBody.el.select('.fancy-grid-cell[index="0"]'), w.rightColumns, 'right');
    }

    me.setElSize();
  },
  /*
   *
   */
  setElSize: function(){
    var me = this,
      w = me.widget,
      centerWidth = w.getCenterViewWidth(),
      centerFullWidth = w.getCenterFullWidth();

    if(centerWidth < centerFullWidth){
      me.el.css('width', centerFullWidth);
    }
  },
  /*
   * @param {Fancy.Elements} firstRowCells
   * @param {Array} columns
   * @param {String} side
   */
  _setSizes: function(firstRowCells, columns, side){
    var me = this,
      i = 0,
      iL = columns.length,
      column,
      cellSize,
      cell,
      cellEl,
      editor,
      borderWidth = 1,
      offset = 2;

    for(;i<iL;i++){
      column = columns[i];
      cell = firstRowCells.item(i).dom;
      cellEl = Fancy.get(cell);
      cellSize = me.getCellSize(cell);
      editor = column.rowEditor;

      if(!editor){
        continue;
      }

      if((side === 'left' || side === 'right') && i === iL - 1){
        cellSize.width--;
      }

      cellSize.height -= 2;

      if(i === iL - 1){
        editor.el.css('width', (cellSize.width - 2));
      }
      else{
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
  getCellSize: function(cell){
    var me = this,
      w = me.widget,
      cellEl = Fancy.get(cell),
      width = cellEl.width(),
      height = cellEl.height(),
      coeficient = 2;

    if(Fancy.nojQuery && w.panelBorderWidth === 2){
      coeficient = 1;
    }

    width += parseInt( cellEl.css('border-right-width') ) * coeficient;
    height += parseInt( cellEl.css('border-bottom-width') ) * coeficient;

    return {
      width: width,
      height: height
    };
  },
  /*
   * @param {Object} editor
   * @param {Number} size
   */
  setEditorSize: function(editor, size){
    var me = this;

    if(editor.wtype === 'field.combo'){
      editor.size(size);

      editor.el.css('width', size.width + 5);
    }
    else{
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
  changePosition: function(rowIndex, animate){
    var me = this,
      w = me.widget,
      scrollTop = w.scroller.getScroll(),
      bottomScroll = w.scroller.getBottomScroll(),
      newTop = w.cellHeight * rowIndex - 1 - scrollTop,
      duration = 100,
      plusTop = 0;

    if(w.grouping){
      plusTop += w.grouping.getOffsetForRow(rowIndex);
      newTop += plusTop;
    }

    if(me.leftEl){
      if(animate !== false){
        me.leftEl.animate({
          duration: duration,
          top: newTop
        });
      }
      else {
        me.leftEl.css('top', newTop);
      }
    }

    if(me.el){
      if(animate !== false){
        me.el.animate({
          duration: duration,
          top: newTop
        });
      }
      else{
        me.el.css('top', newTop);
      }
    }

    if(me.rightEl){
      if(animate !== false){
        me.rightEl.animate({
          duration: duration,
          top: newTop
        });
      }
      else{
        me.rightEl.css('top', newTop);
      }
    }

    var showOnTop = w.getViewTotal() - 3 < rowIndex,
      buttonTop = newTop;

    if(rowIndex < 3){
      showOnTop = false;
    }

    if(showOnTop){
      if(w.grouping){
        if(w.getViewTotal() - 3 < rowIndex - w.grouping.getSpecialRowsUnder(rowIndex)){
          buttonTop = newTop - parseInt(me.buttonsEl.css('height')) + 1;
        }
        else{
          buttonTop = newTop + w.cellHeight;
          showOnTop = false;
        }
      }
      else{
        buttonTop = newTop - parseInt(me.buttonsEl.css('height')) + 1;
      }
    }
    else{
      buttonTop = newTop + w.cellHeight;
    }

    if(animate !== false){
      me.buttonsEl.animate({
        duration: duration,
        top: buttonTop
      });
    }
    else{
      me.buttonsEl.css('top', buttonTop);
    }

    me.el.css('left', -bottomScroll);

    me.changeButtonsLeftPos();

    me.activeRowIndex = rowIndex;
  },
  /*
   *
   */
  changeButtonsLeftPos: function(){
    var me = this,
      w = me.widget,
      viewWidth = w.getCenterViewWidth(),
      buttonsElWidth = parseInt(me.buttonsEl.css('width'));

    me.buttonsEl.css('left', (viewWidth - buttonsElWidth)/2);
  },
  /*
   * @param {Object} o
   */
  setValues: function(o){
    var me = this,
      w = me.widget;

    if(w.leftColumns){
      me._setValues(o.data, w.leftColumns);
    }

    if(w.columns){
      me._setValues(o.data, w.columns);
    }

    if(w.rightColumns){
      me._setValues(o.data, w.rightColumns);
    }

    me.activeId = o.id;
    me.activeRowIndex = o.rowIndex;
  },
  /*
   * @param {Array} data
   * @param {Array} columns
   */
  _setValues: function(data, columns){
    var me = this,
      i = 0,
      iL = columns.length,
      column,
      editor;

    for(;i<iL;i++){
      column = columns[i];
      editor = column.rowEditor;
      if(editor){
        switch(column.type){
          case 'action':
          case 'button':
          case 'order':
          case 'select':
            break;
          default:
            editor.set(data[column.index], false);
        }
      }
    }
  },
  /*
   *
   */
  onScroll: function(){
    var me = this,
      w = me.widget;

    if(me.rendered === false){
      return;
    }

    if(me.activeRowIndex !== undefined){
      me.changePosition(me.activeRowIndex, false);
    }
  },
  /*
   *
   */
  onColumnResize: function(){
    var me = this,
      w = me.widget;

    if(me.rendered === false){
      return;
    }

    me.setSizes();
  },
  /*
   *
   */
  onClickUpdate: function(){
    var me = this,
      w = me.widget,
      s = w.store,
      data = me.prepareChanged(),
      rowIndex = s.getRow(me.activeId);

    s.setItemData(rowIndex, data);
    w.update();

    me.hide();
  },
  /*
   *
   */
  prepareChanged: function(){
    var me = this,
      w = me.widget,
      data = me.changed;

    for(var p in data){
      var column = w.getColumnByIndex(p);

      switch(column.type){
        case 'date':
          var date = Fancy.Date.parse(data[p], column.format.edit),
            formattedValue = Fancy.Date.format(date, column.format.read);

          data[p] = formattedValue;
          break;
      }
    }

    return data;
  },
  /*
   *
   */
  onClickCancel: function(){
    var me = this;

    me.hide();
  },
  /*
   *
   */
  hide: function(){
    var me = this;

    if(!me.el){
      return;
    }

    if(me.leftEl){
      me.leftEl.hide();
    }

    me.el.hide();

    if(me.rightEl){
      me.rightEl.hide();
    }

    me.buttonsEl.hide();
  },
  /*
   *
   */
  show: function(){
    var me = this;

    if(me.leftEl){
      me.leftEl.show();
    }

    me.el.show();

    if(me.rightEl){
      me.rightEl.show();
    }

    me.buttonsEl.show();
  },
  /*
   * @param {Object} field
   * @param {*} newValue
   * @param {*} oldValue
   */
  onFieldChange: function(field, newValue, oldValue){
    var me = this;

    if(!field.isValid()){
      delete me.changed[field.index];
    }
    else {
      me.changed[field.index] = newValue;
    }
  },
  /*
   *
   */
  onFieldEnter: function(){
    var me = this,
      w = me.widget,
      s = w.store,
      rowIndex = s.getRow(me.activeId);

    s.setItemData(rowIndex, me.changed);
    w.update();

    me.hide();
  },
  hideField: function(index, side){
    var me = this,
      w = me.widget,
      columns = w.getColumns(side),
      column = columns[index];

    if(column.rowEditor){
      column.rowEditor.hide();
    }
  },
  showField: function(index, side){
    var me = this,
      w = me.widget,
      columns = w.getColumns(side),
      column = columns[index];

    if(column.rowEditor){
      column.rowEditor.show();
    }
  },
  moveEditor: function(column, index, side, fromSide){
    var me = this,
      w = me.widget,
      s = w.store,
      columns = w.getColumns(side),
      editor = column.rowEditor,
      body = w.getBody(side),
      rowEditRowEl = body.el.select('.' + w.rowEditCls),
      item = s.getById(me.activeId),
      value = item.get(column.index),
      field;

    if(me.activeId === undefined){
      value = s.get(me.activeRowIndex)[column.index];
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
  getField: function(index, side){
    var me = this,
      w = me.widget,
      body = w.getBody(side),
      field;

    switch(side){
      case 'left':
        index++;
        break;
    }

    field = Fancy.getWidget(body.el.select('.fancy-field').item(index).attr('id'));

    return field;
  },
  reSetColumnsEditorsLinks: function () {
    var me = this,
      w = me.widget,
      columns = w.columns,
      leftColumns = w.leftColumns,
      rightColumns = w.rightColumns,
      i,
      iL,
      cells;

    i = 0;
    iL = columns.length;
    cells = w.body.el.select('.fancy-field');

    for(;i<iL;i++){
      columns[i].rowEditor = Fancy.getWidget(cells.item(i).attr('id'));
    }

    i = 0;
    iL = leftColumns.length;
    cells = w.leftBody.el.select('.fancy-field');

    for(;i<iL;i++){
      leftColumns[i].rowEditor = Fancy.getWidget(cells.item(i).attr('id'));
    }

    i = 0;
    iL = rightColumns.length;
    cells = w.rightBody.el.select('.fancy-field');

    for(;i<iL;i++){
      rightColumns[i].rowEditor = Fancy.getWidget(cells.item(i).attr('id'));
    }
  }
});