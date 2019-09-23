# encoding=utf8
import os
import zipfile
import json
from tqdm import tqdm
from optparse import OptionParser
import binascii
import os.path
from utils import Utils

# 利用logging.basicConfig()打印信息到控制台
import logging
logging.basicConfig(
    format='%(asctime)s [%(levelname)s] [%(pathname)s:%(lineno)d] [%(module)s] [%(funcName)s] >> %(message)s',
    level=logging.DEBUG
)

# 关闭requests的日志
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)


def crc32_from_zip_file(path):
    # logging.info('load_from_zip path: %s', path)
    basename = os.path.basename(path)
    if os.path.splitext(basename)[-1] != '.zip':
        return None
    cname = os.path.splitext(basename)[0]
    crc32 = ''
    ename = ''
    z = zipfile.ZipFile(path, "r")
    for filename in z.namelist():
        # 计算CRC32
        tmp_basename = os.path.basename(filename)
        if os.path.splitext(tmp_basename)[-1] == '.txt':
            continue
        os.path.basename(filename)
        zdata = z.read(filename)
        crc32 = '{:x}'.format(binascii.crc32(zdata))
        ename = os.path.splitext(tmp_basename)[0]
    info = {
        'crc32': crc32,
        'ename': ename,
        'cname': cname,
    }
    return info


def load_en2chs(file):
    xdict = dict()
    if not os.path.exists(file):
        return xdict

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


if __name__ == "__main__":
    usage = ''
    parser = OptionParser(usage)
    parser.add_option("--dir")
    parser.add_option("--output")
    parser.add_option("--exist_en2chs")

    (options, args) = parser.parse_args()

    files = list()
    Utils.listdir(options.dir, files)

    en2chs_dict = dict()
    if options.exist_en2chs:
        en2chs_dict = load_en2chs(options.exist_en2chs)

    crc_list = list()
    pbar = tqdm(files, ascii=True)
    threads = []
    for item in pbar:
        pbar.set_description("处理 %s" % item)
        pbar.update()

        info = crc32_from_zip_file(item)
        if not info:
            continue
        crc_list.append(info)
    pbar.close()

    # 合并字典
    for item in crc_list:
        if item['crc32'] not in en2chs_dict:
            en2chs_dict[item['crc32']] = item

    if options.output:
        new_crc_list = list(en2chs_dict.values())
        json_file = open(options.output, 'w', encoding='utf-8')
        for item in new_crc_list:
            json_file.write('%s\n' % json.dumps(item, ensure_ascii=False))
        json_file.close()

