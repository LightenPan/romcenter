# encoding=utf8
import os
from tqdm import tqdm
from PIL import Image
from XmlDataLoader import XmlDataLoader


# 利用logging.basicConfig()打印信息到控制台
import logging
logging.basicConfig(
    format='%(asctime)s [%(levelname)s] [%(pathname)s:%(lineno)d] [%(module)s] [%(funcName)s] >> %(message)s',
    level=logging.DEBUG
)

# 关闭requests的日志
logging.getLogger("PIL").setLevel(logging.WARNING)
logger = logging.getLogger('')


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
    parser.add_option("--dat")
    parser.add_option("--ext")

    (options, args) = parser.parse_args()

    if not options.ext:
        options.ext = '.zip'

    # 计算xml-data文件目录
    parent_path = os.path.dirname(options.dat)

    xml_data_loader = XmlDataLoader()
    data = xml_data_loader.load(options.dat)

    ext_list = ['.png', '.jpg']

    miss_image_list = list()
    index = 0
    image_count = 500
    pbar = tqdm(data['game_list'], ascii=True)
    threads = []
    for game in pbar:
        index = index + 1

        pbar.set_description("处理 %s" % xml_data_loader.genGameName(game))
        pbar.update()

        calcNumber = game['imageNumber']
        if calcNumber == 0:
            calcNumber = 1
        low_number = ((calcNumber - 1) // image_count) * image_count + 1
        high_number = ((calcNumber - 1) // image_count) * image_count + image_count
        number_dir = '%s-%s' % (low_number, high_number)
        imgs_dir = os.path.join(options.imgs, number_dir)
        afile = os.path.join(imgs_dir, str(game['imageNumber']) + 'a.png')
        bfile = os.path.join(imgs_dir, str(game['imageNumber']) + 'b.png')

        if not os.path.exists(afile) or not is_valid_image(afile):
            miss_image_list.append(afile)
        if not os.path.exists(bfile) or not is_valid_image(bfile):
            miss_image_list.append(bfile)

    print('miss image file count: %s' % (len(miss_image_list)))
    for file in miss_image_list:
        print('miss image file: %s' % (file))
