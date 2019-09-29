# encoding=utf8
import os
import shutil
from tqdm import tqdm
from utils import Utils


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.LplReNameImage --lpl=NAOMI_100af.lpl --imgs=E:\\100af\\RA全能NAOMI\\RA全能NAOMI\\thumbnails\\NAOMI'
    parser = OptionParser(usage)
    parser.add_option("--lpl")
    parser.add_option("--imgs")
    parser.add_option("--output")
    parser.add_option("--img_use_crc")
    parser.add_option("--img_use_name")

    (options, args) = parser.parse_args()

    if not options.img_use_name:
        options.img_use_name = 1
    else:
        options.img_use_name = int(options.img_use_name)

    # 读取LPL
    game_list = Utils.loadLplFile(options.lpl)
    for item in game_list:
        print(item)

    # 遍历
    new_game_list = list()
    index = -1
    pbar = tqdm(game_list)
    for game in pbar:
        index = index + 1
        # if index > 10:
        #     break

        game_name = os.path.basename(game['path'])
        game_name = os.path.splitext(game_name)[0]
        pbar.set_description("处理 %s" % game_name)
        pbar.update()

        # 将crc改为游戏名
        crc = game['crc']
        if options.img_use_name == 1:
            crc = game_name

        new_item = game
        new_item['crc'] = crc
        new_game_list.append(new_item)

        # 修改游戏截图名字
        src_title = os.path.join(options.imgs, 'Named_Titles', game['label'] + '.png')
        src_snaps = os.path.join(options.imgs, 'Named_Snaps', game['label'] + '.png')
        src_boxarts = os.path.join(options.imgs, 'Named_Boxarts', game['label'] + '.png')

        dst_title = os.path.join(options.imgs, 'Named_Titles', crc + '.png')
        dst_snaps = os.path.join(options.imgs, 'Named_Snaps', crc + '.png')
        dst_boxarts = os.path.join(options.imgs, 'Named_Boxarts', crc + '.png')

        print(src_title)
        print(src_snaps)
        print(src_boxarts)
        print(dst_title)
        print(dst_snaps)
        print(dst_boxarts)

        if os.path.exists(src_title) and not os.path.exists(dst_title):
            shutil.copy(src_title, dst_title)
        if os.path.exists(src_snaps) and not os.path.exists(dst_snaps):
            shutil.copy(src_snaps, dst_snaps)
        if os.path.exists(src_boxarts) and not os.path.exists(dst_boxarts):
            shutil.copy(src_boxarts, dst_boxarts)

    if options.output:
        base_name = os.path.basename(options.lpl)
        dst_lpl_file = os.path.join(options.output, base_name + '_new.lpl')
        lpl_file = open(dst_lpl_file, 'w', encoding='utf-8')
        for game in new_game_list:
            lpl_file.write(
                '%s\n%s\n%s\n%s\n%s\n%s\n' % (
                    game['path'], game['label'], game['core_name'],
                    game['core_path'], game['crc'], game['dbname'],
                )
            )
        lpl_file.close()
        pbar.close()
