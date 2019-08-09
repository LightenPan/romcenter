# encoding=utf8
import xml.etree.ElementTree as ET
import os
import zipfile
import re

# 利用logging.basicConfig()打印信息到控制台
import logging
logging.basicConfig(
    format='%(asctime)s [%(levelname)s] [%(pathname)s:%(lineno)d] [%(module)s] [%(funcName)s] >> %(message)s',
    level=logging.DEBUG
)

# 关闭requests的日志
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)


def load_xml_from_zip(_zip_file):
    # logging.info('_zip_file: %s', _zip_file)
    _ext_list = ['.xml']
    zdata = ''
    z = zipfile.ZipFile(_zip_file, "r")
    for filename in z.namelist():
        ext = os.path.splitext(filename)[-1]
        if ext not in _ext_list:
            continue
        zdata = z.read(filename)
        break
    return zdata


def genLocation(location):
    return location


class FmtGame:
    def __init__(self, game):
        # <game>
        #     <imageNumber>1</imageNumber>
        #     <releaseNumber>1</releaseNumber>
        #     <title>F-Zero GBA</title>
        #     <saveType>Sram_v110</saveType>
        #     <romSize>4209952</romSize>
        #     <publisher>Nintendo</publisher>
        #     <location>7</location>
        #     <sourceRom>[PGCG]</sourceRom>
        #     <language>4</language>
        #     <files>
        #         <romCRC extension=".gba">27ECAB1A</romCRC>
        #     </files>
        #     <im1CRC>269D6AB2</im1CRC>
        #     <im2CRC>F6E0410D</im2CRC>
        #     <comment>(简)</comment>
        #     <duplicateID>0</duplicateID>
        # </game>
        self._formats = {
            '%n' : '{game.title}',
            '%o' : '{game.location}',
            '%p' : '{game.publisher}',
            '%g' : '{game.sourceRom}',
            '%s' : '{game.saveType}',
            '%i' : '{game.romSize}',
            '%u' : '{game.releaseNumber}',
            '%m' : '{game.language}',
            '%e' : '{game.comment}',
            '%c' : '{game.romCRC}',
            '%a' : '{game.language}',
        }
        self.title = game['title']
        self.location = game['location']
        self.publisher = game['publisher']
        self.sourceRom = game['sourceRom']
        self.saveType = game['saveType']
        self.romSize = game['romSize']
        self.releaseNumber = '%04d' % (game['releaseNumber'])
        self.language = game['language']
        self.comment = game['comment']
        self.romCRC = game['romCRC']

    def __format__(self, fmt):
        tmp_fmt = fmt
        for k, v in self._formats.items():
            tmp_fmt = tmp_fmt.replace(k, v)
        return tmp_fmt.format(game=self)


class XmlDataLoader:
    def __init__(self):
        pass

    def load_xml_tree(self, file):
        #打开xml文档
        _ext_list = ['.zip']
        ext = os.path.splitext(file)[-1]
        if ext in _ext_list:
            zdata = load_xml_from_zip(file)
            tree = ET.fromstring(zdata)
        else:
            tree = ET.ElementTree(file=file)
            tree = tree.getroot()
        return tree

    def load(self, file, cfg=None):
        data = {
            'canopen_ext_list': list(),
            'game_list': list(),
            'romcrc_dict': dict(),
            'title_dict': dict(),
            'ori_title_dict': dict(),
        }

        tree = self.load_xml_tree(file)

        imURL = tree.find('configuration/newDat/imURL')
        if imURL is not None:
            imURL = imURL.text
        else:
            imURL = ''

        imFolder = tree.find('configuration/imFolder')
        if imFolder is not None:
            imFolder = imFolder.text
        else:
            imFolder = ''

        romTitle = tree.find('configuration/romTitle')
        if romTitle is not None:
            romTitle = romTitle.text
        else:
            romTitle = ''

        for extension in tree.iterfind('configuration/canOpen/extension'):
            data['canopen_ext_list'].append(extension.text)
        print('imURL: %s, imFolder: %s, romTitle: %s' % (imURL, imFolder, romTitle))

        index = 0
        for game in tree.iterfind('games/game'):
            index = index + 1
            ori_title = game.find('title').text
            title = ori_title
            location = game.find('location').text
            location = genLocation(location)
            publisher = game.find('publisher').text
            sourceRom = game.find('sourceRom').text

            saveType = game.find('saveType')
            if saveType is not None:
                saveType = saveType.text
            else:
                saveType = ''
            romSize = game.find('romSize').text

            releaseNumber = game.find('releaseNumber')
            if releaseNumber is not None:
                releaseNumber = releaseNumber.text
            else:
                releaseNumber = 0
            releaseNumber = int(releaseNumber)
            language = game.find('language').text
            comment = game.find('comment').text
            romCRC = game.find('files/romCRC').text.lower()
            imageNumber = game.find('imageNumber').text
            imageNumber = int(imageNumber)
            extension = game.find('files/romCRC').attrib['extension']

            info = {
                'ori_title': ori_title,
                'title': title,
                'location': location,
                'publisher': publisher,
                'sourceRom': sourceRom,
                'saveType': saveType,
                'romSize': romSize,
                'releaseNumber': releaseNumber,
                'language': language,
                'comment': comment,
                'romCRC': romCRC,
                'imageNumber': imageNumber,
                'extension': extension,
                'imURL': imURL,
                'imFolder': imFolder,
                'romTitle': romTitle,
            }
            if cfg and cfg['title_use_comment'] == 1:
                info['title'] = comment
            if cfg and cfg['releaseNumber_use_imageNumber'] == 1:
                info['releaseNumber'] = imageNumber
            if cfg and cfg['rom_title']:
                info['romTitle'] = cfg['rom_title']
            # logging.info('%s', json.dumps(info, ensure_ascii=False))
            data['game_list'].append(info)
            data['romcrc_dict'][romCRC] = info
            data['title_dict'][title] = info
            data['ori_title_dict'][ori_title] = info
        return data

    def __clean_title(self, title):
        title = str(title)
        title = re.sub('\\(.*\\)', '', title)
        title = re.sub('\\(.*', '', title)
        title = title.strip()
        title = ' '.join(title.split())# 将连续多个空格，变成一个空格
        return title

    @staticmethod
    def genGameName(game):
        fmt_game = FmtGame(game)
        return format(fmt_game, game['romTitle'])

    @staticmethod
    def genGameNum(game):
        fmt_game = FmtGame(game)
        return format(fmt_game, '%u')

    @staticmethod
    def genGameCrc(game):
        fmt_game = FmtGame(game)
        return format(fmt_game, '%c')
