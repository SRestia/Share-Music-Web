
const AutoVerify = ({user, setUser, navigate}) => {
    console.log("autoVerify-user-----------------------");
    fetch('/api/autoVerify-user/')  // 返回 fetch 请求
        .then((response) => {
            if (response.ok) {
                response.json().then((data) => {
                    console.log('autoVerify-user: ', data);
                    setUser(data); // 更新用户状态
                });
            } else {
                setUser(null); // 清除用户状态
                navigate('/'); // 跳转回登录页面
            }
        })
}

export default AutoVerify;