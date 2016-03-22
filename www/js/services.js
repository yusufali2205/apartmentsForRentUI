angular.module('app.services', [])

.constant("myConfig", {
  "url": "http://localhost",
  "port": "8080"
})

.factory('BlankFactory', [function(){

}])

.service('UserRepo', ['myConfig', '$http', '$q', function(myConfig, $http, $q){
  var USER_URL = myConfig.url + ":" + myConfig.port + "/users";
  var LOGIN_URL = myConfig.url + ":" + myConfig.port + "/login";

  return({
    addUser: addUser,
    login: login,
    removeUser: removeUser
  });

  function addUser(firstName, lastName, email, phone, city, type, password) {
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
    var request = $http({
      method: "post",
      url: LOGIN_URL,
      params: {
        action: '/login',
        username: email,
        password: password
      }
    });
    return( request.then( handleSuccess, handleError ) );
  }

  function removeUser( email ) {
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
      return( $q.reject( "An unknown error occurred." ) );
    }
    // Otherwise, use expected error message.
    return( $q.reject( response.data.message ) );
  }
  // I transform the successful response, unwrapping the application data
  // from the API response payload.
  function handleSuccess( response ) {
    return( response.data );
  }
}]);
