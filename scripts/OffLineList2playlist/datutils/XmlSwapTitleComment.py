# encoding=utf8
import xml.etree.ElementTree as ET
import shutil
import os
import zipfile
import json
import re
from tqdm import tqdm
import requests.api
from optparse import OptionParser
from XmlDataLoader import XmlDataLoader

# 利用logging.basicConfig()打印信息到控制台
import logging
logging.basicConfig(
    format='%(asctime)s [%(levelname)s] [%(pathname)s:%(lineno)d] [%(module)s] [%(funcName)s] >> %(message)s',
    level=logging.DEBUG
)

# 关闭requests的日志
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)


def load_en2chs(file):
    xdict = dict()
    f = open(file)               # 返回一个文件对象
    line = f.readline()          # 调用文件的 readline()方法
    while line:
        # print line,            # 后面跟 ',' 将忽略换行符
        # print(line, end = '')  # 在 Python 3中使用
        info = json.loads(line)
        xdict[info['en']] = info['chs']

        line = f.readline()
    f.close()
    return xdict


if __name__ == "__main__":
    usage = 'python -m datutils.XmlSwapTitleComment --dat= --output_xml=output'
    parser = OptionParser(usage)
    parser.add_option("--dat")
    parser.add_option("--output_xml")

    (options, args) = parser.parse_args()

    xml_data_loader = XmlDataLoader()
    tree = xml_data_loader.load_xml_tree(options.dat)
    data = xml_data_loader.load(options.dat)

    index = -1
    no_chs_list = list()
    tree_games = tree.findall('games/game')
    pbar = tqdm(data['game_list'], ascii=True)
    for game in pbar:
        index = index + 1
        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        tree_game = tree_games[index]
        title = tree_game.find('title').text
        comment = tree_game.find('comment').text
        tree_game.find('title').text = comment
        tree_game.find('comment').text = title
    pbar.close()

    if options.output_xml:
        xml_str = ET.tostring(tree, encoding='utf-8')
        xml_str = str(xml_str, encoding='utf-8')
        xml_file = open(options.output_xml, 'w', encoding='utf-8')
        xml_file.write(xml_str)
        xml_file.close()
