# encoding=utf8
import os
import sys
import zlib
import zipfile


class Utils:
    @staticmethod
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
                    os.path.join(root, file)
                    xlist.append(os.path.join(root, file))
            else:
                for file in files:
                    os.path.join(root, file)
                    xlist.append(os.path.join(root, file))
            for item in dirs:
                tmp_list = Utils.listdir(item, ext_list)
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
        try:
            hexcrc = ''
            z = zipfile.ZipFile(_file, "r")
            for filename in z.namelist():
                zdata = z.read(filename)
                crc = zlib.crc32(zdata)
                hexcrc = hex(crc).replace('0x', '')
                break
            return hexcrc
        except Exception as excep:
            return ''

    @staticmethod
    def rename_zip_inner_file(_file, new_name):
        try:
            source = zipfile.ZipFile(_file, 'r')
            target = zipfile.ZipFile(_file+'.tmp', 'w', zipfile.ZIP_DEFLATED)
            for file in source.filelist:
                ext = os.path.splitext(file.filename)[-1]
                new_filename = new_name + ext
                target.writestr(new_filename, source.read(file.filename))
            target.close()
            source.close()
            os.remove(_file)
            os.rename(_file+'.tmp', _file)
        except Exception as excep:
            pass

    @staticmethod
    def genImageFiles(imageNumber, imgsDir):
        imageNumber = int(imageNumber)
        image_count = 500
        calcNumber = imageNumber
        if calcNumber == 0:
            calcNumber = 1
        low_number = ((calcNumber - 1) // image_count) * image_count + 1
        high_number = ((calcNumber - 1) // image_count) * image_count + image_count
        number_dir = '%s-%s' % (low_number, high_number)
        imgs_dir = os.path.join(imgsDir, number_dir)
        afile = os.path.join(imgs_dir, str(imageNumber) + 'a.png')
        bfile = os.path.join(imgs_dir, str(imageNumber) + 'b.png')
        return afile, bfile
