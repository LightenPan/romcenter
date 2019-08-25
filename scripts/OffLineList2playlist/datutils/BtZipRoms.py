# encoding=utf8
import os
from tqdm import tqdm
import zipfile

from utils import Utils


def zip_dir(srcPath, dstName):
    import zipfile
    basename = os.path.basename(srcPath)
    f = zipfile.ZipFile(dstName,'w',zipfile.ZIP_DEFLATED)
    f.write(srcPath, basename)
    f.close()


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.BtZipRoms --ext=.nds --roms='
    parser = OptionParser(usage)
    parser.add_option("--roms")
    parser.add_option("--ext")

    (options, args) = parser.parse_args()

    rom_list = Utils.listdir(options.roms, [options.ext])

    miss_image_list = list()
    index = 0
    image_count = 500
    pbar = tqdm(rom_list, ascii=True)
    threads = []
    for file in pbar:
        index = index + 1

        pbar.set_description("处理 %s" % file)
        pbar.update()

        dstname = os.path.splitext(file)[0] + '.zip'
        if os.path.exists(dstname):
            continue
        zip_dir(file, dstname)

