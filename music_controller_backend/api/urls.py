
from django.urls import path
from . import views

urlpatterns = [
    # Room Part
    path("room/", views.RoomView.as_view(), name="room"),
    path("room-list/", views.GetRoomList.as_view(), name="room-list"),
    path("create-room/", views.CreateRoomView.as_view(), name="create-room"),
    path("get-room-info/", views.GetRoomInfo.as_view(), name="get-room-info"),
    path("join-room/", views.JoinRoom.as_view(), name="join-room"),

    path("room-messages/", views.RoomMessageView.as_view(), name="room-messages"),
    path("upload-chat-image/", views.UploadChatImage.as_view(), name="upload-chat-image"),

    path("room-add-music/", views.RoomAddMusic.as_view(), name="room-add-music"),
    path("room-delete-music/", views.RoomDeleteMusic.as_view(), name="room-delete-music"),
    path("room-music-list/", views.RoomMusicList.as_view(), name="room-music-list"),

    # User Part
    path("user/", views.UserView.as_view(), name="user"),
    path("create-user/", views.CreateUserView.as_view(), name="create-user"),
    path("update-user-info/", views.UpdateUserInfoView.as_view(), name="update-user-info"),
    path("update-user-avatar/", views.UpdateUserAvatarView.as_view(), name="update-user-avatar"),
    path("verify-user/", views.VerifyUser.as_view(), name="verify-user"),
    path("logout-user/", views.LogOutUser.as_view(), name="logout-user"),
    path("autoVerify-user/", views.AutoVerifyUser.as_view(), name="autoVerify-user"),
    path("update_user_in_which_room/", views.UpdateUserInWhichRoom.as_view(), name="get-user-info"),

    # Music Part
    path("search-music/", views.MusicSearch.as_view(), name="search-music"),

    path('music/', views.MusicView.as_view(), name="music"),
    path("personal-add-music/", views.PersonalAddMusic.as_view(), name="personal-add-music"),
    path("personal-delete-music/", views.PersonalDeleteMusic.as_view(), name="personal-delete-music"),
    path("personal-music-list/", views.PersonalMusicList.as_view(), name="personal-music-list"),
    path("music-play-info/", views.MusicPlayInfo.as_view(), name="music-play-info"),
]
