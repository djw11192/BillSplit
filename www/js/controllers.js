angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})
.controller('CameraCtrl', CameraCtrl)
.controller('UsersCtrl', UsersCtrl)

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

function CameraCtrl($scope, $cordovaCamera, CameraFactory){
  var vm = this
  console.log("CameraCtrl")

//Cordova camera plugin



//tutorial on changing file format



// $scope.images = [];
//
// $scope.takePicture = function() {
// 	// 2
// 	var options = {
// 		destinationType : Camera.DestinationType.FILE_URI,
// 		sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
// 		allowEdit : false,
// 		encodingType: Camera.EncodingType.JPEG,
// 		popoverOptions: CameraPopoverOptions,
// 	};
//
// 	// 3
// 	$cordovaCamera.getPicture(options).then(function(imageData) {
//
// 		// 4
// 		onImageSuccess(imageData);
//
// 		function onImageSuccess(fileURI) {
// 			createFileEntry(fileURI);
// 		}
//
// 		function createFileEntry(fileURI) {
// 			window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
// 		}
//
// 		// 5
// 		function copyFile(fileEntry) {
// 			var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
// 			var newName = makeid() + name;
//
// 			window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
// 				fileEntry.copyTo(
// 					fileSystem2,
// 					newName,
// 					onCopySuccess,
// 					fail
// 				);
// 			},
// 			fail);
// 		}
//
// 		// 6
// 		function onCopySuccess(entry) {
// 			$scope.$apply(function () {
// 				$scope.images.push(entry.nativeURL);
// 			});
// 		}
//
// 		function fail(error) {
// 			console.log("fail: " + error.code);
// 		}
//
// 		function makeid() {
// 			var text = "";
// 			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//
// 			for (var i=0; i < 5; i++) {
// 				text += possible.charAt(Math.floor(Math.random() * possible.length));
// 			}
// 			return text;
// 		}
//
// 	}, function(err) {
// 		console.log(err);
// 	});
// }
//
// $scope.urlForImage = function(imageName) {
//   var name = imageName.substr(imageName.lastIndexOf('/') + 1);
//   var trueOrigin = cordova.file.dataDirectory + name;
//   return trueOrigin;
// }


$scope.takePicture = function() {
  var options = {
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      targetWidth: 300,
      targetHeight: 300,
    };

     $cordovaCamera.getPicture(options).then(function(imageData) {
         $scope.imgURI = imageData

     }, function(err) {
         // An error occured. Show a message to the user
         console.log(err)
     });

     $cordovaCamera.cleanup().then(console.log("Found file"));
 }



  // $scope.takePicture = function() {
  //      var options = {
  //          quality : 75,
  //          destinationType : Camera.DestinationType.DATA_URL,
  //          sourceType : Camera.PictureSourceType.CAMERA,
  //          allowEdit : true,
  //          encodingType: Camera.EncodingType.JPEG,
  //          targetWidth: 300,
  //          targetHeight: 300,
  //          popoverOptions: CameraPopoverOptions,
  //          saveToPhotoAlbum: false
  //      };
  //
  //      $cordovaCamera.getPicture(options).then(function(imageData) {
  //          $scope.imgURI = "data:image/jpeg;base64," + imageData;
  //
  //      }, function(err) {
  //          // An error occured. Show a message to the user
  //          console.log(err)
  //      });
  //  }

  //  $scope.findFile = function(){
  //    var options = {
  //     destinationType: Camera.DestinationType.FILE_URI,
  //     sourceType: Camera.PictureSourceType.CAMERA,
  //   };
  //
  //   $cordovaCamera.findFile(options).then(function(imageFile) {
  //     vm.file = imageFile;
  //   }, function(err) {
  //     console.log(err)
  //     // error
  //   });
  //
  //
  //   $cordovaCamera.cleanup().then(console.log("Found file")); // only for FILE_URI
  //
  // };





//My function to get the text from the uploaded picture

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

function UsersCtrl($scope, UsersFactory){
  var vm = this
  $scope.users = []
  // $scope.users = UsersFactory.all();
  console.log($scope.users)

  vm.addUser = function(){
    $scope.users.push(vm.newUser)
    vm.newUser = {}
  }
}
