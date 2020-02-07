# encoding=utf8
import os
import py7zlib
import zipfile
from tqdm import tqdm
from utils import Utils


def get_cue_filename_from_p7z(file):
    fp = open(file, 'rb')
    #生成一个archive对象
    archive = py7zlib.Archive7z(fp)

    #读取文件中所有的文件名
    filename = None
    names = archive.getnames()
    for name in names:
        game_name = os.path.splitext(name)[0]
        ext = os.path.splitext(name)[-1]
        if ext == '.cue':
            filename = game_name
            break
    fp.close()
    return filename


def get_cue_filename_from_zip(file):
    source = zipfile.ZipFile(file, 'r')
    filename = None
    for item in source.filelist:
        game_name = os.path.splitext(item.filename)[0]
        ext = os.path.splitext(item.filename)[-1]
        if ext == '.cue':
            filename = game_name
            break
    source.close()
    return filename


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.ReName7zFile --roms= --ext=.7z'
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

    rom_list = Utils.listdir(options.roms, [options.ext])

    index = 0
    pbar = tqdm(rom_list)
    for file in pbar:
        index = index + 1

        pbar.set_description("处理 %s" % file)
        pbar.update()
        parent_dir, basename = os.path.split(file)
        filename = os.path.splitext(basename)[0]
        ext = os.path.splitext(basename)[-1]
        if ext == '.7z':
            game_name = get_cue_filename_from_p7z(file)
        elif ext == '.zip':
            game_name = get_cue_filename_from_zip(file)
        else:
            continue
        if game_name != filename:
            new_file = os.path.join(parent_dir, game_name + ext)
            os.rename(file, new_file)
