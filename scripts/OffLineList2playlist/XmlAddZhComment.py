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

import xlrd
import xlwt
from xlutils.copy import copy

# 利用logging.basicConfig()打印信息到控制台
import logging
logging.basicConfig(
    format='%(asctime)s [%(levelname)s] [%(pathname)s:%(lineno)d] [%(module)s] [%(funcName)s] >> %(message)s',
    level=logging.DEBUG
)

# 关闭requests的日志
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)


def write_excel_xls(path, sheet_name, value):
    index = len(value)  # 获取需要写入数据的行数
    workbook = xlwt.Workbook()  # 新建一个工作簿
    sheet = workbook.add_sheet(sheet_name)  # 在工作簿中新建一个表格
    for i in range(0, index):
        for j in range(0, len(value[i])):
            sheet.write(i, j, value[i][j])  # 像表格中写入数据（对应的行和列）
    workbook.save(path)  # 保存工作簿
    print("xls格式表格写入数据成功！")


def load_en2chs(file):
    xdict = dict()
    f = open(file, encoding='utf-8')               # 返回一个文件对象
    line = f.readline()          # 调用文件的 readline()方法
    while line:
        # print line,            # 后面跟 ',' 将忽略换行符
        # print(line, end = '')  # 在 Python 3中使用
        info = json.loads(line)
        xdict[info['crc32'].upper()] = info
        line = f.readline()
    f.close()
    return xdict


def load_en2chs_simple(file):
    xdict = dict()
    f = open(file, encoding='utf-8')               # 返回一个文件对象
    line = f.readline()          # 调用文件的 readline()方法
    while line:
        # print line,            # 后面跟 ',' 将忽略换行符
        # print(line, end = '')  # 在 Python 3中使用
        info = json.loads(line)
        xdict[info['ename'].lower()] = info # 英文转成小写，容易匹配上
        line = f.readline()
    f.close()
    return xdict

def save_no_chs_list_xls(file, no_chs_list):
    if os.path.exists(file):
        os.remove(file)
    values = [[0 for i in range(2)] for j in range(len(no_chs_list) + 1)]
    values[0][0] = 'crc32'
    values[0][1] = '英文名'
    row = 1
    for item in no_chs_list:
        values[row][0] = item['crc32']
        values[row][1] = item['ename']
        row = row + 1
    write_excel_xls(file, 'sheet1', values)

def save_no_chs_list(file, no_chs_list):
    if os.path.splitext(file)[-1] == '.xls':
        save_no_chs_list_xls(file, no_chs_list)
    else:
        file_obj = open(file, 'w', encoding='utf-8')
        for title in no_chs_list:
            file_obj.write('%s\n' % title)
        file_obj.close()

def gen_simple_from_en2chs(en2chs):
    import re
    xdict = dict()
    tmp_list = list(en2chs.values())
    for item in tmp_list:
        ename = item['ename'].lower() # 英文转成小写，容易匹配上
        ename = re.sub(' \(.*\)', '', ename)
        info = {
            'ename': ename.lower(), # 英文转成小写，容易匹配上
            'cname': item['cname'],
        }
        xdict[ename] = info
    return xdict


if __name__ == "__main__":
    usage = 'python XmlAddZhComment.py --dat="endats\noIntro - Nintendo - Super Nintendo Entertainment System .xml" --en2chs=en2chs\sfc.json --output_xml=output\LP_SFC_OL.xml'
    parser = OptionParser(usage)
    parser.add_option("--dat")
    parser.add_option("--en2chs")
    parser.add_option("--en2chs_simple")
    parser.add_option("--output_xml")
    parser.add_option("--no_chs_file")

    (options, args) = parser.parse_args()

    xml_data_loader = XmlDataLoader()
    tree = xml_data_loader.load_xml_tree(options.dat)
    data = xml_data_loader.load(options.dat)
    en2chs = dict()
    tmp_en2chs_simple = dict()
    if options.en2chs:
        en2chs = load_en2chs(options.en2chs)
        tmp_en2chs_simple = gen_simple_from_en2chs(en2chs)

    en2chs_simple = dict()
    if options.en2chs_simple:
        en2chs_simple = load_en2chs_simple(options.en2chs_simple)

    # 用en2chs里的英文和中文生成简单索引
    en2chs_simple = dict(en2chs_simple, **tmp_en2chs_simple)

    index = -1
    no_chs_list = list()
    tree_games = tree.findall('games/game')

    # 先用crc匹配
    pbar = tqdm(data['game_list'])
    for game in pbar:
        index = index + 1
        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        tree_game = tree_games[index]
        if tree_game.find('comment').text and tree_game.find('comment').text != '':
            continue

        crc = game['romCRC'].upper()
        if crc not in en2chs:
            continue

        info = en2chs[crc]
        tree_game.find('comment').text = str(info['cname'])
    pbar.close()

    # 再用英文名匹配
    index = -1
    pbar = tqdm(data['game_list'])
    for game in pbar:
        index = index + 1
        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        tree_game = tree_games[index]
        if tree_game.find('comment').text and tree_game.find('comment').text != '':
            continue

        # 跳过crc匹配的，前面已经处理了
        crc = game['romCRC'].upper()
        if crc in en2chs:
            continue

        # 英文匹配替换
        title = game['title']
        if title not in en2chs_simple:
            no_chs = {
                'crc32': crc,
                'ename': title
            }
            no_chs_list.append(no_chs)
            continue
        info_simple = en2chs_simple[title]
        tree_game = tree_games[index]
        tree_game.find('comment').text = str(info_simple['cname'])
    pbar.close()

    if options.output_xml:
        xml_str = ET.tostring(tree, encoding='utf-8')
        xml_str = str(xml_str, encoding='utf-8')
        xml_file = open(options.output_xml, 'w', encoding='utf-8')
        xml_file.write(xml_str)
        xml_file.close()

    print('len no_chs_list: ', len(no_chs_list))
    if no_chs_list:
        if options.no_chs_file:
            save_no_chs_list(options.no_chs_file, no_chs_list)
        else:
            for title in no_chs_list:
                print(title)
