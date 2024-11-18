
import math

year = 365


def find_prob():
    print(100 / 12 * 2)

find_prob()


"""
{
    "id": 3,
    "username": "ZhangQiMu",
    "email": "srestia7@gmail.com",
    "description": "A Cute Music Lover~",
    "avatar": "../../static/images/user_avatars/3/415490.jpg",
    "password": "pbkdf2_sha256$720000$vGLMMCrwDshwUSY2VFkBM5$XzdKb+XdMZhMfACt2kD6KdK1y2gULi2XdWP5N9caelo=",
    "created_at": "2024-10-04T20:02:48.179197",
    "updated_at": "2024-11-04T21:26:11.018973",
    "history_room_list": {
        "429225": {
            "room_name": "HelloWorld",
            "room_avatar": "../../static/images/room_avatars/3/957375.jpg"
        },
        "528256": {
            "room_name": "张硕的房间",
            "room_avatar": "../../static/images/room_avatars/4/74697.jpg"
        }
    },
    "hold_which_room": 429225,
    "in_which_room": 429225,
    "personal_music_list": [
        {
            "song_name": "勾指起誓",
            "song_mid": "003DFkIK2D51yp",
            "song_id": "293676135",
            "singer": "洛天依",
            "album": "2:3",
            "album_mid": "003aefaS3BdrXi"
        },
        {
            "song_name": "东京不太热",
            "song_mid": "000eBrFh2kXacf",
            "song_id": "102366907",
            "singer": "洛天依",
            "album": "东京不太热",
            "album_mid": "002nNRPL40MWAW"
        },
        {
            "song_name": "寻遍星空",
            "song_mid": "002N89zO2AmZIS",
            "song_id": "240697424",
            "singer": "洛天依",
            "album": "",
            "album_mid": ""
        },
        {
            "song_name": "化作繁星",
            "song_mid": "001U8TLC3m9LSa",
            "song_id": "247388178",
            "singer": "公兔-Manrabbit;洛天依",
            "album": "化作繁星",
            "album_mid": "000FgWGP2R0Gfo"
        },
        {
            "song_name": "乌梅子酱",
            "song_mid": "001GLG5B45uLhI",
            "song_id": "384263699",
            "singer": "李荣浩",
            "album": "纵横四海",
            "album_mid": "002PwL9x3TiVdh"
        },
        {
            "song_name": "RISE",
            "song_mid": "002Jta942SblbK",
            "song_id": "217511802",
            "singer": "The Glitch Mob",
            "album": "2018全球总决赛",
            "album_mid": "0028rfOQ4EXkTD"
        },
        {
            "song_name": "两个世界(2WORLDS)",
            "song_mid": "002ErwuW4EfBef",
            "song_id": "478744296",
            "singer": "Madge",
            "album": "两个世界(2WORLDS)",
            "album_mid": "004RZAaT0NB8ij"
        },
        {
            "song_name": "Die For You (为你而战)",
            "song_mid": "0011j9pK2sw0DM",
            "song_id": "335362176",
            "singer": "无畏契约",
            "album": "Die For You (为你而战)",
            "album_mid": "00012kY51utoSF"
        },
        {
            "song_name": "Legends Never Die 传奇永不熄",
            "song_mid": "00394z9S2ciPAD",
            "song_id": "203861946",
            "singer": "英雄联盟",
            "album": "Legends Never Die",
            "album_mid": "002TNUCE0M6XJH"
        },
        {
            "song_name": "万神纪",
            "song_mid": "003jiKWu0k3WBX",
            "song_id": "200671855",
            "singer": "肥皂菌丨珉珉的猫咪丨",
            "album": "万神纪",
            "album_mid": "003eS9WQ32ubhh"
        },
        {
            "song_name": "冠世一战",
            "song_mid": "003M18pT3VOhVL",
            "song_id": "228729541",
            "singer": "三无Marblue",
            "album": "冠世一战",
            "album_mid": "003fBz6e1i4AXr"
        },
        {
            "song_name": "栖凰",
            "song_mid": "004UIlZq4bUE6s",
            "song_id": "310083400",
            "singer": "三无Marblue",
            "album": "忘川风华录翻唱合集",
            "album_mid": "001OuavH2egOyM"
        },
        {
            "song_name": "敢归云间宿",
            "song_mid": "004NnWDu04Jm8s",
            "song_id": "392167080",
            "singer": "三无Marblue",
            "album": "敢归云间宿",
            "album_mid": "004eHMXO3V2KFo"
        },
        {
            "song_name": "逍遥仙",
            "song_mid": "003xVYVc4Lx7PE",
            "song_id": "307986778",
            "singer": "三无Marblue",
            "album": "逍遥仙",
            "album_mid": "001jMKbw3DWq12"
        },
        {
            "song_name": "年轮",
            "song_mid": "001q62Bb1xCTx7",
            "song_id": "102677326",
            "singer": "张碧晨",
            "album": "花千骨 电视剧原声带",
            "album_mid": "0044dYsD2Y0lfN"
        },
        {
            "song_name": "在你的身边",
            "song_mid": "003XT6Ef4H6X66",
            "song_id": "202057627",
            "singer": "盛哲",
            "album": "在你的身边",
            "album_mid": "004FKCj71O4Hhz"
        },
        {
            "song_name": "前前前世 (Movie ver.)",
            "song_mid": "004S6lsG3uompS",
            "song_id": "107762013",
            "singer": "RADWIMPS (ラッドウィンプス)",
            "album": "君の名は。 (《你的名字。》动画电影原声带)",
            "album_mid": "0007oL0R1hDyxV"
        },
        {
            "song_name": "TICKING AWAY (VCT ANTHEM 2023) (流光似箭)",
            "song_mid": "000SbQeV1wB1oo",
            "song_id": "425232418",
            "singer": "Grabbitz",
            "album": "TICKING AWAY (VCT ANTHEM 2023) (流光似箭)",
            "album_mid": "000Uct8d3T6aZX"
        },
        {
            "song_name": "平凡之路",
            "song_mid": "000T1Ws32MWrUj",
            "song_id": "7072290",
            "singer": "朴树",
            "album": "猎户星座",
            "album_mid": "002aRnZM0garaC"
        },
        {
            "song_name": "夜空中最亮的星",
            "song_mid": "001NmPTG1fVsUw",
            "song_id": "5408217",
            "singer": "逃跑计划",
            "album": "世界",
            "album_mid": "000wr4zc1gls3e"
        },
        {
            "song_name": "The Emptiness Machine (Explicit)",
            "song_mid": "000weNxB2OCFuH",
            "song_id": "513044918",
            "singer": "Linkin Park",
            "album": "The Emptiness Machine (Explicit)",
            "album_mid": "002p4ooL3Ed55U"
        },
        {
            "song_name": "暮色回响",
            "song_mid": "002lAB804abysx",
            "song_id": "498219796",
            "singer": "张韶涵",
            "album": "暮色回响",
            "album_mid": "002NVk1b1r12B4"
        }
    ]
}



1. 投保人和被保险人的如下信息：
姓名：张硕
手机号：18811446792
家庭地址：北京市朝阳区泛海国际兰海园
家庭邮编：100024
工作单位：无
职位信息：学生
家庭收入：不确定
个人收入：无
被投保人身高、体重：183cm，70kg

2. 紧急联络人
姓名：岳子琪
手机：13601155609
紧急联络人分为亲属和非亲属，可以只写亲属，跳过非亲属，也可以都写。这个合同成立之后可以随时修改的。

3. 受益人
姓名：岳子琪
手机：13601155609


4. 投保人银行卡
卡号：6217900100026263759

"""