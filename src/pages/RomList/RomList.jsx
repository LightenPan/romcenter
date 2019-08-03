import React, { Component } from 'react';
import { Grid, Pagination, Form, Button, Upload, Dialog } from '@alifd/next';
import SingleItem from './SingleItem';
import ItemEditor from './ItemEditor';

import styles from './RomList.module.scss';
import './RomList.css'

const { Row, Col } = Grid;

export default class RomList extends Component {
  static displayName = 'RomList';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      selectFile: '',
      xmlData: null,
      allGameList: [],
      showGameList: [],
      pageIndex: 1,
      pageCount: 100,
    };
  }

  readDatFile = (path) => {
    const reader = new FileReader();
    reader.readAsText(path, 'UTF-8');
    reader.onload = (event) => {
      const xml2js = require('xml2js');
      const parser = new xml2js.Parser({ explicitArray: false }); // 用于解析xml为json对象
      parser.parseString(event.target.result, (error, res) => {
        if (error) throw error;
        console.log(res);
        const allGameList = res.dat.games.game;
        const start = (this.state.pageIndex - 1) * this.state.pageCount;
        const end = Math.min(start + this.state.pageCount, allGameList.length);
        const showGameList = allGameList.slice(start, end);
        this.setState({ xmlData: res, allGameList, showGameList });
      });
    };
  }

  onAddRomSubmit = (info) => {
    console.log('onAddRomSubmit: ', info);
  }

  onAddRomDialog = () => {
    const config = this.state.xmlData.dat.configuration;
    Dialog.confirm({
      title: 'Confirm',
      content: <ItemEditor {...{innerSubmit: this.onAddRomSubmit, config}}/>,
      footerActions: [],
      // onOk: () => console.log('ok'),
      // onCancel: () => console.log('cancel')
    });
  }

  render() {
    return (
      <div className={styles.body}>
        <Row wrap gutter={20}>
          <Form inline>
            <Form.Item label="">
              <div className={styles.fileSelect}>
                <div className={styles.fileSelectButton}>
                  <Upload
                    accept=".xml"
                    onChange={(files) => {
                      const file = files[files.length - 1];
                      console.log('xml data file: ', file);
                      this.setState({ selectFile: file.name });
                      this.readDatFile(file.originFileObj);
                    }}
                  >
                    <Button type="primary">选择XML文件</Button>
                  </Upload>
                </div>
                <div className={styles.fileSelectLabel}>选定文件：{this.state.selectFile}</div>
              </div>
            </Form.Item>

            {
              (this.state.selectFile) &&
              <Form.Item label="">
                <Button type="primary" onClick={() => {
                  const downLoadDom = document.getElementById("Download");
                  if (downLoadDom) {
                    // 使用 createObjectURL 生成地址，格式为 blob:null/fd95b806-db11-4f98-b2ce-5eb16b38ba36
                    const xml2js = require('xml2js');
                    const builder = new xml2js.Builder({ explicitArray: false }); // 用于把json对象解析为xml
                    const outxml = builder.buildObject(this.state.xmlData);
                    const myBlob = new Blob([outxml], { type: "application/xml" });
                    const url = window.URL.createObjectURL(myBlob);
                    console.log('下载文件已就绪: ', url);
                    // 模拟a标签点击进行下载
                    downLoadDom.href = url
                    downLoadDom.download = this.state.selectFile;
                    downLoadDom.click();
                    // 下载后告诉浏览器不再需要保持这个文件的引用了
                    // window.URL.revokeObjectURL(url);
                  }
                }}>
                  保存修改文件
                </Button>
                <a id="Download" target="_blank" style={{ display: "none" }}>下载</a>
              </Form.Item>
            }

            {
              (this.state.selectFile) &&
              <Form.Item label="">
                <Button
                  onClick={() => {
                    this.onAddRomDialog();
                  }}
                  type="primary">新增Rom</Button>
              </Form.Item>
            }
          </Form>
        </Row>

        <Row wrap gutter={20}>
          {
            this.state.showGameList.map((item, index) => {
              const config = this.state.xmlData.dat.configuration;
              return (
                <Col l={4} s={6} xs={8} key={index}>
                  <SingleItem {...{ item, config }} />
                </Col>
              );
            })
          }
        </Row>

        {
          (this.state.selectFile) &&
          <Row wrap gutter={20}>
            <Pagination
              current={this.state.pageIndex}
              pageSize={this.state.pageCount}
              total={this.state.allGameList.length}
              // pageSizeSelector="dropdown"
              // pageSizeList={[20, 40, 60, 80, 100]}
              // onPageSizeChange={(pageSize) => {
              //   const { allGameList } = this.state;
              //   const start = 0;
              //   const end = Math.min(start + this.state.pageCount, allGameList.length);
              //   const showGameList = allGameList.slice(start, end);
              //   this.setState({ page: { index: 0, count: pageSize }, showGameList });
              // }}
              onChange={(current) => {
                const { allGameList } = this.state;
                const start = (current - 1) * this.state.pageCount;
                const end = Math.min(start + this.state.pageCount, allGameList.length);
                const showGameList = allGameList.slice(start, end);
                console.log('page change showGameList. start: %s, end: %s', start, end);
                this.setState({ pageIndex: current, showGameList });
              }}
            />
          </Row>
        }
      </div>
    );
  };
}
