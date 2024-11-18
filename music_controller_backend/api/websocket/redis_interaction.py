from django_redis import get_redis_connection
from channels.db import database_sync_to_async
import json


class RedisUtils:
    """
    多种情况分析;

    1.加入房间
        - 用户是第一个进入房间的
            - 判断用户数量是否为0
            - 用户数量+1
            - 创建房间的缓存
            - 获取房间的 mysql 100条缓存，存入 redis 的 history 列表中

        - 用户是后续进入房间的
            - 判断用户数量是否为0
            - 用户数量+1
            - 从 redis 的 current/history 列表中获取最新的100条消息
                - 这里要分情况，为什么此时如果current+history不足100条，不从mysql中获取？
                - 因为如果current+history不足100条，说明第一个用户进入房间时，从mysql中获取的历史消息不足100条，也就说明该房间的历史消息不足100条
                - 那就没必要再从mysql中获取历史消息了，直接返回current+history即可

    2.离开房间
        - 用户是最后一个离开房间的
            - 用户数量-1
            - 将 redis的current 进行持久化，存入mysql数据库

        - 用户离开房间，但不是最后一个
            - 用户数量-1

    3.该房间创建时间超过一天 (暂未实现)
        - 将房间缓存进行持久化，存入数据库
        - 清空房间缓存

    4.用户需要获取房间的更多历史消息
        - 当用户想要获取更多历史信息的时候，需要将用户的指针向前推100，然后获取100条历史消息


    这里需要澄清一些概念
    1. current 列表: 当前房间该次连接的消息列表，这个列表不包含任何从mysql中获取的历史消息 [最旧...最新]
    2. history 列表: 当前房间的历史消息列表，这个列表仅包含了从mysql中获取的历史消息 [最旧...最新]
    3. user_pointer: 用户的消息指针，用于标记用户在 current/history/mysql 列表中的位置，每次拿取相当于往更早的消息推进100条
    4. cache_times: 房间请求缓存的次数，用于标记房间该次连接对mysql中的历史消息进行了多少次请求，每次请求相当于往history列表中添加100条消息
    """

    """
    1.Sync Part
    """
    def __init__(self, room_id, user_id):
        self.room_id = room_id
        self.user_id = user_id
        self.redis = get_redis_connection("default")

    """
    room part
    """

    # 得到该房间的用户数量
    def get_user_number(self):
        value = self.redis.get(f"{self.room_id}_user_number")
        value = int(value) if value else 0
        print(f'get_user_number: {value}')
        return value

    # 该房间用户数量+1
    def incr_user_number(self):
        print('incr_user_number' + ('-' * 20))
        self.redis.incr(f"{self.room_id}_user_number")

    # 该房间用户数量-1
    def decr_user_number(self):
        print('decr_user_number' + ('-' * 20))   # 429225_user_number
        self.redis.decr(f"{self.room_id}_user_number")

    # 记录房间请求缓存的次数
    def cache_add(self):
        print('cache_add' + ('-' * 20))
        self.redis.incr(f"{self.room_id}_cache_times")

    # 将消息存入 current 列表
    def push_current_message(self, message):
        message = json.dumps(message)
        print(f'push_current_message: {message}')
        self.redis.rpush(f"{self.room_id}_current", message)

    """
    user pointer part
    """
    # 获取用户的消息指针，end_pointer
    def get_user_pointer(self):
        pointer = self.redis.get(f"{self.room_id}_{self.user_id}_pointer")
        return int(pointer) if pointer else 0

    # 更新用户的消息指针，end_pointer
    def set_user_pointer(self, pointer):
        self.redis.set(f"{self.room_id}_{self.user_id}_pointer", pointer)

    # 用户指针向后推100
    def reduce_100_user_pointer(self):
        pointer = self.get_user_pointer()
        pointer = pointer - 100
        self.set_user_pointer(pointer)
        return pointer

    """
    2.Async Part
    """
    # 从mysql中获取100条历史消息，并存入redis的history列表中
    async def push_100_history_messages_to_redis_history_list(self):
        """
        每次调用这个函数，说明必定会去数据库中获取一次100条历史消息，所以cache_add
        而通过get_100_history_messages获取的消息是：[最旧的消息, ..., 最新的消息]
        这里xxx_history的样式为：[最旧的消息, ..., 最新的消息]
        所以需要将get_100_history_messages获取的消息先反转再存入redis
        """
        from api.models import RoomMessages

        self.cache_add()
        cache_times = int(self.redis.get(f"{self.room_id}_cache_times"))   # 在cache_times调用前，就已经将其+1了，所以不需要判断是否为None

        room = await database_sync_to_async(lambda: RoomMessages.objects.filter(room_id=self.room_id).first())()
        history_messages = await database_sync_to_async(room.get_100_history_messages)(cache_times)
        if history_messages:
            self.redis.lpush(f"{self.room_id}_history", *[json.dumps(i) for i in history_messages[::-1]])  # 线程安全可能有些问题

        return history_messages

    # 第一个用户加入房间时
    async def start_room_cache_for_first_user(self):
        """
        当第一个用户加入时，此时必定需要从数据库中获取历史消息，并将其存入redis的history列表中，同时将这100条消息推送给用户
        """
        print('start_cache_for_room' + ('-' * 20))
        history = await self.push_100_history_messages_to_redis_history_list()
        self.set_user_pointer(-len(history))
        return history

    # 用户不是第一个加入房间时
    async def start_room_cache_for_other_user(self):
        """
        当用户不是第一个加入时，此时只需要将最新的100条历史消息推送给用户即可
        1.获取 current + history 列表中的所有消息
        2.判断如果history中消息不足100条，从RoomMessages中获取
        3.合并history和current的消息
        """
        current = [json.loads(msg) for msg in self.redis.lrange(f"{self.room_id}_current", 0, -1)]
        current_num = len(current)

        # 如果 current 足够 100 条，直接返回
        # 如果 current 列表中的消息不足 100 条，去 history 中获取。
        if current_num >= 100:
            res = current[-100:]
        else:
            history = [json.loads(msg) for msg in self.redis.lrange(f"{self.room_id}_history", 0, -1)]
            res = history[current_num-100:] + current

        self.set_user_pointer(current_num - 100)
        return res

    # 对于任何用户，当他们想要获取更多历史消息时
    async def get_100_extra_history(self):
        """
        当用户想要获取更多历史信息的时候，需要将用户的指针向前推100，然后获取100条历史消息
        分类讨论
        1.(user_pointer-100>=0)
            - 用户指针-100后，仍然在current列表中。
            - 直接返回current[user_pointer-100:user_pointer]

        2.(user_pointer-100<0, abs(user_pointer-100) <= len(history))
            - 用户指针-100后，不在current列表中，但在history列表中。
            - 获取history[user_pointer-100:] + current[:user_pointer]

        3.(user_pointer-100<0, abs(user_pointer-100) > len(history))
            - 用户指针-100后，不在current列表中，也不在history列表中。
            - 获取mysql中的历史消息，存入history列表中
            - history[user_pointer-100:user_pointer]
        """
        user_pointer = self.get_user_pointer()
        new_p = user_pointer - 100

        current = [json.loads(msg) for msg in self.redis.lrange(f"{self.room_id}_current", 0, -1)]

        if new_p >= 0:
            self.reduce_100_user_pointer()
            return current[new_p: user_pointer]

        history = [json.loads(msg) for msg in self.redis.lrange(f"{self.room_id}_history", 0, -1)]

        if new_p < 0 and abs(new_p) <= len(history):
            self.reduce_100_user_pointer()
            return history[new_p:] + current[:user_pointer]

        if await self.push_100_history_messages_to_redis_history_list():
            history = [json.loads(msg) for msg in self.redis.lrange(f"{self.room_id}_history", 0, -1)]  # 由于更新了history，所以需要重新获取
            res = history[new_p: user_pointer]
            self.set_user_pointer(user_pointer-len(res))
            return res

        return []

    # 最后一个用户退出房间时，房间缓存进行持久化，存入数据库
    async def room_break(self):
        print(f'room_break_{self.room_id}' + ('-' * 20))

        from api.models import RoomMessages

        # 获取 current 列表中的所有消息，并获取 RoomMessages 对象
        current = [json.loads(msg) for msg in self.redis.lrange(f"{self.room_id}_current", 0, -1)]
        room = await database_sync_to_async(lambda: RoomMessages.objects.filter(room_id=self.room_id).first())()
        await database_sync_to_async(room.add_room_message)(current)

        # 清空房间缓存
        self.redis.delete(f"{self.room_id}_cache_times")
        self.redis.delete(f"{self.room_id}_history")
        self.redis.delete(f"{self.room_id}_current")

