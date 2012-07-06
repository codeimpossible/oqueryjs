var assert = require("assert")

var oquery = require("../src/oquery")

describe('OQuery', function(){
  describe('select()', function(){

    it('should return subset of properties for every item if called without where()', function(){
      var items = [{ hi: "hello", bye: "good-bye"}, { hi: "hello", bye: "good-bye"}];

      var results = oquery.from(items).select("hi");

      assert.equal(2, results.length);
      assert.equal("hello", results[0].hi);
      assert.equal("hello", results[1].hi);
    });

    it('should return subset of properties from a single object', function(){
      var result = oquery.from({ hi: "hello", bye: "good-bye"}).select("hi");

      assert.equal("hello", result.hi);
    });

    it('should return the same object if called with no arguments', function(){
      var result = oquery.from({ test: 10, test_again: 11 }).select();

      assert.equal(10, result.test);
      assert.equal(11, result.test_again);
    });

  });
});
