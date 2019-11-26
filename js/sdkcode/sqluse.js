$(document).ready(function(){
    //检查登录状态，未登录跳转到登录界面
    if (checktoken()){
        sqlinitialize()//sql输入框初始化
    }
})
function sqlfind(){

    //初始化表格，支持不用刷新页面多次查询
    $("#mytable1").html("")
    $("#tableble").html("")

    //取参数值，用于AJAX传递，sql1参数给sql语句中 *符号为 <*（服务器格式要求）
	var db1 = $("#db").val()
	var sql1 = "#" + editor.getValue()
	sql1 = sql1.replace(/\*/g,"#\*")
    sql1 = sql1.replace(/from/ig,"#from")

    //Ajax 请求
    $.ajax({
    url: baseURL + '/dana/data',
    type:'post',
    contentType: 'application/json',
    headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
    data: JSON.stringify({db:db1,sql:sql1}),// 发送ajax参数时需要在sql参数前加一个‘<’符合 （服务器格式要求）
    success: function(response,status,xhr){
        if(overtimerelogin(response.code)) {
                    if(response.code == 0){
                    var results = response.data;// data 对象取出来进行单独处理

                    //如果查询结果data返回为空，则报提示
                    if(results == '')
                    {
                        $("#exportExcel").addClass("hidden")
                        alert('未查询到对应的数据，请检查SQL语句是否正确or等待一段时间再查询')
                        return false
                    }
                    //取data中的第一条数据，使用对象自带的Object.keys()函数将健都放到一个list中
                    var temp_result = results[0];
                    var list_temp = Object.keys(temp_result)
                    
                    //为了在第一个与最后一个参数加入对应的代表单行开头与结尾的<tr>、</tr>标签，将第一个与最后一个参数名的值取出来
                    var first = list_temp[0] 
                    var last = list_temp[list_temp.length - 1]

                    //第一行表格列，将list中所有字段名使用append依次添加进去
                    for (m = 0; m < list_temp.length; m++){
                        $("#mytable1").append("<th style='text-align:center'>"+list_temp[m]+"</th>");
                    }

                    /*
                        第一层循环，目的为遍历data中每个对象（每个对象为表格中一行的数据）
                        第二层循环，目的为将第一层循环中遍历的对象中的键对应的值，使用append依次添加进定义的临时变量str1中
                        注意，第一个参数开头需要添加<tr>标签,代表行的开始
                        最后一个参数结尾添加</tr>标签，代表行的结束
                        其它的参数使用统一的添加方式加进去即可
                    */
                    for(j in results){

                        //表格中的每一行的数据，都使用这个参数进行存储，最后使用append，添加节点方式，加入表格之中
                        var str1 = '';

                        for(i in results[j]){
                            
                            //第一个参数,在开头加上<tr>标签
                            if(i == first){
                                str1 = "<tr><td style='text-align:center'>"+results[j][i]+"</td>"
                            }

                            //最后一个参数，在结尾加上</tr>标签
                            else if(i == last){
                                str1+="<td style='text-align:center'>"+results[j][i]+"</td></tr>"                     
                            }

                            //其余参数，使用统一的方式
                            else{
                                  str1+="<td style='text-align:center'>"+results[j][i]+"</td>"     
                            }
                        }

                        //将上面循环出的结果（str1），一行的数据插入表格中
                        $("#tableble").append(str1);
                        $("#exportExcel").removeClass("hidden");
                    }
                }

                //返回的code不是0，出现其它情况，弹出服务器返回的message信息
                else
                {
                    alert(response.message)
                }
        }
},
    error : function(response,status,xhr){
        if (response.code != 0) {
            alert('查询失败 错误原因' + response.message);
        }
    }
	})
}

//第一种Excel 导出方式 自己构造导出方法（excel表现效果较好，时间戳等数字都存的str类型，不会出现科学计数法的情况，缺点是不会自动换行）
var tablesToExcel = (function() {
        var uri = 'data:application/vnd.ms-excel;base64,'
            , tmplWorkbookXML = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
            + '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>Axel Richter</Author><Created>{created}</Created></DocumentProperties>'
            + '<Styles>'
            + '<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>'
            + '<Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>'
            + '</Styles>'
            + '{worksheets}</Workbook>'
            , tmplWorksheetXML = '<Worksheet ss:Name="{nameWS}"><Table>{rows}</Table></Worksheet>'
            , tmplCellXML = '<Cell{attributeStyleID}{attributeFormula}><Data ss:Type="{nameType}">{data}</Data></Cell>'
            , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
            , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
        return function(tables, wsnames, wbname, appname) {
            var ctx = "";
            var workbookXML = "";
            var worksheetsXML = "";
            var rowsXML = "";

            for (var i = 0; i < tables.length; i++) {
                if (!tables[i].nodeType) tables[i] = document.getElementById(tables[i]);

                //控制要导出的行数，项目的数据所有行都要导出，可以根据需求灵活处理
                for (var j = 0; j < tables[i].rows.length; j++) {
                    rowsXML += '<Row>';

                //控制导出的列数,项目所有的列都要导出，可以根据需求灵活处理
                    for (var k = 0; k < tables[i].rows[j].cells.length; k++) {
                        var dataType = tables[i].rows[j].cells[k].getAttribute("data-type");
                        var dataStyle = tables[i].rows[j].cells[k].getAttribute("data-style");
                        var dataValue = tables[i].rows[j].cells[k].getAttribute("data-value");
                        dataValue = (dataValue)?dataValue:tables[i].rows[j].cells[k].innerHTML;
                        var dataFormula = tables[i].rows[j].cells[k].getAttribute("data-formula");
                        dataFormula = (dataFormula)?dataFormula:(appname=='Calc' && dataType=='DateTime')?dataValue:null;
                        ctx = {  attributeStyleID: (dataStyle=='Currency' || dataStyle=='Date')?' ss:StyleID="'+dataStyle+'"':''
                            , nameType: (dataType=='Number' || dataType=='DateTime' || dataType=='Boolean' || dataType=='Error')?dataType:'String'
                            , data: (dataFormula)?'':dataValue
                            , attributeFormula: (dataFormula)?' ss:Formula="'+dataFormula+'"':''
                        };
                        rowsXML += format(tmplCellXML, ctx);
                    }
                    rowsXML += '</Row>'
                }
                ctx = {rows: rowsXML, nameWS: wsnames[i] || 'Sheet' + i};
                worksheetsXML += format(tmplWorksheetXML, ctx);
                rowsXML = "";
            }

            ctx = {created: (new Date()).getTime(), worksheets: worksheetsXML};
            workbookXML = format(tmplWorkbookXML, ctx);

            // 查看后台的打印输出
            console.log(workbookXML);

            var link = document.createElement("A");
            link.href = uri + base64(workbookXML);
            link.download = wbname || 'Workbook.xls';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    })();


//第二种Excel导出方式jquery-table2excel，使用第三方库的话，使用起来较为方便，，易于上手，但是时间戳数字会显示为科学计数法，需要格式化写入才能解决
function Export(){
    $("#resulttable").table2excel({
        exclude: ".noExl",
        name: "Excel Document Name",
        filename: "myFileName" + new Date().toISOString().replace(/[\-\:\.]/g, "") + ".xls",
        // fileext: ".xls",
        // exclude_img: true,
        // exclude_links: true,
        // exclude_inputs: true,
        // preserveColors: preserveColors
    });
}

//引用第三方库CodeMirror,以便输入SQL语句的时候能够像IDE一样，有自动补全，代码折叠，关键字高亮等功能
function sqlinitialize(){
    window.editor = CodeMirror.fromTextArea(document.getElementById("sql"), {
        mode: "text/x-mysql",    //实现sql代码高亮
        lineNumbers: true,  //显示行号
        // theme: "duotone-light", //设置主题
        lineWrapping: true, //代码折叠
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        matchBrackets: true,  //括号匹配
        extraKeys: {"Tab": "autocomplete"}
    });
}

//判断输入条件是否满足 满足后弹出模态框
function sqlnameinputdialog(){
    if ($("#db").val().trim().length == 0 | editor.getValue().trim().length == 0) {
        alert('dana数据库名称与sql语句为填写， 请检查')
    }
    else{
        $('#inputname').modal('show')
    }
}

//保存sql语句
function sqsave(){
    var dbname = $("#db").val()
    var sql = "#" + editor.getValue()
    sql = sql.replace(/\*/g,"#\*")
    sql = sql.replace(/from/ig,"#from")
    var sqlname = $("#fileName").val()
    if (sqlname.trim().length == 0){
        alert('名称不能为空！')
        // $("#inputname").modal('hide')
    }
    else{
        $.ajax({
            url: baseURL + '/dana/savesql',
            type:'post',
            contentType: 'application/json',
            headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
            data: JSON.stringify({title:sqlname,db:dbname,sqlstring:sql}),
            success: function(response,status,xhr){
                        if(overtimerelogin(response.code)){
                            if(response.code == 0){
                                $("#inputname").modal('hide')
                                alert('保存成功！')

                            }
                            else
                            {   
                                $("#inputname").modal('hide')
                                alert('保存sql语句异常 错误原因' + response.message)

                            }
                        }
            },
            error : function(response,status,xhr){
                if (response.code != 0) {
                    $("#inputname").modal('hide')
                    alert('保存sql语句失败 错误原因' + response.message)
                }
            }
        })
    }
}

//查询保存的sql语句，公共函数，方便调用
function findsql(){
    $.ajax({
        url: baseURL + '/dana/findsql',
        type:'get',
        contentType: 'application/json',
        headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
        success: function(response,status,xhr){
                    if(overtimerelogin(response.code)){
                        if(response.code == 0){
                            var str = ""

                            /*
                                因为传递参数的时候带了单引号，如果字符串本身也带单引号，则会报错，因此将sql语句中的单引号都转换成?这个符号，再传递
                                已保存的sql语句，有三个操作可选择：打开，重命名，删除 
                                点击按钮会传递参数给对应的函数，进行操作
                            */
                            for (var i=0;i<response.data.length;i++) {
                                strtmp = response.data[i].sqlstring.replace(/\'/g,"\?")
                                str += '<tr><td style="text-align:center;vertical-align:middle">'+response.data[i].title+'</td><td style="text-align:center;vertical-align:middle">'+ new Date(parseInt(response.data[i].createtime)).toLocaleString().replace(/:\d{1,2}$/,' ')+ '</td><td style="text-align:center;vertical-align:middle"><button class="btn btn-primary btn-sm on" onclick="opensql(\''+response.data[i].db+'\',\''+strtmp+'\')">打开</button><button class="btn btn-info btn-sm" style="margin-left:5px" onclick="renamesql(\''+response.data[i].id+'\',\''+response.data[i].title+'\')">重命名</button><button class="btn btn-danger btn-sm" style="margin-left:5px" onclick="delsql(\''+response.data[i].id+'\')">删除</button></td>'
                            }
                            $("#sqldetailtable").append(str)
                        }
                        else
                        {   
                            alert('查询sql语句异常 错误原因' + response.message)
                        }
                    }
        },
        error : function(response,status,xhr){
            if (response.code != 0) {
                alert('查询sql语句失败 错误原因' + response.message)
            }
        }
    })
}

//将我的查询界面展示出来
function mysavesql(){
    $('#detail').modal('show')
    findsql()
}


//关闭 查看结果 模态框后，需要清除对应的table，否则再次打开，数据残留
function cleartable(){
    $("#sqldetailtable").empty("")
}

//删除保存的sql语句
function delsql(id){
    var sqlid = id
    BootstrapDialog.confirm({
        title: '删除保存的查询语句',
        message: '是否确认删除该查询语句（此行为不可撤销）',
        type: BootstrapDialog.TYPE_DANGER, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
        closable: true, // <-- Default value is false
        draggable: true, // <-- Default value is false
        btnCancelLabel: '取消', // <-- Default value is 'Cancel',
        btnOKLabel: '确认', // <-- Default value is 'OK',
        btnOKClass: 'btn-danger', // <-- If you didn't specify it, dialog type will be used,
        callback: function(result) {
            // result will be true if button was click, while it will be false if users close the dialog directly.
            if(result) {
                // function ajaxdelete(){
                $.ajax({
                    url: baseURL + '/dana/delsql',
                    type:'get',
                    contentType: 'application/json',
                    headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
                    data: {id:sqlid},
                    success: function(response,status,xhr){
                                if(overtimerelogin(response.code)){
                                    if(response.code == 0){
                                        // $('#detail').modal('hide')
                                        alert('删除sql成功！')
                                        $("#sqldetailtable").empty("")
                                        findsql()
                                    }
                                    else
                                    {   
                                        alert('删除sql语句异常 错误原因' + response.message)

                                    }
                                }
                    },
                    error : function(response,status,xhr){
                        if (response.code != 0) {
                            alert('删除sql语句失败 错误原因' + response.message)
                        }
                    }
                })
            }
            else {
                return;
            }
        }
    });
}

//打开保存的查询语句，将对应保存的sql查询中的数据库名与sql语句赋值到文本输入框中
function opensql(dbname,sqlstring){
    $("#db").val(dbname)
    editor.setValue(sqlstring.replace(/\?/g,"\'").replace(/#/g,""))
    cleartable()
    $('#detail').modal('hide')
}

//重命名保存的语句
function renamesql(id,title){
    $('#rename').modal('show')
    $("#refileName").val(title)
    window.tmp_id = id
    console.log(tmp_id)
}   

//发送更新请求
function sendrename(){
    title = $("#refileName").val()
    console.log(title)
    $.ajax({
        url: baseURL + '/dana/updatesql',
        type:'post',
        contentType: 'application/json',
        headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
        data: JSON.stringify({id:tmp_id,title:title}),
        success: function(response,status,xhr){
                    if(overtimerelogin(response.code)){
                        if(response.code == 0){
                            $('#rename').modal('hide')
                            alert('更新成功！')
                            $("#sqldetailtable").empty("")
                            findsql()
                        }
                        else
                        {   
                            alert('更新sql语句异常 错误原因' + response.message)

                        }
                    }
        },
        error : function(response,status,xhr){
            if (response.code != 0) {
                alert('更新sql语句失败 错误原因' + response.message)
            }
        }
    })
}