/*!
 * react-events v0.1.2
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
      splitter = /^([^:]+):?(.*)/;

  // wrapper for event implementations - includes on/off methods
  function createHandler(event, callback, context) {
    var _callback = callback;
    if (typeof callback === 'string') {
      _callback = context[callback];
    }
    if (!callback) {
      throw 'no callback function exists for "' + callback + '"';
    }
    callback = function() {
      return _callback.apply(context, arguments);
    };
    var parts = event.split(':'),
        handlerName = parts[0],
        handler = handlers[handlerName],
        path = parts.slice(1).join(':');
    if (!handler) {
      throw 'no handler registered for "' + event + '"';
    }
    return handler.call(context, {path: path}, callback);
  }

  /**
   * Return a handler which will use a standard format of on(eventName, handlerFunction) and off(eventName, handlerFunction)
   * the objectRetrievalFunction can either be the object itself or a function which returns the object ("this" will be the React component)
   * objectRetrievalFunction will be called with "this" as the React component and 2 arguments the name and event name
   * '{handlerType}:{name}:{eventName}'
   */
  function createStandardHandler(target, accessors) {

    return function(options, func) {
      var match = options.path.match(splitter);
      if (match) {
          var name = match[1],
              event = match[2];

        function checkTarget(type, context) {
          return function() {
            var _target = (typeof target === 'function') ? target.call(context, name, event) : target;
            if (_target) {
              // register the handler
              _target[accessors[type]](event, func);
            }
          };
        }

        return {
          on: checkTarget('on', this),
          off: checkTarget('off', this)
        };
      } else {
        throw "invalid event handler";
      }
    };
  }

  var eventManager = React.events = {

    /**
     * Register an event handler
     * @param identifier {string} the event type (first part of event definition)
     * @param handler {function(options, callback)} which returns an object containing "on" and "off" methods
     *   * @param options {object} event definition options which currently only includes the "path" attribute
     *   * @param callback {function} callback event to be executed when the custom event is triggered
     *   * @param standardAccessors {object or true} indicates that a standard handler type should be used for simpleer initialization.
     *        This can either be `true` to use "on" and "off" as the bind/unbind method names or {on, off} to identify specific bind/unbind method names
     *        If a standard handler is used, the definition of the `handler` parameter is altered and is described below
     * @param handler (in standard mode) {object or function}
     *   * (as object) the object used as the event handler (for example `window`)
     *   * (as function(name, event)) a function which returns the object used as the event handler
     *
     * The event descriptor will be split into parts (name and event) "{name}:{event}" and the event handler will be called with on/off(name, event)
     */
    handle: function(identifier, handler, standardAccessors) {
      if (standardAccessors) {
        standardAccessors = (standardAccessors === true) ? {on: 'on', off: 'off'} : standardAccessors;
        handler = createStandardHandler(handler, standardAccessors);
      }
      handlers[identifier] = handler;
    }
  };


  //// REGISTER THE DEFAULT EVENT HANDLERS
  if (typeof window != 'undefined') {
    /**
     * Bind to window events
     * format: "window:{event name}"
     * example: events: { 'window:scroll': 'onScroll' }
     */
    eventManager.handle('window', window, {
      on: 'addEventListener',
      off: 'removeEventListener'
    });
  }

  /**
   * Bind to events on components that are given a [ref](http://facebook.github.io/react/docs/more-about-refs.html)
   * format: "ref:{ref name}:{event name}"
   * example: "ref:myComponent:something-happened": "onSomethingHappened"
   */
  eventManager.handle('ref', function(name) {
    return this.refs[name];
  }, true);

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


  //// REGISTER THE REACT MIXIN
  React.mixins.add('events', function() {
    var rtn = {
      getInitialState: function() {
        var handlers = this._eventHandlers = [];
        if (this.events) {
          for (var event in this.events) {
            handlers.push(createHandler(event, this.events[event], this));
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
    };
    // React.eventHandler.mixin should contain impl for "on" "off" and "trigger"
    return [rtn, eventManager.mixin];
  });

});
