<template>
  <div class="fixed-center text-center">
    <p>
      <img
        src="~assets/sad.svg"
        style="width:30vw;max-width:150px;"
      >
    </p>
    <p class="text-faded">Lo siento, página no encontrada<strong> (404)</strong></p>
    <q-btn
      color="primary"
      style="width:200px;"
      @click="redirect"
    >Ir al inicio</q-btn>
  </div>
</template>

<script>
export default {
  name: 'Error404',
  methods: {
    redirect () {
      if (this.$q.localStorage.has('token')) {
        this.$router.replace('/home/forms/')
      } else {
        this.$router.replace('/')
      }
    }
  }
}
</script>
