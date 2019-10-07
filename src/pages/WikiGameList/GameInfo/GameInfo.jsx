import React, { Component } from 'react';
import Img from '@icedesign/img';
import { Dropdown, Menu, Button, Loading } from '@alifd/next';
import DataBinder from '@icedesign/data-binder';

import styles from './GameInfo.module.scss';


@DataBinder({
  'userMenuOpGame': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: '/api/RetroGameWiki/usermenu/opgame',
    method: 'POST',
    withCredentials: true,
    data: {
      menuid: '',
      platform: '',
      crc32: '',
      op: 0,
    },
    // 接口默认数据
    defaultBindingData: {
      result: 0,
    },
  },
})

export default class GameInfo extends Component {
  static displayName = 'GameInfo';

  constructor(props) {
    super(props);
    this.state = {
      disableRemoveMenuButton: false,
    };
  }

  // 在组件挂载之前把数据设置进去(可以用initValue替代这种用法)
  componentWillMount() {
    // this.props.updateBindingData('userMenuList');
  }

  render() {
    return (
      <div className={styles.game}>
        {/* <div className={styles.head}>
          <Icon type="electronics" className={styles.icon} />
          {' '}
          {data.title}
        </div> */}

        <div className={styles.body}>
          <div className={styles.item}>
            {
              this.props.game.thumb &&
              <div className={styles.imgGroup}>
                <span className={styles.imgItem}>
                  <Img type="contain" src={this.props.game.thumb.title} width={180} height={180} />
                </span>
                <span className={styles.imgItem}>
                  <Img type="contain" src={this.props.game.thumb.snap} width={180} height={180} />
                </span>
                <span className={styles.imgItem}>
                  <Img type="contain" src={this.props.game.thumb.boxart} width={180} height={180} />
                </span>
              </div>
            }
          </div>

          <div className={styles.item}>
            <span className={styles.label}>英文: </span>
            <span className={styles.value}>{this.props.game.ename}</span>
          </div>
          <div className={styles.item}>
            <span className={styles.label}>中文: </span>
            <span className={styles.value}>{this.props.game.cname}</span>
            {/* <span className={styles.value}>{this.props.game.comment}</span> */}
          </div>
          <div className={styles.item}>
            <span className={styles.label}>发行: </span>
            <span className={styles.value}>{this.props.game.publisher}</span>
          </div>
          <div className={styles.labelGroup}>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>CRC: </span>
              <span className={styles.value}>{this.props.game.crc32}</span>
            </div>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>尺寸: </span>
              <span className={styles.value}>{this.props.game.romsize}</span>
            </div>
          </div>
          <div className={styles.labelGroup}>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>地区: </span>
              <span className={styles.value}>{this.props.game.location}</span>
            </div>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>语言: </span>
              <span className={styles.value}>{this.props.game.language}</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          {
            this.props.from === 'gameList' &&
            <Loading visible={this.props.userMenuList.__loading}>
              {
                this.props.userMenuList.menus.length > 0 &&
                <Dropdown
                  trigger={<Button>加到我的游戏单</Button>}
                  // triggerType={["click", "hover"]}
                  triggerType={["click"]}
                  afterOpen={() => console.log('after open')}>
                  <Menu
                    onItemClick={(key) => {
                      const menu = this.props.userMenuList.menus[key];
                      const data = {
                        menuid: menu.oid,
                        platform: this.props.game.platform,
                        crc32: this.props.game.crc32,
                      }
                      this.props.updateBindingData('userMenuOpGame', { data });
                    }}
                  >
                    {
                      this.props.userMenuList.menus.map((info, index) => {
                        return (
                          <Menu.Item value={info.id} key={index}>{info.name}</Menu.Item>
                        );
                      })
                    }
                  </Menu>
                </Dropdown>
              }
            </Loading>
          }
          {
            this.props.from === 'menuGameList' &&
            <Button
              disabled={this.state.disableRemoveMenuButton}
              onClick={() => {
                const data = {
                  menuid: this.props.selectMenuId,
                  platform: this.props.game.platform,
                  crc32: this.props.game.crc32,
                  op: 1,
                }
                this.props.updateBindingData('userMenuOpGame', { data }, (resp) => {
                  if (resp.data.result === 0) {
                    this.setState({ disableRemoveMenuButton: true });
                  }
                });
              }} >从游戏单移除</Button>
          }
        </div>
      </div>
    );
  }
}
