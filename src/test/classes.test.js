import assert from 'assert';
import DataSource from '../data/source';
import httpBin from './http-bin';


function getClass() {
  class DS_A extends DataSource {
    static prepare = {
      post: req => ({foo: req.Foo, bar: req.Bar}),
      get: req => ({foo: req.Foo, bar: req.Bar})
    };

    static process = {
      post: res => res.json,
      get: res => res.args
    };

    static cache = {
      get: {
        enabled: true
      }
    };

    post(params) {
      return this.invoke('post', params);
    }

    get(params) {
      return this.invoke('get', params);
    }
  }

  class DS_B extends DS_A {
    highLevelMethod() {
      return this.post({
        Foo: this.options.a,
        Bar: 200
      });
    }
  }

  class DS_C extends DS_B {
    static api = {
      post: httpBin('POST /post'),
      get: httpBin('GET /get')
    }
  }

  return DS_C;
}


describe('Classes', () => {
  it('should work', (done) => {
    let DS = getClass();

    let ds = new DS({
      a: 8889
    });

    ds.highLevelMethod()
      .then(res => {
        assert.deepEqual(res, {
          bar: 200,
          foo: 8889
        });
      })
      .then(() => done(), done);
  });
});
