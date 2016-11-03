angular.module('starter.services', [])
.factory('CameraFactory', ['$http', CameraFactory])
.factory('UsersFactory', UsersFactory)
.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});


function CameraFactory($http){
  return {
    create: create,
    getAws: getAws
  }

  function create(url){
    var formData = {
      apikey: "0440982bcc88957",
      language: "eng",
      isOverlayRequired: true,
      url: url
    }

      var theData = "url=" + url;
      theData += "language=eng"
      theData += "apikey=0440982bcc88957"

    var config ={
      url: 'https://api.ocr.space/parse/image',
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      transformRequest: function(obj) {
          var str = [];
          for(var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          return str.join("&");
      },
      data: formData,
      dataType: 'form/multipart',
    }
    return $http(config);
  }

  function getAws(fileBlob){
    // alert(fileBlob)
    $http.post('https://mighty-scrubland-13529.herokuapp.com/api/test', {file: fileBlob})
    $http.get('https://mighty-scrubland-13529.herokuapp.com/api/test')
  }
}

function UsersFactory(){
  var users = []
  return {
    all: function(){
      return users
    }
  }
}

//Prepare form data
  // var formData = new FormData();
  // // formData.append
  // //     ("file", fileToUpload);
  //
  // formData.append("url", "https://farm4.staticflickr.com/3627/3331376675_0d1596dc25_z.jpg");
  // formData.append("language" , "eng");
  // formData.append("apikey", "0440982bcc88957");
  //
  // formData.append("isOverlayRequired", true);
