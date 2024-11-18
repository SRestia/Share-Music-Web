import React, {useState} from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import RoomJoinPage from "../Chat Rooms/RoomJoinPage";
import CreateRoomPage from "../Chat Rooms/CreateRoomPage";
import RoomInfo from "../Chat Rooms/RoomInfo";
import HomePage from "../HomePage";
import SignInPage from "../SignInPage";
import Account from "../UserMaintain/Account";
import MusicPlayer from "../Music Player/MusicPlayer";
import Rooms from "../Chat Rooms/Rooms";

import NavigateBar from "../navigation bar/NavigateBar";
import UserContext from "../UserMaintain/GlobalUser";

const RouterPage = () => {

    const [user, setUser] = useState(null);   // user全局变量

    return (
        <DndProvider backend={HTML5Backend}>
            <BrowserRouter>
                <UserContext.Provider value={[user, setUser]}>
                    <Routes>
                        <Route exact path="/" element={<SignInPage/>}/>
                        <Route element={<NavigateBar/>}>
                            <Route path="home" element={<HomePage/>}/>
                            <Route path="personal-music-player" element={<MusicPlayer/>}/>
                            <Route path="join" element={<RoomJoinPage/>}/>
                            <Route path="create" element={<CreateRoomPage/>}/>
                            <Route path="account" element={<Account/>}/>
                            <Route element={<Rooms/>}>
                                <Route path="room-info/:room_id" element={<RoomInfo/>}/>
                            </Route>
                        </Route>
                    </Routes>
                </UserContext.Provider>
            </BrowserRouter>
        </DndProvider>
    );
}

export default RouterPage;

