/**
 * 格式化日期
 * @param date
 * @returns {string} 2020/02/03 15:02:01
 */
function formatTime(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

/**
 * 格式化日期数字，各位数前补0
 * @param n
 * @returns {string}
 */
function formatNumber(n) {
    n = n.toString();
    return n[1] ? n : '0' + n
}

/**
 * 数据类型为Date
 * @param date
 * @returns {boolean}
 */
function typeIsDate(date) {
    return  Object.prototype.toString.call(date) === "[object Date]";
}

/**
 *  节流函数（第一个人说了算），用法：
 *  用throttle来包装scroll的回调
 *  const better_scroll = throttle(() => console.log('触发了滚动事件'), 1000)
 *  document.addEventListener('scroll', better_scroll)
 *
 * @param fn 是我们需要包装的事件回调
 * @param interval interval是时间间隔的阈值
 * @returns {Function}
 */
function throttle(fn, interval) {
    // last为上一次触发回调的时间
    let last = 0;
    interval = interval || 200;
    // 将throttle处理结果当作函数返回
    return function () {
        // 保留调用时的this上下文
        let context = this;
        // 保留调用时传入的参数
        let args = arguments;
        // 记录本次触发回调的时间
        let now = +new Date();

        // 判断上次触发的时间和本次触发的时间差是否小于时间间隔的阈值
        if (now - last >= interval) {
            // 如果时间间隔大于我们设定的时间间隔阈值，则执行回调
            last = now;
            fn.apply(context, args);
        }
    }
}

/**
 * 防抖函数（最后一个说了算），用法：
 * 用debounce来包装scroll的回调
 * const better_scroll = debounce(() => console.log('触发了滚动事件'), 1000)
 * document.addEventListener('scroll', better_scroll)
 *
 * @param fn 我们需要包装的事件回调
 * @param delay 每次推迟执行的等待时间
 * @returns {Function}
 */
function debounce(fn, delay) {
    // 定时器
    let timer = null;

    // 将debounce处理结果当作函数返回
    return function () {
        // 保留调用时的this上下文
        let context = this;
        // 保留调用时传入的参数
        let args = arguments;

        // 每次事件被触发时，都去清除之前的旧定时器
        if(timer) {
            clearTimeout(timer);
        }
        // 设立新定时器
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay)
    }
}


module.exports = {
    formatTime: formatTime,
    throttle: throttle,
    debounce: debounce
};
