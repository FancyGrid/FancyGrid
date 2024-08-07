/*
 * @class Fancy.grid.plugin.RowHeight
 * @extends Fancy.Plugin
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  F.define('Fancy.grid.plugin.RowHeight', {
    extend: F.Plugin,
    ptype: 'grid.rowheight',
    inWidgetName: 'rowheight',
    cellTip: '{value}',
    stopped: true,
    waitingForParentVisibility: false,
    /*
     * @param {Object} config
     */
    constructor: function(){
      this.Super('const', arguments);

      this.rows = {};
      this.rowIndexes = [];
      this.rowIndexesSum = [];
    },
    /*
     *
     */
    init(){
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons(){
      const me = this,
        w = me.widget;

      w.on('init', me.onInit, me);
      w.on('update', me.onUpdate, me);
      w.on('columnresize', me.onColumnResize, me);
      w.on('changepage', me.onChangePage, me);
      w.on('sort', me.onSort, me);
    },
    onInit(){
      const me = this,
        w = me.widget;

      setTimeout(() => {
        w.scroller.update(me.totalHeight);
      }, 50);
    },
    /*
     *
     */
    onUpdate(){
      var me = this,
        w = me.widget,
        viewData = w.getDataView(),
        totalHeight = 0;

      F.each(viewData, item => {
        const id = item.id,
          height = me.rows[id],
          rowIndex = w.getRowById(id),
          cells = w.getDomRow(rowIndex);

        F.each(cells, (cellDom) => {
          const cell = F.get(cellDom);

          cell.css('height', height);
        });

        totalHeight += height;
      });

      me.totalHeight = totalHeight;

      if(w.isGroupable()){
        me.totalHeight += w.grouping.getGroupRowsHeight();
      }

      setTimeout(() => {
        w.setSidesHeight(me.totalHeight);
        w.scroller.update(me.totalHeight);
      }, 50);
    },
    /*
     *
     */
    add(id, height, rowIndex){
      const me = this;

      if(me.rows[id] && me.rows[id] > height){
        return;
      }

      me.rows[id] = height;
      me.rowIndexes[rowIndex] = height;

      clearInterval(me.intIndexesSum);

      me.intIndexesSum = setTimeout(() => {
        me.rowIndexesSum = [];

        F.each(me.rowIndexes, (value, index) => {
          if(index === 0){
            me.rowIndexesSum[index] = value;
          }
          else {
            me.rowIndexesSum[index] = me.rowIndexesSum[index - 1] + value;
          }
        });
      }, 1);
    },
    /*
     *
     */
    getRowsHeight(items){
      var me = this,
        height = 0;

      F.each(items, (item) => {
        const id = item.get('id');

        height += me.rows[id];
      });

      return height;
    },
    /*
     *
     */
    onColumnResize(grid, o){
      const me = this;

      me.rows = {};

      if(o.column.type === 'text' && o.column.autoHeight){

        setTimeout(() => {
          me.widget.update();
          me.onUpdate();
        }, 400);
      }
    },
    /*
     *
     */
    onChangePage(){
      this.rows = {};
    },
    /*
     *
     */
    onSort(){
      this.rows = {};
    },
    /*
     *
     */
    waitToShow(){
      const me = this;

      if(me.waitingForParentVisibility){
        return;
      }

      me.waitingForParentVisibility = true;

      const w = me.widget,
        parentEl = me.getHiddenParent(w.el);

      if(!parentEl){
        return;
      }

      me.intWaitToShow = setInterval(() => {
        if(parentEl.css('display') === 'none'){
          return;
        }

        clearInterval(me.intWaitToShow);

        me.widget.update();
        me.onUpdate();
      }, 350);
    },
    /*
     *
     */
    getHiddenParent: function(el, deep = 0){
      const maxDeep = 10;

      deep++;

      if(deep > maxDeep){
        return;
      }

      if(el.css('display') === 'none'){
        return el;
      }

      if(el.dom.tagName.toLocaleLowerCase() === 'body'){
        return;
      }

      el = el.parent();

      return this.getHiddenParent(el, deep);
    }
  });

})();
