import React, { Component } from 'react';
import { Input, Checkbox, Grid, Icon, Form } from '@alifd/next';
import { Redirect } from 'react-router-dom';
import DataBinder from '@icedesign/data-binder';
import md5 from "md5";

import './Login.scss';
import styles from './index.module.scss';
import { isLogin } from '../../utils/user';

const { Row } = Grid;
const Item = Form.Item;


@DataBinder({
  'login': {
    // AJAX 部分的参数完全继承自 axios ，参数请详见：https://github.com/axios/axios
    url: `${__API_HOST__}/api/RetroGameWiki/login`,
    method: 'POST',
    withCredentials: true,
    // 接口默认数据
    defaultBindingData: {
    },
  },
})

export default class LoginBlock extends Component {
  static displayName = 'LoginBlock';

  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      value: null,
      liginSucc: false,
    };
  }

  // 在组件挂载之前把数据设置进去(可以用initValue替代这种用法)
  componentWillMount() {
    isLogin((isAuthed) => {
      if (isAuthed) {
        this.setState({liginSucc: true});
      }
    })
  }

  formChange = (value) => {
    this.setState({ value });
  };

  handleSubmit = (values, errors) => {
    if (errors) {
      console.log('errors', errors);
      return;
    }
    const acc = values.acc;
    const pwd = values.pwd
    const time = new Date().getTime();
    const pwdmd5 = md5(`${pwd}`);
    const userpwdmd5 = md5(`${acc} ${pwdmd5}`);
    const sign = md5(`${acc} ${time} ${userpwdmd5}`);
    const params = {acc, time, sign, checkbox: values.checkbox};
    this.props.updateBindingData('login', { data: params }, (response) => {
      console.log('values:', values);
      // Message.success('登录成功');
      // 登录成功后做对应的逻辑处理
      if (response.status === 'SUCCESS') {
        window.location.reload();
      }
    });
  };

  render() {
    if (this.state.liginSucc) {
      return <Redirect to='/' />
    }
    return (
      <div className={`${styles.container} user-login`}>
        <div className={styles.header}>
          <a href="#" className={styles.meta}>
            <img
              className={styles.logo}
              src={require('./images/TB13UQpnYGYBuNjy0FoXXciBFXa-242-134.png')}
              alt="logo"
            />
            <span className={styles.title}>飞冰</span>
          </a>
          <p className={styles.desc}>飞冰让前端开发简单而友好</p>
        </div>
        <div className={styles.formContainer}>
          <h4 className={styles.formTitle}>登 录</h4>
          <Form
            value={this.state.value}
            onChange={this.formChange}
            size="large"
          >
            <Item required requiredMessage="必填">
              <Input
                name="acc"
                innerBefore={<Icon
                  type="account"
                  size="small"
                  className={styles.inputIcon}
                />}
                size="large"
                maxLength={20}
                placeholder="魔改账号"
              />
            </Item>
            <Item required requiredMessage="必填">
              <Input
                name="pwd"
                innerBefore={<Icon type="account" size="small" className={styles.inputIcon} test="lock" />}
                size="large"
                htmlType="password"
                placeholder="魔改邀请码"
              />
            </Item>
            <Item >
              <Checkbox name="checkbox" className={styles.checkbox}>记住账号</Checkbox>
            </Item>


            <Row className={styles.formItem}>
              <Form.Submit
                type="primary"
                onClick={this.handleSubmit}
                className={styles.submitBtn}
                validate
              >
                登 录
              </Form.Submit>
            </Row>

            {/* <Row className={`${styles.tips} tips`}>
            <a href="/" className={styles.link}>
              立即注册
              </a>
            <span className={styles.line}>|</span>
            <a href="/" className={styles.link}>
              忘记密码
              </a>
          </Row> */}
          </Form>
        </div>
      </div>
    )
  };
}
