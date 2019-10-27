# encoding=utf-8
import os
import sys
import zlib
import zipfile
from tqdm import tqdm


def listdir(dst_dir, ext_list=None):  #传入存储的list
    xlist = list()
    for root, dirs, files in os.walk(dst_dir):
        # print(root) #当前目录路径
        # print(dirs) #当前路径下所有子目录
        # print(files) #当前路径下所有非目录子文件
        if ext_list:
            for file in files:
                ext = os.path.splitext(file)[-1]
                if ext not in ext_list:
                    continue
                xlist.append(os.path.join(root, file))
        else:
            for file in files:
                xlist.append(os.path.join(root, file))
    return xlist


def add_if_not_exit(gdi_file, zip_file):
    zipFile = zipfile.ZipFile(zip_file, 'a')
    basename = os.path.basename(gdi_file)

    is_exist = False
    for name in zipFile.namelist():
        if name == basename:
            is_exist = True
            break
    if is_exist:
        return

    zipFile.write(gdi_file, basename, zipfile.ZIP_DEFLATED)
    zipFile.close()


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python AddExtFileToZip.py --add_dir= --zip_dir='
    parser = OptionParser(usage)
    parser.add_option("--add_dir")
    parser.add_option("--zip_dir")
    parser.add_option("--ext")

    (options, args) = parser.parse_args()

    if not options.add_dir:
        print('need add dir')
        exit(1)

    if not options.zip_dir:
        print('need zip dir')
        exit(1)

    if not options.ext:
        print('need ext')
        exit(1)

    # 获取rom列表
    gdi_files = listdir(options.add_dir, [options.ext])

    # 遍历街机
    index = -1
    pbar = tqdm(gdi_files, ascii=True)
    for add_file in pbar:
        # if index > 1000:
        #     break

        pbar.set_description("处理 %s" % add_file)
        pbar.update()

        basename = os.path.basename(add_file)
        filename = os.path.splitext(basename)[0]
        zip_file = os.path.join(options.zip_dir, filename + '.zip')
        if not os.path.exists(zip_file):
            continue

        add_if_not_exit(add_file, zip_file)
