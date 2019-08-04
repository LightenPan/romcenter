# encoding=utf8
import xml.etree.ElementTree as ET
import shutil
import os
import zipfile
# import json
from XmlDataLoader import XmlDataLoader
from tqdm import tqdm
import requests.api

# 利用logging.basicConfig()打印信息到控制台
import logging
logging.basicConfig(
    format='%(asctime)s [%(levelname)s] [%(pathname)s:%(lineno)d] [%(module)s] [%(funcName)s] >> %(message)s',
    level=logging.DEBUG
)

# 关闭requests的日志
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)


def mkdirs(path):
    isExists = os.path.exists(path)
    if not isExists:
        os.makedirs(path)


def load_xml_from_zip(_zip_file):
    logging.info('_zip_file: %s', _zip_file)
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


def check_and_download(imageNumber, dst_title_file, dst_snaps_file):
    imageNumber = int(imageNumber)
    calcImageNumber = imageNumber
    if (imageNumber == 0):
        calcImageNumber = 1
    count = 500
    low = ((calcImageNumber - 1) // count) * count + 1
    high = ((calcImageNumber - 1) // count) * count + 500
    imageFolder = '%s-%s' % (low, high)
    print(low, high, imageFolder)
    image_title_url = '%s%s/%sa.png' % (game['imURL'], imageFolder, imageNumber)
    image_snaps_url = '%s%s/%sb.png' % (game['imURL'], imageFolder, imageNumber)
    if os.path.exists(dst_title_file) and os.path.exists(dst_snaps_file):
        return True

    # logging.info('title: %s, image_title_url: %s, dst_title_file: %s, image_snaps_url: %s, dst_snaps_file: %s',
    #     XmlDataLoader.genGameName(game),
    #     image_title_url, dst_title_file,
    #     image_snaps_url, dst_snaps_file)

    try:
        f = open(dst_title_file, 'wb')
        r = requests.get(image_title_url)
        if r.status_code != 200:
            logging.error(
                'down load image failed. title: %s, image_title_url: %s, dst_title_file: %s, image_snaps_url: %s, dst_snaps_file: %s',
                XmlDataLoader.genGameName(game), image_title_url, dst_title_file, image_snaps_url, dst_snaps_file
            )
            return False
        f.write(r.content)
        f.close()

    except Exception as excep:
        logging.error(
            'down load image failed. title: %s, image_title_url: %s, dst_title_file: %s, image_snaps_url: %s, dst_snaps_file: %s',
            XmlDataLoader.genGameName(game), image_title_url, dst_title_file, image_snaps_url, dst_snaps_file
        )
        return False

    try:
        f = open(dst_snaps_file, 'wb')
        r = requests.get(image_snaps_url)
        if r.status_code != 200:
            logging.error(
                'down load image failed. title: %s, image_title_url: %s, dst_title_file: %s, image_snaps_url: %s, dst_snaps_file: %s',
                XmlDataLoader.genGameName(game), image_title_url, dst_title_file, image_snaps_url, dst_snaps_file
            )
            return False
        f.write(r.content)
        f.close()

    except Exception as excep:
        logging.error(
            'down load image failed. title: %s, image_title_url: %s, dst_title_file: %s, image_snaps_url: %s, dst_snaps_file: %s',
            XmlDataLoader.genGameName(game), image_title_url, dst_title_file, image_snaps_url, dst_snaps_file
        )
        return False

def try_multi_check_and_download(imageNumber, dst_title_file, dst_snaps_file):
    for _ in range(1, 5):
        succ = check_and_download(imageNumber, dst_title_file, dst_snaps_file)
        if succ:
            break


if __name__ == "__main__":
    from optparse import OptionParser
    usage = ''
    parser = OptionParser(usage)
    parser.add_option("--offlinelist_xml")
    parser.add_option("--ext")
    parser.add_option("--dst_dir")
    parser.add_option("--user_release_number")

    (options, args) = parser.parse_args()

    if not options.ext:
        options.ext = '.zip'

    if not options.dst_dir:
        options.dst_dir = '.'

    if not options.user_release_number:
        options.user_release_number = 0
    else:
        options.user_release_number = int(options.user_release_number)

    # 计算xml-data文件目录
    parent_path = os.path.dirname(options.offlinelist_xml)
    logging.info('parent_path: %s', parent_path)

    xml_data_loader = XmlDataLoader()
    data = xml_data_loader.load(options.offlinelist_xml)

    logging.info('生成缩略图:')
    image_count = 500
    pbar = tqdm(data['game_list'])
    for game in pbar:
        pbar.set_description("处理缩略图 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        low_number = (game['imageNumber'] // image_count) * image_count + 1
        high_number = (game['imageNumber'] // image_count) * image_count + image_count
        number_dir = '%s-%s' % (low_number, high_number)
        imgs_dir = os.path.join(options.dst_dir, number_dir)
        mkdirs(imgs_dir)

        # 默认是通过xml文件去下载图片，如果图片没有下载链接，则用本地目录
        afile = os.path.join(imgs_dir, str(game['imageNumber']) + 'a.png')
        bfile = os.path.join(imgs_dir, str(game['imageNumber']) + 'b.png')
        imageNumber = game['imageNumber']
        if options.user_release_number == 1:
            imageNumber = game['releaseNumber']
        try_multi_check_and_download(imageNumber, afile, bfile)
    pbar.close()
