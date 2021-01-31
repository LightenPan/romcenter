# encoding=utf8
import os
import socks
import socket
from tqdm import tqdm
import requests

from utils import Utils


def list_indexs(url):
    xlist = list()
    dst = '%s/.index' % url
    # print(dst)
    for i in range(1, 4):
        try:
            resp = requests.get(dst)
        except :
            continue
    if resp.status_code == 200:
        tmp_list = resp.text.split('\n')
        for item in tmp_list:
            if item:
                xlist.append(item)
    return xlist

def list_dirs(url):
    xlist = list()
    dst = '%s/.index-dirs' % url
    # print(dst)
    for i in range(1, 4):
        try:
            resp = requests.get(dst)
        except :
            continue
    if resp.status_code == 200:
        tmp_list = resp.text.split('\n')
        for item in tmp_list:
            if item:
                xlist.append(item)
    return xlist

def download_file(url, dst_title_file):
    f = open(dst_title_file, 'wb')
    try:
        r = requests.get(url)
        for chunk in r.iter_content(chunk_size=512):
            if chunk:
                f.write(chunk)
        f.close()
        return True
    except :
        import traceback
        print(traceback.format_exc())
        f.close()
        os.remove(dst_title_file)
        return False


def gen_loop_urls(url):
    xlist = list()
    files = list_indexs(url)
    for item in files:
        file_url = '%s/%s' % (url, item)
        print('file_url: ', file_url)
        xlist.append(file_url)
    dirs = list_dirs(url)
    for item in dirs:
        dir_url = '%s/%s' % (url, item)
        print('dir_url: ', dir_url)
        file_url_list = gen_loop_urls(dir_url)
        for item in file_url_list:
            xlist.append(item)
    return xlist


def mkdirs(path):
    isExists = os.path.exists(path)
    if not isExists:
        os.makedirs(path)


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m datutils.buildbot_libretro_download --start=/assets --output='
    parser = OptionParser(usage)
    parser.add_option("--start")

    (options, args) = parser.parse_args()

    if not options.start:
        options.start = '/assets'

    prex = 'http://buildbot.libretro.com'
    url = '%s%s' % (prex, options.start)

    from urllib import parse
    file_url_list = gen_loop_urls(url)
    for url in file_url_list:
        up = parse.urlparse(url)
        file_name = os.path.basename(up.path)
        dir_name = os.path.dirname(up.path)
        dst_file = os.path.join(dir_name, file_name)

        print('file url: %s, file_name: %s, dir_name: %s, dst_file: %s' % (url, file_name, dir_name, dst_file))

        mkdirs(dir_name)
        download_file(url, dst_file)

    print('url list len: ', len(file_url_list))
