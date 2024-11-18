# websocket_tool.py
from channels.layers import get_channel_layer


async def websocket_additional_send(room_name, m_type):
    """
    发送房间音乐列表更新的消息给所有用户
    """
    channel_layer = get_channel_layer()
    data_dict = {
        'type': m_type,         # type确定处理消息的函数
    }

    # 通过 channel_layer 将消息发送到房间组
    await channel_layer.group_send(
        room_name,
        data_dict
    )
