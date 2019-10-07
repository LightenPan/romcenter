import React, { Component } from 'react';
import { Grid, Input, Radio } from '@alifd/next';

import styles from './FilterSelect.module.scss';

export default class FilterSelect extends Component {
  static displayName = 'FilterSelect';

  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      filterType: this.props.filterType,
      queryText: this.props.queryText,
    };
  }

  render() {
    return (
      <div>
        <h3>列表条件</h3>
        <div className={styles.renderedContainer}>
          <Radio.Group
            size="large"
            value={this.state.filterType}
            itemDirection='ver'
            onChange={(val) => {
              this.setState({filterType: val});
              const info = {
                filterType: val,
                queryText: this.state.queryText,
              }
              this.props.cbChange(info);
            }}
          >
            <Radio value={0}>不过滤</Radio>
            <Radio value={1}>只显示空备注数据</Radio>
            <Radio value={2}>根据游戏编号过滤</Radio>
            <Radio value={3}>根据图片编号过滤</Radio>
            <Radio value={4}>根据标题过滤</Radio>
            <Radio value={5}>根据备注过滤</Radio>
          </Radio.Group>
        </div>
        <h3>列表查询数据</h3>
        <div className={styles.renderedContainer}>
          <Input
            value={this.state.queryText}
            onChange={(val) => {
              this.setState({queryText: val});
              const info = {
                filterType: this.state.filterType,
                queryText: val,
              }
              this.props.cbChange(info);
            }}/>
        </div>
      </div>
    );
  }
}
