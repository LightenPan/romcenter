# encoding=utf8
import os
import shutil
from tqdm import tqdm

from XmlDataLoader import XmlDataLoader
from utils import Utils


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.CopyExistRom --dat= --src= --dst='
    parser = OptionParser(usage)
    parser.add_option("--dat")
    parser.add_option("--src")
    parser.add_option("--dst")
    parser.add_option("--ext")
    parser.add_option("--by_name")

    (options, args) = parser.parse_args()

    if not options.ext:
        options.ext = '.zip'

    if not options.by_name:
        options.by_name = 0
    else:
        options.by_name = int(options.by_name)

    xml_data_loader = XmlDataLoader()
    data = xml_data_loader.load(options.dat)

    crc_rom_dict = dict()
    rom_list = Utils.listdir(options.src, [options.ext])
    pbar = tqdm(rom_list, ascii=True)
    for file in pbar:
        pbar.set_description("读取文件 %s" % file)
        pbar.update()

        if options.by_name == 1:
            basename = os.path.basename(file)
            name = os.path.splitext(basename)[0]
            crc_rom_dict[name] = file
        else:
            crc = Utils.calc_zip_inner_crc32(file)
            crc_rom_dict[crc] = file

    miss_list = list()
    index = 0
    pbar = tqdm(data['game_list'], ascii=True)
    for game in pbar:
        index = index + 1

        game_name = xml_data_loader.genGameName(game)
        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        if options.by_name == 1:
            crc = game['ori_title']
        else:
            crc = game['romCRC']

        if crc not in crc_rom_dict:
            miss_list.append(game_name)
            continue

        from_file = crc_rom_dict[crc]
        basename = os.path.basename(from_file)
        to_file = os.path.join(options.dst, basename)
        if not os.path.exists(to_file):
            print('from_file: %s, to_file: %s' % (from_file, to_file))
            shutil.copyfile(from_file, to_file)

    for name in miss_list:
        print('miss rom: %s' % (name))
    print('miss rom count: %s' % (len(miss_list)))
