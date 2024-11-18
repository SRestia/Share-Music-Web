import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {
    Avatar,
    Box,
    Button, Grid, IconButton, InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import UserContext from "../UserMaintain/GlobalUser";

import SendIcon from '@mui/icons-material/Send';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Cookies from "js-cookie";
import {useDropzone} from "react-dropzone";
import CloseIcon from "@mui/icons-material/Close";
import RoomMusicPlayer from "./RoomMusicPlayer";

const RoomInfo = () => {

    const [user, setUser] = useContext(UserContext);  // user全局变量
    const navigate = useNavigate(); // 使用 useNavigate 钩子
    const [websocket, setWebSocket] = useState(null);

    // 使用 useParams hook获取url参数("/room/:room_id"), 如果有多个参数("/room/:room_id/:room_name")，可以直接 { room_id, room_name } 这样获取
    const {room_id} = useParams();
    const [room_name, setRoomName] = useState('');

    const [image_message_list, set_image_message_list] = useState([]);
    const [image_preview_list, set_image_preview_list] = useState([]);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [list_update, setListUpdate] = useState(false);
    const listRef = useRef(null);  // 用于访问整个列表的 ref


    // 如果 room_id 改变，重新渲染
    useEffect(() => {

        if (room_id !== 'null' && room_id !== 'undefined') {
            setMessages([]); // 清空消息列表
            const handleFetchRoomInfo = () => {
                fetch('/api/get-room-info' + "?room_id=" + room_id)
                    .then((response) => response.json())
                    .then((data) => {
                        console.log('handleFetchRoomInfo', data)
                        setRoomName(data.room_name);
                    })
                    .catch((error) => {
                        console.error('Error: you are not in any room');
                    });
                websocket
            };
            handleFetchRoomInfo(); // 调用

            // 创建 WebSocket 连接
            const ws = new WebSocket('ws://localhost:8000/ws/chat/' + room_id + '/');
            // 监听消息
            // ws.addEventListener("message", (event) => {
            //     const messageData = JSON.parse(event.data);
            //     console.log('ws.addEventListener: ', messageData);
            //
            //     // 对于最新的消息，插入到列表的最后面
            //     if (messageData.event === 'chat_message' || messageData.event === 'chat_image') {
            //         console.log('chat_message: ', messageData);
            //         setMessages((prevMessages) => [...prevMessages, messageData]);
            //     }
            //     // 对于历史消息，插入到列表的最前面
            //     else if (messageData.event === 'chat_history_100') {
            //         console.log('chat_history_100.data: ', messageData.data);
            //         setMessages((prevMessages) => [...messageData.data, ...prevMessages]);
            //     }
            //     // 处理列表更新事件
            //     else if (messageData.event === 'list_update') {
            //         setListUpdate(true);
            //     }
            // });

            // 添加监听器
            const ChatMessageListener = (event) => {
                const messageData = JSON.parse(event.data);
                // console.log('ws.addEventListener in RoomMusicPlayer: ', messageData);

                // 对于最新的消息，插入到列表的最后面
                if (messageData.event === 'chat_message' || messageData.event === 'chat_image') {
                    console.log('chat_message: ', messageData);
                    setMessages((prevMessages) => [...prevMessages, messageData]);
                }
                // 对于历史消息，插入到列表的最前面
                else if (messageData.event === 'chat_history_100') {
                    console.log('chat_history_100.data: ', messageData.data);
                    setMessages((prevMessages) => [...messageData.data, ...prevMessages]);
                }
                // 处理列表更新事件
                else if (messageData.event === 'list_update') {
                    setListUpdate(true);
                }
            };
            ws.addEventListener("message", ChatMessageListener);

            // 设置 WebSocket
            setWebSocket(ws);

            // 清理函数
            return () => {
                // 移除监听器
                ws.removeEventListener("message", ChatMessageListener);
                ws.close();
            };
        }
    }, [room_id]);

    useEffect(() => {
        if (user) {
            user.have_ws = !!websocket;  // !!用于将websocket转换为布尔值，也就是判断是否存在
        }
    }, [user])

    // 当 messages 更新时，滚动到底部
    useEffect(() => {
        const scrollToBottom = () => {
            setTimeout(() => {
                if (listRef.current) {
                    listRef.current.scrollTop = listRef.current.scrollHeight;
                }
            }, 300); // 延迟300毫秒后滚动
        };
        scrollToBottom();
    }, [messages]);


    //前端javascript，JSON.stringify序列化, JSON.parse反序列化
    //后端python，json.dumps序列化，json.loads反序列化
    const handle_send_str = () => {
        console.log('handle_send_str---newMessage:', newMessage);
        if (websocket && newMessage !== '') {
            websocket.send(JSON.stringify({
                event: 'chat_string',
                message: newMessage,
                username: user.username,
                user_avatar: user.avatar
            }));
            setNewMessage('');
        }
    };
    const handle_send_image = () => {
        if (image_message_list === null) {
            console.log('image_message_list is null');
            return;
        }

        console.log('handle_send_image---image_message_list:', image_message_list);

        // 循环上传所有的image
        for (let i = 0; i < image_message_list.length; i++) {
            let j = image_message_list[i]
            let j_url = null;

            const formData = new FormData();
            formData.append('image', j);
            formData.append('room_id', room_id);

            fetch('/api/upload-chat-image/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken'),
                },
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    j_url = data.chat_image_url;
                    console.log('handle_send_image_url:', j_url);

                    if (websocket && j_url) {
                        websocket.send(JSON.stringify({
                            event: 'chat_image',
                            image: j_url,
                            username: user.username,
                            user_avatar: user.avatar
                        }));
                    }
                });
        }

        set_image_message_list([]);
        set_image_preview_list([]);
    }
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && newMessage) { // 检测回车键并且输入框不为空
            event.preventDefault(); // 阻止默认行为（表单提交等）
            handle_send_image();
            handle_send_str();
            setNewMessage(''); // 清空输入框
        }
    };

    // 处理images
    const handle_images = useCallback((files) => {
        const acceptedFiles = Array.from(files);
        console.log('handle_images:', acceptedFiles);

        // 直接使用接收到的文件数组更新状态
        set_image_message_list((prevList) => [...prevList, ...acceptedFiles]);

        // 填充预览图片
        const preview_list = acceptedFiles.map((file) => {
            return URL.createObjectURL(file);
        });
        set_image_preview_list((prevList) => [...prevList, ...preview_list]);
    }, []);
    const onDrop = useCallback((acceptedFiles) => {
        handle_images(acceptedFiles);
    }, []);
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: 'image/*',
        noClick: true, // 禁止点击自动打开文件选择器
    });


    // 更新图片列表移除选中项,更新预览列表移除选中项
    const removeImage = (index) => {
        const newImageList = [...image_message_list];
        newImageList.splice(index, 1);
        set_image_message_list(newImageList);

        const newPreviewList = [...image_preview_list];
        newPreviewList.splice(index, 1);
        set_image_preview_list(newPreviewList);
    };


    if (room_id === 'null' || room_id === 'undefined') {
        return (
            <Box
                display="flex" flexDirection="column" alignItems="center"
                sx={{
                    my: 30
                }}
            >
                <Typography variant="h4" color='inherit'>Your currently not in any room~</Typography>
                <Typography variant="h5" color='inherit'>Try to create one! Or you can join one...</Typography>
            </Box>
        );
    }

    return (
        <Grid container>
            <Grid item xs={9.6}>
                <Box
                    display="flex" flexDirection="column" alignItems="center"
                    sx={{gap: 1}}
                >
                    <Typography variant="h5" color={'rgba(255, 255, 255, 0.8)'}>{room_name}</Typography>

                    {/* 消息列表 */}
                    <List
                        sx={{
                            ml: 5,
                            width: '96.6%',
                            minHeight: '75vh',  // 设置最小高度
                            maxHeight: '75vh',      // 设置固定高度
                            overflowY: 'auto', // 超出时垂直滚动
                            '&::-webkit-scrollbar': {
                                width: '6px', // 设置滚动条的宽度为 6px，减小它的宽度
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)', // 设置滚动条的颜色为半透明
                                borderRadius: '3px', // 使滚动条圆润
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)', // 设置滚动条背景
                            },
                        }}
                        ref={listRef}
                    >
                        {messages && messages.map((message, index) => (
                            <ListItem
                                key={index}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',  // 鼠标悬停时背景变暗
                                    },
                                    marginBottom: 1,
                                    alignItems: 'flex-start', // 确保所有子项从顶部开始对齐
                                }}
                            >
                                {/* 左侧用户头像 */}
                                <ListItemAvatar>
                                    <Avatar
                                        src={message.user_avatar}
                                        alt={message.username}
                                        sx={{width: '3vw', height: '3vw'}}
                                    />
                                </ListItemAvatar>

                                {/*中间显示用户名和消息内容*/}
                                <Box display="flex" flexDirection="column" width="100%"
                                     sx={{ml: 1.5, alignItems: 'flex-start',}}>
                                    {/* 上方用户名 */}
                                    <Typography variant="body1" color={'rgba(255, 255, 255, 0.5)'}>
                                        {message.username}
                                    </Typography>

                                    {/* 下方消息 */}
                                    {message.event === 'chat_image' ? (
                                        <img
                                            src={message.image}
                                            alt="Chat Image"
                                            style={{
                                                maxWidth: '20vw',
                                                maxHeight: '20vh',
                                                width: 'auto',
                                                height: 'auto',
                                                marginTop: 1,
                                                objectFit: 'contain',  // 确保图片不会被拉伸或压缩
                                                borderRadius: '10px',
                                            }}
                                        />
                                    ) : (
                                        <Paper elevation={1} sx={{
                                            marginTop: 1,
                                            backgroundColor: 'rgba(97,97,97,0.5)',
                                            padding: '8px 12px',
                                            borderRadius: '10px',
                                            width: 'fit-content', // 根据内容自适应宽度
                                            maxWidth: '40%', // 最大宽度限制，超过后换行
                                            wordWrap: 'break-word', // 文字换行
                                            overflowWrap: 'anywhere' // 强制长单词或URL换行
                                        }}>
                                            <Typography variant="body2" color={'rgba(255, 255, 255, 0.7)'}>
                                                {message.message}
                                            </Typography>
                                        </Paper>
                                    )}
                                </Box>

                                {/*右侧显示时间*/}
                                <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{color: 'rgba(255, 255, 255, 0.5)'}}
                                >
                                    {message.current_time}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>

                    {/*下方输入框，支持拖拽上传图片*/}
                    <Box
                        {...getRootProps()}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            my: 1,
                        }}
                    >
                        <input {...getInputProps()} />
                        <TextField
                            fullWidth
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isDragActive ? "Drop image here..." : "Type message or drop image~"}
                            onKeyDown={handleKeyDown}
                            InputProps={{
                                style: {color: 'rgba(255, 255, 255, 0.8)'},
                                startAdornment: (
                                    <InputAdornment position="start">

                                        <IconButton component="label">
                                            <AddCircleIcon sx={{color: 'rgba(255, 255, 255, 0.9)',}}/>
                                            <input
                                                type="file"
                                                hidden
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files.length > 0) {
                                                        handle_images(e.target.files);
                                                    }
                                                }}
                                            />
                                        </IconButton>

                                        {image_preview_list && image_preview_list.map((src, index) => (
                                            <Box key={index}
                                                 sx={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                                                <img src={src} alt={`Preview ${index}`}
                                                     style={{width: '2vw', height: '2vw'}}/>
                                                <IconButton
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <CloseIcon fontSize="small"
                                                               sx={{color: 'rgba(255, 255, 255, 0.9)',}}/>
                                                </IconButton>
                                            </Box>
                                        ))}

                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => {
                                            handle_send_image();
                                            handle_send_str();
                                        }}>
                                            <SendIcon sx={{color: 'rgba(255, 255, 255, 0.9)',}}/>
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& label.Mui-focused': {
                                    color: 'rgba(255, 255, 255, 0.9)',
                                },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '25px',
                                    height: '5vh',
                                    width: '40vw',
                                    backgroundColor: isDragActive ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0)',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.9)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.9)',
                                    },
                                },
                            }}
                        />

                        {/*<Button onClick={() => {*/}
                        {/*    // console.log('image_message_list:', image_message_list);*/}
                        {/*    // console.log('image_preview_list:', image_preview_list);*/}
                        {/*    console.log('room_info click, have_ws:', user.have_ws);*/}
                        {/*}}>*/}
                        {/*    check have_ws*/}
                        {/*</Button>*/}
                    </Box>
                </Box>
            </Grid>

            <Grid item xs={2.4}
                  sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      borderLeft: 1,
                      borderColor: 'rgba(255,255,255,0.3)', // 使用主题中的分隔线颜色
                  }}

            >
                {/*右侧房间音乐播放栏*/}
                <RoomMusicPlayer websocket={websocket} list_update={list_update} setListUpdate={setListUpdate}/>

            </Grid>
        </Grid>
    );
}

export default RoomInfo;