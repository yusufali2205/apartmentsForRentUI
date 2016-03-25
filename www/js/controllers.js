angular.module('app.controllers', [])

.controller('searchCtrl', function($scope) {

})

.controller('shortlistedPropertiesCtrl', function($scope) {

})

.controller('listYourPropertyCtrl', function($scope, $rootScope, PropertyRepo, Camera) {
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

  $scope.getPhoto = function() {
    Camera.getPicture().then(function(imageURI) {
      $scope.form.pictureLink = imageURI;
      console.log(imageURI);
    }, function(err) {
      console.warn(err);
    });
  }

  $scope.addProperty = function() {
    PropertyRepo.addProperty($scope.form.propertyName, $scope.form.type, $scope.form.bhk, 0, 0,
      $scope.form.address, $scope.form.floorArea, $scope.form.availableFrom, $scope.form.price, $scope.form.furnished,
      $rootScope.userLogged.userId, "")
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

.controller('loginCtrl', function($scope, $location, $state, $rootScope, UserRepo) {
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
          $state.go('menu.home');
          console.log("-----Login success-----");
          console.log(responseData);
          UserRepo.getUserByEmail($scope.user.email)
            .then(
              function(response){
                $rootScope.userLogged = response;
                console.log("-----User Details Fetched-----");
                console.log(response);
              },
              function(error){
                console.warn( "-----Cannot get user details-----" );
                console.warn( error );
              }
            )
      },
        function(errorMessage){
          console.warn( "-----Login Error-----" );
          console.warn( errorMessage );
        }
      );
  }
})

.controller('signupCtrl', function($scope, $state, UserRepo) {
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
          $state.go("menu.login");
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

.controller('addPicturesCtrl', function($scope, Camera) {
  $scope.getPhoto = function() {
    Camera.getPicture().then(function(imageURI) {
      console.log(imageURI);
    }, function(err) {
      console.warn(err);
    });
  }
})

  .controller('menuCtrl', function($scope, $rootScope, UserRepo) {
    $scope.logout = function() {
      UserRepo.logout()
        .then(
          function(responseData){
            console.log("-----Logged Out-----");
            console.log(responseData);
            $rootScope.userLogged = false;
          },
          function(errorMessage){
            console.warn("-----Error-----");
            console.warn(errorMessage);
          }
        )
    }
  })

  .controller('ownerCtrl', function($scope, $stateParams, UserRepo) {
    var ownerId = $stateParams.ownerId;
    $scope.owner = {};
    $scope.getOwnerDetails = function() {
      UserRepo.getUserById(ownerId)
        .then(
          function(responseData){
            console.log("-----Owner Fetched-----");
            console.log(responseData);
            $scope.owner = responseData;
          },
          function(errorMessage) {
            console.warn("-----Error-----");
            console.warn(errorMessage);
          }
        )
    }
  })

  .controller('propertyDetailsCtrl', function($scope, $stateParams, $rootScope, PropertyRepo, UserRepo) {
    var propertyLink = $stateParams.propertyLink;
    $scope.propertyId = "";
    $scope.propertySelected = {};
    $scope.owner = {};
    $scope.avgRating = "";
    $scope.reviews = [];
    $scope.reviewCount = "";

    $scope.reviewForm ={
      userId: "",
      propertyId: "",
      rating: "",
      review: ""
    }

    $scope.getPropertyByLink = function() {
      $scope.propertySelected = $stateParams.propertyObj;

      PropertyRepo.getPropertyByLink(propertyLink)
        .then(
          function(responseData){
            console.log("-----Property Details Fetched-----");
            console.log(responseData);
            $scope.propertySelected = responseData;
            $scope.getOwnerDetails();
            $scope.getAllReviewsByPropertyLink();
          },
          function(errorMessage){
            console.warn( "-----Error-----" );
            console.warn( errorMessage );
          }
        )

    };

    $scope.getOwnerDetails = function() {
      UserRepo.getUserById($scope.propertySelected.userId)
        .then(
          function(responseData){
            console.log("-----Owner Fetched-----");
            console.log(responseData);
            $scope.owner = responseData;
          },
          function(errorMessage) {
            console.warn("-----Error-----");
            console.warn(errorMessage);
          }
        )
    };

    $scope.getAverageRating = function() {
      PropertyRepo.getAverageRating($scope.propertyId)
        .then(
          function(responseData){
            console.log("-----Avg rating Fetched-----");
            console.log(responseData);
            $scope.avgRating = responseData;
            console.log(responseData);
          },
          function(errorMessage) {
            console.warn("-----Error-----");
            console.warn(errorMessage);
          }
        )
    };

    $scope.getAllReviewsByPropertyLink = function() {
      PropertyRepo.getAllReviewsByPropertyLink(propertyLink)
        .then(
          function(responseData){
            console.log("-----Reviews Fetched-----");
            console.log(responseData);
            $scope.reviews = responseData._embedded.review;
            $scope.propertyId = responseData._embedded.review[0].propertyId;
            $scope.getAverageRating();
          },
          function(errorMessage) {
            console.warn("-----Error-----");
            console.warn(errorMessage);
          }
        )
    };

    $scope.addReview = function() {
      PropertyRepo.addReview($rootScope.userLogged.userId, $scope.propertyId, $scope.reviewForm.rating, $scope.reviewForm.review)
        .then(
          function(responseData){
            console.log("-----Review Posted-----");
            console.log(responseData);
            $scope.reviews.push(responseData);
            $scope.getAverageRating();
          },
          function(errorMessage) {
            console.warn("-----Error-----");
            console.warn(errorMessage);
          }
        )
    };

  })

.controller('homeCtrl', function($scope, PropertyRepo) {
  $scope.propertyList = [];
  $scope.getAllProperty = function() {
    PropertyRepo.getAllProperty()
      .then(
        function(responseData){
          console.log("-----Properties Fetched-----");
          console.log(responseData);
          $scope.propertyList = responseData._embedded.property;
        },
        function(errorMessage){
          console.warn( "-----Error-----" );
          console.warn( errorMessage );
        }
      )
      .finally(function() {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      })
  }
});
