import React, { Component } from 'react';
import { Input, Radio, Grid } from '@alifd/next';
import DataBinder from '@icedesign/data-binder';

import styles from './GameFilter.module.scss';

const { Row, Col } = Grid;


@DataBinder({
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
})


export default class GameFilter extends Component {
  static displayName = 'GameFilter';

  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      filter: this.props.filter,
    };
  }

  // 在组件挂载之前把数据设置进去(可以用initValue替代这种用法)
  componentWillMount() {
    this.props.updateBindingData('platList');
  }

  render() {
    const { platList } = this.props.bindingData;
    return (
      <div>
        <h3>选择平台</h3>
        <div className={styles.renderedContainer}>
          <Radio.Group
            value={this.state.filter.platform}
            // itemDirection='ver'
            onChange={(val) => {
              const {filter} = this.state;
              filter.platform = val;
              this.setState({ filter });
              if (this.props.cbChange) {
                const info = {
                  platform: val,
                }
                this.props.cbChange(info);
              }
            }}
          >
            <Radio value="" key={-1}>所有平台</Radio>
            {
              platList.infos.map((info, index) => {
                return (
                  <Radio value={info.platform} key={index}>{info.display}</Radio>
                );
              })
            }
          </Radio.Group>
        </div>
        <h3>游戏名类型</h3>
        <div className={styles.renderedContainer}>
          <Radio.Group
            value={this.state.filter.nametype}
            itemDirection='ver'
            onChange={(val) => {
              const {filter} = this.state;
              filter.nametype = val;
              this.setState({ filter });
              if (this.props.cbChange) {
                const info = {
                  nametype: val,
                }
                this.props.cbChange(info);
              }
            }}
          >
            <Radio value="cname">中文名</Radio>
            <Radio value="ename">英文名</Radio>
          </Radio.Group>
        </div>
        <h3>列表查询数据</h3>
        <div className={styles.renderedContainer}>
          <Input
            value={this.state.filter.queryText}
            onChange={(val) => {
              const {filter} = this.state;
              filter.queryText = val;
              this.setState({ filter });
              if (this.props.cbChange) {
                const info = {
                  queryText: val,
                }
                this.props.cbChange(info);
              }
            }} />
        </div>
      </div>
    );
  }
}
