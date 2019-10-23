# encoding=utf-8
import os
import sys
import zlib
import zipfile
from tqdm import tqdm


def zip_if_not_exit(rom_dir, zip_file):
    if os.path.exists(zip_file):
        return

    zipFile = zipfile.ZipFile(zip_file, 'a')
    for root, _, files in os.walk(rom_dir):
        # print(root) #当前目录路径
        # print(dirs) #当前路径下所有子目录
        # print(files) #当前路径下所有非目录子文件
        for item in files:
            rom_file = os.path.join(root, item)
            zipFile.write(rom_file, item, zipfile.ZIP_DEFLATED)
    zipFile.close()


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python redumpRomDir2Zip.py --redump_dir= --zip_dir='
    parser = OptionParser(usage)
    parser.add_option("--redump_dir")
    parser.add_option("--zip_dir")

    (options, args) = parser.parse_args()

    if not options.redump_dir:
        print('need redump dir')
        exit(1)

    if not options.zip_dir:
        print('need zip dir')
        exit(1)

    # 获取rom列表
    rom_dirs = list()
    for root, dirs, files in os.walk(options.redump_dir):
        # print(root) #当前目录路径
        # print(dirs) #当前路径下所有子目录
        # print(files) #当前路径下所有非目录子文件
        for item in dirs:
            rom_dir = os.path.join(root, item)
            rom_dirs.append(rom_dir)

    # 遍历街机
    index = -1
    pbar = tqdm(rom_dirs)
    for rom_dir in pbar:
        # if index > 1000:
        #     break

        pbar.set_description("处理 %s" % rom_dir)
        pbar.update()

        rom_name = os.path.basename(rom_dir)
        zip_file = os.path.join(options.zip_dir, rom_name + '.zip')
        print('rom_name: %s, zip_file: %s' % (rom_name, zip_file))
        zip_if_not_exit(rom_dir, zip_file)
