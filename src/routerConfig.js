// import UserLogin from '@/pages/UserLogin';
import LoginBlock from '@/components/LoginBlock';
import UserRegister from '@/pages/UserRegister';
// import Setting from '@/pages/Setting';
import UserLayout from '@/layouts/UserLayout';
import BasicLayout from '@/layouts/BasicLayout';

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
        redirect: '/wikiGameList',
      },
    ],
  },
];

export default routerConfig;
