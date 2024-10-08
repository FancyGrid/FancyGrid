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
