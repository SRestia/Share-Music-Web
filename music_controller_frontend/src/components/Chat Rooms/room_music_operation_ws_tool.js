const room_music_operation_ws_tool = (websocket, operation, music_data) => {
    if (websocket && operation) {
        websocket.send(JSON.stringify({
            event: 'room_music_operation_group_send',
            operation: operation,
            music_data: music_data
        }));
    }
}

export default room_music_operation_ws_tool;