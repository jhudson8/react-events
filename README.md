react-events
============

Declarative managed event bindings for [React](http://facebook.github.io/react/) components

* No manual event cleanup
* All events are declared in 1 place for easier readability

Components that include the ```events``` mixin (registered with [react-mixin-manager](https://github.com/jhudson8/react-mixin-manager)) can include an ```events``` attribute to declare events that should be monitored very similar to [Backbone](http://backbonejs.org/).View events.

By default, the following events are supported out of the box but custom event handlers can be included.

* window events
* DOM events (available but you should use React attributes if you can)
* ```ref``` events (using ```on``` and ```off``` of a component identified with a particular [ref](http://facebook.github.io/react/docs/more-about-refs.html))
* repeat events


Installation
-------------
* Browser: include *react-events[.min].js* after the listed dependencies
* CommonJS: ```require('react-events')(require('react'));```


Dependencies
--------------
* [React](http://facebook.github.io/react/)
* [react-mixin-manager](https://github.com/jhudson8/react-mixin-manager) (>= 0.5.2)


Sections
-------------

### Event Types

Event listeners are declared using the ```events``` attribute.  To add this support the ```events``` mixin ***must*** be included with your component mixins.
```
React.createClass({
  events: {
    '{type}:{path}': (callback function or attribute name identifying a callback function)
  },
  mixins: ['events']
})
```
The ```type``` and ```path``` values are specific to different event handlers.

#### Window
Event signature
```
window:{window event}
```

Example
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

#### Repeat
Event signature
```
// repeat every * interval
repeat:{duration in millis}
!repeat:{duration in millis}
```

Example
```
React.createClass({
  events: {
    'repeat:3000': function() {
      // this will be called every 3 seconds only when the component is mounted
    },
    '!repeat:3000': function() {
      // same as above but will *only* be called when this web page is the active page (requestAnimationFrame)
    },
  },
  mixins: ['events']
});
```

#### "Ref" Components
Event signature
```
ref:{ref name}:{event name}
```

If you aren't familiar with ref usage, see [this](http://facebook.github.io/react/docs/more-about-refs.html).

This assumes that the component identified by the ref name implements ***on*** and ***off*** methods.  If so, specific events from that component will be caught in the parent component.

Example
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

#### DOM
*note: [jquery](http://jquery.com/) (or impl that supports ```$().on(eventName, elementSelector)```) is required for these events*

Event signature
```
dom:{DOM events separated by space}:{query path}
```

Example
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


### React Component Events

When using the ```ref``` event handler, the component should support the on/off methods.  While this script does not include the implementation of that, it does provide a hook for including your own impl when the ```events``` mixin is included using ```React.events.mixin```.

```
React.events.mixin = objectThatHasOnOffMethods;
```

If you include [react-backbone](https://github.com/jhudson8/react-backbone) this will be set automatically for you as well as ```model``` event bindings.

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

### Advanced Features

#### Instance References

If you need to reference ```this``` when declaring your event handler, you can use an object with a ```callback``` object.

```
var MyClass = React.createClass({
  mixins: ['events'],
  events: {
    'window:resize': {
      callback: function() {
        // return the callback function;  executed after the instance has been created
        // so "this" can be referenced as the react component instance
      }
    }
  }
});
```


#### Callback Wrappers

It is sometimes useful to wrap callback methods for throttling, cacheing or other purposes.  Because an instance is required for this, the previously described instance reference ```callback``` can be used but can be verbose.  Special callback wrappers can be used to accomplish this.  If the event name is prefixed with ```*someSpecialName(args):...``` the ```someSpecialName``` callback wrapper will be invoked.

This is best described with an example
```
  events: {
    '*throttle(300):window:resize': 'forceUpdate'
  }
```

While no special handlers are implemented by default, by including [react-backbone](https://github.com/jhudson8/react-backbone), the following special handlers are available (see [underscore](http://underscorejs.org) for more details)

* memoize
* delay
* defer
* throttle
* debounce
* once

To implement your own special handler, just reference a wrapper function by name on ```React.events.specials```.  For example:
```
// this will log a message whenever this callback is invoked
React.events.specials.log = function(callback, args) {
  return function() {
    console.log(args[0]);
    callback.apply(this, arguments);
  }
}
```
Which can be referenced with
```
  events: {
    '*log(my message):...': '...';
  }
```


#### Custom Event Handlers

All events supported by default use the same API as the custom event handler.  Using ```React.events.handle```, you can add support for a custom event handler.  This could be useful for adding an application specific global event bus for example.


API
--------
### React.events

#### handle (identifier, options); (identifier, handler)
* ***identifier***: *{string or regular expression}* the event type (first part of event definition)
* ***options***: will use a predefined "standard" handler;  this assumes the event format of "{handler identifier}:{target identifier}:{event name}"
* ***target***: {object or function(targetIdentifier, eventName)} the target to bind/unbind from or the functions which retuns this target
* ***onKey***: {string} the attribute which identifies the event binding function on the target (default is "on")
* ***offKey***: {string} the attribute which identifies the event un-binding function on the target (default is "off")
* ***handler***: {function(handlerOptions, handlerCallback)} which returns the object used as the event handler.
* ***handlerOptions***: {object} will contain a *path* attribute - the event key (without the handler key prefix).  if the custom handler was registered as "foo" and events hash was { "foo:abc": "..." }, the path is "abc"
* ***handlerCallback***: {function} the callback function to be bound to the event

For example, the following are the implementations of the event handlers provided by default:

***window events (standard event handler type with custom on/off methods and static target)***
```
React.events.handle('window', {
  target: window,
  onKey: 'addEventListener',
  offKey: 'removeEventListener'
});
```

```
// this will match any key that starts with custom-
React.events.handle(/custom-.*/, function(options, callback) {
  // if the event declaration was "custom-foo:bar"
  var key = options.key;  // customm-foo
  var path = options.path; // bar
  ...
}
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


API: Mixins
---------

### events

This mixin is required if you want to be able to use declaritive event definitions.

In addition, it also includes component state binding for the event handler implementation (not included).

The event handler implementation is included with [react-backbone](https://github.com/jhudson8/react-backbone) or can be specified  by setting ```React.events.mixin```.  The event handler is simply an object that contains method implementations for

* trigger
* on
* off

```
React.events.mixin = myObjectThatSupportsEventMethods;
```

#### trigger(eventName[, parameters...])
* ***eventName***: the model event name to trigger
* ***parameters***: any event parameters to be included

Trigger the specified event.


#### on(eventName, callback[, context])
* ***eventName***: the event name
* ***callback***: the event callback function
* ***context***: the callback context

Listen for the specific event and execute the callback function when the event is fired.


#### once(eventName, callback[, context])
* ***eventName***: the event name
* ***callback***: the event callback function
* ***context***: the callback context

Listen for the specific event and execute the callback function when the event is fired ***1 time only***.


#### off(eventName, callback[, context])
* ***eventName***: the event name
* ***callback***: the event callback function
* ***context***: the callback context

Remove the specified event binding.


### triggerWith

#### triggerWith(event[, parameters...])
* ***event***: the event name
* ***parameters***: any additional parameters that should be added to the trigger

A convienance method which allows for easy closure binding of component event triggering when React events occur.

```
React.createClass({
  mixins: ['triggerWith'],
  render: function() {

    // when the button is clicked, the parent component will have 'button-clicked' triggered with the provided parameters
    return <button type="button" onClick={this.triggerWith('button-clicked', 'param1', 'param2')}>Click me</button>
  }
})

```
