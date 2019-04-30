<template>
  <div>
    <user-list />
  </div>
</template>

<script>
import UserList from 'components/User/UserList'
export default {
  name: 'ListUser',
  data () {
    return {
    }
  },
  components: {
    UserList
  }
}
</script>

<style scoped>
</style>
