import React, { Component } from 'react';
import { Loading, Grid, Pagination, Select, Button, Dialog } from '@alifd/next';
import IceContainer from '@icedesign/container';
import DataBinder from '@icedesign/data-binder';

import GameFilter from './GameFilter';
import GameInfo from '../GameInfo';
import styles from './GameList.module.scss';

const { Row, Col } = Grid;


@DataBinder({
  'gameList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: '/api/RetroGameWiki/gameList',
    method: 'GET',
    withCredentials: true,
    params: {
      platform: '',
      offset: 0,
      count: 10,
    },
    // 接口默认数据
    defaultBindingData: {
      games: [],
      total: 0,
    },
  },
  'platList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: '/api/RetroGameWiki/platList',
    method: 'GET',
    withCredentials: true,
    params: {
    },
    // 接口默认数据
    defaultBindingData: {
      infos: [],
    },
  },
  'userMenuList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: '/api/RetroGameWiki/usermenu/list',
    method: 'GET',
    withCredentials: true,
    params: {
      offset: 0,
      count: 10,
    },
    // 接口默认数据
    defaultBindingData: {
      menus: [],
      total: 0,
    },
  },
})


export default class GameList extends Component {
  static displayName = 'GameList';

  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      context: {
        platform: 'LP_GBA_OL',
        pageIndex: 0,
        pageCount: 20,
      },
      filter: {
        isuse: false,
        platform: '',
        nametype: 'cname',
        queryText: '',
      }
    };
  }

  // 在组件挂载之前把数据设置进去(可以用initValue替代这种用法)
  componentWillMount() {
    this.props.updateBindingData('platList', {}, (resp) => {
      if (resp.data.infos.length > 0) {
        const { context } = this.state;
        context.platform = resp.data.infos[0].platform;
        this.setState({context});
        this.doGetGameList();
      }
    });
    this.props.updateBindingData('userMenuList');
  }

  onClickFilter() {
    Dialog.confirm({
      isFullScreen: true,
      title: '查找游戏',
      content:
        <GameFilter
          filter={this.state.filter}
          cbChange={(filter) => {
            const tmpfilter = filter;
            tmpfilter.isuse = true;
            this.setState({ filter: tmpfilter });
          }} />,
      onOk: () => {
        const { context } = this.state;
        context.pageIndex = 0;
        this.setState({ context });
        this.doGetGameList();
      },
      // onCancel: () => console.log('cancel')
    });
  }

  getFirstPage(platform) {
    const { context } = this.state;
    context.pageIndex = 0;
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

  doGetGameList() {
    const { context, filter } = this.state;
    const params = {
      platform: context.platform,
      offset: context.pageIndex,
      count: context.pageCount,
    };
    if (filter.isuse) {
      params.platform = filter.platform;
      params.nametype = filter.nametype;
      params.queryText = filter.queryText;
    }
    this.props.updateBindingData('gameList', { params });
  }

  renderActionBar() {
    const { platList } = this.props.bindingData;
    return (
      <div className={styles.cenGroup}>
        <Loading visible={platList.__loading}>
          <span>机种选择：</span>
          <span>
            <Select
              style={{ width: '200px' }}
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
        </Loading>
        <span>
          <Button type="primary" onClick={() => this.onClickFilter()}>
            过滤数据
          </Button>
        </span>
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
        style={{ paddingLeft: '10px', paddingBottom: '10px' }}
        current={this.state.context.pageIndex}
        pageSize={this.state.context.pageCount}
        total={gameList.total}
        onChange={(current) => {
          this.getNextPage(current);
        }}
        totalRender={total => {
          return (
            <div style={{ paddingLeft: '10px' }}>总数: {total}</div>
          )
        }}
      // pageSizeSelector='dropdown'
      // pageSizeList={[10, 20, 30, 40, 50, 100]}
      // onPageSizeChange={(size) => this.onClickPageSizeChange(size)}
      />
    );
  }

  render() {
    const { gameList, userMenuList } = this.props.bindingData;
    return (
      <IceContainer>
        <Row wrap gutter={20}>
          {this.renderActionBar()}
        </Row>

        <Loading visible={gameList.__loading}>
          <Row wrap gutter={20}>
            {
              gameList.games.map((game, index) => {
                return (
                  <Col span="12" key={index}>
                    <GameInfo
                    game={game}
                    userMenuList={userMenuList}
                    from='gameList'
                    key={index} />
                  </Col>
                );
              })
            }
          </Row>

          <Row wrap gutter={20}>
            {this.renderPagination()}
          </Row>
        </Loading>
      </IceContainer>
    );
  }
}
