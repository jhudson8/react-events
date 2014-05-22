var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    React = require('react'),
    _ = require('underscore');
chai.use(sinonChai);

global.window = global.window || {
  addEventListener: sinon.spy(),
  removeEventListener: sinon.spy()
};

// intitialize mixin-dependencies
require('react-mixin-manager')(React);
require('../react-events')(React);

function newComponent(attributes, mixins) {

  mixins = mixins || React.mixins.get('events');

  var obj = {
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

    isMounted: function() { return this._mounted; },
    trigger: function(method) {
      var rtn = [];
      for (var i=0; i<mixins.length; i++) {
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

  for (var i=0; i<mixins.length; i++) {
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


describe('DOM events', function(){
  var on = sinon.spy(),
      off = sinon.spy();
  global.$ = sinon.spy(function() {
    return {
      on: on,
      off: off
    };
  });

  it('should on and off DOM events', function() {
    var obj = newComponent({
      events: {
        'dom:click:a': 'onClickA',
        'dom:click:button': 'onClickButton'
      },
      onClickA: sinon.spy(),
      onClickButton: sinon.spy()
    });
    obj.getDOMNode = sinon.spy(function() {
      return [];
    });

    obj.mount();
    expect(obj.getDOMNode.callCount).to.eql(2);
    expect(on.callCount).to.eql(2);
    expect(off.callCount).to.eql(0);
    expect(on.getCall(0)).to.have.been.calledWith('click', 'a');
    expect(on.getCall(1)).to.have.been.calledWith('click', 'button');

    on.getCall(0).args[2]('foo');
    expect(obj.onClickA.callCount).to.eql(1);
    expect(obj.onClickA).to.have.been.calledWith('foo');
    expect(obj.onClickA.thisValues[0]).to.eql(obj);

    on.getCall(1).args[2]('bar');
    expect(obj.onClickButton.callCount).to.eql(1);
    expect(obj.onClickButton).to.have.been.calledWith('bar');
    expect(obj.onClickButton.thisValues[0]).to.eql(obj);

    obj.unmount();
    expect(off.callCount).to.eql(2);
  });
});


describe('ref events', function() {
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

    it('should on and off ref events', function() {
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
    React.events.handle('custom1', {
      target: function() {
        return handler;
      }
    });

    var obj = newComponent({
      events: {
        'custom1:foo': 'onFoo',
      },
      onFoo: sinon.spy()
    });
    obj.mount();
    expect(handler.on.callCount).to.eql(1);
    expect(handler.off.callCount).to.eql(0);

    obj.unmount();
    expect(handler.off.callCount).to.eql(1);
  });

  it('custom methods (on/off) and static target', function() {
    React.events.handle('custom2', {
      target:  handler,
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
    expect(handler.onCustom.callCount).to.eql(1);
    expect(handler.offCustom.callCount).to.eql(0);

    obj.unmount();
    expect(handler.offCustom.callCount).to.eql(1);
  });

  it('should not provide any arguments if the handler method is "forceUpdate"', function() {
    React.events.handle('custom3', {
      target:  handler
    });

    var obj = newComponent({
      events: {
        'custom3:foo': 'forceUpdate',
      },
      forceUpdate: sinon.spy()
    });
    obj.mount();
    expect(handler.on.callCount).to.eql(1);
  });
});
