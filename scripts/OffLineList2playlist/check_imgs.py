# encoding=utf8
import os
from tqdm import tqdm
from PIL import Image
from utils import Utils


def is_valid_image(filename):
    valid = True
    try:
        Image.open(filename).load()
    except OSError:
        valid = False
    return valid


if __name__ == "__main__":
    from optparse import OptionParser
    usage = ''
    parser = OptionParser(usage)
    parser.add_option("--imgs")
    parser.add_option("--by_del")

    (options, args) = parser.parse_args()

    if not options.by_del:
        options.by_del = 1
    else:
        options.by_del = int(options.by_del)

    ext_list = ['.png', '.jpg']

    files = list()
    Utils.listdir(options.imgs, files)

    fail_list = list()
    pbar = tqdm(files, ascii=True)
    threads = []
    for item in pbar:
        pbar.set_description("处理 %s" % item)
        pbar.update()

        ext = os.path.splitext(item)[-1]
        if ext not in ext_list:
            continue
        succ = is_valid_image(item)
        if not succ:
            fail_list.append(item)
    pbar.close()

    print('fail list len: ', len(fail_list))
    for item in fail_list:
        os.remove(item)
