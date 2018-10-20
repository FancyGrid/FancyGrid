/*
 * @class Fancy.Bar
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_CLS = F.GRID_CLS;
  var GRID_CELL_CLS = F.GRID_CELL_CLS;

  var BAR_CLS = F.BAR_CLS;
  var BAR_CONTAINER_CLS = F.BAR_CONTAINER_CLS;
  var BAR_BUTTON_CLS = F.BAR_BUTTON_CLS;
  var BAR_SEG_BUTTON_CLS = F.BAR_SEG_BUTTON_CLS;
  var BAR_LEFT_SCROLLER_CLS = F.BAR_LEFT_SCROLLER_CLS;
  var BAR_RIGHT_SCROLLER_CLS = F.BAR_RIGHT_SCROLLER_CLS;

  var FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  var FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;
  var FIELD_TEXT_INPUT_CLS = F.FIELD_TEXT_INPUT_CLS;
  var FIELD_SEARCH_CLS = F.FIELD_SEARCH_CLS;
  var FIELD_SEARCH_LIST_CLS = F.FIELD_SEARCH_LIST_CLS;
  var FIELD_SEARCH_PARAMS_LINK_CLS = F.FIELD_SEARCH_PARAMS_LINK_CLS;
  var FIELD_SEARCH_PARAMED_CLS = F.FIELD_SEARCH_PARAMED_CLS;
  var FIELD_SEARCH_PARAMED_EMPTY_CLS = F.FIELD_SEARCH_PARAMED_EMPTY_CLS;

  var PICKER_MONTH_ACTION_BUTTONS_CLS = F.PICKER_MONTH_ACTION_BUTTONS_CLS;
  var CLEARFIX_CLS = F.CLEARFIX_CLS;

  F.define('Fancy.Bar', {
    extend: F.Widget,
    widgetCls: BAR_CLS,
    containerCls: BAR_CONTAINER_CLS,
    cls: '',
    text: '',
    floating: 'left',
    sideRight: 3,
    scrolled: 0,
    tabOffSet: 5,
    tabScrollStep: 50,
    barScrollEnabled: true,
    /*
     * constructor
     * @param {Object} config
     */
    constructor: function (config) {
      F.apply(this, config);
      this.init();
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.roles = {};
      me.render();

      if (me.barScrollEnabled) {
        me.initScroll();
        setTimeout(function () {
          me.checkScroll();
        }, 150);
      }
    },
    /*
     *
     */
    render: function () {
      var me = this;

      me.renderEl();
      me.renderItems();
      me.initTabEdit();
    },
    /*
     *
     */
    renderEl: function () {
      var me = this;

      if (!me.el) {
        var el = F.get(document.createElement('div'));

        el.addCls(
          me.widgetCls,
          me.cls
        );

        el.update(me.text);

        me.el = F.get(me.renderTo.appendChild(el.dom));

        if (me.style) {
          me.el.css(me.style);
        }
      }

      var containerEl = F.get(document.createElement('div'));
      containerEl.addCls(me.containerCls);

      me.containerEl = F.get(me.el.dom.appendChild(containerEl.dom));
    },
    /*
     *
     */
    renderItems: function () {
      var me = this,
        containerEl = me.containerEl,
        items = me.items || [],
        i = 0,
        iL = items.length,
        isSide = false,
        barItems = [],
        sidePassed = iL - 1,
        passedRight = 0;

      for (; i < iL; i++) {
        var item = items[i];

        if (isSide) {
          item = items[sidePassed];
          sidePassed--;
        }

        if (item.toggleGroup) {
          item.enableToggle = true;
        }

        if (F.isObject(item)) {
          item.type = item.type || 'button';
        }

        if (isSide) {
          me.floating = 'right';
          item.style = item.style || {};
          item.style['right'] = passedRight;
        }

        item.renderTo = containerEl.dom;

        switch (item) {
          case '|':
            var style = {
              'float': me.floating,
              'margin-right': '5px',
              'margin-top': '6px',
              'padding-left': '0px'
            };

            if (me.floating === 'right') {
              F.applyIf(style, {
                right: '1px',
                position: 'absolute'
              });
            }

            barItems.push(new F.Separator({
              //renderTo: el.dom,
              renderTo: containerEl.dom,
              style: style
            }));
            continue;
          case 'side':
            isSide = true;
            continue;
          default:
            if (isSide) {
              barItems[sidePassed] = me.renderItem(item);
            }
            else {
              barItems.push(me.renderItem(item));
            }
        }

        if(isSide){
          //TODO: redo with variable
          //Needs variable charWidth from theme
          //Possible place of bug: wrong right value.
          if(item.text){
            passedRight += item.text.length * 7 + 5 + 5 + 5;
          }
          else if(item.width){
            passedRight += item.width + 5;
          }

          if(item.imageCls){
            if(item.imageWidth){
              passedRight += item.imageWidth;
            }
            else{
              passedRight += 20;
            }
          }

          passedRight += 3;
        }
      }

      me.items = barItems;
    },
    /*
     * @param {Object} item
     * @return {Object}
     */
    renderItem: function (item) {
      var me = this,
        field,
        containerEl = me.containerEl,
        theme = me.theme;

      item.style = item.style || {};
      item.label = false;
      item.padding = false;
      item.theme = me.theme;

      F.applyIf(item.style, {
        'float': me.floating
      });

      if (me.floating === 'right') {
        F.applyIf(item.style, {
          right: me.sideRight,
          position: 'absolute'
        });
      }

      if (!item.scope && me.scope) {
        item.scope = me.scope;
      }

      switch (item.type) {
        case 'wrapper':
          if (item.cls === PICKER_MONTH_ACTION_BUTTONS_CLS) {
            containerEl.destroy();
            containerEl = me.el;
          }

          var renderTo = containerEl.append('<div class="' + (item.cls || '') + '"></div>').select('div').item(0),
            i = 0,
            iL = item.items.length,
            _item,
            width = 0;

          for (; i < iL; i++) {
            _item = item.items[i];

            if (F.isObject(_item)) {
              _item.type = _item.type || 'button';
            }

            _item.renderTo = renderTo.dom;
            field = me.renderItem(_item);
            var fieldEl = field.el;

            if (i === iL - 1) {
              fieldEl.css('margin-right', '0px');
            }
            else {
              width += parseInt(fieldEl.css('margin-right'));
            }

            if (F.nojQuery) {
              width += parseInt(fieldEl.width());
            }
            else {
              width += parseInt(fieldEl.$dom.outerWidth());
            }

            width += parseInt(fieldEl.css('margin-left'));

            //width += parseInt(fieldEl.css('padding-left'));
            //width += parseInt(fieldEl.css('padding-right'));
          }

          renderTo.css('width', width);

          break;
        case undefined:
        case 'button':
          item.extraCls = BAR_BUTTON_CLS;
          item.scope = item.scope || me.scope;

          field = new F.Button(item);
          break;
        case 'segbutton':
          item.extraCls = BAR_SEG_BUTTON_CLS;

          F.applyIf(item.style, {
            'margin-right': '6px'
          });

          field = new F.SegButton(item);
          break;
        case 'tab':
          field = new F.toolbar.Tab(item);
          break;
        case 'text':
          F.applyIf(item.style, {
            'margin-right': '10px',
            'padding-left': '0px',
            'padding-top': '11px'
          });

          F.apply(item, {
            renderTo: containerEl.dom,
            cls: item.cls || ''
          });

          field = new F.bar.Text(item);
          break;
        case 'combo':
          item.inputWidth = 18;

          F.applyIf(item.style, {
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          F.applyIf(item, {
            width: 70
          });

          field = new F.Combo(item);
          break;
        case 'date':
          item.inputWidth = 18;

          F.applyIf(item.style, {
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          F.applyIf(item, {
            width: 100
          });

          field = new F.DateField(item);

          break;
        case 'number':
          item.inputWidth = 18;

          F.applyIf(item.style, {
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          F.applyIf(item, {
            width: 35
          });

          field = new F.NumberField(item);

          break;
        case 'checkbox':
          F.applyIf(item.style, {
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          field = new F.CheckBox(item);

          break;
        case 'switcher':
          F.applyIf(item.style, {
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          F.applyIf(item, {
            width: 35
          });

          field = new F.Switcher(item);

          break;
        case 'string':
          item.inputWidth = 18;

          F.applyIf(item.style, {
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          F.applyIf(item, {
            width: 100
          });

          field = new F.StringField(item);
          break;
        case 'search':
          item.inputWidth = 18;

          item.events = item.events || [];

          item.events = item.events.concat([{
            enter: function (field, value) {
              var grid = F.getWidget(field.el.parent().parent().parent().parent().select('.' + GRID_CLS).item(0).attr('id'));

              //this.search(['name', 'surname', 'position'], value);
              //this.search(value);
              //this.search(['a', 'b', 'c']);
              grid.search(value);
              if(grid.expander){
                grid.expander.reSet();
              }
            }
          }, {
            key: function (field, value) {
              var me = this,
                grid = F.getWidget(field.el.parent().parent().parent().parent().select('.' + GRID_CLS).item(0).attr('id'));

              if(grid.filter && grid.filter.autoEnterDelay === false){
                return;
              }

              if (!me.autoEnterTime) {
                me.autoEnterTime = new Date();
              }

              if (me.intervalAutoEnter) {
                clearInterval(me.intervalAutoEnter);
              }
              delete me.intervalAutoEnter;

              me.intervalAutoEnter = setInterval(function () {
                var now = new Date();

                if (now - me.autoEnterTime > 500) {
                  clearInterval(me.intervalAutoEnter);
                  delete me.intervalAutoEnter;
                  value = field.getValue();

                  grid.search(value);

                  if(grid.expander){
                    grid.expander.reSet();
                  }
                }
              }, 200);
            }
          }, {
            render: function (field) {
              var me = this,
                isIn = false;

              field.el.on('mouseenter', function () {
                isIn = true;
              }, null, '.' + FIELD_SEARCH_PARAMS_LINK_CLS);

              field.el.on('mousedown', function (e) {
                e.preventDefault();
              }, null, '.' + FIELD_SEARCH_PARAMS_LINK_CLS);

              field.el.on('click', function (e) {
                var toShow = false,
                  grid = F.getWidget(field.el.parent().parent().parent().parent().select('.' + GRID_CLS).attr('id')),
                  columns = grid.columns || [],
                  leftColumns = grid.leftColumns || [],
                  rightColumns = grid.rightColumns || [],
                  _columns = columns.concat(leftColumns).concat(rightColumns),
                  items = [],
                  i = 0,
                  iL = _columns.length,
                  height = 1;

                if(grid.searching.items){
                  F.each(grid.searching.items, function (item) {
                    items.push({
                      inputLabel: ' &nbsp;&nbsp;' + item.text,
                      value: true,
                      name: item.index
                    });

                    height += grid.fieldHeight;
                  })
                }
                else {
                  for (; i < iL; i++) {
                    var column = _columns[i],
                      title = column.title;

                    if (title === undefined) {
                      title = '';
                    }

                    if (column.searchable === false) {
                      continue;
                    }

                    switch (column.type) {
                      case 'color':
                      case 'combo':
                      case 'date':
                      case 'number':
                      case 'string':
                      case 'text':
                      case 'currency':
                        break;
                      default:
                        continue;
                    }

                    height += grid.fieldHeight;

                    items.push({
                      inputLabel: ' &nbsp;&nbsp;' + title,
                      value: true,
                      name: column.index
                    });
                  }
                }

                if (!me.list) {
                  me.list = new FancyForm({
                    width: 150,
                    height: height,
                    theme: theme,
                    defaults: {
                      type: 'checkbox',
                      label: false,
                      style: {
                        padding: '8px 16px 0px'
                      }
                    },
                    items: items,
                    cls: FIELD_SEARCH_LIST_CLS,
                    events: [{
                      set: function () {
                        grid.searching.setKeys(me.list.get());
                      }
                    }, {
                      init: function () {
                        setTimeout(function () {
                          var listEl = me.list.el;

                          listEl.on('mouseenter', function () {
                            isIn = true;
                          });

                          listEl.on('mouseleave', function () {
                            isIn = false;
                            setTimeout(function () {
                              if (isIn === false) {
                                if (me.list) {
                                  listEl.css('display', 'none');
                                }
                              }
                            }, 750);
                          });

                          var el = F.get(e.target),
                            offset = el.offset(),
                            fieldHeight = parseInt(field.el.css('height'));

                          listEl.css({
                            position: 'absolute',
                            top: offset.top + fieldHeight + 20,
                            left: offset.left
                          });

                          me.list.el.css('display', 'block');

                          listEl.animate({
                            duration: 200,
                            top: offset.top + fieldHeight - 1
                          });
                        }, 50);
                      }

                    }]
                  });
                }
                else if (me.list.el.css('display') !== 'none') {
                  me.list.el.css('display', 'none');
                  return;
                }
                else {
                  toShow = true;
                }

                var el = F.get(e.target),
                  offset = el.offset(),
                  fieldHeight = parseInt(field.el.css('height'));

                if (me.list && me.list.el) {
                  me.list.css({
                    position: 'absolute',
                    top: offset.top + fieldHeight + 20,
                    left: offset.left
                  });

                  if (toShow) {
                    me.list.css('display', 'block');
                  }

                  me.list.el.animate({
                    duration: 200,
                    top: offset.top + fieldHeight - 1
                  });
                }
              }, null, '.' + FIELD_SEARCH_PARAMS_LINK_CLS);

              field.el.on('mouseleave', function () {
                isIn = false;
                setTimeout(function () {
                  if (isIn === false) {
                    if (me.list) {
                      me.list.el.css('display', 'none');
                    }
                  }
                }, 750);
              }, null, '.' + FIELD_SEARCH_PARAMS_LINK_CLS)
            }
          }]);

          F.applyIf(item.style, {
            'float': me.floating,
            'padding-left': '0px',
            'margin-right': '8px',
            'margin-top': '4px'
          });

          var cls = FIELD_SEARCH_CLS;

          if (item.paramsMenu) {
            item.tpl = [
              '<div class="' + FIELD_LABEL_CLS + '" style="{labelWidth}{labelDisplay}">',
              '{label}',
              '</div>',
              '<div class="' + FIELD_TEXT_CLS + '">',
              '<input placeholder="{emptyText}" class="' + FIELD_TEXT_INPUT_CLS + '" style="{inputWidth}" value="{value}">',
              '<div class="' + FIELD_SEARCH_PARAMS_LINK_CLS + '" style="">' + (item.paramsText || '&nbsp;') + '</div>',
              '</div>',
              '<div class="' + CLEARFIX_CLS + '"></div>'
            ];

            cls += ' ' + FIELD_SEARCH_PARAMED_CLS;
            if (!item.paramsText) {
              cls += ' ' + FIELD_SEARCH_PARAMED_EMPTY_CLS;
            }
          }

          F.applyIf(item, {
            padding: false,
            width: 250,
            cls: cls,
            emptyText: 'Search'
          });

          field = new F.StringField(item);
          break;
        default:
      }

      if (me.floating === 'right') {
        me.sideRight += field.width;
        me.sideRight += 7;
      }

      if (item.role) {
        me.roles[item.role] = field;
      }

      return field;
    },
    /*
     *
     */
    initScroll: function () {
      var me = this;

      me.leftScroller = new F.Button({
        imageCls: true,
        renderTo: me.el.dom,
        cls: BAR_LEFT_SCROLLER_CLS,
        height: me.height + 2,
        minWidth: 20,
        paddingTextWidth: 0,
        imageWidth: 20,
        width: 0,
        text: false,
        style: {
          position: 'absolute',
          left: -1,
          top: -1,
          display: 'none'
        },
        listeners: [{
          click: me.onPrevScrollClick,
          scope: me
        }]
      });

      me.rightScroller = new F.Button({
        imageCls: true,
        renderTo: me.el.dom,
        cls: BAR_RIGHT_SCROLLER_CLS,
        height: me.height + 2,
        minWidth: 20,
        paddingTextWidth: 0,
        imageWidth: 20,
        width: 0,
        text: false,
        style: {
          position: 'absolute',
          right: -1,
          top: -1,
          display: 'none'
        },
        listeners: [{
          click: me.onNextScrollClick,
          scope: me
        }]
      });
    },
    /*
     * @return {Number}
     */
    getBarWidth: function () {
      return parseInt(this.el.css('width'));
    },
    /*
     * @return {Number}
     */
    getItemsWidth: function () {
      var width = 0;

      F.each(this.items, function (item) {
        if(item.el.css('display') === 'none' ){
          return;
        }

        width += item.el.width();
        width += parseInt(item.el.css('margin-left'));
        width += parseInt(item.el.css('margin-right'));
        width += parseInt(item.el.css('padding-right'));
        width += parseInt(item.el.css('padding-left'));
      });

      return width;
    },
    /*
     *
     */
    onPrevScrollClick: function () {
      this.scrolled += this.tabScrollStep;
      this.applyScrollChanges();
    },
    /*
     *
     */
    onNextScrollClick: function () {
      this.scrolled -= this.tabScrollStep;
      this.applyScrollChanges();
    },
    /*
     *
     */
    applyScrollChanges: function () {
      var me = this,
        itemsWidth = me.getItemsWidth(),
        barWidth = me.getBarWidth() - parseInt(me.leftScroller.el.css('width')) - parseInt(me.rightScroller.el.css('width')),
        scrollPath = itemsWidth - barWidth;

      if (itemsWidth < barWidth) {
        me.scrolled = 0;

        me.leftScroller.el.hide();
        me.rightScroller.el.hide();

        me.containerEl.animate({'margin-left': '0px'}, F.ANIMATE_DURATION);
        //me.containerEl.css('margin-left', '0px');

        return;
      }
      else if (me.scrolled > 0) {
        me.scrolled = 0;
        me.leftScroller.disable();
        me.rightScroller.enable();
      }
      else if (me.scrolled < -scrollPath) {
        me.scrolled = -scrollPath;
        me.leftScroller.enable();
        me.rightScroller.disable();
      }

      me.leftScroller.el.show();
      me.rightScroller.el.show();

      //me.containerEl.css('margin-left', (me.scrolled + me.leftScroller.el.width() + me.tabOffSet) + 'px');
      me.containerEl.animate({'margin-left': (me.scrolled + me.leftScroller.el.width() + me.tabOffSet) + 'px'}, F.ANIMATE_DURATION);
    },
    /*
     *
     */
    onDocMouseUp: function () {
      var me = this;

      if (me.scrollInterval) {
        clearTimeout(me.scrollInterval);
        delete me.scrollInterval;
      }
    },
    /*
     *
     */
    checkScroll: function () {
      var me = this,
        itemsWidth = me.getItemsWidth(),
        barWidth = me.getBarWidth();

      if (me.disableScroll) {
        return;
      }

      if (itemsWidth > barWidth) {
        me.enableScroll();
      }
      else if(me.barScrollEnabled) {
        me.leftScroller.el.hide();
        me.rightScroller.el.hide();
      }
    },
    /*
     *
     */
    enableScroll: function () {
      var me = this;

      if(!me.barScrollEnabled){
        return;
      }

      me.leftScroller.el.show();
      me.rightScroller.el.show();

      if (me.scrolled === 0) {
        me.leftScroller.disable();
        me.containerEl.css('margin-left', (me.leftScroller.el.width() + me.tabOffSet) + 'px');
      }
    },
    /*
     *
     */
    initTabEdit: function () {
      var me = this;

      if (!me.tabEdit) {
        return;
      }

      var i = me.items.length - 1;

      for (; i > -1; i--) {
        var item = me.items[i];

        switch (item.type) {
          case 'number':
          case 'string':
          case 'date':
            item.on('tab', me.onTabLastInput, me);
            return;
        }
      }
    },
    /*
     * @param {Object} field
     * @param {Object} e
     */
    onTabLastInput: function (field, e) {
      var me = this,
        grid = F.getWidget(me.el.parent().select('.' + GRID_CLS).attr('id'));

      //NOTE: setTimeout to fix strange bug. It runs second second cell without it.
      e.preventDefault();

      if (grid.leftColumns.length) {
        setTimeout(function () {
          grid.leftBody.el.select('.' + GRID_CELL_CLS).item(0).dom.click();
        }, 100);
      }
      else {
        setTimeout(function () {
          grid.body.el.select('.' + GRID_CELL_CLS).item(0).dom.click();
        }, 100);
      }
    }
  });

})();