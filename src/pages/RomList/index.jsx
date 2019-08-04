import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
// import ContainerTitle from '@/components/ContainerTitle';
import { Grid, Pagination, Button, Dialog, Input, Upload } from '@alifd/next';
import { FilePicker } from 'react-file-picker'

import SingleItem from './SingleItem';
import ItemEditor from './ItemEditor';

import styles from './index.module.scss';
import { PassThrough } from 'stream';

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
      context: {
        pageIndex: 1,
        pageCount: 100,
        gameImgsPath: '',
      },
      gameImgsPathInput: 'http://localhost/imgs',
      showAddDialog: false,
    };
  }

  // 在组件挂载之前把数据设置进去(可以用initValue替代这种用法)
  componentWillMount = () => {
    const xmldata = localStorage.getItem("xmldata");
    const filename = localStorage.getItem("filename");
    if (filename && xmldata) {
      try {
        this.initGameList(filename, JSON.parse(xmldata));
      } catch (error) {
        console.log(error);
      }
    }
    const context = localStorage.getItem("context");
    if (context) {
      try {
        const newContext = JSON.parse(context);
        this.setState({
          context: newContext,
          gameImgsPathInput: newContext.gameImgsPath});
      } catch (error) {
        console.log(error);
      }
    }
  }

  initGameList = (filename, xmlData) => {
    const allGameList = xmlData.dat.games.game;
    const {context} = this.state;
    const start = (context.pageIndex - 1) * context.pageCount;
    const end = Math.min(start + context.pageCount, allGameList.length);
    const showGameList = allGameList.slice(start, end);
    context.gameImgsPath = this.state.gameImgsPathInput;
    this.setState({
      selectFile: filename,
      xmlData,
      allGameList,
      showGameList,
      context,
    });
  }

  onClickLoadXml = (fileObj) => {
    console.log('xml data file: ', fileObj);
    const reader = new FileReader();
    reader.readAsText(fileObj, 'UTF-8');
    reader.onload = (event) => {
      const xml2js = require('xml2js');
      // 解析xml为json对象
      const parser = new xml2js.Parser({ explicitArray: false });
      parser.parseString(event.target.result, (error, res) => {
        if (error) throw error;
        this.initGameList(fileObj.name, res);
        localStorage.setItem("filename", fileObj.name);
        localStorage.setItem("xmldata", JSON.stringify(res));
        localStorage.setItem("context", JSON.stringify(this.state.context));
      });
    };
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
    const { allGameList, context } = this.state;
    context.pageIndex = current;
    const start = (current - 1) * this.state.context.pageCount;
    const end = Math.min(start + this.state.context.pageCount, allGameList.length);
    const showGameList = allGameList.slice(start, end);
    console.log('page change showGameList. start: %s, end: %s', start, end);
    this.setState({ context, showGameList });
  }

  onUpdateGame = (game) => {
    console.log('onUpdateGame. game: %s', game);
    const { allGameList, showGameList, xmlData } = this.state;

    const indexShowGame = showGameList.indexOf(game);
    if (indexShowGame < 0) {
      return;
    }
    showGameList[indexShowGame] = game;

    const indexAllGame = allGameList.indexOf(game);
    if (indexAllGame < 0) {
      return;
    }
    allGameList[indexAllGame] = game;

    const indexXmlGames = xmlData.dat.games.game.indexOf(game);
    if (indexXmlGames < 0) {
      return;
    }
    xmlData.dat.games.game[indexXmlGames] = game;

    this.setState({ allGameList, showGameList, xmlData });
  }

  onAddGame = (values) => {
    console.log('onAddGame: ', values);
    const game = {};
    const keyList = [
      'releaseNumber',
      'imageNumber',
      'title',
      'romSize',
      'publisher',
      'location',
      'language',
      'comment',
      'sourceRom',
    ];
    keyList.map((key) => {
      return game[key] = values[key];
    });
    game.files.romCRC._ = values.crc32;
    this.setState({ showAddDialog: false });
  }

  render() {
    return (
      <IceContainer
        style={{
          padding: 0,
        }}
      >
        {/* <ContainerTitle title="Romåˆ—è¡¨" /> */}
        <div className={styles.body}>
          <Row wrap gutter={20}>
            <div className={styles.cenGroup}>
              <span>
                <Upload
                  action=""
                  accept="application/xml"
                  onChange={(files) => {
                    const file = files[files.length - 1];
                    this.onClickLoadXml(file.originFileObj);
                  }}
                >
                  <Button type="primary">选择XML文件</Button>
                </Upload>

                {/* <FilePicker
                  extensions={['xml']}
                  onChange={FileObject => this.onClickLoadXml(FileObject)}
                >
                  <Button type="primary">选择XML文件</Button>
                </FilePicker> */}
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
                  <Button type="primary" onClick={() => this.setState({ showAddDialog: true })}>
                    新增Rom
                </Button>
                  <Dialog
                    isFullScreen
                    title="增加Rom信息"
                    visible={this.state.showAddDialog}
                    onOk={() => {
                      const values = this.romAddEditor.onSubmit();
                      if (values) {
                        this.onAddGame(values);
                      }
                    }}
                    onCancel={() => this.setState({ showAddDialog: false })}
                    onClose={() => this.setState({ showAddDialog: false })}
                  >
                    <ItemEditor
                      ref={(c) => { this.romAddEditor = c; }}
                      {...{
                        isModify: false,
                        releaseNumber: this.state.allGameList.length + 1,
                        game: null,
                        config: this.props.config,
                        context: this.props.context,
                      }} />
                  </Dialog>
                </span>
              }
              <span>游戏封面图-主目录：</span>
              <span>
                <Input value={this.state.gameImgsPathInput} onChange={(text) => {
                  this.setState({ gameImgsPathInput: text });
                }} />
              </span>
            </div>
          </Row>

          <Row wrap gutter={20}>
            {
              this.state.showGameList.map((item, index) => {
                const config = this.state.xmlData.dat.configuration;
                const context = {
                  gameImgsPath: this.state.context.gameImgsPath,
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
                current={this.state.context.pageIndex}
                pageSize={this.state.context.pageCount}
                total={this.state.allGameList.length}
                onChange={(current) => this.onClickPageChange(current)}
                totalRender={total => `总数: ${total}`}
              />
            </Row>
          }
        </div>
      </IceContainer>
    );
  };
}
