/*
 * @mixin Fancy.store.mixin.Paging
 */
Fancy.modules['paging'] = true;
Fancy.Mixin('Fancy.store.mixin.Paging',{
  /*
   *
   */
  initPaging(){
    const me = this;

    if(me.paging === undefined){
      return;
    }

    if(Fancy.isObject(me.paging)){
      Fancy.apply(me, me.paging);
    }

    me.calcPages();
    //me.changeDataView();
  },
  /*
   *
   */
  firstPage(){
    const me = this;

    me.calcPages();

    me.showPage = 0;

    if(me.pageType === 'server'){
      me.loadPage();
    }
    else {
      me.changeDataView({
        stoppedFilter: true
      });
    }
  },
  /*
   *
   */
  prevPage(){
    const me = this;

    me.calcPages();
    me.showPage--;

    if(me.showPage < 0){
      me.showPage = 0;
    }

    if(me.pageType === 'server'){
      me.loadPage();
    }
    else {
      me.changeDataView({
        stoppedFilter: true
      });
    }
  },
  /*
   *
   */
  nextPage(){
    const me = this;

    me.calcPages();
    me.showPage++;

    if(me.showPage === me.pages){
      me.showPage--;
    }

    if(me.showPage < 0){
      me.showPage = 0;
    }

    if(me.pageType === 'server'){
      me.loadPage();
    }
    else {
      me.changeDataView({
        stoppedFilter: true
      });
    }
  },
  /*
   *
   */
  lastPage(){
    const me = this;

    me.calcPages();
    me.showPage = me.pages - 1;

    if(me.showPage < 0){
      me.showPage = 0;
    }

    if(me.pageType === 'server'){
      me.loadPage();
    }
    else {
      me.changeDataView({
        stoppedFilter: true
      });
    }
  },
  /*
   *
   */
  calcPages(){
    var me = this,
      w = me.widget,
      pageOverFlowType;

    switch(w.paging.pageOverFlowType){
      case undefined:
      case 'last':
        pageOverFlowType = 'last';
        break;
      case 'first':
        pageOverFlowType = 'first';
        break;
    }

    if(me.pageType === 'server'){
      me.pages = Math.ceil(me.getTotal() / me.pageSize);
      if(!isNaN(me.showPage) && me.showPage > me.pages){
        if(pageOverFlowType === 'last'){
          me.showPage = Math.floor((me.getTotal()/me.pageSize)) - 1;
          if(me.showPage < 0){
            me.showPage = 0;
          }
        }
        else{
          me.showPage = 0;
        }

        return 'needs reload';
      }
    }
    else {
      me.pages = Math.ceil( me.getTotal() / me.pageSize );
    }

    if(me.showPage >= me.pages){
      if(pageOverFlowType === 'last'){
        me.showPage = me.pages - 1;
      }
      else{
        me.showPage = 0;
      }
    }

    if(me.showPage < 0){
      me.showPage = 0;
    }

    //TODO: Needs to replace with something else since it is not real change page.???
    me.fire('changepages', me.showPage);
  },
  /*
   * @param {Number} value
   * @param {Boolean} [update]
   */
  setPage(value, update){
    const me = this;

    me.showPage = value;

    if(me.showPage === me.pages){
      me.showPage--;
    }

    if(me.showPage < 0){
      me.showPage = 0;
    }

    if(me.pageType === 'server'){
      me.loadPage();
    }
    else if(update !== false){
      me.changeDataView({
        stoppedFilter: true
      });
    }
  },
  refresh(){
    const me = this;

    if(me.pageType === 'server'){
      me.loadPage();
    }
    else{
      me.changeDataView({
        stoppedFilter: true
      });
    }
  },
  /*
   * @param {Object} o
   */
  processPagingData(o){
    const me = this,
      w = me.widget;

    if (o.totalCount !== undefined) {
      me.totalCount = o.totalCount;
    }

    me.checkPagingType(o);
    if(me.proxy.wrapper === false || o[me.readerRootProperty] === undefined){
      me.setData(o);
    }
    else {
      me.setData(o[me.readerRootProperty]);
    }

    //me.calcPages();

    //TODO: check samples with filter, paging and server and static
    if(!w.stateIsWaiting){
      me.changeDataView({
        stoppedFilter: true
      });

      if( me.calcPages() === 'needs reload'){
        me.loadPage();
      }
    }
    else{
      me.calcPages();
    }
  },
  /*
   * @param {Object} o
   */
  checkPagingType(o){
    const me = this;

    if(o.totalCount !== undefined && o.totalCount !== o[me.readerRootProperty].length){
      me.totalCount = o.totalCount;
      me.pageType = 'server';
      if(me.remoteSort === undefined){
        me.remoteSort = true;
      }
      //Not sure what is better about type of paging, sorting, filtering
      //maybe just actionType
      //me.actionType = 'server';
    }
  },
  /*
   *
   */
  loadPage(){
    this.loadData();
  },
  /*
   * @param {Number} value
   */
  setPageSize(value){
    const me = this,
      w = me.widget;

    me.pageSize = value;

    me.calcPages();

    if(me.pageType === 'server'){
      me.loadPage();
    }
    else {
      me.changeDataView({
        stoppedFilter: true
      });
    }

    w.fire('changepagesize', value);
  }
});
/*
 * @class Fancy.grid.plugin.Paging
 * @extends Fancy.Plugin
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  const PANEL_TBAR_CLS = F.PANEL_TBAR_CLS;
  const PANEL_BBAR_CLS = F.PANEL_BBAR_CLS;
  const PANEL_BAR_PAGING_CLS = F.PANEL_BAR_PAGING_CLS;

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
    init(){
      const me = this;

      me.Super('init', arguments);
      me.ons();
    },
    /*
     *
     */
    ons(){
      const me = this,
        w = me.widget,
        store = w.store;

      store.on('change', me.onChangeStore, me);
      store.on('remove', me.onChangeStore, me);
      store.on('filter', me.onChangeStore, me);
      w.on('render', me.onRenderGrid, me);
      w.on('docmove', me.onDocMouseMove, me);
      w.on('render', () => me.setCls());
    },
    /*
     * @param {Number} value
     */
    setPageSize(value){
      this.widget.store.setPageSize(value);
      this.widget.update();
    },
    /*
     *
     */
    nextPage(){
      this.widget.store.nextPage();
      this.widget.update();
    },
    /*
     *
     */
    lastPage(){
      this.widget.store.lastPage();
      this.widget.update();
    },
    /*
     *
     */
    prevPage(){
      this.widget.store.prevPage();
      this.widget.update();
    },
    /*
     *
     */
    firstPage(){
      this.widget.store.firstPage();
      this.widget.update();
    },
    /*
     * @param {Fancy.Store} store
     */
    onChangeStore(store){
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
    setPage(value, update){
      const me = this,
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
    refresh(){
      const me = this,
        w = me.widget,
        s = w.store;

      w.showLoadMask();
      setTimeout(() => {
        s.refresh();

        if (s.pageType !== 'server'){
          w.hideLoadMask();
        }
      }, 200);
    },
    /*
     * @param {String} barType
     */
    updateBar(barType){
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
    onRenderGrid(){
      const me = this;

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
    onDocMouseMove(){
      const me = this,
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
    update(){
      const me = this,
        w = me.widget,
        s = w.store;

      s.calcPages();
      me.onChangeStore(s);
    },
    /*
     *
     */
    setCls(){
      const me = this,
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
