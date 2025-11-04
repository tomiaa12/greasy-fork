/// This func is called if the Request Checkbox is Enabled. You can modify the Request Data here before the request hits to the server
/// e.g. Add/Update/Remove: host, scheme, port, path, headers, queries, comment, color and body (json, form, plain-text, base64 encoded string)
///
/// Use global object `sharedState` to share data between Requests/Response from different scripts (e.g. sharedState.data = "My-Data")

// ^(http:\/\/localhost\.proxyman\.io:8080\/.*|https:\/\/test\.proxyman\.io\/.*)$

// https://docs.proxyman.com/troubleshooting/couldnt-see-any-request-from-localhost-server
let key = "Kt3DB1MJ7aCTv5ntKrHY7mJ4tgyFuCqa"
async function onRequest(context, url, request) {

  const rndKey = request.headers["X-RndKey"]
  
  if(typeof request.body === 'string' && request.headers['Content-Type'] === "text/enc;ver=1" && rndKey) {
    
    const decryptedData = await TextDecrypt.AESDecrypt(request.body, rndKey)
//     console.log('解密后的数据:', decryptedData)
    request.customPreviewerTabs.FormatBody = decryptedData
    // request.customPreviewerTabs["FormatBody"] = JSON.stringify(decryptedData, null, 2);
    console.log(url, '已解密 request')
  }
    
  return request;
}

/// This func is called if the Response Checkbox is Enabled. You can modify the Response Data here before it goes to the client
/// e.g. Add/Update/Remove: headers, statusCode, comment, color and body (json, plain-text, base64 encoded string)
///
async function onResponse(context, url, request, response) {

  const rndKey = request.headers["X-RndKey"]
  
  if(typeof response.body === 'string' && rndKey) {
//     console.log(response.body,'response.body')
    const decryptedData1 = await TextDecrypt.AESDecrypt(response.body, rndKey)
//     console.log('解密后的数据1:', decryptedData1)
    response.customPreviewerTabs.FormatBody = decryptedData1
    // response.customPreviewerTabs["FormatBody"] = JSON.stringify(decryptedData1, null, 2);

    console.log(url, '已解密 response')
  }

  // Done
  return response;
}

// ===== Proxyman 环境 Polyfills =====
// Buffer polyfill for atob fallback
if (typeof Buffer === 'undefined') {
    globalThis.Buffer = {
        from: function(str, encoding) {
            if (encoding === 'base64') {
                // 简单的 base64 到 binary 转换
                const binaryString = atob(str);
                return {
                    toString: function(enc) {
                        if (enc === 'binary') return binaryString;
                        return binaryString;
                    }
                };
            }
            return { toString: () => str };
        }
    };
}

// 确保 atob 存在
if (typeof atob === 'undefined') {
    globalThis.atob = function(base64) {
        // 确保输入是字符串
        if (typeof base64 !== 'string') {
            base64 = String(base64);
        }
        // 基础的 base64 解码实现
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let str = '';
        let i = 0;
        
        base64 = base64.replace(/[^A-Za-z0-9\+\/\=]/g, '');
        
        while (i < base64.length) {
            const enc1 = chars.indexOf(base64.charAt(i++));
            const enc2 = chars.indexOf(base64.charAt(i++));
            const enc3 = chars.indexOf(base64.charAt(i++));
            const enc4 = chars.indexOf(base64.charAt(i++));
            
            const chr1 = (enc1 << 2) | (enc2 >> 4);
            const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            const chr3 = ((enc3 & 3) << 6) | enc4;
            
            str += String.fromCharCode(chr1);
            if (enc3 !== 64) str += String.fromCharCode(chr2);
            if (enc4 !== 64) str += String.fromCharCode(chr3);
        }
        
        return str;
    };
}

// 确保 btoa 存在
if (typeof btoa === 'undefined') {
    globalThis.btoa = function(str) {
        // 确保输入是字符串
        if (typeof str !== 'string') {
            str = String(str);
        }
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let output = '';
        let i = 0;
        
        while (i < str.length) {
            const chr1 = str.charCodeAt(i++);
            const chr2 = str.charCodeAt(i++);
            const chr3 = str.charCodeAt(i++);
            
            const enc1 = chr1 >> 2;
            const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            const enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            const enc4 = chr3 & 63;
            
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            
            output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4);
        }
        
        return output;
    };
}
// ===== End Polyfills =====

var TextDecrypt = (function (exports) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    function getDefaultExportFromNamespaceIfNotNamed (n) {
    	return n && Object.prototype.hasOwnProperty.call(n, 'default') && Object.keys(n).length === 1 ? n['default'] : n;
    }

    var _polyfillNode_crypto = {};

    var _polyfillNode_crypto$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        default: _polyfillNode_crypto
    });

    var require$$0 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(_polyfillNode_crypto$1);

    const local_atob = typeof atob === 'undefined' ? (str) => Buffer.from(str, 'base64').toString('binary') : atob;
    function string_to_bytes(str, utf8 = false) {
        var len = str.length, bytes = new Uint8Array(utf8 ? 4 * len : len);
        for (var i = 0, j = 0; i < len; i++) {
            var c = str.charCodeAt(i);
            if (utf8 && 0xd800 <= c && c <= 0xdbff) {
                if (++i >= len)
                    throw new Error('Malformed string, low surrogate expected at position ' + i);
                c = ((c ^ 0xd800) << 10) | 0x10000 | (str.charCodeAt(i) ^ 0xdc00);
            }
            else if (!utf8 && c >>> 8) {
                throw new Error('Wide characters are not allowed.');
            }
            if (!utf8 || c <= 0x7f) {
                bytes[j++] = c;
            }
            else if (c <= 0x7ff) {
                bytes[j++] = 0xc0 | (c >> 6);
                bytes[j++] = 0x80 | (c & 0x3f);
            }
            else if (c <= 0xffff) {
                bytes[j++] = 0xe0 | (c >> 12);
                bytes[j++] = 0x80 | ((c >> 6) & 0x3f);
                bytes[j++] = 0x80 | (c & 0x3f);
            }
            else {
                bytes[j++] = 0xf0 | (c >> 18);
                bytes[j++] = 0x80 | ((c >> 12) & 0x3f);
                bytes[j++] = 0x80 | ((c >> 6) & 0x3f);
                bytes[j++] = 0x80 | (c & 0x3f);
            }
        }
        return bytes.subarray(0, j);
    }
    function base64_to_bytes(str) {
        return string_to_bytes(local_atob(str));
    }
    function bytes_to_string(bytes, utf8 = false) {
        var len = bytes.length, chars = new Array(len);
        for (var i = 0, j = 0; i < len; i++) {
            var b = bytes[i];
            if (!utf8 || b < 128) {
                chars[j++] = b;
            }
            else if (b >= 192 && b < 224 && i + 1 < len) {
                chars[j++] = ((b & 0x1f) << 6) | (bytes[++i] & 0x3f);
            }
            else if (b >= 224 && b < 240 && i + 2 < len) {
                chars[j++] = ((b & 0xf) << 12) | ((bytes[++i] & 0x3f) << 6) | (bytes[++i] & 0x3f);
            }
            else if (b >= 240 && b < 248 && i + 3 < len) {
                var c = ((b & 7) << 18) | ((bytes[++i] & 0x3f) << 12) | ((bytes[++i] & 0x3f) << 6) | (bytes[++i] & 0x3f);
                if (c <= 0xffff) {
                    chars[j++] = c;
                }
                else {
                    c ^= 0x10000;
                    chars[j++] = 0xd800 | (c >> 10);
                    chars[j++] = 0xdc00 | (c & 0x3ff);
                }
            }
            else {
                throw new Error('Malformed UTF8 character at byte offset ' + i);
            }
        }
        var str = '', bs = 16384;
        for (var i = 0; i < j; i += bs) {
            str += String.fromCharCode.apply(String, chars.slice(i, i + bs <= j ? i + bs : j));
        }
        return str;
    }
    function is_bytes(a) {
        return a instanceof Uint8Array;
    }
    function _heap_init(heap, heapSize) {
        const size = heap ? heap.byteLength : heapSize || 65536;
        if (size & 0xfff || size <= 0)
            throw new Error('heap size must be a positive integer and a multiple of 4096');
        heap = heap || new Uint8Array(new ArrayBuffer(size));
        return heap;
    }
    function _heap_write(heap, hpos, data, dpos, dlen) {
        const hlen = heap.length - hpos;
        const wlen = hlen < dlen ? hlen : dlen;
        heap.set(data.subarray(dpos, dpos + wlen), hpos);
        return wlen;
    }

    /**
     * Util exports
     */

    class IllegalStateError extends Error {
        constructor(...args) {
            super(...args);
        }
    }
    class IllegalArgumentError extends Error {
        constructor(...args) {
            super(...args);
        }
    }
    class SecurityError extends Error {
        constructor(...args) {
            super(...args);
        }
    }

    /**
     * @file {@link http://asmjs.org Asm.js} implementation of the {@link https://en.wikipedia.org/wiki/Advanced_Encryption_Standard Advanced Encryption Standard}.
     * @author Artem S Vybornov <vybornov@gmail.com>
     * @license MIT
     */
    var AES_asm = function () {

      /**
       * Galois Field stuff init flag
       */
      var ginit_done = false;

      /**
       * Galois Field exponentiation and logarithm tables for 3 (the generator)
       */
      var gexp3, glog3;

      /**
       * Init Galois Field tables
       */
      function ginit() {
        gexp3 = [],
          glog3 = [];

        var a = 1, c, d;
        for (c = 0; c < 255; c++) {
          gexp3[c] = a;

          // Multiply by three
          d = a & 0x80, a <<= 1, a &= 255;
          if (d === 0x80) a ^= 0x1b;
          a ^= gexp3[c];

          // Set the log table value
          glog3[gexp3[c]] = c;
        }
        gexp3[255] = gexp3[0];
        glog3[0] = 0;

        ginit_done = true;
      }

      /**
       * Galois Field multiplication
       * @param {number} a
       * @param {number} b
       * @return {number}
       */
      function gmul(a, b) {
        var c = gexp3[(glog3[a] + glog3[b]) % 255];
        if (a === 0 || b === 0) c = 0;
        return c;
      }

      /**
       * Galois Field reciprocal
       * @param {number} a
       * @return {number}
       */
      function ginv(a) {
        var i = gexp3[255 - glog3[a]];
        if (a === 0) i = 0;
        return i;
      }

      /**
       * AES stuff init flag
       */
      var aes_init_done = false;

      /**
       * Encryption, Decryption, S-Box and KeyTransform tables
       *
       * @type {number[]}
       */
      var aes_sbox;

      /**
       * @type {number[]}
       */
      var aes_sinv;

      /**
       * @type {number[][]}
       */
      var aes_enc;

      /**
       * @type {number[][]}
       */
      var aes_dec;

      /**
       * Init AES tables
       */
      function aes_init() {
        if (!ginit_done) ginit();

        // Calculates AES S-Box value
        function _s(a) {
          var c, s, x;
          s = x = ginv(a);
          for (c = 0; c < 4; c++) {
            s = ((s << 1) | (s >>> 7)) & 255;
            x ^= s;
          }
          x ^= 99;
          return x;
        }

        // Tables
        aes_sbox = [],
          aes_sinv = [],
          aes_enc = [[], [], [], []],
          aes_dec = [[], [], [], []];

        for (var i = 0; i < 256; i++) {
          var s = _s(i);

          // S-Box and its inverse
          aes_sbox[i] = s;
          aes_sinv[s] = i;

          // Ecryption and Decryption tables
          aes_enc[0][i] = (gmul(2, s) << 24) | (s << 16) | (s << 8) | gmul(3, s);
          aes_dec[0][s] = (gmul(14, i) << 24) | (gmul(9, i) << 16) | (gmul(13, i) << 8) | gmul(11, i);
          // Rotate tables
          for (var t = 1; t < 4; t++) {
            aes_enc[t][i] = (aes_enc[t - 1][i] >>> 8) | (aes_enc[t - 1][i] << 24);
            aes_dec[t][s] = (aes_dec[t - 1][s] >>> 8) | (aes_dec[t - 1][s] << 24);
          }
        }

        aes_init_done = true;
      }

      /**
       * Asm.js module constructor.
       *
       * <p>
       * Heap buffer layout by offset:
       * <pre>
       * 0x0000   encryption key schedule
       * 0x0400   decryption key schedule
       * 0x0800   sbox
       * 0x0c00   inv sbox
       * 0x1000   encryption tables
       * 0x2000   decryption tables
       * 0x3000   reserved (future GCM multiplication lookup table)
       * 0x4000   data
       * </pre>
       * Don't touch anything before <code>0x400</code>.
       * </p>
       *
       * @alias AES_asm
       * @class
       * @param foreign - <i>ignored</i>
       * @param buffer - heap buffer to link with
       */
      var wrapper = function (foreign, buffer) {
        // Init AES stuff for the first time
        if (!aes_init_done) aes_init();

        // Fill up AES tables
        var heap = new Uint32Array(buffer);
        heap.set(aes_sbox, 0x0800 >> 2);
        heap.set(aes_sinv, 0x0c00 >> 2);
        for (var i = 0; i < 4; i++) {
          heap.set(aes_enc[i], (0x1000 + 0x400 * i) >> 2);
          heap.set(aes_dec[i], (0x2000 + 0x400 * i) >> 2);
        }

        /**
         * Calculate AES key schedules.
         * @instance
         * @memberof AES_asm
         * @param {number} ks - key size, 4/6/8 (for 128/192/256-bit key correspondingly)
         * @param {number} k0 - key vector components
         * @param {number} k1 - key vector components
         * @param {number} k2 - key vector components
         * @param {number} k3 - key vector components
         * @param {number} k4 - key vector components
         * @param {number} k5 - key vector components
         * @param {number} k6 - key vector components
         * @param {number} k7 - key vector components
         */
        function set_key(ks, k0, k1, k2, k3, k4, k5, k6, k7) {
          var ekeys = heap.subarray(0x000, 60),
            dkeys = heap.subarray(0x100, 0x100 + 60);

          // Encryption key schedule
          ekeys.set([k0, k1, k2, k3, k4, k5, k6, k7]);
          for (var i = ks, rcon = 1; i < 4 * ks + 28; i++) {
            var k = ekeys[i - 1];
            if ((i % ks === 0) || (ks === 8 && i % ks === 4)) {
              k = aes_sbox[k >>> 24] << 24 ^ aes_sbox[k >>> 16 & 255] << 16 ^ aes_sbox[k >>> 8 & 255] << 8 ^ aes_sbox[k & 255];
            }
            if (i % ks === 0) {
              k = (k << 8) ^ (k >>> 24) ^ (rcon << 24);
              rcon = (rcon << 1) ^ ((rcon & 0x80) ? 0x1b : 0);
            }
            ekeys[i] = ekeys[i - ks] ^ k;
          }

          // Decryption key schedule
          for (var j = 0; j < i; j += 4) {
            for (var jj = 0; jj < 4; jj++) {
              var k = ekeys[i - (4 + j) + (4 - jj) % 4];
              if (j < 4 || j >= i - 4) {
                dkeys[j + jj] = k;
              } else {
                dkeys[j + jj] = aes_dec[0][aes_sbox[k >>> 24]]
                  ^ aes_dec[1][aes_sbox[k >>> 16 & 255]]
                  ^ aes_dec[2][aes_sbox[k >>> 8 & 255]]
                  ^ aes_dec[3][aes_sbox[k & 255]];
              }
            }
          }

          // Set rounds number
          asm.set_rounds(ks + 5);
        }

        // create library object with necessary properties
        var stdlib = {Uint8Array: Uint8Array, Uint32Array: Uint32Array};

        var asm = function (stdlib, foreign, buffer) {
          "use asm";

          var S0 = 0, S1 = 0, S2 = 0, S3 = 0,
            I0 = 0, I1 = 0, I2 = 0, I3 = 0,
            N0 = 0, N1 = 0, N2 = 0, N3 = 0,
            M0 = 0, M1 = 0, M2 = 0, M3 = 0,
            H0 = 0, H1 = 0, H2 = 0, H3 = 0,
            R = 0;

          var HEAP = new stdlib.Uint32Array(buffer),
            DATA = new stdlib.Uint8Array(buffer);

          /**
           * AES core
           * @param {number} k - precomputed key schedule offset
           * @param {number} s - precomputed sbox table offset
           * @param {number} t - precomputed round table offset
           * @param {number} r - number of inner rounds to perform
           * @param {number} x0 - 128-bit input block vector
           * @param {number} x1 - 128-bit input block vector
           * @param {number} x2 - 128-bit input block vector
           * @param {number} x3 - 128-bit input block vector
           */
          function _core(k, s, t, r, x0, x1, x2, x3) {
            k = k | 0;
            s = s | 0;
            t = t | 0;
            r = r | 0;
            x0 = x0 | 0;
            x1 = x1 | 0;
            x2 = x2 | 0;
            x3 = x3 | 0;

            var t1 = 0, t2 = 0, t3 = 0,
              y0 = 0, y1 = 0, y2 = 0, y3 = 0,
              i = 0;

            t1 = t | 0x400, t2 = t | 0x800, t3 = t | 0xc00;

            // round 0
            x0 = x0 ^ HEAP[(k | 0) >> 2],
              x1 = x1 ^ HEAP[(k | 4) >> 2],
              x2 = x2 ^ HEAP[(k | 8) >> 2],
              x3 = x3 ^ HEAP[(k | 12) >> 2];

            // round 1..r
            for (i = 16; (i | 0) <= (r << 4); i = (i + 16) | 0) {
              y0 = HEAP[(t | x0 >> 22 & 1020) >> 2] ^ HEAP[(t1 | x1 >> 14 & 1020) >> 2] ^ HEAP[(t2 | x2 >> 6 & 1020) >> 2] ^ HEAP[(t3 | x3 << 2 & 1020) >> 2] ^ HEAP[(k | i | 0) >> 2],
                y1 = HEAP[(t | x1 >> 22 & 1020) >> 2] ^ HEAP[(t1 | x2 >> 14 & 1020) >> 2] ^ HEAP[(t2 | x3 >> 6 & 1020) >> 2] ^ HEAP[(t3 | x0 << 2 & 1020) >> 2] ^ HEAP[(k | i | 4) >> 2],
                y2 = HEAP[(t | x2 >> 22 & 1020) >> 2] ^ HEAP[(t1 | x3 >> 14 & 1020) >> 2] ^ HEAP[(t2 | x0 >> 6 & 1020) >> 2] ^ HEAP[(t3 | x1 << 2 & 1020) >> 2] ^ HEAP[(k | i | 8) >> 2],
                y3 = HEAP[(t | x3 >> 22 & 1020) >> 2] ^ HEAP[(t1 | x0 >> 14 & 1020) >> 2] ^ HEAP[(t2 | x1 >> 6 & 1020) >> 2] ^ HEAP[(t3 | x2 << 2 & 1020) >> 2] ^ HEAP[(k | i | 12) >> 2];
              x0 = y0, x1 = y1, x2 = y2, x3 = y3;
            }

            // final round
            S0 = HEAP[(s | x0 >> 22 & 1020) >> 2] << 24 ^ HEAP[(s | x1 >> 14 & 1020) >> 2] << 16 ^ HEAP[(s | x2 >> 6 & 1020) >> 2] << 8 ^ HEAP[(s | x3 << 2 & 1020) >> 2] ^ HEAP[(k | i | 0) >> 2],
              S1 = HEAP[(s | x1 >> 22 & 1020) >> 2] << 24 ^ HEAP[(s | x2 >> 14 & 1020) >> 2] << 16 ^ HEAP[(s | x3 >> 6 & 1020) >> 2] << 8 ^ HEAP[(s | x0 << 2 & 1020) >> 2] ^ HEAP[(k | i | 4) >> 2],
              S2 = HEAP[(s | x2 >> 22 & 1020) >> 2] << 24 ^ HEAP[(s | x3 >> 14 & 1020) >> 2] << 16 ^ HEAP[(s | x0 >> 6 & 1020) >> 2] << 8 ^ HEAP[(s | x1 << 2 & 1020) >> 2] ^ HEAP[(k | i | 8) >> 2],
              S3 = HEAP[(s | x3 >> 22 & 1020) >> 2] << 24 ^ HEAP[(s | x0 >> 14 & 1020) >> 2] << 16 ^ HEAP[(s | x1 >> 6 & 1020) >> 2] << 8 ^ HEAP[(s | x2 << 2 & 1020) >> 2] ^ HEAP[(k | i | 12) >> 2];
          }

          /**
           * ECB mode encryption
           * @param {number} x0 - 128-bit input block vector
           * @param {number} x1 - 128-bit input block vector
           * @param {number} x2 - 128-bit input block vector
           * @param {number} x3 - 128-bit input block vector
           */
          function _ecb_enc(x0, x1, x2, x3) {
            x0 = x0 | 0;
            x1 = x1 | 0;
            x2 = x2 | 0;
            x3 = x3 | 0;

            _core(
              0x0000, 0x0800, 0x1000,
              R,
              x0,
              x1,
              x2,
              x3
            );
          }

          /**
           * ECB mode decryption
           * @param {number} x0 - 128-bit input block vector
           * @param {number} x1 - 128-bit input block vector
           * @param {number} x2 - 128-bit input block vector
           * @param {number} x3 - 128-bit input block vector
           */
          function _ecb_dec(x0, x1, x2, x3) {
            x0 = x0 | 0;
            x1 = x1 | 0;
            x2 = x2 | 0;
            x3 = x3 | 0;

            var t = 0;

            _core(
              0x0400, 0x0c00, 0x2000,
              R,
              x0,
              x3,
              x2,
              x1
            );

            t = S1, S1 = S3, S3 = t;
          }


          /**
           * CBC mode encryption
           * @param {number} x0 - 128-bit input block vector
           * @param {number} x1 - 128-bit input block vector
           * @param {number} x2 - 128-bit input block vector
           * @param {number} x3 - 128-bit input block vector
           */
          function _cbc_enc(x0, x1, x2, x3) {
            x0 = x0 | 0;
            x1 = x1 | 0;
            x2 = x2 | 0;
            x3 = x3 | 0;

            _core(
              0x0000, 0x0800, 0x1000,
              R,
              I0 ^ x0,
              I1 ^ x1,
              I2 ^ x2,
              I3 ^ x3
            );

            I0 = S0,
              I1 = S1,
              I2 = S2,
              I3 = S3;
          }

          /**
           * CBC mode decryption
           * @param {number} x0 - 128-bit input block vector
           * @param {number} x1 - 128-bit input block vector
           * @param {number} x2 - 128-bit input block vector
           * @param {number} x3 - 128-bit input block vector
           */
          function _cbc_dec(x0, x1, x2, x3) {
            x0 = x0 | 0;
            x1 = x1 | 0;
            x2 = x2 | 0;
            x3 = x3 | 0;

            var t = 0;

            _core(
              0x0400, 0x0c00, 0x2000,
              R,
              x0,
              x3,
              x2,
              x1
            );

            t = S1, S1 = S3, S3 = t;

            S0 = S0 ^ I0,
              S1 = S1 ^ I1,
              S2 = S2 ^ I2,
              S3 = S3 ^ I3;

            I0 = x0,
              I1 = x1,
              I2 = x2,
              I3 = x3;
          }

          /**
           * CFB mode encryption
           * @param {number} x0 - 128-bit input block vector
           * @param {number} x1 - 128-bit input block vector
           * @param {number} x2 - 128-bit input block vector
           * @param {number} x3 - 128-bit input block vector
           */
          function _cfb_enc(x0, x1, x2, x3) {
            x0 = x0 | 0;
            x1 = x1 | 0;
            x2 = x2 | 0;
            x3 = x3 | 0;

            _core(
              0x0000, 0x0800, 0x1000,
              R,
              I0,
              I1,
              I2,
              I3
            );

            I0 = S0 = S0 ^ x0,
              I1 = S1 = S1 ^ x1,
              I2 = S2 = S2 ^ x2,
              I3 = S3 = S3 ^ x3;
          }


          /**
           * CFB mode decryption
           * @param {number} x0 - 128-bit input block vector
           * @param {number} x1 - 128-bit input block vector
           * @param {number} x2 - 128-bit input block vector
           * @param {number} x3 - 128-bit input block vector
           */
          function _cfb_dec(x0, x1, x2, x3) {
            x0 = x0 | 0;
            x1 = x1 | 0;
            x2 = x2 | 0;
            x3 = x3 | 0;

            _core(
              0x0000, 0x0800, 0x1000,
              R,
              I0,
              I1,
              I2,
              I3
            );

            S0 = S0 ^ x0,
              S1 = S1 ^ x1,
              S2 = S2 ^ x2,
              S3 = S3 ^ x3;

            I0 = x0,
              I1 = x1,
              I2 = x2,
              I3 = x3;
          }

          /**
           * OFB mode encryption / decryption
           * @param {number} x0 - 128-bit input block vector
           * @param {number} x1 - 128-bit input block vector
           * @param {number} x2 - 128-bit input block vector
           * @param {number} x3 - 128-bit input block vector
           */
          function _ofb(x0, x1, x2, x3) {
            x0 = x0 | 0;
            x1 = x1 | 0;
            x2 = x2 | 0;
            x3 = x3 | 0;

            _core(
              0x0000, 0x0800, 0x1000,
              R,
              I0,
              I1,
              I2,
              I3
            );

            I0 = S0,
              I1 = S1,
              I2 = S2,
              I3 = S3;

            S0 = S0 ^ x0,
              S1 = S1 ^ x1,
              S2 = S2 ^ x2,
              S3 = S3 ^ x3;
          }

          /**
           * CTR mode encryption / decryption
           * @param {number} x0 - 128-bit input block vector
           * @param {number} x1 - 128-bit input block vector
           * @param {number} x2 - 128-bit input block vector
           * @param {number} x3 - 128-bit input block vector
           */
          function _ctr(x0, x1, x2, x3) {
            x0 = x0 | 0;
            x1 = x1 | 0;
            x2 = x2 | 0;
            x3 = x3 | 0;

            _core(
              0x0000, 0x0800, 0x1000,
              R,
              N0,
              N1,
              N2,
              N3
            );

            N3 = (~M3 & N3) | M3 & (N3 + 1);
              N2 = (~M2 & N2) | M2 & (N2 + ((N3 | 0) == 0));
              N1 = (~M1 & N1) | M1 & (N1 + ((N2 | 0) == 0));
              N0 = (~M0 & N0) | M0 & (N0 + ((N1 | 0) == 0));

            S0 = S0 ^ x0;
              S1 = S1 ^ x1;
              S2 = S2 ^ x2;
              S3 = S3 ^ x3;
          }

          /**
           * GCM mode MAC calculation
           * @param {number} x0 - 128-bit input block vector
           * @param {number} x1 - 128-bit input block vector
           * @param {number} x2 - 128-bit input block vector
           * @param {number} x3 - 128-bit input block vector
           */
          function _gcm_mac(x0, x1, x2, x3) {
            x0 = x0 | 0;
            x1 = x1 | 0;
            x2 = x2 | 0;
            x3 = x3 | 0;

            var y0 = 0, y1 = 0, y2 = 0, y3 = 0,
              z0 = 0, z1 = 0, z2 = 0, z3 = 0,
              i = 0, c = 0;

            x0 = x0 ^ I0,
              x1 = x1 ^ I1,
              x2 = x2 ^ I2,
              x3 = x3 ^ I3;

            y0 = H0 | 0,
              y1 = H1 | 0,
              y2 = H2 | 0,
              y3 = H3 | 0;

            for (; (i | 0) < 128; i = (i + 1) | 0) {
              if (y0 >>> 31) {
                z0 = z0 ^ x0,
                  z1 = z1 ^ x1,
                  z2 = z2 ^ x2,
                  z3 = z3 ^ x3;
              }

              y0 = (y0 << 1) | (y1 >>> 31),
                y1 = (y1 << 1) | (y2 >>> 31),
                y2 = (y2 << 1) | (y3 >>> 31),
                y3 = (y3 << 1);

              c = x3 & 1;

              x3 = (x3 >>> 1) | (x2 << 31),
                x2 = (x2 >>> 1) | (x1 << 31),
                x1 = (x1 >>> 1) | (x0 << 31),
                x0 = (x0 >>> 1);

              if (c) x0 = x0 ^ 0xe1000000;
            }

            I0 = z0,
              I1 = z1,
              I2 = z2,
              I3 = z3;
          }

          /**
           * Set the internal rounds number.
           * @instance
           * @memberof AES_asm
           * @param {number} r - number if inner AES rounds
           */
          function set_rounds(r) {
            r = r | 0;
            R = r;
          }

          /**
           * Populate the internal state of the module.
           * @instance
           * @memberof AES_asm
           * @param {number} s0 - state vector
           * @param {number} s1 - state vector
           * @param {number} s2 - state vector
           * @param {number} s3 - state vector
           */
          function set_state(s0, s1, s2, s3) {
            s0 = s0 | 0;
            s1 = s1 | 0;
            s2 = s2 | 0;
            s3 = s3 | 0;

            S0 = s0,
              S1 = s1,
              S2 = s2,
              S3 = s3;
          }

          /**
           * Populate the internal iv of the module.
           * @instance
           * @memberof AES_asm
           * @param {number} i0 - iv vector
           * @param {number} i1 - iv vector
           * @param {number} i2 - iv vector
           * @param {number} i3 - iv vector
           */
          function set_iv(i0, i1, i2, i3) {
            i0 = i0 | 0;
            i1 = i1 | 0;
            i2 = i2 | 0;
            i3 = i3 | 0;

            I0 = i0,
              I1 = i1,
              I2 = i2,
              I3 = i3;
          }

          /**
           * Set nonce for CTR-family modes.
           * @instance
           * @memberof AES_asm
           * @param {number} n0 - nonce vector
           * @param {number} n1 - nonce vector
           * @param {number} n2 - nonce vector
           * @param {number} n3 - nonce vector
           */
          function set_nonce(n0, n1, n2, n3) {
            n0 = n0 | 0;
            n1 = n1 | 0;
            n2 = n2 | 0;
            n3 = n3 | 0;

            N0 = n0,
              N1 = n1,
              N2 = n2,
              N3 = n3;
          }

          /**
           * Set counter mask for CTR-family modes.
           * @instance
           * @memberof AES_asm
           * @param {number} m0 - counter mask vector
           * @param {number} m1 - counter mask vector
           * @param {number} m2 - counter mask vector
           * @param {number} m3 - counter mask vector
           */
          function set_mask(m0, m1, m2, m3) {
            m0 = m0 | 0;
            m1 = m1 | 0;
            m2 = m2 | 0;
            m3 = m3 | 0;

            M0 = m0,
              M1 = m1,
              M2 = m2,
              M3 = m3;
          }

          /**
           * Set counter for CTR-family modes.
           * @instance
           * @memberof AES_asm
           * @param {number} c0 - counter vector
           * @param {number} c1 - counter vector
           * @param {number} c2 - counter vector
           * @param {number} c3 - counter vector
           */
          function set_counter(c0, c1, c2, c3) {
            c0 = c0 | 0;
            c1 = c1 | 0;
            c2 = c2 | 0;
            c3 = c3 | 0;

            N3 = (~M3 & N3) | M3 & c3,
              N2 = (~M2 & N2) | M2 & c2,
              N1 = (~M1 & N1) | M1 & c1,
              N0 = (~M0 & N0) | M0 & c0;
          }

          /**
           * Store the internal state vector into the heap.
           * @instance
           * @memberof AES_asm
           * @param {number} pos - offset where to put the data
           * @return {number} The number of bytes have been written into the heap, always 16.
           */
          function get_state(pos) {
            pos = pos | 0;

            if (pos & 15) return -1;

            DATA[pos | 0] = S0 >>> 24,
              DATA[pos | 1] = S0 >>> 16 & 255,
              DATA[pos | 2] = S0 >>> 8 & 255,
              DATA[pos | 3] = S0 & 255,
              DATA[pos | 4] = S1 >>> 24,
              DATA[pos | 5] = S1 >>> 16 & 255,
              DATA[pos | 6] = S1 >>> 8 & 255,
              DATA[pos | 7] = S1 & 255,
              DATA[pos | 8] = S2 >>> 24,
              DATA[pos | 9] = S2 >>> 16 & 255,
              DATA[pos | 10] = S2 >>> 8 & 255,
              DATA[pos | 11] = S2 & 255,
              DATA[pos | 12] = S3 >>> 24,
              DATA[pos | 13] = S3 >>> 16 & 255,
              DATA[pos | 14] = S3 >>> 8 & 255,
              DATA[pos | 15] = S3 & 255;

            return 16;
          }

          /**
           * Store the internal iv vector into the heap.
           * @instance
           * @memberof AES_asm
           * @param {number} pos - offset where to put the data
           * @return {number} The number of bytes have been written into the heap, always 16.
           */
          function get_iv(pos) {
            pos = pos | 0;

            if (pos & 15) return -1;

            DATA[pos | 0] = I0 >>> 24,
              DATA[pos | 1] = I0 >>> 16 & 255,
              DATA[pos | 2] = I0 >>> 8 & 255,
              DATA[pos | 3] = I0 & 255,
              DATA[pos | 4] = I1 >>> 24,
              DATA[pos | 5] = I1 >>> 16 & 255,
              DATA[pos | 6] = I1 >>> 8 & 255,
              DATA[pos | 7] = I1 & 255,
              DATA[pos | 8] = I2 >>> 24,
              DATA[pos | 9] = I2 >>> 16 & 255,
              DATA[pos | 10] = I2 >>> 8 & 255,
              DATA[pos | 11] = I2 & 255,
              DATA[pos | 12] = I3 >>> 24,
              DATA[pos | 13] = I3 >>> 16 & 255,
              DATA[pos | 14] = I3 >>> 8 & 255,
              DATA[pos | 15] = I3 & 255;

            return 16;
          }

          /**
           * GCM initialization.
           * @instance
           * @memberof AES_asm
           */
          function gcm_init() {
            _ecb_enc(0, 0, 0, 0);
            H0 = S0,
              H1 = S1,
              H2 = S2,
              H3 = S3;
          }

          /**
           * Perform ciphering operation on the supplied data.
           * @instance
           * @memberof AES_asm
           * @param {number} mode - block cipher mode (see {@link AES_asm} mode constants)
           * @param {number} pos - offset of the data being processed
           * @param {number} len - length of the data being processed
           * @return {number} Actual amount of data have been processed.
           */
          function cipher(mode, pos, len) {
            mode = mode | 0;
            pos = pos | 0;
            len = len | 0;

            var ret = 0;

            if (pos & 15) return -1;

            while ((len | 0) >= 16) {
              _cipher_modes[mode & 7](
                DATA[pos | 0] << 24 | DATA[pos | 1] << 16 | DATA[pos | 2] << 8 | DATA[pos | 3],
                DATA[pos | 4] << 24 | DATA[pos | 5] << 16 | DATA[pos | 6] << 8 | DATA[pos | 7],
                DATA[pos | 8] << 24 | DATA[pos | 9] << 16 | DATA[pos | 10] << 8 | DATA[pos | 11],
                DATA[pos | 12] << 24 | DATA[pos | 13] << 16 | DATA[pos | 14] << 8 | DATA[pos | 15]
              );

              DATA[pos | 0] = S0 >>> 24,
                DATA[pos | 1] = S0 >>> 16 & 255,
                DATA[pos | 2] = S0 >>> 8 & 255,
                DATA[pos | 3] = S0 & 255,
                DATA[pos | 4] = S1 >>> 24,
                DATA[pos | 5] = S1 >>> 16 & 255,
                DATA[pos | 6] = S1 >>> 8 & 255,
                DATA[pos | 7] = S1 & 255,
                DATA[pos | 8] = S2 >>> 24,
                DATA[pos | 9] = S2 >>> 16 & 255,
                DATA[pos | 10] = S2 >>> 8 & 255,
                DATA[pos | 11] = S2 & 255,
                DATA[pos | 12] = S3 >>> 24,
                DATA[pos | 13] = S3 >>> 16 & 255,
                DATA[pos | 14] = S3 >>> 8 & 255,
                DATA[pos | 15] = S3 & 255;

              ret = (ret + 16) | 0,
                pos = (pos + 16) | 0,
                len = (len - 16) | 0;
            }

            return ret | 0;
          }

          /**
           * Calculates MAC of the supplied data.
           * @instance
           * @memberof AES_asm
           * @param {number} mode - block cipher mode (see {@link AES_asm} mode constants)
           * @param {number} pos - offset of the data being processed
           * @param {number} len - length of the data being processed
           * @return {number} Actual amount of data have been processed.
           */
          function mac(mode, pos, len) {
            mode = mode | 0;
            pos = pos | 0;
            len = len | 0;

            var ret = 0;

            if (pos & 15) return -1;

            while ((len | 0) >= 16) {
              _mac_modes[mode & 1](
                DATA[pos | 0] << 24 | DATA[pos | 1] << 16 | DATA[pos | 2] << 8 | DATA[pos | 3],
                DATA[pos | 4] << 24 | DATA[pos | 5] << 16 | DATA[pos | 6] << 8 | DATA[pos | 7],
                DATA[pos | 8] << 24 | DATA[pos | 9] << 16 | DATA[pos | 10] << 8 | DATA[pos | 11],
                DATA[pos | 12] << 24 | DATA[pos | 13] << 16 | DATA[pos | 14] << 8 | DATA[pos | 15]
              );

              ret = (ret + 16) | 0,
                pos = (pos + 16) | 0,
                len = (len - 16) | 0;
            }

            return ret | 0;
          }

          /**
           * AES cipher modes table (virual methods)
           */
          var _cipher_modes = [_ecb_enc, _ecb_dec, _cbc_enc, _cbc_dec, _cfb_enc, _cfb_dec, _ofb, _ctr];

          /**
           * AES MAC modes table (virual methods)
           */
          var _mac_modes = [_cbc_enc, _gcm_mac];

          /**
           * Asm.js module exports
           */
          return {
            set_rounds: set_rounds,
            set_state: set_state,
            set_iv: set_iv,
            set_nonce: set_nonce,
            set_mask: set_mask,
            set_counter: set_counter,
            get_state: get_state,
            get_iv: get_iv,
            gcm_init: gcm_init,
            cipher: cipher,
            mac: mac,
          };
        }(stdlib, foreign, buffer);

        asm.set_key = set_key;

        return asm;
      };

      /**
       * AES enciphering mode constants
       * @enum {number}
       * @const
       */
      wrapper.ENC = {
        ECB: 0,
        CBC: 2,
        CFB: 4,
        OFB: 6,
        CTR: 7,
      },

        /**
         * AES deciphering mode constants
         * @enum {number}
         * @const
         */
        wrapper.DEC = {
          ECB: 1,
          CBC: 3,
          CFB: 5,
          OFB: 6,
          CTR: 7,
        },

        /**
         * AES MAC mode constants
         * @enum {number}
         * @const
         */
        wrapper.MAC = {
          CBC: 0,
          GCM: 1,
        };

      /**
       * Heap data offset
       * @type {number}
       * @const
       */
      wrapper.HEAP_DATA = 0x4000;

      return wrapper;
    }();

    class AES {
        constructor(key, iv, padding = true, mode) {
            this.pos = 0;
            this.len = 0;
            this.mode = mode;
            // The AES "worker"
            this.heap = _heap_init().subarray(AES_asm.HEAP_DATA);
            this.asm = new AES_asm(null, this.heap.buffer);
            // The AES object state
            this.pos = 0;
            this.len = 0;
            // Key
            const keylen = key.length;
            if (keylen !== 16 && keylen !== 24 && keylen !== 32)
                throw new IllegalArgumentError('illegal key size');
            const keyview = new DataView(key.buffer, key.byteOffset, key.byteLength);
            this.asm.set_key(keylen >> 2, keyview.getUint32(0), keyview.getUint32(4), keyview.getUint32(8), keyview.getUint32(12), keylen > 16 ? keyview.getUint32(16) : 0, keylen > 16 ? keyview.getUint32(20) : 0, keylen > 24 ? keyview.getUint32(24) : 0, keylen > 24 ? keyview.getUint32(28) : 0);
            // IV
            if (iv !== undefined) {
                if (iv.length !== 16)
                    throw new IllegalArgumentError('illegal iv size');
                let ivview = new DataView(iv.buffer, iv.byteOffset, iv.byteLength);
                this.asm.set_iv(ivview.getUint32(0), ivview.getUint32(4), ivview.getUint32(8), ivview.getUint32(12));
            }
            else {
                this.asm.set_iv(0, 0, 0, 0);
            }
            this.padding = padding;
        }
        AES_Encrypt_process(data) {
            if (!is_bytes(data))
                throw new TypeError("data isn't of expected type");
            let asm = this.asm;
            let heap = this.heap;
            let amode = AES_asm.ENC[this.mode];
            let hpos = AES_asm.HEAP_DATA;
            let pos = this.pos;
            let len = this.len;
            let dpos = 0;
            let dlen = data.length || 0;
            let rpos = 0;
            let rlen = (len + dlen) & -16;
            let wlen = 0;
            let result = new Uint8Array(rlen);
            while (dlen > 0) {
                wlen = _heap_write(heap, pos + len, data, dpos, dlen);
                len += wlen;
                dpos += wlen;
                dlen -= wlen;
                wlen = asm.cipher(amode, hpos + pos, len);
                if (wlen)
                    result.set(heap.subarray(pos, pos + wlen), rpos);
                rpos += wlen;
                if (wlen < len) {
                    pos += wlen;
                    len -= wlen;
                }
                else {
                    pos = 0;
                    len = 0;
                }
            }
            this.pos = pos;
            this.len = len;
            return result;
        }
        AES_Encrypt_finish() {
            let asm = this.asm;
            let heap = this.heap;
            let amode = AES_asm.ENC[this.mode];
            let hpos = AES_asm.HEAP_DATA;
            let pos = this.pos;
            let len = this.len;
            let plen = 16 - (len % 16);
            let rlen = len;
            if (this.hasOwnProperty('padding')) {
                if (this.padding) {
                    for (let p = 0; p < plen; ++p) {
                        heap[pos + len + p] = plen;
                    }
                    len += plen;
                    rlen = len;
                }
                else if (len % 16) {
                    throw new IllegalArgumentError('data length must be a multiple of the block size');
                }
            }
            else {
                len += plen;
            }
            const result = new Uint8Array(rlen);
            if (len)
                asm.cipher(amode, hpos + pos, len);
            if (rlen)
                result.set(heap.subarray(pos, pos + rlen));
            this.pos = 0;
            this.len = 0;
            return result;
        }
        AES_Decrypt_process(data) {
            if (!is_bytes(data))
                throw new TypeError("data isn't of expected type");
            let asm = this.asm;
            let heap = this.heap;
            let amode = AES_asm.DEC[this.mode];
            let hpos = AES_asm.HEAP_DATA;
            let pos = this.pos;
            let len = this.len;
            let dpos = 0;
            let dlen = data.length || 0;
            let rpos = 0;
            let rlen = (len + dlen) & -16;
            let plen = 0;
            let wlen = 0;
            if (this.padding) {
                plen = len + dlen - rlen || 16;
                rlen -= plen;
            }
            const result = new Uint8Array(rlen);
            while (dlen > 0) {
                wlen = _heap_write(heap, pos + len, data, dpos, dlen);
                len += wlen;
                dpos += wlen;
                dlen -= wlen;
                wlen = asm.cipher(amode, hpos + pos, len - (!dlen ? plen : 0));
                if (wlen)
                    result.set(heap.subarray(pos, pos + wlen), rpos);
                rpos += wlen;
                if (wlen < len) {
                    pos += wlen;
                    len -= wlen;
                }
                else {
                    pos = 0;
                    len = 0;
                }
            }
            this.pos = pos;
            this.len = len;
            return result;
        }
        AES_Decrypt_finish() {
            let asm = this.asm;
            let heap = this.heap;
            let amode = AES_asm.DEC[this.mode];
            let hpos = AES_asm.HEAP_DATA;
            let pos = this.pos;
            let len = this.len;
            let rlen = len;
            if (len > 0) {
                if (len % 16) {
                    if (this.hasOwnProperty('padding')) {
                        throw new IllegalArgumentError('data length must be a multiple of the block size');
                    }
                    else {
                        len += 16 - (len % 16);
                    }
                }
                asm.cipher(amode, hpos + pos, len);
                if (this.hasOwnProperty('padding') && this.padding) {
                    let pad = heap[pos + rlen - 1];
                    if (pad < 1 || pad > 16 || pad > rlen)
                        throw new SecurityError('bad padding');
                    let pcheck = 0;
                    for (let i = pad; i > 1; i--)
                        pcheck |= pad ^ heap[pos + rlen - i];
                    if (pcheck)
                        throw new SecurityError('bad padding');
                    rlen -= pad;
                }
            }
            const result = new Uint8Array(rlen);
            if (rlen > 0) {
                result.set(heap.subarray(pos, pos + rlen));
            }
            this.pos = 0;
            this.len = 0;
            return result;
        }
    }

    const _AES_GCM_data_maxLength = 68719476704; // 2^36 - 2^5
    class AES_GCM extends AES {
        constructor(key, nonce, adata, tagSize = 16) {
            super(key, undefined, false, 'CTR');
            this.tagSize = tagSize;
            this.gamma0 = 0;
            this.counter = 1;
            // Init GCM
            this.asm.gcm_init();
            // Tag size
            if (this.tagSize < 4 || this.tagSize > 16)
                throw new IllegalArgumentError('illegal tagSize value');
            // Nonce
            const noncelen = nonce.length || 0;
            const noncebuf = new Uint8Array(16);
            if (noncelen !== 12) {
                this._gcm_mac_process(nonce);
                this.heap[0] = 0;
                this.heap[1] = 0;
                this.heap[2] = 0;
                this.heap[3] = 0;
                this.heap[4] = 0;
                this.heap[5] = 0;
                this.heap[6] = 0;
                this.heap[7] = 0;
                this.heap[8] = 0;
                this.heap[9] = 0;
                this.heap[10] = 0;
                this.heap[11] = noncelen >>> 29;
                this.heap[12] = (noncelen >>> 21) & 255;
                this.heap[13] = (noncelen >>> 13) & 255;
                this.heap[14] = (noncelen >>> 5) & 255;
                this.heap[15] = (noncelen << 3) & 255;
                this.asm.mac(AES_asm.MAC.GCM, AES_asm.HEAP_DATA, 16);
                this.asm.get_iv(AES_asm.HEAP_DATA);
                this.asm.set_iv(0, 0, 0, 0);
                noncebuf.set(this.heap.subarray(0, 16));
            }
            else {
                noncebuf.set(nonce);
                noncebuf[15] = 1;
            }
            const nonceview = new DataView(noncebuf.buffer);
            this.gamma0 = nonceview.getUint32(12);
            this.asm.set_nonce(nonceview.getUint32(0), nonceview.getUint32(4), nonceview.getUint32(8), 0);
            this.asm.set_mask(0, 0, 0, 0xffffffff);
            // Associated data
            if (adata !== undefined) {
                if (adata.length > _AES_GCM_data_maxLength)
                    throw new IllegalArgumentError('illegal adata length');
                if (adata.length) {
                    this.adata = adata;
                    this._gcm_mac_process(adata);
                }
                else {
                    this.adata = undefined;
                }
            }
            else {
                this.adata = undefined;
            }
            // Counter
            if (this.counter < 1 || this.counter > 0xffffffff)
                throw new RangeError('counter must be a positive 32-bit integer');
            this.asm.set_counter(0, 0, 0, (this.gamma0 + this.counter) | 0);
        }
        static encrypt(cleartext, key, nonce, adata, tagsize) {
            return new AES_GCM(key, nonce, adata, tagsize).encrypt(cleartext);
        }
        static decrypt(ciphertext, key, nonce, adata, tagsize) {
            return new AES_GCM(key, nonce, adata, tagsize).decrypt(ciphertext);
        }
        encrypt(data) {
            return this.AES_GCM_encrypt(data);
        }
        decrypt(data) {
            return this.AES_GCM_decrypt(data);
        }
        AES_GCM_Encrypt_process(data) {
            let dpos = 0;
            let dlen = data.length || 0;
            let asm = this.asm;
            let heap = this.heap;
            let counter = this.counter;
            let pos = this.pos;
            let len = this.len;
            let rpos = 0;
            let rlen = (len + dlen) & -16;
            let wlen = 0;
            if (((counter - 1) << 4) + len + dlen > _AES_GCM_data_maxLength)
                throw new RangeError('counter overflow');
            const result = new Uint8Array(rlen);
            while (dlen > 0) {
                wlen = _heap_write(heap, pos + len, data, dpos, dlen);
                len += wlen;
                dpos += wlen;
                dlen -= wlen;
                wlen = asm.cipher(AES_asm.ENC.CTR, AES_asm.HEAP_DATA + pos, len);
                wlen = asm.mac(AES_asm.MAC.GCM, AES_asm.HEAP_DATA + pos, wlen);
                if (wlen)
                    result.set(heap.subarray(pos, pos + wlen), rpos);
                counter += wlen >>> 4;
                rpos += wlen;
                if (wlen < len) {
                    pos += wlen;
                    len -= wlen;
                }
                else {
                    pos = 0;
                    len = 0;
                }
            }
            this.counter = counter;
            this.pos = pos;
            this.len = len;
            return result;
        }
        AES_GCM_Encrypt_finish() {
            let asm = this.asm;
            let heap = this.heap;
            let counter = this.counter;
            let tagSize = this.tagSize;
            let adata = this.adata;
            let pos = this.pos;
            let len = this.len;
            const result = new Uint8Array(len + tagSize);
            asm.cipher(AES_asm.ENC.CTR, AES_asm.HEAP_DATA + pos, (len + 15) & -16);
            if (len)
                result.set(heap.subarray(pos, pos + len));
            let i = len;
            for (; i & 15; i++)
                heap[pos + i] = 0;
            asm.mac(AES_asm.MAC.GCM, AES_asm.HEAP_DATA + pos, i);
            const alen = adata !== undefined ? adata.length : 0;
            const clen = ((counter - 1) << 4) + len;
            heap[0] = 0;
            heap[1] = 0;
            heap[2] = 0;
            heap[3] = alen >>> 29;
            heap[4] = alen >>> 21;
            heap[5] = (alen >>> 13) & 255;
            heap[6] = (alen >>> 5) & 255;
            heap[7] = (alen << 3) & 255;
            heap[8] = heap[9] = heap[10] = 0;
            heap[11] = clen >>> 29;
            heap[12] = (clen >>> 21) & 255;
            heap[13] = (clen >>> 13) & 255;
            heap[14] = (clen >>> 5) & 255;
            heap[15] = (clen << 3) & 255;
            asm.mac(AES_asm.MAC.GCM, AES_asm.HEAP_DATA, 16);
            asm.get_iv(AES_asm.HEAP_DATA);
            asm.set_counter(0, 0, 0, this.gamma0);
            asm.cipher(AES_asm.ENC.CTR, AES_asm.HEAP_DATA, 16);
            result.set(heap.subarray(0, tagSize), len);
            this.counter = 1;
            this.pos = 0;
            this.len = 0;
            return result;
        }
        AES_GCM_Decrypt_process(data) {
            let dpos = 0;
            let dlen = data.length || 0;
            let asm = this.asm;
            let heap = this.heap;
            let counter = this.counter;
            let tagSize = this.tagSize;
            let pos = this.pos;
            let len = this.len;
            let rpos = 0;
            let rlen = len + dlen > tagSize ? (len + dlen - tagSize) & -16 : 0;
            let tlen = len + dlen - rlen;
            let wlen = 0;
            if (((counter - 1) << 4) + len + dlen > _AES_GCM_data_maxLength)
                throw new RangeError('counter overflow');
            const result = new Uint8Array(rlen);
            while (dlen > tlen) {
                wlen = _heap_write(heap, pos + len, data, dpos, dlen - tlen);
                len += wlen;
                dpos += wlen;
                dlen -= wlen;
                wlen = asm.mac(AES_asm.MAC.GCM, AES_asm.HEAP_DATA + pos, wlen);
                wlen = asm.cipher(AES_asm.DEC.CTR, AES_asm.HEAP_DATA + pos, wlen);
                if (wlen)
                    result.set(heap.subarray(pos, pos + wlen), rpos);
                counter += wlen >>> 4;
                rpos += wlen;
                pos = 0;
                len = 0;
            }
            if (dlen > 0) {
                len += _heap_write(heap, 0, data, dpos, dlen);
            }
            this.counter = counter;
            this.pos = pos;
            this.len = len;
            return result;
        }
        AES_GCM_Decrypt_finish() {
            let asm = this.asm;
            let heap = this.heap;
            let tagSize = this.tagSize;
            let adata = this.adata;
            let counter = this.counter;
            let pos = this.pos;
            let len = this.len;
            let rlen = len - tagSize;
            if (len < tagSize)
                throw new IllegalStateError('authentication tag not found');
            const result = new Uint8Array(rlen);
            const atag = new Uint8Array(heap.subarray(pos + rlen, pos + len));
            let i = rlen;
            for (; i & 15; i++)
                heap[pos + i] = 0;
            asm.mac(AES_asm.MAC.GCM, AES_asm.HEAP_DATA + pos, i);
            asm.cipher(AES_asm.DEC.CTR, AES_asm.HEAP_DATA + pos, i);
            if (rlen)
                result.set(heap.subarray(pos, pos + rlen));
            const alen = adata !== undefined ? adata.length : 0;
            const clen = ((counter - 1) << 4) + len - tagSize;
            heap[0] = 0;
            heap[1] = 0;
            heap[2] = 0;
            heap[3] = alen >>> 29;
            heap[4] = alen >>> 21;
            heap[5] = (alen >>> 13) & 255;
            heap[6] = (alen >>> 5) & 255;
            heap[7] = (alen << 3) & 255;
            heap[8] = heap[9] = heap[10] = 0;
            heap[11] = clen >>> 29;
            heap[12] = (clen >>> 21) & 255;
            heap[13] = (clen >>> 13) & 255;
            heap[14] = (clen >>> 5) & 255;
            heap[15] = (clen << 3) & 255;
            asm.mac(AES_asm.MAC.GCM, AES_asm.HEAP_DATA, 16);
            asm.get_iv(AES_asm.HEAP_DATA);
            asm.set_counter(0, 0, 0, this.gamma0);
            asm.cipher(AES_asm.ENC.CTR, AES_asm.HEAP_DATA, 16);
            let acheck = 0;
            for (let i = 0; i < tagSize; ++i)
                acheck |= atag[i] ^ heap[i];
            if (acheck)
                throw new SecurityError('密钥失效');
            this.counter = 1;
            this.pos = 0;
            this.len = 0;
            return result;
        }
        AES_GCM_decrypt(data) {
            const result1 = this.AES_GCM_Decrypt_process(data);
            const result2 = this.AES_GCM_Decrypt_finish();
            const result = new Uint8Array(result1.length + result2.length);
            if (result1.length)
                result.set(result1);
            if (result2.length)
                result.set(result2, result1.length);
            return result;
        }
        AES_GCM_encrypt(data) {
            const result1 = this.AES_GCM_Encrypt_process(data);
            const result2 = this.AES_GCM_Encrypt_finish();
            const result = new Uint8Array(result1.length + result2.length);
            if (result1.length)
                result.set(result1);
            if (result2.length)
                result.set(result2, result1.length);
            return result;
        }
        _gcm_mac_process(data) {
            const heap = this.heap;
            const asm = this.asm;
            let dpos = 0;
            let dlen = data.length || 0;
            let wlen = 0;
            while (dlen > 0) {
                wlen = _heap_write(heap, 0, data, dpos, dlen);
                dpos += wlen;
                dlen -= wlen;
                while (wlen & 15)
                    heap[wlen++] = 0;
                asm.mac(AES_asm.MAC.GCM, AES_asm.HEAP_DATA, wlen);
            }
        }
    }

    /**
     * Integers are represented as little endian array of 32-bit limbs.
     * Limbs number is a power of 2 and a multiple of 8 (256 bits).
     * Negative values use two's complement representation.
     */
    var bigint_asm = function ( stdlib, foreign, buffer ) {
        "use asm";

        var SP = 0;

        var HEAP32 = new stdlib.Uint32Array(buffer);

        var imul = stdlib.Math.imul;

        /**
         * Simple stack memory allocator
         *
         * Methods:
         *  sreset
         *  salloc
         *  sfree
         */

        function sreset ( p ) {
            p = p|0;
            SP = p = (p + 31) & -32;
            return p|0;
        }

        function salloc ( l ) {
            l = l|0;
            var p = 0; p = SP;
            SP = p + ((l + 31) & -32)|0;
            return p|0;
        }

        function sfree ( l ) {
            l = l|0;
            SP = SP - ((l + 31) & -32)|0;
        }

        /**
         * Utility functions:
         *  cp
         *  z
         */

        function cp ( l, A, B ) {
            l = l|0;
            A = A|0;
            B = B|0;

            var i = 0;

            if ( (A|0) > (B|0) ) {
                for ( ; (i|0) < (l|0); i = (i+4)|0 ) {
                    HEAP32[(B+i)>>2] = HEAP32[(A+i)>>2];
                }
            }
            else {
                for ( i = (l-4)|0; (i|0) >= 0; i = (i-4)|0 ) {
                    HEAP32[(B+i)>>2] = HEAP32[(A+i)>>2];
                }
            }
        }

        function z ( l, z, A ) {
            l = l|0;
            z = z|0;
            A = A|0;

            var i = 0;

            for ( ; (i|0) < (l|0); i = (i+4)|0 ) {
                HEAP32[(A+i)>>2] = z;
            }
        }

        /**
         * Negate the argument
         *
         * Perform two's complement transformation:
         *
         *  -A = ~A + 1
         *
         * @param A offset of the argment being negated, 32-byte aligned
         * @param lA length of the argument, multiple of 32
         *
         * @param R offset where to place the result to, 32-byte aligned
         * @param lR length to truncate the result to, multiple of 32
         */
        function neg ( A, lA, R, lR ) {
            A  =  A|0;
            lA = lA|0;
            R  =  R|0;
            lR = lR|0;

            var a = 0, c = 0, t = 0, r = 0, i = 0;

            if ( (lR|0) <= 0 )
                lR = lA;

            if ( (lR|0) < (lA|0) )
                lA = lR;

            c = 1;
            for ( ; (i|0) < (lA|0); i = (i+4)|0 ) {
                a = ~HEAP32[(A+i)>>2];
                t = (a & 0xffff) + c|0;
                r = (a >>> 16) + (t >>> 16)|0;
                HEAP32[(R+i)>>2] = (r << 16) | (t & 0xffff);
                c = r >>> 16;
            }

            for ( ; (i|0) < (lR|0); i = (i+4)|0 ) {
                HEAP32[(R+i)>>2] = (c-1)|0;
            }

            return c|0;
        }

        function cmp ( A, lA, B, lB ) {
            A  =  A|0;
            lA = lA|0;
            B  =  B|0;
            lB = lB|0;

            var a = 0, b = 0, i = 0;

            if ( (lA|0) > (lB|0) ) {
                for ( i = (lA-4)|0; (i|0) >= (lB|0); i = (i-4)|0 ) {
                    if ( HEAP32[(A+i)>>2]|0 ) return 1;
                }
            }
            else {
                for ( i = (lB-4)|0; (i|0) >= (lA|0); i = (i-4)|0 ) {
                    if ( HEAP32[(B+i)>>2]|0 ) return -1;
                }
            }

            for ( ; (i|0) >= 0; i = (i-4)|0 ) {
                a = HEAP32[(A+i)>>2]|0, b = HEAP32[(B+i)>>2]|0;
                if ( (a>>>0) < (b>>>0) ) return -1;
                if ( (a>>>0) > (b>>>0) ) return 1;
            }

            return 0;
        }

        /**
         * Test the argument
         *
         * Same as `cmp` with zero.
         */
        function tst ( A, lA ) {
            A  =  A|0;
            lA = lA|0;

            var i = 0;

            for ( i = (lA-4)|0; (i|0) >= 0; i = (i-4)|0 ) {
                if ( HEAP32[(A+i)>>2]|0 ) return (i+4)|0;
            }

            return 0;
        }

        /**
         * Conventional addition
         *
         * @param A offset of the first argument, 32-byte aligned
         * @param lA length of the first argument, multiple of 32
         *
         * @param B offset of the second argument, 32-bit aligned
         * @param lB length of the second argument, multiple of 32
         *
         * @param R offset where to place the result to, 32-byte aligned
         * @param lR length to truncate the result to, multiple of 32
         */
        function add ( A, lA, B, lB, R, lR ) {
            A  =  A|0;
            lA = lA|0;
            B  =  B|0;
            lB = lB|0;
            R  =  R|0;
            lR = lR|0;

            var a = 0, b = 0, c = 0, t = 0, r = 0, i = 0;

            if ( (lA|0) < (lB|0) ) {
                t = A, A = B, B = t;
                t = lA, lA = lB, lB = t;
            }

            if ( (lR|0) <= 0 )
                lR = lA+4|0;

            if ( (lR|0) < (lB|0) )
                lA = lB = lR;

            for ( ; (i|0) < (lB|0); i = (i+4)|0 ) {
                a = HEAP32[(A+i)>>2]|0;
                b = HEAP32[(B+i)>>2]|0;
                t = ( (a & 0xffff) + (b & 0xffff)|0 ) + c|0;
                r = ( (a >>> 16) + (b >>> 16)|0 ) + (t >>> 16)|0;
                HEAP32[(R+i)>>2] = (t & 0xffff) | (r << 16);
                c = r >>> 16;
            }

            for ( ; (i|0) < (lA|0); i = (i+4)|0 ) {
                a = HEAP32[(A+i)>>2]|0;
                t = (a & 0xffff) + c|0;
                r = (a >>> 16) + (t >>> 16)|0;
                HEAP32[(R+i)>>2] = (t & 0xffff) | (r << 16);
                c = r >>> 16;
            }

            for ( ; (i|0) < (lR|0); i = (i+4)|0 ) {
                HEAP32[(R+i)>>2] = c|0;
                c = 0;
            }

            return c|0;
        }

       /**
         * Conventional subtraction
         *
         * @param A offset of the first argument, 32-byte aligned
         * @param lA length of the first argument, multiple of 32
         *
         * @param B offset of the second argument, 32-bit aligned
         * @param lB length of the second argument, multiple of 32
         *
         * @param R offset where to place the result to, 32-byte aligned
         * @param lR length to truncate the result to, multiple of 32
         */
        function sub ( A, lA, B, lB, R, lR ) {
            A  =  A|0;
            lA = lA|0;
            B  =  B|0;
            lB = lB|0;
            R  =  R|0;
            lR = lR|0;

            var a = 0, b = 0, c = 0, t = 0, r = 0, i = 0;

            if ( (lR|0) <= 0 )
                lR = (lA|0) > (lB|0) ? lA+4|0 : lB+4|0;

            if ( (lR|0) < (lA|0) )
                lA = lR;

            if ( (lR|0) < (lB|0) )
                lB = lR;

            if ( (lA|0) < (lB|0) ) {
                for ( ; (i|0) < (lA|0); i = (i+4)|0 ) {
                    a = HEAP32[(A+i)>>2]|0;
                    b = HEAP32[(B+i)>>2]|0;
                    t = ( (a & 0xffff) - (b & 0xffff)|0 ) + c|0;
                    r = ( (a >>> 16) - (b >>> 16)|0 ) + (t >> 16)|0;
                    HEAP32[(R+i)>>2] = (t & 0xffff) | (r << 16);
                    c = r >> 16;
                }

                for ( ; (i|0) < (lB|0); i = (i+4)|0 ) {
                    b = HEAP32[(B+i)>>2]|0;
                    t = c - (b & 0xffff)|0;
                    r = (t >> 16) - (b >>> 16)|0;
                    HEAP32[(R+i)>>2] = (t & 0xffff) | (r << 16);
                    c = r >> 16;
                }
            }
            else {
                for ( ; (i|0) < (lB|0); i = (i+4)|0 ) {
                    a = HEAP32[(A+i)>>2]|0;
                    b = HEAP32[(B+i)>>2]|0;
                    t = ( (a & 0xffff) - (b & 0xffff)|0 ) + c|0;
                    r = ( (a >>> 16) - (b >>> 16)|0 ) + (t >> 16)|0;
                    HEAP32[(R+i)>>2] = (t & 0xffff) | (r << 16);
                    c = r >> 16;
                }

                for ( ; (i|0) < (lA|0); i = (i+4)|0 ) {
                    a = HEAP32[(A+i)>>2]|0;
                    t = (a & 0xffff) + c|0;
                    r = (a >>> 16) + (t >> 16)|0;
                    HEAP32[(R+i)>>2] = (t & 0xffff) | (r << 16);
                    c = r >> 16;
                }
            }

            for ( ; (i|0) < (lR|0); i = (i+4)|0 ) {
                HEAP32[(R+i)>>2] = c|0;
            }

            return c|0;
        }

        /**
         * Conventional multiplication
         *
         * TODO implement Karatsuba algorithm for large multiplicands
         *
         * @param A offset of the first argument, 32-byte aligned
         * @param lA length of the first argument, multiple of 32
         *
         * @param B offset of the second argument, 32-byte aligned
         * @param lB length of the second argument, multiple of 32
         *
         * @param R offset where to place the result to, 32-byte aligned
         * @param lR length to truncate the result to, multiple of 32
         */
        function mul ( A, lA, B, lB, R, lR ) {
            A  =  A|0;
            lA = lA|0;
            B  =  B|0;
            lB = lB|0;
            R  =  R|0;
            lR = lR|0;

            var al0 = 0, al1 = 0, al2 = 0, al3 = 0, al4 = 0, al5 = 0, al6 = 0, al7 = 0, ah0 = 0, ah1 = 0, ah2 = 0, ah3 = 0, ah4 = 0, ah5 = 0, ah6 = 0, ah7 = 0,
                bl0 = 0, bl1 = 0, bl2 = 0, bl3 = 0, bl4 = 0, bl5 = 0, bl6 = 0, bl7 = 0, bh0 = 0, bh1 = 0, bh2 = 0, bh3 = 0, bh4 = 0, bh5 = 0, bh6 = 0, bh7 = 0,
                r0 = 0, r1 = 0, r2 = 0, r3 = 0, r4 = 0, r5 = 0, r6 = 0, r7 = 0, r8 = 0, r9 = 0, r10 = 0, r11 = 0, r12 = 0, r13 = 0, r14 = 0, r15 = 0,
                u = 0, v = 0, w = 0, m = 0,
                i = 0, Ai = 0, j = 0, Bj = 0, Rk = 0;

            if ( (lA|0) > (lB|0) ) {
                u = A, v = lA;
                A = B, lA = lB;
                B = u, lB = v;
            }

            m = (lA+lB)|0;
            if ( ( (lR|0) > (m|0) ) | ( (lR|0) <= 0 ) )
                lR = m;

            if ( (lR|0) < (lA|0) )
                lA = lR;

            if ( (lR|0) < (lB|0) )
                lB = lR;

            for ( ; (i|0) < (lA|0); i = (i+32)|0 ) {
                Ai = (A+i)|0;

                ah0 = HEAP32[(Ai|0)>>2]|0,
                ah1 = HEAP32[(Ai|4)>>2]|0,
                ah2 = HEAP32[(Ai|8)>>2]|0,
                ah3 = HEAP32[(Ai|12)>>2]|0,
                ah4 = HEAP32[(Ai|16)>>2]|0,
                ah5 = HEAP32[(Ai|20)>>2]|0,
                ah6 = HEAP32[(Ai|24)>>2]|0,
                ah7 = HEAP32[(Ai|28)>>2]|0,
                al0 = ah0 & 0xffff,
                al1 = ah1 & 0xffff,
                al2 = ah2 & 0xffff,
                al3 = ah3 & 0xffff,
                al4 = ah4 & 0xffff,
                al5 = ah5 & 0xffff,
                al6 = ah6 & 0xffff,
                al7 = ah7 & 0xffff,
                ah0 = ah0 >>> 16,
                ah1 = ah1 >>> 16,
                ah2 = ah2 >>> 16,
                ah3 = ah3 >>> 16,
                ah4 = ah4 >>> 16,
                ah5 = ah5 >>> 16,
                ah6 = ah6 >>> 16,
                ah7 = ah7 >>> 16;

                r8 = r9 = r10 = r11 = r12 = r13 = r14 = r15 = 0;

                for ( j = 0; (j|0) < (lB|0); j = (j+32)|0 ) {
                    Bj = (B+j)|0;
                    Rk = (R+(i+j|0))|0;

                    bh0 = HEAP32[(Bj|0)>>2]|0,
                    bh1 = HEAP32[(Bj|4)>>2]|0,
                    bh2 = HEAP32[(Bj|8)>>2]|0,
                    bh3 = HEAP32[(Bj|12)>>2]|0,
                    bh4 = HEAP32[(Bj|16)>>2]|0,
                    bh5 = HEAP32[(Bj|20)>>2]|0,
                    bh6 = HEAP32[(Bj|24)>>2]|0,
                    bh7 = HEAP32[(Bj|28)>>2]|0,
                    bl0 = bh0 & 0xffff,
                    bl1 = bh1 & 0xffff,
                    bl2 = bh2 & 0xffff,
                    bl3 = bh3 & 0xffff,
                    bl4 = bh4 & 0xffff,
                    bl5 = bh5 & 0xffff,
                    bl6 = bh6 & 0xffff,
                    bl7 = bh7 & 0xffff,
                    bh0 = bh0 >>> 16,
                    bh1 = bh1 >>> 16,
                    bh2 = bh2 >>> 16,
                    bh3 = bh3 >>> 16,
                    bh4 = bh4 >>> 16,
                    bh5 = bh5 >>> 16,
                    bh6 = bh6 >>> 16,
                    bh7 = bh7 >>> 16;

                    r0 = HEAP32[(Rk|0)>>2]|0,
                    r1 = HEAP32[(Rk|4)>>2]|0,
                    r2 = HEAP32[(Rk|8)>>2]|0,
                    r3 = HEAP32[(Rk|12)>>2]|0,
                    r4 = HEAP32[(Rk|16)>>2]|0,
                    r5 = HEAP32[(Rk|20)>>2]|0,
                    r6 = HEAP32[(Rk|24)>>2]|0,
                    r7 = HEAP32[(Rk|28)>>2]|0;

                    u = ((imul(al0, bl0)|0) + (r8 & 0xffff)|0) + (r0 & 0xffff)|0;
                    v = ((imul(ah0, bl0)|0) + (r8 >>> 16)|0) + (r0 >>> 16)|0;
                    w = ((imul(al0, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah0, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r0 = (w << 16) | (u & 0xffff);

                    u = ((imul(al0, bl1)|0) + (m & 0xffff)|0) + (r1 & 0xffff)|0;
                    v = ((imul(ah0, bl1)|0) + (m >>> 16)|0) + (r1 >>> 16)|0;
                    w = ((imul(al0, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah0, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r1 = (w << 16) | (u & 0xffff);

                    u = ((imul(al0, bl2)|0) + (m & 0xffff)|0) + (r2 & 0xffff)|0;
                    v = ((imul(ah0, bl2)|0) + (m >>> 16)|0) + (r2 >>> 16)|0;
                    w = ((imul(al0, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah0, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r2 = (w << 16) | (u & 0xffff);

                    u = ((imul(al0, bl3)|0) + (m & 0xffff)|0) + (r3 & 0xffff)|0;
                    v = ((imul(ah0, bl3)|0) + (m >>> 16)|0) + (r3 >>> 16)|0;
                    w = ((imul(al0, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah0, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r3 = (w << 16) | (u & 0xffff);

                    u = ((imul(al0, bl4)|0) + (m & 0xffff)|0) + (r4 & 0xffff)|0;
                    v = ((imul(ah0, bl4)|0) + (m >>> 16)|0) + (r4 >>> 16)|0;
                    w = ((imul(al0, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah0, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r4 = (w << 16) | (u & 0xffff);

                    u = ((imul(al0, bl5)|0) + (m & 0xffff)|0) + (r5 & 0xffff)|0;
                    v = ((imul(ah0, bl5)|0) + (m >>> 16)|0) + (r5 >>> 16)|0;
                    w = ((imul(al0, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah0, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r5 = (w << 16) | (u & 0xffff);

                    u = ((imul(al0, bl6)|0) + (m & 0xffff)|0) + (r6 & 0xffff)|0;
                    v = ((imul(ah0, bl6)|0) + (m >>> 16)|0) + (r6 >>> 16)|0;
                    w = ((imul(al0, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah0, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r6 = (w << 16) | (u & 0xffff);

                    u = ((imul(al0, bl7)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                    v = ((imul(ah0, bl7)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                    w = ((imul(al0, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah0, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r7 = (w << 16) | (u & 0xffff);

                    r8 = m;

                    u = ((imul(al1, bl0)|0) + (r9 & 0xffff)|0) + (r1 & 0xffff)|0;
                    v = ((imul(ah1, bl0)|0) + (r9 >>> 16)|0) + (r1 >>> 16)|0;
                    w = ((imul(al1, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah1, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r1 = (w << 16) | (u & 0xffff);

                    u = ((imul(al1, bl1)|0) + (m & 0xffff)|0) + (r2 & 0xffff)|0;
                    v = ((imul(ah1, bl1)|0) + (m >>> 16)|0) + (r2 >>> 16)|0;
                    w = ((imul(al1, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah1, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r2 = (w << 16) | (u & 0xffff);

                    u = ((imul(al1, bl2)|0) + (m & 0xffff)|0) + (r3 & 0xffff)|0;
                    v = ((imul(ah1, bl2)|0) + (m >>> 16)|0) + (r3 >>> 16)|0;
                    w = ((imul(al1, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah1, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r3 = (w << 16) | (u & 0xffff);

                    u = ((imul(al1, bl3)|0) + (m & 0xffff)|0) + (r4 & 0xffff)|0;
                    v = ((imul(ah1, bl3)|0) + (m >>> 16)|0) + (r4 >>> 16)|0;
                    w = ((imul(al1, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah1, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r4 = (w << 16) | (u & 0xffff);

                    u = ((imul(al1, bl4)|0) + (m & 0xffff)|0) + (r5 & 0xffff)|0;
                    v = ((imul(ah1, bl4)|0) + (m >>> 16)|0) + (r5 >>> 16)|0;
                    w = ((imul(al1, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah1, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r5 = (w << 16) | (u & 0xffff);

                    u = ((imul(al1, bl5)|0) + (m & 0xffff)|0) + (r6 & 0xffff)|0;
                    v = ((imul(ah1, bl5)|0) + (m >>> 16)|0) + (r6 >>> 16)|0;
                    w = ((imul(al1, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah1, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r6 = (w << 16) | (u & 0xffff);

                    u = ((imul(al1, bl6)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                    v = ((imul(ah1, bl6)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                    w = ((imul(al1, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah1, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r7 = (w << 16) | (u & 0xffff);

                    u = ((imul(al1, bl7)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                    v = ((imul(ah1, bl7)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                    w = ((imul(al1, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah1, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r8 = (w << 16) | (u & 0xffff);

                    r9 = m;

                    u = ((imul(al2, bl0)|0) + (r10 & 0xffff)|0) + (r2 & 0xffff)|0;
                    v = ((imul(ah2, bl0)|0) + (r10 >>> 16)|0) + (r2 >>> 16)|0;
                    w = ((imul(al2, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah2, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r2 = (w << 16) | (u & 0xffff);

                    u = ((imul(al2, bl1)|0) + (m & 0xffff)|0) + (r3 & 0xffff)|0;
                    v = ((imul(ah2, bl1)|0) + (m >>> 16)|0) + (r3 >>> 16)|0;
                    w = ((imul(al2, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah2, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r3 = (w << 16) | (u & 0xffff);

                    u = ((imul(al2, bl2)|0) + (m & 0xffff)|0) + (r4 & 0xffff)|0;
                    v = ((imul(ah2, bl2)|0) + (m >>> 16)|0) + (r4 >>> 16)|0;
                    w = ((imul(al2, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah2, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r4 = (w << 16) | (u & 0xffff);

                    u = ((imul(al2, bl3)|0) + (m & 0xffff)|0) + (r5 & 0xffff)|0;
                    v = ((imul(ah2, bl3)|0) + (m >>> 16)|0) + (r5 >>> 16)|0;
                    w = ((imul(al2, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah2, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r5 = (w << 16) | (u & 0xffff);

                    u = ((imul(al2, bl4)|0) + (m & 0xffff)|0) + (r6 & 0xffff)|0;
                    v = ((imul(ah2, bl4)|0) + (m >>> 16)|0) + (r6 >>> 16)|0;
                    w = ((imul(al2, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah2, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r6 = (w << 16) | (u & 0xffff);

                    u = ((imul(al2, bl5)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                    v = ((imul(ah2, bl5)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                    w = ((imul(al2, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah2, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r7 = (w << 16) | (u & 0xffff);

                    u = ((imul(al2, bl6)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                    v = ((imul(ah2, bl6)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                    w = ((imul(al2, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah2, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r8 = (w << 16) | (u & 0xffff);

                    u = ((imul(al2, bl7)|0) + (m & 0xffff)|0) + (r9 & 0xffff)|0;
                    v = ((imul(ah2, bl7)|0) + (m >>> 16)|0) + (r9 >>> 16)|0;
                    w = ((imul(al2, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah2, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r9 = (w << 16) | (u & 0xffff);

                    r10 = m;

                    u = ((imul(al3, bl0)|0) + (r11 & 0xffff)|0) + (r3 & 0xffff)|0;
                    v = ((imul(ah3, bl0)|0) + (r11 >>> 16)|0) + (r3 >>> 16)|0;
                    w = ((imul(al3, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah3, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r3 = (w << 16) | (u & 0xffff);

                    u = ((imul(al3, bl1)|0) + (m & 0xffff)|0) + (r4 & 0xffff)|0;
                    v = ((imul(ah3, bl1)|0) + (m >>> 16)|0) + (r4 >>> 16)|0;
                    w = ((imul(al3, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah3, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r4 = (w << 16) | (u & 0xffff);

                    u = ((imul(al3, bl2)|0) + (m & 0xffff)|0) + (r5 & 0xffff)|0;
                    v = ((imul(ah3, bl2)|0) + (m >>> 16)|0) + (r5 >>> 16)|0;
                    w = ((imul(al3, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah3, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r5 = (w << 16) | (u & 0xffff);

                    u = ((imul(al3, bl3)|0) + (m & 0xffff)|0) + (r6 & 0xffff)|0;
                    v = ((imul(ah3, bl3)|0) + (m >>> 16)|0) + (r6 >>> 16)|0;
                    w = ((imul(al3, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah3, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r6 = (w << 16) | (u & 0xffff);

                    u = ((imul(al3, bl4)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                    v = ((imul(ah3, bl4)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                    w = ((imul(al3, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah3, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r7 = (w << 16) | (u & 0xffff);

                    u = ((imul(al3, bl5)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                    v = ((imul(ah3, bl5)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                    w = ((imul(al3, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah3, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r8 = (w << 16) | (u & 0xffff);

                    u = ((imul(al3, bl6)|0) + (m & 0xffff)|0) + (r9 & 0xffff)|0;
                    v = ((imul(ah3, bl6)|0) + (m >>> 16)|0) + (r9 >>> 16)|0;
                    w = ((imul(al3, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah3, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r9 = (w << 16) | (u & 0xffff);

                    u = ((imul(al3, bl7)|0) + (m & 0xffff)|0) + (r10 & 0xffff)|0;
                    v = ((imul(ah3, bl7)|0) + (m >>> 16)|0) + (r10 >>> 16)|0;
                    w = ((imul(al3, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah3, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r10 = (w << 16) | (u & 0xffff);

                    r11 = m;

                    u = ((imul(al4, bl0)|0) + (r12 & 0xffff)|0) + (r4 & 0xffff)|0;
                    v = ((imul(ah4, bl0)|0) + (r12 >>> 16)|0) + (r4 >>> 16)|0;
                    w = ((imul(al4, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah4, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r4 = (w << 16) | (u & 0xffff);

                    u = ((imul(al4, bl1)|0) + (m & 0xffff)|0) + (r5 & 0xffff)|0;
                    v = ((imul(ah4, bl1)|0) + (m >>> 16)|0) + (r5 >>> 16)|0;
                    w = ((imul(al4, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah4, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r5 = (w << 16) | (u & 0xffff);

                    u = ((imul(al4, bl2)|0) + (m & 0xffff)|0) + (r6 & 0xffff)|0;
                    v = ((imul(ah4, bl2)|0) + (m >>> 16)|0) + (r6 >>> 16)|0;
                    w = ((imul(al4, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah4, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r6 = (w << 16) | (u & 0xffff);

                    u = ((imul(al4, bl3)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                    v = ((imul(ah4, bl3)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                    w = ((imul(al4, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah4, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r7 = (w << 16) | (u & 0xffff);

                    u = ((imul(al4, bl4)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                    v = ((imul(ah4, bl4)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                    w = ((imul(al4, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah4, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r8 = (w << 16) | (u & 0xffff);

                    u = ((imul(al4, bl5)|0) + (m & 0xffff)|0) + (r9 & 0xffff)|0;
                    v = ((imul(ah4, bl5)|0) + (m >>> 16)|0) + (r9 >>> 16)|0;
                    w = ((imul(al4, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah4, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r9 = (w << 16) | (u & 0xffff);

                    u = ((imul(al4, bl6)|0) + (m & 0xffff)|0) + (r10 & 0xffff)|0;
                    v = ((imul(ah4, bl6)|0) + (m >>> 16)|0) + (r10 >>> 16)|0;
                    w = ((imul(al4, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah4, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r10 = (w << 16) | (u & 0xffff);

                    u = ((imul(al4, bl7)|0) + (m & 0xffff)|0) + (r11 & 0xffff)|0;
                    v = ((imul(ah4, bl7)|0) + (m >>> 16)|0) + (r11 >>> 16)|0;
                    w = ((imul(al4, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah4, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r11 = (w << 16) | (u & 0xffff);

                    r12 = m;

                    u = ((imul(al5, bl0)|0) + (r13 & 0xffff)|0) + (r5 & 0xffff)|0;
                    v = ((imul(ah5, bl0)|0) + (r13 >>> 16)|0) + (r5 >>> 16)|0;
                    w = ((imul(al5, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah5, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r5 = (w << 16) | (u & 0xffff);

                    u = ((imul(al5, bl1)|0) + (m & 0xffff)|0) + (r6 & 0xffff)|0;
                    v = ((imul(ah5, bl1)|0) + (m >>> 16)|0) + (r6 >>> 16)|0;
                    w = ((imul(al5, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah5, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r6 = (w << 16) | (u & 0xffff);

                    u = ((imul(al5, bl2)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                    v = ((imul(ah5, bl2)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                    w = ((imul(al5, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah5, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r7 = (w << 16) | (u & 0xffff);

                    u = ((imul(al5, bl3)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                    v = ((imul(ah5, bl3)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                    w = ((imul(al5, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah5, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r8 = (w << 16) | (u & 0xffff);

                    u = ((imul(al5, bl4)|0) + (m & 0xffff)|0) + (r9 & 0xffff)|0;
                    v = ((imul(ah5, bl4)|0) + (m >>> 16)|0) + (r9 >>> 16)|0;
                    w = ((imul(al5, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah5, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r9 = (w << 16) | (u & 0xffff);

                    u = ((imul(al5, bl5)|0) + (m & 0xffff)|0) + (r10 & 0xffff)|0;
                    v = ((imul(ah5, bl5)|0) + (m >>> 16)|0) + (r10 >>> 16)|0;
                    w = ((imul(al5, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah5, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r10 = (w << 16) | (u & 0xffff);

                    u = ((imul(al5, bl6)|0) + (m & 0xffff)|0) + (r11 & 0xffff)|0;
                    v = ((imul(ah5, bl6)|0) + (m >>> 16)|0) + (r11 >>> 16)|0;
                    w = ((imul(al5, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah5, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r11 = (w << 16) | (u & 0xffff);

                    u = ((imul(al5, bl7)|0) + (m & 0xffff)|0) + (r12 & 0xffff)|0;
                    v = ((imul(ah5, bl7)|0) + (m >>> 16)|0) + (r12 >>> 16)|0;
                    w = ((imul(al5, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah5, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r12 = (w << 16) | (u & 0xffff);

                    r13 = m;

                    u = ((imul(al6, bl0)|0) + (r14 & 0xffff)|0) + (r6 & 0xffff)|0;
                    v = ((imul(ah6, bl0)|0) + (r14 >>> 16)|0) + (r6 >>> 16)|0;
                    w = ((imul(al6, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah6, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r6 = (w << 16) | (u & 0xffff);

                    u = ((imul(al6, bl1)|0) + (m & 0xffff)|0) + (r7 & 0xffff)|0;
                    v = ((imul(ah6, bl1)|0) + (m >>> 16)|0) + (r7 >>> 16)|0;
                    w = ((imul(al6, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah6, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r7 = (w << 16) | (u & 0xffff);

                    u = ((imul(al6, bl2)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                    v = ((imul(ah6, bl2)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                    w = ((imul(al6, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah6, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r8 = (w << 16) | (u & 0xffff);

                    u = ((imul(al6, bl3)|0) + (m & 0xffff)|0) + (r9 & 0xffff)|0;
                    v = ((imul(ah6, bl3)|0) + (m >>> 16)|0) + (r9 >>> 16)|0;
                    w = ((imul(al6, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah6, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r9 = (w << 16) | (u & 0xffff);

                    u = ((imul(al6, bl4)|0) + (m & 0xffff)|0) + (r10 & 0xffff)|0;
                    v = ((imul(ah6, bl4)|0) + (m >>> 16)|0) + (r10 >>> 16)|0;
                    w = ((imul(al6, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah6, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r10 = (w << 16) | (u & 0xffff);

                    u = ((imul(al6, bl5)|0) + (m & 0xffff)|0) + (r11 & 0xffff)|0;
                    v = ((imul(ah6, bl5)|0) + (m >>> 16)|0) + (r11 >>> 16)|0;
                    w = ((imul(al6, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah6, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r11 = (w << 16) | (u & 0xffff);

                    u = ((imul(al6, bl6)|0) + (m & 0xffff)|0) + (r12 & 0xffff)|0;
                    v = ((imul(ah6, bl6)|0) + (m >>> 16)|0) + (r12 >>> 16)|0;
                    w = ((imul(al6, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah6, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r12 = (w << 16) | (u & 0xffff);

                    u = ((imul(al6, bl7)|0) + (m & 0xffff)|0) + (r13 & 0xffff)|0;
                    v = ((imul(ah6, bl7)|0) + (m >>> 16)|0) + (r13 >>> 16)|0;
                    w = ((imul(al6, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah6, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r13 = (w << 16) | (u & 0xffff);

                    r14 = m;

                    u = ((imul(al7, bl0)|0) + (r15 & 0xffff)|0) + (r7 & 0xffff)|0;
                    v = ((imul(ah7, bl0)|0) + (r15 >>> 16)|0) + (r7 >>> 16)|0;
                    w = ((imul(al7, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah7, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r7 = (w << 16) | (u & 0xffff);

                    u = ((imul(al7, bl1)|0) + (m & 0xffff)|0) + (r8 & 0xffff)|0;
                    v = ((imul(ah7, bl1)|0) + (m >>> 16)|0) + (r8 >>> 16)|0;
                    w = ((imul(al7, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah7, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r8 = (w << 16) | (u & 0xffff);

                    u = ((imul(al7, bl2)|0) + (m & 0xffff)|0) + (r9 & 0xffff)|0;
                    v = ((imul(ah7, bl2)|0) + (m >>> 16)|0) + (r9 >>> 16)|0;
                    w = ((imul(al7, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah7, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r9 = (w << 16) | (u & 0xffff);

                    u = ((imul(al7, bl3)|0) + (m & 0xffff)|0) + (r10 & 0xffff)|0;
                    v = ((imul(ah7, bl3)|0) + (m >>> 16)|0) + (r10 >>> 16)|0;
                    w = ((imul(al7, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah7, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r10 = (w << 16) | (u & 0xffff);

                    u = ((imul(al7, bl4)|0) + (m & 0xffff)|0) + (r11 & 0xffff)|0;
                    v = ((imul(ah7, bl4)|0) + (m >>> 16)|0) + (r11 >>> 16)|0;
                    w = ((imul(al7, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah7, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r11 = (w << 16) | (u & 0xffff);

                    u = ((imul(al7, bl5)|0) + (m & 0xffff)|0) + (r12 & 0xffff)|0;
                    v = ((imul(ah7, bl5)|0) + (m >>> 16)|0) + (r12 >>> 16)|0;
                    w = ((imul(al7, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah7, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r12 = (w << 16) | (u & 0xffff);

                    u = ((imul(al7, bl6)|0) + (m & 0xffff)|0) + (r13 & 0xffff)|0;
                    v = ((imul(ah7, bl6)|0) + (m >>> 16)|0) + (r13 >>> 16)|0;
                    w = ((imul(al7, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah7, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r13 = (w << 16) | (u & 0xffff);

                    u = ((imul(al7, bl7)|0) + (m & 0xffff)|0) + (r14 & 0xffff)|0;
                    v = ((imul(ah7, bl7)|0) + (m >>> 16)|0) + (r14 >>> 16)|0;
                    w = ((imul(al7, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah7, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r14 = (w << 16) | (u & 0xffff);

                    r15 = m;

                    HEAP32[(Rk|0)>>2] = r0,
                    HEAP32[(Rk|4)>>2] = r1,
                    HEAP32[(Rk|8)>>2] = r2,
                    HEAP32[(Rk|12)>>2] = r3,
                    HEAP32[(Rk|16)>>2] = r4,
                    HEAP32[(Rk|20)>>2] = r5,
                    HEAP32[(Rk|24)>>2] = r6,
                    HEAP32[(Rk|28)>>2] = r7;
                }

                Rk = (R+(i+j|0))|0;
                HEAP32[(Rk|0)>>2] = r8,
                HEAP32[(Rk|4)>>2] = r9,
                HEAP32[(Rk|8)>>2] = r10,
                HEAP32[(Rk|12)>>2] = r11,
                HEAP32[(Rk|16)>>2] = r12,
                HEAP32[(Rk|20)>>2] = r13,
                HEAP32[(Rk|24)>>2] = r14,
                HEAP32[(Rk|28)>>2] = r15;
            }
    /*
            for ( i = lA & -32; (i|0) < (lA|0); i = (i+4)|0 ) {
                Ai = (A+i)|0;

                ah0 = HEAP32[Ai>>2]|0,
                al0 = ah0 & 0xffff,
                ah0 = ah0 >>> 16;

                r1 = 0;

                for ( j = 0; (j|0) < (lB|0); j = (j+4)|0 ) {
                    Bj = (B+j)|0;
                    Rk = (R+(i+j|0))|0;

                    bh0 = HEAP32[Bj>>2]|0,
                    bl0 = bh0 & 0xffff,
                    bh0 = bh0 >>> 16;

                    r0 = HEAP32[Rk>>2]|0;

                    u = ((imul(al0, bl0)|0) + (r1 & 0xffff)|0) + (r0 & 0xffff)|0;
                    v = ((imul(ah0, bl0)|0) + (r1 >>> 16)|0) + (r0 >>> 16)|0;
                    w = ((imul(al0, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                    m = ((imul(ah0, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                    r0 = (w << 16) | (u & 0xffff);

                    r1 = m;

                    HEAP32[Rk>>2] = r0;
                }

                Rk = (R+(i+j|0))|0;
                HEAP32[Rk>>2] = r1;
            }
    */
        }

        /**
         * Fast squaring
         *
         * Exploits the fact:
         *
         *  X² = ( X0 + X1*B )² = X0² + 2*X0*X1*B + X1²*B²,
         *
         * where B is a power of 2, so:
         *
         *  2*X0*X1*B = (X0*X1 << 1)*B
         *
         * @param A offset of the argument being squared, 32-byte aligned
         * @param lA length of the argument, multiple of 32
         *
         * @param R offset where to place the result to, 32-byte aligned
         */
        function sqr ( A, lA, R ) {
            A  =  A|0;
            lA = lA|0;
            R  =  R|0;

            var al0 = 0, al1 = 0, al2 = 0, al3 = 0, al4 = 0, al5 = 0, al6 = 0, al7 = 0, ah0 = 0, ah1 = 0, ah2 = 0, ah3 = 0, ah4 = 0, ah5 = 0, ah6 = 0, ah7 = 0,
                bl0 = 0, bl1 = 0, bl2 = 0, bl3 = 0, bl4 = 0, bl5 = 0, bl6 = 0, bl7 = 0, bh0 = 0, bh1 = 0, bh2 = 0, bh3 = 0, bh4 = 0, bh5 = 0, bh6 = 0, bh7 = 0,
                r0 = 0, r1 = 0, r2 = 0, r3 = 0, r4 = 0, r5 = 0, r6 = 0, r7 = 0, r8 = 0, r9 = 0, r10 = 0, r11 = 0, r12 = 0, r13 = 0, r14 = 0, r15 = 0,
                u = 0, v = 0, w = 0, c = 0, h = 0, m = 0, r = 0,
                d = 0, dd = 0, p = 0, i = 0, j = 0, k = 0, Ai = 0, Aj = 0, Rk = 0;

            // prepare for iterations
            for ( ; (i|0) < (lA|0); i = (i+4)|0 ) {
                Rk = R+(i<<1)|0;
                ah0 = HEAP32[(A+i)>>2]|0, al0 = ah0 & 0xffff, ah0 = ah0 >>> 16;
                u = imul(al0,al0)|0;
                v = (imul(al0,ah0)|0) + (u >>> 17)|0;
                w = (imul(ah0,ah0)|0) + (v >>> 15)|0;
                HEAP32[(Rk)>>2] = (v << 17) | (u & 0x1ffff);
                HEAP32[(Rk|4)>>2] = w;
            }

            // unrolled 1st iteration
            for ( p = 0; (p|0) < (lA|0); p = (p+8)|0 ) {
                Ai = A+p|0, Rk = R+(p<<1)|0;

                ah0 = HEAP32[(Ai)>>2]|0, al0 = ah0 & 0xffff, ah0 = ah0 >>> 16;

                bh0 = HEAP32[(Ai|4)>>2]|0, bl0 = bh0 & 0xffff, bh0 = bh0 >>> 16;

                u = imul(al0,bl0)|0;
                v = (imul(al0,bh0)|0) + (u >>> 16)|0;
                w = (imul(ah0,bl0)|0) + (v & 0xffff)|0;
                m = ((imul(ah0,bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;

                r = HEAP32[(Rk|4)>>2]|0;
                u = (r & 0xffff) + ((u & 0xffff) << 1)|0;
                w = ((r >>> 16) + ((w & 0xffff) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk|4)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                r = HEAP32[(Rk|8)>>2]|0;
                u = ((r & 0xffff) + ((m & 0xffff) << 1)|0) + c|0;
                w = ((r >>> 16) + ((m >>> 16) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk|8)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                if ( c ) {
                    r = HEAP32[(Rk|12)>>2]|0;
                    u = (r & 0xffff) + c|0;
                    w = (r >>> 16) + (u >>> 16)|0;
                    HEAP32[(Rk|12)>>2] = (w << 16) | (u & 0xffff);
                }
            }

            // unrolled 2nd iteration
            for ( p = 0; (p|0) < (lA|0); p = (p+16)|0 ) {
                Ai = A+p|0, Rk = R+(p<<1)|0;

                ah0 = HEAP32[(Ai)>>2]|0, al0 = ah0 & 0xffff, ah0 = ah0 >>> 16,
                ah1 = HEAP32[(Ai|4)>>2]|0, al1 = ah1 & 0xffff, ah1 = ah1 >>> 16;

                bh0 = HEAP32[(Ai|8)>>2]|0, bl0 = bh0 & 0xffff, bh0 = bh0 >>> 16,
                bh1 = HEAP32[(Ai|12)>>2]|0, bl1 = bh1 & 0xffff, bh1 = bh1 >>> 16;

                u = imul(al0, bl0)|0;
                v = imul(ah0, bl0)|0;
                w = ((imul(al0, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah0, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r0 = (w << 16) | (u & 0xffff);

                u = (imul(al0, bl1)|0) + (m & 0xffff)|0;
                v = (imul(ah0, bl1)|0) + (m >>> 16)|0;
                w = ((imul(al0, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah0, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r1 = (w << 16) | (u & 0xffff);

                r2 = m;

                u = (imul(al1, bl0)|0) + (r1 & 0xffff)|0;
                v = (imul(ah1, bl0)|0) + (r1 >>> 16)|0;
                w = ((imul(al1, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah1, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r1 = (w << 16) | (u & 0xffff);

                u = ((imul(al1, bl1)|0) + (r2 & 0xffff)|0) + (m & 0xffff)|0;
                v = ((imul(ah1, bl1)|0) + (r2 >>> 16)|0) + (m >>> 16)|0;
                w = ((imul(al1, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah1, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r2 = (w << 16) | (u & 0xffff);

                r3 = m;

                r = HEAP32[(Rk|8)>>2]|0;
                u = (r & 0xffff) + ((r0 & 0xffff) << 1)|0;
                w = ((r >>> 16) + ((r0 >>> 16) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk|8)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                r = HEAP32[(Rk|12)>>2]|0;
                u = ((r & 0xffff) + ((r1 & 0xffff) << 1)|0)  + c|0;
                w = ((r >>> 16) + ((r1 >>> 16) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk|12)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                r = HEAP32[(Rk|16)>>2]|0;
                u = ((r & 0xffff) + ((r2 & 0xffff) << 1)|0) + c|0;
                w = ((r >>> 16) + ((r2 >>> 16) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk|16)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                r = HEAP32[(Rk|20)>>2]|0;
                u = ((r & 0xffff) + ((r3 & 0xffff) << 1)|0) + c|0;
                w = ((r >>> 16) + ((r3 >>> 16) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk|20)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                for ( k = 24; !!c & ( (k|0) < 32 ); k = (k+4)|0 ) {
                    r = HEAP32[(Rk|k)>>2]|0;
                    u = (r & 0xffff) + c|0;
                    w = (r >>> 16) + (u >>> 16)|0;
                    HEAP32[(Rk|k)>>2] = (w << 16) | (u & 0xffff);
                    c = w >>> 16;
                }
            }

            // unrolled 3rd iteration
            for ( p = 0; (p|0) < (lA|0); p = (p+32)|0 ) {
                Ai = A+p|0, Rk = R+(p<<1)|0;

                ah0 = HEAP32[(Ai)>>2]|0, al0 = ah0 & 0xffff, ah0 = ah0 >>> 16,
                ah1 = HEAP32[(Ai|4)>>2]|0, al1 = ah1 & 0xffff, ah1 = ah1 >>> 16,
                ah2 = HEAP32[(Ai|8)>>2]|0, al2 = ah2 & 0xffff, ah2 = ah2 >>> 16,
                ah3 = HEAP32[(Ai|12)>>2]|0, al3 = ah3 & 0xffff, ah3 = ah3 >>> 16;

                bh0 = HEAP32[(Ai|16)>>2]|0, bl0 = bh0 & 0xffff, bh0 = bh0 >>> 16,
                bh1 = HEAP32[(Ai|20)>>2]|0, bl1 = bh1 & 0xffff, bh1 = bh1 >>> 16,
                bh2 = HEAP32[(Ai|24)>>2]|0, bl2 = bh2 & 0xffff, bh2 = bh2 >>> 16,
                bh3 = HEAP32[(Ai|28)>>2]|0, bl3 = bh3 & 0xffff, bh3 = bh3 >>> 16;

                u = imul(al0, bl0)|0;
                v = imul(ah0, bl0)|0;
                w = ((imul(al0, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah0, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r0 = (w << 16) | (u & 0xffff);

                u = (imul(al0, bl1)|0) + (m & 0xffff)|0;
                v = (imul(ah0, bl1)|0) + (m >>> 16)|0;
                w = ((imul(al0, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah0, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r1 = (w << 16) | (u & 0xffff);

                u = (imul(al0, bl2)|0) + (m & 0xffff)|0;
                v = (imul(ah0, bl2)|0) + (m >>> 16)|0;
                w = ((imul(al0, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah0, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r2 = (w << 16) | (u & 0xffff);

                u = (imul(al0, bl3)|0) + (m & 0xffff)|0;
                v = (imul(ah0, bl3)|0) + (m >>> 16)|0;
                w = ((imul(al0, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah0, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r3 = (w << 16) | (u & 0xffff);

                r4 = m;

                u = (imul(al1, bl0)|0) + (r1 & 0xffff)|0;
                v = (imul(ah1, bl0)|0) + (r1 >>> 16)|0;
                w = ((imul(al1, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah1, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r1 = (w << 16) | (u & 0xffff);

                u = ((imul(al1, bl1)|0) + (r2 & 0xffff)|0) + (m & 0xffff)|0;
                v = ((imul(ah1, bl1)|0) + (r2 >>> 16)|0) + (m >>> 16)|0;
                w = ((imul(al1, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah1, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r2 = (w << 16) | (u & 0xffff);

                u = ((imul(al1, bl2)|0) + (r3 & 0xffff)|0) + (m & 0xffff)|0;
                v = ((imul(ah1, bl2)|0) + (r3 >>> 16)|0) + (m >>> 16)|0;
                w = ((imul(al1, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah1, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r3 = (w << 16) | (u & 0xffff);

                u = ((imul(al1, bl3)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                v = ((imul(ah1, bl3)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                w = ((imul(al1, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah1, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r4 = (w << 16) | (u & 0xffff);

                r5 = m;

                u = (imul(al2, bl0)|0) + (r2 & 0xffff)|0;
                v = (imul(ah2, bl0)|0) + (r2 >>> 16)|0;
                w = ((imul(al2, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah2, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r2 = (w << 16) | (u & 0xffff);

                u = ((imul(al2, bl1)|0) + (r3 & 0xffff)|0) + (m & 0xffff)|0;
                v = ((imul(ah2, bl1)|0) + (r3 >>> 16)|0) + (m >>> 16)|0;
                w = ((imul(al2, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah2, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r3 = (w << 16) | (u & 0xffff);

                u = ((imul(al2, bl2)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                v = ((imul(ah2, bl2)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                w = ((imul(al2, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah2, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r4 = (w << 16) | (u & 0xffff);

                u = ((imul(al2, bl3)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                v = ((imul(ah2, bl3)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                w = ((imul(al2, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah2, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r5 = (w << 16) | (u & 0xffff);

                r6 = m;

                u = (imul(al3, bl0)|0) + (r3 & 0xffff)|0;
                v = (imul(ah3, bl0)|0) + (r3 >>> 16)|0;
                w = ((imul(al3, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah3, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r3 = (w << 16) | (u & 0xffff);

                u = ((imul(al3, bl1)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                v = ((imul(ah3, bl1)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                w = ((imul(al3, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah3, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r4 = (w << 16) | (u & 0xffff);

                u = ((imul(al3, bl2)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                v = ((imul(ah3, bl2)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                w = ((imul(al3, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah3, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r5 = (w << 16) | (u & 0xffff);

                u = ((imul(al3, bl3)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                v = ((imul(ah3, bl3)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                w = ((imul(al3, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                m = ((imul(ah3, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                r6 = (w << 16) | (u & 0xffff);

                r7 = m;

                r = HEAP32[(Rk|16)>>2]|0;
                u = (r & 0xffff) + ((r0 & 0xffff) << 1)|0;
                w = ((r >>> 16) + ((r0 >>> 16) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk|16)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                r = HEAP32[(Rk|20)>>2]|0;
                u = ((r & 0xffff) + ((r1 & 0xffff) << 1)|0)  + c|0;
                w = ((r >>> 16) + ((r1 >>> 16) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk|20)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                r = HEAP32[(Rk|24)>>2]|0;
                u = ((r & 0xffff) + ((r2 & 0xffff) << 1)|0) + c|0;
                w = ((r >>> 16) + ((r2 >>> 16) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk|24)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                r = HEAP32[(Rk|28)>>2]|0;
                u = ((r & 0xffff) + ((r3 & 0xffff) << 1)|0) + c|0;
                w = ((r >>> 16) + ((r3 >>> 16) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk|28)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                r = HEAP32[(Rk+32)>>2]|0;
                u = ((r & 0xffff) + ((r4 & 0xffff) << 1)|0) + c|0;
                w = ((r >>> 16) + ((r4 >>> 16) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk+32)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                r = HEAP32[(Rk+36)>>2]|0;
                u = ((r & 0xffff) + ((r5 & 0xffff) << 1)|0) + c|0;
                w = ((r >>> 16) + ((r5 >>> 16) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk+36)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                r = HEAP32[(Rk+40)>>2]|0;
                u = ((r & 0xffff) + ((r6 & 0xffff) << 1)|0) + c|0;
                w = ((r >>> 16) + ((r6 >>> 16) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk+40)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                r = HEAP32[(Rk+44)>>2]|0;
                u = ((r & 0xffff) + ((r7 & 0xffff) << 1)|0) + c|0;
                w = ((r >>> 16) + ((r7 >>> 16) << 1)|0) + (u >>> 16)|0;
                HEAP32[(Rk+44)>>2] = (w << 16) | (u & 0xffff);
                c = w >>> 16;

                for ( k = 48; !!c & ( (k|0) < 64 ); k = (k+4)|0 ) {
                    r = HEAP32[(Rk+k)>>2]|0;
                    u = (r & 0xffff) + c|0;
                    w = (r >>> 16) + (u >>> 16)|0;
                    HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                    c = w >>> 16;
                }
            }

            // perform iterations
            for ( d = 32; (d|0) < (lA|0); d = d << 1 ) { // depth loop
                dd = d << 1;

                for ( p = 0; (p|0) < (lA|0); p = (p+dd)|0 ) { // part loop
                    Rk = R+(p<<1)|0;

                    h = 0;
                    for ( i = 0; (i|0) < (d|0); i = (i+32)|0 ) { // multiply-and-add loop
                        Ai = (A+p|0)+i|0;

                        ah0 = HEAP32[(Ai)>>2]|0, al0 = ah0 & 0xffff, ah0 = ah0 >>> 16,
                        ah1 = HEAP32[(Ai|4)>>2]|0, al1 = ah1 & 0xffff, ah1 = ah1 >>> 16,
                        ah2 = HEAP32[(Ai|8)>>2]|0, al2 = ah2 & 0xffff, ah2 = ah2 >>> 16,
                        ah3 = HEAP32[(Ai|12)>>2]|0, al3 = ah3 & 0xffff, ah3 = ah3 >>> 16,
                        ah4 = HEAP32[(Ai|16)>>2]|0, al4 = ah4 & 0xffff, ah4 = ah4 >>> 16,
                        ah5 = HEAP32[(Ai|20)>>2]|0, al5 = ah5 & 0xffff, ah5 = ah5 >>> 16,
                        ah6 = HEAP32[(Ai|24)>>2]|0, al6 = ah6 & 0xffff, ah6 = ah6 >>> 16,
                        ah7 = HEAP32[(Ai|28)>>2]|0, al7 = ah7 & 0xffff, ah7 = ah7 >>> 16;

                        r8 = r9 = r10 = r11 = r12 = r13 = r14 = r15 = c = 0;

                        for ( j = 0; (j|0) < (d|0); j = (j+32)|0 ) {
                            Aj = ((A+p|0)+d|0)+j|0;

                            bh0 = HEAP32[(Aj)>>2]|0, bl0 = bh0 & 0xffff, bh0 = bh0 >>> 16,
                            bh1 = HEAP32[(Aj|4)>>2]|0, bl1 = bh1 & 0xffff, bh1 = bh1 >>> 16,
                            bh2 = HEAP32[(Aj|8)>>2]|0, bl2 = bh2 & 0xffff, bh2 = bh2 >>> 16,
                            bh3 = HEAP32[(Aj|12)>>2]|0, bl3 = bh3 & 0xffff, bh3 = bh3 >>> 16,
                            bh4 = HEAP32[(Aj|16)>>2]|0, bl4 = bh4 & 0xffff, bh4 = bh4 >>> 16,
                            bh5 = HEAP32[(Aj|20)>>2]|0, bl5 = bh5 & 0xffff, bh5 = bh5 >>> 16,
                            bh6 = HEAP32[(Aj|24)>>2]|0, bl6 = bh6 & 0xffff, bh6 = bh6 >>> 16,
                            bh7 = HEAP32[(Aj|28)>>2]|0, bl7 = bh7 & 0xffff, bh7 = bh7 >>> 16;

                            r0 = r1 = r2 = r3 = r4 = r5 = r6 = r7 = 0;

                            u = ((imul(al0, bl0)|0) + (r0 & 0xffff)|0) + (r8 & 0xffff)|0;
                            v = ((imul(ah0, bl0)|0) + (r0 >>> 16)|0) + (r8 >>> 16)|0;
                            w = ((imul(al0, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r0 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl1)|0) + (r1 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah0, bl1)|0) + (r1 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al0, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r1 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl2)|0) + (r2 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah0, bl2)|0) + (r2 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al0, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r2 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl3)|0) + (r3 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah0, bl3)|0) + (r3 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al0, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r3 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl4)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah0, bl4)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al0, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r4 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl5)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah0, bl5)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al0, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r5 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl6)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah0, bl6)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al0, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al0, bl7)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah0, bl7)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al0, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah0, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            r8 = m;

                            u = ((imul(al1, bl0)|0) + (r1 & 0xffff)|0) + (r9 & 0xffff)|0;
                            v = ((imul(ah1, bl0)|0) + (r1 >>> 16)|0) + (r9 >>> 16)|0;
                            w = ((imul(al1, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r1 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl1)|0) + (r2 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah1, bl1)|0) + (r2 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al1, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r2 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl2)|0) + (r3 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah1, bl2)|0) + (r3 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al1, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r3 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl3)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah1, bl3)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al1, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r4 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl4)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah1, bl4)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al1, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r5 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl5)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah1, bl5)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al1, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl6)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah1, bl6)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al1, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al1, bl7)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah1, bl7)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al1, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah1, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            r9 = m;

                            u = ((imul(al2, bl0)|0) + (r2 & 0xffff)|0) + (r10 & 0xffff)|0;
                            v = ((imul(ah2, bl0)|0) + (r2 >>> 16)|0) + (r10 >>> 16)|0;
                            w = ((imul(al2, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r2 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl1)|0) + (r3 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah2, bl1)|0) + (r3 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al2, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r3 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl2)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah2, bl2)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al2, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r4 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl3)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah2, bl3)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al2, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r5 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl4)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah2, bl4)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al2, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl5)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah2, bl5)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al2, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl6)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah2, bl6)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al2, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            u = ((imul(al2, bl7)|0) + (r9 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah2, bl7)|0) + (r9 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al2, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah2, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r9 = (w << 16) | (u & 0xffff);

                            r10 = m;

                            u = ((imul(al3, bl0)|0) + (r3 & 0xffff)|0) + (r11 & 0xffff)|0;
                            v = ((imul(ah3, bl0)|0) + (r3 >>> 16)|0) + (r11 >>> 16)|0;
                            w = ((imul(al3, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r3 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl1)|0) + (r4 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah3, bl1)|0) + (r4 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al3, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r4 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl2)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah3, bl2)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al3, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r5 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl3)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah3, bl3)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al3, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl4)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah3, bl4)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al3, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl5)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah3, bl5)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al3, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl6)|0) + (r9 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah3, bl6)|0) + (r9 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al3, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r9 = (w << 16) | (u & 0xffff);

                            u = ((imul(al3, bl7)|0) + (r10 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah3, bl7)|0) + (r10 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al3, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah3, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r10 = (w << 16) | (u & 0xffff);

                            r11 = m;

                            u = ((imul(al4, bl0)|0) + (r4 & 0xffff)|0) + (r12 & 0xffff)|0;
                            v = ((imul(ah4, bl0)|0) + (r4 >>> 16)|0) + (r12 >>> 16)|0;
                            w = ((imul(al4, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r4 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl1)|0) + (r5 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah4, bl1)|0) + (r5 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al4, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r5 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl2)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah4, bl2)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al4, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl3)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah4, bl3)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al4, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl4)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah4, bl4)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al4, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl5)|0) + (r9 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah4, bl5)|0) + (r9 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al4, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r9 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl6)|0) + (r10 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah4, bl6)|0) + (r10 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al4, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r10 = (w << 16) | (u & 0xffff);

                            u = ((imul(al4, bl7)|0) + (r11 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah4, bl7)|0) + (r11 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al4, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah4, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r11 = (w << 16) | (u & 0xffff);

                            r12 = m;

                            u = ((imul(al5, bl0)|0) + (r5 & 0xffff)|0) + (r13 & 0xffff)|0;
                            v = ((imul(ah5, bl0)|0) + (r5 >>> 16)|0) + (r13 >>> 16)|0;
                            w = ((imul(al5, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r5 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl1)|0) + (r6 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah5, bl1)|0) + (r6 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al5, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl2)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah5, bl2)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al5, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl3)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah5, bl3)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al5, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl4)|0) + (r9 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah5, bl4)|0) + (r9 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al5, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r9 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl5)|0) + (r10 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah5, bl5)|0) + (r10 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al5, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r10 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl6)|0) + (r11 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah5, bl6)|0) + (r11 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al5, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r11 = (w << 16) | (u & 0xffff);

                            u = ((imul(al5, bl7)|0) + (r12 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah5, bl7)|0) + (r12 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al5, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah5, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r12 = (w << 16) | (u & 0xffff);

                            r13 = m;

                            u = ((imul(al6, bl0)|0) + (r6 & 0xffff)|0) + (r14 & 0xffff)|0;
                            v = ((imul(ah6, bl0)|0) + (r6 >>> 16)|0) + (r14 >>> 16)|0;
                            w = ((imul(al6, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r6 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl1)|0) + (r7 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah6, bl1)|0) + (r7 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al6, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl2)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah6, bl2)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al6, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl3)|0) + (r9 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah6, bl3)|0) + (r9 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al6, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r9 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl4)|0) + (r10 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah6, bl4)|0) + (r10 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al6, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r10 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl5)|0) + (r11 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah6, bl5)|0) + (r11 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al6, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r11 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl6)|0) + (r12 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah6, bl6)|0) + (r12 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al6, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r12 = (w << 16) | (u & 0xffff);

                            u = ((imul(al6, bl7)|0) + (r13 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah6, bl7)|0) + (r13 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al6, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah6, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r13 = (w << 16) | (u & 0xffff);

                            r14 = m;

                            u = ((imul(al7, bl0)|0) + (r7 & 0xffff)|0) + (r15 & 0xffff)|0;
                            v = ((imul(ah7, bl0)|0) + (r7 >>> 16)|0) + (r15 >>> 16)|0;
                            w = ((imul(al7, bh0)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh0)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r7 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl1)|0) + (r8 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah7, bl1)|0) + (r8 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al7, bh1)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh1)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r8 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl2)|0) + (r9 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah7, bl2)|0) + (r9 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al7, bh2)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh2)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r9 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl3)|0) + (r10 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah7, bl3)|0) + (r10 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al7, bh3)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh3)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r10 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl4)|0) + (r11 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah7, bl4)|0) + (r11 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al7, bh4)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh4)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r11 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl5)|0) + (r12 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah7, bl5)|0) + (r12 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al7, bh5)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh5)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r12 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl6)|0) + (r13 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah7, bl6)|0) + (r13 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al7, bh6)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh6)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r13 = (w << 16) | (u & 0xffff);

                            u = ((imul(al7, bl7)|0) + (r14 & 0xffff)|0) + (m & 0xffff)|0;
                            v = ((imul(ah7, bl7)|0) + (r14 >>> 16)|0) + (m >>> 16)|0;
                            w = ((imul(al7, bh7)|0) + (v & 0xffff)|0) + (u >>> 16)|0;
                            m = ((imul(ah7, bh7)|0) + (v >>> 16)|0) + (w >>> 16)|0;
                            r14 = (w << 16) | (u & 0xffff);

                            r15 = m;

                            k = d+(i+j|0)|0;
                            r = HEAP32[(Rk+k)>>2]|0;
                            u = ((r & 0xffff) + ((r0 & 0xffff) << 1)|0) + c|0;
                            w = ((r >>> 16) + ((r0 >>> 16) << 1)|0) + (u >>> 16)|0;
                            HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                            c = w >>> 16;

                            k = k+4|0;
                            r = HEAP32[(Rk+k)>>2]|0;
                            u = ((r & 0xffff) + ((r1 & 0xffff) << 1)|0) + c|0;
                            w = ((r >>> 16) + ((r1 >>> 16) << 1)|0) + (u >>> 16)|0;
                            HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                            c = w >>> 16;

                            k = k+4|0;
                            r = HEAP32[(Rk+k)>>2]|0;
                            u = ((r & 0xffff) + ((r2 & 0xffff) << 1)|0) + c|0;
                            w = ((r >>> 16) + ((r2 >>> 16) << 1)|0) + (u >>> 16)|0;
                            HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                            c = w >>> 16;

                            k = k+4|0;
                            r = HEAP32[(Rk+k)>>2]|0;
                            u = ((r & 0xffff) + ((r3 & 0xffff) << 1)|0) + c|0;
                            w = ((r >>> 16) + ((r3 >>> 16) << 1)|0) + (u >>> 16)|0;
                            HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                            c = w >>> 16;

                            k = k+4|0;
                            r = HEAP32[(Rk+k)>>2]|0;
                            u = ((r & 0xffff) + ((r4 & 0xffff) << 1)|0) + c|0;
                            w = ((r >>> 16) + ((r4 >>> 16) << 1)|0) + (u >>> 16)|0;
                            HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                            c = w >>> 16;

                            k = k+4|0;
                            r = HEAP32[(Rk+k)>>2]|0;
                            u = ((r & 0xffff) + ((r5 & 0xffff) << 1)|0) + c|0;
                            w = ((r >>> 16) + ((r5 >>> 16) << 1)|0) + (u >>> 16)|0;
                            HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                            c = w >>> 16;

                            k = k+4|0;
                            r = HEAP32[(Rk+k)>>2]|0;
                            u = ((r & 0xffff) + ((r6 & 0xffff) << 1)|0) + c|0;
                            w = ((r >>> 16) + ((r6 >>> 16) << 1)|0) + (u >>> 16)|0;
                            HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                            c = w >>> 16;

                            k = k+4|0;
                            r = HEAP32[(Rk+k)>>2]|0;
                            u = ((r & 0xffff) + ((r7 & 0xffff) << 1)|0) + c|0;
                            w = ((r >>> 16) + ((r7 >>> 16) << 1)|0) + (u >>> 16)|0;
                            HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                            c = w >>> 16;
                        }

                        k = d+(i+j|0)|0;
                        r = HEAP32[(Rk+k)>>2]|0;
                        u = (((r & 0xffff) + ((r8 & 0xffff) << 1)|0) + c|0) + h|0;
                        w = ((r >>> 16) + ((r8 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        k = k+4|0;
                        r = HEAP32[(Rk+k)>>2]|0;
                        u = ((r & 0xffff) + ((r9 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r9 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        k = k+4|0;
                        r = HEAP32[(Rk+k)>>2]|0;
                        u = ((r & 0xffff) + ((r10 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r10 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        k = k+4|0;
                        r = HEAP32[(Rk+k)>>2]|0;
                        u = ((r & 0xffff) + ((r11 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r11 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        k = k+4|0;
                        r = HEAP32[(Rk+k)>>2]|0;
                        u = ((r & 0xffff) + ((r12 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r12 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        k = k+4|0;
                        r = HEAP32[(Rk+k)>>2]|0;
                        u = ((r & 0xffff) + ((r13 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r13 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        k = k+4|0;
                        r = HEAP32[(Rk+k)>>2]|0;
                        u = ((r & 0xffff) + ((r14 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r14 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                        c = w >>> 16;

                        k = k+4|0;
                        r = HEAP32[(Rk+k)>>2]|0;
                        u = ((r & 0xffff) + ((r15 & 0xffff) << 1)|0) + c|0;
                        w = ((r >>> 16) + ((r15 >>> 16) << 1)|0) + (u >>> 16)|0;
                        HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                        h = w >>> 16;
                    }

                    for ( k = k+4|0; !!h & ( (k|0) < (dd<<1) ); k = (k+4)|0 ) { // carry propagation loop
                        r = HEAP32[(Rk+k)>>2]|0;
                        u = (r & 0xffff) + h|0;
                        w = (r >>> 16) + (u >>> 16)|0;
                        HEAP32[(Rk+k)>>2] = (w << 16) | (u & 0xffff);
                        h = w >>> 16;
                    }
                }
            }
        }

        /**
         * Conventional division
         *
         * @param A offset of the numerator, 32-byte aligned
         * @param lA length of the numerator, multiple of 32
         *
         * @param B offset of the divisor, 32-byte aligned
         * @param lB length of the divisor, multiple of 32
         *
         * @param R offset where to place the remainder to, 32-byte aligned
         *
         * @param Q offser where to place the quotient to, 32-byte aligned
         */

        function div ( N, lN, D, lD, Q ) {
            N  =  N|0;
            lN = lN|0;
            D  =  D|0;
            lD = lD|0;
            Q  =  Q|0;

            var n = 0, d = 0, e = 0,
                u1 = 0, u0 = 0,
                v0 = 0, vh = 0, vl = 0,
                qh = 0, ql = 0, rh = 0, rl = 0,
                t1 = 0, t2 = 0, m = 0, c = 0,
                i = 0, j = 0, k = 0;

            // number of significant limbs in `N` (multiplied by 4)
            for ( i = (lN-1) & -4; (i|0) >= 0; i = (i-4)|0 ) {
                n = HEAP32[(N+i)>>2]|0;
                if ( n ) {
                    lN = i;
                    break;
                }
            }

            // number of significant limbs in `D` (multiplied by 4)
            for ( i = (lD-1) & -4; (i|0) >= 0; i = (i-4)|0 ) {
                d = HEAP32[(D+i)>>2]|0;
                if ( d ) {
                    lD = i;
                    break;
                }
            }

            // `D` is zero? WTF?!

            // calculate `e` — the power of 2 of the normalization factor
            while ( (d & 0x80000000) == 0 ) {
                d = d << 1;
                e = e + 1|0;
            }

            // normalize `N` in place
            u0 = HEAP32[(N+lN)>>2]|0;
            if ( e ) {
                u1 = u0>>>(32-e|0);
                for ( i = (lN-4)|0; (i|0) >= 0; i = (i-4)|0 ) {
                    n = HEAP32[(N+i)>>2]|0;
                    HEAP32[(N+i+4)>>2] = (u0 << e) | ( e ? n >>> (32-e|0) : 0 );
                    u0 = n;
                }
                HEAP32[N>>2] = u0 << e;
            }

            // normalize `D` in place
            if ( e ) {
                v0 = HEAP32[(D+lD)>>2]|0;
                for ( i = (lD-4)|0; (i|0) >= 0; i = (i-4)|0 ) {
                    d = HEAP32[(D+i)>>2]|0;
                    HEAP32[(D+i+4)>>2] = (v0 << e) | ( d >>> (32-e|0) );
                    v0 = d;
                }
                HEAP32[D>>2] = v0 << e;
            }

            // divisor parts won't change
            v0 = HEAP32[(D+lD)>>2]|0;
            vh = v0 >>> 16, vl = v0 & 0xffff;

            // perform division
            for ( i = lN; (i|0) >= (lD|0); i = (i-4)|0 ) {
                j = (i-lD)|0;

                // estimate high part of the quotient
                u0 = HEAP32[(N+i)>>2]|0;
                qh = ( (u1>>>0) / (vh>>>0) )|0, rh = ( (u1>>>0) % (vh>>>0) )|0, t1 = imul(qh, vl)|0;
                while ( ( (qh|0) == 0x10000 ) | ( (t1>>>0) > (((rh << 16)|(u0 >>> 16))>>>0) ) ) {
                    qh = (qh-1)|0, rh = (rh+vh)|0, t1 = (t1-vl)|0;
                    if ( (rh|0) >= 0x10000 ) break;
                }

                // bulk multiply-and-subtract
                // m - multiplication carry, c - subtraction carry
                m = 0, c = 0;
                for ( k = 0; (k|0) <= (lD|0); k = (k+4)|0 ) {
                    d = HEAP32[(D+k)>>2]|0;
                    t1 = (imul(qh, d & 0xffff)|0) + (m >>> 16)|0;
                    t2 = (imul(qh, d >>> 16)|0) + (t1 >>> 16)|0;
                    d = (m & 0xffff) | (t1 << 16);
                    m = t2;
                    n = HEAP32[(N+j+k)>>2]|0;
                    t1 = ((n & 0xffff) - (d & 0xffff)|0) + c|0;
                    t2 = ((n >>> 16) - (d >>> 16)|0) + (t1 >> 16)|0;
                    HEAP32[(N+j+k)>>2] = (t2 << 16) | (t1 & 0xffff);
                    c = t2 >> 16;
                }
                t1 = ((u1 & 0xffff) - (m & 0xffff)|0) + c|0;
                t2 = ((u1 >>> 16) - (m >>> 16)|0) + (t1 >> 16)|0;
                u1 = (t2 << 16) | (t1 & 0xffff);
                c = t2 >> 16;

                // add `D` back if got carry-out
                if ( c ) {
                    qh = (qh-1)|0;
                    c = 0;
                    for ( k = 0; (k|0) <= (lD|0); k = (k+4)|0 ) {
                        d = HEAP32[(D+k)>>2]|0;
                        n = HEAP32[(N+j+k)>>2]|0;
                        t1 = (n & 0xffff) + c|0;
                        t2 = (n >>> 16) + d + (t1 >>> 16)|0;
                        HEAP32[(N+j+k)>>2] = (t2 << 16) | (t1 & 0xffff);
                        c = t2 >>> 16;
                    }
                    u1 = (u1+c)|0;
                }

                // estimate low part of the quotient
                u0 = HEAP32[(N+i)>>2]|0;
                n = (u1 << 16) | (u0 >>> 16);
                ql = ( (n>>>0) / (vh>>>0) )|0, rl = ( (n>>>0) % (vh>>>0) )|0, t1 = imul(ql, vl)|0;
                while ( ( (ql|0) == 0x10000 ) | ( (t1>>>0) > (((rl << 16)|(u0 & 0xffff))>>>0) ) ) {
                    ql = (ql-1)|0, rl = (rl+vh)|0, t1 = (t1-vl)|0;
                    if ( (rl|0) >= 0x10000 ) break;
                }

                // bulk multiply-and-subtract
                // m - multiplication carry, c - subtraction carry
                m = 0, c = 0;
                for ( k = 0; (k|0) <= (lD|0); k = (k+4)|0 ) {
                    d = HEAP32[(D+k)>>2]|0;
                    t1 = (imul(ql, d & 0xffff)|0) + (m & 0xffff)|0;
                    t2 = ((imul(ql, d >>> 16)|0) + (t1 >>> 16)|0) + (m >>> 16)|0;
                    d = (t1 & 0xffff) | (t2 << 16);
                    m = t2 >>> 16;
                    n = HEAP32[(N+j+k)>>2]|0;
                    t1 = ((n & 0xffff) - (d & 0xffff)|0) + c|0;
                    t2 = ((n >>> 16) - (d >>> 16)|0) + (t1 >> 16)|0;
                    c = t2 >> 16;
                    HEAP32[(N+j+k)>>2] = (t2 << 16) | (t1 & 0xffff);
                }
                t1 = ((u1 & 0xffff) - (m & 0xffff)|0) + c|0;
                t2 = ((u1 >>> 16) - (m >>> 16)|0) + (t1 >> 16)|0;
                c = t2 >> 16;

                // add `D` back if got carry-out
                if ( c ) {
                    ql = (ql-1)|0;
                    c = 0;
                    for ( k = 0; (k|0) <= (lD|0); k = (k+4)|0 ) {
                        d = HEAP32[(D+k)>>2]|0;
                        n = HEAP32[(N+j+k)>>2]|0;
                        t1 = ((n & 0xffff) + (d & 0xffff)|0) + c|0;
                        t2 = ((n >>> 16) + (d >>> 16)|0) + (t1 >>> 16)|0;
                        c = t2 >>> 16;
                        HEAP32[(N+j+k)>>2] = (t1 & 0xffff) | (t2 << 16);
                    }
                }

                // got quotient limb
                HEAP32[(Q+j)>>2] = (qh << 16) | ql;

                u1 = HEAP32[(N+i)>>2]|0;
            }

            if ( e ) {
                // TODO denormalize `D` in place

                // denormalize `N` in place
                u0 = HEAP32[N>>2]|0;
                for ( i = 4; (i|0) <= (lD|0); i = (i+4)|0 ) {
                    n = HEAP32[(N+i)>>2]|0;
                    HEAP32[(N+i-4)>>2] = ( n << (32-e|0) ) | (u0 >>> e);
                    u0 = n;
                }
                HEAP32[(N+lD)>>2] = u0 >>> e;
            }
        }

        /**
         * Montgomery modular reduction
         *
         * Definition:
         *
         *  MREDC(A) = A × X (mod N),
         *  M × X = N × Y + 1,
         *
         * where M = 2^(32*m) such that N < M and A < N×M
         *
         * Numbers `X` and `Y` can be calculated using Extended Euclidean Algorithm.
         */
        function mredc ( A, lA, N, lN, y, R ) {
            A  =  A|0;
            lA = lA|0;
            N  =  N|0;
            lN = lN|0;
            y  =  y|0;
            R  =  R|0;

            var T = 0,
                c = 0, uh = 0, ul = 0, vl = 0, vh = 0, w0 = 0, w1 = 0, w2 = 0, r0 = 0, r1 = 0,
                i = 0, j = 0, k = 0;

            T = salloc(lN<<1)|0;
            z(lN<<1, 0, T);

            cp( lA, A, T );

            // HAC 14.32
            for ( i = 0; (i|0) < (lN|0); i = (i+4)|0 ) {
                uh = HEAP32[(T+i)>>2]|0, ul = uh & 0xffff, uh = uh >>> 16;
                vh = y >>> 16, vl = y & 0xffff;
                w0 = imul(ul,vl)|0, w1 = ( (imul(ul,vh)|0) + (imul(uh,vl)|0) | 0 ) + (w0 >>> 16) | 0;
                ul = w0 & 0xffff, uh = w1 & 0xffff;
                r1 = 0;
                for ( j = 0; (j|0) < (lN|0); j = (j+4)|0 ) {
                    k = (i+j)|0;
                    vh = HEAP32[(N+j)>>2]|0, vl = vh & 0xffff, vh = vh >>> 16;
                    r0 = HEAP32[(T+k)>>2]|0;
                    w0 = ((imul(ul, vl)|0) + (r1 & 0xffff)|0) + (r0 & 0xffff)|0;
                    w1 = ((imul(ul, vh)|0) + (r1 >>> 16)|0) + (r0 >>> 16)|0;
                    w2 = ((imul(uh, vl)|0) + (w1 & 0xffff)|0) + (w0 >>> 16)|0;
                    r1 = ((imul(uh, vh)|0) + (w2 >>> 16)|0) + (w1 >>> 16)|0;
                    r0 = (w2 << 16) | (w0 & 0xffff);
                    HEAP32[(T+k)>>2] = r0;
                }
                k = (i+j)|0;
                r0 = HEAP32[(T+k)>>2]|0;
                w0 = ((r0 & 0xffff) + (r1 & 0xffff)|0) + c|0;
                w1 = ((r0 >>> 16) + (r1 >>> 16)|0) + (w0 >>> 16)|0;
                HEAP32[(T+k)>>2] = (w1 << 16) | (w0 & 0xffff);
                c = w1 >>> 16;
            }

            cp( lN, (T+lN)|0, R );

            sfree(lN<<1);

            if ( c | ( (cmp( N, lN, R, lN )|0) <= 0 ) ) {
                sub( R, lN, N, lN, R, lN )|0;
            }
        }

        return {
            sreset: sreset,
            salloc: salloc,
            sfree:  sfree,
            z: z,
            tst: tst,
            neg: neg,
            cmp: cmp,
            add: add,
            sub: sub,
            mul: mul,
            sqr: sqr,
            div: div,
            mredc: mredc
        };
    };

    function Number_extGCD(a, b) {
        var sa = a < 0 ? -1 : 1, sb = b < 0 ? -1 : 1, xi = 1, xj = 0, yi = 0, yj = 1, r, q, t, a_cmp_b;
        a *= sa;
        b *= sb;
        a_cmp_b = a < b;
        if (a_cmp_b) {
            t = a;
            (a = b), (b = t);
            t = sa;
            sa = sb;
            sb = t;
        }
        (q = Math.floor(a / b)), (r = a - q * b);
        while (r) {
            (t = xi - q * xj), (xi = xj), (xj = t);
            (t = yi - q * yj), (yi = yj), (yj = t);
            (a = b), (b = r);
            (q = Math.floor(a / b)), (r = a - q * b);
        }
        xj *= sa;
        yj *= sb;
        if (a_cmp_b) {
            t = xj;
            (xj = yj), (yj = t);
        }
        return {
            gcd: b,
            x: xj,
            y: yj,
        };
    }
    function BigNumber_extGCD(a, b) {
        let sa = a.sign;
        let sb = b.sign;
        if (sa < 0)
            a = a.negate();
        if (sb < 0)
            b = b.negate();
        const a_cmp_b = a.compare(b);
        if (a_cmp_b < 0) {
            let t = a;
            (a = b), (b = t);
            let t2 = sa;
            sa = sb;
            sb = t2;
        }
        var xi = BigNumber.ONE, xj = BigNumber.ZERO, lx = b.bitLength, yi = BigNumber.ZERO, yj = BigNumber.ONE, ly = a.bitLength, z, r, q;
        z = a.divide(b);
        while ((r = z.remainder) !== BigNumber.ZERO) {
            q = z.quotient;
            (z = xi.subtract(q.multiply(xj).clamp(lx)).clamp(lx)), (xi = xj), (xj = z);
            (z = yi.subtract(q.multiply(yj).clamp(ly)).clamp(ly)), (yi = yj), (yj = z);
            (a = b), (b = r);
            z = a.divide(b);
        }
        if (sa < 0)
            xj = xj.negate();
        if (sb < 0)
            yj = yj.negate();
        if (a_cmp_b < 0) {
            let t = xj;
            (xj = yj), (yj = t);
        }
        return {
            gcd: b,
            x: xj,
            y: yj,
        };
    }

    function getRandomValues(buf) {
        if (typeof process !== 'undefined') {
            const nodeCrypto = require$$0;
            const bytes = nodeCrypto.randomBytes(buf.length);
            buf.set(bytes);
            return;
        }
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(buf);
            return;
        }
        if (self.crypto && self.crypto.getRandomValues) {
            self.crypto.getRandomValues(buf);
            return;
        }
        // @ts-ignore
        if (window.msCrypto && window.msCrypto.getRandomValues) {
            // @ts-ignore
            window.msCrypto.getRandomValues(buf);
            return;
        }
        throw new Error('No secure random number generator available.');
    }

    ///////////////////////////////////////////////////////////////////////////////
    const _bigint_stdlib = { Uint32Array: Uint32Array, Math: Math };
    const _bigint_heap = new Uint32Array(0x100000);
    let _bigint_asm;
    function _half_imul(a, b) {
        return (a * b) | 0;
    }
    if (_bigint_stdlib.Math.imul === undefined) {
        _bigint_stdlib.Math.imul = _half_imul;
        _bigint_asm = bigint_asm(_bigint_stdlib, null, _bigint_heap.buffer);
        delete _bigint_stdlib.Math.imul;
    }
    else {
        _bigint_asm = bigint_asm(_bigint_stdlib, null, _bigint_heap.buffer);
    }
    ///////////////////////////////////////////////////////////////////////////////
    const _BigNumber_ZERO_limbs = new Uint32Array(0);
    class BigNumber {
        constructor(num) {
            let limbs = _BigNumber_ZERO_limbs;
            let bitlen = 0;
            let sign = 0;
            if (num === undefined) ;
            else {
                for (var i = 0; !num[i]; i++)
                    ;
                bitlen = (num.length - i) * 8;
                if (!bitlen)
                    return BigNumber.ZERO;
                limbs = new Uint32Array((bitlen + 31) >> 5);
                for (var j = num.length - 4; j >= i; j -= 4) {
                    limbs[(num.length - 4 - j) >> 2] = (num[j] << 24) | (num[j + 1] << 16) | (num[j + 2] << 8) | num[j + 3];
                }
                if (i - j === 3) {
                    limbs[limbs.length - 1] = num[i];
                }
                else if (i - j === 2) {
                    limbs[limbs.length - 1] = (num[i] << 8) | num[i + 1];
                }
                else if (i - j === 1) {
                    limbs[limbs.length - 1] = (num[i] << 16) | (num[i + 1] << 8) | num[i + 2];
                }
                sign = 1;
            }
            this.limbs = limbs;
            this.bitLength = bitlen;
            this.sign = sign;
        }
        static fromString(str) {
            const bytes = string_to_bytes(str);
            return new BigNumber(bytes);
        }
        static fromNumber(num) {
            let limbs = _BigNumber_ZERO_limbs;
            let bitlen = 0;
            let sign = 0;
            var absnum = Math.abs(num);
            if (absnum > 0xffffffff) {
                limbs = new Uint32Array(2);
                limbs[0] = absnum | 0;
                limbs[1] = (absnum / 0x100000000) | 0;
                bitlen = 52;
            }
            else if (absnum > 0) {
                limbs = new Uint32Array(1);
                limbs[0] = absnum;
                bitlen = 32;
            }
            else {
                limbs = _BigNumber_ZERO_limbs;
                bitlen = 0;
            }
            sign = num < 0 ? -1 : 1;
            return BigNumber.fromConfig({ limbs, bitLength: bitlen, sign });
        }
        static fromArrayBuffer(buffer) {
            return new BigNumber(new Uint8Array(buffer));
        }
        static fromConfig(obj) {
            const bn = new BigNumber();
            bn.limbs = new Uint32Array(obj.limbs);
            bn.bitLength = obj.bitLength;
            bn.sign = obj.sign;
            return bn;
        }
        toString(radix) {
            radix = radix || 16;
            const limbs = this.limbs;
            const bitlen = this.bitLength;
            let str = '';
            if (radix === 16) {
                // FIXME clamp last limb to (bitlen % 32)
                for (var i = ((bitlen + 31) >> 5) - 1; i >= 0; i--) {
                    var h = limbs[i].toString(16);
                    str += '00000000'.substr(h.length);
                    str += h;
                }
                str = str.replace(/^0+/, '');
                if (!str.length)
                    str = '0';
            }
            else {
                throw new IllegalArgumentError('bad radix');
            }
            if (this.sign < 0)
                str = '-' + str;
            return str;
        }
        toBytes() {
            const bitlen = this.bitLength;
            const limbs = this.limbs;
            if (bitlen === 0)
                return new Uint8Array(0);
            const bytelen = (bitlen + 7) >> 3;
            const bytes = new Uint8Array(bytelen);
            for (let i = 0; i < bytelen; i++) {
                let j = bytelen - i - 1;
                bytes[i] = limbs[j >> 2] >> ((j & 3) << 3);
            }
            return bytes;
        }
        /**
         * Downgrade to Number
         */
        valueOf() {
            const limbs = this.limbs;
            const bits = this.bitLength;
            const sign = this.sign;
            if (!sign)
                return 0;
            if (bits <= 32)
                return sign * (limbs[0] >>> 0);
            if (bits <= 52)
                return sign * (0x100000000 * (limbs[1] >>> 0) + (limbs[0] >>> 0));
            // normalization
            let i, l, e = 0;
            for (i = limbs.length - 1; i >= 0; i--) {
                if ((l = limbs[i]) === 0)
                    continue;
                while (((l << e) & 0x80000000) === 0)
                    e++;
                break;
            }
            if (i === 0)
                return sign * (limbs[0] >>> 0);
            return (sign *
                (0x100000 * (((limbs[i] << e) | (e ? limbs[i - 1] >>> (32 - e) : 0)) >>> 0) +
                    (((limbs[i - 1] << e) | (e && i > 1 ? limbs[i - 2] >>> (32 - e) : 0)) >>> 12)) *
                Math.pow(2, 32 * i - e - 52));
        }
        clamp(b) {
            const limbs = this.limbs;
            const bitlen = this.bitLength;
            // FIXME check b is number and in a valid range
            if (b >= bitlen)
                return this;
            const clamped = new BigNumber();
            let n = (b + 31) >> 5;
            let k = b % 32;
            clamped.limbs = new Uint32Array(limbs.subarray(0, n));
            clamped.bitLength = b;
            clamped.sign = this.sign;
            if (k)
                clamped.limbs[n - 1] &= -1 >>> (32 - k);
            return clamped;
        }
        slice(f, b) {
            const limbs = this.limbs;
            const bitlen = this.bitLength;
            if (f < 0)
                throw new RangeError('TODO');
            if (f >= bitlen)
                return BigNumber.ZERO;
            if (b === undefined || b > bitlen - f)
                b = bitlen - f;
            const sliced = new BigNumber();
            let n = f >> 5;
            let m = (f + b + 31) >> 5;
            let l = (b + 31) >> 5;
            let t = f % 32;
            let k = b % 32;
            const slimbs = new Uint32Array(l);
            if (t) {
                for (var i = 0; i < m - n - 1; i++) {
                    slimbs[i] = (limbs[n + i] >>> t) | (limbs[n + i + 1] << (32 - t));
                }
                slimbs[i] = limbs[n + i] >>> t;
            }
            else {
                slimbs.set(limbs.subarray(n, m));
            }
            if (k) {
                slimbs[l - 1] &= -1 >>> (32 - k);
            }
            sliced.limbs = slimbs;
            sliced.bitLength = b;
            sliced.sign = this.sign;
            return sliced;
        }
        negate() {
            const negative = new BigNumber();
            negative.limbs = this.limbs;
            negative.bitLength = this.bitLength;
            negative.sign = -1 * this.sign;
            return negative;
        }
        compare(that) {
            var alimbs = this.limbs, alimbcnt = alimbs.length, blimbs = that.limbs, blimbcnt = blimbs.length, z = 0;
            if (this.sign < that.sign)
                return -1;
            if (this.sign > that.sign)
                return 1;
            _bigint_heap.set(alimbs, 0);
            _bigint_heap.set(blimbs, alimbcnt);
            z = _bigint_asm.cmp(0, alimbcnt << 2, alimbcnt << 2, blimbcnt << 2);
            return z * this.sign;
        }
        add(that) {
            if (!this.sign)
                return that;
            if (!that.sign)
                return this;
            var abitlen = this.bitLength, alimbs = this.limbs, alimbcnt = alimbs.length, asign = this.sign, bbitlen = that.bitLength, blimbs = that.limbs, blimbcnt = blimbs.length, bsign = that.sign, rbitlen, rlimbcnt, rsign, rof, result = new BigNumber();
            rbitlen = (abitlen > bbitlen ? abitlen : bbitlen) + (asign * bsign > 0 ? 1 : 0);
            rlimbcnt = (rbitlen + 31) >> 5;
            _bigint_asm.sreset();
            var pA = _bigint_asm.salloc(alimbcnt << 2), pB = _bigint_asm.salloc(blimbcnt << 2), pR = _bigint_asm.salloc(rlimbcnt << 2);
            _bigint_asm.z(pR - pA + (rlimbcnt << 2), 0, pA);
            _bigint_heap.set(alimbs, pA >> 2);
            _bigint_heap.set(blimbs, pB >> 2);
            if (asign * bsign > 0) {
                _bigint_asm.add(pA, alimbcnt << 2, pB, blimbcnt << 2, pR, rlimbcnt << 2);
                rsign = asign;
            }
            else if (asign > bsign) {
                rof = _bigint_asm.sub(pA, alimbcnt << 2, pB, blimbcnt << 2, pR, rlimbcnt << 2);
                rsign = rof ? bsign : asign;
            }
            else {
                rof = _bigint_asm.sub(pB, blimbcnt << 2, pA, alimbcnt << 2, pR, rlimbcnt << 2);
                rsign = rof ? asign : bsign;
            }
            if (rof)
                _bigint_asm.neg(pR, rlimbcnt << 2, pR, rlimbcnt << 2);
            if (_bigint_asm.tst(pR, rlimbcnt << 2) === 0)
                return BigNumber.ZERO;
            result.limbs = new Uint32Array(_bigint_heap.subarray(pR >> 2, (pR >> 2) + rlimbcnt));
            result.bitLength = rbitlen;
            result.sign = rsign;
            return result;
        }
        subtract(that) {
            return this.add(that.negate());
        }
        square() {
            if (!this.sign)
                return BigNumber.ZERO;
            var abitlen = this.bitLength, alimbs = this.limbs, alimbcnt = alimbs.length, rbitlen, rlimbcnt, result = new BigNumber();
            rbitlen = abitlen << 1;
            rlimbcnt = (rbitlen + 31) >> 5;
            _bigint_asm.sreset();
            var pA = _bigint_asm.salloc(alimbcnt << 2), pR = _bigint_asm.salloc(rlimbcnt << 2);
            _bigint_asm.z(pR - pA + (rlimbcnt << 2), 0, pA);
            _bigint_heap.set(alimbs, pA >> 2);
            _bigint_asm.sqr(pA, alimbcnt << 2, pR);
            result.limbs = new Uint32Array(_bigint_heap.subarray(pR >> 2, (pR >> 2) + rlimbcnt));
            result.bitLength = rbitlen;
            result.sign = 1;
            return result;
        }
        divide(that) {
            var abitlen = this.bitLength, alimbs = this.limbs, alimbcnt = alimbs.length, bbitlen = that.bitLength, blimbs = that.limbs, blimbcnt = blimbs.length, qlimbcnt, rlimbcnt, quotient = BigNumber.ZERO, remainder = BigNumber.ZERO;
            _bigint_asm.sreset();
            var pA = _bigint_asm.salloc(alimbcnt << 2), pB = _bigint_asm.salloc(blimbcnt << 2), pQ = _bigint_asm.salloc(alimbcnt << 2);
            _bigint_asm.z(pQ - pA + (alimbcnt << 2), 0, pA);
            _bigint_heap.set(alimbs, pA >> 2);
            _bigint_heap.set(blimbs, pB >> 2);
            _bigint_asm.div(pA, alimbcnt << 2, pB, blimbcnt << 2, pQ);
            qlimbcnt = _bigint_asm.tst(pQ, alimbcnt << 2) >> 2;
            if (qlimbcnt) {
                quotient = new BigNumber();
                quotient.limbs = new Uint32Array(_bigint_heap.subarray(pQ >> 2, (pQ >> 2) + qlimbcnt));
                quotient.bitLength = abitlen < qlimbcnt << 5 ? abitlen : qlimbcnt << 5;
                quotient.sign = this.sign * that.sign;
            }
            rlimbcnt = _bigint_asm.tst(pA, blimbcnt << 2) >> 2;
            if (rlimbcnt) {
                remainder = new BigNumber();
                remainder.limbs = new Uint32Array(_bigint_heap.subarray(pA >> 2, (pA >> 2) + rlimbcnt));
                remainder.bitLength = bbitlen < rlimbcnt << 5 ? bbitlen : rlimbcnt << 5;
                remainder.sign = this.sign;
            }
            return {
                quotient: quotient,
                remainder: remainder,
            };
        }
        multiply(that) {
            if (!this.sign || !that.sign)
                return BigNumber.ZERO;
            var abitlen = this.bitLength, alimbs = this.limbs, alimbcnt = alimbs.length, bbitlen = that.bitLength, blimbs = that.limbs, blimbcnt = blimbs.length, rbitlen, rlimbcnt, result = new BigNumber();
            rbitlen = abitlen + bbitlen;
            rlimbcnt = (rbitlen + 31) >> 5;
            _bigint_asm.sreset();
            var pA = _bigint_asm.salloc(alimbcnt << 2), pB = _bigint_asm.salloc(blimbcnt << 2), pR = _bigint_asm.salloc(rlimbcnt << 2);
            _bigint_asm.z(pR - pA + (rlimbcnt << 2), 0, pA);
            _bigint_heap.set(alimbs, pA >> 2);
            _bigint_heap.set(blimbs, pB >> 2);
            _bigint_asm.mul(pA, alimbcnt << 2, pB, blimbcnt << 2, pR, rlimbcnt << 2);
            result.limbs = new Uint32Array(_bigint_heap.subarray(pR >> 2, (pR >> 2) + rlimbcnt));
            result.sign = this.sign * that.sign;
            result.bitLength = rbitlen;
            return result;
        }
        isMillerRabinProbablePrime(rounds) {
            var t = BigNumber.fromConfig(this), s = 0;
            t.limbs[0] -= 1;
            while (t.limbs[s >> 5] === 0)
                s += 32;
            while (((t.limbs[s >> 5] >> (s & 31)) & 1) === 0)
                s++;
            t = t.slice(s);
            var m = new Modulus(this), m1 = this.subtract(BigNumber.ONE), a = BigNumber.fromConfig(this), l = this.limbs.length - 1;
            while (a.limbs[l] === 0)
                l--;
            while (--rounds >= 0) {
                getRandomValues(a.limbs);
                if (a.limbs[0] < 2)
                    a.limbs[0] += 2;
                while (a.compare(m1) >= 0)
                    a.limbs[l] >>>= 1;
                var x = m.power(a, t);
                if (x.compare(BigNumber.ONE) === 0)
                    continue;
                if (x.compare(m1) === 0)
                    continue;
                var c = s;
                while (--c > 0) {
                    x = x.square().divide(m).remainder;
                    if (x.compare(BigNumber.ONE) === 0)
                        return false;
                    if (x.compare(m1) === 0)
                        break;
                }
                if (c === 0)
                    return false;
            }
            return true;
        }
        isProbablePrime(paranoia = 80) {
            var limbs = this.limbs;
            var i = 0;
            // Oddity test
            // (50% false positive probability)
            if ((limbs[0] & 1) === 0)
                return false;
            if (paranoia <= 1)
                return true;
            // Magic divisors (3, 5, 17) test
            // (~25% false positive probability)
            var s3 = 0, s5 = 0, s17 = 0;
            for (i = 0; i < limbs.length; i++) {
                var l3 = limbs[i];
                while (l3) {
                    s3 += l3 & 3;
                    l3 >>>= 2;
                }
                var l5 = limbs[i];
                while (l5) {
                    s5 += l5 & 3;
                    l5 >>>= 2;
                    s5 -= l5 & 3;
                    l5 >>>= 2;
                }
                var l17 = limbs[i];
                while (l17) {
                    s17 += l17 & 15;
                    l17 >>>= 4;
                    s17 -= l17 & 15;
                    l17 >>>= 4;
                }
            }
            if (!(s3 % 3) || !(s5 % 5) || !(s17 % 17))
                return false;
            if (paranoia <= 2)
                return true;
            // Miller-Rabin test
            // (≤ 4^(-k) false positive probability)
            return this.isMillerRabinProbablePrime(paranoia >>> 1);
        }
    }
    BigNumber.extGCD = BigNumber_extGCD;
    BigNumber.ZERO = BigNumber.fromNumber(0);
    BigNumber.ONE = BigNumber.fromNumber(1);
    class Modulus extends BigNumber {
        constructor(number) {
            super();
            this.limbs = number.limbs;
            this.bitLength = number.bitLength;
            this.sign = number.sign;
            if (this.valueOf() < 1)
                throw new RangeError();
            if (this.bitLength <= 32)
                return;
            let comodulus;
            if (this.limbs[0] & 1) {
                const bitlen = ((this.bitLength + 31) & -32) + 1;
                const limbs = new Uint32Array((bitlen + 31) >> 5);
                limbs[limbs.length - 1] = 1;
                comodulus = new BigNumber();
                comodulus.sign = 1;
                comodulus.bitLength = bitlen;
                comodulus.limbs = limbs;
                const k = Number_extGCD(0x100000000, this.limbs[0]).y;
                this.coefficient = k < 0 ? -k : 0x100000000 - k;
            }
            else {
                /**
                 * TODO even modulus reduction
                 * Modulus represented as `N = 2^U * V`, where `V` is odd and thus `GCD(2^U, V) = 1`.
                 * Calculation `A = TR' mod V` is made as for odd modulo using Montgomery method.
                 * Calculation `B = TR' mod 2^U` is easy as modulus is a power of 2.
                 * Using Chinese Remainder Theorem and Garner's Algorithm restore `TR' mod N` from `A` and `B`.
                 */
                return;
            }
            this.comodulus = comodulus;
            this.comodulusRemainder = comodulus.divide(this).remainder;
            this.comodulusRemainderSquare = comodulus.square().divide(this).remainder;
        }
        /**
         * Modular reduction
         */
        reduce(a) {
            if (a.bitLength <= 32 && this.bitLength <= 32)
                return BigNumber.fromNumber(a.valueOf() % this.valueOf());
            if (a.compare(this) < 0)
                return a;
            return a.divide(this).remainder;
        }
        /**
         * Modular inverse
         */
        inverse(a) {
            a = this.reduce(a);
            const r = BigNumber_extGCD(this, a);
            if (r.gcd.valueOf() !== 1)
                throw new Error('GCD is not 1');
            if (r.y.sign < 0)
                return r.y.add(this).clamp(this.bitLength);
            return r.y;
        }
        /**
         * Modular exponentiation
         */
        power(g, e) {
            // count exponent set bits
            let c = 0;
            for (let i = 0; i < e.limbs.length; i++) {
                let t = e.limbs[i];
                while (t) {
                    if (t & 1)
                        c++;
                    t >>>= 1;
                }
            }
            // window size parameter
            let k = 8;
            if (e.bitLength <= 4536)
                k = 7;
            if (e.bitLength <= 1736)
                k = 6;
            if (e.bitLength <= 630)
                k = 5;
            if (e.bitLength <= 210)
                k = 4;
            if (e.bitLength <= 60)
                k = 3;
            if (e.bitLength <= 12)
                k = 2;
            if (c <= 1 << (k - 1))
                k = 1;
            // montgomerize base
            g = Modulus._Montgomery_reduce(this.reduce(g).multiply(this.comodulusRemainderSquare), this);
            // precompute odd powers
            const g2 = Modulus._Montgomery_reduce(g.square(), this), gn = new Array(1 << (k - 1));
            gn[0] = g;
            gn[1] = Modulus._Montgomery_reduce(g.multiply(g2), this);
            for (let i = 2; i < 1 << (k - 1); i++) {
                gn[i] = Modulus._Montgomery_reduce(gn[i - 1].multiply(g2), this);
            }
            // perform exponentiation
            const u = this.comodulusRemainder;
            let r = u;
            for (let i = e.limbs.length - 1; i >= 0; i--) {
                let t = e.limbs[i];
                for (let j = 32; j > 0;) {
                    if (t & 0x80000000) {
                        let n = t >>> (32 - k), l = k;
                        while ((n & 1) === 0) {
                            n >>>= 1;
                            l--;
                        }
                        var m = gn[n >>> 1];
                        while (n) {
                            n >>>= 1;
                            if (r !== u)
                                r = Modulus._Montgomery_reduce(r.square(), this);
                        }
                        r = r !== u ? Modulus._Montgomery_reduce(r.multiply(m), this) : m;
                        (t <<= l), (j -= l);
                    }
                    else {
                        if (r !== u)
                            r = Modulus._Montgomery_reduce(r.square(), this);
                        (t <<= 1), j--;
                    }
                }
            }
            // de-montgomerize result
            return Modulus._Montgomery_reduce(r, this);
        }
        static _Montgomery_reduce(a, n) {
            const alimbs = a.limbs;
            const alimbcnt = alimbs.length;
            const nlimbs = n.limbs;
            const nlimbcnt = nlimbs.length;
            const y = n.coefficient;
            _bigint_asm.sreset();
            const pA = _bigint_asm.salloc(alimbcnt << 2), pN = _bigint_asm.salloc(nlimbcnt << 2), pR = _bigint_asm.salloc(nlimbcnt << 2);
            _bigint_asm.z(pR - pA + (nlimbcnt << 2), 0, pA);
            _bigint_heap.set(alimbs, pA >> 2);
            _bigint_heap.set(nlimbs, pN >> 2);
            _bigint_asm.mredc(pA, alimbcnt << 2, pN, nlimbcnt << 2, y, pR);
            const result = new BigNumber();
            result.limbs = new Uint32Array(_bigint_heap.subarray(pR >> 2, (pR >> 2) + nlimbcnt));
            result.bitLength = n.bitLength;
            result.sign = 1;
            return result;
        }
    }

    // 独立的解密函数，用于 Proxyman 等非浏览器环境
    // 只包含必要的 AES-GCM 解密逻辑，不依赖其他包
    /**
     * AES-GCM-256 解密函数
     * @param cipherText 加密后的 base64 字符串
     * @param cipherKey 解密密钥
     */
    function AESDecrypt(cipherText, cipherKey) {
        const cipher_int_array = Array.from(base64_to_bytes(cipherText));
        const cipherNonce = new Uint8Array(cipher_int_array.slice(0, 12));
        const cipherTextArr = new Uint8Array(cipher_int_array.slice(12));
        // 将密钥字符串转为字节数组
        const keyBytes = new Uint8Array(cipherKey.length);
        for (let i = 0; i < cipherKey.length; i++) {
            keyBytes[i] = cipherKey.charCodeAt(i);
        }
        const rst = AES_GCM.decrypt(cipherTextArr, keyBytes, cipherNonce);
        return bytes_to_string(rst, true);
    }
    /**
     * 解密响应数据
     * @param data 加密的数据
     * @param rndKey 解密密钥
     */
    function decrypt(data, rndKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!rndKey)
                    return data;
                data = AESDecrypt(data, rndKey);
                data = JSON.parse(data);
            }
            catch (error) {
                console.error('decrypt error ===>', error);
            }
            return data;
        });
    }

    exports.AESDecrypt = AESDecrypt;
    exports.decrypt = decrypt;

    return exports;

})({});

// 为 Proxyman 环境添加全局访问
if (typeof globalThis !== 'undefined') {
    globalThis.TextDecrypt = TextDecrypt;
    globalThis.decrypt = TextDecrypt.decrypt;
    globalThis.AESDecrypt = TextDecrypt.AESDecrypt;
}
if (typeof global !== 'undefined') {
    global.TextDecrypt = TextDecrypt;
    global.decrypt = TextDecrypt.decrypt;
    global.AESDecrypt = TextDecrypt.AESDecrypt;
}
