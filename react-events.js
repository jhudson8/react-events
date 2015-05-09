/*!
 * react-events v1.0.1
 * https://github.com/jhudson8/react-events
 *
 *
 * Copyright (c) 2014 Joe Hudson<joehud_AT_gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function(main) {
    if (typeof define === 'function' && define.amd) {
        define(['react-mixin-manager'], function(ReactMixinManager) {
            // AMD
            return main(ReactMixinManager);
        });
    } else if (typeof exports !== 'undefined' && typeof require !== 'undefined') {
        // CommonJS
        module.exports = main(require('react-mixin-manager'));
    } else {
        // browser
        ReactEvents = main(ReactMixinManager);
    }
})(function(ReactMixinManager) {

    var handlers = {},
        patternHandlers = [],
        splitter = /^([^:]+):?(.*)/,
        specialWrapper = /^\*([^\(]+)\(([^)]*)\)[->:]*(.*)/,
        noArgMethods = ['forceUpdate'],
        setState = ReactMixinManager.setState,
        getState = ReactMixinManager.getState,
        namespace = 'react-events' + '.';

    /**
     *  Allow events to be referenced in a hierarchical structure.  All parts in the
     * hierarchy will be appended together using ":" as the separator
     * window: {
     *   scroll: 'onScroll',
     *   resize: 'onResize'
     * }
     * will return as
     * {
     *   'window:scroll': 'onScroll',
     *   'window:resize': 'onResize'
     * }
     }
     */
    function normalizeEvents(events, rtn, prefix) {
        rtn = rtn || {};
        if (prefix) {
            prefix += ':';
        } else {
            prefix = '';
        }
        var value, valueType;
        for (var key in events) {
            if (events.hasOwnProperty(key)) {
                value = events[key];
                valueType = typeof value;
                if (valueType === 'string' || valueType === 'function') {
                    rtn[prefix + key] = value;
                } else if (value) {
                    normalizeEvents(value, rtn, prefix + key);
                }
            }
        }
        return rtn;
    }

    /**
     * Internal model event binding handler
     * (type(on|once|off), {event, callback, context, target})
     */
    function manageEvent(type, data) {
        /*jshint validthis:true */
        var _data = {
            type: type
        };
        for (var name in data) {
            if (data.hasOwnProperty(name)) {
                _data[name] = data[name];
            }
        }
        var watchedEvents = getState('__watchedEvents', this);
        if (!watchedEvents) {
            watchedEvents = [];
            setState({
                __watchedEvents: watchedEvents
            }, this);
        }
        _data.context = _data.context || this;
        watchedEvents.push(_data);

        // bind now if we are already mounted (as the mount function won't be called)
        var target = getTarget(_data.target, this);
        if (this.isMounted()) {
            if (target) {
                target[_data.type](_data.event, _data.callback, _data.context);
            }
        }
        if (type === 'off') {
            var watchedEvent;
            for (var i = 0; i < watchedEvents.length; i++) {
                watchedEvent = watchedEvents[i];
                if (watchedEvent.event === data.event &&
                    watchedEvent.callback === data.callback &&
                    getTarget(watchedEvent.target, this) === target) {
                    watchedEvents.splice(i, 1);
                }
            }
        }
    }

    // bind all registered events to the model
    function _watchedEventsBindAll(context) {
        var watchedEvents = getState('__watchedEvents', context);
        if (watchedEvents) {
            var data;
            for (var name in watchedEvents) {
                if (watchedEvents.hasOwnProperty(name)) {
                    data = watchedEvents[name];
                    var target = getTarget(data.target, context);
                    if (target) {
                        target[data.type](data.event, data.callback, data.context);
                    }
                }
            }
        }
    }

    // unbind all registered events from the model
    function _watchedEventsUnbindAll(keepRegisteredEvents, context) {
        var watchedEvents = getState('__watchedEvents', context);
        if (watchedEvents) {
            var data;
            for (var name in watchedEvents) {
                if (watchedEvents.hasOwnProperty(name)) {
                    data = watchedEvents[name];
                    var target = getTarget(data.target, context);
                    if (target) {
                        target.off(data.event, data.callback, data.context);
                    }
                }
            }
            if (!keepRegisteredEvents) {
                setState({
                    __watchedEvents: []
                }, context);
            }
        }
    }

    function getTarget(target, context) {
        if (typeof target === 'function') {
            return target.call(context);
        }
        return target;
    }

    /*
     * wrapper for event implementations - includes on/off methods
     */
    function createHandler(event, callback, context, dontWrapCallback) {
        if (!dontWrapCallback) {
            var _callback = callback,
                noArg;
            if (typeof callback === 'object') {
                // use the "callback" attribute to get the callback function.  useful if you need to reference the component as "this"
                /*jshint validthis:true */
                _callback = callback.callback.call(this);
            }
            if (typeof callback === 'string') {
                noArg = (noArgMethods.indexOf(callback) >= 0);
                _callback = context[callback];
            }
            if (!_callback) {
                throw 'no callback function exists for "' + callback + '"';
            }
            callback = function() {
                return _callback.apply(context, noArg ? [] : arguments);
            };
        }

        // check for special wrapper function
        var match = event.match(specialWrapper);
        if (match) {
            var specialMethodName = match[1],
                /*jshint evil: true */
                args = eval('[' + match[2] + ']'),
                rest = match[3],
                specialHandler = eventManager.specials[specialMethodName];
            if (specialHandler) {
                if (args.length === 1 && args[0] === '') {
                    args = [];
                }
                callback = specialHandler.call(context, callback, args);
                return createHandler(rest, callback, context, true);
            } else {
                throw new Error('invalid special event handler "' + specialMethodName + "'");
            }
        }

        var parts = event.match(splitter),
            handlerName = parts[1],
            path = parts[2],
            handler = handlers[handlerName];

        // check pattern handlers if no match
        for (var i = 0; !handler && i < patternHandlers.length; i++) {
            if (handlerName.match(patternHandlers[i].pattern)) {
                handler = patternHandlers[i].handler;
            }
        }
        if (!handler) {
            throw new Error('no handler registered for "' + event + '"');
        }

        return handler.call(context, {
            key: handlerName,
            path: path
        }, callback);
    }

    // predefined templates of common handler types for simpler custom handling
    var handlerTemplates = {

        /**
         * Return a handler which will use a standard format of on(eventName, handlerFunction) and off(eventName, handlerFunction)
         * @param data {object} handler options
         *   - target {object or function()}: the target to bind to or function(name, event) which returns this target ("this" is the React component)
         *   - onKey {string}: the function attribute used to add the event binding (default is "on")
         *   - offKey {string}: the function attribute used to add the event binding (default is "off")
         */
        standard: function(data) {
            var accessors = {
                    on: data.onKey || 'on',
                    off: data.offKey || 'off'
                },
                target = data.target;
            return function(options, callback) {
                var path = options.path;

                function checkTarget(type, context) {
                    return function() {
                        var _target = (typeof target === 'function') ? target.call(context, path) : target;
                        if (_target) {
                            // register the handler
                            _target[accessors[type]](path, callback);
                        }
                    };
                }

                return {
                    on: checkTarget('on', this),
                    off: checkTarget('off', this),
                    initialize: data.initialize
                };
            };
        }
    };

    var eventManager = {
        // placeholder for special methods
        specials: {},

        /**
         * Register an event handler
         * @param identifier {string} the event type (first part of event definition)
         * @param handlerOrOptions {function(options, callback) *OR* options object}
         *
         * handlerOrOptions as function(options, callback) a function which returns the object used as the event handler.
         *      @param options {object}: will contain a *path* attribute - the event key (without the handler key prefix).
         *           if the custom handler was registered as "foo" and events hash was { "foo:abc": "..." }, the path is "abc"
         *      @param callback {function}: the callback function to be bound to the event
         *
         * handlerOrOptions as options: will use a predefined "standard" handler;  this assumes the event format of "{handler identifier}:{target identifier}:{event name}"
         *      @param target {object or function(targetIdentifier, eventName)} the target to bind/unbind from or the functions which retuns this target
         *      @param onKey {string} the attribute which identifies the event binding function on the target (default is "on")
         *      @param offKey {string} the attribute which identifies the event un-binding function on the target (default is "off")
         */
        handle: function(identifier, optionsOrHandler) {
            if (typeof optionsOrHandler !== 'function') {
                // it's options
                optionsOrHandler = handlerTemplates[optionsOrHandler.type || 'standard'](optionsOrHandler);
            }
            if (identifier instanceof RegExp) {
                patternHandlers.push({
                    pattern: identifier,
                    handler: optionsOrHandler
                });
            } else {
                handlers[identifier] = optionsOrHandler;
            }
        }
    };

    //// REGISTER THE DEFAULT EVENT HANDLERS
    if (typeof window !== 'undefined') {
        /**
         * Bind to window events
         * format: "window:{event name}"
         * example: events: { 'window:scroll': 'onScroll' }
         */
        eventManager.handle('window', {
            target: window,
            onKey: 'addEventListener',
            offKey: 'removeEventListener'
        });
    }

    var objectHandlers = {
        /**
         * Bind to events on components that are given a [ref](http://facebook.github.io/react/docs/more-about-refs.html)
         * format: "ref:{ref name}:{event name}"
         * example: "ref:myComponent:something-happened": "onSomethingHappened"
         */
        ref: function(refKey) {
            return this.refs[refKey];
        },

        /**
         * Bind to events on components that are provided as property values
         * format: "prop:{prop name}:{event name}"
         * example: "prop:componentProp:something-happened": "onSomethingHappened"
         */
        prop: function(propKey) {
            return this.props[propKey];
        }
    };

    function registerObjectHandler(key, objectFactory) {
        eventManager.handle(key, function(options, callback) {
            var parts = options.path.match(splitter),
                objectKey = parts[1],
                ev = parts[2],
                bound, componentState;
            return {
                on: function() {
                    var target = objectFactory.call(this, objectKey);
                    if (target) {
                        componentState = target.state || target;
                        target.on(ev, callback);
                        bound = target;
                    }
                },
                off: function() {
                    if (bound) {
                        bound.off(ev, callback);
                        bound = undefined;
                        componentState = undefined;
                    }
                },
                isStale: function() {
                    if (bound) {
                        var target = objectFactory.call(this, objectKey);
                        if (!target || (target.state || target) !== componentState) {
                            // if the target doesn't exist now and we were bound before or the target state has changed we are stale
                            return true;
                        }
                    } else {
                        // if we weren't bound before but the component exists now, we are stale
                        return true;
                    }
                }
            };
        });
    }

    for (var key in objectHandlers) {
        if (objectHandlers.hasOwnProperty(key)) {
            registerObjectHandler(key, objectHandlers[key]);
        }
    }

    /**
     * Allow binding to setInterval events
     * format: "repeat:{milis}"
     * example: events: { 'repeat:3000': 'onRepeat3Sec' }
     */
    eventManager.handle('repeat', function(options, callback) {
        var delay = parseInt(options.path, 10),
            id;
        return {
            on: function() {
                id = setInterval(callback, delay);
            },
            off: function() {
                id = !!clearInterval(id);
            }
        };
    });

    /**
     * Like setInterval events *but* will only fire when the user is actively viewing the web page
     * format: "!repeat:{milis}"
     * example: events: { '!repeat:3000': 'onRepeat3Sec' }
     */
    eventManager.handle('!repeat', function(options, callback) {
        var delay = parseInt(options.path, 10),
            keepGoing;

        function doInterval(suppressCallback) {
            if (suppressCallback !== true) {
                callback();
            }
            setTimeout(function() {
                if (keepGoing) {
                    requestAnimationFrame(doInterval);
                }
            }, delay);
        }
        return {
            on: function() {
                keepGoing = true;
                doInterval(true);
            },
            off: function() {
                keepGoing = false;
            }
        };
    });

    function handleEvents(events, context, initialize) {
        var handlers = getState('_eventHandlers', context) || [], handler;
        events = normalizeEvents(events);
        for (var ev in events) {
            if (events.hasOwnProperty(ev)) {
                handler = createHandler(ev, events[ev], context);
                if (handler.initialize) {
                    handler.initialize.call(context);
                }
                handlers.push(handler);
                if (initialize && context.isMounted()) {
                    handler.on.call(this);
                }
            }
        }
        return handlers;
    }

    //// REGISTER THE REACT MIXIN

    ReactMixinManager.add(namespace + 'events', function() {
        var rtn = [{
            /**
             * Return a callback fundtion that will trigger an event on "this" when executed with the provided parameters
             */
            triggerWith: function() {
                var args = Array.prototype.slice.call(arguments),
                    target = this;

                // allow the first parameter to be the target
                if (typeof args[0] !== 'string') {
                    target = args[0];
                    args.splice(0, 1);
                }

                return function() {
                    target.trigger.apply(target, args);
                };
            },

            /**
             * Return a callback fundtion that will call the provided function with the provided arguments
             */
            callWith: function(callback) {
                var args = Array.prototype.slice.call(arguments, 1),
                    self = this;
                return function() {
                    callback.apply(self, args);
                };
            },

            manageEvents: function(events) {
                setState({
                    '_eventHandlers': handleEvents(events, this, true)
                }, this);
            },

            getInitialState: function() {
                return {
                    _eventHandlers: handleEvents(this.events, this)
                };
            },

            componentDidUpdate: function() {
                var handlers = getState('_eventHandlers', this),
                    handler;
                for (var i = 0; i < handlers.length; i++) {
                    handler = handlers[i];
                    if (handler.isStale && handler.isStale.call(this)) {
                        handler.off.call(this);
                        handler.on.call(this);
                    }
                }
            },

            componentDidMount: function() {
                var handlers = getState('_eventHandlers', this);
                for (var i = 0; i < handlers.length; i++) {
                    handlers[i].on.call(this);
                }
            },

            componentWillUnmount: function() {
                var handlers = getState('_eventHandlers', this);
                for (var i = 0; i < handlers.length; i++) {
                    handlers[i].off.call(this);
                }
            }
        }];

        function bind(func, context) {
            return function() {
                func.apply(context, arguments);
            };
        }
        var eventHandler = eventManager.mixin;
        if (eventHandler) {
            var eventHandlerMixin = {},
                state = {},
                key;
            var keys = ['on', 'once', 'off', 'trigger'];
            for (var i = 0; i < keys.length; i++) {
                key = keys[i];
                if (eventHandler[key]) {
                    eventHandlerMixin[key] = bind(eventHandler[key], state);
                }
            }
            eventHandlerMixin.getInitialState = function() {
                return {
                    __events: state
                };
            };
            rtn.push(eventHandlerMixin);
        }
        // React.eventHandler.mixin should contain impl for "on" "off" and "trigger"
        return rtn;
    }, 'state');

    /**
     * Allow for managed bindings to any object which supports on/off.
     */
    ReactMixinManager.add(namespace + 'listen', {
        componentDidMount: function() {
            // sanity check to prevent duplicate binding
            _watchedEventsUnbindAll(true, this);
            _watchedEventsBindAll(this);
        },

        componentWillUnmount: function() {
            _watchedEventsUnbindAll(true, this);
        },

        // {event, callback, context, model}
        listenTo: function(target, ev, callback, context) {
            var data = ev ? {
                event: ev,
                callback: callback,
                target: target,
                context: context
            } : target;
            manageEvent.call(this, 'on', data);
        },

        listenToOnce: function(target, ev, callback, context) {
            var data = {
                event: ev,
                callback: callback,
                target: target,
                context: context
            };
            manageEvent.call(this, 'once', data);
        },

        stopListening: function(target, ev, callback, context) {
            var data = {
                event: ev,
                callback: callback,
                target: target,
                context: context
            };
            manageEvent.call(this, 'off', data);
        }
    });

    return eventManager;
});
