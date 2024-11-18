import React, {useCallback, useContext, useState} from 'react';
import {Autocomplete, createFilterOptions, IconButton, ListItem, ListItemText, TextField} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Cookies from 'js-cookie';

import AddIcon from '@mui/icons-material/Add';
import {useNavigate} from "react-router-dom"; // 使用加号图标

import {debounce} from 'lodash';

import UserContext from "../UserMaintain/GlobalUser";

const SearchResult = (song_name, song_mid, song_id, singer, album, album_mid) => {
    return {
        song_name, song_mid, song_id, singer, album, album_mid,
        // 定义toString方法，返回格式化的字符串

        toString() {
            return `${this.song_name} --- ${this.singer} --- ${this.album}`;
        }
    };
};

const SearchBox = () => {
    const [input, setInput] = useState('');
    const [options, setOptions] = useState([]);

    const [marginY, setMarginY] = useState(0); // 初始化 margin Y 为 0

    const [user, setUser] = useContext(UserContext);  // user全局变量
    const navigate = useNavigate(); // 使用 useNavigate 钩子

    // 根据输入的值搜索音乐数据
    const search_data = (value) => {
        const requestData = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
            body: JSON.stringify({search_text: value}),
        };
        fetch("/api/search-music/", requestData)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setOptions(data?.map(item => SearchResult(item.song_name, item.song_mid, item.song_id, item.singer, item.album, item.album_mid)));
            })
    };

    // 从搜索结果中点击+添加到'个人'音乐列表
    const handleAddPersonalMusic = (option) => {
        const request_datas = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
            body: JSON.stringify(option),
        };
        fetch("/api/personal-add-music/", request_datas)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                navigate('/personal-music-player');
            })
    }

    // 从搜索结果中点击+添加到对应'房间'音乐列表，这里注意，/api/room-add-music/后端views.py帮我们群发了’更新音乐列表‘的消息，更新了list_update为true
    const handleAddRoomMusic = (option) => {
        // console.log("handleAddRoomMusic, user.have_ws", user.have_ws)
        const request_datas = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
            body: JSON.stringify(option),
        };
        fetch("/api/room-add-music/", request_datas)
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
    }

    // 使用 lodash 的 debounce 函数，实现输入框输入时的延迟搜索，减少请求次数
    const handleSearchChange = useCallback(debounce((event, value) => {
        console.log("SearchChange: ", value);
        if (value.length > 0) {
            setInput(value);
            search_data(value);
        }
    }, 500), []); // 500ms 的延迟

    // 当输入框获得焦点时，设置 margin Y 为 3
    const handleFocus = () => {
        setMarginY(2);
    };

    // 当输入框失去焦点时, 重置 margin Y 为 0, 清空输入框, 清空选项
    const handleBlur = () => {
        setMarginY(0);
        setInput('');
        setOptions([]);
    };

    return (
        <Autocomplete
            sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                my: marginY, // 使用状态变量 marginY
                minHeight: '5vh',
                transform: 'translateZ(0)',
                transition: 'margin 300ms ease', // 添加过渡效果
            }}
            freeSolo
            autoHighlight

            value={input} // 设置输入框的值

            filterOptions={(option) => option} // 输出所有选项，不进行过滤
            options={options} // 设置选项
            renderOption={(props, option) => (      // 渲染每个选项
                <ListItem {...props} key={option.song_mid ? option.song_mid : Math.floor(Math.random() * (999999) + 1)}>
                    <ListItemText primary={option.toString()}/>
                    <IconButton
                        onClick={(event) => {
                            event.stopPropagation(); // 防止点击按钮时触发选项的选择事件
                            // 当用户有ws房间时，调用handleAddRoomMusic，否则调用handleAddPersonalMusic
                            user.have_ws === true ? handleAddRoomMusic(option) : handleAddPersonalMusic(option);
                        }}
                        edge="end" // 位置调整至末尾
                    >
                        <AddIcon/>
                    </IconButton>
                </ListItem>
            )}
            getOptionLabel={(i) => i.toString() || ""}  // 设置点击选项后，搜索栏中的显示文本

            onInputChange={handleSearchChange}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label="Type to search music..."

                    onFocus={handleFocus} // 添加 onFocus 事件处理函数
                    onBlur={handleBlur} // 添加 onBlur 事件处理函数

                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {params.InputProps.endAdornment}
                                <IconButton>
                                    <SearchIcon/>
                                </IconButton>
                            </>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                border: 'none' // 去除边框
                            },
                            '&:hover fieldset': {
                                border: 'none' // 去除悬停时的边框变化
                            },
                            '&.Mui-focused fieldset': {
                                border: 'none' // 去除聚焦时的边框变化
                            }
                        }
                    }}
                />
            )}
        />
    );
}

export default SearchBox;

