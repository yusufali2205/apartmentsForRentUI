angular.module('app.controllers', [])

.controller('searchCtrl', function($scope, PropertyRepo) {
  var utc = new Date();
  $scope.propertyList = [];
  $scope.links = {
    previousPage: null,
    nextPage: null,
    firstPage: null,
    lastPage: null
  };
  $scope.criteria = {
    priceMin: 0,
    priceMax: 5000,
    availableFrom: '2016-01-01',
    type: 'Apartment',
    bhk: '1',
    propertyName: ''
  };

  $scope.getFilteredProperty = function() {
    PropertyRepo.getPropertyFiltered($scope.criteria.priceMin, $scope.criteria.priceMax, $scope.criteria.availableFrom,
      $scope.criteria.type, $scope.criteria.bhk, $scope.criteria.propertyName, $scope.criteria.propertyName)
      .then(
        function(responseData){
          console.log("-----Properties Fetched-----");
          console.log(responseData);
          $scope.propertyList = responseData._embedded.property;
          if(responseData._links.prev) $scope.links.previousPage = responseData._links.prev.href;
          if(responseData._links.next) $scope.links.nextPage = responseData._links.next.href;
          if(responseData._links.first) $scope.links.firstPage = responseData._links.first.href;
          if(responseData._links.last) $scope.links.lastPage = responseData._links.last.href;
        },
        function(errorMessage){
          console.warn( "-----Error-----" );
          console.warn( errorMessage );
        }
      )
  };

  $scope.loadPageWithLink = function(link) {
    PropertyRepo.getPropertyPageByLink(link)
      .then(
        function(responseData){
          console.log("-----Properties Fetched-----");
          console.log(responseData);
          $scope.propertyList = responseData._embedded.property;
          if(responseData._links.prev) $scope.links.previousPage = responseData._links.prev.href;
          if(responseData._links.next) $scope.links.nextPage = responseData._links.next.href;
          if(responseData._links.first) $scope.links.firstPage = responseData._links.first.href;
          if(responseData._links.last) $scope.links.lastPage = responseData._links.last.href;
        },
        function(errorMessage){
          console.warn( "-----Error-----" );
          console.warn( errorMessage );
        }
      )
  }
})

.controller('shortlistedPropertiesCtrl', function($scope) {

})

.controller('listYourPropertyCtrl', function($scope, $rootScope, $localStorage, $ionicPopup, $state, $ionicHistory, PropertyRepo, Camera) {
  if ($localStorage.getObject('user') == null) {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('menu.login');
  }
  else {

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

  $scope.getPhoto = function () {
    Camera.getPicture().then(function (imageURI) {
      $scope.form.pictureLink = imageURI;
      console.log(imageURI);
      uploadPicture();
    }, function (err) {
      console.warn(err);
    });
  };
    /* for photo upload on s3*/
    $scope.creds = {
      bucket: '',
      access_key: '',
      secret_key: ''
    };

    var uploadPicture = function(fileName) {
      console.log("Calling upload");
      // Configure The S3 Object
      AWS.config.update({ accessKeyId: $scope.creds.access_key, secretAccessKey: $scope.creds.secret_key });
      AWS.config.region = 'us-west-2';
      var bucket = new AWS.S3({ params: { Bucket: $scope.creds.bucket } });

      if($scope.file) {
        var params = { Key: fileName, ContentType: $scope.file.type, Body: $scope.file, ServerSideEncryption: 'AES256' };

        bucket.putObject(params, function(err, data) {
            if(err) {
              // There Was An Error With Your S3 Config
              alert(err);
              return false;
            }
            else {
              // Success!
              alert('Upload Done:' +data);
            }
          })
          .on('httpUploadProgress',function(progress) {
            // Log Progress Information
            console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
          });
      }
      else {
        // No File Selected
        alert('No File Selected');
      }
    };
    /*photo upload on s3 finish*/

  $scope.autoFetchAddress = function () {
    PropertyRepo.verifyAddress($scope.form.address)
      .then(
        function (response) {
          console.log(response);
          if (response.status = "OK" && response.results.length != 0 && $scope.form.address != null) {
            if (response.results.length <= 1) {
              $scope.form.address = response.results[0].formatted_address;
            } else {
              $ionicPopup.alert({
                title: 'Multiple addresses found',
                template: 'Please provide more specific address.'
              });
            }
          } else if (response.status = "ZERO_RESULTS") {
            console.log("-----Invalid Address-----");
            $ionicPopup.alert({
              title: 'Address not found',
              template: 'Please enter a valid address\nTo avoid spam listings we verify if this address exists ' +
              'and our system could not find this address.'
            });
          } else {
            console.log("-----Trouble validating address-----");
            console.log(response);
            $ionicPopup.alert({
              title: 'Problem in address validation',
              template: response.status + "\nTry more specific address."
            });
          }
        },
        function (error) {
          console.log("-----Error in property verification-----");
          console.log(error);
        }
      )
  };

  $scope.addProperty = function () {
    /* First verify if the address is valid on google database */
    PropertyRepo.verifyAddress($scope.form.address)
      .then(
        function (verifierResponse) {
          /* For a valid address response should be OK and results should be 1
           * More than 1 results means we need more specific address.
           */
          if (verifierResponse.status = "OK" && verifierResponse.results.length <= 1) {
            /* Check if address already present in database using place-id
             * This is for not allowing users to post a property multiple times
             */
            console.log(verifierResponse);
            PropertyRepo.checkPropertyByPlaceId(verifierResponse.results[0].place_id)
              .then(
                function (duplicateCheckerResponse) {
                  /* if property not present, go ahead with adding the property
                   * 0 means not present, more than 1 means present
                   */
                  if (duplicateCheckerResponse < 1) {
                    $scope.form.address = verifierResponse.results[0].formatted_address;
                    var place_id = verifierResponse.results[0].place_id;
                    var geo_lat = verifierResponse.results[0].geometry.location.lat;
                    var geo_lng = verifierResponse.results[0].geometry.location.lng;
                    if($scope.file.name){
                      $scope.form.pictureLink = "propertyImages/" + $scope.file.name.split('.')[0] +
                        new Date().getTime() + '.' + $scope.file.name.split('.')[1];
                      uploadPicture($scope.form.pictureLink);
                    }
                    console.log('Picture Link:' +$scope.form.pictureLink);
                    console.log(place_id + " " + geo_lat + " " + geo_lng);
                    /* Adding the property */
                    PropertyRepo.addProperty($scope.form.propertyName, $scope.form.type, $scope.form.bhk, geo_lat, geo_lng,
                      $scope.form.address, $scope.form.floorArea, $scope.form.availableFrom, $scope.form.price, $scope.form.furnished,
                      $localStorage.getObject('user').userId, $scope.form.pictureLink, place_id)
                      .then(
                        function (responseData) {
                          console.log("-----Property Added-----");
                          $scope.property = responseData;
                        },
                        function (errorMessage) {
                          console.warn("-----Error while adding property-----");
                          console.warn(errorMessage);
                        }
                      )
                  }
                  /* if property is present, give error address already listed */
                  else {
                    console.log("-----Address already present in database-----");
                    $ionicPopup.alert({
                      title: 'Property already listed',
                      template: "This address is already listed. Please try another address."
                    });
                  }
                },
                function (duplicateCheckerError) {
                  console.log("-----Error checking address for duplicates-----");
                  console.log(duplicateCheckerError);
                }
              )

          } else if (verifierResponse.status = "ZERO_RESULTS") {
            console.log("-----Invalid Address-----");
            $ionicPopup.alert({
              title: 'Address not found',
              template: "Please enter a valid address."
            });
          } else {
            console.log("-----Trouble validating address-----");
            console.log(verifierResponse);
            $ionicPopup.alert({
              title: 'Problem in address validation',
              template: verifierResponse.status + "\nTry more specific address."
            });
          }

        },
        function (verifierError) {
          console.log("-----Error in property verification-----");
          console.log(verifierError);
        }
      )
  }
}
})

.controller('loginCtrl', function($scope, $location, $state, $rootScope, $ionicHistory, UserRepo, $localStorage) {
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
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $state.go('menu.home');
          console.log("-----Login success-----");
          console.log(responseData);
          UserRepo.getUserByEmail($scope.user.email)
            .then(
              function(response){
                $localStorage.setObject('user', response);
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

.controller('signupCtrl', function($scope, $state, $ionicHistory, UserRepo) {
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
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
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

.controller('manageListingsCtrl', function($scope, $rootScope, $localStorage, $state, $ionicHistory, PropertyRepo) {
  $scope.propertyList = [];
  $scope.getMyProperties = function () {
    if (!$localStorage.getObject('user')) {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('menu.login');
    }
    else {
      PropertyRepo.listMyProperties($localStorage.getObject('user').userId)
        .then(
          function (responseData) {
            console.log("-----My properties fetched-----");
            console.log(responseData);
            $scope.propertyList = responseData._embedded.property;
          },
          function (errorMessage) {
            console.warn("-----Error fetching my properties-----");
            console.warn(errorMessage);
          }
        )
        .finally(function () {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        })
    }
  };
})

  .controller('editPropertyDetailsCtrl', function($scope, $stateParams, $rootScope, $localStorage, $ionicPopup, $state, $ionicHistory, PropertyRepo) {
    if ($localStorage.getObject('user') == null) {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('menu.login');
    }
    else {

    var propertyId = $stateParams.propertyId;
    console.log(propertyId);
    $scope.propertyId = propertyId;
    $scope.propertySelected = {};
    $scope.editMode = false;
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

    $scope.getPropertyById = function () {
      PropertyRepo.getPropertyById(propertyId)
        .then(
          function (responseData) {
            console.log("-----Property Details Fetched-----");
            console.log(responseData);
            $scope.propertySelected = responseData;
            $scope.form = {
              propertyName: responseData.propertyName,
              type: responseData.type,
              bhk: responseData.bhk,
              geoLat: responseData.geoLat,
              geoLong: responseData.geoLong,
              address: responseData.address,
              floorArea: responseData.floorArea,
              availableFrom: new Date(responseData.availableFrom),
              price: responseData.price,
              furnished: responseData.furnished,
              userId: responseData.userId,
              pictureLink: responseData.pictureLink,
              approved: responseData.approved,
              postedOn: responseData.postedOn
            };
          },
          function (errorMessage) {
            console.warn("-----Error-----");
            console.warn(errorMessage);
          }
        )

    };

    $scope.onEdit = function () {
      if ($scope.editMode == true) {
        $scope.editMode = false;
      }
      else $scope.editMode = true;
    };

    $scope.onUpdate = function () {
      PropertyRepo.editPropertyDetails($scope.propertyId, $scope.form.propertyName, $scope.form.type,
        $scope.form.bhk, $scope.form.geoLat, $scope.form.geoLong, $scope.form.address, $scope.form.floorArea,
        $scope.form.availableFrom, $scope.form.price, $scope.form.furnished, $scope.form.userId,
        $scope.form.pictureLink, $scope.propertySelected.propertyId)
        .then(
          function (responseData) {
            console.log("-----Property details updated-----");
            console.log(responseData);
            $scope.editMode = false;
            $scope.propertySelected = responseData;
          },
          function (error) {
            console.log("-----Error in updating property details-----");
            console.log(error);
          }
        )
    };

    $scope.onUnlist = function () {

    };

    $scope.onDelete = function () {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete',
        template: 'Are you sure you want to delete this property? (This action cannot be reversed)'
      });

      confirmPopup.then(function (res) {
        if (res) {
          PropertyRepo.deleteProperty(propertyId)
            .then(
              function (response) {
                console.log("-----Property deleted-----");
                console.log(response);
                $ionicHistory.nextViewOptions({
                  disableBack: true
                });
                $state.go('menu.manageListings');
              },
              function (error) {
                console.log("-----Error in property deletion-----");
                console.log(error);
              }
            )

        } else {
        }
      });
    }
  }
})

.controller('settingsCtrl', function($scope, $rootScope, $localStorage, $ionicHistory, $state, UserRepo) {
  if ($localStorage.getObject('user') == null) {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('menu.login');
  }
  else {
    $scope.userLogged = $localStorage.getObject('user');
    $scope.user = {
      firstName: $localStorage.getObject('user').firstName,
      lastName: $localStorage.getObject('user').lastName,
      phoneNo: $localStorage.getObject('user').phoneNo,
      userId: $localStorage.getObject('user').userId,
      email: $localStorage.getObject('user').email,
      city: $localStorage.getObject('user').city
    };

    $scope.onEdit = function(){
      if ($scope.editMode == true) {
        $scope.editMode = false;
      }
      else $scope.editMode = true;
    };

    $scope.onUpdate = function () {
      UserRepo.updateUser($scope.user.userId, $scope.user.email, $scope.user.firstName, $scope.user.lastName,
        $scope.user.phoneNo, $scope.user.city, $localStorage.getObject('user').password)
        .then(
          function (responseData) {
            console.log("-----User details updated-----");
            console.log(responseData);
            $scope.editMode = false;
            $localStorage.setObject('user', responseData);
            $scope.userLogged = $localStorage.getObject('user');
          },
          function (error) {
            console.log("-----Error in updating user details-----");
            console.log(error);
          }
        )
    };
  }
})

.controller('addPicturesCtrl', function($scope, $rootScope, $localStorage, $ionicHistory, $state, Camera) {
  if ($localStorage.getObject('user') == null) {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('menu.login');
  }
  else {
    $scope.imagePath = "";
    $scope.getPhoto = function() {
      Camera.getPicture().then(function(imageURI) {
        $scope.imagePath = imageURI;
        console.log(imageURI);
      }, function(err) {
        console.warn(err);
      });
    }

  }


})

  .controller('menuCtrl', function($scope, $rootScope, $ionicHistory, $state, UserRepo, $localStorage) {
    $scope.userLogged = $localStorage.getObject('user');
    console.log($scope.userLogged);
    $scope.logout = function() {
      UserRepo.logout()
        .then(
          function(responseData){
            console.log("-----Logged Out-----");
            console.log(responseData);
            $localStorage.remove('user');
            $scope.userLogged = null;
            $ionicHistory.nextViewOptions({
              disableBack: true
            });
            $state.go('menu.login');
          },
          function(errorMessage){
            console.warn("-----Error-----");
            console.warn(errorMessage);
          }
        )
    };

    $scope.checkUser = function(){
      $scope.userLogged = $localStorage.getObject('user');    }
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

  .controller('propertyDetailsCtrl', function($scope, $stateParams, $rootScope, $localStorage, PropertyRepo, UserRepo) {
    var propertyId = $stateParams.propertyId;
    $scope.userLogged = $localStorage.getObject('user');
    console.log(propertyId);
    $scope.propertyId = propertyId;
    $scope.propertySelected = {};
    $scope.owner = {};
    $scope.avgRating = "";
    $scope.reviews = [];
    $scope.myReview = [];
    $scope.reviewCount = "";
    $scope.navigateURL = "";
    $scope.mapImageURL = "";

    $scope.reviewForm ={
      userId: "",
      propertyId: "",
      rating: "",
      review: ""
    };

    $scope.getPropertyById = function() {

      PropertyRepo.getPropertyById(propertyId)
        .then(
          function(responseData){
            console.log("-----Property Details Fetched-----");
            console.log(responseData);
            $scope.propertySelected = responseData;
            $scope.mapImageURL = "https://maps.googleapis.com/maps/api/staticmap?center=" + responseData.geoLat
              + "," + responseData.geoLong + "zoom=12&size=450x450&markers=color:red%7C" + responseData.geoLat + ","
              + responseData.geoLong;
            $scope.navigateURL = "http://maps.google.com/?q=" + responseData.geoLat + "," + responseData.geoLong;
            $scope.getOwnerDetails();
            $scope.getAllReviewsByPropertyId();
            $scope.getMyReviews();
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

    $scope.getAllReviewsByPropertyId = function() {
      PropertyRepo.getAllReviewsByPropertyId(propertyId)
        .then(
          function(responseData){
            console.log("-----Reviews Fetched-----");
            console.log(responseData);
            if(responseData._embedded.review.length>0){
              $scope.reviews = responseData._embedded.review;
              $scope.getAverageRating();
            }

          },
          function(errorMessage) {
            console.warn("-----Error-----");
            console.warn(errorMessage);
          }
        )
    };

    $scope.addReview = function() {
      PropertyRepo.addReview($localStorage.getObject('user').userId, $scope.propertyId, $scope.reviewForm.rating, $scope.reviewForm.review)
        .then(
          function(responseData){
            console.log("-----Review Posted-----");
            console.log(responseData);
            $scope.reviews.push(responseData);
            $scope.myReview.push(responseData);
            $scope.getAverageRating();
          },
          function(errorMessage) {
            console.warn("-----Error-----");
            console.warn(errorMessage);
          }
        )
    };

    $scope.getMyReviews = function(){
      if($localStorage.getObject('user')){
        PropertyRepo.getReviewByUserAndProperty($localStorage.getObject('user').userId, $scope.propertyId)
          .then(
            function(responseData){
              console.log("-----My reviews fetched-----");
              console.log(responseData);
              $scope.myReview = responseData._embedded.review;
            },
            function(errorMessage){
              console.log("-----Error in getting my reviews-----");
              console.log(errorMessage);
            }
          )
      }
    }

  })

.controller('homeCtrl', function($scope, PropertyRepo) {
  $scope.propertyList = [];
  $scope.links = {
    previousPage: null,
    nextPage: null,
    firstPage: null,
    lastPage: null
  };

  $scope.getAllProperty = function() {
    PropertyRepo.getAllProperty()
      .then(
        function(responseData){
          console.log("-----Properties Fetched-----");
          console.log(responseData);
          $scope.propertyList = responseData._embedded.property;
          if(responseData._links.prev) $scope.links.previousPage = responseData._links.prev.href;
          if(responseData._links.next) $scope.links.nextPage = responseData._links.next.href;
          if(responseData._links.first) $scope.links.firstPage = responseData._links.first.href;
          if(responseData._links.last) $scope.links.lastPage = responseData._links.last.href;
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
  };


  $scope.loadPageWithLink = function(link) {
    PropertyRepo.getPropertyPageByLink(link)
      .then(
        function(responseData){
          console.log("-----Properties Fetched-----");
          console.log(responseData);
          $scope.propertyList = responseData._embedded.property;
          if(responseData._links.prev) $scope.links.previousPage = responseData._links.prev.href;
          if(responseData._links.next) $scope.links.nextPage = responseData._links.next.href;
          if(responseData._links.first) $scope.links.firstPage = responseData._links.first.href;
          if(responseData._links.last) $scope.links.lastPage = responseData._links.last.href;
        },
        function(errorMessage){
          console.warn( "-----Error-----" );
          console.warn( errorMessage );
        }
      )
  }

});
