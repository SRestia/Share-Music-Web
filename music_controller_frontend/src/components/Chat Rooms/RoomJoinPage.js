import React, {useContext, useEffect, useState} from "react";

import {useNavigate} from 'react-router-dom';

import {Button, Grid, Typography, TextField, Box, CardMedia, Card, Chip, Tooltip, IconButton} from '@mui/material';

import Cookies from "js-cookie";

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const RoomJoinPage = () => {

    const navigate = useNavigate(); // 使用 useNavigate 钩子

    const [room_id, set_room_id] = useState('');
    const [error, setError] = useState('');

    const [room_list, setRoomList] = useState([]);

    const handleJoin = () => {
        /*
            将输入的room_id发送给后端，后端返回response，
            如果response.ok为true，就跳转到'/room-info/' + room_id，
            否则将当然的error信息设置为"Room not found"，并通过TextField组件动态更新，显示在页面上。
         */
        console.log(room_id);
        const request_datas = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
            body: JSON.stringify({
                room_id: room_id,
            }),
        };
        fetch(
            '/api/join-room/', request_datas)
            .then((response) => {
                if (response.ok) {
                    navigate("/room-info/" + room_id);
                } else {
                    setError("Room not found, please try others");
                }
            });
    }

    const get_room_list = () => {
        const request_datas = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }
        fetch('/api/room-list/', request_datas)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setRoomList(data);
            });
    }
    useEffect(() => {
        get_room_list();
    }, []);

    return (
        <Grid container
              display="flex"
              flexDirection="column"
              alignItems="center"
              spacing={3}
              sx={{my: -30}}
        >
            <Typography variant='h5' color={'rgba(255, 255, 255, 0.8)'}>
                Room List
            </Typography>

            {/*左侧当前存在的所有房间的显示列表*/}
            <Grid item xs={12}
                  sx={{overflowY: 'auto', maxHeight: '50vh'}}
            >
                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center'}}>
                    {room_list && room_list.map((room) => (
                        <Card
                            key={room.room_id}
                            sx={{
                            width: '18vw',
                            display: 'flex',
                            flexDirection: 'row',
                            mb: 2,
                            position: 'relative',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',  // 深灰色背景，适合黑色主题
                            color: 'rgba(255, 255, 255, 0.8)',  // 浅色文字，确保在深色背景下的可读性
                        }}>
                            <CardMedia
                                component="img"
                                sx={{width: '5vw', height: '5vw', borderRadius: '48%', my: 2, ml: 2,}}
                                image={room.avatar}
                                alt="Room Avatar"
                            />
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                pl: 2,
                                gap: 1,
                                position: 'relative'
                            }}>
                                <Typography variant="h6" noWrap>
                                    {room.room_name}
                                </Typography>
                                <Box sx={{display: 'flex', gap: 1}}>
                                    {room.room_labels.map(label => (
                                        <Chip label={label} key={label} size="small"
                                              sx={{backgroundColor: 'rgba(97, 97, 97, 0.5)', color: 'rgba(255, 255, 255, 0.7)'}}/>
                                    ))}
                                </Box>
                                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{pl: 0.4}}>
                                    {room.description
                                        ? (room.description.length > 15
                                            ? `${room.description.slice(0, 15)}...`
                                            : room.description)
                                        : "---"}
                                </Typography>

                            </Box>
                            {/* Add the IconButton for copying room.room_id */}
                            <Tooltip title="Copy Room ID" placement="top">
                                <IconButton
                                    sx={{position: 'absolute', top: 6, right: 6, color: 'white'}}
                                    onClick={() => set_room_id(room.room_id)}
                                >
                                    <ContentCopyIcon fontSize='small'/>
                                </IconButton>
                            </Tooltip>
                        </Card>
                    ))}
                </Box>
            </Grid>


            {/*中间为‘根据房间id加入房间’的输入框*/}
            <Grid item xs={12} sx={{marginTop: 10, ml: 8,}}
            >
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{gap: 3}}
                >
                    <TextField
                        error={Boolean(error)}
                        helperText={error}
                        label="Room Id"
                        value={room_id}
                        placeholder="six digits"
                        variant="outlined"
                        onChange={(e) => set_room_id(e.target.value)}
                        InputLabelProps={{
                            style: {color: 'rgba(255, 255, 255, 0.5)'}
                        }}
                        inputProps={{
                            style: {color: 'rgba(255, 255, 255, 0.8)'}
                        }}
                        sx={{
                            '& label.Mui-focused': {
                                color: 'rgba(255, 255, 255, 0.9)',
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.9)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.9)',
                                },
                            }
                        }}
                    />

                    <Button color="inherit" variant="contained" onClick={handleJoin}>
                        Join
                    </Button>
                </Box>
            </Grid>

        </Grid>
    );

}

export default RoomJoinPage;