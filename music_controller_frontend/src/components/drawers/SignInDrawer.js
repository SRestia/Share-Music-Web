import React, {useContext, useState} from "react";
import {Box, Button, Drawer, Grid, IconButton, TextField, Typography} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";

import UserContext from "../UserMaintain/GlobalUser";

import CopyRight from "../utils/CopyRight";

const SignInDrawer = ({drawerSignIn, setDrawerSignIn, handle_register_open}) => {

    const navigate = useNavigate(); // 使用 useNavigate 钩子
    const [user, setUser] = useContext(UserContext);  // user全局变量

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');

    const handle_signIn_submit = () => {
        console.log(username, password);
        const request_datas = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        };
        fetch('api/verify-user/', request_datas)
            .then((response) => {
                if (response.ok) {
                    response.json()
                        .then((data) => {
                            console.log(data);
                            setUser(data);
                            setDrawerSignIn(false);
                            navigate('/home'); // 跳转到主页
                        });
                } else {
                    setError("Username or Password is incorrect, please check again");
                }
            });
    }

    const handle_SignIn_close = () => {
        setDrawerSignIn(false);
    }

    return (
        <Drawer anchor="left" open={drawerSignIn} onClose={handle_SignIn_close}>
            <Grid container sx={{height: '100vh', width: '30vw', overflow: 'hidden'}}>
                <Grid item xs={12}>
                    <Box
                        sx={{
                            my: 26,
                            mx: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <IconButton
                            onClick={() => setDrawerSignIn(false)}
                            sx={{position: 'absolute', right: 8, top: 8}}
                        >
                            <CloseIcon/> {/* 渲染关闭图标 */}
                        </IconButton>

                        <Typography variant="h4" component="div">
                            Sign In
                        </Typography>

                        <br/>

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setError(''); // 清除错误信息
                            }}
                            error={Boolean(error)} // 如果error不为空，就显示错误信息
                            helperText={error}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                            onClick={handle_signIn_submit}
                        >
                            Submit
                        </Button>

                        <Grid item xs={12}>
                            <Button>
                                Forgot password?
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button onClick={handle_register_open}>
                                Don't have an account? Register Now!
                            </Button>
                        </Grid>

                        <CopyRight/>
                    </Box>
                </Grid>
            </Grid>
        </Drawer>
    );
};

export default SignInDrawer;
