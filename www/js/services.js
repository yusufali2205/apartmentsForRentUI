angular.module('app.services', [])

.constant("myConfig", {
  "url": "http://cislinux.cis.ksu.edu",
  "port": "8737",
  "googleGeocodeURL": "https://maps.googleapis.com/maps/api/geocode/json",
  "googleApiKey" : "AIzaSyCrRt9NkoY61h3B-0vRXmXNwmLExMdwjBw",
  "apiAccessToken": "aUo3TpibnR"
})

.factory('Camera', ['$q', function($q) {
  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  }
}])

.factory('$localStorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || null);
    },
    remove: function(key) {
      $window.localStorage.removeItem(key);
    }
  }
}])

.service('UserRepo', ['myConfig', '$http', '$q', '$ionicPopup', '$ionicLoading', function(myConfig, $http, $q, $ionicPopup, $ionicLoading){
  var USER_URL = myConfig.url + ":" + myConfig.port + "/users";
  var LOGIN_URL = myConfig.url + ":" + myConfig.port + "/login";
  var LOGOUT_URL = myConfig.url + ":" + myConfig.port + "/logout";

  return({
    addUser: addUser,
    login: login,
    removeUser: removeUser,
    getUserById: getUserById,
    getUserByEmail: getUserByEmail,
    logout: logout,
    updateUser: updateUser
  });

  function addUser(firstName, lastName, email, phone, city, type, password) {
    $ionicLoading.show({
      template: '<ion-spinner>'
    });
    var request = $http({
      method: "post",
      url: USER_URL,
      params: {
        action: "add"
      },
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNo: phone,
        city: city,
        userType: type,
        password: password
      }
    });
    return( request.then( handleSuccess, handleError ) );
  }

  function login(email, password) {
    $ionicLoading.show({
      template: '<ion-spinner>'
    });
    var request = $http({
      method: "post",
      url: LOGIN_URL,
      params: {
        action: '/login',
        username: email,
        password: password
      }
    });
    return( request.then(
      function ( response ) {
        $ionicLoading.hide();
        return( response.data );
      }
      , handleError ) );
  }

  function updateUser(userId, email, firstName, lastName, phoneNo, city, password){
    $ionicLoading.show({
      template: '<ion-spinner>'
    });
    var request = $http({
      method: "put",
      url: USER_URL + "/" + userId,
      params: {
        action: "put"
      },
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNo: phoneNo,
        city: city,
        userType: 'user',
        password: password
      }
    });
    return( request.then( handleSuccess, handleError ) );
  }

  function logout() {
    $ionicLoading.show({
      template: '<ion-spinner>'
    });
    var request = $http({
      method: "post",
      url: LOGOUT_URL,
      params: {
        action: '/logout'
      }
    });
    return( request.then(
      function ( response ) {
        $ionicLoading.hide();
        return( response.data );
      }
      , handleError ) );
  }

  function removeUser( email ) {
    $ionicLoading.show({
      template: '<ion-spinner>'
    });
    var request = $http({
      method: "delete",
      url: USER_URL,
      params: {
        action: "delete"
      },
      data: {
        id: email
      }
    });
    return( request.then(
      function ( response ) {
        $ionicLoading.hide();
        return( response.data );
      }
      , handleError ) );
  }

  function getUserById( userId ) {
    $ionicLoading.show({
      template: '<ion-spinner>'
    });
    var request = $http({
      method: "get",
      url: USER_URL + "/" + userId
    });
    return( request.then( handleSuccess, handleError ) );
  }

  function getUserByEmail( email ) {
    $ionicLoading.show({
      template: '<ion-spinner>'
    });
    var request = $http({
      method: "get",
      url: USER_URL + "/search/findByEmail/",
      params: {
        email: email
      }
    });
    return( request.then( handleSuccess, handleError ) );
  }

  function handleError( response ) {
    // The API response from the server should be returned in a
    // nomralized format. However, if the request was not handled by the
    // server (or what not handles properly - ex. server error), then we
    // may have to normalize it on our end, as best we can.
    if (
      ! angular.isObject( response.data ) ||
      ! response.data.message
    ) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Server error',
        template: 'Server unreachable'
      });
      return( $q.reject( "An unknown error occurred." ) );
    }
    // Otherwise, use expected error message.
    $ionicLoading.hide();
    $ionicPopup.alert({
      title: 'Server error',
      template: response.data.message
    });
    return( $q.reject( response.data.message ) );
  }
  // I transform the successful response, unwrapping the application data
  // from the API response payload.
  function handleSuccess( response ) {
    $ionicLoading.hide();
    return( response.data );
  }
}])

  .service('PropertyRepo', ['myConfig', '$http', '$q', '$ionicPopup', '$ionicLoading', function(myConfig, $http, $q, $ionicPopup, $ionicLoading){
    var PROPERTY_URL = myConfig.url + ":" + myConfig.port + "/property";
    var REVIEW_URL = myConfig.url + ":" + myConfig.port + "/review";
    var ADDRESS_VERIFY_URL = myConfig.googleGeocodeURL;

    return({
      addProperty: addProperty,
      getAllProperty: getAllProperty,
      removeProperty: removeProperty,
      getAverageRating: getAverageRating,
      getAllReviewsByPropertyId: getAllReviewsByPropertyId,
      getPropertyById: getPropertyById,
      getOwnerByLink: getOwnerByLink,
      addReview: addReview,
      verifyAddress: verifyAddress,
      checkPropertyByPlaceId: checkPropertyByPlaceId,
      getPropertyFiltered: getPropertyFiltered,
      getPropertyPageByLink: getPropertyPageByLink,
      editPropertyDetails: editPropertyDetails,
      listMyProperties: listMyProperties,
      deleteProperty: deleteProperty,
      getReviewByUserAndProperty: getReviewByUserAndProperty
    });

    function addProperty(propertyName, propertyType, bhk, geoLat, geoLong , address,
                         floorArea, availableFrom, propertyPrice, furnished,
                         userId, pictureLink, placeId) {
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      console.log("Service:"+ pictureLink);
      var utc = new Date().toJSON().slice(0,10);
      var request = $http({
        method: "post",
        url: PROPERTY_URL,
        params: {
          action: "add"
        },
        data: {
          propertyName: propertyName,
          type: propertyType,
          bhk: bhk,
          geoLat: geoLat,
          geoLong: geoLong,
          address: address,
          floorArea: floorArea,
          availableFrom: availableFrom,
          price: propertyPrice,
          furnished: furnished,
          userId: userId,
          pictureLink: pictureLink,
          approved: false,
          postedOn: utc,
          placeId: placeId
        }
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function editPropertyDetails(propertyId, propertyName, propertyType, bhk, geoLat, geoLong , address,
                         floorArea, availableFrom, propertyPrice, furnished,
                         userId, pictureLink, placeId) {
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      console.log("Service: "+placeId + " " + geoLat + " " + geoLong);
      var utc = new Date().toJSON().slice(0,10);
      var request = $http({
        method: "put",
        url: PROPERTY_URL + "/" + propertyId,
        params: {
          action: "put"
        },
        data: {
          propertyName: propertyName,
          type: propertyType,
          bhk: bhk,
          geoLat: geoLat,
          geoLong: geoLong,
          address: address,
          floorArea: floorArea,
          availableFrom: availableFrom,
          price: propertyPrice,
          furnished: furnished,
          userId: userId,
          pictureLink: pictureLink,
          approved: false,
          postedOn: utc,
          placeId: placeId
        }
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function getAllProperty() {
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "get",
        url: PROPERTY_URL
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function deleteProperty(propertyId) {
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "delete",
        url: PROPERTY_URL + "/" + propertyId
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function getPropertyFiltered(priceMin, priceMax, availableFrom, type, bhk, propertyName, address){
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "get",
        url: PROPERTY_URL + "/search/findByPriceBetweenAndAvailableFromGreaterThanEqualAndTypeAndBhkAndPropertyNameIgnoreCaseOrAddressIgnoreCase",
        params: {
          action: "get",
          priceMin: priceMin,
          priceMax: priceMax,
          availableFrom: availableFrom,
          type: type,
          bhk: bhk,
          propertyName: propertyName,
          address: address
        }
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function removeProperty( propertyId ) {
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "delete",
        url: PROPERTY_URL,
        params: {
          action: "delete"
        },
        data: {
          id: propertyId
        }
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function getAverageRating( propertyId ) {
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "get",
        url: REVIEW_URL + "/search/getAverageRating",
        params: {
          action: "get",
          propertyId: propertyId
        }
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function getAllReviewsByPropertyId( propertyId ) {
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "get",
        url: PROPERTY_URL + "/" + propertyId + "/reviewsList",
        params: {
          action: "get",
          propertyId: propertyId
        }
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function getPropertyById( propertyId ) {
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "get",
        url: PROPERTY_URL + "/" + propertyId,
        params: {
          action: "get"
        }
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function listMyProperties( userId ) {
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "get",
        url: PROPERTY_URL + "/search/findByUserId",
        params: {
          action: "get",
          userId: userId
        }
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function getOwnerByLink( propertyLink ) {
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "get",
        url: propertyLink + "/postedByUser",
        params: {
          action: "get"
        }
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function checkPropertyByPlaceId( placeId ) {
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "get",
        url: PROPERTY_URL + "/search/checkPropertyByPlaceId/",
        params: {
          action: "get",
          placeId: placeId
        }
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function addReview(userId, propertyId, rating, review) {
      //var utc = new Date().toJSON().slice(0,10);
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "post",
        url: REVIEW_URL,
        params: {
          action: "add"
        },
        data: {
          propertyId: propertyId,
          userId: userId,
          rating: rating,
          review: review
        }
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function verifyAddress(address) {
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "get",
        url: ADDRESS_VERIFY_URL,
        params: {
          address: address,
          key: myConfig.googleApiKey
        }
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function getPropertyPageByLink(link) {
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "get",
        url: link
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function getReviewByUserAndProperty(userId, propertyId){
      $ionicLoading.show({
        template: '<ion-spinner>'
      });
      var request = $http({
        method: "get",
        url: PROPERTY_URL + "/search/getReviewsByPropertyIdAndUserId",
        params: {
          userId: userId,
          propertyId: propertyId
        }
      });
      return( request.then( handleSuccess, handleError ) );
    }

    function handleError( response ) {
      // The API response from the server should be returned in a
      // nomralized format. However, if the request was not handled by the
      // server (or what not handles properly - ex. server error), then we
      // may have to normalize it on our end, as best we can.
      if (
        ! angular.isObject( response.data ) ||
        ! response.data.message
      ) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Server error',
          template: 'Server unreachable'
        });
        return( $q.reject( "An unknown error occurred." ) );
      }
      // Otherwise, use expected error message.
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Server error',
        template: response.data.message
      });
      return( $q.reject( response.data.message ) );
    }

    function handleErrorMapApi( response ) {
      // The API response from the server should be returned in a
      // nomralized format. However, if the request was not handled by the
      // server (or what not handles properly - ex. server error), then we
      // may have to normalize it on our end, as best we can.
      if (
        ! angular.isObject( response.data ) ||
        ! response.data.message
      ) {
        $ionicLoading.hide();
        return( $q.reject( "An unknown error occurred." ) );
      }
      $ionicLoading.hide();
      // Otherwise, use expected error message.
      return( $q.reject( response.data.message ) );
    }
    // I transform the successful response, unwrapping the application data
    // from the API response payload.
    function handleSuccess( response ) {
      $ionicLoading.hide();
      return( response.data );
    }
  }]);
