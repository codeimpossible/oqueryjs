var assert = require("assert")

var oquery = require("../src/oquery")

describe('OQuery', function(){
  describe('From()', function(){

    it('should not throw an exception when called with empty object', function(){
      var result = oquery.from( {} );
      assert.equal( false, result === null );
    });

    it('should not throw an exception when called with empty function', function(){
      var result = oquery.from( function() {} );
      assert.equal( false, result === null );
    });

    it('should not throw an exception when called with null', function(){
      var result = oquery.from( null );
      assert.equal( false, result === null );
    });

    it('should extend the result with a where method', function() {
      var result = oquery.from( [] );

      assert.equal( typeof(Function), typeof(result['where']) );
    });

    it('should extend the result with a distinct method', function() {
      var result = oquery.from( [] );

      assert.equal( typeof(Function), typeof(result['distinct']) );
    });

    it('should extend the result with a first method', function() {
      var result = oquery.from( [] );

      assert.equal( typeof(Function), typeof(result['first']) );
    });

    it('should extend the result with a last method', function() {
      var result = oquery.from( [] );

      assert.equal( typeof(Function), typeof(result['last']) );
    });

    it('should extend the result with a leftJoin method', function() {
      var result = oquery.from( [] );

      assert.equal( typeof(Function), typeof(result['leftJoin']) );
    });

    it('should extend the result with a innerJoin method', function() {
      var result = oquery.from( [] );

      assert.equal( typeof(Function), typeof(result['innerJoin']) );
    });

    it('should extend the result with a extendEach method', function() {
      var result = oquery.from( [] );

      assert.equal( typeof(Function), typeof(result['extendEach']) );
    });
  });
});
