# encoding=utf8
import os
import sys
import zlib
import zipfile
from tqdm import tqdm
import xml.etree.ElementTree as ET

from utils import Utils
from XmlDataLoader import XmlDataLoader


def gen_rom_file_crc_dict(rom_file_list):
    xdict = dict()
    for file in rom_file_list:
        crc = Utils.calc_file_crc32(file)
        if crc == '':
            continue
        basename = os.path.basename(file)
        filename = os.path.splitext(basename)[0]
        xdict[filename] = crc.upper()
    return xdict


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.AddCrcFromFileName --dat= --roms='
    parser = OptionParser(usage)
    parser.add_option("--dat")
    parser.add_option("--roms")
    parser.add_option("--output_xml")

    (options, args) = parser.parse_args()

    # 读取offlinelist数据
    xml_data_loader = XmlDataLoader()
    data = xml_data_loader.load(options.dat)
    game_list = data['game_list']
    tree = xml_data_loader.load_xml_tree(options.dat)
    tree_games = tree.findall('games/game')

    # 获取rom列表
    rom_file_list = Utils.listdir(options.roms)
    rom_file_crc_dict =gen_rom_file_crc_dict(rom_file_list)

    # 遍历街机
    failed_list = list()
    index = -1
    pbar = tqdm(game_list, ascii=True)
    for game in pbar:
        index = index + 1
        if index > 1000:
            break

        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        ename = game['title']
        cname = game['comment']
        if ename not in rom_file_crc_dict:
            failed_list.append(ename)
            continue
        crc = rom_file_crc_dict[ename]
        tree_game = tree_games[index]
        tree_game.find('files/romCRC').text = str(crc)

    if options.output_xml:
        xml_str = ET.tostring(tree, encoding='utf-8')
        xml_str = str(xml_str, encoding='utf-8')
        xml_file = open(options.output_xml, 'w', encoding='utf-8')
        xml_file.write(xml_str)
        xml_file.close()

    for item in failed_list:
        print('failed item: ', item)
    print('failed len: ', len(failed_list))
