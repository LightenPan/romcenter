# encoding=utf8
import os
from tqdm import tqdm
from utils import Utils


def zip_dir_files(srcPath, dstName):
    import zipfile
    f = zipfile.ZipFile(dstName, 'w', zipfile.ZIP_DEFLATED)
    for root, dirs, files in os.walk(srcPath):
        for file in files:
            f.write(file)
    f.close()


def extract_7z(file):
    parent_dir, basename = os.path.split(file)
    filename = os.path.splitext(basename)[0]
    rom_dir = os.path.join(parent_dir, filename)
    os.system('7z x "%s" -y -aos -o"%s"' % (file, rom_dir))
    return rom_dir


def do_tran(file):
    parent_dir, basename = os.path.split(file)
    filename = os.path.splitext(basename)[0]
    dst_file = os.path.join(parent_dir, filename + '.zip')
    rom_dir = extract_7z(file)
    zip_dir_files(rom_dir, dst_file)
    os.rmdir(rom_dir)


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.Bt7zToZip --roms= --ext=.7z'
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

        pbar.set_description("?? %s" % file)
        pbar.update()

        do_tran(file)
