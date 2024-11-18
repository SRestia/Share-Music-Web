import React, {useRef, useState, useEffect} from 'react';
import {Box, Button, Slider, Typography} from '@mui/material';
import {PlayArrow, Pause} from '@mui/icons-material';

import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';

const AudioBar = ({current_song_url, NextSong, PreviousSong}) => {
    const audioRef = useRef(null); // 引用audio元素
    const [isPlaying, setIsPlaying] = useState(false); // 播放状态
    const [currentTime, setCurrentTime] = useState(0); // 当前播放时间
    const [duration, setDuration] = useState(0); // 音乐总时长
    const [volume, setVolume] = useState(50); // 音量

    // 状态，用于控制播放模式，'list_repeat', 'repeat_one'
    const [playMode, setPlayMode] = useState('list_repeat');

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
    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
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
    const togglePlayMode = () => {
        playMode === 'list_repeat' ? setPlayMode('repeat_one') : setPlayMode('list_repeat');
    };
    const renderPlayModeIcon = () => {   // 渲染播放模式按钮
        return playMode === 'list_repeat'
            ? <RepeatIcon sx={{fontSize: 'middle', color: 'rgba(255, 255, 255, 0.7)'}}/>
            : <RepeatOneIcon sx={{fontSize: 'middle', color: 'rgba(255, 255, 255, 0.7)'}}/>
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
                width: '65vw',
                my: 10,
                ml: 12,
            }}
        >
            {current_song_url &&
                <audio
                    ref={audioRef}
                    src={current_song_url} // 替换为你的音频文件路径
                    onTimeUpdate={handleTimeUpdate}
                />
            }

            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{width: '10vw'}}>
                {/* 上一首按钮 */}
                <Button onClick={PreviousSong} sx={{color: 'rgba(255, 255, 255, 0.7)', size: '2vw'}}>
                    <SkipPreviousIcon sx={{fontSize: '2vw'}}/>
                </Button>
                {/* 播放/暂停按钮 */}
                <Button onClick={togglePlayPause}
                        sx={{color: 'rgba(255, 255, 255, 0.7)', borderRadius: 20, size: '2.5vw'}}>
                    {isPlaying ? <Pause sx={{fontSize: '2.5vw'}}/> : <PlayArrow sx={{fontSize: '2.5vw'}}/>}
                </Button>
                {/* 下一首按钮 */}
                <Button onClick={NextSong} sx={{color: 'rgba(255, 255, 255, 0.7)', size: '2vw'}}>
                    <SkipNextIcon sx={{fontSize: '2vw'}}/>
                </Button>
            </Box>

            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{width: '50vw'}}
                 style={{marginLeft: '2.5vw'}}>
                {/* 当前时间 */}
                <Typography variant="body1" color={'rgba(255, 255, 255, 0.7)'}>
                    {handleCalcCurrentTime()}
                </Typography>
                {/* 进度条 */}
                <Slider
                    size="small"
                    aria-label="Small"

                    value={currentTime}
                    max={duration}

                    onChange={(event, new_value) => setCurrentTime(new_value)}
                    onChangeCommitted={(event, new_value) => {
                        audioRef.current.currentTime = new_value;
                    }}

                    sx={{width: '86%', color: 'rgba(255, 255, 255, 0.7)'}}
                />
                {/* 总时长 */}
                <Typography variant="body1" color={'rgba(255, 255, 255, 0.7)'}>
                    {handleCalcDuration()}
                </Typography>
            </Box>

            {/*播放模式按钮*/}
            <Box display="flex" alignItems="center" sx={{width: '4vw', marginLeft: '1.5vw',}}>
                <Button onClick={togglePlayMode} sx={{color: 'rgba(255, 255, 255, 0.7)'}}>
                    {renderPlayModeIcon()}
                </Button>
            </Box>

            {/* 音量调节条 */}
            <Box display="flex" alignItems="center" sx={{width: '10vw'}}>
                <VolumeUpIcon sx={{color: 'rgba(255, 255, 255, 0.7)'}}/>
                <Slider
                    size="small"
                    aria-label="Small"
                    valueLabelDisplay="auto"

                    value={volume}
                    onChange={handleVolumeChange}
                    sx={{width: 100, ml: 0.5, color: 'rgba(255, 255, 255, 0.7)'}}
                />
            </Box>
        </Box>
    );
};

export default AudioBar;
