# encoding=utf8
import os
from tqdm import tqdm
from utils import Utils


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.LplFixGameRom --lpl=NAOMI_100af.lpl --roms='
    parser = OptionParser(usage)
    parser.add_option("--lpl")
    parser.add_option("--roms")
    parser.add_option("--output")

    (options, args) = parser.parse_args()

    if not options.lpl:
        print("need lpl")
        exit(1)

    if not options.roms:
        print("need roms")
        exit(1)

    # 读取LPL
    game_list = Utils.loadLplFile(options.lpl)

    # 遍历
    succ_list = list()
    fail_list = list()
    new_game_list = list()
    index = -1
    pbar = tqdm(game_list)
    for game in pbar:
        index = index + 1
        # if index > 10:
        #     break

        basename = os.path.basename(game['path'])
        pbar.set_description("处理 %s" % basename)
        pbar.update()

        # 到roms目录查找是否存在，如果不存在就认为是错误的
        dst_file = os.path.join(options.roms, basename)
        # 将crc改为游戏名
        if not os.path.exists(dst_file):
            fail_list.append(game)
        else:
            succ_list.append(game)

    if options.output:
        base_name = os.path.basename(options.lpl)
        dst_lpl_file = os.path.join(options.output, base_name)
        lpl_file = open(dst_lpl_file, 'w', encoding='utf-8')
        for game in succ_list:
            lpl_file.write(
                '%s\n%s\n%s\n%s\n%s\n%s\n' % (
                    game['path'], game['label'], game['core_name'],
                    game['core_path'], game['crc'], game['dbname'],
                )
            )
        lpl_file.close()
        pbar.close()

    for item in fail_list:
        print("无效rom记录：label: %s" % (item['label']))
    print("无效总数：%s" % (len(fail_list)))
