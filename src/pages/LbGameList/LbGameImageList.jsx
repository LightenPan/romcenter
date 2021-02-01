import React, { Component } from 'react';
import { Loading, Grid, Pagination, Select, Search, Affix, Message} from '@alifd/next';
import IceContainer from '@icedesign/container';
import DataBinder from '@icedesign/data-binder';

// import GameFilter from './GameFilter';
import LbGameImage from './LbGameImage';
import styles from './LbGameImageList.module.scss';

const { Row, Col } = Grid;


@DataBinder({
  'gameList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/LbGameInfo/list`,
    method: 'GET',
    withCredentials: true,
    params: {
      platform: '',
      offset: 0,
      count: 50,
      query: '',
      orderby: 'Name',
      // includeRoms: NaN,
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
  'orderByList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/LbGameInfo/orderByList`,
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


export default class GameList extends Component {
  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      context: {
        platform: 'LP_GBA_OL',
        imageTypeName: '',
        orderBy: null,
        queryText: '',
        pageIndex: 1,
        pageCount: 20,
      },
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
        this.doGetGameList();
      }
    });

    // 拉取图片分组
    this.props.updateBindingData('imageTypeNameList', {}, (resp) => {
      if (resp.data.infos) {
        const { context } = this.state;
        // 默认用第一个图片分组
        if (resp.data.infos && resp.data.infos.length > 0) {
          context.imageTypeName = resp.data.infos[0].key;
          this.setState({context});
        }
      }
    });

    // 拉取排序字段
    this.props.updateBindingData('orderByList', {}, (resp) => {
      if (resp.data.infos) {
        const { context } = this.state;
        // 默认用第一个字段排序
        if (resp.data.infos && resp.data.infos.length > 0) {
          context.orderBy = resp.data.infos[0].key;
          this.setState({context});
        }
      }
    });
  }

  onClickPageSizeChange(size) {
    const { context } = this.state;
    context.pageCount = size;
    this.setState({ context });
    this.doGetGameList();
  }

  getFirstPage(platform) {
    const { context } = this.state;
    context.pageIndex = 1;
    context.platform = platform;
    this.setState({ context });
    this.doGetGameList();
  }

  getNextPage(pageIndex) {
    const { context } = this.state;
    context.pageIndex = pageIndex;
    this.setState({ context });
    this.doGetGameList();
  }

  containerRefHandler(ref) {
    this.container = ref;
  }

  doGetGameList() {
    const { context } = this.state;
    const params = {
      platform: context.platform,
      orderby: context.orderBy,
      query: context.queryText,
      offset: (context.pageIndex - 1) * context.pageCount,
      count: context.pageCount,
    };
    this.props.updateBindingData('gameList', { params });
  }

  renderActionBar() {
    const { platList, imageTypeNameList, orderByList } = this.props.bindingData;
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

          <div className={styles.menuContainer}>
            <span>排序字段</span>
            <span>
              <Select
                style={{ width: '200px' }}
                value={this.state.context.orderBy}
                onChange={(orderBy) => {
                  const { context } = this.state;
                  context.orderBy = orderBy;
                  this.setState({ context });
                  this.getFirstPage(context.platform);
                }}
              >
                {
                  orderByList.infos.map((info, index) => {
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

          <div className={styles.menuContainer}>
            <span>
              <Search searchText="搜索游戏" style={{width: '400px'}}
               onSearch={(query) => {
                const { context } = this.state;
                context.pageIndex = 1;
                context.queryText = query;
                this.setState({ context });
                this.doGetGameList();
              }} />
            </span>
          </div>
        </Loading>
        {/* <span>
          <Button type="primary" onClick={() => this.onClickFilter()}>
            过滤数据
          </Button>
        </span> */}
      </div>
    );
  }

  renderPagination() {
    const { gameList } = this.props.bindingData;
    if (!gameList) {
      return;
    }

    return (
      <Pagination
        className={styles.centerPagination}
        current={this.state.context.pageIndex}
        pageSize={this.state.context.pageCount}
        total={gameList.total}
        onChange={(current) => {
          this.getNextPage(current);
        }}
        totalRender={total => {
          return (
            <div style={{ paddingLeft: '10px' }}>总数: {total}</div>
          );
        }}
      pageSizeSelector='filter'
      pageSizePosition="end"
      pageSizeList={[10, 20, 30, 40, 50, 100]}
      onPageSizeChange={(size) => this.onClickPageSizeChange(size)}
      />
    );
  }

  render() {
    const { gameList } = this.props.bindingData;
    return (
      <IceContainer>
        <Row wrap gutter={20}>
          {this.renderActionBar()}
        </Row>

        <Loading visible={gameList.__loading}>
          <Row wrap gutter={10} align="center" justify="start" className={styles.gameListContainer}>
            {
              gameList.games.map((game, index) => {
                return (
                  <Col key={index}>
                    <LbGameImage
                      game={game}
                      imageTypeName={this.state.context.imageTypeName}
                      key={index} />
                  </Col>
                );
              })
            }
          </Row>

          <Affix container={() => this.container} offsetBottom={0} className={styles.fixedPaginationContainer}>
            <Row wrap style={{"paddingTop": "10px"}}>
              {this.renderPagination()}
            </Row>
          </Affix>
        </Loading>
      </IceContainer>
    );
  }
}
