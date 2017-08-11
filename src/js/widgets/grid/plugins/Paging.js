/*
 * @class Fancy.grid.plugin.Paging
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.Paging', {
  extend: Fancy.Plugin,
  ptype: 'grid.paging',
  inWidgetName: 'paging',
  barType: 'bbar',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config) {
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

    store.on('change', me.onChangeStore, me);
    store.on('remove', me.onChangeStore, me);
    store.on('filter', me.onChangeStore, me);
    w.on('render', me.onRenderGrid, me);
  },
  /*
   * @param {Number} value
   */
  setPageSize: function(value){
    var me = this,
      w = me.widget,
      store = w.store;

    store.setPageSize(value);
  },
  /*
   *
   */
  nextPage: function(){
    var me = this,
      w = me.widget,
      store = w.store;

    store.nextPage();
  },
  /*
   *
   */
  lastPage: function(){
    var me = this,
      w = me.widget,
      store = w.store;

    store.lastPage();
  },
  /*
   *
   */
  prevPage: function(){
    var me = this,
      w = me.widget,
      store = w.store;

    store.prevPage();
  },
  /*
   *
   */
  firstPage: function(){
    var me = this,
      w = me.widget,
      store = w.store;

    store.firstPage();
  },
  /*
   * @param {Fancy.Store} store
   */
  onChangeStore: function(store){
    var me = this,
      w = me.widget,
      s = w.store,
      panel = w.panel,
      pageField;

    switch(me.barType){
      case 'both':
        pageField = panel['_bbar'].roles.pagenumber;
        pageField.setValue(s.showPage + 1);

        pageField = panel['_tbar'].roles.pagenumber;
        pageField.setValue(s.showPage + 1);

        me.updateBar('tbar');
        me.updateBar('bbar');
        break;
      case 'none':
      case false:
        break;
      default:
        pageField = panel['_'+me.barType].roles.pagenumber;
        pageField.setValue(s.showPage + 1);

        me.updateBar();
    }

    w.setSidesHeight();
    w.fire('changepage');
  },
  /*
   * @param {Number} value
   */
  setPage: function(value){
    var me = this,
      w = me.widget,
      s = w.store;

    if(value < 0){
      value = 0;
    }
    else if(value > s.pages ){
      value = s.pages;
    }

    s.setPage(value);

    return value;
  },
  refresh: function(){
    var me = this,
      w = me.widget,
      s = w.store;

    w.showLoadMask();
    setTimeout(function() {
      s.refresh();

      if(s.pageType !== 'server'){
        w.hideLoadMask();
      }
    }, 200);
  },
  /*
   *
   */
  updateBar: function(barType){
    var me = this,
      w = me.widget,
      s = w.store,
      showPage = s.showPage,
      pageSize = s.pageSize,
      pages = s.pages,
      panel = w.panel,
      barType = barType || me.barType,
      barRoles = panel['_' + barType].roles,
      pageField = barRoles.pagenumber,
      ofText = barRoles.ofText,
      info = barRoles.info,
      first = barRoles.first,
      prev = barRoles.prev,
      next = barRoles.next,
      last = barRoles.last,
      infoStart = showPage * pageSize + 1,
      infoEnd = infoStart + pageSize,
      infoTotal = s.getTotal() || 0,
      lang = w.lang;

    if(infoEnd > infoTotal){
      infoEnd = infoTotal;
    }

    if(infoEnd === 0){
      infoStart = 0;
    }

    pageField.setValue(s.showPage + 1);

    ofText.el.update( Fancy.String.format(lang.paging.of, [pages || 1]) );
    info.el.update( Fancy.String.format(lang.paging.info, [infoStart, infoEnd, infoTotal]) );

    if(showPage === 0){
      first.disable();
      prev.disable();
    }
    else{
      first.enable();
      prev.enable();
    }

    if(pages - 1 === showPage || pages === 0){
      last.disable();
      next.disable();
    }
    else{
      last.enable();
      next.enable();
    }
  },
  /*
   *
   */
  onRenderGrid: function(){
    var me = this;

    switch(me.barType){
      case 'both':
        me.updateBar('tbar');
        me.updateBar('bbar');
        break;
      case 'none':
      case false:
        break;
      default:
        me.updateBar();
    }
  }
});