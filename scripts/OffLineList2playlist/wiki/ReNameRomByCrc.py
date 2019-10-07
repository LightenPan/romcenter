# encoding=utf8
import os
import sys
import zlib
import zipfile
from tqdm import tqdm
from utils import Utils
from XmlDataLoader import XmlDataLoader


def gen_rom_file_crc_dict(rom_file_list, start_offset=0):
    xdict = dict()
    pbar = tqdm(rom_file_list, ascii=True)
    for file in pbar:
        pbar.set_description("读取文件CRC %s" % file)
        pbar.update()

        crc = Utils.calc_file_crc32(file, start_offset)
        if crc == '':
            continue
        xdict[crc] = file
    pbar.close()
    return xdict


def gen_rom_file_zip_inner_crc_dict(rom_file_list, start_offset=0):
    xdict = dict()
    pbar = tqdm(rom_file_list, ascii=True)
    for file in pbar:
        pbar.set_description("读取zip内的文件CRC %s" % file)
        pbar.update()

        crc = Utils.calc_zip_inner_crc32(file, start_offset)
        if crc == '':
            continue
        xdict[crc.upper()] = file
    pbar.close()
    return xdict


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m wiki.ReNameRomByCrc --dir= --ext='
    parser = OptionParser(usage)
    parser.add_option("--dir")
    parser.add_option("--ext")

    (options, args) = parser.parse_args()

    if not options.dir:
        print('need dir')
        exit(1)

    if not options.ext:
        print('need ext')
        exit(1)

    # 获取rom列表
    rom_file_list = Utils.listdir(options.dir, [options.ext])

    # 遍历街机
    fail_list = list()
    index = -1
    pbar = tqdm(rom_file_list)
    for rom_file in pbar:
        if index > 10:
            break

        pbar.set_description("处理 %s" % rom_file)
        pbar.update()

        parent_dir, basename = os.path.split(rom_file)
        filename = os.path.splitext(basename)[0]
        crc32 = Utils.calc_file_crc32(rom_file)
        if crc32 != filename:
            new_rom_file = os.path.join(parent_dir, crc32 + options.ext)
            os.rename(rom_file, new_rom_file)
