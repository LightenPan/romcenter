# encoding=utf8
import os
import sys
from tqdm import tqdm
from utils import Utils


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.ReFileByCrc --roms= --ext='
    parser = OptionParser(usage)
    parser.add_option("--roms")
    parser.add_option("--ext")

    (options, args) = parser.parse_args()

    if not options.roms:
        print('need roms')
        exit(1)

    if not options.ext:
        print('need ext')
        exit(1)

    # 获取rom列表
    rom_file_list = Utils.listdir(options.roms, [options.ext])

    # 遍历街机
    index = -1
    pbar = tqdm(rom_file_list)
    for file in pbar:
        # if index > 1000:
        #     break

        pbar.set_description("处理 %s" % file)
        pbar.update()

        parent_dir, basename = os.path.split(file)
        crc = Utils.calc_file_crc32(file).upper()
        dstfile = os.path.join(parent_dir, crc + options.ext)
        if not os.path.exists(dstfile):
            os.rename(file, dstfile)
