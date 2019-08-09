# encoding=utf8
# import json
from XmlDataLoader import XmlDataLoader
from tqdm import tqdm

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


def clean_title(title):
    import re
    news = re.sub(r'\(.*\)', '', title)
    return news

def write_excel_xls(path, sheet_name, value):
    index = len(value)  # 获取需要写入数据的行数
    workbook = xlwt.Workbook()  # 新建一个工作簿
    sheet = workbook.add_sheet(sheet_name)  # 在工作簿中新建一个表格
    for i in range(0, index):
        for j in range(0, len(value[i])):
            sheet.write(i, j, value[i][j])  # 像表格中写入数据（对应的行和列）
    workbook.save(path)  # 保存工作簿
    print("xls格式表格写入数据成功！")


if __name__ == "__main__":
    from optparse import OptionParser
    usage = ''
    parser = OptionParser(usage)
    parser.add_option("--dat")
    parser.add_option("--ext")
    parser.add_option("--output")

    (options, args) = parser.parse_args()

    if not options.ext:
        options.ext = '.zip'

    xml_data_loader = XmlDataLoader()
    data = xml_data_loader.load(options.dat)

    logging.info('生成excel:')
    values = [[0 for i in range(2)] for j in range(len(data['game_list']))]
    image_count = 500
    pbar = tqdm(data['game_list'])
    output_file = open(options.output, 'w', encoding='utf-8')
    row = 0
    for game in pbar:
        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        title = clean_title(game['title'])
        values[row][0] = game['romCRC']
        values[row][1] = title
        print(values[row][0], values[row][1])
        row = row + 1
    pbar.close()
    write_excel_xls(options.output, 'nes', values)
