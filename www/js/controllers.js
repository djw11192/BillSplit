angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})
.controller('CameraCtrl', CameraCtrl)

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

function CameraCtrl($scope, $stateParams, CameraFactory){
  var vm = this
  console.log("CameraCtrl")

  vm.getPic = function(){
    console.log("getting pic")
    CameraFactory.create()
      .then(function(data){
        // console.log(data.data.ParsedResults[0].TextOverlay.Lines)
        var allWords = []
        vm.singleWords =[]
        var lines = data.data.ParsedResults[0].TextOverlay.Lines
        lines.forEach(function(line){
          allWords.push(line.Words)
        })
        allWords.forEach(function(l){
          l.forEach(function(attributes){
            vm.singleWords.push(attributes)
          })
        })
        console.log(vm.singleWords)
      },
      function(err){
        console.log(err)
      }
    )

  }
}
