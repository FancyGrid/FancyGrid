/*
 * @mixin Fancy.grid.mixin.Grid
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var TOUCH_CLS = F.TOUCH_CLS;
  var HIDDEN_CLS = F.HIDDEN_CLS;
  var GRID_CLS = F.GRID_CLS;
  var GRID_CENTER_CLS = F.GRID_CENTER_CLS;
  var GRID_LEFT_CLS = F.GRID_LEFT_CLS;
  var GRID_RIGHT_CLS = F.GRID_RIGHT_CLS;
  var GRID_HEADER_CLS = F.GRID_HEADER_CLS;
  var GRID_BODY_CLS = F.GRID_BODY_CLS;
  var PANEL_BODY_INNER_CLS =  F.PANEL_BODY_INNER_CLS;
  var GRID_UNSELECTABLE_CLS = F.GRID_UNSELECTABLE_CLS;
  var GRID_LEFT_EMPTY_CLS = F.GRID_LEFT_EMPTY_CLS;
  var GRID_RIGHT_EMPTY_CLS = F.GRID_RIGHT_EMPTY_CLS;
  var GRID_COLUMN_SORT_ASC_CLS = F.GRID_COLUMN_SORT_ASC;
  var GRID_COLUMN_SORT_DESC_CLS = F.GRID_COLUMN_SORT_DESC;

  var PANEL_CLS = F.PANEL_CLS;
  var PANEL_TBAR_CLS = F.PANEL_TBAR_CLS;
  var PANEL_SUB_TBAR_CLS = F.PANEL_SUB_TBAR_CLS;
  var PANEL_BBAR_CLS = F.PANEL_BBAR_CLS;
  var PANEL_BUTTONS_CLS = F.PANEL_BUTTONS_CLS;

  var ANIMATE_DURATION = F.ANIMATE_DURATION;

  var activeGrid;

  F.Mixin('Fancy.grid.mixin.Grid', {
    tabScrollStep: 50,
    waitingForFilters: false,
    tpl: [
      '<div class="' + GRID_LEFT_CLS + ' ' + GRID_LEFT_EMPTY_CLS + '"></div>',
      '<div class="' + GRID_CENTER_CLS + '"></div>',
      '<div class="' + GRID_RIGHT_CLS + ' ' + GRID_RIGHT_EMPTY_CLS + '"></div>',
      '<div class="fancy-grid-editors"></div>'
    ],
    /*
     *
     */
    initStore: function () {
      var me = this,
        fields = me.getFieldsFromData(me.data),
        modelName = 'Fancy.model.' + F.id(),
        data = me.data,
        remoteSort,
        remoteFilter,
        pageType,
        collapsed = false,
        state = me.state;

      if (me.data.items) {
        data = me.data.items;
      }

      remoteSort = me.data.remoteSort;
      remoteFilter = me.data.remoteFilter;
      pageType = me.data.remotePage;

      if (pageType) {
        pageType = 'server';
      }

      F.define(modelName, {
        extend: F.Model,
        fields: fields
      });

      if (me.grouping && me.grouping.collapsed !== undefined) {
        collapsed = me.grouping.collapsed;
      }

      var storeConfig = {
        widget: me,
        model: modelName,
        data: data,
        paging: me.paging,
        remoteSort: remoteSort,
        remoteFilter: remoteFilter,
        pageType: pageType,
        collapsed: collapsed,
        multiSort: me.multiSort
      };

      if (me.multiSortLimit) {
        storeConfig.multiSortLimit = me.multiSortLimit;
      }

      if (me.infinite) {
        storeConfig.infinite = true;
      }

      if (state) {
        if (state.filters) {
          storeConfig.filters = state.filters;
        }
      }

      if (data.pageSize) {
        storeConfig.pageSize = data.pageSize;
      }

      me.store = new F.Store(storeConfig);

      me.model = modelName;
      me.fields = fields;

      if (me.store.filters) {
        setTimeout(function () {
          me.filter.filters = me.store.filters;
          me.filter.updateStoreFilters();
        }, 1);
      }
    },
    /*
     *
     */
    initTouch: function () {
      var me = this;

      if (F.isTouch && window.FastClick) {
        if (me.panel) {
          FastClick.attach(me.panel.el.dom);
          me.panel.addCls(TOUCH_CLS);
        }
        else {
          FastClick.attach(me.el.dom);
          me.addCls(TOUCH_CLS);
        }
      }
    },
    /*
     *
     */
    initElements: function () {
      var me = this;

      if (me.header !== false) {

        me.leftHeader = new F.grid.Header({
          widget: me,
          side: 'left'
        });

        me.header = new F.grid.Header({
          widget: me,
          side: 'center'
        });

        me.rightHeader = new F.grid.Header({
          widget: me,
          side: 'right'
        });
      }

      me.leftBody = new F.grid.Body({
        widget: me,
        side: 'left'
      });

      me.body = new F.grid.Body({
        widget: me,
        side: 'center'
      });

      me.rightBody = new F.grid.Body({
        widget: me,
        side: 'right'
      });

      me.leftEl = me.el.select('.' + GRID_LEFT_CLS);
      me.centerEl = me.el.select('.' + GRID_CENTER_CLS);
      me.rightEl = me.el.select('.' + GRID_RIGHT_CLS);
    },
    /*
     * @param {Array} data
     * @return {Array}
     */
    getFieldsFromData: function (data) {
      var me = this,
        items = data.items || data;

      if (data.fields) {
        if (me.isTreeData) {
          data.fields.push('$deep');
          data.fields.push('leaf');
          data.fields.push('parentId');
          data.fields.push('expanded');
          data.fields.push('child');
          data.fields.push('filteredChild');
        }

        return data.fields;
      }

      if (!items) {
        throw new Error('FancyGrid Error 4: Data is empty and not set fields of data to build model');
      }

      var itemZero = items[0],
        fields = [];

      for (var p in itemZero) {
        fields.push(p);
      }

      if (me.isTreeData) {
        fields.push('$deep');
        fields.push('leaf');
        fields.push('parentId');
        fields.push('expanded');
        fields.push('child');
      }

      return fields;
    },
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = Fancy.get(me.renderTo || document.body),
        el = F.get(document.createElement('div')),
        panelBodyBorders = me.panelBodyBorders;

      if (me.renderOuter) {
        el = renderTo;
      }

      if (!renderTo.dom) {
        throw new Error('[FancyGrid Error 1] - Could not find renderTo element: ' + me.renderTo);
      }

      el.addCls(
        F.cls,
        me.widgetCls,
        me.cls
      );

      if (Fancy.loadingStyle) {
        if (me.panel) {
          me.panel.el.css('opacity', 0);
          me.intervalStyleLoad = setInterval(function () {
            if (!Fancy.loadingStyle) {
              clearInterval(me.intervalStyleLoad);
              me.panel.el.animate({
                'opacity': 1,
                force: true
              });
            }
          }, 100);
        }
        else {
          el.css('opacity', 0);
          me.intervalStyleLoad = setInterval(function () {
            if (!Fancy.loadingStyle) {
              clearInterval(me.intervalStyleLoad);
              me.el.animate({
                'opacity': 1,
                force: true
              });
            }
          }, 100);
        }
      }

      el.attr('role', 'grid');
      el.attr('id', me.id);

      if (me.panel === undefined && me.shadow) {
        el.addCls('fancy-panel-shadow');
      }

      if (me.columnLines === false) {
        el.addCls('fancy-grid-disable-column-lines');
      }

      if (me.rowLines === false) {
        el.addCls('fancy-grid-disable-row-lines');
      }

      if (me.theme !== 'default' && !me.panel) {
        el.addCls('fancy-theme-' + me.theme);
      }

      if (me.treeFolder) {
        el.addCls('fancy-grid-tree-folder');
      }

      var panelBordersWidth = 0,
        panelBorderHeight = 0;

      if (me.panel) {
        panelBordersWidth = panelBodyBorders[1] + panelBodyBorders[3];
      }

      el.css({
        width: (me.width - panelBordersWidth) + 'px',
        height: (me.height - panelBorderHeight) + 'px'
      });

      me.initTpl();
      el.update(me.tpl.getHTML({}));

      if (me.renderOuter) {
        me.el = el;
      }
      else {
        me.el = F.get(renderTo.dom.appendChild(el.dom));
      }

      me.setHardBordersWidth();

      setTimeout(function () {
        if (Fancy.nojQuery) {
          me.el.addCls(Fancy.GRID_ANIMATION_CLS);
        }
      }, 100);

      me.rendered = true;
    },
    /*
     *
     */
    setHardBordersWidth: function () {
      var me = this,
        borders = me.panel ? me.gridBorders : me.gridWithoutPanelBorders;

      if (me.wrapped) {
        borders = me.gridBorders;
      }

      me.css({
        'border-top-width': borders[0],
        'border-right-width': borders[1],
        'border-bottom-width': borders[2],
        'border-left-width': borders[3]
      })
    },
    /*
     * @param {Object} [o]
     */
    update: function (o) {
      var me = this,
        s = me.store;

      if (s.loading) {
        return;
      }

      if (me.expander) {
        me.expander.reSet();
      }

      var type = 'default';

      if (o && o.type) {
        type = o.type;
      }

      me.updater.update(type);
      me.fire('update');

      if (me.heightFit) {
        me.fitHeight();
      }

      me.setBodysHeight();

      if (me.paging) {
        me.paging.update();
      }

      if (o && o.flash) {
        var changes = me.store.changed;

        for (var id in changes) {
          var item = changes[id],
            rowIndex = me.getRowById(id);

          if (rowIndex === undefined) {
            continue;
          }

          for (var key in item) {
            switch (key) {
              case 'length':
                break;
              default:
                var _o = me.getColumnOrderByKey(key);

                switch (o.flash) {
                  case true:
                    me.flashCell(rowIndex, _o.order, _o.side);
                    break;
                  case 'plusminus':
                    me.flashCell(rowIndex, _o.order, _o.side, {
                      type: 'plusminus',
                      delta: item[key].value - item[key].originValue
                    });
                    break;
                }
            }
          }
        }

        me.clearDirty();
      }
      else {
        me.scroller.update();
      }
    },
    /*
     * @param {String} side
     * @return {Number}
     */
    getColumnsWidth: function (side) {
      var me = this;

      switch (side) {
        case 'center':
        case undefined:
          return me.getCenterFullWidth();
        case 'left':
          return me.getLeftFullWidth();
        case 'right':
          return me.getRightFullWidth();
      }
    },
    /*
     *
     */
    setSides: function () {
      var me = this,
        leftColumns = me.leftColumns,
        rightColumns = me.rightColumns,
        leftWidth = me.getLeftFullWidth(),
        centerWidth = me.getCenterFullWidth(),
        rightWidth = me.getRightFullWidth(),
        gridBorders = me.gridBorders,
        panelBodyBorders = me.panelBodyBorders,
        gridWithoutPanelBorders = me.gridWithoutPanelBorders;

      if (leftColumns.length > 0) {
        me.leftEl.removeCls(GRID_LEFT_EMPTY_CLS);
      }

      if (rightColumns.length > 0) {
        me.rightEl.removeCls(GRID_RIGHT_EMPTY_CLS);
      }

      if (me.wrapped) {
        centerWidth = me.width - gridBorders[1] - gridBorders[3];
      }
      else if (me.panel) {
        centerWidth = me.width - gridBorders[1] - gridBorders[3] - panelBodyBorders[1] - panelBodyBorders[3];
      }
      else {
        centerWidth = me.width - gridWithoutPanelBorders[1] - gridWithoutPanelBorders[3];
      }

      if (leftWidth === 0 && rightWidth === 0) {
      }
      else if (rightWidth === 0) {
        centerWidth -= leftWidth;
      }
      else if (leftWidth === 0) {
        centerWidth -= rightWidth;
      }
      else if (me.width > leftWidth + centerWidth + rightWidth) {
        centerWidth -= leftWidth;
      }
      else {
        centerWidth -= leftWidth + rightWidth;
      }

      me.leftEl.css({
        width: leftWidth + 'px'
      });

      me.centerEl.css({
        left: leftWidth + 'px',
        width: centerWidth + 'px'
      });

      if (me.header) {
        me.el.select('.' + GRID_LEFT_CLS + ' .' + GRID_HEADER_CLS).css({
          width: leftWidth + 'px'
        });

        me.el.select('.' + GRID_CENTER_CLS + ' .' + GRID_HEADER_CLS).css({
          width: centerWidth + 'px'
        });
      }

      me.el.select('.' + GRID_CENTER_CLS + ' .' + GRID_BODY_CLS).css({
        width: centerWidth + 'px'
      });

      if (me.width > leftWidth + centerWidth + rightWidth) {
        me.rightEl.css({
          right: '0px'
        });
      }
      else {
        me.rightEl.css({
          left: '',
          right: '0px'
        });
      }

      me.rightEl.css({
        width: rightWidth
      });

      if (me.header) {
        me.el.select('.' + GRID_RIGHT_CLS + ' .' + GRID_HEADER_CLS).css({
          width: rightWidth + 'px'
        });
      }

      me.startWidths = {
        center: centerWidth,
        left: leftWidth,
        right: rightWidth
      };
    },
    /*
     *
     */
    setColumnsPosition: function () {
      var me = this;

      me.body.setColumnsPosition();
      me.leftBody.setColumnsPosition();
      me.rightBody.setColumnsPosition();
    },
    /*
     * @param {Number} [viewHeight]
     */
    setSidesHeight: function (viewHeight) {
      var me = this,
        s = me.store,
        height = 1,
        cellHeaderHeight = me.cellHeaderHeight;

      if (me.header !== false) {
        height += cellHeaderHeight;
        if (me.filter && me.filter.header) {
          if (me.groupheader) {
            if (me.filter.groupHeader) {
              height += cellHeaderHeight;
            }
          }
          else {
            height += cellHeaderHeight;
          }
        }

        if (me.groupheader) {
          if (!(me.filter && me.filter.header)) {
            height += cellHeaderHeight;
          }
          else {
            height += cellHeaderHeight;
          }
        }
      }

      if (me.grouping) {
        height += me.grouping.groups.length * me.groupRowHeight;
      }

      if (me.expander) {
        height += me.expander.plusHeight;
      }

      if (me.summary) {
        height += me.summary.topOffSet;
        //height += me.summary.bottomOffSet;
      }

      if (me.rowheight && me.rowheight.totalHeight) {
        viewHeight = me.rowheight.totalHeight;
      }

      height += viewHeight || (s.getLength() * me.cellHeight - 1);

      if (me.paging && me.summary && me.summary.position === 'bottom') {
        height = me.height;
      }

      me.leftEl.css({
        height: height + 'px'
      });

      me.centerEl.css({
        height: height + 'px'
      });

      me.rightEl.css({
        height: height + 'px'
      });
    },
    /*
     *
     */
    setBodysHeight: function () {
      var me = this;

      me.body.setHeight();
      me.leftBody.setHeight();
      me.rightBody.setHeight();
    },
    /*
     *
     */
    preRender: function () {
      var me = this;

      if (me.title || me.subTitle || me.tbar || me.bbar || me.buttons || me.panel) {
        me.renderPanel();
      }
    },
    /*
     *
     */
    renderPanel: function () {
      var me = this,
        panelConfig = {
          renderTo: me.renderTo,
          renderOuter: me.renderOuter,
          title: me.title,
          subTitle: me.subTitle,
          width: me.width,
          height: me.height,
          titleHeight: me.titleHeight,
          subTitleHeight: me.subTitleHeight,
          barHeight: me.barHeight,
          subTBarHeight: me.subTBarHeight || me.barHeight,
          tbarHeight: me.tbarHeight || me.barHeight,
          bbarHeight: me.bbarHeight || me.barHeight,
          buttonsHeight: me.buttonsHeight || me.barHeight,
          theme: me.theme,
          shadow: me.shadow,
          style: me.style || {},
          window: me.window,
          modal: me.modal,
          frame: me.frame,
          items: [me],
          draggable: me.draggable,
          resizable: me.resizable,
          minWidth: me.minWidth,
          minHeight: me.minHeight,
          panelBodyBorders: me.panelBodyBorders,
          barContainer: me.barContainer,
          barScrollEnabled: me.barScrollEnabled,
          tabScrollStep: me.tabScrollStep
        },
        panelBodyBorders = me.panelBodyBorders;

      if (me.bbar) {
        panelConfig.bbar = me.bbar;
        me.height -= me.bbarHeight || me.barHeight;
      }

      if (me.tbar) {
        panelConfig.tbar = me.tbar;
        me.height -= me.tbarHeight || me.barHeight;
      }

      if (me.subTBar) {
        panelConfig.subTBar = me.subTBar;
        me.height -= me.subTBarHeight || me.barHeight;
      }

      if (me.buttons) {
        panelConfig.buttons = me.buttons;
        me.height -= me.buttonsHeight || me.barHeight;
      }

      if (me.footer) {
        panelConfig.footer = me.footer;
        me.height -= me.barHeight;
      }

      me.panel = new F.Panel(panelConfig);

      me.bbar = me.panel.bbar;
      me.tbar = me.panel.tbar;
      me.subTBar = me.panel.subTBar;
      me.buttons = me.panel.buttons;

      if (!me.wrapped) {
        me.panel.addCls('fancy-panel-grid-inside');
      }

      if (me.title) {
        me.height -= me.titleHeight;
      }

      if (me.subTitle) {
        me.height -= me.subTitleHeight;
        me.height += panelBodyBorders[2];
      }

      me.height -= panelBodyBorders[0] + panelBodyBorders[2];

      me.renderTo = me.panel.el.select('.' + PANEL_BODY_INNER_CLS).dom;

      if(me.resizable){
        me.panel.on('resize', function(){
          me.setBodysHeight();
        });
      }
    },
    /*
     * @return {Number}
     */
    getBodyHeight: function () {
      var me = this,
        height = me.height,
        rows = 1,
        gridBorders = me.gridBorders,
        gridWithoutPanelBorders = me.gridWithoutPanelBorders;

      if (me.groupheader) {
        rows = 2;
      }

      if (me.filter && me.filter.header) {
        if (me.groupheader) {
          if (me.filter.groupHeader) {
            rows++;
          }
        }
        else {
          rows++;
        }
      }

      if (me.header !== false) {
        height -= me.cellHeaderHeight * rows;
      }

      if (me.panel) {
        height -= gridBorders[0] + gridBorders[2];
      }
      else {
        height -= gridWithoutPanelBorders[0] + gridWithoutPanelBorders[2];
      }

      if (me.summary) {
        height -= me.summary.topOffSet;
        height -= me.summary.bottomOffSet;
      }

      return height;
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        store = me.store,
        docEl = F.get(document);

      store.on('change', me.onChangeStore, me);
      store.on('set', me.onSetStore, me);
      store.on('insert', me.onInsertStore, me);
      store.on('remove', me.onRemoveStore, me);
      store.on('beforesort', me.onBeforeSortStore, me);
      store.on('sort', me.onSortStore, me);
      store.on('beforeload', me.onBeforeLoadStore, me);
      store.on('load', me.onLoadStore, me);
      docEl.on('mouseup', me.onDocMouseUp, me);
      docEl.on('click', me.onDocClick, me);
      docEl.on('mousemove', me.onDocMove, me);
      store.on('servererror', me.onServerError, me);
      store.on('serversuccess', me.onServerSuccess, me);

      if (me.responsive) {
        me.once('render', me.initResponsiveness, me);
      }

      me.on('activate', me.onActivate, me);
      me.on('deactivate', me.onDeActivate, me);
    },
    /*
     * @param {Object} grid
     * @param {String} errorTitle
     * @param {String} errorText
     * @param {Object} request
     */
    onServerError: function (grid, errorTitle, errorText, request) {
      this.fire('servererror', errorTitle, errorText, request);
    },
    /*
     * @param {Object} grid
     * @param {Array} data
     * @param {Object} request
     */
    onServerSuccess: function (grid, data, request) {
      this.fire('serversuccess', data, request);
    },
    /*
     *
     */
    onChangeStore: function () {
      if (this.$onChangeUpdate !== false) {
        this.update();
      }
    },
    /*
     * @param {Object} store
     */
    onBeforeLoadStore: function () {
      this.fire('beforeload');
    },
    /*
     * @param {Object} store
     * @param {String} id
     * @param {Fancy.Model} record
     */
    onRemoveStore: function (store, id, record) {
      var me = this;

      me.fire('remove', id, record);
    },
    /*
     * @param {Object} store
     * @param {Fancy.Model} record
     */
    onInsertStore: function (store, record) {
      var me = this;

      me.fire('insert', record);
    },
    /*
     * @param {Object} store
     */
    onLoadStore: function () {
      var me = this;

      setTimeout(function () {
        me.fire('load');
      }, 1);
    },
    /*
     * @param {Object} store
     * @param {Object} o
     */
    onSetStore: function (store, o) {
      var me = this;

      me.fire('set', o);
    },
    /*
     * @param {Object} store
     * @param {Object} o
     */
    onBeforeSortStore: function (store, o) {
      this.fire('beforesort', o);
    },
    /*
     * @param {Object} store
     * @param {Object} o
     */
    onSortStore: function (store, o) {
      this.fire('sort', o);
    },
    /*
     * @return {Number}
     */
    getCellsViewHeight: function () {
      var me = this,
        s = me.store,
        plusScroll = 0,
        scrollBottomHeight = 0,
        cellsHeight = 0;

      if (me.grouping) {
        plusScroll += me.grouping.plusScroll;
      }

      if (me.expander) {
        plusScroll += me.expander.plusScroll;
      }

      if (!me.scroller.scrollBottomEl || me.scroller.scrollBottomEl.hasCls(HIDDEN_CLS)) {
      }
      else {
        scrollBottomHeight = me.scroller.cornerSize;
      }

      if(me.rowheight){
        cellsHeight = me.rowheight.totalHeight;
      }
      else{
        cellsHeight = me.cellHeight * s.dataView.length;
      }

      return cellsHeight + scrollBottomHeight + plusScroll;
    },
    /*
     * @param {Object} e
     */
    onDocMouseUp: function (e) {
      this.fire('docmouseup');
    },
    /*
     * @param {Object} e
     */
    onDocClick: function (e) {
      this.fire('docclick', e);
    },
    /*
     * @param {Object} e
     */
    onDocMove: function (e) {
      this.fire('docmove', e);
    },
    /*
     * @return {Number}
     */
    getCenterViewWidth: function () {
      //Realization could be reason of bug
      var me = this,
        elWidth = me.centerEl.width();

      if (elWidth === 0) {
        var columnsWidth = 0,
          columns = me.columns,
          i = 0,
          iL = columns.length;

        for (; i < iL; i++) {
          var column = columns[i];
          if (!column.hidden) {
            columnsWidth += column.width;
          }
        }

        return columnsWidth;
      }

      return elWidth;
    },
    /*
     * @return {Number}
     */
    getCenterFullWidth: function () {
      var me = this,
        centerColumnsWidths = 0,
        columns = me.columns,
        i = 0,
        iL = columns.length;

      for (; i < iL; i++) {
        var column = columns[i];
        if (!column.hidden) {
          centerColumnsWidths += column.width;
        }
      }

      return centerColumnsWidths;
    },
    /*
     * @return {Number}
     */
    getLeftFullWidth: function () {
      var me = this,
        width = 0,
        columns = me.leftColumns,
        i = 0,
        iL = columns.length;

      for (; i < iL; i++) {
        var column = columns[i];
        if (!column.hidden) {
          width += column.width;
        }
      }

      return width;
    },
    /*
     * @return {Number}
     */
    getRightFullWidth: function () {
      var me = this,
        width = 0,
        columns = me.rightColumns,
        i = 0,
        iL = columns.length;

      for (; i < iL; i++) {
        var column = columns[i];
        if (!column.hidden) {
          width += column.width;
        }
      }

      return width;
    },
    /*
     * @param {String} side
     * @return {Array}
     */
    getColumns: function (side) {
      var me = this,
        columns;

      switch (side) {
        case 'left':
          columns = me.leftColumns;
          break;
        case 'center':
          columns = me.columns;
          break;
        case 'right':
          columns = me.rightColumns;
          break;
      }

      return columns;
    },
    /*
     * @param {Array} columns
     * @param {String} side
     */
    setColumns: function (columns, side) {
      var me = this;

      switch (side) {
        case 'left':
          me.leftColumns = columns;
          break;
        case 'center':
        case undefined:
          me.columns = columns;
          break;
        case 'right':
          me.rightColumns = columns;
          break;
      }
    },
    /*
     * @param {String} side
     * @return {Fancy.grid.Body}
     */
    getBody: function (side) {
      var me = this,
        body;

      switch (side) {
        case 'left':
          body = me.leftBody;
          break;
        case 'center':
          body = me.body;
          break;
        case 'right':
          body = me.rightBody;
          break;
      }

      return body;
    },
    /*
     * @param {String} side
     * @return {Fancy.grid.Header}
     */
    getHeader: function (side) {
      var me = this,
        header;

      switch (side) {
        case 'left':
          header = me.leftHeader;
          break;
        case 'center':
          header = me.header;
          break;
        case 'right':
          header = me.rightHeader;
          break;
      }

      return header;
    },
    /*
     * @param {String|Number} index
     * @param {String} [side]
     * @return {Fancy.Element}
     */
    getHeaderCell: function (index, side) {
      var me = this,
        cell,
        header;

      if (F.isString(index)) {
        var o = me.getColumnOrderByKey(index);

        header = me.getHeader(o.side);
        cell = header.getCell(o.order);
      }
      else {
        side = side || 'center';
        header = me.getHeader(side);
        cell = header.getCell(index);
      }

      return cell;
    },
    /*
     * @param {Number} rowIndex
     * @return {Array}
     */
    getDomRow: function (rowIndex) {
      var me = this,
        leftBody = me.leftBody,
        body = me.body,
        rightBody = me.rightBody,
        leftColumns = me.leftColumns,
        columns = me.columns,
        rightColumns = me.rightColumns,
        i = 0,
        iL = leftColumns.length,
        cells = [];

      for (; i < iL; i++) {
        cells.push(leftBody.getDomCell(rowIndex, i));
      }

      i = 0;
      iL = columns.length;
      for (; i < iL; i++) {
        cells.push(body.getDomCell(rowIndex, i));
      }

      i = 0;
      iL = rightColumns.length;
      for (; i < iL; i++) {
        cells.push(rightBody.getDomCell(rowIndex, i));
      }

      return cells;
    },
    /*
     *
     */
    initTextSelection: function () {
      var me = this,
        body = me.body,
        leftBody = me.leftBody,
        rightBody = me.rightBody;

      if (me.textSelection === false) {
        me.addCls(GRID_UNSELECTABLE_CLS);

        var fn = function (e) {
          var targetEl = F.get(e.target);
          if (targetEl.hasCls('fancy-field-text-input') || targetEl.hasCls('fancy-textarea-text-input')) {
            return;
          }

          e.preventDefault();
        };

        body.el.on('mousedown', fn);
        leftBody.el.on('mousedown', fn);
        rightBody.el.on('mousedown', fn);
      }
    },
    /*
     * @param {String} type
     * @param {*} value
     */
    setTrackOver: function (type, value) {
      var me = this;

      switch (type) {
        case 'cell':
          me.cellTrackOver = value;
          break;
        case 'column':
          me.columnTrackOver = value;
          break;
        case 'row':
          me.trackOver = value;
          break;
      }
    },
    /*
     * @param {String} type
     */
    setSelModel: function (type) {
      var me = this,
        selection = me.selection;

      selection.cell = false;
      selection.cells = false;
      selection.row = false;
      selection.rows = false;
      selection.column = false;
      selection.columns = false;
      selection[type] = true;

      selection.selModel = type;

      if (type === 'rows') {
        me.multiSelect = true;
      }
      else {
        me.multiSelect = false;
      }

      selection.clearSelection();
    },
    /*
     * @param {Boolean} [returnModel]
     * @return {Array}
     */
    getSelection: function (returnModel) {
      var me = this;

      return me.selection.getSelection(returnModel);
    },
    /*
     *
     */
    clearSelection: function () {
      var me = this,
        selection = me.selection;

      selection.clearSelection();
    },
    /*
     *
     */
    destroy: function () {
      var me = this,
        s = me.store,
        docEl = F.get(document);

      docEl.un('mouseup', me.onDocMouseUp, me);
      docEl.un('click', me.onDocClick, me);
      docEl.un('mousemove', me.onDocMove, me);

      me.body.destroy();
      me.leftBody.destroy();
      me.rightBody.destroy();

      me.header.destroy();
      me.leftHeader.destroy();
      me.rightHeader.destroy();

      me.scroller.destroy();

      me.el.destroy();

      if (me.panel) {
        me.panel.el.destroy();
      }

      s.destroy();
    },
    clearData: function () {
      var me = this;

      me.setData([]);
      me.update();
      me.scroller.update();
    },
    /*
     *
     */
    showAt: function () {
      var me = this;

      if (me.panel) {
        me.panel.showAt.apply(me.panel, arguments);
      }
    },
    /*
     *
     */
    show: function () {
      var me = this;

      setTimeout(function () {
        if (me.panel) {
          me.panel.show.apply(me.panel, arguments);
        }
        else {
          me.el.show();
        }
      }, 30);
    },
    /*
     *
     */
    hide: function () {
      var me = this;

      if (me.panel) {
        me.panel.hide.apply(me.panel, arguments);
      }
      else {
        me.el.hide();
      }

      if (me.celledit) {
        var editor = me.celledit.activeEditor;

        if (editor) {
          editor.hide();
        }
      }
    },
    /*
     *
     */
    initDateColumn: function () {
      var me = this;

      var prepareColumns = function (columns) {
        var i = 0,
          iL = columns.length;

        for (; i < iL; i++) {
          var column = columns[i];

          if (column.type === 'date') {
            column.format = column.format || {};

            var format = {
              type: 'date'
            };

            F.applyIf(format, me.lang.date);

            F.applyIf(column.format, format);
          }
        }

        return columns;
      };

      me.columns = prepareColumns(me.columns);
      me.leftColumns = prepareColumns(me.leftColumns);
      me.rightColumns = prepareColumns(me.rightColumns);
    },
    /*
     *
     */
    stopEditor: function () {
      var me = this;

      me.edit.stopEditor();
    },
    /*
     * @param {String} id
     * @return {Fancy.Model}
     */
    getById: function (id) {
      var me = this;

      return me.store.getById(id);
    },
    /*
     * @param {Number} rowIndex
     * @param {String} key
     * @return {Fancy.Model}
     */
    get: function (rowIndex, key) {
      var me = this,
        store = me.store;

      if (key !== undefined) {
        return store.get(rowIndex, key);
      }
      else if (rowIndex === undefined) {
        return store.get();
      }

      return store.getItem(rowIndex);
    },
    /*
     * @param {Number} id
     * @return {Number}
     */
    getRowById: function (id) {
      return this.store.getRow(id);
    },
    /*
     * @return {Number}
     */
    getTotal: function () {
      return this.store.getTotal();
    },
    /*
     * @return {Number}
     */
    getViewTotal: function () {
      return this.store.getLength();
    },
    /*
     * @return {Array}
     */
    getDataView: function () {
      return this.store.getDataView();
    },
    /*
     * @return {Array}
     */
    getData: function () {
      return this.store.getData();
    },
    /*
     * @param {Number} rowIndex
     * @param {Boolean} [value]
     * @param {Boolean} [multi]
     */
    selectRow: function (rowIndex, value, multi) {
      this.selection.selectRow(rowIndex, value, multi);
      //this.activated = true;
    },
    /*
     * @param {Number} rowIndex
     * @param {Boolean} [value]
     * @param {Boolean} [multi]
     */
    deSelectRow: function (rowIndex) {
      this.selection.selectRow(rowIndex, false, true);
      //this.activated = true;
    },
    /*
     * @param {Number|String} id
     * @param {Boolean} [value]
     * @param {Boolean} [multi]
     */
    selectById: function (rowIndex, value, multi) {
      this.selection.selectById(rowIndex, value, multi);
    },
    /*
     * @param {String} key
     */
    selectColumn: function (key) {
      var me = this,
        side,
        columnIndex,
        leftColumns = me.leftColumns || [],
        columns = me.columns || [],
        rightColumns = me.rightColumns || [];

      var isInSide = function (columns) {
        var i = 0,
          iL = columns.length;

        for (; i < iL; i++) {
          var column = columns[i];
          if (column.index === key) {
            columnIndex = i;
            return true;
          }
        }

        return false;
      };

      if (isInSide(leftColumns)) {
        side = 'left';
      }
      else if (isInSide(columns)) {
        side = 'center';
      }
      else if (isInSide(rightColumns)) {
        side = 'right';
      }

      if (side) {
        me.selection.selectColumn(columnIndex, side);
      }
    },
    /*
     * @param {String} key
     * @return {Object}
     */
    getColumnByIndex: function (key) {
      var me = this,
        leftColumns = me.leftColumns || [],
        columns = me.columns || [],
        rightColumns = me.rightColumns || [],
        _columns = leftColumns.concat(columns).concat(rightColumns),
        i = 0,
        iL = _columns.length;

      for (; i < iL; i++) {
        var column = _columns[i];
        if (column.index === key) {
          return column;
        }
      }
    },
    /*
     * @param {String} key
     * @return {Object}
     */
    getColumnOrderByKey: function (key) {
      var me = this,
        leftColumns = me.leftColumns || [],
        columns = me.columns || [],
        rightColumns = me.rightColumns || [],
        side = '',
        order;

      F.each(columns, function (column, i) {
        if (column.index === key) {
          side = 'center';
          order = i;
        }
      });

      if (!side) {
        F.each(leftColumns, function (column, i) {
          if (column.index === key) {
            side = 'left';
            order = i;
          }
        });

        if (!side) {
          F.each(rightColumns, function (column, i) {
            if (column.index === key) {
              side = 'right';
              order = i;
            }
          });
        }
      }

      return {
        side: side,
        order: order
      }
    },
    /*
     * @param {Function} [fn]
     */
    load: function (fn) {
      var me = this;

      me.store.loadData(fn);
    },
    /*
     *
     */
    save: function () {
      var me = this;

      me.store.save();
    },
    /*
     *
     */
    onWindowResize: function () {
      var me = this,
        renderTo = me.renderTo,
        el;

      if (me.panel) {
        renderTo = me.panel.renderTo;
      }

      if (me.responsive) {
        el = F.get(renderTo);
      }
      else if (me.panel) {
        el = me.panel.el;
      }
      else {
        el = F.get(renderTo);
      }

      if (el.hasClass(PANEL_CLS) || el.hasClass(GRID_CLS)) {
        el = el.parent();
      }

      var newWidth = el.width();

      if (el.dom === undefined) {
        return;
      }

      if (newWidth === 0) {
        newWidth = el.parent().width();
      }

      if (me.responsive) {
        me.setWidth(newWidth);
      }
      else if (me.fitWidth) {
        //me.setWidthFit();
      }

      if (me.responsiveHeight) {
        var height = parseInt(el.height());

        if (height === 0) {
          height = parseInt(el.parent().height());
        }

        me.setHeight(height);
      }

      me.setBodysHeight();
      me.updateColumnsWidth();

      me.scroller.scrollDelta(0);
      me.scroller.update();
    },
    updateColumnsWidth: function () {
      var me = this;

      var fn = function (columns, header, side) {
        Fancy.each(columns, function (column, i) {
          if (column.hidden) {
            return;
          }

          if (column.flex) {
            var cell = header.getCell(i);

            me.fire('columnresize', {
              cell: cell.dom,
              width: column.width,
              column: column,
              side: side
            });
          }
        });
      };

      fn(me.columns, me.header, 'center');
      fn(me.leftColumns, me.leftHeader, 'left');
      fn(me.rightColumns, me.rightHeader, 'right');
    },
    /*
     * @param {Number} width
     */
    setWidth: function (width) {
      var me = this,
        el = me.el,
        gridBorders = me.gridBorders,
        gridWithoutPanelBorders = me.gridWithoutPanelBorders,
        panelBodyBorders = me.panelBodyBorders,
        body = me.body,
        header = me.header;

      //me.scroller.scroll(0, 0);

      var calcColumnsWidth = function (columns) {
        var i = 0,
          iL = columns.length,
          width = 0;

        for (; i < iL; i++) {
          var column = columns[i];

          if (!column.hidden) {
            width += columns[i].width;
          }
        }

        return width;
      };

      var leftColumnWidth = calcColumnsWidth(me.leftColumns),
        rightColumnWidth = calcColumnsWidth(me.rightColumns),
        newCenterWidth = width - leftColumnWidth - rightColumnWidth - panelBodyBorders[1] - panelBodyBorders[3],
        gridWidth;

      if (me.wrapped) {
        gridWidth = width;
        newCenterWidth = width - leftColumnWidth - rightColumnWidth;

        newCenterWidth -= gridBorders[1] + gridBorders[3];

        me.css({
          width: gridWidth
        });
      }
      else if (me.panel) {
        newCenterWidth = width - leftColumnWidth - rightColumnWidth - panelBodyBorders[1] - panelBodyBorders[3];
        me.panel.el.width(width);

        newCenterWidth -= gridBorders[1] + gridBorders[3];

        gridWidth = width - panelBodyBorders[1] - panelBodyBorders[3];

        me.css({
          width: gridWidth
        });
      }
      else {
        newCenterWidth = width - leftColumnWidth - rightColumnWidth - gridWithoutPanelBorders[1] - gridWithoutPanelBorders[3];

        el.css('width', width);
      }

      if (newCenterWidth < 100) {
        newCenterWidth = 100;
      }

      el.select('.' + GRID_CENTER_CLS).css('width', newCenterWidth);

      header.css('width', newCenterWidth);
      body.css('width', newCenterWidth);

      if (me.hasFlexColumns) {
        me.reCalcColumnsWidth();
        me.columnresizer.updateColumnsWidth();
      }

      me.scroller.setScrollBars();
    },
    /*
     * @return {Number}
     */
    getWidth: function () {
      var me = this,
        value;

      if (me.panel) {
        value = parseInt(me.panel.css('width'));
      }
      else {
        value = parseInt(me.css('width'));
      }

      return value;
    },
    /*
     * @return {Number}
     */
    getHeight: function () {
      var me = this,
        value;

      if (me.panel) {
        value = parseInt(me.panel.css('height'));
      }
      else {
        value = parseInt(me.css('height'));
      }

      return value;
    },
    /*
     * @param {Number} value
     * @param {Number} changePanelHeight
     */
    setHeight: function (value, changePanelHeight) {
      var me = this,
        gridBorders = me.gridBorders,
        panelBodyBorders = me.panelBodyBorders;

      if (me.panel && changePanelHeight !== false) {
        me.panel.setHeight(value);
      }

      if (me.title) {
        value -= me.titleHeight;
      }

      if (me.subTitle) {
        value -= me.subTitleHeight;
      }

      if (me.footer) {
        value -= me.barHeight;
      }

      if (me.bbar) {
        value -= me.bbarHeight || me.barHeight;
      }

      if (me.tbar) {
        value -= me.tbarHeight || me.barHeight;
      }

      if (me.subTBar) {
        value -= me.subTBarHeight || me.barHeight;
      }

      if (me.buttons) {
        value -= me.buttonsHeight || me.barHeight;
      }

      var bodyHeight = value;

      if (me.header) {
        bodyHeight -= me.cellHeaderHeight;
        if (me.groupheader) {
          bodyHeight -= me.cellHeaderHeight;
        }
      }

      if (me.panel) {
        bodyHeight -= panelBodyBorders[0] + panelBodyBorders[2];
      }

      bodyHeight -= gridBorders[0] + gridBorders[2];

      if (me.body) {
        me.body.css('height', bodyHeight);
      }

      if (me.leftBody) {
        me.leftBody.css('height', bodyHeight);
      }

      if (me.rightBody) {
        me.rightBody.css('height', bodyHeight);
      }

      me.el.css('height', value);
      me.height = value;

      me.scroller.update();
    },
    /*
     * @param {String} key
     * @param {*} value
     * @param {Boolean} complex
     * @return {Array}
     */
    find: function (key, value, complex) {
      return this.store.find(key, value, complex);
    },
    /*
     * @param {String} key
     * @param {*} value
     * @return {Array}
     */
    findItem: function (key, value) {
      return this.store.findItem(key, value);
    },
    /*
     * @param {Function} fn
     * @param {Object} scope
     */
    each: function (fn, scope) {
      this.store.each(fn, scope);
    },
    /*
     *
     */
    onActivate: function () {
      var me = this,
        doc = F.get(document);

      if (activeGrid && activeGrid.id !== me.id) {
        activeGrid.fire('deactivate');
      }

      setTimeout(function () {
        doc.on('click', me.onDeactivateClick, me);
      }, 100);

      activeGrid = me;
    },
    /*
     *
     */
    onDeActivate: function () {
      var me = this,
        doc = F.get(document);

      me.activated = false;
      doc.un('click', me.onDeactivateClick, me);
    },
    /*
     * @param {Object} e
     */
    onDeactivateClick: function (e) {
      var me = this,
        i = 0,
        iL = 20,
        parent = F.get(e.target);

      for (; i < iL; i++) {
        if (!parent.dom) {
          return;
        }

        if (!parent.dom.tagName || parent.dom.tagName.toLocaleLowerCase() === 'body') {
          me.fire('deactivate');
          return;
        }

        if (parent.hasCls === undefined) {
          me.fire('deactivate');
          return;
        }

        if (parent.hasCls(me.widgetCls)) {
          return;
        }

        parent = parent.parent();
      }
    },
    /*
     * @param {Array} keys
     * @param {Array} values
     */
    search: function (keys, values) {
      var me = this;

      me.searching.search(keys, values);
    },
    /*
     *
     */
    stopSelection: function () {
      var me = this;

      if (me.selection) {
        me.selection.stopSelection();
      }
    },
    /*
     * @param {Boolean} value
     */
    enableSelection: function (value) {
      var me = this;

      if (me.selection) {
        me.selection.enableSelection(value);
      }
    },
    /*
     * @param {String|Number} side
     * @param {String|Number} [index]
     */
    hideColumn: function (side, index) {
      if (index === undefined) {
        index = side;
        side = 'center';
      }

      var me = this,
        body = me.getBody(side),
        header = me.getHeader(side),
        columns = me.getColumns(side),
        orderIndex,
        i = 0,
        iL = columns.length,
        column,
        centerEl = me.centerEl,
        leftEl = me.leftEl,
        leftHeader = me.leftHeader,
        rightEl = me.rightEl,
        rightHeader = me.rightHeader;

      if (F.isNumber(index)) {
        column = columns[index];

        if (column.hidden) {
          return;
        }

        orderIndex = index;
        column.hidden = true;
      }
      else {
        for (; i < iL; i++) {
          column = columns[i];

          if (column.index === index) {
            if (column.hidden) {
              return;
            }

            orderIndex = i;
            column.hidden = true;
            break;
          }
        }
      }

      header.hideCell(orderIndex);
      body.hideColumn(orderIndex);

      if (me.rowedit) {
        me.rowedit.hideField(orderIndex, side);
      }

      switch (side) {
        case 'left':
          leftEl.animate({width: parseInt(leftEl.css('width')) - column.width}, ANIMATE_DURATION);
          leftHeader.el.animate({width: parseInt(leftHeader.css('width')) - column.width}, ANIMATE_DURATION);
          centerEl.animate({left: parseInt(centerEl.css('left')) - column.width}, ANIMATE_DURATION);
          centerEl.animate({width: parseInt(centerEl.css('width')) + column.width}, ANIMATE_DURATION);
          me.body.el.animate({width: parseInt(me.body.css('width')) + column.width}, ANIMATE_DURATION);
          me.header.el.animate({width: parseInt(me.header.css('width')) + column.width}, ANIMATE_DURATION);
          break;
        case 'right':
          rightEl.animate({width: parseInt(rightEl.css('width')) - column.width}, ANIMATE_DURATION);
          rightHeader.el.animate({width: parseInt(rightHeader.css('width')) - column.width}, ANIMATE_DURATION);
          centerEl.animate({width: parseInt(centerEl.css('width')) + column.width}, ANIMATE_DURATION);
          me.body.el.animate({width: parseInt(me.body.css('width')) + column.width}, ANIMATE_DURATION);
          me.header.el.animate({width: parseInt(me.header.css('width')) + column.width}, ANIMATE_DURATION);
          break;
      }

      if (me.grouping) {
        me.grouping.updateGroupRows();
      }

      me.onWindowResize();

      me.fire('columnhide', {
        column: column,
        side: side,
        orderIndex: orderIndex
      });
    },
    /*
     * @param {String|Number} side
     * @param {String|Number} [index]
     */
    showColumn: function (side, index) {
      if (index === undefined) {
        index = side;
        side = 'center';
      }

      var me = this,
        body = me.getBody(side),
        header = me.getHeader(side),
        columns = me.getColumns(side),
        orderIndex,
        i = 0,
        iL = columns.length,
        column,
        centerEl = me.centerEl,
        leftEl = me.leftEl,
        leftHeader = me.leftHeader,
        rightEl = me.rightEl,
        rightHeader = me.rightHeader;

      if (F.isNumber(index)) {
        column = columns[index];
        if (!column.hidden) {
          return;
        }

        orderIndex = index;
        column.hidden = false;
      }
      else {
        for (; i < iL; i++) {
          column = columns[i];

          if (column.index === index) {
            if (!column.hidden) {
              return;
            }
            orderIndex = i;
            column.hidden = false;
            break;
          }
        }
      }

      header.showCell(orderIndex);
      body.showColumn(orderIndex);

      if (me.rowedit) {
        me.rowedit.showField(orderIndex, side);
      }

      switch (side) {
        case 'left':
          leftEl.animate({width: parseInt(leftEl.css('width')) + column.width});
          leftHeader.el.animate({width: parseInt(leftHeader.css('width')) + column.width});
          centerEl.animate({left: parseInt(centerEl.css('left')) + column.width});
          centerEl.animate({width: parseInt(centerEl.css('width')) - column.width});
          me.body.el.animate({width: parseInt(me.body.css('width')) - column.width});
          me.header.el.animate({width: parseInt(me.header.css('width')) - column.width});
          break;
        case 'right':
          rightEl.animate({width: parseInt(rightEl.css('width')) + column.width});
          rightHeader.el.animate({width: parseInt(rightHeader.css('width')) + column.width});
          centerEl.animate({width: parseInt(centerEl.css('width')) - column.width});
          me.body.el.animate({width: parseInt(me.body.css('width')) - column.width});
          me.header.el.animate({width: parseInt(me.header.css('width')) - column.width});
          break;
      }

      if (me.grouping) {
        me.grouping.updateGroupRows();
      }

      me.onWindowResize();
      me.fire('columnshow', {
        column: column,
        side: side,
        orderIndex: orderIndex
      });
    },
    /*
     * @param {Number} indexOrder
     * @param {String} side
     * @return {Object}
     */
    removeColumn: function (indexOrder, side) {
      var me = this,
        leftEl = me.leftEl,
        leftHeader = me.leftHeader,
        leftBody = me.leftBody,
        centerEl = me.centerEl,
        body = me.body,
        header = me.header,
        rightEl = me.rightEl,
        rightBody = me.rightBody,
        rightHeader = me.rightHeader,
        column;

      if (side === undefined) {
        side = 'center';
      }

      if (F.isString(indexOrder)) {
        var columns = me.getColumns(side);

        F.each(columns, function (column, i) {
          if (column.index === indexOrder) {
            indexOrder = i;
            return true;
          }
        });

        if (F.isString(indexOrder) && side === 'center') {
          columns = me.getColumns('left');

          F.each(columns, function (column, i) {
            if (column.index === indexOrder) {
              indexOrder = i;
              side = 'left';
              return true;
            }
          });

          if (F.isString(indexOrder)) {
            columns = me.getColumns('right');

            F.each(columns, function (column, i) {
              if (column.index === indexOrder) {
                indexOrder = i;
                side = 'right';
                return true;
              }
            });

            if (F.isString(indexOrder)) {
              throw new Error('FancyGrid Error 7: Column was not found for method removeColumn');
            }
          }
        }
      }

      switch (side) {
        case 'left':
          column = me.leftColumns[indexOrder];
          me.leftColumns.splice(indexOrder, 1);
          leftHeader.removeCell(indexOrder);
          leftHeader.reSetIndexes();
          leftBody.removeColumn(indexOrder);
          leftEl.css('width', parseInt(leftEl.css('width')) - column.width);
          centerEl.css('left', parseInt(centerEl.css('left')) - column.width);
          centerEl.css('width', parseInt(centerEl.css('width')) + column.width);
          body.css('width', parseInt(body.css('width')) + column.width);
          header.css('width', parseInt(header.css('width')) + column.width);
          break;
        case 'center':
          column = me.columns[indexOrder];
          me.columns.splice(indexOrder, 1);
          header.removeCell(indexOrder);
          header.reSetIndexes();
          body.removeColumn(indexOrder);
          break;
        case 'right':
          column = me.rightColumns[indexOrder];
          me.rightColumns.splice(indexOrder, 1);
          rightHeader.removeCell(indexOrder);
          rightHeader.reSetIndexes();
          rightBody.removeColumn(indexOrder);
          rightEl.css('right', parseInt(rightEl.css('right')) - column.width);
          centerEl.css('width', parseInt(centerEl.css('width')) + column.width);
          header.css('width', parseInt(header.css('width')) + column.width);
          body.css('width', parseInt(body.css('width')) + column.width);
          break;
      }

      if (column.grouping) {
        delete column.grouping;
      }

      if (me.summary) {
        me.summary.removeColumn(indexOrder, side);
      }

      return column;
    },
    /*
     * @param {Object} column
     * @param {Number} index
     * @param {String} side
     * @param {String} fromSide
     */
    insertColumn: function (column, index, side, fromSide) {
      var me = this,
        leftEl = me.leftEl,
        leftBody = me.leftBody,
        leftHeader = me.leftHeader,
        centerEl = me.centerEl,
        body = me.body,
        header = me.header,
        rightEl = me.rightEl,
        rightBody = me.rightBody,
        rightHeader = me.rightHeader;

      side = side || 'center';

      switch (side) {
        case 'center':
          delete column.rightLocked;
          delete column.locked;
          me.columns.splice(index, 0, column);
          header.insertCell(index, column);
          header.reSetIndexes();
          body.insertColumn(index, column);
          break;
        case 'left':
          column.locked = true;
          var extraLeft = 0;
          var extraHeaderWidth = 0;
          if (me.leftColumns.length === 0) {
            if (!F.nojQuery) {
              extraLeft = 1;
            }
            me.leftEl.removeCls(GRID_LEFT_EMPTY_CLS);
          }

          if (!F.nojQuery) {
            extraHeaderWidth = 0;
          }

          me.leftColumns.splice(index, 0, column);
          leftHeader.insertCell(index, column);
          leftHeader.reSetIndexes();
          leftHeader.css('width', parseInt(leftHeader.css('width')) + extraHeaderWidth);
          leftBody.insertColumn(index, column);
          leftEl.css('width', parseInt(leftEl.css('width')) + column.width);
          //leftEl.css('width', parseInt(leftHeader.css('width')));
          centerEl.css('width', parseInt(centerEl.css('width')) - column.width);
          centerEl.css('left', parseInt(centerEl.css('left')) + column.width + extraLeft);
          body.el.css('width', parseInt(body.el.css('width')) - column.width);
          header.el.css('width', parseInt(header.el.css('width')) - column.width);
          break;
        case 'right':
          column.rightLocked = true;

          var extraLeft = 0,
            extraWidth = 0;

          if (me.rightColumns.length === 0) {
            if (!F.nojQuery) {
              extraLeft = 1;
              extraWidth = 2;
            }
            me.rightEl.removeCls(GRID_RIGHT_EMPTY_CLS);
          }

          me.rightColumns.splice(index, 0, column);
          rightHeader.insertCell(index, column);
          rightHeader.reSetIndexes();
          rightBody.insertColumn(index, column);
          rightEl.css('width', parseInt(rightEl.css('width')) + column.width);
          centerEl.css('width', parseInt(centerEl.css('width')) - column.width - extraLeft);
          body.css('width', parseInt(body.css('width')) - column.width - extraWidth);
          header.css('width', parseInt(header.css('width')) - column.width - extraWidth);
          break;
      }

      if (column.menu) {
        column.menu = true;
      }

      if (me.grouping) {
        switch (side) {
          case 'left':
            if (me.leftColumns.length === 1) {
              me.grouping.softRenderGroupedRows('left');
            }
            break;
          case 'right':
            if (me.rightColumns.length === 1) {
              me.grouping.softRenderGroupedRows('right');
            }
            break;
        }

        me.grouping.updateGroupRows();
        me.grouping.setCellsPosition(index, side);
      }

      if (column.rowEditor) {
        if (side === 'left') {
          index--;
        }

        me.rowedit.moveEditor(column, index, side, fromSide);
      }

      if (me.summary) {
        me.summary.insertColumn(index, side);
      }

      me.header.destroyMenus();
      me.leftHeader.destroyMenus();
      me.rightHeader.destroyMenus();

      if (me.sorter) {
        me.sorter.updateSortedHeader();
      }
    },
    /*
     * @param {Object} column
     * @param {String} side
     * @param {Number} orderIndex
     */
    addColumn: function (column, side, orderIndex) {
      var me = this;
      side = side || 'center';

      if (!column.type) {
        column.type = 'string';
      }

      if (!column.width) {
        column.width = me.defaultColumnWidth;
      }

      if (orderIndex === undefined) {
        var columns = me.getColumns(side);

        orderIndex = columns.length;
      }

      me.insertColumn(column, orderIndex, side);

      me.scroller.update();
    },
    /*
     * @param {Number} orderIndex
     * @param {String} legend
     */
    disableLegend: function (orderIndex, legend) {
      var me = this;

      me.columns[orderIndex].disabled = me.columns[orderIndex].disabled || {};
      me.columns[orderIndex].disabled[legend] = true;

      //me.body.updateRows(undefined, orderIndex);
      me.update();
    },
    /*
     * @param {Number} orderIndex
     * @param {String} legend
     */
    enableLegend: function (orderIndex, legend) {
      var me = this;

      me.columns[orderIndex].disabled = me.columns[orderIndex].disabled || {};
      delete me.columns[orderIndex].disabled[legend];

      //me.body.updateRows(undefined, orderIndex);
      me.update();
    },
    /*
     *
     */
    fitHeight: function () {
      var me = this,
        s = me.store,
        panelBodyBorders = me.panelBodyBorders,
        gridBorders = me.gridBorders,
        height = s.getLength() * me.cellHeight,
        headerRows = 1,
        columns = me.columns.concat(me.leftColumns || []).concat(me.rightColumns || []);

      Fancy.each(columns, function (column) {
        if (column.grouping) {
          if (headerRows < 2) {
            headerRows = 2;
          }

          if (column.filter && column.filter.header) {
            if (headerRows < 3) {
              headerRows = 3;
            }
          }
        }

        if (column.filter && column.filter.header) {
          if (headerRows < 2) {
            headerRows = 2;
          }
        }
      });

      if (me.getCenterFullWidth() > me.getCenterViewWidth() && !me.nativeScroller && !Fancy.isIE) {
        height += me.bottomScrollHeight;
      }

      if (me.title) {
        height += me.titleHeight;
      }

      if (me.tbar) {
        height += me.tbarHeight || me.barHeight;
      }

      if (me.summary) {
        height += me.cellHeight;
      }

      if (me.bbar) {
        height += me.bbarHeight || me.barHeight;
      }

      if (me.buttons) {
        height += me.buttonsHeight || me.barHeight;
      }

      if (me.subTBar) {
        height += me.subTBarHeight || me.barHeight;
      }

      if (me.footer) {
        height += me.barHeight;
      }

      if (me.header !== false) {
        height += me.cellHeaderHeight * headerRows;
      }

      if (me.grouping) {
        height += me.grouping.groups.length * me.groupRowHeight;
      }

      if (me.panel) {
        height += panelBodyBorders[0] + panelBodyBorders[2] + gridBorders[0] + gridBorders[2];
      }
      else {
        height += gridBorders[0] + gridBorders[2];
      }

      me.setHeight(height);
    },
    /*
     * @param {String} index
     * @param {Mixed} value
     * @param {String} sign
     * @param {Boolean} [updateHeaderFilter]
     */
    addFilter: function (index, value, sign, updateHeaderFilter) {
      var me = this,
        filter = me.filter.filters[index],
        update = me.waitingForFilters === false;

      if(F.isFunction(value)){
        sign = 'fn';
      }

      sign = sign || '';

      if (filter === undefined) {
        filter = {};
      }

      if (F.isDate(value)) {
        var format = this.getColumnByIndex(index).format;

        filter['type'] = 'date';
        filter['format'] = format;
        value = Number(value);
      }

      filter[sign] = value;

      me.filter.filters[index] = filter;

      if(update){
        if(me.WAIT_FOR_APPLYING_ALL_FILTERS){
          me.filter.updateStoreFilters(false);
        }
        else {
          me.filter.updateStoreFilters();
        }
      }

      if (updateHeaderFilter !== false) {
        me.filter.addValuesInColumnFields(index, value, sign);
      }
    },
    /*
     * @param {String|Boolean} [index]
     * @param {String} [sign]
     * @param {Boolean} [updateHeaderField]
     */
    clearFilter: function (index, sign, updateHeaderField) {
      var me = this,
        s = me.store,
        update = me.waitingForFilters === false;

      if (index === undefined || index === null) {
        me.filter.filters = {};
        s.filters = {};
      }
      else if (sign === undefined || sign === null) {
        if (s.filters && s.filters[index]) {
          me.filter.filters[index] = {};
          s.filters[index] = {};
        }
      }
      else {
        if (me.filter && me.filter.filters && me.filter.filters[index] && me.filter.filters[index][sign] !== undefined) {
          delete me.filter.filters[index][sign];
          delete s.filters[index][sign];
        }
      }

      if(me.searching && index === undefined && sign === undefined){
        //me.searching.clear();
        me.searching.clearBarField();
        me.search('');

        if(me.expander){
          me.expander.reSet();
        }
      }

      if(update){
        s.changeDataView();
        me.update();
      }

      if (me.filter && updateHeaderField !== false) {
        me.filter.clearColumnsFields(index, sign);
      }

      if(update) {
        me.fire('filter', s.filters);

        me.setSidesHeight();
      }
    },
    /*
     *
     */
    updateFilters: function(){
      var me = this;

      delete me.waitingForFilters;
      me.filter.updateStoreFilters();
    },
    /*
     *
     */
    updateFilter: function(){
      this.updateFilters();
    },
    /*
     * @param {String} text
     */
    showLoadMask: function (text) {
      this.loadmask.show(text);
    },
    /*
     *
     */
    hideLoadMask: function () {
      this.loadmask.hide();
    },
    /*
     *
     */
    prevPage: function () {
      this.paging.prevPage();
    },
    /*
     *
     */
    nextPage: function () {
      this.paging.nextPage();
    },
    /*
     * @param {Number} value
     */
    setPage: function (value) {
      value--;
      if (value < 0) {
        value = 0;
      }

      this.paging.setPage(value);
    },
    /*
     *
     */
    firstPage: function () {
      this.paging.firstPage();
    },
    /*
     *
     */
    lastPage: function () {
      this.paging.lastPage();
    },
    /*
     * @param {Number} value
     */
    setPageSize: function (value) {
      this.paging.setPageSize(value);
    },
    /*
     * @return {Number}
     */
    getPage: function () {
      return this.store.showPage + 1;
    },
    /*
     * @return {Number}
     */
    getPages: function () {
      return this.store.pages;
    },
    /*
     * @return {Number}
     */
    getPageSize: function () {
      return this.store.pageSize;
    },
    /*
     *
     */
    refresh: function () {
      this.paging.refresh();
    },
    /*
     * @param {Number} x
     * @param {Number} y
     * @param {Boolean} [animate]
     */
    scroll: function (x, y, animate) {
      var me = this,
        scroller = me.scroller;

      if (y !== undefined && y > 0) {
        y = -y;
      }

      var scrollHeight = scroller.getScrollHeight();

      if (x > scrollHeight) {
        x = scrollHeight;
        if(me.nativeScroller && scroller.isRightScrollable()){
          x += 17;
        }
      }

      var scrollWidth = scroller.getScrollWidth();

      if (Math.abs(y) > scrollWidth) {
        y = -scrollWidth;
      }

      if(scroller.isBottomScrollable() === false){
        y = 0;
      }
      else{
       if(me.nativeScroller && scroller.isRightScrollable()){
         y -= 17;
       }
      }

      scroller.scroll(x, y, animate);

      scroller.scrollBottomKnob();
      scroller.scrollRightKnob();
    },
    /*
     * @return {Array}
     */
    getDataFiltered: function () {
      return this.store.filteredData;
    },
    /*
     *
     */
    reCalcColumnsWidth: function () {
      var me = this;

      if (!me.hasFlexColumns) {
        return;
      }

      var scroller = me.scroller,
        viewWidth = me.getCenterViewWidth(),
        columns = me.columns,
        flex = 0,
        i = 0,
        iL = columns.length,
        widthForFlex = viewWidth,
        flexPerCent;

      if (me.flexScrollSensitive !== false && scroller.isRightScrollable() && !scroller.nativeScroller) {
        widthForFlex -= me.bottomScrollHeight;
      }

      for (; i < iL; i++) {
        var column = columns[i];

        if (column.hidden) {
          continue
        }

        if (column.flex) {
          flex += column.flex;
        }
        else {
          widthForFlex -= column.width;
        }
      }

      if (flex === 0) {
        return;
      }

      flexPerCent = widthForFlex / flex;

      i = 0;
      for (; i < iL; i++) {
        var column = columns[i];

        if (column.hidden) {
          continue;
        }

        if (column.flex) {
          column.width = Math.floor(column.flex * flexPerCent);

          if (column.minWidth && column.width < column.minWidth) {
            column.width = column.minWidth;
          }

          if (column.minWidth && column.width < column.minWidth) {
            column.width = column.minWidth;
          }
          else if (column.width < me.minColumnWidth) {
            column.width = me.minColumnWidth;
          }
        }
      }
    },
    /*
     * @return {Array}
     */
    getDisplayedData: function (all) {
      var me = this,
        viewTotal = me.getViewTotal(),
        data = [],
        i = 0,
        leftColumns = me.leftColumns,
        columns = me.columns,
        rightColumns = me.rightColumns;

      if(all){
        viewTotal = me.getTotal();
      }

      var fn = function (column) {
        if (column.index === undefined || column.index === '$selected' || column.hidden) {
          return;
        }

        switch (column.type) {
          case 'order':
            rowData.push(i + 1);
            break;
          default:
            if (column.render) {
              var data = me.get(i),
                value = me.get(i, column.index);

              rowData.push(column.render({
                value: value,
                data: data
              }).value);
            }
            else {
              rowData.push(me.get(i, column.index));
            }
        }
      };

      for (; i < viewTotal; i++) {
        var rowData = [];

        F.each(leftColumns, fn);
        F.each(columns, fn);
        F.each(rightColumns, fn);

        data.push(rowData);
      }

      return data;
    },
    /*
     * @return {Array}
     */
    getAllDisplayedData: function () {
      var me = this,
        viewTotal = me.getViewTotal(),
        data = [],
        i = 0,
        leftColumns = me.leftColumns,
        columns = me.columns,
        rightColumns = me.rightColumns;

      var fn = function (column) {
        if (column.index === undefined || column.index === '$selected' || column.hidden) {
          return;
        }

        switch (column.type) {
          case 'order':
            rowData.push(i + 1);
            break;
          default:
            if (column.render) {
              var data = me.get(i),
                value = me.get(i, column.index);

              rowData.push(column.render({
                value: value,
                data: data
              }).value);
            }
            else {
              rowData.push(me.get(i, column.index));
            }
        }
      };

      for (; i < viewTotal; i++) {
        var rowData = [];

        F.each(leftColumns, fn);
        F.each(columns, fn);
        F.each(rightColumns, fn);

        data.push(rowData);
      }

      return data;
    },
    /*
     * @param {Array} data
     */
    setData: function (data) {
      var me = this,
        s = me.store;

      s.setData(data);

      if (s.isTree) {
        s.initTreeData();
      }

      me.setSidesHeight();
    },
    /*
     * @params {Object} [o]
     */
    exportToExcel: function (o) {
      var me = this;

      if (me.exporter) {
        me.exporter.exportToExcel(o);
      }
    },
    /*
     * @params {Object} [o]
     */
    getDataAsCsv: function (o) {
      var me = this;

      if (me.exporter) {
        return me.exporter.getDataAsCsv(o);
      }
    },
    /*
     * @params {Object} o
     */
    getDataAsCSV: function (o) {
      return this.getDataAsCsv(o);
    },
    /*
     * @params {Object} [o]
     */
    exportToCSV: function (o) {
      var me = this;

      if (me.exporter) {
        return me.exporter.exportToCSV(o);
      }
    },
    /*
     * @params {Object} o
     */
    exportToCsv: function (o) {
      return this.exportToCSV(o);
    },
    /*
     *
     */
    disableSelection: function () {
      this.selection.disableSelection()
    },
    /*
     * @param {Object} o
     */
    setParams: function (o) {
      var me = this,
        s = me.store;

      if (s.proxy) {
        s.proxy.params = s.proxy.params || {};

        F.apply(s.proxy.params, o);
      }
    },
    /*
     * @param {String|Object} url
     */
    setUrl: function (url) {
      var me = this,
        s = me.store;

      if (F.isString(url)) {
        if (s.proxy && s.proxy.api) {
          if (s.proxy.type === 'rest') {
            for (var p in s.proxy.api) {
              s.proxy.api[p] = url;
            }
          }
          else {
            s.proxy.api.read = url;
          }
        }
      }
      else {
        if (s.proxy && s.proxy.api) {
          F.apply(s.proxy.api, url);
        }
      }
    },
    /*
     * @param {Object} cell
     * @return {String}
     */
    getSideByCell: function (cell) {
      var me = this,
        side;

      if (me.centerEl.within(cell)) {
        side = 'center';
      }
      else if (me.leftEl.within(cell)) {
        side = 'left';
      }
      else if (me.rightEl.within(cell)) {
        side = 'right';
      }

      return side;
    },
    /*
     * @param {Fancy.Model|id|Object} item
     * @param {Object} o
     *
     * Used for tree grid
     */
    addChild: function (item, o) {
      var me = this,
        s = me.store;

      if (o === undefined) {
        item.$deep = 1;
        if (item.child === undefined) {
          item.child = [];
        }

        me.add(item);
      }
      else {
        if (F.isNumber(item)) {
          item = me.getById(item);
        }

        var fixParent = false;

        if (item.get('leaf') === true) {
          item.set('leaf', false);
          item.set('expanded', true);
          item.set('child', []);

          fixParent = true;
        }

        var $deep = item.get('$deep'),
          child = item.get('child'),
          rowIndex = me.getRowById(item.id) + child.length + 1;

        o.$deep = $deep + 1;
        o.parentId = item.id;

        if (fixParent) {
          var parentId = item.get('parentId');
          if (parentId) {
            var parentItem = me.getById(parentId);

            F.each(parentItem.data.child, function (child) {
              if (child.id === item.id) {
                child.leaf = false;
                child.expanded = true;
                child.child = [o];

                return true;
              }
            });
          }
        }

        child.push(new s.model(o));
        item.set('child', child);

        if (item.get('expanded') === true) {
          me.insert(rowIndex, o);
        }
      }
    },
    /*
     * {Number|String|Object} id
     */
    expand: function (id) {
      var item,
        me = this;

      switch (F.typeOf(id)) {
        case 'number':
        case 'string':
          item = me.getById(id);
          break;
      }

      if (item.get('expanded') === true) {
        return;
      }

      me.tree.expandRow(item);
    },
    /*
     * {Number|String|Object} id
     */
    collapse: function (id) {
      var item,
        me = this;

      switch (F.typeOf(id)) {
        case 'number':
        case 'string':
          item = me.getById(id);
          break;
      }

      if (item.get('expanded') === false) {
        return;
      }

      me.tree.collapseRow(item);
    },
    /*
     *
     */
    collapseAll: function () {
      var me = this,
        items = me.findItem('$deep', 1);

      F.each(items, function (item) {
        me.collapse(item.id);
      });
    },
    /*
     *
     */
    expandAll: function () {
      var me = this,
        items = me.findItem('expanded', false);

      F.each(items, function (item) {
        me.expand(item.id);
      });

      items = me.findItem('expanded', false);

      if (items.length) {
        me.expandAll();
      }
    },
    /*
     * @param {Boolean} copyHeader
     */
    copy: function (copyHeader) {
      var me = this;

      if (me.selection) {
        me.selection.copy(copyHeader);
      }
    },
    /*
     * @param {String} key
     * @param {'ASC'|'DESC'} direction
     */
    sort: function (key, direction) {
      var me = this,
        column = me.getColumnByIndex(key),
        o = me.getColumnOrderByKey(key),
        header,
        cell;

      if (!o.side) {
        return;
      }

      header = me.getHeader(o.side);
      cell = header.getCell(o.order);

      if (!direction) {
        cell.dom.click();
      }
      else {
        direction = direction || 'ASC';
        cell = header.getCell(o.order);

        direction = direction.toLocaleLowerCase();

        switch (direction) {
          case 'asc':
            cell.removeCls(GRID_COLUMN_SORT_DESC_CLS);
            cell.addCls(GRID_COLUMN_SORT_ASC_CLS);
            break;
          case 'desc':
            cell.removeCls(GRID_COLUMN_SORT_ASC_CLS);
            cell.addCls(GRID_COLUMN_SORT_DESC_CLS);
            break;
          case 'drop':
            cell.removeCls(GRID_COLUMN_SORT_ASC_CLS);
            cell.removeCls(GRID_COLUMN_SORT_DESC_CLS);
            break;
          default:
            throw new Error('[FancyGrid Error]: sorting type is not right - ' + direction);
        }

        me.sorter.sort(direction, key, o.side, column, cell);
      }
    },
    /*
     * @param {Number} rowIndex
     */
    flashRow: function (rowIndex) {
      var me = this,
        cells = me.getDomRow(rowIndex);

      F.each(cells, function (cell) {
        cell = F.get(cell);

        cell.addCls('fancy-grid-cell-flash');
      });

      setTimeout(function () {
        F.each(cells, function (cell) {
          cell = F.get(cell);

          cell.addCls('fancy-grid-cell-animation');
        });
      }, 200);

      setTimeout(function () {
        F.each(cells, function (cell) {
          cell = F.get(cell);

          cell.removeCls('fancy-grid-cell-flash');
          cell.removeCls('fancy-grid-cell-animation');
        });
      }, 700);
    },
    /*
     * @param {Number|Object} rowIndex
     * @param {Number} [columnIndex]
     * @param {String} [side]
     * @param {Object} [o]
     */
    flashCell: function (rowIndex, columnIndex, side, o) {
      var me = this,
        side = side ? side : 'center',
        body = me.getBody(side),
        duration = 700,
        cell = Fancy.isObject(rowIndex) ? rowIndex : body.getCell(rowIndex, columnIndex);

      if (o) {
        if (o.duration) {
          duration = o.duration;
        }

        switch (o.type) {
          case 'plusminus':
            if (o.delta > 0) {
              cell.addCls('fancy-grid-cell-flash-plus');
              setTimeout(function () {
                cell.removeCls('fancy-grid-cell-flash-plus');
                cell.removeCls('fancy-grid-cell-animation');
              }, duration);
            }
            else {
              cell.addCls('fancy-grid-cell-flash-minus');
              setTimeout(function () {
                cell.removeCls('fancy-grid-cell-flash-minus');
                cell.removeCls('fancy-grid-cell-animation');
              }, duration);
            }
            break;
        }
      }
      else {
        cell.addCls('fancy-grid-cell-flash');

        setTimeout(function () {
          cell.removeCls('fancy-grid-cell-flash');
          cell.removeCls('fancy-grid-cell-animation');
        }, 700);
      }

      setTimeout(function () {
        cell.addCls('fancy-grid-cell-animation');
      }, 200);
    },
    /*
    * @param {Number} rowIndex
     */
    scrollToRow: function (rowIndex) {
      var me = this,
        cell = me.body.getCell(rowIndex, 0);

      me.scroller.scrollToCell(cell.dom, false, true);
      me.scroller.update();

      me.flashRow(rowIndex);
    },
    /*
     * @return {Object}
     */
    getStateSorters: function () {
      var me = this,
        o = {},
        state = JSON.parse(localStorage.getItem(me.getStateName()));

      if (!state) {
        return;
      }

      if (!state.sorters) {
        return {};
      }

      var sorted = JSON.parse(state.sorters);

      F.each(sorted, function (sorter) {
        o[sorter.key] = sorter;
      });

      return o;
    },
    /*
     *
     */
    getStateName: function () {
      var me = this,
        id = me.id,
        url = location.host + '-' + location.pathname;

      if (me.stateId) {
        return me.stateId;
      }

      return id + url;
    },
    /*
     *
     */
    setWidthFit: function () {
      var me = this,
        panelBodyBorders = me.panelBodyBorders,
        gridWithoutPanelBorders = me.gridWithoutPanelBorders,
        gridBorders = me.gridBorders,
        width = 0,
        hasLocked = false,
        columns = [].concat(me.leftColumns).concat(me.columns).concat(me.rightColumns);

      Fancy.each(columns, function (column) {
        if (!column.hidden) {
          width += column.width;
        }
        if (column.locked) {
          hasLocked = true;
        }
      });

      if (me.panel) {
        width += panelBodyBorders[1] + panelBodyBorders[3] + gridBorders[1] + gridBorders[3];
      }
      else {
        width += gridWithoutPanelBorders[1] + gridWithoutPanelBorders[3] + gridBorders[1] + gridBorders[3];
      }

      if (hasLocked) {
        width--;
      }

      me.setWidth(width);
    },
    /*
     * @param {Number|String} index
     * @param {String} value
     * @param {String} [side]
     */
    setColumnTitle: function (index, value, side) {
      var me = this,
        side = side || 'center',
        header = me.getHeader(side),
        cell,
        column,
        columns = header.getColumns();

      if (Fancy.isString(index)) {
        index = me.getColumnOrderByKey(index).order;
      }

      column = columns[index];
      column.title = value;

      cell = header.getCell(index);
      cell.select('.' + Fancy.GRID_HEADER_CELL_TEXT_CLS).item(0).update(value);

      me.fire('columntitlechange', {
        orderIndex: index,
        index: column.index,
        value: value,
        side: side
      });
    },
    /*
     *
     */
    clearDirty: function () {
      var me = this;

      me.store.clearDirty();
      me.body.clearDirty();
      me.leftBody.clearDirty();
      me.rightBody.clearDirty();
    },
    /*
     * @param {String} bar
     */
    hideBar: function (bar) {
      var me = this,
        barCls,
        barEl;

      switch (bar) {
        case 'tbar':
          barCls = PANEL_TBAR_CLS;
          break;
        case 'subtbar':
          barCls = PANEL_SUB_TBAR_CLS;
          break;
        case 'bbar':
          barCls = PANEL_BBAR_CLS;
          break;
        case 'buttons':
          barCls = PANEL_BUTTONS_CLS;
          break;
        default:
          throw new Error('FancyGrid Error: bar does not exist');
      }

      barEl = me.panel.el.select('.' + barCls);

      if (barEl.css('display') !== 'none') {
        barEl.hide();

        var panelHeight = parseInt(me.panel.el.css('height'));
        me.panel.el.css('height', panelHeight - me.barHeight);
      }
    },
    /*
     * @param {String} bar
     */
    showBar: function (bar) {
      var me = this,
        barCls,
        barEl;

      switch (bar) {
        case 'tbar':
          barCls = PANEL_TBAR_CLS;
          break;
        case 'subtbar':
          barCls = PANEL_SUB_TBAR_CLS;
          break;
        case 'bbar':
          barCls = PANEL_BBAR_CLS;
          break;
        case 'buttons':
          barCls = PANEL_BUTTONS_CLS;
          break;
        default:
          throw new Error('FancyGrid Error: bar does not exist');
      }

      barEl = me.panel.el.select('.' + barCls);

      if (barEl.css('display') == 'none') {
        barEl.show();

        var panelHeight = parseInt(me.panel.el.css('height'));
        me.panel.el.css('height', panelHeight + me.barHeight);
      }
    },
    initResponsiveness: function () {
      var me = this;

      var onWindowResize = function () {
        me.onWindowResize();

        if (me.intWindowResize) {
          clearInterval(me.intWindowResize);
        }

        me.intWindowResize = setTimeout(function () {
          me.onWindowResize();
          delete me.intWindowResize;

          //Bug fix for Mac
          setTimeout(function () {
            me.onWindowResize();
          }, 300);
        }, 30);
      };

      if ('ResizeObserver' in window) {
        setTimeout(function () {
          var myObserver = new ResizeObserver(onWindowResize),
            dom = me.el.parent().dom;

          if(!dom){
            return;
          }

          myObserver.observe(dom);
        }, 100);
        F.$(window).bind('resize', onWindowResize);
      }
      else {
        F.$(window).bind('resize', onWindowResize);
      }
    },
    getNumOfVisibleCells: function () {
      var me = this;

      if(!me.numOfVisibleCells){
        try{
          me.numOfVisibleCells = Math.ceil(me.getBodyHeight() / me.cellHeaderHeight);
        }
        catch(e) {
          me.numOfVisibleCells = 0;
        }
      }

      return me.numOfVisibleCells;
    }
  });

})();