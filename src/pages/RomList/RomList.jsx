import React, { Component } from 'react';
import { Grid, Pagination, Button, Upload, Dialog, Input } from '@alifd/next';
import SingleItem from './SingleItem';
import ItemEditor from './ItemEditor';

import styles from './RomList.module.scss';

const { Row, Col } = Grid;

export default class RomList extends Component {
  static displayName = 'RomList';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      selectFile: '',
      xmlData: null,
      allGameList: [],
      showGameList: [],
      pageIndex: 1,
      pageCount: 100,
      gameImgsPath: '',
      gameImgsPathInput: 'http://localhost/imgs',
    };
  }

  onClickLoadXml = (files) => {
    const file = files[files.length - 1];
    console.log('xml data file: ', file);

    const reader = new FileReader();
    reader.readAsText(file.originFileObj, 'UTF-8');
    reader.onload = (event) => {
      const xml2js = require('xml2js');
      // 解析xml为json对象
      const parser = new xml2js.Parser({ explicitArray: false });
      parser.parseString(event.target.result, (error, res) => {
        if (error) throw error;
        console.log(res);
        const allGameList = res.dat.games.game;
        const start = (this.state.pageIndex - 1) * this.state.pageCount;
        const end = Math.min(start + this.state.pageCount, allGameList.length);
        const showGameList = allGameList.slice(start, end);
        const imgsPath = this.state.gameImgsPathInput;
        this.setState({
          selectFile: file.name,
          xmlData: res,
          allGameList,
          showGameList,
          gameImgsPath: imgsPath,
        });
      });
    };
  }

  onAddRomSubmit = (info) => {
    console.log('onAddRomSubmit: ', info);
  }

  onAddRomDialog = () => {
    const config = this.state.xmlData.dat.configuration;
    const releaseNumber = this.state.allGameList.length + 1;
    Dialog.confirm({
      title: '新增Rom信息',
      content: <ItemEditor {...{ isModify: false, releaseNumber, innerSubmit: this.onAddRomSubmit, config }} />,
      footerActions: [],
      isFullScreen: true,
      // onOk: () => console.log('ok'),
      // onCancel: () => console.log('cancel')
    });
  }

  onClickSaveNewXml = () => {
    const downLoadDom = document.getElementById("Download");
    if (downLoadDom) {
      // 使用 createObjectURL 生成地址，格式为 blob:null/fd95b806-db11-4f98-b2ce-5eb16b38ba36
      const xml2js = require('xml2js');
      const builder = new xml2js.Builder({ explicitArray: false }); // 用于把json对象解析为xml
      const outxml = builder.buildObject(this.state.xmlData);
      const myBlob = new Blob([outxml], { type: "application/xml" });
      const url = window.URL.createObjectURL(myBlob);
      console.log('下载文件已就绪: ', url);
      // 模拟a标签点击进行下载
      downLoadDom.href = url
      downLoadDom.download = this.state.selectFile;
      downLoadDom.click();
    }
  }

  onClickPageChange = (current) => {
    const { allGameList } = this.state;
    const start = (current - 1) * this.state.pageCount;
    const end = Math.min(start + this.state.pageCount, allGameList.length);
    const showGameList = allGameList.slice(start, end);
    console.log('page change showGameList. start: %s, end: %s', start, end);
    this.setState({ pageIndex: current, showGameList });
  }

  onUpdateGame = (game) => {
    console.log('onUpdateGame. game: %s', game);
    const { allGameList, showGameList } = this.state;
    const index = allGameList.indexOf(game);
    if (index < 0) {
      return;
    }
    allGameList[index] = game;

    const indexShowGame = showGameList.indexOf(game);
    if (index < 0) {
      return;
    }
    showGameList[indexShowGame] = game;
    this.setState({ allGameList, showGameList });
  }

  render() {
    return (
      <div className={styles.body}>
        <Row wrap gutter={20}>
          <div className={styles.cenGroup}>
            <span>
              <Upload accept=".xml" onChange={(files) => this.onClickLoadXml(files)}>
                <Button type="primary">选择XML文件</Button>
              </Upload>
            </span>
            <span>选定文件：{this.state.selectFile}</span>

            {
              (this.state.selectFile) &&
              <span>
                <Button type="primary" onClick={() => this.onClickSaveNewXml()}>
                  保存修改文件
                </Button>
                <a id="Download" target="_blank" style={{ display: "none" }}>下载</a>
              </span>
            }

            {
              (this.state.selectFile) &&
              <span>
                <Button type="primary" onClick={() => this.onAddRomDialog()}>
                  新增Rom
                </Button>
              </span>
            }
            <span>游戏封面图-主目录：</span>
            <span>
              <Input value={this.state.gameImgsPathInput} onChange={(text) => {
                this.setState({gameImgsPathInput: text});
              }} />
            </span>
          </div>
        </Row>

        <Row wrap gutter={20}>
          {
            this.state.showGameList.map((item, index) => {
              const config = this.state.xmlData.dat.configuration;
              const context = {
                gameImgsPath: this.state.gameImgsPath,
              }
              return (
                <Col l={6} s={6} xs={8} key={index}>
                  <SingleItem {...{ item, config, context, onUpdateGame: this.onUpdateGame }} />
                </Col>
              );
            })
          }
        </Row>

        {
          (this.state.selectFile) &&
          <Row wrap gutter={20}>
            <Pagination
              current={this.state.pageIndex}
              pageSize={this.state.pageCount}
              total={this.state.allGameList.length}
              onChange={(current) => this.onClickPageChange(current)}
              totalRender={total => `总数: ${total}`}
            />
          </Row>
        }
      </div>
    );
  };
}
