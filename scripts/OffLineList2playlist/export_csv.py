# encoding=utf8
import xml.etree.ElementTree as ET
import shutil
import os
import zipfile
# import json
from XmlDataLoader import XmlDataLoader
from tqdm import tqdm
import requests.api

# 利用logging.basicConfig()打印信息到控制台
import logging
logging.basicConfig(
    format='%(asctime)s [%(levelname)s] [%(pathname)s:%(lineno)d] [%(module)s] [%(funcName)s] >> %(message)s',
    level=logging.DEBUG
)

# 关闭requests的日志
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)


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

    logging.info('生成csv:')
    image_count = 500
    pbar = tqdm(data['game_list'], ascii=True)
    output_file = open(options.output, 'w', encoding='utf-8')
    for game in pbar:
        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        title = game['title']
        title.replace(r'\(.*\)', '')
        line = '%s##$$##%s\n' % (game['romCRC'], title)
        output_file.write(line)
    output_file.close()
    pbar.close()
