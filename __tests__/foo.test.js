const assert = require('assert');

describe('foo', () => {
  it('hoge,fuga', () => {
    const obj = {
      hoge: 1,
      fuga: 2,
    };
    assert(obj.hoge === 1);
    assert(obj.fuga === 2);
  });
});
