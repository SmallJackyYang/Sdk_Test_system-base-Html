$(document).ready(function () {
    //检查登录状态，未登录跳转到登录界面
    if (checktoken()){
        makeTable()//初始化表格 进入页面就要需要表格能够显示
    }
})


function makeTable(){
    $("#mytable").bootstrapTable('destroy');// 生成新的表格时，先摧毁之前的表格

    /*
        开始生成表格，这里使用的是bootstrapTable第三方插件
        设置好对应的配置之后，发送请求即可，具体参数配置项可搜索bootstrapTable进行查看
        本项目分页使用的是服务器分页
        发送请求时，需要带上对应的查询过滤条件（如果有的话），服务器有做 默认空 代表搜索全部的处理
        收到服务器请求之后，开始做对应的表格数据格式化处理
    */
    $("#mytable").bootstrapTable({
    url:baseURL + "/case/findcase",   //请求地址
    striped : true, //是否显示行间隔色
    method : 'post',
    // toolbar: '#toolbar',
    datatype : 'json',
    paginationShowPageGo: true,
    showJumpto: true,
    ajaxOptions:{
        headers: {"uid":localStorage.getItem("uid"),"token":localStorage.getItem("token")}
    },
    // showExport: true,  //是否显示导出按钮
    // buttonsAlign: "right",  //按钮位置
    // exportTypes: ['excel'],  //导出文件类型
    // Icons: 'glyphicon-export',
    // search: true,
    // contentType: 'application/json',
    // sortable : true,
    sortOrder : "asc",
    pageNumber : 1, //初始化加载第一页
    pagination : true,//是否分页
    sidePagination : 'server',//server:服务器端分页|client：前端分页
    pageSize : 5,//单页记录数
    pageList : [5, 10, 30, 50],//可选择单页记录数
    // showRefresh : true,//刷新按钮
    queryParamsType : '',
    queryParams : function(params){

        //时间选取不包含具体时间，因为需要在日期选择器返回的值上加上时间
        var stringstarttime = $("#datetimepicker1").find("input").val() + ' 00:00:00';
        var stringendtime = $("#datetimepicker2").find("input").val() + ' 23:59:59';

        var starttime = new Date(stringstarttime).getTime();
        var endtime = new Date(stringendtime).getTime();
        var temp = {
            pageSize : params.pageSize,
            pageNumber : params.pageNumber,
            title : $("#serchtitle").val(),
            sdk_version : $("#serchsdk").val(),
            device_id : $("#serchdevice").val(),
            starttime : starttime,
            endtime : endtime,
        };
        return temp;
    },
    cache: false,
 

    //返回句柄处理
    responseHandler : function(response){
      //token校验
      if (overtimerelogin(response.code)) {
        return response.data
      }
    },

    /*
        这一块列的数据处理，稍微复杂一些，主要就是将请求后服务器端返回的结果按照需要的表格展示排列
        有些列还需要对数据进行格式化处理，方法为定义formatter:function(value,row,index){}
        比如将时间戳格式化为具体的年月日时分秒进行展示，用例的执行状态进行颜色标记
        最复杂的部分当属 ‘操作’，其中包含了对用例的改、删、执行、查看用例执行结果、下载结果
        每个操作对应一个自定义函数处理
    */
    columns : [ 
    // {
    //     title : '序号',
    //     align:'center',
    //     // sortable : true,
    //     formatter: function(value,row,index){
    //     var pageSize=$('#mytable').bootstrapTable('getOptions').pageSize;//通过表的#id 可以得到每页多少条
    //     var pageNumber=$('#mytable').bootstrapTable('getOptions').pageNumber;//通过表的#id 可以得到当前第几页
    //     return pageSize * (pageNumber - 1) + index + 1;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号
    //     }
    // }, 
        {
        title : '用例ID',
        field : 'id',
        align:'center',
        // sortable : true
    },
        {
        title : '用例名称',
        field : 'title',
        align:'center',
        // sortable : true
    },
    {
        title : '用例状态',
        field : 'case_status',
        align:'center',
        formatter:function(value,row,index){
            var thisStr = '';

            //根据返回值进行展示区别
            if (value == 0)
            {
                thisStr = '<span style="color:Crimson;font-weight:bold">未执行</span>';
            }
            else if (value == 1){
                thisStr = '<span style="color:#008000;font-weight:bold">已执行</span>';
            }
            return thisStr;
        }
        // sortable : true
    }, {
        title : '创建时间',
        field : 'createtime',
        align:'center',
        formatter:function(value,row,index){

            //时间戳转化为具体的年月日时分秒
            return new Date(parseInt(value)).toLocaleString().replace(/:\d{1,2}$/,' ');
        }
        // sortable : true
    },{
        title : 'SDK版本',
        field : 'sdk_version',
        align:'center',
        // sortable : true
    },{
        title : '设备号',
        field : 'device_id',
        align:'center',
        // sortable : true
    },{
        title : '操作',
        field : 'id',
        align : 'center',
        formatter: function(value,row,index){

            /*
                操作部分，单独注释
                首先根据用例状态进行可操作内容区分，区别为 未执行的用例，有执行、更新用例、删除用例的操作
                已执行的用例，有执行、更新用例、下载用例结果、删除用例、查看结果的操作
                点击按钮将需要的对应参数传到自定义函数中，进行相关请求操作
                具体细节看对应的函数
            */
            if (row.case_status == 0)
            {   
                return[
                // '<a href="http://192.168.90.52:8887/case/exccase?id= +'+value+'">下载</a> &nbsp;&nbsp;',
                '<button id = "'+value+'" class="btn btn-warning" onclick="actioncase('+value+')" data-loading-text="执行中..." >执行</button> &nbsp;&nbsp;',
                '<button class="btn btn-primary" onclick="updateput(\''+row.title+'\',\''+row.sdk_version+'\',\''+row.device_id+'\',\''+value+'\')" data-toggle="modal" data-target="#updatecase">更新用例</button> &nbsp;&nbsp',
                '<button class="btn btn-danger" onclick="deletecase('+value+')" >删除</button> &nbsp;&nbsp;',
                // '<button class="btn btn-primary" onclick="actioncase('+value+')" >执行</button>'
                ].join("")
            }
            else 
              return[
                '<button id = "'+value+'" class="btn btn-warning" onclick="actioncase('+value+')" data-loading-text="执行中...">执行</button> &nbsp;&nbsp;',
                '<button class="btn btn-primary" onclick="updateput(\''+row.title+'\',\''+row.sdk_version+'\',\''+row.device_id+'\',\''+value+'\')" data-toggle="modal" data-target="#updatecase">更新用例</button> &nbsp;&nbsp',
                '<a class="btn btn-info"  onclick="downLoadByUrl('+value+',\''+row.file+'\')">下载</a> &nbsp;&nbsp;',
                '<button class="btn btn-danger" onclick="deletecase('+value+')" >删除</button> &nbsp;&nbsp;',
                '<button class="btn btn-primary" onclick="detail(\''+value+'\')" data-toggle="modal" data-target="#detail">查看结果</button> &nbsp;&nbsp',
                // '<button class="btn btn-primary" onclick="actioncase('+value+')" >执行</button>'
                ].join("")
        }
    }]
}); 
    
    //时间选择器，使用的是第三方插件datetimepicker，这里是进行对应时间格式化，以及汉化，刷新按钮、清除按钮的配置
    $(function () {  
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

    //动态设置最小值，前者不能比后者大
    picker1.on('dp.change', function (e) {  
        picker2.data('DateTimePicker').minDate(e.date);  
    });  
    //动态设置最大值，后者不能比前者小
    picker2.on('dp.change', function (e) {  
        picker1.data('DateTimePicker').maxDate(e.date);  
    });  
}); 
    //执行完请求之后，将所有的查询条件输入清空
    $(function(){
        $("#datetimepicker1").find("input").val("");
        $("#datetimepicker2").find("input").val("");
        $("#serchtitle").val("");
        $("#serchsdk").val("");
        $("#serchdevice").val("");
});
}

/*
    删除用例操作
    使用的是第三方插件BootstrapDialog
    配置一些Dialog的参数之后，当用户点击OKLabel后，即确认后，调用callback函数，请求删除对应caseid的用例
    删除成功，需要重新绘制table
*/
function deletecase(caseid){
    var caseid = caseid;
    BootstrapDialog.confirm({
            title: '删除用例',
            message: '是否确认删除该用例（此行为不可撤销）',
            type: BootstrapDialog.TYPE_DANGER, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
            closable: true, // <-- Default value is false
            draggable: true, // <-- Default value is false
            btnCancelLabel: '取消！', // <-- Default value is 'Cancel',
            btnOKLabel: '确认！', // <-- Default value is 'OK',
            btnOKClass: 'btn-danger', // <-- If you didn't specify it, dialog type will be used,
            callback: function(result) {
                // result will be true if button was click, while it will be false if users close the dialog directly.
                if(result) {
                    // function ajaxdelete(){
                        $.ajax({
                            url: baseURL+ '/case/delcase',
                            type:'get',
                            contentType: 'application/json',
                            headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
                            data: {id:caseid},
                            success: function(response,status,xhr){
                                        //token失效校验
                                        if(overtimerelogin(response.code)) {
                                            if(response.code == 0){
                                            alert('删除用例成功')

                                            //重新绘制表格
                                            makeTable()
                                            }
                                        else
                                        {
                                            alert(response.message)
                                        }
                                    }

                            },
                            error : function(response,status,xhr){
                                if (response.code != 0) {
                                    alert('删除用例失败');
                                }
                            }
                        })
                    // }
                }
                else {
                    return;
                }
            }
        });
}


/*
    执行用例操作
    使用的是第三方插件BootstrapDialog，用户点击确认后，执行按钮会添加一个loading状态，此时按钮不可再次点击，直到返回结果
    将按钮的loading状态reset，并根据结果刷新table
*/
function actioncase(caseid){
    var caseid = caseid;
    console.log(caseid);
    BootstrapDialog.confirm({
            title: '执行用例',
            message: '是否确认执行该用例（已执行的用例无法再更新）',
            type: BootstrapDialog.TYPE_PRIMARY, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
            closable: true, // <-- Default value is false
            draggable: true, // <-- Default value is false
            btnCancelLabel: '取消!', // <-- Default value is 'Cancel',
            btnOKLabel: '确认!', // <-- Default value is 'OK',
            btnOKClass: 'btn-primary', // <-- If you didn't specify it, dialog type will be used,
            callback: function(result) {
                // result will be true if button was click, while it will be false if users close the dialog directly.
                if(result) {
                        //点击后，button变为loading状态
                        $("#"+ caseid).button('loading');

                        $.ajax({
                            url: baseURL + '/case/exccase',
                            type:'get',
                            contentType: 'application/json',
                            headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
                            data: {id:caseid},
                            success: function(response,status,xhr){
                                        //token失效校验
                                        if(overtimerelogin(response.code)){
                                            if(response.code == 0){
                                            alert('执行用例成功');
                                            //button状态重置reset
                                            $("#"+ caseid).button('reset');

                                            $("#mytable").bootstrapTable('refresh');
                                            }
                                         else
                                         {
                                            alert(response.message);
                                            //button状态重置reset
                                            $("#"+ caseid).button('reset');
                                            $("#mytable").bootstrapTable('refresh');
                                         }
                                        }     
                            },
                            error : function(response,status,xhr){
                                if (response.code != 0) {
                                    alert('执行用例失败');
                                    $("#"+ caseid).button('reset');
                                }
                            }
                        })
                    // }
                }
                else {
                    return;
                }
            }
        });
}


/*
    更新用例操作
    此次使用了bootstrap的模态框功能，因此需要使用输入框修改用例的参数以便进行更新，并且模态框中用例的当前的值需要填入
    之后就按照正常请求方式，带参数请求即可
    请求完成后（不管成功与未成功），需将模态框隐藏
*/
function updateput(casetitle,casesdk_version,casedevice_id,caseid){
    var title1 = casetitle;
    var sdk_version1 = casesdk_version;
    var device_id1 = casedevice_id;
    var id1 = caseid;
    //将传递过来的用例参数填入输入框中
    $("#updatetitle").val(title1);
    $("#updatesdk").val(sdk_version1);
    $("#updatedevice").val(device_id1);

    $("#updatebtn").one("click",function(){
        $.ajax({
        url: baseURL + '/case/updatecase',
        type:'post',
        contentType: 'application/json',
        headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
        data: JSON.stringify({id:id1,title:$("#updatetitle").val(),sdk_version:$("#updatesdk").val(),device_id:$("#updatedevice").val()}),
        success: function(response,status,xhr){

                    if(overtimerelogin(response.code)){
                        if(response.code == 0){

                        //请求完成后，模态框 hide
                        $("#updatecase").modal('hide');

                        alert('更新用例成功');
                        $("#mytable").bootstrapTable('refresh');
              
                        }
                        else
                        {
                            $("#updatecase").modal('hide');
                            alert(response.message)
                        }
                    }

        },
        error : function(response,status,xhr){
            if (response.code != 0) {
                $("#updatecase").modal('hide');
                alert('更新用例失败 错误原因' + response.message);
            }
        }
    })
    });
}

/*
    执行用例结果详情
    此次使用了bootstrap的模态框功能，事先创建一个空的table
    之后根据返回的结果，并且根据返回的结果，使用append填入表格
    需要注意的是，这里没有使用动态合并单元格（项目需求：相同的event事件需要将其单元格合并）
    而是在写入表格之前，统计好需要的合并的单元格数量，直接生成
*/
function detail(caseid){
    var id = caseid;
    var info;
    $.ajax({
    url: baseURL+ '/case/findcaselog',
    type:'get',
    contentType: 'application/json',
    headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
    data: {id:caseid},
    success: function(response,status,xhr){
                if(overtimerelogin(response.code)){
                    if(response.code == 0){
                        var id = 1;
                        $.each(response.data, function(property,values){
                                length = values.length
                                data = values
                                $.each(data, function(property,values){
                                    //相同的event事件合并单元格
                                    if (property == 0) {
                                        var result = values["result"]
                                        if (result == 'failed') {
                                            result =  '失败';
                                            $("#tableble").append(
                                            "<tr><td style='text-align:center'>"+id+"</td>"
                                            +"<td style='vertical-align:middle;text-align:center' align='center' rowspan=\""+length+"\">"+values["event"]+"</td>"
                                            +"<td style='text-align:center'>"+values["case_param"]+"</td>"
                                            +"<td style='text-align:center'>"+values["param_value"]+"</td>"
                                            +"<td style='text-align:center'>"+values["param_result"]+"</td>"
                                            +"<td style='color:#B22222;text-align:center'>"+result+"</td></tr>"
                                            );      
                                        }
                                        else
                                        {
                                            result = '通过';
                                            $("#tableble").append(
                                            "<tr><td style='text-align:center'>"+id+"</td>"
                                            +"<td style='vertical-align:middle;text-align:center' align='center' rowspan=\""+length+"\">"+values["event"]+"</td>"
                                            +"<td style='text-align:center'>"+values["case_param"]+"</td>"
                                            +"<td style='text-align:center'>"+values["param_value"]+"</td>"
                                            +"<td style='text-align:center'>"+values["param_result"]+"</td>"
                                            +"<td style='color:#008000;text-align:center'>"+result+"</td></tr>"
                                            )
                                        };
                                        id +=1
                                    }

                                    //不需要合并的行，直接填入数据，略过event事件
                                    else{
                                       var result = values["result"]
                                        if (result == 'failed') {
                                            result =  '失败';
                                            $("#tableble").append(
                                            "<tr><td style='text-align:center'>"+id+"</td>"
                                            // +"<td style='vertical-align:middle;text-align:center' align='center' rowspan=\""+length+"\">"+values["event"]+"</td>"
                                            +"<td style='text-align:center'>"+values["case_param"]+"</td>"
                                            +"<td style='text-align:center'>"+values["param_value"]+"</td>"
                                            +"<td style='text-align:center'>"+values["param_result"]+"</td>"
                                            +"<td style='color:#B22222;text-align:center'>"+result+"</td></tr>"
                                            );      
                                        }
                                        else
                                        {
                                            result = '通过';
                                            $("#tableble").append(
                                            "<tr><td style='text-align:center'>"+id+"</td>"
                                            // +"<td style='vertical-align:middle;text-align:center' align='center' rowspan=\""+length+"\">"+values["event"]+"</td>"
                                            +"<td style='text-align:center'>"+values["case_param"]+"</td>"
                                            +"<td style='text-align:center'>"+values["param_value"]+"</td>"
                                            +"<td style='text-align:center'>"+values["param_result"]+"</td>"
                                            +"<td style='color:#008000;text-align:center'>"+result+"</td></tr>"
                                            )
                                        };
                                        id +=1
                                    }
                                });
                            }
                            );
                        }
                else
                {
                    alert(response.message)
                }
            }
            
    },
    error : function(response,status,xhr){
        if (response.code != 0) {
            alert('执行用例失败');
        }
    }
    })
}

//关闭 查看结果 模态框后，需要清除对应的table，否则再次打开，数据残留
function cleartable(){
    $("#tableble").html("");
}

//使用原生JS方法进行下载，定义了临时url对象，下载完成后，释放
function downLoadByUrl(caseid,file){
        var xhr = new XMLHttpRequest();
        //GET请求,请求路径url,async(是否异步)
        xhr.open('GET', baseURL + '/case/downloadcase?id='+caseid, true);
        //设置请求头参数的方式,如果没有可忽略此行代码
        xhr.setRequestHeader("token",localStorage.getItem("token"));
        xhr.setRequestHeader("uid",localStorage.getItem("uid"));
        //设置响应类型为 blob
        xhr.responseType = 'blob';
        //关键部分
        xhr.onload = function (e) {
            //如果请求执行成功
            if (this.status == 200) {
                if (this.response["type"] = 'application/octet-stream') {
                    var blob = this.response;
                    var filename = file;//
                    var a = document.createElement('a');

                    blob.type = "application/octet-stream";
                    //创键临时url对象
                    var url = URL.createObjectURL(blob);
                    console.log(url)
                    a.href = url;
                    a.download=filename;
                    a.click();
                    //释放之前创建的URL对象
                    window.URL.revokeObjectURL(url);
                }
                else if(this.response["type"] = 'application/json'){
                    alert('下载文件失败，请检查是否登录超时or未登录')
                }
            }
            else{
                alert('请求下载文件失败')
            }
        };
        //发送请求
        xhr.send();
}