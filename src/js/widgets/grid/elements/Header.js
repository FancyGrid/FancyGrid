/**
 * @class Fancy.Grid
 * @extends Fancy.Widget
 */
Fancy.define('Fancy.grid.Header', {
  extend: Fancy.Widget,
  cls: 'fancy-grid-header',
  mixins: [
    'Fancy.grid.header.mixin.Menu'
  ],
  cellTpl: [
    '<div class="fancy-grid-header-cell {cls}" style="display:{display};width:{columnWidth}px;height: {height};left: {left};" {groupIndex} index="{index}">',
      '<div class="fancy-grid-header-cell-container" style="height: {height};">',
        '<span class="fancy-grid-header-cell-text">{columnName}</span>',
        '<span class="fancy-grid-header-cell-trigger">',
          '<div class="fancy-grid-header-cell-trigger-image"></div>',
        '</span>',
      '</div>',
    '</div>'
  ],
  constructor: function(config){
    var me = this;

    me.Super('const', arguments);
  },
  init: function(){
    var me = this;

    me.Super('init', arguments);

    me.initTpl();
    me.render();

    me.renderHeaderCheckBox();

    me.setAlign();
    me.setCellsPosition();
    me.ons();
  },
  initTpl: function(){
    var me = this;

    me.cellTpl = new Fancy.Template(me.cellTpl);
  },
  ons: function(){
    var me = this,
      w = me.widget;

    w.on('render', me.onAfterRender, me);
    me.el.on('click', me.onTriggerClick, me, 'span.fancy-grid-header-cell-trigger');
    me.el.on('click', me.onCellClick, me, 'div.fancy-grid-header-cell');
    me.el.on('mousemove', me.onCellMouseMove, me, 'div.fancy-grid-header-cell');
    me.el.on('mousedown', me.onCellMouseDown, me, 'div.fancy-grid-header-cell');
    me.el.on('mousedown', me.onMouseDown, me);
  },
  render: function(){
    var me = this,
      w = me.widget,
      columns = me.getColumns(),
      renderTo,
      el = Fancy.get(document.createElement('div')),
      html = '',
      i = 0,
      iL = columns.length,
      numRows = 1,
      groups = {},
      passedWidth = 0,
      isFilterHeader = w.filter && w.filter.header,
      cellFilterGroupType = 'full',
      cellHeight = w.cellHeaderHeight;

    if(w.groupheader){
      if(isFilterHeader && !w.filter.groupHeader){
        cellFilterGroupType = 'small';
      }
      else {
        numRows = 2;
      }
    }

    if(isFilterHeader){
      numRows++;
    }

    for(;i<iL;i++){
      var column = columns[i],
        title = column.title || column.header,
        height = cellHeight,
        cls = '',
        groupIndex = '';

      if(numRows !== 1){
        if(!column.grouping){
          height = (numRows * cellHeight) + 'px';
        }
        else{
          if(!groups[column.grouping]){
            groups[column.grouping] = {
              width: 0,
              title: column.grouping,
              left: passedWidth
            };
          }

          if(isFilterHeader && w.filter.groupHeader){
            height = (2 * cellHeight) + 'px';
          }
          else {
            height = cellHeight + 'px';
          }

          if(!column.hidden){
            groups[column.grouping].width += column.width;
          }

          groupIndex = 'group-index="' + column.grouping + '"';

          cls = 'fancy-grid-header-cell-group-level-1'
        }
      }

      passedWidth += column.width;

      if(column.index === '$selected'){
        cls += ' fancy-grid-header-cell-select';
      }

      if(!column.menu){
        cls += ' fancy-grid-header-cell-trigger-disabled';
      }

      if(column.filter && column.filter.header){
        switch(cellFilterGroupType){
          case 'small':
            cls += ' fancy-grid-header-filter-cell-small';
            break;
          case 'full':
            cls += ' fancy-grid-header-filter-cell-full';
            break;
        }
      }

      html += me.cellTpl.getHTML({
        cls: cls,
        columnName: title,
        columnWidth: column.width,
        index: i,
        height: height,
        left: 'initial',
        groupIndex: groupIndex,
        display: column.hidden? 'none': ''
      });
    }

    el.css({
      height: cellHeight * numRows + 'px',
      width: me.getColumnsWidth()
    });

    el.addClass(me.cls);

    if(w.groupheader){
      el.addClass('fancy-grid-header-grouped');
      html += me.getGroupingCellsHTML(groups);
    }

    el.update(html);

    renderTo = w.el.select('.fancy-grid-' + me.side).dom;
    me.el = Fancy.get(renderTo.appendChild(el.dom));
  },
  insertCell: function(index, column){
    var me = this,
      w = me.widget,
      cells = me.el.select('.fancy-grid-header-cell:not(.fancy-grid-header-cell-group-level-2)'),
      columns = me.getColumns(),
      cls = '',
      title = column.title || column.header,
      cellHeight = parseInt(cells.item(0).css('height')),
      groupIndex = '',
      left = 0;

    if(column.index === '$selected'){
      cls += ' fancy-grid-header-cell-select';
    }

    if(!column.menu){
      cls += ' fancy-grid-header-cell-trigger-disabled';
    }

    var j = 0,
      jL = index;

    for(;j<jL;j++){
      left += columns[j].width;
    }

    var i = index,
      iL = columns.length - 1;

    for(;i<iL;i++){
      var _cell = cells.item(i),
        _left = parseInt(_cell.css('left') || 0) + column.width;

      _cell.css('left', _left);
    }

    var cellHTML = me.cellTpl.getHTML({
      cls: cls,
      columnName: title,
      columnWidth: column.width,
      index: index,
      height: cellHeight,
      left: String(left) + 'px',
      groupIndex: groupIndex
    });

    if(index === 0 && cells.length){
      Fancy.get(cells.item(0).before(cellHTML));
    }
    else if(index !== 0 && cells.length){
      me.el.append(cellHTML);
    }

    me.css('width', parseInt(me.css('width')) + column.width);
  },
  setAlign: function(){
    var me = this,
      columns = me.getColumns(),
      i = 0,
      iL = columns.length;

    for(;i<iL;i++) {
      var column = columns[i];

      if(column.align){
        me.getDomCell(i).css('text-align', column.align);
      }
    }
  },
  onAfterRender: function(){},
  setCellsPosition: function(){
    var me = this,
      w = me.widget,
      columns = me.getColumns(),
      cellsWidth = 0,
      i = 0,
      iL = columns.length,
      cellsDom = me.el.select('.fancy-grid-header-cell');

    cellsWidth += me.scrollLeft || 0;

    for(;i<iL;i++){
      var column = columns[i],
        cellEl = cellsDom.item(i),
        top = '0px';

      if(column.grouping){
        top = w.cellHeaderHeight + 'px';
      }

      cellEl.css({
        top: top,
        left: cellsWidth + 'px'
      });

      if(!column.hidden){
        cellsWidth += column.width;
      }
    }

    if(w.groupheader){
      var groupCells = me.el.select('.fancy-grid-header-cell-group-level-2'),
        j = 0,
        jL = groupCells.length;

      if(me.scrollLeft !== undefined){
        for(; j < jL; j++){
          var groupCell = groupCells.item(j),
            groupName = groupCell.attr('index');

          var groupCellLeft = me.el.select('[group-index="'+groupName+'"]').item(0).css('left');

          groupCell.css('left', groupCellLeft);
        }
      }
    }
  },
  getColumnsWidth: function(){
    var me = this,
      columns = me.getColumns(),
      cellsWidth = 0,
      i = 0,
      iL = columns.length;

    for(;i<iL;i++){
      var column = columns[i];

      cellsWidth += column.width;
    }

    return cellsWidth;
  },
  getColumns: function(){
    var me = this,
      w = me.widget,
      columns;

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

    return columns;
  },
  getDomCell: function(index){
    var me = this;

    return me.el.select('.fancy-grid-header-cell').item(index);
  },
  onCellClick: function(e){
    var me = this,
      w = me.widget,
      cell = e.currentTarget,
      target = Fancy.get(e.target),
      index = parseInt(Fancy.get(cell).attr('index'));

    if(target.hasClass('fancy-grid-header-cell-trigger')){
      return
    }

    if(target.hasClass('fancy-grid-header-cell-trigger-image')){
      return
    }

    if(Fancy.get(cell).hasClass('fancy-grid-header-cell-group-level-2')){
      return;
    }

    w.fire('headercellclick', {
      e: e,
      side: me.side,
      cell: cell,
      index: index
    });
  },
  onCellMouseMove: function(e){
    var me = this,
      w = me.widget,
      cell = e.currentTarget,
      cellEl = Fancy.get(cell),
      isGroupCell = cellEl.hasClass('fancy-grid-header-cell-group-level-2'),
      index = parseInt(Fancy.get(cell).attr('index'));

    if(isGroupCell){
      return;
    }

    w.fire('headercellmousemove', {
      e: e,
      side: me.side,
      cell: cell,
      index: index
    });
  },
  onMouseDown: function(e){
    var targetEl = Fancy.get(e.target);

    if(targetEl.prop("tagName") === 'INPUT'){}
    else {
      e.preventDefault();
    }
  },
  onCellMouseDown: function(e){
    var me = this,
      w = me.widget,
      cell = e.currentTarget,
      index = parseInt(Fancy.get(cell).attr('index'));

    w.fire('headercellmousedown', {
      e: e,
      side: me.side,
      cell: cell,
      index: index
    });
  },
  scroll: function(value){
    var me = this;

    me.scrollLeft = value;
    me.setCellsPosition();
  },
  getGroupingCellsHTML: function(groups){
    var me = this,
      w = me.widget,
      html = '';

    for(var p in groups){
      var group = groups[p];

      html += me.cellTpl.getHTML({
        cls: 'fancy-grid-header-cell-group-level-2',
        columnName: group.title,
        columnWidth: group.width,
        index: p,
        height: w.cellHeaderHeight + 'px',
        left: group.left + 'px',
        groupIndex: ''
      });
    }

    return html;
  },
  destroy: function(){
    var me = this;

    me.el.un('click', me.onCellClick, me, 'div.fancy-grid-header-cell');
    me.el.un('mousemove', me.onCellMouseMove, me, 'div.fancy-grid-header-cell');
    me.el.un('mousedown', me.onCellMouseDown, me, 'div.fancy-grid-header-cell');
    me.el.un('mousedown', me.onMouseDown, me);
  },
  getCell: function(index){
    var me = this;

    return me.el.select('.fancy-grid-header-cell[index="'+index+'"]');
  },
  onTriggerClick: function(e){
    var me = this,
      target = Fancy.get(e.currentTarget),
      cell = target.parent().parent(),
      index = parseInt(cell.attr('index')),
      columns = me.getColumns(),
      column = columns[index];

    e.stopPropagation();

    me.showMenu(cell, index, column, columns);
  },
  hideCell: function(orderIndex){
    var me = this,
      cells = me.el.select('.fancy-grid-header-cell:not(.fancy-grid-header-cell-group-level-2)'),
      cell = cells.item(orderIndex),
      cellWidth = parseInt(cell.css('width')),
      i = orderIndex + 1,
      iL = cells.length,
      columns = me.getColumns();

    if(cell.hasClass('fancy-grid-header-cell-group-level-1')){
      var groupIndex = cell.attr('group-index'),
        groupCell = me.el.select('.fancy-grid-header-cell-group-level-2[index="'+groupIndex+'"]').item(0),
        groupCellWidth = parseInt(groupCell.css('width'));

      groupCell.css('width', groupCellWidth - cellWidth);
    }

    cell.hide();

    var groups = {};

    for(;i<iL;i++){
      var _cell = cells.item(i),
        left = parseInt(_cell.css('left')) - cellWidth,
        column = columns[i];

      if(column.grouping){
        if(columns[orderIndex].grouping !== column.grouping){
          groups[column.grouping] = true;
        }
      }

      _cell.css('left', left);
    }

    for(var p in groups){
      var groupCell = me.el.select('.fancy-grid-header-cell-group-level-2[index="'+p+'"]').item(0);
      groupCell.css('left', parseInt(groupCell.css('left')) - cellWidth);
    }
  },
  showCell: function(orderIndex){
    var me = this,
      cells = me.el.select('.fancy-grid-header-cell:not(.fancy-grid-header-cell-group-level-2)'),
      cell = cells.item(orderIndex),
      cellWidth,
      i = orderIndex + 1,
      iL = cells.length,
      columns = me.getColumns();

    cell.show();

    cellWidth = parseInt(cell.css('width'));

    if(cell.hasClass('fancy-grid-header-cell-group-level-1')){
      var groupIndex = cell.attr('group-index'),
        groupCell = me.el.select('.fancy-grid-header-cell-group-level-2[index="'+groupIndex+'"]').item(0),
        groupCellWidth = parseInt(groupCell.css('width'));

      groupCell.css('width', groupCellWidth + cellWidth);
    }

    var groups = {};

    for(;i<iL;i++){
      var _cell = cells.item(i),
        left = parseInt(_cell.css('left')) + cellWidth,
        column = columns[i];

      if(column.grouping){
        if(columns[orderIndex].grouping !== column.grouping){
          groups[column.grouping] = true;
        }
      }
      _cell.css('left', left);
    }

    for(var p in groups){
      var groupCell = me.el.select('.fancy-grid-header-cell-group-level-2[index="'+p+'"]').item(0);
      groupCell.css('left', parseInt(groupCell.css('left')) + cellWidth);
    }
  },
  removeCell: function(orderIndex){
    var me = this,
      w = me.widget,
      cells = me.el.select('.fancy-grid-header-cell:not(.fancy-grid-header-cell-group-level-2)'),
      cell = cells.item(orderIndex),
      cellWidth = parseInt(cell.css('width')),
      i = orderIndex + 1,
      iL = cells.length,
      groupCells = {},
      isGroupCell = false;

    if(cell.attr('group-index')){
      isGroupCell = cell.attr('group-index');
      groupCells[isGroupCell] = true;
    }

    cell.destroy();

    for(;i<iL;i++){
      var _cell = cells.item(i),
        left = parseInt(_cell.css('left')) - cellWidth;

      if(_cell.attr('group-index')){
        groupCells[_cell.attr('group-index')] = true;
      }

      _cell.attr('index', i - 1);

      _cell.css('left', left);
    }

    for(var p in groupCells){
      var groupCell = me.el.select('[index="'+p+'"]'),
        newCellWidth = parseInt(groupCell.css('width')) - cellWidth,
        newCellLeft = parseInt(groupCell.css('left')) - cellWidth;

      if(isGroupCell){
        groupCell.css('width', newCellWidth);

        if(groupCell.attr('index') !== isGroupCell){
          groupCell.css('left', newCellLeft);
        }
      }
      else{
        groupCell.css('left', newCellLeft);
      }
    }

    if(isGroupCell){
      if( me.el.select('[group-index="'+isGroupCell+'"]').length === 0 ){
        var groupCell = me.el.select('[index="'+isGroupCell+'"]');

        groupCell.destroy();
      }
    }

    if(me.side !== 'center'){
      me.css('width', parseInt(me.css('width')) - cellWidth);
    }
  },
  renderHeaderCheckBox: function(){
    var me = this,
      w = me.widget,
      columns = me.getColumns(),
      i = 0,
      iL = columns.length,
      cells = me.el.select('.fancy-grid-header-cell:not(.fancy-grid-header-cell-group-level-2)');

    for(;i<iL;i++){
      var column = columns[i];

      if(column.headerCheckBox === true){
        var cell = cells.item(i),
          headerCellContainer = cell.firstChild(),
          textEl = cell.select('.fancy-grid-header-cell-text'),
          text = textEl.dom.innerHTML,
          label = !text ? false : text,
          labelWidth = 0;

        cell.addClass('fancy-grid-header-cell-checkbox');
        textEl.update('');

        if(label.length){
          labelWidth = label.width * 15;
        }

        column.headerCheckBox = new Fancy.CheckBox({
          renderTo: headerCellContainer.dom,
          renderId: true,
          labelWidth: labelWidth,
          value: false,
          label: label,
          labelAlign: 'right',
          style: {
            padding: '0px',
            display: 'inline-block'
          },
          events: [{
            change: function(checkbox, value){
              var i = 0,
                iL = w.getViewTotal();

              for(;i<iL;i++){
                w.set(i, column.index, value);
              }
            }
          }]
        });
      }
    }
  },
  reSetIndexes: function(){
    var me = this,
      cells = me.el.select('.fancy-grid-header-cell:not(.fancy-grid-header-cell-group-level-2)');

    cells.each(function(cell, i) {
      cell.attr('index', i);
    })
  }
});