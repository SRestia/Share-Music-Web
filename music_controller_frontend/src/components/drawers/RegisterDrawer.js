import React, { useContext, useState} from "react";
import {Box, Button, Drawer, Grid, IconButton, TextField, Typography} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Cookies from "js-cookie";

import {useNavigate} from "react-router-dom";

import CopyRight from "../utils/CopyRight";
import UserContext from "../UserMaintain/GlobalUser";

const RegisterDrawer = ({drawerRegister, setDrawerRegister}) => {

    const navigate = useNavigate(); // 使用 useNavigate 钩子
    const [user, setUser] = useContext(UserContext);  // user全局变量

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('A Cute Music Lover~');

    const [username_error, setUsername_error] = useState('');
    const [password_error, setPassword_error] = useState('');

    const handle_Register_submit = () => {
        if (confirmPassword !== password) {
            setPassword_error("passwords/confirmPassword do not match, please check again");
            return;
        }
        const request_datas = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
            body: JSON.stringify({
                username: username,
                password: password,
                email: email,
                description: description,
            }),
        };
        fetch(
            'api/create-user/', request_datas)
            .then((response) => {
                if (response.ok) {
                    response.json()
                        .then((data) => {
                            console.log(data);
                            setUser(data);
                            setDrawerRegister(false);
                            navigate('/home'); // 跳转到主页
                        });
                } else {
                    setUsername_error("the username has been used, please try another one");
                }
            });
    }


    const handle_Register_close = () => {
        setDrawerRegister(false);
    }

    return (
        <Drawer anchor="left" open={drawerRegister} onClose={handle_Register_close}>
            <Grid container sx={{height: '100vh', width: '30vw', overflow: 'hidden'}}>
                <Grid item xs={12}>
                    <Box
                        sx={{
                            my: 18,
                            mx: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%',
                        }}
                    >
                        <IconButton
                            onClick={() => setDrawerRegister(false)}
                            sx={{position: 'absolute', right: 8, top: 8}}
                        >
                            <CloseIcon/> {/* 渲染关闭图标 */}
                        </IconButton>

                        <Typography variant="h4" component="div">
                            Register
                        </Typography>


                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value); // 更新用户名状态
                                setUsername_error(''); // 清除错误信息
                            }}
                            error={Boolean(username_error)} // 如果error不为空，就显示错误信息
                            helperText={username_error}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="confirmPassword"
                            type="password"
                            autoComplete="current-password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                setPassword_error(''); // 清除错误信息
                            }}
                            error={Boolean(password_error)} // 如果error不为空，就显示错误信息
                            helperText={password_error}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="email"
                            label="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            name="description"
                            label="description"
                            value={description}
                            multiline
                            rows={3}  // 设置显示的行
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                            onClick={handle_Register_submit}
                        >
                            Submit
                        </Button>

                        <CopyRight/>

                    </Box>
                </Grid>
            </Grid>
        </Drawer>
    );
};

export default RegisterDrawer;
