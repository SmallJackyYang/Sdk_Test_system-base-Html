$(document).ready(function () {
    
    //检查登录状态，未登录跳转到登录界面,如果登录状态校验通过，则进行组件和图表展示的初始化
    if (checktoken()){
        systemtime();
        timechoose();
        timechoose2();
        GetSuccessandFail();
    }
})

//获取服务器运行时间，调用另一个函数进行格式化时间戳，再返回展示
function systemtime(){
	$.ajax({
	    url: baseURL + '/statistics/exctime',
	    type:'get',
        headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
	    contentType: 'application/json',
	    // data: {},
	    success: function(response,status,xhr){
            if(overtimerelogin(response.code)){
                if(response.code == 0){
                    // alert('获取时间成功');
                    var time = response.data;
                    // console.log(time);
                    var timechange = SecondToDate(time);
                    // console.log(timechange);
                    $("#time").text("运行时长："+ timechange);
                }
                else
                {
                    alert(response.message)
                }
            }     
	    },
	    error : function(response,status,xhr){
	        if (response.code != 0) {
	            alert('请求服务器运行时间错误');
	        }
	    }
	})
}

//格式化时间戳timestamp 为天-小时-分-秒
function SecondToDate(msd) {
            var time = msd
            if (null != time && "" != time) {
                if (time > 60 && time < 60 * 60) {
                    time = parseInt(time / 60.0) + "分钟" + parseInt((parseFloat(time / 60.0) -
                        parseInt(time / 60.0)) * 60) + "秒";
                }
                else if (time >= 60 * 60 && time < 60 * 60 * 24) {
                    time = parseInt(time / 3600.0) + "小时" + parseInt((parseFloat(time / 3600.0) -
                        parseInt(time / 3600.0)) * 60) + "分钟" +
                        parseInt((parseFloat((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) -
                        parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) * 60) + "秒";
                } else if (time >= 60 * 60 * 24) {
                    time = parseInt(time / 3600.0/24) + "天" +parseInt((parseFloat(time / 3600.0/24)-
                        parseInt(time / 3600.0/24))*24) + "小时" + parseInt((parseFloat(time / 3600.0) -
                        parseInt(time / 3600.0)) * 60) + "分钟" +
                        parseInt((parseFloat((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) -
                        parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) * 60) + "秒";
                }
                else {
                    time = parseInt(time) + "秒";
                }
            }
            return time;
        }

//筛选条件过滤后的用例执行成功与失败的统计
function GetSuccessandFail(){
		$("#result").html("");
        if ($("#datetimepicker1").find("input").val() != ""&$("#datetimepicker2").find("input").val() !="") {
            var stringstarttime = $("#datetimepicker1").find("input").val() + ' 00:00:00';
            var stringendtime = $("#datetimepicker2").find("input").val() + ' 23:59:59';
            var starttime = new Date(stringstarttime).getTime();
            var endtime = new Date(stringendtime).getTime();
        }
        else{
            starttime = "";
            endtime = "";
        }
	    $.ajax({
        url:  baseURL +'/statistics/rateofexc',
        type:'post',
        contentType: 'application/json',
        headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
        data: JSON.stringify({case_id:$("#serchcaseid").val(),device_id:$("#serchdevice").val(),sdk_version:$("#serchsdk").val(),starttime:starttime,endtime:endtime}),
        success: function(response,status,xhr){
            if(overtimerelogin(response.code)){
                if(response.code == 0){

                    //获取到data数据后，判断服务器返回是否为empty，如果不为empty，则将成功次数与失败次数传入绘制图表的函数中
                    if (response.data != "empty") {
                        $("#main").css({"width": "600px","height":"400px","margin":"0 auto","padding-top": "10px"});
                        makeimage(response.data['success'],response.data['failed']);
                    }
                    
                    //如果为empty，则不进行图表绘制，并写出提示
                    else{
                        $("#main").removeAttr("_echarts_instance_").empty();
                        $("#main").css({"width": "","height":""});
                        var h2 = "<h2 id='result' style='text-align:center;padding-bottom:30px'></h2>";
                        $("#main").append(h2);
                        $("#result").html("<b>搜索结果为空,请重新输入....</b>")
                        }
                    }
                 else
                 {
                    alert(response.message)
                 }
            }
                  
        },
        error : function(response,status,xhr){
            if (response.code != 0) {
                alert('获取数据失败 错误原因' + response['message']);
            }
        }
    })
}

/*
    这里使用的是第三方库Echarts，只要把获取的数据传入对应的数值，则可以根据选择的图（如饼图，柱状图）生成对应的图表展示
    简单易用，而且展示效果较好，值得使用
    这里传入的，就两个数据：用例执行成功数量与执行失败数量
*/
function makeimage(successnumbers,failednumbers){
	$("#main").removeAttr("_echarts_instance_").empty();
	var success = successnumbers;
	var failed = failednumbers;
	var myChart = echarts.init(document.getElementById('main'));
	// 指定图表的配置项和数据
	myChart.setOption({
	  title : {
        text: '用例成功率与失败率统计',
        subtext: '图表展示',
        x:'center'
    },
    tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
        orient: 'vertical',
        left: 'left',
        data: ['成功','失败']
    },
    series : [
        {
            name: '用例执行情况',
            type: 'pie',
            radius : '55%',
            center: ['50%', '60%'],
            data:[
                {value:success, name:'成功'},
                {value:failed, name:'失败'},
            ],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
	})
}

//时间选择器插件datatimepicker初始化，与一些动态设置
function timechoose(){
		var picker1 = $('#datetimepicker1').datetimepicker({  
	    format: 'YYYY-MM-DD',  
	    locale: moment.locale('zh-cn'),
	    showTodayButton: true,
	    showClear: true 
	    //minDate: '2016-7-1'  
		});  
		var picker2 = $('#datetimepicker2').datetimepicker({  
		    format: 'YYYY-MM-DD',  
		    locale: moment.locale('zh-cn'),
		    showTodayButton: true,
		    showClear: true
		});  
		//动态设置最小值  
		picker1.on('dp.change', function (e) {  
		    picker2.data('DateTimePicker').minDate(e.date);  
		});  
		//动态设置最大值  
		picker2.on('dp.change', function (e) {  
		    picker1.data('DateTimePicker').maxDate(e.date);  
		});  
}

//时间选择器插件datatimepicker初始化，与一些动态设置
function timechoose2(){
        var picker1 = $('#datetimepicker1-2').datetimepicker({  
        format: 'YYYY-MM-DD',  
        locale: moment.locale('zh-cn'),
        showTodayButton: true,
        showClear: true 
        //minDate: '2016-7-1'  
        });  
        var picker2 = $('#datetimepicker2-2').datetimepicker({  
            format: 'YYYY-MM-DD',  
            locale: moment.locale('zh-cn'),
            showTodayButton: true,
            showClear: true
        });  
        //动态设置最小值  
        picker1.on('dp.change', function (e) {  
            picker2.data('DateTimePicker').minDate(e.date);  
        });  
        //动态设置最大值  
        picker2.on('dp.change', function (e) {  
            picker1.data('DateTimePicker').maxDate(e.date);  
        });  
}

//统计用例执行次数
function Getactiontimes(){
        if ($("#datetimepicker1-2").find("input").val() != ""&$("#datetimepicker2-1").find("input").val() !="") {
            var stringstarttime = $("#datetimepicker1-2").find("input").val() + ' 00:00:00';
            var stringendtime = $("#datetimepicker2-2").find("input").val() + ' 23:59:59';
            var starttime = new Date(stringstarttime).getTime();
            var endtime = new Date(stringendtime).getTime();
        }
        else{
            starttime = "";
            endtime = "";
        }
        $.ajax({
        url:  baseURL +'/statistics/exctimes',
        type:'post',
        contentType: 'application/json',
        headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
        data: JSON.stringify({case_id:$("#serchcaseid2").val(),device_id:$("#serchdevice2").val(),sdk_version:$("#serchsdk2").val(),starttime:starttime,endtime:endtime}),
        success: function(response,status,xhr){
            if(overtimerelogin(response.code)){
                if(response.code == 0){

                    //过滤条件筛选后用例执行次数为0，则页面出现对应提示
                    if (response.data[0] == 0) {
                        $("#result2").html("<b>在您搜索条件下的用例都未执行过，请重新输入....</b>")
                    }
                    
                    //正常展示用例执行次数
                    else {
                        $("#result2").html("<b>用例执行次数为:"+ response.data[0] + "</b>")
                    }
                    }
                 else
                 {
                    alert(response.message);
                 }
            }                 
        },
        error : function(response,status,xhr){
            if (response.code != 0) {
                alert('获取数据失败 错误原因' + response['message']);
            }
        }
    })
}