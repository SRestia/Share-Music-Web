import { useEffect, useState } from "react";
import React from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import AudioBar from "../Music Player/AudioBar";

const RoomMusicPlayer = ({ room_id }) => {
    const [room_music_list, setRoomMusicList] = useState([]);
    const [current_song, setCurrentSong] = useState(null);
    const [displayCover, setDisplayCover] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(-1);

    // 控制显示的内容（"lyrics" 或 "list" 或 null）
    const [displayOverlay, setDisplayOverlay] = useState(null);

    const Lyric_Part = () => (
        <Box sx={{ color: "white", p: 3, overflow: "auto", height: "60vh" }}>
            <Typography variant="h5" color="rgba(255, 255, 255, 0.7)" mb={2}>
                Lyric
            </Typography>
            {current_song &&
                current_song.lyric_list.map((line, index) => (
                    <Typography key={index} variant="body1">
                        {line || <br />}
                    </Typography>
                ))}
        </Box>
    );

    const Music_list = () => (
        <Box sx={{ color: "white", p: 3, overflow: "auto", height: "60vh" }}>
            <Typography variant="h5" color="rgba(255, 255, 255, 0.7)" mb={2}>
                Musics
            </Typography>
            {room_music_list.map((song, index) => (
                <Typography key={index} variant="body1">
                    {`${index + 1}. ${song.song_name}`}
                </Typography>
            ))}
        </Box>
    );

    const handleClick = (type) => {
        // Toggle between showing and hiding the overlay for the clicked type
        setDisplayOverlay((prev) => (prev === type ? null : type));
    };

    return (
        <Grid container>
            {/* 模糊的背景内容 */}
            <Box
                sx={{
                    position: "relative",
                    filter: displayOverlay ? "blur(5px)" : "none",
                    transition: "filter 0.3s",
                }}
            >
                <Grid item xs={12}>
                    <Box display="flex" flexDirection="column" alignItems="center" sx={{ gap: 2, width: "80%" }}>
                        <img
                            src={current_song ? current_song.cover_url : "../../static/images/m2.jpg"}
                            alt={current_song ? current_song.song_name : "empty.jpg"}
                            style={{
                                height: "auto",
                                width: "20vw",
                                borderRadius: "20px",
                                clipPath: "polygon(35% 0, 100% 0, 100% 97%)",
                            }}
                        />
                        <Box display="flex" flexDirection="column" alignItems="left" sx={{ gap: 2 }}>
                            <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "18px" }}>
                                {current_song ? `${current_song.song_name}` : "歌曲名: ..."}
                            </Typography>
                            <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                                {current_song ? `${current_song.singer}` : "歌手: ..."}
                            </Typography>
                            <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                                {current_song ? `${current_song.album ? current_song.album : "..."}` : "专辑: ..."}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid
                    item
                    xs={12}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        marginTop: 4,
                        marginLeft: 4,
                    }}
                >
                    <Button onClick={() => handleClick("lyrics")} sx={{ color: "rgba(255,255,255,0.5)", mr: 2 }}>
                        <Typography>词</Typography>
                    </Button>
                    <Button onClick={() => handleClick("list")} sx={{ color: "rgba(255,255,255,0.5)" }}>
                        <Typography>列</Typography>
                    </Button>
                </Grid>
            </Box>

            {/* 根据displayOverlay状态条件渲染的遮罩层内容 */}
            {displayOverlay && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        zIndex: 10,
                        p: 3,
                        overflow: "auto",
                    }}
                >
                    {displayOverlay === "lyrics" ? <Lyric_Part /> : <Music_list />}
                </Box>
            )}
        </Grid>
    );
};

export default RoomMusicPlayer;
