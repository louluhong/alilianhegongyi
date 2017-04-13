;(function (win, doc, lib) {
	var $=lib.aa.$;
	function renderFloor(pageData){
		var xingzuo = $('#xingzuoTemplate').innerText;  //获取模板星座
    	var xingzuocon = $('#xingzuoconTemplate').innerText;  //获取模板星座坑位
    	var tuijian = $('#tuijianTemplate').innerText;  //获取模板推荐模块
    	var font_gd = $('#font_gdTemplate').innerText;  //获取模板文字滚动

	    var xingzuoHtml = "",
	    	tuijianHtml = "",
	    	fontHtml = "",
	    	floorhtml="",
	    	float_link=pageData.float_link;
	    $('.float_link').setAttribute('href',float_link);//设置兔子浮层链接

	    pageData.items2.forEach(function(k){
			fontHtml+= lib.aa.template(font_gd,k); // 渲染模板（文字滚动）
    	});
	    var tuijian_img=pageData.tuijian_img;
	    var tuijian_link=pageData.tuijian_link;
	    //星座模块坑位循环
	    if(!tuijian_img){
	    	$('.tuijian-img').remove();
	    }
	    else{
	    	$('.tuijian-img').setAttribute("data-src",tuijian_img);
	    	$('.tuijian_link').setAttribute("href",tuijian_link);
	    }
	    if(pageData.isopen){
	    	pageData.items.sort(function(a,b) {return Math.random()>.5 ? -1 : 1;});
	    }
    	pageData.items.forEach(function(i){
    		//如果存在标题图
    		var xtitle="",xprice="";
    		//如果填了星座标题图
    		i.xingzuotimg?xtitle='<a href="'+i.xingzuo_link+'" target="_blank"><img src="'+i.xingzuotimg+'" alt="" class="con_title"></a>':xtitle="";
    		//如果填了坑位标题
    		if(i.item_title)
    		{
    			xprice='<div class="by_mask"></div>\
                    <span class="pro_title">'+i.item_title+'</span>\
                    <span class="pro_price">现价:<b>￥<i>'+i.price_new+'</i></b>&nbsp;&nbsp;<del>原价:￥'+i.price_old+'</del></span>';
    		}
    		floorhtml+=xtitle+'<div class="by_w1024">\
					        <span class="title1_ms">'+i.xingzuo_describee+'</span>\
					        <a href="'+i.item_url+'" target="_blank">\
					            <div class="pro_sp">\
					                 <div class="pro_img">\
					                    <img data-src="'+i.item_img+'" src="http://gw.alicdn.com/tps/i2/T1scDRFShaXXc6Yc2r-1-1.gif" alt="" class="lib-img">\
					                    '+xprice+'\
					                </div>\
					            </div>\
					        </a>\
					    </div>';

    	});
    	if(pageData.isopen){
    		pageData.items1.sort(function(a,b) {return Math.random()>.5 ? -1 : 1;});
    	}
    	pageData.items1.forEach(function(j){
			tuijianHtml+= lib.aa.template(tuijian,j); // 渲染模板（推荐模块）
    	});
     	$(".by_con").innerHTML=floorhtml;
     	$(".item_buy").innerHTML=tuijianHtml;
     	$(".lm_font_ul").innerHTML=fontHtml;
	};
    function bind (pageData) {
    	renderFloor(pageData);
     	window.lazyload=lib.img({
	        'class':'lib-img',//图片class
	        'dataSrc':'data-src',//图片真实src 的data字段
	        'size': '320x320',//cdn尺寸
	        'sharpen': 's150',//锐化参数
	        'q': ['q50', 'q30'],//图片质量[非弱网，弱网],
	        'enableLazyload':true,//是否开启懒加载功能，默认true
	        'lazyHeight': window.innerHeight/2,//[可选]，预加载当前屏幕以下lazyHeight内的图片，默认0
	        'lazyWidth': 0,//[可选]，预加载当前屏幕右边lazyWidth内的图片，默认0
	        'enableIOSWebp':false,//ios系统下，图片添加是否webp后缀，默认false,
	        'enalbeIOSWifiLoadMore':false,//ios&&wifi情况下 是否关闭懒加载,默认false
	        'filterDomains':[]
	    });
    }
    function scroller(){
    	// 文字滚动
        function startmarquee(lh,speed,delay,index){ 
	        var t; 
	        var p=false; 
	        var o=$("#font"); 
	        o.innerHTML+=o.innerHTML; 
	        o.scrollTop = 0; 
	    function start(){ 
	        t=setInterval(scrolling,speed); 
	        o.onmouseover=function(){p=true} 
			o.onmouseout=function(){p=false} 
	        if(!p){ o.scrollTop += 1;} 
	    } 
	    function scrolling(){ 
	        if(o.scrollTop%lh!=0){ 
	            o.scrollTop += 1; 
	            if(o.scrollTop>=o.scrollHeight/2) o.scrollTop = 0; 
	        }else{ 
	            clearInterval(t); 
	            setTimeout(start,delay); 
	        } 
	    } 
	    	setTimeout(start,delay); 
	    } 
	    startmarquee(25,30,3000,0); 
	    startmarquee(25,40,0,1); 
    }
    function init () {

        var pageData = win.pageData;

	    bind(pageData);
	    
        // 弹幕
        var barrage = new Barrage('#barrage', pageData.barrage);

	    scroller();
    }
    // start
    doc.addEventListener('DOMContentLoaded', init, false);
}(window, window.document, window.lib || (window.lib = {})));
