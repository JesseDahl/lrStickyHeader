(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module unless amdModuleId is set
        define([], function () {
            return (global['lrStickyHeader'] = factory(global));
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(global);
    } else {
        global['lrStickyHeader'] = factory(global);
    }
})(window, function factory (window) {
    'use strict';
    function getOffset (element, property) {
        var offset = element[property];
        var parent = element;
        while ((parent = parent.offsetParent) !== null) {
            offset += parent[property];
        }
        return offset;
    }

    var sticky = {
        //todo some memoize stuff
        setWidth: function setWidth () {
            var firstRow = this.tbody.getElementsByTagName('TR')[0];
            var trh = this.thead.getElementsByTagName('TR')[0];
            var firstTds;
            var firstThs;

            function setCellWidth (cell) {
                cell.style.width = cell.offsetWidth + 'px';
            }

            if (firstRow && trh) {
                firstTds = firstRow.getElementsByTagName('TD');
                firstThs = trh.getElementsByTagName('TH');

                [].forEach.call(firstTds, setCellWidth);
                [].forEach.call(firstThs, setCellWidth);
            }
        },
        eventListener: function eventListener () {
            var offsetTop = getOffset(this.thead, 'offsetTop') - Number(this.headerHeight);
            var offsetLeft = getOffset(this.thead, 'offsetLeft');
            var classes = this.thead.className.split(' ');

            if (this.stick !== true && (offsetTop - window.scrollY < 0)) {
                this.stick = true;
                this.treshold = offsetTop;
                this.setWidth();
                this.thead.style.left = offsetLeft + 'px';
                this.thead.style.top = Number(this.headerHeight) + 'px';
                setTimeout(function () {
                    classes.push('lr-sticky-header');
                    this.thead.style.position = 'fixed';
                    this.thead.className = classes.join(' ');
                }.bind(this), 0);
            }

            if (this.stick === true && (this.treshold - window.scrollY > 0)) {
                this.stick = false;
                this.thead.style.position = 'initial';
                classes.splice(classes.indexOf('lr-sticky-header'), 1);
                this.thead.className = (classes).join(' ');
            }
        },
        resizeListener: function resizeListener() {
            var that = this;

            var resizeTimeout;
            function resizeThrottler() {
                // ignore resize events as long as an actualResizeHandler execution is in the queue
                if ( !resizeTimeout ) {
                    resizeTimeout = setTimeout(function() {
                        resizeTimeout = null;

                        if (that.thead.classList.contains("lr-sticky-header")) {
                            actualResizeHandler();
                        }

                        // The actualResizeHandler will execute at a rate of 15fps
                    }, 66);
                }
            }

            function actualResizeHandler() {
                var firstRow = that.tbody.getElementsByTagName('TR')[0];
                var trs = that.thead.getElementsByTagName('TR');
                var trh = trs[trs.length - 1];
                var firstTds;
                var firstThs;

                setTimeout(function() {
                    if (firstRow && trh) {
                        firstTds = firstRow.getElementsByTagName('TD');
                        firstThs = trh.getElementsByTagName('TH');

                        for (var i = 0; i < firstTds.length; i++) {
                            firstThs[i].style.width = firstTds[i].offsetWidth + 'px';
                        }
                    }
                }, 20);
            }

            resizeThrottler();
        }
    };

    return function lrStickyHeader (tableElement, options) {
        var headerHeight = 0;
        if (options&&options.headerHeight)
            headerHeight=options.headerHeight;

        var thead;
        var tbody;

        if (tableElement.tagName !== 'TABLE') {
            throw new Error('lrStickyHeader only works on table element');
        }
        tbody = tableElement.getElementsByTagName('TBODY');
        thead = tableElement.getElementsByTagName('THEAD');

        if (!thead.length) {
            throw new Error('could not find the thead group element');
        }

        if (!tbody.length) {
            throw new Error('could not find the tbody group element');
        }

        thead = thead[0];
        tbody = tbody[0];


        var stickyTable = Object.create(sticky, {
            element: {value: tableElement},
            headerHeight: {
                get: function () {
                    return headerHeight;
                }
            },
            thead: {
                get: function () {
                    return thead;
                }
            },
            tbody: {
                get: function () {
                    return tbody;
                }
            }
        });

        var listener = stickyTable.eventListener.bind(stickyTable);
        var resizeThrottler = stickyTable.resizeListener.bind(stickyTable);

        window.addEventListener('scroll', listener);
        window.addEventListener("resize", resizeThrottler, false);


        stickyTable.clean = function clean () {
            window.removeEventListener('scroll', listener);
        };

        return stickyTable;
    };
});

