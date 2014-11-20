angular.module('openaid.directives', ['openaid.d3'])
    .directive('disableSideMenu', [
        '$ionicSideMenuDelegate',
        function ($ionicSideMenuDelegate) {
            return {
                restrict: 'A',
                link: function (scope, element) {
                    element.on('touch', function () {
                        scope.$apply(function () {
                            $ionicSideMenuDelegate.canDragContent(false);
                        });
                    });

                    element.on('release', function () {
                        scope.$apply(function () {
                            $ionicSideMenuDelegate.canDragContent(true);
                        });
                    });
                }
            };
        }
    ])
    .directive('d3Bars', ['$window', '$timeout', 'd3Service',
        function ($window, $timeout, d3Service) {
            return {
                restrict: 'A',
                scope: {
                    data: '=',
                    label: '@',
                    onClick: '&'
                },
                link: function (scope, ele, attrs) {
                    d3Service.d3().then(function (d3) {

                        var renderTimeout;
                        var margin = parseInt(attrs.margin) || 20,
                            barHeight = parseInt(attrs.barHeight) || 20,
                            barPadding = parseInt(attrs.barPadding) || 5;

                        var animation = true;

                        var transitionDuration = parseInt(attrs.transitionDuration) || 1000;

                        var svg = d3.select(ele[0])
                            .append('svg')
                            .style('width', '100%');

                        $window.onresize = function () {
                            scope.$apply();
                        };

                        scope.$watch(function () {
                            return angular.element($window)[0].innerWidth;
                        }, function () {
                            scope.render(scope.data);
                        });

                        scope.$watch('data', function (newData) {
                            scope.render(newData);

                        }, true);

                        scope.render = function (data) {
                            svg.selectAll('*').remove();

                            if (!data) return;


                            //if (renderTimeout) clearTimeout(renderTimeout);

                            //renderTimeout = $timeout(function () {
                                var width = d3.select(ele[0])[0][0].offsetWidth - margin,
                                    height = scope.data.length * (barHeight + barPadding),
                                    color = d3.scale.category20(),
                                    xScale = d3.scale.linear()
                                        .domain([0, d3.max(data, function (d) {
                                            return d.value;
                                        })])
                                        .range([0, width]);

                                svg.attr('height', height);

                                var rects = svg.selectAll('rect')
                                    .data(data)
                                    .enter()
                                    .append('rect')
                                    .on('click', function (d, i) {
                                        return scope.onClick({item: d});
                                    })
                                    .attr('height', barHeight)
                                    .attr('x', Math.round(margin / 2))
                                    .attr('y', function (d, i) {
                                        return i * (barHeight + barPadding);
                                    })
                                    .attr('fill', function (d) {
                                        return color(d.value);
                                    })
                                    .transition()
                                    .duration(2000)
                                    .attr('width', function (d) {
                                        return xScale(d.value);
                                    });
                                svg.selectAll('text')
                                    .data(data)
                                    .enter()
                                    .append('text')
                                    .on('click', function (d, i) {
                                        return scope.onClick({item: d});
                                    })
                                    .attr('fill', '#000')
                                    .attr('font-size', '12px')
                                    .attr('y', function (d, i) {
                                        return i * (barHeight + barPadding) + 15;
                                    })
                                    .attr('x', 15)
                                    .text(function (d) {
                                        return d.text;
                                    });
                            //}, 200);
                        };
                    });
                }
            }
        }]);