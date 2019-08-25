# encoding=utf8
import os
import shutil
from tqdm import tqdm
import xml.etree.ElementTree as ET

from XmlDataLoader import XmlDataLoader
from utils import Utils


if __name__ == "__main__":
    usage = 'python -m datutils.XmlReCountAndCopyImages --dat= --old_imgs=output'
    from optparse import OptionParser
    parser = OptionParser(usage)
    parser.add_option("--dat")
    parser.add_option("--old_imgs")
    parser.add_option("--new_imgs")
    parser.add_option("--output_xml")

    (options, args) = parser.parse_args()

    xml_data_loader = XmlDataLoader()
    tree = xml_data_loader.load_xml_tree(options.dat)
    data = xml_data_loader.load(options.dat)

    index = -1
    no_chs_list = list()
    tree_games = tree.findall('games/game')
    pbar = tqdm(tree_games, ascii=True)
    for game in pbar:
        index = index + 1

        name = game.find('title').text
        pbar.set_description("处理 %s" % name)
        pbar.update()

        old_image_number = game.find('imageNumber').text
        releaseNumber = game.find('releaseNumber').text
        game.find('imageNumber').text = releaseNumber

        # 拷贝图片
        afile, bfile = Utils.genImageFiles(old_image_number, options.old_imgs)
        new_afile, new_bfile = Utils.genImageFiles(releaseNumber, options.new_imgs)
        shutil.copy(afile, new_afile)
        shutil.copy(bfile, new_bfile)
    pbar.close()

    if options.output_xml:
        xml_str = ET.tostring(tree, encoding='utf-8')
        xml_str = str(xml_str, encoding='utf-8')
        xml_file = open(options.output_xml, 'w', encoding='utf-8')
        xml_file.write(xml_str)
        xml_file.close()
