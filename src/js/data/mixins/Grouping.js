/*
 * @mixin Fancy.store.mixin.Grouping
 */
Fancy.modules['grouping'] = true;
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

    if(me.filteredData){
      data = me.filteredData;
      iL = data.length;
    }

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
      data = [];

    Fancy.each(groups, function(group){
      grouped[group] = [];
    });

    if(Fancy.isArray(me.data)){
      Fancy.each(me.data, function(item){
        var group = item.data[by];

        if(grouped[group]){
          grouped[group].push(item);
        }
      });
    }

    Fancy.each(groups, function (group){
      data = data.concat(grouped[group]);
    });

    me.grouping = {
      by: by
    };

    me.data = data;
  },
  /*
   * @param {String} key
   * @param {String} group
   */
  getColumnOriginalValuesByGroup: function(key, group, options){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      result = [],
      values = [],
      groupName = data[0].data[group];

    if(options && options.format && options.type === 'date'){
      for (; i < iL; i++) {
        if (data[i].data[group] === groupName) {
          values.push(Fancy.Date.parse(data[i].data[key], options.format, options.mode));
        }
        else {
          result.push({
            values: values,
            groupName: groupName
          });
          values = [];
          groupName = data[i].data[group];
          i--;
        }
      }
    }
    else {
      for (; i < iL; i++) {
        if (data[i].data[group] === groupName) {
          values.push(data[i].data[key]);
        }
        else {
          result.push({
            values: values,
            groupName: groupName
          });
          values = [];
          groupName = data[i].data[group];
          i--;
        }
      }
    }

    if(iL > 0) {
      result.push({
        values: values,
        groupName: groupName
      });
    }

    return result;
  },
  /*
   * @param {String} [dataProperty]
   * @return {Object}
   */
  initGroups: function(dataProperty){
    var me = this,
      w = me.widget,
      grouping = w.grouping,
      by = grouping.by;
    dataProperty = dataProperty || 'data';

    if(!by){
      throw new Error('[FancyGrid Error] - not set by param in grouping');
    }

    var values = me.getColumnOriginalValues(by, {
        dataProperty: dataProperty,
        groupMap: true
      }),
      _groups = {};

    Fancy.each(values, function(value){
      if(_groups[value] === undefined){
        _groups[value] = 0;
      }

      _groups[value]++;
    });

    var groups = [];

    for(var p in _groups){
      groups.push(p);
    }

    return {
      groups: groups,
      _groups: _groups
    };
  },
  /*
   *
   */
  orderDataByGroupOnStart: function(){
    var me = this,
      grouping = me.widget.grouping,
      o = me.initGroups(),
      groups = o.groups,
      groupNameUpperCase = {},
      upperGroups = [];

    Fancy.each(groups, function(group){
      var upperGroup = group.toLocaleUpperCase();

      groupNameUpperCase[upperGroup] = group;
      upperGroups.push(upperGroup);
    });

    switch(me.widget.grouping.sortGroups){
      case 'asc':
      case 'ASC':
      case true:
        upperGroups = upperGroups.sort();
        break;
      case 'desc':
      case 'DESC':
        upperGroups = upperGroups.sort().reverse();
        break;
      case false:
        break;
    }

    var i = 0,
      iL = groups.length;

    for(;i<iL;i++){
      groups[i] = groupNameUpperCase[ upperGroups[i] ];
    }

    me.changeOrderByGroups(groups, grouping.by);

    me.expanded = {};
    if(grouping.collapsed){
      me.collapsed = true;
    }
    else{
      Fancy.each(groups, function(group){
        if( !grouping.expanded || grouping.expanded[group] === undefined ){
          me.expanded[group] = true;
        }
      });
    }

    me.changeDataView({
      doNotFired: true
    });
  },
  /*
   * @param {String} groupName
   */
  /*
   * TODO: needs some map of elements for fast getting elements.
   */
  getItemsByGroup: function (groupName) {
    var me = this,
      items = me.findItem(me.grouping.by, groupName);

    return items;
  }
});