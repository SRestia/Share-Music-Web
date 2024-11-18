from rest_framework import serializers
from .models import Room, CustomUser, Music, RoomMessages

"""
Room Part
"""

# define single Room data's serializer for Get request
class RoomSerializer(serializers.ModelSerializer):
    # This class is used to serialize the Room model
    class Meta:
        model = Room
        fields = ('id', 'room_id', 'avatar', 'room_name', 'room_labels', 'background', 'description', 'guest_can_pause', 'votes_to_skip',
                  'created_at', 'who_created', 'current_song', 'user_list', 'room_music_list')


# define the CreateRoom data serializer for Post request
class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('room_name', 'room_labels', 'guest_can_pause', 'votes_to_skip', 'description')


class RoomMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomMessages
        fields = ('room_id', 'room_messages', 'end_pointer')

"""
User Part
"""

# define the User data serializer for Get request
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'description', 'avatar', 'password', 'created_at', 'updated_at',
                  'history_room_list', 'hold_which_room', 'in_which_room',
                  'have_ws',
                  'personal_music_list')


class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'description', 'password')


# 切记对于不需要通过models来进行转换的，不要继承ModelSerializer
class VerifyUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


"""
Music Part
"""

class MusicViewSerializer(serializers.Serializer):
    id = serializers.CharField()

    create_time = serializers.DateTimeField()
    update_time = serializers.DateTimeField()

    song_name = serializers.CharField()
    song_mid = serializers.CharField()
    song_id = serializers.CharField()
    singer = serializers.CharField()
    album = serializers.CharField()
    album_mid = serializers.CharField()
    cover_url = serializers.CharField()
    mp3_url = serializers.CharField()  # 音乐的url
    lyric_list = serializers.ListField(child=serializers.CharField())    # 歌词列表(每一句歌词为一个字符串)


# define the Music data serializer for Post search
# 切记对于不通过model转换的serializer，需要对某些字段进行allow_blank=/allow_null=，以及其他的约束
class MusicSerializer(serializers.Serializer):
    song_name = serializers.CharField()
    song_mid = serializers.CharField()
    song_id = serializers.CharField()
    singer = serializers.CharField()
    album = serializers.CharField(allow_blank=True)
    album_mid = serializers.CharField(allow_blank=True)

class MusicPlayDataSerializer(serializers.Serializer):
    cover_url = serializers.CharField()
    mp3_url = serializers.CharField()  # 音乐的url
    lyric_list = serializers.ListField(child=serializers.CharField())    # 歌词列表(每一句歌词为一个字符串)


class SearchTextSerializer(serializers.Serializer):
    search_text = serializers.CharField()



