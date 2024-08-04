(function(){
  'use strict';
  angular.module('fancyform-angularjs', []).directive('fancyform', [function(){
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

          new FancyForm(config);
        }
      }
    };
  }]);
})();
