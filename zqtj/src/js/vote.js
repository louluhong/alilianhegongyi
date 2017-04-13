(function (win, doc, flib) {
    var AA = lib.aa;

    function Vote (target, config) {
        if (typeof target === 'string') {
            target = AA.$(target); 
        }
        this.config = config; 

        this.target = target;

        this.voteBefore = AA.$('.vote-before', this.target);
        this.voteAfter = AA.$('.vote-after', this.target);

        this.voteContainer = AA.$('.vote-content', this.voteBefore);
        this.voteResultContainer = AA.$('.vote-res', this.voteAfter); 
        this.voteItemTmpl = AA.$('#vote-item-tmpl').text;
        this.voteResultTmpl = AA.$('#vote-result-tmpl').text;
        this.voteBtn = AA.$('.vote-submit', this.target);
        
        this.voteResultNum = [];
       
        // 用户昵称
        this.nick = lib.login.getUserNick();

        // start point
        this.bind();
        this.show();
    }
    Vote.prototype = {
        constructor: Vote,
        show: function () {
            // 这里判断用户是否已经投票
            // 由于现阶段接口不完善，故而采取一个折中方案：采用多加一个投票字段，这个投票字段是每个用户唯一的，暂时采用用户名来代表
            // 判断是否已经投票过，若是则直接显示投票结果，否则显示投票选项
            var _this = this;
            var tmpVoteChoices = [];
            _this.config.voteList.forEach(function (item, index) {
                tmpVoteChoices.push('v' + (index + 1));
            });
            tmpVoteChoices.push(_this.nick);
            lib.mtop.request({
                api: 'mtop.taobao.aplatform.weakGet',
                v: '1.0',
                data: {
                    bizType: 'counter',
                    bizParam: tmpVoteChoices.join(';')
                }
            }, function (resJson, retType) {
                lib.loading.auto = false;
                var data = resJson && resJson.data;
                if (data && data.result) {
                    var res = data.result;
                    _this.voteResultNum = utils.extend([], res);
                    _this.voteResultNum.pop();

                    if (res[res.length - 1] === null) {
                        // 没有投票过，展示投票界面
                        _this.voteBefore.style.display = 'block';
                        _this.renderBg(_this.voteBefore, _this.config.voteBefore.bgImage);
                        _this.renderVoteList(_this.config.voteList);
                    } else {
                        // 已经投票过，展示投票结果
                        lib.loading.show = true;
                        _this.showVoteResult(false);
                    }
                }
            }, function (resJson, retType) {
                var ret = resJson && resJson.ret[0];
                if (ret.indexOf('FAIL_SYS_SESSION_EXPIRED') || ret.indexOf('ERR_SID_INVALID')) {
                    lib.login.goLogin();
                }
            });
        },
        renderBg: function (target, bg) {
            target = target || this.voteBefore;
            if (typeof bg === 'undefined') {
                bg = this.config.voteBefore.bgImage;
            }
            if (bg) {
                var newBg = utils.getNewImage(bg, 1);
                // var height = newBg.nHeight * doc.body.offsetWidth / newBg.nWidth + 'px';
                target.style.backgroundImage = 'url('+ newBg.url +')';

                // target.style.height = height;
                // target.style.minHeight = height;
            }
        },
        renderVoteList: function (voteList) {
            var _this = this;
            if (!voteList) {
                voteList = this.config.voteList;
            }
            var html = voteList.map(function (item, index) {
                var voteItemData = {
                    name: item.name,
                    index: index
                };
                return AA.template(_this.voteItemTmpl, voteItemData);
            });
            _this.voteContainer.innerHTML = html.join('');
            _this.voteItems = Array.prototype.slice.call(AA.$$('input', _this.voteContainer));
        },
        bind: function () {
            var _this = this;
            // 监听投票按钮
            this.voteBtn.addEventListener('click', function (e) {
                // 黄金打点
                var logKey = _this.config.voteBefore.aplus;
                if (logKey) {
                    AA.goldlog(logKey, '', '', '');
                }
                _this.startVote(_this.showVoteResult);
            }, false);
        },
        startVote: function (callback) {
            var _this = this;
            // 获取选择的投票项
            var voteChoices = [];
            _this.voteItems.forEach(function (item, index) {
                if (item.checked) {
                    voteChoices.push('v' + (index + 1));
                }
            });
            if (!voteChoices.length) {
                AA.toast('请选择投票项');
                return;
            }
            // 这里在投票过程中，附加一个以"用户nick"代表的投票项，以此做是否投票过的验证
            voteChoices.push(_this.nick);
            lib.mtop.request({
                api: 'mtop.taobao.aplatform.get',
                v: '1.0',
                data: {
                    bizType: 'counter.incrUV',
                    bizParam: voteChoices.join(';')
                },
                isSec: 0,
                ecode: 1
            }, function (resJson, resType) {
                // 投票成功
                var data = resJson && resJson.data;
                if (data && data.result){
                    var res = data.result;
                    if (res[0]) {
                        _this.voteBefore.style.display = 'none';
                        // 打开loading组件
                        lib.loading.show = true;
                        callback && callback.call(_this, true);
                    }
                }
            }, function (resJson, retType) {
                // 投票失败
                var ret = resJson.ret[0];
                if (ret.indexOf('FAIL_SYS_SESSION_EXPIRED') > -1 || ret.indexOf('ERR_SID_INVALID') > -1) {
                    lib.login.goLogin();
                    return;
                }
            });
        },
        showVoteResult: function (isFirstVote) {
            var _this = this;
            // 已经投票过，直接展示结果，不用再次请求投票数据
            if (!isFirstVote) {
                _this.renderVoteResult(_this.voteResultNum);
                return;
            } 
            // 没投票过，则再次请求投票之后的数据
            var voteChoices = _this.config.voteList.map(function (item, index) {
                return 'v' + (index + 1);
            });
            lib.mtop.request({
                api: 'mtop.taobao.aplatform.weakGet',
                v: '1.0',
                data: {
                    bizType: 'counter',
                    bizParam: voteChoices.join(';')
                }
                // isSec: 0,
                // ecode: 1
            }, function (resJson, resType) {
                var data = resJson && resJson.data;
                if (data && data.result) {
                    var res = data.result;
                    if (isFirstVote) {
                        // 第一次投票
                        res = res.map(function (item, index) {
                            if(_this.voteItems[index].checked) {
                                return parseInt(item, 10) + 1;
                            } else {
                                return item;
                            }
                        });
                    } 
                    // 展示投票结果
                    _this.renderVoteResult(res);
                }
            }, function (resJson, retType) {
                // 获取投票结果失败
                var ret = resJson.ret[0];
                if (ret.indexOf('FAIL_SYS_SESSION_EXPIRED') > -1 || ret.indexOf('ERR_SID_INVALID') > -1) {
                    lib.login.goLogin();
                    return;
                }
            });
        },
        renderVoteResult: function (res) {
            var _this = this;
            // 投票之后渲染投票结果

            _this.voteAfter.style.display = 'block';
            // _this.voteAfter.style.webkitTransition = 'left 10s ease-in';

            // _this.voteAfter.style.left = '0';
            _this.renderBg(_this.voteAfter, _this.config.voteAfter.bgImage);
            
            // res = ['11112', '1113', '9120', '1109', '90900', '101010', '1111', '921'];
            // res = [
            //     '12',
            //     '90',
            //     '20',
            //     '63',
            //     '11',
            //     '33',
            //     '10900',
            //     '8'
            // ];
            var newRes = res.map(function (item, index) {
                var voteResultData = {
                    name: _this.config.voteList[index].name,
                    num: item
                };
                return voteResultData;
            }).sort(function (prev, next) {
                return next.num - prev.num;
            });
            
            var refWidth = parseInt(newRes[0].num, 10);
            var realWidth = refWidth > 10000000 ? 180 : 200;
            var html = newRes.map(function (item, index) {
                var tmpObj = {
                    num : item.num === null ? 0 : item.num,
                    width: Math.floor(parseInt(item.num, 10) / refWidth * 1000 * realWidth / 75) / 1000  + 'rem'
                };
                var mixData = AA.mixin(item, tmpObj, true);
                return AA.template(_this.voteResultTmpl, mixData);
            });
            _this.voteResultContainer.innerHTML = html.join('');

            // loading 组件关闭
            lib.loading.show = false;
        }
    };
    win.Vote = Vote;

})(window, window.document, window.lib || (window.lib = {}));