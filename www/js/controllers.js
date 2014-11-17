angular.module('starter.controllers', ['ionic'])
    .controller('MainCtrl', function($rootScope, $scope, $ionicSideMenuDelegate, LocalStorage) {
        $scope.hideBackButton = true;

        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.showSearch = function (){
            $scope.searchBar = true;
            if(window.StatusBar) {
                // Set StatusBar to dark text, because searchbox is white.
                StatusBar.styleDefault();
            }
        };

        $scope.closeSearch = function (){
            $scope.hideSearch();
            $scope.removeSearchQuery();
        };

        $scope.hideSearch = function (){
            $scope.searchBar = false;

            if(window.StatusBar) {
                // Reset statusbar text color to white.
                StatusBar.styleBlackTranslucent();
            }
        };

        $scope.updateSearchQuery = function(query){
            if(typeof query != 'undefined'){
                LocalStorage.set('filterSearch', query);
            }

            $rootScope.$broadcast('searchBar.activityRefresh');
        };

        $scope.removeSearchQuery = function(){
            $scope.search = "";
            $scope.updateSearchQuery("");
        };

        $scope.$watchCollection('search', function() {
            $scope.updateSearchQuery($scope.search);
        });
    })
    .controller('HomeCtrl', function ($scope) {
        $scope.hideBackButton = true;
    })
    .controller('ActivitiesCtrl', function ($scope, $ionicModal, Activities, Regions, LocalStorage) {
        $scope.hideBackButton = true;

        $scope.queryParams = {
            limit: 50
        };

        var updateQueryParams = function() {

            var region = LocalStorage.get('filterRegion');
            var country = LocalStorage.get('filterCountry');
            var sector = LocalStorage.get('filterSector');
            var search = LocalStorage.get('filterSearch');

            if (region){
                $scope.queryParams.regions__in = region;
            }

            if (country){
                $scope.queryParams.countries__in = country;
            }

            if (sector){
                $scope.queryParams.sectors__in = sector;
            }

            if (search){
                $scope.queryParams.query = search;
            }
        };

        $scope.activities = [];

        $scope.loadActivities = function(queryParams) {
            $scope.loadingFinished = false;
            $scope.meta = Activities.meta(queryParams,function(){
                $scope.totalCount = $scope.meta.total_count;
                queryParams.offset = $scope.activities.length;

                var remainingActivities = $scope.totalCount-$scope.activities.length;

                if (remainingActivities < 50){
                    queryParams.limit = remainingActivities;
                } else {
                    queryParams.limit = 50;
                }
            });

            var results = Activities.query(queryParams, function () {
                // on complete
                // $scope.activities array is appended with new entries once data has been loaded by ngresource
                $scope.activities = $scope.activities.concat(results);
                $scope.loadingFinished = true;
            });
        };

        updateQueryParams();
        $scope.loadActivities($scope.queryParams);

        $scope.$on('searchBar.activityRefresh', function(event, args) {
            $scope.reloadActivities();
        });

        $scope.loadMoreActivities = function () {
            $scope.queryParams.offset = $scope.currentIndex;
            $scope.loadActivities($scope.queryParams);
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };

        $scope.$on('$destroy', function () {
            $scope.hideSearch();
        });

        $scope.resetFilters = function (){
            LocalStorage.set("filterRegion","");
            LocalStorage.set("filterSearch","");
            LocalStorage.set("filterCountry","");
            LocalStorage.set("filterSector","");
            $scope.reloadActivities();
        };

        $scope.reloadActivities = function () {
            $scope.activities = [];
            $scope.currentIndex = 0;
            $scope.queryParams = {};
            $scope.queryParams.offset = 0;
            updateQueryParams();
            $scope.loadActivities($scope.queryParams);
        };
        $scope.moreDataCanBeLoaded = function (){
            return $scope.activities.length < $scope.meta.total_count;
        }

    })
    .controller('ActivityDetailCtrl', function ($rootScope, $scope, $stateParams, $ionicNavBarDelegate, $ionicSideMenuDelegate, Activities, $ionicPopup, $ionicLoading) {
        $scope.hideBackButton = false;
        $scope.hideNavButton = true;
        $ionicSideMenuDelegate.canDragContent(false);

        $scope.$on('$destroy',function(){
            $ionicSideMenuDelegate.canDragContent(true);
            $scope.hideNavButton = false;

            if($scope.search){
                $scope.showSearch();
            }

        });

        $ionicLoading.show({
            template: 'Loading...'
        });
        var loaded = false;

        $scope.onSwipe = function () {
            $ionicNavBarDelegate.back();
        };

        $scope.activity = Activities.get({'Id': $stateParams.activityId}, function() {
            $ionicLoading.hide();
            loaded = true;
        });

        setTimeout(function() {
            if(!loaded){
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                    title: 'Connection failed',
                    template: 'Can not connect to server'
                });
            }
        }, 3000)
    })

    .controller('FilterCtrl', function($scope, LocalStorage, FilterOptions, Activities) {
        $scope.budget = {};

        // Creates a params object necessary for the meta query.
        var updateQueryParams = function() {
            var queryParams = {};
            var region = LocalStorage.get('filterRegion');
            var country = LocalStorage.get('filterCountry');
            var sector = LocalStorage.get('filterSector');
            var search = LocalStorage.get('filterSearch');

            if (region){
                queryParams.regions__in = region;
            }

            if (country){
                queryParams.countries__in = country;
            }

            if (sector){
                queryParams.sectors__in = sector;
            }

            if (search){
                queryParams.query = search;
            }
            return queryParams;
        };

        // Queries OIPA for the number of activities
        // by retrieving the meta data.
        var getNumberActivities = function(){
            var params = updateQueryParams();
            var meta = Activities.meta(params, function(){
               $scope.acts = meta.total_count;
            })
        };



        getNumberActivities();

        // On startup, get all filterOptions from the API, add
        // them to the scope and then select the one in memory if applicable
        var filterOptions = FilterOptions.get(function () {
            $scope.filterForm = {
                region: "No filter",
                country: "No filter",
                sector: "No filter"
            };

            $scope.regions = filterOptions.regions;
            $scope.countries = filterOptions.countries;
            $scope.sectors = filterOptions.sectors;

            var region = LocalStorage.get('filterRegion');
            if(region){
                $scope.filterForm.region = filterOptions.regions[region].name;
            }

            var country = LocalStorage.get('filterCountry');
            if(country){
                $scope.filterForm.country = filterOptions.countries[country].name;
            }

            var sector = LocalStorage.get('filterSector');
            if(sector){
                $scope.filterForm.sector = filterOptions.sectors[sector].name;
            }
        });

        $scope.resetFilters = function(){
            $scope.filterForm.region = "No filter";
            LocalStorage.set("filterRegion","");
            $scope.filterForm.country = "No filter";
            LocalStorage.set("filterCountry","");
            $scope.filterForm.sector = "No filter";
            LocalStorage.set("filterSector","");
            getNumberActivities();
        };

        // Converts name to code (e.g. Netherlands to NL)
        // or returns an empty string indicating that no filter is applied.
        var getCode = function(name, arr){
            if (!name || name == "No filter"){
                return "";
            }
            for (var object in arr){
                if(arr[object].name == name){
                    return object;
                }
            }
        };

        // update functions are used in combination with ng-change to update when the user
        // selects a different option.
        $scope.updateRegion = function (region){
            LocalStorage.set('filterRegion', getCode(region, $scope.regions));
            getNumberActivities();
        };

        $scope.updateCountry = function (country){
            LocalStorage.set('filterCountry', getCode(country, $scope.countries));
            getNumberActivities();
        };

        $scope.updateSector = function (sector){
            LocalStorage.set('filterSector', getCode(sector, $scope.sectors));
            getNumberActivities();

        };
    })

    // StatusBar specifically for iOS. turns the statusBar black when sidemenu is opened
    .directive('fadeBar', function($timeout, $ionicSideMenuDelegate) {
        if(!ionic.Platform.isIOS()){
            return {
                restrict: 'E',
                template: '',
                replace: true
            }
        }
        return {
            restrict: 'E',
            template: '<div class="fade-bar"></div>',
            replace: true,
            link: function($scope, $element, $attr) {
                // Status bar fade is only useful on iOS
                if(ionic.Platform.isIOS()) {
                    // Run in the next scope digest
                    $timeout(function () {
                        // Watch for changes to the openRatio which is a value between 0 and 1 that says how "open" the side menu is
                        $scope.$watch(function () {
                            return $ionicSideMenuDelegate.getOpenRatio();
                        }, function (ratio) {
                            // Set the transparency of the fade bar
                            $element[0].style.width =  (200 * Math.abs(ratio))+"px";
                        });
                    });
                }
            }
        }
    });


