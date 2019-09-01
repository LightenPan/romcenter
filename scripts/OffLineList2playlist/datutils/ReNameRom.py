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
    for file in rom_file_list:
        crc = Utils.calc_file_crc32(file)
        if crc == '':
            continue
        xdict[crc.upper()] = file
    return xdict


def gen_rom_file_zip_inner_crc_dict(rom_file_list):
    xdict = dict()
    for file in rom_file_list:
        crc = Utils.calc_zip_inner_crc32(file)
        if crc == '':
            continue
        xdict[crc.upper()] = file
    return xdict


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.ReNameRom --dat= --roms='
    parser = OptionParser(usage)
    parser.add_option("--dat")
    parser.add_option("--roms")
    parser.add_option("--calc_crc_by_zip_inner_file")
    parser.add_option("--fmt_filename")
    parser.add_option("--fmt_inner_zip")

    (options, args) = parser.parse_args()

    if not options.fmt_filename:
        options.fmt_filename = '%c'

    if not options.fmt_inner_zip:
        options.fmt_inner_zip = '%c'

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
        rom_file_crc_dict =gen_rom_file_crc_dict(rom_file_list)

    # 遍历街机
    index = -1
    pbar = tqdm(game_list, ascii=True)
    for game in pbar:
        # if index > 1000:
        #     break

        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        crc = xml_data_loader.genGameCrc(game)
        if crc not in rom_file_crc_dict:
            continue

        old_file_name = rom_file_crc_dict[crc]
        dirname = os.path.dirname(old_file_name)
        ext = os.path.splitext(old_file_name)[-1]
        format_title = xml_data_loader.genFromFmt(game, options.fmt_filename)
        new_file_name = os.path.join(dirname, format_title + ext)
        if options.fmt_inner_zip:
            zip_inner_name = xml_data_loader.genFromFmt(game, options.fmt_inner_zip)
            Utils.rename_zip_inner_file(old_file_name, zip_inner_name)

        if options.fmt_filename:
            os.rename(old_file_name, new_file_name)
