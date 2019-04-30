<template>
  <div id="list-form">
    <div class="bg-form"></div>
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
          <p class="q-title row items-center text-black">{{ `Caso #${formEntry}` }} <q-chip v-if="info.hasOwnProperty('status') && labelStatus != null" dense class="q-pa-sm q-ml-md" square color="info" tag>{{labelStatus}}</q-chip></p>
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
          <q-list no-border v-for="(level, indexLevel) in data.fields" :key="indexLevel" v-if="indexLevel < counter">
              <q-list-header v-if="data.fields.length > 1">
                {{ level.label }}
              </q-list-header>
              <q-item class="row">
                <div :class="field.type === 'InputTextarea' ? 'col-12' : 'col-xs-12 col-lg-6'" v-for="(field, indexfield) in level.fields" :key="indexfield">
                  <validation-provider
                    :name="field.name"
                    :rules="field.validators">
                    <component
                      v-if="field.visible"
                      :id="field.name"
                      v-model="valuesJSON[field.name]"
                      @input="val => { checkValue(val, field.name) }"
                      slot-scope="{ errors }"
                      :validators="errors"
                      :is="field.type"
                      :config="field"
                    />
                  </validation-provider>
                </div>
              </q-item>
          </q-list>
        <q-list no-border>
          <q-item class="row fit items-start">
            <div class="col-xs-12 col-md-6">
              <q-field
                icon="visibility">
                <q-select
                  v-model="info.status"
                  :options="[
                    { label: 'En proceso', value: 'in_process' },
                    { label: 'Finalizado', value: 'finalized' },
                  ]"
                  float-label="Estado"
                />
              </q-field>
            </div>
            <div class="col-xs-12 col-md-6" v-if="info.status !== 'finalized' && data.fields.length > 1">
              <q-field
                icon="visibility"
                :helper="data.fields.length > 0 && (staticInfo.currentLevel === data.fields[(data.fields.length - 1)].name) ? 'Último nivel' : null">
                <q-select
                  :disable="data.fields.length > 0 && (staticInfo.currentLevel === data.fields[(data.fields.length - 1)].name)"
                  v-model="info.currentLevel"
                  :options="currenLevelOptions"
                  float-label="Niveles"
                />
              </q-field>
            </div>
          </q-item>
          <q-item class="row">
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
  name: 'ManageLog',
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
      data: {
        fields: []
      },
      info: {
        currentLevel: null,
        status: null,
        valuesJSON: {}
      },
      staticInfo: {},
      valuesJSON: {},
      currenLevelOptions: [],
      labelStatus: null,
      counter: null,
      formId: this.$route.params.form ? this.$route.params.form : null,
      formEntry: this.$route.params.id ? this.$route.params.id : null
    }
  },
  created () {
    let self = this
    this.$q.localStorage.remove('data')
    this.$q.localStorage.remove('managementTime')
    this.$axios.get(`forms/manage/${this.formId}/`).then(response => {
      if (this.$q.localStorage.get.item('permissions').indexOf('db.manage_custom_' + response.data.model) > -1 || this.$q.localStorage.get.item('permissions').indexOf('pyctivex.leader') > -1 || this.$q.localStorage.get.item('permissions').indexOf('pyctivex.executive') > -1) {
        this.data = Object.assign({}, response.data)
        this.$q.localStorage.set('data', this.data)
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
        this.$axios.get(`forms/data/${this.formId}/${this.formEntry}/`).then(response => {
          if (response.data.status === 'joined' || response.data.status === 'in_process') {
            this.labelStatus = 'En proceso'
            this.$q.localStorage.set('managementTime', new Date().getTime())

            for (var i = 0; i < self.data.fields.length; i++) {
              /* Se agregan opciones al campo de niveles */
              if (!self.$duplicatedValueObject(self.data.fields[i].name, 'value', self.currenLevelOptions) && i !== 0) {
                self.currenLevelOptions.push({
                  label: self.data.fields[i].label,
                  value: self.data.fields[i].name
                })
              }
              /* *************************************** */
              for (var j = 0; j < self.data.fields[i].fields.length; j++) {
                if (response.data.status === 'joined') {
                  self.data.fields[i].fields[j].disable = true
                  self.info.currentLevel = self.data.fields[(self.data.fields.length - 1)].name
                }
                /* Si está en progreso */
                self.data.fields[i].fields[j].readonly = true
                if (response.data.currentLevel === null && i < 1) {
                  self.data.fields[i].fields[j].readonly = true
                  self.counter = 2
                } else {
                  self.data.fields[i].fields[j].readonly = true
                }
                if (self.data.fields[i].name === response.data.currentLevel) {
                  self.data.fields[i].fields[j].readonly = false
                  self.counter = (i + 1)
                }
                /* ------------------- */
              }
            }
          } else {
            this.$q.notify({
              message: 'Finalizado',
              timeout: 10000,
              color: 'info',
              icon: 'check',
              detail: `El caso con ID ${this.formEntry}, ya ha sido finalizado, para ver detalle por favor haz click aquí`,
              actions: [
                {
                  label: 'Ver detalle',
                  noDismiss: true,
                  handler: () => {
                    this.$router.push(`/home/forms/${this.formId}/${this.formEntry}/`)
                  }
                }
              ]
            })
            self.$router.replace(`/home/forms/${this.formId}/entries/`)
          }
          this.info = Object.assign({}, response.data)
          this.staticInfo = Object.assign({}, response.data)
          for (var b in this.info.valuesJSON) {
            this.valuesJSON[b] = this.info.valuesJSON[b]
          }

          if (this.info.status === 'joined') {
            this.info.status = 'in_process'
            this.$axios.put(`forms/data/${this.formId}/${this.formEntry}/`, this.info).then(response => {
              this.$messages('info', 'Ahora el estado de este registro se encuentra en "En proceso"')
              this.labelStatus = 'En proceso'
            }).catch(error => {
              if (error.response.status === 404) {
                this.$router.replace('/home/forms/')
              }
            })
          }
        }).catch(error => {
          if (error.hasOwnProperty('response') && error.response.hasOwnProperty('status')) {
            if (error.response.status === 404) {
              this.$router.replace('/home/forms/')
              this.$messages('warning', 'Este registro no existe')
            }
          }
        })
      } else {
        this.$router.replace(`/home/forms/${this.formId}/entries/`)
        this.$messages('negative', `No tienes permisos para gestionar casos del formulario: ${response.data.label}`)
      }
    }).catch(error => {
      if (error.hasOwnProperty('response') && error.response.hasOwnProperty('status')) {
        if (error.response.status === 404) {
          this.$router.replace('/home/forms/')
          this.$messages('warning', 'Este registro no existe')
        }
      }
    })
  },
  methods: {
    async edit () {
      this.info.managementTime = ((new Date().getTime()) - this.$q.localStorage.get.item('managementTime'))
      this.info.valuesJSON = Object.assign({}, this.valuesJSON)
      this.$axios.put(`forms/data/${this.formId}/${this.formEntry}/`, this.info).then(response => {
        this.$q.localStorage.remove('data')
        this.$q.localStorage.remove('managementTime')
        this.$messages('info', 'Registro actualizado con éxito')
        this.$router.replace('/home/forms/')
      }).catch(error => {
        if (error.response.status === 404) {
          this.$router.replace('/home/forms/')
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
