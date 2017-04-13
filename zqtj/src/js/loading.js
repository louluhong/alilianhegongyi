'use strict';
(function (win, lib) {
    lib.loading = {};
    lib.loading.auto = true;
    var show = false;
    function loadingShow(){
        if(document.body.querySelector('#lib-loading')){
            return;
        }
        var dom = document.createElement('div');
        dom.id = 'lib-loading'
        dom.innerHTML = '<div class="lib-loading"><div rol="spin" style="display: block;"><div class="circle"><span style="background-color: #eee"></span></div></div><span class="text" style="display: block;">正在加载中...</span></div>';
        document.body.appendChild(dom);
    };
    function loadingHide(){
        var loading = document.body.querySelector('#lib-loading');
        if(loading){
            document.body.removeChild(loading);
        }
    };

    Object.defineProperty(lib.loading,'show',{
        set:function(val){
            show = val;
            if(val === true){
                loadingShow();
            }else if(val === false){
                loadingHide();
            }
        },
        get:function(){
            return show;
        }
    });



    (function(){
        //处理mtop
        if(lib.mtop){
            var mtop = lib.mtop;
            var request = mtop.request;
            var loginRequest = mtop.loginRequest;
            mtop.request = function(params, success, failure){
                if(lib.loading.auto){
                    lib.loading.show = true;
                }
                request(params,function(){
                    if(lib.loading.auto){
                        lib.loading.show = false;
                    }
                    success.apply(win,arguments);
                },function(){
                    lib.loading.show = false;
                    failure.apply(win,arguments);
                })
            }
        }

        //处理Zepto或者Jquery
        if(win.$ && $.ajax){
            var ajax = $.ajax;
            $.ajax = function(options){
                if(lib.loading.auto && !options.noLoading){
                    lib.loading.show = true;
                }
                var success = options.success;
                var error = options.error;
                options.success = function(){
                    if(lib.loading.auto && !options.noLoading){
                        lib.loading.show = false;
                    }
                    success.apply(win,arguments);
                };
                options.error = function(){
                    if(lib.loading.auto && !options.noLoading){
                        lib.loading.show = false;
                    }
                    error.apply(win,arguments);
                }
                ajax(options);
            }
        }else{
        //自己写一个ajax
            var appendQuery = function(url, query){
                if (query == '') return url;
                return (url + '&' + query).replace(/[&?]{1,2}/, '?');
            }
            var formatData = function(data){
                var arr = Object.keys(data);
                arr.forEach(function(key,i){
                    arr[i] = (key + '=' + data[key]);
                })
                return arr.join('&');
            };

            window.$ = {};
            $.ajax = function(options){
                if(!options || !options.url) return;
                if(lib.loading.auto && !options.noLoading){
                    lib.loading.show = true;
                }
                if(options.dataType && options.dataType.toUpperCase() === 'JSONP'){
                    var script = document.createElement('script');
                    var callbackName = options.jsonp ? options.jsonp:'callback' + new Date().getTime();
                    window[callbackName] = function(data){
                        setTimeout(function(){
                            options.success(data);
                        },0)
                    };
                    options.data = options.data ? formatData(options.data) : '';
                    options.url = appendQuery(options.url,options.data);
                    options.url = appendQuery(options.url,'callback=' + callbackName);
                    script.setAttribute('src',options.url);
                    script.addEventListener('load',function(){
                        if(lib.loading.auto && !options.noLoading){
                            lib.loading.show = false;
                        }
                        document.body.removeChild(script);
                    })
                    document.body.appendChild(script);
                }else{
                    var xmlhttp = new window.XMLHttpRequest();
                    xmlhttp.onreadystatechange = function() {
                        if (4 == xmlhttp.readyState) {
                            if (200 == xmlhttp.status) {
                                var data = xmlhttp.responseText;
                                options.success(data);
                            }else{
                                options.error();
                            }
                            if(lib.loading.auto && !options.noLoading){
                                lib.loading.show = false;
                            }
                        }
                    }
                    options.type = options.type ? options.type.toUpperCase():'GET';
                    options.data = options.data ? formatData(options.data) : '';
                    if(options.type === 'GET'){
                        options.url = appendQuery(options.url,options.data);
                        options.data = null;
                    }
                    xmlhttp.open(options.type, options.url, true);
                    if(options){
                        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    }
                    xmlhttp.send(options.data ? options.data : null);
                }
            }
        }

    })();
})(window, window['lib'] || (window['lib'] = {}));