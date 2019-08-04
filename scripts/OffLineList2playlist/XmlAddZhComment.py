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
    usage = ''
    parser = OptionParser(usage)
    parser.add_option("--offlinelist_xml")
    parser.add_option("--en2chs")
    parser.add_option("--output_xml")

    (options, args) = parser.parse_args()

    if not options.en2chs:
        options.en2chs = 'xxx'

    xml_data_loader = XmlDataLoader()
    tree = xml_data_loader.load_xml_tree(options.offlinelist_xml)
    data = xml_data_loader.load(options.offlinelist_xml)
    en2chs = load_en2chs(options.en2chs)

    count = 0
    no_chs_list = list()
    pbar = tqdm(data['game_list'])
    for game in pbar:
        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        count = count + 1
        # if count > 10:
        #     break

        title = game['title']
        chs = title
        if title in en2chs:
            no_chs_list.append(title)
            chs = en2chs[title]

        # 更新备注
        ori_title = game['ori_title']
        try:
            xpath = "games/game[title='%s']" % (ori_title)
            if ori_title.find("'") >= 0:
                xpath = 'games/game[title="%s"]' % (ori_title)
            # logging.info('xpath: %s, ori_title: %s', xpath, ori_title)
            games = tree.findall(xpath)
        except SyntaxError as e:
            logging.error('%s', e)
            continue

        if not games:
            logging.error('find failed. xpath: %s', xpath)
            continue

        for game in games:
            game.find('comment').text = chs
            # logging.info('title: %s, comment: %s', game.find('title').text, game.find('comment').text)
    pbar.close()

    if no_chs_list:
        save_file = os.path.join('en2chs', 'no_chs_title.txt')
        xml_file = open(save_file, 'w', encoding='utf-8')
        for title in no_chs_list:
            xml_file.write(title + '\n')
        xml_file.close()

    if options.output_xml:
        xml_str = ET.tostring(tree, encoding='utf-8')
        xml_str = str(xml_str, encoding='utf-8')
        xml_file = open(options.output_xml, 'w', encoding='utf-8')
        xml_file.write(xml_str)
        xml_file.close()
