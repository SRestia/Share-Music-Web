import json
import time

from channels.generic.websocket import AsyncWebsocketConsumer
from api.websocket.redis_interaction import RedisUtils
from channels.db import database_sync_to_async


class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.redis = ''
        self.room_id = ''
        self.user = ''
        self.room_group_name = ''

    # 连接
    async def connect(self):
        # 获取room_id
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.user = self.scope['user']
        self.room_group_name = f'chat_{self.room_id}'
        print(f'a_user_join_to_room: {self.room_id}, user_name: {self.user.username}, user_id: {self.user.id}')
        self.redis = RedisUtils(self.room_id, self.user.id)

        # 加入房间组
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        # 用户进入房间时，需要推送100条历史消息
        user_num = await database_sync_to_async(self.redis.get_user_number)()
        # 如果用户是第一个进入房间的，那么需要进行房间缓存的创建
        # 如果用户不是第一个进入房间的，那么需要推送房间的100条历史消息
        if user_num == 0 or user_num == 'None':
            cache_100 = await self.redis.start_room_cache_for_first_user()
        else:
            cache_100 = await self.redis.start_room_cache_for_other_user()
        await self.chat_history_100(cache_100)

        # 用户数量+1
        await database_sync_to_async(self.redis.incr_user_number)()

    # 断开连接
    async def disconnect(self, close_code):
        # 离开房间组
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        await database_sync_to_async(self.redis.decr_user_number)()
        user_num = await database_sync_to_async(self.redis.get_user_number)()
        if user_num == 0:
            # 如果该用户为最后一个离开此房间的，执行房间缓存持久化
            await self.redis.room_break()

    # 从前端的接收消息
    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        # print(f"receive: {data}")

        if event == 'chat_string':
            await self.chat_message(data)
        elif event == 'chat_history_100':
            await self.chat_history_100(data)
        elif event == 'chat_image':
            await self.chat_image(data)
        elif event == 'room_music_operation_group_send':
            await self.room_music_operation_group_send(data)


    """
    房间音乐操作
    """

    # 从views.py中调用websocket_tool.py中的函数，发送消息，由此函数接收
    async def room_music_list_update(self, data):
        print(f"{self.user.username}: room_music_list_update")
        await self.send(text_data=json.dumps({
            'event': 'list_update',
        }))

    async def room_music_operation_group_send(self, data):
        """
        1. 暂停
        2. 播放
        3. 前一首歌曲
        4. 后一首歌曲
        5. 切换播放模式

        6. 拖动播放进度条 (待实现)
        """
        print(f"room_music_operation_group_send {self.user.username}: {data['operation']}")

        data_dict = {
            'type': 'room_music_operation',
            'event': 'room_music_operation',
            'operation': data['operation'],
            'music_data': data['music_data'],
        }
        await self.channel_layer.group_send(
            self.room_group_name,
            data_dict
        )
    async def room_music_operation(self, data):
        print(f"room_music_operation {self.user.username}: {data['operation']}")
        await self.send(text_data=json.dumps(data))


    """
    发送100条历史消息
    """

    async def chat_history_100(self, data):
        # print(f"chat_history_100: {data}")
        await self.send(text_data=json.dumps({
            'event': 'chat_history_100',
            'data': data
        }))

    """
    单个用户消息
    """

    async def chat_message(self, data):
        # print(f"chat_message: {data}")

        data_dict = {
            'type': 'send_single_message',
            'event': 'chat_message',
            'message': data['message'],
            'username': data['username'],
            'user_avatar': data['user_avatar'],
            'current_time': time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        }

        # print(f"chat_message_5: {data_dict}")

        await self.channel_layer.group_send(
            self.room_group_name,
            data_dict
        )

        await database_sync_to_async(self.redis.push_current_message)(data_dict)

    async def send_single_message(self, data):
        # print(f"send_single_message: {data}")
        await self.send(text_data=json.dumps(data))

    """
    单个图片信息
    """

    async def chat_image(self, data):
        # print(f"chat_image: {data}")
        data_dict = {
            'type': 'send_single_image',
            'event': 'chat_image',
            'image': data['image'],
            'username': data['username'],
            'user_avatar': data['user_avatar'],
            'current_time': time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        }

        # print(f"chat_image_5: {data_dict}")

        await self.channel_layer.group_send(
            self.room_group_name,
            data_dict
        )

        await database_sync_to_async(self.redis.push_current_message)(data_dict)

    async def send_single_image(self, data):
        # print(f"send_single_image: {data}")
        await self.send(text_data=json.dumps(data))


"""
consumer的知识点

1. 通过self.scope获取url中的参数
2. 通过self.channel_layer.group_add添加到房间
3. 通过self.channel_layer.group_discard从房间中移除
4. 通过self.accept()接受连接


group_send时，必须要有一个type来指定用户接收到后，该使用哪个函数来进一步处理消息，并通过send发送给用户。
所以说，仅仅是给当前建立websocket的指定的用户发送消息，其实只用send就可以了。
5. 通过self.send发送消息
6. 通过self.channel_layer.group_send发送消息到房间

"""
