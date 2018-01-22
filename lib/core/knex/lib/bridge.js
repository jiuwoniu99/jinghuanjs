/***
 * 移植后的代码需要一些过渡的方法来解决
 */

/**
 *
 * @param expr
 * @param str
 * @returns {Array}
 */
function preg_split(expr, str) {
	try {
		let s = str.split(eval(expr));
		let r = [];
		for (var v of s) {
			if (v) {
				r.push(v);
			}
		}
		return r;
	} catch (ex) {
		console.log(ex);
	}
}

/**
 * 对于php字符串特性的过度方法 例如 $str[0] = "1" 对字符串的第一个字符替换 使用string_set方法过渡
 * @param str
 * @param idx
 * @param rep
 */
function string_set(str, idx, rep) {
	str = str.split("");
	str[idx] = rep;
	return str.join("")
}

/**
 *
 * @param arr
 * @param offst
 * @param lgth
 * @param preserveKeys
 * @returns {{}}
 */
function array_slice(arr, offst, lgth, preserveKeys) {
	//  discuss at: http://locutus.io/php/array_slice/
	// original by: Brett Zamir (http://brett-zamir.me)
	//    input by: Brett Zamir (http://brett-zamir.me)
	// bugfixed by: Kevin van Zonneveld (http://kvz.io)
	//      note 1: Relies on is_int because !isNaN accepts floats
	//   example 1: array_slice(["a", "b", "c", "d", "e"], 2, -1)
	//   returns 1: [ 'c', 'd' ]
	//   example 2: array_slice(["a", "b", "c", "d", "e"], 2, -1, true)
	//   returns 2: {2: 'c', 3: 'd'}
	
	var isInt = require('locutus/php/var/is_int')
	
	/*
	 if ('callee' in arr && 'length' in arr) {
	 arr = Array.prototype.slice.call(arr);
	 }
	 */
	
	var key = ''
	
	if (Object.prototype.toString.call(arr) !== '[object Array]' || (preserveKeys && offst !== 0)) {
		// Assoc. array as input or if required as output
		var lgt = 0
		var newAssoc = []
		for (key in arr) {
			lgt += 1
			newAssoc[key] = arr[key]
		}
		arr = newAssoc
		
		offst = (offst < 0) ? lgt + offst : offst
		lgth = lgth == null ? lgt : (lgth < 0) ? lgt + lgth - offst : lgth
		
		var assoc = []
		var start = false
		var it = -1
		var arrlgth = 0
		var noPkIdx = 0
		
		for (key in arr) {
			++it
			if (arrlgth >= lgth) {
				break
			}
			if (it == offst) {
				start = true
			}
			if (!start) {
				continue
			}
			++arrlgth
			if (isInt(key) && !preserveKeys) {
				assoc[noPkIdx++] = arr[key]
			} else {
				assoc[key] = arr[key]
			}
		}
		// Make as array-like object (though length will not be dynamic)
		// assoc.length = arrlgth;
		return assoc
	}
	
	if (lgth === undefined) {
		return arr.slice(offst)
	} else if (lgth >= 0) {
		return arr.slice(offst, offst + lgth)
	} else {
		return arr.slice(offst, lgth)
	}
}


module.exports = {
	preg_split,
	string_set,
	array_slice
}