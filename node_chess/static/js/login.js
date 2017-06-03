window.onload = function(){
	var loginBtn = document.getElementById('login'),
	    nameText = document.getElementById('name'),	    
	    noName   = document.getElementById('noName');

	loginBtn.onclick = function(event){
		if (nameText.value == '') {
			noName.innerText = '请输入昵称！';
			return false;
		} else if (pwText.value == '') {
			noPassword.innerText = '请输入密码！';
			return false;
		} else {
			return true;
		}
	}
}