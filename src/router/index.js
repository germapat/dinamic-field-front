import Vue from 'vue'
import VueRouter from 'vue-router'
import { LocalStorage, Dialog, colors } from 'quasar'
import routes from './routes'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })
  Router.beforeResolve((to, from, next) => {
    if (to.path.includes('home')) {
      if (!LocalStorage.has('user') && !LocalStorage.has('permissions') && !LocalStorage.has('token')) {
        Router.replace('/')
      } else {
        next()
      }
      colors.setBrand('secondary', '#50bdeb')
    } else if (to.path.includes('/forms/') && to.path.includes('new')) {
      next()
    } else if (to.path.includes('/')) {
      if (LocalStorage.has('user') && LocalStorage.has('permissions') && LocalStorage.has('token')) {
        Router.replace('/home/forms/')
      } else {
        next()
      }
      colors.setBrand('secondary', '#50bdeb')
    }
  })
  Router.beforeEach((to, from, next) => {
    if (!from.params.hasOwnProperty('id')) {
      if (from.fullPath === '/home/forms/add/' || from.fullPath.indexOf('/home/forms/edit/') !== -1) {
        if (LocalStorage.has('dataForm')) {
          let configDialog = {
            preventClose: true,
            ok: {
              flat: true,
              color: 'secondary',
              label: 'Aceptar'
            },
            cancel: {
              flat: true,
              color: 'grey',
              label: 'Cancelar'
            },
            title: '¿Está seguro/a?',
            message: 'Al aceptar, descartarás las información ingresada/editada'
          }
          Dialog.create(configDialog).then(() => {
            LocalStorage.remove('dataForm')
            next()
          }).catch(() => {
            next(false)
          })
        } else {
          next()
        }
      } else {
        next()
      }
    } else {
      LocalStorage.remove('dataForm')
      next()
    }
  })

  return Router
}
