# encoding=utf8
import xml.etree.ElementTree as ET
import zlib
import os
import sys
import json
import zipfile


def load_offlinelist_xml(file):
    data = {
        'canopen_ext_list': list(),
        'game_list': list(),
        'romcrc_dict': dict(),
        'title_dict': dict(),
    }
    #打开xml文档
    tree = ET.ElementTree(file=file)

    for extension in tree.iterfind('configuration/canOpen/extension'):
        data['canopen_ext_list'].append(extension.text)

    index = 0
    for game in tree.iterfind('games/game'):
        index = index + 1
        title = game.find('title').text
        comment = game.find('comment').text
        romCRC = game.find('files/romCRC').text.lower()
        extension = game.find('files/romCRC').attrib['extension']
        imageNumber = game.find('imageNumber').text
        releaseNumber = game.find('releaseNumber').text
        info = {
            'releaseNumber': releaseNumber,
            'title': title,
            'comment': comment,
            'romcrc': romCRC,
            'imageNumber': imageNumber,
            'extension': extension,
        }
        data['game_list'].append(info)
        data['romcrc_dict'][romCRC] = info
        data['title_dict'][title] = info
    return data


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
    except Exception:
        return ''

def calc_zip_crc32(_file, _ext_list):
    hexcrc = ''
    z = zipfile.ZipFile(_file, "r")
    for filename in z.namelist():
        ext = os.path.splitext(filename)[-1]
        # print('calc_zip_crc32: %s, ext: %s' % (filename, ext))
        if ext not in _ext_list:
            continue
        zdata = z.read(filename)
        crc = zlib.crc32(zdata)
        hexcrc = hex(crc).replace('0x', '')
        break
    return hexcrc


def rename_by_xml_dat(rename, _romPath, _data):
    canopen_ext_list = data['canopen_ext_list']
    canopen_ext_list.append('.zip')
    g = os.walk(_romPath)
    for path, _, file_list in g:
        for file_name in file_list:
            path_name = os.path.join(path, file_name)
            if file_name in _data['title_dict']:
                continue
            ext = os.path.splitext(path_name)[-1]
            if ext not in canopen_ext_list:
                continue

            if ext == '.zip':
                romcrc = calc_zip_crc32(path_name, canopen_ext_list)
            else:
                romcrc = calc_file_crc32(path_name)
            if romcrc not in _data['romcrc_dict']:
                print('unknow rom: %s, crc: %s' % (path_name, romcrc))
                continue
            game = _data['romcrc_dict'][romcrc]
            # print(json.dumps(game, ensure_ascii=False))

            game_name = game['title'] + ext
            game_path_name = os.path.join(path, game_name)
            if path_name != game_path_name and rename == 1:
                print('rename file. path_name: %s, new_name: %s' % (path_name, game_path_name))
                try:
                    os.rename(path_name, game_path_name)
                except Exception as e:
                    print(e)


if __name__ == "__main__":
    from optparse import OptionParser
    usage = ''
    parser = OptionParser(usage)
    parser.add_option("--offlinelist_xml")
    parser.add_option("--room_dir")
    parser.add_option("--rename")
    (options, args) = parser.parse_args()

    if not options.rename:
        options.rename = 0

    data = load_offlinelist_xml(options.offlinelist_xml)
    rename_by_xml_dat(int(options.rename), options.room_dir, data)
