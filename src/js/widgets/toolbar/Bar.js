/*
 * @class Fancy.Bar
 * @extends Fancy.Widget
 */
Fancy.define('Fancy.Bar', {
  extend: Fancy.Widget,
  widgetCls: 'fancy-bar',
  containerCls: 'fancy-bar-container',
  cls: '',
  text: '',
  floating: 'left',
  sideRight: 0,
  scrolled: 0,
  tabOffSet: 5,
  barScrollEnabled: true,
  /*
   * constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);

    me.init();
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.roles = {};
    me.render();

    if(me.barScrollEnabled){
      me.initScroll();
      setTimeout(function(){
        me.checkScroll();
      }, 50);
    }
  },
  /*
   *
   */
  render: function(){
    var me = this;

    me.renderEl();
    me.renderItems();
    me.initTabEdit();
  },
  /*
   *
   */
  renderEl: function(){
    var me = this;

    if(!me.el){
      var el = Fancy.get(document.createElement('div'));

      el.addCls(me.widgetCls, me.cls);
      el.update(me.text);

      me.el = Fancy.get(me.renderTo.appendChild(el.dom));

      if(me.style){
        me.el.css(me.style);
      }
    }

    var containerEl = Fancy.get(document.createElement('div'));
    containerEl.addCls(me.containerCls);

    me.containerEl = Fancy.get(me.el.dom.appendChild(containerEl.dom));
  },
  /*
   *
   */
  renderItems: function(){
    var me = this,
      containerEl = me.containerEl,
      items = me.items || [],
      i = 0,
      iL = items.length,
      isSide = false,
      barItems = [],
      sidePassed = iL - 1;

    for(;i<iL;i++){
      var item = items[i];

      if(isSide){
        item = items[sidePassed];
        sidePassed--;
      }

      if(item.toggleGroup){
        item.enableToggle = true;
      }

      if(Fancy.isObject(item)){
        item.type = item.type || 'button';
      }

      if (isSide) {
        me.floating = 'right';
      }

      //item.renderTo = el.dom;
      item.renderTo = containerEl.dom;

      switch (item) {
        case '|':
          var style = {
            'float': me.floating,
            'margin-right': '5px',
            'margin-top': '6px',
            'padding-left': '0px'
          };

          if(me.floating === 'right'){
            Fancy.applyIf(style, {
              right: '1px',
              position: 'absolute'
            });
          }

          barItems.push(new Fancy.Separator({
            //renderTo: el.dom,
            renderTo: containerEl.dom,
            style: style
          }));
          continue;
          break;
        case 'side':
          isSide = true;
          continue;
          break;
        default:
          if(isSide){
            barItems[sidePassed] = me.renderItem(item);
          }
          else {
            barItems.push( me.renderItem(item) );
          }
      }
    }

    me.items = barItems;
  },
  /*
   * @param {Object} item
   * @return {Object}
   */
  renderItem: function(item){
    var me = this,
      field,
      containerEl = me.containerEl,
      theme = me.theme;

    item.style = item.style || {};
    item.label = false;
    item.padding = false;

    Fancy.applyIf(item.style, {
      'float': me.floating
    });

    if(me.floating === 'right'){
      Fancy.applyIf(item.style, {
        right: me.sideRight,
        position: 'absolute'
      });
    }

    if(!item.scope && me.items){
      item.scope = me.items[0];
    }

    switch(item.type){
      case 'wrapper':
        if(item.cls === 'fancy-month-picker-action-buttons'){
          containerEl.destroy();
          containerEl = me.el;
        }

        var renderTo = containerEl.append('<div class="'+(item.cls || '')+'"></div>').select('div').item(0),
          i = 0,
          iL = item.items.length,
          _item,
          width = 0;

        for(;i<iL;i++){
          _item = item.items[i];

          if(Fancy.isObject(_item)){
            _item.type = _item.type || 'button';
          }

          _item.renderTo = renderTo.dom;
          field = me.renderItem(_item);
          var fieldEl = field.el;

          if(i === iL - 1){
            fieldEl.css('margin-right', '0px');
          }
          else{
            width += parseInt(fieldEl.css('margin-right'));
          }

          if(Fancy.nojQuery){
            width += parseInt(fieldEl.width());
            width += parseInt(fieldEl.css('margin-left'));
          }
          else{
            width += parseInt(fieldEl.$dom.outerWidth());
          }

          width += parseInt(fieldEl.css('padding-left'));
          width += parseInt(fieldEl.css('padding-right'));
        }

        renderTo.css('width', width);

        break;
      case undefined:
      case 'button':
        item.extraCls = 'fancy-bar-button';

        item.scope = me.scope;

        field = new Fancy.Button(item);
        break;
      case 'segbutton':
        item.extraCls = 'fancy-bar-seg-button';

        Fancy.applyIf(item.style, {
          'margin-right': '6px'
        });

        field = new Fancy.SegButton(item);
        break;
      case 'tab':
        field = new Fancy.toolbar.Tab(item);
        break;
      case 'text':
        Fancy.applyIf(item.style, {
          'margin-right': '10px',
          'padding-left': '0px',
          'padding-top': '11px'
        });

        Fancy.apply(item, {
          renderTo: containerEl.dom,
          cls: item.cls || ''
        });

        field = new Fancy.bar.Text(item);
        break;
      case 'combo':
        item.inputWidth = 18;

        Fancy.applyIf(item.style, {
          'padding-left': '0px',
          'margin-right': '8px',
          'margin-top': '4px'
        });

        Fancy.applyIf(item, {
          width: 70
        });

        field = new Fancy.Combo(item);
        break;
      case 'date':
        item.inputWidth = 18;

        Fancy.applyIf(item.style, {
          'padding-left': '0px',
          'margin-right': '8px',
          'margin-top': '4px'
        });

        Fancy.applyIf(item, {
          width: 100
        });

        field = new Fancy.DateField(item);

        break;
      case 'number':
        item.inputWidth = 18;

        Fancy.applyIf(item.style, {
          'padding-left': '0px',
          'margin-right': '8px',
          'margin-top': '4px'
        });

        Fancy.applyIf(item, {
          width: 35
        });

        field = new Fancy.NumberField(item);

        break;
      case 'switcher':
        Fancy.applyIf(item.style, {
          'padding-left': '0px',
          'margin-right': '8px',
          'margin-top': '4px'
        });

        Fancy.applyIf(item, {
          width: 35
        });

        field = new Fancy.Switcher(item);

        break;
      case 'string':
        item.inputWidth = 18;

        Fancy.applyIf(item.style, {
          'padding-left': '0px',
          'margin-right': '8px',
          'margin-top': '4px'
        });

        Fancy.applyIf(item, {
          width: 100
        });

        field = new Fancy.StringField(item);
        break;
      case 'search':
        item.inputWidth = 18;

        item.events = item.events || [];

        item.events = item.events.concat([{
          enter: function(field, value){
            var grid = Fancy.getWidget( field.el.parent().parent().parent().parent().select('.' + Fancy.gridCls).attr('id') );
            //this.search(['name', 'surname', 'position'], value);
            //this.search(value);
            //this.search(['a', 'b', 'c']);
            grid.search(value);
          }
        }, {
          key: function (field, value) {
            var me = this,
              grid = Fancy.getWidget(field.el.parent().parent().parent().parent().select('.' + Fancy.gridCls).attr('id'));

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
              }
            }, 200);
          }
        },{
          render: function(field){
            var me = this,
              isIn = false;

            field.el.on('mouseenter', function(){
              isIn = true;
            }, null, '.fancy-field-search-params-link');

            field.el.on('mousedown', function(e){
              e.preventDefault();
            }, null, '.fancy-field-search-params-link');

            field.el.on('click', function(e){
              var toShow = false,
                grid = Fancy.getWidget(field.el.parent().parent().parent().parent().select('.' + Fancy.gridCls).attr('id')),
                columns = grid.columns || [],
                leftColumns = grid.leftColumns || [],
                rightColumns = grid.rightColumns || [],
                _columns = columns.concat(leftColumns).concat(rightColumns),
                items = [],
                i = 0,
                iL = _columns.length,
                height = 1;

              for(;i<iL;i++){
                var column = _columns[i],
                  title = column.title;

                if(title === undefined){
                  title = '';
                }

                if(column.searchable === false){
                  continue;
                }

                switch(column.type){
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

              if(!me.list){
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
                  cls: 'fancy-field-search-list',
                  events: [{
                    set: function () {
                      grid.searching.setKeys(me.list.get());
                    }
                  },{
                    init: function(){
                      setTimeout(function() {
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

                        var el = Fancy.get(e.target),
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
                      },50);
                    }

                  }]
                });
              }
              else if(me.list.el.css('display') !== 'none'){
                me.list.el.css('display', 'none');
                return;
              }
              else{
                toShow = true;
              }

              var el = Fancy.get(e.target),
                offset = el.offset(),
                fieldHeight = parseInt(field.el.css('height'));

              if(me.list && me.list.el){
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
            }, null, '.fancy-field-search-params-link');

            field.el.on('mouseleave', function(){
              isIn = false;
              setTimeout(function(){
                if(isIn === false){
                  if(me.list){
                    me.list.el.css('display', 'none');
                  }
                }
              }, 750);
            }, null, '.fancy-field-search-params-link')
          }
        }]);

        Fancy.applyIf(item.style, {
          'float': me.floating,
          'padding-left': '0px',
          'margin-right': '8px',
          'margin-top': '4px'
        });

        var cls = 'fancy-field-search';

        if(item.paramsMenu){
          item.tpl = [
            '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
            '{label}',
            '</div>',
            '<div class="fancy-field-text">',
              '<input placeholder="{emptyText}" class="fancy-field-text-input" style="{inputWidth}" value="{value}">',
              '<div class="fancy-field-search-params-link" style="">' + (item.paramsText || '&nbsp;') + '</div>',
            '</div>',
            '<div class="fancy-clearfix"></div>'
          ];

          cls += ' fancy-field-search-paramed';
          if(!item.paramsText){
            cls += ' fancy-field-search-paramed-empty';
          }
        }

        Fancy.applyIf(item, {
          padding: false,
          width: 250,
          cls: cls,
          emptyText: 'Search'
        });

        field = new Fancy.StringField(item);
        break;
      default:
    }

    if(me.floating === 'right'){
      me.sideRight += field.width;
      me.sideRight += 7;
    }

    if(item.role){
      me.roles[item.role] = field;
    }

    return field;
  },
  /*
   *
   */
  initScroll: function(){
    var me = this;

    me.leftScroller = new Fancy.Button({
      imageCls: true,
      renderTo: me.el.dom,
      cls: 'fancy-bar-left-scroller',
      height: me.height + 2,
      minWidth: 20,
      paddingTextWidth: 0,
      imageWidth: 20,
      width: 0,
      text: false,
      id: 'my',
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

    me.rightScroller = new Fancy.Button({
      imageCls: true,
      renderTo: me.el.dom,
      cls: 'fancy-bar-right-scroller',
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
  getBarWidth: function(){
    var me = this;

    return parseInt(me.el.css('width'));
  },
  /*
   * @return {Number}
   */
  getItemsWidth: function(){
    var me = this,
      width = 0;

    Fancy.each(me.items, function (item){
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
  onPrevScrollClick: function(){
    var me = this;

    me.scrolled += 30;

    me.applyScrollChanges();
  },
  /*
   *
   */
  onNextScrollClick: function(){
    var me = this;

    me.scrolled -= 30;

    me.applyScrollChanges();
  },
  /*
   *
   */
  applyScrollChanges: function(){
    var me = this,
      itemsWidth = me.getItemsWidth(),
      barWidth = me.getBarWidth() - parseInt(me.leftScroller.el.css('width')) - parseInt(me.rightScroller.el.css('width')),
      scrollPath = itemsWidth - barWidth;

    if(itemsWidth < barWidth){
      me.scrolled = 0;

      me.leftScroller.el.hide();
      me.rightScroller.el.hide();

      me.containerEl.css('margin-left', '0px');

      return;
    }
    else if(me.scrolled > 0){
      me.scrolled = 0;
      me.leftScroller.disable();
      me.rightScroller.enable();
    }
    else if(me.scrolled < -scrollPath){
      me.scrolled = -scrollPath;
      me.leftScroller.enable();
      me.rightScroller.disable();
    }

    me.leftScroller.el.show();
    me.rightScroller.el.show();

    me.containerEl.css('margin-left', (me.scrolled + me.leftScroller.el.width() + me.tabOffSet) + 'px');
  },
  /*
   *
   */
  onDocMouseUp: function () {
    var me = this;

    if(me.scrollInterval){
      clearTimeout(me.scrollInterval);
      delete me.scrollInterval;
    }
  },
  /*
   *
   */
  checkScroll: function(){
    var me = this,
      itemsWidth = me.getItemsWidth(),
      barWidth = me.getBarWidth();

    if(me.disableScroll){
      return;
    }

    if(itemsWidth > barWidth){
      me.enableScroll();
    }
    else{
      me.leftScroller.el.hide();
      me.rightScroller.el.hide();
    }
  },
  /*
   *
   */
  enableScroll: function(){
    var me = this;

    me.leftScroller.el.show();
    me.rightScroller.el.show();

    if(me.scrolled === 0){
      me.leftScroller.disable();
      me.containerEl.css('margin-left', (me.leftScroller.el.width() + me.tabOffSet) + 'px');
    }
  },
  /*
   *
   */
  initTabEdit: function(){
    var me = this;

    if(!me.tabEdit){
      return;
    }

    var i = me.items.length - 1;

    for(;i>-1;i--){
      var item = me.items[i];

      switch(item.type){
        case 'number':
        case 'string':
        case 'date':
          item.on('tab', me.onTabLastInput, me);
          return;
          break;
      }
    }
  },
  /*
   * @param {Object} field
   * @param {Object} e
   */
  onTabLastInput: function(field, e){
    var me = this,
      grid = Fancy.getWidget(me.el.parent().select('.' + Fancy.gridCls).attr('id')),
      cellCls = grid.cellCls;

    //NOTE: setTimeout to fix strange bug. It runs second second cell without it.
    e.preventDefault();

    if(grid.leftColumns.length){
      setTimeout(function(){
        grid.leftBody.el.select('.' + cellCls).item(0).dom.click();
      }, 100);
    }
    else{
      setTimeout(function(){
        grid.body.el.select('.' + cellCls).item(0).dom.click();
      }, 100);
    }
  }
});