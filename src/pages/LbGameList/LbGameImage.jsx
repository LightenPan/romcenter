import React, { Component } from 'react';
import { Message } from '@alifd/next';
import DataBinder from '@icedesign/data-binder';
import { BackgroundImage } from 'react-image-and-background-image-fade';
import {Link} from 'react-router-dom';

import styles from './LbGameImage.module.scss';

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
})

export default class LbGameImage extends Component {
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
        <Link to={`/LbGameInfo/${this.props.game.DatabaseID}`} target="_blank">
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
                this.props.game.cname && this.props.game.cname.length > 0 && this.props.game.Name
              }
            </div>
          </div>
          </BackgroundImage>
        </Link>
      </div>
    );
  }
}
