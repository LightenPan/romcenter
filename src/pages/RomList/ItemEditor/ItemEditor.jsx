import React, { Component } from 'react';
import IceImg from '@icedesign/img';
import { Button, Form, Field, Input, Select, Upload } from '@alifd/next';
import IceNotification from '@icedesign/notification';
// import { FilePicker } from 'react-file-picker'

import GameUtils from '../../../utils/GameUtils';

import styles from './ItemEditor.module.scss';

const noIntroImageDict = {
  WSC: 'Official No-Intro Bandai WonderSwan Color',
  WS: 'Official No-Intro Bandai WonderSwan',
  'NEC-PC': 'Official No-Intro NEC PC Engine TurboGrafx 16',
  N64: 'Official No-Intro Nintendo 64',
  DNS: 'Official No-Intro Nintendo Dual Screen',
  GBA: 'Official No-Intro Nintendo Gameboy Advance Alpha',
  GBC: 'Official No-Intro Nintendo Gameboy Color',
  GB: 'Official No-Intro Nintendo Gameboy',
  FC: 'Official No-Intro Nintendo NES - Famicom',
  SFC: 'Official No-Intro Nintendo Super NES - Super Famicom',
  SNPC: 'Official No-Intro SNK NeoGeo Pocket Color',
  SNP: 'Official No-Intro SNK NeoGeo Pocket',
  SGG: 'Official No-Intro Sega GameGear',
  SGM: 'Official No-Intro Sega Genesis Megadrive 32X',
  SMS: 'Official No-Intro Sega Master System',
  // SSS: 'Official No-Intro Sega SG1000-SC3000',
}

export default class ItemEditor extends Component {
  static displayName = 'ItemEditor';

  static propTypes = {};

  static defaultProps = {
    releaseNumber: 0,
    innerSubmit: null,
    game: null,
  };

  field = new Field(this, {
    onChange: (name, value) => {
      console.log('Field onChange. name: %s, value: %s', name, value);
    },
  });

  constructor(props) {
    super(props);
    this.state = {
      imgObj: null,
      scrapyObj: null,
    };
  }

  // 在组件挂载之前把数据设置进去(可以用initValue替代这种用法)
  componentWillMount = () => {
    if (!this.props.isModify) {
      this.field.setValue('releaseNumber', this.props.releaseNumber);
    } else {
      const keyList = [
        'releaseNumber',
        'imageNumber',
        'title',
        'sourceRom',
        'comment',
        'romSize',
        'publisher',
        'location',
        'language',
      ];
      const game = this.props.game;
      keyList.map((key) => {
        return this.field.setValue(key, game[key]);
      });
      this.field.setValue('crc32', game.files.romCRC._);

      const imageNumber = this.props.game.imageNumber;
      const config = this.props.config;
      const context = this.props.context;
      const imgObj = this.genImageObj(imageNumber, config, context);
      this.setState({ imgObj });
    }
  }

  onSubmit = () => {
    if (!this.field.getValue('releaseNumber')) {
      IceNotification.error({
        message: '参数错误',
        description:
          '缺少游戏编号',
      });
      return null;
    }

    if (!this.field.getValue('imageNumber')) {
      IceNotification.error({
        message: '参数错误',
        description:
          '缺少图片编号',
      });
      return null;
    }

    if (!this.field.getValue('crc32')) {
      IceNotification.error({
        message: '参数错误',
        description:
          '缺少crc32',
      });
      return null;
    }

    // if (this.props.innerSubmit) {
    //   this.props.innerSubmit(this.field.values);
    // }

    return this.field.values;
  }

  onReadRomFile = (fileObj) => {
    const jszip = require("jszip");
    jszip.loadAsync(fileObj) // 1) read the Blob
      .then((zip) => {
        let count = 0;
        zip.forEach((_, file) => {  // 2) print entries
          count++;
          if (count > 1) {
            return;
          }
          const romSize = file._data.uncompressedSize; // eslint-disable-line no-underscore-dangle
          const crc32 = file._data.crc32; // eslint-disable-line no-underscore-dangle
          const hexCrc32 = GameUtils.lpad((crc32 >>> 0).toString(16), 8, '0'); // eslint-disable-line no-bitwise
          this.field.setValue('crc32', hexCrc32.toUpperCase());
          this.field.setValue('romSize', romSize);
        });
      });
  }

  onReadRomFileUpdateExt = (fileObj) => {
    const jszip = require("jszip");
    jszip.loadAsync(fileObj) // 1) read the Blob
      .then((zip) => {
        let count = 0;
        zip.forEach((_, file) => {  // 2) print entries
          count++;
          if (count > 1) {
            return;
          }
          const romSize = file._data.uncompressedSize; // eslint-disable-line no-underscore-dangle
          const crc32 = file._data.crc32; // eslint-disable-line no-underscore-dangle
          const hexCrc32 = GameUtils.lpad((crc32 >>> 0).toString(16), 8, '0'); // eslint-disable-line no-bitwise
          this.field.setValue('crc32', hexCrc32.toUpperCase());
          this.field.setValue('romSize', romSize);
          this.field.setValue('title', fileObj.name);
          if (!this.field.getValue('imageNumber')) {
            const releaseNumber = this.field.getValue('releaseNumber');
            this.field.setValue('imageNumber', releaseNumber);
          }
        });
      });
  }

  genImageObj = (imageNumber, config, context) => {
    return GameUtils.genImageObj(
      imageNumber, config.newDat.imURL, context.gameImgsPath, config.imFolder);
  }

  onImageNumberChange = (text) => {
    console.log('onImageNumberChange: ', text);
    const imageNumber = text;
    if (!this.field.getValue('imgNoIntroType')) {
      return;
    }
    const config = this.props.config;
    const context = this.props.context;
    const imgObj = this.genImageObj(imageNumber, config, context);
    this.setState({ imgObj });
  }

  genScrapyImageObj = (type, scrapyImageNumber, imageNumber) => {
    if (!noIntroImageDict[type]) {
      return null;
    }
    const name = noIntroImageDict[type];
    const imgUrl = `http://nointro.free.fr/imgs/${name}`;
    return GameUtils.genImageObj(scrapyImageNumber, imgUrl, null, null, imageNumber);
  }

  onImageScrapyChange = (text) => {
    console.log('onImageScrapyChange: ', text);
    const scrapyImageNumber = text;
    if (!this.field.getValue('imgNoIntroType')) {
      return;
    }
    const type = this.field.getValue('imgNoIntroType');
    const imageNumber = this.field.getValue('imageNumber');
    const imgObj = this.genScrapyImageObj(type, scrapyImageNumber, imageNumber);
    this.setState({ scrapyObj: imgObj });
  }

  onImgNoIntroTypeChange = (text) => {
    console.log('onImgNoIntroTypeChange: ', text);
    const type = text;
    const scrapyImageNumber = this.field.getValue('scrapyImageNumber');
    const imageNumber = this.field.getValue('imageNumber');
    const imgObj = this.genScrapyImageObj(type, scrapyImageNumber, imageNumber);
    this.setState({ scrapyObj: imgObj });
  }

  onClickSaveImage = (imgUrl, name) => {
    const FileSaver = require('file-saver');
    const proxyUrl = `/imgProxy?url=${imgUrl}`;
    FileSaver.saveAs(proxyUrl, name);
  }

  render() {
    const init = this.field.init;
    return (
      <Form
        field={this.state.field}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        labelAlign="left"
        style={{ width: '600px' }}>
        <Form.Item label="游戏编号：">
          <Input {...init('releaseNumber')} />
        </Form.Item>
        <Form.Item label="标题：">
          <Input {...init('title')} />
        </Form.Item>
        <Form.Item label="备注：">
          <Input {...init('comment')} />
        </Form.Item>
        <Form.Item label="来源：">
          <Input {...init('sourceRom')} />
        </Form.Item>
        <Form.Item label="图片编号：">
          <div className={styles.cenGroup}>
            <span>
              <Input {...init('imageNumber', {
                props: {
                  onChange: (v) => this.onImageNumberChange(v),
                },
              })} />
            </span>
          </div>
        </Form.Item>
        {
          (this.state.imgObj) &&
          <Form.Item label="图片预览：">
            <IceImg src={this.state.imgObj.a} type="contain" className={styles.img} style={{ marginRight: '10px' }} />
            <IceImg src={this.state.imgObj.b} type="contain" className={styles.img} style={{ marginRight: '10px' }} />
          </Form.Item>
        }
        <Form.Item label="图片抓取：">
          <div className={styles.cenGroup}>
            <span>
              <Input {...init('scrapyImageNumber', {
                props: {
                  onChange: (v) => this.onImageScrapyChange(v),
                },
              })} />
            </span>
            <span>
              <Button
                type="primary"
                onClick={() => {
                  const scrapyObj = this.state.scrapyObj;
                  this.onClickSaveImage(scrapyObj.a, scrapyObj.namea);
                }}
              >
                下载a.png
              </Button>
            </span>
            <span>
              <Button
                type="primary"
                onClick={() => {
                  const scrapyObj = this.state.scrapyObj;
                  this.onClickSaveImage(scrapyObj.b, scrapyObj.nameb);
                }}
              >
                下载b.png
              </Button>
            </span>
            <span>
              <a id="Download" target="_blank" style={{ display: "none" }}>下载</a>
            </span>
          </div>
        </Form.Item>
        <Form.Item label="noIntro图库：">
          <Select {...init('imgNoIntroType', {
            props: {
              onChange: (v) => this.onImgNoIntroTypeChange(v),
            },
          })} style={{ width: 500 }}>
            {
              Object.keys(noIntroImageDict).map((key) => {
                return (
                  <Select.Option value={key} key={key}>{noIntroImageDict[key]}</Select.Option>
                )
              })
            }
          </Select>
        </Form.Item>
        {
          (this.state.scrapyObj) &&
          <Form.Item label="图片预览：">
            <IceImg
              src={this.state.scrapyObj.a}
              title={this.state.scrapyObj.namea}
              type="contain"
              className={styles.img}
              style={{ marginRight: '10px' }} />
            <IceImg
              src={this.state.scrapyObj.b}
              title={this.state.scrapyObj.nameb}
              type="contain"
              className={styles.img}
              style={{ marginRight: '10px' }} />
          </Form.Item>
        }
        <Form.Item label="rom文件">
          <Upload
            action=""
            accept="application/zip"
            onChange={(files) => {
              const file = files[files.length - 1];
              this.onReadRomFileUpdateExt(file.originFileObj);
            }}
          >
            <div className={styles.cenGroup}>
              <span>用来计算crc32和尺寸，更新标题</span>
              <span>
                <Button type="primary">选择文件</Button>
              </span>
            </div>
          </Upload>
          <Upload
            action=""
            accept="application/zip"
            onChange={(files) => {
              const file = files[files.length - 1];
              this.onReadRomFile(file.originFileObj);
            }}
          >
            <div className={styles.cenGroup}>
              <span>计算crc32和尺寸，不更新标题</span>
              <span>
                <Button type="primary">选择文件</Button>
              </span>
            </div>
          </Upload>
          {/* <FilePicker
            extensions={['zip']}
            onChange={FileObject => this.onReadRomFile(FileObject)}
          >
            <div className={styles.cenGroup}>
              <span>用来计算crc32和尺寸</span>
              <span>
                <Button type="primary">选择文件</Button>
              </span>
            </div>
          </FilePicker> */}
        </Form.Item>
        <Form.Item label="crc32：">
          <Input {...init('crc32')} disabled />
        </Form.Item>
        <Form.Item label="尺寸：">
          <Input {...init('romSize')} disabled />
        </Form.Item>

        {/* <Form.Item label="语言：">
          <Radio.Group name="language">
            <Radio value="0">日语</Radio>
            <Radio value="1">英语</Radio>
            <Radio value="2">法语</Radio>
            <Radio value="3">汉语</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="地区：">
          <Radio.Group name="location">
            <Radio value="0">日本</Radio>
            <Radio value="1">美国</Radio>
            <Radio value="2">英国</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="发行：">
          <Radio.Group name="publisher">
            <Radio value="0">日语</Radio>
            <Radio value="1">英语</Radio>
            <Radio value="2">法语</Radio>
            <Radio value="3">汉语</Radio>
          </Radio.Group>
        </Form.Item> */}
      </Form>
    );
  }
}
