import React, { Component, Dialog } from 'react';
import IceImg from '@icedesign/img';
import styles from './SingleItem.module.scss';


export default class SingleItem extends Component {
  static displayName = 'SingleItem';

  genImgUrl = (item, config) => {
    const count = 500;
    const low = parseInt(item.imageNumber / count, 10) * count + 1;
    const high = parseInt(item.imageNumber / count, 10) * count + count;
    const imageFolder = `${low}-${high}`;
    const imgUrla = `${config.newDat.imURL + imageFolder}/${item.imageNumber}a.png`;
    const imgUrlb = `${config.newDat.imURL + imageFolder}/${item.imageNumber}b.png`;
    return { a: imgUrla, b: imgUrlb };
  }

  genShowList = (item) => {
    // <game>
    //     <imageNumber>1</imageNumber>
    //     <title>3-in-1 Supergun </title>
    //     <romSize>65552</romSize>
    //     <publisher />
    //     <location>3</location>
    //     <sourceRom />
    //     <language>4</language>
    //     <im1CRC>002CBBE9</im1CRC>
    //     <im2CRC>BD47584A</im2CRC>
    //     <files>
    //         <romCRC extension=".nes">3B95BC4E</romCRC>
    //     </files>
    //     <comment>3-in-1 Supergun</comment>
    // </game>
    const showList = [];
    showList.push({label: '标题', value: item.title});
    showList.push({label: '编号', value: item.releaseNumber});
    showList.push({label: '图片', value: item.imageNumber});
    showList.push({label: '尺寸', value: item.romSize});
    showList.push({label: '出版', value: item.publisher});
    showList.push({label: '地区', value: item.location});
    showList.push({label: '语言', value: item.language});
    showList.push({label: '评论', value: item.comment});
    showList.push({label: 'crc', value: item.files.romCRC._});
    return showList;
  }

  handleEditor = () => {
    Dialog.confirm({
      content: '请先申请权限在查看调用示例',
    });
  }

  render() {
    const {
      item,
      config,
    } = this.props;

    const showList = this.genShowList(item, config);
    const imgUrl = this.genImgUrl(item, config);

    return (
      <div className={styles.game}>
        {/* <div className={styles.head}>
          <Icon type="electronics" className={styles.icon} />
          {' '}
          {data.title}
        </div> */}

        {/* <IceImg
          src={imgUrl.a}
          width={149}
          height={149}
          style={{ margin: '8px' }}
        /> */}

        <div className={styles.body}>
          {showList.map((showItem, key) => {
            return (
              <div className={styles.item} key={key}>
                <span className={styles.label}>{showItem.label}：</span>
                <span className={styles.value}>{showItem.value}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <a
            onClick={this.handleEditor}
            className={styles.button1}
          >
            编辑
          </a>
        </div>
      </div>
    );
  }
}
