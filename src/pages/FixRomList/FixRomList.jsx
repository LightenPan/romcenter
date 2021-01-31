import React, { Component } from 'react';
import { Loading, Grid, Pagination, Select, Search, Affix, Message} from '@alifd/next';
import IceContainer from '@icedesign/container';
import DataBinder from '@icedesign/data-binder';

import SearchGameImage from './SearchGameImage';

import FixRomImage from './FixRomImage';
import styles from './FixRomList.module.scss';

const { Row, Col } = Grid;


@DataBinder({
  'fixRomList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/LbGameInfo/fixRomList`,
    method: 'GET',
    withCredentials: true,
    params: {
      platform: '',
      offset: 0,
      count: 10,
      query: '',
    },
    // 接口默认数据
    defaultBindingData: {
      roms: [],
      total: 0,
    },
    success: (body) => {
      if (body.status !== 'SUCCESS') {
        // 后端返回的状态码错误
        Message.error(body.message);
      } else {
        // 成功不弹 toast，可以什么都不走
        // console.log('success');
      }
    },
  },
  'matchGameList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/LbGameInfo/atlasSearch`,
    method: 'GET',
    withCredentials: true,
    params: {
      platform: '',
      query: '',
      offset: 0,
      count: 20,
    },
    // 接口默认数据
    defaultBindingData: {
      games: [],
      total: 0,
    },
    success: (body) => {
      if (body.status !== 'SUCCESS') {
        // 后端返回的状态码错误
        Message.error(body.message);
      } else {
        // 成功不弹 toast，可以什么都不走
        // console.log('success');
      }
    },
  },
  'platList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/platList`,
    method: 'GET',
    withCredentials: true,
    params: {
    },
    // 接口默认数据
    defaultBindingData: {
      infos: [],
    },
    success: (body) => {
      if (body.status !== 'SUCCESS') {
        // 后端返回的状态码错误
        Message.error(body.message);
      } else {
        // 成功不弹 toast，可以什么都不走
        // console.log('success');
      }
    },
  },
  'imageTypeNameList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/LbGameInfo/imageTypeNameList`,
    method: 'GET',
    withCredentials: true,
    params: {
    },
    // 接口默认数据
    defaultBindingData: {
      infos: [],
    },
    success: (body) => {
      if (body.status !== 'SUCCESS') {
        // 后端返回的状态码错误
        Message.error(body.message);
      } else {
        // 成功不弹 toast，可以什么都不走
        // console.log('success');
      }
    },
  },
})


export default class FixRomList extends Component {
  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      context: {
        platform: 'LP_GBA_OL',
        imageTypeName: 'Screenshots',
        orderBy: null,
        queryText: '',
        pageIndex: 1,
        pageCount: 10,
      },
      matchGameList: [],
      searchByRom: null,
    };
  }

  // 在组件挂载之前把数据设置进去(可以用initValue替代这种用法)
  componentWillMount() {
    this.props.updateBindingData('platList', {}, (resp) => {
      if (resp.data.infos.length > 0) {
        const { context } = this.state;
        // 默认用GBA列表
        const findInfo = resp.data.infos.filter((info) => {
          return info.platform === 'LP_GBA_OL';
        });
        if (findInfo.length > 0) {
          context.platform = findInfo[0].platform;
        } else {
          context.platform = resp.data.infos[0].platform;
        }
        this.setState({context});
        this.doGetFixRomList();
      }
    });

    // 拉取图片分组
    this.props.updateBindingData('imageTypeNameList', {});
  }
  
  onClickPageSizeChange(size) {
    const { context } = this.state;
    context.pageCount = size;
    this.setState({ context });
    this.doGetFixRomList();
  }

  getFirstPage(platform) {
    const { context } = this.state;
    context.pageIndex = 1;
    context.platform = platform;
    this.setState({ context });
    this.doGetFixRomList();
  }

  getNextPage(pageIndex) {
    const { context } = this.state;
    context.pageIndex = pageIndex;
    this.setState({ context });
    this.doGetFixRomList();

    // 将搜索的数据清空
    let { searchByRom, matchGameList } = this.state;
    searchByRom = null;
    matchGameList = [];
    this.setState({ searchByRom, matchGameList });
  }

  containerRefHandler(ref) {
    this.container = ref;
  }

  doGetFixRomList() {
    const { context } = this.state;
    const params = {
      platform: context.platform,
      query: context.queryText,
      offset: (context.pageIndex - 1) * context.pageCount,
      count: context.pageCount,
    };
    this.props.updateBindingData('fixRomList', { params });
  }

  searchGame(query, rom) {
    const params = {
      platform: this.state.context.platform,
      query,
      offset: 0,
    };
    this.props.updateBindingData('matchGameList', { params }, (resp) => {
      if (resp.data.games.length > 0) {
        let { searchByRom, matchGameList } = this.state;
        matchGameList = resp.data.games;
        searchByRom = rom;
        this.setState({searchByRom, matchGameList});
      } else {
        let { searchByRom, matchGameList } = this.state;
        matchGameList = [];
        searchByRom = rom;
        this.setState({searchByRom, matchGameList});
      }
    });
  }

  renderPagination() {
    const { fixRomList } = this.props.bindingData;
    if (!fixRomList) {
      return;
    }

    return (
      <Pagination
        className={styles.centerPagination}
        current={this.state.context.pageIndex}
        pageSize={this.state.context.pageCount}
        total={fixRomList.total}
        onChange={(current) => {
          this.getNextPage(current);
        }}
        totalRender={total => {
          return (
            <div style={{ paddingLeft: '10px' }}>总数: {total}</div>
          )
        }}
      pageSizeSelector='filter'
      pageSizePosition="end"
      pageSizeList={[10, 20, 30, 40, 50, 100]}
      onPageSizeChange={(size) => this.onClickPageSizeChange(size)}
      />
    );
  }

  renderActionBar() {
    const { platList } = this.props.bindingData;
    return (
      <div className={styles.cenGroup} ref={this.containerRefHandler.bind(this)}>
        <Loading visible={platList.__loading}>
          <div className={styles.menuContainer}>
            <span>游戏平台</span>
            <span>
              <Select
                style={{ width: '200px' }}
                maxTagCount={20}
                value={this.state.context.platform}
                onChange={(platform) => {
                  this.getFirstPage(platform);
                }}
              >
                {
                  platList.infos.map((info, index) => {
                    return (
                      <Select.Option value={info.platform} key={index}>
                        {info.display}
                      </Select.Option>
                    );
                  })
                }
              </Select>
            </span>
          </div>

          <div className={styles.menuContainer}>
            <span>
              <Search searchText="搜索游戏" style={{width: '400px'}}
              onSearch={(query) => {
                const { context } = this.state;
                context.pageIndex = 1;
                context.queryText = query;
                this.setState({ context });
                this.doGetFixRomList();
              }} />
            </span>
          </div>
        </Loading>
      </div>
    );
  }

  renderAtlasSearchActionBar() {
    const { imageTypeNameList } = this.props.bindingData;
    return (
      <div className={styles.cenGroup}>
        <Loading visible={imageTypeNameList.__loading}>
          <div className={styles.menuContainer}>
            <span>图片分组</span>
            <span>
              <Select
                style={{ width: '200px' }}
                value={this.state.context.imageTypeName}
                onChange={(imageTypeName) => {
                  const { context } = this.state;
                  context.imageTypeName = imageTypeName;
                  this.setState({ context });
                }}
              >
                {
                  imageTypeNameList.infos.map((info, index) => {
                    return (
                      <Select.Option value={info.key} key={index}>
                        {info.display}
                      </Select.Option>
                    );
                  })
                }
              </Select>
            </span>
          </div>
        </Loading>
      </div>
    );
  }

  render() {
    const { fixRomList } = this.props.bindingData;
    return (
      <IceContainer>
        <Row wrap gutter={20}>
          {this.renderActionBar()}
        </Row>

        <Loading visible={fixRomList.__loading}>
          <Row wrap gutter={10} align="center" justify="start" className={styles.gameListContainer}>
            {
              fixRomList.roms.map((rom, index) => {
                return (
                  <Col key={index}>
                    <FixRomImage
                      rom={rom}
                      cbSearch={(query, searchByRom) => this.searchGame(query, searchByRom)}
                      cbSkipFixSucc={() => {
                        // 重新拉取游戏列表
                        this.doGetFixRomList();

                        // 将搜索的数据清空
                        let { searchByRom, matchGameList } = this.state;
                        searchByRom = null;
                        matchGameList = [];
                        this.setState({ searchByRom, matchGameList });
                      }}
                      key={index} />
                  </Col>
                );
              })
            }
          </Row>
          <Row wrap style={{"paddingTop": "10px"}}>
            {this.renderPagination()}
          </Row>

          <Row wrap gutter={20}>
            {
              this.state.matchGameList && this.state.matchGameList.length > 0 && this.renderAtlasSearchActionBar()
            }
          </Row>
          <Row wrap gutter={10} align="center" justify="start" className={styles.gameListContainer}>
            {
              this.state.matchGameList.map((game, index) => {
                return (
                  <Col key={index}>
                    <SearchGameImage
                      game={game}
                      searchByRom={this.state.searchByRom}
                      imageTypeName={this.state.context.imageTypeName}
                      cbFixSucc={() => {
                        // 重新拉取游戏列表
                        this.doGetFixRomList();

                        // 将搜索的数据清空
                        let { searchByRom, matchGameList } = this.state;
                        searchByRom = null;
                        matchGameList = [];
                        this.setState({ searchByRom, matchGameList });
                      }}
                      key={index} />
                  </Col>
                );
              })
            }
          </Row>
        </Loading>
      </IceContainer>
    );
  }
}
