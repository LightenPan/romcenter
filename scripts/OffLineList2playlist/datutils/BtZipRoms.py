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
    parser.add_option("--use_splitext")

    (options, args) = parser.parse_args()

    if not options.use_splitext:
        options.use_splitext = 1
    else:
        options.use_splitext = int(options.use_splitext)

    rom_list = Utils.listdir(options.roms, [options.ext])

    index = 0
    pbar = tqdm(rom_list)
    for file in pbar:
        index = index + 1

        pbar.set_description(u"?? %s" % file)
        pbar.update()

        if options.use_splitext == 1:
            dstname = os.path.splitext(file)[0] + '.zip'
        else:
            dstname = file + '.zip'
        if os.path.exists(dstname):
            continue
        zip_dir(file, dstname)

