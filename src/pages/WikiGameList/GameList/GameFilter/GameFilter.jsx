import React, { Component } from 'react';
import { Input, Radio } from '@alifd/next';

import styles from './GameFilter.module.scss';


export default class GameFilter extends Component {
  static displayName = 'GameFilter';

  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      platform: '',
      nametype: 'cname',
      queryText: '',
    };
  }

  render() {
    return (
      <div>
        <h3>选择平台</h3>
        <div className={styles.renderedContainer}>
          <Radio.Group
            value={this.state.platform}
            // itemDirection='ver'
            onChange={(val) => {
              this.setState({ platform: val });
            }}
          >
            {
              this.props.platList.map((info, index) => {
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
            value={this.state.nametype}
            itemDirection='ver'
            onChange={(val) => {
              this.setState({ nametype: val });
            }}
          >
            <Radio value="cname">中文名</Radio>
            <Radio value="ename">英文名</Radio>
          </Radio.Group>
        </div>
        <h3>列表查询数据</h3>
        <div className={styles.renderedContainer}>
          <Input
            value={this.state.queryText}
            onChange={(val) => {
              this.setState({ queryText: val });
            }} />
        </div>
      </div>
    );
  }
}
