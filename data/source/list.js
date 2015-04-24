import DataSource from '../source';

export default class DataSourceList extends DataSource {

  getList(params) {
    return this.invokeResourceMethod('getList', params);
  }

  getItem(params) {
    return this.invokeResourceMethod('getItem', params);
  }

  getItemById(id) {
    let idField = this.getProperty('idField');
    return this.getItem({
      [idField]: id
    });
  }

  properties() {
    return {
      idField: 'id',
      enableCache: true,
    }
  }

  methodProperties() {
    return {
      cache: {
        getList: {
          ttl: 60000
        },
        getItem: {
          ttl: 60000
        },
      }
    };
  }
}
