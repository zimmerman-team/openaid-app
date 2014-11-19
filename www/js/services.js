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
    .factory('Activities', ['$http','$resource', function ($http, $resource) {
        return $resource(
            "http://dev.oipa.openaidsearch.org/api/v3/activities/:Id/?format=json",
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
    .factory('Regions', ['$http','$resource', function ($http, $resource) {
        return $resource(
            "http://dev.oipa.openaidsearch.org/api/v3/regions/?format=json",
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
    .factory('Countries', ['$http','$resource', function ($http, $resource) {
        return $resource(
            "http://dev.oipa.openaidsearch.org/api/v3/countries/?format=json",
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
    .factory('Sectors', ['$http','$resource', function ($http, $resource) {
        return $resource(
            "http://dev.oipa.openaidsearch.org/api/v3/sectors/?format=json",
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
    .factory('ActivityCount', ['$http','$resource', function ($http, $resource) {
        return $resource(
            "http://dev.oipa.openaidsearch.org/api/v3/activity-count/?format=json",
            {},
            {
                get: {
                    method: 'GET',
                    cache: true
                }
            }
        );
    }])
    .factory('FilterOptions', ['$http','$resource','LocalStorage', function ($http, $resource, LocalStorage) {
        var resource = $resource(
            "http://dev.oipa.openaidsearch.org/api/v3/activity-filter-options/?format=json",
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
