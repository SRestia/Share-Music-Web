import React, {useRef, useState, useEffect} from 'react';
import {Box, Button, Slider, Typography} from '@mui/material';
import {PlayArrow, Pause} from '@mui/icons-material';
import room_music_operation_ws_tool from "./room_music_operation_ws_tool";

import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';

const RoomAudioBar = ({websocket, current_song_url, NextSong, PreviousSong}) => {
    const audioRef = useRef(null); // 引用audio元素
    const [isPlaying, setIsPlaying] = useState(false); // 播放状态
    const [currentTime, setCurrentTime] = useState(0); // 当前播放时间
    const [duration, setDuration] = useState(0); // 音乐总时长
    const [volume, setVolume] = useState(50); // 音量

    // 状态，用于控制播放模式，'list_repeat', 'repeat_one'
    const [playMode, setPlayMode] = useState('list_repeat');

    // 通过websocket监听房间音乐操作(额外的监听器)，包括暂停/播放，播放模式切换，调整播放进度。
    useEffect(() => {
        if (websocket) {
            const ControlMusicListener = (event) => {
                const messageData = JSON.parse(event.data);
                // console.log('ws.addEventListener in RoomMusicPlayer: ', messageData);

                if (messageData.event === 'room_music_operation') {
                    if (messageData.operation === 'togglePlayPause') {
                        console.log('RoomMusicListener --- togglePlayPause: ', messageData.music_data);
                        togglePlayPause(messageData.music_data);
                    }
                    else if (messageData.operation === 'togglePlayMode') {
                        console.log('RoomMusicListener --- togglePlayMode: ', messageData.music_data);
                        togglePlayMode(messageData.music_data);
                    }
                    else if (messageData.operation === 'handleProgressCommit') {
                        console.log('RoomMusicListener --- handleProgressCommit: ', messageData.music_data);
                        handleProgressCommit(messageData.music_data);
                    }
                }
            };
            websocket.addEventListener("message", ControlMusicListener);

            return () => {
                websocket.removeEventListener("message", ControlMusicListener);
            };
        }
    }, [websocket]);

    // 依赖项列表中添加current_song_url保证更新后重新绑定事件，同时也需要监听playMode来卸载和装载新的mode信息。
    useEffect(() => {
        const audio = audioRef.current;
        const setAudioDuration = () => {   // 当音频加载时设置音频总时长
            if (audio) {
                setDuration(audio.duration);
            }
        };
        const handleAudioEnd = () => {
            if (playMode === 'repeat_one') {  // 单曲循环
                console.log('repeat_one')
                audio.currentTime = 0;
                audio.play();
            } else if (playMode === 'list_repeat') {  // 列表循环
                console.log('list_repeat')
                NextSong();
            }
        };

        if (audio) {
            audio.addEventListener('loadedmetadata', () => {   // 监听音频加载事件, 设置音频总时长, 并播放音频, 设置播放状态为true
                setAudioDuration();
                audio.play();
                setIsPlaying(true);
            });
            audio.addEventListener('ended', handleAudioEnd);   // 监听音频结束事件
        }

        // 清理函数：组件卸载时移除事件监听, 避免内存泄漏
        return () => {
            if (audio) {
                audio.removeEventListener('loadedmetadata', setAudioDuration);
                audio.removeEventListener('ended', handleAudioEnd);
            }
        };
    }, [current_song_url, playMode]);


    // 更新当前播放时间
    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    // 播放/暂停音频
    const togglePlayPause = (play) => {
        play ? audioRef.current.play() : audioRef.current.pause();
        setIsPlaying(play);
    };

    // 当用户完成拖动或点击操作后，更新音频播放位置
    const handleProgressCommit = (newValue) => {
        audioRef.current.currentTime = newValue;
    };

    // 控制音量条
    const handleVolumeChange = (event, newValue) => {
        setVolume(newValue);
        audioRef.current.volume = newValue / 100;
    };

    // 计算当前播放时间
    const handleCalcCurrentTime = () => {
        return Math.floor(currentTime / 60) + ':' + ('0' + Math.floor(currentTime % 60)).slice(-2);
    }
    // 计算音频总时长
    const handleCalcDuration = () => {
        return Math.floor(duration / 60) + ':' + ('0' + Math.floor(duration % 60)).slice(-2);
    }

    // 切换播放模式
    const togglePlayMode = (mode) => {
        setPlayMode(mode);
    };
    const renderPlayModeIcon = () => {   // 渲染播放模式按钮
        return playMode === 'list_repeat'
            ? <RepeatIcon sx={{fontSize: 'middle', color: 'rgba(255, 255, 255, 0.7)'}}/>
            : <RepeatOneIcon sx={{fontSize: 'middle', color: 'rgba(255, 255, 255, 0.7)'}}/>
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            sx={{
                width: '95%',
                gap: 1.5,
                ml: 1,
                // backgroundColor: 'rgba(0, 0, 0, 0.7)',
            }}
        >
            {current_song_url &&
                <audio
                    ref={audioRef}
                    src={current_song_url} // 替换为你的音频文件路径
                    onTimeUpdate={handleTimeUpdate}
                />
            }

            {/* 进度条 --- 当前时间 --- 总时长 */}
            <Slider
                size="small"
                aria-label="Small"

                value={currentTime}
                max={duration}

                // 实时更新播放时间的显示
                onChange={(event, new_value) => {setCurrentTime(new_value);}}
                // 用户完成操作后触发
                onChangeCommitted={(event, new_value) => {room_music_operation_ws_tool(websocket, 'handleProgressCommit', new_value)}}

                sx={{color: 'rgba(255, 255, 255, 0.7)', width: '110%'}}
            />
            <Box
                display="flex"
                justifyContent="space-between"
            >
                <Typography variant="body1" color={'rgba(255, 255, 255, 0.7)'}>
                    {handleCalcCurrentTime()}
                </Typography>

                <Typography variant="body1" color={'rgba(255, 255, 255, 0.7)'} sx={{marginLeft: 20,}}>
                    {handleCalcDuration()}
                </Typography>
            </Box>


            {/* 上一首按钮 --- 播放/暂停按钮 --- 下一首按钮 */}
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{marginTop: 1,}}>
                <Button onClick={PreviousSong} sx={{color: 'rgba(255, 255, 255, 0.7)'}}>
                    <SkipPreviousIcon sx={{fontSize: '1.8vw'}}/>
                </Button>

                <Button
                    onClick={() => {
                        room_music_operation_ws_tool(websocket, 'togglePlayPause', !isPlaying);
                    }}
                    sx={{color: 'rgba(255, 255, 255, 0.7)', borderRadius: 20}}
                >
                    {isPlaying ? <Pause sx={{fontSize: '2.5vw'}}/> : <PlayArrow sx={{fontSize: '2.5vw'}}/>}
                </Button>

                <Button onClick={NextSong} sx={{color: 'rgba(255, 255, 255, 0.7)',}}>
                    <SkipNextIcon sx={{fontSize: '1.8vw'}}/>
                </Button>
            </Box>


            {/*播放模式按钮*/}
            <Box display="flex" alignItems="center" sx={{marginTop: 10,}}>
                <Button
                    onClick={() => {
                        room_music_operation_ws_tool(websocket, 'togglePlayMode', playMode === 'list_repeat' ? 'repeat_one' : 'list_repeat');
                    }}
                    sx={{color: 'rgba(255, 255, 255, 0.7)'}}
                >
                    {renderPlayModeIcon()}
                </Button>

                {/* 音量调节条 */}
                <Box display="flex" alignItems="center" sx={{width: '50%', marginLeft: 5,}}>
                    <VolumeUpIcon sx={{color: 'rgba(255, 255, 255, 0.7)'}}/>
                    <Slider
                        size="small"
                        aria-label="Small"
                        valueLabelDisplay="auto"

                        value={volume}
                        onChange={handleVolumeChange}
                        sx={{color: 'rgba(255, 255, 255, 0.7)', width: 100, ml: 0.5}}
                    />
                </Box>
            </Box>

        </Box>
    );
};

export default RoomAudioBar;

