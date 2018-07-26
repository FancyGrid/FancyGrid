/*
 * @class Fancy.grid.plugin.State
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  F.define('Fancy.grid.plugin.State', {
    extend: F.Plugin,
    ptype: 'grid.state',
    inWidgetName: 'state',
    stateful: false,
    $log: {
      filter: true,
      sort: true,
      columnresize: true,
      columndrag: true,
      changepage: true,
      columnhide: true,
      resize: true
    },
    /*
     * @param {Object} config
     */
    constructor: function (config) {
      this.log = this.log || {};

      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.Super('init', arguments);

      me.initLog();

      me.ons();
    },
    ons: function () {
      var me = this,
        w = me.widget;

      //w.on('init', me.onInit, me);
      w.on('beforeinit', me.onBeforeInit, me);
      if(me.stateful){
        if(me.log.sort){
          w.on('sort', me.onSort, me);
        }
        if(me.log.filter) {
          w.on('filter', me.onFilter, me);
        }
        if(me.log.columnresize) {
          w.on('columnresize', me.onColumnResize, me);
        }
        if(me.log.columndrag) {
          w.on('columndrag', me.onColumnDrag, me);
          w.on('lockcolumn', me.onColumnLock, me);
          w.on('rightlockcolumn', me.onColumnRightLock, me);
          w.on('unlockcolumn', me.onColumnUnLock, me);
        }
        if(me.log.changepage){
          w.on('changepage', me.onChangePage, me);
        }
        if(me.log.columnhide) {
          w.on('columnhide', me.onColumnHide, me);
          w.on('columnshow', me.onColumnShow, me);
        }

        w.on('init', function () {
          if(w.panel){
            if(me.log.resize){
              w.panel.on('resize', me.onResize, me);
            }
          }
        });
      }
    },
    onSort: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        name = w.getStateName(),
        o = localStorage.getItem(name) || '{}';

      o = JSON.parse(o);

      o.sorters = JSON.stringify(s.sorters);

      localStorage.setItem(name, JSON.stringify(o));
      me.copyColumns();

      me.widget.fire('statechange', me.getState());
    },
    onFilter: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        name = w.getStateName(),
        o = localStorage.getItem(name) || '{}';

      o = JSON.parse(o);

      o.filters = JSON.stringify(s.filters);

      localStorage.setItem(name, JSON.stringify(o));
      me.copyColumns();

      me.widget.fire('statechange', me.getState());
    },
    onColumnResize: function () {
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState());
    },
    onColumnDrag: function () {
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState());
    },
    onColumnLock: function () {
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState());
    },
    onColumnRightLock: function () {
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState());
    },
    onColumnUnLock: function () {
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState());
    },
    onColumnHide: function () {
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState());
    },
    onColumnShow: function () {
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState());
    },
    copyColumns: function () {
      var me = this,
        w = me.widget,
        name = w.getStateName(),
        o = localStorage.getItem(name) || '{}';

      o = JSON.parse(o);

      var columns = [].concat(w.leftColumns).concat(w.columns).concat(w.rightColumns),
        _columns = [];

      F.each(columns, function (column) {
        var _column = {};

        F.each(column, function (v, p) {
          if(F.isString(v) || F.isNumber(v) || F.isBoolean(v)){
            _column[p] = v;
          }
        });

        _columns.push(_column);
      });

      o.columns = JSON.stringify(_columns);

      localStorage.setItem(name, JSON.stringify(o));
    },
    onBeforeInit: function () {
      var me = this,
        w = me.widget,
        name = w.getStateName(),
        state = localStorage.getItem(name) || '{}';
        startState = me.startState;

      if(startState){
        if(w.store.loading){
          w.once('load', me.onBeforeInit, me);
          return;
        }

        if(startState.filters){
          setTimeout(function () {
            for (var p in startState.filters) {
              var filter = startState.filters[p];

              for (var q in filter) {
                w.addFilter(p, filter[q], q);
              }
            }
          }, 100);
        }

        if(startState.sorters){
          setTimeout(function () {
            F.each(startState.sorters, function (sorter) {
              w.sort(sorter.key, sorter.dir);
            });
          }, 100);
        }

        if(startState.page !== undefined){
          setTimeout(function () {
            w.setPage(Number(startState.page) + 1);
          }, 100);
        }
      }

      state = JSON.parse(state);
      if(state.sorters) {
        state.sorters = JSON.parse(state.sorters);

        F.each(state.sorters, function (sorter) {
          w.sort(sorter.key, sorter.dir);
        });
      }

      if(state.filters){
        state.filters = JSON.parse(state.filters);

        for(var p in state.filters){
          var filter = state.filters[p];

          for(var q in filter){
            w.addFilter(p, filter[q], q);
          }
        }
      }

      if(state.page) {
        w.setPage(Number(state.page) + 1);
      }

      if(state.width){
        w.setWidth(state.width);
      }

      if(state.height){
        w.setHeight(state.height);
      }
    },
    onChangePage: function (grid, page) {
      var me = this,
        w = me.widget,
        name = w.getStateName(),
        state = localStorage.getItem(name) || '{}';

      if(page === undefined){
        return;
      }

      if(!state){
        return;
      }

      if(!w.inited){
        return;
      }

      state = JSON.parse(state);
      state.page = page;

      localStorage.setItem(name, JSON.stringify(state));

      me.widget.fire('statechange', me.getState());
    },
    onResize: function (panel, o) {
      var me = this,
        w = me.widget,
        name = w.getStateName(),
        state = localStorage.getItem(name) || '{}';

      state = JSON.parse(state);

      state.width = o.width;
      state.height = o.height;

      localStorage.setItem(name, JSON.stringify(state));

      me.widget.fire('statechange', me.getState());
    },
    /*
     *
     */
    initLog: function(){
      var me = this;

      F.applyIf(me.log, me.$log);
    },
    /*
     *
     */
    getState: function () {
      var me = this,
        w = me.widget,
        name = w.getStateName(),
        state = localStorage.getItem(name) || '{}';

      return state;
    }
  });

})();