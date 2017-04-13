/**
 * 一些工具
 *
 * 依赖：
 *   + lib.windvane
 */
;(function (win, lib) {
    var doc = win.document;
    var utils = {};

    utils.isTB = /WindVane/i.test(navigator.userAgent);

    // 查不到状态为undefined
    utils.isWeakNet = function (isTB, windvane) {
        var isWeakNet;
        if (isTB && windvane) {
            try {
                windvane.call('TBWeakNetStatus', 'getStatus', {},
                    function (e) {
                        isWeakNet = e.WeakNetStatus === 'false' ? false : true;
                    },
                    function () {}
                );
            }
            catch (e) {}
        }
        return isWeakNet;
    }(utils.isTB, lib.windvane);

    utils.getObjectType = function (obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    };

    utils.extend = function (target, source, except) {
        function merge (A, B, p) {
            if (B.hasOwnProperty(p)) {
                if (!A[p] || B[p]) {
                    A[p] = B[p];
                }
            }
        }
        for (var p in source) {
            // 一些不需要merge进来的东西，比如云中转带过来的数据
            if (except && except.test(p)) {
                continue;
            }
            if (utils.getObjectType(source[p]) === 'Object' && utils.getObjectType(target[p]) === 'Object') {
                utils.extend(target[p], source[p], except);
            }
            else {
                merge(target, source, p);
            }
        }
        return target;
    };

    /**
     * 针对HTML的转义工具，防止XSS注入
     */
    utils.escapeHTML = function (str) {
        return new Option(str).innerHTML;
    };

    /**
     * 取一个 @3x 图片对应的 @1x, @2x, @3x CDN地址
     * 并添加相应的q, s
     *
     * @param {String}  originUrl  传进来的imgUrl必须是原始图片路径
     * @param {boolean} needInfo   是否返回图片的其他信息
     *
     * 因目前 lib.img 没有提供针对 @3x 的支持，所以才能了这个函数
     */
    utils.getNewImage = function (originUrl, needInfo) {
        var Q = utils.isWeakNet ? 'q30' : 'q50';
        var S = 's150';
        var DPR = win.dpr || win.devicePixelRatio;
        var WIDTHS = [110, 150, 170, 220, 240, 290, 450, 570, 580, 620, 790];
        var EXTS = ['jpg', 'jpeg', 'gif', 'png'];
        var BASEDPR = 2;

        //获取图片宽高和扩展名，处理 xxx-640-320.jpg 和 xxx.jpg?640x320 两种情况
        var rule = new RegExp('(?:-(\\d+)-(\\d+))?(?:\\.(' + EXTS.join('|') + '))?(?:\\?(\\d+)x(\\d+))?$', 'i');
        var match = originUrl.match(rule);

        var originWidth = match[1] || match[4];
        var originHeight = match[2] || match[5];
        var imageExt = match[3] || 'jpg';

        var url = originUrl.split('?')[0];

        // xxx-1200-400.jpg_450x10000q30s150.jpg
        var newExt = [];

        // 只针对有尺寸且经过 DPR 换算后在 WIDTHS 范围内的图片处理新的宽高
        var newWidth = originWidth;
        if (originWidth && DPR < BASEDPR) {
            newWidth = DPR * originWidth / BASEDPR;
            if (newWidth < WIDTHS[WIDTHS.length - 1] && newWidth > WIDTHS[0]) {
                var i = WIDTHS.length;
                while (i--) {
                    if (WIDTHS[i] < newWidth) {
                        newWidth = WIDTHS[i + 1];
                        newExt.push(newWidth + 'x10000');
                        break;
                    }
                }
            }
        }

        // 只针对 jpg 处理 q 和 s
        if (/jpg|jpeg/i.test(imageExt)) {
            newExt.push(Q + S);
        }

        // 以上两者至少有一个成立才加新的后缀
        // 重新生成的图片仅支持.jpg后缀，而不是保持原来的后缀
        if (newExt.length) {
            newExt.push('.jpg');
            url += '_' + newExt.join('');
        }

        // 图片的URL去掉协议头
        /*
        var PROTOCOL_REGEXP = /^https?\:\/\/|^\/\//,
            IMAGE_CDN_DOMAIN = '//gw.alicdn.com/tfs/';
        if (PROTOCOL_REGEXP.test(url)) {
            url.replace(PROTOCOL_REGEXP, '//');
        }
        */

        return !needInfo ? url : {
            url: url,
            oWidth: originWidth && originWidth * 1,
            oHeight: originHeight && originHeight * 1,
            nWidth: originWidth && newWidth,
            nHeight: originWidth && newWidth && (newWidth * originHeight / originWidth)
        };
    };

    win.utils = utils;
}(window, window.lib || (window.lib = {})));
