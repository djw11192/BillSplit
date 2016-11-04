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

function CameraCtrl($scope, $rootScope, $cordovaCamera, CameraFactory){
  var vm = this

  /////////Counter for users//////
  vm.counter = 0

  vm.nextUser = function(){
    vm.counter+=1
  }
  var file;
  console.log("CameraCtrl")

  vm.fileInputChanged = function(evt, files) {
    var files = evt.target.files;
    file = files[0];

    console.log(file)

    if(file == null){
      return alert('No file selected.');
    }
    vm.getSignedRequest(file);
  }


  vm.getSignedRequest = function(file){
   var xhr = new XMLHttpRequest();
   xhr.open('GET', `https://mighty-scrubland-13529.herokuapp.com/sign-s3?file-name=${file.name}&file-type=${file.type}`);
   xhr.onreadystatechange = () => {
     if(xhr.readyState === 4){
       if(xhr.status === 200){
         var response = JSON.parse(xhr.responseText);
         console.log(response);
         vm.uploadFile(file, response.signedRequest, response.url);
       }
       else{
         alert('Could not get signed URL.');
       }
     }
   };
   xhr.send();
 }
 vm.uploadFile = function(file, signedRequest, url){
   var xhr = new XMLHttpRequest();
   xhr.open('PUT', signedRequest);
   xhr.onreadystatechange = () => {
     if(xhr.readyState === 4){
       if(xhr.status === 200){
         vm.uploadedPhotoUrl = url
         $scope.$apply()
         CameraFactory.create(vm.uploadedPhotoUrl)
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
             alert(vm.singleWords[0].WordText)
           },
           function(err){
             console.log(err)
           }
         )
       }
       else{
         alert('Could not upload file.');
       }
     }
   };
   xhr.send(file);
 }

//Cordova camera plugin


$scope.takePicture = function() {
  var options = {
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      targetWidth: 300,
      targetHeight: 300,
    };
    alert("taking pic")
    alert($cordovaCamera.getPicture(options).file())
     $cordovaCamera.getPicture(options).then(function(imageData) {
         $scope.imgURI = imageData

        alert(JSON.stringify($scope.imgURI.file()))

      }, function(err){
        console.log(err)
      })

        $cordovaCamera.cleanup().then(console.log("Found file"));
        //  alert(fileBlob.name);
        //  alert(fileBlob.type);

        //  function getSignedRequest(file){
        //   const xhr = new XMLHttpRequest();
        //   xhr.open('GET', `https://mighty-scrubland-13529.herokuapp.com/sign-s3?file-name=${file.name}&file-type=${file.type}`);
        //   xhr.onreadystatechange = () => {
        //     if(xhr.readyState === 4){
        //       if(xhr.status === 200){
        //         const response = JSON.parse(xhr.responseText);
        //         console.log(response.url);
        //         uploadFile(file, response.signedRequest, response.url);
        //       }
        //       else{
        //         alert('Could not get signed URL.');
        //       }
        //     }
        //   };
        //   xhr.send();
        // } getSignedRequest(myFile)
        //
        // function uploadFile(file, signedRequest, url){
        //   const xhr = new XMLHttpRequest();
        //   xhr.open('PUT', signedRequest);
        //   xhr.onreadystatechange = () => {
        //     if(xhr.readyState === 4){
        //       if(xhr.status === 200){
        //         alert(url)
        //         document.getElementById('preview').src = url;
        //         document.getElementById('avatar-url').value = url;
        //       }
        //       else{
        //         alert('Could not upload file.');
        //       }
        //     }
        //   };
        //   xhr.send(file);
        // }



     }







  $scope.takePicture = function() {
       var options = {
           quality : 75,
           destinationType : Camera.DestinationType.DATA_URL,
           sourceType : Camera.PictureSourceType.CAMERA,
           allowEdit : true,
           encodingType: Camera.EncodingType.JPEG,
           targetWidth: 300,
           targetHeight: 300,
           popoverOptions: CameraPopoverOptions,
           saveToPhotoAlbum: false
       };
       alert($cordovaCamera.getPicture(options).file())
       $cordovaCamera.getPicture(options).then(function(imageData) {
           $scope.imgURI = "data:image/jpeg;base64," + imageData;

       }, function(err) {
           // An error occured. Show a message to the user
           console.log(err)
       });
   }
  //
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


  vm.addPriceToUser = function(price){
    console.log(vm.counter)
    if(price.WordText[0]== "$"){
      console.log("has a $ sign")
      var newPrice = Number(price.WordText.substr(1))
      console.log(newPrice)
      console.log($rootScope.users)
      $rootScope.users[vm.counter].owes += newPrice
      console.log($rootScope.users)
    }
  }

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
    $rootScope.tip = tip/100
    console.log(vm.tip)
  }

}

function BillCtrl($scope, $rootScope){
  $rootScope.users.forEach(function(u){
    u.owes = u.owes + (u.owes* $rootScope.tip) + ($rootScope.tax/$rootScope.users.length)
    console.log(u.owes)
  })
}
