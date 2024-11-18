import {Avatar, Box, Button, Grid, List, ListItem, ListItemAvatar, ListItemText, Typography} from "@mui/material";
import {Outlet, useNavigate} from "react-router-dom";

import React, {useContext, useEffect} from "react";
import UserContext from "../UserMaintain/GlobalUser";
import AutoVerify from "../UserMaintain/AutoVerify";
import Cookies from "js-cookie";

const Rooms = () => {
    const navigate = useNavigate(); // 使用 useNavigate 钩子
    const [user, setUser] = useContext(UserContext);  // user全局变量

    useEffect(() => {
        AutoVerify({user, setUser, navigate});
    }, []);

    const handle_room_click = (room_id) => {
        const request_datas = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
            body: JSON.stringify({
                room_id: room_id,
            }),
        }
        fetch('/api/update_user_in_which_room/', request_datas)
            .then((response) => {
                if (response.ok) {
                    navigate("/room-info/" + room_id);
                }
            });
    }

    return (
        <Grid container
              sx={{
                  maxHeight: '85vh',
                  minHeight: '85vh',
                  my: -37,
              }}
        >
            {/*左侧房间列表*/}
            <Grid item xs={2}
                  sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      borderRight: 1, // 添加竖线
                      borderColor: 'rgba(255,255,255,0.3)', // 使用主题中的分隔线颜色
                  }}
            >
                <Typography variant='h5' color={'rgba(255,255,255,0.8)'}>
                    Your Rooms
                </Typography>
                <List
                    sx={{
                        width: '14vw',
                        maxHeight: '75vh',
                        overflowY: 'auto',  // 当内容超出时，垂直方向上出现滚动条
                    }}
                >
                    {user && user.history_room_list && Object.entries(user.history_room_list).map(([room_id, room]) => (
                        <ListItem
                            key={room_id}
                            divider
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',  // 鼠标悬停时背景变暗
                                },
                            }}
                            onClick={() => handle_room_click(room_id)}
                        >
                            {/* 左侧房间头像 */}
                            <ListItemAvatar>
                                <Avatar
                                    src={room.room_avatar}
                                    alt={room.room_name}
                                    sx={{width: '3vw', height: '3vw'}}
                                />
                            </ListItemAvatar>

                            {/* 中间内容，房间名称和描述 */}
                            <ListItemText
                                sx={{pl: 1,}}
                                primary={room.room_name} // 上方房间名称
                                secondary={'最新聊天内容'}
                                primaryTypographyProps={{sx: {color: 'rgba(255, 255, 255, 0.8)'}}}
                                secondaryTypographyProps={{sx: {color: 'rgba(255, 255, 255, 0.6)'}}}
                            />

                            {/* 右上角的字符串 */}
                            <Box sx={{
                                position: 'absolute',
                                right: 16,
                                top: 16,
                                fontSize: '0.5vw',
                                color: 'rgba(255, 255, 255, 0.5)',
                            }}>
                                时间
                            </Box>
                        </ListItem>
                    ))}
                </List>
            </Grid>

            {/*右侧房间，包括聊天室，以及音乐播放器*/}
            <Grid item xs={10}>
                {/* 渲染子路由，跳转到不同的功能页面 */}
                <Outlet/>
            </Grid>
        </Grid>
    );
}

export default Rooms;