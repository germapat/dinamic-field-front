<template>
  <div>
    <div class="row q-mb-md">
      <div class="q-table-title-br col-md-6">
        <div>
          <q-breadcrumbs-el :label="data.label"/>
        </div>
        <div class="btn-actions btn-new-ac">
          <q-btn color="tigouner" icon="reply" :to="`/home/forms/${formId}/entries/`">
            <q-tooltip anchor="bottom middle" self="top middle">
              Volver
            </q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
    <div v-if="data.description != null || (data.description != null && data.description.length > 0)" class="q-mb-md">
      {{ data.description }}
    </div>
    <q-card class="bg-white">
      <q-card-main>
        <q-list no-border>
          <q-list-header>
            <p class="q-title row items-center text-black">{{ data.scaling ? `Caso #${formEntry}` : `Registro #${formEntry}` }}<q-chip v-if="info.hasOwnProperty('status') && labelStatus != null" dense class="q-pa-sm q-ml-md" square color="info" tag>{{labelStatus}}</q-chip></p>
          </q-list-header>
        </q-list>
        <q-list no-border>
          <q-item class="row fit items-start">
            <div class="col-xs-12 col-md-6">
              <q-field
                icon="face"
                helper="Creado por">
                <span>{{info.created_by}}</span>
              </q-field>
            </div>
            <div class="col-xs-12 col-md-6">
              <q-field
                icon="date_range"
                helper="Fecha de creación">
                <span>{{info.created_at}}</span>
              </q-field>
            </div>
            <div class="col-xs-12 col-md-6">
              <q-field
                icon="refresh"
                helper="Actualizado por">
                <span>{{info.updated_by}}</span>
              </q-field>
            </div>
            <div class="col-xs-12 col-md-6">
              <q-field
                icon="update"
                helper="Fecha de actualización">
                <span>{{info.updated_at}}</span>
              </q-field>
            </div>
          </q-item>
        </q-list>
        <div v-if="data.scaling">
          <q-list no-border v-for="(level, indexLevel) in data.fields" :key="indexLevel" v-if="indexLevel < counter">
            <q-list-header v-if="data.fields.length > 1">
              {{ level.label }}
            </q-list-header>
            <q-item class="row">
              <validation-provider :class="field.type === 'InputTextarea' ? 'col-12' : 'col-xs-12 col-lg-6'" v-for="(field, indexfield) in level.fields" :key="indexfield" :name="field.name" :rules="field.validators">
                <component
                  v-if="field.visible"
                  :id="field.name"
                  v-model="valuesJSON[field.name]"
                  @input="val => { checkValue(val, field.name) }"
                  slot-scope="{ errors }"
                  :validators="errors"
                  :is="field.type"
                  :config="field" />
              </validation-provider>
            </q-item>
          </q-list>
        </div>
        <div v-else>
          <q-list no-border v-for="(level, indexLevel) in data.fields" :key="indexLevel">
            <q-item class="row">
              <div :class="field.type === 'InputTextarea' ? 'col-12' : 'col-xs-12 col-lg-6'" v-for="(field, indexfield) in level.fields" :key="indexfield">
                <q-field
                  icon="storage"
                >
                <q-input
                  :float-label="field.label"
                  readonly
                  v-model="valuesJSON[field.name]"
                />
              </q-field>
              </div>
            </q-item>
          </q-list>
        </div>
        <q-list no-border v-if="info.status === 'joined' && data.scaling">
          <q-item class="row fit items-center">
            <div class="col-12">
              <q-btn
                color="secondary"
                class="full-width q-mr-lg"
                label="Guardar"
                @click="edit">
                  <q-spinner-oval slot="loading" />
              </q-btn>
            </div>
          </q-item>
        </q-list>
      </q-card-main>
    </q-card>
  </div>
</template>

<script>
import InputCheckbox from 'components/Form/formComponents/InputCheckbox'
import InputColor from 'components/Form/formComponents/InputColor'
import InputDate from 'components/Form/formComponents/InputDate'
import InputDateTime from 'components/Form/formComponents/InputDateTime'
import InputRadio from 'components/Form/formComponents/InputRadio'
import InputSelect from 'components/Form/formComponents/InputSelect'
import InputText from 'components/Form/formComponents/InputText'
import InputTextarea from 'components/Form/formComponents/InputTextarea'
import InputNumber from 'components/Form/formComponents/InputNumber'
import InputTime from 'components/Form/formComponents/InputTime'
import { ValidationObserver, ValidationProvider } from 'vee-validate'

export default {
  name: 'ViewEdit',
  components: {
    ValidationObserver,
    ValidationProvider,
    InputCheckbox,
    InputColor,
    InputDate,
    InputDateTime,
    InputRadio,
    InputSelect,
    InputText,
    InputTime,
    InputTextarea,
    InputNumber
  },
  data () {
    return {
      data: {},
      info: {},
      valuesJSON: {},
      labelStatus: null,
      counter: null,
      formId: this.$route.params.form ? this.$route.params.form : null,
      formEntry: this.$route.params.id ? this.$route.params.id : null
    }
  },
  created () {
    let self = this
    this.$axios.get(`forms/manage/${this.formId}/`).then(response => {
      this.data = Object.assign({}, response.data)
      this.$q.localStorage.set('data', this.data)
      // Se crean las llaves de los campos dinámicos
      for (var k in this.data.fields) {
        for (var l in this.data.fields[k].fields) {
          if (this.data.fields[k].fields.hasOwnProperty('options')) {
            this.valuesJSON[this.data.fields[k].fields[l].name] = []
          } else {
            this.valuesJSON[this.data.fields[k].fields[l].name] = ''
          }
        }
      }
      /* Cargar datos */
      this.$axios.get(`forms/data/${this.formId}/${this.formEntry}/`).then(res => {
        if (res.data.status === 'joined' && self.data.scaling) {
          this.labelStatus = 'Ingresado'
          for (var g = 0; g < self.data.fields.length; g++) {
            for (var h in this.info) {
              this.data.fields[g].fields[h].readonly = true
            }
            if (this.data.fields[g].model === res.data.currentLevel) {
              this.counter = g
              return false
            }
            this.counter = 1
          }
        } else if (res.data.status === 'in_process') {
          this.labelStatus = 'En proceso'
          for (var i = 0; i < this.data.fields.length; i++) {
            for (var j = 0; j < this.data.fields[i].fields.length; j++) {
              this.data.fields[i].fields[j].readonly = true
            }
            if (res.data.currentLevel === null) {
              this.counter = 1
            } else if (res.data.currentLevel === this.data.fields[i].name) {
              this.counter = i
            }
          }
        } else if (res.data.status === 'finalized') {
          this.labelStatus = 'Finalizado'
          for (var z = 0; z < this.data.fields.length; z++) {
            for (var x = 0; x < this.data.fields[z].fields.length; x++) {
              this.data.fields[z].fields[x].readonly = true
            }
          }
          this.counter = this.data.fields.length
        }
        this.info = Object.assign({}, res.data)
        for (var b in this.info.valuesJSON) {
          this.valuesJSON[b] = this.info.valuesJSON[b]
        }
      }).catch(error => {
        if (error.hasOwnProperty('response') && error.response.hasOwnProperty('status')) {
          if (error.response.status === 404) {
            this.$router.replace('/home/forms/')
            this.$messages('warning', 'Este registro no existe')
          }
          if (error.response.status === 401) {
            this.$redirect('login')
            this.$messages('warning', 'Inicia sesión nuevamente')
          }
        }
      })
    }).catch({})
  },
  methods: {
    async edit () {
      this.$validator.validate().then(result => {
        if (result) {
          this.info.valuesJSON = Object.assign({}, this.valuesJSON)
          this.$axios.put(`forms/data/${this.formId}/${this.formEntry}/`, this.info).then(response => {
            this.$messages('info', 'Registro actualizado con éxito')
            this.$router.replace(`/home/forms/${this.formId}/entries/`)
          }).catch(error => {
            if (error.response.status === 404) {
              this.$router.replace('/home/forms/')
            }
            if (error.response.status === 401) {
              this.$redirect('login')
              this.$messages('warning', 'Inicia sesión nuevamente')
            }
          })
        }
      })
    },
    checkValue (val, name) {
      for (var i in this.data.fields) {
        for (var j in this.data.fields[i].fields) {
          let arrayConditions = []
          for (var k in this.data.fields[i].fields[j].dependent) {
            arrayConditions.push(this.data.fields[i].fields[j].dependent[k].condition)
            let conditions = arrayConditions.toString().split(',').join(' || ')
            /* eslint-disable */
            if (name === this.data.fields[i].fields[j].dependent[k].field && eval(conditions)) {
            /* eslint-enable */
              this.data.fields[i].fields[j].visible = this.data.fields[i].fields[j].dependent[k].action
            } else {
              if (name === this.data.fields[i].fields[j].dependent[k].field) {
                this.data.fields[i].fields[j].visible = this.$q.localStorage.get.item('data').fields[i].fields[j].visible
              }
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>
</style>
