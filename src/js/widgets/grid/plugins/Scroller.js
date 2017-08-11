/*
 * @class Fancy.grid.plugin.Scroller
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.Scroller', {
  extend: Fancy.Plugin,
  ptype: 'grid.scroller',
  inWidgetName: 'scroller',
  rightScrollCls: 'fancy-scroll-right',
  bottomScrollCls: 'fancy-scroll-bottom',
  rightKnobDown: false,
  bottomKnobDown: false,
  minRightKnobHeight: 35,
  minBottomKnobWidth: 35,
  cornerSize: 12,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);

    me.ons();
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget,
      mouseWheelEventName = Fancy.getMouseWheelEventName();

    w.once('render', function() {
      me.render();
      w.leftBody.el.on(mouseWheelEventName, me.onMouseWheel, me);
      if(w.nativeScroller) {
        w.leftBody.el.on(mouseWheelEventName, me.onMouseWheelLeft, me);
        w.rightBody.el.on(mouseWheelEventName, me.onMouseWheelRight, me);
      }
      w.body.el.on(mouseWheelEventName, me.onMouseWheel, me);
      w.rightBody.el.on(mouseWheelEventName, me.onMouseWheel, me);
      w.once('init', me.onGridInit, me);

      if(w.nativeScroller){
        w.body.el.on('scroll', me.onNativeScrollBody, me);
      }
    });

    me.on('render', me.onRender, me);

    w.store.on('change', me.onChangeStore, me);
  },
  /*
   *
   */
  destroy: function(){
    var me = this,
      w = me.widget,
      leftBody = w.leftBody,
      body = w.body,
      rightBody = w.rightBody,
      docEl = Fancy.get(document),
      mouseWheelEventName = Fancy.getMouseWheelEventName();

    docEl.un('mouseup', me.onMouseUpDoc, me);
    docEl.un('mousemove', me.onMouseMoveDoc, me);

    leftBody.el.un(mouseWheelEventName, me.onMouseWheel, me);
    body.el.un(mouseWheelEventName, me.onMouseWheel, me);
    rightBody.el.un(mouseWheelEventName, me.onMouseWheel, me);

    me.scrollBottomEl.un('mousedown', me.onMouseDownBottomSpin, me);
    me.scrollRightEl.un('mousedown', me.onMouseDownRightSpin, me);

    if(Fancy.isTouch){
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
  onGridInit: function(){
    var me = this,
      w = me.widget,
      docEl = Fancy.get(document);

    me.setScrollBars();
    docEl.on('mouseup', me.onMouseUpDoc, me);
    docEl.on('mousemove', me.onMouseMoveDoc, me);
    w.on('columnresize', me.onColumnResize, me)
  },
  /*
   *
   */
  render: function(){
    var me = this,
      w = me.widget,
      body = w.body,
      rightScrollEl = Fancy.get(document.createElement('div')),
      bottomScrollEl = Fancy.get(document.createElement('div')),
      right = 1;

    if(w.nativeScroller){
      w.el.addClass('fancy-grid-native-scroller');
    }
    else{
      rightScrollEl.addClass(me.rightScrollCls);

      bottomScrollEl.addClass(me.bottomScrollCls);
      bottomScrollEl.addClass('fancy-display-none');

      rightScrollEl.update([
        '<div class="fancy-scroll-right-inner"></div>'
      ].join(" "));

      rightScrollEl.select('.fancy-scroll-right-inner').css('margin-top', w.knobOffSet);

      bottomScrollEl.update([
        '<div class="fancy-scroll-bottom-inner"></div>'
      ].join(" "));

      Fancy.get(body.el.append(rightScrollEl.dom));
      me.scrollRightEl = body.el.select('.fancy-scroll-right');

      Fancy.get(body.el.append(bottomScrollEl.dom));
      me.scrollBottomEl = body.el.select('.fancy-scroll-bottom');
    }

    me.fire('render');
  },
  /*
   *
   */
  onMouseWheel: function(e){
    var me = this,
      w = me.widget,
      delta = Fancy.getWheelDelta(e.originalEvent || e);

    if(me.isRightScrollable() == false){
      return;
    }

    if(w.stopProp){
      e.stopPropagation();
    }

    if(w.nativeScroller){}
    else{
      if(me.scrollDelta(delta)){
        e.preventDefault();
      }
      me.scrollRightKnob();
    }
  },
  /*
   *
   */
  onRender: function(){
    var me = this,
      w = me.widget;

    if(w.nativeScroller !== true) {
      me.scrollRightEl.hover(function () {
        if (me.bottomKnobDown !== true) {
          me.scrollRightEl.addClass('fancy-scroll-right-hover');
        }
      }, function () {
        me.scrollRightEl.removeClass('fancy-scroll-right-hover');
      });

      me.scrollBottomEl.hover(function () {
        if (me.rightKnobDown !== true) {
          me.scrollBottomEl.addClass('fancy-scroll-bottom-hover');
        }
      }, function () {
        me.scrollBottomEl.removeClass('fancy-scroll-bottom-hover');
      });

      me.initRightScroll();
      me.initBottomScroll();
    }

    if(Fancy.isTouch){
      me.initTouch();
    }
  },
  /*
   *
   */
  initTouch: function(){
    var me = this,
      w = me.widget,
      leftBody = w.leftBody,
      body = w.body,
      rightBody = w.rightBody,
      docEl = Fancy.get(document);

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
  onBodyTouchStart: function(e){
    var me = this,
      e = e.originalEvent || e,
      touchXY = e.changedTouches[0];

    me.rightKnobDown = true;
    me.bottomKnobDown = true;

    me.mouseDownXY = {
      x: touchXY.pageX,
      y: touchXY.pageY
    };

    me.rightKnobTop = parseInt(me.rightKnob.css('margin-top'));
    me.scrollRightEl.addClass('fancy-scroll-right-active');

    me.bottomKnobLeft = parseInt(me.bottomKnob.css('margin-left'));
    me.scrollBottomEl.addClass('fancy-scroll-bottom-active');
  },
  /*
   *
   */
  onBodyTouchEnd: function(){
    var me = this;

    me.onMouseUpDoc();
  },
  /*
   * @param {Object} e
   */
  onBodyTouchMove: function(e){
    var me = this,
      e = e.originalEvent,
      touchXY = e.changedTouches[0];

    if(me.rightKnobDown === true){
      e.preventDefault();
    }

    if(me.bottomKnobDown === true){
      e.preventDefault();
    }

    me.onMouseMoveDoc({
      pageX: touchXY.pageX,
      pageY: touchXY.pageY
    });
  },
  /*
   *
   */
  initRightScroll: function(){
    var me = this,
      w = me.widget,
      docEl = Fancy.get(document);

    me.rightKnob = me.scrollRightEl.select('.fancy-scroll-right-inner');
    me.scrollRightEl.on('mousedown', me.onMouseDownRightSpin, me);
  },
  /*
   *
   */
  initBottomScroll: function(){
    var me = this,
      w = me.widget,
      docEl = Fancy.get(document);

    me.bottomKnob = me.scrollBottomEl.select('.fancy-scroll-bottom-inner');
    me.scrollBottomEl.on('mousedown', me.onMouseDownBottomSpin, me);
  },
  /*
   * @param {Object} e
   */
  onMouseDownRightSpin: function(e){
    var me = this;

    if(Fancy.isTouch){
      return;
    }

    e.preventDefault();

    me.rightKnobDown = true;
    me.mouseDownXY = {
      x: e.pageX,
      y: e.pageY
    };

    me.rightKnobTop = parseInt(me.rightKnob.css('margin-top'));
    me.scrollRightEl.addClass('fancy-scroll-right-active');
  },
  /*
   * @param {Object} e
   */
  onMouseDownBottomSpin: function(e){
    var me = this;

    e.preventDefault();

    me.bottomKnobDown = true;
    me.mouseDownXY = {
      x: e.pageX,
      y: e.pageY
    };

    me.bottomKnobLeft = parseInt(me.bottomKnob.css('margin-left'));
    me.scrollBottomEl.addClass('fancy-scroll-bottom-active');
  },
  /*
   *
   */
  onMouseUpDoc: function(){
    var me = this;

    if(me.rightKnobDown === false && me.bottomKnobDown === false){
      return;
    }

    me.scrollRightEl.removeClass('fancy-scroll-right-active');
    me.scrollBottomEl.removeClass('fancy-scroll-bottom-active');
    me.rightKnobDown = false;
    me.bottomKnobDown = false;
  },
  /*
   *
   */
  onMouseMoveDoc: function(e){
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

    if(me.rightKnobDown) {
      if(Fancy.isTouch){
        deltaY = me.mouseDownXY.y - y;
        marginTop = deltaY + me.rightKnobTop;
      }
      else{
        deltaY = y - me.mouseDownXY.y;
        marginTop = deltaY + me.rightKnobTop;
      }

      if (marginTop < me.knobOffSet) {
        marginTop = me.knobOffSet;
      }

      if (me.bodyViewHeight < marginTop + me.rightKnobHeight) {
        marginTop = me.bodyViewHeight - me.rightKnobHeight;
      }

      if(marginTop < me.rightScrollScale){
        marginTop = 0;
      }

      //me.rightKnob.css('margin-top', (marginTop + knobOffSet) + 'px');
      me.rightKnob.css('margin-top', (marginTop + knobOffSet) + 'px');
      topScroll = me.rightScrollScale * marginTop;

      me.scroll(topScroll);
    }

    if(me.bottomKnobDown){
      if(Fancy.isTouch) {
        deltaX = me.mouseDownXY.x - x;
        deltaY = me.mouseDownXY.y - y;
        marginLeft = deltaX + me.bottomKnobLeft;
      }
      else{
        deltaX = x - me.mouseDownXY.x;
        deltaY = y - me.mouseDownXY.y;
        marginLeft = deltaX + me.bottomKnobLeft;
      }

      if (marginLeft < 1){
        marginLeft = 1;
      }

      if (me.bodyViewWidth - 2 < marginLeft + me.bottomKnobWidth) {
        marginLeft = me.bodyViewWidth - me.bottomKnobWidth - 2;
      }

      if(me.bottomScrollScale < 0 && marginLeft < 0){
        marginLeft = 0;
        me.bottomScrollScale = 0 ;
      }

      me.bottomKnob.css('margin-left', marginLeft + 'px');
      bottomScroll =  me.bottomScrollScale * (marginLeft - 1);
      me.scroll(false, bottomScroll);
    }
  },
  /*
   *
   */
  setScrollBars: function(){
    var me = this,
      w = me.widget;

    me.checkRightScroll();
    if(!me.checkBottomScroll()){
      w.scroll(false, 0);
    }

    if(!w.nativeScroller){
      me.checkCorner();
      me.setRightKnobSize();
      me.setBottomKnobSize();
    }
  },
  /*
   *
   */
  checkRightScroll: function(){
    var me = this,
      w = me.widget,
      body = w.body,
      gridBorders = w.gridBorders,
      bodyViewHeight = w.getBodyHeight(),
      cellsViewHeight = w.getCellsViewHeight() - gridBorders[0] - gridBorders[2];

    if(w.nativeScroller){
      if(bodyViewHeight >= cellsViewHeight){
        body.el.css('overflow-y', 'hidden');
      }
      else {
        body.el.css('overflow-y', 'scroll');
      }
    }
    else {
      if (bodyViewHeight >= cellsViewHeight) {
        me.scrollRightEl.addClass('fancy-display-none');
      }
      else {
        me.scrollRightEl.removeClass('fancy-display-none');
      }
    }
  },
  /*
   *
   */
  isRightScrollable: function(){
    var me = this,
      w = me.widget;

    if(w.nativeScroller){
      return w.body.el.css('overflow-y') === 'scroll';
    }

    return !me.scrollRightEl.hasClass('fancy-display-none');
  },
  /*
   *
   */
  setRightKnobSize: function(){
    var me = this,
      w = me.widget,
      bodyViewHeight = w.getBodyHeight() - (me.corner ? me.cornerSize : 0) - 2,
      cellsViewHeight = w.getCellsViewHeight() - (me.corner ? me.cornerSize : 0),
      scrollRightPath = cellsViewHeight - bodyViewHeight,
      percents = 100 - scrollRightPath/(bodyViewHeight/100),
      knobHeight = bodyViewHeight * (percents/100),
      knobOffSet = w.knobOffSet;

    if(knobHeight < me.minRightKnobHeight){
      knobHeight = me.minRightKnobHeight;
    }

    if(me.corner === false){
      bodyViewHeight -= knobOffSet;
    }

    me.rightKnob.css('height', knobHeight + 'px');
    me.rightKnobHeight = knobHeight;
    me.bodyViewHeight = bodyViewHeight;
    me.rightScrollScale = (cellsViewHeight - bodyViewHeight)/(bodyViewHeight - knobHeight);
  },
  /*
   *
   */
  checkBottomScroll: function(){
    var me = this,
      w = me.widget,
      body = w.body,
      centerViewWidth = w.getCenterViewWidth(),
      centerFullWidth = w.getCenterFullWidth() - 2,
      showBottomScroll;

    if(w.nativeScroller){
      if (centerViewWidth > centerFullWidth) {
        showBottomScroll = false;
        body.el.css('overflow-x', 'hidden');
      }
      else{
        showBottomScroll = true;
        body.el.css('overflow-x', 'scroll');
      }
    }
    else {
      if (centerViewWidth > centerFullWidth) {
        showBottomScroll = false;
        me.scrollBottomEl.addClass('fancy-display-none');
      }
      else {
        showBottomScroll = true;
        me.scrollBottomEl.removeClass('fancy-display-none');
      }
    }

    return showBottomScroll;
  },
  /*
   *
   */
  checkCorner: function(){
    var me = this;

    me.corner = !me.scrollRightEl.hasClass('fancy-display-none') && !me.scrollBottomEl.hasClass('fancy-display-none');
  },
  /*
   *
   */
  setBottomKnobSize: function(){
    var me = this,
      w = me.widget,
      centerViewWidth = w.getCenterViewWidth() - (me.corner ? me.cornerSize : 0),
      centerFullWidth = w.getCenterFullWidth() - (me.corner ? me.cornerSize : 0),
      scrollBottomPath = centerFullWidth - centerViewWidth,
      percents = 100 - scrollBottomPath/(centerFullWidth/100),
      knobWidth = centerViewWidth * (percents/100) - 2;

    if(knobWidth < me.minBottomKnobWidth){
      knobWidth = me.minBottomKnobWidth;
    }

    me.bottomKnob.css('width', knobWidth + 'px');
    me.bottomKnobWidth = knobWidth;
    me.bodyViewWidth = centerViewWidth;
    me.bottomScrollScale = (centerViewWidth - centerFullWidth)/(centerViewWidth - knobWidth - 2 - 1);
  },
  /*
   * @param {Number} y
   * @param {Number} x
   */
  scroll: function(y, x){
    var me = this,
      w = me.widget,
      scrollInfo;

    if(w.nativeScroller){
      if(y !== null && y !== undefined) {
        w.body.el.dom.scrollTop = y;
      }

      if(x!== null && x !== undefined){
        w.body.el.dom.scrollLeft = x;
        if(w.header) {
          w.header.scroll(x);
        }
      }

      w.fire('scroll');
      return
    }

    w.leftBody.scroll(y);
    scrollInfo = w.body.scroll(y, x);
    w.rightBody.scroll(y);

    if(scrollInfo.scrollTop !== undefined){
      me.scrollTop = Math.abs(scrollInfo.scrollTop);
    }

    if(scrollInfo.scrollLeft !== undefined){
      me.scrollLeft = Math.abs(scrollInfo.scrollLeft);
    }

    w.fire('scroll');
  },
  /*
   * @param {Number} value
   */
  scrollDelta: function(value){
    var me = this,
      w = me.widget,
      scrollInfo,
      scrolled = true;

    w.leftBody.wheelScroll(value);
    scrollInfo = w.body.wheelScroll(value);
    w.rightBody.wheelScroll(value);

    me.scrollTop = Math.abs(scrollInfo.newScroll);
    me.scrollLeft = Math.abs(scrollInfo.scrollLeft);

    w.fire('scroll');

    return scrollInfo.scrolled;
  },
  /*
   *
   */
  scrollRightKnob: function(){
    var me = this,
      w = me.widget,
      bodyScrolled = me.getScroll(),
      newKnobScroll = bodyScrolled/me.rightScrollScale + w.knobOffSet;

    if(!me.rightKnob){
      return;
    }

    me.rightKnob.css('margin-top', newKnobScroll + 'px');
  },
  /*
   *
   */
  scrollBottomKnob: function(){
    var me = this,
      w = me.widget,
      scrolled = me.getBottomScroll(),
      newKnobScroll = scrolled/me.bottomScrollScale + w.knobOffSet;

    if(scrolled === 0){
      newKnobScroll = -1;
    }

    if(!me.bottomKnob){
      return;
    }

    me.bottomKnob.css('margin-left', -newKnobScroll + 'px');
  },
  /*
   *
   */
  getScroll: function(){
    var me = this,
      w = me.widget;

    return Math.abs(parseInt(w.body.el.select('.fancy-grid-column').item(0).css('top')));
  },
  /*
   *
   */
  getBottomScroll: function(){
    var me = this,
      w = me.widget;

    return Math.abs(parseInt(w.body.el.select('.fancy-grid-column').item(0).css('left')));
  },
  /*
   *
   */
  update: function(){
    var me = this,
      w = me.widget;

    me.setScrollBars();
    me.checkScroll();
  },
  /*
   *
   */
  onChangeStore: function(){
    var me = this;

    me.setScrollBars();
    me.checkScroll();
  },
  /*
   *
   */
  onColumnResize: function(){
    var me = this;

    me.setScrollBars();
  },
  /*
   *
   */
  checkScroll: function(){
    var me = this,
      w = me.widget,
      rightScrolled = me.getScroll(),
      bodyViewHeight = w.getBodyHeight() - (me.corner ? me.cornerSize : 0),
      cellsViewHeight = w.getCellsViewHeight() - (me.corner ? me.cornerSize : 0);

    if(rightScrolled && cellsViewHeight < bodyViewHeight){
      me.scroll(0);
      if(!w.nativeScroller){
        me.scrollRightKnob();
      }
    }
  },
  /*
   * @param {Fancy.Element} cell
   */
  scrollToCell: function(cell){
    var me = this,
      w = me.widget,
      cellHeight = w.cellHeight,
      cellEl = Fancy.get(cell),
      columnEl = cellEl.parent(),
      rowIndex = Number(cellEl.attr('index')),
      columnIndex = Number(columnEl.attr('index')),
      rightScroll = me.getScroll(),
      passedHeight = cellHeight * (rowIndex + 1),
      bodyViewHeight = w.getBodyHeight(),
      bottomScroll = me.getBottomScroll(),
      bodyViewWidth = parseInt(w.body.el.css('width')),
      passedWidth = 0,
      isCenterBody = columnEl.parent().parent().hasClass('fancy-grid-center');

    if(rowIndex === 0 && columnIndex === 0){
      me.scroll(0, 0);
      me.scrollBottomKnob();
      me.scrollRightKnob();

      return;
    }

    if(passedHeight - rightScroll > bodyViewHeight){
      rightScroll += cellHeight;
      me.scroll(rightScroll);
    }

    if(isCenterBody){
      var columns = w.columns,
        i = 0,
        iL = columns.length;

      for(;i<=columnIndex;i++){
        passedWidth += columns[i].width;
      }

      if(passedWidth - bottomScroll > bodyViewWidth){
        if(!columns[i]){
          me.scroll(rightScroll, -(passedWidth - bottomScroll - bodyViewWidth));
        }
        else{
          me.scroll(rightScroll, -(bottomScroll + columns[i - 1].width));
        }
      }
      else if(bottomScroll !== 0){
        if(columnIndex === 0) {
          me.scroll(rightScroll, 0);
        }
      }

      me.scrollBottomKnob();
    }

    me.scrollRightKnob();
  },
  onNativeScrollBody: function(){
    var me = this,
      w = me.widget,
      scrollTop = w.body.el.dom.scrollTop,
      scrollLeft = w.body.el.dom.scrollLeft;

    if(w.header) {
      w.header.scroll(-scrollLeft);
    }

    if(w.leftBody){
      w.leftBody.el.dom.scrollTop = scrollTop;
    }

    if(w.rightBody){
      w.rightBody.el.dom.scrollTop = scrollTop;
    }
  },
  onMouseWheelLeft: function(e){
    var me = this,
      w = me.widget,
      delta = Fancy.getWheelDelta(e.originalEvent || e),
      scrollTop = delta * w.cellHeight;

    w.leftBody.el.dom.scrollTop -= scrollTop;
    w.body.el.dom.scrollTop -= scrollTop;
    w.rightBody.el.dom.scrollTop -= scrollTop;
  },
  onMouseWheelRight: function(e){
    var me = this,
      w = me.widget,
      delta = Fancy.getWheelDelta(e.originalEvent || e),
      scrollTop = delta * w.cellHeight;

    w.leftBody.el.dom.scrollTop -= scrollTop;
    w.body.el.dom.scrollTop -= scrollTop;
    w.rightBody.el.dom.scrollTop -= scrollTop;
  }
});