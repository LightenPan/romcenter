import React, { Component } from 'react';
import { Button, Dialog } from '@alifd/next';
import IceImg from '@icedesign/img';
import ItemEditor from '../ItemEditor';
import ImageGrab from '../ImageGrab';
import styles from './SingleItem.module.scss';
import GameUtils from '../../../utils/GameUtils';

export default class SingleItem extends Component {
  static displayName = 'SingleItem';

  constructor(props) {
    super(props);
    this.state = {
      showEditDialog: false,
      imgObj: null,
    };
  }

  // 在组件挂载之前把数据设置进去(可以用initValue替代这种用法)
  componentWillMount = () => {
    const { item, config, context } = this.props;
    const imgObj = GameUtils.genImageObj(
      item.imageNumber, config.newDat.imURL, context.gameImgsPath, config.imFolder);
    this.setState({ imgObj });
  }

  componentWillReceiveProps = (nextProps) => {
    const { item, config, context } = nextProps;
    const imgObj = GameUtils.genImageObj(
      item.imageNumber, config.newDat.imURL, context.gameImgsPath, config.imFolder);
    this.setState({ imgObj });
  }

  onEditRomSubmit = (values) => {
    console.log('onEditRomSubmit. values: ', values);
    const {item} = this.props;
    const keyList = [
      'title',
      'comment',
      'sourceRom',
      'releaseNumber',
      'imageNumber',
      'romSize',
      'publisher',
      'location',
      'language',
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
                <IceImg src={this.state.imgObj.a} width={160} type="contain"
                  onError={() => {
                    const {imgObj} = this.state;
                    imgObj.a = '';
                    this.setState({imgObj});
                  }}
                />
              </span>
              <span className={styles.imgItem}>
                <IceImg src={this.state.imgObj.b} width={160} type="contain"
                  onError={() => {
                    const {imgObj} = this.state;
                    imgObj.b = '';
                    this.setState({imgObj});
                  }}/>
              </span>
            </div>
          </div>

          <div className={styles.item}>
            <span className={styles.label}>标题: </span>
            <span className={styles.value}>{this.props.item.title}</span>
          </div>
          <div className={styles.item}>
            <span className={styles.label}>备注: </span>
            <span className={styles.value}>{this.props.item.comment}</span>
          </div>
          <div className={styles.item}>
            <span className={styles.label}>发行: </span>
            <span className={styles.value}>{this.props.item.publisher}</span>
          </div>
          {/* <div className={styles.item}>
            <span className={styles.label}>来源: </span>
            <span className={styles.value}>{this.props.item.sourceRom}</span>
          </div> */}
          <div className={styles.labelGroup}>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>CRC: </span>
              <span className={styles.value}>{this.props.item.files.romCRC._}</span>
            </div>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>尺寸: </span>
              <span className={styles.value}>{this.props.item.romSize}</span>
            </div>
          </div>
          <div className={styles.labelGroup}>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>编号: </span>
              <span className={styles.value}>{this.props.item.releaseNumber}</span>
            </div>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>图片: </span>
              <span className={styles.value}>{this.props.item.imageNumber}</span>
            </div>
          </div>
          <div className={styles.labelGroup}>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>地区: </span>
              <span className={styles.value}>{this.props.item.location}</span>
            </div>
            <div className={styles.labelGroupItem}>
              <span className={styles.label}>语言: </span>
              <span className={styles.value}>{this.props.item.language}</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.cenGroup}>
            <span>
              <Button type="primary" onClick={() => {
                Dialog.confirm({
                  title: '选择过滤条件',
                  content: <ImageGrab imageNumber={this.props.item.imageNumber} />,
                  isFullScreen: true,
                });
              }}>
                抓取图片
              </Button>
            </span>
            <span>
              <Button type="primary" onClick={() => this.setState({showEditDialog: true})}>
                编辑Rom信息
              </Button>
            </span>
            <span>
              <Button type="primary" onClick={() => {
                this.setState({ imgObj: null });
                const { item, config, context } = this.props;
                const imgObj = GameUtils.genImageObj(
                  item.imageNumber, config.newDat.imURL, context.gameImgsPath, config.imFolder);
                this.setState({ imgObj });
              }}>
                刷新图片
              </Button>
            </span>
          </div>
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
