const rootMap = new Map();
/**
 * @param {String} root - 根键
 * @param {Function} instance - 以根键返回已创建的实例
 */
export default class LocalStorageWrapper {
  constructor (root) {
    //根键
    if (!root) throw new TypeError('needs a root key.');
    if (typeof root !== 'string') throw new TypeError('rootkey must be a type of string.');
    this._storage = window.localStorage;
    this._root = root;
    if (rootMap.has(root)) {
      throw Error(`rootkey ${root} has already been used, please use LocalStorageWrapper.instance("${root}") to get the LocalStorageWrapper instance.`);
    }
    //初始化
    if (!this._storage.getItem(root)) {
      this._storage.setItem(root, JSON.stringify({}));
    }
    !(rootMap.has(root)) && rootMap.set(root, this);
  }
  all = () => JSON.parse(this._storage.getItem(this._root));
  /**
   * 
   * @param {string} key
   * @param {(string|number|object|Array|boolean|!null)} value
   */
  put = (key, value) => {
    if (typeof key !== 'string' || key === '') {
      throw new TypeError('invaild key type.');
    }
    const data = this.all();
    data[key] = value;
    this._storage.setItem(this._root, JSON.stringify(data));
  };
  /**
   * 
   * @param {object} data - 存储对象
   */
  bulk = data => {
    if (typeof data !== 'object') throw TypeError('data should be object type');
    this._storage.setItem(this._root, JSON.stringify({ ...this.all(), ...data }));
  };
  /**
   * 
   * @param {string} key
   */
  pick = key => this.all()[key];
  /**
   * 
   * @param {string} key
   */
  delete = key => {
    if (typeof key !== 'string' || key === '') {
      throw new TypeError('invaild key type.');
    }
    const data = this.all();
    delete data[key];
    this._storage.setItem(this._root, JSON.stringify(data));
  };
  clear = () => this._storage.setItem(this._root, "{}");
  /**
   * 
   * @param {String} root - 根键
   */
  static instance = root => {
    const inst = rootMap.get(root);
    if (inst) {
      return inst;
    }
    return new LocalStorageWrapper(root);
  };
  static clearRootKeyMap = () => {
    rootMap.clear();
  };
}