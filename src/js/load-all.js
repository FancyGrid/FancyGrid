(function(){

  var dc = +new Date(),
    pathToSrc = '/src/js/';

  var files = [
      pathToSrc + 'core/Fancy.js',
      pathToSrc + 'core/theme.js',

      pathToSrc + 'core/types/String.js',
      pathToSrc + 'core/types/Array.js',
      pathToSrc + 'core/types/Object.js',
      pathToSrc + 'core/types/Date.js', // date module
      pathToSrc + 'core/types/Number.js',

      pathToSrc + 'util/Collection.js',
      pathToSrc + 'util/Template.js',
      pathToSrc + 'util/Key.js',
      pathToSrc + 'core/Class.js',
      pathToSrc + 'core/MixinClass.js',
      pathToSrc + 'data/Data.js',
      pathToSrc + 'data/Model.js',

      pathToSrc + 'widgets/PluginManager.js',
      pathToSrc + 'widgets/WidgetManager.js',
      pathToSrc + 'util/Event.js',

      pathToSrc + 'data/mixins/Paging.js', // paging module
      pathToSrc + 'data/mixins/Infinite.js', // TODO module
      pathToSrc + 'data/mixins/Proxy.js', // server data module
      pathToSrc + 'data/mixins/Rest.js', // server data module
      pathToSrc + 'data/mixins/Reader.js', // server data module
      pathToSrc + 'data/mixins/Writer.js', // server data module
      pathToSrc + 'data/mixins/Sort.js', // sort module
      pathToSrc + 'data/mixins/Edit.js',
      pathToSrc + 'data/mixins/Grouping.js', // grouping module
      pathToSrc + 'data/mixins/Filter.js', // filter module
      //pathToSrc + 'data/mixins/Search.js', // search module
      pathToSrc + 'data/mixins/Dirty.js', // edit module
      pathToSrc + 'data/mixins/Tree.js', // tree module
      pathToSrc + 'data/Store.js',

      pathToSrc + 'adapter/jquery.js',

      pathToSrc + 'dom/core.js', // dom module
      pathToSrc + 'dom/event.js', // dom module

      pathToSrc + 'dom/fx.js', // dom module
      pathToSrc + 'dom/fx_methods.js', // dom module

      pathToSrc + 'dom/ajax.js', // ajax module

      pathToSrc + 'i18n/en.js',

      pathToSrc + 'app/Controller.js', //needs to think in what module it should be

      pathToSrc + 'dd/DD.js',

      pathToSrc + 'widgets/Widget.js',
      pathToSrc + 'widgets/Plugin.js',
      pathToSrc + 'widgets/button/Button.js',
      pathToSrc + 'widgets/button/SegButton.js',
      //pathToSrc + 'widgets/tab/Tab.js',
      pathToSrc + 'widgets/panel/mixins/prepareConfig.js',
      pathToSrc + 'widgets/panel/mixins/methods.js',
      pathToSrc + 'widgets/panel/mixins/DD.js',
      pathToSrc + 'widgets/panel/mixins/Resize.js',
      pathToSrc + 'widgets/panel/Panel.js',
      pathToSrc + 'widgets/panel/Tool.js',
      pathToSrc + 'widgets/panel/Tab.js',  // ?
      pathToSrc + 'widgets/tab/Tab.js',  // form module

      pathToSrc + 'widgets/menu/Menu.js', // menu module

      pathToSrc + 'widgets/toolbar/Bar.js',
      pathToSrc + 'widgets/toolbar/Separator.js',
      pathToSrc + 'widgets/toolbar/Text.js',

      pathToSrc + 'widgets/form/mixins/Form.js', // form module
      pathToSrc + 'widgets/form/mixins/PrepareConfig.js', // form module
      pathToSrc + 'widgets/form/Form.js',

      pathToSrc + 'widgets/field/Mixin.js',
      pathToSrc + 'widgets/field/String.js',
      pathToSrc + 'widgets/field/Number.js',

      pathToSrc + 'widgets/field/Date.js', // date module
      pathToSrc + 'widgets/field/DateRange.js', // date module

      pathToSrc + 'widgets/field/Text.js',
      pathToSrc + 'widgets/field/Empty.js',
      pathToSrc + 'widgets/field/TextArea.js',
      pathToSrc + 'widgets/field/CheckBox.js',
      pathToSrc + 'widgets/field/Switcher.js',
      pathToSrc + 'widgets/field/Combo.js',
      //pathToSrc + 'widgets/field/Tag.js',
      pathToSrc + 'widgets/field/Button.js',
      pathToSrc + 'widgets/field/SegButton.js',
      pathToSrc + 'widgets/field/Line.js', // form module
      pathToSrc + 'widgets/field/Set.js', // form module
      pathToSrc + 'widgets/field/HTML.js', // form module
      pathToSrc + 'widgets/field/ReCaptcha.js', // form module
      pathToSrc + 'widgets/field/Tab.js', // form module
      pathToSrc + 'widgets/field/Radio.js',

      pathToSrc + 'util/valid/VType.js', // edit module
      pathToSrc + 'util/valid/types.js', // edit module

      pathToSrc + 'widgets/grid/mixins/PrepareConfig.js',
      pathToSrc + 'widgets/grid/mixins/ActionColumn.js',
      pathToSrc + 'widgets/grid/mixins/Edit.js', // edit module
      pathToSrc + 'widgets/grid/mixins/Grid.js',
      pathToSrc + 'widgets/grid/Grid.js',
      pathToSrc + 'widgets/grid/plugins/Updater.js',
      pathToSrc + 'widgets/grid/plugins/Scroller.js',
      pathToSrc + 'widgets/grid/plugins/Sorter.js', // sort module
      pathToSrc + 'widgets/grid/plugins/Paging.js', // paging module
      pathToSrc + 'widgets/grid/plugins/LoadMask.js',
      pathToSrc + 'widgets/grid/plugins/ColumnResizer.js',
      pathToSrc + 'widgets/grid/plugins/ColumnDrag.js', // column drag module
      pathToSrc + 'widgets/grid/plugins/ChartIntegration.js', // chart integration module
      pathToSrc + 'widgets/grid/plugins/HighChart.js', // chart integration module

      pathToSrc + 'widgets/grid/plugins/Edit.js', // edit module
      pathToSrc + 'widgets/grid/plugins/CellEdit.js', // edit module
      pathToSrc + 'widgets/grid/plugins/RowEdit.js', // edit module

      pathToSrc + 'widgets/grid/plugins/Infinite.js', // TODO module

      pathToSrc + 'widgets/grid/plugins/mixins/Navigation.js', // selection module
      pathToSrc + 'widgets/grid/plugins/Selection.js', // selection module

      pathToSrc + 'widgets/grid/plugins/Expander.js', // expander module

      pathToSrc + 'widgets/grid/plugins/GroupHeader.js', // group header module

      pathToSrc + 'widgets/grid/plugins/Grouping.js', // grouping module

      pathToSrc + 'widgets/grid/plugins/Summary.js', // summary module

      pathToSrc + 'widgets/grid/plugins/CellTip.js',
      pathToSrc + 'widgets/grid/plugins/HeaderCellTip.js',

      pathToSrc + 'widgets/grid/plugins/ContextMenu.js', // menu module

      pathToSrc + 'widgets/grid/plugins/Filter.js', // filter module
      pathToSrc + 'widgets/grid/plugins/Search.js', // filter module

      pathToSrc + 'widgets/grid/plugins/GridToGrid.js', // dd module - should be depricated in future
      pathToSrc + 'widgets/grid/plugins/RowDragDrop.js', // dd module
      pathToSrc + 'widgets/grid/plugins/Exporter.js', // exporter module

      pathToSrc + 'widgets/grid/plugins/State.js', // state module
      pathToSrc + 'widgets/grid/plugins/Tree.js', // tree module
		
      pathToSrc + 'widgets/grid/plugins/RowHeight.js',

      pathToSrc + 'widgets/grid/plugins/Licence.js',

      pathToSrc + 'widgets/grid/elements/mixins/BodyUpdater.js',
      pathToSrc + 'widgets/grid/elements/Body.js',
      pathToSrc + 'widgets/grid/elements/mixins/HeaderMenu.js', // menu module
      pathToSrc + 'widgets/grid/elements/Header.js',

      pathToSrc + 'widgets/picker/Date.js', // date module
      pathToSrc + 'widgets/picker/Month.js', // date module

      //spark
      pathToSrc + 'spark/ProgressDonut.js', // spark module
      pathToSrc + 'spark/GrossLoss.js', // spark module
      pathToSrc + 'spark/ProgressBar.js', // spark module
      pathToSrc + 'spark/HBar.js', // spark module

      //tooltip
      pathToSrc + 'widgets/tooltip/ToolTip.js',

      pathToSrc + 'touch/fastclick.js', // touch module

      pathToSrc + 'widgets/Component.js', // Component

      pathToSrc + "thirdparty/sheetjs/xlsx.full.min.js", // module excel
      pathToSrc + "thirdparty/sheetjs/Blob.js", // module excel
      pathToSrc + "thirdparty/sheetjs/FileSaver.js" // module excel
    ];

  var i = 0,
    iL = files.length,
    dcUrl = '?_dc='+dc;

  for(;i<iL;i++){
    var file = files[i] + dcUrl;
    document.write('<script type="text/javascript" charset="UTF-8" src="' + file + '"></script>');
  }

})();