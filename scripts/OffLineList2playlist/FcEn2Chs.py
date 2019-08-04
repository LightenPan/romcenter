# encoding=utf8
import re
import json

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
    title = re.sub('\\(.*\\)', '', title)
    title = re.sub('\\(.*', '', title)
    title = title.strip()
    title = ' '.join(title.split())# 将连续多个空格，变成一个空格
    return title


def split_en_chs(zh_en_str):
    xsplit = zh_en_str.split('        ')
    _en = xsplit[0]
    _chs = xsplit[1]
    _en = clean_title(_en)
    _chs = clean_title(_chs)
    # print(en, chs)
    # 用正则表达式，去掉括弧内的内容
    return _en, _chs


def load(file):
    xlist = list()
    f = open(file, encoding='UTF-8')               # 返回一个文件对象
    line = f.readline()          # 调用文件的 readline()方法
    while line:
        # print line,            # 后面跟 ',' 将忽略换行符
        # print(line, end = '')  # 在 Python 3中使用
        line = f.readline()
        if not line:
            continue
        xlist.append(line)
    f.close()
    return xlist


if __name__ == "__main__":
    from optparse import OptionParser
    usage = ''
    parser = OptionParser(usage)
    parser.add_option("--file")

    (options, args) = parser.parse_args()

    if not options.file:
        options.file = 'FC中英对照表.txt'

    xlist = load(options.file)
    for item in xlist:
        en, zh = split_en_chs(item)
        if not en:
            continue
        info = {
            'en': en,
            'chs': zh,
        }
        print(json.dumps(info, ensure_ascii=False))
