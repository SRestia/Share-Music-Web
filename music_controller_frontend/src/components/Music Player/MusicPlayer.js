import React, {useState, useContext, useEffect} from "react";
import {Box, Grid, IconButton, List, ListItem, ListItemText, Typography} from "@mui/material";
import {useLocation} from "react-router-dom";
import Cookies from "js-cookie";

import DeleteIcon from '@mui/icons-material/Delete';
import AudioBar from "./AudioBar";

const MusicPlayer = () => {

    // 个人音乐列表
    const [personal_music_list, setPersonalMusicList] = useState([]);

    // 个人音乐数据列表
    const [personal_music_data_list, setPersonalMusicDataList] = useState([]);
    const music_data = (song_name, song_mid, song_id, singer, album, album_mid, cover_url, lyric_list, mp3_url) => {
        return {
            song_name, song_mid, song_id, singer, album, album_mid, cover_url, lyric_list, mp3_url,
        };
    };
    const findSongInMusicDataList = (song_mid) => {   // 查找音乐数据列表personal_music_data_list中的音乐, 并返回
        return personal_music_data_list.find(item => item.song_mid === song_mid);
    };
    const addMusicData = (newMusicData) => {  // 添加音乐数据
        setPersonalMusicDataList(prevList => [...prevList, newMusicData]);
    };
    const removeMusicData = (song_mid) => {  // 删除音乐数据
        setPersonalMusicDataList(prevList => prevList.filter(item => item.song_mid !== song_mid));
    };


    // 当前播放的音乐
    const [current_song, setCurrentSong] = useState(null);

    // 当current_song发生变更时，只有当下一首歌的cover_url加载好后，再进行显示，这样就避免了切换时的闪烁。
    const [displayCover, setDisplayCover] = useState(null);  // 用于显示的封面图片
    useEffect(() => {
        if (current_song) {
            const img = new Image();
            img.src = current_song.cover_url;

            // 图片加载完成后，更新displayCover为当前歌曲的cover url
            img.onload = () => {
                setDisplayCover(current_song.cover_url);
            };
        }
    }, [current_song]);

    const location = useLocation();  // 使用 useLocation, 来监听路由变化
    const [hoveredIndex, setHoveredIndex] = useState(-1);  // -1 表示没有任何项被聚焦

    // 每当路由变化，从后端获取个人音乐列表
    useEffect(() => {
        get_personal_music_list();
    }, [location]);
    const get_personal_music_list = () => {
        const request_datas = {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        };
        fetch('api/personal-music-list/', request_datas)
            .then((response) => response.json())
            .then((data) => {
                console.log('get_personal_music_list, data: ', data);
                setPersonalMusicList(data);
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
        fetch('api/personal-delete-music/', request_datas)
            .then((response) => response.json())
            .then((data) => {
                console.log('handleDeletePersonalMusic, data: ', data);
                get_personal_music_list(); // 删除成功后，重新获取音乐列表
                removeMusicData(song.song_mid); // 删除浏览器缓存的音乐数据
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

        // 首先检查该音乐是否已经存在于 personal_music_data_list 中
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
        fetch('api/music-play-info/', request_datas)
            .then((response) => response.json())
            .then((data) => {
                // 在获取数据后添加到 music list 中
                const new_song = music_data(
                    song.song_name, song.song_mid, song.song_id, song.singer, song.album, song.album_mid,
                    data.cover_url, data.lyric_list, data.mp3_url
                )
                addMusicData(new_song);
                setCurrentSong(new_song);  // 设置当前播放的音乐
                console.log('setCurrentSong: ', new_song);
            });
    };


    // 播放下一首音乐
    const handleNextSong = () => {
        const currentIndex = personal_music_list.findIndex(song => song.song_mid === current_song.song_mid);
        const nextIndex = (currentIndex + 1) % personal_music_list.length; // 使用取余来循环到列表开始
        handle_double_click_song_to_play(personal_music_list[nextIndex]);
    };
    // 播放上一首音乐
    const handlePreviousSong = () => {
        const currentIndex = personal_music_list.findIndex(song => song.song_mid === current_song.song_mid);
        const previousIndex = (currentIndex - 1 + personal_music_list.length) % personal_music_list.length; // 处理负数索引的情况
        handle_double_click_song_to_play(personal_music_list[previousIndex]);
    };


    return (
        // 外部底层图片部分
        <Box
            sx={{
                transition: 'all 0.1s ease',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 6,
                my: -40,
                // backgroundColor: displayCover ? 'transparent' : 'rgba(0, 0, 0, 0.7)',
                ...(displayCover && {
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${displayCover})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(50px)',
                        zIndex: -2,
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', // 可选：增加覆盖层以降低亮度
                        zIndex: -1,
                    },
                }),
            }}
        >
            {/*内部组件部分*/}
            <Grid container
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                      my: 5,
                  }}
            >
                {/* 左侧---歌曲照片以及基础信息 */}
                <Grid item
                      xs={3}
                      sx={{
                          // marginTop: -30,
                          // position: 'relative',
                          // left: 50, // 调整这个值来控制向右的距离
                          // marginLeft: 10, // 调整这个值来控制向右的距离
                      }}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        sx={{
                            gap: 2,
                            my: -40,
                            marginLeft: 16, // 调整这个值来控制向右的距离
                            width: '70%',
                        }}
                    >
                        <img
                            src={current_song ? current_song.cover_url : '../../static/images/m2.jpg'}  // 使用占位符图像
                            alt={current_song ? current_song.song_name : 'empty.jpg'}
                            style={{
                                height: 'auto',
                                width: '12vw',
                                borderRadius: '10px',
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',  // 添加底边阴影
                            }}
                        />

                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="left"
                            sx={{
                                gap: 1.5,
                                ml: 5,
                            }}
                        >
                            <Typography variant="secondary" sx={{color: 'rgba(255, 255, 255, 0.7)'}}>
                                {current_song ? `歌曲名: ${current_song.song_name}` : '歌曲名: ...'}
                            </Typography>

                            <Typography variant="secondary" sx={{color: 'rgba(255, 255, 255, 0.7)'}}>
                                {current_song ? `歌手: ${current_song.singer}` : '歌手: ...'}
                            </Typography>

                            <Typography variant="secondary" sx={{color: 'rgba(255, 255, 255, 0.7)'}}>
                                {current_song ? `专辑: ${current_song.album ? current_song.album : '...'}` : '专辑: ...'}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                {/*中间---歌词部分*/}
                <Grid item xs={6}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      sx={{
                          ml: -3.2,
                      }}
                >
                    <Typography variant="h5" color={'rgba(255, 255, 255, 0.7)'} style={{marginBottom: '3vh'}}>
                        Lyric
                    </Typography>

                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        sx={{
                            width: '65%',
                            gap: 1.5,
                            height: '65vh',
                            overflow: 'auto',             // 启用滚动
                            scrollbarWidth: 'none',       // 对于 Firefox 浏览器隐藏滚动条
                            '&::-webkit-scrollbar': {     // 对于 Webkit 浏览器隐藏滚动条
                                display: 'none',
                            }
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
                        ))}
                    </Box>
                </Grid>

                {/*右侧music list*/}
                <Grid item
                      xs={3}
                      sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          transition: 'all 0.3s ease', // 添加过渡动画
                          marginTop: -7,
                      }}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        sx={{
                            gap: 1,
                            height: '65vh',
                        }}
                    >
                        <Typography variant="h5" color={'rgba(255, 255, 255, 0.7)'}>Musics</Typography>
                        <List
                            sx={{
                                width: '20vw',
                                maxHeight: '65vh',
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
                            {personal_music_list.map((song, index) => (
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
                    </Box>
                </Grid>


                {/*下方---播放栏部分 --- 进度条，音量条，播放，前后切换*/}
                <Box
                    xs={12}
                    sx={{
                        // background: 'rgba(255, 255, 255, 1)', // 背景颜色和透明度
                        ml: 17,
                    }}
                >
                    {/* 传递当前播放的音乐 */}
                    {current_song && current_song.mp3_url ? (
                        <AudioBar current_song_url={current_song.mp3_url} NextSong={handleNextSong}
                                  PreviousSong={handlePreviousSong}/>
                    ) : (
                        <AudioBar current_song_url={null}/>
                    )}
                </Box>

            </Grid>
        </Box>
    )
}

export default MusicPlayer;