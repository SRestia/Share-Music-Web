import {useLocation, useNavigate} from "react-router-dom";
import {Box, Button, ButtonGroup, Grid, MenuItem, Typography} from "@mui/material";
import React, {useState, useContext, useEffect} from "react";

import UserContext from "../UserMaintain/GlobalUser";
import {Outlet} from "react-router-dom";

import SearchBox from "./SearchBox";

import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';

import AutoVerify from "../UserMaintain/AutoVerify";


const NavigateBar = () => {

    const navigate = useNavigate(); // 使用 useNavigate 钩子
    const [user, setUser] = useContext(UserContext);  // user全局变量
    const location = useLocation();  // 使用 useLocation, 来监听路由变化

    const [isNavExpanded, setIsNavExpanded] = useState(false);  // 控制导航栏是否展开

    // 并且每当页面刷新时，自动向后端发送请求，验证用户是否登录，并更新用户状态
    useEffect(() => {
        AutoVerify({user, setUser, navigate});
    }, []);

    // 每当路由变化，user.have_ws设置为false
    useEffect(() => {
        {user && user.have_ws !== false && (user.have_ws = false)}
    }, [location]);

    // 退出用户登录
    const handleLogOut = () => {
        const request_datas = {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        };
        fetch('/api/logout-user/', request_datas)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setUser(null);
                navigate('/'); // 跳转回登录页面

                // *这里需要更改，当用户在房间内退出时，由于websocket的影响，无法正常退出，需要考虑如何解决
            });
    }

    return (
        <div>
            <Grid
                container
                sx={{
                    backgroundImage: "url('../../static/images/back6.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', // 背景颜色和透明度
                    backgroundBlendMode: 'overlay', // 背景颜色和图片叠加
                }}
            >
                {/* 左侧导航栏 */}
                <Grid
                    item
                    xs={isNavExpanded ? 3.5 : 2.5}  // 超小屏幕设备
                    sm={isNavExpanded ? 2.5 : 1.5}  // 小屏设备
                    md={isNavExpanded ? 1.5 : 0.7}  // 中屏设备
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 2,
                        transition: 'all 0.3s ease', // 添加过渡动画
                    }}
                >

                    {/*左侧---上方导航栏收缩按钮以及网站名称*/}
                    <Box
                        display="flex"        // 开启flex布局
                        alignItems="center"   // 垂直居中对齐元素
                        sx={{
                            gap: 1,
                            my: 1,
                        }}
                    >
                        <Button
                            onClick={() => setIsNavExpanded(!isNavExpanded)}
                            sx={{
                                minWidth: 'auto', // 最小宽度设置为自动，以去掉按钮默认的宽度
                                padding: 0, // 去掉内边距
                                borderRadius: 6,
                                backgroundColor: 'rgba(255, 255, 255, 1)',
                            }}
                        >
                            <img src="../../../static/images/ShareMusicIcon.png" alt="Share Icon"
                                 style={{width: 35, height: 35}}/>
                        </Button>

                        <Typography style={{fontFamily: 'Satisfy', fontSize: '28px'}}>
                            {isNavExpanded ? 'ShareMusic' : ''}
                        </Typography>
                    </Box>


                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'left',
                            gap: 2,
                        }}
                    >
                        {/*个人音乐播放器*/}
                        <Button color="inherit" variant="contained" onClick={() => {
                            navigate('/personal-music-player');
                        }} style={{marginTop: '5vh'}}>
                            {isNavExpanded ? <><LibraryMusicIcon/> Music</> : <LibraryMusicIcon/>}
                        </Button>

                        {/*聊天以及房间组件*/}
                        <Button color="inherit" variant="contained" onClick={() => {
                            {
                                user && (user.in_which_room ? navigate('room-info/' + user.in_which_room) : navigate('room-info/null'));
                            }
                        }} style={{marginTop: '3vh'}}>
                            {isNavExpanded ? <><SpeakerNotesIcon/> Rooms</> : <SpeakerNotesIcon/>}
                        </Button>
                        <Button color="inherit" variant="contained" onClick={() => {
                            navigate('/create');
                        }}>
                            {isNavExpanded ? <><AddCircleIcon/> Create</> : <AddCircleIcon/>}
                        </Button>
                        <Button color="inherit" variant="contained" onClick={() => {
                            navigate('/join');
                        }}>
                            {isNavExpanded ? <><GroupAddIcon/> Join</> : <GroupAddIcon/>}
                        </Button>

                        {/*账户设置以及退出*/}
                        <Button color="inherit" variant="contained" onClick={() => {
                            navigate('/account');
                        }} style={{marginTop: '3vh'}}>
                            {isNavExpanded ? <><SettingsIcon/> Setting</> : <SettingsIcon/>}
                        </Button>
                        <Button color="inherit" variant="contained" onClick={handleLogOut}>
                            {isNavExpanded ? <><ExitToAppIcon/> LogOut</> : <ExitToAppIcon/>}
                        </Button>
                    </Box>
                </Grid>

                {/* 右侧内容区 */}
                <Grid item
                      xs={isNavExpanded ? 8.5 : 9.5}
                      sm={isNavExpanded ? 9.5 : 10.5}
                      md={isNavExpanded ? 10.5 : 11.3}
                      sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-start',  // 通过justifyContent来控制容器的上下左右边缘距离
                          pt: 8,  // 设置顶部距离
                          pb: 0,
                          pl: 0,
                          pr: 6,
                          transition: 'all 0.3s ease', // 添加过渡效果以平滑宽度变化
                      }}
                >
                    {/* 右侧---顶部搜索框 */}
                    <Box
                        sx={{
                            bgcolor: 'rgba(224, 224, 224, 1)',
                            // bgcolor: 'rgba(233, 238, 246, 1)',
                            width: '50%',
                            borderRadius: 6,
                            minHeight: '5%',  // 改为最小高度
                            my: -7,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            '&:focus-within': {
                                bgcolor: 'white',  // 聚焦时的背景色
                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)'
                            },
                        }}
                    >
                        {/* 搜索框组件 */}
                        <SearchBox/>
                    </Box>

                    {/* 右侧主内容区域 */}
                    <Box
                        sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            width: '100%',
                            borderRadius: 6,
                            height: '100vh',
                            my: 8,
                            transform: 'translateZ(0)',
                            transition: 'margin 300ms ease', // 添加过渡效果
                            backdropFilter: 'blur(50px)'  // 添加这行代码来实现背景模糊
                        }}
                    >
                        <Box
                            sx={{
                                my: 40,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            {/* 渲染子路由，跳转到不同的功能页面 */}
                            <Outlet/>
                        </Box>
                    </Box>

                </Grid>

            </Grid>
        </div>
    );
}

export default NavigateBar;
