/*
 * @mixin Fancy.store.mixin.Paging
 */
Fancy.modules['infinite'] = true;
Fancy.Mixin('Fancy.store.mixin.Infinite',{
  /*
   *
   */
  initInfinite(){
    const me = this;

    if (me.infinite === undefined) {
      return;
    }

    if(Fancy.isObject(me.infinite)){
      Fancy.apply(me, me.infinite);
    }

    Fancy.applyIf(me, {
      infiniteDisplayedRows: 50,
      infiniteScrolledToRow: 0
    });
  },
  /*
   *
   */
  getNumOfInfiniteRows(){
    const me = this;

    if(me.filteredData){
      return me.filteredData.length;
    }

    return me.data.length;
  }
});
