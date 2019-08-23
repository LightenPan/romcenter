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


def check_and_download(game, dst_title_file, dst_snaps_file):
    imageNumber = game['imageNumber']
    count = 500
    low = (imageNumber // count) * count + 1
    high = (imageNumber // count) * count + 500
    imageFolder = '%s-%s' % (low, high)
    image_title_url = '%s%s/%sa.png' % (game['imURL'], imageFolder, imageNumber)
    image_snaps_url = '%s%s/%sb.png' % (game['imURL'], imageFolder, imageNumber)
    if os.path.exists(dst_title_file) and os.path.exists(dst_snaps_file):
        return

    # logging.info('title: %s, image_title_url: %s, dst_title_file: %s, image_snaps_url: %s, dst_snaps_file: %s',
    #     XmlDataLoader.genGameName(game),
    #     image_title_url, dst_title_file,
    #     image_snaps_url, dst_snaps_file)

    f = open(dst_title_file, 'wb')
    r = requests.get(image_title_url)
    if r.status_code != 200:
        logging.error(
            'down load image failed. title: %s, image_title_url: %s, dst_title_file: %s, image_snaps_url: %s, dst_snaps_file: %s',
            XmlDataLoader.genGameName(game), image_title_url, dst_title_file, image_snaps_url, dst_snaps_file
        )
        return
    f.write(r.content)
    f.close()

    f = open(dst_snaps_file, 'wb')
    r = requests.get(image_snaps_url)
    if r.status_code != 200:
        logging.error(
            'down load image failed. title: %s, image_title_url: %s, dst_title_file: %s, image_snaps_url: %s, dst_snaps_file: %s',
            XmlDataLoader.genGameName(game), image_title_url, dst_title_file, image_snaps_url, dst_snaps_file
        )
        return
    f.write(r.content)
    f.close()


def copy_local_imgs(game, local_imgs_dir, dst_title_file, dst_snaps_file):
    low_number = (game['imageNumber'] // image_count) * image_count + 1
    high_number = (game['imageNumber'] // image_count) * image_count + image_count
    image_folder = os.path.join(local_imgs_dir, game['imFolder'])
    image_folder = os.path.join(image_folder, '%s-%s' % (low_number, high_number))
    src_title_file = os.path.join(image_folder, str(game['imageNumber']) + 'a.png')
    src_snaps_file = os.path.join(image_folder, str(game['imageNumber']) + 'b.png')

    # logging.info(
    #     'src_title_file: %s, dst_title_file: %s, src_snaps_file: %s, dst_snaps_file: %s',
    #     src_title_file, dst_title_file, src_snaps_file, dst_snaps_file
    # )
    if not os.path.exists(src_title_file) or not os.path.exists(src_snaps_file):
        logging.error(
            'image not exist. src_title_file: %s, dst_title_file: %s, src_snaps_file: %s, dst_snaps_file: %s',
            src_title_file, dst_title_file, src_snaps_file, dst_snaps_file
        )
        return
    shutil.copyfile(src_title_file, dst_title_file)
    shutil.copyfile(src_snaps_file, dst_snaps_file)


if __name__ == "__main__":
    from optparse import OptionParser
    usage = ''
    parser = OptionParser(usage)
    parser.add_option("--dat")
    parser.add_option("--prex")
    parser.add_option("--lpl")
    parser.add_option("--ext")
    parser.add_option("--output")
    parser.add_option("--only_lpl")
    parser.add_option("--title_use_comment")
    parser.add_option("--releaseNumber_use_imageNumber")
    parser.add_option("--local_imgs_dir")
    parser.add_option("--rom_title")
    parser.add_option("--core_base_dir")
    parser.add_option("--core_file_name")
    parser.add_option("--core_name")
    parser.add_option("--rom_name_is_number")
    parser.add_option("--rom_name_is_crc")

    (options, args) = parser.parse_args()

    if not options.ext:
        options.ext = '.zip'

    if not options.output:
        options.output = '.'

    if not options.only_lpl:
        options.only_lpl = 1

    if not options.title_use_comment:
        options.title_use_comment = 0

    if not options.releaseNumber_use_imageNumber:
        options.releaseNumber_use_imageNumber = 0

    if not options.core_base_dir:
        options.core_base_dir = '/tmp/cores/'

    if not options.core_file_name:
        core_path = 'DETECT'
    else:
        core_path = os.path.join(options.core_base_dir, options.core_file_name)

    if not options.core_name:
        options.core_name = 'DETECT'

    if not options.rom_name_is_number:
        options.rom_name_is_number = 0
    else:
        options.rom_name_is_number = int(options.rom_name_is_number)

    if not options.rom_name_is_crc:
        options.rom_name_is_crc = 0
    else:
        options.rom_name_is_crc = int(options.rom_name_is_crc)

    if not options.prex:
        options.prex = '/storage/roms/%s/' % (options.lpl)
    else:
        options.prex = '%s/%s/' % (options.prex, options.lpl)

    # 计算xml-data文件目录
    parent_path = os.path.dirname(options.dat)
    logging.info('parent_path: %s', parent_path)

    config = {
        'title_use_comment': int(options.title_use_comment),
        'releaseNumber_use_imageNumber': int(options.releaseNumber_use_imageNumber),
        'rom_title': options.rom_title,
    }
    xml_data_loader = XmlDataLoader()
    data = xml_data_loader.load(options.dat, config)

    # playlist格式1
    # /storage/roms/n64/Legend of Zelda, The - Ocarina of Time (USA).n64
    # Legend of Zelda, The - Ocarina of Time (USA)
    # /tmp/cores/mupen64plus_libretro.so
    # Nintendo 64 (Mupen64Plus)
    # EC95702D|crc
    # Nintendo - Nintendo 64.lpl

    # playlist格式2
    # /storage/roms/n64/Legend of Zelda, The - Ocarina of Time (USA).n64
    # Legend of Zelda, The - Ocarina of Time (USA)
    # DETECT
    # DETECT
    # DETECT
    # Nintendo - Nintendo 64.lpl

    # 生成游戏列表
    mkdirs(options.output)
    logging.info('生成游戏列表:')
    lpl_file = open(options.output + os.path.sep + options.lpl + '.lpl', 'w', encoding='utf-8')
    pbar = tqdm(data['game_list'], ascii=True)
    for game in pbar:
        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        if options.rom_name_is_number == 1:
            romlink = '%s%s%s' % (options.prex, xml_data_loader.genGameNum(game), options.ext)
            # logging.info('%s\n%s\n%s\n%s\n%s\n%s', romlink, xml_data_loader.genGameNum(game), 'DETECT', 'DETECT', 'DETECT', options.lpl + '.lpl')
        elif options.rom_name_is_crc == 1:
            romlink = '%s%s%s' % (options.prex, xml_data_loader.genGameCrc(game), options.ext)
            # logging.info('%s\n%s\n%s\n%s\n%s\n%s', romlink, xml_data_loader.genGameCrc(game), 'DETECT', 'DETECT', 'DETECT', options.lpl + '.lpl')
        else:
            romlink = '%s%s%s' % (options.prex, xml_data_loader.genGameName(game), options.ext)
            # logging.info('%s\n%s\n%s\n%s\n%s\n%s', romlink, xml_data_loader.genGameNum(game), 'DETECT', 'DETECT', 'DETECT', options.lpl + '.lpl')
        lpl_file.write(
            '%s\n%s\n%s\n%s\n%s\n%s\n' % (romlink, xml_data_loader.genGameName(game), core_path, options.core_name, 'DETECT', options.lpl + '.lpl')
        )
    lpl_file.close()
    pbar.close()

    if int(options.only_lpl) == 1:
        exit(0)

    logging.info('生成缩略图:')
    image_count = 500
    dst_title_dir = options.output + os.path.sep + options.lpl + os.path.sep + 'Named_Titles'
    dst_snaps_dir = options.output + os.path.sep + options.lpl + os.path.sep + 'Named_Snaps'
    mkdirs(dst_title_dir)
    mkdirs(dst_snaps_dir)
    pbar = tqdm(data['game_list'], ascii=True)
    for game in pbar:
        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        # 默认是通过xml文件去下载图片，如果图片没有下载链接，则用本地目录
        if options.rom_name_is_number == 1:
            dst_title_file = os.path.join(dst_title_dir, xml_data_loader.genGameNum(game) + '.png')
            dst_snaps_file = os.path.join(dst_snaps_dir, xml_data_loader.genGameNum(game) + '.png')
        elif options.rom_name_is_crc == 1:
            dst_title_file = os.path.join(dst_title_dir, xml_data_loader.genGameCrc(game) + '.png')
            dst_snaps_file = os.path.join(dst_snaps_dir, xml_data_loader.genGameCrc(game) + '.png')
        else:
            dst_title_file = os.path.join(dst_title_dir, xml_data_loader.genGameName(game) + '.png')
            dst_snaps_file = os.path.join(dst_snaps_dir, xml_data_loader.genGameName(game) + '.png')
        if options.local_imgs_dir:
            copy_local_imgs(game, options.local_imgs_dir, dst_title_file, dst_snaps_file)
        else:
            check_and_download(game, dst_title_file, dst_snaps_file)
    pbar.close()
