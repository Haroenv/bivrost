import deepExtend from '../util/deep-extend';
import transpose from '../util/transpose';
import SourceMethod from './source-method';
import Cache from './cache';
import PromiseCache from './promise-cache';


function protoReduce(obj, callback, state) {
  let cur = obj;
  let lifo = [];
  
  do {
    lifo.push([callback, cur]);
    cur = cur.__proto__;
  } while (cur);

  for (var i = lifo.length - 1; i >= 0; i--) {
    let [callback, cur] = lifo[i];
    state = callback(state, cur);
  }

  return state;
}

function mergeConfigs(methodName, obj, deep) {
  function add(state, obj) {
    if(obj.hasOwnProperty(methodName)) {
      let currentConf = obj[methodName].call(this);
      if(deep) {
        return deepExtend(state, currentConf);
      } else {
        return Object.assign({}, state, currentConf);
      }
    }
    return state;
  }
  return protoReduce(obj, add, {});
}

function buildResource(configByMethod) {
  let resource = {};

  Object.keys(configByMethod)
    .forEach((methodName) => {
      let methodConf = configByMethod[methodName];
      if (methodConf.props) {
        resource[methodName] = methodConf.props;
      } else {
        resource[methodName] = SourceMethod(configByMethod[methodName]);
      }
    });
  return resource;
}

function buildCaches(configByMethod) {
  let caches = {};
  Object.keys(configByMethod).forEach(key => {
    var cacheConf = configByMethod[key].cache;
    if(cacheConf) {
      caches[key] = new Cache(cacheConf);
    }
  });

  return caches;
}


export default class DataSource {
  constructor(options={}) {
    this.options = options;

    this.properties = mergeConfigs('properties', this, false);
    this.methodProperties = transpose(mergeConfigs('methodProperties', this, true));
    this.resourceProperties = transpose(mergeConfigs('resourceProperties', this, true));

    this.resource = buildResource(this.resourceProperties);
    if(this.getProperty('enableCache')) {
      this.caches = buildCaches(this.methodProperties);
    } else {
      this.caches = {};
    }
  }

  properties() {
    return {
      enableCache: false
    }
  }

  invokeResourceMethod(methodName, params) {
    params = this.checkInputType(methodName, params);

    return this.invokeCached(
        methodName,
        this.resource[methodName].bind(this.resource),
        params);
  }

  invokeCached(methodName, fn, params) {
    var cache = this.caches[methodName];
    if(!cache) {
      return fn(params);
    }
    var key = this.getCacheKey(methodName, params);
    return PromiseCache(cache, key, ()=>fn(params));
  }

  checkInputType(methodName, params) {
    let struct = this.getResourceProperty(methodName, 'requestStruct');
    if(struct) {
      return struct(params);
    }
    return params;
  }

  getCacheKey(method, params) {
    let methodGetCacheKey = this.getMethodProperty(method, 'getCacheKey');
    if(methodGetCacheKey) {
      return methodGetCacheKey.call(this, method, params);
    }
    return JSON.stringify(params);
  }

  getProperty(key) {
    return this.properties[key];
  }

  getMethodProperty(method, key) {
    let methodProperties = this.methodProperties[method];
    if(!methodProperties) {
      return undefined;
    }
    return methodProperties[key];
  }

  getResourceProperty(method, key) {
    let resourceProperties = this.resourceProperties[method];
    if(!resourceProperties) {
      return undefined;
    }
    return resourceProperties[key];
  }
}
