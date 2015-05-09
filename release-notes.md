# Release Notes

## Development

[Commits](https://github.com/jhudson8/react-events/compare/v1.0.1...master)

## v1.0.1 - May 9th, 2015
- bug fix: in-browser source include loading - 4d5fe09


[Commits](https://github.com/jhudson8/react-events/compare/v1.0.0...v1.0.1)

## v1.0.0 - April 17th, 2015
There are no longer initialization requirements for react-events. React.events no longer exists - it is now the return value from the react-events require.

The required changes to your app are as follows:

* the initialization code is now just ```require('react-events');'''
* All code referencing React.events.whatever must now change to ReactEvents.whatever (assuming ReactEvents = require('react-events'))



[Commits](https://github.com/jhudson8/react-events/compare/v0.9.0...v1.0.0)

## v0.9.0 - February 15th, 2015
- add "react-events" namespace - e2f9eb5

All of the mixins defined in this project can either be referenced by the original mixin name (unless replaced) or their fully qualified name (prefixed with "react-events")

For example, ```events``` or ```react-events.events```` can be used.  This gives you the flexibility to overwrite the ```events``` mixin name while still being able to access the react-events ```events``` mixin.

You must use react-mixin-manager >= 0.12.0


[Commits](https://github.com/jhudson8/react-events/compare/v0.8.1...v0.9.0)

## v0.8.1 - February 10th, 2015
- additional support external target with the triggerWith mixin - 5445d93

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

You can also pass in a target object as the first parameter (this object must implement the ```trigger``` method).

```
React.createClass({
  mixins: ['triggerWith'],
  render: function() {

    // when the button is clicked, the parent component will have 'button-clicked' triggered with the provided parameters
    return <button type="button" onClick={this.triggerWith(someOtherObject, 'button-clicked', 'param1', 'param2')}>Click me</button>
  }
})
```


[Commits](https://github.com/jhudson8/react-events/compare/v0.8.0...v0.8.1)

## v0.8.0 - February 9th, 2015
- add the manageEvents function to the "events" mixin - e8860f1

This method can be used to the same functionality that a React component can use with the ```events``` hash.  This allows mixins to use all of the managed behavior and event callbacks provided with this project.

```
var MyMixin = {
  mixins: ['events'],

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


[Commits](https://github.com/jhudson8/react-events/compare/v0.7.9...v0.8.0)

## v0.7.9 - December 11th, 2014
- code cleanup - ccd0527


[Commits](https://github.com/jhudson8/react-events/compare/v0.7.8...v0.7.9)

## v0.7.8 - December 10th, 2014
no functional code changes.  There is just an additional comment that is used to create react-backbone/with-deps.js


[Commits](https://github.com/jhudson8/react-events/compare/v0.7.7...v0.7.8)

## v0.7.7 - December 4th, 2014
- [#2](https://github.com/jhudson8/react-events/issues/2) - Interaction Nirvana
- add "callWith" method to the "events" mixin - 367bf06


[Commits](https://github.com/jhudson8/react-events/compare/v0.7.6...v0.7.7)

## v0.7.6 - December 2nd, 2014
- include "once" for React.events.mixin functions to be applied within the "events" mixin - 8c05d16


[Commits](https://github.com/jhudson8/react-events/compare/v0.7.5...v0.7.6)

## v0.7.5 - December 1st, 2014
- bug fix: only include on/off/trigger from event handler impl - 8a17425


[Commits](https://github.com/jhudson8/react-events/compare/v0.7.4...v0.7.5)

## v0.7.4 - November 28th, 2014
- add more visible -> as the special separator "specialName(...)->..." - 545f9a3


[Commits](https://github.com/jhudson8/react-events/compare/v0.7.3...v0.7.4)

## v0.7.3 - November 28th, 2014
- allow non-string special arguments - 39a920c


[Commits](https://github.com/jhudson8/react-events/compare/v0.7.2...v0.7.3)

## v0.7.2 - November 26th, 2014
- support event bindings declared as a tree structure - 47b5628
For example
```
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


[Commits](https://github.com/jhudson8/react-events/compare/v0.7.1...v0.7.2)

## v0.7.1 - November 26th, 2014
- for AMD, you must execute the function with params (see README AMD install instructions) - ecb83cc
```
require(
  ['react', react-events'], function(React, reactEvents) {
  reactEvents(React); 
});
```


[Commits](https://github.com/jhudson8/react-events/compare/v0.7.0...v0.7.1)

## v0.7.0 - November 25th, 2014
- add "prop" declarative event - 8a8bb53
- add "listen" mixin - 44d737c
- bug fix: ensure bound handlers are saved within state - 312d8ce


[Commits](https://github.com/jhudson8/react-events/compare/v0.6.0...v0.7.0)

## v0.6.0 - November 14th, 2014
- remove DOM event handler - cd6489f

Compatibility notes:
If you are using the "dom" event handler, you must now add that event handler in your own project (to remove the jquery dependency for this project)

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

[Commits](https://github.com/jhudson8/react-events/compare/v0.5.2...v0.6.0)

## v0.5.2 - November 2nd, 2014
- [#1](https://github.com/jhudson8/react-events/issues/1) - Exception when using react-events with browserify
- add package keyword "react-mixin-manager" - a70d493

[Commits](https://github.com/jhudson8/react-events/compare/v0.5.1...v0.5.2)

## v0.5.1 - October 3rd, 2014
- $ to be provided for commonJS - aaa0faf

[Commits](https://github.com/jhudson8/react-events/compare/v0.5.0...v0.5.1)

## v0.5.0 - September 7th, 2014
- add "react-component" keyword - 39f0ce1
- remove the "triggerWith" mixin and move the triggerWith method into the "events" mixin - b489c2f
- v0.4.3 - a694dac

[Commits](https://github.com/jhudson8/react-events/compare/v0.4.3...v0.5.0)

## v0.4.3 - July 25th, 2014
- fix ref event handlers in case the ref component changed during parent renders - cc934d8

Compatibility notes:
- TODO : What might have broken?

[Commits](https://github.com/jhudson8/react-events/compare/v0.4.2...v0.4.3)

## v0.4.2 - June 17th, 2014
- fix bower.json - 9ab5bbc
- update dependencies docs - 1aa6bbc

[Commits](https://github.com/jhudson8/react-events/compare/v0.4.1...v0.4.2)

## v0.4.1 - June 16th, 2014
- update dependencies - bda8de9
- allow for customer handlers to match the path by regular expression - 0bcdca0
- add bower.json - 8372180

[Commits](https://github.com/jhudson8/react-events/compare/v0.4.0...v0.4.1)

## v0.4.0 - June 12th, 2014
- added special callback wrappers (useful for throttling, cacheing and other reusable callback wrappers) - 3085655
- add object with "callback" parameter support with instance definitions to be able to refer to "this" as the component instance when declaring the callback function. - 55d5e2a

[Commits](https://github.com/jhudson8/react-events/compare/v0.3.0...v0.4.0)

## v0.3.0 - June 4th, 2014
- add 'repeat' and '!repeat' events - 9001bbf

[Commits](https://github.com/jhudson8/react-events/compare/v0.2.1...v0.3.0)

## v0.2.1 - May 22nd, 2014
- add custom events / forceUpdate unit tests - 30ae1dd
- do not send any arguments if the handler event name is "forceUpdate" as that will throw an exception by React - b7122fe

[Commits](https://github.com/jhudson8/react-events/compare/v0.2.0...v0.2.1)

## v0.2.0 - May 18th, 2014
- expose a new mixin: "triggerWith" - b62497a, fc5eb13
- bug fix: bind external "events" (on/off/trigger) object methods to state rather than just using "this" - f351712
- change handler API (not backwards compatible) - 381a352

[Commits](https://github.com/jhudson8/react-events/compare/v0.1.2...v0.2.0)

## v0.1.2 - May 16th, 2014
- added window existence check before including window events - b71d259

[Commits](https://github.com/jhudson8/react-events/compare/v0.1.1...v0.1.2)

## v0.1.1 - May 15th, 2014
- Update README.md
- fix author email address

[Commits](https://github.com/jhudson8/react-events/compare/1341bec...v0.1.1)
