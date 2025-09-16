import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { currentUser } from '@/services/auth/auth';

import TabsPage from '@/views/TabsPage.vue';
import LoginPage from '../views/LoginPage.vue';
import EventDetail from '@/components/EventDetail.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: LoginPage },
  {
    path: '/events/navigation/:eventLat/:eventLng',
    name: 'navigation-map',
    component: () => import('../views/NavigationMap.vue'),
    props: route => ({
      eventLat: parseFloat(route.params.eventLat as string),
      eventLng: parseFloat(route.params.eventLng as string)
    })
  },
  {
    path: '/tabs',
    component: TabsPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/tabs/events'   
      },
      {
        path: 'events',
        name: 'events',
        component: () => import('@/views/EventsPage.vue'),
      },
      {
        path: 'events/:id',
        name: 'event-detail',
        component: EventDetail,
        props: true,
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',          
        name: 'profile',
        component: () => import('@/views/PreferencesPage.vue')
      },
      {
        path: 'bookmarks',        
        name: 'bookmarks',
        component: () => import('@/views/Bookmarks.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, _from, next) => {
  const isLoggedIn = !!currentUser.value;

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({ name: 'login' });
  }

  if (to.name === 'login' && isLoggedIn) {
    return next({ name: 'events' });
  }

  next();
});

export default router;
