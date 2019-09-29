import React, { Component } from 'react';
import { Loading, Grid } from '@alifd/next';
import IceContainer from '@icedesign/container';
import DataBinder from '@icedesign/data-binder';

const { Row, Col } = Grid;

import GameInfo from './GameInfo';


@DataBinder({
  'gameList': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: 'http://wekafei.cn/api/RetroGameWiki/gameList',
    method: 'GET',
    params: {
      platform: '',
      offset: 0,
      count: 10,
    },
    // 接口默认数据
    defaultBindingData: {
      games: [],
    }
  }
})


export default class GameList extends Component {
  static displayName = 'GameList';

  static propTypes = {};

  // static defaultProps = {
  //   releaseNumber: 0,
  //   innerSubmit: null,
  //   game: null,
  // };

  constructor(props) {
    super(props);
    this.state = {
      imgObj: null,
      scrapyObj: null,
    };
  }

  // 在组件挂载之前把数据设置进去(可以用initValue替代这种用法)
  componentWillMount = () => {
    this.props.updateBindingData('gameList', {
      params: {
        platform: 'LP_SFC_OL'
      }
    });
  }

  render() {
    const {gameList} = this.props.bindingData;
    return (
      <IceContainer>
        <Loading visible={gameList.__loading}>
          <Row wrap gutter={20}>
            {
              gameList.games.map((game, index) => {
                return (
                  <Col l={6} s={6} xs={8} key={index}>
                    <GameInfo game={game} key={index} />
                  </Col>
                );
              })
            }
          </Row>
        </Loading>
      </IceContainer>
    );
  }
}
