import requests
from jsonpath import jsonpath
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import random
import os
import execjs
import base64
import re

"""
注：xxxxxxxxxx 为需要替换的内容

QQ音乐登录界面
https://graph.qq.com/oauth2.0/authorize?response_type=code&state=state&client_id=100497308&redirect_uri=https://y.qq.com/portal/wx_redirect.html?login_type=1%26surl=https%3A%2F%2Fy.qq.com%2Fportal%2Fradio.html%23stat%3Dy_new.top.pop.logout%26stat%3Dy_new.top.pop.logout%26stat%3Dy_new.top.pop.logout%26stat%3Dy_new.top.pop.logout%26stat%3Dy_new.top.pop.logout%26use_customer_cb=0

QQ音乐搜索接口
https://c.y.qq.com/soso/fcgi-bin/client_search_cp?p=1&n=10&w={xxxxxxxxxx}

QQ音乐歌曲下载接口
https://u.y.qq.com/cgi-bin/musicu.fcg?data={{"comm":{{"cv":4747474,"ct":24,"format":"json","inCharset":"utf-8","outCharset":"utf-8","notice":0,"platform":"yqq.json","needNewCode":1,"uin":"1152921504916411742","g_tk_new_20200303":1848961087,"g_tk":1849600344}},"req_9":{{"module":"vkey.GetVkeyServer","method":"CgiGetVkey","param":{{"guid":"4868259520",
"songmid":["{xxxxxxxxxx}"],"songtype":[0],"uin":"1152921504916411742","loginflag":1,"platform":"20"}}}}}}

QQ音乐歌曲下载链接
https://dl.stream.qqmusic.qq.com/{xxxxxxxxxx}
"""


class QQMusic:

    def __init__(self, current_path='./'):
        self.current_path = current_path
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0',
            'Cookie': 'ts_last=y.qq.com/;pgv_info=ssid=s8822111066;pgv_pvid=8537693716;psrf_qqrefresh_token=5AE4B7A97E2D5D1935CC9E8F5B68B229;music_ignore_pskey=202306271436Hn@vBj;qqmusic_key=Q_H_L_63k3N9I8P_uek4Ep67BtDwCTsGHFe0yxCGaYFM0kshHO3bs4yf8PhGB-Y4113NMZ10UrxteggdqJRDg9fQ_VrDlpPcuc;wxunionid=;fqm_pvqid=1f16d02b-0b4b-430f-bc64-a881ffa07551;ts_uid=7301427176;ptui_loginuin=2876925475;wxopenid=;psrf_access_token_expiresAt=1732342448;euin=owcl7wEA7Kvl7v**;wxrefresh_token=;psrf_qqunionid=A145C461AAF8B32FBAA44E11D26FE465;psrf_qqopenid=770508AF5A14A57A992CA23A1B2572FB;psrf_qqaccess_token=4650C863353041A6196D678CEDF35C35;qm_keyst=Q_H_L_63k3N9I8P_uek4Ep67BtDwCTsGHFe0yxCGaYFM0kshHO3bs4yf8PhGB-Y4113NMZ10UrxteggdqJRDg9fQ_VrDlpPcuc;login_type=1;RK=xB8Y5DMWtC;ptcz=2eb69432da929bf386c6c075102872fdc2f0206875ccb4c0e54649414e51273c;fqm_sessionid=e9ac9c7d-49b0-486d-85b1-e51471145067;psrf_musickey_createtime=1731737649;uin=2876925475;tmeLoginType=2;_qpsvr_localtk=0.38769188328265525',
            'Referer': 'https://y.qq.com/',
            'origin': 'https://y.qq.com',

            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': 'Windows',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
        }

    # 根据关键字搜索
    def search_qq_music(self, query_text):
        # 请求的链接
        search_url = f'https://c.y.qq.com/soso/fcgi-bin/client_search_cp?p=1&n=10&w={query_text}'

        response = requests.get(search_url)

        json_dict = json.loads(response.text[9: -1])
        # print(f'json_dict: {json_dict}')

        music_list = json_dict['data']['song']['list']

        music_info_list = []
        for i in range(len(music_list)):
            current_music = music_list[i]
            music_info_list.append(
                {
                    'song_name': current_music['songname'],
                    'song_id': current_music['songid'],
                    'song_mid': current_music['songmid'],
                    'singer': current_music['singer'][0]['name'],
                    'album': current_music['albumname'],
                    'album_mid': current_music['albummid']
                }
            )

        # print(f'music_info_list: {music_info_list}')

        return music_info_list

    # 下载音乐
    def download_music(self, song_name, song_mid, song_id, album_mid):
        # 填写form data
        form_data = '{"comm":{"cv":4747474,"ct":24,"format":"json","inCharset":"utf-8","outCharset":"utf-8","notice":0,"platform":"yqq.json","needNewCode":1,"uin":2876925475,"g_tk_new_20200303":1848961087,"g_tk":1848961087},"req_1":{"module":"music.trackInfo.UniformRuleCtrl","method":"CgiGetTrackInfo","param":{"types":[0],"ids":['+song_id+']}},"req_2":{"module":"music.musicasset.SongFavRead","method":"IsSongFanByMid","param":{"v_songMid":["'+song_mid+'"]}},"req_3":{"module":"music.musichallSong.PlayLyricInfo","method":"GetPlayLyricInfo","param":{"songMID":"'+song_mid+'","songID":'+song_id+'}},"req_4":{"method":"GetCommentCount","module":"music.globalComment.GlobalCommentRead","param":{"request_list":[{"biz_type":1,"biz_id":"'+song_id+'","biz_sub_type":0}]}},"req_5":{"module":"music.musichallAlbum.AlbumInfoServer","method":"GetAlbumDetail","param":{"albumMid":"'+album_mid+'"}},"req_6":{"module":"music.vkey.GetVkey","method":"GetUrl","param":{"guid":"9004117324","songmid":["'+song_mid+'"],"songtype":[0],"uin":"2876925475","loginflag":1,"platform":"20"}}}'
        # print(f'form_data: {form_data}')

        # 计算sign值
        sign = self.webpack_encode_sign(form_data)
        # 生成13位时间戳
        random_13 = int(time.time() * 1000)

        music_data_response = requests.post(
            url='https://u6.y.qq.com/cgi-bin/musics.fcg?_=' + str(random_13) + '&sign=' + sign,
            headers=self.headers,
            data=form_data)
        # print(f'music_data_response: {music_data_response.text}')

        data_info = jsonpath(music_data_response.json(), '$..purl')[0]

        music_url = f'https://dl.stream.qqmusic.qq.com/{data_info}'
        # print(f'music_url: {music_url}')
        return music_url

        # music_response = requests.get(music_url, headers=self.headers)
        #
        # 下载并保存
        # self.os_process(f'./QQ音乐/{song_mid}/', f'{song_name}.mp3', music_response.content, 'wb')

    # 下载歌词
    def download_lyric(self, song_name, song_mid):
        form_data = '{"comm":{"cv":4747474,"ct":24,"format":"json","inCharset":"utf-8","outCharset":"utf-8","notice":0,"platform":"yqq.json","needNewCode":1,"uin":2876925475,"g_tk_new_20200303":1848961087,"g_tk":1848961087},"req_7":{"module":"music.musichallSong.PlayLyricInfo","method":"GetPlayLyricInfo","param":{"songMID":"' + song_mid + '"}}}'

        # 计算sign值
        sign = self.webpack_encode_sign(form_data)
        # 生成13位时间戳
        random_13 = int(time.time() * 1000)

        url = 'https://u6.y.qq.com/cgi-bin/musics.fcg?_=' + str(random_13) + '&sign=' + sign,
        print(f'url: {url}')

        music_data_response = requests.post(
            url='https://u6.y.qq.com/cgi-bin/musics.fcg?_=' + str(random_13) + '&sign=' + sign,
            headers=self.headers,
            data=form_data
        )

        data_info = jsonpath(music_data_response.json(), '$.req_7.data.lyric')[0]

        # base64解码
        decoded_lyric = base64.b64decode(data_info).decode('utf-8')
        return self.handle_lyric_str(decoded_lyric)

        # 下载并保存
        # self.os_process(f'./QQ音乐/{song_mid}/', f'{song_name}-lyric.txt', decoded_lyric, 'w')

    # 下载封面
    def download_cover_image(self, song_name, song_mid):
        music_data_response = requests.get(
            url="https://y.qq.com/n/ryqq/songDetail/" + song_mid,
            headers=self.headers,
        )

        picurl = re.search(r'"picurl":"(.*?)"', music_data_response.text).group(1)
        # print(f'picurl: {picurl}')

        cover_url = 'https:' + picurl.replace(r'\u002F', '/')
        # print(f'cover_url: {cover_url}')
        return cover_url

        # # 请求封面
        # cover_response = requests.get('https:' + picurl.replace(r'\u002F', '/'))
        #
        # # 下载并保存
        # self.os_process(f'./QQ音乐/{song_mid}/', f'{song_name}.jpg', cover_response.content, 'wb')

    # Js逆向,加密
    def webpack_encode_sign(self, data):
        with open(f'{self.current_path}QQMusicDecryption.js', 'r', encoding='UTF-8') as file:
            js_code = file.read()

        # 初始化一个JS环境
        result = execjs.compile(js_code).call('sign', data)

        # 输出结果
        return result

    # 下载并保存
    def os_process(self, path, file_name, data, write_format):
        if not os.path.exists('./QQ音乐'):
            os.mkdir('./QQ音乐')
        if not os.path.exists(path):
            os.mkdir(path)

        if write_format == 'w':
            with open(path + file_name, write_format, encoding='UTF-8') as file:
                file.write(data)
        else:
            with open(path + file_name, write_format) as file:
                file.write(data)

        print(f'《{path + file_name}》下载成功')
        print("-" * 40)

    def handle_lyric_str(self, lyric_str):
        if not lyric_str:
            return ['暂无歌词']
        # 歌词处理
        lyric_str = lyric_str.replace('\r', '')
        lyric_list = lyric_str.split('\n')
        # 去除时间标签
        lyric_list = [re.sub(r'\[.*?\]', '', i) for i in lyric_list]
        # 去除空字符串
        lyric_list = [i for i in lyric_list if i]
        return lyric_list

    # 登录，获取cookie
    def login_to_get_cookie_qq_music(self, username, password):
        # 设置为不打开浏览器
        options = webdriver.ChromeOptions()
        # options.add_argument("--headless")
        # 创建浏览器对象
        driver = webdriver.Chrome(options=options)

        try:
            # 访问qq音乐的登录页面
            driver.get(
                "https://graph.qq.com/oauth2.0/authorize?response_type=code&state=state&client_id=100497308&redirect_uri=https://y.qq.com/portal/wx_redirect.html?login_type=1%26surl=https%3A%2F%2Fy.qq.com%2Fportal%2Fradio.html%23stat%3Dy_new.top.pop.logout%26stat%3Dy_new.top.pop.logout%26stat%3Dy_new.top.pop.logout%26stat%3Dy_new.top.pop.logout%26stat%3Dy_new.top.pop.logout%26use_customer_cb=0")

            # 切换到登录iframe
            driver.switch_to.frame("ptlogin_iframe")

            # 点击切换到账号密码登录方式
            driver.find_element(By.ID, "switcher_plogin").click()

            # 输入用户名和密码
            driver.find_element(By.ID, "u").send_keys(username)
            driver.find_element(By.ID, "p").send_keys(password)

            # 点击登录按钮
            login_button = driver.find_element(By.ID, "login_button")
            login_button.click()
            time.sleep(2)

            # 跳转到https://y.qq.com/, 刷新，获取cookie
            driver.get("https://y.qq.com/")
            time.sleep(2)

            driver.refresh()
            time.sleep(2)

            # 输出当前URL，检查是否登录成功
            print(driver.current_url)

            # 获取并打印cookie
            cookies = driver.get_cookies()
            cookies = str([i["name"] + "=" + i["value"] for i in cookies])
            cookies = cookies.replace("[", "").replace("]", "").replace("'", "").replace(", ", ";")
            print(f'cookies: {cookies}')
            time.sleep(120)

            # self.headers["Cookie"] = cookies

        except Exception as e:
            print("发生异常")
            print(e)
        finally:
            # 关闭浏览器
            if driver:
                driver.quit()


if __name__ == '__main__':
    qq = QQMusic()

    # 1. 登录QQ音乐
    qq.login_to_get_cookie_qq_music("", "")

    # 2.搜索并下载

    # 搜索
    # song_list = qq.search_qq_music("周杰伦")
    # print(f'song_list: {song_list}')

    # 多个歌曲下载
    # for i in range(len(song_list)):
    #     current_song = song_list[i]
    #     # print(f'song_name: {current_song["song_name"]}, song_id: {str(current_song["song_id"])}, song_mid: {current_song["song_mid"]}, album_mid: {current_song["album_mid"]}')
    #     qq.download_music(current_song['song_name'], str(current_song['song_id']), current_song['song_mid'], current_song['album_mid'])

    # 单个歌曲下载  name, mid, id, album_mid
    # mp3_url = qq.download_music("搁浅", "001Bbywq2gicae", '102065750', '003DFRzD192KKD')
    # print(f'mp3_url: {mp3_url}')

    # 3.下载歌词  name, mid
    # lyric = qq.download_lyric("看见", "001WZvRd3QL051")
    # print(f'lyric: {lyric}')

    # 4.下载封面 name, mid
    # qq.download_cover_image("晴天", "0039MnYb0qxYhV")


    """
    
    {'song_name': '极星流浪夜', 
    'song_id': 468456557, 'song_mid': '002EDbAe0LPN5M', 'singer': '被遗忘者的哀伤', 'album': '极星流浪夜【星尘Infinity永夜Minus原创】', 
    'album_mid': '001Zi4bc2D8hBO'}

    未竟 9/18 16:35: https://dl.stream.qqmusic.qq.com/C400003GfLSR0Hslsb.m4a?guid=4113949072&vkey=899ED546B6DC3EB88D9EB6C19E81CE22D2B98CEC6BC9AA5BDA45DC74E5C68C1511E4FA8D008B82E0A4DFB32A6726556211AEE23A23B2FC61&uin=2876925475&fromtag=120032&src=C400000T0WCT1j2lmc.m4a
    
    
    "req_5":{"module":"music.musichallAlbum.AlbumInfoServer","method":"GetAlbumDetail","param":{"albumMid":"'+album_mid+'"}}
    
    
    "req_5":{"module":"music.musichallAlbum.AlbumInfoServer","method":"GetAlbumDetail","param":{"albumMid":""}},
    """



    """
    
    
    """
    
    
    
    
    
