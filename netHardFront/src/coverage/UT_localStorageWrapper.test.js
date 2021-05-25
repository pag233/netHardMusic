import LocalStroageWrapper from '../components/common/localStorageWrapper';

describe('can access key-value pairs', () => {
  let lsw;
  const key = "key", value = "value";
  const rootKey = 'rootKey';
  beforeEach(() => {
    LocalStroageWrapper.clearRootKeyMap();
    lsw = new LocalStroageWrapper(rootKey);
    lsw.clear();
    lsw.put(key, value);
  });
  it('should get stored value', () => {
    expect(lsw.pick(key)).toBe(value);
  });
  it('should not get none stored value', () => {
    expect(lsw.pick('notakey')).toBe(undefined);
  });
  it('could delete stored key', () => {
    lsw.delete(key);
    expect(lsw.pick(key)).toBe(undefined);
  });
  it('same key should get same instance', () => {
    expect(lsw.pick(key)).toBe(value);
    const sameLsw = LocalStroageWrapper.instance(rootKey);
    expect(sameLsw.pick(key)).toBe(value);
  });
  it('could store object type', () => {
    const data = { foo: 'foo', bar: 'bar' };
    lsw.bulk(data);
    expect(lsw.pick('foo')).toBe('foo');
    expect(lsw.pick(key)).toBe(value);
  });
  it('should not store any none json-parsable object', () => {
    const data = { bar: () => console.log('foobar') };
    lsw.bulk(data);
    expect(lsw.pick('bar')).toBe(undefined);
    expect(lsw.pick(key)).toBe(value);
  });
  it('could replace stored key-value pair', () => {
    const value = 'value_alt';
    lsw.put(key, value);
    expect(lsw.pick(key)).toBe(value);
  });
  it('could get all stored value', () => {
    const key2 = 'key2';
    const value2 = 'value2';
    lsw.put(key2, value2);
    expect(lsw.all()).toEqual({ [key]: value, [key2]: value2 });
  });
});

