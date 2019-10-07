# encoding=utf8
import os
import shutil
from tqdm import tqdm
from utils import Utils


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.MoveRomByExt --dir= --dst='
    parser = OptionParser(usage)
    parser.add_option("--dir")
    parser.add_option("--dst")
    parser.add_option("--ext")

    (options, args) = parser.parse_args()

    if not options.ext:
        options.ext = '.iso'

    if not options.dir:
        print('need dir')
        exit(1)

    if not options.dst:
        print('need dst')
        exit(1)

    # 获取rom列表
    rom_file_list = Utils.listdir(options.dir)

    # 遍历街机
    fail_list = list()
    index = -1
    pbar = tqdm(rom_file_list)
    for rom_file in pbar:
        index = index + 1
        # if index > 1:
        #     break

        parent_dir, basename = os.path.split(rom_file)
        pbar.set_description("处理 rom_file: %s" % (rom_file))
        pbar.update()

        ext = os.path.splitext(rom_file)[-1]
        if ext != options.ext:
            continue

        new_file = os.path.join(options.dst, basename)
        print('\nfile: %s, new_file: %s' % (rom_file, new_file))
        shutil.move(rom_file, new_file)
