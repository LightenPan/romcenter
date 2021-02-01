import React, { Component } from 'react';
import { Message, Button } from '@alifd/next';
import DataBinder from '@icedesign/data-binder';
import { BackgroundImage } from 'react-image-and-background-image-fade';
import {Link} from 'react-router-dom';

import styles from './SearchGameImage.module.scss';

const defaultUrl = "https://ae02.alicdn.com/kf/H157ff3fdaca34bd3aa22b3454f902fa0e.png";
// const defaultUrl = "https://ae02.alicdn.com/kf/Hd207ebcbdf9d44ae8861294c76fd4782k.png";

@DataBinder({
  'gameImage': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/LbGameInfo/image`,
    method: 'GET',
    withCredentials: true,
    params: {
      lbid: '',
      typeName: 'Screenshots',
    },
    success: (body) => {
      if (body.status !== 'SUCCESS') {
        // 后端返回的状态码错误
        Message.error(body.message);
      } else {
        // 成功不弹 toast，可以什么都不走
        console.log('success');
      }
    },
    // 接口默认数据
    defaultBindingData: {
      url: '',
    },
  },
  'fixRomLbid': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/LbGameInfo/fixRomLbid`,
    method: 'GET',
    withCredentials: true,
    params: {
      platform: '',
      crc32: '',
      lbid: '',
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

export default class SearchGameImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgUrl: defaultUrl,
    };
  }

  // 在组件挂载之前把数据设置进去(可以用initValue替代这种用法)
  componentWillMount() {
    const params = {
      lbid: this.props.game.DatabaseID,
      typeName: this.props.imageTypeName,
    };
    this.props.updateBindingData('gameImage', {params}, (resp) => {
      if (resp.data && resp.data.url && resp.data.url.length > 0) {
        this.setState({imgUrl: resp.data.url});
      }
    });
  }

  // props发生变化时触发
  componentWillReceiveProps(props) {
    if (props.game.DatabaseID !== this.props.game.DatabaseID
       || props.imageTypeName !== this.props.imageTypeName) {
      const params = {
        lbid: props.game.DatabaseID,
        typeName: props.imageTypeName,
      };
      this.props.updateBindingData('gameImage', {params}, (resp) => {
        if (resp.data) {
          if (resp.data.url && resp.data.url.length > 0) {
            this.setState({imgUrl: resp.data.url});
          } else {
            this.setState({imgUrl: defaultUrl});
          }
        }
      });
    }
  }
  
  render() {
    return (
      <div className={styles.container}>
          <BackgroundImage
            className={styles.gameImage}
            src={this.state.imgUrl}
            // width='320px'
            // height='240px'
          >
          <div className={styles.gameImageText}>
            <div>
              {
                this.props.game.cname && this.props.game.cname.length > 0 && this.props.game.cname
              }
            </div>
            <div>
              {
                this.props.game.Name && this.props.game.Name.length > 0 && this.props.game.Name
              }
            </div>
          </div>
          </BackgroundImage>

          <div className={styles.gameInfo}>
            <p>
              游戏名相似度：{this.props.game.score}
            </p>
            {
              this.props.game.AlternateNames && this.props.game.AlternateNames.length > 1 &&
              this.props.game.AlternateNames.map((name, index) => {
                return (
                  <p>
                    别名{index + 1}：{ name }
                  </p>
                );
              })
            }
            <p>
              游戏ID：{this.props.game.DatabaseID}
            </p>
            <p>
              ROM信息：
            </p>
            <p>
              中文名：{this.props.searchByRom.full_cname}
            </p>
            <p>
              英文名：{this.props.searchByRom.full_ename}
            </p>
            <p>
              crc32：{this.props.searchByRom.crc32}
            </p>
            <Button onClick={() => {
              const params = {
                platform: this.props.searchByRom.platform,
                crc32: this.props.searchByRom.crc32,
                lbid: this.props.game.DatabaseID,
              };
              this.props.updateBindingData('fixRomLbid', { params }, (resp) => {
                if (resp.status === "SUCCESS") {
                  this.props.cbFixSucc();
                }
              });
            }}>执行游戏ID修护操作</Button>
            <Link to={`/LbGameInfo/${this.props.game.DatabaseID}`} target="_blank">
              <p>查看详细信息</p>
            </Link>
          </div>
      </div>
    );
  }
}
