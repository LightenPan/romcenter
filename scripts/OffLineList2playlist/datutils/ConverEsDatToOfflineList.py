# encoding=utf8
import os
from tqdm import tqdm
from XmlDataLoader import XmlDataLoader
import xml.etree.ElementTree as ET


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.ConverEsDatToOfflineList --es_dat= --cover_dat= --output='
    parser = OptionParser(usage)
    parser.add_option("--es_dat")
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
    xml_arcade_game_tree = ET.ElementTree(file=options.es_dat).getroot()
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

        game_name = arcade_game.find('name').text
        pbar.set_description("处理 %s" % game_name)
        pbar.update()

        # 		<path>./1941.zip</path>
        # 		<name>1941反击战</name>
        # 		<sortname>01 =-  1941 - Counter Attack</sortname>
        # 		<desc>The goal is to shoot down enemy airplanes and collect weapon power-ups (POW). One is only able to perform three loops per level and a bonus is awarded at the end of the level for unused loops. Player 1 uses a P-38 Lightning and Player 2 uses a Mosquito Mk IV. The game shifts from the original Pacific Front setting with that of the Western Front.

        # The game consists of six levels.

        # It was the first shoot 'em up to add +1 to the score when a continue is used.[1]</desc>
        # 		<rating>16</rating>
        # 		<releasedate>19900101T000000</releasedate>
        # 		<developer>Capcom</developer>
        # 		<publisher>Capcom</publisher>
        # 		<genre>Shoot'em up / Vertical, Shoot'em Up</genre>
        # 		<players>1-2</players>
        # 		<image>./media/images/1941 - Counter Attack_screenscraper_mix_arrm.png</image>
        # 		<video>./media/videos/1941.mp4</video>
        # 		<playcount>0</playcount>
        # 		<hash>64E58DC3</hash>

        # 新增cover game节点
        arcade_game_cname = arcade_game.find('name').text
        arcade_game_ename = arcade_game.find('path').text

        arcade_game_crc = ''
        tmp_crc = arcade_game.find('hash')
        if tmp_crc:
            arcade_game_crc = tmp_crc.text

        arcade_game_description = ''
        tmp_desc = arcade_game.find('desc')
        if tmp_desc:
            arcade_game_description = tmp_desc.text

        arcade_game_manufacturer = ''
        tmp_publisher = arcade_game.find('publisher')
        if tmp_publisher:
            arcade_game_manufacturer = tmp_publisher.text

        arcade_game_year = ''
        tmp_releasedate = arcade_game.find('releasedate')
        if tmp_releasedate:
            arcade_game_year = tmp_releasedate.text

        new_cover_gane_number = index_cover_game
        new_cover_game = ET.SubElement(cover_games_node, 'game')

        releaseNumber = ET.SubElement(new_cover_game, 'releaseNumber')
        releaseNumber.text = str(new_cover_gane_number)

        imageNumber = ET.SubElement(new_cover_game, 'imageNumber')
        imageNumber.text = str(new_cover_gane_number)

        title = ET.SubElement(new_cover_game, 'title')
        title.text = arcade_game_ename

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
        romCRC = ET.SubElement(files, 'romCRC')
        romCRC.set('extension', '.zip')
        romCRC.text = arcade_game_crc

        im1CRC = ET.SubElement(new_cover_game, 'im1CRC')
        im1CRC.text = ''

        im2CRC = ET.SubElement(new_cover_game, 'im2CRC')
        im2CRC.text = ''

        comment = ET.SubElement(new_cover_game, 'comment')
        comment.text = arcade_game_cname

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
