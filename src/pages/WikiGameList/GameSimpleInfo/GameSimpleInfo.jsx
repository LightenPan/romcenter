import React, { Component } from 'react';
import { Button, Menu } from '@alifd/next';
import DataBinder from '@icedesign/data-binder';

import styles from './GameSimpleInfo.module.scss';

@DataBinder({
  'userMenuOpGame': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/usermenu/opgame`,
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

export default class GameSimpleInfo extends Component {
  static displayName = 'GameSimpleInfo';

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div className={styles.game}>
        <div className={styles.body}>
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
            <span className={styles.label}>平台: </span>
            <span className={styles.value}>{this.props.game.plat_display}</span>
          </div>
          <div className={styles.item}>
            <span className={styles.value}>
              {
                this.props.userMenuList.menus.length > 0 &&
                <Dropdown
                  trigger={<Button type='primary'>加到我的游戏单</Button>}
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
              }
              {
                this.props.from === 'menuGameList' &&
                <Button
                  type='primary'
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
            </span>
          </div>
        </div>
      </div>
    );
  }
}
