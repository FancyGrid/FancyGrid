/*
 * @class Fancy.grid.plugin.Scroller
 * @extends Fancy.Plugin
 */
(function(){
  //SHORTCUTS
  var F = Fancy;

  /*
   * CONSTANTS
   */
  var RIGHT_SCROLL_CLS = 'fancy-scroll-right';
  var BOTTOM_SCROLL_CLS = 'fancy-scroll-bottom';
  var RIGHT_SCROLL_INNER_CLS = 'fancy-scroll-right-inner';
  var BOTTOM_SCROLL_INNER_CLS = 'fancy-scroll-bottom-inner';
  var NATIVE_SCROLLER_CLS = 'fancy-grid-native-scroller';
  var RIGHT_SCROLL_HOVER_CLS = 'fancy-scroll-right-hover';
  var BOTTOM_SCROLL_HOVER_CLS = 'fancy-scroll-bottom-hover';
  var RIGHT_SCROLL_ACTIVE_CLS = 'fancy-scroll-right-active';
  var BOTTOM_SCROLL_ACTIVE_CLS = 'fancy-scroll-bottom-active';
  var HIDDEN_CLS = F.HIDDEN_CLS;
  var GRID_COLUMN_CLS = F.GRID_COLUMN_CLS;
  var GRID_CENTER_CLS = F.GRID_CENTER_CLS;

  F.define('Fancy.grid.plugin.Scroller', {
    extend: F.Plugin,
    ptype: 'grid.scroller',
    inWidgetName: 'scroller',
    rightKnobDown: false,
    bottomKnobDown: false,
    minRightKnobHeight: 35,
    minBottomKnobWidth: 35,
    cornerSize: 12,
    /*
     * @private
     */
    scrollLeft: 0,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget,
        mouseWheelEventName = F.getMouseWheelEventName();

      w.once('render', function () {
        me.render();
        w.leftBody.el.on(mouseWheelEventName, me.onMouseWheel, me);
        if (w.nativeScroller) {
          w.leftBody.el.on(mouseWheelEventName, me.onMouseWheelLeft, me);
          w.rightBody.el.on(mouseWheelEventName, me.onMouseWheelRight, me);
        }
        w.body.el.on(mouseWheelEventName, me.onMouseWheel, me);
        w.rightBody.el.on(mouseWheelEventName, me.onMouseWheel, me);
        w.once('init', me.onGridInit, me);

        if (w.nativeScroller) {
          w.body.el.on('scroll', me.onNativeScrollBody, me);
          w.leftBody.el.on('scroll', me.onNativeScrollLeftBody, me);
          w.rightBody.el.on('scroll', me.onNativeScrollRightBody, me);
        }
        else {
          if (w.panel) {
            w.panel.on('resize', me.onPanelResize, me);
          }

          w.body.el.on('scroll', me.onScrollBodyBugFix, me);
        }
      });

      me.on('render', me.onRender, me);

      w.store.on('change', me.onChangeStore, me);
    },
    /*
     *
     */
    destroy: function () {
      var me = this,
        w = me.widget,
        leftBody = w.leftBody,
        body = w.body,
        rightBody = w.rightBody,
        docEl = F.get(document),
        mouseWheelEventName = F.getMouseWheelEventName();

      docEl.un('mouseup', me.onMouseUpDoc, me);
      docEl.un('mousemove', me.onMouseMoveDoc, me);

      leftBody.el.un(mouseWheelEventName, me.onMouseWheel, me);
      body.el.un(mouseWheelEventName, me.onMouseWheel, me);
      rightBody.el.un(mouseWheelEventName, me.onMouseWheel, me);

      me.scrollBottomEl.un('mousedown', me.onMouseDownBottomSpin, me);
      me.scrollRightEl.un('mousedown', me.onMouseDownRightSpin, me);

      if (F.isTouch) {
        leftBody.el.un('touchstart', me.onBodyTouchStart, me);
        leftBody.el.un('touchmove', me.onBodyTouchMove, me);

        body.el.un('touchstart', me.onBodyTouchStart, me);
        body.el.un('touchmove', me.onBodyTouchMove, me);

        rightBody.el.un('touchstart', me.onBodyTouchStart, me);
        rightBody.el.un('touchmove', me.onBodyTouchMove, me);

        docEl.un('touchend', me.onMouseUpDoc, me);
      }
    },
    /*
     *
     */
    onGridInit: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        docEl = F.get(document);

      me.setScrollBars();
      docEl.on('mouseup', me.onMouseUpDoc, me);
      docEl.on('mousemove', me.onMouseMoveDoc, me);
      w.on('columnresize', me.onColumnResize, me);

      w.on('lockcolumn', me.onLockColumn, me);
      w.on('rightlockcolumn', me.onRightLockColumn, me);
      w.on('unlockcolumn', me.onUnLockColumn, me);

      s.on('changepages', me.onChangePages, me);

      setTimeout(function () {
        me.update();
      }, 1);
    },
    /*
     *
     */
    render: function () {
      var me = this,
        w = me.widget,
        body = w.body,
        rightScrollEl = F.get(document.createElement('div')),
        bottomScrollEl = F.get(document.createElement('div')),
        right = 1;

      if (w.nativeScroller) {
        w.el.addCls(NATIVE_SCROLLER_CLS);
      }
      else {
        rightScrollEl.addCls(RIGHT_SCROLL_CLS);
        bottomScrollEl.addCls(BOTTOM_SCROLL_CLS, HIDDEN_CLS);

        rightScrollEl.update([
          '<div class="' + RIGHT_SCROLL_INNER_CLS + '"></div>'
        ].join(" "));

        rightScrollEl.select('.' + RIGHT_SCROLL_INNER_CLS).css('margin-top', w.knobOffSet);

        bottomScrollEl.update([
          '<div class="' + BOTTOM_SCROLL_INNER_CLS + '"></div>'
        ].join(" "));

        F.get(body.el.append(rightScrollEl.dom));
        me.scrollRightEl = body.el.select('.fancy-scroll-right');

        F.get(body.el.append(bottomScrollEl.dom));
        me.scrollBottomEl = body.el.select('.fancy-scroll-bottom');
      }

      me.fire('render');
    },
    /*
     *
     */
    onMouseWheel: function (e) {
      var me = this,
        w = me.widget,
        delta = F.getWheelDelta(e.originalEvent || e);

      if (me.isRightScrollable() == false) {
        return;
      }

      if (w.stopProp) {
        e.stopPropagation();
      }

      if (w.nativeScroller) {}
      else {
        if (me.scrollDelta(delta)) {
          e.preventDefault();
        }
        me.scrollRightKnob();
      }
    },
    /*
     *
     */
    onRender: function () {
      var me = this,
        w = me.widget;

      if (w.nativeScroller !== true) {
        me.scrollRightEl.hover(function () {
          if (me.bottomKnobDown !== true) {
            me.scrollRightEl.addCls(RIGHT_SCROLL_HOVER_CLS);
          }
        }, function () {
          me.scrollRightEl.removeCls(RIGHT_SCROLL_HOVER_CLS);
        });

        me.scrollBottomEl.hover(function () {
          if (me.rightKnobDown !== true) {
            me.scrollBottomEl.addCls(BOTTOM_SCROLL_HOVER_CLS);
          }
        }, function () {
          me.scrollBottomEl.removeCls(BOTTOM_SCROLL_HOVER_CLS);
        });

        me.initRightScroll();
        me.initBottomScroll();
      }

      if (F.isTouch) {
        me.initTouch();
      }
    },
    /*
     *
     */
    initTouch: function () {
      var me = this,
        w = me.widget,
        leftBody = w.leftBody,
        body = w.body,
        rightBody = w.rightBody,
        docEl = F.get(document);

      leftBody.el.on('touchstart', me.onBodyTouchStart, me);
      leftBody.el.on('touchmove', me.onBodyTouchMove, me);

      body.el.on('touchstart', me.onBodyTouchStart, me);
      body.el.on('touchmove', me.onBodyTouchMove, me);

      rightBody.el.on('touchstart', me.onBodyTouchStart, me);
      rightBody.el.on('touchmove', me.onBodyTouchMove, me);

      docEl.on('touchend', me.onMouseUpDoc, me);
    },
    /*
     * @param {Object} e
     */
    onBodyTouchStart: function (e) {
      var me = this,
        w = me.widget,
        e = e.originalEvent || e,
        touchXY = e.changedTouches[0];

      if (w.nativeScroller) {
        return;
      }

      me.rightKnobDown = true;
      me.bottomKnobDown = true;

      me.mouseDownXY = {
        x: touchXY.pageX,
        y: touchXY.pageY
      };

      me.rightKnobTop = parseInt(me.rightKnob.css('margin-top'));
      me.scrollRightEl.addCls(RIGHT_SCROLL_ACTIVE_CLS);

      me.bottomKnobLeft = parseInt(me.bottomKnob.css('margin-left'));
      me.scrollBottomEl.addCls(BOTTOM_SCROLL_ACTIVE_CLS);
    },
    /*
     *
     */
    onBodyTouchEnd: function () {
      this.onMouseUpDoc();
    },
    /*
     * @param {Object} e
     */
    onBodyTouchMove: function (e) {
      var me = this,
        e = e.originalEvent,
        touchXY = e.changedTouches[0],
        changed = true;

      if(!me.nativeScroller){
        var scrollLeft = me.scrollLeft,
          scrollTop = me.scrollTop;

        me.onMouseMoveDoc({
          pageX: touchXY.pageX,
          pageY: touchXY.pageY
        });

        changed = scrollLeft !== me.scrollLeft || scrollTop !== me.scrollTop;
      }
      else{
        me.onMouseMoveDoc({
          pageX: touchXY.pageX,
          pageY: touchXY.pageY
        });
      }

      if (me.rightKnobDown === true && changed) {
        e.preventDefault();
      }

      if (me.bottomKnobDown === true && changed) {
        e.preventDefault();
      }
    },
    /*
     *
     */
    initRightScroll: function () {
      var me = this;

      me.rightKnob = me.scrollRightEl.select('.' + RIGHT_SCROLL_INNER_CLS);
      me.scrollRightEl.on('mousedown', me.onMouseDownRightSpin, me);
    },
    /*
     *
     */
    initBottomScroll: function () {
      var me = this;

      me.bottomKnob = me.scrollBottomEl.select('.' + BOTTOM_SCROLL_INNER_CLS);
      me.scrollBottomEl.on('mousedown', me.onMouseDownBottomSpin, me);
    },
    /*
     * @param {Object} e
     */
    onMouseDownRightSpin: function (e) {
      var me = this;

      if (F.isTouch) {
        return;
      }

      e.preventDefault();

      me.rightKnobDown = true;
      me.mouseDownXY = {
        x: e.pageX,
        y: e.pageY
      };

      me.rightKnobTop = parseInt(me.rightKnob.css('margin-top'));
      me.scrollRightEl.addCls(RIGHT_SCROLL_ACTIVE_CLS);
    },
    /*
     * @param {Object} e
     */
    onMouseDownBottomSpin: function (e) {
      var me = this;

      e.preventDefault();

      me.bottomKnobDown = true;
      me.mouseDownXY = {
        x: e.pageX,
        y: e.pageY
      };

      me.bottomKnobLeft = parseInt(me.bottomKnob.css('margin-left'));
      me.scrollBottomEl.addCls(BOTTOM_SCROLL_ACTIVE_CLS);
    },
    /*
     *
     */
    onMouseUpDoc: function () {
      var me = this;

      if (me.rightKnobDown === false && me.bottomKnobDown === false) {
        return;
      }

      me.scrollRightEl.removeCls(RIGHT_SCROLL_ACTIVE_CLS);
      me.scrollBottomEl.removeCls(BOTTOM_SCROLL_ACTIVE_CLS);
      me.rightKnobDown = false;
      me.bottomKnobDown = false;
    },
    /*
     * @param {Object} e
     */
    onMouseMoveDoc: function (e) {
      var me = this,
        w = me.widget,
        topScroll = false,
        bottomScroll = false,
        knobOffSet = w.knobOffSet,
        x = e.pageX,
        y = e.pageY,
        deltaX,
        deltaY,
        marginTop,
        marginLeft;

      if (me.rightKnobDown) {
        if (F.isTouch) {
          deltaY = me.mouseDownXY.y - y;
          marginTop = deltaY + me.rightKnobTop;
        }
        else {
          deltaY = y - me.mouseDownXY.y;
          marginTop = deltaY + me.rightKnobTop;
        }

        if (marginTop < me.knobOffSet) {
          marginTop = me.knobOffSet;
        }

        if (me.bodyViewHeight < marginTop + me.rightKnobHeight) {
          marginTop = me.bodyViewHeight - me.rightKnobHeight;
        }

        if (marginTop < me.rightScrollScale) {
          marginTop = 0;
        }

        me.rightKnob.css('margin-top', (marginTop + knobOffSet) + 'px');
        topScroll = me.rightScrollScale * marginTop;

        me.scroll(topScroll);
      }

      if (me.bottomKnobDown) {
        if (F.isTouch) {
          deltaX = me.mouseDownXY.x - x;
          deltaY = me.mouseDownXY.y - y;
          marginLeft = deltaX + me.bottomKnobLeft;
        }
        else {
          deltaX = x - me.mouseDownXY.x;
          deltaY = y - me.mouseDownXY.y;
          marginLeft = deltaX + me.bottomKnobLeft;
        }

        if (marginLeft < 1) {
          marginLeft = 1;
        }

        if (me.bodyViewWidth - 2 < marginLeft + me.bottomKnobWidth) {
          marginLeft = me.bodyViewWidth - me.bottomKnobWidth - 2;
        }

        if (me.bottomScrollScale < 0 && marginLeft < 0) {
          marginLeft = 0;
          me.bottomScrollScale = 0;
        }

        me.bottomKnob.css('margin-left', marginLeft + 'px');
        bottomScroll = Math.ceil(me.bottomScrollScale * (marginLeft - 1));

        me.scroll(false, bottomScroll);
      }
    },
    /*
     *
     */
    setScrollBars: function () {
      var me = this,
        w = me.widget;

      //me.checkRightScroll();
      setTimeout(function () {
        me.checkRightScroll();
      }, 1);

      if (!me.checkBottomScroll()) {
        if (me.scrollTop) {
          w.scroll(false, 0);
        }
      }

      if (!w.nativeScroller) {
        me.checkCorner();
        me.setRightKnobSize();
        me.setBottomKnobSize();
      }
    },
    /*
     *
     */
    checkRightScroll: function () {
      var me = this,
        w = me.widget,
        body = w.body,
        gridBorders = w.gridBorders,
        bodyViewHeight = w.getBodyHeight(),
        cellsViewHeight = w.getCellsViewHeight() - gridBorders[0] - gridBorders[2];

      if (w.nativeScroller) {
        if (bodyViewHeight >= cellsViewHeight) {
          body.el.css('overflow-y', 'hidden');
        }
        else {
          body.el.css('overflow-y', 'scroll');
        }
      }
      else {
        if (bodyViewHeight >= cellsViewHeight) {
          me.scrollRightEl.addCls(HIDDEN_CLS);
        }
        else {
          me.scrollRightEl.removeCls(HIDDEN_CLS);
        }
      }
    },
    /*
     *
     */
    isRightScrollable: function () {
      var w = this.widget;

      if (w.nativeScroller) {
        return w.body.el.css('overflow-y') === 'scroll';
      }

      return !this.scrollRightEl.hasCls(HIDDEN_CLS);
    },
    /*
     *
     */
    setRightKnobSize: function () {
      var me = this,
        w = me.widget;

      if (w.nativeScroller) {
        return;
      }

      var bodyViewHeight = w.getBodyHeight() - (me.corner ? me.cornerSize : 0) - 2,
        cellsViewHeight = w.getCellsViewHeight() - (me.corner ? me.cornerSize : 0),
        scrollRightPath = cellsViewHeight - bodyViewHeight,
        percents = 100 - scrollRightPath / (bodyViewHeight / 100),
        knobHeight = bodyViewHeight * (percents / 100),
        knobOffSet = w.knobOffSet;

      if (knobHeight < me.minRightKnobHeight) {
        knobHeight = me.minRightKnobHeight;
      }

      if (me.corner === false) {
        bodyViewHeight -= knobOffSet;
      }

      me.rightKnob.stop();
      me.rightKnob.animate({height: knobHeight}, F.ANIMATE_DURATION);
      me.rightKnobHeight = knobHeight;
      me.bodyViewHeight = bodyViewHeight;
      me.rightScrollScale = (cellsViewHeight - bodyViewHeight) / (bodyViewHeight - knobHeight);
    },
    /*
     *
     */
    checkBottomScroll: function () {
      var me = this,
        w = me.widget,
        body = w.body,
        centerViewWidth = w.getCenterViewWidth(),
        centerFullWidth = w.getCenterFullWidth() - 2,
        showBottomScroll;

      if (w.nativeScroller) {
        if (centerViewWidth > centerFullWidth) {
          showBottomScroll = false;
          body.el.css('overflow-x', 'hidden');
        }
        else {
          showBottomScroll = true;
          body.el.css('overflow-x', 'scroll');
        }
      }
      else {
        if (centerViewWidth > centerFullWidth) {
          showBottomScroll = false;
          me.scrollBottomEl.addCls(HIDDEN_CLS);
        }
        else {
          showBottomScroll = true;
          me.scrollBottomEl.removeCls(HIDDEN_CLS);
        }
      }

      return showBottomScroll;
    },
    /*
     *
     */
    checkCorner: function () {
      var me = this,
        w = me.widget;

      if (w.nativeScroller) {
        return;
      }

      me.corner = !me.scrollRightEl.hasCls(HIDDEN_CLS) && !me.scrollBottomEl.hasCls(HIDDEN_CLS);
    },
    /*
     *
     */
    setBottomKnobSize: function () {
      var me = this,
        w = me.widget;

      if (w.nativeScroller) {
        return;
      }

      var centerViewWidth = w.getCenterViewWidth() - (me.corner ? me.cornerSize : 0),
        centerFullWidth = w.getCenterFullWidth() - (me.corner ? me.cornerSize : 0),
        scrollBottomPath = centerFullWidth - centerViewWidth,
        percents = 100 - scrollBottomPath / (centerFullWidth / 100),
        knobWidth = centerViewWidth * (percents / 100) - 2;

      if (knobWidth < me.minBottomKnobWidth) {
        knobWidth = me.minBottomKnobWidth;
      }

      me.bottomKnob.stop();
      me.bottomKnob.animate({width: knobWidth}, F.ANIMATE_DURATION);
      me.bottomKnobWidth = knobWidth;
      me.bodyViewWidth = centerViewWidth;
      me.bottomScrollScale = (centerViewWidth - centerFullWidth) / (centerViewWidth - knobWidth - 2 - 1);
    },
    /*
     * @param {Number} y
     * @param {Number} x
     */
    scroll: function (y, x) {
      var me = this,
        w = me.widget,
        scrollInfo;

      if (w.nativeScroller) {
        if (y !== null && y !== undefined) {
          w.body.el.dom.scrollTop = y;
        }

        if (x !== null && x !== undefined) {
          w.body.el.dom.scrollLeft = Math.abs(x);
          if (w.header) {
            w.header.scroll(x);
          }
        }

        w.fire('scroll');
        return
      }

      w.leftBody.scroll(y);
      scrollInfo = w.body.scroll(y, x);
      w.rightBody.scroll(y);

      if (scrollInfo.scrollTop !== undefined) {
        me.scrollTop = Math.abs(scrollInfo.scrollTop);
      }

      if (scrollInfo.scrollLeft !== undefined) {
        me.scrollLeft = Math.abs(scrollInfo.scrollLeft);
      }

      w.fire('scroll');
    },
    /*
     * @param {Number} value
     * @return {Boolean}
     */
    scrollDelta: function (value) {
      var me = this,
        w = me.widget,
        scrollInfo;

      w.leftBody.wheelScroll(value);
      scrollInfo = w.body.wheelScroll(value);
      w.rightBody.wheelScroll(value);

      if(scrollInfo === undefined){
        return;
      }

      me.scrollTop = Math.abs(scrollInfo.newScroll);
      //me.scrollLeft = Math.abs(scrollInfo.scrollLeft);

      w.fire('scroll');

      return scrollInfo.scrolled;
    },
    /*
     *
     */
    scrollRightKnob: function () {
      var me = this,
        w = me.widget,
        bodyScrolled = me.getScroll(),
        newKnobScroll = bodyScrolled / me.rightScrollScale + w.knobOffSet;

      if (!me.rightKnob) {
        return;
      }

      me.rightKnob.css('margin-top', newKnobScroll + 'px');
    },
    /*
     *
     */
    scrollBottomKnob: function () {
      var me = this,
        w = me.widget,
        scrolled = me.getBottomScroll(),
        newKnobScroll = scrolled / me.bottomScrollScale + w.knobOffSet;

      if (scrolled === 0) {
        newKnobScroll = -1;
      }

      if (!me.bottomKnob) {
        return;
      }

      me.bottomKnob.css('margin-left', -newKnobScroll + 'px');
    },
    /*
     * @return {Number}
     */
    getScroll: function () {
      var me = this,
        w = me.widget;

      if(w.nativeScroller){
        return w.body.el.dom.scrollTop;
      }

      return Math.abs(parseInt(w.body.el.select('.' + GRID_COLUMN_CLS).item(0).css('top')));
    },
    /*
     * @return {Number}
     */
    getBottomScroll: function () {
      var me = this,
        w = me.widget;

      if(w.nativeScroller){
        return w.body.el.dom.scrollLeft;
      }

      return Math.abs(parseInt(w.body.el.select('.' + GRID_COLUMN_CLS).item(0).css('left')));
    },
    /*
     *
     */
    update: function () {
      this.setScrollBars();
      this.checkScroll();
    },
    /*
     *
     */
    onChangeStore: function () {
      this.update();
    },
    /*
     *
     */
    onColumnResize: function () {
      var me = this;

      me.setScrollBars();

      setTimeout(function () {
        me.setScrollBars();
      }, Fancy.ANIMATE_DURATION + 20);
    },
    /*
     *
     */
    checkScroll: function () {
      var me = this,
        w = me.widget,
        rightScrolled = me.getScroll(),
        bodyViewHeight = w.getBodyHeight() - (me.corner ? me.cornerSize : 0),
        cellsViewHeight = w.getCellsViewHeight() - (me.corner ? me.cornerSize : 0);

      if (rightScrolled && cellsViewHeight < bodyViewHeight) {
        me.scroll(0);
        if (!w.nativeScroller) {
          me.scrollRightKnob();
        }
      }
    },
    /*
     * @param {Fancy.Element} cell
     */
    scrollToCell: function (cell, nativeScroll) {
      var me = this,
        w = me.widget,
        cellHeight = w.cellHeight,
        cellEl = F.get(cell),
        columnEl = cellEl.parent(),
        rowIndex = Number(cellEl.attr('index')),
        columnIndex = Number(columnEl.attr('index')),
        rightScroll = me.getScroll(),
        passedHeight = cellHeight * (rowIndex + 1),
        bodyViewHeight = w.getBodyHeight(),
        bottomScroll = me.getBottomScroll(),
        side = w.getSideByCell(cell),
        bodyColumnsWidth = w.getColumnsWidth(side),
        bodyViewWidth = parseInt(w.body.el.css('width')),
        passedWidth = 0,
        isCenterBody = columnEl.parent().parent().hasCls(GRID_CENTER_CLS);

      if(w.nativeScroller && !nativeScroll){
        return;
      }

      if (rowIndex === 0 && columnIndex === 0) {
        me.scroll(0, 0);
        me.scrollBottomKnob();
        me.scrollRightKnob();
        return;
      }

      if(w.grouping){
        passedHeight += w.grouping.getSpecialRowsAbove(rowIndex) * w.groupRowHeight;
      }

      if(w.expander){
        passedHeight += w.expander.getBeforeHeight(rowIndex);
      }

      if (passedHeight - rightScroll > bodyViewHeight) {
        rightScroll += cellHeight;
        //if(rightScroll > passedHeight - bodyViewHeight){
          rightScroll = passedHeight - bodyViewHeight + 5;
        //}
        me.scroll(rightScroll);
      }
      else if(passedHeight - rightScroll < w.cellHeight){
        rightScroll -= cellHeight;
        if(rightScroll < 0){
          rightScroll = 0;
        }
        me.scroll(rightScroll);
      }

      if (isCenterBody) {
        var columns = w.columns,
          i = 0;

        for (; i <= columnIndex; i++) {
          passedWidth += columns[i].width;
        }

        if (passedWidth - bottomScroll > bodyViewWidth) {
          if (!columns[i]) {
            //me.scroll(rightScroll, -(passedWidth - bottomScroll - bodyViewWidth));
            me.scroll(rightScroll, -(bodyColumnsWidth - bodyViewWidth));
          }
          else {
            //me.scroll(rightScroll, -(bottomScroll + columns[columnIndex].width));
            me.scroll(rightScroll, -(bottomScroll + (passedWidth - bottomScroll) - bodyViewWidth));
          }
        }
        else if(passedWidth - bottomScroll < columns[columnIndex].width){
          //var bottomScroll = -(bottomScroll - Math.abs(passedWidth - bottomScroll));
          bottomScroll = -(passedWidth - columns[columnIndex].width);
          if(bottomScroll > 0){
            bottomScroll = 0;
          }

          me.scroll(rightScroll, bottomScroll);
        }
        else if (bottomScroll !== 0) {
          if (columnIndex === 0) {
            me.scroll(rightScroll, 0);
          }
        }

        me.scrollBottomKnob();
      }

      me.scrollRightKnob();
    },
    /*
     *
     */
    onNativeScrollBody: function(){
      var me = this,
        w = me.widget,
        scrollTop = w.body.el.dom.scrollTop,
        scrollLeft = w.body.el.dom.scrollLeft;

      if(w.header){
        w.header.scroll(-scrollLeft);
      }

      if (w.leftBody){
        w.leftBody.el.dom.scrollTop = scrollTop;
      }

      if (w.rightBody){
        w.rightBody.el.dom.scrollTop = scrollTop;
      }

      if(w.leftColumns.length && w.leftBody.el.dom.scrollTop !== w.body.el.dom.scrollTop){
        w.body.el.dom.scrollTop = w.leftBody.el.dom.scrollTop;
      }
      else if(w.rightColumns.length && w.rightBody.el.dom.scrollTop !== w.body.el.dom.scrollTop){
        w.body.el.dom.scrollTop = w.rightBody.el.dom.scrollTop;
      }

      w.fire('nativescroll');
    },
    /*
     *
     */
    onNativeScrollLeftBody: function(){
      var w = this.widget;

      if(w.leftBody.el.dom.scrollTop !== w.body.el.dom.scrollTop){
        this.onNativeScrollBody();
      }
    },
    /*
     *
     */
    onNativeScrollRightBody: function(){
      var w = this.widget;

      if(w.rightBody.el.dom.scrollTop !== w.body.el.dom.scrollTop){
        this.onNativeScrollBody();
      }
    },
    /*
     * @param {Object} e
     */
    onMouseWheelLeft: function (e) {
      var w = this.widget,
        delta = F.getWheelDelta(e.originalEvent || e),
        scrollTop = delta * w.cellHeight;

      w.leftBody.el.dom.scrollTop -= scrollTop;
      w.body.el.dom.scrollTop -= scrollTop;
      w.rightBody.el.dom.scrollTop -= scrollTop;
    },
    /*
     * @param {Object} e
     */
    onMouseWheelRight: function (e) {
      var w = this.widget,
        delta = F.getWheelDelta(e.originalEvent || e),
        scrollTop = delta * w.cellHeight;

      w.leftBody.el.dom.scrollTop -= scrollTop;
      w.body.el.dom.scrollTop -= scrollTop;
      w.rightBody.el.dom.scrollTop -= scrollTop;
    },
    /*
     *
     */
    onLockColumn: function () {
      this.update();
      this.widget.setColumnsPosition();
    },
    /*
     *
     */
    onRightLockColumn: function () {
      this.update();
      this.widget.setColumnsPosition();
    },
    /*
     *
     */
    onUnLockColumn: function () {
      this.update();
      this.widget.setColumnsPosition();
    },
    /*
     *
     */
    onPanelResize: function () {
      var me = this,
        w = me.widget;

      w.scroll(0, 0);
    },
    onChangePages: function () {
      var me = this,
        w = me.widget;

      if(!w.nativeScroller && me.scrollTop){
        setTimeout(function () {
          me.scrollDelta(0);
        }, 1);

      }
    },
    onScrollBodyBugFix: function () {
      var me = this,
        w = me.widget,
        body = w.body,
        scrollLeft = body.el.dom.scrollLeft;

      body.el.dom.scrollLeft = me.scrollLeft;
      w.scroll(me.scrollTop, -me.scrollLeft - scrollLeft);
    }
  });

})();