import cookie from 'react-cookies';
import axios from 'axios';

const loginUser = () => {
  const all = cookie.loadAll();
  const session = cookie.load('session');
  console.log('session: %s, all: %s', session, JSON.stringify(all));
  return session;
};


const isLogin = (cb) => {
  axios.get(`${__API_HOST__}/api/RetroGameWiki/checklogin`, {
    withCredentials: true,
  }).then(() => {
    if (cb) {
      cb(true);
    }
  }).catch(() => {
    if (cb) {
      cb(false);
    }
  })
};

// const logout = (history, pathname) => {
//   UnitConfig.logout(appSn, () => {
//     history ?
//       history.push('/login?returnPath=' + pathname, { nextPathname: pathname }) :
//       window.location.href = '/login?returnPath=' + pathname;
//   });
// };

// const goToLogin = (history, pathname) => {
//   UnitConfig.logout(appSn, () => {
//     history.push('/login?returnPath=' + pathname, { nextPathname: pathname });
//   });
// };

// export { loginUser, isLogin, logout, goToLogin };
export { loginUser, isLogin };
