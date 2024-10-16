import { jsonpath } from '../../../lib/util/jsonpath';

describe('jsonpath', () => {

  it('should parse json paths from objects', () => {
    expect(jsonpath({
      path: '$.foo.bar',
      json: { foo: { bar: 'pass' } }
    })).toEqual('pass');

    expect(jsonpath({
      path: 'foo.bar',
      json: { foo: { bar: { baz: 'pass' } } }
    })).toEqual({ baz: 'pass' });

    expect(jsonpath({
      path: '$.foo.bar[12]',
      json: { foo: { bar: Array(15).fill('pass') } }
    })).toEqual('pass');

    expect(jsonpath({
      path: 'foo[22].bar',
      json: { foo: Array(25).fill({ bar: 'pass' }) }
    })).toEqual('pass');

    expect(jsonpath({
      path: 'not.a.path',
      json: { foo: 1 }
    })).toEqual(undefined);

    expect(jsonpath({
      path: '$.foo.bar[12]',
      json: { foo: { bar: [] } }
    })).toEqual(undefined);

    expect(jsonpath({
      path: '$.foo.bar',
      json: { foo: { bar: {} } }
    })).toEqual({});

    expect(jsonpath({
      path: '$.foo.bar.baz',
      json: { foo: { bar: [] } }
    })).toEqual(undefined);

    expect(jsonpath({
      path: '',
      json: { foo: { bar: [] } }
    })).toEqual(undefined);

    expect(jsonpath({
      path: '[]',
      json: { foo: { bar: [] } }
    })).toEqual(undefined);

    expect(jsonpath({
      path: '{}',
      json: { foo: { bar: [] } }
    })).toEqual(undefined);
  });

  it('should gracefully handle RCE (remote code execution) attempts', () => {
    const evalSpy = jest.spyOn(global, 'eval');
    global.alert = jest.fn();
    const alertSpy = jest.spyOn(global, 'alert');

    expect(
      jsonpath({
        path: '$..[?(' + '(function a(arr){' + 'a([...arr, ...arr])' + '})([1]);)]',
        json: {
          nonEmpty: 'object',
        },
      })
    ).toBeUndefined();

    expect(
      jsonpath({
        path: `$[(this.constructor.constructor("eval(alert('foo'))")())]`,
        json: {
          nonEmpty: 'object',
        },
      })
    ).toBeUndefined();

    expect(
      jsonpath({
        path: `$[(this.constructor.constructor("require("child_process").exec("echo 'foo'")")())]`,
        json: {
          nonEmpty: 'object',
        },
      })
    ).toBeUndefined();

    expect(evalSpy).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
  });

});
