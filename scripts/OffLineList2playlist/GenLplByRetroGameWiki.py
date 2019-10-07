# encoding=utf8
import shutil
import os
# import json
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


def get_game_list_from_retrogamewiki_page(platform, offset, count):
    url = 'http://wekafei.cn/api/RetroGameWiki/gameList?platform=%s&offset=%s&count=%s' % (
        platform, offset, count,
    )
    jdata = requests.get(url).json()
    games = jdata['data']['games']
    return games


def get_game_list_from_retrogamewiki(platform):
    xlist = list()
    offset = 0
    count = 1000
    while True:
        page_games = get_game_list_from_retrogamewiki_page(platform, offset, count)
        for game in page_games:
            xlist.append(game)
        if len(page_games) < count:
            break
        offset = offset + count
    return xlist


def mkdirs(path):
    isExists = os.path.exists(path)
    if not isExists:
        os.makedirs(path)


def check_and_download(from_url, dst_file):
    # logging.info('check_and_download log req info. from_url: %s, dst_file: %s',
    #              from_url, dst_file)
    if os.path.exists(dst_file):
        return

    r = requests.get(from_url)
    if r.status_code != 200:
        logging.error(
            'down load image failed. from_url: %s, dst_file: %s',
            from_url, dst_file
        )
        return
    f = open(dst_file, 'wb')
    f.write(r.content)
    f.close()


# def copy_local_imgs(game, local_imgs_dir, dst_title_file, dst_snaps_file):
#     low_number = (game['imageNumber'] // image_count) * image_count + 1
#     high_number = (game['imageNumber'] // image_count) * image_count + image_count
#     image_folder = os.path.join(local_imgs_dir, game['imFolder'])
#     image_folder = os.path.join(image_folder, '%s-%s' % (low_number, high_number))
#     src_title_file = os.path.join(image_folder, str(game['imageNumber']) + 'a.png')
#     src_snaps_file = os.path.join(image_folder, str(game['imageNumber']) + 'b.png')

#     # logging.info(
#     #     'src_title_file: %s, dst_title_file: %s, src_snaps_file: %s, dst_snaps_file: %s',
#     #     src_title_file, dst_title_file, src_snaps_file, dst_snaps_file
#     # )
#     if not os.path.exists(src_title_file) or not os.path.exists(src_snaps_file):
#         logging.error(
#             'image not exist. src_title_file: %s, dst_title_file: %s, src_snaps_file: %s, dst_snaps_file: %s',
#             src_title_file, dst_title_file, src_snaps_file, dst_snaps_file
#         )
#         return
#     shutil.copyfile(src_title_file, dst_title_file)
#     shutil.copyfile(src_snaps_file, dst_snaps_file)


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python GenLplByRetroGameWiki.py --platform= --ext='
    parser = OptionParser(usage)
    parser.add_option("--platform")
    parser.add_option("--ext")
    parser.add_option("--output")
    parser.add_option("--only_lpl")

    (options, args) = parser.parse_args()

    if not options.platform:
        print('need platform')
        exit(1)

    if not options.ext:
        print('need ext')
        exit(1)

    if not options.output:
        print('need output')
        exit(1)

    if not options.only_lpl:
        options.only_lpl = 1
    else:
        options.only_lpl = int(options.only_lpl)

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
    # CRC
    # Nintendo - Nintendo 64.lpl

    # 获取列表数据
    games = get_game_list_from_retrogamewiki(options.platform)

    # 生成游戏列表
    index = 0
    logging.info('生成游戏列表:')
    lpl_file = os.path.join(options.output, options.platform + '.lpl')
    lpl_file = open(lpl_file, 'w', encoding='utf-8')
    pbar = tqdm(games)
    for game in pbar:
        index = index + 1
        # if index > 10:
        #     break

        cname = ''
        if 'cname' in game:
            cname = game['cname']

        pbar.set_description("处理 ename: %s, cname: %s, crc32: %s" % (
            game['ename'], cname, game['crc32']
        ))
        pbar.update()

        romlink = '/roms/%s/%s%s' % (options.platform, game['crc32'], options.ext)

        label = '%04d - %s' % (index, game['ename'])
        if cname:
            label = '%04d - %s' % (index, cname)
        lpl_file.write('%s\n%s\n%s\n%s\n%s\n%s\n' % (
            romlink, label, 'DECTET', 'DECTET', game['crc32'], options.platform + '.lpl'
        ))
    lpl_file.close()
    pbar.close()

    if int(options.only_lpl) == 1:
        exit(0)

    logging.info('生成缩略图:')
    index = 0
    dst_title_dir = os.path.join(options.output, options.platform, 'Named_Titles')
    dst_snap_dir = os.path.join(options.output, options.platform, 'Named_Snaps')
    dst_boxart_dir = os.path.join(options.output, options.platform, 'Named_Boxarts')
    mkdirs(dst_title_dir)
    mkdirs(dst_snap_dir)
    mkdirs(dst_boxart_dir)
    pbar = tqdm(games)
    for game in pbar:
        index = index + 1
        # if index > 10:
        #     break

        cname = ''
        if 'cname' in game:
            cname = game['cname']

        pbar.set_description("处理 ename: %s, cname: %s, crc32: %s" % (
            game['ename'], cname, game['crc32']
        ))
        pbar.update()

        if 'thumb' not in game:
            continue

        title_url = game['thumb']['title']
        snap_url = game['thumb']['snap']
        boxart_url = game['thumb']['boxart']
        dst_title_file = os.path.join(dst_title_dir, game['crc32'] + '.png')
        dst_snap_file = os.path.join(dst_snap_dir, game['crc32'] + '.png')
        dst_boxart_file = os.path.join(dst_boxart_dir, game['crc32'] + '.png')
        # print('title_url: %s, sanp_url: %s, boxart_url: %s, dst_title_file: %s, dst_snap_file: %s, dst_boxart_file: %s',
        #     title_url, snap_url, boxart_url, dst_title_file, dst_snap_file, dst_boxart_file,
        # )
        check_and_download(title_url, dst_title_file)
        check_and_download(snap_url, dst_snap_file)
        check_and_download(boxart_url, dst_boxart_file)
    pbar.close()
