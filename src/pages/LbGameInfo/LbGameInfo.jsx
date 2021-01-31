import React, { Component } from 'react';
import { Message, Card, Table } from '@alifd/next';
import IceContainer from '@icedesign/container';
import DataBinder from '@icedesign/data-binder';

import Gallery from 'react-waterfall-gallery';

import styles from './LbGameInfo.module.scss';


@DataBinder({
  'gameInfo': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/LbGameInfo/info`,
    method: 'GET',
    withCredentials: true,
    params: {
      lbid: '',
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
    // 接口默认数据
    defaultBindingData: {
      info: {},
    },
  },
  'gameGallery': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/LbGameInfo/gallery`,
    method: 'GET',
    withCredentials: true,
    params: {
      lbid: '',
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
    // 接口默认数据
    defaultBindingData: {
      infos: [],
    },
  },
})

export default class LbGameInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const lbid = this.props.match.params.lbid;
    if (!lbid) {
      Message.error("url地址不正确，缺少lbid参数。");
      return;
    }

    this.props.updateBindingData('gameInfo', { params: { lbid } });
    this.props.updateBindingData('gameGallery', { params: { lbid } });
  }
  
  render() {
    // | 字段名               | 中文字段名 | 说明    |
    // | :------------------: | :--------: | :-----: |
    // | Name                 | 名称       |         |
    // | Genres               | 类型       |         |
    // | DatabaseID           | LB游戏ID   |         |
    // | MaxPlayers           | 游戏人数   |         |
    // | Platform             | 平台       |         |
    // | Overview             | 简介       |         |
    // | Cooperative          | 多人合作   |         |
    // | Portable             | 便携版     | ROM才有 |
    // | Publisher            | 发行商     |         |
    // | CommunityRating      | 评级       |         |
    // | Region               | 区域       | ROM才有 |
    // | ReleaseDate          | 发布时间   |         |
    // | ReleaseYear          | 发行年份   |         |
    // | Developer            | 开发商     |         |
    // | CommunityRatingCount |            |         |
    // | ESRB                 |            |         |
    // | WikipediaURL         |            |         |
    // | DOS                  |            |         |
    // | StartupFile          |            |         |
    // | StartupMD5           |            |         |
    // | SetupFile            |            |         |
    // | SetupMD5             |            |         |
    // | StartupParameters    |            |         |
    // | VideoURL             |            |         |
    const { gameInfo, gameGallery } = this.props.bindingData;

    const dispList = [];
    for (const key in gameInfo.info) {
      // if (key == "Name") {
      //   dispList.push({key: "名称", val: gameInfo.info[key]});
      if (key == "MaxPlayers") {
        dispList.push({key: "游戏人数", val: gameInfo.info[key]});
      } else if (key == "Platform") {
        dispList.push({key: "游戏平台", val: gameInfo.info[key]});
      // } else if (key == "Overview") {
      //   dispList.push({key: "简介", val: gameInfo.info[key]});
      } else if (key == "Cooperative") {
        dispList.push({key: "多人合作", val: gameInfo.info[key]});
      } else if (key == "Developer") {
        dispList.push({key: "开发商", val: gameInfo.info[key]});
      } else if (key == "Publisher") {
        dispList.push({key: "发行商", val: gameInfo.info[key]});
      } else if (key == "CommunityRating") {
        dispList.push({key: "评级", val: gameInfo.info[key]});
      } else if (key == "ReleaseYear") {
        dispList.push({key: "发行年份", val: gameInfo.info[key]});
      } else if (key == "ReleaseDate") {
        dispList.push({key: "发布时间", val: gameInfo.info[key]});
      } else if (key == "WikipediaURL") {
        dispList.push({key: "WIKI地址", val: gameInfo.info[key]});
      } else if (key == "VideoURL") {
        dispList.push({key: "视频地址", val: gameInfo.info[key]});
      }
    }

    let gameName = gameInfo.info.Name;
    if (gameInfo.info.cname && gameInfo.info.cname.length > 0) {
      gameName = gameInfo.info.cname;
    }

    return (
      <IceContainer>
        <div className={styles.container}>
          <Card free>
            <Card.Header title={gameName} />
            <Card.Divider />
            <Card.Content>
              <div className={styles.Content}>
                {gameInfo.info.Overview}
                <Table dataSource={dispList} hasHeader={false} hasBorder={false} className={styles.Table}>
                  <Table.Column dataIndex="key" />
                  <Table.Column dataIndex="val" />
                </Table>
              </div>
            </Card.Content>
          </Card>

          <Gallery images={gameGallery.infos} numColumns={5} rowHeight="240px"/>
        </div>
      </IceContainer>
    );
  }
}
