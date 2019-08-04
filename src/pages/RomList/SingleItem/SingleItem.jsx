import React, { Component } from 'react';
import { Button, Dialog } from '@alifd/next';
import IceImg from '@icedesign/img';
import ItemEditor from '../ItemEditor';
import styles from './SingleItem.module.scss';
import GameUtils from '../../../utils/GameUtils';

export default class SingleItem extends Component {
  static displayName = 'SingleItem';

  constructor(props) {
    super(props);
    this.state = {
      showEditDialog: false,
    };
  }

  genImgUrl = (item, config, context) => {
    return GameUtils.genImageObj(
      item.imageNumber, config.newDat.imURL, context.gameImgsPath, config.imFolder);
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
    showList.push({label: '备注', value: item.comment});
    showList.push({label: '来源', value: item.sourceRom});
    showList.push({label: '编号', value: item.releaseNumber});
    showList.push({label: '图片', value: item.imageNumber});
    showList.push({label: '尺寸', value: item.romSize});
    showList.push({label: '发行', value: item.publisher});
    showList.push({label: '地区', value: item.location});
    showList.push({label: '语言', value: item.language});
    showList.push({label: 'crc32', value: item.files.romCRC._});
    return showList;
  }

  onEditRomSubmit = (values) => {
    console.log('onEditRomSubmit. values: ', values);
    const {item} = this.props;
    const keyList = [
      'releaseNumber',
      'imageNumber',
      'title',
      'romSize',
      'publisher',
      'location',
      'language',
      'comment',
      'sourceRom',
    ];
    keyList.map((key) => {
      return item[key] = values[key];
    });
    item.files.romCRC._ = values.crc32;
    if (this.props.onUpdateGame) {
      this.props.onUpdateGame(item);
    }
    this.setState({showEditDialog: false});
  }

  onEditRomDialog = () => {
    const config = this.props.config;
    const context = this.props.context;
    const game = this.props.item;
    const releaseNumber = this.props.item.releaseNumber;
    Dialog.confirm({
      title: '编辑Rom信息',
      content: <ItemEditor {...{
        isModify: true,
        releaseNumber,
        innerSubmit: this.onEditRomSubmit,
        game,
        config,
        context,
      }} />,
      // footerActions: [],
      isFullScreen: true,
      onOk: () => console.log('ok'),
      // onOk: () => this.onFormSubmit(),
      onCancel: () => console.log('cancel'),
    });
  }

  render() {
    const {
      item,
      config,
      context,
    } = this.props;

    const showList = this.genShowList(item);
    const imgUrl = this.genImgUrl(item, config, context);

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
                <IceImg src={imgUrl.a} width={160} type="contain"/>
              </span>
              <span className={styles.imgItem}>
                <IceImg src={imgUrl.b} width={160} type="contain"/>
              </span>
            </div>
            {/* <IceImg src={imgUrl.a} type="contain" className={styles.img} /> */}
          </div>

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
          <Button type="primary" onClick={() => this.setState({showEditDialog: true})}>
            编辑Rom信息
          </Button>
          <Dialog
            isFullScreen
            title="编辑Rom信息"
            visible={this.state.showEditDialog}
            onOk={() => {
              const values = this.romEditor.onSubmit();
              if (values) {
                this.onEditRomSubmit(values);
              }
            }}
            onCancel={() => this.setState({showEditDialog: false})}
            onClose={() => this.setState({showEditDialog: false})}
          >
            <ItemEditor
              ref={(c) => { this.romEditor = c; }}
              {...{
              isModify: true,
              releaseNumber: this.props.item.releaseNumber,
              innerSubmit: this.onEditRomSubmit,
              game: this.props.item,
              config: this.props.config,
              context: this.props.context,
            }} />
          </Dialog>
        </div>
      </div>
    );
  }
}
