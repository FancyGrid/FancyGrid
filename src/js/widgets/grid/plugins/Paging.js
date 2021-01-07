/*
 * @class Fancy.grid.plugin.Paging
 * @extends Fancy.Plugin
 */
(function(){
  //SHORTCUTS
  var F = Fancy;

  var PANEL_TBAR_CLS = F.PANEL_TBAR_CLS;
  var PANEL_BBAR_CLS = F.PANEL_BBAR_CLS;
  var PANEL_BAR_PAGING_CLS = F.PANEL_BAR_PAGING_CLS;

  Fancy.define('Fancy.grid.plugin.Paging', {
    extend: Fancy.Plugin,
    ptype: 'grid.paging',
    inWidgetName: 'paging',
    barType: 'bbar',
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function(){
      this.Super('const', arguments);
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
      w.on('docmove', me.onDocMouseMove, me);
      w.on('render', function(){
        me.setCls();
      });
    },
    /*
     * @param {Number} value
     */
    setPageSize: function(value){
      this.widget.store.setPageSize(value);
      this.widget.update();
    },
    /*
     *
     */
    nextPage: function(){
      this.widget.store.nextPage();
      this.widget.update();
    },
    /*
     *
     */
    lastPage: function(){
      this.widget.store.lastPage();
      this.widget.update();
    },
    /*
     *
     */
    prevPage: function(){
      this.widget.store.prevPage();
      this.widget.update();
    },
    /*
     *
     */
    firstPage: function(){
      this.widget.store.firstPage();
      this.widget.update();
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

      switch (me.barType){
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
          pageField = panel['_' + me.barType].roles.pagenumber;
          pageField.setValue(s.showPage + 1);

          me.updateBar();
      }

      w.setSidesHeight();
      if (me.$prevPage === undefined){
        w.fire('changepage', store.showPage);
      }
      else if (me.$prevPage !== store.showPage){
        w.fire('changepage', store.showPage);
      }

      me.$prevPage = store.showPage;
    },
    /*
     * @param {Number} value
     * @param {Boolean} [update]
     */
    setPage: function(value, update){
      var me = this,
        w = me.widget,
        s = w.store;

      if (value < 0){
        value = 0;
      }
      else if (value > s.pages){
        value = s.pages;
      }

      s.setPage(value, update);
      w.update();

      return value;
    },
    /*
     *
     */
    refresh: function(){
      var me = this,
        w = me.widget,
        s = w.store;

      w.showLoadMask();
      setTimeout(function(){
        s.refresh();

        if (s.pageType !== 'server'){
          w.hideLoadMask();
        }
      }, 200);
    },
    /*
     * @param {String} barType
     */
    updateBar: function(barType){
      barType = barType || this.barType;

      var me = this,
        w = me.widget,
        s = w.store,
        showPage = s.showPage,
        pageSize = s.pageSize,
        pages = s.pages,
        panel = w.panel,
        bar = panel['_' + barType],
        barRoles = bar.roles,
        pageField = barRoles.pagenumber,
        ofText = barRoles.ofText,
        info = barRoles.info,
        first = barRoles.first,
        prev = barRoles.prev,
        next = barRoles.next,
        last = barRoles.last,
        infoStart = showPage * pageSize + 1,
        infoEnd = infoStart + pageSize - 1,
        infoTotal = s.getTotal() || 0,
        lang = w.lang;

      if (infoEnd > infoTotal){
        infoEnd = infoTotal;
      }

      if (infoEnd === 0){
        infoStart = 0;
      }

      if (infoStart > infoEnd){
        infoEnd = infoStart;
      }

      pageField.setValue(s.showPage + 1);

      ofText.el.update(Fancy.String.format(lang.paging.of, [pages || 1]));
      info.el.update(Fancy.String.format(lang.paging.info, [infoStart, infoEnd, infoTotal]));

      if (showPage === 0){
        first.disable();
        prev.disable();
      }
      else {
        first.enable();
        prev.enable();
      }

      if (pages - 1 === showPage || pages === 0){
        last.disable();
        next.disable();
      }
      else {
        last.enable();
        next.enable();
      }

      if (parseInt(w.el.css('width')) < 350){
        info.hide();
        bar.checkScroll();
      }
    },
    /*
     *
     */
    onRenderGrid: function(){
      var me = this;

      switch (me.barType){
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
    },
    /*
     *
     */
    onDocMouseMove: function(){
      var me = this,
        w = me.widget;

      if (w.el.css('display') === 'none' || (w.panel && w.panel.el && w.panel.el.css('display') === 'none')){
        if (!me.wasHidden){
          Fancy.combo.Manager.hideLists();
          me.wasHidden = true;
        }
      }
      else {
        me.wasHidden = false;
      }
    },
    /*
     *
     */
    update: function(){
      var me = this,
        w = me.widget,
        s = w.store;

      s.calcPages();
      me.onChangeStore(s);
    },
    /*
     *
     */
    setCls: function(){
      var me = this,
        w = me.widget;

      switch (me.barType){
        case 'bbar':
          w.panel.el.select('.' + PANEL_BBAR_CLS).addCls(PANEL_BAR_PAGING_CLS);
          break;
        case 'tbar':
          w.panel.el.select('.' + PANEL_TBAR_CLS).addCls(PANEL_BAR_PAGING_CLS);
          break;
        case 'both':
          w.panel.el.select('.' + PANEL_BBAR_CLS).addCls(PANEL_BAR_PAGING_CLS);
          w.panel.el.select('.' + PANEL_TBAR_CLS).addCls(PANEL_BAR_PAGING_CLS);
          break;
      }
    }
  });
})();