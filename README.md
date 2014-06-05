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
  mixins: ['events']
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
  mixins: ['events'],
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
  mixins: ['events'],
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
  mixins: ['events'],
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
  mixins: ['events'],
  ...
});
```

"triggerWith" mixin
-----------------
This will expose a "triggerWith" function.  this allows for easy closure binding of component event triggering when React events occur.
```
React.createClass({
  mixins: ['triggerWith'],
  render: function() {
    return <button type="button" onClick={this.triggerWith('button-clicked', 'param1', 'param2')}>Click me</button>
  }
})
// when the button is clicked, the parent component will have 'button-clicked' triggered with the provided parameters
```

Adding on/off/trigger to React Components
=================
When using the ```ref``` event handler, the component should support the on/off methods.  While this script does not include the implementation of that, it does provide a hook for including your own impl when the ```events``` mixin is included using ```React.events.mixin```.

```
React.events.mixin = objectThatHasOnOffMethods;
```

And, if you include [react-backbone](https://github.com/jhudson8/react-backbone) this will be set automatically for you as well as ```model``` event bindings.

You will the have the ability to do the following:
```
var ChildComponent = React.createClass({
  mixins: ['events'],
  ...
  onSomethingHappened: function() {
    this.trigger('something-happened');
  }
});
...

var ParentComponent = React.createClass({
  mixins: ['events', 'modelEventBinder'],
  events: {
    'model:onChange': 'onModelChange',
    'ref:myComponent:something-happened': 'onSomethingHappened'
  },
  render: function() {
    return <div><ChildComponent ref="myComponent"/></div>;
  },
  onSomethingHappened: function() { ... },
  onModelChange: function() { ... }
});
```

Custom Event Handlers
=================
All events supported by default use the same API as the custom event handler.  Using ```React.events.handle```, you can add support for a custom event handler.  This could be useful for adding an application specific global event bus for example.

API
-----------
```React.events.handle(identifier, optionsOrHandler)```: register a customer event handler

* ***identifier*** *{string}* the event type (first part of event definition)
* ***handlerOrOptions*** *{function(options, callback) *OR* options object}*

*handlerOrOptions as function(options, callback)* a function which returns the object used as the event handler.
  * ***options {object}: will contain a *path* attribute - the event key (without the handler key prefix).
          if the custom handler was registered as "foo" and events hash was { "foo:abc": "..." }, the path is "abc"
  * ***callback {function}: the callback function to be bound to the event

*handlerOrOptions as options*: will use a predefined "standard" handler;  this assumes the event format of "{handler identifier}:{target identifier}:{event name}"
  * ***target {object or function(targetIdentifier, eventName)} the target to bind/unbind from or the functions which retuns this target
  * ***onKey {string} the attribute which identifies the event binding function on the target (default is "on")
  * ***offKey {string} the attribute which identifies the event un-binding function on the target (default is "off")


For example, the following are the implementations of the event handlers provided by default:

***window events (standard event handler type with custom on/off methods and static target)***
```
React.events.handle('window', {
  target: window,
  onKey: 'addEventListener',
  offKey: 'removeEventListener'
});
```

***ref events (standard event handler type with dynamic target)***
```
React.events.handle('ref', {
  target: function(name) {
    return this.refs[name];
  }
});
```

***DOM events (custom handler which must return an object with on/off methods)***
```
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

You could add your own global event bus handler (assuming it supported on/off events) like the following example:
```
React.events.handle('app', {
  target: myGlobalEventHandler
});
```
which could then be bound by your React components using
```
  events: {
    'app:some-event': 'onSomeEvent'
  }
```
