# encoding=utf8
import os
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
    _chs = _chs.strip()
    if not _chs:
        return None
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
        line = line.strip('\n')
        if not line:
            continue
        xlist.append(line)
    f.close()
    return xlist


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
        xdict[info['ename']] = info['cname']
        line = f.readline()
    f.close()
    return xdict


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python dict_handle\GenSimpleDict.py --file= --output='
    parser = OptionParser(usage)
    parser.add_option("--file")
    parser.add_option("--output")
    parser.add_option("--sep")
    parser.add_option("--exist_en2chs")

    (options, args) = parser.parse_args()

    # if not options.sep:
    #     options.sep = '##############'
    if not options.sep:
        options.sep = '\t'

    en2chs_dict = dict()
    if options.exist_en2chs:
        en2chs_dict = load_en2chs(options.exist_en2chs)

    simple_list = list()
    xlist = load(options.file)
    sep = ''
    for item in xlist:
        info = split_en_chs(item, options.sep)
        if not info:
            continue
        simple_list.append(info)

    # 合并字典
    new_dict = dict()
    for item in simple_list:
        if item['ename'] not in new_dict:
            new_dict[item['ename']] = item['cname']
    for ename, cname in en2chs_dict.items():
        if ename not in new_dict:
            new_dict[ename] = cname

    if options.output:
        json_file = open(options.output, 'w', encoding='utf-8')
        for ename, cname in new_dict.items():
            info = {
                'ename': ename,
                'cname': cname,
            }
            json_file.write('%s\n' % json.dumps(info, ensure_ascii=False))
        json_file.close()
