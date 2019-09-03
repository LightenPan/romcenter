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
                    xlist.append(os.path.join(root, file))
            else:
                for file in files:
                    os.path.join(root, file)
                    xlist.append(os.path.join(root, file))
        return xlist

    @staticmethod
    def __pad_zero_char(crc):
        if len(crc) < 8:
            # 前面补齐0
            pads = ''
            blank_num = 8 - len(crc)
            for i in range(0, blank_num):
                pads = pads + '0'
            return pads + crc # 返回的是16进制字符串
        return crc

    @staticmethod
    def calc_file_crc32(filepath, start_offset=0):
        start_offset = int(start_offset)
        block_size = 1024 * 1024
        first = True
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
                    return Utils.__pad_zero_char(hexcrc).upper() # 返回的是16进制字符串
                if first and start_offset > 0:
                    subbuffer = buffer[start_offset:len(buffer)]
                    crc = zlib.crc32(subbuffer, crc)
                else:
                    crc = zlib.crc32(buffer, crc)
        except Exception as excep:
            import traceback
            print('traceback: %s' % traceback.format_exc())
            return ''

    @staticmethod
    def calc_zip_inner_crc32(_file, start_offset=0):
        start_offset = int(start_offset)
        try:
            hexcrc = ''
            z = zipfile.ZipFile(_file, "r")
            if start_offset > 0:
                for filename in z.namelist():
                    buffer = z.read(filename)
                    subbuffer = buffer[start_offset:len(buffer)]
                    crc = zlib.crc32(subbuffer, 0)
                    if sys.version_info[0] < 3 and crc < 0:
                        crc += 2 ** 32
                    hexcrc = hex(crc).replace('0x', '')
                    hexcrc = Utils.__pad_zero_char(hexcrc).upper() # 返回的是16进制字符串
                    break
            else:
                for info in z.infolist():
                    hexcrc = hex(info.CRC).replace('0x', '')
                    hexcrc = Utils.__pad_zero_char(hexcrc).upper() # 返回的是16进制字符串
                    break
            return hexcrc
        except Exception as excep:
            import traceback
            print('traceback: ', traceback.format_exc())
            return ''

    @staticmethod
    def rename_zip_inner_file(_file, new_name):
        try:
            # 检查是否已经一致
            is_renamed = False
            source = zipfile.ZipFile(_file, 'r')
            if len(source.filelist) > 1:
                return False

            for file in source.filelist:
                ext = os.path.splitext(file.filename)[-1]
                new_filename = new_name + ext
                if file.filename == new_filename:
                    is_renamed = True
                    break
            if is_renamed:
                return True

            # 改名
            source = zipfile.ZipFile(_file, 'r')
            target = zipfile.ZipFile(_file + '.tmp', 'w', zipfile.ZIP_DEFLATED)
            for file in source.filelist:
                ext = os.path.splitext(file.filename)[-1]
                new_filename = new_name + ext
                target.writestr(new_filename, source.read(file.filename))
            target.close()
            source.close()
            os.remove(_file)
            os.rename(_file + '.tmp', _file)
            return True

        except:
            import traceback
            print('traceback: ', traceback.format_exc())
            return False

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


if __name__ == "__main__":
    from optparse import OptionParser
    usage = 'python -m utils --file= --start_offset='
    parser = OptionParser(usage)
    parser.add_option("--file")
    parser.add_option("--start_offset")

    (options, args) = parser.parse_args()

    if not options.start_offset:
        options.start_offset = 0

    crc = Utils.calc_zip_inner_crc32(options.file, options.start_offset)
    print(crc)
