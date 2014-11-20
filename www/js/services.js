var tastypieDataTransformer = function ($http) {
    return $http.defaults.transformResponse.concat([
        function (data, headersGetter) {
            var result = data.objects;
            return result;
        }
    ])
};

angular.module('openaid.services', ['ngResource'])

/**
 * A simple example service that returns some data.
 */
    .factory('Activities', ['$http','$resource', 'APPINFO', function ($http, $resource, APPINFO) {
        return $resource(
            APPINFO.OIPA_URL + "/activities/:Id/?format=json",
            {Id: "@Id"},
            {
                query: {
                    method: 'GET',
                    isArray: true,
                    cache: true,
                    params: {
                        'select_fields': "id,titles",
                        count: false
                    },
                    transformResponse: tastypieDataTransformer($http)
                },
                meta: {
                    method: 'GET',
                    params: {
                        'select_fields': "none"
                    },
                    transformResponse: $http.defaults.transformResponse.concat([
                        function (data, headersGetter) {
                            var result = data.meta;
                            return result;
                        }
                    ])
                },
                get: {
                    method: 'GET',
                    cache: true
                }
            }
        );
    }])
    .factory('Regions', ['$http','$resource', 'APPINFO', function ($http, $resource, APPINFO) {
        return $resource(
            APPINFO.OIPA_URL + "/regions/?format=json",
            {limit: 0},
            {
                all: {
                    method: 'GET',
                    isArray: true,
                    cache: true,
                    transformResponse: tastypieDataTransformer($http)
                },
                get: {
                    method: 'GET'
                }
            }
        );
    }])
    .factory('Countries', ['$http','$resource', 'APPINFO', function ($http, $resource, APPINFO) {
        return $resource(
            APPINFO.OIPA_URL + "/countries/?format=json",
            {limit: 0},
            {
                all: {
                    method: 'GET',
                    isArray: true,
                    cache: true,
                    transformResponse: tastypieDataTransformer($http)
                },
                get: {
                    method: 'GET'
                }
            }
        );
    }])
    .factory('Sectors', ['$http','$resource', 'APPINFO', function ($http, $resource, APPINFO) {
        return $resource(
            APPINFO.OIPA_URL + "/sectors/?format=json",
            {limit: 0},
            {
                all: {
                    method: 'GET',
                    isArray: true,
                    cache: true,
                    transformResponse: tastypieDataTransformer($http)
                },
                get: {
                    method: 'GET'
                }
            }
        );
    }])
    .factory('ActivityCount', ['$http','$resource', 'APPINFO', function ($http, $resource, APPINFO) {
        return $resource(
            APPINFO.OIPA_URL + "/activity-count/?format=json",
            {},
            {
                get: {
                    method: 'GET',
                    cache: true
                }
            }
        );
    }])
    .factory('ActivityAggregate', ['$http','$resource', 'APPINFO', function ($http, $resource, APPINFO) {
        return $resource(
            APPINFO.OIPA_URL + "/activity-aggregate-any/?format=json",
            {},
            {
                get: {
                    isArray: true,
                    method: 'GET',
                    cache: true
                }
            }
        );
    }])
    .factory('FilterOptions', ['$http','$resource','APPINFO','LocalStorage', function ($http, $resource, APPINFO, LocalStorage) {
        var resource = $resource(
            APPINFO.OIPA_URL + "/activity-filter-options/?format=json",
            {},
            {
                all: {
                    method: 'GET',
                    cache: true
                }
            }
        );
        var filterOptions;

        return {
            get: function(func){
                var needLoad = false;

                if(!filterOptions){
                    var cachedFilterOptions = LocalStorage.getObject("filterOptions");

                    if (Object.keys(cachedFilterOptions).length !== 0){
                        filterOptions = cachedFilterOptions;
                    }
                    else {
                        needLoad = true;
                        filterOptions = resource.all(function(){
                            LocalStorage.setObject("filterOptions",filterOptions);
                            func();
                        });
                    }
                }
                if(!needLoad)
                {
                    setTimeout(func, 50);
                }
                return filterOptions;
            }
        };

    }])
    .factory('LocalStorage', ['$window', function($window) {
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
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }]);
