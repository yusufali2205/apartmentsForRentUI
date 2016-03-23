angular.module('app.controllers', [])

.controller('searchCtrl', function($scope) {

})

.controller('shortlistedPropertiesCtrl', function($scope) {

})

.controller('listYourPropertyCtrl', function($scope, PropertyRepo) {
  $scope.form = {
    propertyName: "",
    type: "",
    bhk: "",
    geoLat: "",
    geoLong: "",
    address: "",
    floorArea: "",
    availableFrom: "",
    price: "",
    furnished: "",
    userId: "",
    pictureLink: "",
    approved: false,
    postedOn: ""
  };

  $scope.addProperty = function() {
    PropertyRepo.addProperty($scope.form.propertyName, $scope.form.type, $scope.form.bhk, 0, 0,
      $scope.form.address, $scope.form.floorArea, $scope.form.availableFrom, $scope.form.price, $scope.form.furnished,
      1, "")
      .then(
        function (responseData) {
          console.log("-----Property Added-----");
          $scope.property = responseData;
        },
        function (errorMessage) {
          console.warn("-----Error-----");
          console.warn(errorMessage);
        }
      )
  }
})

.controller('loginCtrl', function($scope, UserRepo) {
  $scope.user = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    city: "",
    password: ""
  };

  $scope.login = function() {
    UserRepo.login($scope.user.email, $scope.user.password)
      .then(
        function(responseData){
        console.log("-----Login success-----");
          $scope.user = responseData;
      },
        function(errorMessage){
          console.warn( "-----Error-----" );
          console.warn( errorMessage );
        }
      );
  }
})

.controller('signupCtrl', function($scope, UserRepo) {
  $scope.form = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    city: "",
    userType: "user",
    password: ""
  };

  $scope.addUser = function() {
    // If the data we provide is invalid, the promise will be rejected,
    // at which point we can tell the user that something went wrong. In
    // this case, I'm just logging to the console to keep things very
    // simple.
    UserRepo.addUser($scope.form.firstName, $scope.form.lastName, $scope.form.email,
      $scope.form.phoneNo, $scope.form.city, $scope.form.userType, $scope.form.password)
      .then(
        function( responseData ) {
          /* Redirect to the home page */
          console.log("-----User added-----");
          console.log(responseData);
        },
        function( errorMessage ) {
          console.warn( "-----Error-----" );
          console.warn( errorMessage );
        }
      )
    ;
    // Reset the form once values have been consumed.
    $scope.form.name = "";
  };
})

.controller('manageListingsCtrl', function($scope) {

})

.controller('settingsCtrl', function($scope) {

})

.controller('addPicturesCtrl', function($scope) {

})

.controller('homeCtrl', function($scope) {

});
