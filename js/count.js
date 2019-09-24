$(document).ready(function () {
	systemtime();
	// console.log(baseURL);
	// GetSuccessandFail();
    timechoose();
    timechoose2();
	// makeimage();
	GetSuccessandFail();
	$("#submitbtn").click(GetSuccessandFail);
    $("#submitbtn2").click(Getactiontimes);
})

function systemtime(){
	$.ajax({
	    url: baseURL + '/statistics/exctime',
	    type:'get',
	    contentType: 'application/json',
	    // data: {},
	    success: function(response,status,xhr){
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
	    },
	    error : function(response,status,xhr){
	        if (response.code != 0) {
	            alert('请求服务器运行时间错误');
	        }
	    }
	})
}

function SecondToDate(msd) {
            var time =msd
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

function GetSuccessandFail(){
		$("#result").html("");
        // console.log($("#datetimepicker1").find("input").val());
        if ($("#datetimepicker1").find("input").val() != ""&$("#datetimepicker2").find("input").val() !="") {
            var stringstarttime = $("#datetimepicker1").find("input").val() + ' 00:00:00';
            var stringendtime = $("#datetimepicker2").find("input").val() + ' 23:59:59';
            // console.log(stringstarttime);
            // console.log(stringendtime);
            // if stringstarttime
            var starttime = new Date(stringstarttime).getTime();
            var endtime = new Date(stringendtime).getTime();
            // console.log(starttime);
            // console.log(endtime);
        }
        else{
            starttime = "";
            endtime = "";
        }

	    $.ajax({
        url:  baseURL +'/statistics/rateofexc',
        type:'post',
        contentType: 'application/json',
        data: JSON.stringify({case_id:$("#serchcaseid").val(),device_id:$("#serchdevice").val(),sdk_version:$("#serchsdk").val(),starttime:starttime,endtime:endtime}),
        success: function(response,status,xhr){
                     if(response.code == 0){
                     	console.log(response.data);
                     	if (response.data != "empty") {
                            $("#main").css({"width": "600px","height":"400px","margin":"0 auto","padding-top": "10px"});
         					makeimage(response.data['success'],response.data['failed']);
         				}
         				else{
         					// alert('搜索结果为空');
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
        },
        error : function(response,status,xhr){
            if (response.code != 0) {
                alert('获取数据失败 错误原因' + response['message']);
            }
        }
    })
}

function makeimage(successnumbers,failednumbers){
	$("#main").removeAttr("_echarts_instance_").empty();
	var success = successnumbers;
	var failed = failednumbers;
	// console.log(success);
	// console.log(failed);
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

function Getactiontimes(){
        if ($("#datetimepicker1-2").find("input").val() != ""&$("#datetimepicker2-1").find("input").val() !="") {
            var stringstarttime = $("#datetimepicker1-2").find("input").val() + ' 00:00:00';
            var stringendtime = $("#datetimepicker2-2").find("input").val() + ' 23:59:59';
            console.log(stringstarttime);
            console.log(stringendtime);
            // if stringstarttime
            var starttime = new Date(stringstarttime).getTime();
            var endtime = new Date(stringendtime).getTime();
            console.log(starttime);
            console.log(endtime);
        }
        else{
            starttime = "";
            endtime = "";
        }
        $.ajax({
        url:  baseURL +'/statistics/exctimes',
        type:'post',
        contentType: 'application/json',
        data: JSON.stringify({case_id:$("#serchcaseid2").val(),device_id:$("#serchdevice2").val(),sdk_version:$("#serchsdk2").val(),starttime:starttime,endtime:endtime}),
        success: function(response,status,xhr){
                     if(response.code == 0){
                        console.log(response.data[0]);
                        if (response.data[0] == 0) {
                            $("#result2").html("<b>在您搜索条件下的用例都未执行过，请重新输入....</b>")
                        }
                        else {
                            $("#result2").html("<b>用例执行次数为:"+ response.data[0] + "</b>")
                        }
                        }
                     else
                     {
                        alert(response.message);
                     }
        },
        error : function(response,status,xhr){
            if (response.code != 0) {
                alert('获取数据失败 错误原因' + response['message']);
            }
        }
    })
}