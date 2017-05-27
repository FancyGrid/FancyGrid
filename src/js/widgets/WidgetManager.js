/*
 * @class Fancy.WidgetManager
 * @singleton
 */
Fancy.define('Fancy.WidgetManager', {
  singleton: true,
  /*
   * @constructor
   */
  constructor: function(){
    var me = this;

    me.wtypes = new Fancy.Data();
    me.widgets = new Fancy.Data();
  },
  /*
   * @param {String} wtype
   * @param {Object} widget
   */
  addWidgetType: function(wtype, widget){
    widget.prototype.wtype = wtype;
    this.wtypes.add(wtype, widget);
  },
  /*
   * @param {String} wtype
   * @return {Object}
   */
  getWidgetClassByType: function(wtype){
    return this.wtypes.get(wtype);
  },
  /*
   * @param {String} id
   * @param {Object} widget
   */
  addWidget: function(id, widget){
    this.widgets.add(id, widget);
  },
  /*
   * @param {String} id
   * @return {Object}
   */
  getWidget: function(id){
    return this.widgets.get(id);
  }
});

/*
 * @param {String} wtype
 * @param {Object} widget
 */
Fancy.addWidgetType = function(wtype, widget){
  Fancy.WidgetManager.addWidgetType(wtype, widget);
};

/*
 * @param {String} wtype
 * @return {Object}
 */
Fancy.getWidgetClassByType = function(wtype){
  return Fancy.WidgetManager.getWidgetClassByType(wtype);
};

/*
 * @param {String} id
 * @param {Object} widget
 */
Fancy.addWidget = function(id, widget){
  Fancy.WidgetManager.addWidget(id, widget);
};

/*
 * @param {String} id
 * @return {Object} widget
 */
Fancy.getWidget = function(id){
  return Fancy.WidgetManager.getWidget(id);
};