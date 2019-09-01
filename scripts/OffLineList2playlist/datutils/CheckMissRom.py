# encoding=utf8
import os
from tqdm import tqdm

from XmlDataLoader import XmlDataLoader
from utils import Utils


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.CheckMissRom --dat= --roms='
    parser = OptionParser(usage)
    parser.add_option("--dat")
    parser.add_option("--roms")
    parser.add_option("--ext")

    (options, args) = parser.parse_args()

    if not options.ext:
        options.ext = '.zip'

    xml_data_loader = XmlDataLoader()
    data = xml_data_loader.load(options.dat)

    crc_rom_dict = dict()
    rom_list = Utils.listdir(options.roms, [options.ext])
    pbar = tqdm(rom_list, ascii=True)
    for file in pbar:
        pbar.set_description("读取文件 %s" % file)
        pbar.update()

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

        crc = game['romCRC']
        if crc not in crc_rom_dict:
            miss_list.append(game_name)

    for name in miss_list:
        print('miss rom: %s' % (name))
    print('miss rom count: %s' % (len(miss_list)))
