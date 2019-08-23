# encoding=utf8
import os
from tqdm import tqdm
from XmlDataLoader import XmlDataLoader
import xml.etree.ElementTree as ET


def listdir(dst_dir, list_name):  #传入存储的list
    for root, dirs, files in os.walk(dst_dir):
        # print(root) #当前目录路径
        # print(dirs) #当前路径下所有子目录
        # print(files) #当前路径下所有非目录子文件
        for file in files:
            os.path.join(root, file)
            list_name.append(os.path.join(root, file))
        for dir in dirs:
            listdir(dir, list_name)


def is_valid_image(filename):
    valid = True
    try:
        Image.open(filename).load()
    except OSError:
        valid = False
    return valid


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python dict_handle.ConverArcadeDatToOfflineList --arcade_dat= --cover_dat= --output='
    parser = OptionParser(usage)
    parser.add_option("--arcade_dat")
    parser.add_option("--cover_dat")
    parser.add_option("--output")

    (options, args) = parser.parse_args()

    # 读取offlinelist数据
    xml_data_loader = XmlDataLoader()
    cover_game_tree = xml_data_loader.load_xml_tree(options.cover_dat)
    cover_games_node = cover_game_tree.find('games')
    cover_game_list = cover_game_tree.findall('games/game')
    index_cover_game = len(cover_game_list)

    # 读取街机xml数据
    xml_arcade_game_tree = ET.ElementTree(file=options.arcade_dat).getroot()
    xml_arcade_game_list = xml_arcade_game_tree.findall('game')

    # 遍历街机
    index = -1
    pbar = tqdm(xml_arcade_game_list, ascii=True)
    for game in pbar:
        # if index > 1000:
        #     break

        index = index + 1
        index_cover_game = index_cover_game + 1
        arcade_game = xml_arcade_game_list[index]

        game_name = arcade_game.attrib['name']
        pbar.set_description("处理 %s" % game_name)
        pbar.update()

        # <description>Eight Ball Action (DK conversion) [Parent set for working drivers]</description>
        # <year>1984</year>
        # <manufacturer>Seatongrove Ltd (Magic Eletronics USA licence)</manufacturer>
        # <rom name="8b-dk.5e" size="4096" crc="166c1c9b"/>

        # 新增cover game节点
        arcade_game_description = ''
        tmp_description = arcade_game.find('description')
        if tmp_description:
            arcade_game_description = tmp_description.text
        arcade_game_manufacturer = ''
        tmp_manufacturer = arcade_game.find('manufacturer')
        if tmp_manufacturer:
            arcade_game_manufacturer = tmp_manufacturer.text
        arcade_game_year = ''
        tmp_year = arcade_game.find('year')
        if tmp_year:
            arcade_game_year = tmp_year.text

        new_cover_gane_number = index_cover_game
        new_cover_game = ET.SubElement(cover_games_node, 'game')

        releaseNumber = ET.SubElement(new_cover_game, 'releaseNumber')
        releaseNumber.text = str(new_cover_gane_number)

        imageNumber = ET.SubElement(new_cover_game, 'imageNumber')
        imageNumber.text = str(new_cover_gane_number)

        title = ET.SubElement(new_cover_game, 'title')
        title.text = game_name

        saveType = ET.SubElement(new_cover_game, 'saveType')
        saveType.text = ''

        romSize = ET.SubElement(new_cover_game, 'romSize')
        romSize.text = ''

        publisher = ET.SubElement(new_cover_game, 'publisher')
        publisher.text = arcade_game_manufacturer

        location = ET.SubElement(new_cover_game, 'location')
        location.text = ''

        sourceRom = ET.SubElement(new_cover_game, 'sourceRom')
        sourceRom.text = ''

        language = ET.SubElement(new_cover_game, 'language')
        language.text = ''

        files = ET.SubElement(new_cover_game, 'files')
        arcade_sub_rom_list = arcade_game.findall('rom')
        for sub_rom in arcade_sub_rom_list:
            romCRC = ET.SubElement(files, 'romCRC')
            romCRC.set('name', sub_rom.attrib['name'])
            romCRC.set('size', sub_rom.attrib['size'])
            if 'status' in sub_rom.attrib:
                romCRC.set('status', sub_rom.attrib['status'])
            if 'crc' in sub_rom.attrib:
                romCRC.text = sub_rom.attrib['crc']

        im1CRC = ET.SubElement(new_cover_game, 'im1CRC')
        im1CRC.text = ''

        im2CRC = ET.SubElement(new_cover_game, 'im2CRC')
        im2CRC.text = ''

        comment = ET.SubElement(new_cover_game, 'comment')
        comment.text = ''

        duplicateID = ET.SubElement(new_cover_game, 'duplicateID')
        duplicateID.text = ''

        description = ET.SubElement(new_cover_game, 'description')
        description.text = arcade_game_description

        year = ET.SubElement(new_cover_game, 'year')
        year.text = arcade_game_year

        # <game>
        #     <imageNumber>1</imageNumber>
        #     <releaseNumber>1</releaseNumber>
        #     <title>爆走战记 - 钢铁之友情 (v20161101) (繁) (修正版)</title>
        #     <saveType></saveType>
        #     <romSize>1048576</romSize>
        #     <publisher>Capcom</publisher>
        #     <location>7</location>
        #     <sourceRom>sss888</sourceRom>
        #     <language>4</language>
        #     <files>
        #         <romCRC extension=".gbc">C26C2187</romCRC>
        #     </files>
        #     <im1CRC>4FF7D965</im1CRC>
        #     <im2CRC>EDEEBEB5</im2CRC>
        #     <comment>Bakusou Senki Metal Walker GB - Koutetsu no Yuujou (Japan) (GB Compatible) (v20161101) [CHT] [Fix]</comment>
        #     <duplicateID>0</duplicateID>
        # </game>

    if options.output:
        import xml.dom.minidom
        rough_string = ET.tostring(cover_game_tree, encoding='utf-8')
        reparsed = xml.dom.minidom.parseString(rough_string)
        xml_str = reparsed.toprettyxml(indent="\t")
        xml_file = open(options.output, 'w', encoding='utf-8')
        xml_file.write(xml_str)
        xml_file.close()
