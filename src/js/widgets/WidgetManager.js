/*
 * @class Fancy.WidgetManager
 * @singleton
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  F.define('Fancy.WidgetManager', {
    singleton: true,
    /*
     * @constructor
     */
    constructor: function () {
      this.wtypes = new F.Data();
      this.widgets = new F.Data();
    },
    /*
     * @param {String} wtype
     * @param {Object} widget
     */
    addWidgetType: function (wtype, widget) {
      widget.prototype.wtype = wtype;
      this.wtypes.add(wtype, widget);
    },
    /*
     * @param {String} wtype
     * @return {Object}
     */
    getWidgetClassByType: function (wtype) {
      return this.wtypes.get(wtype);
    },
    /*
     * @param {String} id
     * @param {Object} widget
     */
    addWidget: function (id, widget) {
      this.widgets.add(id, widget);
    },
    /*
     * @param {String} id
     * @return {Object}
     */
    getWidget: function (id) {
      return this.widgets.get(id);
    }
  });

  var W = F.WidgetManager;

  /*
   * @param {String} wtype
   * @param {Object} widget
   */
  F.addWidgetType = function (wtype, widget) {
    W.addWidgetType(wtype, widget);
  };

  /*
   * @param {String} wtype
   * @return {Object}
   */
  F.getWidgetClassByType = function (wtype) {
    return W.getWidgetClassByType(wtype);
  };

  /*
   * @param {String} id
   * @param {Object} widget
   */
  F.addWidget = function (id, widget) {
    W.addWidget(id, widget);
  };

  /*
   * @param {String} id
   * @return {Object} widget
   */
  F.getWidget = function (id) {
    return W.getWidget(id);
  };

})();