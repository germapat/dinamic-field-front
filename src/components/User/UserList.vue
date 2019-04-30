<template>
  <div id="listform">
    <div class="bg-form"></div>
    <user />
  </div>
</template>
<script>
import User from 'components/table/User.vue'
export default {
  name: 'UserList',
  components: { User },
  data () {
    return {
    }
  }
}
</script>

<style scoped>
</style>
