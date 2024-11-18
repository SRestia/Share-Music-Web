
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
import random

from .serializers import UserSerializer, CreateUserSerializer, VerifyUserSerializer, RoomSerializer, \
    SearchTextSerializer, MusicSerializer, MusicPlayDataSerializer, \
    MusicViewSerializer, CreateRoomSerializer, RoomMessageSerializer
from .models import Room, CustomUser, Music, RoomMessages

from .Tools.Music_Crawl import QQMusic
from .Tools.save_file import save_avatar, save_chat_image

from datetime import timedelta
from django.utils import timezone
import asyncio
from .Tools.websocket_tool import websocket_additional_send

"""
User Part
"""


class UserView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer


class CreateUserView(APIView):

    def get(self, request, format=None):
        # 创建一个临时用户，使用随机用户名和密码
        username = f"auto_create_{random.randint(1, 999999)}"
        password = f"auto_create_{random.randint(1, 999999)}"
        user = CustomUser.objects.create_user(username=username, password=password)

        if not request.session.exists(request.session.session_key):
            request.session.create()

        login(request, user)

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    def post(self, request, format=None):
        after_serializer = CreateUserSerializer(data=request.data)

        if after_serializer.is_valid():
            username = after_serializer.data.get('username')
            password = after_serializer.data.get('password')
            email = after_serializer.data.get('email')
            description = after_serializer.data.get('description')

            print(f'username: {username}, password: {password}, email: {email}, description: {description}')

            user = CustomUser.objects.create_user(username=username, password=password,
                                                  email=email, description=description)

            if not request.session.exists(request.session.session_key):
                request.session.create()

            login(request, user)

            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'serializer form'}, status=status.HTTP_400_BAD_REQUEST)


# 更新用户的信息，包括用户名，密码，邮箱，描述
class UpdateUserInfoView(APIView):
    def post(self, request, format=None):
        # partial=True表示可以部分更新,不需要所有字段
        after_serializer = UserSerializer(
            instance=CustomUser.objects.get(username=request.data.get('username')), data=request.data, partial=True
        )

        if after_serializer.is_valid():
            after_serializer.save()  # 自动保存所有字段，包括文件路径
            return Response(after_serializer.data, status=status.HTTP_200_OK)

        return Response(after_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 由于要考虑到image文件的上传，所以前端传递的是FormData，而不是Json，所以这里要使用request.FILES
# 对于非Json数据，不需要使用serializer，直接使用request.data即可
class UpdateUserAvatarView(APIView):
    def post(self, request, format=None):
        # 获取用户和上传的文件
        user = CustomUser.objects.get(username=request.user.username)
        new_avatar = request.data.get('avatar')

        if not new_avatar:
            return Response({'Bad Request': 'Invalid post data, did not find an avatar key'},
                            status=status.HTTP_400_BAD_REQUEST)

        # 保存图片
        save_avatar(user, 'user_avatars', new_avatar)

        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class AutoVerifyUser(APIView):
    def get(self, request, format=None):
        if request.user.is_authenticated:
            print(f'AutoVerifyUser-----------------')
            return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)

        return Response({'Bad Request': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)


class VerifyUser(APIView):
    serializer_class = VerifyUserSerializer

    def post(self, request, format=None):
        after_serializer = self.serializer_class(data=request.data)
        # print(f"first VerifyUser step here-----------")
        if after_serializer.is_valid():
            username = after_serializer.data.get('username')
            password = after_serializer.data.get('password')

            # print(f"username: {username}, password: {password}")

            user = authenticate(username=username, password=password)
            # print(f"user: {user}")
            if user:
                login(request, user)
                return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

            return Response({'bad request': 'Invalid Username or Password'},
                            status=status.HTTP_400_BAD_REQUEST)

        return Response(after_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogOutUser(APIView):
    def get(self, request, format=None):
        logout(request)
        return Response({'message': 'User logged out successfully!'}, status=status.HTTP_200_OK)


class UpdateUserInWhichRoom(APIView):
    def post(self, request, format=None):
        user = request.user
        user.in_which_room = request.data.get('room_id')
        user.save()

        return Response({'message': 'User in_which_room updated!'}, status=status.HTTP_200_OK)


"""
Room Part
"""


# Create RoomView class to handle the GET and POST request
class RoomView(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class RoomMessageView(generics.ListCreateAPIView):
    queryset = RoomMessages.objects.all()
    serializer_class = RoomMessageSerializer


class GetRoomList(APIView):
    def get(self, request, format=None):
        rooms = Room.objects.all()
        return Response(RoomSerializer(rooms, many=True).data, status=status.HTTP_200_OK)


class GetRoomInfo(APIView):
    # 这个serializer_class虽然不是必须创建的，但是如果不在class中定义，
    # 那么直接通过web访问的时候(且没有写前端渲染这个页面的时候)，
    # 它要求传入的就是纯json数据，而不是按钮和直接输入，所以为了方便测试，还是加上.
    # * 注意必须叫serializer_class才行
    serializer_class = RoomSerializer

    def get(self, request, format=None):
        # request.GET.get() is used to get the value of the query parameter in the URL
        # web urls be like "http://localhost:8000/api/get-room?room_id=xxxxxx"
        room_id = request.GET.get('room_id')

        if room_id:
            room = Room.objects.filter(room_id=room_id)

            if room.exists():
                data = RoomSerializer(room[0]).data
                data['created_at'] = room[0].created_at.strftime('%Y-%m-%d %H:%M:%S')  # 直接使用Room实例的created_at
                return Response(data, status=status.HTTP_200_OK)

            return Response({'Room Not Found': 'Invalid Room ID'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Room ID parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoom(APIView):

    def post(self, request, format=None):
        room_id = request.data.get('room_id')
        user = request.user

        print(f'user: {user.history_room_list}')

        if room_id:
            if room_id in user.history_room_list:
                return Response({'message': 'already in a room'}, status=status.HTTP_200_OK)

            room_query = Room.objects.filter(room_id=room_id)
            if room_query.exists():
                chat_room = room_query[0]
                chat_room.add_user_in_list(request.user.username)

                user.in_which_room = room_id  # store the room_id in session means the user in room
                user.add_history(chat_room)
                user.save()

                return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)

            return Response({'Bad Request': 'Invalid Room ID'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'Bad Request': 'Invalid post data, did not find a room_id key'},
                        status=status.HTTP_400_BAD_REQUEST)


# Create/update CreateRoomView class to handle the POST request
class CreateRoomView(APIView):
    def post(self, request, format=None):

        user = request.user
        print(f'user: {user.hold_which_room}')

        # 直接提前处理avatar并删除, 剩下的数据进行序列化
        avatar = request.data.get('room_avatar')
        del request.data['room_avatar']

        after_serializer = CreateRoomSerializer(data=request.data)

        if after_serializer.is_valid():

            print(f'the data is valid-------------------')

            room_name, description, guest_can_pause, votes_to_skip, room_labels = (
                after_serializer.data['room_name'],
                after_serializer.data['description'],
                after_serializer.data['guest_can_pause'],
                after_serializer.data['votes_to_skip'],
                after_serializer.data['room_labels']
            )

            # 如果用户创建过房间，那么就直接更新，否则就创建新房间
            user_hold_which_room = user.hold_which_room
            if user_hold_which_room:

                print(f'user already hold a room-------------------')

                update_room = Room.objects.filter(room_id=user_hold_which_room)[0]

                update_room.room_name = room_name
                update_room.room_labels = room_labels
                update_room.description = description
                update_room.guest_can_pause = guest_can_pause
                update_room.votes_to_skip = votes_to_skip

                save_avatar(update_room, 'room_avatars', avatar)

                update_room.save()

                print(f'update_room: {update_room}')

                return Response(RoomSerializer(update_room).data, status=status.HTTP_200_OK)
            else:

                print(f'user not hold a room-------------------')

                new_room = Room(
                    room_name=room_name,
                    room_labels=room_labels,
                    who_created=user.username,
                    description=description,
                    guest_can_pause=guest_can_pause,
                    votes_to_skip=votes_to_skip
                )
                new_room.add_user_in_list(user.username)
                save_avatar(new_room, 'room_avatars', avatar)
                new_room.save()

                new_room_messages = RoomMessages(room_id=new_room.room_id)  # 创建一个对应的room_messages
                new_room_messages.save()

                print(f'new_room_messages: {new_room_messages}')

                user.hold_which_room = new_room.room_id
                user.in_which_room = new_room.room_id
                user.add_history(new_room)
                user.save()

                print(f'new_room: {new_room}')

                return Response(RoomSerializer(new_room).data, status=status.HTTP_201_CREATED)

        return Response(after_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UploadChatImage(APIView):  # 上传聊天图片
    def post(self, request, format=None):
        room_id = request.data.get('room_id')
        chat_image = request.data.get('image')

        if room_id and chat_image:
            chat_image_url = save_chat_image(room_id, chat_image)

            return Response({'chat_image_url': chat_image_url}, status=status.HTTP_200_OK)

        return Response({'Bad Request': 'Invalid post data, did not find a room_id or image key'},
                        status=status.HTTP_400_BAD_REQUEST)


class RoomAddMusic(APIView):  # 添加房间音乐
    def post(self, request, format=None):
        after_serializer = MusicSerializer(data=request.data)
        room_id = request.user.in_which_room

        if after_serializer.is_valid() and room_id:
            room = Room.objects.get(room_id=room_id)
            # print(f'room: {room}')
            # print(f'add_room_music, request.data: {request.data}')
            room.add_room_music(request.data)

            # 通过websocket发送消息
            asyncio.run(websocket_additional_send(f'chat_{room_id}', 'room_music_list_update'))

            return Response({'message': 'Room Music Added!', 'added-music-info': request.data}, status=status.HTTP_200_OK)

        return Response(after_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoomDeleteMusic(APIView):  # 删除房间音乐
    def post(self, request, format=None):
        after_serializer = MusicSerializer(data=request.data)
        room_id = request.user.in_which_room

        if after_serializer.is_valid():
            room = Room.objects.get(room_id=room_id)
            room.delete_room_music(request.data['song_mid'])

            # 通过websocket发送消息
            asyncio.run(websocket_additional_send(f'chat_{room_id}', 'room_music_list_update'))

            return Response({'message': 'Room Music Deleted!', 'deleted-music-info': request.data}, status=status.HTTP_200_OK)

        return Response(after_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoomMusicList(APIView):  # 房间音乐列表

    def get(self, request, format=None):
        room_id = request.user.in_which_room
        room = Room.objects.get(room_id=room_id)
        # print(f'room_id: {room_id}')
        # print(f'room.room_music_list: {room.room_music_list}')
        return Response(room.room_music_list, status=status.HTTP_200_OK)


"""
Music Part
"""


class MusicView(generics.ListCreateAPIView):  # 数据库中的所有音乐
    queryset = Music.objects.all()
    serializer_class = MusicViewSerializer


class MusicSearch(APIView):
    crawl = QQMusic()

    """
    music_info_list example: [
        {'song_name': '看见', 'song_id': 509883094, 'song_mid': '001WZvRd3QL051', 'singer': '陈鸿宇', 'album': '《黑神话：悟空》游戏音乐精选集', 'album_mid': '004B5xJQ0GOPPI'}, 
        ...
    ]
    """

    # 处理前端的搜索post请求
    def post(self, request, format=None):
        after_serializer = SearchTextSerializer(data=request.data)

        if after_serializer.is_valid():
            search_text = after_serializer.data.get('search_text')
            # print(f'search_text: {search_text}')

            if search_text:
                music_info_list = self.crawl.search_qq_music(search_text)
                # print(f'music_info_list: {music_info_list}')

                # 注意这里因为是列表数据，要对列表中的每一个dict进行序列化，所以要加many=True
                return Response(MusicSerializer(music_info_list, many=True).data, status=status.HTTP_200_OK)

            return Response({'Bad Request': 'Invalid query_text'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(after_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MusicPlayInfo(APIView):  # 播放音乐
    crawl = QQMusic('api/Tools/')

    # 处理前端的播放post请求, 返回包括歌曲的图片地址(url), 歌曲的歌词(txt), 歌曲的播放地址(url)
    def post(self, request, format=None):
        after_serializer = MusicSerializer(data=request.data)

        if after_serializer.is_valid():
            song_name = after_serializer.data.get('song_name')
            song_mid = after_serializer.data.get('song_mid')
            song_id = after_serializer.data.get('song_id')
            album_mid = after_serializer.data.get('album_mid')

            query = Music.objects.filter(song_mid=song_mid)
            if query.exists():
                music = query[0]

                # 计算时间差，检查 `update_time` 是否大于1天
                if (timezone.now() - music.update_time) > timedelta(days=1):
                    # 重新获取 mp3_url，并更新数据库
                    music.mp3_url = self.crawl.download_music(song_name, song_mid, song_id, album_mid)
                    # music.update_time = timezone.now()  # 手动更新更新时间
                    music.save()

                play_info = {
                    'mp3_url': music.mp3_url,
                    'cover_url': music.cover_url,
                    'lyric_list': music.lyric_list
                }

            else:
                cover_url = self.crawl.download_cover_image(song_name, song_mid)
                lyric_list = self.crawl.download_lyric(song_name, song_mid)
                mp3_url = self.crawl.download_music(song_name, song_mid, song_id, album_mid)

                new_music = Music(
                    song_name=song_name, song_mid=song_mid, song_id=after_serializer.data.get('song_id'),
                    singer=after_serializer.data.get('singer'), album=after_serializer.data.get('album'),
                    album_mid=after_serializer.data.get('album_mid'),
                    cover_url=cover_url, lyric_list=lyric_list, mp3_url=mp3_url
                )
                new_music.save()

                play_info = {
                    'mp3_url': mp3_url,
                    'cover_url': cover_url,
                    'lyric_list': lyric_list
                }

            return Response(MusicPlayDataSerializer(play_info).data, status=status.HTTP_200_OK)

        return Response(after_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PersonalAddMusic(APIView):  # 添加个人音乐

    def post(self, request, format=None):
        after_serializer = MusicSerializer(data=request.data)

        if after_serializer.is_valid():
            user = CustomUser.objects.get(username=request.user.username)
            user.add_personal_music(request.data)

            return Response({'message': 'Music Added!', 'added-music-info': request.data}, status=status.HTTP_200_OK)

        return Response(after_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PersonalDeleteMusic(APIView):  # 删除个人音乐

    def post(self, request, format=None):
        after_serializer = MusicSerializer(data=request.data)

        if after_serializer.is_valid():
            user = CustomUser.objects.get(username=request.user.username)
            user.delete_personal_music(request.data['song_mid'])

            return Response({'message': 'Music Deleted!', 'deleted-music-info': request.data},
                            status=status.HTTP_200_OK)

        return Response(after_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PersonalMusicList(APIView):  # 个人音乐列表

    def get(self, request, format=None):
        user = CustomUser.objects.get(username=request.user.username)
        # print(f'user.personal_music_list: {user.personal_music_list}')
        return Response(user.personal_music_list, status=status.HTTP_200_OK)

