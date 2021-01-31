# encoding=utf8
import os
import shutil
from tqdm import tqdm
import xml.etree.ElementTree as ET

from XmlDataLoader import XmlDataLoader
from utils import Utils



def mkdirs(path):
    isExists = os.path.exists(path)
    if not isExists:
        os.makedirs(path)


if __name__ == "__main__":
    usage = 'python -m datutils.XmlCopyImagesForLibretro --dat= --old_imgs=output --new_imgs='
    from optparse import OptionParser
    parser = OptionParser(usage)
    parser.add_option("--dat")
    parser.add_option("--old_imgs")
    parser.add_option("--new_imgs")

    (options, args) = parser.parse_args()

    xml_data_loader = XmlDataLoader()
    tree = xml_data_loader.load_xml_tree(options.dat)
    data = xml_data_loader.load(options.dat)

    index = -1
    no_chs_list = list()
    tree_games = tree.findall('games/game')
    pbar = tqdm(tree_games, ascii=True)
    dir_title = os.path.join(options.new_imgs, 'Named_Titles')
    dir_snaps = os.path.join(options.new_imgs, 'Named_Snaps')
    mkdirs(dir_title)
    mkdirs(dir_snaps)
    for game in pbar:
        index = index + 1

        name = game.find('title').text
        pbar.set_description("处理 %s" % name)
        pbar.update()

        old_image_number = game.find('imageNumber').text
        releaseNumber = game.find('releaseNumber').text
        releaseNumber = game.find('releaseNumber').text
        crc32 = game.find('files').find('romCRC').text

        # 拷贝图片
        afile, bfile = Utils.genImageFiles(old_image_number, options.old_imgs)
        img_title = os.path.join(dir_title, '%s.png' % (crc32))
        img_snaps = os.path.join(dir_snaps, '%s.png' % (crc32))
        shutil.copy(afile, img_title)
        shutil.copy(bfile, img_snaps)
    pbar.close()
