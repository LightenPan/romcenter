# encoding=utf8
import os
from tqdm import tqdm
from utils import Utils


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.ReNameRomByParentDirName --dir='
    parser = OptionParser(usage)
    parser.add_option("--dir")
    parser.add_option("--ext")

    (options, args) = parser.parse_args()

    if not options.ext:
        options.ext = '.iso'

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
        romname = os.path.splitext(basename)[0]
        _, parent_dir_name = os.path.split(parent_dir)
        pbar.set_description("处理 parent_dir: %s, romname: %s" % (parent_dir, romname))
        pbar.update()

        ext = os.path.splitext(rom_file)[-1]
        if ext != options.ext:
            continue

        print('\nbasename: %s, romname: %s, parent_dir: %s, parent_dir_name: %s' % (
            basename, romname, parent_dir, parent_dir_name
        ))
        # 用父目录名字，重命名文件
        if parent_dir != romname:
            new_file = os.path.join(parent_dir, parent_dir_name + options.ext)
            print('file: %s, new_file: %s' % (rom_file, new_file))
            os.rename(rom_file, new_file)
