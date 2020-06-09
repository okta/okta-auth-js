var AsyncMethodQueue = require('../../lib/AsyncMethodQueue');

describe('AsyncMethodQueue', () => {
  var asyncQueue;
  beforeEach(() => {
    asyncQueue = new AsyncMethodQueue();
  });

  it('initial state, empty queue, running = false', () => {
    expect(asyncQueue.queue.length).toBe(0);
    expect(asyncQueue.running).toBe(false);
  });

  it('adds an item to the queue, calls run', (done) => {
    var fn = jest.fn();
    jest.spyOn(asyncQueue, 'run').mockImplementation(() => {
      expect(asyncQueue.queue.length).toBe(1);
      done();
    })
    asyncQueue.push(fn);
  });

  it('after sync method is called, calls run again', (done) => {
    var fn = jest.fn();
    var callCount = 0;
    var originalRun = AsyncMethodQueue.prototype.run;
    jest.spyOn(asyncQueue, 'run').mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // call original method
        originalRun.call(asyncQueue);
        return;
      }
      expect(callCount).toBe(2);
      expect(asyncQueue.queue.length).toBe(0);
      done();
    })
    asyncQueue.push(fn);
  });

  it('after async method is called, calls run again', (done) => {
    var fn = jest.fn().mockReturnValue(Promise.resolve('foo'));
    var callCount = 0;
    var originalRun = AsyncMethodQueue.prototype.run;
    jest.spyOn(asyncQueue, 'run').mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // call original method
        originalRun.call(asyncQueue);
        return;
      }
      expect(callCount).toBe(2);
      expect(asyncQueue.queue.length).toBe(0);
      done();
    })
    asyncQueue.push(fn)
      .then(res => {
        expect(res).toBe('foo');
      })
      .catch(err => {
        done.fail(err);
      });
  });

  it('returns a promise which resolves after method is called', () => {
    var fn = jest.fn();
    return asyncQueue.push(fn)
      .then(() => {
        expect(fn).toHaveBeenCalled();
      });
  });

  it('can set "this" object for the function', () => {
    var context = { foo: 'bar' };
    var fn = jest.fn().mockImplementation(function () {
      expect(this).toBe(context);
    });
    return asyncQueue.push(fn, context)
      .then(() => {
        expect(fn).toHaveBeenCalled();
      });
  });

  it('passes arguments to the function', () => {
    var fn = jest.fn();
    return asyncQueue.push(fn, null, 'foo', 'bar')
      .then(() => {
        expect(fn).toHaveBeenCalledWith('foo', 'bar');
      });
  });

  it('if method is async, returned promise is resolved with method promise value', () => {
    var resolvePromise;
    var fn = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        resolvePromise = resolve;
      });
    })
    var promise = asyncQueue.push(fn);
    resolvePromise('foo');

    return promise
      .then((res) => {
        expect(res).toBe('foo');
      });
  });

  it('proxies promise rejection from async method', () => {
    var rejectPromise;
    var fn = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        rejectPromise = resolve;
      });
    })
    var promise = asyncQueue.push(fn);
    rejectPromise(new Error('foo'));

    return promise
      .catch((err) => {
        expect(err.message).toBe('foo');
      });
  });

  it('queues up methods so they do not execute concurrently', () => {
    var resolve1, resolve2;

    // function 1 will resolve when we call resolve1()
    var fn1 = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        resolve1 = resolve;
      });
    });

    // function 2 will resolve fn2Promise when it is called
    var fn2Promise = new Promise(resolve => {
      resolve2 = resolve;
    })
    var fn2 = jest.fn().mockImplementation(() => {
      resolve2();
      return Promise.resolve('bar');
    });
    var p1 = asyncQueue.push(fn1);
    expect(fn1).toHaveBeenCalled();
    var p2 = asyncQueue.push(fn2);
    expect(fn2).not.toHaveBeenCalled();
    resolve1('foo'); // resolve fn1
    return p1
      .then(fn1Res => {
        expect(fn1Res).toBe('foo');
        return fn2Promise; // resolves when fn2 is called
      })
      .then(() => {
        expect(fn2).toHaveBeenCalled();
        return p2;
      })
      .then(fn2Res => {
        expect(fn2Res).toBe('bar');
      });
  })
});