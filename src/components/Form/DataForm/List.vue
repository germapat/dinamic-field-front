<template>
  <div id="list-form">
    <div class="bg-form"></div>
    <div class="row">
      <div class="q-table-title-br col-md-6">
        <div>
          <q-breadcrumbs-el :label="title || this.$q.localStorage.get.item('titleform')"/>
        </div>
        <div class="btn-actions btn-new-ac">
          <q-btn color="tigouner" icon="reply" to="/home/forms/">
            <q-tooltip anchor="bottom middle" self="top middle">
              Volver
            </q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
    <div class="row q-mt-md">
      <div class="col-12">
        <q-card>
          <q-card-main class="row">
            <div class="col-xs-12 col-sm-6 col-lg-4">
              <q-field
                icon="reorder">
                <q-select
                  filter
                  float-label="Ordenar por"
                  :options="actions.search.optionsOrdering"
                  v-model="actions.search.ordering"
                  @input="$refs.datatable.ordering()"
                />
              </q-field>
            </div>
            <div class="col-xs-12 col-sm-6 col-lg-4">
              <q-field
                icon="filter_list">
                <q-select
                  float-label="Filtar por"
                  :options="actions.search.options"
                  v-model="actions.search.select"
                />
              </q-field>
            </div>
            <div class="col-xs-12 col-sm-6 col-lg-4">
              <q-field icon="search">
                <q-input
                  clearable
                  float-label="Buscar"
                  :loading="actions.search.loading"
                  v-model.trim="actions.search.filter"
                  @clear="$refs.datatable.search_clear()"
                  v-on:keyup.tab="$refs.datatable.search()"
                  v-on:keyup.enter="$refs.datatable.search()"
                  v-on:keyup.esc="$refs.datatable.search_clear()"
                  :after="[{icon: 'arrow_forward', content: true, handler () { $refs.datatable.search() }}]"
                />
              </q-field>
            </div>
          </q-card-main>
        </q-card>
      </div>
      <div class="col-12 q-mt-md">
        <data-form ref="datatable" :datatable="info_datatable" />
      </div>
    </div>
  </div>
</template>
<script>
import DataForm from 'components/Table/DataForm'
export default {
  name: 'List',
  components: { DataForm },
  data () {
    return {
      entries: [],
      title: null,
      info_datatable: {
        valuesJSON: {},
        columns: [],
        serverPage: `forms/data/${this.$route['params'].id}/`,
        title: 'Lista de Registros',
        permissions: {},
        scaling: false
      },
      actions: {
        search: {
          select: null,
          options: [],
          filter: null,
          loading: false,
          ordering: null,
          optionsOrdering: [],
          typeOrdering: null
        }
      }
    }
  },
  created () {
    let keys = []
    this.$axios.get(`forms/data/${this.$route['params'].id}/`).then(response => {
      this.entries = response.data.results
      if (this.entries.length > 0) {
        this.title = this.entries[0].formLabel
        this.info_datatable.scaling = this.entries[0].formScaling
        this.info_datatable.permissions.add = `db.add_custom_${this.title}`.replace(/ /g, '_')
        this.info_datatable.permissions.edit = `db.change_custom_${this.title}`.replace(/ /g, '_')
        this.info_datatable.permissions.delete = `db.delete_custom_${this.title}`.replace(/ /g, '_')
        this.info_datatable.permissions.manage = `db.manage_custom_${this.title}`.replace(/ /g, '_')
        keys = Object.keys(this.entries[0].valuesJSON)
        if (this.entries[0].formScaling) {
          this.info_datatable.columns.unshift({ name: 'status', label: 'Estado', field: 'status', align: 'center' })
        }
        for (let k = 0; k < keys.length; k++) {
          if (k !== 4) {
            this.info_datatable.columns.unshift({
              name: keys[k],
              label: (keys[k].charAt(0).toUpperCase() + keys[k].slice(1)).replace(/_/g, ' '),
              field: keys[k],
              align: 'left'
            })
          } else {
            break
          }
        }
        this.info_datatable.columns.unshift({ name: 'created_at', label: 'Fecha de creación', field: 'created_at', align: 'center' })
        this.info_datatable.columns.unshift({ name: 'id', label: 'ID', field: 'id', align: 'center' })
        let options = []
        for (var i in this.info_datatable.columns) {
          if (this.info_datatable.columns[i].field !== 'id' && this.info_datatable.columns[i].field !== 'manage') {
            options.push({
              label: this.info_datatable.columns[i].label,
              value: this.info_datatable.columns[i].field
            })
          }
        }
        this.actions.search.options = options.slice()
        this.actions.search.select = options[0].value

        let optionsOrdering = []
        for (var j in this.actions.search.options) {
          if (this.actions.search.options[j].value === 'status' || this.actions.search.options[j].value === 'created_at') {
            optionsOrdering.push(
              {
                label: 'Ascendente - ' + this.actions.search.options[j].label,
                value: this.actions.search.options[j].value
              },
              {
                label: 'Descendente - ' + this.actions.search.options[j].label,
                value: '-' + this.actions.search.options[j].value
              }
            )
          } else {
            optionsOrdering.push(
              {
                label: 'Ascendente - ' + this.actions.search.options[j].label,
                value: 'valuesJSON__' + this.actions.search.options[j].value
              },
              {
                label: 'Descendente - ' + this.actions.search.options[j].label,
                value: '-valuesJSON__' + this.actions.search.options[j].value
              }
            )
          }
        }
        this.actions.search.optionsOrdering = optionsOrdering.slice()
        this.actions.search.ordering = optionsOrdering[0].value
      }
    }).catch({})
  }
}
</script>
<style scoped>
</style>
