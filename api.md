react-events
============
Declarative managed event bindings for [React](http://facebook.github.io/react/) components

* No manual event cleanup
* All events are declared in 1 place for easier readability
* Provided ```listenTo``` API
* Pluggable event definitions with many supported types out of the box (refs, props, window, repeat)

Dependencies
--------------
* [react-mixin-manager](https://github.com/jhudson8/react-mixin-manager)

Installation
--------------
Browser:

```
    <script src=".../react[-min].js"></script>
    <script src=".../react-mixin-manager[-min].js"></script>
    <script src=".../react-events[-min].js"></script>
```

CommonJS

```
    var ReactEvents = require('react-events');
```

AMD

```
    require(
      ['react-events'], function(ReactEvents) {
        ...
    });
```


API: Event Binding Definitions
--------------
Event listeners are declared using the ```events``` attribute.  To add this support the ```events``` mixin ***must*** be included with your component mixins.

```javascript
    React.createClass({
      events: {
        '{type}:{path}': (callback function or attribute name identifying a callback function)
      },
      mixins: ['events'] // or ['react-events.events']
    })
```

The ```type``` and ```path``` values are specific to different event handlers.

### window events
Monitor window events (requires a global "window" variable).

Syntax

```javascript
    window:{window event}
```

Example

```javascript
    React.createClass({
      mixins: ['events'], // or ['react-events.events']
      events: {
        'window:scroll': 'onScroll'
      },
      onScroll: function() {
        // will fire when a window scroll event has been triggered and "this" is the parent component
      }
    });
```

### repeat events
Execute the callback every n milis

Event signature

```javascript
    // repeat every * interval
    repeat:{duration in millis}
    // repeat every * interval (only when the browser tab is active)
    !repeat:{duration in millis}
```

Example

```javascript
    React.createClass({
      mixins: ['events'], // or ['react-events.events']
      events: {
        'repeat:3000': function() {
          // this will be called every 3 seconds only when the component is mounted
        },
        '!repeat:3000': function() {
          // same as above but will *only* be called when this web page is the active page (requestAnimationFrame)
        },
      }
    });
```

### component by ref events
Execute the callback when events are triggered on the components identified by the [this](http://facebook.github.io/react/docs/more-about-refs.html) value.

Event signature

```javascript
    ref:{ref name}:{event name}
```

Example

```javascript
    React.createClass({
      mixins: ['events'], // or ['react-events.events']
      events: {
        'ref:someComponent:something-happened': 'onSomethingHappened'
      },
      onSomethingHappened: function() {
        // "someComponent" triggered the "something-happened" event and "this" is the parent component
      },
      render: function() {
        return <div><SomeComponent ref="someComponent" .../></div>;
      }
    });
```


### object by prop key events
Execute the callback when events are triggered on the objects identified by the property value.

Event signature

```javascript
    prop:{ref name}:{event name}
```

Example

```javascript
    var MyComponent = React.createClass({
      mixins: ['events'], // or ['react-events.events']
      events: {
        'prop:someProp:something-happened': 'onSomethingHappened'
      },
      onSomethingHappened: function() {
        // "someProp" triggered the "something-happened" event and "this" is the parent component
      }
    });
    ...
    <MyComponent someProp={myObject}/>
```

### DOM events
To avoid a a jquery dependency, this is not provided with react-events.  However, if you wish to implement DOM event
support, copy/paste the code below

Event signature

```javascript
    dom:{DOM events separated by space}:{query path}
```

Copy/Paste

```javascript
    /**
     * Bind to DOM element events (recommended solution is to use React "on..." attributes)
     * format: "dom:{event names separated with space}:{element selector}"
     * example: events: { 'dom:click:a': 'onAClick' }
     */
    require('react-events').handle('dom', function(options, callback) {
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

Example

```javascript
    React.createClass({
      events: {
        'dom:click:button': 'onClick'
      },
      mixins: ['events'], // or ['react-events.events']
      onClick: function() {
        // will fire when the button is clicked and "this" is the parent component
      }
    });
```


### application events
If you want to provide declaritive event support for a custom global application event handler (that implements ```on```/```off```), you can copy/paste the code below.

```javascript
    require('react-events').handle('app', {
      target: myGlobalEventHandler
    });
```

Example

```javascript
    events: {
      'app:some-event': 'onSomeEvent'
    }
```


API: Mixins
---------
### events

This mixin is required if you want to be able to use declaritive event definitions.

For example

```javascript
    React.createClass({
      mixins: ['events'], // or ['react-events.events']
      events: {
        'window:scroll': 'onScroll'
      },
      ...
      onScroll: function() { ... }
    });
```

In addition, it also includes component state binding for the event handler implementation (not included).

The event handler implementation is included with [react-backbone](https://github.com/jhudson8/react-backbone) or can be specified  by setting ```require('react-events').mixin```.  The event handler is simply an object that contains method implementations for

* trigger
* on
* off

```javascript
    require('react-events').mixin = myObjectThatSupportsEventMethods;
```

#### triggerWith(event[, parameters...])
* ***event***: the event name
* ***parameters***: any additional parameters that should be added to the trigger

A convienance method which allows for easy closure binding of component event triggering when React events occur.

```javascript
    React.createClass({
      mixins: ['events'], // or ['react-events.events']
      render: function() {

        // when the button is clicked, the parent component will have 'button-clicked' triggered with the provided parameters
        return <button type="button" onClick={this.triggerWith('button-clicked', 'param1', 'param2')}>Click me</button>
      }
    });
```

You can also pass in a target object as the first parameter (this object must implement the ```trigger``` method).

```javascript
    React.createClass({
      mixins: ['events'], // or ['react-events.events']
      render: function() {

        // when the button is clicked, the parent component will have 'button-clicked' triggered with the provided parameters
        return <button type="button" onClick={this.triggerWith(someOtherObject, 'button-clicked', 'param1', 'param2')}>Click me</button>
      }
    });
```


#### callWith(func[, parameters...])
* ***func***: the event name
* ***parameters***: any additional parameters that should be used as arguments to the provided callback function

A convienance method which allows for easy closure binding of a callback function with arguments

```javascript
    React.createClass({
      mixins: ['events'], // or ['react-events.events']
      render: function() {

        // when the button is clicked, the parent component will have 'button-clicked' triggered with the provided parameters
        for (var i=0; i<something.length; i++) {
          return <button type="button" onClick={this.callWith(onSomething, something[i])}>Click me</button>
        }
      }
    });
```


### manageEvents (events)
* ***events***: the events has that you would see on a React component

This method can be used to the same functionality that a React component can use with the ```events``` hash.  This allows mixins to use all of the managed behavior and event callbacks provided with this project.

```javascript
    var MyMixin = {
      mixins: ['events'], // or ['react-events.events']
      
      getInitialState: function() {

        this.manageEvents({
          '*throttle(300)->window:resize': function() {
            // this will be called (throttled) whenever the window resizes
          }
        });

        return null;
      }
    }
```


### listen

Utility mixin to expose managed Backbone.Events binding functions which are cleaned up when the component is unmounted.
This is similar to the "modelEventAware" mixin but is not model specific.

```javascript
    var MyClass React.createClass({
      mixins: ['listen'], // or ['react-events.listen']

      getInitialState: function() {
        this.listenTo(this.props.someObject, 'change', this.onChange);
        return null;
      },
      onChange: function() { ... }
    });
```


#### listenTo(target, eventName, callback[, context])
* ***target***: the source object to bind to
* ***eventName***: the event name
* ***callback***: the event callback function
* ***context***: the callback context

Managed event binding for ```target.on```.


#### listenToOnce(target, eventName, callback[, context])
* ***target***: the source object to bind to
* ***eventName***: the event name
* ***callback***: the event callback function
* ***context***: the callback context

Managed event binding for ```target.once```.


#### stopListening(eventName, callback[, context])
* ***target***: the source object to bind to
* ***eventName***: the event name
* ***callback***: the event callback function
* ***context***: the callback context

Unbind event handler created with ```listenTo``` or ```listenToOnce```


API
--------
### react-events

#### handle (identifier, options) or (identifier, handler)
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

```javascript
    require('react-events').handle('window', {
      target: window,
      onKey: 'addEventListener',
      offKey: 'removeEventListener'
    });
```

```javascript
    // this will match any key that starts with custom-
    require('react-events').handle(/custom-.*/, function(options, callback) {
      // if the event declaration was "custom-foo:bar"
      var key = options.key;  // customm-foo
      var path = options.path; // bar
      ...
    }
```

***DOM events (custom handler which must return an object with on/off methods)***

```javascript
    require('react-events').handle('dom', function(options, callback) {
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


Sections
----------------

### React Component Events

When using the ```ref``` event handler, the component should support the on/off methods.  While this script does not include the implementation of that, it does provide a hook for including your own impl when the ```events``` mixin is included using ```require('react-events').mixin```.

```javascript
    require('react-events').mixin = objectThatHasOnOffMethods;
```

If you include [react-backbone](https://github.com/jhudson8/react-backbone) this will be set automatically for you as well as ```model``` event bindings.

You will the have the ability to do the following:

```javascript
    var ChildComponent = React.createClass({
      mixins: ['events'], // or ['react-events.events']
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

#### Declaritive event tree

The event bindings can be declared as a tree structure.  Each element in the tree will be appended
to the parent element using the ```:``` separator.  For example

```javascript
    events: {
      prop: {
        'foo:test1': 'test1',
        foo: {
          test2: 'test2',
          test3: 'test3'
        }
      },
      'prop:bar:test4': 'test4'
    }
    ```
    will be converted to
    ```
    events: {
      'prop:foo:test1': 'test1',
      'prop:foo:test2': 'test2',
      'prop:foo:test3': 'test3',
      'prop:bar:test4': 'test4'
    }
```

#### Instance References

If you need to reference ```this``` when declaring your event handler, you can use an object with a ```callback``` object.

```javascript
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

It is sometimes useful to wrap callback methods for throttling, cacheing or other purposes.  Because an instance is required for this, the previously described instance reference ```callback``` can be used but can be verbose.  Special callback wrappers can be used to accomplish this.  If the event name is prefixed with ```*someSpecialName(args)->...``` the ```someSpecialName``` callback wrapper will be invoked.

This is best described with an example

```javascript
    events: {
      '*throttle(300)->window:resize': 'forceUpdate'
    }
```

To implement your own special handler, just reference a wrapper function by name on ```require('react-events').specials```.  For example:

```javascript
    // callback is the runtime event callback and args are the special definition arguments
    require('react-events').specials.throttle = function(callback, args) {
      // the arguments provided here are the runtime event arguments
      return function() {
        var throttled = this.throttled || _.throttle(callback, args[0]);
        throttled.apply(this, arguments);
      }
    }
```

If the runtime event was triggered triggered with arguments ("foo"), the actual parameters would look like this

```javascript
    require('react-events').specials.throttle = function(callback, [3000]) {
      // the arguments provided here are the runtime event arguments
      return function("foo") {
        // "this" will be an object unique to this special definition and remain consistent through multiple callbacks
        var throttled = this.throttled || _.throttle(callback, 3000);
        throttled.apply(this, arguments);
      }
    }
```

While no special handlers are implemented by default, by including [react-backbone](https://github.com/jhudson8/react-backbone), the following special handlers are available (see [underscore](http://underscorejs.org) for more details)

* memoize
* delay
* defer
* throttle
* debounce
* once


#### Custom Event Handlers

All events supported by default use the same API as the custom event handler.  Using ```require('react-events').handle```, you can add support for a custom event handler.  This could be useful for adding an application specific global event bus for example.
