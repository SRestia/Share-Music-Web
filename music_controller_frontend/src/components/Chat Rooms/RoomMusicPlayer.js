import {useContext, useEffect, useState} from "react";
import React from 'react';
import {Box, Button, Grid, IconButton, List, ListItem, ListItemText, Typography} from "@mui/material";
import Cookies from "js-cookie";
import RoomAudioBar from "./RoomAudioBar";
import room_music_operation_ws_tool from "./room_music_operation_ws_tool";

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import DeleteIcon from "@mui/icons-material/Delete";


const RoomMusicPlayer = ({websocket, list_update, setListUpdate}) => {

    // 个人音乐列表(单个元素包含音乐的基本信息，name，mid，id，singer，album，album_mid)
    const [room_music_list, setRoomMusicList] = useState([]);

    // 个人音乐数据列表(单个元素除了基本信息外，额外还有cover_url, lyric_list, mp3_url)
    const [room_music_data_list, setRoomMusicDataList] = useState([]);
    const music_data = (song_name, song_mid, song_id, singer, album, album_mid, cover_url, lyric_list, mp3_url) => {
        return {
            song_name, song_mid, song_id, singer, album, album_mid, cover_url, lyric_list, mp3_url,
        };
    };
    const findSongInMusicDataList = (song_mid) => {   // 查找音乐数据列表room_music_data_list中的音乐, 并返回
        return room_music_data_list.find(item => item.song_mid === song_mid);
    };
    const addMusicData = (newMusicData) => {  // 添加音乐数据
        setRoomMusicDataList(prevList => [...prevList, newMusicData]);
    };
    const removeMusicData = (song_mid) => {  // 删除音乐数据
        setRoomMusicDataList(prevList => prevList.filter(item => item.song_mid !== song_mid));
    };


    // 用于判断是否显示模糊效果，也就是是否在"词"，"列"，"未选择也就是默认播放"页面，分别用'lyric','list','null'来表示。
    const [mode, setMode] = useState(null);

    // 当前播放的音乐
    const [current_song, setCurrentSong] = useState(null);

    const [hoveredIndex, setHoveredIndex] = useState(-1);  // -1 表示没有任何项被聚焦


    // 通过websocket监听房间音乐操作(额外的监听器)，包括添加音乐数据，删除音乐数据，设置当前播放的音乐
    useEffect(() => {
        if (websocket) {
            const RoomMusicListener = (event) => {
                const messageData = JSON.parse(event.data);
                // console.log('ws.addEventListener in RoomMusicPlayer: ', messageData);

                if (messageData.event === 'room_music_operation') {
                    if (messageData.operation === 'addMusicData') {
                        console.log('RoomMusicListener --- addMusicData: ', messageData.music_data.song_name);
                        addMusicData(messageData.music_data);
                    } else if (messageData.operation === 'removeMusicData') {
                        console.log('RoomMusicListener --- removeMusicData: ', messageData.music_data);
                        removeMusicData(messageData.music_data);
                    } else if (messageData.operation === 'setCurrentSong') {
                        console.log('RoomMusicListener --- setCurrentSong: ', messageData.music_data.song_name);
                        setCurrentSong(messageData.music_data);
                    }
                }
            };
            websocket.addEventListener("message", RoomMusicListener);

            return () => {
                websocket.removeEventListener("message", RoomMusicListener);
            };
        }
    }, [websocket]);


    // 当 用户切换到音乐列表时，更新音乐列表
    useEffect(() => {
        if (mode === 'list') {
            get_room_music_list();
            console.log('useEffect (mode)');
        }
    }, [mode]);
    // 当 list_update 为true时(增加/删除音乐)，更新音乐列表
    // 注意！这两个必须分开，因为存在mode和list_update同时为true的情况，而此时由于list_update的更新，会执行两次get_room_music_list()，导致重复请求
    useEffect(() => {
        if (list_update) {
            get_room_music_list();
            setListUpdate(false);
            console.log('useEffect (list_update)');
        }
    }, [list_update]);
    const get_room_music_list = () => {
        const request_datas = {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        };
        fetch('/api/room-music-list/', request_datas)
            .then((response) => response.json())
            .then((data) => {
                console.log('get_room_music_list, data: ', data);
                setRoomMusicList(data);
            });
    }

    // 删除用户的音乐列表中的一首音乐
    const handleDeletePersonalMusic = (song) => {
        const request_datas = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
            body: JSON.stringify(song),
        };
        fetch('/api/room-delete-music/', request_datas)
            .then((response) => response.json())
            .then((data) => {
                console.log('handleDeletePersonalMusic, data: ', data);

                // 这里由于/api/room-delete-music/的views.py已经替我们删除了数据库中的音乐，并群发要求所有房间中的用户更新音乐列表，
                // 所以我们需要的就是推送给所有用户 删除前端该音乐的缓存数据
                // removeMusicData(song.song_mid);
                room_music_operation_ws_tool(websocket, 'removeMusicData', song.song_mid);  // 通过websocket通知其他用户删除音乐

                if (current_song && current_song.song_mid === song.song_mid) {
                    setCurrentSong(null); // 如果删除的是当前播放的音乐，则停止播放
                }
            });
    }

    // 双击音乐列表中的音乐，获取音乐播放信息(cover_url, lyric_list, mp3), 并播放音乐
    const handle_double_click_song_to_play = (song) => {
        // 如果当前播放的音乐和双击的音乐相同，则不做任何操作
        if (current_song && current_song.song_mid === song.song_mid) {
            console.log('current_song === double_click_song');
            return;
        }

        // 首先检查该音乐是否已经存在于 room_music_data_list 中
        const query = findSongInMusicDataList(song.song_mid);
        if (query) {
            setCurrentSong(query);  // 设置当前播放的音乐
            console.log('setCurrentSong: ', query);
            return;
        }

        // 如果音乐不存在，则发送请求获取音乐播放信息
        const request_datas = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
            body: JSON.stringify(song),
        };
        fetch('/api/music-play-info/', request_datas)
            .then((response) => response.json())
            .then((data) => {
                // 在获取数据后添加到 music list 中
                const new_song = music_data(
                    song.song_name, song.song_mid, song.song_id, song.singer, song.album, song.album_mid,
                    data.cover_url, data.lyric_list, data.mp3_url
                )
                // addMusicData(new_song);
                room_music_operation_ws_tool(websocket, 'addMusicData', new_song);  // 通过websocket通知其他用户添加音乐
                // setCurrentSong(new_song);
                room_music_operation_ws_tool(websocket, 'setCurrentSong', new_song);  // 通过websocket通知其他用户设置当前播放的音乐
                console.log('setCurrentSong: ', new_song);
            });
    };


    // 播放下一首音乐
    const handleNextSong = () => {
        const currentIndex = room_music_list.findIndex(song => song.song_mid === current_song.song_mid);
        const nextIndex = (currentIndex + 1) % room_music_list.length; // 使用取余来循环到列表开始
        handle_double_click_song_to_play(room_music_list[nextIndex]);
    };
    // 播放上一首音乐
    const handlePreviousSong = () => {
        const currentIndex = room_music_list.findIndex(song => song.song_mid === current_song.song_mid);
        const previousIndex = (currentIndex - 1 + room_music_list.length) % room_music_list.length; // 处理负数索引的情况
        handle_double_click_song_to_play(room_music_list[previousIndex]);
    };


    return (
        // 外壳，用于包裹整个音乐播放器
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
        >

            {/* 1.歌曲照片、基础信息、播放栏、页面 */}
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                sx={{
                    gap: 2,
                    borderRadius: '20px',
                    width: '80%',
                    filter: mode ? "blur(30px)" : "none",   // 在mode为'lyric'或'list'时，进行模糊处理
                    transition: "filter 0.1s",
                }}
            >
                {/*歌曲图片*/}
                <Box
                    sx={{marginTop: '5vh'}}
                >
                    <img
                        src={current_song ? current_song.cover_url : '../../static/images/m2.jpg'}  // 使用占位符图像
                        alt={current_song ? current_song.song_name : 'empty.jpg'}
                        style={{
                            height: 'auto',
                            width: '8vw',
                            borderRadius: '10px',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)',  // 添加底边阴影
                        }}
                    />
                </Box>

                {/*歌曲基本信息*/}
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="left"
                    sx={{
                        gap: 2,
                        width: '90%',
                        marginLeft: 2.5,
                    }}
                >
                    <Typography sx={{color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px'}}>
                        {current_song ? `${current_song.song_name}` : '歌曲名: ...'}
                    </Typography>

                    <Typography sx={{color: 'rgba(255, 255, 255, 0.7)'}}>
                        {current_song ? `${current_song.singer}` : '歌手: ...'}
                    </Typography>

                    <Typography sx={{color: 'rgba(255, 255, 255, 0.7)'}}>
                        {current_song ? `${current_song.album ? current_song.album : '...'}` : '专辑: ...'}
                    </Typography>
                </Box>

                {/*按钮栏*/}
                <Box
                    xs={12}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',  // 改为靠左对齐
                        marginTop: 12,
                        marginLeft: -20,
                    }}
                >
                    {/* 按钮 切换至房间音乐列表 */}
                    <Button
                        onClick={() => {
                            console.log('click list button')
                            setMode('list')
                        }}
                        sx={{color: 'rgba(255,255,255,0.5)'}}
                    >
                        <Typography>列</Typography>
                    </Button>

                    {/* 按钮 切换至歌词部分 */}
                    <Button
                        onClick={() => {
                            console.log('click list button')
                            setMode('lyric')
                        }}
                        sx={{color: 'rgba(255,255,255,0.5)', marginLeft: -1}}
                    >
                        <Typography>词</Typography>
                    </Button>
                </Box>

                {/*播放栏 --- 进度条，音量条，播放，前后切换*/}
                <Box>
                    {/* 传递当前播放的音乐 */}
                    {current_song && current_song.mp3_url ? (
                        <RoomAudioBar websocket={websocket} current_song_url={current_song.mp3_url}
                                      NextSong={handleNextSong}
                                      PreviousSong={handlePreviousSong}/>
                    ) : (
                        <RoomAudioBar current_song_url={null}/>
                    )}
                </Box>
            </Box>

            {/*2.房间音乐列表页面*/}
            {mode && mode === 'list' && (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    sx={{
                        gap: 1,
                        height: '65vh',
                        position: 'absolute',
                    }}
                >
                    <Typography variant="h5" color={'rgba(255, 255, 255, 0.7)'}>
                        Musics
                    </Typography>

                    <List
                        sx={{
                            // backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            width: '100%',
                            maxHeight: '75vh',
                            overflowY: 'auto',  // 当内容超出时，垂直方向上出现滚动条
                            '&::-webkit-scrollbar': {
                                width: '6px', // 设置滚动条的宽度为 6px，减小它的宽度
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)', // 设置滚动条的颜色为半透明
                                borderRadius: '3px', // 使滚动条圆润
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)', // 设置滚动条背景
                            },
                        }}
                    >
                        {room_music_list.map((song, index) => (
                            <ListItem
                                key={index}
                                divider
                                onMouseEnter={() => setHoveredIndex(index)}  // 当鼠标进入时设置索引
                                onMouseLeave={() => setHoveredIndex(-1)}  // 当鼠标离开时重置索引
                                onDoubleClick={() => handle_double_click_song_to_play(song)}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.1)',  // 鼠标悬停时背景变暗
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={`${index + 1}.${song.song_name}`}
                                    secondary={`${song.singer}  ---  ${song.album ? song.album : '...'}`}
                                    primaryTypographyProps={{sx: {color: 'rgba(255, 255, 255, 0.7)'}}}
                                    secondaryTypographyProps={{sx: {color: 'rgba(255, 255, 255, 0.6)'}}}
                                />
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    size='small'
                                    onClick={() => handleDeletePersonalMusic(song)}
                                    style={{visibility: hoveredIndex === index ? 'visible' : 'hidden'}}  // 基于状态控制可见性
                                >
                                    <DeleteIcon/>
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>

                    <Button
                        onClick={() => setMode(null)}
                        sx={{
                            color: 'rgba(255,255,255,0.5)',
                            position: 'absolute',
                            top: '83vh',
                            marginLeft: '-13vw',
                        }}
                    >
                        <ArrowBackIosNewIcon/>
                    </Button>
                </Box>
            )}


            {/*3.当前歌曲的歌词页面*/}
            {mode && mode === 'lyric' && (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    sx={{position: 'absolute'}}
                >
                    <Typography variant="h5" color={'rgba(255, 255, 255, 0.7)'} style={{marginBottom: '3vh'}}>
                        Lyric
                    </Typography>

                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        sx={{
                            width: '90%',
                            gap: 1.5,
                            height: '75vh',
                            overflow: 'auto',             // 启用滚动
                            scrollbarWidth: 'none',       // 对于 Firefox 浏览器隐藏滚动条
                            '&::-webkit-scrollbar': {     // 对于 Webkit 浏览器隐藏滚动条
                                display: 'none',
                            },
                        }}
                    >
                        {current_song && current_song.lyric_list.map((line, index) => (
                                <Typography
                                    key={index}
                                    variant="body1"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                    }}
                                >
                                    {line || <br/>} {/* 如果是空行，插入换行 */}
                                </Typography>
                            )) ||
                            // 如果当前没有歌词，则显示提示信息
                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                }}
                            >
                                当前未选取任何歌曲
                                或该歌曲没有歌词信息
                            </Typography>
                        }
                    </Box>

                    <Button
                        onClick={() => setMode(null)}
                        sx={{
                            color: 'rgba(255,255,255,0.5)',
                            position: 'absolute',
                            top: '83vh',
                            marginLeft: '-13vw',
                        }}
                    >
                        <ArrowBackIosNewIcon/>
                    </Button>
                </Box>
            )}

        </Box>
    )
}

export default RoomMusicPlayer;