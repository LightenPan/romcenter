import ReactDOM from 'react-dom';
// 载入默认全局样式 normalize 、.clearfix 和一些 mixin 方法等
import '@alifd/next/reset.scss';
import router from './router';
import { isLogin } from './utils/user';


const ICE_CONTAINER = document.getElementById('ice-container');

if (!ICE_CONTAINER) {
  throw new Error('当前页面不存在 <div id="ice-container"></div> 节点.');
}

const authPath = '/user/login' // 默认未登录的时候返回的页面，可以自行设置
isLogin((isAuthed) => {
  // 如果登陆之后可以利用redux修改该值(关于redux不在我们这篇文章的讨论范围之内）
  ReactDOM.render(router(isAuthed, authPath), ICE_CONTAINER);
})
