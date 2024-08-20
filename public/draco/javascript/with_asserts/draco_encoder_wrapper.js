var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function (l) {
  var k = 0;
  return function () {
    return k < l.length ? { done: !1, value: l[k++] } : { done: !0 };
  };
};
$jscomp.arrayIterator = function (l) {
  return { next: $jscomp.arrayIteratorImpl(l) };
};
$jscomp.makeIterator = function (l) {
  var k = 'undefined' != typeof Symbol && Symbol.iterator && l[Symbol.iterator];
  return k ? k.call(l) : $jscomp.arrayIterator(l);
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.ISOLATE_POLYFILLS = !1;
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = !1;
$jscomp.getGlobal = function (l) {
  l = [
    'object' == typeof globalThis && globalThis,
    l,
    'object' == typeof window && window,
    'object' == typeof self && self,
    'object' == typeof global && global,
  ];
  for (var k = 0; k < l.length; ++k) {
    var m = l[k];
    if (m && m.Math == Math) return m;
  }
  throw Error('Cannot find global object');
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || 'function' == typeof Object.defineProperties
    ? Object.defineProperty
    : function (l, k, m) {
        if (l == Array.prototype || l == Object.prototype) return l;
        l[k] = m.value;
        return l;
      };
$jscomp.IS_SYMBOL_NATIVE = 'function' === typeof Symbol && 'symbol' === typeof Symbol('x');
$jscomp.TRUST_ES6_POLYFILLS = !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = '$jscp$';
var $jscomp$lookupPolyfilledValue = function (l, k) {
  var m = $jscomp.propertyToPolyfillSymbol[k];
  if (null == m) return l[k];
  m = l[m];
  return void 0 !== m ? m : l[k];
};
$jscomp.polyfill = function (l, k, m, n) {
  k &&
    ($jscomp.ISOLATE_POLYFILLS
      ? $jscomp.polyfillIsolated(l, k, m, n)
      : $jscomp.polyfillUnisolated(l, k, m, n));
};
$jscomp.polyfillUnisolated = function (l, k, m, n) {
  m = $jscomp.global;
  l = l.split('.');
  for (n = 0; n < l.length - 1; n++) {
    var q = l[n];
    if (!(q in m)) return;
    m = m[q];
  }
  l = l[l.length - 1];
  n = m[l];
  k = k(n);
  k != n && null != k && $jscomp.defineProperty(m, l, { configurable: !0, writable: !0, value: k });
};
$jscomp.polyfillIsolated = function (l, k, m, n) {
  var q = l.split('.');
  l = 1 === q.length;
  n = q[0];
  n = !l && n in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
  for (var D = 0; D < q.length - 1; D++) {
    var p = q[D];
    if (!(p in n)) return;
    n = n[p];
  }
  q = q[q.length - 1];
  m = $jscomp.IS_SYMBOL_NATIVE && 'es6' === m ? n[q] : null;
  k = k(m);
  null != k &&
    (l
      ? $jscomp.defineProperty($jscomp.polyfills, q, { configurable: !0, writable: !0, value: k })
      : k !== m &&
        (void 0 === $jscomp.propertyToPolyfillSymbol[q] &&
          ((m = (1e9 * Math.random()) >>> 0),
          ($jscomp.propertyToPolyfillSymbol[q] = $jscomp.IS_SYMBOL_NATIVE
            ? $jscomp.global.Symbol(q)
            : $jscomp.POLYFILL_PREFIX + m + '$' + q)),
        $jscomp.defineProperty(n, $jscomp.propertyToPolyfillSymbol[q], {
          configurable: !0,
          writable: !0,
          value: k,
        })));
};
$jscomp.polyfill(
  'Promise',
  function (l) {
    function k() {
      this.batch_ = null;
    }
    function m(p) {
      return p instanceof q
        ? p
        : new q(function (u, v) {
            u(p);
          });
    }
    if (
      l &&
      (!(
        $jscomp.FORCE_POLYFILL_PROMISE ||
        ($jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION &&
          'undefined' === typeof $jscomp.global.PromiseRejectionEvent)
      ) ||
        !$jscomp.global.Promise ||
        -1 === $jscomp.global.Promise.toString().indexOf('[native code]'))
    )
      return l;
    k.prototype.asyncExecute = function (p) {
      if (null == this.batch_) {
        this.batch_ = [];
        var u = this;
        this.asyncExecuteFunction(function () {
          u.executeBatch_();
        });
      }
      this.batch_.push(p);
    };
    var n = $jscomp.global.setTimeout;
    k.prototype.asyncExecuteFunction = function (p) {
      n(p, 0);
    };
    k.prototype.executeBatch_ = function () {
      for (; this.batch_ && this.batch_.length; ) {
        var p = this.batch_;
        this.batch_ = [];
        for (var u = 0; u < p.length; ++u) {
          var v = p[u];
          p[u] = null;
          try {
            v();
          } catch (B) {
            this.asyncThrow_(B);
          }
        }
      }
      this.batch_ = null;
    };
    k.prototype.asyncThrow_ = function (p) {
      this.asyncExecuteFunction(function () {
        throw p;
      });
    };
    var q = function (p) {
      this.state_ = 0;
      this.result_ = void 0;
      this.onSettledCallbacks_ = [];
      this.isRejectionHandled_ = !1;
      var u = this.createResolveAndReject_();
      try {
        p(u.resolve, u.reject);
      } catch (v) {
        u.reject(v);
      }
    };
    q.prototype.createResolveAndReject_ = function () {
      function p(B) {
        return function (h) {
          v || ((v = !0), B.call(u, h));
        };
      }
      var u = this,
        v = !1;
      return { resolve: p(this.resolveTo_), reject: p(this.reject_) };
    };
    q.prototype.resolveTo_ = function (p) {
      if (p === this) this.reject_(new TypeError('A Promise cannot resolve to itself'));
      else if (p instanceof q) this.settleSameAsPromise_(p);
      else {
        a: switch (typeof p) {
          case 'object':
            var u = null != p;
            break a;
          case 'function':
            u = !0;
            break a;
          default:
            u = !1;
        }
        u ? this.resolveToNonPromiseObj_(p) : this.fulfill_(p);
      }
    };
    q.prototype.resolveToNonPromiseObj_ = function (p) {
      var u = void 0;
      try {
        u = p.then;
      } catch (v) {
        this.reject_(v);
        return;
      }
      'function' == typeof u ? this.settleSameAsThenable_(u, p) : this.fulfill_(p);
    };
    q.prototype.reject_ = function (p) {
      this.settle_(2, p);
    };
    q.prototype.fulfill_ = function (p) {
      this.settle_(1, p);
    };
    q.prototype.settle_ = function (p, u) {
      if (0 != this.state_)
        throw Error(
          'Cannot settle(' + p + ', ' + u + '): Promise already settled in state' + this.state_
        );
      this.state_ = p;
      this.result_ = u;
      2 === this.state_ && this.scheduleUnhandledRejectionCheck_();
      this.executeOnSettledCallbacks_();
    };
    q.prototype.scheduleUnhandledRejectionCheck_ = function () {
      var p = this;
      n(function () {
        if (p.notifyUnhandledRejection_()) {
          var u = $jscomp.global.console;
          'undefined' !== typeof u && u.error(p.result_);
        }
      }, 1);
    };
    q.prototype.notifyUnhandledRejection_ = function () {
      if (this.isRejectionHandled_) return !1;
      var p = $jscomp.global.CustomEvent,
        u = $jscomp.global.Event,
        v = $jscomp.global.dispatchEvent;
      if ('undefined' === typeof v) return !0;
      'function' === typeof p
        ? (p = new p('unhandledrejection', { cancelable: !0 }))
        : 'function' === typeof u
        ? (p = new u('unhandledrejection', { cancelable: !0 }))
        : ((p = $jscomp.global.document.createEvent('CustomEvent')),
          p.initCustomEvent('unhandledrejection', !1, !0, p));
      p.promise = this;
      p.reason = this.result_;
      return v(p);
    };
    q.prototype.executeOnSettledCallbacks_ = function () {
      if (null != this.onSettledCallbacks_) {
        for (var p = 0; p < this.onSettledCallbacks_.length; ++p)
          D.asyncExecute(this.onSettledCallbacks_[p]);
        this.onSettledCallbacks_ = null;
      }
    };
    var D = new k();
    q.prototype.settleSameAsPromise_ = function (p) {
      var u = this.createResolveAndReject_();
      p.callWhenSettled_(u.resolve, u.reject);
    };
    q.prototype.settleSameAsThenable_ = function (p, u) {
      var v = this.createResolveAndReject_();
      try {
        p.call(u, v.resolve, v.reject);
      } catch (B) {
        v.reject(B);
      }
    };
    q.prototype.then = function (p, u) {
      function v(Q, G) {
        return 'function' == typeof Q
          ? function (da) {
              try {
                B(Q(da));
              } catch (ea) {
                h(ea);
              }
            }
          : G;
      }
      var B,
        h,
        fa = new q(function (Q, G) {
          B = Q;
          h = G;
        });
      this.callWhenSettled_(v(p, B), v(u, h));
      return fa;
    };
    q.prototype.catch = function (p) {
      return this.then(void 0, p);
    };
    q.prototype.callWhenSettled_ = function (p, u) {
      function v() {
        switch (B.state_) {
          case 1:
            p(B.result_);
            break;
          case 2:
            u(B.result_);
            break;
          default:
            throw Error('Unexpected state: ' + B.state_);
        }
      }
      var B = this;
      null == this.onSettledCallbacks_ ? D.asyncExecute(v) : this.onSettledCallbacks_.push(v);
      this.isRejectionHandled_ = !0;
    };
    q.resolve = m;
    q.reject = function (p) {
      return new q(function (u, v) {
        v(p);
      });
    };
    q.race = function (p) {
      return new q(function (u, v) {
        for (var B = $jscomp.makeIterator(p), h = B.next(); !h.done; h = B.next())
          m(h.value).callWhenSettled_(u, v);
      });
    };
    q.all = function (p) {
      var u = $jscomp.makeIterator(p),
        v = u.next();
      return v.done
        ? m([])
        : new q(function (B, h) {
            function fa(da) {
              return function (ea) {
                Q[da] = ea;
                G--;
                0 == G && B(Q);
              };
            }
            var Q = [],
              G = 0;
            do
              Q.push(void 0), G++, m(v.value).callWhenSettled_(fa(Q.length - 1), h), (v = u.next());
            while (!v.done);
          });
    };
    return q;
  },
  'es6',
  'es3'
);
$jscomp.owns = function (l, k) {
  return Object.prototype.hasOwnProperty.call(l, k);
};
$jscomp.assign =
  $jscomp.TRUST_ES6_POLYFILLS && 'function' == typeof Object.assign
    ? Object.assign
    : function (l, k) {
        for (var m = 1; m < arguments.length; m++) {
          var n = arguments[m];
          if (n) for (var q in n) $jscomp.owns(n, q) && (l[q] = n[q]);
        }
        return l;
      };
$jscomp.polyfill(
  'Object.assign',
  function (l) {
    return l || $jscomp.assign;
  },
  'es6',
  'es3'
);
$jscomp.polyfill(
  'globalThis',
  function (l) {
    return l || $jscomp.global;
  },
  'es_2020',
  'es3'
);
$jscomp.polyfill(
  'Math.imul',
  function (l) {
    return l
      ? l
      : function (k, m) {
          k = Number(k);
          m = Number(m);
          var n = k & 65535,
            q = m & 65535;
          return (
            (n * q + (((((k >>> 16) & 65535) * q + n * ((m >>> 16) & 65535)) << 16) >>> 0)) | 0
          );
        };
  },
  'es6',
  'es3'
);
$jscomp.polyfill(
  'Math.fround',
  function (l) {
    if (l) return l;
    if ($jscomp.SIMPLE_FROUND_POLYFILL || 'function' !== typeof Float32Array)
      return function (m) {
        return m;
      };
    var k = new Float32Array(1);
    return function (m) {
      k[0] = m;
      return k[0];
    };
  },
  'es6',
  'es3'
);
$jscomp.polyfill(
  'Math.clz32',
  function (l) {
    return l
      ? l
      : function (k) {
          k = Number(k) >>> 0;
          if (0 === k) return 32;
          var m = 0;
          0 === (k & 4294901760) && ((k <<= 16), (m += 16));
          0 === (k & 4278190080) && ((k <<= 8), (m += 8));
          0 === (k & 4026531840) && ((k <<= 4), (m += 4));
          0 === (k & 3221225472) && ((k <<= 2), (m += 2));
          0 === (k & 2147483648) && m++;
          return m;
        };
  },
  'es6',
  'es3'
);
$jscomp.polyfill(
  'Math.trunc',
  function (l) {
    return l
      ? l
      : function (k) {
          k = Number(k);
          if (isNaN(k) || Infinity === k || -Infinity === k || 0 === k) return k;
          var m = Math.floor(Math.abs(k));
          return 0 > k ? -m : m;
        };
  },
  'es6',
  'es3'
);
$jscomp.checkStringArgs = function (l, k, m) {
  if (null == l)
    throw new TypeError(
      "The 'this' value for String.prototype." + m + ' must not be null or undefined'
    );
  if (k instanceof RegExp)
    throw new TypeError(
      'First argument to String.prototype.' + m + ' must not be a regular expression'
    );
  return l + '';
};
$jscomp.polyfill(
  'String.prototype.startsWith',
  function (l) {
    return l
      ? l
      : function (k, m) {
          var n = $jscomp.checkStringArgs(this, k, 'startsWith');
          k += '';
          var q = n.length,
            D = k.length;
          m = Math.max(0, Math.min(m | 0, n.length));
          for (var p = 0; p < D && m < q; ) if (n[m++] != k[p++]) return !1;
          return p >= D;
        };
  },
  'es6',
  'es3'
);
$jscomp.polyfill(
  'String.prototype.repeat',
  function (l) {
    return l
      ? l
      : function (k) {
          var m = $jscomp.checkStringArgs(this, null, 'repeat');
          if (0 > k || 1342177279 < k) throw new RangeError('Invalid count value');
          k |= 0;
          for (var n = ''; k; ) if ((k & 1 && (n += m), (k >>>= 1))) m += m;
          return n;
        };
  },
  'es6',
  'es3'
);
$jscomp.stringPadding = function (l, k) {
  l = void 0 !== l ? String(l) : ' ';
  return 0 < k && l ? l.repeat(Math.ceil(k / l.length)).substring(0, k) : '';
};
$jscomp.polyfill(
  'String.prototype.padStart',
  function (l) {
    return l
      ? l
      : function (k, m) {
          var n = $jscomp.checkStringArgs(this, null, 'padStart');
          return $jscomp.stringPadding(m, k - n.length) + n;
        };
  },
  'es8',
  'es3'
);
$jscomp.polyfill(
  'Array.prototype.copyWithin',
  function (l) {
    function k(m) {
      m = Number(m);
      return Infinity === m || -Infinity === m ? m : m | 0;
    }
    return l
      ? l
      : function (m, n, q) {
          var D = this.length;
          m = k(m);
          n = k(n);
          q = void 0 === q ? D : k(q);
          m = 0 > m ? Math.max(D + m, 0) : Math.min(m, D);
          n = 0 > n ? Math.max(D + n, 0) : Math.min(n, D);
          q = 0 > q ? Math.max(D + q, 0) : Math.min(q, D);
          if (m < n) for (; n < q; ) n in this ? (this[m++] = this[n++]) : (delete this[m++], n++);
          else
            for (q = Math.min(q, D + n - m), m += q - n; q > n; )
              --q in this ? (this[--m] = this[q]) : delete this[--m];
          return this;
        };
  },
  'es6',
  'es3'
);
$jscomp.typedArrayCopyWithin = function (l) {
  return l ? l : Array.prototype.copyWithin;
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
var DracoEncoderModule = (function () {
  var l =
    'undefined' !== typeof document && document.currentScript ? document.currentScript.src : void 0;
  'undefined' !== typeof __filename && (l = l || __filename);
  return function (k) {
    function m(e) {
      return d.locateFile ? d.locateFile(e, R) : R + e;
    }
    function n(e, a) {
      e || v('Assertion failed' + (a ? ': ' + a : ''));
    }
    function q() {
      var e = ja.buffer;
      d.HEAP8 = U = new Int8Array(e);
      d.HEAP16 = Da = new Int16Array(e);
      d.HEAP32 = X = new Int32Array(e);
      d.HEAPU8 = ra = new Uint8Array(e);
      d.HEAPU16 = new Uint16Array(e);
      d.HEAPU32 = H = new Uint32Array(e);
      d.HEAPF32 = Ea = new Float32Array(e);
      d.HEAPF64 = new Float64Array(e);
    }
    function D() {
      var e = Fa();
      n(0 == (e & 3));
      0 == e && (e += 4);
      H[e >> 2] = 34821223;
      H[(e + 4) >> 2] = 2310721022;
      H[0] = 1668509029;
    }
    function p() {
      if (!sa) {
        var e = Fa();
        0 == e && (e += 4);
        var a = H[e >> 2],
          b = H[(e + 4) >> 2];
        (34821223 == a && 2310721022 == b) ||
          v(
            'Stack overflow! Stack cookie has been overwritten at ' +
              ka(e) +
              ', expected hex dwords 0x89BACDFE and 0x2135467, but received ' +
              ka(b) +
              ' ' +
              ka(a)
          );
        1668509029 !== H[0] &&
          v('Runtime error: The application has corrupted its heap memory area (address zero)!');
      }
    }
    function u(e) {
      Z++;
      d.monitorRunDependencies && d.monitorRunDependencies(Z);
      e
        ? (n(!la[e]),
          (la[e] = 1),
          null === aa &&
            'undefined' != typeof setInterval &&
            (aa = setInterval(function () {
              if (sa) clearInterval(aa), (aa = null);
              else {
                var a = !1,
                  b;
                for (b in la)
                  a || ((a = !0), J('still waiting on run dependencies:')), J('dependency: ' + b);
                a && J('(end of list)');
              }
            }, 1e4)))
        : J('warning: run dependency added without ID');
    }
    function v(e) {
      if (d.onAbort) d.onAbort(e);
      e = 'Aborted(' + e + ')';
      J(e);
      sa = !0;
      e = new WebAssembly.RuntimeError(e);
      ta(e);
      throw e;
    }
    function B(e) {
      return e.startsWith('file://');
    }
    function h(e, a) {
      return function () {
        var b = a;
        a || (b = d.asm);
        n(ua, 'native function `' + e + '` called before runtime initialization');
        b[e] || n(b[e], 'exported native function `' + e + '` not found');
        return b[e].apply(null, arguments);
      };
    }
    function fa(e) {
      try {
        if (e == K && ma) return new Uint8Array(ma);
        if (na) return na(e);
        throw 'both async and sync fetching of the wasm failed';
      } catch (a) {
        v(a);
      }
    }
    function Q() {
      if (!ma && (Ga || ha)) {
        if ('function' == typeof fetch && !B(K))
          return fetch(K, { credentials: 'same-origin' })
            .then(function (e) {
              if (!e.ok) throw "failed to load wasm binary file at '" + K + "'";
              return e.arrayBuffer();
            })
            .catch(function () {
              return fa(K);
            });
        if (va)
          return new Promise(function (e, a) {
            va(
              K,
              function (b) {
                e(new Uint8Array(b));
              },
              a
            );
          });
      }
      return Promise.resolve().then(function () {
        return fa(K);
      });
    }
    function G(e, a) {
      Object.getOwnPropertyDescriptor(d, e) ||
        Object.defineProperty(d, e, {
          configurable: !0,
          get: function () {
            v(
              'Module.' +
                e +
                ' has been replaced with plain ' +
                a +
                ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
            );
          },
        });
    }
    function da(e) {
      return (
        'FS_createPath' === e ||
        'FS_createDataFile' === e ||
        'FS_createPreloadedFile' === e ||
        'FS_unlink' === e ||
        'addRunDependency' === e ||
        'FS_createLazyFile' === e ||
        'FS_createDevice' === e ||
        'removeRunDependency' === e
      );
    }
    function ea(e) {
      Object.getOwnPropertyDescriptor(d, e) ||
        Object.defineProperty(d, e, {
          configurable: !0,
          get: function () {
            var a =
              "'" + e + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
            da(e) &&
              (a +=
                '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you');
            v(a);
          },
        });
    }
    function Ha(e) {
      for (; 0 < e.length; ) e.shift()(d);
    }
    function ka(e) {
      n('number' === typeof e);
      return '0x' + e.toString(16).padStart(8, '0');
    }
    function Y(e) {
      Y.shown || (Y.shown = {});
      Y.shown[e] || ((Y.shown[e] = 1), wa && (e = 'warning: ' + e), J(e));
    }
    function bb(e) {
      this.excPtr = e;
      this.ptr = e - 24;
      this.set_type = function (a) {
        H[(this.ptr + 4) >> 2] = a;
      };
      this.get_type = function () {
        return H[(this.ptr + 4) >> 2];
      };
      this.set_destructor = function (a) {
        H[(this.ptr + 8) >> 2] = a;
      };
      this.get_destructor = function () {
        return H[(this.ptr + 8) >> 2];
      };
      this.set_refcount = function (a) {
        X[this.ptr >> 2] = a;
      };
      this.set_caught = function (a) {
        U[(this.ptr + 12) >> 0] = a ? 1 : 0;
      };
      this.get_caught = function () {
        return 0 != U[(this.ptr + 12) >> 0];
      };
      this.set_rethrown = function (a) {
        U[(this.ptr + 13) >> 0] = a ? 1 : 0;
      };
      this.get_rethrown = function () {
        return 0 != U[(this.ptr + 13) >> 0];
      };
      this.init = function (a, b) {
        this.set_adjusted_ptr(0);
        this.set_type(a);
        this.set_destructor(b);
        this.set_refcount(0);
        this.set_caught(!1);
        this.set_rethrown(!1);
      };
      this.add_ref = function () {
        X[this.ptr >> 2] += 1;
      };
      this.release_ref = function () {
        var a = X[this.ptr >> 2];
        X[this.ptr >> 2] = a - 1;
        n(0 < a);
        return 1 === a;
      };
      this.set_adjusted_ptr = function (a) {
        H[(this.ptr + 16) >> 2] = a;
      };
      this.get_adjusted_ptr = function () {
        return H[(this.ptr + 16) >> 2];
      };
      this.get_exception_ptr = function () {
        if (cb(this.get_type())) return H[this.excPtr >> 2];
        var a = this.get_adjusted_ptr();
        return 0 !== a ? a : this.excPtr;
      };
    }
    function Oa() {
      function e() {
        if (!xa && ((xa = !0), (d.calledRun = !0), !sa)) {
          n(!ua);
          ua = !0;
          p();
          Ha(Ia);
          Pa(d);
          if (d.onRuntimeInitialized) d.onRuntimeInitialized();
          n(
            !d._main,
            'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'
          );
          p();
          if (d.postRun)
            for ('function' == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length; )
              Qa.unshift(d.postRun.shift());
          Ha(Qa);
        }
      }
      if (!(0 < Z)) {
        Ra();
        D();
        if (d.preRun)
          for ('function' == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length; )
            Sa.unshift(d.preRun.shift());
        Ha(Sa);
        0 < Z ||
          (d.setStatus
            ? (d.setStatus('Running...'),
              setTimeout(function () {
                setTimeout(function () {
                  d.setStatus('');
                }, 1);
                e();
              }, 1))
            : e(),
          p());
      }
    }
    function C() {}
    function L(e) {
      return (e || C).__cache__;
    }
    function Ja(e, a) {
      var b = L(a),
        c = b[e];
      if (c) return c;
      c = Object.create((a || C).prototype);
      c.ptr = e;
      return (b[e] = c);
    }
    function oa(e) {
      if ('string' === typeof e) {
        for (var a = 0, b = 0; b < e.length; ++b) {
          var c = e.charCodeAt(b);
          127 >= c
            ? a++
            : 2047 >= c
            ? (a += 2)
            : 55296 <= c && 57343 >= c
            ? ((a += 4), ++b)
            : (a += 3);
        }
        a = Array(a + 1);
        b = 0;
        c = a.length;
        if (0 < c) {
          c = b + c - 1;
          for (var f = 0; f < e.length; ++f) {
            var g = e.charCodeAt(f);
            if (55296 <= g && 57343 >= g) {
              var t = e.charCodeAt(++f);
              g = (65536 + ((g & 1023) << 10)) | (t & 1023);
            }
            if (127 >= g) {
              if (b >= c) break;
              a[b++] = g;
            } else {
              if (2047 >= g) {
                if (b + 1 >= c) break;
                a[b++] = 192 | (g >> 6);
              } else {
                if (65535 >= g) {
                  if (b + 2 >= c) break;
                  a[b++] = 224 | (g >> 12);
                } else {
                  if (b + 3 >= c) break;
                  1114111 < g &&
                    Y(
                      'Invalid Unicode code point ' +
                        ka(g) +
                        ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).'
                    );
                  a[b++] = 240 | (g >> 18);
                  a[b++] = 128 | ((g >> 12) & 63);
                }
                a[b++] = 128 | ((g >> 6) & 63);
              }
              a[b++] = 128 | (g & 63);
            }
          }
          a[b] = 0;
        }
        e = r.alloc(a, U);
        r.copy(a, U, e);
        return e;
      }
      return e;
    }
    function ya(e) {
      if ('object' === typeof e) {
        var a = r.alloc(e, U);
        r.copy(e, U, a);
        return a;
      }
      return e;
    }
    function za(e) {
      if ('object' === typeof e) {
        var a = r.alloc(e, Da);
        r.copy(e, Da, a);
        return a;
      }
      return e;
    }
    function ba(e) {
      if ('object' === typeof e) {
        var a = r.alloc(e, X);
        r.copy(e, X, a);
        return a;
      }
      return e;
    }
    function pa(e) {
      if ('object' === typeof e) {
        var a = r.alloc(e, Ea);
        r.copy(e, Ea, a);
        return a;
      }
      return e;
    }
    function V() {
      throw 'cannot construct a VoidPtr, no constructor in IDL';
    }
    function S() {
      this.ptr = db();
      L(S)[this.ptr] = this;
    }
    function z() {
      this.ptr = eb();
      L(z)[this.ptr] = this;
    }
    function M() {
      this.ptr = fb();
      L(M)[this.ptr] = this;
    }
    function E() {
      this.ptr = gb();
      L(E)[this.ptr] = this;
    }
    function T() {
      this.ptr = hb();
      L(T)[this.ptr] = this;
    }
    function N() {
      this.ptr = ib();
      L(N)[this.ptr] = this;
    }
    function F() {
      this.ptr = jb();
      L(F)[this.ptr] = this;
    }
    function x() {
      this.ptr = kb();
      L(x)[this.ptr] = this;
    }
    function w() {
      this.ptr = lb();
      L(w)[this.ptr] = this;
    }
    function y() {
      this.ptr = mb();
      L(y)[this.ptr] = this;
    }
    function A(e) {
      e && 'object' === typeof e && (e = e.ptr);
      this.ptr = nb(e);
      L(A)[this.ptr] = this;
    }
    k = void 0 === k ? {} : k;
    var d = 'undefined' != typeof k ? k : {},
      Pa,
      ta;
    d.ready = new Promise(function (e, a) {
      Pa = e;
      ta = a;
    });
    '_free _malloc _emscripten_bind_VoidPtr___destroy___0 _emscripten_bind_GeometryAttribute_GeometryAttribute_0 _emscripten_bind_GeometryAttribute___destroy___0 _emscripten_bind_PointAttribute_PointAttribute_0 _emscripten_bind_PointAttribute_size_0 _emscripten_bind_PointAttribute_attribute_type_0 _emscripten_bind_PointAttribute_data_type_0 _emscripten_bind_PointAttribute_num_components_0 _emscripten_bind_PointAttribute_normalized_0 _emscripten_bind_PointAttribute_byte_stride_0 _emscripten_bind_PointAttribute_byte_offset_0 _emscripten_bind_PointAttribute_unique_id_0 _emscripten_bind_PointAttribute___destroy___0 _emscripten_bind_PointCloud_PointCloud_0 _emscripten_bind_PointCloud_num_attributes_0 _emscripten_bind_PointCloud_num_points_0 _emscripten_bind_PointCloud___destroy___0 _emscripten_bind_Mesh_Mesh_0 _emscripten_bind_Mesh_num_faces_0 _emscripten_bind_Mesh_num_attributes_0 _emscripten_bind_Mesh_num_points_0 _emscripten_bind_Mesh_set_num_points_1 _emscripten_bind_Mesh___destroy___0 _emscripten_bind_Metadata_Metadata_0 _emscripten_bind_Metadata___destroy___0 _emscripten_bind_DracoInt8Array_DracoInt8Array_0 _emscripten_bind_DracoInt8Array_GetValue_1 _emscripten_bind_DracoInt8Array_size_0 _emscripten_bind_DracoInt8Array___destroy___0 _emscripten_bind_MetadataBuilder_MetadataBuilder_0 _emscripten_bind_MetadataBuilder_AddStringEntry_3 _emscripten_bind_MetadataBuilder_AddIntEntry_3 _emscripten_bind_MetadataBuilder_AddIntEntryArray_4 _emscripten_bind_MetadataBuilder_AddDoubleEntry_3 _emscripten_bind_MetadataBuilder___destroy___0 _emscripten_bind_PointCloudBuilder_PointCloudBuilder_0 _emscripten_bind_PointCloudBuilder_AddFloatAttribute_5 _emscripten_bind_PointCloudBuilder_AddInt8Attribute_5 _emscripten_bind_PointCloudBuilder_AddUInt8Attribute_5 _emscripten_bind_PointCloudBuilder_AddInt16Attribute_5 _emscripten_bind_PointCloudBuilder_AddUInt16Attribute_5 _emscripten_bind_PointCloudBuilder_AddInt32Attribute_5 _emscripten_bind_PointCloudBuilder_AddUInt32Attribute_5 _emscripten_bind_PointCloudBuilder_AddMetadata_2 _emscripten_bind_PointCloudBuilder_SetMetadataForAttribute_3 _emscripten_bind_PointCloudBuilder_SetNormalizedFlagForAttribute_3 _emscripten_bind_PointCloudBuilder___destroy___0 _emscripten_bind_MeshBuilder_MeshBuilder_0 _emscripten_bind_MeshBuilder_AddFacesToMesh_3 _emscripten_bind_MeshBuilder_AddFloatAttributeToMesh_5 _emscripten_bind_MeshBuilder_AddInt32AttributeToMesh_5 _emscripten_bind_MeshBuilder_AddMetadataToMesh_2 _emscripten_bind_MeshBuilder_AddFloatAttribute_5 _emscripten_bind_MeshBuilder_AddInt8Attribute_5 _emscripten_bind_MeshBuilder_AddUInt8Attribute_5 _emscripten_bind_MeshBuilder_AddInt16Attribute_5 _emscripten_bind_MeshBuilder_AddUInt16Attribute_5 _emscripten_bind_MeshBuilder_AddInt32Attribute_5 _emscripten_bind_MeshBuilder_AddUInt32Attribute_5 _emscripten_bind_MeshBuilder_AddMetadata_2 _emscripten_bind_MeshBuilder_SetMetadataForAttribute_3 _emscripten_bind_MeshBuilder_SetNormalizedFlagForAttribute_3 _emscripten_bind_MeshBuilder___destroy___0 _emscripten_bind_Encoder_Encoder_0 _emscripten_bind_Encoder_SetEncodingMethod_1 _emscripten_bind_Encoder_SetAttributeQuantization_2 _emscripten_bind_Encoder_SetAttributeExplicitQuantization_5 _emscripten_bind_Encoder_SetSpeedOptions_2 _emscripten_bind_Encoder_SetTrackEncodedProperties_1 _emscripten_bind_Encoder_EncodeMeshToDracoBuffer_2 _emscripten_bind_Encoder_EncodePointCloudToDracoBuffer_3 _emscripten_bind_Encoder_GetNumberOfEncodedPoints_0 _emscripten_bind_Encoder_GetNumberOfEncodedFaces_0 _emscripten_bind_Encoder___destroy___0 _emscripten_bind_ExpertEncoder_ExpertEncoder_1 _emscripten_bind_ExpertEncoder_SetEncodingMethod_1 _emscripten_bind_ExpertEncoder_SetAttributeQuantization_2 _emscripten_bind_ExpertEncoder_SetAttributeExplicitQuantization_5 _emscripten_bind_ExpertEncoder_SetSpeedOptions_2 _emscripten_bind_ExpertEncoder_SetTrackEncodedProperties_1 _emscripten_bind_ExpertEncoder_EncodeToDracoBuffer_2 _emscripten_bind_ExpertEncoder_GetNumberOfEncodedPoints_0 _emscripten_bind_ExpertEncoder_GetNumberOfEncodedFaces_0 _emscripten_bind_ExpertEncoder___destroy___0 _emscripten_enum_draco_GeometryAttribute_Type_INVALID _emscripten_enum_draco_GeometryAttribute_Type_POSITION _emscripten_enum_draco_GeometryAttribute_Type_NORMAL _emscripten_enum_draco_GeometryAttribute_Type_COLOR _emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD _emscripten_enum_draco_GeometryAttribute_Type_GENERIC _emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE _emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD _emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH _emscripten_enum_draco_MeshEncoderMethod_MESH_SEQUENTIAL_ENCODING _emscripten_enum_draco_MeshEncoderMethod_MESH_EDGEBREAKER_ENCODING _fflush onRuntimeInitialized'
      .split(' ')
      .forEach(function (e) {
        Object.getOwnPropertyDescriptor(d.ready, e) ||
          Object.defineProperty(d.ready, e, {
            get: function () {
              return v(
                'You are getting ' +
                  e +
                  ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
              );
            },
            set: function () {
              return v(
                'You are setting ' +
                  e +
                  ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
              );
            },
          });
      });
    var Ta = !1,
      Ua = !1;
    d.onRuntimeInitialized = function () {
      Ta = !0;
      if (Ua && 'function' === typeof d.onModuleLoaded) d.onModuleLoaded(d);
    };
    d.onModuleParsed = function () {
      Ua = !0;
      if (Ta && 'function' === typeof d.onModuleLoaded) d.onModuleLoaded(d);
    };
    d.isVersionSupported = function (e) {
      if ('string' !== typeof e) return !1;
      e = e.split('.');
      return 2 > e.length || 3 < e.length
        ? !1
        : 1 == e[0] && 0 <= e[1] && 5 >= e[1]
        ? !0
        : 0 != e[0] || 10 < e[1]
        ? !1
        : !0;
    };
    var Va = Object.assign({}, d),
      Ga = 'object' == typeof window,
      ha = 'function' == typeof importScripts,
      wa =
        'object' == typeof process &&
        'object' == typeof process.versions &&
        'string' == typeof process.versions.node,
      Wa = !Ga && !wa && !ha;
    if (d.ENVIRONMENT)
      throw Error(
        'Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)'
      );
    var R = '';
    if (wa) {
      if ('undefined' == typeof process || !process.release || 'node' !== process.release.name)
        throw Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        );
      var Xa = require('fs'),
        Ka = require('path');
      R = ha ? Ka.dirname(R) + '/' : __dirname + '/';
      var La = function (e, a) {
        e = B(e) ? new URL(e) : Ka.normalize(e);
        return Xa.readFileSync(e, a ? void 0 : 'utf8');
      };
      var na = function (e) {
        e = La(e, !0);
        e.buffer || (e = new Uint8Array(e));
        n(e.buffer);
        return e;
      };
      var va = function (e, a, b) {
        e = B(e) ? new URL(e) : Ka.normalize(e);
        Xa.readFile(e, function (c, f) {
          c ? b(c) : a(f.buffer);
        });
      };
      1 < process.argv.length && process.argv[1].replace(/\\/g, '/');
      process.argv.slice(2);
      d.inspect = function () {
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
        (La = function (e) {
          return read(e);
        });
      na = function (e) {
        if ('function' == typeof readbuffer) return new Uint8Array(readbuffer(e));
        e = read(e, 'binary');
        n('object' == typeof e);
        return e;
      };
      va = function (e, a, b) {
        setTimeout(function () {
          return a(na(e));
        }, 0);
      };
      'undefined' == typeof clearTimeout && (globalThis.clearTimeout = function (e) {});
      'undefined' != typeof print &&
        ('undefined' == typeof console && (console = {}),
        (console.log = print),
        (console.warn = console.error = 'undefined' != typeof printErr ? printErr : print));
    } else if (Ga || ha) {
      ha
        ? (R = self.location.href)
        : 'undefined' != typeof document &&
          document.currentScript &&
          (R = document.currentScript.src);
      l && (R = l);
      R = 0 !== R.indexOf('blob:') ? R.substr(0, R.replace(/[?#].*/, '').lastIndexOf('/') + 1) : '';
      if ('object' != typeof window && 'function' != typeof importScripts)
        throw Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        );
      La = function (e) {
        var a = new XMLHttpRequest();
        a.open('GET', e, !1);
        a.send(null);
        return a.responseText;
      };
      ha &&
        (na = function (e) {
          var a = new XMLHttpRequest();
          a.open('GET', e, !1);
          a.responseType = 'arraybuffer';
          a.send(null);
          return new Uint8Array(a.response);
        });
      va = function (e, a, b) {
        var c = new XMLHttpRequest();
        c.open('GET', e, !0);
        c.responseType = 'arraybuffer';
        c.onload = function () {
          200 == c.status || (0 == c.status && c.response) ? a(c.response) : b();
        };
        c.onerror = b;
        c.send(null);
      };
    } else throw Error('environment detection error');
    var ob = d.print || console.log.bind(console),
      J = d.printErr || console.warn.bind(console);
    Object.assign(d, Va);
    Va = null;
    (function (e) {
      Object.getOwnPropertyDescriptor(d, e) &&
        v('`Module.' + e + '` was supplied but `' + e + '` not included in INCOMING_MODULE_JS_API');
    })('fetchSettings');
    G('arguments', 'arguments_');
    G('thisProgram', 'thisProgram');
    G('quit', 'quit_');
    n(
      'undefined' == typeof d.memoryInitializerPrefixURL,
      'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead'
    );
    n(
      'undefined' == typeof d.pthreadMainPrefixURL,
      'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead'
    );
    n(
      'undefined' == typeof d.cdInitializerPrefixURL,
      'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead'
    );
    n(
      'undefined' == typeof d.filePackagePrefixURL,
      'Module.filePackagePrefixURL option was removed, use Module.locateFile instead'
    );
    n('undefined' == typeof d.read, 'Module.read option was removed (modify read_ in JS)');
    n(
      'undefined' == typeof d.readAsync,
      'Module.readAsync option was removed (modify readAsync in JS)'
    );
    n(
      'undefined' == typeof d.readBinary,
      'Module.readBinary option was removed (modify readBinary in JS)'
    );
    n(
      'undefined' == typeof d.setWindowTitle,
      'Module.setWindowTitle option was removed (modify setWindowTitle in JS)'
    );
    n(
      'undefined' == typeof d.TOTAL_MEMORY,
      'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY'
    );
    G('read', 'read_');
    G('readAsync', 'readAsync');
    G('readBinary', 'readBinary');
    G('setWindowTitle', 'setWindowTitle');
    n(
      !Wa,
      "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable."
    );
    var ma;
    d.wasmBinary && (ma = d.wasmBinary);
    G('wasmBinary', 'wasmBinary');
    G('noExitRuntime', 'noExitRuntime');
    'object' != typeof WebAssembly && v('no native wasm support detected');
    var ja,
      sa = !1,
      Ya = 'undefined' != typeof TextDecoder ? new TextDecoder('utf8') : void 0,
      U,
      ra,
      Da,
      X,
      H,
      Ea;
    n(!d.STACK_SIZE, 'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time');
    n(
      'undefined' != typeof Int32Array &&
        'undefined' !== typeof Float64Array &&
        void 0 != Int32Array.prototype.subarray &&
        void 0 != Int32Array.prototype.set,
      'JS engine does not provide full typed array support'
    );
    n(
      !d.wasmMemory,
      'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally'
    );
    n(
      !d.INITIAL_MEMORY,
      'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically'
    );
    var Za;
    (function () {
      var e = new Int16Array(1),
        a = new Int8Array(e.buffer);
      e[0] = 25459;
      if (115 !== a[0] || 99 !== a[1])
        throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
    })();
    var Sa = [],
      Ia = [],
      Qa = [],
      ua = !1;
    n(
      Math.imul,
      'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    n(
      Math.fround,
      'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    n(
      Math.clz32,
      'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    n(
      Math.trunc,
      'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    var Z = 0,
      aa = null,
      qa = null,
      la = {},
      P = {
        error: function () {
          v(
            'Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM'
          );
        },
        init: function () {
          P.error();
        },
        createDataFile: function () {
          P.error();
        },
        createPreloadedFile: function () {
          P.error();
        },
        createLazyFile: function () {
          P.error();
        },
        open: function () {
          P.error();
        },
        mkdev: function () {
          P.error();
        },
        registerDevice: function () {
          P.error();
        },
        analyzePath: function () {
          P.error();
        },
        loadFilesFromDB: function () {
          P.error();
        },
        ErrnoError: function () {
          P.error();
        },
      };
    d.FS_createDataFile = P.createDataFile;
    d.FS_createPreloadedFile = P.createPreloadedFile;
    var K = 'draco_encoder.wasm';
    K.startsWith('data:application/octet-stream;base64,') || (K = m(K));
    (function (e, a) {
      'undefined' !== typeof globalThis &&
        Object.defineProperty(globalThis, e, {
          configurable: !0,
          get: function () {
            Y('`' + e + '` is not longer defined by emscripten. ' + a);
          },
        });
    })('buffer', 'Please use HEAP8.buffer or wasmMemory.buffer');
    var pb = 0,
      qb = [null, [], []],
      ab = {
        __cxa_throw: function (e, a, b) {
          new bb(e).init(a, b);
          pb++;
          throw (
            e +
            ' - Exception catching is disabled, this exception cannot be caught. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.'
          );
        },
        abort: function () {
          v('native code called abort()');
        },
        emscripten_memcpy_big: function (e, a, b) {
          ra.copyWithin(e, a, a + b);
        },
        emscripten_resize_heap: function (e) {
          var a = ra.length;
          e >>>= 0;
          n(e > a);
          if (2147483648 < e)
            return (
              J(
                'Cannot enlarge memory, asked to go up to ' +
                  e +
                  ' bytes, but the limit is 2147483648 bytes!'
              ),
              !1
            );
          for (var b = 1; 4 >= b; b *= 2) {
            var c = a * (1 + 0.2 / b);
            c = Math.min(c, e + 100663296);
            var f = Math;
            c = Math.max(e, c);
            f = f.min.call(f, 2147483648, c + ((65536 - (c % 65536)) % 65536));
            a: {
              c = f;
              var g = ja.buffer;
              try {
                ja.grow((c - g.byteLength + 65535) >>> 16);
                q();
                var t = 1;
                break a;
              } catch (Aa) {
                J(
                  'emscripten_realloc_buffer: Attempted to grow heap from ' +
                    g.byteLength +
                    ' bytes to ' +
                    c +
                    ' bytes, but got error: ' +
                    Aa
                );
              }
              t = void 0;
            }
            if (t) return !0;
          }
          J('Failed to grow the heap from ' + a + ' bytes to ' + f + ' bytes, not enough memory!');
          return !1;
        },
        fd_close: function (e) {
          v('fd_close called without SYSCALLS_REQUIRE_FILESYSTEM');
        },
        fd_seek: function (e, a, b, c, f) {
          return 70;
        },
        fd_write: function (e, a, b, c) {
          for (var f = 0, g = 0; g < b; g++) {
            var t = H[a >> 2],
              Aa = H[(a + 4) >> 2];
            a += 8;
            for (var Ma = 0; Ma < Aa; Ma++) {
              var Ba = e,
                O = ra[t + Ma],
                Ca = qb[Ba];
              n(Ca);
              if (0 === O || 10 === O) {
                Ba = 1 === Ba ? ob : J;
                O = Ca;
                for (var W = 0, ca = W + void 0, ia = W; O[ia] && !(ia >= ca); ) ++ia;
                if (16 < ia - W && O.buffer && Ya) O = Ya.decode(O.subarray(W, ia));
                else {
                  for (ca = ''; W < ia; ) {
                    var I = O[W++];
                    if (I & 128) {
                      var Na = O[W++] & 63;
                      if (192 == (I & 224)) ca += String.fromCharCode(((I & 31) << 6) | Na);
                      else {
                        var $a = O[W++] & 63;
                        224 == (I & 240)
                          ? (I = ((I & 15) << 12) | (Na << 6) | $a)
                          : (240 != (I & 248) &&
                              Y(
                                'Invalid UTF-8 leading byte ' +
                                  ka(I) +
                                  ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!'
                              ),
                            (I = ((I & 7) << 18) | (Na << 12) | ($a << 6) | (O[W++] & 63)));
                        65536 > I
                          ? (ca += String.fromCharCode(I))
                          : ((I -= 65536),
                            (ca += String.fromCharCode(55296 | (I >> 10), 56320 | (I & 1023))));
                      }
                    } else ca += String.fromCharCode(I);
                  }
                  O = ca;
                }
                Ba(O);
                Ca.length = 0;
              } else Ca.push(O);
            }
            f += Aa;
          }
          H[c >> 2] = f;
          return 0;
        },
      };
    (function () {
      function e(g, t) {
        d.asm = g.exports;
        ja = d.asm.memory;
        n(ja, 'memory not found in wasm exports');
        q();
        Za = d.asm.__indirect_function_table;
        n(Za, 'table not found in wasm exports');
        Ia.unshift(d.asm.__wasm_call_ctors);
        Z--;
        d.monitorRunDependencies && d.monitorRunDependencies(Z);
        n(la['wasm-instantiate']);
        delete la['wasm-instantiate'];
        0 == Z &&
          (null !== aa && (clearInterval(aa), (aa = null)), qa && ((g = qa), (qa = null), g()));
      }
      function a(g) {
        n(
          d === f,
          'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?'
        );
        f = null;
        e(g.instance);
      }
      function b(g) {
        return Q()
          .then(function (t) {
            return WebAssembly.instantiate(t, c);
          })
          .then(function (t) {
            return t;
          })
          .then(g, function (t) {
            J('failed to asynchronously prepare wasm: ' + t);
            B(K) &&
              J(
                'warning: Loading from a file URI (' +
                  K +
                  ') is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing'
              );
            v(t);
          });
      }
      var c = { env: ab, wasi_snapshot_preview1: ab };
      u('wasm-instantiate');
      var f = d;
      if (d.instantiateWasm)
        try {
          return d.instantiateWasm(c, e);
        } catch (g) {
          J('Module.instantiateWasm callback failed with error: ' + g), ta(g);
        }
      (function () {
        return ma ||
          'function' != typeof WebAssembly.instantiateStreaming ||
          K.startsWith('data:application/octet-stream;base64,') ||
          B(K) ||
          wa ||
          'function' != typeof fetch
          ? b(a)
          : fetch(K, { credentials: 'same-origin' }).then(function (g) {
              return WebAssembly.instantiateStreaming(g, c).then(a, function (t) {
                J('wasm streaming compile failed: ' + t);
                J('falling back to ArrayBuffer instantiation');
                return b(a);
              });
            });
      })().catch(ta);
      return {};
    })();
    h('__wasm_call_ctors');
    var rb = (d._emscripten_bind_VoidPtr___destroy___0 = h(
        'emscripten_bind_VoidPtr___destroy___0'
      )),
      db = (d._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = h(
        'emscripten_bind_GeometryAttribute_GeometryAttribute_0'
      )),
      sb = (d._emscripten_bind_GeometryAttribute___destroy___0 = h(
        'emscripten_bind_GeometryAttribute___destroy___0'
      )),
      eb = (d._emscripten_bind_PointAttribute_PointAttribute_0 = h(
        'emscripten_bind_PointAttribute_PointAttribute_0'
      )),
      tb = (d._emscripten_bind_PointAttribute_size_0 = h('emscripten_bind_PointAttribute_size_0')),
      ub = (d._emscripten_bind_PointAttribute_attribute_type_0 = h(
        'emscripten_bind_PointAttribute_attribute_type_0'
      )),
      vb = (d._emscripten_bind_PointAttribute_data_type_0 = h(
        'emscripten_bind_PointAttribute_data_type_0'
      )),
      wb = (d._emscripten_bind_PointAttribute_num_components_0 = h(
        'emscripten_bind_PointAttribute_num_components_0'
      )),
      xb = (d._emscripten_bind_PointAttribute_normalized_0 = h(
        'emscripten_bind_PointAttribute_normalized_0'
      )),
      yb = (d._emscripten_bind_PointAttribute_byte_stride_0 = h(
        'emscripten_bind_PointAttribute_byte_stride_0'
      )),
      zb = (d._emscripten_bind_PointAttribute_byte_offset_0 = h(
        'emscripten_bind_PointAttribute_byte_offset_0'
      )),
      Ab = (d._emscripten_bind_PointAttribute_unique_id_0 = h(
        'emscripten_bind_PointAttribute_unique_id_0'
      )),
      Bb = (d._emscripten_bind_PointAttribute___destroy___0 = h(
        'emscripten_bind_PointAttribute___destroy___0'
      )),
      fb = (d._emscripten_bind_PointCloud_PointCloud_0 = h(
        'emscripten_bind_PointCloud_PointCloud_0'
      )),
      Cb = (d._emscripten_bind_PointCloud_num_attributes_0 = h(
        'emscripten_bind_PointCloud_num_attributes_0'
      )),
      Db = (d._emscripten_bind_PointCloud_num_points_0 = h(
        'emscripten_bind_PointCloud_num_points_0'
      )),
      Eb = (d._emscripten_bind_PointCloud___destroy___0 = h(
        'emscripten_bind_PointCloud___destroy___0'
      )),
      gb = (d._emscripten_bind_Mesh_Mesh_0 = h('emscripten_bind_Mesh_Mesh_0')),
      Fb = (d._emscripten_bind_Mesh_num_faces_0 = h('emscripten_bind_Mesh_num_faces_0')),
      Gb = (d._emscripten_bind_Mesh_num_attributes_0 = h('emscripten_bind_Mesh_num_attributes_0')),
      Hb = (d._emscripten_bind_Mesh_num_points_0 = h('emscripten_bind_Mesh_num_points_0')),
      Ib = (d._emscripten_bind_Mesh_set_num_points_1 = h('emscripten_bind_Mesh_set_num_points_1')),
      Jb = (d._emscripten_bind_Mesh___destroy___0 = h('emscripten_bind_Mesh___destroy___0')),
      hb = (d._emscripten_bind_Metadata_Metadata_0 = h('emscripten_bind_Metadata_Metadata_0')),
      Kb = (d._emscripten_bind_Metadata___destroy___0 = h(
        'emscripten_bind_Metadata___destroy___0'
      )),
      ib = (d._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = h(
        'emscripten_bind_DracoInt8Array_DracoInt8Array_0'
      )),
      Lb = (d._emscripten_bind_DracoInt8Array_GetValue_1 = h(
        'emscripten_bind_DracoInt8Array_GetValue_1'
      )),
      Mb = (d._emscripten_bind_DracoInt8Array_size_0 = h('emscripten_bind_DracoInt8Array_size_0')),
      Nb = (d._emscripten_bind_DracoInt8Array___destroy___0 = h(
        'emscripten_bind_DracoInt8Array___destroy___0'
      )),
      jb = (d._emscripten_bind_MetadataBuilder_MetadataBuilder_0 = h(
        'emscripten_bind_MetadataBuilder_MetadataBuilder_0'
      )),
      Ob = (d._emscripten_bind_MetadataBuilder_AddStringEntry_3 = h(
        'emscripten_bind_MetadataBuilder_AddStringEntry_3'
      )),
      Pb = (d._emscripten_bind_MetadataBuilder_AddIntEntry_3 = h(
        'emscripten_bind_MetadataBuilder_AddIntEntry_3'
      )),
      Qb = (d._emscripten_bind_MetadataBuilder_AddIntEntryArray_4 = h(
        'emscripten_bind_MetadataBuilder_AddIntEntryArray_4'
      )),
      Rb = (d._emscripten_bind_MetadataBuilder_AddDoubleEntry_3 = h(
        'emscripten_bind_MetadataBuilder_AddDoubleEntry_3'
      )),
      Sb = (d._emscripten_bind_MetadataBuilder___destroy___0 = h(
        'emscripten_bind_MetadataBuilder___destroy___0'
      )),
      kb = (d._emscripten_bind_PointCloudBuilder_PointCloudBuilder_0 = h(
        'emscripten_bind_PointCloudBuilder_PointCloudBuilder_0'
      )),
      Tb = (d._emscripten_bind_PointCloudBuilder_AddFloatAttribute_5 = h(
        'emscripten_bind_PointCloudBuilder_AddFloatAttribute_5'
      )),
      Ub = (d._emscripten_bind_PointCloudBuilder_AddInt8Attribute_5 = h(
        'emscripten_bind_PointCloudBuilder_AddInt8Attribute_5'
      )),
      Vb = (d._emscripten_bind_PointCloudBuilder_AddUInt8Attribute_5 = h(
        'emscripten_bind_PointCloudBuilder_AddUInt8Attribute_5'
      )),
      Wb = (d._emscripten_bind_PointCloudBuilder_AddInt16Attribute_5 = h(
        'emscripten_bind_PointCloudBuilder_AddInt16Attribute_5'
      )),
      Xb = (d._emscripten_bind_PointCloudBuilder_AddUInt16Attribute_5 = h(
        'emscripten_bind_PointCloudBuilder_AddUInt16Attribute_5'
      )),
      Yb = (d._emscripten_bind_PointCloudBuilder_AddInt32Attribute_5 = h(
        'emscripten_bind_PointCloudBuilder_AddInt32Attribute_5'
      )),
      Zb = (d._emscripten_bind_PointCloudBuilder_AddUInt32Attribute_5 = h(
        'emscripten_bind_PointCloudBuilder_AddUInt32Attribute_5'
      )),
      $b = (d._emscripten_bind_PointCloudBuilder_AddMetadata_2 = h(
        'emscripten_bind_PointCloudBuilder_AddMetadata_2'
      )),
      ac = (d._emscripten_bind_PointCloudBuilder_SetMetadataForAttribute_3 = h(
        'emscripten_bind_PointCloudBuilder_SetMetadataForAttribute_3'
      )),
      bc = (d._emscripten_bind_PointCloudBuilder_SetNormalizedFlagForAttribute_3 = h(
        'emscripten_bind_PointCloudBuilder_SetNormalizedFlagForAttribute_3'
      )),
      cc = (d._emscripten_bind_PointCloudBuilder___destroy___0 = h(
        'emscripten_bind_PointCloudBuilder___destroy___0'
      )),
      lb = (d._emscripten_bind_MeshBuilder_MeshBuilder_0 = h(
        'emscripten_bind_MeshBuilder_MeshBuilder_0'
      )),
      dc = (d._emscripten_bind_MeshBuilder_AddFacesToMesh_3 = h(
        'emscripten_bind_MeshBuilder_AddFacesToMesh_3'
      )),
      ec = (d._emscripten_bind_MeshBuilder_AddFloatAttributeToMesh_5 = h(
        'emscripten_bind_MeshBuilder_AddFloatAttributeToMesh_5'
      )),
      fc = (d._emscripten_bind_MeshBuilder_AddInt32AttributeToMesh_5 = h(
        'emscripten_bind_MeshBuilder_AddInt32AttributeToMesh_5'
      )),
      gc = (d._emscripten_bind_MeshBuilder_AddMetadataToMesh_2 = h(
        'emscripten_bind_MeshBuilder_AddMetadataToMesh_2'
      )),
      hc = (d._emscripten_bind_MeshBuilder_AddFloatAttribute_5 = h(
        'emscripten_bind_MeshBuilder_AddFloatAttribute_5'
      )),
      ic = (d._emscripten_bind_MeshBuilder_AddInt8Attribute_5 = h(
        'emscripten_bind_MeshBuilder_AddInt8Attribute_5'
      )),
      jc = (d._emscripten_bind_MeshBuilder_AddUInt8Attribute_5 = h(
        'emscripten_bind_MeshBuilder_AddUInt8Attribute_5'
      )),
      kc = (d._emscripten_bind_MeshBuilder_AddInt16Attribute_5 = h(
        'emscripten_bind_MeshBuilder_AddInt16Attribute_5'
      )),
      lc = (d._emscripten_bind_MeshBuilder_AddUInt16Attribute_5 = h(
        'emscripten_bind_MeshBuilder_AddUInt16Attribute_5'
      )),
      mc = (d._emscripten_bind_MeshBuilder_AddInt32Attribute_5 = h(
        'emscripten_bind_MeshBuilder_AddInt32Attribute_5'
      )),
      nc = (d._emscripten_bind_MeshBuilder_AddUInt32Attribute_5 = h(
        'emscripten_bind_MeshBuilder_AddUInt32Attribute_5'
      )),
      oc = (d._emscripten_bind_MeshBuilder_AddMetadata_2 = h(
        'emscripten_bind_MeshBuilder_AddMetadata_2'
      )),
      pc = (d._emscripten_bind_MeshBuilder_SetMetadataForAttribute_3 = h(
        'emscripten_bind_MeshBuilder_SetMetadataForAttribute_3'
      )),
      qc = (d._emscripten_bind_MeshBuilder_SetNormalizedFlagForAttribute_3 = h(
        'emscripten_bind_MeshBuilder_SetNormalizedFlagForAttribute_3'
      )),
      rc = (d._emscripten_bind_MeshBuilder___destroy___0 = h(
        'emscripten_bind_MeshBuilder___destroy___0'
      )),
      mb = (d._emscripten_bind_Encoder_Encoder_0 = h('emscripten_bind_Encoder_Encoder_0')),
      sc = (d._emscripten_bind_Encoder_SetEncodingMethod_1 = h(
        'emscripten_bind_Encoder_SetEncodingMethod_1'
      )),
      tc = (d._emscripten_bind_Encoder_SetAttributeQuantization_2 = h(
        'emscripten_bind_Encoder_SetAttributeQuantization_2'
      )),
      uc = (d._emscripten_bind_Encoder_SetAttributeExplicitQuantization_5 = h(
        'emscripten_bind_Encoder_SetAttributeExplicitQuantization_5'
      )),
      vc = (d._emscripten_bind_Encoder_SetSpeedOptions_2 = h(
        'emscripten_bind_Encoder_SetSpeedOptions_2'
      )),
      wc = (d._emscripten_bind_Encoder_SetTrackEncodedProperties_1 = h(
        'emscripten_bind_Encoder_SetTrackEncodedProperties_1'
      )),
      xc = (d._emscripten_bind_Encoder_EncodeMeshToDracoBuffer_2 = h(
        'emscripten_bind_Encoder_EncodeMeshToDracoBuffer_2'
      )),
      yc = (d._emscripten_bind_Encoder_EncodePointCloudToDracoBuffer_3 = h(
        'emscripten_bind_Encoder_EncodePointCloudToDracoBuffer_3'
      )),
      zc = (d._emscripten_bind_Encoder_GetNumberOfEncodedPoints_0 = h(
        'emscripten_bind_Encoder_GetNumberOfEncodedPoints_0'
      )),
      Ac = (d._emscripten_bind_Encoder_GetNumberOfEncodedFaces_0 = h(
        'emscripten_bind_Encoder_GetNumberOfEncodedFaces_0'
      )),
      Bc = (d._emscripten_bind_Encoder___destroy___0 = h('emscripten_bind_Encoder___destroy___0')),
      nb = (d._emscripten_bind_ExpertEncoder_ExpertEncoder_1 = h(
        'emscripten_bind_ExpertEncoder_ExpertEncoder_1'
      )),
      Cc = (d._emscripten_bind_ExpertEncoder_SetEncodingMethod_1 = h(
        'emscripten_bind_ExpertEncoder_SetEncodingMethod_1'
      )),
      Dc = (d._emscripten_bind_ExpertEncoder_SetAttributeQuantization_2 = h(
        'emscripten_bind_ExpertEncoder_SetAttributeQuantization_2'
      )),
      Ec = (d._emscripten_bind_ExpertEncoder_SetAttributeExplicitQuantization_5 = h(
        'emscripten_bind_ExpertEncoder_SetAttributeExplicitQuantization_5'
      )),
      Fc = (d._emscripten_bind_ExpertEncoder_SetSpeedOptions_2 = h(
        'emscripten_bind_ExpertEncoder_SetSpeedOptions_2'
      )),
      Gc = (d._emscripten_bind_ExpertEncoder_SetTrackEncodedProperties_1 = h(
        'emscripten_bind_ExpertEncoder_SetTrackEncodedProperties_1'
      )),
      Hc = (d._emscripten_bind_ExpertEncoder_EncodeToDracoBuffer_2 = h(
        'emscripten_bind_ExpertEncoder_EncodeToDracoBuffer_2'
      )),
      Ic = (d._emscripten_bind_ExpertEncoder_GetNumberOfEncodedPoints_0 = h(
        'emscripten_bind_ExpertEncoder_GetNumberOfEncodedPoints_0'
      )),
      Jc = (d._emscripten_bind_ExpertEncoder_GetNumberOfEncodedFaces_0 = h(
        'emscripten_bind_ExpertEncoder_GetNumberOfEncodedFaces_0'
      )),
      Kc = (d._emscripten_bind_ExpertEncoder___destroy___0 = h(
        'emscripten_bind_ExpertEncoder___destroy___0'
      )),
      Lc = (d._emscripten_enum_draco_GeometryAttribute_Type_INVALID = h(
        'emscripten_enum_draco_GeometryAttribute_Type_INVALID'
      )),
      Mc = (d._emscripten_enum_draco_GeometryAttribute_Type_POSITION = h(
        'emscripten_enum_draco_GeometryAttribute_Type_POSITION'
      )),
      Nc = (d._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = h(
        'emscripten_enum_draco_GeometryAttribute_Type_NORMAL'
      )),
      Oc = (d._emscripten_enum_draco_GeometryAttribute_Type_COLOR = h(
        'emscripten_enum_draco_GeometryAttribute_Type_COLOR'
      )),
      Pc = (d._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = h(
        'emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD'
      )),
      Qc = (d._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = h(
        'emscripten_enum_draco_GeometryAttribute_Type_GENERIC'
      )),
      Rc = (d._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = h(
        'emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE'
      )),
      Sc = (d._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = h(
        'emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD'
      )),
      Tc = (d._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = h(
        'emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH'
      )),
      Uc = (d._emscripten_enum_draco_MeshEncoderMethod_MESH_SEQUENTIAL_ENCODING = h(
        'emscripten_enum_draco_MeshEncoderMethod_MESH_SEQUENTIAL_ENCODING'
      )),
      Vc = (d._emscripten_enum_draco_MeshEncoderMethod_MESH_EDGEBREAKER_ENCODING = h(
        'emscripten_enum_draco_MeshEncoderMethod_MESH_EDGEBREAKER_ENCODING'
      ));
    h('__errno_location');
    d._fflush = h('fflush');
    d._malloc = h('malloc');
    d._free = h('free');
    var Ra = function () {
        return (Ra = d.asm.emscripten_stack_init).apply(null, arguments);
      },
      Fa = function () {
        return (Fa = d.asm.emscripten_stack_get_end).apply(null, arguments);
      };
    h('stackSave');
    h('stackRestore');
    h('stackAlloc');
    var cb = h('__cxa_is_pointer_type');
    d.dynCall_jiji = h('dynCall_jiji');
    d.___start_em_js = 19268;
    d.___stop_em_js = 19366;
    'zeroMemory stringToNewUTF8 exitJS setErrNo inetPton4 inetNtop4 inetPton6 inetNtop6 readSockaddr writeSockaddr getHostByName getRandomDevice traverseStack convertPCtoSourceLocation readEmAsmArgs jstoi_q jstoi_s getExecutableName listenOnce autoResumeAudioContext dynCallLegacy getDynCaller dynCall handleException runtimeKeepalivePush runtimeKeepalivePop callUserCallback maybeExit safeSetTimeout asmjsMangle asyncLoad alignMemory mmapAlloc handleAllocator getNativeTypeSize STACK_SIZE STACK_ALIGN POINTER_SIZE ASSERTIONS writeI53ToI64 writeI53ToI64Clamped writeI53ToI64Signaling writeI53ToU64Clamped writeI53ToU64Signaling readI53FromI64 readI53FromU64 convertI32PairToI53 convertU32PairToI53 getCFunc ccall cwrap uleb128Encode sigToWasmTypes generateFuncType convertJsFunctionToWasm getEmptyTableSlot updateTableMap getFunctionAddress addFunction removeFunction reallyNegative unSign strLen reSign formatString intArrayToString AsciiToString stringToAscii UTF16ToString stringToUTF16 lengthBytesUTF16 UTF32ToString stringToUTF32 lengthBytesUTF32 allocateUTF8 allocateUTF8OnStack writeStringToMemory writeArrayToMemory writeAsciiToMemory getSocketFromFD getSocketAddress registerKeyEventCallback maybeCStringToJsString findEventTarget findCanvasEventTarget getBoundingClientRect fillMouseEventData registerMouseEventCallback registerWheelEventCallback registerUiEventCallback registerFocusEventCallback fillDeviceOrientationEventData registerDeviceOrientationEventCallback fillDeviceMotionEventData registerDeviceMotionEventCallback screenOrientation fillOrientationChangeEventData registerOrientationChangeEventCallback fillFullscreenChangeEventData registerFullscreenChangeEventCallback JSEvents_requestFullscreen JSEvents_resizeCanvasForFullscreen registerRestoreOldStyle hideEverythingExceptGivenElement restoreHiddenElements setLetterbox softFullscreenResizeWebGLRenderTarget doRequestFullscreen fillPointerlockChangeEventData registerPointerlockChangeEventCallback registerPointerlockErrorEventCallback requestPointerLock fillVisibilityChangeEventData registerVisibilityChangeEventCallback registerTouchEventCallback fillGamepadEventData registerGamepadEventCallback registerBeforeUnloadEventCallback fillBatteryEventData battery registerBatteryEventCallback setCanvasElementSize getCanvasElementSize demangle demangleAll jsStackTrace stackTrace getEnvStrings checkWasiClock createDyncallWrapper setImmediateWrapped clearImmediateWrapped polyfillSetImmediate newNativePromise getPromise exception_addRef exception_decRef setMainLoop heapObjectForWebGLType heapAccessShiftForWebGLHeap emscriptenWebGLGet computeUnpackAlignedImageSize emscriptenWebGLGetTexPixelData emscriptenWebGLGetUniform webglGetUniformLocation webglPrepareUniformLocationsBeforeFirstUse webglGetLeftBracePos emscriptenWebGLGetVertexAttrib writeGLArray SDL_unicode SDL_ttfContext SDL_audio GLFW_Window runAndAbortIfError ALLOC_NORMAL ALLOC_STACK allocate'
      .split(' ')
      .forEach(function (e) {
        'undefined' === typeof globalThis ||
          Object.getOwnPropertyDescriptor(globalThis, e) ||
          Object.defineProperty(globalThis, e, {
            configurable: !0,
            get: function () {
              var a =
                  '`' +
                  e +
                  '` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line',
                b = e;
              b.startsWith('_') || (b = '$' + e);
              a += ' (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=' + b + ')';
              da(e) &&
                (a +=
                  '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you');
              Y(a);
            },
          });
        ea(e);
      });
    'run UTF8ArrayToString UTF8ToString stringToUTF8Array stringToUTF8 lengthBytesUTF8 addOnPreRun addOnInit addOnPreMain addOnExit addOnPostRun addRunDependency removeRunDependency FS_createFolder FS_createPath FS_createDataFile FS_createPreloadedFile FS_createLazyFile FS_createLink FS_createDevice FS_unlink out err callMain abort keepRuntimeAlive wasmMemory stackAlloc stackSave stackRestore getTempRet0 setTempRet0 writeStackCookie checkStackCookie ptrToString getHeapMax emscripten_realloc_buffer ENV ERRNO_CODES ERRNO_MESSAGES DNS Protocols Sockets timers warnOnce UNWIND_CACHE readEmAsmArgsArray convertI32PairToI53Checked freeTableIndexes functionsInTableMap setValue getValue PATH PATH_FS intArrayFromString UTF16Decoder SYSCALLS JSEvents specialHTMLTargets currentFullscreenStrategy restoreOldWindowedStyle ExitStatus flush_NO_FILESYSTEM dlopenMissingError promiseMap uncaughtExceptionCount exceptionLast exceptionCaught ExceptionInfo Browser wget tempFixedLengthArray miniTempWebGLFloatBuffers GL AL SDL SDL_gfx GLUT EGL GLFW GLEW IDBStore'
      .split(' ')
      .forEach(ea);
    var xa;
    qa = function a() {
      xa || Oa();
      xa || (qa = a);
    };
    if (d.preInit)
      for ('function' == typeof d.preInit && (d.preInit = [d.preInit]); 0 < d.preInit.length; )
        d.preInit.pop()();
    Oa();
    C.prototype = Object.create(C.prototype);
    C.prototype.constructor = C;
    C.prototype.__class__ = C;
    C.__cache__ = {};
    d.WrapperObject = C;
    d.getCache = L;
    d.wrapPointer = Ja;
    d.castObject = function (a, b) {
      return Ja(a.ptr, b);
    };
    d.NULL = Ja(0);
    d.destroy = function (a) {
      if (!a.__destroy__) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
      a.__destroy__();
      delete L(a.__class__)[a.ptr];
    };
    d.compare = function (a, b) {
      return a.ptr === b.ptr;
    };
    d.getPointer = function (a) {
      return a.ptr;
    };
    d.getClass = function (a) {
      return a.__class__;
    };
    var r = {
      buffer: 0,
      size: 0,
      pos: 0,
      temps: [],
      needed: 0,
      prepare: function () {
        if (r.needed) {
          for (var a = 0; a < r.temps.length; a++) d._free(r.temps[a]);
          r.temps.length = 0;
          d._free(r.buffer);
          r.buffer = 0;
          r.size += r.needed;
          r.needed = 0;
        }
        r.buffer || ((r.size += 128), (r.buffer = d._malloc(r.size)), n(r.buffer));
        r.pos = 0;
      },
      alloc: function (a, b) {
        n(r.buffer);
        a = a.length * b.BYTES_PER_ELEMENT;
        a = (a + 7) & -8;
        r.pos + a >= r.size
          ? (n(0 < a), (r.needed += a), (b = d._malloc(a)), r.temps.push(b))
          : ((b = r.buffer + r.pos), (r.pos += a));
        return b;
      },
      copy: function (a, b, c) {
        c >>>= 0;
        switch (b.BYTES_PER_ELEMENT) {
          case 2:
            c >>>= 1;
            break;
          case 4:
            c >>>= 2;
            break;
          case 8:
            c >>>= 3;
        }
        for (var f = 0; f < a.length; f++) b[c + f] = a[f];
      },
    };
    V.prototype = Object.create(C.prototype);
    V.prototype.constructor = V;
    V.prototype.__class__ = V;
    V.__cache__ = {};
    d.VoidPtr = V;
    V.prototype.__destroy__ = V.prototype.__destroy__ = function () {
      rb(this.ptr);
    };
    S.prototype = Object.create(C.prototype);
    S.prototype.constructor = S;
    S.prototype.__class__ = S;
    S.__cache__ = {};
    d.GeometryAttribute = S;
    S.prototype.__destroy__ = S.prototype.__destroy__ = function () {
      sb(this.ptr);
    };
    z.prototype = Object.create(C.prototype);
    z.prototype.constructor = z;
    z.prototype.__class__ = z;
    z.__cache__ = {};
    d.PointAttribute = z;
    z.prototype.size = z.prototype.size = function () {
      return tb(this.ptr);
    };
    z.prototype.attribute_type = z.prototype.attribute_type = function () {
      return ub(this.ptr);
    };
    z.prototype.data_type = z.prototype.data_type = function () {
      return vb(this.ptr);
    };
    z.prototype.num_components = z.prototype.num_components = function () {
      return wb(this.ptr);
    };
    z.prototype.normalized = z.prototype.normalized = function () {
      return !!xb(this.ptr);
    };
    z.prototype.byte_stride = z.prototype.byte_stride = function () {
      return yb(this.ptr);
    };
    z.prototype.byte_offset = z.prototype.byte_offset = function () {
      return zb(this.ptr);
    };
    z.prototype.unique_id = z.prototype.unique_id = function () {
      return Ab(this.ptr);
    };
    z.prototype.__destroy__ = z.prototype.__destroy__ = function () {
      Bb(this.ptr);
    };
    M.prototype = Object.create(C.prototype);
    M.prototype.constructor = M;
    M.prototype.__class__ = M;
    M.__cache__ = {};
    d.PointCloud = M;
    M.prototype.num_attributes = M.prototype.num_attributes = function () {
      return Cb(this.ptr);
    };
    M.prototype.num_points = M.prototype.num_points = function () {
      return Db(this.ptr);
    };
    M.prototype.__destroy__ = M.prototype.__destroy__ = function () {
      Eb(this.ptr);
    };
    E.prototype = Object.create(C.prototype);
    E.prototype.constructor = E;
    E.prototype.__class__ = E;
    E.__cache__ = {};
    d.Mesh = E;
    E.prototype.num_faces = E.prototype.num_faces = function () {
      return Fb(this.ptr);
    };
    E.prototype.num_attributes = E.prototype.num_attributes = function () {
      return Gb(this.ptr);
    };
    E.prototype.num_points = E.prototype.num_points = function () {
      return Hb(this.ptr);
    };
    E.prototype.set_num_points = E.prototype.set_num_points = function (a) {
      var b = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      Ib(b, a);
    };
    E.prototype.__destroy__ = E.prototype.__destroy__ = function () {
      Jb(this.ptr);
    };
    T.prototype = Object.create(C.prototype);
    T.prototype.constructor = T;
    T.prototype.__class__ = T;
    T.__cache__ = {};
    d.Metadata = T;
    T.prototype.__destroy__ = T.prototype.__destroy__ = function () {
      Kb(this.ptr);
    };
    N.prototype = Object.create(C.prototype);
    N.prototype.constructor = N;
    N.prototype.__class__ = N;
    N.__cache__ = {};
    d.DracoInt8Array = N;
    N.prototype.GetValue = N.prototype.GetValue = function (a) {
      var b = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      return Lb(b, a);
    };
    N.prototype.size = N.prototype.size = function () {
      return Mb(this.ptr);
    };
    N.prototype.__destroy__ = N.prototype.__destroy__ = function () {
      Nb(this.ptr);
    };
    F.prototype = Object.create(C.prototype);
    F.prototype.constructor = F;
    F.prototype.__class__ = F;
    F.__cache__ = {};
    d.MetadataBuilder = F;
    F.prototype.AddStringEntry = F.prototype.AddStringEntry = function (a, b, c) {
      var f = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b = b && 'object' === typeof b ? b.ptr : oa(b);
      c = c && 'object' === typeof c ? c.ptr : oa(c);
      return !!Ob(f, a, b, c);
    };
    F.prototype.AddIntEntry = F.prototype.AddIntEntry = function (a, b, c) {
      var f = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b = b && 'object' === typeof b ? b.ptr : oa(b);
      c && 'object' === typeof c && (c = c.ptr);
      return !!Pb(f, a, b, c);
    };
    F.prototype.AddIntEntryArray = F.prototype.AddIntEntryArray = function (a, b, c, f) {
      var g = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b = b && 'object' === typeof b ? b.ptr : oa(b);
      'object' == typeof c && (c = ba(c));
      f && 'object' === typeof f && (f = f.ptr);
      return !!Qb(g, a, b, c, f);
    };
    F.prototype.AddDoubleEntry = F.prototype.AddDoubleEntry = function (a, b, c) {
      var f = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b = b && 'object' === typeof b ? b.ptr : oa(b);
      c && 'object' === typeof c && (c = c.ptr);
      return !!Rb(f, a, b, c);
    };
    F.prototype.__destroy__ = F.prototype.__destroy__ = function () {
      Sb(this.ptr);
    };
    x.prototype = Object.create(C.prototype);
    x.prototype.constructor = x;
    x.prototype.__class__ = x;
    x.__cache__ = {};
    d.PointCloudBuilder = x;
    x.prototype.AddFloatAttribute = x.prototype.AddFloatAttribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = pa(g));
      return Tb(t, a, b, c, f, g);
    };
    x.prototype.AddInt8Attribute = x.prototype.AddInt8Attribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = ya(g));
      return Ub(t, a, b, c, f, g);
    };
    x.prototype.AddUInt8Attribute = x.prototype.AddUInt8Attribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = ya(g));
      return Vb(t, a, b, c, f, g);
    };
    x.prototype.AddInt16Attribute = x.prototype.AddInt16Attribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = za(g));
      return Wb(t, a, b, c, f, g);
    };
    x.prototype.AddUInt16Attribute = x.prototype.AddUInt16Attribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = za(g));
      return Xb(t, a, b, c, f, g);
    };
    x.prototype.AddInt32Attribute = x.prototype.AddInt32Attribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = ba(g));
      return Yb(t, a, b, c, f, g);
    };
    x.prototype.AddUInt32Attribute = x.prototype.AddUInt32Attribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = ba(g));
      return Zb(t, a, b, c, f, g);
    };
    x.prototype.AddMetadata = x.prototype.AddMetadata = function (a, b) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      return !!$b(c, a, b);
    };
    x.prototype.SetMetadataForAttribute = x.prototype.SetMetadataForAttribute = function (a, b, c) {
      var f = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return !!ac(f, a, b, c);
    };
    x.prototype.SetNormalizedFlagForAttribute = x.prototype.SetNormalizedFlagForAttribute =
      function (a, b, c) {
        var f = this.ptr;
        a && 'object' === typeof a && (a = a.ptr);
        b && 'object' === typeof b && (b = b.ptr);
        c && 'object' === typeof c && (c = c.ptr);
        return !!bc(f, a, b, c);
      };
    x.prototype.__destroy__ = x.prototype.__destroy__ = function () {
      cc(this.ptr);
    };
    w.prototype = Object.create(C.prototype);
    w.prototype.constructor = w;
    w.prototype.__class__ = w;
    w.__cache__ = {};
    d.MeshBuilder = w;
    w.prototype.AddFacesToMesh = w.prototype.AddFacesToMesh = function (a, b, c) {
      var f = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      'object' == typeof c && (c = ba(c));
      return !!dc(f, a, b, c);
    };
    w.prototype.AddFloatAttributeToMesh = w.prototype.AddFloatAttributeToMesh = function (
      a,
      b,
      c,
      f,
      g
    ) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = pa(g));
      return ec(t, a, b, c, f, g);
    };
    w.prototype.AddInt32AttributeToMesh = w.prototype.AddInt32AttributeToMesh = function (
      a,
      b,
      c,
      f,
      g
    ) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = ba(g));
      return fc(t, a, b, c, f, g);
    };
    w.prototype.AddMetadataToMesh = w.prototype.AddMetadataToMesh = function (a, b) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      return !!gc(c, a, b);
    };
    w.prototype.AddFloatAttribute = w.prototype.AddFloatAttribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = pa(g));
      return hc(t, a, b, c, f, g);
    };
    w.prototype.AddInt8Attribute = w.prototype.AddInt8Attribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = ya(g));
      return ic(t, a, b, c, f, g);
    };
    w.prototype.AddUInt8Attribute = w.prototype.AddUInt8Attribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = ya(g));
      return jc(t, a, b, c, f, g);
    };
    w.prototype.AddInt16Attribute = w.prototype.AddInt16Attribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = za(g));
      return kc(t, a, b, c, f, g);
    };
    w.prototype.AddUInt16Attribute = w.prototype.AddUInt16Attribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = za(g));
      return lc(t, a, b, c, f, g);
    };
    w.prototype.AddInt32Attribute = w.prototype.AddInt32Attribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = ba(g));
      return mc(t, a, b, c, f, g);
    };
    w.prototype.AddUInt32Attribute = w.prototype.AddUInt32Attribute = function (a, b, c, f, g) {
      var t = this.ptr;
      r.prepare();
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      'object' == typeof g && (g = ba(g));
      return nc(t, a, b, c, f, g);
    };
    w.prototype.AddMetadata = w.prototype.AddMetadata = function (a, b) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      return !!oc(c, a, b);
    };
    w.prototype.SetMetadataForAttribute = w.prototype.SetMetadataForAttribute = function (a, b, c) {
      var f = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return !!pc(f, a, b, c);
    };
    w.prototype.SetNormalizedFlagForAttribute = w.prototype.SetNormalizedFlagForAttribute =
      function (a, b, c) {
        var f = this.ptr;
        a && 'object' === typeof a && (a = a.ptr);
        b && 'object' === typeof b && (b = b.ptr);
        c && 'object' === typeof c && (c = c.ptr);
        return !!qc(f, a, b, c);
      };
    w.prototype.__destroy__ = w.prototype.__destroy__ = function () {
      rc(this.ptr);
    };
    y.prototype = Object.create(C.prototype);
    y.prototype.constructor = y;
    y.prototype.__class__ = y;
    y.__cache__ = {};
    d.Encoder = y;
    y.prototype.SetEncodingMethod = y.prototype.SetEncodingMethod = function (a) {
      var b = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      sc(b, a);
    };
    y.prototype.SetAttributeQuantization = y.prototype.SetAttributeQuantization = function (a, b) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      tc(c, a, b);
    };
    y.prototype.SetAttributeExplicitQuantization = y.prototype.SetAttributeExplicitQuantization =
      function (a, b, c, f, g) {
        var t = this.ptr;
        r.prepare();
        a && 'object' === typeof a && (a = a.ptr);
        b && 'object' === typeof b && (b = b.ptr);
        c && 'object' === typeof c && (c = c.ptr);
        'object' == typeof f && (f = pa(f));
        g && 'object' === typeof g && (g = g.ptr);
        uc(t, a, b, c, f, g);
      };
    y.prototype.SetSpeedOptions = y.prototype.SetSpeedOptions = function (a, b) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      vc(c, a, b);
    };
    y.prototype.SetTrackEncodedProperties = y.prototype.SetTrackEncodedProperties = function (a) {
      var b = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      wc(b, a);
    };
    y.prototype.EncodeMeshToDracoBuffer = y.prototype.EncodeMeshToDracoBuffer = function (a, b) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      return xc(c, a, b);
    };
    y.prototype.EncodePointCloudToDracoBuffer = y.prototype.EncodePointCloudToDracoBuffer =
      function (a, b, c) {
        var f = this.ptr;
        a && 'object' === typeof a && (a = a.ptr);
        b && 'object' === typeof b && (b = b.ptr);
        c && 'object' === typeof c && (c = c.ptr);
        return yc(f, a, b, c);
      };
    y.prototype.GetNumberOfEncodedPoints = y.prototype.GetNumberOfEncodedPoints = function () {
      return zc(this.ptr);
    };
    y.prototype.GetNumberOfEncodedFaces = y.prototype.GetNumberOfEncodedFaces = function () {
      return Ac(this.ptr);
    };
    y.prototype.__destroy__ = y.prototype.__destroy__ = function () {
      Bc(this.ptr);
    };
    A.prototype = Object.create(C.prototype);
    A.prototype.constructor = A;
    A.prototype.__class__ = A;
    A.__cache__ = {};
    d.ExpertEncoder = A;
    A.prototype.SetEncodingMethod = A.prototype.SetEncodingMethod = function (a) {
      var b = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      Cc(b, a);
    };
    A.prototype.SetAttributeQuantization = A.prototype.SetAttributeQuantization = function (a, b) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      Dc(c, a, b);
    };
    A.prototype.SetAttributeExplicitQuantization = A.prototype.SetAttributeExplicitQuantization =
      function (a, b, c, f, g) {
        var t = this.ptr;
        r.prepare();
        a && 'object' === typeof a && (a = a.ptr);
        b && 'object' === typeof b && (b = b.ptr);
        c && 'object' === typeof c && (c = c.ptr);
        'object' == typeof f && (f = pa(f));
        g && 'object' === typeof g && (g = g.ptr);
        Ec(t, a, b, c, f, g);
      };
    A.prototype.SetSpeedOptions = A.prototype.SetSpeedOptions = function (a, b) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      Fc(c, a, b);
    };
    A.prototype.SetTrackEncodedProperties = A.prototype.SetTrackEncodedProperties = function (a) {
      var b = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      Gc(b, a);
    };
    A.prototype.EncodeToDracoBuffer = A.prototype.EncodeToDracoBuffer = function (a, b) {
      var c = this.ptr;
      a && 'object' === typeof a && (a = a.ptr);
      b && 'object' === typeof b && (b = b.ptr);
      return Hc(c, a, b);
    };
    A.prototype.GetNumberOfEncodedPoints = A.prototype.GetNumberOfEncodedPoints = function () {
      return Ic(this.ptr);
    };
    A.prototype.GetNumberOfEncodedFaces = A.prototype.GetNumberOfEncodedFaces = function () {
      return Jc(this.ptr);
    };
    A.prototype.__destroy__ = A.prototype.__destroy__ = function () {
      Kc(this.ptr);
    };
    (function () {
      function a() {
        d.INVALID = Lc();
        d.POSITION = Mc();
        d.NORMAL = Nc();
        d.COLOR = Oc();
        d.TEX_COORD = Pc();
        d.GENERIC = Qc();
        d.INVALID_GEOMETRY_TYPE = Rc();
        d.POINT_CLOUD = Sc();
        d.TRIANGULAR_MESH = Tc();
        d.MESH_SEQUENTIAL_ENCODING = Uc();
        d.MESH_EDGEBREAKER_ENCODING = Vc();
      }
      ua ? a() : Ia.unshift(a);
    })();
    if ('function' === typeof d.onModuleParsed) d.onModuleParsed();
    return k.ready;
  };
})();
'object' === typeof exports && 'object' === typeof module
  ? (module.exports = DracoEncoderModule)
  : 'function' === typeof define && define.amd
  ? define([], function () {
      return DracoEncoderModule;
    })
  : 'object' === typeof exports && (exports.DracoEncoderModule = DracoEncoderModule);
