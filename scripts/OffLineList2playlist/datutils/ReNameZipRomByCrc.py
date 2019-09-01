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
    usage = 'python -m datutils.ReNameZipRomByCrc --roms='
    parser = OptionParser(usage)
    parser.add_option("--roms")

    (options, args) = parser.parse_args()

    # 获取rom列表
    rom_file_list = Utils.listdir(options.roms)

    # 遍历街机
    index = -1
    pbar = tqdm(rom_file_list, ascii=True)
    for filename in pbar:
        # if index > 1000:
        #     break

        pbar.set_description("处理 %s" % filename)
        pbar.update()

        try:
            crc = Utils.calc_zip_inner_crc32(filename).upper()
            dirname = os.path.dirname(filename)
            Utils.rename_zip_inner_file(filename, crc)
            dstfile = os.path.join(dirname, crc + ".zip")
            os.rename(filename, dstfile)
        except :
            pass
