/**
 * 数据类型为Date
 * @param param
 * @returns {boolean}
 */
function isDate(param) {
    return Object.prototype.toString.call(param) === "[object Date]";
}

/**
 * 数据类型为String
 * @param param
 * @returns {boolean}
 */
function isString(param) {
    return Object.prototype.toString.call(param) === "[object String]";
}

/**
 * 数据类型为Number
 * @param param
 * @returns {boolean}
 */
function isNumber(param) {
    return Object.prototype.toString.call(param) === "[object Number]";
}

/**
 * 数据类型为Boolean
 * @param param
 * @returns {boolean}
 */
function isBoolean(param) {
    return Object.prototype.toString.call(param) === "[object Boolean]";
}

/**
 * 数据类型为Symbol
 * @param param
 * @returns {boolean}
 */
function isSymbol(param) {
    return Object.prototype.toString.call(param) === "[object Symbol]";
}

/**
 * 数据类型为Undefined
 * @param param
 * @returns {boolean}
 */
function isUndefined(param) {
    return Object.prototype.toString.call(param) === "[object Undefined]";
}

/**
 * 数据类型为Null
 * @param param
 * @returns {boolean}
 */
function isNull(param) {
    return Object.prototype.toString.call(param) === "[object Null]";
}

/**
 * 数据类型为Function
 * @param param
 * @returns {boolean}
 */
function isFunction(param) {
    return Object.prototype.toString.call(param) === "[object Function]";
}

/**
 * 数据类型为Array
 * @param param
 * @returns {boolean}
 */
function isArray(param) {
    return Object.prototype.toString.call(param) === "[object Array]";
}

/**
 * 数据类型为RegExp
 * @param param
 * @returns {boolean}
 */
function isRegExp(param) {
    return Object.prototype.toString.call(param) === "[object RegExp]";
}

/**
 * 数据类型为Error
 * @param param
 * @returns {boolean}
 */
function isError(param) {
    return Object.prototype.toString.call(param) === "[object Error]";
}

/**
 * 数据类型为Document
 * @param param
 * @returns {boolean}
 */
function isDocument(param) {
    return Object.prototype.toString.call(param) === "[object HTMLDocument]";
}

/**
 * 数据类型为Window
 * @param param
 * @returns {boolean}
 */
function isGlobal(param) {
    return Object.prototype.toString.call(param) === "[object global]";
}

module.exports = {
    isDate: isDate,
    isString: isString,
    isNumber: isNumber,
    isBoolean: isBoolean,
    isSymbol: isSymbol,
    isUndefined: isUndefined,
    isNull: isNull,
    isFunction: isFunction,
    isArray: isArray,
    isRegExp: isRegExp,
    isError: isError,
    isDocument: isDocument,
    isGlobal: isGlobal
};
