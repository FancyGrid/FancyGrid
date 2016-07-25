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
          var config = $scope.fgConfig;

          config.renderTo = $scope.id;

          new FancyGrid(config);
        }
      }
    };
  }]);
})();