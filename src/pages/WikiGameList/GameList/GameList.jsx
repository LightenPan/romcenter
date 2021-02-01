import React, { Component } from 'react';
import { Loading, Grid, Pagination, Select, Button, Dialog, Radio } from '@alifd/next';
import IceContainer from '@icedesign/container';
import DataBinder from '@icedesign/data-binder';

import GameFilter from './GameFilter';
import GameInfo from '../GameInfo';
import styles from './GameList.module.scss';

const { Row, Col } = Grid;


@DataBinder({
  'gameList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/gameList`,
    method: 'GET',
    withCredentials: true,
    params: {
      platform: '',
      offset: 0,
      count: 10,
      filter: {
        platform: '',
        nametype: '',
        queryText: '',
      },
    },
    // 接口默认数据
    defaultBindingData: {
      games: [],
      total: 0,
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
  },
  'userMenuList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/usermenu/list`,
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
      showType: 'full',
      context: {
        platform: 'LP_GBA_OL',
        pageIndex: 0,
        pageCount: 20,
        filter: {
          platform: '',
          nametype: '',
          queryText: '',
        },
      },
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
    const { platList } = this.props.bindingData;
    Dialog.confirm({
      isFullScreen: true,
      title: '查找游戏',
      content:
      <GameFilter
        platList={platList.infos}
        ref={(c) => this.gameFilter = c} />,
      onOk: () => {
        const { context } = this.state;
        context.pageIndex = 0;
        context.filter.platform = this.gameFilter.state.platform;
        context.filter.nametype = this.gameFilter.state.nametype;
        context.filter.queryText = this.gameFilter.state.queryText;
        this.setState({ context });
        this.doGetGameList();
      },
      // onCancel: () => console.log('cancel')
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
    const { context } = this.state;
    const params = {
      platform: context.platform,
      offset: context.pageIndex * context.pageCount,
      count: context.pageCount,
      filter: context.filter,
    };
    this.props.updateBindingData('gameList', { params });
  }

  renderActionBar() {
    const { platList } = this.props.bindingData;
    return (
      <div className={styles.cenGroup}>
        <Loading visible={platList.__loading}>
          <span>列表显示样式：</span>
          <span>
            <Radio.Group
              value={this.state.showType}
              onChange={(val) => this.setState({showType: val})}>
              <Radio value="full">完整</Radio>
              <Radio value="simple">简略</Radio>
            </Radio.Group>
          </span>
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
      pageSizeSelector='dropdown'
      pageSizePosition="end"
      pageSizeList={[10, 20, 30, 40, 50, 100]}
      onPageSizeChange={(size) => this.onClickPageSizeChange(size)}
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
              this.state.showType === 'simple' &&
              gameList.games.map((game, index) => {
                return (
                  <Col span="8" key={index}>
                    <GameInfo
                      game={game}
                      userMenuList={userMenuList}
                      showType={this.state.showType}
                      from='gameList'
                      selectMenuId={this.state.context.menuid}
                      key={index} />
                  </Col>
                );
              })
            }
            {
              this.state.showType === 'full' &&
              gameList.games.map((game, index) => {
                return (
                  <Col span="12" key={index}>
                    <GameInfo
                      game={game}
                      userMenuList={userMenuList}
                      showType={this.state.showType}
                      from='gameList'
                      selectMenuId={this.state.context.menuid}
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
