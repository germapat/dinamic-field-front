<template>
  <div id="app" class="fixed row bg-form">
    <q-card class="bg-white" :style="{ maxWidth: '80%', maxHeight: '90%', overflowY: 'scroll' }">
      <q-card-main>
        <q-list no-border>
          <q-list-header>
            <p class="q-title">{{ data.label }}</p>
          </q-list-header>
          <q-item v-if="data.description != null">
            <i>{{ data.description }}</i>
          </q-item>
          <q-item v-else>
            <i>Sin descripción</i>
          </q-item>
        </q-list>
        <validation-observer ref="obs">
          <q-list no-border v-for="(level, indexLevel) in data.fields" :key="indexLevel">
            <q-list-header v-if="data.fields.length > 1">
              {{ level.label }}
            </q-list-header>
            <q-item class="row">
              <div v-for="(field, indexfield) in level.fields" :key="indexfield" :class="field.type === 'InputTextarea' ? 'col-12' : 'col-xs-12 col-lg-6'">
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
                    :config="field" />
                </validation-provider>
              </div>
              <div class="col-12 q-mt-md">
                <q-btn
                  color="secondary"
                  label="Guardar"
                  class="full-width"
                  @click="save">
                </q-btn>
              </div>
            </q-item>
          </q-list>
        </validation-observer>
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
import { colors } from 'quasar'

export default {
  name: 'AddLog',
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
      valuesJSON: {},
      formId: this.$route.params.form ? this.$route.params.form : null
    }
  },
  created () {
    let self = this
    this.$axios.get(`forms/view/${this.formId}/`).then(response => {
      let newData = {}
      let arrayFields = []
      for (var i in response.data) {
        newData[i] = response.data[i]
      }
      arrayFields.push(newData.fields.shift())
      newData.fields = arrayFields.slice()
      this.data = Object.assign({}, newData)
      this.$q.localStorage.set('dF', this.data)
      colors.setBrand('secondary', this.data.color)
      for (var k in this.data.fields) {
        for (var l in this.data.fields[k].fields) {
          if (this.data.fields[k].fields.hasOwnProperty('options')) {
            this.valuesJSON[this.data.fields[k].fields[l].name] = []
          } else {
            this.valuesJSON[this.data.fields[k].fields[l].name] = null
          }
        }
      }
      conenctarSocket()

      async function conenctarSocket () {
        new WebSocket(process.env.API_SOCKET).addEventListener('message', async function (event) {
          let response = {}
          JSON.parse(event.data).forEach(element => {
            if (element.status && (element.name === 'primary_ani' || element.name === 'ucid' || element.name === 'loginid')) {
              response[element.name] = element.value
            }
          })
          for (var i in self.data.fields) {
            for (var j in self.data.fields[i].fields) {
              if (self.data.fields[i].fields[j].plus_functions === 'ucid' && response.hasOwnProperty('ucid')) self.$set(self.valuesJSON, self.data.fields[i].fields[j].name, response.ucid)
              else if (self.data.fields[i].fields[j].plus_functions === 'login' && response.hasOwnProperty('loginid')) self.valuesJSON[self.data.fields[i].fields[j].name] = response.loginid
              else if (self.data.fields[i].fields[j].plus_functions === 'ani' && response.hasOwnProperty('primary_ani')) self.valuesJSON[self.data.fields[i].fields[j].name] = response.primary_ani
              else self.valuesJSON[self.data.fields[i].fields[j].name] = null
            }
          }
          self.$forceUpdate()
        })
      }
    }).catch(error => {
      if (error.hasOwnProperty('response') && error.response.hasOwnProperty('status')) {
        if (error.response.status === 404) {
          this.$router.push('404')
        } else if (error.response.status === 403) {
          this.$router.replace('/ErrorFormPrivate/')
        }
      }
    })
  },
  methods: {
    async save () {
      let result = await this.$refs.obs.validate()
      if (result) {
        this.$axios.post(`forms/data/${this.formId}/`, { valuesJSON: this.valuesJSON }).then(response => {
          this.valuesJSON = this.$cleanObj(this.valuesJSON)
          if (this.data.scaling) {
            this.$messages('info', 'El caso se ha guardado con éxito')
          } else {
            this.$messages('info', 'El registro se ha guardado con éxito')
          }
          this.$refs.obs.reset()
          this.$q.localStorage.remove('titleform')
          this.$router.replace(`/home/forms/${this.formId}/entries/`)
        }).catch(error => {
          console.log(error)
        })
      }
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
                this.data.fields[i].fields[j].visible = this.$q.localStorage.get.item('dF').fields[i].fields[j].visible
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
  #app {
    background: 'red';
    display: flex;
    height: 100vh;
    width: 100vw;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
</style>
