registerProject({"title":"react-events","summary":"Declarative managed event bindings for [React](#link/http%3A%2F%2Ffacebook.github.io%2Freact%2F) components\n\n\n\n* No manual event cleanup\n* All events are declared in 1 place for easier readability\n* Provided ```listenTo``` API\n* Pluggable event definitions with many supported types out of the box (refs, props, window, repeat)","dependantProjects":[{"id":"react-mixin-manager","url":"https://github.com/jhudson8/react-mixin-manager","description":""}],"installation":"Browser:\n```\n<script src=\".../react[-min].js\"></script>\n<script src=\".../react-mixin-manager[-min].js\"></script>\n<script src=\".../react-events[-min].js\"></script>\n```\nCommonJS\n```\nvar React = require('react');\nrequire('react-mixin-manager')(React);\nrequire('react-events')(React);\n```\nAMD\n```\nrequire(\n  ['react', 'react-mixin-manager', 'react-events'], function(React, reactMixinManager, reactEvents) {\n  reactMixinManager(React); \n  reactEvents(React); \n});\n```\n\n","api":{"Event Binding Definitions":{"methods":{},"description":"Event listeners are declared using the ```events``` attribute.  To add this support the ```events``` mixin ***must*** be included with your component mixins.\n```\nReact.createClass({\n  events: {\n    '{type}:{path}': (callback function or attribute name identifying a callback function)\n  },\n  mixins: ['events']\n})\n```\nThe ```type``` and ```path``` values are specific to different event handlers.","packages":{"window events":{"overview":"Monitor window events (requires a global \"window\" variable).\n\nSyntax\n```\nwindow:{window event}\n```\n\nExample\n```\nReact.createClass({\n  mixins: ['events'],\n  events: {\n    'window:scroll': 'onScroll'\n  },\n  onScroll: function() {\n    // will fire when a window scroll event has been triggered and \"this\" is the parent component\n  }\n});\n```","methods":{}},"repeat events":{"overview":"Execute the callback every n milis\n\nEvent signature\n```\n// repeat every * interval\nrepeat:{duration in millis}\n// repeat every * interval (only when the browser tab is active)\n!repeat:{duration in millis}\n```\n\nExample\n```\nReact.createClass({\n  mixins: ['events'],\n  events: {\n    'repeat:3000': function() {\n      // this will be called every 3 seconds only when the component is mounted\n    },\n    '!repeat:3000': function() {\n      // same as above but will *only* be called when this web page is the active page (requestAnimationFrame)\n    },\n  }\n});\n```","methods":{}},"component by ref events":{"overview":"Execute the callback when events are triggered on the components identified by the [this](#link/http%3A%2F%2Ffacebook.github.io%2Freact%2Fdocs%2Fmore-about-refs.html) value.\n\nEvent signature\n```\nref:{ref name}:{event name}\n```\n\nExample\n```\nReact.createClass({\n  mixins: ['events'],\n  events: {\n    'ref:someComponent:something-happened': 'onSomethingHappened'\n  },\n  onSomethingHappened: function() {\n    // \"someComponent\" triggered the \"something-happened\" event and \"this\" is the parent component\n  },\n  render: function() {\n    return <div><SomeComponent ref=\"someComponent\" .../></div>;\n  }\n});\n```","methods":{}},"object by prop key events":{"overview":"Execute the callback when events are triggered on the objects identified by the property value.\n\nEvent signature\n```\nprop:{ref name}:{event name}\n```\n\nExample\n```\nvar MyComponent = React.createClass({\n  mixins: ['events'],\n  events: {\n    'prop:someProp:something-happened': 'onSomethingHappened'\n  },\n  onSomethingHappened: function() {\n    // \"someProp\" triggered the \"something-happened\" event and \"this\" is the parent component\n  }\n});\n...\n<MyComponent someProp={myObject}/>\n```","methods":{}},"DOM events":{"overview":"To avoid a a jquery dependency, this is not provided with react-events.  However, if you wish to implement DOM event\nsupport, copy/paste the code below\n\nEvent signature\n```\ndom:{DOM events separated by space}:{query path}\n```\n\nCopy/Paste\n```\n/**\n * Bind to DOM element events (recommended solution is to use React \"on...\" attributes)\n * format: \"dom:{event names separated with space}:{element selector}\"\n * example: events: { 'dom:click:a': 'onAClick' }\n */\nReact.events.handle('dom', function(options, callback) {\n  var parts = options.path.match(splitter);\n  return {\n    on: function() {\n      $(this.getDOMNode()).on(parts[1], parts[2], callback);\n    },\n    off: function() {\n      $(this.getDOMNode()).off(parts[1], parts[2], callback);\n    }\n  };\n});\n```\n\nExample\n```\nReact.createClass({\n  events: {\n    'dom:click:button': 'onClick'\n  },\n  mixins: ['events'],\n  onClick: function() {\n    // will fire when the button is clicked and \"this\" is the parent component\n  }\n});\n```","methods":{}},"application events":{"overview":"If you want to provide declaritive event support for a custom global application event handler (that implements ```on```/```off```), you can copy/paste the code below.\n\n```\nReact.events.handle('app', {\n  target: myGlobalEventHandler\n});\n```\n\nExample\n```\n  events: {\n    'app:some-event': 'onSomeEvent'\n  }\n```","methods":{}}}},"Mixins":{"methods":{},"packages":{"events":{"overview":"This mixin is required if you want to be able to use declaritive event definitions.\n\nIn addition, it also includes component state binding for the event handler implementation (not included).\n\nThe event handler implementation is included with [react-backbone](#link/https%3A%2F%2Fgithub.com%2Fjhudson8%2Freact-backbone) or can be specified  by setting ```React.events.mixin```.  The event handler is simply an object that contains method implementations for\n\n* trigger\n* on\n* off\n\n```\nReact.events.mixin = myObjectThatSupportsEventMethods;\n```","methods":{"triggerWith":{"profiles":["event[, parameters...]"],"params":{"event":"the event name","parameters":"any additional parameters that should be added to the trigger"},"summary":"A convienance method which allows for easy closure binding of component event triggering when React events occur.","dependsOn":[],"overview":"```\nReact.createClass({\n  mixins: ['triggerWith'],\n  render: function() {\n\n    // when the button is clicked, the parent component will have 'button-clicked' triggered with the provided parameters\n    return <button type=\"button\" onClick={this.triggerWith('button-clicked', 'param1', 'param2')}>Click me</button>\n  }\n})\n\n```"}}},"listen":{"overview":"Utility mixin to expose managed Backbone.Events binding functions which are cleaned up when the component is unmounted.\nThis is similar to the \"modelEventAware\" mixin but is not model specific.\n\n```\n    var MyClass React.createClass({\n      mixins: ['listen'],\n      getInitialState: function() {\n        this.listenTo(this.props.someObject, 'change', this.onChange);\n        return null;\n      },\n      onChange: function() { ... }\n    });\n```","methods":{"listenTo":{"profiles":["target, eventName, callback[, context]"],"params":{"target":"the source object to bind to","eventName":"the event name","callback":"the event callback function","context":"the callback context"},"summary":"Managed event binding for ```target.on```.","dependsOn":[],"overview":""},"listenToOnce":{"profiles":["target, eventName, callback[, context]"],"params":{"target":"the source object to bind to","eventName":"the event name","callback":"the event callback function","context":"the callback context"},"summary":"Managed event binding for ```target.once```.","dependsOn":[],"overview":""},"stopListening":{"profiles":["eventName, callback[, context]"],"params":{"target":"the source object to bind to","eventName":"the event name","callback":"the event callback function","context":"the callback context"},"summary":"Unbind event handler created with ```listenTo``` or ```listenToOnce```","dependsOn":[],"overview":""}}}}},"API":{"methods":{},"packages":{"React.events":{"overview":"","methods":{"handle":{"profiles":["identifier, options) or (identifier, handler"],"params":{"identifier":"*{string or regular expression}* the event type (first part of event definition)","options":"will use a predefined \"standard\" handler;  this assumes the event format of \"{handler identifier}:{target identifier}:{event name}\"","target":"{object or function(targetIdentifier, eventName)} the target to bind/unbind from or the functions which retuns this target","onKey":"{string} the attribute which identifies the event binding function on the target (default is \"on\")","offKey":"{string} the attribute which identifies the event un-binding function on the target (default is \"off\")","handler":"{function(handlerOptions, handlerCallback)} which returns the object used as the event handler.","handlerOptions":"{object} will contain a *path* attribute - the event key (without the handler key prefix).  if the custom handler was registered as \"foo\" and events hash was { \"foo:abc\": \"...\" }, the path is \"abc\"","handlerCallback":"{function} the callback function to be bound to the event"},"summary":"For example, the following are the implementations of the event handlers provided by default:","dependsOn":[],"overview":"***window events (standard event handler type with custom on/off methods and static target)***\n```\nReact.events.handle('window', {\n  target: window,\n  onKey: 'addEventListener',\n  offKey: 'removeEventListener'\n});\n```\n\n```\n// this will match any key that starts with custom-\nReact.events.handle(/custom-.*/, function(options, callback) {\n  // if the event declaration was \"custom-foo:bar\"\n  var key = options.key;  // customm-foo\n  var path = options.path; // bar\n  ...\n}\n```\n\n***DOM events (custom handler which must return an object with on/off methods)***\n```\n  React.events.handle('dom', function(options, callback) {\n    var parts = options.path.match(splitter);\n    return {\n      on: function() {\n        $(this.getDOMNode()).on(parts[1], parts[2], callback);\n      },\n      off: function() {\n        $(this.getDOMNode()).off(parts[1], parts[2], callback);\n      }\n    };\n  });\n```"}}}}}},"sections":[{"body":"When using the ```ref``` event handler, the component should support the on/off methods.  While this script does not include the implementation of that, it does provide a hook for including your own impl when the ```events``` mixin is included using ```React.events.mixin```.\n\n```\nReact.events.mixin = objectThatHasOnOffMethods;\n```\n\nIf you include [react-backbone](#link/https%3A%2F%2Fgithub.com%2Fjhudson8%2Freact-backbone) this will be set automatically for you as well as ```model``` event bindings.\n\nYou will the have the ability to do the following:\n```\nvar ChildComponent = React.createClass({\n  mixins: ['events'],\n  ...\n  onSomethingHappened: function() {\n    this.trigger('something-happened');\n  }\n});\n...\n\nvar ParentComponent = React.createClass({\n  mixins: ['events', 'modelEventBinder'],\n  events: {\n    'model:onChange': 'onModelChange',\n    'ref:myComponent:something-happened': 'onSomethingHappened'\n  },\n  render: function() {\n    return <div><ChildComponent ref=\"myComponent\"/></div>;\n  },\n  onSomethingHappened: function() { ... },\n  onModelChange: function() { ... }\n});\n```","title":"React Component Events","sections":[]},{"body":"","title":"Advanced Features","sections":[{"body":"The event bindings can be declared as a tree structure.  Each element in the tree will be appended\nto the parent element using the ```:``` separator.  For example\n```\nevents: {\n  prop: {\n    'foo:test1': 'test1',\n    foo: {\n      test2: 'test2',\n      test3: 'test3'\n    }\n  },\n  'prop:bar:test4': 'test4'\n}\n```\nwill be converted to\n```\nevents: {\n  'prop:foo:test1': 'test1',\n  'prop:foo:test2': 'test2',\n  'prop:foo:test3': 'test3',\n  'prop:bar:test4': 'test4'\n}\n```","title":"Declaritive event tree","sections":[]},{"body":"If you need to reference ```this``` when declaring your event handler, you can use an object with a ```callback``` object.\n\n```\nvar MyClass = React.createClass({\n  mixins: ['events'],\n  events: {\n    'window:resize': {\n      callback: function() {\n        // return the callback function;  executed after the instance has been created\n        // so \"this\" can be referenced as the react component instance\n      }\n    }\n  }\n});\n```","title":"Instance References","sections":[]},{"body":"It is sometimes useful to wrap callback methods for throttling, cacheing or other purposes.  Because an instance is required for this, the previously described instance reference ```callback``` can be used but can be verbose.  Special callback wrappers can be used to accomplish this.  If the event name is prefixed with ```*someSpecialName(args):...``` the ```someSpecialName``` callback wrapper will be invoked.\n\nThis is best described with an example\n```\n  events: {\n    '*throttle(300):window:resize': 'forceUpdate'\n  }\n```\n\nWhile no special handlers are implemented by default, by including [react-backbone](#link/https%3A%2F%2Fgithub.com%2Fjhudson8%2Freact-backbone), the following special handlers are available (see [underscore](#link/http%3A%2F%2Funderscorejs.org) for more details)\n\n* memoize\n* delay\n* defer\n* throttle\n* debounce\n* once\n\nTo implement your own special handler, just reference a wrapper function by name on ```React.events.specials```.  For example:\n```\n// this will log a message whenever this callback is invoked\n                                  // callback is the runtime event callback and args are the special definition arguments\nReact.events.specials.log = function(callback, args) {\n  // the arguments provided here are the runtime event arguments\n  return function() {\n    console.log(args[0]);\n    callback.apply(this, args);\n  }\n}\n```\nWhich can be defined as follows\n```\n  events: {\n    '*log(\"special arguments\", 4, true):...': '...';\n  }\n```\nIf the runtime event was triggered triggered with arguments (\"foo\"), the impl would be as follows\n```\nReact.events.specials.log = function(callback, [\"special arguments\", 4, true]) {\n  // the arguments provided here are the runtime event arguments\n  return function(\"foo\") {\n    // \"this\" will remain consistent through multiple callbacks\n    callback.apply(this, arguments);\n  }\n}\n```","title":"Callback Wrappers","sections":[]},{"body":"All events supported by default use the same API as the custom event handler.  Using ```React.events.handle```, you can add support for a custom event handler.  This could be useful for adding an application specific global event bus for example.","title":"Custom Event Handlers","sections":[]}]}]});
