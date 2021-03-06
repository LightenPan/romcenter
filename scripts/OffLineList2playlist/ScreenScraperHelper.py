# encoding=utf8
import traceback

# 利用logging.basicConfig()打印信息到控制台
import logging
logging.basicConfig(
    format='%(asctime)s [%(levelname)s] [%(pathname)s:%(lineno)d] [%(module)s] [%(funcName)s] >> %(message)s',
    level=logging.DEBUG
)

# 关闭requests的日志
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)

class ScreenScraperHelper:
    def __init__(self, use_socks5_proxy):
      self.devlist = [
        {
            'devid': 'capsaicin',
            'devpassword': 'rpivid20161125',
            'softname': 'video_scraper',
        },
        {
            'devid': 'son_link',
            'devpassword': 'link20161231son',
            'softname': 'multi-scrapper',
        },
        {
            'devid': 'NeeeeB',
            'devpassword': 'mapzoe',
            'softname': 'Universal_XML_Scraper',
        },
      ]
      self.use_socks5_proxy = use_socks5_proxy

    def __get_rand_dev_info(self):
        import random
        rand = random.randint(0, len(self.devlist) - 1)
        return self.devlist[rand]

    def __jeuInfos(self, crc, name):
        devinfo = self.__get_rand_dev_info()
        params = {
            'devid': devinfo['devid'],
            'devpassword': devinfo['devpassword'],
            'softname': devinfo['softname'],
            'output': 'json',
            'crc': crc,
            # 'romnom': 'Sonic',
            # 'romnom': 'LightenPan',
            'ssid': 'LightenPan',
            'sspassword': 'panliang1985',
        }
        if crc:
            params['crc'] = crc
        if name:
            params['romnom'] = name
        url = 'http://www.screenscraper.fr/api/jeuInfos.php'
        import requests
        if self.use_socks5_proxy == 1:
            import socket
            import socks
            socks.set_default_proxy(socks.SOCKS5, "127.0.0.1", 1080)
            socket.socket = socks.socksocket
        resp = requests.get(url, params=params)
        if resp.status_code != requests.codes.ok:
            return None
        try:
            jdata = resp.json()
            return jdata
        except Exception as excep:
            logging.error('__jeuInfos failed. excep: %s, traceback: %s, resp_text: %s, url: %s',
            excep, traceback.format_exc(), resp.text, resp.url)
            return None

    def getGameImageUrlsByName(self, name):
        jdata = self.__jeuInfos(None, name)
        if not jdata:
            return None, None
        return self.__getGameImageUrls(jdata)

    def getGameImageUrls(self, crc):
        jdata = self.__jeuInfos(crc, None)
        if not jdata:
            return None, None
        return self.__getGameImageUrls(jdata)

    def __getGameImageUrls(self, jdata):
        try:
            if 'roms' not in jdata['response']['jeu']:
                  return None, None

            img1 = None
            img2 = None
            medias = jdata['response']['jeu']['medias']

            if 'media_screenshot' in medias and 'media_screenshottitle' in medias:
                img1 = medias['media_screenshot']
                img2 = medias['media_screenshottitle']
                return img1, img2
            if 'media_screenshot' in medias or 'media_screenshottitle' in medias:
                if 'media_screenshot' not in medias:
                    img1 = medias['media_screenshottitle']
                    img2 = medias['media_screenshottitle']
                    return img1, img2
                else:
                    img1 = medias['media_screenshot']
                    img2 = medias['media_screenshot']
                    return img1, img2

            # GBC-ROM取封面不同
            if 'media_boxs' in medias:
                media_boxs = medias['media_boxs']
                if 'media_boxs2d' in media_boxs and 'media_box2d_ss' in media_boxs['media_boxs2d']:
                    img1 = media_boxs['media_boxs2d']['media_box2d_ss']
                if 'media_boxstexture' in media_boxs and 'media_boxtexture_ss' in media_boxs['media_boxstexture']:
                    img2 = media_boxs['media_boxstexture']['media_boxtexture_ss']
                if img1 and img2:
                    return img1, img2

        except Exception as excep:
            print('getGameImageUrls failed. excep: %s, traceback: %s, header: %s' % (
                excep, traceback.format_exc(), jdata['header'])
            )
            return None, None
