/*
  OqueryJS
  Version: 1.0
  Copyright 2010-2011 Jared Barboza (codeimpossible.com)
  Licensed under the MIT license

  for more information about OQuery (Formerly JSOQ) see: http://codeimpossible.com/
*/

(function(window) {
  "use strict";
  /**
  * @constructor
  */
  function ObjectQuery() {

    //private variables
    var $break = {};

    function isArray(__x) {
      return __x && __x.constructor === Array;
    }

    //privleged functions
    function enumerateOver(collection, work) {
      var result = [], val = [];

      if (isArray(collection)) {
        try {
          for (var i = 0, l = collection.length; i < l; i++) {
            result = work(collection[i], i);
            if (typeof result !== "undefined" && result != null) {
              val.push(result);
            }
          }
        } catch (e) {
          if (e != oquery.$break) throw (e);
        }

        if (val.length > 0) {
          return val;
        }
      } else {
        try {
          val = work(collection, 0);
        }
        catch (e) {
          if (e != oquery.$break) throw (e);
        }
        if (typeof val !== 'undefined') {
          return val;
        }
      }
      return result || [];
    }

    /**
    * @constructor
    */
    function queryable(obj) {
      queryable.prototype.queryTarget = obj;
      queryable.prototype.queryProperties = [];

      var parent = queryable.prototype;

      if (isArray(parent.queryTarget)) {
        return parent.queryTarget.length === 1 ?
      new qualifyable(parent.queryTarget[0]) :
      new qualifyable(parent.queryTarget);
      }
      else {
        return new qualifyable(parent.queryTarget);
      }
    }

    //public functions
    ObjectQuery.prototype.from = function(obj) {
      if (typeof (obj) === 'undefined' || !obj || obj === null) {
        obj = [];
      }

      return new queryable(obj);
    };

    /**
    * @constructor
    */
    function qualifyable(o) {
      if (typeof (o) === 'undefined' || !o || o === null) {
        o = [];
      }

      qualifyable.prototype.queryTarget = o;
      var parent = qualifyable.prototype;

      qualifyable.prototype.distinct = function() {
        if (!isArray(parent.queryTarget)) {
          return parent.queryTarget;
        }

        function compare(obj1, obj2) {
          var getMembers = function(o) {
            var properties = [];
            for (p in o) properties.push(p.toString());
            return properties;
          }

          var o1 = getMembers(obj1).sort();
          var o2 = getMembers(obj2).sort();

          if (o1.length !== o2.length) return false;

          for (var i = 0, l = o1.length; i < l; i++) {
            if (o1[i] !== o2[i] ||
        (typeof obj1[o1[i]] !== 'function' &&
        typeof obj2[o2[i]] !== 'function' &&
        obj1[o1[i]] !== obj2[o2[i]])) {
              return false;
            }
          }
          return true;
        }

        var results = enumerateOver(parent.queryTarget, function(outter, c) {
          var match = enumerateOver(parent.queryTarget, function(inner, cc) {
            var x = compare(outter, inner);

            if (x && c != cc && c > cc) {
              return true;
            }
          });

          if (match == null) {
            return outter;
          }
        });

        return new qualifyable(results.length > 1 ? results : results[0]);
      };

      qualifyable.prototype.where = function(comparisonFunc) {
        var result = [];
        if (isArray(parent.queryTarget)) {
          result = enumerateOver(parent.queryTarget, function(i) {
            if (comparisonFunc(i)) {
              return i;
            }
          });
        }
        else {
          if (comparisonFunc(parent.queryTarget)) {
            result.push(parent.queryTarget);
          }
        }

        if (typeof result === 'undefined') {
          result = null;
        }

        return new qualifyable(result === null ? result : result.length == 1 ? result[0] : result.length == 0 ? null : result);
      };

      qualifyable.prototype.first = function() {
        return isArray(parent.queryTarget) ? new qualifyable(parent.queryTarget[0]) : parent.queryTarget;
      };

      qualifyable.prototype.last = function() {
        return isArray(parent.queryTarget) ?
      new qualifyable(parent.queryTarget[parent.queryTarget.length - 1]) :
      parent.queryTarget;
      };

      qualifyable.prototype.extendEach = function(extension) {
        var extendFunc = function(o, e) {
          if (typeof e !== 'function') return;
          var t;
          window['$base'] = o;
          t = new e();
          o['$base'] = window['$base'];
          window['$base'] = null;

          for (key in t) {
            o[key] = t[key];
          }

          return o;
        };

        var result;

        if (isArray(parent.queryTarget)) {
          result = enumerateOver(parent.queryTarget, function(i) {
            return extendFunc(i, extension);
          });
        }
        else {
          result = extendFunc(parent.queryTarget, extension);
        }

        return new qualifyable(result);
      };

    qualifyable.prototype.leftJoin = function(collection, propName, on) {
        var opts = {};

    opts = arguments.length === 1 ? arguments[0] : {
      source: !isArray(collection) ? new queryable(parent.queryTarget) : collection,
      propertyName: propName,
      on: on
    };

    var parentWasMatchedAtLeastOnce = false;
    var childMatchesParent = false;

    for (var lefti = -1, leftLen = parent.queryTarget.length; ++lefti < leftLen; ) {


      var result = [];
      var left = parent.queryTarget[lefti]; //tboz

      var result = enumerateOver( opts.source, function(right, index) {
      if ( opts.on.call( left, right ) ) {
        return right;
      }
      });

      parent.queryTarget[lefti][opts.propertyName] = result.length > 0 ? result : [];
    }
    return new qualifyable(parent.queryTarget);
      };

    qualifyable.prototype.innerJoin = function(collection, propName, on) {
        var opts = {};

    opts = arguments.length === 1 ? arguments[0] : {
      source: !isArray(collection) ? new queryable(parent.queryTarget) : collection,
      propertyName: propName,
      on: on
    };

    var results = this.leftJoin(opts);

    results = results.where(function(i) {
      return i[opts.propertyName] !== [];

    }).select();

    return new qualifyable( results );
      };

      qualifyable.prototype.take = function(number) {
        if (!isArray(parent.queryTarget)) {
          return new queryable(parent.queryTarget);
        }

        var counter = 0;
        var results = enumerateOver(parent.queryTarget, function(item, i) {
          if (++counter <= number) {
            return item;
          }
        });

        return new queryable(results);
      };

      qualifyable.prototype.skip = function(number) {
        if (!isArray(parent.queryTarget)) {
          return new queryable(parent.queryTarget);
        }

        var results = enumerateOver(parent.queryTarget, function(item, i) {
          if ((i + 1) > number) {
            return item;
          }
        });

        return new queryable(results);
      };

      qualifyable.prototype.forEach = function(f) {
        return enumerateover(this, f);
      };

      qualifyable.prototype.select = function() {
        var properties = [];
        if( arguments.length === 1 && typeof(arguments[0]) === "object") {
          if( properties === [] && arguments.length === 1 ) {
          for( var p in arguments[0] ) {
            properties.push(p);
          }
          }
        } else {
          properties = arguments.length > 0 ? arguments : [];
        }

        var ref = {};

        for (var i = 0, l = properties.length; i < l; i++) {
          ref[properties[i]] = null;
        }

        var results = enumerateOver(parent.queryTarget, function(item) {
          var m = null;

          if (typeof (item) != 'object' && properties.length == 0) {
            m = item;
          } else {
            for (var key in item) {
              if (properties.length > 0) {
                for (var count = 0, len = properties.length; count < len; count++) {
                  if (properties[count] == key) {
                    if (m === null) m = {};
                    m[key] = item[key];
                    break;
                  }
                }
              }
              else {
                if (m === null) m = {};
                m[key] = item[key];
              }
            }
          }
          return m;
        });

        results["$ea"] = (function(enu) {
          return function(f) {
            return enu(this, f);
          };
        })(enumerateOver);

        results["$asQueryable"] = function() {
          return new queryable(this);
        }

        return results;
      };
    }
  }

  // if we're running in NODE there is no 'window'
  if(typeof(window) !== 'undefined') {
    if (typeof window.$q !== 'undefined') {
      window._q = window.$q;
    }

    if (typeof window.oquery !== "undefined") {
      window._oquery = window.oquery;
    }

    window.oquery = new ObjectQuery();
    window.$q = window.oquery.from;
  }

  if(module && module.exports) module.exports = new ObjectQuery();
})(this);
