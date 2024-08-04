(function(){
  'use strict';
  angular.module('fancygrid-angularjs', []).directive('fancygrid', [function(){
    return {
      restrict: 'EA',
      scope: {
        id: '@',
        fgConfig: '='
      },
      link : function($scope, $element, $attrs){
        if($scope.fgConfig){
          const config = $scope.fgConfig;

          config.renderTo = $scope.id;

          new FancyGrid(config);
        }
      }
    };
  }]);
})();
