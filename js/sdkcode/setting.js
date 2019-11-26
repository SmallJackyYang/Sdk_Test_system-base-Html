//全局变量 地址

window.baseURL = '/api'

window.oaURL = ''



//token与userId是否存在校验
function checktoken(){
	// 判断localStorage是否存在token与uid,不存在则代表未登录，需要跳转到登录页面
	if (!localStorage.getItem("uid") || !localStorage.getItem("token")){
		alert('目前处于未登录状态，请登录后重试')
		window.location.href = "./login.html"
		return false
	}
	else{
		return true
	}
}

//服务器返回token超时，重新登录
function overtimerelogin(code){
	if (code == 401) {
		//token失效，则提示登录超时，跳转登录页面，删除localStorage中存储的uid与token
		localStorage.clear()
		alert('登录已超时，请重新登录')
		window.location.href = "./login.html"
		return false
	}
	else{
		//校验通过
		return true
	}
}

//logout 登出系统
function logoutsystem(){
	// 登出请求
	    BootstrapDialog.confirm({
            title: '注销账号',
            message: '是否退出系统？',
            type: BootstrapDialog.TYPE_DANGER, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
            closable: true, // <-- Default value is false
            draggable: true, // <-- Default value is false
            btnCancelLabel: '取消', // <-- Default value is 'Cancel',
            btnOKLabel: '确认退出', // <-- Default value is 'OK',
            btnOKClass: 'btn-danger', // <-- If you didn't specify it, dialog type will be used,
            callback: function(result) {
                // result will be true if button was click, while it will be false if users close the dialog directly.
                if(result) {
				    $.ajax({
						url:oaURL + '/userservice/user/logout',
						type:'get',
						headers:{'Project-Id':'3','User-id':localStorage.getItem("uid"),'Kdc-token':localStorage.getItem("token")},
						data: {userId:localStorage.getItem("uid"),projectId:3},
						success: function (response){
						    if(response.code == 0){
						  		//登出成功，则清楚所有locastorage存储的信息，然后跳转登录界面
								localStorage.clear()
								
								window.location.href = "./login.html"
						    }
						},
						error: function (xhr){
						alert("错误提示码： " + xhr.status + "\n" + "错误日志:    " + xhr.statusText);
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