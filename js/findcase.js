$(document).ready(function () {
    // $("#mytable").bootstrapTable('destroy');

    makeTable();//初始化表格 进入页面就要有表格显示

    $("#submitbtn").click(makeTable); //根据提交的查询条件生成新的表格，需要刷新！
})


function makeTable(){
    $("#mytable").bootstrapTable('destroy');
    $("#mytable").bootstrapTable({
    url:baseURL + "/case/findcase",   //请求地址
    striped : true, //是否显示行间隔色
    method : 'post',
    // toolbar: '#toolbar',
    datatype : 'json',
    paginationShowPageGo: true,
    showJumpto: true,
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
    responseHandler : function(response){
      return response.data;
    },
    columns : [ 
    {
        title : '序号',
        align:'center',
        // sortable : true,
        formatter: function(value,row,index){
        var pageSize=$('#mytable').bootstrapTable('getOptions').pageSize;//通过表的#id 可以得到每页多少条
        var pageNumber=$('#mytable').bootstrapTable('getOptions').pageNumber;//通过表的#id 可以得到当前第几页
        return pageSize * (pageNumber - 1) + index + 1;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号
        }
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
                '<button class="btn btn-info" onclick="download('+value+')">下载</button> &nbsp;&nbsp;',
                '<button class="btn btn-danger" onclick="deletecase('+value+')" >删除</button> &nbsp;&nbsp;',
                '<button class="btn btn-primary" onclick="detail(\''+value+'\')" data-toggle="modal" data-target="#detail">查看执行结果</button> &nbsp;&nbsp',
                // '<button class="btn btn-primary" onclick="actioncase('+value+')" >执行</button>'
                ].join("")
        }
    }]
});
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
    //动态设置最小值  
    picker1.on('dp.change', function (e) {  
        picker2.data('DateTimePicker').minDate(e.date);  
    });  
    //动态设置最大值  
    picker2.on('dp.change', function (e) {  
        picker1.data('DateTimePicker').maxDate(e.date);  
    });  
});
    $(function(){
        $("#datetimepicker1").find("input").val("");
        $("#datetimepicker2").find("input").val("");
        $("#serchtitle").val("");
        $("#serchsdk").val("");
        $("#serchdevice").val("");
});
}

function deletecase(caseid){
    var caseid = caseid;
    console.log(caseid);
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
                            data: {id:caseid},
                            success: function(response,status,xhr){
                                         if(response.code == 0){
                                                alert('删除用例成功');
                                                makeTable();
                                                }
                                         else
                                         {
                                            alert(response.message)
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
                    // function ajaxdelete(){
                        // $("#fat-btn").button('loading')
                        $("#"+ caseid).button('loading');
                        $.ajax({
                            url: baseURL + '/case/exccase',
                            type:'get',
                            contentType: 'application/json',
                            data: {id:caseid},
                            success: function(response,status,xhr){
                                         if(response.code == 0){
                                                alert('执行用例成功');
                                                $("#"+ caseid).button('reset');
                                                $("#mytable").bootstrapTable('refresh');
                                                }
                                         else
                                         {
                                            alert(response.message);
                                            $("#"+ caseid).button('reset');
                                            $("#mytable").bootstrapTable('refresh');
                                         }
                            },
                            error : function(response,status,xhr){
                                if (response.code != 0) {
                                    alert('执行用例失败');
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

function updateput(casetitle,casesdk_version,casedevice_id,caseid){
    var title1 = casetitle;
    var sdk_version1 = casesdk_version;
    var device_id1 = casedevice_id;
    var id1 = caseid;
    $("#updatetitle").val(title1);
    $("#updatesdk").val(sdk_version1);
    $("#updatedevice").val(device_id1);
    console.log($("#updatetitle").val());
    console.log($("#updatesdk").val());
    console.log($("#updatedevice").val());
    $("#updatebtn").one("click",function(){
        $.ajax({
        url: baseURL + '/case/updatecase',
        type:'post',
        contentType: 'application/json',
        data: JSON.stringify({id:id1,title:$("#updatetitle").val(),sdk_version:$("#updatesdk").val(),device_id:$("#updatedevice").val()}),
        success: function(response,status,xhr){
                     if(response.code == 0){
                            // $("#updatebtn").off("click", "函数名");
                            $("#updatecase").modal('hide');
                            alert('更新用例成功');
                            $("#mytable").bootstrapTable('refresh');
                            // makeTable();
                            // window.location.reload();
                            // $('#updatecase').on('hide.bs.modal', function () {
                            // alert('模态框关闭了');
                            // });
                            }
                     else
                     {
                        alert(response.message)
                     }
        },
        error : function(response,status,xhr){
            if (response.code != 0) {
                alert('更新用例失败 错误原因' + response.message);
            }
        }
    })
    });
}

function detail(caseid){
    var id = caseid;
    var info;
    $.ajax({
    url: baseURL+ '/case/findcaselog',
    type:'get',
    contentType: 'application/json',
    data: {id:caseid},
    success: function(response,status,xhr){
                 if(response.code == 0){
                        var id = 1;
                        // alert("成功")
                        $.each(response.data, function(property,values){
                                length = values.length
                                data = values
                                $.each(data, function(property,values){
                                    // console.log(property)
                                    // console.log(values)
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
                    
                                // var result = values["result"]
                                // if (result == 'failed') {
                                //     result =  '失败';
                                //     $("#tableble").append(
                                //     "<tr><td>&nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp;"+id+"</td>"
                                //     +"<td ro>"+values["event"]+"</td>"
                                //     +"<td>&nbsp;&nbsp&nbsp;&nbsp"+values["case_param"]+"</td>"
                                //     +"<td>"+values["param_value"]+"</td>"
                                //     +"<td>"+values["param_result"]+"</td>"
                                //     +"<td style='color:#B22222'>"+result+"</td></tr>"
                                //     );      
                                // }
                                // else
                                // {
                                //     result = '通过';
                                //     $("#tableble").append(
                                //     "<tr><td>&nbsp;&nbsp&nbsp;&nbsp&nbsp;&nbsp;"+id+"</td>"
                                //     +"<td>"+values["event"]+"</td>"
                                //     +"<td>&nbsp;&nbsp&nbsp;&nbsp"+values["case_param"]+"</td>"
                                //     +"<td>"+values["param_value"]+"</td>"
                                //     +"<td>"+values["param_result"]+"</td>"
                                //     +"<td style='color:#008000'>"+result+"</td></tr>"
                                //     );
                    
                                // }
                                // id += 1
                            }
                            );
                        }
                 else
                 {
                    alert(response.message)
                 }
    },
    error : function(response,status,xhr){
        if (response.code != 0) {
            alert('执行用例失败');
        }
    }
    })
}

function cleartable(){
    $("#tableble").html("");
}

function download(id){
    url = baseURL + '/case/downloadcase?id=' + id
    // console.log(url)
    window.location.href=url
}