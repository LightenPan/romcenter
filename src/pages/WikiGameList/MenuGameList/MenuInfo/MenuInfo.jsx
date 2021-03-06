import React, { Component } from 'react';
import { Input } from '@alifd/next';

import styles from './MenuInfo.module.scss';


export default class MenuInfo extends Component {
  static displayName = 'MenuInfo';

  static propTypes = {};

  constructor(props) {
    super(props);

    let name = '';
    if (props && props.menu && props.menu.name) {
      name = props.menu.name;
    }
    let desc = '';
    if (props && props.menu && props.menu.desc) {
      desc = props.menu.desc;
    }
    this.state = {
      name,
      desc,
    };
  }

  render() {
    return (
      <div>
        <h3>游戏单信息</h3>
        <div className={styles.renderedContainer}>
          <h3>名字</h3>
          <Input
            value={this.state.name}
            onChange={(val) => {
              this.setState({ name: val });
            }} />
          <h3>描述</h3>
          <Input
            value={this.state.desc}
            onChange={(val) => {
              this.setState({ desc: val });
            }} />
        </div>
      </div>
    );
  }
}
