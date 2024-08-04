/*
 * @class Fancy.grid.plugin.CellTip
 * @extends Fancy.Plugin
 */
(function(){
  //SHORTCUTS
  const F = Fancy;
  const HIDE_TIMEOUT = 500;

  const TOOLTIP_CLS = F.TOOLTIP_CLS;
  const TOOLTIP_INNER_CLS = F.TOOLTIP_INNER_CLS;

  F.define('Fancy.grid.plugin.CellTip', {
    extend: F.Plugin,
    ptype: 'grid.celltip',
    inWidgetName: 'celltip',
    cellTip: '{value}',
    stopped: true,
    /*
     * @param {Object} config
     */
    constructor: function(){
      this.Super('const', arguments);
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
        w = me.widget,
        docEl = F.get(document);

      w.on('cellenter', me.onCellEnter, me);
      w.on('cellleave', me.onCellLeave, me);
      docEl.on('touchend', me.onTouchEnd, me);
      docEl.on('mousemove', me.onDocMove, me);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellEnter(grid, o){
      let me = this,
        column = o.column,
        cellTip = me.cellTip,
        e = o.e;

      if(!o){
        return;
      }

      if (column.cellTip){
        if (F.isString(column.cellTip)){
          cellTip = column.cellTip;
        }
        else if (F.isFunction(column.cellTip)){
          cellTip = column.cellTip(o);
          if (cellTip === false){
            return;
          }
        }

        const tpl = new F.Template(cellTip),
          data = {
            title: column.title,
            value: o.value,
            columnIndex: 0,
            rowIndex: 0
          };

        me.stopped = false;
        F.apply(data, o.data);

        F.tip.update(tpl.getHTML(data));
        F.tip.show(e.pageX + 15, e.pageY - 25);
      }
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellLeave(){
      this.stopped = true;
      F.tip.hide(HIDE_TIMEOUT);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onTouchEnd(){
      this.stopped = true;
      F.tip.hide(HIDE_TIMEOUT);
    },
    /*
     * @param {Object} e
     */
    onDocMove(e){
      if (this.stopped === true){
        return;
      }

      const me = this,
        w = me.widget;

      if(w.el.css('display') === 'none' || (w.panel && w.panel.el && w.panel.el.css('display') === 'none')){
        me.stopped = true;
        F.tip.hide(HIDE_TIMEOUT);
        return;
      }

      const targetEl = F.get(e.target);

      if(targetEl.prop('tagName').toLocaleLowerCase() === 'body'){
        me.stopped = true;
        F.tip.hide(HIDE_TIMEOUT);
        return;
      }

      if(!targetEl.hasClass(TOOLTIP_CLS) && !targetEl.hasClass(TOOLTIP_INNER_CLS)){
        if(w.el.within(targetEl) === false){
          me.stopped = true;
          F.tip.hide(HIDE_TIMEOUT);
          return;
        }
      }

      F.tip.show(e.pageX + 15, e.pageY - 25);
    }
  });

})();
