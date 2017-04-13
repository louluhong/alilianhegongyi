
(function (win, doc, lib) {
    var AA = lib.aa;
    function Barrage (target, config) {
        if (typeof target === 'string') {
            target = AA.$(target); 
        }
        this.target = target;
        this.config = config;

        this.contents = []; 
        this.lineStatus = [];
        this.lineStatus.length = 3;
        this.barrageListContainer = AA.$('.barrage-list', this.target);
        this.barrageInput = AA.$('#barrage-input-msg', this.target);
        this.barrageBtn = AA.$('.barrage-submit', this.target);
        this.barrageMoreContainer = AA.$('.barrage-more', this.target); 

        this.topicId = this.config.topicId;
        this.curIndex = undefined;
        this.pageSize = 20;

        // 监听发送弹幕消息
        this.bind(this.config);
        this.renderBg();
        this.renderBarrageMore();
        this.render();

    }
    Barrage.prototype = {
        constructor: Barrage,
        renderBg: function (bg) {
            var _this = this;
            if (!bg) {
                bg = _this.config.bgImage;
            }
            var newBg = utils.getNewImage(bg, 1);
            _this.target.style.backgroundImage = 'url(' + newBg.url + ')';
            _this.target.style.height = newBg.nHeight * doc.body.offsetWidth / newBg.nWidth + 'px';
        },
        renderBarrageMore: function (barrageMore) {
            var _this = this;
            if (!barrageMore) {
                barrageMore = _this.config.barrageMore;
            }
            var aLinkTmpl = AA.$('#vote-banner-link-tmpl').text;
            _this.barrageMoreContainer.innerHTML = AA.template(aLinkTmpl, barrageMore);
        },
        bind: function (config) {
            var _this = this;
            // window.onerror = function (e) {
            //     alert(e);
            // };
            _this.barrageBtn.addEventListener('click', function (e) {
                e.preventDefault();
                // 发送评论
                var inputMsg = _this.barrageInput.value;
                _this.sendComment(inputMsg);
                _this.barrageInput.value = '';
            }, false);
        },
        sendComment: function (msg) {
            var _this = this;
            if (!msg) {
                return;
            }
            _this.contents.unshift(msg);
            var params = {
                key: _this.topicId,
                text: msg
            };
            // 发送弹幕消息接口
            lib.mtop.request({
                api: 'mtop.taobao.bala.publish',
                v: '1.0',
                data: {
                    type: 5,
                    topicId: _this.topicId,
                    content: [],
                    desc: msg
                    // bizType: 'danmu_common.publish',
                    // bizParam: JSON.stringify(params)
                },
                isSec: 1,
                ecode: 1
            }, function (resJson, retType) {
                // 发送弹幕成功
            }, function (resJson, retType) {
                // 发送弹幕失败
            });
        },
        render: function () {
            var _this = this;
            var params = {
                key: _this.topicId,
                query: {
                    index: _this.curIndex,
                    pageSize: _this.pageSize
                }
            };
            // 获取弹幕消息接口
            lib.mtop.request({
                // api: 'mtop.taobao.aplatform.get',
                api: 'mtop.taobao.ocean.feed.list',
                v: '1.0',
                data: {
                    // bizType: 'danmu_common.get',
                    // bizParam: JSON.stringify(params)
                    topicId: _this.topicId,
                    cursor: _this.curIndex
                }
                // isSec: 1,
                // ecode: 1
            }, function (resJson, resType) {

                // 关闭loading组件
                lib.loading.auto = false;
                var data = resJson && resJson.data;
                if (data && data.feeds) {
                    var contents = data.feeds;
                    if (contents.length) {
                        contents.forEach(function (item, index) {
                            _this.contents.push(item.desc);
                        });

                        if (data.hasMore === true || data.hasMore === 'true') {
                            _this.curIndex = data.cursor;
                        } else {
                            _this.curIndex = undefined;
                        }
                        _this.renderItems();               
                    } else {
                        // 如果是第1页就为空，则直接退出
                        if (!data.cursor) {
                            return;
                        }
                        _this.curIndex = undefined;
                        _this.render();
                    }
                } 
            }, function (resJson, resType) {
                var ret = resJson.ret[0];
                if (ret.indexOf('FAIL_SYS_SESSION_EXPIRED') > -1 || ret.indexOf('ERR_SID_INVALID') > -1) {
                    lib.login.goLogin();
                    return;
                }
            });
            // _this.contents = _this.config.barrageList.map(function (item, index) {
            //     return item.content;
            // });
            // // 渲染弹幕
            // _this.renderItems();
            
        },
        renderItems: function () {
            var _this = this;
            var i,
                len,
                lineStatus = _this.lineStatus; 
            for (i = 0, len = lineStatus.length; i < len; i++) {
                if (!lineStatus[i]) {
                    if (_this.contents.length) {
                        var item = _this.contents.shift();
                        _this.renderItem(item, i);
                    } else {
                        _this.render();
                    }
                }
            }
        },
        renderItem: function (item, index) {
            var _this = this;
            var speed = Math.floor((Math.random() * (6 - 3 + 1) + 3) * 100 ) / 100;
            var spanEl = doc.createElement('span');
            spanEl.innerHTML = AA.escapeHTML(item);

            spanEl.setAttribute('data-index', index);

            spanEl.style.webkitTransition = '-webkit-transform ' + speed + 's linear';

            _this.barrageListContainer.appendChild(spanEl);
            _this.lineStatus[index] = true;

            spanEl.addEventListener('webkitTransitionEnd', function (e) {
                _this.barrageListContainer.removeChild(this);
                _this.lineStatus[index] = false;
                _this.renderItems();
            }, false);
            setTimeout(function () {
                var spanWidth = spanEl.getBoundingClientRect().width;
                spanEl.style.webkitTransform = 'translate3d(-'+ spanWidth +'px, 0, 0)';
            }, 500);
        },

    };
    win.Barrage = Barrage;
})(window, window.document, window.lib || (window.lib = {}));