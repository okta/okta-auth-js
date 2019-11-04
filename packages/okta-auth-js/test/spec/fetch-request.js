describe('fetchRequest', function () {
  var Q = require('q');
  var mockFetchResult;
  var mockFetchObj = {
    fetch: function mockFetchFunc() {
      return Q.resolve(mockFetchResult);
    }
  }
  jest.setMock('cross-fetch', function() {
    return mockFetchObj.fetch.apply(null, arguments);
  });

  var fetchRequest = require('../../fetch/fetchRequest');

  beforeEach(function() {
    /* global Map */
    mockFetchResult = {
      headers: new Map(),
      json: function() {
        return Q.resolve();
      },
      text: function() {
        return Q.resolve();
      }
    }
  });

  it('JSON encodes request body if request Content-Type is application/json', function() {
    var spy = jest.spyOn(mockFetchObj, 'fetch');
    var method = 'GET';
    var url = 'http://fakey.local';
    var headers = {
      'Content-Type': 'application/json'
    };
    var obj = {
      foo: 'bar'
    };
    var jsonObj = JSON.stringify(obj);

    fetchRequest(method, url, {
      headers: headers,
      data: obj
    });

    expect(spy).toHaveBeenCalledWith(url, {
      method: method,
      headers: headers,
      body: jsonObj,
      credentials: 'include'
    });
  });

  it('Leaves request body unchanged if request Content-Type is NOT application/json', function() {
    var spy = jest.spyOn(mockFetchObj, 'fetch');
    var method = 'GET';
    var url = 'http://fakey.local';
    var obj = {
      foo: 'bar'
    };

    fetchRequest(method, url, {
      data: obj
    });

    expect(spy).toHaveBeenCalledWith(url, {
      method: method,
      body: obj,
      credentials: 'include'
    });
  });

  it('Can omit credentials', function() {
    var spy = jest.spyOn(mockFetchObj, 'fetch');
    var method = 'GET';
    var url = 'http://fakey.local';

    fetchRequest(method, url, {
      withCredentials: false
    });

    expect(spy).toHaveBeenCalledWith(url, {
      method: method,
      credentials: 'omit'
    });
  });

});
