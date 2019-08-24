# encoding=utf8
import os
import sys
import zlib
import zipfile


class Utils:
    @staticmethod
    def listdir(dst_dir):  #传入存储的list
        xlist = list()
        for root, dirs, files in os.walk(dst_dir):
            # print(root) #当前目录路径
            # print(dirs) #当前路径下所有子目录
            # print(files) #当前路径下所有非目录子文件
            for file in files:
                os.path.join(root, file)
                xlist.append(os.path.join(root, file))
            for item in dirs:
                tmp_list = Utils.listdir(item)
                xlist = xlist + tmp_list
        return xlist

    @staticmethod
    def calc_file_crc32(filepath):
        block_size = 1024 * 1024
        crc = 0
        try:
            fd = open(filepath, 'rb')
            while True:
                buffer = fd.read(block_size)
                if not buffer: # EOF or file empty. return hashes
                    fd.close()
                    if sys.version_info[0] < 3 and crc < 0:
                        crc += 2 ** 32
                    hexcrc = hex(crc).replace('0x', '')
                    return hexcrc # 返回的是16进制字符串
                crc = zlib.crc32(buffer, crc)
        except Exception as excep:
            return ''

    @staticmethod
    def calc_zip_inner_crc32(_file):
        hexcrc = ''
        z = zipfile.ZipFile(_file, "r")
        for filename in z.namelist():
            ext = os.path.splitext(filename)[-1]
            zdata = z.read(filename)
            crc = zlib.crc32(zdata)
            hexcrc = hex(crc).replace('0x', '')
            break
        return hexcrc
