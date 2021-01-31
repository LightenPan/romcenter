# encoding=utf8
import os
import sys
from tqdm import tqdm
from utils import Utils
import subprocess


def calc_crc32(file):
    cmd = '7z.exe h "%s"' % (file)
    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    crc32 = ''
    for line in p.stdout.readlines():
        item = line.decode('gbk')
        kvs = item.split('  for data:')
        if len(kvs) != 2:
            continue
        # print('item: ', item)
        crc32 = kvs[1].strip(' \r\n')
    return crc32.upper()


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.ReFileByCrcWin --roms= --ext='
    parser = OptionParser(usage)
    parser.add_option("--roms")
    parser.add_option("--ext")
    parser.add_option("--only_checkname")

    (options, args) = parser.parse_args()

    if not options.roms:
        print('need roms')
        exit(1)

    if not options.ext:
        print('need ext')
        exit(1)

    if not options.only_checkname:
        options.only_checkname = 0
    else:
        options.only_checkname = int(options.only_checkname)

    # 获取rom列表
    rom_file_list = Utils.listdir(options.roms, [options.ext])

    # 遍历街机
    check_list = list()
    index = -1
    pbar = tqdm(rom_file_list)
    for file in pbar:
        # if index > 1000:
        #     break

        pbar.set_description("处理 %s" % file)
        pbar.update()

        parent_dir, basename = os.path.split(file)
        crc = calc_crc32(file)
        if not crc:
            continue

        dstfile = os.path.join(parent_dir, crc + options.ext)
        if options.only_checkname == 1:
            filename = os.path.splitext(basename)[0]
            if crc != filename:
                check_list.append(basename)
        else:
            if not os.path.exists(dstfile):
                os.rename(file, dstfile)

    for item in check_list:
        print("filename not equal crc32: %s" % (item))
