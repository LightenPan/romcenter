import React, { Component } from 'react';
import { Search, Button } from '@alifd/next';
import DataBinder from '@icedesign/data-binder';
import { BackgroundImage } from 'react-image-and-background-image-fade';

import styles from './FixRomImage.module.scss';

// const defaultUrl = "https://ae02.alicdn.com/kf/H157ff3fdaca34bd3aa22b3454f902fa0e.png";
@DataBinder({
  'skipFixRomLbid': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/LbGameInfo/skipFixRomLbid`,
    method: 'GET',
    withCredentials: true,
    params: {
      platform: '',
      crc32: '',
    },
    // success: (body) => {
    //   if (body.status !== 'SUCCESS') {
    //     // 后端返回的状态码错误
    //     Message.error(body.message);
    //   } else {
    //     // 成功不弹 toast，可以什么都不走
    //     console.log('success');
    //   }
    // },
    // 接口默认数据
    defaultBindingData: {
    },
  },
})

export default class FixRomImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queryText: '',
    };
  }

  // props发生变化时触发
  componentWillReceiveProps(props) {
    if (props.rom.crc32 !== this.props.rom.crc32) {
      // 清空搜索记录
      this.setState({queryText: ''});
    }
  }

  render() {
    const menuList = [];
    menuList.push({
      label: this.props.rom.ename,
      value: this.props.rom.ename,
    });
    menuList.push({
      label: this.props.rom.cname,
      value: this.props.rom.cname,
    });
    return (
      <div className={styles.container}>
        <BackgroundImage
          className={styles.gameImage}
          src={this.props.rom.thumb.title}
          // width='320px'
          // height='240px'
        >
        <div className={styles.gameImageText}>
          <div>
            {
              this.props.rom.full_cname && this.props.rom.full_cname.length > 0 && this.props.rom.full_cname
            }
          </div>
          <div>
            {
              this.props.rom.full_ename && this.props.rom.full_ename.length > 0 && this.props.rom.full_ename
            }
          </div>
        </div>
        </BackgroundImage>

        <div className={styles.searhBar}>
          <Search
            searchText="搜索游戏"
            value={this.state.queryText}
            onChange={(value) => {
              this.setState({queryText: value});
            }}
            style={{width: '300px'}}
            dataSource={menuList}
            onSearch={(queryText) => {
              this.props.cbSearch(queryText, this.props.rom);
            }}
            />
        </div>

        <div className={styles.searhBar}>
          <Button onClick={() => {
              const params = {
                platform: this.props.rom.platform,
                crc32: this.props.rom.crc32,
              };
              this.props.updateBindingData('skipFixRomLbid', { params }, (resp) => {
                if (resp.status === "SUCCESS") {
                  this.props.cbSkipFixSucc();
                }
              });
          }}>暂不修复游戏ID</Button>
          </div>
      </div>
    );
  }
}
