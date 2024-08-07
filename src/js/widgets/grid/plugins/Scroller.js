/*
 * @class Fancy.grid.plugin.Scroller
 * @extends Fancy.Plugin
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  /*
   * CONSTANTS
   */
  const RIGHT_SCROLL_CLS = 'fancy-scroll-right';
  const BOTTOM_SCROLL_CLS = 'fancy-scroll-bottom';
  const TOP_SCROLL_CLS = 'fancy-scroll-top';
  const RIGHT_SCROLL_INNER_CLS = 'fancy-scroll-right-inner';
  const BOTTOM_SCROLL_INNER_CLS = 'fancy-scroll-bottom-inner';
  const TOP_SCROLL_INNER_CLS = 'fancy-scroll-top-inner';
  const NATIVE_SCROLLER_CLS = 'fancy-grid-native-scroller';
  const RIGHT_SCROLL_HOVER_CLS = 'fancy-scroll-right-hover';
  const BOTTOM_SCROLL_HOVER_CLS = 'fancy-scroll-bottom-hover';
  const TOP_SCROLL_HOVER_CLS = 'fancy-scroll-top-hover';
  const RIGHT_SCROLL_ACTIVE_CLS = 'fancy-scroll-right-active';
  const BOTTOM_SCROLL_ACTIVE_CLS = 'fancy-scroll-bottom-active';
  const TOP_SCROLL_ACTIVE_CLS = 'fancy-scroll-top-active';
  const HIDDEN_CLS = F.HIDDEN_CLS;
  const GRID_COLUMN_CLS = F.GRID_COLUMN_CLS;
  const GRID_CENTER_CLS = F.GRID_CENTER_CLS;

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
     * @private
     */
    scrollTop: 0,
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
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons(){
      const me = this,
        w = me.widget,
        mouseWheelEventName = F.getMouseWheelEventName();

      w.once('render', () => {
        me.render();
        w.leftBody.el.on(mouseWheelEventName, me.onMouseWheel, me);
        if (w.nativeScroller){
          w.leftBody.el.on(mouseWheelEventName, me.onMouseWheelLeft, me);
          w.rightBody.el.on(mouseWheelEventName, me.onMouseWheelRight, me);
        }
        w.body.el.on(mouseWheelEventName, me.onMouseWheel, me);
        w.rightBody.el.on(mouseWheelEventName, me.onMouseWheel, me);
        w.once('init', me.onGridInit, me);

        if (w.nativeScroller){
          w.body.el.on('scroll', me.onNativeScrollBody, me);
          w.leftBody.el.on('scroll', me.onNativeScrollLeftBody, me);
          w.rightBody.el.on('scroll', me.onNativeScrollRightBody, me);
        }
        else {
          if (w.panel){
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
    destroy(){
      const me = this,
        w = me.widget,
        leftBody = w.leftBody,
        body = w.body,
        rightBody = w.rightBody,
        // docEl = F.get(document),
        mouseWheelEventName = F.getMouseWheelEventName();

      // docEl.un('mouseup', me.onMouseUpDoc, me);
      // docEl.un('mousemove', me.onMouseMoveDoc, me);

      leftBody.el.un(mouseWheelEventName, me.onMouseWheel, me);
      body.el.un(mouseWheelEventName, me.onMouseWheel, me);
      rightBody.el.un(mouseWheelEventName, me.onMouseWheel, me);

      if(!w.nativeScroller){
        me.scrollBottomEl.un('mousedown', me.onMouseDownBottomSpin, me);
        me.scrollRightEl.un('mousedown', me.onMouseDownRightSpin, me);
      }

      if (F.isTouch){
        leftBody.el.un('touchstart', me.onBodyTouchStart, me);
        leftBody.el.un('touchmove', me.onBodyTouchMove, me);

        body.el.un('touchstart', me.onBodyTouchStart, me);
        body.el.un('touchmove', me.onBodyTouchMove, me);

        rightBody.el.un('touchstart', me.onBodyTouchStart, me);
        rightBody.el.un('touchmove', me.onBodyTouchMove, me);

        // docEl.un('touchend', me.onBodyTouchEnd, me);
      }
    },
    /*
     *
     */
    onGridInit(){
      const me = this,
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

      w.on('columndrag', me.onColumnDrag, me);

      setTimeout(() => {
        me.update();
      }, 1);
    },
    /*
     *
     */
    render(){
      const me = this,
        w = me.widget,
        body = w.body,
        rightScrollEl = F.newEl('div'),
        bottomScrollEl = F.newEl('div'),
        topScrollEl = F.newEl('div');

      if (w.nativeScroller) {
        w.el.addCls(NATIVE_SCROLLER_CLS);
      }
      else {
        rightScrollEl.addCls(RIGHT_SCROLL_CLS);
        bottomScrollEl.addCls(BOTTOM_SCROLL_CLS, HIDDEN_CLS);

        rightScrollEl.update([
          '<div class="' + RIGHT_SCROLL_INNER_CLS + '"></div>'
        ].join(' '));

        rightScrollEl.select(`.${RIGHT_SCROLL_INNER_CLS}`).css('margin-top', w.knobOffSet);

        bottomScrollEl.update([
          '<div class="' + BOTTOM_SCROLL_INNER_CLS + '"></div>'
        ].join(' '));

        F.get(body.el.append(rightScrollEl.dom));
        me.scrollRightEl = body.el.select('.fancy-scroll-right');

        F.get(body.el.append(bottomScrollEl.dom));
        me.scrollBottomEl = body.el.select('.fancy-scroll-bottom');

        if(w.doubleHorizontalScroll){
          topScrollEl.addCls(TOP_SCROLL_CLS, HIDDEN_CLS);

          topScrollEl.update([
            '<div class="' + TOP_SCROLL_INNER_CLS + '"></div>'
          ].join(' '));

          F.get(body.el.append(topScrollEl.dom));
          me.scrollTopEl = body.el.select('.fancy-scroll-top');
        }
      }

      me.fire('render');
    },
    /*
     *
     */
    onMouseWheel(e){
      const me = this,
        w = me.widget,
        s = w.store,
        delta = F.getWheelDelta(e.originalEvent || e);

      if(w.infinite){
        e.preventDefault();

        let newInfiniteScrolledToRow;

        if(delta < 0){
          newInfiniteScrolledToRow = s.infiniteScrolledToRow + 1;
        }
        else{
          newInfiniteScrolledToRow = s.infiniteScrolledToRow - 1;
        }

        if(newInfiniteScrolledToRow > s.getNumOfInfiniteRows() - (w.numOfVisibleCells - 1 ) ){
          newInfiniteScrolledToRow = s.getNumOfInfiniteRows() - (w.numOfVisibleCells - 1);
        }

        if(newInfiniteScrolledToRow < 0){
          newInfiniteScrolledToRow = 0;
        }

        s.infiniteScrolledToRow = newInfiniteScrolledToRow;
        w.update();

        if(w.selection){
          w.selection.updateSelection();
        }

        return;
      }

      if (me.isRightScrollable() == false){
        return;
      }

      if (w.stopProp){
        e.stopPropagation();
      }

      if (w.nativeScroller){}
      else {
        if (me.scrollDelta(delta)){
          e.preventDefault();
        }
        me.scrollRightKnob();
      }
    },
    /*
     *
     */
    onRender(){
      const me = this,
        w = me.widget,
        {
          bottomKnobDown,
          rightKnobDown
        } = me;

      if (w.nativeScroller !== true) {
        me.scrollRightEl.hover(() => {
          if (bottomKnobDown !== true){
            me.scrollRightEl.addCls(RIGHT_SCROLL_HOVER_CLS);
          }
        }, () => {
          me.scrollRightEl.removeCls(RIGHT_SCROLL_HOVER_CLS);
        });

        me.scrollBottomEl.hover(() => {
          if (rightKnobDown !== true){
            me.scrollBottomEl.addCls(BOTTOM_SCROLL_HOVER_CLS);
          }
        }, () => {
          me.scrollBottomEl.removeCls(BOTTOM_SCROLL_HOVER_CLS);
        });

        if(w.doubleHorizontalScroll){
          me.scrollTopEl.hover(() => {
            if (bottomKnobDown !== true){
              me.scrollTopEl.addCls(TOP_SCROLL_HOVER_CLS);
            }
          }, () => {
            if (bottomKnobDown !== true){
              me.scrollTopEl.removeCls(TOP_SCROLL_HOVER_CLS);
            }
          });
        }

        me.initRightScroll();
        me.initBottomScroll();
      }

      if (F.isTouch){
        me.initTouch();
      }
    },
    /*
     *
     */
    initTouch(){
      const me = this,
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

      //docEl.on('touchend', me.onMouseUpDoc, me);
      docEl.on('touchend', me.onBodyTouchEnd, me);
    },
    /*
     * @param {Object} e
     */
    onBodyTouchStart(e){
      e = e.originalEvent || e;

      const me = this,
        w = me.widget,
        touchXY = e.changedTouches[0];

      if (w.nativeScroller){
        return;
      }

      if(Fancy.nojQuery){
        if(w.panel){
          w.panel.el.select('.' + Fancy.GRID_ANIMATION_CLS).removeCls(Fancy.GRID_ANIMATION_CLS);
        }
        else {
          w.el.removeCls(Fancy.GRID_ANIMATION_CLS);
        }
      }

      e.preventDefault();

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

      if(w.doubleHorizontalScroll){
        me.scrollTopEl.addCls(TOP_SCROLL_ACTIVE_CLS);
      }
    },
    /*
     *
     */
    onBodyTouchEnd(){
      const me = this,
        w = me.widget;

      me.onMouseUpDoc();

      if(w.nativeScroller !== true && me.spyOnSwipe){
        const swipedX = me.spyOnSwipe.swipedX,
          swipedY = me.spyOnSwipe.swipedY;

        if(swipedY && swipedX){
          if(me.touchScrollDirection === 'top'){
            me.swipeTop();
          }
          else if(me.touchScrollDirection === 'left'){
            me.swipeLeft();
          }
        }
        else if(swipedY){
          me.swipeTop();
        }
        else if(swipedX){
          me.swipeLeft();
        }
      }

      delete me.spyOnSwipe;
      delete me.touchScrollDirection;
    },
    swipeTop(){
      let me = this,
        w = me.widget,
        scrollTop = me.scrollTop + me.spyOnSwipe.swipedY * 10;

      if(!me.isRightScrollable()){
        return;
      }

      if(scrollTop < 0){
        scrollTop = 0;
      }

      w.scroll(scrollTop, false, true);
    },
    swipeLeft(){
      let me = this,
        w = me.widget,
        scrollLeft = me.scrollLeft + me.spyOnSwipe.swipedX * 10;

      if(!me.isBottomScrollable()){
        return;
      }

      if(scrollLeft < 0){
        scrollLeft = 0;
      }

      w.scroll(false, scrollLeft, true);
    },
    /*
     * @param {Object} e
     */
    onBodyTouchMove(e){
      var me = this,
        w = me.widget,
        e = e.originalEvent || e,
        touchXY = e.changedTouches[0],
        changed = true;

      if(!w.nativeScroller){
        var scrollLeft = me.scrollLeft,
          scrollTop = me.scrollTop;

        me.onMouseMoveDoc({
          pageX: touchXY.pageX,
          pageY: touchXY.pageY
        });

        changed = scrollLeft !== me.scrollLeft || scrollTop !== me.scrollTop;

        e.preventDefault();
      }
      else{
        if(F.isTouch){
          return;
        }

        me.onMouseMoveDoc({
          pageX: touchXY.pageX,
          pageY: touchXY.pageY
        });
      }

      if (me.rightKnobDown === true && changed){
        e.preventDefault();
      }

      if (me.bottomKnobDown === true && changed){
        e.preventDefault();
      }
    },
    /*
     *
     */
    initRightScroll(){
      const me = this;

      me.rightKnob = me.scrollRightEl.select('.' + RIGHT_SCROLL_INNER_CLS);
      me.scrollRightEl.on('mousedown', me.onMouseDownRightSpin, me);
    },
    /*
     *
     */
    initBottomScroll(){
      const me = this,
        w = me.widget;

      me.bottomKnob = me.scrollBottomEl.select('.' + BOTTOM_SCROLL_INNER_CLS);
      me.scrollBottomEl.on('mousedown', me.onMouseDownBottomSpin, me);

      if(w.doubleHorizontalScroll){
        me.topKnob = me.scrollTopEl.select('.' + TOP_SCROLL_INNER_CLS);
        me.scrollTopEl.on('mousedown', me.onMouseDownBottomSpin, me);
      }
    },
    /*
     * @param {Object} e
     */
    onMouseDownRightSpin(e){
      const me = this,
        w = me.widget;

      if (F.isTouch){
        return;
      }

      if(Fancy.nojQuery){
        if(w.panel){
          w.panel.el.select('.' + Fancy.GRID_ANIMATION_CLS).removeCls(Fancy.GRID_ANIMATION_CLS);
        }
        else {
          w.el.removeCls(Fancy.GRID_ANIMATION_CLS);
        }
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
    onMouseDownBottomSpin(e){
      const me = this,
        w = me.widget,
        targetEl = F.get(e.target);

      e.preventDefault();

      if(Fancy.nojQuery){
        if(w.panel){
          w.panel.el.select('.' + Fancy.GRID_ANIMATION_CLS).removeCls(Fancy.GRID_ANIMATION_CLS);
        }
        else {
          w.el.removeCls(Fancy.GRID_ANIMATION_CLS);
        }
      }

      me.bottomKnobDown = true;
      me.mouseDownXY = {
        x: e.pageX,
        y: e.pageY
      };

      me.bottomKnobLeft = parseInt(me.bottomKnob.css('margin-left'));
      me.scrollBottomEl.addCls(BOTTOM_SCROLL_ACTIVE_CLS);

      if(targetEl.hasClass()){
        me.scrollTopEl.addCls(TOP_SCROLL_INNER_CLS);
      }
    },
    /*
     *
     */
    onMouseUpDoc(){
      const me = this,
        w = me.widget;

      me.mouseDownXY = {};
      delete me.mouseMoveInitXY;

      if (me.rightKnobDown === false && me.bottomKnobDown === false) {
        if (w.nativeScroller && Fancy.nojQuery) {
          w.addCls(Fancy.GRID_ANIMATION_CLS);
        }
        return;
      }

      Fancy.nojQuery && w.addCls(Fancy.GRID_ANIMATION_CLS);

      me.scrollRightEl.removeCls(RIGHT_SCROLL_ACTIVE_CLS);
      me.scrollBottomEl.removeCls(BOTTOM_SCROLL_ACTIVE_CLS);
      me.rightKnobDown = false;
      me.bottomKnobDown = false;

      w.doubleHorizontalScroll && me.scrollTopEl.removeCls(TOP_SCROLL_ACTIVE_CLS, TOP_SCROLL_HOVER_CLS);
    },
    /*
     * @param {Object} e
     */
    onMouseMoveDoc(e){
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

      if(F.isTouch && !me.mouseMoveInitXY){
        me.mouseMoveInitXY = {
          x,
          y
        };
        return;
      }

      if(F.isTouch && !me.touchScrollDirection){
        deltaX = me.mouseMoveInitXY.x - x;
        deltaY = me.mouseMoveInitXY.y - y;

        if(!me.touchScrollDirection && Math.abs(deltaY) < 5 && Math.abs(deltaX) < 5){
          return;
        }
        else {
          if (Math.abs(deltaY) > Math.abs(deltaX)){
            me.touchScrollDirection = 'top';
          }
          else {
            me.touchScrollDirection = 'left';
          }
        }
      }

      clearInterval(me.scrollInterval);

      if(me.spyOnSwipe){
        if(Math.abs(me.spyOnSwipe.x - x) > 1){
          me.spyOnSwipe.swipedX = me.spyOnSwipe.x - x;
        }
        else{
          delete me.spyOnSwipe.swipedX;
        }

        if(Math.abs(me.spyOnSwipe.y - y) > 1){
          me.spyOnSwipe.swipedY = me.spyOnSwipe.y - y;
        }
        else{
          delete me.spyOnSwipe.swipedY;
        }

        me.spyOnSwipe.x = x;
        me.spyOnSwipe.y = y;
      }
      else{
        me.spyOnSwipe = {
          x,
          y
        };
      }

      me.scrollInterval = setTimeout(() => {
        if(me.rightKnobDown && me.touchScrollDirection !== 'left'){
          if(F.isTouch){
            deltaY = me.mouseDownXY.y - y;
            marginTop = deltaY + Math.ceil(me.rightKnobTop * me.rightScrollScale);
          }
          else{
            deltaY = y - me.mouseDownXY.y;
            marginTop = deltaY + me.rightKnobTop;
          }

          if(F.isTouch){
            if (me.bodyViewHeight < marginTop/me.rightScrollScale + me.rightKnobHeight){
              marginTop = me.bodyFullViewHeight - me.bodyViewHeight;
            }
          }
          else{
            if (me.bodyViewHeight < marginTop + me.rightKnobHeight){
              marginTop = me.bodyViewHeight - me.rightKnobHeight;
            }
          }

          if(marginTop < 0){
            marginTop = 0;
          }

          if (F.isTouch){
            topScroll = marginTop;
            me.rightKnob.css('margin-top', (marginTop/me.rightScrollScale + knobOffSet) + 'px');
          }
          else{
            topScroll = me.rightScrollScale * marginTop;
            me.rightKnob.css('margin-top', (marginTop + knobOffSet) + 'px');
          }

          if (w.doubleHorizontalScroll && me.scrollBottomEl.css('display') !== 'none'){
            if (marginTop < me.cornerSize){
              marginTop = me.cornerSize;
            }
          }

          if(w.infinite && w.selection){
            w.selection.updateSelection();
            w.selection.clearActiveCell();
          }
        }

        if (me.bottomKnobDown && me.touchScrollDirection !== 'top'){
          if (F.isTouch){
            deltaX = me.mouseDownXY.x - x;
            deltaY = me.mouseDownXY.y - y;

            marginLeft = deltaX + Math.ceil(me.bottomKnobLeft * Math.abs(me.bottomScrollScale));
          }
          else{
            deltaX = x - me.mouseDownXY.x;
            deltaY = y - me.mouseDownXY.y;
            marginLeft = deltaX + me.bottomKnobLeft;
          }

          if (marginLeft < 1){
            marginLeft = 1;
          }

          if(F.isTouch){
            if (me.bodyViewWidth - 2 < Math.abs(marginLeft/me.bottomScrollScale) + me.bottomKnobWidth){
              marginLeft = me.bodyFullViewWidth - me.bodyViewWidth - 2;
            }
          }
          else {
            if (me.bodyViewWidth - 2 < marginLeft + me.bottomKnobWidth){
              marginLeft = me.bodyViewWidth - me.bottomKnobWidth - 2;
            }
          }

          if (me.bottomScrollScale < 0 && marginLeft < 0){
            marginLeft = 0;
            me.bottomScrollScale = 0;
          }

          if(F.isTouch){
            bottomScroll = -marginLeft - 1;
            me.bottomKnob.css('margin-left', Math.abs(marginLeft/me.bottomScrollScale) + 'px' );
          }
          else{
            bottomScroll = Math.ceil( me.bottomScrollScale * (marginLeft - 1) );
            me.bottomKnob.css('margin-left', marginLeft + 'px' );
          }

          if (w.doubleHorizontalScroll){
            me.topKnob.css( 'margin-left', marginLeft + 'px' );
          }

          //me.scroll(false, bottomScroll);
        }

        if(F.isTouch){
          switch(me.touchScrollDirection){
            case 'top':
              me.scroll(topScroll);
              break;
            case 'left':
              me.scroll(false, bottomScroll);
              break;
          }
        }
        else {
          if (topScroll !== false && bottomScroll !== false){
            me.scroll(topScroll, bottomScroll);
          }
          else if (topScroll !== false){
            me.scroll(topScroll);
          }
          else if (bottomScroll !== false){
            me.scroll(false, bottomScroll);
          }
        }
      }, 1);
    },
    /*
     * @param {Number} [viewHeight]
     */
    setScrollBars(viewHeight){
      const me = this,
        w = me.widget;

      if(w.rowheight && viewHeight === undefined){
        return;
      }

      setTimeout(() => {
        me.checkRightScroll(viewHeight);
      }, 1);

      if (!me.checkBottomScroll()){
        if (me.scrollTop && !w.infinite){
          w.scroll(false, 0);
        }
      }

      if (!w.nativeScroller){
        setTimeout(() => {
          me.checkCorner();
          me.setRightKnobSize(viewHeight);
          me.setBottomKnobSize();
        }, 1);
      }
    },
    /*
     * @param {Number} [viewHeight]
     */
    checkRightScroll(viewHeight){
      const me = this,
        w = me.widget,
        body = w.body,
        gridBorders = w.gridBorders,
        bodyViewHeight = w.getBodyHeight(),
        cellsViewHeight = (viewHeight || w.getCellsViewHeight()) - gridBorders[0] - gridBorders[2];

      if (w.nativeScroller){
        if (bodyViewHeight >= cellsViewHeight){
          body.el.css('overflow-y', 'hidden');
        }
        else {
          body.el.css('overflow-y', 'scroll');
        }
      }
      else {
        if (bodyViewHeight >= cellsViewHeight){
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
    isRightScrollable(){
      const w = this.widget;

      if (w.nativeScroller){
        return w.body.el.css('overflow-y') === 'scroll';
      }

      return !this.scrollRightEl.hasCls(HIDDEN_CLS);
    },
    /*
     *
     */
    isBottomScrollable(){
      const w = this.widget;

      if (w.nativeScroller){
        return w.body.el.css('overflow-x') === 'scroll';
      }

      return !this.scrollBottomEl.hasCls(HIDDEN_CLS);
    },
    /*
     * @param {Number} [viewHeight]
     */
    setRightKnobSize(viewHeight){
      const me = this,
        w = me.widget;

      if (w.nativeScroller){
        return;
      }

      var bodyViewHeight = w.getBodyHeight() - (me.corner ? me.cornerSize : 0) - 2,
        cellsViewHeight = (viewHeight || w.getCellsViewHeight()) - (me.corner ? me.cornerSize : 0),
        scrollRightPath = cellsViewHeight - bodyViewHeight,
        percents = 100 - scrollRightPath / (bodyViewHeight / 100),
        knobHeight = bodyViewHeight * (percents / 100),
        knobOffSet = w.knobOffSet;

      if (knobHeight < me.minRightKnobHeight){
        knobHeight = me.minRightKnobHeight;

        if(w.doubleHorizontalScroll){
          knobHeight += me.minRightKnobHeight;
        }
      }

      if (me.corner === false){
        bodyViewHeight -= knobOffSet;
      }

      //me.rightKnob.stop();
      //me.rightKnob.animate({height: knobHeight}, F.ANIMATE_DURATION);
      me.rightKnob.css({height: knobHeight});
      me.rightKnobHeight = knobHeight;
      me.bodyViewHeight = bodyViewHeight;
      me.bodyFullViewHeight = cellsViewHeight;
      me.rightScrollScale = (cellsViewHeight - bodyViewHeight) / (bodyViewHeight - knobHeight);
    },
    /*
     *
     */
    checkBottomScroll(){
      var me = this,
        w = me.widget,
        body = w.body,
        centerViewWidth = w.getCenterViewWidth(),
        centerFullWidth = w.getCenterFullWidth() - 2,
        showBottomScroll;

      if (w.nativeScroller){
        if (centerViewWidth > centerFullWidth){
          showBottomScroll = false;
          body.el.css('overflow-x', 'hidden');
        }
        else {
          showBottomScroll = true;
          body.el.css('overflow-x', 'scroll');
        }
      }
      else {
        if (centerViewWidth > centerFullWidth){
          showBottomScroll = false;
          me.scrollBottomEl.addCls(HIDDEN_CLS);

          if(w.doubleHorizontalScroll){
            me.scrollTopEl.addCls(HIDDEN_CLS);
          }
        }
        else {
          showBottomScroll = true;
          me.scrollBottomEl.removeCls(HIDDEN_CLS);

          if(w.doubleHorizontalScroll){
            me.scrollTopEl.removeCls(HIDDEN_CLS);
          }
        }
      }

      return showBottomScroll;
    },
    /*
     *
     */
    checkCorner(){
      const me = this,
        w = me.widget;

      if (w.nativeScroller){
        return;
      }

      me.corner = !me.scrollRightEl.hasCls(HIDDEN_CLS) && !me.scrollBottomEl.hasCls(HIDDEN_CLS);
    },
    /*
     *
     */
    setBottomKnobSize(){
      const me = this,
        w = me.widget;

      if (w.nativeScroller){
        return;
      }

      var centerViewWidth = w.getCenterViewWidth() - (me.corner ? me.cornerSize : 0),
        centerFullWidth = w.getCenterFullWidth() - (me.corner ? me.cornerSize : 0),
        scrollBottomPath = centerFullWidth - centerViewWidth,
        percents = 100 - scrollBottomPath / (centerFullWidth / 100),
        knobWidth = centerViewWidth * (percents / 100) - 2;

      if (knobWidth < me.minBottomKnobWidth){
        knobWidth = me.minBottomKnobWidth;
      }

      //me.bottomKnob.stop();
      //me.bottomKnob.animate({width: knobWidth}, F.ANIMATE_DURATION);
      me.bottomKnob.css({width: knobWidth});

      if(w.doubleHorizontalScroll){
        //me.topKnob.stop();
        //me.topKnob.animate({width: knobWidth}, F.ANIMATE_DURATION);
        me.topKnob.css({width: knobWidth}, F.ANIMATE_DURATION);
      }

      me.bottomKnobWidth = knobWidth;
      me.bodyViewWidth = centerViewWidth;
      me.bottomScrollScale = (centerViewWidth - centerFullWidth) / (centerViewWidth - knobWidth - 2 - 1);
      me.bodyFullViewWidth = centerFullWidth;
    },
    /*
     * @param {Number} y
     * @param {Number} x
     * @param {Boolean} [animate]
     */
    scroll(y, x, animate){
      var me = this,
        w = me.widget,
        scrollInfo;

      if(x > 0){
        x = 0;
      }

      if (w.nativeScroller){
        if (y !== null && y !== undefined){
          w.body.el.dom.scrollTop = y;
        }

        if (x !== null && x !== undefined){
          w.body.el.dom.scrollLeft = Math.abs(x);
          if (w.header){
            w.header.scroll(x, true);
          }
        }

        w.fire('scroll');
        return;
      }

      if(animate){
        w.el.addCls('fancy-grid-columns-animation');
        setTimeout(() => {
          w.el.removeCls('fancy-grid-columns-animation');
        }, F.ANIMATE_DURATION + 150);
      }

      w.leftBody.scroll(y);
      scrollInfo = w.body.scroll(y, x, animate);
      w.rightBody.scroll(y);

      if (scrollInfo.scrollTop !== undefined){
        me.scrollTop = Math.abs(scrollInfo.scrollTop);
      }

      if (scrollInfo.scrollLeft !== undefined){
        me.scrollLeft = Math.abs(scrollInfo.scrollLeft);
      }

      w.fire('scroll');

      if(F.isTouch){
        w._preventTouchDown = true;
      }
    },
    /*
     * @param {Number} value
     * @return {Boolean}
     */
    scrollDelta(value){
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
    scrollRightKnob(){
      var me = this,
        w = me.widget,
        s = w.store,
        bodyScrolled = me.getScroll(),
        newKnobScroll = bodyScrolled / me.rightScrollScale + w.knobOffSet;

      if (!me.rightKnob){
        return;
      }

      if (w.doubleHorizontalScroll){
        newKnobScroll += me.cornerSize;
      }

      if(w.infinite){}

      me.rightKnob.css('margin-top', newKnobScroll + 'px');
    },
    /*
     *
     */
    scrollBottomKnob(){
      var me = this,
        w = me.widget,
        scrolled = me.getBottomScroll(),
        newKnobScroll = scrolled / me.bottomScrollScale + w.knobOffSet;

      if (scrolled === 0){
        newKnobScroll = -1;
      }

      if (!me.bottomKnob){
        return;
      }

      me.bottomKnob.css('margin-left', -newKnobScroll + 'px');

      if(w.doubleHorizontalScroll){
        me.topKnob.css('margin-left', -newKnobScroll + 'px');
      }
    },
    /*
     * @return {Number}
     */
    getScroll(){
      const me = this,
        w = me.widget,
        s = w.store;

      if(w.nativeScroller){
        return w.body.el.dom.scrollTop;
      }

      if(w.infinite){
        return Math.abs(s.infiniteScrolledToRow * w.cellHeight);
      }

      if(w.columns.length === 0){
        if(w.leftColumns.length){
          return Math.abs(parseInt(w.leftBody.el.select('.' + GRID_COLUMN_CLS).item(0).css('top')));
        }

        if(w.rightColumns.length){
          return Math.abs(parseInt(w.rightBody.el.select('.' + GRID_COLUMN_CLS).item(0).css('top')));
        }
      }

      const columnEls = w.body.el.select('.' + GRID_COLUMN_CLS);

      if(columnEls.length === 0){
        return 0;
      }

      return Math.abs(parseInt(columnEls.item(0).css('top')));
    },
    /*
     * @return {Number}
     */
    getBottomScroll(){
      const me = this,
        w = me.widget;

      if(w.nativeScroller){
        return w.body.el.dom.scrollLeft;
      }

      if(w.columns.length === 0){
        if (w.leftColumns.length){
          return Math.abs(parseInt(w.leftBody.el.select('.' + GRID_COLUMN_CLS).item(0).css('left')));
        }

        if (w.rightColumns.length){
          return Math.abs(parseInt(w.rightBody.el.select('.' + GRID_COLUMN_CLS).item(0).css('left')));
        }
      }

      const columnEls = w.body.el.select('.' + GRID_COLUMN_CLS);

      if(columnEls.length === 0){
        return 0;
      }

      return Math.abs(parseInt(columnEls.item(0).css('left')));
    },
    /*
     * @param {Number} [viewHeight]
     */
    update(viewHeight){
      const me = this;

      me.setScrollBars(viewHeight);
      me.checkScroll(viewHeight);

      //if(!w.infinite){
        me.scrollRightKnob();
      //}
      me.scrollBottomKnob();
    },
    /*
     *
     */
    onChangeStore(){
      this.update();
    },
    /*
     *
     */
    onColumnResize(){
      const me = this;

      me.setScrollBars();

      setTimeout(() => {
        me.setScrollBars();
      }, Fancy.ANIMATE_DURATION + 20);
    },
    /*
     * @return {Number}
     */
    getScrollHeight(){
      const me = this,
        w = me.widget,
        bodyViewHeight = w.getBodyHeight() - (me.corner ? me.cornerSize : 0),
        cellsViewHeight = w.getCellsViewHeight() - (me.corner ? me.cornerSize : 0);

      if(bodyViewHeight > cellsViewHeight){
        return bodyViewHeight;
      }

      return cellsViewHeight - bodyViewHeight;
    },
    /*
     * @return {Number}
     */
    getScrollWidth(){
      const me = this,
        w = me.widget,
        centerViewWidth = w.getCenterViewWidth() - (me.corner ? me.cornerSize : 0),
        centerFullWidth = w.getCenterFullWidth() - (me.corner ? me.cornerSize : 0);

      if(centerViewWidth > centerFullWidth){
        return centerViewWidth;
      }

      return centerFullWidth - centerViewWidth;
    },
    /*
     * @param {Number} [viewHeight]
     */
    checkScroll(viewHeight){
      var me = this,
        w = me.widget,
        rightScrolled = me.getScroll(),
        bodyViewHeight = w.getBodyHeight() - (me.corner ? me.cornerSize : 0),
        cellsViewHeight = (viewHeight || w.getCellsViewHeight()) - (me.corner ? me.cornerSize : 0),
        centerColumnsWidth = w.getCenterFullWidth(),
        viewWidth = w.getCenterViewWidth(),
        scrollTop = me.getScrollTop(),
        scrollLeft = me.getScrollLeft();

      if(centerColumnsWidth < scrollLeft + viewWidth){
        setTimeout(function(){
          scrollTop = me.getScrollTop();
          scrollLeft = me.getScrollLeft();

          const delta = centerColumnsWidth - (scrollLeft + viewWidth);

          if(scrollLeft + delta < 0){
            w.scroll(scrollTop, 0);
          }
          else {
            w.scroll(scrollTop, (scrollLeft + delta));
          }
        }, F.nojQuery? 10: F.ANIMATE_DURATION);
        return;
      }

      if (rightScrolled && cellsViewHeight < bodyViewHeight){
        me.scroll(0);
        if (!w.nativeScroller){
          me.scrollRightKnob();
        }
      }
    },
    /*
     * @param {Fancy.Element} cell
     */
    scrollToCell(cell, nativeScroll, firstRowIsVisible){
      if(cell === undefined){
        return;
      }

      var me = this,
        w = me.widget,
        s = w.store,
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

      if(w.rowheight){
        passedHeight = w.rowheight.rowIndexesSum[rowIndex];
      }

      if(w.nativeScroller && !nativeScroll){
        return;
      }

      if(w.infinite){
        rowIndex += s.infiniteScrolledToRow;
        passedHeight += cellHeight * s.infiniteScrolledToRow;
      }

      if (rowIndex === 0 && columnIndex === 0){
        if(me.scrollLeft !== 0 && (w.selModel === 'row' || w.selModel === 'rows') && (!w.selection || !w.selection.activeCell)){
          me.scroll(0);
        }
        else {
          if(w.selection && w.selection.activeCell){
            const info = w.selection.getActiveCellInfo();

            if(info.side !== 'center'){
              me.scroll(0);
            }
            else{
              me.scroll(0, 0);
            }
          }
          else {
            me.scroll(0, 0);
          }
        }
        me.scrollBottomKnob();
        me.scrollRightKnob();
        return;
      }

      if(rowIndex === 0 && me.scrollTop !== 0){
        me.scroll(0);
        return;
      }

      if(w.isGroupable()){
        passedHeight += w.grouping.getSpecialRowsAbove(rowIndex) * w.groupRowHeight;
      }

      if(w.expander){
        passedHeight += w.expander.getBeforeHeight(rowIndex);
      }

      if (firstRowIsVisible){
        const cellViewsHeight = w.getCellsViewHeight();

        rightScroll = passedHeight - cellHeight;

        if(cellViewsHeight - rightScroll < bodyViewHeight){
          rightScroll -= Math.abs(cellViewsHeight - rightScroll - bodyViewHeight);
        }

        me.scroll(rightScroll);
      }
      else if (passedHeight - rightScroll > bodyViewHeight){
        var extraBottomOffset = 5;
        if(w.nativeScroller){
          extraBottomOffset = 20;
        }

        rightScroll = passedHeight - bodyViewHeight + extraBottomOffset;
        me.scroll(rightScroll);
      }
      else if(passedHeight - rightScroll < w.cellHeight){
        //rightScroll -= cellHeight;
        rightScroll = passedHeight - cellHeight - 5;
        if(rightScroll < 0){
          rightScroll = 0;
        }
        me.scroll(rightScroll);
      }

      if (isCenterBody){
        var columns = w.columns,
          i = 0;

        for (; i <= columnIndex; i++){
          if(!columns[i].hidden){
            passedWidth += columns[i].width;
          }
        }

        if (passedWidth - bottomScroll > bodyViewWidth){
          if (!columns[i]){
            me.scroll(rightScroll, -(bodyColumnsWidth - bodyViewWidth));
          }
          else {
            me.scroll(rightScroll, -(bottomScroll + (passedWidth - bottomScroll) - bodyViewWidth));
          }
        }
        else if(passedWidth - bottomScroll < columns[columnIndex].width){
          bottomScroll = -(passedWidth - columns[columnIndex].width);
          if(bottomScroll > 0){
            bottomScroll = 0;
          }

          me.scroll(rightScroll, bottomScroll);
        }
        else if (bottomScroll !== 0){
          if (columnIndex === 0){
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
    onNativeScrollBody(){
      const me = this,
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

      if(Fancy.nojQuery){
        if(w.panel){
          w.panel.el.select('.' + Fancy.GRID_ANIMATION_CLS).removeCls(Fancy.GRID_ANIMATION_CLS);
        }
        else {
          w.el.removeCls(Fancy.GRID_ANIMATION_CLS);
        }
      }

      if (w.summary){
        w.summary.scrollLeft(-scrollLeft);
      }

      if(w.subHeaderFilter){
        w.filter.scrollLeft(-scrollLeft);
      }

      w.fire('nativescroll');

      if(F.isTouch){
        w._preventTouchDown = true;
      }
    },
    /*
     *
     */
    onNativeScrollLeftBody(){
      const w = this.widget;

      if(w.leftBody.el.dom.scrollTop !== w.body.el.dom.scrollTop){
        this.onNativeScrollBody();
      }
    },
    /*
     *
     */
    onNativeScrollRightBody(){
      const w = this.widget;

      if(w.rightBody.el.dom.scrollTop !== w.body.el.dom.scrollTop){
        this.onNativeScrollBody();
      }
    },
    /*
     * @param {Object} e
     */
    onMouseWheelLeft(e){
      const w = this.widget,
        delta = F.getWheelDelta(e.originalEvent || e),
        scrollTop = delta * w.cellHeight;

      w.leftBody.el.dom.scrollTop -= scrollTop;
      w.body.el.dom.scrollTop -= scrollTop;
      w.rightBody.el.dom.scrollTop -= scrollTop;
    },
    /*
     * @param {Object} e
     */
    onMouseWheelRight(e){
      const w = this.widget,
        delta = F.getWheelDelta(e.originalEvent || e),
        scrollTop = delta * w.cellHeight;

      w.leftBody.el.dom.scrollTop -= scrollTop;
      w.body.el.dom.scrollTop -= scrollTop;
      w.rightBody.el.dom.scrollTop -= scrollTop;
    },
    /*
     *
     */
    onLockColumn(){
      const me = this;

      me.update();
      me.widget.setColumnsPosition();

      setTimeout(() => {
        me.update();
        me.widget.setColumnsPosition();
      }, F.ANIMATE_DURATION);
    },
    /*
     *
     */
    onColumnDrag(){
      const me = this;

      if(F.nojQuery){
        setTimeout(()=>{
          me.update();
        }, F.ANIMATE_DURATION);
      }

      /*

      if(F.nojQuery){
        setTimeout(function(){
          me.update();
          me.widget.setColumnsPosition(true);
        }, F.ANIMATE_DURATION);
      }
      else{
        me.update();
        me.widget.setColumnsPosition(true);
      }
      */
    },
    /*
     *
     */
    onRightLockColumn(){
      const me = this;

      me.update();
      me.widget.setColumnsPosition();

      setTimeout(() => {
        me.update();
        me.widget.setColumnsPosition();
      }, F.ANIMATE_DURATION);
    },
    /*
     *
     */
    onUnLockColumn(){
      const me = this;

      me.update();
      me.widget.setColumnsPosition();

      setTimeout(() => {
        me.update();
        me.widget.setColumnsPosition();
      }, F.ANIMATE_DURATION + 100);
    },
    /*
     *
     */
    onPanelResize(){
      this.widget.scroll(0, 0);
    },
    onChangePages(){
      var me = this,
        w = me.widget;

      if(!w.nativeScroller && me.scrollTop){
        setTimeout(() => {
          me.scrollDelta(0);
        }, 1);

      }
    },
    onScrollBodyBugFix(){
      const me = this,
        w = me.widget,
        body = w.body,
        scrollLeft = body.el.dom.scrollLeft;

      body.el.dom.scrollLeft = me.scrollLeft;
      w.scroll(me.scrollTop, -me.scrollLeft - scrollLeft);
    },
    /*
     *
     */
    getScrollTop(){
      const me = this,
        w = me.widget;

      if(w.nativeScroller){
        return w.body.el.dom.scrollTop;
      }

      return me.scrollTop;
    },
    /*
     *
     */
    getScrollLeft(){
      const me = this,
        w = me.widget;

      if(w.nativeScroller){
        return w.body.el.dom.scrollLeft;
      }

      return me.scrollLeft;
    }
  });

})();
