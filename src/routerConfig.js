import UserLogin from '@/pages/UserLogin';
import UserRegister from '@/pages/UserRegister';
import Setting from '@/pages/Setting';
import UserLayout from '@/layouts/UserLayout';
import BasicLayout from '@/layouts/BasicLayout';

import RomList from '@/pages/RomList';
import WikiGameList from '@/pages/WikiGameList';

const routerConfig = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      {
        path: '/login',
        component: UserLogin,
      },
      {
        path: '/register',
        component: UserRegister,
      },
      {
        path: '/',
        redirect: '/user/login',
      },
    ],
  },
  {
    path: '/',
    component: BasicLayout,
    children: [
      {
        path: '/romlist',
        component: RomList,
      },
      {
        path: '/wikiGameList',
        component: WikiGameList,
      },
      {
        path: '/setting',
        component: Setting,
      },
      {
        path: '/',
        redirect: '/romlist',
      },
    ],
  },
];

export default routerConfig;
