var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function (h) {
  var g = 0;
  return function () {
    return g < h.length ? { done: !1, value: h[g++] } : { done: !0 };
  };
};
$jscomp.arrayIterator = function (h) {
  return { next: $jscomp.arrayIteratorImpl(h) };
};
$jscomp.makeIterator = function (h) {
  var g = 'undefined' != typeof Symbol && Symbol.iterator && h[Symbol.iterator];
  return g ? g.call(h) : $jscomp.arrayIterator(h);
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.ISOLATE_POLYFILLS = !1;
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = !1;
$jscomp.getGlobal = function (h) {
  h = [
    'object' == typeof globalThis && globalThis,
    h,
    'object' == typeof window && window,
    'object' == typeof self && self,
    'object' == typeof global && global,
  ];
  for (var g = 0; g < h.length; ++g) {
    var k = h[g];
    if (k && k.Math == Math) return k;
  }
  throw Error('Cannot find global object');
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || 'function' == typeof Object.defineProperties
    ? Object.defineProperty
    : function (h, g, k) {
        if (h == Array.prototype || h == Object.prototype) return h;
        h[g] = k.value;
        return h;
      };
$jscomp.IS_SYMBOL_NATIVE = 'function' === typeof Symbol && 'symbol' === typeof Symbol('x');
$jscomp.TRUST_ES6_POLYFILLS = !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = '$jscp$';
var $jscomp$lookupPolyfilledValue = function (h, g) {
  var k = $jscomp.propertyToPolyfillSymbol[g];
  if (null == k) return h[g];
  k = h[k];
  return void 0 !== k ? k : h[g];
};
$jscomp.polyfill = function (h, g, k, l) {
  g &&
    ($jscomp.ISOLATE_POLYFILLS
      ? $jscomp.polyfillIsolated(h, g, k, l)
      : $jscomp.polyfillUnisolated(h, g, k, l));
};
$jscomp.polyfillUnisolated = function (h, g, k, l) {
  k = $jscomp.global;
  h = h.split('.');
  for (l = 0; l < h.length - 1; l++) {
    var p = h[l];
    if (!(p in k)) return;
    k = k[p];
  }
  h = h[h.length - 1];
  l = k[h];
  g = g(l);
  g != l && null != g && $jscomp.defineProperty(k, h, { configurable: !0, writable: !0, value: g });
};
$jscomp.polyfillIsolated = function (h, g, k, l) {
  var p = h.split('.');
  h = 1 === p.length;
  l = p[0];
  l = !h && l in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
  for (var A = 0; A < p.length - 1; A++) {
    var m = p[A];
    if (!(m in l)) return;
    l = l[m];
  }
  p = p[p.length - 1];
  k = $jscomp.IS_SYMBOL_NATIVE && 'es6' === k ? l[p] : null;
  g = g(k);
  null != g &&
    (h
      ? $jscomp.defineProperty($jscomp.polyfills, p, { configurable: !0, writable: !0, value: g })
      : g !== k &&
        (void 0 === $jscomp.propertyToPolyfillSymbol[p] &&
          ((k = (1e9 * Math.random()) >>> 0),
          ($jscomp.propertyToPolyfillSymbol[p] = $jscomp.IS_SYMBOL_NATIVE
            ? $jscomp.global.Symbol(p)
            : $jscomp.POLYFILL_PREFIX + k + '$' + p)),
        $jscomp.defineProperty(l, $jscomp.propertyToPolyfillSymbol[p], {
          configurable: !0,
          writable: !0,
          value: g,
        })));
};
$jscomp.polyfill(
  'Promise',
  function (h) {
    function g() {
      this.batch_ = null;
    }
    function k(m) {
      return m instanceof p
        ? m
        : new p(function (r, v) {
            r(m);
          });
    }
    if (
      h &&
      (!(
        $jscomp.FORCE_POLYFILL_PROMISE ||
        ($jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION &&
          'undefined' === typeof $jscomp.global.PromiseRejectionEvent)
      ) ||
        !$jscomp.global.Promise ||
        -1 === $jscomp.global.Promise.toString().indexOf('[native code]'))
    )
      return h;
    g.prototype.asyncExecute = function (m) {
      if (null == this.batch_) {
        this.batch_ = [];
        var r = this;
        this.asyncExecuteFunction(function () {
          r.executeBatch_();
        });
      }
      this.batch_.push(m);
    };
    var l = $jscomp.global.setTimeout;
    g.prototype.asyncExecuteFunction = function (m) {
      l(m, 0);
    };
    g.prototype.executeBatch_ = function () {
      for (; this.batch_ && this.batch_.length; ) {
        var m = this.batch_;
        this.batch_ = [];
        for (var r = 0; r < m.length; ++r) {
          var v = m[r];
          m[r] = null;
          try {
            v();
          } catch (B) {
            this.asyncThrow_(B);
          }
        }
      }
      this.batch_ = null;
    };
    g.prototype.asyncThrow_ = function (m) {
      this.asyncExecuteFunction(function () {
        throw m;
      });
    };
    var p = function (m) {
      this.state_ = 0;
      this.result_ = void 0;
      this.onSettledCallbacks_ = [];
      this.isRejectionHandled_ = !1;
      var r = this.createResolveAndReject_();
      try {
        m(r.resolve, r.reject);
      } catch (v) {
        r.reject(v);
      }
    };
    p.prototype.createResolveAndReject_ = function () {
      function m(B) {
        return function (y) {
          v || ((v = !0), B.call(r, y));
        };
      }
      var r = this,
        v = !1;
      return { resolve: m(this.resolveTo_), reject: m(this.reject_) };
    };
    p.prototype.resolveTo_ = function (m) {
      if (m === this) this.reject_(new TypeError('A Promise cannot resolve to itself'));
      else if (m instanceof p) this.settleSameAsPromise_(m);
      else {
        a: switch (typeof m) {
          case 'object':
            var r = null != m;
            break a;
          case 'function':
            r = !0;
            break a;
          default:
            r = !1;
        }
        r ? this.resolveToNonPromiseObj_(m) : this.fulfill_(m);
      }
    };
    p.prototype.resolveToNonPromiseObj_ = function (m) {
      var r = void 0;
      try {
        r = m.then;
      } catch (v) {
        this.reject_(v);
        return;
      }
      'function' == typeof r ? this.settleSameAsThenable_(r, m) : this.fulfill_(m);
    };
    p.prototype.reject_ = function (m) {
      this.settle_(2, m);
    };
    p.prototype.fulfill_ = function (m) {
      this.settle_(1, m);
    };
    p.prototype.settle_ = function (m, r) {
      if (0 != this.state_)
        throw Error(
          'Cannot settle(' + m + ', ' + r + '): Promise already settled in state' + this.state_
        );
      this.state_ = m;
      this.result_ = r;
      2 === this.state_ && this.scheduleUnhandledRejectionCheck_();
      this.executeOnSettledCallbacks_();
    };
    p.prototype.scheduleUnhandledRejectionCheck_ = function () {
      var m = this;
      l(function () {
        if (m.notifyUnhandledRejection_()) {
          var r = $jscomp.global.console;
          'undefined' !== typeof r && r.error(m.result_);
        }
      }, 1);
    };
    p.prototype.notifyUnhandledRejection_ = function () {
      if (this.isRejectionHandled_) return !1;
      var m = $jscomp.global.CustomEvent,
        r = $jscomp.global.Event,
        v = $jscomp.global.dispatchEvent;
      if ('undefined' === typeof v) return !0;
      'function' === typeof m
        ? (m = new m('unhandledrejection', { cancelable: !0 }))
        : 'function' === typeof r
        ? (m = new r('unhandledrejection', { cancelable: !0 }))
        : ((m = $jscomp.global.document.createEvent('CustomEvent')),
          m.initCustomEvent('unhandledrejection', !1, !0, m));
      m.promise = this;
      m.reason = this.result_;
      return v(m);
    };
    p.prototype.executeOnSettledCallbacks_ = function () {
      if (null != this.onSettledCallbacks_) {
        for (var m = 0; m < this.onSettledCallbacks_.length; ++m)
          A.asyncExecute(this.onSettledCallbacks_[m]);
        this.onSettledCallbacks_ = null;
      }
    };
    var A = new g();
    p.prototype.settleSameAsPromise_ = function (m) {
      var r = this.createResolveAndReject_();
      m.callWhenSettled_(r.resolve, r.reject);
    };
    p.prototype.settleSameAsThenable_ = function (m, r) {
      var v = this.createResolveAndReject_();
      try {
        m.call(r, v.resolve, v.reject);
      } catch (B) {
        v.reject(B);
      }
    };
    p.prototype.then = function (m, r) {
      function v(f, aa) {
        return 'function' == typeof f
          ? function (ma) {
              try {
                B(f(ma));
              } catch (T) {
                y(T);
              }
            }
          : aa;
      }
      var B,
        y,
        ca = new p(function (f, aa) {
          B = f;
          y = aa;
        });
      this.callWhenSettled_(v(m, B), v(r, y));
      return ca;
    };
    p.prototype.catch = function (m) {
      return this.then(void 0, m);
    };
    p.prototype.callWhenSettled_ = function (m, r) {
      function v() {
        switch (B.state_) {
          case 1:
            m(B.result_);
            break;
          case 2:
            r(B.result_);
            break;
          default:
            throw Error('Unexpected state: ' + B.state_);
        }
      }
      var B = this;
      null == this.onSettledCallbacks_ ? A.asyncExecute(v) : this.onSettledCallbacks_.push(v);
      this.isRejectionHandled_ = !0;
    };
    p.resolve = k;
    p.reject = function (m) {
      return new p(function (r, v) {
        v(m);
      });
    };
    p.race = function (m) {
      return new p(function (r, v) {
        for (var B = $jscomp.makeIterator(m), y = B.next(); !y.done; y = B.next())
          k(y.value).callWhenSettled_(r, v);
      });
    };
    p.all = function (m) {
      var r = $jscomp.makeIterator(m),
        v = r.next();
      return v.done
        ? k([])
        : new p(function (B, y) {
            function ca(ma) {
              return function (T) {
                f[ma] = T;
                aa--;
                0 == aa && B(f);
              };
            }
            var f = [],
              aa = 0;
            do
              f.push(void 0),
                aa++,
                k(v.value).callWhenSettled_(ca(f.length - 1), y),
                (v = r.next());
            while (!v.done);
          });
    };
    return p;
  },
  'es6',
  'es3'
);
$jscomp.owns = function (h, g) {
  return Object.prototype.hasOwnProperty.call(h, g);
};
$jscomp.assign =
  $jscomp.TRUST_ES6_POLYFILLS && 'function' == typeof Object.assign
    ? Object.assign
    : function (h, g) {
        for (var k = 1; k < arguments.length; k++) {
          var l = arguments[k];
          if (l) for (var p in l) $jscomp.owns(l, p) && (h[p] = l[p]);
        }
        return h;
      };
$jscomp.polyfill(
  'Object.assign',
  function (h) {
    return h || $jscomp.assign;
  },
  'es6',
  'es3'
);
$jscomp.polyfill(
  'globalThis',
  function (h) {
    return h || $jscomp.global;
  },
  'es_2020',
  'es3'
);
$jscomp.polyfill(
  'Math.imul',
  function (h) {
    return h
      ? h
      : function (g, k) {
          g = Number(g);
          k = Number(k);
          var l = g & 65535,
            p = k & 65535;
          return (
            (l * p + (((((g >>> 16) & 65535) * p + l * ((k >>> 16) & 65535)) << 16) >>> 0)) | 0
          );
        };
  },
  'es6',
  'es3'
);
$jscomp.polyfill(
  'Math.fround',
  function (h) {
    if (h) return h;
    if ($jscomp.SIMPLE_FROUND_POLYFILL || 'function' !== typeof Float32Array)
      return function (k) {
        return k;
      };
    var g = new Float32Array(1);
    return function (k) {
      g[0] = k;
      return g[0];
    };
  },
  'es6',
  'es3'
);
$jscomp.polyfill(
  'Math.clz32',
  function (h) {
    return h
      ? h
      : function (g) {
          g = Number(g) >>> 0;
          if (0 === g) return 32;
          var k = 0;
          0 === (g & 4294901760) && ((g <<= 16), (k += 16));
          0 === (g & 4278190080) && ((g <<= 8), (k += 8));
          0 === (g & 4026531840) && ((g <<= 4), (k += 4));
          0 === (g & 3221225472) && ((g <<= 2), (k += 2));
          0 === (g & 2147483648) && k++;
          return k;
        };
  },
  'es6',
  'es3'
);
$jscomp.polyfill(
  'Math.trunc',
  function (h) {
    return h
      ? h
      : function (g) {
          g = Number(g);
          if (isNaN(g) || Infinity === g || -Infinity === g || 0 === g) return g;
          var k = Math.floor(Math.abs(g));
          return 0 > g ? -k : k;
        };
  },
  'es6',
  'es3'
);
$jscomp.checkStringArgs = function (h, g, k) {
  if (null == h)
    throw new TypeError(
      "The 'this' value for String.prototype." + k + ' must not be null or undefined'
    );
  if (g instanceof RegExp)
    throw new TypeError(
      'First argument to String.prototype.' + k + ' must not be a regular expression'
    );
  return h + '';
};
$jscomp.polyfill(
  'String.prototype.startsWith',
  function (h) {
    return h
      ? h
      : function (g, k) {
          var l = $jscomp.checkStringArgs(this, g, 'startsWith');
          g += '';
          var p = l.length,
            A = g.length;
          k = Math.max(0, Math.min(k | 0, l.length));
          for (var m = 0; m < A && k < p; ) if (l[k++] != g[m++]) return !1;
          return m >= A;
        };
  },
  'es6',
  'es3'
);
$jscomp.polyfill(
  'String.prototype.repeat',
  function (h) {
    return h
      ? h
      : function (g) {
          var k = $jscomp.checkStringArgs(this, null, 'repeat');
          if (0 > g || 1342177279 < g) throw new RangeError('Invalid count value');
          g |= 0;
          for (var l = ''; g; ) if ((g & 1 && (l += k), (g >>>= 1))) k += k;
          return l;
        };
  },
  'es6',
  'es3'
);
$jscomp.stringPadding = function (h, g) {
  h = void 0 !== h ? String(h) : ' ';
  return 0 < g && h ? h.repeat(Math.ceil(g / h.length)).substring(0, g) : '';
};
$jscomp.polyfill(
  'String.prototype.padStart',
  function (h) {
    return h
      ? h
      : function (g, k) {
          var l = $jscomp.checkStringArgs(this, null, 'padStart');
          return $jscomp.stringPadding(k, g - l.length) + l;
        };
  },
  'es8',
  'es3'
);
$jscomp.polyfill(
  'Array.prototype.copyWithin',
  function (h) {
    function g(k) {
      k = Number(k);
      return Infinity === k || -Infinity === k ? k : k | 0;
    }
    return h
      ? h
      : function (k, l, p) {
          var A = this.length;
          k = g(k);
          l = g(l);
          p = void 0 === p ? A : g(p);
          k = 0 > k ? Math.max(A + k, 0) : Math.min(k, A);
          l = 0 > l ? Math.max(A + l, 0) : Math.min(l, A);
          p = 0 > p ? Math.max(A + p, 0) : Math.min(p, A);
          if (k < l) for (; l < p; ) l in this ? (this[k++] = this[l++]) : (delete this[k++], l++);
          else
            for (p = Math.min(p, A + l - k), k += p - l; p > l; )
              --p in this ? (this[--k] = this[p]) : delete this[--k];
          return this;
        };
  },
  'es6',
  'es3'
);
$jscomp.typedArrayCopyWithin = function (h) {
  return h ? h : Array.prototype.copyWithin;
};
$jscomp.polyfill('Int8Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Uint8Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill(
  'Uint8ClampedArray.prototype.copyWithin',
  $jscomp.typedArrayCopyWithin,
  'es6',
  'es5'
);
$jscomp.polyfill('Int16Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Uint16Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Int32Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Uint32Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Float32Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Float64Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
var DracoDecoderModule = (function () {
  var h =
    'undefined' !== typeof document && document.currentScript ? document.currentScript.src : void 0;
  'undefined' !== typeof __filename && (h = h || __filename);
  return function (g) {
    function k(d) {
      return b.locateFile ? b.locateFile(d, Z) : Z + d;
    }
    function l(d, a) {
      d || y('Assertion failed' + (a ? ': ' + a : ''));
    }
    function p(d, a, c) {
      var e = a + c;
      for (c = a; d[c] && !(c >= e); ) ++c;
      if (16 < c - a && d.buffer && La) return La.decode(d.subarray(a, c));
      for (e = ''; a < c; ) {
        var n = d[a++];
        if (n & 128) {
          var t = d[a++] & 63;
          if (192 == (n & 224)) e += String.fromCharCode(((n & 31) << 6) | t);
          else {
            var C = d[a++] & 63;
            224 == (n & 240)
              ? (n = ((n & 15) << 12) | (t << 6) | C)
              : (240 != (n & 248) &&
                  fa(
                    'Invalid UTF-8 leading byte ' +
                      na(n) +
                      ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!'
                  ),
                (n = ((n & 7) << 18) | (t << 12) | (C << 6) | (d[a++] & 63)));
            65536 > n
              ? (e += String.fromCharCode(n))
              : ((n -= 65536), (e += String.fromCharCode(55296 | (n >> 10), 56320 | (n & 1023))));
          }
        } else e += String.fromCharCode(n);
      }
      return e;
    }
    function A(d, a) {
      return d ? p(oa, d, a) : '';
    }
    function m() {
      var d = pa.buffer;
      b.HEAP8 = da = new Int8Array(d);
      b.HEAP16 = new Int16Array(d);
      b.HEAP32 = ka = new Int32Array(d);
      b.HEAPU8 = oa = new Uint8Array(d);
      b.HEAPU16 = new Uint16Array(d);
      b.HEAPU32 = G = new Uint32Array(d);
      b.HEAPF32 = new Float32Array(d);
      b.HEAPF64 = new Float64Array(d);
    }
    function r() {
      var d = Ca();
      l(0 == (d & 3));
      0 == d && (d += 4);
      G[d >> 2] = 34821223;
      G[(d + 4) >> 2] = 2310721022;
      G[0] = 1668509029;
    }
    function v() {
      if (!ua) {
        var d = Ca();
        0 == d && (d += 4);
        var a = G[d >> 2],
          c = G[(d + 4) >> 2];
        (34821223 == a && 2310721022 == c) ||
          y(
            'Stack overflow! Stack cookie has been overwritten at ' +
              na(d) +
              ', expected hex dwords 0x89BACDFE and 0x2135467, but received ' +
              na(c) +
              ' ' +
              na(a)
          );
        1668509029 !== G[0] &&
          y('Runtime error: The application has corrupted its heap memory area (address zero)!');
      }
    }
    function B(d) {
      ia++;
      b.monitorRunDependencies && b.monitorRunDependencies(ia);
      d
        ? (l(!qa[d]),
          (qa[d] = 1),
          null === ja &&
            'undefined' != typeof setInterval &&
            (ja = setInterval(function () {
              if (ua) clearInterval(ja), (ja = null);
              else {
                var a = !1,
                  c;
                for (c in qa)
                  a || ((a = !0), I('still waiting on run dependencies:')), I('dependency: ' + c);
                a && I('(end of list)');
              }
            }, 1e4)))
        : I('warning: run dependency added without ID');
    }
    function y(d) {
      if (b.onAbort) b.onAbort(d);
      d = 'Aborted(' + d + ')';
      I(d);
      ua = !0;
      d = new WebAssembly.RuntimeError(d);
      va(d);
      throw d;
    }
    function ca(d) {
      return d.startsWith('file://');
    }
    function f(d, a) {
      return function () {
        var c = a;
        a || (c = b.asm);
        l(wa, 'native function `' + d + '` called before runtime initialization');
        c[d] || l(c[d], 'exported native function `' + d + '` not found');
        return c[d].apply(null, arguments);
      };
    }
    function aa(d) {
      try {
        if (d == J && ra) return new Uint8Array(ra);
        if (sa) return sa(d);
        throw 'both async and sync fetching of the wasm failed';
      } catch (a) {
        y(a);
      }
    }
    function ma() {
      if (!ra && (Da || la)) {
        if ('function' == typeof fetch && !ca(J))
          return fetch(J, { credentials: 'same-origin' })
            .then(function (d) {
              if (!d.ok) throw "failed to load wasm binary file at '" + J + "'";
              return d.arrayBuffer();
            })
            .catch(function () {
              return aa(J);
            });
        if (xa)
          return new Promise(function (d, a) {
            xa(
              J,
              function (c) {
                d(new Uint8Array(c));
              },
              a
            );
          });
      }
      return Promise.resolve().then(function () {
        return aa(J);
      });
    }
    function T(d, a) {
      Object.getOwnPropertyDescriptor(b, d) ||
        Object.defineProperty(b, d, {
          configurable: !0,
          get: function () {
            y(
              'Module.' +
                d +
                ' has been replaced with plain ' +
                a +
                ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
            );
          },
        });
    }
    function Ma(d) {
      return (
        'FS_createPath' === d ||
        'FS_createDataFile' === d ||
        'FS_createPreloadedFile' === d ||
        'FS_unlink' === d ||
        'addRunDependency' === d ||
        'FS_createLazyFile' === d ||
        'FS_createDevice' === d ||
        'removeRunDependency' === d
      );
    }
    function Na(d) {
      Object.getOwnPropertyDescriptor(b, d) ||
        Object.defineProperty(b, d, {
          configurable: !0,
          get: function () {
            var a =
              "'" + d + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
            Ma(d) &&
              (a +=
                '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you');
            y(a);
          },
        });
    }
    function Ea(d) {
      for (; 0 < d.length; ) d.shift()(b);
    }
    function na(d) {
      l('number' === typeof d);
      return '0x' + d.toString(16).padStart(8, '0');
    }
    function fa(d) {
      fa.shown || (fa.shown = {});
      fa.shown[d] || ((fa.shown[d] = 1), ya && (d = 'warning: ' + d), I(d));
    }
    function ab(d) {
      this.excPtr = d;
      this.ptr = d - 24;
      this.set_type = function (a) {
        G[(this.ptr + 4) >> 2] = a;
      };
      this.get_type = function () {
        return G[(this.ptr + 4) >> 2];
      };
      this.set_destructor = function (a) {
        G[(this.ptr + 8) >> 2] = a;
      };
      this.get_destructor = function () {
        return G[(this.ptr + 8) >> 2];
      };
      this.set_refcount = function (a) {
        ka[this.ptr >> 2] = a;
      };
      this.set_caught = function (a) {
        da[(this.ptr + 12) >> 0] = a ? 1 : 0;
      };
      this.get_caught = function () {
        return 0 != da[(this.ptr + 12) >> 0];
      };
      this.set_rethrown = function (a) {
        da[(this.ptr + 13) >> 0] = a ? 1 : 0;
      };
      this.get_rethrown = function () {
        return 0 != da[(this.ptr + 13) >> 0];
      };
      this.init = function (a, c) {
        this.set_adjusted_ptr(0);
        this.set_type(a);
        this.set_destructor(c);
        this.set_refcount(0);
        this.set_caught(!1);
        this.set_rethrown(!1);
      };
      this.add_ref = function () {
        ka[this.ptr >> 2] += 1;
      };
      this.release_ref = function () {
        var a = ka[this.ptr >> 2];
        ka[this.ptr >> 2] = a - 1;
        l(0 < a);
        return 1 === a;
      };
      this.set_adjusted_ptr = function (a) {
        G[(this.ptr + 16) >> 2] = a;
      };
      this.get_adjusted_ptr = function () {
        return G[(this.ptr + 16) >> 2];
      };
      this.get_exception_ptr = function () {
        if (bb(this.get_type())) return G[this.excPtr >> 2];
        var a = this.get_adjusted_ptr();
        return 0 !== a ? a : this.excPtr;
      };
    }
    function Oa() {
      function d() {
        if (!za && ((za = !0), (b.calledRun = !0), !ua)) {
          l(!wa);
          wa = !0;
          v();
          Ea(Fa);
          Pa(b);
          if (b.onRuntimeInitialized) b.onRuntimeInitialized();
          l(
            !b._main,
            'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'
          );
          v();
          if (b.postRun)
            for ('function' == typeof b.postRun && (b.postRun = [b.postRun]); b.postRun.length; )
              Qa.unshift(b.postRun.shift());
          Ea(Qa);
        }
      }
      if (!(0 < ia)) {
        Ra();
        r();
        if (b.preRun)
          for ('function' == typeof b.preRun && (b.preRun = [b.preRun]); b.preRun.length; )
            Sa.unshift(b.preRun.shift());
        Ea(Sa);
        0 < ia ||
          (b.setStatus
            ? (b.setStatus('Running...'),
              setTimeout(function () {
                setTimeout(function () {
                  b.setStatus('');
                }, 1);
                d();
              }, 1))
            : d(),
          v());
      }
    }
    function w() {}
    function D(d) {
      return (d || w).__cache__;
    }
    function V(d, a) {
      var c = D(a),
        e = c[d];
      if (e) return e;
      e = Object.create((a || w).prototype);
      e.ptr = d;
      return (c[d] = e);
    }
    function ha(d) {
      if ('string' === typeof d) {
        for (var a = 0, c = 0; c < d.length; ++c) {
          var e = d.charCodeAt(c);
          127 >= e
            ? a++
            : 2047 >= e
            ? (a += 2)
            : 55296 <= e && 57343 >= e
            ? ((a += 4), ++c)
            : (a += 3);
        }
        a = Array(a + 1);
        c = 0;
        e = a.length;
        if (0 < e) {
          e = c + e - 1;
          for (var n = 0; n < d.length; ++n) {
            var t = d.charCodeAt(n);
            if (55296 <= t && 57343 >= t) {
              var C = d.charCodeAt(++n);
              t = (65536 + ((t & 1023) << 10)) | (C & 1023);
            }
            if (127 >= t) {
              if (c >= e) break;
              a[c++] = t;
            } else {
              if (2047 >= t) {
                if (c + 1 >= e) break;
                a[c++] = 192 | (t >> 6);
              } else {
                if (65535 >= t) {
                  if (c + 2 >= e) break;
                  a[c++] = 224 | (t >> 12);
                } else {
                  if (c + 3 >= e) break;
                  1114111 < t &&
                    fa(
                      'Invalid Unicode code point ' +
                        na(t) +
                        ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).'
                    );
                  a[c++] = 240 | (t >> 18);
                  a[c++] = 128 | ((t >> 12) & 63);
                }
                a[c++] = 128 | ((t >> 6) & 63);
              }
              a[c++] = 128 | (t & 63);
            }
          }
          a[c] = 0;
        }
        d = u.alloc(a, da);
        u.copy(a, da, d);
        return d;
      }
      return d;
    }
    function Ga(d) {
      if ('object' === typeof d) {
        var a = u.alloc(d, da);
        u.copy(d, da, a);
        return a;
      }
      return d;
    }
    function ea() {
      throw 'cannot construct a VoidPtr, no constructor in IDL';
    }
    function W() {
      this.ptr = cb();
      D(W)[this.ptr] = this;
    }
    function U() {
      this.ptr = db();
      D(U)[this.ptr] = this;
    }
    function ba() {
      this.ptr = eb();
      D(ba)[this.ptr] = this;
    }
    function x() {
      this.ptr = fb();
      D(x)[this.ptr] = this;
    }
    function F() {
      this.ptr = gb();
      D(F)[this.ptr] = this;
    }
    function K() {
      this.ptr = hb();
      D(K)[this.ptr] = this;
    }
    function L() {
      this.ptr = ib();
      D(L)[this.ptr] = this;
    }
    function H() {
      this.ptr = jb();
      D(H)[this.ptr] = this;
    }
    function X() {
      this.ptr = kb();
      D(X)[this.ptr] = this;
    }
    function E() {
      throw 'cannot construct a Status, no constructor in IDL';
    }
    function M() {
      this.ptr = lb();
      D(M)[this.ptr] = this;
    }
    function N() {
      this.ptr = mb();
      D(N)[this.ptr] = this;
    }
    function O() {
      this.ptr = nb();
      D(O)[this.ptr] = this;
    }
    function P() {
      this.ptr = ob();
      D(P)[this.ptr] = this;
    }
    function Q() {
      this.ptr = pb();
      D(Q)[this.ptr] = this;
    }
    function R() {
      this.ptr = qb();
      D(R)[this.ptr] = this;
    }
    function S() {
      this.ptr = rb();
      D(S)[this.ptr] = this;
    }
    function z() {
      this.ptr = sb();
      D(z)[this.ptr] = this;
    }
    function q() {
      this.ptr = tb();
      D(q)[this.ptr] = this;
    }
    g = void 0 === g ? {} : g;
    var b = 'undefined' != typeof g ? g : {},
      Pa,
      va;
    b.ready = new Promise(function (d, a) {
      Pa = d;
      va = a;
    });
    '_free _malloc _emscripten_bind_VoidPtr___destroy___0 _emscripten_bind_DecoderBuffer_DecoderBuffer_0 _emscripten_bind_DecoderBuffer_Init_2 _emscripten_bind_DecoderBuffer___destroy___0 _emscripten_bind_AttributeTransformData_AttributeTransformData_0 _emscripten_bind_AttributeTransformData_transform_type_0 _emscripten_bind_AttributeTransformData___destroy___0 _emscripten_bind_GeometryAttribute_GeometryAttribute_0 _emscripten_bind_GeometryAttribute___destroy___0 _emscripten_bind_PointAttribute_PointAttribute_0 _emscripten_bind_PointAttribute_size_0 _emscripten_bind_PointAttribute_GetAttributeTransformData_0 _emscripten_bind_PointAttribute_attribute_type_0 _emscripten_bind_PointAttribute_data_type_0 _emscripten_bind_PointAttribute_num_components_0 _emscripten_bind_PointAttribute_normalized_0 _emscripten_bind_PointAttribute_byte_stride_0 _emscripten_bind_PointAttribute_byte_offset_0 _emscripten_bind_PointAttribute_unique_id_0 _emscripten_bind_PointAttribute___destroy___0 _emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 _emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 _emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 _emscripten_bind_AttributeQuantizationTransform_min_value_1 _emscripten_bind_AttributeQuantizationTransform_range_0 _emscripten_bind_AttributeQuantizationTransform___destroy___0 _emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 _emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 _emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 _emscripten_bind_AttributeOctahedronTransform___destroy___0 _emscripten_bind_PointCloud_PointCloud_0 _emscripten_bind_PointCloud_num_attributes_0 _emscripten_bind_PointCloud_num_points_0 _emscripten_bind_PointCloud___destroy___0 _emscripten_bind_Mesh_Mesh_0 _emscripten_bind_Mesh_num_faces_0 _emscripten_bind_Mesh_num_attributes_0 _emscripten_bind_Mesh_num_points_0 _emscripten_bind_Mesh___destroy___0 _emscripten_bind_Metadata_Metadata_0 _emscripten_bind_Metadata___destroy___0 _emscripten_bind_Status_code_0 _emscripten_bind_Status_ok_0 _emscripten_bind_Status_error_msg_0 _emscripten_bind_Status___destroy___0 _emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 _emscripten_bind_DracoFloat32Array_GetValue_1 _emscripten_bind_DracoFloat32Array_size_0 _emscripten_bind_DracoFloat32Array___destroy___0 _emscripten_bind_DracoInt8Array_DracoInt8Array_0 _emscripten_bind_DracoInt8Array_GetValue_1 _emscripten_bind_DracoInt8Array_size_0 _emscripten_bind_DracoInt8Array___destroy___0 _emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 _emscripten_bind_DracoUInt8Array_GetValue_1 _emscripten_bind_DracoUInt8Array_size_0 _emscripten_bind_DracoUInt8Array___destroy___0 _emscripten_bind_DracoInt16Array_DracoInt16Array_0 _emscripten_bind_DracoInt16Array_GetValue_1 _emscripten_bind_DracoInt16Array_size_0 _emscripten_bind_DracoInt16Array___destroy___0 _emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 _emscripten_bind_DracoUInt16Array_GetValue_1 _emscripten_bind_DracoUInt16Array_size_0 _emscripten_bind_DracoUInt16Array___destroy___0 _emscripten_bind_DracoInt32Array_DracoInt32Array_0 _emscripten_bind_DracoInt32Array_GetValue_1 _emscripten_bind_DracoInt32Array_size_0 _emscripten_bind_DracoInt32Array___destroy___0 _emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 _emscripten_bind_DracoUInt32Array_GetValue_1 _emscripten_bind_DracoUInt32Array_size_0 _emscripten_bind_DracoUInt32Array___destroy___0 _emscripten_bind_MetadataQuerier_MetadataQuerier_0 _emscripten_bind_MetadataQuerier_HasEntry_2 _emscripten_bind_MetadataQuerier_GetIntEntry_2 _emscripten_bind_MetadataQuerier_GetIntEntryArray_3 _emscripten_bind_MetadataQuerier_GetDoubleEntry_2 _emscripten_bind_MetadataQuerier_GetStringEntry_2 _emscripten_bind_MetadataQuerier_NumEntries_1 _emscripten_bind_MetadataQuerier_GetEntryName_2 _emscripten_bind_MetadataQuerier___destroy___0 _emscripten_bind_Decoder_Decoder_0 _emscripten_bind_Decoder_DecodeArrayToPointCloud_3 _emscripten_bind_Decoder_DecodeArrayToMesh_3 _emscripten_bind_Decoder_GetAttributeId_2 _emscripten_bind_Decoder_GetAttributeIdByName_2 _emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 _emscripten_bind_Decoder_GetAttribute_2 _emscripten_bind_Decoder_GetAttributeByUniqueId_2 _emscripten_bind_Decoder_GetMetadata_1 _emscripten_bind_Decoder_GetAttributeMetadata_2 _emscripten_bind_Decoder_GetFaceFromMesh_3 _emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 _emscripten_bind_Decoder_GetTrianglesUInt16Array_3 _emscripten_bind_Decoder_GetTrianglesUInt32Array_3 _emscripten_bind_Decoder_GetAttributeFloat_3 _emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 _emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 _emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 _emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 _emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 _emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 _emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 _emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 _emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 _emscripten_bind_Decoder_SkipAttributeTransform_1 _emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 _emscripten_bind_Decoder_DecodeBufferToPointCloud_2 _emscripten_bind_Decoder_DecodeBufferToMesh_2 _emscripten_bind_Decoder___destroy___0 _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM _emscripten_enum_draco_GeometryAttribute_Type_INVALID _emscripten_enum_draco_GeometryAttribute_Type_POSITION _emscripten_enum_draco_GeometryAttribute_Type_NORMAL _emscripten_enum_draco_GeometryAttribute_Type_COLOR _emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD _emscripten_enum_draco_GeometryAttribute_Type_GENERIC _emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE _emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD _emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH _emscripten_enum_draco_DataType_DT_INVALID _emscripten_enum_draco_DataType_DT_INT8 _emscripten_enum_draco_DataType_DT_UINT8 _emscripten_enum_draco_DataType_DT_INT16 _emscripten_enum_draco_DataType_DT_UINT16 _emscripten_enum_draco_DataType_DT_INT32 _emscripten_enum_draco_DataType_DT_UINT32 _emscripten_enum_draco_DataType_DT_INT64 _emscripten_enum_draco_DataType_DT_UINT64 _emscripten_enum_draco_DataType_DT_FLOAT32 _emscripten_enum_draco_DataType_DT_FLOAT64 _emscripten_enum_draco_DataType_DT_BOOL _emscripten_enum_draco_DataType_DT_TYPES_COUNT _emscripten_enum_draco_StatusCode_OK _emscripten_enum_draco_StatusCode_DRACO_ERROR _emscripten_enum_draco_StatusCode_IO_ERROR _emscripten_enum_draco_StatusCode_INVALID_PARAMETER _emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION _emscripten_enum_draco_StatusCode_UNKNOWN_VERSION _fflush onRuntimeInitialized'
      .split(' ')
      .forEach(function (d) {
        Object.getOwnPropertyDescriptor(b.ready, d) ||
          Object.defineProperty(b.ready, d, {
            get: function () {
              return y(
                'You are getting ' +
                  d +
                  ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
              );
            },
            set: function () {
              return y(
                'You are setting ' +
                  d +
                  ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
              );
            },
          });
      });
    var Ta = !1,
      Ua = !1;
    b.onRuntimeInitialized = function () {
      Ta = !0;
      if (Ua && 'function' === typeof b.onModuleLoaded) b.onModuleLoaded(b);
    };
    b.onModuleParsed = function () {
      Ua = !0;
      if (Ta && 'function' === typeof b.onModuleLoaded) b.onModuleLoaded(b);
    };
    b.isVersionSupported = function (d) {
      if ('string' !== typeof d) return !1;
      d = d.split('.');
      return 2 > d.length || 3 < d.length
        ? !1
        : 1 == d[0] && 0 <= d[1] && 5 >= d[1]
        ? !0
        : 0 != d[0] || 10 < d[1]
        ? !1
        : !0;
    };
    var Va = Object.assign({}, b),
      Da = 'object' == typeof window,
      la = 'function' == typeof importScripts,
      ya =
        'object' == typeof process &&
        'object' == typeof process.versions &&
        'string' == typeof process.versions.node,
      Wa = !Da && !ya && !la;
    if (b.ENVIRONMENT)
      throw Error(
        'Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)'
      );
    var Z = '';
    if (ya) {
      if ('undefined' == typeof process || !process.release || 'node' !== process.release.name)
        throw Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        );
      var Xa = require('fs'),
        Ha = require('path');
      Z = la ? Ha.dirname(Z) + '/' : __dirname + '/';
      var Ia = function (d, a) {
        d = ca(d) ? new URL(d) : Ha.normalize(d);
        return Xa.readFileSync(d, a ? void 0 : 'utf8');
      };
      var sa = function (d) {
        d = Ia(d, !0);
        d.buffer || (d = new Uint8Array(d));
        l(d.buffer);
        return d;
      };
      var xa = function (d, a, c) {
        d = ca(d) ? new URL(d) : Ha.normalize(d);
        Xa.readFile(d, function (e, n) {
          e ? c(e) : a(n.buffer);
        });
      };
      1 < process.argv.length && process.argv[1].replace(/\\/g, '/');
      process.argv.slice(2);
      b.inspect = function () {
        return '[Emscripten Module object]';
      };
    } else if (Wa) {
      if (
        ('object' == typeof process && 'function' === typeof require) ||
        'object' == typeof window ||
        'function' == typeof importScripts
      )
        throw Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        );
      'undefined' != typeof read &&
        (Ia = function (d) {
          return read(d);
        });
      sa = function (d) {
        if ('function' == typeof readbuffer) return new Uint8Array(readbuffer(d));
        d = read(d, 'binary');
        l('object' == typeof d);
        return d;
      };
      xa = function (d, a, c) {
        setTimeout(function () {
          return a(sa(d));
        }, 0);
      };
      'undefined' == typeof clearTimeout && (globalThis.clearTimeout = function (d) {});
      'undefined' != typeof print &&
        ('undefined' == typeof console && (console = {}),
        (console.log = print),
        (console.warn = console.error = 'undefined' != typeof printErr ? printErr : print));
    } else if (Da || la) {
      la
        ? (Z = self.location.href)
        : 'undefined' != typeof document &&
          document.currentScript &&
          (Z = document.currentScript.src);
      h && (Z = h);
      Z = 0 !== Z.indexOf('blob:') ? Z.substr(0, Z.replace(/[?#].*/, '').lastIndexOf('/') + 1) : '';
      if ('object' != typeof window && 'function' != typeof importScripts)
        throw Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        );
      Ia = function (d) {
        var a = new XMLHttpRequest();
        a.open('GET', d, !1);
        a.send(null);
        return a.responseText;
      };
      la &&
        (sa = function (d) {
          var a = new XMLHttpRequest();
          a.open('GET', d, !1);
          a.responseType = 'arraybuffer';
          a.send(null);
          return new Uint8Array(a.response);
        });
      xa = function (d, a, c) {
        var e = new XMLHttpRequest();
        e.open('GET', d, !0);
        e.responseType = 'arraybuffer';
        e.onload = function () {
          200 == e.status || (0 == e.status && e.response) ? a(e.response) : c();
        };
        e.onerror = c;
        e.send(null);
      };
    } else throw Error('environment detection error');
    var ub = b.print || console.log.bind(console),
      I = b.printErr || console.warn.bind(console);
    Object.assign(b, Va);
    Va = null;
    (function (d) {
      Object.getOwnPropertyDescriptor(b, d) &&
        y('`Module.' + d + '` was supplied but `' + d + '` not included in INCOMING_MODULE_JS_API');
    })('fetchSettings');
    T('arguments', 'arguments_');
    T('thisProgram', 'thisProgram');
    T('quit', 'quit_');
    l(
      'undefined' == typeof b.memoryInitializerPrefixURL,
      'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead'
    );
    l(
      'undefined' == typeof b.pthreadMainPrefixURL,
      'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead'
    );
    l(
      'undefined' == typeof b.cdInitializerPrefixURL,
      'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead'
    );
    l(
      'undefined' == typeof b.filePackagePrefixURL,
      'Module.filePackagePrefixURL option was removed, use Module.locateFile instead'
    );
    l('undefined' == typeof b.read, 'Module.read option was removed (modify read_ in JS)');
    l(
      'undefined' == typeof b.readAsync,
      'Module.readAsync option was removed (modify readAsync in JS)'
    );
    l(
      'undefined' == typeof b.readBinary,
      'Module.readBinary option was removed (modify readBinary in JS)'
    );
    l(
      'undefined' == typeof b.setWindowTitle,
      'Module.setWindowTitle option was removed (modify setWindowTitle in JS)'
    );
    l(
      'undefined' == typeof b.TOTAL_MEMORY,
      'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY'
    );
    T('read', 'read_');
    T('readAsync', 'readAsync');
    T('readBinary', 'readBinary');
    T('setWindowTitle', 'setWindowTitle');
    l(
      !Wa,
      "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable."
    );
    var ra;
    b.wasmBinary && (ra = b.wasmBinary);
    T('wasmBinary', 'wasmBinary');
    T('noExitRuntime', 'noExitRuntime');
    'object' != typeof WebAssembly && y('no native wasm support detected');
    var pa,
      ua = !1,
      La = 'undefined' != typeof TextDecoder ? new TextDecoder('utf8') : void 0,
      da,
      oa,
      ka,
      G;
    l(!b.STACK_SIZE, 'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time');
    l(
      'undefined' != typeof Int32Array &&
        'undefined' !== typeof Float64Array &&
        void 0 != Int32Array.prototype.subarray &&
        void 0 != Int32Array.prototype.set,
      'JS engine does not provide full typed array support'
    );
    l(
      !b.wasmMemory,
      'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally'
    );
    l(
      !b.INITIAL_MEMORY,
      'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically'
    );
    var Ya;
    (function () {
      var d = new Int16Array(1),
        a = new Int8Array(d.buffer);
      d[0] = 25459;
      if (115 !== a[0] || 99 !== a[1])
        throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
    })();
    var Sa = [],
      Fa = [],
      Qa = [],
      wa = !1;
    l(
      Math.imul,
      'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    l(
      Math.fround,
      'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    l(
      Math.clz32,
      'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    l(
      Math.trunc,
      'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    var ia = 0,
      ja = null,
      ta = null,
      qa = {},
      Y = {
        error: function () {
          y(
            'Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM'
          );
        },
        init: function () {
          Y.error();
        },
        createDataFile: function () {
          Y.error();
        },
        createPreloadedFile: function () {
          Y.error();
        },
        createLazyFile: function () {
          Y.error();
        },
        open: function () {
          Y.error();
        },
        mkdev: function () {
          Y.error();
        },
        registerDevice: function () {
          Y.error();
        },
        analyzePath: function () {
          Y.error();
        },
        loadFilesFromDB: function () {
          Y.error();
        },
        ErrnoError: function () {
          Y.error();
        },
      };
    b.FS_createDataFile = Y.createDataFile;
    b.FS_createPreloadedFile = Y.createPreloadedFile;
    var J = 'draco_decoder.wasm';
    J.startsWith('data:application/octet-stream;base64,') || (J = k(J));
    (function (d, a) {
      'undefined' !== typeof globalThis &&
        Object.defineProperty(globalThis, d, {
          configurable: !0,
          get: function () {
            fa('`' + d + '` is not longer defined by emscripten. ' + a);
          },
        });
    })('buffer', 'Please use HEAP8.buffer or wasmMemory.buffer');
    var vb = 0,
      wb = [null, [], []],
      $a = {
        __cxa_throw: function (d, a, c) {
          new ab(d).init(a, c);
          vb++;
          throw (
            d +
            ' - Exception catching is disabled, this exception cannot be caught. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.'
          );
        },
        abort: function () {
          y('native code called abort()');
        },
        emscripten_memcpy_big: function (d, a, c) {
          oa.copyWithin(d, a, a + c);
        },
        emscripten_resize_heap: function (d) {
          var a = oa.length;
          d >>>= 0;
          l(d > a);
          if (2147483648 < d)
            return (
              I(
                'Cannot enlarge memory, asked to go up to ' +
                  d +
                  ' bytes, but the limit is 2147483648 bytes!'
              ),
              !1
            );
          for (var c = 1; 4 >= c; c *= 2) {
            var e = a * (1 + 0.2 / c);
            e = Math.min(e, d + 100663296);
            var n = Math;
            e = Math.max(d, e);
            n = n.min.call(n, 2147483648, e + ((65536 - (e % 65536)) % 65536));
            a: {
              e = n;
              var t = pa.buffer;
              try {
                pa.grow((e - t.byteLength + 65535) >>> 16);
                m();
                var C = 1;
                break a;
              } catch (Aa) {
                I(
                  'emscripten_realloc_buffer: Attempted to grow heap from ' +
                    t.byteLength +
                    ' bytes to ' +
                    e +
                    ' bytes, but got error: ' +
                    Aa
                );
              }
              C = void 0;
            }
            if (C) return !0;
          }
          I('Failed to grow the heap from ' + a + ' bytes to ' + n + ' bytes, not enough memory!');
          return !1;
        },
        fd_close: function (d) {
          y('fd_close called without SYSCALLS_REQUIRE_FILESYSTEM');
        },
        fd_seek: function (d, a, c, e, n) {
          return 70;
        },
        fd_write: function (d, a, c, e) {
          for (var n = 0, t = 0; t < c; t++) {
            var C = G[a >> 2],
              Aa = G[(a + 4) >> 2];
            a += 8;
            for (var Ja = 0; Ja < Aa; Ja++) {
              var Za = d,
                Ka = oa[C + Ja],
                Ba = wb[Za];
              l(Ba);
              0 === Ka || 10 === Ka
                ? ((1 === Za ? ub : I)(p(Ba, 0)), (Ba.length = 0))
                : Ba.push(Ka);
            }
            n += Aa;
          }
          G[e >> 2] = n;
          return 0;
        },
      };
    (function () {
      function d(t, C) {
        b.asm = t.exports;
        pa = b.asm.memory;
        l(pa, 'memory not found in wasm exports');
        m();
        Ya = b.asm.__indirect_function_table;
        l(Ya, 'table not found in wasm exports');
        Fa.unshift(b.asm.__wasm_call_ctors);
        ia--;
        b.monitorRunDependencies && b.monitorRunDependencies(ia);
        l(qa['wasm-instantiate']);
        delete qa['wasm-instantiate'];
        0 == ia &&
          (null !== ja && (clearInterval(ja), (ja = null)), ta && ((t = ta), (ta = null), t()));
      }
      function a(t) {
        l(
          b === n,
          'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?'
        );
        n = null;
        d(t.instance);
      }
      function c(t) {
        return ma()
          .then(function (C) {
            return WebAssembly.instantiate(C, e);
          })
          .then(function (C) {
            return C;
          })
          .then(t, function (C) {
            I('failed to asynchronously prepare wasm: ' + C);
            ca(J) &&
              I(
                'warning: Loading from a file URI (' +
                  J +
                  ') is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing'
              );
            y(C);
          });
      }
      var e = { env: $a, wasi_snapshot_preview1: $a };
      B('wasm-instantiate');
      var n = b;
      if (b.instantiateWasm)
        try {
          return b.instantiateWasm(e, d);
        } catch (t) {
          I('Module.instantiateWasm callback failed with error: ' + t), va(t);
        }
      (function () {
        return ra ||
          'function' != typeof WebAssembly.instantiateStreaming ||
          J.startsWith('data:application/octet-stream;base64,') ||
          ca(J) ||
          ya ||
          'function' != typeof fetch
          ? c(a)
          : fetch(J, { credentials: 'same-origin' }).then(function (t) {
              return WebAssembly.instantiateStreaming(t, e).then(a, function (C) {
                I('wasm streaming compile failed: ' + C);
                I('falling back to ArrayBuffer instantiation');
                return c(a);
              });
            });
      })().catch(va);
      return {};
    })();
    f('__wasm_call_ctors');
    var xb = (b._emscripten_bind_VoidPtr___destroy___0 = f(
        'emscripten_bind_VoidPtr___destroy___0'
      )),
      cb = (b._emscripten_bind_DecoderBuffer_DecoderBuffer_0 = f(
        'emscripten_bind_DecoderBuffer_DecoderBuffer_0'
      )),
      yb = (b._emscripten_bind_DecoderBuffer_Init_2 = f('emscripten_bind_DecoderBuffer_Init_2')),
      zb = (b._emscripten_bind_DecoderBuffer___destroy___0 = f(
        'emscripten_bind_DecoderBuffer___destroy___0'
      )),
      db = (b._emscripten_bind_AttributeTransformData_AttributeTransformData_0 = f(
        'emscripten_bind_AttributeTransformData_AttributeTransformData_0'
      )),
      Ab = (b._emscripten_bind_AttributeTransformData_transform_type_0 = f(
        'emscripten_bind_AttributeTransformData_transform_type_0'
      )),
      Bb = (b._emscripten_bind_AttributeTransformData___destroy___0 = f(
        'emscripten_bind_AttributeTransformData___destroy___0'
      )),
      eb = (b._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = f(
        'emscripten_bind_GeometryAttribute_GeometryAttribute_0'
      )),
      Cb = (b._emscripten_bind_GeometryAttribute___destroy___0 = f(
        'emscripten_bind_GeometryAttribute___destroy___0'
      )),
      fb = (b._emscripten_bind_PointAttribute_PointAttribute_0 = f(
        'emscripten_bind_PointAttribute_PointAttribute_0'
      )),
      Db = (b._emscripten_bind_PointAttribute_size_0 = f('emscripten_bind_PointAttribute_size_0')),
      Eb = (b._emscripten_bind_PointAttribute_GetAttributeTransformData_0 = f(
        'emscripten_bind_PointAttribute_GetAttributeTransformData_0'
      )),
      Fb = (b._emscripten_bind_PointAttribute_attribute_type_0 = f(
        'emscripten_bind_PointAttribute_attribute_type_0'
      )),
      Gb = (b._emscripten_bind_PointAttribute_data_type_0 = f(
        'emscripten_bind_PointAttribute_data_type_0'
      )),
      Hb = (b._emscripten_bind_PointAttribute_num_components_0 = f(
        'emscripten_bind_PointAttribute_num_components_0'
      )),
      Ib = (b._emscripten_bind_PointAttribute_normalized_0 = f(
        'emscripten_bind_PointAttribute_normalized_0'
      )),
      Jb = (b._emscripten_bind_PointAttribute_byte_stride_0 = f(
        'emscripten_bind_PointAttribute_byte_stride_0'
      )),
      Kb = (b._emscripten_bind_PointAttribute_byte_offset_0 = f(
        'emscripten_bind_PointAttribute_byte_offset_0'
      )),
      Lb = (b._emscripten_bind_PointAttribute_unique_id_0 = f(
        'emscripten_bind_PointAttribute_unique_id_0'
      )),
      Mb = (b._emscripten_bind_PointAttribute___destroy___0 = f(
        'emscripten_bind_PointAttribute___destroy___0'
      )),
      gb = (b._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 = f(
        'emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0'
      )),
      Nb = (b._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 = f(
        'emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1'
      )),
      Ob = (b._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 = f(
        'emscripten_bind_AttributeQuantizationTransform_quantization_bits_0'
      )),
      Pb = (b._emscripten_bind_AttributeQuantizationTransform_min_value_1 = f(
        'emscripten_bind_AttributeQuantizationTransform_min_value_1'
      )),
      Qb = (b._emscripten_bind_AttributeQuantizationTransform_range_0 = f(
        'emscripten_bind_AttributeQuantizationTransform_range_0'
      )),
      Rb = (b._emscripten_bind_AttributeQuantizationTransform___destroy___0 = f(
        'emscripten_bind_AttributeQuantizationTransform___destroy___0'
      )),
      hb = (b._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 = f(
        'emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0'
      )),
      Sb = (b._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 = f(
        'emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1'
      )),
      Tb = (b._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 = f(
        'emscripten_bind_AttributeOctahedronTransform_quantization_bits_0'
      )),
      Ub = (b._emscripten_bind_AttributeOctahedronTransform___destroy___0 = f(
        'emscripten_bind_AttributeOctahedronTransform___destroy___0'
      )),
      ib = (b._emscripten_bind_PointCloud_PointCloud_0 = f(
        'emscripten_bind_PointCloud_PointCloud_0'
      )),
      Vb = (b._emscripten_bind_PointCloud_num_attributes_0 = f(
        'emscripten_bind_PointCloud_num_attributes_0'
      )),
      Wb = (b._emscripten_bind_PointCloud_num_points_0 = f(
        'emscripten_bind_PointCloud_num_points_0'
      )),
      Xb = (b._emscripten_bind_PointCloud___destroy___0 = f(
        'emscripten_bind_PointCloud___destroy___0'
      )),
      jb = (b._emscripten_bind_Mesh_Mesh_0 = f('emscripten_bind_Mesh_Mesh_0')),
      Yb = (b._emscripten_bind_Mesh_num_faces_0 = f('emscripten_bind_Mesh_num_faces_0')),
      Zb = (b._emscripten_bind_Mesh_num_attributes_0 = f('emscripten_bind_Mesh_num_attributes_0')),
      $b = (b._emscripten_bind_Mesh_num_points_0 = f('emscripten_bind_Mesh_num_points_0')),
      ac = (b._emscripten_bind_Mesh___destroy___0 = f('emscripten_bind_Mesh___destroy___0')),
      kb = (b._emscripten_bind_Metadata_Metadata_0 = f('emscripten_bind_Metadata_Metadata_0')),
      bc = (b._emscripten_bind_Metadata___destroy___0 = f(
        'emscripten_bind_Metadata___destroy___0'
      )),
      cc = (b._emscripten_bind_Status_code_0 = f('emscripten_bind_Status_code_0')),
      dc = (b._emscripten_bind_Status_ok_0 = f('emscripten_bind_Status_ok_0')),
      ec = (b._emscripten_bind_Status_error_msg_0 = f('emscripten_bind_Status_error_msg_0')),
      fc = (b._emscripten_bind_Status___destroy___0 = f('emscripten_bind_Status___destroy___0')),
      lb = (b._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 = f(
        'emscripten_bind_DracoFloat32Array_DracoFloat32Array_0'
      )),
      gc = (b._emscripten_bind_DracoFloat32Array_GetValue_1 = f(
        'emscripten_bind_DracoFloat32Array_GetValue_1'
      )),
      hc = (b._emscripten_bind_DracoFloat32Array_size_0 = f(
        'emscripten_bind_DracoFloat32Array_size_0'
      )),
      ic = (b._emscripten_bind_DracoFloat32Array___destroy___0 = f(
        'emscripten_bind_DracoFloat32Array___destroy___0'
      )),
      mb = (b._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = f(
        'emscripten_bind_DracoInt8Array_DracoInt8Array_0'
      )),
      jc = (b._emscripten_bind_DracoInt8Array_GetValue_1 = f(
        'emscripten_bind_DracoInt8Array_GetValue_1'
      )),
      kc = (b._emscripten_bind_DracoInt8Array_size_0 = f('emscripten_bind_DracoInt8Array_size_0')),
      lc = (b._emscripten_bind_DracoInt8Array___destroy___0 = f(
        'emscripten_bind_DracoInt8Array___destroy___0'
      )),
      nb = (b._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 = f(
        'emscripten_bind_DracoUInt8Array_DracoUInt8Array_0'
      )),
      mc = (b._emscripten_bind_DracoUInt8Array_GetValue_1 = f(
        'emscripten_bind_DracoUInt8Array_GetValue_1'
      )),
      nc = (b._emscripten_bind_DracoUInt8Array_size_0 = f(
        'emscripten_bind_DracoUInt8Array_size_0'
      )),
      oc = (b._emscripten_bind_DracoUInt8Array___destroy___0 = f(
        'emscripten_bind_DracoUInt8Array___destroy___0'
      )),
      ob = (b._emscripten_bind_DracoInt16Array_DracoInt16Array_0 = f(
        'emscripten_bind_DracoInt16Array_DracoInt16Array_0'
      )),
      pc = (b._emscripten_bind_DracoInt16Array_GetValue_1 = f(
        'emscripten_bind_DracoInt16Array_GetValue_1'
      )),
      qc = (b._emscripten_bind_DracoInt16Array_size_0 = f(
        'emscripten_bind_DracoInt16Array_size_0'
      )),
      rc = (b._emscripten_bind_DracoInt16Array___destroy___0 = f(
        'emscripten_bind_DracoInt16Array___destroy___0'
      )),
      pb = (b._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 = f(
        'emscripten_bind_DracoUInt16Array_DracoUInt16Array_0'
      )),
      sc = (b._emscripten_bind_DracoUInt16Array_GetValue_1 = f(
        'emscripten_bind_DracoUInt16Array_GetValue_1'
      )),
      tc = (b._emscripten_bind_DracoUInt16Array_size_0 = f(
        'emscripten_bind_DracoUInt16Array_size_0'
      )),
      uc = (b._emscripten_bind_DracoUInt16Array___destroy___0 = f(
        'emscripten_bind_DracoUInt16Array___destroy___0'
      )),
      qb = (b._emscripten_bind_DracoInt32Array_DracoInt32Array_0 = f(
        'emscripten_bind_DracoInt32Array_DracoInt32Array_0'
      )),
      vc = (b._emscripten_bind_DracoInt32Array_GetValue_1 = f(
        'emscripten_bind_DracoInt32Array_GetValue_1'
      )),
      wc = (b._emscripten_bind_DracoInt32Array_size_0 = f(
        'emscripten_bind_DracoInt32Array_size_0'
      )),
      xc = (b._emscripten_bind_DracoInt32Array___destroy___0 = f(
        'emscripten_bind_DracoInt32Array___destroy___0'
      )),
      rb = (b._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 = f(
        'emscripten_bind_DracoUInt32Array_DracoUInt32Array_0'
      )),
      yc = (b._emscripten_bind_DracoUInt32Array_GetValue_1 = f(
        'emscripten_bind_DracoUInt32Array_GetValue_1'
      )),
      zc = (b._emscripten_bind_DracoUInt32Array_size_0 = f(
        'emscripten_bind_DracoUInt32Array_size_0'
      )),
      Ac = (b._emscripten_bind_DracoUInt32Array___destroy___0 = f(
        'emscripten_bind_DracoUInt32Array___destroy___0'
      )),
      sb = (b._emscripten_bind_MetadataQuerier_MetadataQuerier_0 = f(
        'emscripten_bind_MetadataQuerier_MetadataQuerier_0'
      )),
      Bc = (b._emscripten_bind_MetadataQuerier_HasEntry_2 = f(
        'emscripten_bind_MetadataQuerier_HasEntry_2'
      )),
      Cc = (b._emscripten_bind_MetadataQuerier_GetIntEntry_2 = f(
        'emscripten_bind_MetadataQuerier_GetIntEntry_2'
      )),
      Dc = (b._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 = f(
        'emscripten_bind_MetadataQuerier_GetIntEntryArray_3'
      )),
      Ec = (b._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 = f(
        'emscripten_bind_MetadataQuerier_GetDoubleEntry_2'
      )),
      Fc = (b._emscripten_bind_MetadataQuerier_GetStringEntry_2 = f(
        'emscripten_bind_MetadataQuerier_GetStringEntry_2'
      )),
      Gc = (b._emscripten_bind_MetadataQuerier_NumEntries_1 = f(
        'emscripten_bind_MetadataQuerier_NumEntries_1'
      )),
      Hc = (b._emscripten_bind_MetadataQuerier_GetEntryName_2 = f(
        'emscripten_bind_MetadataQuerier_GetEntryName_2'
      )),
      Ic = (b._emscripten_bind_MetadataQuerier___destroy___0 = f(
        'emscripten_bind_MetadataQuerier___destroy___0'
      )),
      tb = (b._emscripten_bind_Decoder_Decoder_0 = f('emscripten_bind_Decoder_Decoder_0')),
      Jc = (b._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 = f(
        'emscripten_bind_Decoder_DecodeArrayToPointCloud_3'
      )),
      Kc = (b._emscripten_bind_Decoder_DecodeArrayToMesh_3 = f(
        'emscripten_bind_Decoder_DecodeArrayToMesh_3'
      )),
      Lc = (b._emscripten_bind_Decoder_GetAttributeId_2 = f(
        'emscripten_bind_Decoder_GetAttributeId_2'
      )),
      Mc = (b._emscripten_bind_Decoder_GetAttributeIdByName_2 = f(
        'emscripten_bind_Decoder_GetAttributeIdByName_2'
      )),
      Nc = (b._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 = f(
        'emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3'
      )),
      Oc = (b._emscripten_bind_Decoder_GetAttribute_2 = f(
        'emscripten_bind_Decoder_GetAttribute_2'
      )),
      Pc = (b._emscripten_bind_Decoder_GetAttributeByUniqueId_2 = f(
        'emscripten_bind_Decoder_GetAttributeByUniqueId_2'
      )),
      Qc = (b._emscripten_bind_Decoder_GetMetadata_1 = f('emscripten_bind_Decoder_GetMetadata_1')),
      Rc = (b._emscripten_bind_Decoder_GetAttributeMetadata_2 = f(
        'emscripten_bind_Decoder_GetAttributeMetadata_2'
      )),
      Sc = (b._emscripten_bind_Decoder_GetFaceFromMesh_3 = f(
        'emscripten_bind_Decoder_GetFaceFromMesh_3'
      )),
      Tc = (b._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 = f(
        'emscripten_bind_Decoder_GetTriangleStripsFromMesh_2'
      )),
      Uc = (b._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 = f(
        'emscripten_bind_Decoder_GetTrianglesUInt16Array_3'
      )),
      Vc = (b._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 = f(
        'emscripten_bind_Decoder_GetTrianglesUInt32Array_3'
      )),
      Wc = (b._emscripten_bind_Decoder_GetAttributeFloat_3 = f(
        'emscripten_bind_Decoder_GetAttributeFloat_3'
      )),
      Xc = (b._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 = f(
        'emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3'
      )),
      Yc = (b._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 = f(
        'emscripten_bind_Decoder_GetAttributeIntForAllPoints_3'
      )),
      Zc = (b._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 = f(
        'emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3'
      )),
      $c = (b._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 = f(
        'emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3'
      )),
      ad = (b._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 = f(
        'emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3'
      )),
      bd = (b._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 = f(
        'emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3'
      )),
      cd = (b._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 = f(
        'emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3'
      )),
      dd = (b._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 = f(
        'emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3'
      )),
      ed = (b._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 = f(
        'emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5'
      )),
      fd = (b._emscripten_bind_Decoder_SkipAttributeTransform_1 = f(
        'emscripten_bind_Decoder_SkipAttributeTransform_1'
      )),
      gd = (b._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 = f(
        'emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1'
      )),
      hd = (b._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 = f(
        'emscripten_bind_Decoder_DecodeBufferToPointCloud_2'
      )),
      id = (b._emscripten_bind_Decoder_DecodeBufferToMesh_2 = f(
        'emscripten_bind_Decoder_DecodeBufferToMesh_2'
      )),
      jd = (b._emscripten_bind_Decoder___destroy___0 = f('emscripten_bind_Decoder___destroy___0')),
      kd = (b._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM = f(
        'emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM'
      )),
      ld = (b._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM = f(
        'emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM'
      )),
      md = (b._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM = f(
        'emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM'
      )),
      nd = (b._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM = f(
        'emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM'
      )),
      od = (b._emscripten_enum_draco_GeometryAttribute_Type_INVALID = f(
        'emscripten_enum_draco_GeometryAttribute_Type_INVALID'
      )),
      pd = (b._emscripten_enum_draco_GeometryAttribute_Type_POSITION = f(
        'emscripten_enum_draco_GeometryAttribute_Type_POSITION'
      )),
      qd = (b._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = f(
        'emscripten_enum_draco_GeometryAttribute_Type_NORMAL'
      )),
      rd = (b._emscripten_enum_draco_GeometryAttribute_Type_COLOR = f(
        'emscripten_enum_draco_GeometryAttribute_Type_COLOR'
      )),
      sd = (b._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = f(
        'emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD'
      )),
      td = (b._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = f(
        'emscripten_enum_draco_GeometryAttribute_Type_GENERIC'
      )),
      ud = (b._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = f(
        'emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE'
      )),
      vd = (b._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = f(
        'emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD'
      )),
      wd = (b._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = f(
        'emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH'
      )),
      xd = (b._emscripten_enum_draco_DataType_DT_INVALID = f(
        'emscripten_enum_draco_DataType_DT_INVALID'
      )),
      yd = (b._emscripten_enum_draco_DataType_DT_INT8 = f(
        'emscripten_enum_draco_DataType_DT_INT8'
      )),
      zd = (b._emscripten_enum_draco_DataType_DT_UINT8 = f(
        'emscripten_enum_draco_DataType_DT_UINT8'
      )),
      Ad = (b._emscripten_enum_draco_DataType_DT_INT16 = f(
        'emscripten_enum_draco_DataType_DT_INT16'
      )),
      Bd = (b._emscripten_enum_draco_DataType_DT_UINT16 = f(
        'emscripten_enum_draco_DataType_DT_UINT16'
      )),
      Cd = (b._emscripten_enum_draco_DataType_DT_INT32 = f(
        'emscripten_enum_draco_DataType_DT_INT32'
      )),
      Dd = (b._emscripten_enum_draco_DataType_DT_UINT32 = f(
        'emscripten_enum_draco_DataType_DT_UINT32'
      )),
      Ed = (b._emscripten_enum_draco_DataType_DT_INT64 = f(
        'emscripten_enum_draco_DataType_DT_INT64'
      )),
      Fd = (b._emscripten_enum_draco_DataType_DT_UINT64 = f(
        'emscripten_enum_draco_DataType_DT_UINT64'
      )),
      Gd = (b._emscripten_enum_draco_DataType_DT_FLOAT32 = f(
        'emscripten_enum_draco_DataType_DT_FLOAT32'
      )),
      Hd = (b._emscripten_enum_draco_DataType_DT_FLOAT64 = f(
        'emscripten_enum_draco_DataType_DT_FLOAT64'
      )),
      Id = (b._emscripten_enum_draco_DataType_DT_BOOL = f(
        'emscripten_enum_draco_DataType_DT_BOOL'
      )),
      Jd = (b._emscripten_enum_draco_DataType_DT_TYPES_COUNT = f(
        'emscripten_enum_draco_DataType_DT_TYPES_COUNT'
      )),
      Kd = (b._emscripten_enum_draco_StatusCode_OK = f('emscripten_enum_draco_StatusCode_OK')),
      Ld = (b._emscripten_enum_draco_StatusCode_DRACO_ERROR = f(
        'emscripten_enum_draco_StatusCode_DRACO_ERROR'
      )),
      Md = (b._emscripten_enum_draco_StatusCode_IO_ERROR = f(
        'emscripten_enum_draco_StatusCode_IO_ERROR'
      )),
      Nd = (b._emscripten_enum_draco_StatusCode_INVALID_PARAMETER = f(
        'emscripten_enum_draco_StatusCode_INVALID_PARAMETER'
      )),
      Od = (b._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION = f(
        'emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION'
      )),
      Pd = (b._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION = f(
        'emscripten_enum_draco_StatusCode_UNKNOWN_VERSION'
      ));
    f('__errno_location');
    b._fflush = f('fflush');
    b._malloc = f('malloc');
    b._free = f('free');
    var Ra = function () {
        return (Ra = b.asm.emscripten_stack_init).apply(null, arguments);
      },
      Ca = function () {
        return (Ca = b.asm.emscripten_stack_get_end).apply(null, arguments);
      };
    f('stackSave');
    f('stackRestore');
    f('stackAlloc');
    var bb = f('__cxa_is_pointer_type');
    b.dynCall_jiji = f('dynCall_jiji');
    b.___start_em_js = 15916;
    b.___stop_em_js = 16014;
    'zeroMemory stringToNewUTF8 exitJS setErrNo inetPton4 inetNtop4 inetPton6 inetNtop6 readSockaddr writeSockaddr getHostByName getRandomDevice traverseStack convertPCtoSourceLocation readEmAsmArgs jstoi_q jstoi_s getExecutableName listenOnce autoResumeAudioContext dynCallLegacy getDynCaller dynCall handleException runtimeKeepalivePush runtimeKeepalivePop callUserCallback maybeExit safeSetTimeout asmjsMangle asyncLoad alignMemory mmapAlloc handleAllocator getNativeTypeSize STACK_SIZE STACK_ALIGN POINTER_SIZE ASSERTIONS writeI53ToI64 writeI53ToI64Clamped writeI53ToI64Signaling writeI53ToU64Clamped writeI53ToU64Signaling readI53FromI64 readI53FromU64 convertI32PairToI53 convertU32PairToI53 getCFunc ccall cwrap uleb128Encode sigToWasmTypes generateFuncType convertJsFunctionToWasm getEmptyTableSlot updateTableMap getFunctionAddress addFunction removeFunction reallyNegative unSign strLen reSign formatString intArrayToString AsciiToString stringToAscii UTF16ToString stringToUTF16 lengthBytesUTF16 UTF32ToString stringToUTF32 lengthBytesUTF32 allocateUTF8 allocateUTF8OnStack writeStringToMemory writeArrayToMemory writeAsciiToMemory getSocketFromFD getSocketAddress registerKeyEventCallback maybeCStringToJsString findEventTarget findCanvasEventTarget getBoundingClientRect fillMouseEventData registerMouseEventCallback registerWheelEventCallback registerUiEventCallback registerFocusEventCallback fillDeviceOrientationEventData registerDeviceOrientationEventCallback fillDeviceMotionEventData registerDeviceMotionEventCallback screenOrientation fillOrientationChangeEventData registerOrientationChangeEventCallback fillFullscreenChangeEventData registerFullscreenChangeEventCallback JSEvents_requestFullscreen JSEvents_resizeCanvasForFullscreen registerRestoreOldStyle hideEverythingExceptGivenElement restoreHiddenElements setLetterbox softFullscreenResizeWebGLRenderTarget doRequestFullscreen fillPointerlockChangeEventData registerPointerlockChangeEventCallback registerPointerlockErrorEventCallback requestPointerLock fillVisibilityChangeEventData registerVisibilityChangeEventCallback registerTouchEventCallback fillGamepadEventData registerGamepadEventCallback registerBeforeUnloadEventCallback fillBatteryEventData battery registerBatteryEventCallback setCanvasElementSize getCanvasElementSize demangle demangleAll jsStackTrace stackTrace getEnvStrings checkWasiClock createDyncallWrapper setImmediateWrapped clearImmediateWrapped polyfillSetImmediate newNativePromise getPromise exception_addRef exception_decRef setMainLoop heapObjectForWebGLType heapAccessShiftForWebGLHeap emscriptenWebGLGet computeUnpackAlignedImageSize emscriptenWebGLGetTexPixelData emscriptenWebGLGetUniform webglGetUniformLocation webglPrepareUniformLocationsBeforeFirstUse webglGetLeftBracePos emscriptenWebGLGetVertexAttrib writeGLArray SDL_unicode SDL_ttfContext SDL_audio GLFW_Window runAndAbortIfError ALLOC_NORMAL ALLOC_STACK allocate'
      .split(' ')
      .forEach(function (d) {
        'undefined' === typeof globalThis ||
          Object.getOwnPropertyDescriptor(globalThis, d) ||
          Object.defineProperty(globalThis, d, {
            configurable: !0,
            get: function () {
              var a =
                  '`' +
                  d +
                  '` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line',
                c = d;
              c.startsWith('_') || (c = '$' + d);
              a += ' (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=' + c + ')';
              Ma(d) &&
                (a +=
                  '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you');
              fa(a);
            },
          });
        Na(d);
      });
    'run UTF8ArrayToString UTF8ToString stringToUTF8Array stringToUTF8 lengthBytesUTF8 addOnPreRun addOnInit addOnPreMain addOnExit addOnPostRun addRunDependency removeRunDependency FS_createFolder FS_createPath FS_createDataFile FS_createPreloadedFile FS_createLazyFile FS_createLink FS_createDevice FS_unlink out err callMain abort keepRuntimeAlive wasmMemory stackAlloc stackSave stackRestore getTempRet0 setTempRet0 writeStackCookie checkStackCookie ptrToString getHeapMax emscripten_realloc_buffer ENV ERRNO_CODES ERRNO_MESSAGES DNS Protocols Sockets timers warnOnce UNWIND_CACHE readEmAsmArgsArray convertI32PairToI53Checked freeTableIndexes functionsInTableMap setValue getValue PATH PATH_FS intArrayFromString UTF16Decoder SYSCALLS JSEvents specialHTMLTargets currentFullscreenStrategy restoreOldWindowedStyle ExitStatus flush_NO_FILESYSTEM dlopenMissingError promiseMap uncaughtExceptionCount exceptionLast exceptionCaught ExceptionInfo Browser wget tempFixedLengthArray miniTempWebGLFloatBuffers GL AL SDL SDL_gfx GLUT EGL GLFW GLEW IDBStore'
      .split(' ')
      .forEach(Na);
    var za;
    ta = function a() {
      za || Oa();
      za || (ta = a);
    };
    if (b.preInit)
      for ('function' == typeof b.preInit && (b.preInit = [b.preInit]); 0 < b.preInit.length; )
        b.preInit.pop()();
    Oa();
    w.prototype = Object.create(w.prototype);
    w.prototype.constructor = w;
    w.prototype.__class__ = w;
    w.__cache__ = {};
    b.WrapperObject = w;
    b.getCache = D;
    b.wrapPointer = V;
    b.castObject = function (a, c) {
      return V(a.ptr, c);
    };
    b.NULL = V(0);
    b.destroy = function (a) {
      if (!a.__destroy__) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
      a.__destroy__();
      delete D(a.__class__)[a.ptr];
    };
    b.compare = function (a, c) {
      return a.ptr === c.ptr;
    };
    b.getPointer = function (a) {
      return a.ptr;
    };
    b.getClass = function (a) {
      return a.__class__;
    };
    var u = {
      buffer: 0,
      size: 0,
      pos: 0,
      temps: [],
      needed: 0,
      prepare: function () {
        if (u.needed) {
          for (var a = 0; a < u.temps.length; a++) b._free(u.temps[a]);
          u.temps.length = 0;
          b._free(u.buffer);
          u.buffer = 0;
          u.size += u.needed;
          u.needed = 0;
        }
        u.buffer || ((u.size += 128), (u.buffer = b._malloc(u.size)), l(u.buffer));
        u.pos = 0;
      },
      alloc: function (a, c) {
        l(u.buffer);
        a = a.length * c.BYTES_PER_ELEMENT;
        a = (a + 7) & -8;
        u.pos + a >= u.size
          ? (l(0 < a), (u.needed += a), (c = b._malloc(a)), u.temps.push(c))
          : ((c = u.buffer + u.pos), (u.pos += a));
        return c;
      },
      copy: function (a, c, e) {
        e >>>= 0;
        switch (c.BYTES_PER_ELEMENT) {
          case 2:
            e >>>= 1;
            break;
          case 4:
            e >>>= 2;
            break;
          case 8:
            e >>>= 3;
        }
        for (var n = 0; n < a.length; n++) c[e + n] = a[n];
      },
    };
    ea.prototype = Object.create(w.prototype);
    ea.prototype.constructor = ea;
    ea.prototype.__class__ = ea;
    ea.__cache__ = {};
    b.VoidPtr = ea;
    ea.prototype.__destroy__ = ea.prototype.__destroy__ = function () {
      xb(this.ptr);
    };
    W.prototype = Object.create(w.prototype);
    W.prototype.constructor = W;
    W.prototype.__class__ = W;
    W.__cache__ = {};
    b.DecoderBuffer = W;
    W.prototype.Init = W.prototype.Init = function (a, c) {
      var e = this.ptr;
      u.prepare();
      'object' == typeof a && (a = Ga(a));
      c && 'object' === typeof c && (c = c.ptr);
      yb(e, a, c);
    };
    W.prototype.__destroy__ = W.prototype.__destroy__ = function () {
      zb(this.ptr);
    };
    U.prototype = Object.create(w.prototype);
    U.prototype.constructor = U;
    U.prototype.__class__ = U;
    U.__cache__ = {};
    b.AttributeTransformData = U;
    U.prototype.transform_type = U.prototype.transform_type = function () {
      return Ab(this.ptr);
    };
    U.prototype.__destroy__ = U.prototype.__destroy__ = function () {
      Bb(this.ptr);
    };
    ba.prototype = Object.create(w.prototype);
    ba.prototype.constructor = ba;
    ba.prototype.__class__ = ba;
    ba.__cache__ = {};
    b.GeometryAttribute = ba;
    ba.prototype.__destroy__ = ba.prototype.__destroy__ = function () {
      Cb(this.ptr);
    };
    x.prototype = Object.create(w.prototype);
    x.prototype.constructor = x;
    x.prototype.__class__ = x;
    x.__cache__ = {};
    b.PointAttribute = x;
    x.prototype.size = x.prototype.size = function () {
      return Db(this.ptr);
    };
    x.prototype.GetAttributeTransformData = x.prototype.GetAttributeTransformData = function () {
      return V(Eb(this.ptr), U);
    };
    x.prototype.attribute_type = x.prototype.attribute_type = function () {
      return Fb(this.ptr);
    };
    x.prototype.data_type = x.prototype.data_type = function () {
      return Gb(this.ptr);
    };
    x.prototype.num_components = x.prototype.num_components = function () {
      return Hb(this.ptr);
    };
    x.prototype.normalized = x.prototype.normalized = function () {
      return !!Ib(this.ptr);
    };
    x.prototype.byte_stride = x.prototype.byte_stride = function () {
      return Jb(this.ptr);
    };
    x.prototype.byte_offset = x.prototype.byte_offset = function () {
      return Kb(this.ptr);
    };
    x.prototype.unique_id = x.prototype.unique_id = function () {
      return Lb(this.ptr);
    };
    x.prototype.__destroy__ = x.prototype.__destroy__ = function () {
      Mb(this.ptr);
    };
    F.prototype = Object.create(w.prototype);
    F.prototype.constructor = F;
    F.prototype.__class__ = F;
    F.__cache__ = {};
    b.AttributeQuantizationTransform = F;
    F.prototype.InitFromAttribute = F.prototype.InitFromAttribute = function (a) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      return !!Nb(c, a);
    };
    F.prototype.quantization_bits = F.prototype.quantization_bits = function () {
      return Ob(this.ptr);
    };
    F.prototype.min_value = F.prototype.min_value = function (a) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      return Pb(c, a);
    };
    F.prototype.range = F.prototype.range = function () {
      return Qb(this.ptr);
    };
    F.prototype.__destroy__ = F.prototype.__destroy__ = function () {
      Rb(this.ptr);
    };
    K.prototype = Object.create(w.prototype);
    K.prototype.constructor = K;
    K.prototype.__class__ = K;
    K.__cache__ = {};
    b.AttributeOctahedronTransform = K;
    K.prototype.InitFromAttribute = K.prototype.InitFromAttribute = function (a) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      return !!Sb(c, a);
    };
    K.prototype.quantization_bits = K.prototype.quantization_bits = function () {
      return Tb(this.ptr);
    };
    K.prototype.__destroy__ = K.prototype.__destroy__ = function () {
      Ub(this.ptr);
    };
    L.prototype = Object.create(w.prototype);
    L.prototype.constructor = L;
    L.prototype.__class__ = L;
    L.__cache__ = {};
    b.PointCloud = L;
    L.prototype.num_attributes = L.prototype.num_attributes = function () {
      return Vb(this.ptr);
    };
    L.prototype.num_points = L.prototype.num_points = function () {
      return Wb(this.ptr);
    };
    L.prototype.__destroy__ = L.prototype.__destroy__ = function () {
      Xb(this.ptr);
    };
    H.prototype = Object.create(w.prototype);
    H.prototype.constructor = H;
    H.prototype.__class__ = H;
    H.__cache__ = {};
    b.Mesh = H;
    H.prototype.num_faces = H.prototype.num_faces = function () {
      return Yb(this.ptr);
    };
    H.prototype.num_attributes = H.prototype.num_attributes = function () {
      return Zb(this.ptr);
    };
    H.prototype.num_points = H.prototype.num_points = function () {
      return $b(this.ptr);
    };
    H.prototype.__destroy__ = H.prototype.__destroy__ = function () {
      ac(this.ptr);
    };
    X.prototype = Object.create(w.prototype);
    X.prototype.constructor = X;
    X.prototype.__class__ = X;
    X.__cache__ = {};
    b.Metadata = X;
    X.prototype.__destroy__ = X.prototype.__destroy__ = function () {
      bc(this.ptr);
    };
    E.prototype = Object.create(w.prototype);
    E.prototype.constructor = E;
    E.prototype.__class__ = E;
    E.__cache__ = {};
    b.Status = E;
    E.prototype.code = E.prototype.code = function () {
      return cc(this.ptr);
    };
    E.prototype.ok = E.prototype.ok = function () {
      return !!dc(this.ptr);
    };
    E.prototype.error_msg = E.prototype.error_msg = function () {
      return A(ec(this.ptr));
    };
    E.prototype.__destroy__ = E.prototype.__destroy__ = function () {
      fc(this.ptr);
    };
    M.prototype = Object.create(w.prototype);
    M.prototype.constructor = M;
    M.prototype.__class__ = M;
    M.__cache__ = {};
    b.DracoFloat32Array = M;
    M.prototype.GetValue = M.prototype.GetValue = function (a) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      return gc(c, a);
    };
    M.prototype.size = M.prototype.size = function () {
      return hc(this.ptr);
    };
    M.prototype.__destroy__ = M.prototype.__destroy__ = function () {
      ic(this.ptr);
    };
    N.prototype = Object.create(w.prototype);
    N.prototype.constructor = N;
    N.prototype.__class__ = N;
    N.__cache__ = {};
    b.DracoInt8Array = N;
    N.prototype.GetValue = N.prototype.GetValue = function (a) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      return jc(c, a);
    };
    N.prototype.size = N.prototype.size = function () {
      return kc(this.ptr);
    };
    N.prototype.__destroy__ = N.prototype.__destroy__ = function () {
      lc(this.ptr);
    };
    O.prototype = Object.create(w.prototype);
    O.prototype.constructor = O;
    O.prototype.__class__ = O;
    O.__cache__ = {};
    b.DracoUInt8Array = O;
    O.prototype.GetValue = O.prototype.GetValue = function (a) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      return mc(c, a);
    };
    O.prototype.size = O.prototype.size = function () {
      return nc(this.ptr);
    };
    O.prototype.__destroy__ = O.prototype.__destroy__ = function () {
      oc(this.ptr);
    };
    P.prototype = Object.create(w.prototype);
    P.prototype.constructor = P;
    P.prototype.__class__ = P;
    P.__cache__ = {};
    b.DracoInt16Array = P;
    P.prototype.GetValue = P.prototype.GetValue = function (a) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      return pc(c, a);
    };
    P.prototype.size = P.prototype.size = function () {
      return qc(this.ptr);
    };
    P.prototype.__destroy__ = P.prototype.__destroy__ = function () {
      rc(this.ptr);
    };
    Q.prototype = Object.create(w.prototype);
    Q.prototype.constructor = Q;
    Q.prototype.__class__ = Q;
    Q.__cache__ = {};
    b.DracoUInt16Array = Q;
    Q.prototype.GetValue = Q.prototype.GetValue = function (a) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      return sc(c, a);
    };
    Q.prototype.size = Q.prototype.size = function () {
      return tc(this.ptr);
    };
    Q.prototype.__destroy__ = Q.prototype.__destroy__ = function () {
      uc(this.ptr);
    };
    R.prototype = Object.create(w.prototype);
    R.prototype.constructor = R;
    R.prototype.__class__ = R;
    R.__cache__ = {};
    b.DracoInt32Array = R;
    R.prototype.GetValue = R.prototype.GetValue = function (a) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      return vc(c, a);
    };
    R.prototype.size = R.prototype.size = function () {
      return wc(this.ptr);
    };
    R.prototype.__destroy__ = R.prototype.__destroy__ = function () {
      xc(this.ptr);
    };
    S.prototype = Object.create(w.prototype);
    S.prototype.constructor = S;
    S.prototype.__class__ = S;
    S.__cache__ = {};
    b.DracoUInt32Array = S;
    S.prototype.GetValue = S.prototype.GetValue = function (a) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      return yc(c, a);
    };
    S.prototype.size = S.prototype.size = function () {
      return zc(this.ptr);
    };
    S.prototype.__destroy__ = S.prototype.__destroy__ = function () {
      Ac(this.ptr);
    };
    z.prototype = Object.create(w.prototype);
    z.prototype.constructor = z;
    z.prototype.__class__ = z;
    z.__cache__ = {};
    b.MetadataQuerier = z;
    z.prototype.HasEntry = z.prototype.HasEntry = function (a, c) {
      var e = this.ptr;
      u.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      c = c && 'object' === typeof c ? c.ptr : ha(c);
      return !!Bc(e, a, c);
    };
    z.prototype.GetIntEntry = z.prototype.GetIntEntry = function (a, c) {
      var e = this.ptr;
      u.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      c = c && 'object' === typeof c ? c.ptr : ha(c);
      return Cc(e, a, c);
    };
    z.prototype.GetIntEntryArray = z.prototype.GetIntEntryArray = function (a, c, e) {
      var n = this.ptr;
      u.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      c = c && 'object' === typeof c ? c.ptr : ha(c);
      e && 'object' === typeof e && (e = e.ptr);
      Dc(n, a, c, e);
    };
    z.prototype.GetDoubleEntry = z.prototype.GetDoubleEntry = function (a, c) {
      var e = this.ptr;
      u.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      c = c && 'object' === typeof c ? c.ptr : ha(c);
      return Ec(e, a, c);
    };
    z.prototype.GetStringEntry = z.prototype.GetStringEntry = function (a, c) {
      var e = this.ptr;
      u.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      c = c && 'object' === typeof c ? c.ptr : ha(c);
      return A(Fc(e, a, c));
    };
    z.prototype.NumEntries = z.prototype.NumEntries = function (a) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      return Gc(c, a);
    };
    z.prototype.GetEntryName = z.prototype.GetEntryName = function (a, c) {
      var e = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return A(Hc(e, a, c));
    };
    z.prototype.__destroy__ = z.prototype.__destroy__ = function () {
      Ic(this.ptr);
    };
    q.prototype = Object.create(w.prototype);
    q.prototype.constructor = q;
    q.prototype.__class__ = q;
    q.__cache__ = {};
    b.Decoder = q;
    q.prototype.DecodeArrayToPointCloud = q.prototype.DecodeArrayToPointCloud = function (a, c, e) {
      var n = this.ptr;
      u.prepare();
      'object' == typeof a && (a = Ga(a));
      c && 'object' === typeof c && (c = c.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      return V(Jc(n, a, c, e), E);
    };
    q.prototype.DecodeArrayToMesh = q.prototype.DecodeArrayToMesh = function (a, c, e) {
      var n = this.ptr;
      u.prepare();
      'object' == typeof a && (a = Ga(a));
      c && 'object' === typeof c && (c = c.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      return V(Kc(n, a, c, e), E);
    };
    q.prototype.GetAttributeId = q.prototype.GetAttributeId = function (a, c) {
      var e = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return Lc(e, a, c);
    };
    q.prototype.GetAttributeIdByName = q.prototype.GetAttributeIdByName = function (a, c) {
      var e = this.ptr;
      u.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      c = c && 'object' === typeof c ? c.ptr : ha(c);
      return Mc(e, a, c);
    };
    q.prototype.GetAttributeIdByMetadataEntry = q.prototype.GetAttributeIdByMetadataEntry =
      function (a, c, e) {
        var n = this.ptr;
        u.prepare();
        a && 'object' === typeof a && (a = a.ptr);
        c = c && 'object' === typeof c ? c.ptr : ha(c);
        e = e && 'object' === typeof e ? e.ptr : ha(e);
        return Nc(n, a, c, e);
      };
    q.prototype.GetAttribute = q.prototype.GetAttribute = function (a, c) {
      var e = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return V(Oc(e, a, c), x);
    };
    q.prototype.GetAttributeByUniqueId = q.prototype.GetAttributeByUniqueId = function (a, c) {
      var e = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return V(Pc(e, a, c), x);
    };
    q.prototype.GetMetadata = q.prototype.GetMetadata = function (a) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      return V(Qc(c, a), X);
    };
    q.prototype.GetAttributeMetadata = q.prototype.GetAttributeMetadata = function (a, c) {
      var e = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return V(Rc(e, a, c), X);
    };
    q.prototype.GetFaceFromMesh = q.prototype.GetFaceFromMesh = function (a, c, e) {
      var n = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      return !!Sc(n, a, c, e);
    };
    q.prototype.GetTriangleStripsFromMesh = q.prototype.GetTriangleStripsFromMesh = function (
      a,
      c
    ) {
      var e = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return Tc(e, a, c);
    };
    q.prototype.GetTrianglesUInt16Array = q.prototype.GetTrianglesUInt16Array = function (a, c, e) {
      var n = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      return !!Uc(n, a, c, e);
    };
    q.prototype.GetTrianglesUInt32Array = q.prototype.GetTrianglesUInt32Array = function (a, c, e) {
      var n = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      return !!Vc(n, a, c, e);
    };
    q.prototype.GetAttributeFloat = q.prototype.GetAttributeFloat = function (a, c, e) {
      var n = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      return !!Wc(n, a, c, e);
    };
    q.prototype.GetAttributeFloatForAllPoints = q.prototype.GetAttributeFloatForAllPoints =
      function (a, c, e) {
        var n = this.ptr;
        a && 'object' === typeof a && (a = a.ptr);
        c && 'object' === typeof c && (c = c.ptr);
        e && 'object' === typeof e && (e = e.ptr);
        return !!Xc(n, a, c, e);
      };
    q.prototype.GetAttributeIntForAllPoints = q.prototype.GetAttributeIntForAllPoints = function (
      a,
      c,
      e
    ) {
      var n = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      return !!Yc(n, a, c, e);
    };
    q.prototype.GetAttributeInt8ForAllPoints = q.prototype.GetAttributeInt8ForAllPoints = function (
      a,
      c,
      e
    ) {
      var n = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      return !!Zc(n, a, c, e);
    };
    q.prototype.GetAttributeUInt8ForAllPoints = q.prototype.GetAttributeUInt8ForAllPoints =
      function (a, c, e) {
        var n = this.ptr;
        a && 'object' === typeof a && (a = a.ptr);
        c && 'object' === typeof c && (c = c.ptr);
        e && 'object' === typeof e && (e = e.ptr);
        return !!$c(n, a, c, e);
      };
    q.prototype.GetAttributeInt16ForAllPoints = q.prototype.GetAttributeInt16ForAllPoints =
      function (a, c, e) {
        var n = this.ptr;
        a && 'object' === typeof a && (a = a.ptr);
        c && 'object' === typeof c && (c = c.ptr);
        e && 'object' === typeof e && (e = e.ptr);
        return !!ad(n, a, c, e);
      };
    q.prototype.GetAttributeUInt16ForAllPoints = q.prototype.GetAttributeUInt16ForAllPoints =
      function (a, c, e) {
        var n = this.ptr;
        a && 'object' === typeof a && (a = a.ptr);
        c && 'object' === typeof c && (c = c.ptr);
        e && 'object' === typeof e && (e = e.ptr);
        return !!bd(n, a, c, e);
      };
    q.prototype.GetAttributeInt32ForAllPoints = q.prototype.GetAttributeInt32ForAllPoints =
      function (a, c, e) {
        var n = this.ptr;
        a && 'object' === typeof a && (a = a.ptr);
        c && 'object' === typeof c && (c = c.ptr);
        e && 'object' === typeof e && (e = e.ptr);
        return !!cd(n, a, c, e);
      };
    q.prototype.GetAttributeUInt32ForAllPoints = q.prototype.GetAttributeUInt32ForAllPoints =
      function (a, c, e) {
        var n = this.ptr;
        a && 'object' === typeof a && (a = a.ptr);
        c && 'object' === typeof c && (c = c.ptr);
        e && 'object' === typeof e && (e = e.ptr);
        return !!dd(n, a, c, e);
      };
    q.prototype.GetAttributeDataArrayForAllPoints = q.prototype.GetAttributeDataArrayForAllPoints =
      function (a, c, e, n, t) {
        var C = this.ptr;
        a && 'object' === typeof a && (a = a.ptr);
        c && 'object' === typeof c && (c = c.ptr);
        e && 'object' === typeof e && (e = e.ptr);
        n && 'object' === typeof n && (n = n.ptr);
        t && 'object' === typeof t && (t = t.ptr);
        return !!ed(C, a, c, e, n, t);
      };
    q.prototype.SkipAttributeTransform = q.prototype.SkipAttributeTransform = function (a) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      fd(c, a);
    };
    q.prototype.GetEncodedGeometryType_Deprecated = q.prototype.GetEncodedGeometryType_Deprecated =
      function (a) {
        var c = this.ptr;
        a && 'object' === typeof a && (a = a.ptr);
        return gd(c, a);
      };
    q.prototype.DecodeBufferToPointCloud = q.prototype.DecodeBufferToPointCloud = function (a, c) {
      var e = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return V(hd(e, a, c), E);
    };
    q.prototype.DecodeBufferToMesh = q.prototype.DecodeBufferToMesh = function (a, c) {
      var e = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return V(id(e, a, c), E);
    };
    q.prototype.__destroy__ = q.prototype.__destroy__ = function () {
      jd(this.ptr);
    };
    (function () {
      function a() {
        b.ATTRIBUTE_INVALID_TRANSFORM = kd();
        b.ATTRIBUTE_NO_TRANSFORM = ld();
        b.ATTRIBUTE_QUANTIZATION_TRANSFORM = md();
        b.ATTRIBUTE_OCTAHEDRON_TRANSFORM = nd();
        b.INVALID = od();
        b.POSITION = pd();
        b.NORMAL = qd();
        b.COLOR = rd();
        b.TEX_COORD = sd();
        b.GENERIC = td();
        b.INVALID_GEOMETRY_TYPE = ud();
        b.POINT_CLOUD = vd();
        b.TRIANGULAR_MESH = wd();
        b.DT_INVALID = xd();
        b.DT_INT8 = yd();
        b.DT_UINT8 = zd();
        b.DT_INT16 = Ad();
        b.DT_UINT16 = Bd();
        b.DT_INT32 = Cd();
        b.DT_UINT32 = Dd();
        b.DT_INT64 = Ed();
        b.DT_UINT64 = Fd();
        b.DT_FLOAT32 = Gd();
        b.DT_FLOAT64 = Hd();
        b.DT_BOOL = Id();
        b.DT_TYPES_COUNT = Jd();
        b.OK = Kd();
        b.DRACO_ERROR = Ld();
        b.IO_ERROR = Md();
        b.INVALID_PARAMETER = Nd();
        b.UNSUPPORTED_VERSION = Od();
        b.UNKNOWN_VERSION = Pd();
      }
      wa ? a() : Fa.unshift(a);
    })();
    if ('function' === typeof b.onModuleParsed) b.onModuleParsed();
    b.Decoder.prototype.GetEncodedGeometryType = function (a) {
      if (a.__class__ && a.__class__ === b.DecoderBuffer)
        return b.Decoder.prototype.GetEncodedGeometryType_Deprecated(a);
      if (8 > a.byteLength) return b.INVALID_GEOMETRY_TYPE;
      switch (a[7]) {
        case 0:
          return b.POINT_CLOUD;
        case 1:
          return b.TRIANGULAR_MESH;
        default:
          return b.INVALID_GEOMETRY_TYPE;
      }
    };
    return g.ready;
  };
})();
'object' === typeof exports && 'object' === typeof module
  ? (module.exports = DracoDecoderModule)
  : 'function' === typeof define && define.amd
  ? define([], function () {
      return DracoDecoderModule;
    })
  : 'object' === typeof exports && (exports.DracoDecoderModule = DracoDecoderModule);
