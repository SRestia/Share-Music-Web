import random

from django.contrib.auth.models import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models


"""
Room Part
"""

def find_empty_room_id() -> int:
    while True:
        new_room_id = random.randint(1, 999999)
        if Room.objects.filter(room_id=new_room_id).count() == 0:
            return new_room_id


# Create your models here.
class Room(models.Model):
    room_id = models.IntegerField(default=find_empty_room_id, unique=True)

    room_name = models.CharField(max_length=50, null=True)
    votes_to_skip = models.IntegerField(default=1, null=False)
    guest_can_pause = models.BooleanField(default=False, null=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    who_created = models.CharField(max_length=50, null=True)

    avatar = models.CharField(max_length=250, null=True)
    room_labels = models.JSONField(default=list, blank=True)
    current_song = models.CharField(max_length=50, null=True)
    description = models.TextField(null=True)
    background = models.CharField(max_length=50, null=True)

    # 添加与用户的关联
    user_list = models.JSONField(default=list, blank=True)

    def delete_user_in_list(self, user):            # 删除单个用户
        self.user_list.remove(user)
        self.save()

    def add_user_in_list(self, user):               # 添加单个用户
        if user not in self.user_list:
            self.user_list.append(user)
            self.save()

    # 添加与音乐的关联
    room_music_list = models.JSONField(default=list, blank=True)

    def add_room_music(self, data):                          # 添加单首音乐
        if len(self.room_music_list) > 200:
            self.room_music_list.pop()
        for i in range(len(self.room_music_list)):
            if self.room_music_list[i]['song_mid'] == data['song_mid']:
                return
        self.room_music_list.insert(0, data)
        self.save()

    def delete_room_music(self, music_mid):                  # 删除单首音乐
        for i in range(len(self.room_music_list)):
            if self.room_music_list[i]['song_mid'] == music_mid:
                self.room_music_list.pop(i)
                break
        self.save()

    def __str__(self):
        return f"{self.room_id} {self.room_name} {self.description}"


class RoomMessages(models.Model):
    room_id = models.IntegerField(unique=True, null=False)

    room_messages = models.JSONField(default=list, blank=True)   # 存入的应该为json序列化后的字符串
    end_pointer = models.IntegerField(default=0)

    def add_room_message(self, messages):
        """
        接收一个列表，将其添加到房间消息列表中
        房间消息列表为：[最旧的消息, ..., 最新的消息]
        """
        self.room_messages += messages
        self.end_pointer += len(messages)
        self.save()

    def get_100_history_messages(self, cache_times):
        """
        cache_times: 请求了多少次缓存，n次代表请求了n*100条消息
        举例，
        第一次请求的时候，cache_times=1，返回的是(end1 - 100)~(end1 = end_pointer - 0)
        第二次请求的时候，cache_times=2，返回的是(end2 - 100)~(end2 = end_pointer - 100)
        """
        print(f"get_100_history_messages---cache_times: {cache_times}")
        used = (cache_times-1) * 100
        end = self.end_pointer - used if self.end_pointer - used > 0 else 0
        start = end - 100 if end - 100 > 0 else 0
        return self.room_messages[start:end]

    def __str__(self):
        return f"RoomMessage_id:{self.room_id}, {self.room_messages}, {self.end_pointer}"


"""
User Part
"""

# 自定义用户管理器
class CustomUserManager(BaseUserManager):
    def create_user(self, username, password, **extra_fields):
        """
        创建并保存一个普通用户。
        """
        if not username:
            raise ValueError('The Username must be set')
        if not password:
            raise ValueError('The Password must be set')

        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, **extra_fields):
        """
        创建并保存一个超级用户。
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, password, **extra_fields)


# 自定义用户模型
class CustomUser(AbstractUser):
    """
        username: 用户名，用于登录。
        first_name 和 last_name: 用户的名和姓。
        email: 用户的电子邮件地址。
        password: 加密存储的用户密码。
        groups: 用户所属的组，用于权限管理。
        user_permissions: 用户的特定权限。
        is_staff: 是否允许用户访问管理界面。
        is_active: 用户账户是否被激活。
        is_superuser: 是否是超级用户。
        last_login: 最后一次登录的时间。
        date_joined: 用户创建账号的时间。
    """

    # 使用自定义的用户管理器
    objects = CustomUserManager()

    # 确保 email 字段不是唯一的，以避免与用户名字段冲突
    email = models.EmailField('email address', unique=False)

    # 使用 username 作为唯一标识符字段
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []  # 创建用户时需要提供的其他字段

    avatar = models.CharField(max_length=250, null=True)
    description = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    hold_which_room = models.IntegerField(null=True)
    in_which_room = models.IntegerField(null=True)
    have_ws = models.BooleanField(default=False)
    adding_room_music = models.BooleanField(default=False)

    history_room_list = models.JSONField(default=dict, blank=True)

    personal_music_list = models.JSONField(default=list, blank=True)

    # 添加单首音乐
    def add_personal_music(self, data):
        if len(self.personal_music_list) > 200:
            self.personal_music_list.pop()
        for i in range(len(self.personal_music_list)):
            if self.personal_music_list[i]['song_mid'] == data['song_mid']:
                return
        self.personal_music_list.insert(0, data)
        self.save()

    # 删除单首音乐
    def delete_personal_music(self, music_mid):
        for i in range(len(self.personal_music_list)):
            if self.personal_music_list[i]['song_mid'] == music_mid:
                self.personal_music_list.pop(i)
                break
        self.save()

    # 添加历史房间
    def add_history(self, room):
        # 将房间的ID作为键，房间的名称和头像作为值，添加到用户的历史房间列表
        self.history_room_list[str(room.room_id)] = {
            'room_name': room.room_name,
            'room_avatar': room.avatar
        }
        self.save()

    def __str__(self):
        return f"{self.username} {self.password} {self.email} {self.description}"


"""
Music Part
"""

class Music(models.Model):
    song_name = models.CharField(max_length=50, null=True)
    song_mid = models.CharField(max_length=50, null=True, unique=True)  # 用于搜索
    song_id = models.CharField(max_length=50, null=True)
    singer = models.CharField(max_length=50, null=True)
    album = models.CharField(max_length=50, null=True)
    album_mid = models.CharField(max_length=50, null=True)

    cover_url = models.CharField(max_length=50, null=True)
    lyric_list = models.JSONField(default=list, blank=True)
    mp3_url = models.CharField(max_length=50, null=True)

    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)



