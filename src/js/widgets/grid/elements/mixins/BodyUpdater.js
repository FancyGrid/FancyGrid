Fancy.ns('Fancy.grid.body.mixin');

/*
 * @mixin Fancy.grid.body.mixin.Updater
 */
Fancy.grid.body.mixin.Updater = function() {};

Fancy.grid.body.mixin.Updater.prototype = {
  /*
   *
   */
  update: function(){
    var me = this,
      w = me.widget,
      s = w.store;

    me.checkDomColumns();

    if(s.loading){
      return;
    }

    me.checkDomCells();
    me.updateRows();

    me.showEmptyText();
  },
  /*
   *
   */
  checkDomColumns: function(){
    var me = this,
      w = me.widget,
      numExistedColumn = me.el.select('.fancy-grid-column').length,
      columns = me.getColumns(),
      i = 0,
      iL = columns.length;

    if(iL <= numExistedColumn){
      return;
    }

    for(;i<iL;i++){
      var column = columns[i],
        width = column.width,
        el = Fancy.get(document.createElement('div'));

      el.addClass('fancy-grid-column');
      el.attr('grid', w.id);

      if(column.index === '$selected'){
        el.addClass('fancy-grid-cell-select');
      }
      else{
        switch(column.type){
          case 'order':
            el.addClass('fancy-grid-cell-order');
            break;
        }
      }

      if(column.cls){
        el.addClass(column.cls);
      }

      if(column.type === 'text'){
        el.addClass('fancy-grid-column-text');
      }

      el.css({
        width: width + 'px'
      });
      el.attr('index', i);

      if(column.cellAlign){
        el.css('text-align', column.cellAlign);
      }

      if(column.ellipsis === true){
        switch(column.type){
          case 'string':
          case 'text':
          case 'number':
            el.addClass('fancy-grid-column-ellipsis');
            break;
        }
      }

      me.el.dom.appendChild(el.dom);
    }

    me.fire('adddomcolumns');
  },
  /*
   *
   */
  checkDomCells: function(indexOrder){
    var me = this,
      w = me.widget,
      s = w.store,
      i = 0,
      iL = s.dataView.length,
      j = 0,
      jL,
      columns,
      column;

    switch(me.side){
      case 'left':
        columns = w.leftColumns;
        break;
      case 'center':
        columns = w.columns;
        break;
      case 'right':
        columns = w.rightColumns;
        break;
    }

    jL = columns.length;

    var columsDom = me.el.select('.fancy-grid-column'),
      dataLength = s.getLength(),
      cellTpl = me.cellTpl;

    if(w.cellWrapper){
      cellTpl = me.cellWrapperTpl;
    }

    if(indexOrder !== undefined){
      j = indexOrder;
      jL = indexOrder;
    }

    for(;j<jL;j++){
      column = columns[j];
      var columnDom = columsDom.item(j);
      i = 0;
      var delta = dataLength - columnDom.select('.fancy-grid-cell').length;
      i = iL - delta;
      for(;i<iL;i++){
        var cellHTML = cellTpl.getHTML({});

        var el = Fancy.get(document.createElement('div'));
        el.css({
          height: w.cellHeight + 'px'
        });
        el.addClass(me.cellCls);
        el.attr('index', i);

        if(i%2 !== 0 && w.striped){
          el.addClass(w.cellEvenCls)
        }
        el.update(cellHTML);
        columnDom.dom.appendChild(el.dom);
      }

      if(w.nativeScroller && (me.side === 'left' || me.side === 'right')){
        columnDom.select('.' + me.pseudoCellCls).destroy();

        var cellHTML = cellTpl.getHTML({
          cellValue: '&nbsp;'
        });

        var el = Fancy.get(document.createElement('div'));
        el.css({
          height: w.cellHeight + 'px'
        });
        el.addClass(me.pseudoCellCls);

        el.update(cellHTML);
        columnDom.dom.appendChild(el.dom);
      }
    }
  },
  /*
   * @param {Number} rowIndex
   * @param {Number} columnIndex
   */
  updateRows: function(rowIndex, columnIndex) {
    var me = this,
      w = me.widget,
      s = w.store,
      i = 0,
      columns,
      iL;

    if (rowIndex === undefined) {
      me.clearDirty();
    }
    else{
      me.clearDirty(rowIndex);
    }

    switch (me.side) {
      case 'left':
        columns = w.leftColumns;
        break;
      case 'center':
        columns = w.columns;
        break;
      case 'right':
        columns = w.rightColumns;
        break;
    }

    iL = columns.length;

    if(columnIndex !== undefined){
      i = columnIndex;
      iL = columnIndex + 1;
    }

    for(;i<iL;i++){
      var column = columns[i];

      switch(column.type){
        case 'string':
        case 'number':
        case 'combo':
        case 'action':
        case 'text':
        case 'date':
        case 'currency':
          me.renderUniversal(i, rowIndex);
          break;
        case 'order':
          me.renderOrder(i, rowIndex);
          break;
        case 'expand':
          me.renderExpand(i, rowIndex);
          break;
        case 'select':
          me.renderSelect(i, rowIndex);
          break;
        case 'color':
          me.renderColor(i, rowIndex);
          break;
        case 'checkbox':
          me.renderCheckbox(i, rowIndex);
          break;
        case 'image':
          me.renderImage(i, rowIndex);
          break;
        case 'sparklineline':
          me.renderSparkLine(i, rowIndex, 'line');
          break;
        case 'sparklinebar':
          me.renderSparkLine(i, rowIndex, 'bar');
          break;
        case 'sparklinetristate':
          me.renderSparkLine(i, rowIndex, 'tristate');
          break;
        case 'sparklinediscrete':
          me.renderSparkLine(i, rowIndex, 'discrete');
          break;
        case 'sparklinebullet':
          me.renderSparkLine(i, rowIndex, 'bullet');
          break;
        case 'sparklinepie':
          me.renderSparkLine(i, rowIndex, 'pie');
          break;
        case 'sparklinebox':
          me.renderSparkLine(i, rowIndex, 'box');
          break;
        case 'circle':
          me.renderCircle(i, rowIndex);
          break;
        case 'progressdonut':
          me.renderProgressDonut(i, rowIndex);
          break;
        case 'progressbar':
          me.renderProgressBar(i, rowIndex);
          break;
        case 'hbar':
          me.renderHBar(i, rowIndex);
          break;
        case 'grossloss':
          me.renderGrossLoss(i, rowIndex);
          break;
        default:
          throw new Error('[FancyGrid error] - not existed column type ' + column.type);
          break;
      }
    }

    me.removeNotUsedCells();
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   */
  renderUniversal: function(i, rowIndex){
    var me = this,
      w = me.widget,
      lang = w.lang,
      emptyValue = w.emptyValue,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      key,
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j,
      jL,
      currencySign = lang.currencySign;

    if(column.key !== undefined){
      key = column.key;
    }
    else if(column.index !== undefined){
      key = column.index;
    }
    else{
      key = column.type === 'action'? 'none' : undefined;
    }

    if(rowIndex !== undefined){
      j = rowIndex;
      jL = rowIndex + 1;
    }
    else{
      j = 0;
      jL = s.getLength();
    }

    for(;j<jL;j++){
      var data = s.get(j),
        id = s.getId(j),
        o = {
          rowIndex: j,
          data: data,
          style: {},
          column: column,
          id: id,
          item: s.getItem(j)
        },
        value,
        dirty = false;

      if(s.changed[o.id] && s.changed[o.id][column.index]){
        dirty = true;
      }

      if(column.smartIndexFn){
        value = column.smartIndexFn(data);
      }
      else{
        value = s.get(j, key);
      }

      o.value = value;

      if( column.format ){
        o.value = me.format(o.value, column.format);
        value = o.value;
      }

      switch(column.type){
        case 'currency':
          if(value !== ''){
            value = currencySign + value;
          }
          o.value = value;
          break;
      }

      if( column.render ){
        o = column.render(o);
        value = o.value;
      }

      switch(value){
        case '':
        case undefined:
          value = emptyValue;
          break;
      }

      var cell = cellsDom.item(j);
      if(w.cellStylingCls){
        me.clearCls(cell);
      }

      if(o.cls){
        cell.addClass(o.cls);
      }

      if(dirty && w.dirtyEnabled){
        me.enableCellDirty(cell);
      }

      cell.css(o.style);
      cellsDomInner.item(j).update(value);
    }
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   */
  renderOrder: function(i, rowIndex){
    var me = this,
      w = me.widget,
      lang = w.lang,
      emptyValue = w.emptyValue,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j = 0,
      jL = s.getLength(),
      currencySign = lang.currencySign,
      plusValue = 0;

    if(w.paging){
      plusValue += s.showPage * s.pageSize;
    }

    for(;j<jL;j++){
      var data = s.get(j),
        id = s.getId(j),
        o = {
          rowIndex: j,
          data: data,
          style: {},
          column: column,
          id: id,
          item: s.getItem(j)
        },
        value = j + 1 + plusValue;

      o.value = value;

      if( column.render ){
        o = column.render(o);
        value = o.value;
      }

      var cell = cellsDom.item(j);
      if(w.cellStylingCls){
        me.clearCls(cell);
      }

      if(o.cls){
        cell.addClass(o.cls);
      }

      cell.css(o.style);
      cellsDomInner.item(j).update(value);
    }
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   */
  renderExpand: function(i, rowIndex){
    var me = this,
      w = me.widget,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      key = column.key || column.index,
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j,
      jL;

    if(rowIndex !== undefined){
      j = rowIndex;
      jL = rowIndex + 1;
    }
    else{
      j = 0;
      jL = s.getLength();
    }

    for(;j<jL;j++) {
      var data = s.get(j),
        cellInnerEl = cellsDomInner.item(j),
        checkBox = cellInnerEl.select('.fancy-field-checkbox'),
        checkBoxId,
        isCheckBoxInside = checkBox.length !== 0,
        id = s.getId(j),
        o = {
          rowIndex: j,
          data: data,
          style: {},
          column: column,
          id: id,
          item: s.getItem(j)
        };

      if(isCheckBoxInside === false){
        new Fancy.CheckBox({
          renderTo: cellsDomInner.item(j).dom,
          renderId: true,
          value: false,
          label: false,
          expander: true,
          style: {
            padding: '0px',
            display: 'inline-block'
          },
          events: [{
            beforechange: function(checkbox){

            }
          },{
            change: function(checkbox, value){
              rowIndex = checkbox.el.parent().parent().attr('index');

              if(value){
                w.expander.expand(rowIndex);
              }
              else{
                w.expander.collapse(rowIndex);
              }
            }
          }]
        });
      }
      else{
        checkBoxId = checkBox.dom.id;
        checkBox = Fancy.getWidget(checkBoxId);
        checkBox.set(false, false);
      }
    }
  },
  /*
   * @param {Fancy.Element} cell
   */
  clearCls: function(cell){
    var me = this,
      w = me.widget,
      cellStylingCls = w.cellStylingCls,
      i = 0,
      iL = cellStylingCls.length;

    for(;i<iL;i++){
      cell.removeClass(cellStylingCls[i]);
    }
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   */
  renderColor: function(i, rowIndex){
    var me = this,
      w = me.widget,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      key = column.key || column.index,
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j,
      jL;

    if(rowIndex !== undefined){
      j = rowIndex;
      jL = rowIndex + 1;
    }
    else{
      j = 0;
      jL = s.getLength();
    }

    for(;j<jL;j++){
      var data = s.get(j),
        o = {
          rowIndex: j,
          data: data,
          style: {},
          column: column
        },
        value;

      if(column.smartIndexFn){
        value = column.smartIndexFn(data);
      }
      else{
        value = s.get(j, key);
      }

      if( column.render ){
        o = column.render(o);
        value = o.value;
      }

      o.value = value;

      cellsDom.item(j).css(o.style);
      //cellsDomInner.item(j).update(value);

      var innerDom = cellsDomInner.item(j).update('<div style="background-color:'+value+';" class="fancy-grid-color-cell"></div>');
    }
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   */
  renderCombo: function(i, rowIndex){
    var me = this,
      w = me.widget,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      key = column.key || column.index,
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j,
      jL;

    if(rowIndex !== undefined){
      j = rowIndex;
      jL = rowIndex + 1;
    }
    else{
      j = 0;
      jL = s.getLength();
    }

    for(;j<jL;j++){
      var value = s.get(j, key),
        o = {
          rowIndex: j,
          value: value,
          style: {}
        };

      if( column.render ){
        o = column.render(o);
        value = o.value;
      }

      cellsDom.item(j).css(o.style);
      cellsDomInner.item(j).update(value);
    }
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   */
  renderCheckbox: function(i, rowIndex){
    var me = this,
      w = me.widget,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      key = column.key || column.index,
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j,
      jL;

    if(rowIndex !== undefined){
      j = rowIndex;
      jL = rowIndex + 1;
    }
    else{
      j = 0;
      jL = s.getLength();
    }

    for(;j<jL;j++) {
      var data = s.get(j),
        value = s.get(j, key),
        cellInnerEl = cellsDomInner.item(j),
        checkBox = cellInnerEl.select('.fancy-field-checkbox'),
        checkBoxId,
        isCheckBoxInside = checkBox.length !== 0,
        dirty = false,
        id = s.getId(j),
        o = {
          rowIndex: j,
          data: data,
          style: {},
          column: column,
          id: id,
          item: s.getItem(j),
          value: value
        };

      if(s.changed[o.id] && s.changed[o.id][column.index]){
        dirty = true;
      }

      if( column.render ){
        o = column.render(o);
        value = o.value;
      }

      if(isCheckBoxInside === false){

        if(!o.stopped){
          var editable = true;

          if(w.rowEdit){
            editable = false;
          }

          cellsDomInner.item(j).update('');

          new Fancy.CheckBox({
            renderTo: cellsDomInner.item(j).dom,
            renderId: true,
            value: value,
            label: false,
            editable: editable,
            style: {
              padding: '0px',
              display: 'inline-block'
            },
            events: [{
              beforechange: function(checkbox){
                if(column.index === '$selected'){
                  return;
                }

                if(column.editable !== true){
                  checkbox.canceledChange = true;
                }
              }
            },{
              change: function(checkbox, value){
                if(column.index === '$selected'){
                  return;
                }

                w.celledit.checkBoxChangedValue = value;
              }
            }]
          });
        }
        else{
          cellsDomInner.item(j).update(value);
        }
      }
      else{
        checkBoxId = checkBox.dom.id;
        checkBox = Fancy.getWidget(checkBoxId);
        if(o.stopped){
          checkBox.destroy();
          cellsDomInner.item(j).update(value);
        }
        else {
          checkBox.set(value, false);
        }
      }

      if(dirty){
        var cell = cellsDom.item(j);
        me.enableCellDirty(cell);
      }
    }
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   */
  renderSelect: function(i, rowIndex){
    var me = this,
      w = me.widget,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      key = column.key || column.index,
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j,
      jL;

    if(rowIndex !== undefined){
      j = rowIndex;
      jL = rowIndex + 1;
    }
    else{
      j = 0;
      jL = s.getLength();
    }

    for(;j<jL;j++){
      var data = s.get(j),
        value = s.get(j, key),
        cellInnerEl = cellsDomInner.item(j),
        checkBox = cellInnerEl.select('.fancy-field-checkbox'),
        checkBoxId,
        isCheckBoxInside = checkBox.length !== 0,
        id = s.getId(j),
        o = {
          rowIndex: j,
          data: data,
          style: {},
          column: column,
          id: id,
          item: s.getItem(j)
        };

      if(isCheckBoxInside === false){
        new Fancy.CheckBox({
          renderTo: cellsDomInner.item(j).dom,
          renderId: true,
          value: value,
          label: false,
          stopIfCTRL: true,
          style: {
            padding: '0px',
            display: 'inline-block'
          }
        });
      }
      else{
        checkBoxId = checkBox.dom.id;
        checkBox = Fancy.getWidget(checkBoxId);
        checkBox.set(value, false);
      }
    }
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   */
  renderImage: function(i, rowIndex){
    var me = this,
      w = me.widget,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      key = column.key || column.index,
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j,
      jL;

    if(rowIndex !== undefined){
      j = rowIndex;
      jL = rowIndex + 1;
    }
    else{
      j = 0;
      jL = s.getLength();
    }

    for(;j<jL;j++){
      var value = s.get(j, key),
        data = s.get(j),
        o = {
          rowIndex: j,
          value: value,
          data: data,
          style: {}
        },
        attr = '';

      if( column.render ){
        o = column.render(o);
        value = o.value;
      }

      if(o.attr){
        for(var p in o.attr){
          attr += p + '="' + o.attr[p] + '"';
        }
      }

      value = '<img ' + attr + ' src="' + o.value + '">';

      cellsDom.item(j).css(o.style);
      cellsDomInner.item(j).update(value);
    }
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   * @param {String} type
   */
  renderSparkLine: function(i, rowIndex, type){
    var me = this,
      w = me.widget,
      cellHeight = w.cellHeight,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      columnWidth = column.width,
      key = column.key || column.index,
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j,
      jL,
      _sparkConfig = column.sparkConfig || {};

    columnDom.addClass(w.clsSparkColumn);

    if(rowIndex !== undefined){
      j = rowIndex;
      jL = rowIndex + 1;
    }
    else{
      j = 0;
      jL = s.getLength();
    }

    var sparkHeight = cellHeight - 1,
      sparkWidth = columnWidth - 20,
      widthName;

    switch(type){
      case 'line':
      case 'pie':
      case 'box':
        widthName = 'width';
        break;
      case 'bullet':
        widthName = 'width';
        sparkHeight -= 11;
        columnDom.addClass(w.clsSparkColumnBullet);
        break;
      case 'discrete':
        widthName = 'width';
        sparkWidth = columnWidth;
        sparkHeight -= 2;
        break;
      case 'bar':
      case 'tristate':
        widthName = 'barWidth';
        break;
    }

    for(;j<jL;j++){
      var value = s.get(j, key),
        data = s.get(j),
        o = {
          rowIndex: j,
          value: value,
          data: data,
          style: {}
        };

      if( column.render ){
        o = column.render(o);
        value = o.value;
      }

      if(Fancy.isArray(column.values)){
        var k = 0,
          kL = column.values.length;

        value = [];

        for(;k<kL;k++){
          value.push(s.get(j, column.values[k]));
        }
      }

      cellsDom.item(j).css(o.style);
      var innerDom = cellsDomInner.item(j).dom,
        sparkConfig = {
          type: type,
          fillColor: 'transparent',
          height: sparkHeight
        };

      Fancy.apply(sparkConfig, _sparkConfig);

      if( type === 'bar' || type === 'tristate' ){
        sparkWidth = columnWidth - 20;
        sparkWidth = sparkWidth/value.length;
      }

      sparkConfig[widthName] = sparkWidth;

      if(Fancy.nojQuery){
        //throw new Error('SparkLine is 3-rd party jQuery based library. Include jQuery.');
        Fancy.$(innerDom).sparkline(value, sparkConfig);
      }
      else {
        var $ = window.jQuery || window.$;
        Fancy.$(innerDom).sparkline(value, sparkConfig);
      }
    }
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   */
  renderProgressDonut: function(i, rowIndex){
    var me = this,
      w = me.widget,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      key = column.key || column.index,
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j,
      jL;

    columnDom.addClass(w.clsSparkColumnDonutProgress);

    if(rowIndex !== undefined){
      j = rowIndex;
      jL = rowIndex + 1;
    }
    else{
      j = 0;
      jL = s.getLength();
    }

    for(;j<jL;j++){
      var data = s.get(j),
        o = {
          rowIndex: j,
          data: data,
          style: {},
          column: column
        },
        value;

      if(column.smartIndexFn){
        value = column.smartIndexFn(data);
      }
      else{
        value = s.get(j, key);
      }

      o.value = value;

      if( column.format ){
        o.value = me.format(o.value, column.format);
        value = o.value;
      }

      if( column.render ){
        o = column.render(o);
        value = o.value;
      }

      cellsDom.item(j).css(o.style);
      var sparkConfig = column.sparkConfig || {},
        renderTo = cellsDomInner.item(j).dom;

      Fancy.apply(sparkConfig, {
        renderTo: renderTo,
        value: value
      });

      if(!sparkConfig.size && !sparkConfig.height && !sparkConfig.width){
        sparkConfig.size = w.cellHeaderHeight - 3 * 2;
      }

      Fancy.get( renderTo ).update('');

      new Fancy.spark.ProgressDonut(sparkConfig);
    }
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   */
  renderGrossLoss: function(i, rowIndex){
    var me = this,
      w = me.widget,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      key = column.key || column.index,
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j,
      jL;

    columnDom.addClass(w.clsColumnGrossLoss);

    if(rowIndex !== undefined){
      j = rowIndex;
      jL = rowIndex + 1;
    }
    else{
      j = 0;
      jL = s.getLength();
    }

    var sparkConfig = column.sparkConfig || {},
      maxValue;

    if(sparkConfig.showOnMax){
      sparkConfig.maxValue = Math.max.apply(Math, s.getColumnData(key, column.smartIndexFn));
    }

    for(;j<jL;j++){
      var data = s.get(j),
        o = {
          rowIndex: j,
          data: data,
          style: {},
          column: column
        },
        value;

      if(column.smartIndexFn){
        value = column.smartIndexFn(data);
      }
      else{
        value = s.get(j, key);
      }

      o.value = value;

      if( column.format ){
        o.value = me.format(o.value, column.format);
        value = o.value;
      }

      if( column.render ){
        o = column.render(o);
        value = o.value;
      }

      cellsDom.item(j).css(o.style);

      Fancy.apply(sparkConfig, {
        renderTo: cellsDomInner.item(j).dom,
        value: value,
        column: column
      });

      new Fancy.spark.GrossLoss(sparkConfig);
    }
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   */
  renderProgressBar: function(i, rowIndex){
    var me = this,
      w = me.widget,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      key = column.key || column.index,
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j,
      jL,
      maxValue = 100;

    columnDom.addClass(w.clsColumnProgress);

    if(rowIndex !== undefined){
      j = rowIndex;
      jL = rowIndex + 1;
    }
    else{
      j = 0;
      jL = s.getLength();
    }

    var sparkConfig = column.sparkConfig || {};
    if(sparkConfig.percents === false){
      maxValue = Math.max.apply(Math, s.getColumnData(key) );
    }

    for(;j<jL;j++){
      var data = s.get(j),
        o = {
          rowIndex: j,
          data: data,
          style: {},
          column: column
        },
        value;

      if(column.smartIndexFn){
        value = column.smartIndexFn(data);
      }
      else{
        value = s.get(j, key);
      }

      o.value = value;

      if( column.format ){
        o.value = me.format(o.value, column.format);
        value = o.value;
      }

      if( column.render ){
        o = column.render(o);
        value = o.value;
      }

      cellsDom.item(j).css(o.style);

      var _renderTo = Fancy.get(cellsDomInner.item(j).dom);

      if(_renderTo.select('.fancy-grid-column-progress-bar').length){
        var spark = Fancy.getWidget(_renderTo.select('.fancy-grid-column-progress-bar').item(0).attr('id'));
        spark.value = value;
        spark.maxValue = maxValue;
        spark.update();
        continue;
      }

      Fancy.apply(sparkConfig, {
        renderTo: cellsDomInner.item(j).dom,
        value: value,
        column: column,
        maxValue: maxValue
      });

      new Fancy.spark.ProgressBar(sparkConfig);
    }
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   */
  renderHBar: function(i, rowIndex){
    var me = this,
      w = me.widget,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      key = column.key || column.index,
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j,
      jL,
      maxValue = 100,
      sparkConfig = column.sparkConfig || {},
      disabled = column.disabled || {};

    columnDom.addClass(w.clsSparkColumnHBar);

    var values = {},
      i = 0,
      iL,
      kL,
      maxItemValue = Number.MIN_VALUE;

    if(Fancy.isArray(column.index)){
      iL = column.index.length;
      for(;i<iL;i++){
        var _key = column.index[i];

        if(disabled[_key]){
          continue;
        }

        values[_key] = s.getColumnData(_key);

        var _maxItemValue = Math.max.apply(Math, values[_key]);
        if(_maxItemValue > maxItemValue){
          maxItemValue = _maxItemValue;
        }

        kL = values[_key].length;
      }
    }
    else{
      var data = s.getColumnData(column.index),
        fields = [];

      iL = data.length;

      for(;i<iL;i++){
        var n = 0,
          nL = data[i].length;

        for(;n<nL;n++){
          if(disabled[n]){
            continue;
          }

          values[n] = values[n] || [];
          values[n].push(data[i][n]);
        }
      }

      for(var p in values){
        var _maxItemValue = Math.max.apply(Math, values[p]);
        fields.push(p);

        if(_maxItemValue > maxItemValue){
          maxItemValue = _maxItemValue;
        }

        kL = values[p].length;
      }

      if(!column.fields){
        column.fields = fields;
      }
    }

    var sum = [],
      k = 0;

    for(; k < kL; k++){
      sum[k] = 0;
      for (var p in values){
        if(column.fields && disabled[column.index + '.' +p]){
          continue;
        }
        else if(disabled[p]){
          continue;
        }

        sum[k] += values[p][k];
      }
    }

    maxValue = Math.max.apply(Math, sum);

    sparkConfig.maxItemValue = maxItemValue;

    if(rowIndex !== undefined){
      j = rowIndex;
      jL = rowIndex + 1;
    }
    else{
      j = 0;
      jL = s.getLength();
    }

    for(;j<jL;j++){
      var data = s.get(j),
        o = {
          rowIndex: j,
          data: data,
          style: {},
          column: column
        },
        value;

      if(column.smartIndexFn){
        value = column.smartIndexFn(data);
      }
      else{
        value = s.get(j, key);
      }

      o.value = value;

      if( column.format ){
        o.value = me.format(o.value, column.format);
        value = o.value;
      }

      if( column.render ){
        o = column.render(o);
        value = o.value;
      }

      cellsDom.item(j).css(o.style);

      var _renderTo = Fancy.get(cellsDomInner.item(j).dom);

      if(_renderTo.select('.fancy-spark-hbar').length){
        var spark = Fancy.getWidget(_renderTo.select('.fancy-spark-hbar').item(0).attr('id'));
        spark.maxValue = maxValue;
        spark.maxItemValue = maxItemValue;
        spark.update(data);
        continue;
      }

      Fancy.apply(sparkConfig, {
        renderTo: cellsDomInner.item(j).dom,
        value: value,
        data: data,
        column: column,
        maxValue: maxValue,
        height: w.cellHeight - 1
      });

      new Fancy.spark.HBar(sparkConfig);
    }
  },
  /*
   * @param {Number} i
   * @param {Number} rowIndex
   */
  renderCircle: function(i, rowIndex){
    var me = this,
      w = me.widget,
      s = w.store,
      columns = me.getColumns(),
      column = columns[i],
      key = column.key || column.index,
      columsDom = me.el.select('.fancy-grid-column'),
      columnDom = columsDom.item(i),
      cellsDom = columnDom.select('.' + w.cellCls),
      cellsDomInner = columnDom.select('.' + w.cellCls + ' .' + w.cellInnerCls),
      j,
      jL,
      cellHeight = w.cellHeight - 4,
      columnWidth = column.width;

    columnDom.addClass(w.clsSparkColumnCircle);

    function pieChart(percentage, size) {
      //http://jsfiddle.net/da5LN/62/

      var svgns = "http://www.w3.org/2000/svg";
      var chart = document.createElementNS(svgns, "svg:svg");
      chart.setAttribute("width", size);
      chart.setAttribute("height", size);
      chart.setAttribute("viewBox", "0 0 " + size + " " + size);

      var back = document.createElementNS(svgns, "circle");
      back.setAttributeNS(null, "cx", size / 2);
      back.setAttributeNS(null, "cy", size / 2);
      back.setAttributeNS(null, "r",  size / 2);
      var color = "#F0F0F0";
      if (size > 50) {
        color = "F0F0F0";
      }

      if(percentage < 0){
        color = '#F9DDE0';
      }

      back.setAttributeNS(null, "fill", color);
      chart.appendChild(back);

      var path = document.createElementNS(svgns, "path");
      var unit = (Math.PI *2) / 100;
      var startangle = 0;
      var endangle = percentage * unit - 0.001;
      var x1 = (size / 2) + (size / 2) * Math.sin(startangle);
      var y1 = (size / 2) - (size / 2) * Math.cos(startangle);
      var x2 = (size / 2) + (size / 2) * Math.sin(endangle);
      var y2 = (size / 2) - (size / 2) * Math.cos(endangle);
      var big = 0;
      if (endangle - startangle > Math.PI) {
        big = 1;
      }
      var d = "M " + (size / 2) + "," + (size / 2) +
        " L " + x1 + "," + y1 +
        " A " + (size / 2) + "," + (size / 2) +
        " 0 " + big + " 1 " +
        x2 + "," + y2 +
        " Z";

      path.setAttribute("d", d); // Set this path
      if(percentage < 0){
        path.setAttribute("fill", '#EA7369');
      }
      else {
        path.setAttribute("fill", '#44A4D3');
      }
      chart.appendChild(path);

      var front = document.createElementNS(svgns, "circle");
      front.setAttributeNS(null, "cx", (size / 2));
      front.setAttributeNS(null, "cy", (size / 2));
      front.setAttributeNS(null, "r",  (size * 0.25));
      front.setAttributeNS(null, "fill", "#fff");
      chart.appendChild(front);
      return chart;
    }

    if(rowIndex !== undefined){
      j = rowIndex;
      jL = rowIndex + 1;
    }
    else{
      j = 0;
      jL = s.getLength();
    }

    for(;j<jL;j++){
      var value,
        data = s.get(j),
        o = {
          rowIndex: j,
          data: data,
          style: {}
        };

      if(column.smartIndexFn){
        value = column.smartIndexFn(data);
      }
      else{
        value = s.get(j, key);
      }

      o.value = value;

      if( column.render ){
        o = column.render(o);
        value = o.value;
      }

      var innerDom = cellsDomInner.item(j).dom;

      if(innerDom.innerHTML === ''){

        innerDom.appendChild(pieChart(value, cellHeight));
      }
    }
  },
  /*
   *
   */
  removeNotUsedCells: function(){
    var me = this,
      w = me.widget,
      store = w.store,
      columnsDom = me.el.select('.fancy-grid-column'),
      i = 0,
      iL = columnsDom.length;

    for(;i<iL;i++){
      var columnDom = columnsDom.item(i),
        cellsDom = columnDom.select('.fancy-grid-cell'),
        j = store.getLength(),
        jL = cellsDom.length;

      for(;j<jL;j++){
        cellsDom.item(j).remove();
      }
    }
  },
  getFormat: function(format){
    var me = this,
      w = me.widget,
      lang = w.lang,
      rules = [format];

    switch(format){
      case 'number':
        return function (value){
          return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, lang.thousandSeparator);
        };
        break;
      case 'date':
        return function (value) {
          var date = Fancy.Date.parse(value, lang.date.read);
          value = Fancy.Date.format(date, lang.date.write);

          return value;
        };
        break;
    }

    switch(format.type){
      case 'date':
        return function (value) {
          if(value.length === 0){
            return '';
          }
          var date = Fancy.Date.parse(value, format.read, format.mode);
          value = Fancy.Date.format(date, format.write, undefined, format.mode);


          return value;
        };
        break;
    }

    if(format.inputFn){
      return format.inputFn;
    }
  },
  /*
   * @param {String} value
   * @param {*} format
   */
  format: function(value, format){
    switch(Fancy.typeOf(format)){
      case 'string':
        value = this.getFormat(format)(value);
        break;
      case 'function':
        value = format(value);
        break;
      case 'object':
        //value = this.getFormat(format)(value);
        if(format.inputFn){
          value = format.inputFn(value);
        }
        else{
          value = this.getFormat(format)(value);
        }

        break;
    }
    
    return value;
  },
  /*
   * @param {Fancy.Element} cell
   */
  enableCellDirty: function(cell){
    var me = this;

    if(cell.hasClass('fancy-grid-cell-dirty')){
      return;
    }

    cell.addClass('fancy-grid-cell-dirty');
    cell.append('<div class="fancy-grid-cell-dirty-el"></div>');
  },
  /*
   * @param {Number} rowIndex
   */
  clearDirty: function(rowIndex){
    var me = this;

    if(rowIndex !== undefined){
      me.el.select('.fancy-grid-cell[index="'+rowIndex+'"] .fancy-grid-cell-dirty-el').destroy();
      me.el.select('.fancy-grid-cell-dirty[index="'+rowIndex+'"]').removeClass('fancy-grid-cell-dirty');

      return;
    }

    me.el.select('.fancy-grid-cell-dirty-el').destroy();
    me.el.select('.fancy-grid-cell-dirty').removeClass('fancy-grid-cell-dirty');
  },
  /*
   *
   */
  showEmptyText: function(){
    var me = this,
      w = me.widget,
      s = w.store;

    if(me.side !== 'center'){
      return;
    }

    if(me.emptyTextEl){
      me.emptyTextEl.destroy();
      delete me.emptyTextEl;
    }

    if(s.dataView.length === 0){
      var el = Fancy.get(document.createElement('div'));

      el.addClass('fancy-grid-empty-text');
      el.update(w.emptyText);

      me.emptyTextEl = Fancy.get(me.el.dom.appendChild(el.dom));
    }
  }
};