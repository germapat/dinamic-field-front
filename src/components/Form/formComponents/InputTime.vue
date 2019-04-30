<template>
  <q-field
    icon="access_time"
    :helper="config.helper"
    :error="validators.length > 0"
    :error-label="validators[0]">
    <q-datetime
      color="secondary"
      v-model="date"
      type="time"
      :readonly="config.readonly || false"
      clearable
      format-model="string"
      :float-label="config.label || 'Seleccione una hora'"
      @input="setValue"/>
  </q-field>
</template>
<script>
import { date } from 'quasar'
export default {
  name: 'InputTime',
  data () {
    return {
      date: null
    }
  },
  watch: {
    value (val) {
      this.date = val
    }
  },
  methods: {
    setValue () {
      this.$emit('input', date.formatDate(this.date, 'YYYY HH:mm'))
    }
  },
  props: {
    config: Object,
    value: String,
    validators: {
      type: Array,
      default: function () {
        return []
      }
    }
  }
}
</script>
<style scoped>
</style>
