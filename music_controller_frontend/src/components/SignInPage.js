import React, {useState, useContext} from "react";
import {Box, Button, FormHelperText, Grid, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";

import SignInDrawer from "./drawers/SignInDrawer";
import RegisterDrawer from "./drawers/RegisterDrawer";

import UserContext from "./UserMaintain/GlobalUser";

const SignInPage = () => {

    const navigate = useNavigate(); // 使用 useNavigate 钩子
    const [user, setUser] = useContext(UserContext);  // user全局变量

    const [drawerSignIn, setDrawerSignIn] = useState(false);
    const [drawerRegister, setDrawerRegister] = useState(false);

    const handle_register_open = () => {
        setDrawerSignIn(false);
        setDrawerRegister(true);  // 打开注册侧栏
    }

    const handle_sign_in_open = () => {
        setDrawerRegister(false);
        setDrawerSignIn(true);  // 打开登录侧栏
    }

    const handle_quick_start = () => {
        const request_datas = {
            method: 'GET', headers: {'Content-Type': 'application/json'},
        };
        fetch('api/create-user/', request_datas)
            .then((response) => response.json())
            .then((data) => {
                setUser(data);
                navigate('/home');
            });
    }

    return (
        <div className="toCenter">

            <SignInDrawer
                          drawerSignIn={drawerSignIn}
                          setDrawerSignIn={setDrawerSignIn}
                          handle_register_open={handle_register_open}
            />

            <RegisterDrawer
                            drawerRegister={drawerRegister}
                            setDrawerRegister={setDrawerRegister}
            />

            <Grid container>
                <Box
                    sx={{
                        my: 40,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3,
                    }}
                >
                    <Typography variant="h3" component="h3">
                        Share Music with friends!
                    </Typography>

                    <Button color="primary" variant="contained" onClick={handle_sign_in_open}>
                        Sign In
                    </Button>

                    <Button color="secondary" variant="contained" onClick={handle_register_open}>
                        Register
                    </Button>

                    <Button color="error" variant="contained" onClick={handle_quick_start}>
                        Quick Start
                    </Button>

                    <FormHelperText>
                        Quick Start auto create a one-time account for you.
                    </FormHelperText>
                </Box>
            </Grid>
        </div>
    );

}

export default SignInPage;