# encoding=utf8
import xml.etree.ElementTree as ET
import shutil
import os
import zipfile
# import json
from XmlDataLoader import XmlDataLoader
from ScreenScraperHelper import ScreenScraperHelper
from tqdm import tqdm
import requests.api
import threading
from PIL import Image
import traceback
import requests
import socket
import socks

# 利用logging.basicConfig()打印信息到控制台
import logging
logging.basicConfig(
    format='%(asctime)s [%(levelname)s] [%(pathname)s:%(lineno)d] [%(module)s] [%(funcName)s] >> %(message)s',
    level=logging.DEBUG
)

# 关闭requests的日志
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("PIL").setLevel(logging.WARNING)
logger = logging.getLogger('download_imgs')

DOWNLOAD_FAILED_LIST = list()

proxy_list = [
    {
        'http': 'socks5://127.0.0.1:1080',
    },
]

def get_proxies():
    if len(proxy_list) > 0:
        import random
        index = random.randint(0, len(proxy_list) - 1)
        return proxy_list[index]
    return None


def is_valid_image(filename):
    valid = True
    try:
        Image.open(filename).load()
    except OSError:
        valid = False
    return valid


def mkdirs(path):
    isExists = os.path.exists(path)
    if not isExists:
        os.makedirs(path)


def load_xml_from_zip(_zip_file):
    logger.info('_zip_file: %s', _zip_file)
    _ext_list = ['.xml']
    zdata = ''
    z = zipfile.ZipFile(_zip_file, "r")
    for filename in z.namelist():
        ext = os.path.splitext(filename)[-1]
        if ext not in _ext_list:
            continue
        zdata = z.read(filename)
        break
    return zdata

def do_download(use_socks5_proxy, image_title_url, image_snaps_url, dst_title_file, dst_snaps_file):
    # logger.info('title: %s, image_title_url: %s, dst_title_file: %s, image_snaps_url: %s, dst_snaps_file: %s',
    #     XmlDataLoader.genGameName(game),
    #     image_title_url, dst_title_file,
    #     image_snaps_url, dst_snaps_file)

    try:
        if not image_title_url:
            return False

        if use_socks5_proxy == 1:
            socks.set_default_proxy(socks.SOCKS5, "127.0.0.1", 1080)
            socket.socket = socks.socksocket
        f = open(dst_title_file, 'wb')
        r = requests.get(image_title_url)
        if r.status_code != 200:
            os.remove(dst_title_file)
            DOWNLOAD_FAILED_LIST.append(dst_title_file)
            logging.error(
                'down load image failed. title: %s, image_title_url: %s, dst_title_file: %s, image_snaps_url: %s, dst_snaps_file: %s',
                XmlDataLoader.genGameName(game), image_title_url, dst_title_file, image_snaps_url, dst_snaps_file
            )
            return False
        f.write(r.content)
        f.close()

        # 检验下载的文件是否正常，不正常需要删除重新下载
        if not is_valid_image(dst_title_file):
            os.remove(dst_title_file)
            DOWNLOAD_FAILED_LIST.append(dst_title_file)

    except Exception as excep:
        logging.error(
            'down load image failed. excep: %s, traceback: %s, title: %s, image_title_url: %s, dst_title_file: %s, image_snaps_url: %s, dst_snaps_file: %s',
            excep, traceback.format_exc(), XmlDataLoader.genGameName(game), image_title_url, dst_title_file, image_snaps_url, dst_snaps_file
        )
        DOWNLOAD_FAILED_LIST.append(dst_title_file)
        return False

    try:
        if not image_snaps_url:
            return False

        if use_socks5_proxy == 1:
            socks.set_default_proxy(socks.SOCKS5, "127.0.0.1", 1080)
            socket.socket = socks.socksocket
        f = open(dst_snaps_file, 'wb')
        r = requests.get(image_snaps_url)
        if r.status_code != 200:
            os.remove(image_snaps_url)
            DOWNLOAD_FAILED_LIST.append(dst_snaps_file)
            logging.error(
                'down load image failed. title: %s, image_title_url: %s, dst_title_file: %s, image_snaps_url: %s, dst_snaps_file: %s',
                XmlDataLoader.genGameName(game), image_title_url, dst_title_file, image_snaps_url, dst_snaps_file
            )
            return False
        f.write(r.content)
        f.close()

        # 检验下载的文件是否正常，不正常需要删除重新下载
        if not is_valid_image(dst_snaps_file):
            os.remove(dst_snaps_file)
            DOWNLOAD_FAILED_LIST.append(dst_snaps_file)

    except Exception as excep:
        logging.error(
            'down load image failed. excep: %s, traceback: %s, title: %s, image_title_url: %s, dst_title_file: %s, image_snaps_url: %s, dst_snaps_file: %s',
            excep, traceback.format_exc(), XmlDataLoader.genGameName(game), image_title_url, dst_title_file, image_snaps_url, dst_snaps_file
        )
        DOWNLOAD_FAILED_LIST.append(dst_snaps_file)
        return False

def check_and_download_by_crc(use_socks5_proxy, crc, dst_title_file, dst_snaps_file):
    if os.path.exists(dst_title_file) and os.path.exists(dst_snaps_file):
        return True
    helper = ScreenScraperHelper(use_socks5_proxy)
    image_title_url, image_snaps_url = helper.getGameImageUrls(crc)
    if not image_title_url:
        DOWNLOAD_FAILED_LIST.append(dst_title_file)
    if not image_snaps_url:
        DOWNLOAD_FAILED_LIST.append(dst_snaps_file)
    return do_download(use_socks5_proxy, image_title_url, image_snaps_url, dst_title_file, dst_snaps_file)

def check_and_download_by_name(use_socks5_proxy, name, dst_title_file, dst_snaps_file):
    if os.path.exists(dst_title_file) and os.path.exists(dst_snaps_file):
        return True
    helper = ScreenScraperHelper(use_socks5_proxy)
    image_title_url, image_snaps_url = helper.getGameImageUrlsByName(name)
    if not image_title_url:
        DOWNLOAD_FAILED_LIST.append(dst_title_file)
    if not image_snaps_url:
        DOWNLOAD_FAILED_LIST.append(dst_snaps_file)
    return do_download(use_socks5_proxy, image_title_url, image_snaps_url, dst_title_file, dst_snaps_file)


def check_and_download_by_image_number(use_socks5_proxy, imageNumber, dst_title_file, dst_snaps_file):
    if os.path.exists(dst_title_file) and os.path.exists(dst_snaps_file):
        return True

    imageNumber = int(imageNumber)
    calcImageNumber = imageNumber
    if (imageNumber == 0):
        calcImageNumber = 1
    count = 500
    low = ((calcImageNumber - 1) // count) * count + 1
    high = ((calcImageNumber - 1) // count) * count + count
    imageFolder = '%s-%s' % (low, high)
    image_title_url = '%s%s/%sa.png' % (game['imURL'], imageFolder, imageNumber)
    image_snaps_url = '%s%s/%sb.png' % (game['imURL'], imageFolder, imageNumber)
    if imageNumber == 368:
        print('imageNumber: %s, afile: %s, bfile: %s' % (imageNumber, image_title_url, image_snaps_url))
    return do_download(use_socks5_proxy, image_title_url, image_snaps_url, dst_title_file, dst_snaps_file)


def try_multi_check_and_download(params):
    # 循环多次
    count = 2
    use_socks5_proxy = 0
    if 'use_socks5_proxy' in params:
        use_socks5_proxy = params['use_socks5_proxy']
    for _ in range(1, count):
        if params['by_crc'] == 1:
            succ = check_and_download_by_crc(use_socks5_proxy, params['crc'], params['afile'], params['bfile'])
        elif params['by_name'] == 1:
            succ = check_and_download_by_name(use_socks5_proxy, params['name'], params['afile'], params['bfile'])
        else:
            succ = check_and_download_by_image_number(use_socks5_proxy, params['imageNumber'], params['afile'], params['bfile'])
        if succ:
            break


if __name__ == "__main__":
    from optparse import OptionParser
    usage = ''
    parser = OptionParser(usage)
    parser.add_option("--dat")
    parser.add_option("--ext")
    parser.add_option("--dst_dir")
    parser.add_option("--user_release_number")
    parser.add_option("--by_crc")
    parser.add_option("--by_name")
    parser.add_option("--thread_num")
    parser.add_option("--use_socks5_proxy")

    (options, args) = parser.parse_args()

    if not options.ext:
        options.ext = '.zip'

    if not options.dst_dir:
        options.dst_dir = '.'

    if not options.user_release_number:
        options.user_release_number = 0
    else:
        options.user_release_number = int(options.user_release_number)

    if not options.by_crc:
        options.by_crc = 1
    else:
        options.by_crc = int(options.by_crc)

    if not options.by_name:
        options.by_name = 0
    else:
        options.by_name = int(options.by_name)

    if not options.thread_num:
        options.thread_num = 4
    else:
        options.thread_num = int(options.thread_num)

    if not options.use_socks5_proxy:
        options.use_socks5_proxy = 0
    else:
        options.use_socks5_proxy = int(options.use_socks5_proxy)

    # 计算xml-data文件目录
    parent_path = os.path.dirname(options.dat)
    logger.info('parent_path: %s', parent_path)

    xml_data_loader = XmlDataLoader()
    data = xml_data_loader.load(options.dat)

    logger.info('生成缩略图:')
    index = 0
    image_count = 500
    pbar = tqdm(data['game_list'], ascii=True)
    threads = []
    for game in pbar:
        index = index + 1
        # if index > 10:
        #     break

        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        calcNumber = game['imageNumber']
        if calcNumber == 0:
            calcNumber = 1
        low_number = ((calcNumber - 1) // image_count) * image_count + 1
        high_number = ((calcNumber - 1) // image_count) * image_count + image_count
        number_dir = '%s-%s' % (low_number, high_number)
        imgs_dir = os.path.join(options.dst_dir, number_dir)
        mkdirs(imgs_dir)

        # 默认是通过xml文件去下载图片，如果图片没有下载链接，则用本地目录
        afile = os.path.join(imgs_dir, str(game['imageNumber']) + 'a.png')
        bfile = os.path.join(imgs_dir, str(game['imageNumber']) + 'b.png')
        imageNumber = game['imageNumber']
        if options.user_release_number == 1:
            imageNumber = game['releaseNumber']

        if os.path.exists(afile) and os.path.exists(bfile):
            continue

        params = {
          'by_crc': options.by_crc,
          'by_name': options.by_name,
          'crc': game['romCRC'],
          'name': game['title'],
          'imageNumber': imageNumber,
          'afile': afile,
          'bfile': bfile,
          'use_socks5_proxy': options.use_socks5_proxy,
        }
        t = threading.Thread(target=try_multi_check_and_download, args=(params,))
        threads.append(t)
        if len(threads) >= options.thread_num:
            for t in threads:
                t.start()
            for t in threads:
                t.join()
            threads.clear()
    pbar.close()

    # 还有剩余任务没有处理
    if len(threads) >= 0:
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        threads.clear()

    for item in DOWNLOAD_FAILED_LIST:
        print('failed image: ', item)
