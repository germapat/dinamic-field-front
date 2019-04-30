<template>
  <q-field
    :icon="config.icon || 'list'"
    :helper="config.helper"
    :error="validators.length > 0"
    :error-label="validators[0]"
  >
    <q-select
      color="secondary"
      v-model="content"
      @input="setValue"
      :readonly="config.readonly || false"
      :options="config.options"
      :float-label="config.label || 'Selección'" />
  </q-field>
</template>
<script>
export default {
  name: 'InputSelect',
  data () {
    return {
      content: this.value,
      opts: []
    }
  },
  watch: {
    value (val) {
      this.content = val
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
  methods: {
    setValue () {
      this.$emit('input', this.content)
    }
  }
}
</script>
<style scoped>
</style>
