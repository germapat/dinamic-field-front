<template>
  <div>
    <q-field
      icon="timeline"
      helper="No hay límite de niveles de escalamiento">
      <q-select
        color="secondary"
        :options="[
          { value: true, label: 'Si' },
          { value: false, label: 'No' }
        ]"
        :after="[
          {
            content: levelIconAdd,
            icon: 'add',
            handler () {
              dialogLevel()
            }
          }
        ]"
        float-label="¿Requiere escalamiento? (*)"
        :value="scaling"
        @change="val => onScalingChange(val)" />
    </q-field>
    <q-dialog
      v-model="dialogManageOptions"
      prevent-close>
      <span slot="title">{{ editing ? 'Actualizar nivel' : 'Nuevo nivel de escalamiento' }}</span>
      <div slot="body" style="minWidth: 50vw; maxWidth: 70vw;">
        <div class="col-12" v-if="!editing">
          <q-field
            icon="donut_small"
            :error="errors.has('level')"
            :error-label="errors.first('level')">
            <q-input
              v-model.trim="level"
              float-label="Nombre del nivel"
              name="level"
              v-validate="{required : true, regex: /^([A-Za-z0-9\s]+)$/, max: 80}"
            />
          </q-field>
        </div>
        <div v-else>
          <q-field
            icon="border_color"
            :error="errors.has('updateLevel')"
            :error-label="errors.first('updateLevel')">
            <q-input
              v-model.trim="levelName"
              float-label="Nuevo nombre del nivel"
              name="updateLevel"
              v-validate="{required : true, regex: /^([A-Za-z0-9\s]+)$/, max: 80}"
            />
          </q-field>
        </div>
      </div>

      <template slot="buttons" slot-scope="props">
        <div v-if="!editing">
          <q-btn class="text-grey" flat label="Cancelar" @click="cancelLevel(props.cancel)" />
          <q-btn color="info" label="Agregar" @click="addCustomLevel(level)" />
        </div>
        <div v-else>
          <q-btn class="text-grey" flat label="Cancelar" @click="cancel" />
          <q-btn color="info" label="Guardar" @click="sendUpdate" />
        </div>
      </template>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: 'Levels',
  data () {
    return {
      dataForm: {},
      scaling: false,
      dialogManageOptions: false,
      editing: false,
      levelName: null,
      levelIndex: null,
      levelIconAdd: false,
      level: null,
      levelUpdate: {
        value: null,
        index: null
      }
    }
  },
  created () {
    this.scalingChange()
    this.$root.$on('initLevels', this.initLevels)
  },
  watch: {
    scaling: function (val, oldVal) {
      if (val) {
        this.levelIconAdd = true
      } else {
        this.levelIconAdd = false
      }
    }
  },
  methods: {
    initLevels (data) {
      this.dataForm = Object.assign({}, data)
      this.scaling = this.dataForm.scaling
      if (this.dataForm.fields.length === 0) {
        this.scalingChange()
        this.$emit('updateLevels', this.dataForm.fields)
      }
    },
    dialogLevel () {
      this.dialogManageOptions = true
      this.$validator.reset()
    },
    addLevel (val) {
      this.dataForm.fields.push({
        name: this.$formatName(val),
        label: val,
        fields: []
      })
      this.level = null
      this.dialogManageOptions = false
      this.$emit('updateLevels', this.dataForm.fields)
    },
    addCustomLevel (val) {
      this.$validator.validate('level').then(result => {
        if (result) {
          if (!this.$duplicatedValueObject(this.$formatName(val), 'name', this.dataForm.fields)) {
            this.dataForm.fields.push({
              name: this.$formatName(val),
              label: val,
              fields: []
            })
            this.level = null
            this.dialogManageOptions = false
            this.$emit('updateLevels', this.dataForm.fields)
            this.$messages('info', 'El nivel se agregó correctamente.')
          } else {
            this.$errorVeeValidate('level', 'Este nivel ya se encuentra creado')
          }
        }
      })
    },
    cancelLevel (cancelFn) { // Cerrar modal de creación de niveles de escalamiento
      this.level = null
      this.dialogManageOptions = false
    },
    // openEditLevel (indexLevel) {
    //   this.levelUpdate.index = indexLevel
    //   this.dialogHandleLevel = true
    // },
    updateLevel (indexLevel) {
      this.editing = true
      this.levelName = this.dataForm.fields[indexLevel].label
      this.levelIndex = indexLevel
      this.dialogManageOptions = true
    },
    sendUpdate () {
      this.$validator.validate('updateLevel').then(result => {
        if (result) {
          let dataForm = this.dataForm.fields.slice()
          dataForm.splice(this.levelIndex, 1)
          if (!this.$duplicatedValueObject(this.$formatName(this.levelName), 'name', dataForm)) {
            this.dataForm.fields[this.levelIndex].name = this.$formatName(this.levelName)
            this.dataForm.fields[this.levelIndex].label = this.levelName
            this.cancel()
          } else {
            this.$errorVeeValidate('updateLevel', 'Este nivel ya se encuentra creado')
          }
        }
      })
    },
    cancel () {
      this.dialogManageOptions = false
      this.editing = false
    },
    delLevel (index) {
      this.$q.dialog({
        title: '¿Está seguro/a?',
        message: 'Al aceptar, eliminarás este nivel y los campos que contenga.',
        ok: 'Aceptar',
        cancel: 'Cancelar'
      }).then(() => {
        this.dataForm.fields.splice(index, 1)
        this.$emit('updateLevels', this.dataForm.fields)
        this.$messages('warning', 'El nivel se eliminó correctamente.')
      }).catch(() => {})
    },
    onScalingChange (val) {
      if (val) {
        this.restructure(val)
        this.$emit('updateScaling', val)
      } else {
        if (this.dataForm.fields.length > 1) {
          let configDialog = Object.assign(this.$configDialog, {
            title: '¿Está seguro/a?',
            message: 'Seleccione una de estas opciones:',
            options: {
              type: 'radio',
              model: 'keep_fields',
              items: [
                {label: 'Eliminar niveles y conservar campos', value: 'keep_fields', color: 'secondary'},
                {label: 'Eliminar todo', value: 'all', color: 'secondary'}
              ]
            }
          })
          this.$q.dialog(configDialog).then((data) => {
            if (data === 'all') {
              this.scalingChange()
              this.$emit('updateLevels', this.dataForm.fields)
              this.restructure(val)
              this.$emit('updateScaling', val)
            } else if (data === 'keep_fields') {
              let fields = this.agroupedFields()
              for (var k in fields) {
                let agroupedFields = this.agroupedFields()
                agroupedFields.splice(k, 1)
                if (this.$duplicatedValueObject(fields[k].name, 'name', agroupedFields)) {
                  this.$messages('negative', 'Hay campos duplicados, por favor elimine o modifique uno de ellos')
                  return false
                }
              }
              this.restructure(val)
              this.$emit('updateScaling', val)
            }
          }).catch(() => {})
        } else {
          this.restructure(val)
          this.$emit('updateScaling', val)
        }
      }
    },
    agroupedFields () {
      let allFields = []
      let allFieldsLocalstroge = Object.assign({}, this.dataForm)
      for (var i in allFieldsLocalstroge.fields) {
        for (var j in allFieldsLocalstroge.fields[i].fields) {
          allFields.push(allFieldsLocalstroge.fields[i].fields[j])
        }
      }
      return allFields
    },
    restructure (val) {
      let dataForm = Object.assign({}, this.dataForm)
      let array = []
      for (var i in dataForm.fields) {
        for (var j in dataForm.fields[i].fields) {
          array.push(dataForm.fields[i].fields[j])
        }
      }
      this.scalingChange()
      this.dataForm.fields[0].fields = array.slice()
      this.scaling = val
    },
    scalingChange () {
      this.dataForm.fields = [].slice()
      this.addLevel('Primer nivel')
    }
  }
}
</script>

<style scoped>
</style>
