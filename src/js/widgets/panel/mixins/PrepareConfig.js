/*
 * @mixin Fancy.panel.mixin.PrepareConfig
 */
Fancy.Mixin('Fancy.panel.mixin.PrepareConfig', {
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfigTheme: function(config, originalConfig){
    var themeName = config.theme || originalConfig.theme,
      themeConfig = Fancy.getTheme(themeName).config;

    if(Fancy.isObject(themeName)){
      config.theme = themeName.name;
    }

    Fancy.applyIf(config, themeConfig);

    return config;
  },
  //The same in grid
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigFooter: function(config){
    var footer = config.footer,
      lang = config.lang;

    if(footer){
      var bar = [];

      if(Fancy.isString(footer.status)){
        bar.push({
          type: 'text',
          text: footer.status,
          cls: 'fancy-footer-status'
        });
      }

      if(footer.status && footer.source) {
        bar.push('side');
      }

      if(Fancy.isString(footer.source)){
        bar.push({
          type: 'text',
          text: footer.source,
          cls: 'fancy-footer-source'
        });
      }
      else if(Fancy.isObject(footer.source)){
        var text = footer.source.text,
          sourceText = footer.source.sourceText || lang.sourceText;

        if(footer.source.link){
          var link = footer.source.link;

          link = link.replace('http://', '');
          link = 'http://' + link;

          text = '<span class="fancy-status-source-text">'+sourceText+'</span>: <a class="fancy-status-source-link" href="'+link+'">'+text+'</a>';
        }
        else{
          text = '<span>'+sourceText+':</span> ' + text;
        }

        bar.push({
          type: 'text',
          text: text,
          cls: 'fancy-footer-source'
        });
      }

      config.footer = bar;
    }

    return config;
  },
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfigLang:  function(config, originalConfig){
    var i18n = originalConfig.i18n || config.i18n,
      lang = Fancy.Object.copy(Fancy.i18n[i18n]);

    if(config.lang) {
      for(var p in config.lang){
        if(Fancy.isObject(config.lang[p]) === false){
          lang[p] = config.lang[p];
        }
      }

      lang.paging = {};
      if (config.lang.paging) {
        Fancy.apply(lang.paging, config.lang.paging);
      }

      for (var p in config.lang.paging) {
        if (p === 'paging') {
          continue;
        }

        if (Fancy.isObject(p)) {
          continue;
        }

        lang[p] = config.lang.paging[p];
      }

      lang.date = {};
      if (config.lang.date) {
        Fancy.apply(lang.date, config.lang.date);
      }
    }

    config.lang = lang;

    return config;
  }
});