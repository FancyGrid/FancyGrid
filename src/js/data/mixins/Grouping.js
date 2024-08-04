/*
 * @mixin Fancy.store.mixin.Grouping
 */
Fancy.modules['grouping'] = true;
Fancy.Mixin('Fancy.store.mixin.Grouping', {
  /*
   * @param {String} groupBy
   * @param {*} value
   */
  expand(groupBy, value){
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
    me.memoryCollapsed = me.memoryCollapsed || {};

    if(Fancy.isArray(value)){
      Fancy.each(value, function(_value){
        me.expanded[_value] = true;
        delete me.memoryCollapsed[_value];
      });
    }
    else{
      me.expanded[value] = true;
      delete me.memoryCollapsed[value];
    }

    for (; i < iL; i++){
      var item = data[i];

      if (me.expanded[item.data[groupBy]]){
        dataView.push( item );
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
  collapse(group, value){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      dataView = [],
      dataViewMap = {},
      dataViewIndexes = {};

    me.expanded = me.expanded || {};
    me.expanded[value] = false;

    me.memoryCollapsed = me.memoryCollapsed || {};
    me.memoryCollapsed[value] = true;

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
  changeOrderByGroups(groups, by){
    var me = this,
      grouped = {},
      data = [],
      notGroupedData = [];

    Fancy.each(groups, group => grouped[group] = []);

    if(Fancy.isArray(me.data)){
      Fancy.each(me.data, item => {
        const group = item.data[by];

        if(grouped[group]){
          grouped[group].push(item);
        }
        else{
          notGroupedData.push(item);
        }
      });
    }

    Fancy.each(groups, group => {
      data = data.concat(grouped[group]);
    });

    data = data.concat(notGroupedData);

    me.grouping = {
      by: by
    };

    me.data = data;
  },
  /*
   * @param {String} key
   * @param {String} group
   */
  getColumnOriginalValuesByGroup(key, group, options){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      result = [],
      values = [],
      groupName = data[0].data[group];

    if(options && options.format && options.type === 'date'){
      for (; i < iL; i++){
        if (data[i].data[group] === groupName){
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
      for (; i < iL; i++){
        if (data[i].data[group] === groupName){
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

    if(iL > 0){
      result.push({
        values: values,
        groupName: groupName
      });
    }

    return result;
  },
  /*
   * @param {String} key
   */
  addGroup(key){
    const me = this,
      w = me.widget,
      grouping = w.grouping;

    grouping.by = key;
    me.orderDataByGroup();
  },
  /*
   * @param {String} [dataProperty]
   * @return {Object}
   */
  initGroups(dataProperty){
    const me = this,
      w = me.widget,
      grouping = w.grouping,
      by = grouping.by;
    dataProperty = dataProperty || 'data';

    if(!by){
      throw new Error('[FancyGrid Error] - not set by param in grouping');
    }

    //var values = me.getColumnOriginalValues(by, {
    const values = me.getColumnOriginalValues(by, {
        dataProperty: dataProperty,
        groupMap: true
      }),
      _groups = {};

    Fancy.each(values, value  => {
      value = String(value);

      if(_groups[value] === undefined){
        _groups[value] = 0;
      }

      _groups[value]++;
    });

    let groups = [];

    for(const p in _groups){
      groups.push(p);
    }

    groups = me.sortGroupNames(groups);

    return {
      groups,
      _groups
    };
  },
  /*
   *
   */
  orderDataByGroup(){
    const me = this,
      grouping = me.widget.grouping,
      o = me.initGroups(),
      groups = me.sortGroupNames(o.groups);

    me.changeOrderByGroups(groups, grouping.by);

    me.expanded = {};
    if(grouping.collapsed){
      me.collapsed = true;
    }
    else{
      Fancy.each(groups, group => {
       if( me.expanded[group] === undefined ){
          me.expanded[group] = true;
        }
      });
    }

    me.changeDataView({
      doNotFired: true
    });
  },
  /*
   * @param {Array} groups
   * @return {Array}
   */
  sortGroupNames(groups){
    var me = this,
      grouping = me.widget.grouping,
      groupNameUpperCase = {},
      upperGroups = [],
      sortedGroups = [],
      sortGroups = grouping.sortGroups || 'asc';

    Fancy.each(groups, group => {
      let upperGroup = String(group).toLocaleUpperCase();

      if(!isNaN(Number(group)) && group !== '' && group !== ' '){
        upperGroup = String(Number(group));
      }
      else{
        upperGroup = group.toLocaleUpperCase();
      }

      groupNameUpperCase[upperGroup] = group;
      upperGroups.push(upperGroup);
    });

    const areGroupsNumber = me.areGroupsNumber(upperGroups);

    switch(sortGroups){
      case 'asc':
      case 'ASC':
      case true:
        if(areGroupsNumber){
          upperGroups = upperGroups.sort(function(a, b){
            return Number(a) - Number(b);
          });
        }
        else{
          upperGroups = upperGroups.sort();
        }
        break;
      case 'desc':
      case 'DESC':
        if(areGroupsNumber){
          upperGroups = upperGroups.sort(function(a, b){
            return Number(b) - Number(a);
          });
        }
        else{
          upperGroups = upperGroups.reverse();
        }
        break;
      case false:
        break;
    }

    var i = 0,
      iL = groups.length;

    for(;i<iL;i++){
      sortedGroups[i] = groupNameUpperCase[ upperGroups[i] ];
    }

    return sortedGroups;
  },
  /*
   * @param {String} groupName
   */
  /*
   * TODO: needs some map of elements for fast getting elements.
   */
  getItemsByGroup(groupName){
    const me = this,
      items = me.findItem(me.grouping.by, groupName);

    return items;
  },
  /*
   *
   */
  clearGroup(){
    const me = this;

    delete me.expanded;
    delete me.collapsed;
    delete me.groupMap;
    delete me.grouping;
    delete me.grouping;
    delete me.memoryCollapsed;
  },
  /*
   * @param {Array} groups
   */
  areGroupsNumber(groups){
    let isString = false;

    Fancy.each(groups, group => {
      if(Fancy.isString(group) && group !== '' && group !== ' '){
        isString = true;
        return true;
      }
    });

    return !isString;
  }
});
