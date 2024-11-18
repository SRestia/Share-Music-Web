import React, {useCallback, useContext, useEffect, useState} from 'react';

import {useNavigate} from 'react-router-dom';

import Cookies from 'js-cookie';  // 引入js-cookie 用于获取csrftoken

import {
    Button,
    Grid,
    Typography,
    TextField,
    FormHelperText,
    FormControl,
    Radio,
    RadioGroup,
    FormControlLabel, Box, Chip, Stack, ListItem, ListItemText
} from '@mui/material';
import {useDropzone} from "react-dropzone";

const CreateRoomPage = () => {
    const navigate = useNavigate(); // 使用 useNavigate 钩子

    const [room_avatar, set_room_avatar] = useState(null);
    const [room_avatar_preview, set_room_avatar_preview] = useState(null);
    const [room_avatar_hint, set_room_avatar_hint] = useState('点击选取/拖拽图片,不能为空');

    const [votes, setVotes] = useState(2);
    const [guestCanPause, setGuestCanPause] = useState(true);
    const [room_name, setRoomName] = useState('');
    const [room_name_error, setRoomNameError] = useState('');
    const [description, setDescription] = useState('A short description~');

    const [labels, setLabels] = useState(['Music']); // 存储所有的标签
    const [label_input, set_label_input] = useState(''); // 当前输入框的值
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && label_input) { // 检测回车键并且输入框不为空
            event.preventDefault(); // 阻止默认行为（表单提交等）
            setLabels([...labels, label_input]); // 添加新的标签到列表中
            set_label_input(''); // 清空输入框
        }
    };
    const handleDelete = (labelToDelete) => () => {
        setLabels(labels.filter(label => label !== labelToDelete)); // 删除标签
    };


    // useDropzone在合适的时候调用onDrop处理拖拽上传的image
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            set_room_avatar(acceptedFiles[0])
        }
    }, []);
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop, accept: 'image/*',
    });
    useEffect(() => {   // 当头像文件改变时，更新头像预览
        if (room_avatar instanceof File) {
            const preview_url = URL.createObjectURL(room_avatar);
            set_room_avatar_preview(preview_url);
            // Cleanup function to revoke the URL when it's no longer needed
            return () => URL.revokeObjectURL(preview_url);
        }
    }, [room_avatar]);


    // 点击创建房间按钮
    const handleCreateClick = () => {
        /*
            定义request_datas，也就是发送给后端的数据，
            然后使用fetch把request_datas发给后端，发送的地址是'/api/create-room'，
            然后请求后端返回response数据，并转换为json格式，
            然后把data打印出来。

            切记请求后端的地址可以没有"/"开头，但是一定要以"/"结尾
         */
        if (room_name === '') {
            setRoomNameError('Room name can not be empty')
            return;
        }
        if (room_avatar === null) {
            set_room_avatar_hint('图片不能为空~~~~~')
            return;
        }

        const formData = new FormData();
        formData.append('room_avatar', room_avatar);
        formData.append('room_labels', JSON.stringify(labels));
        formData.append('votes_to_skip', votes);
        formData.append('guest_can_pause', guestCanPause);
        formData.append('room_name', room_name);
        formData.append('description', description);

        const request_datas = {
            method: 'POST',
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
            body: formData
        };
        fetch('api/create-room/', request_datas)
            .then((response) => response.json())
            .then((data) => navigate("/room-info/" + data.room_id)); // 使用 navigate 进行跳转
    };

    return (
        <Box
            display="flex" flexDirection="column" alignItems="center"
            sx={{
                gap: 1, my: -30,
            }}
        >
            <Typography variant="h5" color={'rgba(255,255,255,0.8)'}>Create Room</Typography>

            <Grid container
                  sx={{
                      width: '40vw',
                      height: '50vh',
                  }}
            >
                {/*左侧*/}
                <Grid item xs={6}>
                    <Box
                        display="flex" flexDirection="column" alignItems="left"
                        sx={{
                            my: 3,
                            ml: 12,
                        }}
                    >
                        {/*设置房间头像*/}
                        <Box
                            {...getRootProps()}
                            sx={{
                                width: '6vw',
                                height: '6vw',
                                // border: '1px dashed #ccc',    // 边框, 未确定是否需要
                                borderRadius: '48%',
                                padding: '20px',
                                textAlign: 'center',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                marginTop: 2,

                                backgroundImage: room_avatar_preview ? `url(${room_avatar_preview})` : null,
                                backgroundColor: isDragActive ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0)',
                                backgroundBlendMode: 'overlay', // 背景颜色和图片叠加
                            }}>
                            <input {...getInputProps()} />
                            {isDragActive
                                ? (
                                    <Typography variant="h6" color="textSecondary" sx={{my: 4.5}}>
                                        Drop
                                    </Typography>
                                )
                                : !room_avatar && (
                                <Typography variant="h4" color='rgba(255,255,255,0.8)' sx={{my: 4.5}}>
                                    +
                                </Typography>
                            )}
                        </Box>
                        <Typography color={'rgba(255,255,255,0.5)'} sx={{marginTop: 3}}>
                            {room_avatar_hint}
                        </Typography>

                        {/*房间名称*/}
                        <Typography color={'rgba(255,255,255,0.8)'} sx={{marginTop: 5, ml: 1,}}>Room Name</Typography>
                        <TextField
                            error={Boolean(room_name_error)}
                            helperText={room_name_error}
                            value={room_name}
                            onChange={(e) => {
                                setRoomName(e.target.value)
                                setRoomNameError('')
                            }}
                            InputLabelProps={{
                                style: {color: 'rgba(255, 255, 255, 0.5)'}
                            }}
                            inputProps={{
                                style: {color: 'rgba(255, 255, 255, 0.8)'}
                            }}
                            sx={{
                                width: '70%',
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

                        {/*添加房间标签*/}
                        <Typography color={'rgba(255,255,255,0.8)'} sx={{marginTop: 4, ml: 1}}>Room Label (Max
                            3)</Typography>
                        {labels.length < 3 && (
                            <TextField
                                variant="outlined"
                                value={label_input}
                                onChange={(e) => set_label_input(e.target.value)}
                                onKeyDown={handleKeyDown}
                                InputLabelProps={{
                                    style: {color: 'rgba(255, 255, 255, 0.5)'}
                                }}
                                inputProps={{
                                    style: {color: 'rgba(255, 255, 255, 0.8)'}
                                }}
                                sx={{
                                    width: '70%',
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
                        )}
                        <Stack direction="row" spacing={1} sx={{marginTop: 2}}>
                            {labels.map((label, index) => (
                                <Chip
                                    key={index}
                                    label={label}
                                    color={'primary'}
                                    onDelete={handleDelete(label)}
                                    sx={{backgroundColor: 'rgba(97, 97, 97, 0.5)', color: 'rgba(255, 255, 255, 0.7)'}}
                                />
                            ))}
                        </Stack>
                    </Box>
                </Grid>

                {/*右侧*/}
                <Grid item xs={6}>
                    <Box
                        display="flex" flexDirection="column" alignItems="left"
                        sx={{
                            my: 8,
                            ml: 10,
                        }}
                    >
                        {/*成员是否可以对歌曲的播放状态进行控制*/}
                        <Typography color={'rgba(255,255,255,0.8)'}>
                            Guest Control of Playback State
                        </Typography>
                        <RadioGroup row defaultValue="true">
                            <FormControlLabel
                                value="true"
                                control={
                                    <Radio
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.5)',  // 默认未选中颜色
                                            '&.Mui-checked': {
                                                color: 'rgba(255, 255, 255, 0.8)',  // 选中颜色
                                            }
                                        }}
                                    />
                                }
                                label="Play/Pause"
                                labelPlacement="bottom"
                                onChange={() => setGuestCanPause(true)}
                                sx={{color: 'rgba(255, 255, 255, 0.5)'}}  // 设置标签颜色
                            />
                            <FormControlLabel
                                value="false"
                                control={
                                    <Radio
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.5)',  // 默认未选中颜色
                                            '&.Mui-checked': {
                                                color: 'rgba(255, 255, 255, 0.8)',  // 选中颜色
                                            }
                                        }}
                                    />
                                }
                                label="No Control"
                                labelPlacement="bottom"
                                onChange={() => setGuestCanPause(false)}
                                sx={{color: 'rgba(255, 255, 255, 0.5)'}}  // 设置标签颜色
                            />
                        </RadioGroup>


                        {/*多少成员投票可以跳过歌曲*/}
                        <Typography color={'rgba(255,255,255,0.8)'} sx={{marginTop: 5, ml: 1}}>
                            Votes Required to Skip Song
                        </Typography>
                        <TextField
                            type="number"
                            value={votes}
                            onChange={(e) => setVotes(e.target.value)}
                            InputLabelProps={{
                                style: {color: 'rgba(255, 255, 255, 0.5)'}
                            }}
                            inputProps={{
                                min: 1,
                                style: {textAlign: "center", color: 'rgba(255, 255, 255, 0.8)'}
                            }}
                            sx={{
                                width: '70%',
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

                        {/*房间的介绍*/}
                        <Typography color={'rgba(255,255,255,0.8)'} sx={{marginTop: 4, ml: 1}}>
                            Room Description
                        </Typography>
                        <TextField
                            multiline
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            InputLabelProps={{
                                style: {color: 'rgba(255, 255, 255, 0.5)'}
                            }}
                            inputProps={{
                                style: {color: 'rgba(255, 255, 255, 0.8)'}
                            }}
                            sx={{
                                width: '70%',
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
                    </Box>
                </Grid>
            </Grid>

            <Button color="inherit" variant="contained" onClick={handleCreateClick} sx={{marginTop: 15}}>
                Create
            </Button>
            <FormHelperText sx={{color: 'rgba(255, 255, 255, 0.5)'}}>
                No worry, you are free to change these later!
            </FormHelperText>

        </Box>
    );
};

export default CreateRoomPage;
