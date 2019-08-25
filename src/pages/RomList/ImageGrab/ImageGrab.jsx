import React, { Component } from 'react';
import IceImg from '@icedesign/img';
import { Button, Grid, Input, Select, Radio } from '@alifd/next';

import GameUtils from '../../../utils/GameUtils';

import styles from './ImageGrab.module.scss';

const { Row, Col } = Grid;

const datUrlPrex = `/cdn/RetroGame/dats`;
const imgsUrlPrex = '/cdn/RetroGame/imgs';
const lpLplName = {
  WSC: 'LP_WSC_OL',
  WS: 'LP_WS_OL',
  NECPC: 'LP_NECPC_OL',
  N64: 'LP_N64_OL',
  NDS: 'LP_NDS_OL',
  GBA: 'LP_GBA_OL',
  GBC: 'LP_GBC_OL',
  GB: 'LP_GB_OL',
  FC: 'LP_FC_OL',
  SFC: 'LP_SFC_OL',
  NGPC: 'LP_NGPC_OL',
  NGP: 'LP_NGP_OL',
  SGG: 'LP_SGG_OL',
  SGM: 'LP_SGM_OL',
  SMS: 'LP_SMS_OL',
  FBA: 'LP_FBA_OL',
}

export default class ImageGrab extends Component {
  static displayName = 'ImageGrab';

  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      lplName: '',
      allGameList: [],
      showGameList: [],
      searchTypeName: 0,
    };
  }

  prepareLplData = async (name) => {
    // 下载dat文件
    const url = `${datUrlPrex}/${name}.xml`;
    const resp = await fetch(url);
    const xmlText = await resp.text();

    // 解析xml为json对象
    const xml2js = require('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false });
    parser.parseString(xmlText, (error, xmlData) => {
      if (error) throw error;
      const allGameList = xmlData.dat.games.game;
      this.setState({lplName: name, allGameList});
    });
  }

  searchName = (queryText) => {
    const { allGameList } = this.state;
    const prex = `${imgsUrlPrex}/${this.state.lplName}`;
    const showGameList = allGameList.filter((item) => {
      if (this.state.searchTypeName == 1) {
        return item.comment.match(queryText);
      }
      return item.title.match(queryText);
    });
    showGameList.forEach((item) => {
      const folder = GameUtils.genImageNumFolder(item.imageNumber);
      item.image = {
        a: `${prex}/${folder}/${item.imageNumber}a.png`,
        b: `${prex}/${folder}/${item.imageNumber}b.png`,
      }
    })
    this.setState({showGameList: showGameList.slice(0, 20)});
  }

  onClickSaveImage = (imgUrl, name) => {
    const FileSaver = require('file-saver');
    // const proxyUrl = `/imgProxy?url=${imgUrl}`;
    FileSaver.saveAs(imgUrl, name);
  }

  render() {
    return (
      <div>
        <h3>搜索列表</h3>
        <div className={styles.renderedContainer}>
          {/* <Radio.Group
            // value={this.state.filterType}
            itemDirection='ver'
            onChange={async (val) => await this.prepareLplData(val)}
          >
          {
            Object.keys(lpLplName).map((key) => {
              return (
              <Radio value={lpLplName[key]} key={key}>{key}</Radio>
              );
            })
          }
          </Radio.Group> */}
          <Select
            onChange={async (val) => await this.prepareLplData(val)}
            style={{ width: 500 }}
          >
            {
              Object.keys(lpLplName).map((key) => {
                return (
                  <Select.Option value={lpLplName[key]} key={key}>{key}</Select.Option>
                )
              })
            }
          </Select>
        </div>
        <h3>搜索字段</h3>
        <div className={styles.renderedContainer}>
          <Radio.Group
            value={this.state.searchTypeName}
            itemDirection='ver'
            onChange={(val) => {
              this.setState({searchTypeName: val});
            }}
          >
            <Radio value={0}>标题</Radio>
            <Radio value={1}>备注</Radio>
          </Radio.Group>
        </div>
        <h3>搜索</h3>
        <div className={styles.renderedContainer}>
          <Input onChange={(val) => this.searchName(val)} />
        </div>

        <Row wrap gutter={20}>
          {
            this.state.showGameList.map((item, index) => {
              return (
                <Col span="8" key={index}>
                  <div className={styles.body}>
                    <div className={styles.item}>
                      <div className={styles.imgGroup}>
                        <span className={styles.imgItem}>
                          <IceImg src={item.image.a} width={160} type="contain" />
                        </span>
                        <span className={styles.imgItem}>
                          <IceImg src={item.image.b} width={160} type="contain" />
                        </span>
                      </div>
                    </div>
                    <div className={styles.item}>
                      <span className={styles.label}>标题: </span>
                      <span className={styles.value}>{item.title}</span>
                    </div>
                    <div className={styles.item}>
                      <span className={styles.label}>备注: </span>
                      <span className={styles.value}>{item.comment}</span>
                    </div>
                    <div className={styles.cenGroup}>
                      <span>
                        <Button
                          type="primary"
                          onClick={() => {
                            this.onClickSaveImage(item.image.a, `${this.props.imageNumber}a.png`);
                          }}
                        >
                          下载a.png
                        </Button>
                      </span>
                      <span>
                        <Button
                          type="primary"
                          onClick={() => {
                            this.onClickSaveImage(item.image.b, `${this.props.imageNumber}b.png`);
                          }}
                        >
                          下载b.png
                        </Button>
                      </span>
                    </div>
                  </div>
                </Col>
              );
            })
          }
        </Row>
      </div>
    );
  }
}
