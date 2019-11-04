$(document).ready(function(){
    $("#submit1").click(function(){
        var m1 = true;
        var m2 = true;
        var m3 = true;
        // var m4 = true;
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
        console.log(m1);
        console.log(m2);
        console.log(m3);
        if (m1 && m2 && m3){
            var formData = new FormData();
            formData.append('file',$('#uploadinput')[0].files[0]);
            formData.append('title',$("#titleinput").val());
            formData.append('device_id',$("#Deviceidinput").val());
            formData.append('sdk_version',$("#sdkinput").val());
            // formData.append('dana_ip',$("#danaipinput").val());
            // formData.append('dana_usrname',$("#danauserinput").val());
            // formData.append('dana_pwd',$("#danapwdinput").val());
            // formData.append('dana_sql',$("#sqlinput").val());
            // alert('上传ing');
            $.ajax({
                url:baseURL + '/case/addcase',
                type:'post',
                cache:false,
                processData: false,
                contentType: false,
                data: formData,
                success: function (response){
                    // if(response.code == 0){
                        // window.event.returnValue = false;
                        alert('上传成功');
                    // }
                },
                error: function (xhr){
                    alert("错误提示码： " + xhr.status + "\n" + "错误日志:    " + xhr.statusText);
                }
            })
        }else{
            alert("用例名称、设备ID或者sdk版本号不能为空");

            return false;
        }
    })

});

function fileChange(x){ 
    //检测上传文件的类型
    // alert("hello");
    var fileName = document.getElementById(x).value;
    // console.log(fileName);
        if (fileName == ''){  
            alert("请选择需要上传的文件!");
            document.getElementById(x).value="";
            return; 
        } else {   
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

function download(){
    url = baseURL + '/case/downloadcase?id=0'
    // console.log(url)
    window.location.href=url
}