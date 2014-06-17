/*!
 * react-events v0.4.1
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
    define(['react'], main);
  } else if (typeof exports !== 'undefined' && typeof require !== 'undefined') {
    module.exports = function(React) {
      main(React);
    };
  } else {
    main(React);
  }
})(function(React) {

  var handlers = {},
      patternHandlers = [],
      splitter = /^([^:]+):?(.*)/,
      specialWrapper = /^\*([^\(]+)\(([^)]*)\):(.*)/,
      noArgMethods = ['forceUpdate'];

  // wrapper for event implementations - includes on/off methods
  function createHandler(event, callback, context, dontWrapCallback) {
    if (!dontWrapCallback) {
      var _callback = callback,
          noArg;
      if (typeof callback === 'object') {
        // use the "callback" attribute to get the callback function.  useful if you need to reference the component as "this"
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
          args = match[2].split(/\s*,\s*/),
          rest = match[3],
          specialHandler = React.events.specials[specialMethodName];
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
        handlerName = parts[1];
        path = parts[2],
        handler = handlers[handlerName];

    // check pattern handlers if no match
    for (var i=0; !handler && i<patternHandlers.length; i++) {
      if (handlerName.match(patternHandlers[i].pattern)) {
        handler = patternHandlers[i].handler;
      }
    }
    if (!handler) {
      throw 'no handler registered for "' + event + '"';
    }

    return handler.call(context, {key: handlerName, path: path}, callback);
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

  var eventManager = React.events = {
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
        patternHandlers.push({pattern: identifier, handler: optionsOrHandler});
      } else {
        handlers[identifier] = optionsOrHandler;
      }
    }
  };


  //// REGISTER THE DEFAULT EVENT HANDLERS
  if (typeof window != 'undefined') {
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

  /**
   * Bind to events on components that are given a [ref](http://facebook.github.io/react/docs/more-about-refs.html)
   * format: "ref:{ref name}:{event name}"
   * example: "ref:myComponent:something-happened": "onSomethingHappened"
   */
  eventManager.handle('ref', function(options, callback) {
    var parts = options.path.match(splitter),
        refKey = parts[1],
        event = parts[2];
    return {
      on: function() {
        var target = this.refs[refKey];
        if (target) {
          target.on(event, callback);
        }
      },
      off: function() {
        var target = this.refs[refKey];
        if (target) {
          target.off(event, callback);
        }
      }
    };
  });

  /**
   * Bind to DOM element events (recommended solution is to use React "on..." attributes)
   * format: "dom:{event names separated with space}:{element selector}"
   * example: events: { 'dom:click:a': 'onAClick' }
   */
  eventManager.handle('dom', function(options, callback) {
    var parts = options.path.match(splitter);
    return {
      on: function() {
        $(this.getDOMNode()).on(parts[1], parts[2], callback);
      },
      off: function() {
        $(this.getDOMNode()).off(parts[1], parts[2], callback);
      }
    };
  });


  /**
   * Allow binding to setInterval events
   * format: "repeat:{milis}"
   * example: events: { 'repeat:3000': 'onRepeat3Sec' }
   */
  eventManager.handle('repeat', function(options, callback) {
    var delay = parseInt(options.path, 10), id;
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
    var delay = parseInt(options.path, 10), keepGoing;
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

  //// REGISTER THE REACT MIXIN
  React.mixins.add('events', function() {
    var rtn = [{
      getInitialState: function() {
        var handlers = this._eventHandlers = [];
        if (this.events) {
          var handler;
          for (var event in this.events) {
            handler = createHandler(event, this.events[event], this);
            if (handler.initialize) {
              handler.initialize.call(this);
            }
            handlers.push(handler);
          }
        }
        return null;
      },

      componentDidMount: function() {
        var handlers = this._eventHandlers;
        for (var i=0; i<handlers.length; i++) {
          handlers[i].on.call(this);
        }
      },

      componentWillUnmount: function() {
        var handlers = this._eventHandlers;
        for (var i=0; i<handlers.length; i++) {
          handlers[i].off.call(this);
        }
      }
    }];

    function bind(func, context) {
      return function() {
        func.apply(context, arguments);
      };
    }
    if (eventManager.mixin) {
      var eventHandlerMixin = {},
          state = {};
      for (var name in eventManager.mixin) {
        eventHandlerMixin[name] = bind(eventManager.mixin[name], state);
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
  });

  React.mixins.add('triggerWith', {
    /**
     * Return a callback fundtion that will trigger an event on "this" when executed with the provided parameters
     */
    triggerWith: function(eventName) {
      var args = Array.prototype.slice.call(arguments),
          self = this;
      return function() {
        self.trigger.apply(this, args);
      };
    }
  });

});
