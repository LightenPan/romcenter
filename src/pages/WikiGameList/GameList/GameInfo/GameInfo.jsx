import React, { Component } from 'react';
import IceImg from '@icedesign/img';
import styles from './GameInfo.module.scss';


export default class GameInfo extends Component {
  static displayName = 'GameInfo';

  render() {
    return (
      <div className={styles.game}>
        {/* <div className={styles.head}>
          <Icon type="electronics" className={styles.icon} />
          {' '}
          {data.title}
        </div> */}

        <div className={styles.body}>
          <div className={styles.item}>
            <div className={styles.imgGroup}>
              <span className={styles.imgItem}>
                <IceImg src={this.props.game.thumb.title} />
              </span>
              <span className={styles.imgItem}>
                <IceImg src={this.props.game.thumb.snap} />
              </span>
              <span className={styles.imgItem}>
                <IceImg src={this.props.game.thumb.boxart} />
              </span>
            </div>
          </div>

          <div className={styles.item}>
            <span className={styles.label}>英文名: </span>
            <span className={styles.value}>{this.props.game.ename}</span>
          </div>
          <div className={styles.item}>
            <span className={styles.label}>中文名: </span>
            <span className={styles.value}>{this.props.game.cname}</span>
          </div>
          <div className={styles.item}>
            <span className={styles.label}>发行: </span>
            <span className={styles.value}>{this.props.game.publisher}</span>
          </div>
          <div className={styles.labelGroup}>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>CRC: </span>
              <span className={styles.value}>{this.props.game.crc32}</span>
            </div>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>尺寸: </span>
              <span className={styles.value}>{this.props.game.romsize}</span>
            </div>
          </div>
          <div className={styles.labelGroup}>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>地区: </span>
              <span className={styles.value}>{this.props.game.location}</span>
            </div>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>语言: </span>
              <span className={styles.value}>{this.props.game.language}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
