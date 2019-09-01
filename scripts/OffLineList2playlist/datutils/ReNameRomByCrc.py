# encoding=utf8
import os
import sys
import zlib
import zipfile
from tqdm import tqdm
from utils import Utils
from XmlDataLoader import XmlDataLoader


def gen_rom_file_crc_dict(rom_file_list):
    xdict = dict()
    pbar = tqdm(rom_file_list, ascii=True)
    for file in pbar:
        pbar.set_description("读取文件CRC %s" % file)
        pbar.update()

        crc = Utils.calc_file_crc32(file)
        if crc == '':
            continue
        xdict[crc] = file
    pbar.close()
    return xdict


def gen_rom_file_zip_inner_crc_dict(rom_file_list):
    xdict = dict()
    pbar = tqdm(rom_file_list, ascii=True)
    for file in pbar:
        pbar.set_description("读取zip内的文件CRC %s" % file)
        pbar.update()

        crc = Utils.calc_zip_inner_crc32(file)
        if crc == '':
            continue
        xdict[crc.upper()] = file
    pbar.close()
    return xdict


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.ReNameRomByCrc --dat= --roms='
    parser = OptionParser(usage)
    parser.add_option("--dat")
    parser.add_option("--roms")
    parser.add_option("--calc_crc_by_zip_inner_file")
    parser.add_option("--fmt_filename")
    parser.add_option("--fmt_inner_zip")

    (options, args) = parser.parse_args()

    if not options.calc_crc_by_zip_inner_file:
        options.calc_crc_by_zip_inner_file = 1
    else:
        options.calc_crc_by_zip_inner_file = int(options.calc_crc_by_zip_inner_file)

    # 读取offlinelist数据
    xml_data_loader = XmlDataLoader()
    data = xml_data_loader.load(options.dat)
    game_list = data['game_list']

    # 获取rom列表
    rom_file_list = Utils.listdir(options.roms)

    # 如果是命名zip，则需要读取zip包的crc，这是要求zip包内只有一个文件
    # 否则直接命名文件
    if options.calc_crc_by_zip_inner_file == 1:
        rom_file_crc_dict = gen_rom_file_zip_inner_crc_dict(rom_file_list)
    else:
        rom_file_crc_dict = gen_rom_file_crc_dict(rom_file_list)

    # 遍历街机
    fail_list = list()
    index = -1
    pbar = tqdm(game_list, ascii=True)
    for game in pbar:
        # if index > 1000:
        #     break

        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        crc = xml_data_loader.genGameCrc(game)
        if crc not in rom_file_crc_dict:
            fail_list.append(xml_data_loader.genGameName(game))
            continue

        xml_crc = xml_data_loader.genFromFmt(game, '%c')
        old_file_name = rom_file_crc_dict[crc]
        dirname = os.path.dirname(old_file_name)
        ext = os.path.splitext(old_file_name)[-1]
        new_file_name = os.path.join(dirname, xml_crc + ext)

        if options.calc_crc_by_zip_inner_file == 1:
            succ = Utils.rename_zip_inner_file(old_file_name, xml_crc)
            if not succ:
                fail_list.append(xml_data_loader.genGameName(game))

        if old_file_name != new_file_name and not os.path.exists(new_file_name):
            os.rename(old_file_name, new_file_name)

    for item in fail_list:
        print('failed item. %s' % item)
    print('failed len. %s' % len(fail_list))
