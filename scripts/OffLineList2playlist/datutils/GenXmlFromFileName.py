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
    parser.add_option("--ext")

    (options, args) = parser.parse_args()

    if not options.ext:
        options.ext = '.zip'

    # 读取offlinelist数据
    xml_data_loader = XmlDataLoader()
    cover_game_tree = xml_data_loader.load_xml_tree(options.cover_dat)
    cover_games_node = cover_game_tree.find('games')
    cover_game_list = cover_game_tree.findall('games/game')
    index_cover_game = len(cover_game_list)

    # 获取rom列表
    rom_file_list = Utils.listdir(options.roms, [options.ext])
    rom_file_crc_dict = gen_rom_file_crc_dict(rom_file_list)

    # 遍历街机
    failed_list = list()
    index = 0
    pbar = tqdm(rom_file_list, ascii=True)
    for rom_file in pbar:
        index = index + 1
        if index > 1:
            break

        new_cover_gane_number = 0
        _, basename = os.path.split(rom_file)
        game_name = os.path.splitext(basename)[0]
        crc = rom_file_crc_dict[title]
        pbar.set_description("处理 game_name: %s, crc: %s" % (game_name, crc))
        pbar.update()

        index = index + 1
        index_cover_game = index_cover_game + 1

        # <description>Eight Ball Action (DK conversion) [Parent set for working drivers]</description>
        # <year>1984</year>
        # <manufacturer>Seatongrove Ltd (Magic Eletronics USA licence)</manufacturer>
        # <rom name="8b-dk.5e" size="4096" crc="166c1c9b"/>

        # 新增cover game节点
        new_cover_gane_number = index_cover_game
        new_cover_game = ET.SubElement(cover_games_node, 'game')

        releaseNumber = ET.SubElement(new_cover_game, 'releaseNumber')
        releaseNumber.text = str(new_cover_gane_number)

        imageNumber = ET.SubElement(new_cover_game, 'imageNumber')
        imageNumber.text = str(new_cover_gane_number)

        title = ET.SubElement(new_cover_game, 'title')
        title.text = game_name

        title = ET.SubElement(new_cover_game, 'title')
        title.text = game_name

        saveType = ET.SubElement(new_cover_game, 'saveType')
        saveType.text = ''

        romSize = ET.SubElement(new_cover_game, 'romSize')
        romSize.text = ''

        publisher = ET.SubElement(new_cover_game, 'publisher')
        publisher.text = ''

        location = ET.SubElement(new_cover_game, 'location')
        location.text = ''

        sourceRom = ET.SubElement(new_cover_game, 'sourceRom')
        sourceRom.text = ''

        language = ET.SubElement(new_cover_game, 'language')
        language.text = ''

        files = ET.SubElement(new_cover_game, 'files')
        romCRC = ET.SubElement(files, 'romCRC')
        romCRC.text = crc

        im1CRC = ET.SubElement(new_cover_game, 'im1CRC')
        im1CRC.text = ''

        im2CRC = ET.SubElement(new_cover_game, 'im2CRC')
        im2CRC.text = ''

        comment = ET.SubElement(new_cover_game, 'comment')
        comment.text = ''

        duplicateID = ET.SubElement(new_cover_game, 'duplicateID')
        duplicateID.text = ''

        description = ET.SubElement(new_cover_game, 'description')
        description.text = ''

        year = ET.SubElement(new_cover_game, 'year')
        year.text = ''

    if options.output_xml:
        xml_str = ET.tostring(cover_game_tree, encoding='utf-8')
        xml_str = str(xml_str, encoding='utf-8')
        xml_file = open(options.output_xml, 'w', encoding='utf-8')
        xml_file.write(xml_str)
        xml_file.close()

    for item in failed_list:
        print('failed item: ', item)
    print('failed len: ', len(failed_list))
