import React, { Component } from 'react';
import { Loading, Grid, Pagination, Select, Button, Dialog, Radio } from '@alifd/next';
import IceContainer from '@icedesign/container';
import DataBinder from '@icedesign/data-binder';

import MenuInfo from './MenuInfo';
import GameInfo from '../GameInfo';

import styles from './MenuGameList.module.scss';

const { Row, Col } = Grid;


@DataBinder({
  'userMenuGameList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/usermenu/gamelist`,
    method: 'GET',
    withCredentials: true,
    params: {
      menuid: '',
      offset: 0,
      count: 10,
    },
    // 接口默认数据
    defaultBindingData: {
      games: [],
      total: 0,
    },
  },
  'userMenuAllGameList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/usermenu/gamelist`,
    method: 'GET',
    withCredentials: true,
    params: {
      menuid: '',
      offset: 0,
      count: 1000,
    },
    // 接口默认数据
    defaultBindingData: {
      games: [],
      total: 0,
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
  'userMenuCreat': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/usermenu/creat`,
    method: 'POST',
    withCredentials: true,
    data: {
      name: '',
      desc: '',
    },
    // 接口默认数据
    defaultBindingData: {
      result: null,
    },
  },
  'userMenuModify': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/usermenu/modify`,
    method: 'POST',
    withCredentials: true,
    data: {
      menuid: '',
      name: '',
      desc: '',
    },
    // 接口默认数据
    defaultBindingData: {
      result: null,
    },
  },
})


export default class MenuGameList extends Component {
  static displayName = 'MenuGameList';

  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      showType: 'full',
      context: {
        menuid: '',
        pageIndex: 0,
        pageCount: 20,
      },
      menus: [],
    };
  }

  // 在组件挂载之前把数据设置进去(可以用initValue替代这种用法)
  componentWillMount() {
    this.props.updateBindingData('userMenuList', {}, (resp) => {
      if (resp.data.menus.length > 0) {
        const { context } = this.state;
        context.menuid = resp.data.menus[0].oid;
        this.setState({context, menus: resp.data.menus});
        this.doGetGameList();
      }
    });
  }

  onClickMenuModify() {
    const menu = this.state.menus.filter(item => {
      return item.oid === this.state.context.menuid;
    });
    if (!menu && !menu[0]) {
      return;
    }
    Dialog.confirm({
      isFullScreen: true,
      title: '修改游戏单',
      content: <MenuInfo
      menu={menu[0]}
      ref={(c) => this.menuModify = c} />,
      onOk: () => {
        const data = {
          menuid: this.state.context.menuid,
          name: this.menuModify.state.name,
          desc: this.menuModify.state.desc,
        }
        this.props.updateBindingData('userMenuModify', { data }, (resp) => {
            if (resp.data.result === 0) {
              this.props.updateBindingData('userMenuList');
            }
          }
        );
      },
      // onCancel: () => console.log('cancel')
    });
  }

  onClickMenuCreat() {
    Dialog.confirm({
      isFullScreen: true,
      title: '新建游戏单',
      content: <MenuInfo ref={(c) => this.menuCreat = c} />,
      onOk: () => {
        const data = {
          name: this.menuCreat.state.name,
          desc: this.menuCreat.state.desc,
        }
        this.props.updateBindingData('userMenuCreat', { data }, (resp) => {
            if (resp.data.result === 0) {
              this.props.updateBindingData('userMenuList');
            }
          }
        );
      },
      // onCancel: () => console.log('cancel')
    });
  }

  onClickGenLpl() {
    const { context } = this.state;
    const params = {
      menuid: context.menuid,
      offset: 0,
      count: 1000,
    };
    this.props.updateBindingData('userMenuAllGameList', {params}, (resp) => {
      if (resp.data.games.length > 0) {
        const FileSaver = require('file-saver');
        let content = '';
        resp.data.games.forEach((game) => {
          content += `/roms/${game.platform}/${game.crc32}${game.ext}\n`
          if (game.cname && game.cname.length > 0) {
            content += `${game.cname}\n`
          } else {
            content += `${game.ename}\n`
          }
          content += `DETECT\n`
          content += `DETECT\n`
          content += `${game.crc32}\n`
          content += `${game.platform}.lpl\n`
        });

        // 数组内容的MIME类型为txt
        const type = "data:application/text;charset=utf-8";

        // 实例化Blob对象，并传入参数
        const blob =new Blob([content], {type});
        const time = new Date().getTime();
        FileSaver.saveAs(blob, `${time}.lpl`);
      }
    });
  }

  onClickPageSizeChange(size) {
    const { context } = this.state;
    context.pageCount = size;
    this.setState({ context });
    this.doGetGameList();
  }

  getFirstPage(menuid) {
    const { context } = this.state;
    context.pageIndex = 0;
    context.menuid = menuid;
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
    if (!context.menuid || context.menuid.length === 0) {
      return;
    }
    const params = {
      menuid: context.menuid,
      offset: context.pageIndex * context.pageCount,
      count: context.pageCount,
    };
    this.props.updateBindingData('userMenuGameList', { params });
  }

  renderActionBar() {
    const { userMenuList } = this.props.bindingData;
    return (
      <div className={styles.cenGroup}>
        <Loading visible={userMenuList.__loading}>
          <span>列表显示样式：</span>
          <span>
            <Radio.Group
              value={this.state.showType}
              onChange={(val) => this.setState({showType: val})}>
              <Radio value="full">完整</Radio>
              <Radio value="simple">简略</Radio>
            </Radio.Group>
          </span>

          <span>我的游戏单：</span>
          <span>
            <Select
              style={{ width: '200px' }}
              value={this.state.context.menuid}
              onChange={(menuid) => {
                this.getFirstPage(menuid);
              }}
            >
              {
                userMenuList.menus.map((info, index) => {
                  return (
                    <Select.Option value={info.oid} key={index}>
                      {info.name}
                    </Select.Option>
                  );
                })
              }
            </Select>
          </span>

          <span>
            <Button type='primary' onClick={() => {this.onClickMenuModify()}}>修改选择的游戏单</Button>
          </span>
          <span>
            <Button type='primary' onClick={() => {this.onClickMenuCreat()}}>新建游戏单</Button>
          </span>
          <span>
            <Button type='primary' onClick={() => {this.onClickGenLpl()}}>生成RA列表</Button>
          </span>
        </Loading>

      </div>
    );
  }

  renderPagination() {
    const { userMenuGameList } = this.props.bindingData;
    if (!userMenuGameList) {
      return;
    }
    return (
      <Pagination
        style={{ paddingLeft: '10px', paddingBottom: '10px' }}
        current={this.state.context.pageIndex}
        pageSize={this.state.context.pageCount}
        total={userMenuGameList.total}
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
    const { userMenuList, userMenuGameList } = this.props.bindingData;
    return (
      <IceContainer>
        <Row wrap gutter={20}>
          {this.renderActionBar()}
        </Row>

        <Loading visible={userMenuGameList.__loading}>
          <Row wrap gutter={20}>
            {
              this.state.showType === 'simple' &&
              userMenuGameList.games.map((game, index) => {
                return (
                  <Col span="8" key={index}>
                    <GameInfo
                      game={game}
                      userMenuList={userMenuList}
                      showType={this.state.showType}
                      from='menuGameList'
                      selectMenuId={this.state.context.menuid}
                      key={index} />
                  </Col>
                );
              })
            }
            {
              this.state.showType === 'full' &&
              userMenuGameList.games.map((game, index) => {
                return (
                  <Col span="12" key={index}>
                    <GameInfo
                      game={game}
                      userMenuList={userMenuList}
                      showType={this.state.showType}
                      from='menuGameList'
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
