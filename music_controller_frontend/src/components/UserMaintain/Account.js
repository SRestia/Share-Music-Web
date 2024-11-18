
import UserContext from "./GlobalUser";

import React, {useState, useContext, useCallback, useEffect} from "react";
import {Box, Button, Grid, IconButton, List, ListItem, ListItemText, TextField, Typography} from "@mui/material";
import {useDropzone} from "react-dropzone";
import Cookies from "js-cookie";

const Account = () => {

    const [user, setUser] = useContext(UserContext);  // user全局变量

    const [avatar, setAvatar] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [description, setDescription] = useState('');
    useEffect(() => {
        if (user) {
            setAvatar(user.avatar);
            setUsername(user.username);
            setEmail(user.email);
            setPassword(user.password);
            setDescription(user.description);
        }
    }, [user]);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const formData = new FormData();
            formData.append('avatar', acceptedFiles[0]);

            const request_datas = {
                method: 'POST', headers: {
                    'X-CSRFToken': Cookies.get('csrftoken'),
                }, body: formData,
            };
            fetch("/api/update-user-avatar/", request_datas)
                .then((response) => response.json())
                .then((data) => {
                    setUser(data); // 更新用户信息
                });
        }
    }, []);
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop, accept: 'image/*',
    });

    const Handle_Save = () => {
        const request_datas = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                description: description,
            }),
        }
        fetch("/api/update-user-info/", request_datas)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setUser(data); // 更新用户信息
            });
    };

    if (user === null) {
        return (<Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            sx={{
                gap: 1, my: -30,
            }}
        >
            <Typography variant="h5" color="rgba(255, 255, 255, 0.85)">User Detail</Typography>
            <Typography variant="h6" color="rgba(255, 255, 255, 0.7)">loading...</Typography>
        </Box>);
    }

    return (
        <Box
            display="flex" flexDirection="column" alignItems="center"
            sx={{
                gap: 1, my: -30,
            }}
        >
            <Grid container
                  sx={{
                      width: '40vw',
                  }}
            >
                <Grid item xs={6}>
                    <List>
                        <ListItem key={'avatar'} secondary={'更换头像、点击选取/拖拽图片'}>
                            <Box
                                {...getRootProps()}
                                sx={{
                                    width: '6vw',
                                    height: '6vw',
                                    borderRadius: '48%',
                                    padding: '20px',
                                    textAlign: 'center',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    marginTop: 2,

                                    backgroundImage: avatar ? `url(${avatar})` : null,
                                    backgroundColor: isDragActive ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0)',
                                    backgroundBlendMode: 'overlay',
                                }}>
                                <input {...getInputProps()} />
                                {isDragActive
                                    ? (
                                        <Typography variant="h6" color="rgba(255, 255, 255, 0.7)" sx={{my: 4.5}}>
                                            Drop
                                        </Typography>
                                    )
                                    : !avatar && (
                                    <Typography variant="h4" color="rgba(255, 255, 255, 0.7)" sx={{my: 4.5}}>
                                        +
                                    </Typography>
                                )}
                            </Box>
                        </ListItem>

                        <ListItem key={'hint'}>
                            <ListItemText primary={''} secondary={'更换头像、点击选取/拖拽图片'}
                                          primaryTypographyProps={{color: 'rgba(255, 255, 255, 0.8)'}}
                                          secondaryTypographyProps={{color: 'rgba(255, 255, 255, 0.5)'}}/>
                        </ListItem>

                        <ListItem key={'Id'}>
                            <ListItemText primary={'Uid'} secondary={user.id}
                                          primaryTypographyProps={{color: 'rgba(255, 255, 255, 0.8)'}}
                                          secondaryTypographyProps={{color: 'rgba(255, 255, 255, 0.5)'}}/>
                        </ListItem>

                        <ListItem key={'Created_at'}>
                            <ListItemText primary={'Created_at'} secondary={user.created_at}
                                          primaryTypographyProps={{color: 'rgba(255, 255, 255, 0.8)'}}
                                          secondaryTypographyProps={{color: 'rgba(255, 255, 255, 0.5)'}}/>
                        </ListItem>

                        <ListItem key={'Updated_at'}>
                            <ListItemText primary={'Updated_at'} secondary={user.updated_at}
                                          primaryTypographyProps={{color: 'rgba(255, 255, 255, 0.8)'}}
                                          secondaryTypographyProps={{color: 'rgba(255, 255, 255, 0.5)'}}/>
                        </ListItem>
                    </List>

                </Grid>

                <Grid item xs={6}>
                    <Box
                        display="flex"
                        flexDirection="column"
                        sx={{
                            gap: 3,
                            my: 6,
                        }}
                    >
                        <Typography variant="h5" color="rgba(255, 255, 255, 0.8)">User Detail</Typography>
                        <TextField
                            label={'username'}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                        <TextField
                            label={'email'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        <TextField
                            label={'password'}
                            value={'******'}
                            onChange={(e) => setPassword(e.target.value)}
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
                        <TextField
                            label={'description'}
                            value={description}
                            multiline
                            rows={3}
                            onChange={(e) => setDescription(e.target.value)}
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
                    </Box>
                </Grid>

            </Grid>

            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={3}
                sx={{marginTop: 15}}
            >
                <Button color="inherit" variant="contained" onClick={Handle_Save}>
                    Save
                </Button>
            </Box>
        </Box>);
}

export default Account;
