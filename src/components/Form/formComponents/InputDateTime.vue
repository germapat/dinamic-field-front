<template>
  <q-field
    :icon="config.icon || 'date_range'"
    :helper="config.helper"
    :error="validators.length > 0"
    :error-label="validators[0]"
  >
    <q-datetime
      color="secondary"
      v-model="date"
      type="datetime"
      clearable
      format="YYYY/MM/DD HH:mm"
      :readonly="config.readonly || false"
      :float-label="config.label || 'Etiqueta del campo'"
      @input="setValue"
    />
  </q-field>
</template>
<script>
import { date } from 'quasar'
export default {
  name: 'InputDateTime',
  data () {
    return {
      date: null
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
  },
  watch: {
    value (val) {
      this.date = val
    }
  },
  methods: {
    setValue () {
      this.$emit('input', date.formatDate(this.date, 'YYYY/MM/DD HH:mm'))
    }
  }
}
</script>
<style scoped>
</style>
