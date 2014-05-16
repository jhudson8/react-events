react-events
============

Declarative managed event bindings for [React](http://facebook.github.io/react/) components

***Problem:*** Event management is a manual process of binding and unbinding with [React](http://facebook.github.io/react/) components.  This is usually associated with, but not limited to, window events.

***Solution:*** Add declarative event definitions which are bound when the component is mounted and unbound when the component is unmounted.

Benefits:

* No manual event cleanup
* All events are declared in 1 place for easier readability

Installation
==============
* Browser: include *react-events[.min].js* after the listed dependencies
* CommonJS: ```require('react-events')(require('react'));```

Dependencies
--------------
* [React](http://facebook.github.io/react/)
* [react-mixin-manager](https://github.com/jhudson8/react-mixin-manager) (>= 0.2.0)

Usage
--------------
Components that include the ```events``` mixin (registered with [react-mixin-manager](https://github.com/jhudson8/react-mixin-manager)) can include an ```events``` attribute to declare events that should be monitored very similar to [Backbone](http://backbonejs.org/).View events.

By default, the following events are supported out of the box but custom event handlers can be included.

* window events
* DOM events (available but you should use React attributes if you can)
* ```ref``` events (using ```on``` and ```off``` of a component identified with a particular [ref](http://facebook.github.io/react/docs/more-about-refs.html))


Generally, event listeners are declared like this
```
React.createClass({
  events: {
    '{type}:{path}': (callback function or attribute name identifying a callback function)
  },
  mixin: ['events']
})
```
The ```type``` and ```path``` values are specific to different event handlers.


Window Events
--------------
event signature: ```window:{window event}```
```
React.createClass({
  events: {
    'window:scroll': 'onScroll'
  },
  mixin: ['events'],
  onScroll: function() {
    // will fire when a window scroll event has been triggered and "this" is the parent component
  }
});
```

Ref Events
--------------
```ref:{ref name}:{event name}```

If you aren't familiar with ref usage, see [this](http://facebook.github.io/react/docs/more-about-refs.html).  This assumes that the component identified by the ref name implements ***on*** and ***off*** methods.  If so, specific events from that component will be caught in the parent component.
```
React.createClass({
  events: {
    'ref:someComponent:something-happened': 'onSomethingHappened'
  },
  mixin: ['events'],
  onSomethingHappened: function() {
    // "someComponent" triggered the "something-happened" event and "this" is the parent component
  }
  render: function() {
    return <div><SomeComponent ref="someComponent" .../></div>;
  }
});
```

DOM Events
--------------
*note: [jquery](http://jquery.com/) (or impl that supports ```$().on(eventName, elementSelector)```) is required for these events*
```dom:{DOM events separated by space}:{query path}```
```
React.createClass({
  events: {
    'dom:click:button': 'onClick'
  },
  mixin: ['events'],
  onClick: function() {
    // will fire when the button is clicked and "this" is the parent component
  }
});
```


Multiple Event Declarations
-----------------
You can bind to as many events as you need to:
```
React.createClass({
  events: {
    'dom:click:button': 'onClick',
    'window:resize': 'onResize',
    ...
  },
  mixin: ['events'],
  ...
});
```

Supporting Component on/off
=================
When using the ```ref``` event handler, the component should support the on/off methods methods.  While this script does not include the implementation of that, it does provide a hook for including your own impl when the ```events``` mixin is included.

```
React.events.mixin = objectThatHashOnOffMethods;
```

If you include [react-backbone](https://github.com/jhudson8/react-backbone) this will be set automatically for you.

By

Custom Event Handlers
=================
All events supported by default use the same API as the custom event handler.  Using ```React.events.handle```, you can add support for a custom event handler.  This could be useful for adding an application specific global event bus for example.

API
-----------
```React.events.handle(identifier, handler, standardAccessor)```: register a customer event handler

* ***identifier*** *{string}* the event type (first part of event definition)
* ***handler*** *{function(options, callback)}* which returns an object containing ```on``` and ```off``` methods
   * ***options*** *{object}* event definition options which currently only includes the "path" attribute
   * ***callback*** *{function}* callback event to be executed when the custom event is triggered
* ***standardAccessors*** *{object or ```true```}* indicates that a standard handler type should be used for simpleer initialization.
    This can either be ```true``` to use ```on``` and ```off``` as the bind/unbind method names or {on, off} to identify specific bind/unbind method names
    If a standard handler is used, the definition of the ```handler``` parameter is altered and is described below
 
handler (in standard mode) *{object or function}*
   * ***(as object)*** the object used as the event handler (for example ```window```)
   * ***(as function(name, event))*** a function which returns the object used as the event handler

The event descriptor will be split into parts (name and event) ```{name}:{event}``` and the event handler will be called with ```on/off(name, event)```


This is better described with the default events as examples as each represents a unique event handler registration scenario

window events (standard event handler type and static target)
```
  /**
   * Bind to window events
   * format: "window:{event name}"
   * example: events: { 'window:scroll': 'onScroll' }
   */
  React.events.handle('window', global.window, {
    on: 'addEventListener',
    off: 'removeEventListener'
  });
```

ref events (standard event handler type and dynamic target)
```
  /**
   * Bind to events on components that are given a [ref](http://facebook.github.io/react/docs/more-about-refs.html)
   * format: "ref:{ref name}:{event name}"
   * example: "ref:myComponent:something-happened": "onSomethingHappened"
   */
  React.events.handle('ref', function(name) {
    return this.refs[name];
  }, true);
```

DOM events (custom handler which must return on/off methods)
```
  /**
   * Bind to DOM element events (recommended solution is to use React "on..." attributes)
   * format: "dom:{event names separated with space}:{element selector}"
   * example: events: { 'dom:click:a': 'onAClick' }
   */
  React.events.handle('dom', function(options, callback) {
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
```

your own global event bus custom handler (assuming it supported on/off events like eventHandler.on(eventName[, additionalArguments]) )
```
React.events.handle('app', appEventHandler);
```
which could then be bound by your views using
```
  events: {
    'app:some-event': 'onSomeEvent'
  }
```
