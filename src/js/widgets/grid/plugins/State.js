/*
 * @class Fancy.grid.plugin.State
 * @extends Fancy.Plugin
 */
Fancy.modules['state'] = true;
(function(){
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
    constructor: function(){
      this.log = this.log || {};

      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function(){
      var me = this;

      me.Super('init', arguments);

      me.initLog();

      me.ons();
    },
    ons: function(){
      var me = this,
        w = me.widget;

      //w.on('init', me.onInit, me);
      w.on('beforeinit', me.onBeforeInit, me);
      if(me.stateful){
        if(me.log.sort){
          w.on('sort', me.onSort, me);
        }
        if(me.log.filter){
          w.on('filter', me.onFilter, me);
        }
        if(me.log.columnresize){
          w.on('columnresize', me.onColumnResize, me);
        }
        if(me.log.columndrag){
          w.on('columndrag', me.onColumnDrag, me);
          w.on('lockcolumn', me.onColumnLock, me);
          w.on('rightlockcolumn', me.onColumnRightLock, me);
          w.on('unlockcolumn', me.onColumnUnLock, me);
        }
        if(me.log.changepage){
          w.on('changepage', me.onChangePage, me);
        }
        if(me.log.columnhide){
          w.on('columnhide', me.onColumnHide, me);
          w.on('columnshow', me.onColumnShow, me);
        }

        w.on('columnremove', me.onColumnRemove, me);
        w.on('columnadd', me.onColumnAdd, me);

        w.on('init', function(){
          if(w.panel){
            if(me.log.resize){
              w.panel.on('resize', me.onResize, me);
            }
          }
        });

        //Changing width/height over API
        w.on('changewidth', me.onChangeWidth, me);
        w.on('changeheight', me.onChangeHeight, me);
      }
    },
    onSort: function(){
      var me = this,
        w = me.widget,
        s = w.store,
        name = w.getStateName(),
        o = localStorage.getItem(name) || '{}';

      o = JSON.parse(o);

      o.sorters = JSON.stringify(s.sorters);

      localStorage.setItem(name, JSON.stringify(o));
      me.copyColumns();

      me.widget.fire('statechange', me.getState(), 'sorters', o.sorters);
    },
    onFilter: function(){
      var me = this,
        w = me.widget,
        s = w.store,
        name = w.getStateName(),
        o = localStorage.getItem(name) || '{}';

      o = JSON.parse(o);

      o.filters = JSON.stringify(s.filters);

      localStorage.setItem(name, JSON.stringify(o));
      me.copyColumns();

      me.widget.fire('statechange', me.getState(), 'filters', o.filters);
    },
    onColumnResize: function(){
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState(), 'columns');
    },
    onColumnDrag: function(){
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState(), 'columns');
    },
    onColumnLock: function(){
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState(), 'columns');
    },
    onColumnRightLock: function(){
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState(), 'columns');
    },
    onColumnUnLock: function(){
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState(), 'columns');
    },
    onColumnHide: function(){
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState(), 'columns');
    },
    onColumnShow: function(){
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState(), 'columns');
    },
    onColumnRemove: function(){
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState(), 'columns');
    },
    onColumnAdd: function(){
      var me = this;

      me.copyColumns();
      me.widget.fire('statechange', me.getState(), 'columns');
    },
    copyColumns: function(){
      var me = this,
        w = me.widget,
        name = w.getStateName(),
        o = localStorage.getItem(name) || '{}';

      o = JSON.parse(o);

      var columns = [].concat(w.leftColumns).concat(w.columns).concat(w.rightColumns),
        _columns = [];

      F.each(columns, function(column){
        var _column = {};

        F.each(column, function(v, p){
          var valueType = F.typeOf(v);
          switch (valueType){
            case 'string':
            case 'number':
            case 'boolean':
              _column[p] = v;
              break;
            case 'object':
              switch (p){
                case 'filterField':
                  break;
                default:
                  _column[p] = 'OBJECT';
              }
              break;
            case 'array':
              _column[p] = 'ARRAY';
              break;
            case 'function':
              _column[p] = 'FUNCTION';
              break;
          }
        });

        _columns.push(_column);
      });

      o.columns = JSON.stringify(_columns);

      localStorage.setItem(name, JSON.stringify(o));
    },
    onBeforeInit: function(){
      var me = this,
        w = me.widget,
        name = w.getStateName(),
        state = localStorage.getItem(name) || '{}',
        startState = me.startState;

      if(state === '{}' && w.autoColumnWidth){
        w.allowAutoWidthStateIsEmpty = true;
      }

      var applyFilters = function(){
        for (var p in startState.filters){
          var filter = startState.filters[p];

          for (var q in filter){
            if (q === '*' && w.searching){
              w.addFilter(p, filter[q], q, false);
            }
            else {
              w.addFilter(p, filter[q], q);
            }
          }
        }
      };

      var applySorters = function(){
        F.each(startState.sorters, function(sorter){
          w.sort(sorter.key, sorter.dir, false);
        });
      };

      if(startState){
        w.waitingForFilters = true;
        w.stateIsWaiting = true;

        if(w.WAIT_FOR_STATE_TO_LOAD){
          if (startState.filters){
            applyFilters();
            if(w.store.remoteFilter){
              w.store.serverFilter(false);
            }
          }

          if (startState.sorters){
            applySorters();
          }

          delete w.WAIT_FOR_STATE_TO_LOAD;
          w.store.loadData();
        }

        if (w.store.loading){
          w.once('load', function(){
            me.onBeforeInit();
          }, me);
          return;
        }

        setTimeout(function(){
          if(!w.SERVER_FILTER_SORT){
            if (startState.filters){
              applyFilters();
            }

            if (startState.sorters){
              applySorters();
            }
          }

          if (startState.page !== undefined){
            w.setPage(Number(startState.page), false);
          }

          delete w.waitingForFilters;
          w.store.changeDataView();
          delete w.stateIsWaiting;
          w.update();
          w.setSidesHeight();
        }, 100);
      }

      if(state.width){
        w.setWidth(state.width);
      }

      if(state.height){
        w.setHeight(state.height);
      }
    },
    onChangePage: function(grid, page){
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
      state.page = page + 1;

      localStorage.setItem(name, JSON.stringify(state));

      me.widget.fire('statechange', me.getState(), 'page', state.page);
    },
    onResize: function(panel, o){
      var me = this,
        w = me.widget,
        name = w.getStateName(),
        state = localStorage.getItem(name) || '{}';

      state = JSON.parse(state);

      if(!w.responsiveWidth && !w.wrapped){
        state.width = o.width;
      }

      if(!w.responsiveHeight && !w.wrapped){
        state.height = o.height;
      }

      localStorage.setItem(name, JSON.stringify(state));

      me.widget.fire('statechange', me.getState(), 'size', [state.width, state.height]);
    },
    /*
     *
     */
    onChangeWidth: function(grid, value){
      var me = this,
        w = me.widget,
        name = w.getStateName(),
        state = localStorage.getItem(name) || '{}';

      state = JSON.parse(state);

      if(!w.responsiveWidth && !w.wrapped){
        state.width = value;
      }

      localStorage.setItem(name, JSON.stringify(state));

      me.widget.fire('statechange', me.getState(), 'width', state.width);
    },
    /*
     *
     */
    onChangeHeight: function(grid, value){
      var me = this,
        w = me.widget,
        name = w.getStateName(),
        state = localStorage.getItem(name) || '{}';

      state = JSON.parse(state);

      if(!w.responsiveHeight && !w.wrapped){
        state.height = value;
      }

      localStorage.setItem(name, JSON.stringify(state));

      me.widget.fire('statechange', me.getState(), 'height', state.height);
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
    getState: function(){
      var me = this,
        w = me.widget,
        name = w.getStateName(),
        state = localStorage.getItem(name) || '{}';

      if(state === '{}'){
        state = me.startState;
      }

      if(F.isString(state)){
        return JSON.parse(state);
      }

      return state;
    }
  });
})();