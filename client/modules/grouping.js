/*
 * @mixin Fancy.store.mixin.Grouping
 */
Fancy.Mixin('Fancy.store.mixin.Grouping', {
  /*
   * @param {String} group
   * @param {*} value
   */
  expand: function(group, value){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      dataView = [],
      dataViewMap = {},
      dataViewIndexes = {};

    me.expanded = me.expanded || {};
    me.expanded[value] = true;

    for(;i<iL;i++){
      var item = data[i];

      if(me.expanded[ item.data[group] ]){
        dataView.push(item);
        dataViewMap[item.id] = dataView.length - 1;
        dataViewIndexes[dataView.length - 1] = i;
      }
    }

    me.dataView = dataView;
    me.dataViewMap = dataViewMap;
    me.dataViewIndexes = dataViewIndexes;
  },
  /*
   * @param {String} group
   * @param {*} value
   */
  collapse: function(group, value){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      dataView = [],
      dataViewMap = {},
      dataViewIndexes = {};

    me.expanded = me.expanded || {};
    delete me.expanded[value];

    for(;i<iL;i++){
      var item = data[i];

      if(me.expanded[ item.data[group] ]){
        dataView.push(item);
        dataViewMap[item.id] = dataView.length - 1;
        dataViewIndexes[dataView.length - 1] = i;
      }
    }

    me.dataView = dataView;
    me.dataViewMap = dataViewMap;
    me.dataViewIndexes = dataViewIndexes;
  },
  /*
   * @param {Array} groups
   * @param {String} by
   */
  changeOrderByGroups: function(groups, by){
    var me = this,
      grouped = {},
      i = 0,
      iL = groups.length,
      item,
      data = [];

    for(;i<iL;i++){
      grouped[groups[i]] = [];
    }

    i = 0;
    iL = me.data.length;

    for(;i<iL;i++){
      item = me.data[i];
      var group = item.data[by];

      grouped[group].push(item);
    }

    i = 0;
    iL = groups.length;
    for(;i<iL;i++){
      data = data.concat(grouped[ groups[i]]);
    }

    me.grouping = {
      by: by
    };

    me.data = data;
  },
  /*
   * @param {String} key
   * @param {String} group
   */
  getColumnOriginalValuesByGroup: function(key, group){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      result = [],
      values = [],
      groupName = data[0].data[group];

    for(;i<iL;i++){
      if(data[i].data[group] === groupName){
        values.push(data[i].data[key]);
      }
      else{
        result.push({
          values: values,
          groupName: groupName
        });
        values = [];
        groupName = data[i].data[group];
        i--;
      }
    }

    if(iL > 0) {
      result.push({
        values: values,
        groupName: groupName
      });
    }

    return result;
  }
});/*
 * @class Fancy.grid.plugin.Grouping
 * @extend Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.Grouping', {
  extend: Fancy.Plugin,
  ptype: 'grid.grouping',
  inWidgetName: 'grouping',
  tpl: '{text}:{number}',
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

    me._expanded = {};
    me.groupRows = [];

    me.initTpl();
    me.initGroups();
    me.initOrder();
    me.calcPlusScroll();
    me.configParams();

    me.ons();
  },
  /*
   *
   */
  initTpl: function(){
    var me = this;

    if(!me.tpl){
      return;
    }

    me.tpl = new Fancy.Template(me.tpl);
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget,
      s = w.store;

    w.once('render', function(){
      me.renderGroupedRows();
      me.update();

      w.el.on('click', me.onClick, me, 'div.' + w.clsGroupRow);
      w.el.on('mousedown', me.onMouseDown, me, 'div.' + w.clsGroupRow);
      w.on('scroll', me.onScroll, me);

      w.on('columnresize', me.onColumnResize, me);
    });
  },
  /*
   *
   */
  initGroups: function(){
    var me = this,
      w = me.widget,
      s = w.store;

    if(!me.by){
      throw new Error('[FancyGrid Error] - not set by param in grouping');
    }

    var values = s.getColumnOriginalValues(me.by),
      _groups = {},
      i = 0,
      iL = values.length;

    for(;i<iL;i++){
      if(_groups[values[i]] === undefined){
        _groups[values[i]] = 0;
      }

      _groups[values[i]]++;
    }

    var groups = [];

    for(var p in _groups){
      groups.push(p);
    }

    me.groups = groups;
    me.groupsCounts = _groups;
  },
  /*
   *
   */
  initOrder: function(){
    var me = this,
      w = me.widget,
      s = w.store,
      groups = [],
      i,
      iL,
      groupNameUpperCase = {},
      upperGroups = [];

    if(me.order && me.order.length !== 0){
      switch (Fancy.typeOf(me.order)){
        case 'string':
          //TODO
          break;
        case 'array':
          //TODO
          groups = me.groups;
          /*
          groups = me.groups;

          i = 0;
          iL = groups.length;

          for(;i<iL;i++){
            var upperGroup = groups[i].toLocaleUpperCase();
            groupNameUpperCase[upperGroup] = groups[i];
            upperGroups.push(upperGroup);
          }

          upperGroups = upperGroups.sort();



          i = me.order.length - 1;
          iL = groups.length;
          */
          break;
      }
    }
    else{
      groups = me.groups;
      i = 0;
      iL = groups.length;

      for(;i<iL;i++){
        var upperGroup = groups[i].toLocaleUpperCase();
        groupNameUpperCase[upperGroup] = groups[i];
        upperGroups.push(upperGroup);
      }

      upperGroups = upperGroups.sort();

      i = 0;
      for(;i<iL;i++){
        groups[i] = groupNameUpperCase[ upperGroups[i] ];
      }
    }

    //console.log(groups);

    me.groups = groups;
    s.changeOrderByGroups(groups, me.by);
  },
  /*
   *
   */
  calcPlusScroll: function(){
    var me = this,
      w = me.widget;

    me.plusScroll = me.groups.length * w.groupRowHeight;
  },
  /*
   *
   */
  configParams: function(){
    var me = this,
      w = me.widget,
      s = w.store,
      i,
      iL;

    me.expanded = me.expanded || {};
    s.expanded = s.expanded || {};

    if(me.collapsed){
      s.collapsed = true;
    }
    else{
      i = 0;
      iL = me.groups.length;

      for(;i<iL;i++){
        if( me.expanded[me.groups[i]] === undefined ) {
          s.expanded[me.groups[i]] = true;
          me.expanded[me.groups[i]] = true;
          me._expanded[me.groups[i]] = true;
        }
      }
    }
  },
  /*
   *
   */
  renderGroupedRows: function(){
    var me = this,
      w = me.widget,
      columns = w.columns,
      leftColumns = w.leftColumns,
      rightColumns = w.rightColumns,
      s = w.store,
      body = w.body,
      leftBody = w.leftBody,
      rightBody = w.rightBody,
      i = 0,
      iL,
      width = 0,
      leftWidth = 0,
      rightWidth = 0,
      el;

    iL = columns.length;
    for(;i<iL;i++){
      width += columns[i].width;
    }

    i = 0;
    iL = leftColumns.length;
    for(;i<iL;i++){
      leftWidth += leftColumns[i].width;
    }

    i = 0;
    iL = rightColumns.length;
    for(;i<iL;i++){
      rightWidth += rightColumns[i].width;
    }

    i = 0;
    iL = me.groups.length;
    var passedTop = 0;
    for(;i<iL;i++){
      var groupText = me.groups[i],
        groupCount = me.groupsCounts[groupText];

      if(leftWidth){
        el = me.generateGroupRow(groupText, groupCount, true, passedTop);
        el.css('width', leftWidth);
        leftBody.el.dom.appendChild(el.dom);

        el = me.generateGroupRow(groupText, groupCount, false, passedTop);
        el.css('width', width);
        body.el.dom.appendChild(el.dom);
      }
      else {
        el = me.generateGroupRow(groupText, groupCount, true, passedTop);
        el.css('width', width);
        body.el.dom.appendChild(el.dom);
      }

      if(rightWidth){
        el = me.generateGroupRow(groupText, groupCount, false, passedTop);
        el.css('width', rightWidth);
        rightBody.el.dom.appendChild(el.dom);
      }

      if(me.collapsed){
        passedTop += w.groupRowHeight;
      }

      me.groupRows.push(el);
    }
  },
  /*
   * @param {String} groupText
   * @param {Number} groupCount
   * @param {Boolean} addText
   * @param {Number} top
   */
  generateGroupRow: function(groupText, groupCount, addText, top){
    var me = this,
      w = me.widget,
      clsGroupRow = w.clsGroupRow,
      el = Fancy.get(document.createElement('div'));

    el.addClass(clsGroupRow);
    el.attr('group', groupText);
    if(addText){
      var text = me.tpl.getHTML({
        text: groupText,
        number: groupCount
      });
      el.update('<div class="fancy-grid-group-row-inner"> ' + text + '</div>');
    }

    if(me.collapsed){
      el.css('top', top + 'px');
      el.addClass(w.clsCollapsedRow);
    }
    else {
      el.css('top', '0px');
    }

    return el;
  },
  /*
   * @param {Object} e
   */
  onClick: function(e){
    var me = this,
      w = me.widget,
      clsCollapsedRow = w.clsCollapsedRow,
      rowEl = Fancy.get(e.currentTarget),
      isCollapsed,
      group = rowEl.attr('group');

    w.el.select('.'+ w.clsGroupRow + '[group="'+group+'"]').toggleClass(clsCollapsedRow);

    isCollapsed = rowEl.hasClass(clsCollapsedRow);

    if(isCollapsed){
      me.collapse(me.by, group);
    }
    else{
      me.expand(me.by, group);
    }

    //update works very slow in this case
    //it needs some fast solution without update
    //me.fastCollapse();
    me.update();
  },
  /*
   *
   */
  fastCollapse: function(){
    var me = this;

  },
  /*
   * @param {Object} e
   */
  onMouseDown: function(e){
    e.preventDefault();
  },
  /*
   *
   */
  onScroll: function(){
    var me = this,
      w = me.widget;

    me.setPositions();
  },
  /*
   * @param {String} group
   * @param {String} value
   */
  collapse: function(group, value){
    var me = this,
      w = me.widget,
      s = w.store;

    s.collapse(group, value);
    delete me._expanded[value];
    delete me.expanded[value];

    w.fire('collapse', group, value);
  },
  /*
   * @param {String} group
   * @param {String} value
   */
  expand: function(group, value){
    var me = this,
      w = me.widget,
      s = w.store;

    s.expand(group, value);
    me._expanded[value] = true;
    me.expanded[value] = true;

    w.fire('expand', group, value);
  },
  /*
   *
   */
  setPositions: function(){
    var me = this,
      w = me.widget,
      i = 0,
      iL = me.groups.length,
      top = -w.scroller.scrollTop || 0,
      clsGroupRow = w.clsGroupRow,
      leftRows = w.leftBody.el.select('.' + w.clsGroupRow),
      rows = w.body.el.select('.' + w.clsGroupRow),
      rightRows = w.rightBody.el.select('.' + w.clsGroupRow);

    for(;i<iL;i++){
      var groupName = me.groups[i];

      if(leftRows.length) {
        leftRows.item(i).css('top', top + 'px');
      }

      if(rows.length) {
        //console.log(top);
        rows.item(i).css('top', top + 'px');
      }

      if(rightRows.length) {
        rightRows.item(i).css('top', top + 'px');
      }

      top+= w.groupRowHeight;

      if(me._expanded[groupName] === true){
        top += me.groupsCounts[groupName] * w.cellHeight;
      }
    }
  },
  /*
   *
   */
  setCellsPosition: function(){
    var me = this,
      w = me.widget,
      i = 0,
      iL = me.groups.length,
      j = 0,
      jL,
      body = w.body,
      leftBody = w.leftBody,
      rightBody = w.rightBody,
      row = 0,
      top = w.groupRowHeight,
      rows = [],
      cell;

    me.clearMargins();

    for(;i<iL;i++){
      var groupName = me.groups[i];

      if(me._expanded[groupName] === true){
        rows.push(row);

        j = 0;
        jL = w.columns.length;
        for(;j<jL;j++){
          cell = body.getCell(row, j);
          cell.css('margin-top', top + 'px');
        }

        j = 0;
        jL = w.leftColumns.length;
        for(;j<jL;j++){
          cell = leftBody.getCell(row, j);

          cell.css('margin-top', top + 'px');
        }

        j = 0;
        jL = w.rightColumns.length;
        for(;j<jL;j++){
          cell = rightBody.getCell(row, j);

          cell.css('margin-top', top + 'px');
        }

        row += me.groupsCounts[groupName];
        top = w.groupRowHeight;
      }
      else{
        top += w.groupRowHeight;
      }
    }

    me.prevRows = rows;
  },
  /*
   *
   */
  clearMargins: function(){
    var me = this;

    if(me.prevRows === undefined){
      return;
    }

    var w = me.widget,
      body = w.body,
      leftBody = w.leftBody,
      rightBody = w.rightBody,
      i = 0,
      j = 0,
      iL = me.prevRows.length,
      jL,
      row,
      cell;

    for(;i<iL;i++){
      row = me.prevRows[i];
      j = 0;
      jL = w.columns.length;
      for(;j<jL;j++){
        cell = body.getCell(row, j);

        if(cell.css === undefined){
          break;
        }

        cell.css('margin-top', '0px');
      }

      j = 0;
      jL = w.leftColumns.length;
      for(;j<jL;j++){
        cell = leftBody.getCell(row, j);

        if(cell.css === undefined){
          break;
        }

        cell.css('margin-top', '0px');
      }

      j = 0;
      jL = w.rightColumns.length;
      for(;j<jL;j++){
        cell = rightBody.getCell(row, j);

        if(cell.css === undefined){
          break;
        }

        cell.css('margin-top', '0px');
      }
    }
  },
  /*
   *
   */
  onColumnResize: function(){
    var me = this,
      w = me.widget,
      leftColumns = w.leftColumns,
      columns = w.columns,
      rightColumns = w.rightColumns,
      body = w.body,
      leftBody = w.leftBody,
      rightBody = w.rightBody,
      i = 0,
      iL,
      width = 0;

    iL = columns.length;
    for(;i<iL;i++){
      width += columns[i].width;
    }

    body.el.select('.fancy-grid-group-row').css('width', width + 'px');

    i = 0;
    width = 0;
    iL = leftColumns.length;
    for(;i<iL;i++){
      width += leftColumns[i].width;
    }

    if(iL){
      leftBody.el.select('.fancy-grid-group-row').css('width', width + 'px');
    }

    i = 0;
    width = 0;
    iL = rightColumns.length;
    for(;i<iL;i++){
      width += rightColumns[i].width;
    }

    if(iL){
      rightBody.el.select('.fancy-grid-group-row').css('width', width + 'px');
    }
  },
  /*
   *
   */
  update: function(){
    var me = this,
      w = me.widget,
      s = w.store;

    if(s.loading === true || s.autoLoad === false){
      s.once('load', function(){
        me.initGroups();
        me.initOrder();
        me.calcPlusScroll();
        me.configParams();
        s.changeDataView();

        me.renderGroupedRows();
        me.setCellsPosition();
        w.setSidesHeight();
        me.update();

      }, me);
      return;
    }

    //var date1 = new Date();
    me.setPositions();
    //var date2 = new Date();
    //console.log('in 1', date2 - date1);
    //maybe not needed
    w.update();
    //var date3 = new Date();
    //console.log('in 2', date3 - date2);
    w.scroller.update();
    //var date4 = new Date();
    //console.log('in 3', date4 - date3);
    me.setCellsPosition();
    //var date5 = new Date();
    //console.log('in 4', date5 - date4);
    w.setSidesHeight();
    //var date6 = new Date();
    //console.log('in 5', date6 - date5);
    s.changeDataView();
    var date7 = new Date();
    //console.log('in 6', date7 - date6);

    //console.log('total:', date7 - date1);
  },
  /*
   * @param {Number} rowIndex
   */
  getOffsetForRow: function(rowIndex){
    var me = this,
      w = me.widget,
      i = 0,
      iL = me.groups.length,
      top = 0,
      rows = 0;

    for(;i<iL;i++){
      var groupName = me.groups[i];

      top += w.groupRowHeight;

      if(me._expanded[groupName] === true){
        rows += me.groupsCounts[groupName];
      }

      if(rowIndex < rows){
        break;
      }
    }

    return top;
  },
  /*
   * @param {Number} rowIndex
   */
  getSpecialRowsUnder: function(rowIndex){
    var me = this,
      w = me.widget,
      i = 0,
      iL = me.groups.length,
      top = 0,
      rows = 0,
      rowsAfter = 0;

    for(;i<iL;i++){
      var groupName = me.groups[i];

      if(rowIndex < rows){
        rowsAfter++;
      }

      top += w.groupRowHeight;

      if(me._expanded[groupName] === true){
        rows += me.groupsCounts[groupName];
      }
    }

    return rowsAfter;
  }
});