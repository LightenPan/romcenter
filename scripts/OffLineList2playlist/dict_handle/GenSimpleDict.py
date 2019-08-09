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


def split_en_chs(zh_en_str, sep):
    xsplit = zh_en_str.split(sep)
    if len(xsplit) < 2:
        return None
    _en = xsplit[0]
    _chs = xsplit[1]
    # print(en, chs)
    # 用正则表达式，去掉括弧内的内容
    return {
        'ename': _en,
        'cname': _chs
    }


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
    parser.add_option("--output")
    parser.add_option("--sep")

    (options, args) = parser.parse_args()

    if not options.sep:
        options.sep = '##############'

    simple_list = list()
    xlist = load(options.file)
    sep = ''
    for item in xlist:
        info = split_en_chs(item, options.sep)
        if not info:
            continue
        simple_list.append(info)

    if options.output:
        json_file = open(options.output, 'w', encoding='utf-8')
        for item in simple_list:
            json_file.write('%s\n' % json.dumps(item, ensure_ascii=False))
        json_file.close()
