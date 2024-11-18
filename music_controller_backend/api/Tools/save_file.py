
import random
import os

def save_avatar(object, upper_dir, image):
    # 设置新的头像保存路径
    num = random.randint(1, 999999)
    des_dir = f'../music_controller_frontend/static/images/{upper_dir}/{object.id}'
    new_avatar_path = os.path.join(des_dir, f'{num}.jpg')

    # exist_ok=True表示如果文件夹不存在，就创建文件夹
    os.makedirs(des_dir, exist_ok=True)
    with open(new_avatar_path, 'wb+') as file:
        for chunk in image.chunks():
            file.write(chunk)

    # 更新用户的头像路径并保存
    object.avatar = f'../../static/images/{upper_dir}/{object.id}/{num}.jpg'
    object.save()


def save_chat_image(room_id, image):
    # 设置新的头像保存路径
    num = random.randint(1, 999999)
    des_dir = f'../music_controller_frontend/static/images/chat_rooms/{room_id}'
    new_avatar_path = os.path.join(des_dir, f'{num}.jpg')

    # exist_ok=True表示如果文件夹不存在，就创建文件夹
    os.makedirs(des_dir, exist_ok=True)
    with open(new_avatar_path, 'wb+') as file:
        for chunk in image.chunks():
            file.write(chunk)

    return f'../../static/images/chat_rooms/{room_id}/{num}.jpg'
