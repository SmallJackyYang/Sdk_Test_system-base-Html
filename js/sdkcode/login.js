//登录请求，使用AES加密
function login(){
    username = $("#userid").val()
    password = $("#password").val()
     
    // AES密码加密
    password = CryptoJS.AES.encrypt(password,'43f24a7ee1e03566307d11bd41495867').toString();

    //登录请求
    $.ajax({
    url:oaURL + '/userservice/user/login',
    type:'post',
    headers:{'Project-Id':'3'},
    contentType: 'application/json',
    data: JSON.stringify({username:username,password:password,source:'oa',verify_type:'token'}),
    success: function (response){
            if (response.code == 13) {
                alert('用户不存在或密码错误')
            }
            if(response.code == 0){
                //登录成功后，在localStorage中存储token与uid，之后发送请求时，都需要在header中，加入此参数，服务器校验
                localStorage.setItem("token", response.data["token"])

                localStorage.setItem("uid",response.data["userId"])
                localStorage.setItem("nickname",response.data["nickname"])

                // 登录成功后正常跳转到用例管理界面
                window.location.href = "./findcase.html";
            }
    },
    error: function (xhr){
        alert("错误提示码： " + xhr.status + "\n" + "错误日志:    " + xhr.statusText);
    }
})
}


//判断在页面上的按键操作，如果是回车键（keycode 13），则会执行登录请求
document.onkeydown = function(e) {
    if(event.keyCode==13){
        login();
        return false;
    }   
}

//清空输入账号与密码
function clearinput(){
    username = $("#userid").val('')
    password = $("#password").val('')
}