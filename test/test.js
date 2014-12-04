var sinon = require('sinon'),
  chai = require('chai'),
  sinonChai = require('sinon-chai'),
  expect = chai.expect,
  React = require('react'),
  Backbone = require('backbone'), // not a dependency - only used as an events impl
  _ = require('underscore'),
  $on = sinon.spy(),
  $off = sinon.spy(),
  $ = sinon.spy(function() {
    return {
      on: $on,
      off: $off
    };
  });
chai.use(sinonChai);

global.window = global.window || {
  addEventListener: sinon.spy(),
  removeEventListener: sinon.spy()
};

// intitialize mixin-dependencies
require('react-mixin-manager')(React);
require('../react-events')(React, $);

function newComponent(attributes, mixins) {

  mixins = mixins ? React.mixins.get(mixins) : React.mixins.get('events');

  var obj = {
    getDOMNode: sinon.spy(),
    mount: function() {
      this._mounted = true;
      this.trigger('componentWillMount');
      this.trigger('componentDidMount');
    },
    unmount: function() {
      this._mounted = false;
      this.trigger('componentWillUnmount');
      this.trigger('componentDidUnmount');
    },

    isMounted: function() {
      return this._mounted;
    },
    trigger: function(method) {
      var rtn = [];
      for (var i = 0; i < mixins.length; i++) {
        var func = mixins[i][method];
        if (func) {
          rtn.push(func.apply(this, Array.prototype.slice.call(arguments, 1)));
        }
      }
      return rtn;
    }
  };
  if (attributes) {
    for (var name in attributes) {
      obj[name] = attributes[name];
    }
  }

  var state, aggregateState;

  for (var i = 0; i < mixins.length; i++) {
    var mixin = mixins[i];
    _.defaults(obj, mixin);
    state = mixin.getInitialState && mixin.getInitialState.call(obj);
    if (state) {
      if (!aggregateState) aggregateState = {};
      _.defaults(aggregateState, state);
    }
  }
  obj.state = aggregateState;
  return obj;
}


describe('#triggerWith', function() {
  it('should work', function() {
    var obj = newComponent({});
    obj.mount();
    sinon.stub(obj, 'trigger');
    var callback = obj.triggerWith('foo', 'bar');
    callback();
    expect(obj.trigger.calledWith('foo', 'bar')).to.eql(true);
  })
});


describe('#callWith', function() {
  it('should work', function() {
    var obj = newComponent({});
    obj.mount();
    var spy = sinon.spy();
    var callback = obj.callWith(spy, 'foo');
    callback();
    expect(spy.calledWith('foo')).to.eql(true);
  })
});

describe('window events', function() {

  it('should on and off window events', function() {

    var obj = newComponent({
      events: {
        'window:scroll': 'onScroll',
        'window:resize': 'onResize',
      },
      onScroll: sinon.spy(),
      onResize: sinon.spy(),
    });
    obj.mount();
    expect(window.addEventListener.callCount).to.eql(2);

    window.addEventListener.getCall(0).args[1]('foo');
    expect(obj.onScroll.callCount).to.eql(1);
    expect(obj.onScroll.thisValues[0]).to.eql(obj);
    expect(obj.onScroll).to.have.been.calledWith('foo');

    window.addEventListener.getCall(1).args[1]('bar');
    expect(obj.onResize.callCount).to.eql(1);
    expect(obj.onResize.thisValues[0]).to.eql(obj);
    expect(obj.onResize).to.have.been.calledWith('bar');
    expect(window.removeEventListener.callCount).to.eql(0);

    obj.unmount();
    expect(window.removeEventListener.callCount).to.eql(2);
  });
});


describe('ref events', function() {
  it('should on and off ref events', function() {
    var eventSpy = function() {
      return {
        on: sinon.spy(),
        off: sinon.spy()
      };
    };
    var obj = newComponent({
      events: {
        'ref:foo:foo-event': 'onFooEvent',
        'ref:bar:bar-event': 'onBarEvent'
      },
      onFooEvent: sinon.spy(),
      onBarEvent: sinon.spy(),
      refs: {
        foo: {
          on: sinon.spy(),
          off: sinon.spy()
        },
        bar: {
          on: sinon.spy(),
          off: sinon.spy()
        }
      }
    });

    obj.mount();
    expect(obj.refs.foo.on.callCount).to.eql(1);
    expect(obj.refs.foo.on).to.have.been.calledWith('foo-event');
    expect(obj.refs.bar.on.callCount).to.eql(1);
    expect(obj.refs.bar.on).to.have.been.calledWith('bar-event');

    obj.refs.foo.on.getCall(0).args[1]('foo');
    expect(obj.onFooEvent.callCount).to.eql(1);
    expect(obj.onFooEvent).to.have.been.calledWith('foo');
    expect(obj.onFooEvent.thisValues[0]).to.eql(obj);

    obj.refs.bar.on.getCall(0).args[1]('bar');
    expect(obj.onBarEvent.callCount).to.eql(1);
    expect(obj.onBarEvent).to.have.been.calledWith('bar');
    expect(obj.onBarEvent.thisValues[0]).to.eql(obj);
  });
});

describe('prop events', function() {
  it('should on and off prop events', function() {
    var eventSpy = function() {
      return {
        on: sinon.spy(),
        off: sinon.spy()
      };
    };
    var obj = newComponent({
      events: {
        'prop:foo:foo-event': 'onFooEvent',
        'prop:bar:bar-event': 'onBarEvent'
      },
      onFooEvent: sinon.spy(),
      onBarEvent: sinon.spy(),
      props: {
        foo: {
          on: sinon.spy(),
          off: sinon.spy()
        },
        bar: {
          on: sinon.spy(),
          off: sinon.spy()
        }
      }
    });

    obj.mount();
    expect(obj.props.foo.on.callCount).to.eql(1);
    expect(obj.props.foo.on).to.have.been.calledWith('foo-event');
    expect(obj.props.bar.on.callCount).to.eql(1);
    expect(obj.props.bar.on).to.have.been.calledWith('bar-event');

    obj.props.foo.on.getCall(0).args[1]('foo');
    expect(obj.onFooEvent.callCount).to.eql(1);
    expect(obj.onFooEvent).to.have.been.calledWith('foo');
    expect(obj.onFooEvent.thisValues[0]).to.eql(obj);

    obj.props.bar.on.getCall(0).args[1]('bar');
    expect(obj.onBarEvent.callCount).to.eql(1);
    expect(obj.onBarEvent).to.have.been.calledWith('bar');
    expect(obj.onBarEvent.thisValues[0]).to.eql(obj);
  });
});

describe('custom event bindings', function() {
  var hander;
  beforeEach(function() {
    handler = {};
    handler.on = sinon.spy();
    handler.off = sinon.spy();
    handler.onCustom = sinon.spy();
    handler.offCustom = sinon.spy();
  });

  it('standard methods (on/off) and target callback (factory)', function() {
    var _handler = handler;
    React.events.handle('custom1', {
      target: function() {
        return _handler;
      }
    });

    var obj = newComponent({
      events: {
        'custom1:foo': 'onFoo',
      },
      onFoo: sinon.spy()
    });
    obj.mount();
    expect(_handler.on.callCount).to.eql(1);
    expect(_handler.off.callCount).to.eql(0);

    obj.unmount();
    expect(_handler.off.callCount).to.eql(1);
  });

  it('custom methods (on/off) and static target', function() {
    var _handler = handler;
    React.events.handle('custom2', {
      target: _handler,
      onKey: 'onCustom',
      offKey: 'offCustom'
    });

    var obj = newComponent({
      events: {
        'custom2:foo': 'onFoo',
      },
      onFoo: sinon.spy()
    });
    obj.mount();
    expect(_handler.onCustom.callCount).to.eql(1);
    expect(_handler.offCustom.callCount).to.eql(0);

    obj.unmount();
    expect(_handler.offCustom.callCount).to.eql(1);
  });

  it('should not provide any arguments if the handler method is "forceUpdate"', function() {
    var _handler = handler;
    React.events.handle('custom3', {
      target: _handler
    });

    var obj = newComponent({
      events: {
        'custom3:foo': 'forceUpdate',
      },
      forceUpdate: sinon.spy()
    });
    obj.mount();
    expect(_handler.on.callCount).to.eql(1);
  });

  it('should handle regular expression handlers', function() {
    var _handler = handler;
    React.events.handle(/custom-.*/, {
      target: _handler,
      onKey: 'onCustom',
      offKey: 'offCustom'
    });

    var obj = newComponent({
      events: {
        'custom-foo:foo': 'onFoo',
      },
      onFoo: sinon.spy()
    });
    obj.mount();
    expect(_handler.onCustom.callCount).to.eql(1);
    expect(_handler.offCustom.callCount).to.eql(0);

    obj.unmount();
    expect(_handler.offCustom.callCount).to.eql(1);
  });
});

describe('listen', function() {
  it('should start listening to a target', function() {
    var model = new Backbone.Model(),
      obj = newComponent({
        props: {
          model: model
        }
      }, ['listen']),
      spy = sinon.spy();

    obj.listenTo(model, 'foo', spy);
    model.trigger('foo');
    // we shouldn't bind yet because we aren't mounted
    expect(spy.callCount).to.eql(0);

    obj.mount();
    model.trigger('foo');
    expect(spy.callCount).to.eql(1);

    // we shouldn't bind now because we will be unmounted
    obj.unmount();
    model.trigger('foo');
    expect(spy.callCount).to.eql(1);

    // mount again and ensure that we rebind
    obj.mount();
    model.trigger('foo');
    expect(spy.callCount).to.eql(2);
    obj.unmount();
    model.trigger('foo');
    expect(spy.callCount).to.eql(2);
  });

  it('should listen to a target once', function() {
    var model = new Backbone.Model(),
      obj = newComponent({
        props: {
          model: model
        }
      }, ['listen']),
      spy = sinon.spy();

    obj.listenToOnce(model, 'foo', spy);
    model.trigger('foo');
    // we shouldn't bind yet because we aren't mounted
    expect(spy.callCount).to.eql(0);

    obj.mount();
    model.trigger('foo');
    expect(spy.callCount).to.eql(1);

    model.trigger('foo');
    expect(spy.callCount).to.eql(1);
  });

  it('should stop listening to a target', function() {
    var model = new Backbone.Model(),
      obj = newComponent({
        props: {
          model: model
        }
      }, ['listen']),
      spy = sinon.spy();
    obj.listenTo(model, 'foo', spy);
    obj.mount();
    model.trigger('foo');
    expect(spy.callCount).to.eql(1);

    obj.stopListening(model, 'foo', spy);
    model.trigger('foo');
    expect(spy.callCount).to.eql(1);
  });
});

describe('events defined as a hierarchy', function() {
  it('should create event handlers for allevents defined as a hierarchy', function() {
    var model1 = new Backbone.Model(),
      model2 = new Backbone.Model(),
      obj = newComponent({
        props: {
          foo: model1,
          bar: model2
        },
        events: {
          prop: {
            'foo:test1': 'test1',
            foo: {
              test2: 'test2',
              test3: 'test3'
            }
          },
          'prop:bar:test4': 'test4'
        },
        test1: sinon.spy(),
        test2: sinon.spy(),
        test3: sinon.spy(),
        test4: sinon.spy()
      }, ['events']);
      obj.mount();

      model1.trigger('test1', 'a');
      expect(obj.test1.callCount).to.eql(1);
      expect(obj.test1.calledWith('a')).to.eql(true);

      model1.trigger('test2', 'b');
      expect(obj.test2.callCount).to.eql(1);
      expect(obj.test2.calledWith('b')).to.eql(true);

      model1.trigger('test3', 'c');
      expect(obj.test3.callCount).to.eql(1);
      expect(obj.test3.calledWith('c')).to.eql(true);

      model2.trigger('test4', 'd');
      expect(obj.test4.callCount).to.eql(1);
      expect(obj.test4.calledWith('d')).to.eql(true);
  });
});

describe('special callback wrappers', function() {
  // the special definition arguments
  var spy = sinon.spy(function(callback, args) {
    // the event call arguments
    return function(param1) {
      var _args = Array.prototype.slice.call(args, 0);
      _args.push(param1);
      callback.apply(this, _args);
    }
  });
  React.events.specials.test = spy;
  beforeEach(function() {
    spy.reset();
  });

  it('should use the special with 0 params (and still proxy the event params)', function() {
    var eventSpy = sinon.spy();
    var model1 = new Backbone.Model(),
      obj = newComponent({
        props: {
          foo: model1
        },
        events: {
          '*test()prop:foo:test': eventSpy
        }
      }, ['events']);
    obj.mount();

    model1.trigger('test', 'eventParam');
    expect(spy.callCount).to.eql(1);
    expect(spy.getCall(0).args[1]).to.eql([]);
    expect(eventSpy.callCount).to.eql(1);
    expect(eventSpy.calledWith('eventParam')).to.eql(true);
  });

  it('should use the special with multiple params or different types', function() {
    var eventSpy = sinon.spy();
    var model1 = new Backbone.Model(),
      obj = newComponent({
        props: {
          foo: model1
        },
        events: {
          '*test("specialParam", 1, true)prop:foo:test': eventSpy
        }
      }, ['events']);
    obj.mount();

    model1.trigger('test', 'eventParam');
    expect(eventSpy.callCount).to.eql(1);
    expect(eventSpy.calledWith('specialParam', 1, true, 'eventParam')).to.eql(true);
  });

  it('should support order format (additional ":" separator)', function() {
    var eventSpy = sinon.spy();
    var model1 = new Backbone.Model(),
      obj = newComponent({
        props: {
          foo: model1
        },
        events: {
          '*test("specialParam", 1, true):prop:foo:test': eventSpy
        }
      }, ['events']);
    obj.mount();

    model1.trigger('test', 'eventParam');
    expect(eventSpy.callCount).to.eql(1);
    expect(eventSpy.calledWith('specialParam', 1, true, 'eventParam')).to.eql(true);
  });

  it('should support pointer format (additional "->" separator)', function() {
    var eventSpy = sinon.spy();
    var model1 = new Backbone.Model(),
      obj = newComponent({
        props: {
          foo: model1
        },
        events: {
          '*test("specialParam", 1, true)->prop:foo:test': eventSpy
        }
      }, ['events']);
    obj.mount();

    model1.trigger('test', 'eventParam');
    expect(eventSpy.callCount).to.eql(1);
    expect(eventSpy.calledWith('specialParam', 1, true, 'eventParam')).to.eql(true);
  });
});
