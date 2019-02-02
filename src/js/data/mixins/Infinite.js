/*
 * @mixin Fancy.store.mixin.Paging
 */
Fancy.Mixin('Fancy.store.mixin.Infinite',{
  /*
   *
   */
  initInfinite: function(){
    var me = this;

    if(me.infinite === undefined){
      return;
    }

    if(Fancy.isObject(me.infinite)){
      Fancy.apply(me, me.infinite);
    }

    Fancy.applyIf(me, {
      infiniteDisplayedRows: 50,
      infiniteScrolledToRow: 0
    });
  }
});