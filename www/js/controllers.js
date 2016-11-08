angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})
.controller('CameraCtrl', CameraCtrl)
.controller('UsersCtrl', UsersCtrl)
.controller('TotalCtrl', TotalCtrl)
.controller('BillCtrl', BillCtrl)

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






function CameraCtrl($scope, $rootScope, $cordovaCamera, $cordovaFileTransfer, $ionicLoading, CameraFactory) {
  var vm = this

  vm.counter = 0

  vm.nextUser = function(){
    vm.counter+=1
  }


//The function below occurs when a user clicks/taps on a price.  It will add that value to what a specified user "owes"
  vm.addPriceToUser = function(price){
    vm.activeClass = price
    console.log(vm.counter)
    if(price.WordText[0]== "$"){
      console.log("has a $ sign")
      var newPrice = Number(price.WordText.substr(1))
      console.log(newPrice)
      console.log($rootScope.users)
      $rootScope.users[vm.counter].owes += newPrice
      console.log($rootScope.users)
    } else{
      var newPrice = Number(price.WordText)
      $rootScope.users[vm.counter].owes += newPrice

    }
  }

///This function creates an array with all the attributes we need for each piece of text on the receipt (positioning and actual text)
  // vm.getPic = function(){
  //   console.log("getting pic")
  //   CameraFactory.create()
  //     .then(function(data){
  //
  //       var allWords = []
  //       vm.singleWords =[]
  //       var lines = data.data.ParsedResults[0].TextOverlay.Lines
  //       lines.forEach(function(line){
  //         allWords.push(line.Words)
  //       })
  //       allWords.forEach(function(l){
  //         l.forEach(function(attributes){
  //           vm.singleWords.push(attributes)
  //         })
  //       })
  //       console.log(vm.singleWords)
  //
  //     },
  //     function(err){
  //       console.log(err)
  //     }
  //   )
  //
  // }

  vm.title = ""

  // adjust these values to taste:
  vm.targetWidth = 320
  vm.targetHeight = 568
  vm.imageQuality = 80

  vm.selectPhoto = function() {
    var options = {
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      targetWidth: vm.targetWidth,
      targetHeight: vm.targetHeight,
      quality: vm.imageQuality
    }

    $cordovaCamera.getPicture(options)
      .then(function(imagePath) {
        getSignedRequest(imagePath)
      })
  }

  function getSignedRequest(filePath){
    vm.title = "Getting Permission To Upload"

    // generate a random name for the image to be stored as on amazon. This is not the most reliable way to generate a random name, but will work for testing in a smaller scale. For a better randomization of filename, either use a MongoDB ObjectId to match, or generate something like an ObjectId with:
    // https://github.com/justaprogrammer/ObjectId.js
    vm.fileName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
    vm.fileName += '.jpg'

    // url to node app API that will get us a signed request from Amazon. Contains 2 query params:
    // 1. file-name: the name that the file will be saved as on Amazon
    // 2. file-type: will always be 'image/jpeg' if we don't specify anything different in the getPicture() options above.

    var signS3Url = 'https://mighty-scrubland-13529.herokuapp.com/sign-s3?file-name=' + vm.fileName + '&file-type=image/jpeg'

    // Contact our API with a GET so it can get permission from Amazon.
    // When our API receives response from Amazon, it sends us back a response which contains:
    // the signedRequest (the url we will upload our image to), as response.signedRequest
    // and the url of the soon-to-be-uploaded image (e.g. 'somebucketname.s3.amazonaws.com/image_name.jpg'), as response.url
    var xhr = new XMLHttpRequest();
    xhr.open('GET', encodeURI(signS3Url));
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          // Info on where to upload our image is contained in our API's response:
          var response = JSON.parse(xhr.responseText);

          // force refresh angular view, then initiate upload.
          // function uploadImage() is declared below
          $scope.$apply(function() {
            vm.title = "Permission Granted"
            uploadImage(response, filePath)
          })
        }
        else{
          // this could easily be a vm property to show the error on the view instead of an alert()
          alert('Could not get signed URL.');
        }
      }
    };
    xhr.send();
  }

  function uploadImage(response, filePath) {
    vm.title = "Beginning upload..."

    // start off with imageUrl as an empty string, we'll update this value if we successfully complete the upload below:
    vm.imageUrl = ''

    // start with '0' percent uploaded. This number will increase in realtime, in the .upload() progress function further below
    vm.uploadProgress = 0

    // show loading popup. This will be repeatedly run to update progress from the progress function declared below.
    $ionicLoading.show({template: '<p>Uploading...</p><ion-spinner></ion-spinner>'})

    // Options for our upload:
    var options = {
      // must specify that we want to send Amazon S3 a 'PUT' request.
      // otherwise it'll default to a 'POST'.
      httpMethod: 'PUT',

      // The signed request we get from our API is already encoded. We can send the file straight to that location as is.
      encodeURI: false,

      // the 'Content-Type' must be included in the headers of this upload, otherwise it'll be considered as 'form data' (multipart), which will cause it to fail:
      headers: {'Content-Type': 'image/jpeg'}
    }

    // initiate the upload, using the three functions declared below for success, error, and progress (while the file is uploading):
    $cordovaFileTransfer.upload(response.signedRequest, filePath, options)
      .then(uploadSuccess, uploadError, uploadProgress)

    // runs when file is successfully uploaded:
    function uploadSuccess(result) {
      vm.title = "Photo Uploaded!"
      vm.imageUrl = response.url

      //below we go to our services.js file to do a post request to our ocr api
      //We get back data that has the text recognized on the receipt and its positioning
      CameraFactory.create(vm.imageUrl)
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
         vm.loading = false;
         console.log("got the picture")
        //  alert(vm.singleWords[0].WordText)
       },function(err){
            console.log(err)
          }
        )

      $ionicLoading.hide();

      // clear the /tmp folder on the device so it doesn't stack images that won't be used.
      $cordovaCamera.cleanup()
    }

    // runs when there was an error in the upload. 'err' object will show in the view in this case:
    function uploadError(err) {
      vm.title = "Error Uploading Photo..."
      vm.err = err
      $ionicLoading.hide();
    }

    // runs everytime there's an update to how much of the file has been uploaded:
    function uploadProgress(progress) {
      vm.title = "Uploading photo..."
      // the 'progress' object in this function arg contains 'loaded' and 'total', which we can use to create an upload percentage to show in the view:
      vm.uploadProgress = Math.round(progress.loaded / progress.total * 100)

      // refresh the loading popup view with the updated progress value:
      $ionicLoading.show({
        template: '<p>Uploading...' + vm.uploadProgress + '%</p><ion-spinner></ion-spinner>'
      })
    }
  }
}





// function CameraCtrl($scope, $rootScope, $cordovaCamera, CameraFactory){
//   var vm = this
//   vm.loading = false;
//
//   /////////Counter for users//////
//   vm.counter = 0
//
//   vm.nextUser = function(){
//     vm.counter+=1
//   }
//   var file;
//   console.log("CameraCtrl")
//
//   vm.fileInputChanged = function(evt, files) {
//     vm.loading = true;
//     console.log(vm.loading)
//
//     var files = evt.target.files;
//     file = files[0];
//
//     console.log(file)
//
//     if(file == null){
//       return alert('No file selected.');
//     }
//     vm.getSignedRequest(file);
//   }
//
//
//   vm.getSignedRequest = function(file){
//    var xhr = new XMLHttpRequest();
//    xhr.open('GET', `https://mighty-scrubland-13529.herokuapp.com/sign-s3?file-name=${file.name}&file-type=${file.type}`);
//    xhr.onreadystatechange = () => {
//      if(xhr.readyState === 4){
//        if(xhr.status === 200){
//          var response = JSON.parse(xhr.responseText);
//          console.log(response);
//          vm.uploadFile(file, response.signedRequest, response.url);
//        }
//        else{
//          alert('Could not get signed URL.');
//        }
//      }
//    };
//    xhr.send();
//  }
//  vm.uploadFile = function(file, signedRequest, url){
//    var xhr = new XMLHttpRequest();
//    xhr.open('PUT', signedRequest);
//    xhr.onreadystatechange = () => {
//      if(xhr.readyState === 4){
//        if(xhr.status === 200){
//          vm.uploadedPhotoUrl = url
//          $scope.$apply()
//          CameraFactory.create(vm.uploadedPhotoUrl)
//            .then(function(data){
//              // console.log(data.data.ParsedResults[0].TextOverlay.Lines)
//              var allWords = []
//              vm.singleWords =[]
//              var lines = data.data.ParsedResults[0].TextOverlay.Lines
//              lines.forEach(function(line){
//                allWords.push(line.Words)
//              })
//              allWords.forEach(function(l){
//                l.forEach(function(attributes){
//                  vm.singleWords.push(attributes)
//                })
//              })
//              console.log(vm.singleWords)
//              vm.loading = false;
//              console.log("got the picture")
//             //  alert(vm.singleWords[0].WordText)
//            },
//            function(err){
//              console.log(err)
//            }
//          )
//        }
//        else{
//          alert('Could not upload file.');
//        }
//      }
//    };
//    xhr.send(file);
//  }
// }



//   vm.addPriceToUser = function(price){
//     vm.activeClass = price
//     console.log(vm.counter)
//     if(price.WordText[0]== "$"){
//       console.log("has a $ sign")
//       var newPrice = Number(price.WordText.substr(1))
//       console.log(newPrice)
//       console.log($rootScope.users)
//       $rootScope.users[vm.counter].owes += newPrice
//       console.log($rootScope.users)
//     } else{
//       var newPrice = Number(price.WordText)
//       $rootScope.users[vm.counter].owes += newPrice
//
//     }
//   }
//
//
// //My function to get the text from the uploaded picture
//
//   vm.getPic = function(){
//     console.log("getting pic")
//     CameraFactory.create()
//       .then(function(data){
//
//         // console.log(data.data.ParsedResults[0].TextOverlay.Lines)
//         var allWords = []
//         vm.singleWords =[]
//         var lines = data.data.ParsedResults[0].TextOverlay.Lines
//         lines.forEach(function(line){
//           allWords.push(line.Words)
//         })
//         allWords.forEach(function(l){
//           l.forEach(function(attributes){
//             vm.singleWords.push(attributes)
//           })
//         })
//         console.log(vm.singleWords)
//
//       },
//       function(err){
//         console.log(err)
//       }
//     )
//
//   }
// }

function UsersCtrl($scope, $rootScope, UsersFactory){
  var vm = this
  $rootScope.users = []

  // $scope.users = UsersFactory.all();
  console.log($scope.users)

///Add users for this bill to an array
  vm.addUser = function(){
    $rootScope.users.push(vm.newUser)
    vm.newUser = {}

    ///Make each user owe $0 to start
      $rootScope.users.forEach(function(u){
        u.owes = 0;
      })
    console.log($rootScope.users)
  }
}

function TotalCtrl($scope, $rootScope){
  console.log("using tc")
  var vm = this
  var tip =
  // vm.tax =0;
  console.log(vm.tax)
  console.log(vm.tip)

  $rootScope.subtotal = 0
  $rootScope.total = $rootScope.subtotal

  $rootScope.users.forEach(function(u){
    $rootScope.subtotal += u.owes;
  })


  vm.setTax = function(tax){
    $rootScope.total = $rootScope.subtotal
    console.log(tax)
    $rootScope.tax = tax
    // $rootScope.total += vm.tax
  }
  vm.setTip = function(tip){
    console.log(vm.tip)
    $rootScope.tip = (tip/100)
    console.log(vm.tip)
  }

}

function BillCtrl($scope, $rootScope){
  $rootScope.users.forEach(function(u){
    u.owes = u.owes + (u.owes* $rootScope.tip) + ($rootScope.tax/$rootScope.users.length)
    console.log(u.owes)
  })
}
