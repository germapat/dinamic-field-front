<template>
  <div id="listform" class="row justify-center">
    <div class="bg-form"></div>
    <q-card class="q-mt-xl col-8" square>
      <q-card-media>
        <img src="../statics/logo-sysform.png" class="centrado">
      </q-card-media>
      <q-card-title class="text-center">
        <span class="text-primary" v-text="`Bienvenido`"></span>
      </q-card-title>
      <q-card-main>
        <p class="text-center">El aplicativo tiene como objetivo facilitar la gestión de formularios.</p>
      </q-card-main>
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'Welcome',
  data () {
    return {
    }
  }
}
</script>
<style scoped>
  .centrado {
    margin: 10px auto;
    display: block;
    width: 50%;
    height: 50%;
  }
</style>
