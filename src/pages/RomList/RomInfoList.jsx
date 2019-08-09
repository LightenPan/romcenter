import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
import { Grid, Pagination, Button, Dialog, Input, Loading, Radio } from '@alifd/next';
import Files from 'react-files'
import GameUtils from '@/utils/GameUtils';

import SingleItem from './SingleItem';
import ItemEditor from './ItemEditor';

import styles from './RomInfoList.module.scss';

const { Row, Col } = Grid;

export default class RomInfoList extends Component {
  static displayName = 'RomInfoList';

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
        pageCount: 20,
        gameImgsPath: '',
      },
      gameImgsPathInput: 'http://localhost/imgs',
      showAddDialog: false,
      showLoading: false,
      filterType: 0,
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
    // const context = localStorage.getItem("context");
    // if (context) {
    //   try {
    //     const newContext = JSON.parse(context);
    //     this.setState({
    //       context: newContext,
    //       gameImgsPathInput: newContext.gameImgsPath});
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
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

  saveGameList = (isModify, game) => {
    const {xmlData} =  this.state;
    let {showGameList, allGameList} =  this.state;

    if (isModify) {
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
    } else {
      xmlData.dat.games.game.push(game);
      allGameList = xmlData.dat.games.game;
      const {context} = this.state;
      const start = (context.pageIndex - 1) * context.pageCount;
      const end = Math.min(start + context.pageCount, allGameList.length);
      showGameList = allGameList.slice(start, end);
    }
    localStorage.setItem("xmldata", JSON.stringify(xmlData));
    localStorage.setItem("context", JSON.stringify(this.state.context));
    this.setState({ showAddDialog: false, allGameList, showGameList, xmlData });
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
        const {context} = this.state;
        context.pageIndex = 1;
        this.setState({context});
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
      const builder = new xml2js.Builder({ explicitArray: false, explicitChildren: true }); // 用于把json对象解析为xml
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

  onClickPageSizeChange = (size) => {
    const current = 1;
    const { allGameList, context } = this.state;
    context.pageIndex = current;
    context.pageCount = size;
    const start = (current - 1) * this.state.context.pageCount;
    const end = Math.min(start + this.state.context.pageCount, allGameList.length);
    const showGameList = allGameList.slice(start, end);
    console.log('page change showGameList. start: %s, end: %s', start, end);
    this.setState({ context, showGameList });
  }

  onUpdateGame = (game) => {
    console.log('onUpdateGame. game: %s', game);
    this.saveGameList(true, game);
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
    const config = this.state.xmlData.dat.configuration;
    game.files = {
      romCRC: {
        _: values.crc32,
        $: {
          extension: config.canOpen.extension,
        },
      },
    };
    this.saveGameList(false, game);
  }

  onBtAddGameFromFiles = async (files) => {
    const {xmlData, context} = this.state;
    const config = this.state.xmlData.dat.configuration;
    let allGameList = xmlData.dat.games.game;
    const tmpList = [];
    this.setState({showLoading: true});
    // 这里同步读取，保证添加顺序
    for (let index = 0; index < files.length; ++index) {
      const file = files[index];
      const info = await GameUtils.loadGameFromZipFile(file); // eslint-disable-line no-await-in-loop
      const releaseNumber = allGameList.length + index + 1;
      const game = {
        title: info.name,
        releaseNumber,
        imageNumber: releaseNumber,
        romSize: info.size,
        files: {
          romCRC: {
            _: info.crc32,
            $: {
              extension: config.canOpen.extension,
            },
          },
        },
      }
      const newGame = GameUtils.newXmlGameInfo(config, game);
      tmpList.push(newGame);
    }
    // 清空文件，避免再次添加时，重复读取文件
    files.splice(0, files.length);

    xmlData.dat.games.game = xmlData.dat.games.game.concat(tmpList);
    allGameList = xmlData.dat.games.game;
    const start = (context.pageIndex - 1) * context.pageCount;
    const end = Math.min(start + context.pageCount, allGameList.length);
    const showGameList = allGameList.slice(start, end);
    this.setState({ showLoading: false, allGameList, showGameList, xmlData });
    localStorage.setItem("xmldata", JSON.stringify(xmlData));
    localStorage.setItem("context", JSON.stringify(this.state.context));
  }

  onClickFilter = () => {
    Dialog.confirm({
      title: '选择过滤条件',
      content: (
        <div className={styles.renderedContainer}>
          <h3>列表条件</h3>
          <Radio.Group
            // value={this.state.filterType}
            itemDirection='ver'
            onChange={(val) => {
              this.setState({filterType: val});
            }}
          >
            <Radio value={0}>不过滤</Radio>
            <Radio value={1}>只显示空备注数据</Radio>
          </Radio.Group>
        </div>

      ),
      onOk: () => {
        const { xmlData } = this.state;
        let allGameList = xmlData.dat.games.game;
        if (this.state.filterType === 1) {
          allGameList = xmlData.dat.games.game.filter((item) => {
            if (item.comment === '') {
              return true;
            }
            return false;
          })
        }
        const current = 1;
        const start = (current - 1) * this.state.context.pageCount;
        const end = Math.min(start + this.state.context.pageCount, allGameList.length);
        const showGameList = allGameList.slice(start, end);
        this.setState({ allGameList, showGameList });
      },
      // onCancel: () => console.log('cancel')
    });
  }

  renderActionBar() {
    return (
      <div className={styles.cenGroup}>
      <span>游戏封面图-主目录：</span>
      <span>
        <Input value={this.state.gameImgsPathInput} onChange={(text) => {
          this.setState({ gameImgsPathInput: text });
        }} />
      </span>

      <span>
        <Files
          onChange={(files) => {
            const file = files[files.length - 1];
            this.onClickLoadXml(file);
          }}
          accepts={['.xml']}
          multiple
          clickable
        >
          <Button type="primary">选择XML文件</Button>
        </Files>
      </span>

      {
        (this.state.selectFile) &&
        <span>
          <span>选定文件：{this.state.selectFile}</span>
          <span>
            <Button type="primary" onClick={() => this.onClickSaveNewXml()}>
              保存修改文件
          </Button>
            <a id="Download" target="_blank" style={{ display: "none" }}>下载</a>
          </span>
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

      <span>
        <Files
          // className='files-dropzone'
          onChange={async files => await this.onBtAddGameFromFiles(files)}
          accepts={['.zip']}
          multiple
          clickable
        >
          <Button type="primary">批量从zip文件添加记录</Button>
        </Files>
        <Loading
          visible={this.state.showLoading}
          fullScreen
          shape="fusion-reactor" />
      </span>

      <span>
        <Button type="primary" onClick={() => this.onClickFilter()}>
          过滤数据
        </Button>
      </span>
    </div>
    );
  }

  renderPagination() {
    if (!this.state.selectFile) {
      return;
    }
    return (
      <Pagination
        style={{ paddingLeft: '10px', paddingBottom: '10px' }}
        current={this.state.context.pageIndex}
        pageSize={this.state.context.pageCount}
        total={this.state.allGameList.length}
        onChange={(current) => this.onClickPageChange(current)}
        totalRender={total => `总数: ${total}`}
        pageSizeSelector='dropdown'
        pageSizeList={[10, 20, 30, 40, 50, 100]}
        onPageSizeChange={(size) => this.onClickPageSizeChange(size)}
      />
    );
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
            {this.renderActionBar()}
          </Row>

          <Row wrap gutter={20}>
            {this.renderPagination()}
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

          <Row wrap gutter={20}>
            { this.renderActionBar() }
          </Row>

          <Row wrap gutter={20}>
            { this.renderPagination() }
          </Row>
        </div>
      </IceContainer>
    );
  };
}
