/*
 * @class Fancy.WidgetManager
 * @singleton
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  F.define('Fancy.WidgetManager', {
    singleton: true,
    /*
     * @constructor
     */
    constructor: function(){
      this.wtypes = new F.Data();
      this.widgets = new F.Data();
    },
    /*
     * @param {String} wtype
     * @param {Object} widget
     */
    addWidgetType(wtype, widget){
      widget.prototype.wtype = wtype;
      this.wtypes.add(wtype, widget);
    },
    /*
     * @param {String} wtype
     * @return {Object}
     */
    getWidgetClassByType(wtype){
      return this.wtypes.get(wtype);
    },
    /*
     * @param {String} id
     * @param {Object} widget
     */
    addWidget(id, widget){
      this.widgets.add(id, widget);
    },
    /*
     * @param {String} id
     * @return {Object}
     */
    getWidget(id){
      return this.widgets.get(id);
    }
  });

  const W = F.WidgetManager;

  /*
   * @param {String} wtype
   * @param {Object} widget
   */
  F.addWidgetType = (wtype, widget) => {
    W.addWidgetType(wtype, widget);
  };

  /*
   * @param {String} wtype
   * @return {Object}
   */
  F.getWidgetClassByType = (wtype) => {
    return W.getWidgetClassByType(wtype);
  };

  /*
   * @param {String} id
   * @param {Object} widget
   */
  F.addWidget = (id, widget) => {
    W.addWidget(id, widget);
  };

  /*
   * @param {String} id
   * @return {Object} widget
   */
  F.getWidget = (id) => {
    return W.getWidget(id);
  };

  /*
   * @param {String} id
   * @return {Object} widget
   * F.getWidget was duplicated over F.getGrid and F.getForm for TypeScript typization.
   */
  F.getGrid = (id) => {
    return W.getWidget(id);
  };

  /*
   * @param {String} id
   * @return {Object} widget
   * F.getWidget was duplicated over F.getGrid and F.getForm for TypeScript typization.
   */
  F.getForm = (id) => {
    return W.getWidget(id);
  };

})();
