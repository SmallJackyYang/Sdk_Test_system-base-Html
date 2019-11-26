$(document).ready(function(){
    //检查登录状态，未登录跳转到登录界面
    checktoken()
})

//上传文件后缀类型校验(上传只支持.xls后缀的文件)，如果不通过，则弹出对应的提示，上传正确的文件才可执行通过
function fileChange(x){ 
    var fileName = document.getElementById(x).value;
        //未上传文件，弹出提示
        if (fileName == ''){  
            alert("请选择需要上传的文件!");
            document.getElementById(x).value="";
            return; 
        }
        //有上传文件，进行文件类型判断 
        else {   
            idx = fileName.lastIndexOf(".");   
            if (idx != -1){   
                ext = fileName.substr(idx+1).toUpperCase();   
                ext = ext.toLowerCase( ); 
                if (ext != 'xls'){
                    alert("只能上传.xls类型的文件!");
                    document.getElementById(x).value="";
                    return;  
                }   
            } else {  
               alert("只能上传.xls类型的文件!");
               document.getElementById(x).value="";
               return;
            }   
        }
}

/*
    点击上传按钮后，执行的后续操作
    主要 包括 上传参数是否填写的校验，因为每个参数为必填参数，如果没填写需要有对应的提示
    每个参数都填写后，才进行Ajax请求
*/
function checkinput(){

      

        /*一次对三个输入框的进行非空判断
        如果为空，则将输入框添加class类has-error,代表未填写
        如果非空，则将输入框添加class类has-success，代表已填写
        */
        var m1 = true;
        var m2 = true;
        var m3 = true;
        if ($("#titleinput").val() == ""){
            m1 = false;
            $("#titleinput").parent().addClass("has-error");
        }
        else{
            $("#titleinput").parent().removeClass("has-error");
            $("#titleinput").parent().addClass("has-success");
        }
        if ($("#Deviceidinput").val() == ""){
            m2 = false;
            $("#Deviceidinput").parent().addClass("has-error");
        }
        else{
            $("#Deviceidinput").parent().removeClass("has-error");
            $("#Deviceidinput").parent().addClass("has-success");
        }
        if ($("#sdkinput").val() == ""){
            m3 = false;
            $("#sdkinput").parent().addClass("has-error");
        }
        else{
            $("#sdkinput").parent().removeClass("has-error");
            $("#sdkinput").parent().addClass("has-success");
        }

        /*
            三个输入框必填校验通过之后，才进行Ajax请求操作
            否则会弹出提示，不能为空
            这里因为需要传递文件为参数值，因此与服务器协商后，使用data：formdata格式进行传递
        */
        if (m1 && m2 && m3){
            var formData = new FormData();
            formData.append('file',$('#uploadinput')[0].files[0]);// 将上传文件参数添加到formdata数据中
            formData.append('title',$("#titleinput").val());
            formData.append('device_id',$("#Deviceidinput").val());
            formData.append('sdk_version',$("#sdkinput").val());
            $.ajax({
                url:baseURL + '/case/addcase',
                type:'post',
                cache:false,
                processData: false,
                contentType: false,
                headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
                data: formData,
                success: function (response){
                        //token校验
                        if (overtimerelogin(response.code)) {
                             //上传成功
                            if(response.code == 0){
                            alert('上传成功')
                            }
                            else{
                                alert(response.message)
                            }
                        }
                },
                error: function (xhr){
                    alert("错误提示码： " + xhr.status + "\n" + "错误日志:    " + xhr.statusText);
                }
            })
        }else{
            alert("用例名称、设备ID或者sdk版本号不能为空");

            return false;
        }
}

//旧方法：下载用例上传模板文件
//因新版本加入了token等校验，此方法不行
//因为ajax方式默认返回的response会将文件解析成文件流,无法下载
function download(){
    // url = baseURL + '/case/downloadcase?id=0'
    // window.location.href=url
    $.ajax({
    url: baseURL + '/case/downloadcase?id=0',
    type:'get',
    // contentType: 'application/json',
    headers:{'uid':localStorage.getItem("uid"),'token':localStorage.getItem("token")},
    // data: {id:'0'},
    success: function(response,status,xhr){
        window.location.href = res
    }
})
}

//新方法：下载用例上传模板文件
//使用原生JS方法进行下载，定义了临时url对象，下载完成后，释放
function downLoadByUrl(){
        var xhr = new XMLHttpRequest();
        //GET请求,请求路径url,async(是否异步)
        xhr.open('GET', baseURL + '/case/downloadcase?id=0', true);
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
                    console.log(this.response);
                    var blob = this.response;
                    var filename = "用例上传模板.xls";//
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