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

    def __jeuInfos(self, crc):
        devinfo = self.__get_rand_dev_info()
        params = {
            'devid': devinfo['devid'],
            'devpassword': devinfo['devpassword'],
            'softname': devinfo['softname'],
            'output': 'json',
            'crc': crc,
            # 'romnom': 'Sonic',
            'romnom': 'LightenPan',
        }
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
            logging.error('getGameImageUrls failed. excep: %s, traceback: %s, resp_text: %s, url: %s',
            excep, traceback.format_exc(), resp.text, resp.url)
            return None

    def getGameImageUrls(self, crc):
        jdata = self.__jeuInfos(crc)
        if not jdata:
            return None, None

        try:
            if 'roms' not in jdata['response']['jeu']:
                  return None, None

            select_rom = None
            roms = jdata['response']['jeu']['roms']
            for rom in roms:
                if rom['romcrc'].upper() == crc.upper():
                    select_rom = rom
            if not select_rom:
                  return None, None

            romregions = ''
            if 'romregions' in select_rom:
                romregions = select_rom['romregions']

            img1 = None
            img2 = None
            medias = jdata['response']['jeu']['medias']
            if type(medias) is dict:
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

            for item in medias:
                if item['region'] != romregions:
                      break
                if item['type'] == 'sstitle':
                      img1 = item['url']
                if item['type'] == 'ss':
                      img2 = item['url']
            if not img1:
                for item in medias:
                  if item['type'] == 'sstitle':
                        img1 = item['url']
                        break
            if not img2:
                for item in medias:
                  if item['type'] == 'ss':
                        img1 = item['url']
                        break
            return img1, img2

        except Exception as excep:
            print('getGameImageUrls failed. excep: %s, header: %s' %(excep, jdata['header']))
            return None, None
