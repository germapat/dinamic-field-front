const routes = [
  {
    path: '/',
    component: () => import('layouts/Layout.vue'),
    children: [
      { path: '/', component: () => import('pages/Index.vue') },
      { path: 'ErrorFormPrivate/', component: () => import('pages/ErrorFormPrivate.vue') }
    ]
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('components/Welcome.vue') }, // Bienvenida
      { path: 'forms/', component: () => import('pages/Form/ListForm.vue') }, // Lista de formularios
      { path: 'forms/add/', component: () => import('pages/Form/ManageForm.vue') }, // Creación de formularios
      { path: 'forms/:id/', name: 'formDetail', component: () => import('pages/Form/ManageForm.vue') }, // Detalle por ID de un formulario
      { path: 'forms/:id/entries/', component: () => import('components/form/DataForm/List.vue') }, // Registros de un formulario
      { path: 'forms/:form/:id', component: () => import('pages/Form/DataForm/ViewEditForm.vue') }, // Detalle por ID de un registro de un formulario
      { path: 'forms/:form/manage/:id', component: () => import('pages/Form/DataForm/ManageForm.vue') }, // Gestión por ID de un registro en el formulario
      { path: 'form/charts/:id/', component: () => import('components/form/DataForm/Charts.vue') }, // Gráficas por formulario
      { path: 'users/', component: () => import('pages/User/ListUser.vue') }, // Lista de usuarios
      { path: 'users/new/', component: () => import('pages/User/ManageUser.vue') }, // Creación de formularios
      { path: 'users/:id/', component: () => import('pages/User/ManageUser.vue') }, // Edición de un usuario
      { path: 'users/:id/detail', component: () => import('components/User/UserView.vue') }, // Detalle por ID de un usuario
      { path: 'groups/', component: () => import('pages/User/ListGroup.vue') }, // Lista de grupos
      { path: 'groups/add/', component: () => import('pages/User/ManageGroup.vue') }, // Creación de grupos
      { path: 'groups/:id/detail/', component: () => import('components/User/GroupView.vue') }, // Detalle por ID de un grupo
      { path: 'groups/:id/', component: () => import('pages/User/ManageGroup.vue') } // Edición de un grupo
    ]
  },
  {
    path: '/',
    component: () => import('layouts/FormDataLayout.vue'),
    children: [
      { path: 'forms/:form/new/', component: () => import('pages/Form/DataForm/NewLog.vue') }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
