import React, { Component } from 'react';
// import { Form, Field } from '@ice/form';
import IceImg from '@icedesign/img';
import { Grid, Button, Form, Field, Input, Upload, Select } from '@alifd/next';
import IceNotification from '@icedesign/notification';
import GameUtils from '../../../utils/GameUtils';

import styles from './ItemEditor.module.scss';

const FormItem = Form.Item;

const { Row, Col } = Grid;

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
      this.setState({imgObj});
    }
  }

  onSubmit = (values) => {
    console.log('ItemEditor onSubmit. values: %s', values);
    if (!this.field.getValue('releaseNumber')) {
      IceNotification.error({
        message: '参数错误',
        description:
          '缺少游戏编号',
      });
      return;
    }

    if (!this.field.getValue('imageNumber')) {
      IceNotification.error({
        message: '参数错误',
        description:
          '缺少图片编号',
      });
      return;
    }

    if (!this.field.getValue('crc32')) {
      IceNotification.error({
        message: '参数错误',
        description:
          '缺少crc32',
      });
      return;
    }

    if (this.props.innerSubmit) {
      this.props.innerSubmit(this.field.values);
    }
  }

  onClickRomFile = (files) => {
    const file = files[files.length - 1];
    console.log('load rom file: ', file);

    const reader = new FileReader();
    reader.readAsText(file.originFileObj, 'UTF-8');
    reader.onload = (event) => {
      const crc32 = GameUtils.calcFileCrc32(event.target.result);
      this.setState({ crc32 });
    };
  }

  genImageObj = (imageNumber, config, context) => {
    return GameUtils.genImageObj(
      imageNumber, config.newDat.imURL, config.imFolder, context.gameImgsPath);
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
    this.setState({ scrapyObj: imgObj });
  }

  genScrapyImageObj = (type, scrapyImageNumber, imageNumber) => {
    if (!noIntroImageDict[type]) {
      return null;
    }
    const name = noIntroImageDict[type];
    const imgUrl = 'http://nointro.free.fr/imgs';
    return GameUtils.genImageObj(scrapyImageNumber, imgUrl, name, null);
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
        <FormItem label="游戏编号：">
          <Input {...init('releaseNumber')} />
        </FormItem>
        <FormItem label="标题：">
          <Input {...init('title')} />
        </FormItem>
        <FormItem label="备注：">
          <Input {...init('comment')} />
        </FormItem>
        <FormItem label="来源：">
          <Input {...init('sourceRom')} />
        </FormItem>
        <FormItem label="图片编号：">
          <div className={styles.cenGroup}>
            <span>
              <Input {...init('imageNumber', {
                props: {
                  onChange: (v) => this.onImageNumberChange(v),
                },
              })} />
            </span>
          </div>
        </FormItem>
        {
          (this.state.imgObj) &&
          <FormItem label="图片预览：">
            <IceImg src={this.state.imgObj.a} type="contain" className={styles.img} style={{ marginRight: '10px' }} />
            <IceImg src={this.state.imgObj.b} type="contain" className={styles.img} style={{ marginRight: '10px' }} />
          </FormItem>
        }
        <FormItem label="图片抓取：">
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
        </FormItem>
        <FormItem label="noIntro图库：">
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
        </FormItem>
        {
          (this.state.scrapyObj) &&
          <FormItem label="图片预览：">
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
          </FormItem>
        }
        <FormItem label="rom文件">
          <Upload accept=".xml" onChange={(files) => this.onClickRomFile(files)}>
            <div className={styles.cenGroup}>
              <span>用来计算crc32和尺寸</span>
              <span>
                <Button type="primary">选择文件</Button>
              </span>
            </div>
          </Upload>
        </FormItem>
        <FormItem label="crc32：">
          <Input name="crc32" disabled />
        </FormItem>
        <FormItem label="尺寸：">
          <Input name="romSize" disabled />
        </FormItem>

        {/* <FormItem label="语言：">
          <Radio.Group name="language">
            <Radio value="0">日语</Radio>
            <Radio value="1">英语</Radio>
            <Radio value="2">法语</Radio>
            <Radio value="3">汉语</Radio>
          </Radio.Group>
        </FormItem>

        <FormItem label="地区：">
          <Radio.Group name="location">
            <Radio value="0">日本</Radio>
            <Radio value="1">美国</Radio>
            <Radio value="2">英国</Radio>
          </Radio.Group>
        </FormItem>

        <FormItem label="发行：">
          <Radio.Group name="publisher">
            <Radio value="0">日语</Radio>
            <Radio value="1">英语</Radio>
            <Radio value="2">法语</Radio>
            <Radio value="3">汉语</Radio>
          </Radio.Group>
        </FormItem> */}

        <Row style={{ marginTop: 24 }}>
          <Col offset="6">
            <Form.Submit type="primary" onClick={() => this.onSubmit()}>确定</Form.Submit>
          </Col>
        </Row>
      </Form>
    );
  }
}
