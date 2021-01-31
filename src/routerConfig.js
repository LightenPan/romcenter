// import UserLogin from '@/pages/UserLogin';
import LoginBlock from '@/components/LoginBlock';
import UserRegister from '@/pages/UserRegister';
// import Setting from '@/pages/Setting';
import UserLayout from '@/layouts/UserLayout';
import BasicLayout from '@/layouts/BasicLayout';

import LbGameList from '@/pages/LbGameList';
import LbGameInfo from '@/pages/LbGameInfo';
import FixRomList from '@/pages/FixRomList';

import RomList from '@/pages/RomList';
import WikiGameList from '@/pages/WikiGameList';
import MenuGameList from '@/pages/WikiGameList/MenuGameList';

const routerConfig = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      {
        path: '/login',
        component: LoginBlock,
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
        path: '/LbGameList',
        component: LbGameList,
      },
      {
        path: '/LbGameInfo/:lbid',
        component: LbGameInfo,
      },
      {
        path: '/FixRomList',
        component: FixRomList,
      },
      {
        path: '/wikiGameList',
        component: WikiGameList,
      },
      {
        path: '/wikiUserMenuList',
        component: MenuGameList,
      },
      {
        path: '/oleditor',
        component: RomList,
      },
      {
        path: '/',
        redirect: '/LbGameList',
      },
    ],
  },
];

export default routerConfig;
