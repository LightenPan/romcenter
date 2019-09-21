# encoding=utf8
from tqdm import tqdm
from utils import Utils


def is_has_chs(name):
    import re
    pattern = re.compile(r'[\u4e00-\u9fa5]+')
    return pattern.search(name)


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.ListChsFiles --dir='
    parser = OptionParser(usage)
    parser.add_option("--dir")

    (options, args) = parser.parse_args()

    files = Utils.listdir(options.dir)

    xlist = list()
    pbar = tqdm(files)
    for item in pbar:
        pbar.set_description("处理 %s" % item)
        pbar.update()

        # 判断是否有汉字
        if not is_has_chs(item):
            continue

        xlist.append(item)
    pbar.close()

    for item in xlist:
        print(item)
