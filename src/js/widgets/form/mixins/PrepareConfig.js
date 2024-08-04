/*
 * @mixin Fancy.form.mixin.PrepareConfig
 */
Fancy.Mixin('Fancy.form.mixin.PrepareConfig', {
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfig(config, originalConfig){
    const me = this;

    if (config.renderOuter) {
      config.renderTo = config.renderOuter;
    }

    config = me.prepareConfigTheme(config, originalConfig);
    config = me.prepareConfigSize(config, originalConfig);
    config = me.prepareConfigLang(config, originalConfig);
    config = me.prepareConfigBars(config, originalConfig);
    config = me.prepareConfigDefaults(config);
    config = me.prepareConfigItems(config);
    config = me.prepareConfigFooter(config);

    return config;
  },
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfigSize(config) {
    let el,
      me = this,
      renderTo = config.renderTo;

    if(config.width === undefined){
      if (renderTo){
        config.responsive = true;
        el = Fancy.get(renderTo);

        config.width = parseInt(el.width());
      }
    }

    if(config.height === undefined){

    }
    else if(config.height === 'fit'){
      setTimeout(() => {
        me.setHeightFit();
        me.on('changetab', me.onChangeTab, me);
      });
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigDefaults(config){
    if( config.defaults ){
      for(const p in config.defaults){
        Fancy.each(config.items, item => {
          if( item[p] === undefined ){
            item[p] = config.defaults[p];
          }
        });
      }
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigBars(config){
    const fn = function (bar) {
      var i = 0,
        iL = bar.length;

      for (; i < iL; i++) {
        switch (bar[i].type) {
          case 'date':
            if (!bar[i].format) {
              var date = config.lang.date;
              bar[i].format = {
                read: date.read,
                write: date.write,
                edit: date.edit
              };
            }

            if (config.i18n) {
              bar[i].i18n = config.i18n;
            }
            break;
        }
      }
    };

    fn(config.tbar || []);
    fn(config.subTBar || []);
    fn(config.bbar || []);
    fn(config.buttons || []);

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigItems(config){
    const me = this,
      fn = function (item) {
        item.theme = me.theme || '';

        if (item.labelWidth === undefined) {
          item.labelWidth = me.labelWidth;
        }

        if (item.inputWidth === undefined) {
          item.inputWidth = me.inputWidth;
        }

        if (item.type === 'pass' || item.type === 'password') {
          item.type = 'string';
          item.isPassword = true;
        }

        if (item.items) {
          Fancy.each(item.items, fn);
        }
      };

    Fancy.each(config.items, fn);

    return config;
  },
  /*
   *
   */
  setHeightFit(){
    const me = this,
      isPanel = !!(me.title || me.subTitle || me.tbar || me.bbar || me.buttons || me.panel),
      panelBodyBorders = me.panelBodyBorders,
      gridWithoutPanelBorders = me.gridWithoutPanelBorders,
      gridBorders = me.gridBorders;

    me.heightFit = true;

    let height = me.fieldHeight;
    let items = me.items;

    if(me.$tabs){
      var activeTab = me.activeTab || 0;

      items = me.$tabs[activeTab];
    }

    Fancy.each(items, field => {
      if (field.hidden) {}
      else{
        height += parseInt(field.css('height'));
      }
    });

    if (me.title) {
      height += me.titleHeight;
    }

    if (me.tbar || me.tabs) {
      height += me.tbarHeight || me.barHeight;
    }

    if(me.bbar){
      height += me.bbarHeight || me.barHeight;
    }

    if(me.buttons){
      height += me.buttonsHeight || me.barHeight;
    }

    if(me.subTBar){
      height += me.subTBarHeight || me.barHeight;
    }

    if(me.footer){
      height += me.barHeight;
    }

    if( isPanel ){
      height += panelBodyBorders[0] + panelBodyBorders[2] + gridBorders[0] + gridBorders[2];
    }
    else{
      height += gridWithoutPanelBorders[0] + gridWithoutPanelBorders[2] + gridBorders[0] + gridBorders[2];
    }

    if(me.minHeight && height < me.minHeight){
      height = me.minHeight;
    }

    me.setHeight(height);
  },
  /*
   *
   */
  onChangeTab(){
    this.setHeightFit();
  }
});
