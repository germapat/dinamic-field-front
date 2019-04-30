<template>
  <div>
    <q-field
      icon="list"
      helper="Ingrese las opciones para este campo"
      :error="hasError"
      error-label="Se requieren las opciones">
      <q-select
        v-model.trim="selection"
        :options="optionsCustom"
        float-label="Opciones (*)"
        @input="manageOption"
        filter
        filter-placeholder="Buscar"
        :after="[
          {
            icon: 'add',
            handler () {
              dialogOptions = true
              $validator.reset()
              newOption = null
            }
          }
        ]"
      />
    </q-field>

    <!-- Edita y elimina opciones -->
    <q-dialog
      v-model="dialogManageOptions"
      prevent-close>
      <div slot="body" style="minWidth: 50vw; maxWidth: 70vw;">
        <q-field
          icon="list_alt"
          type="textarea"
          helper="Modifica la nueva opción"
          :error="errors.has('options')"
          :error-label="errors.first('options')">
          <q-input
            type="text"
            name="options"
            v-validate="'required|max:30'"
            v-model="manageOptionModel.label"
            float-label="Nueva opción"
          />
        </q-field>
      </div>

      <template slot="buttons" slot-scope="props">
        <q-btn class="text-grey" flat label="Cancelar" @click="props.cancel" />
        <q-btn color="tigouner" label="Eliminar" @click="delOption(manageOptionModel.index)" />
        <q-btn color="tigoune" label="Actualizar" @click.native="editOption(manageOptionModel.label, manageOptionModel.index)" />
      </template>
    </q-dialog>
    <!-- ************************ -->

    <!-- Crea y permite ordenar las opciones ya creadas-->
    <q-dialog
      v-model="dialogOptions"
      prevent-close>
      <span slot="title" class="q-title">Agregar opciones</span>
      <div slot="body" style="minWidth: 35vw; maxWidth: 90vw">
        <div class="row items-center justify-around">
          <q-field
            icon="playlist_add"
            type="textarea"
            class="q-mb-md col-sm-8 col-md-8"
            helper="Escribe la nueva opción"
            :error="errors.has('newOption')"
            :error-label="errors.first('newOption')">
            <q-input
              type="text"
              v-model.trim="newOption"
              float-label="Nueva opción"
              name="newOption"
              v-validate="'required|max:30'"
            />
          </q-field>
          <div class="col-md-2 col-sm-3">
            <q-btn color="positive" label="Agregar" @click="addOption" flat />
          </div>
        </div>
        <draggable
          :list="optionsCustom"
          :options="{
            animation: 300,
            handle: '.move'
          }">
          <!-- <q-list class="col-md-6 q-ml-lg" no-border highlight> -->
            <div v-for="(options, index) in optionsCustom" :key="index" class="q-ml-xl">
              <q-item>
                <q-item-side>
                  <q-item-tile>
                    <q-chip color="tigouner" class="move">{{(index + 1)}}</q-chip>
                  </q-item-tile>
                </q-item-side>
                <q-item-main :label="options.label" class="col-6" />
                <q-item-side right class="col-2" >
                  <q-btn flat dense icon="edit" @click.native="edit(options.label, index)"/>
                  <q-btn flat dense icon="delete" @click="delOption(index)" />
                </q-item-side>
              </q-item>
            </div>
          <!-- </q-list> -->
        </draggable>
      </div>

      <template slot="buttons" slot-scope="props" class="text-center">
        <!-- <q-btn color="grey-8" flat label="cerrar" @click="props.cancel" /> -->
        <q-btn color="tigoune" outline label="Guardar" @click="props.cancel" />
      </template>
    </q-dialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  name: 'MOptions',
  components: { draggable },
  data () {
    return {
      value: null,
      newOption: null,
      optionsCustom: [],
      dialogOptions: false,
      dialogManageOptions: false,
      manageOptionModel: {},
      selection: [],
      hasError: false
    }
  },
  created () {
    this.optionsCustom = this.$props.data.options.slice()
    this.$root.$on('resetValues', function () {
      self.optionsCustom = []
    })
  },
  methods: {
    manageOption (val) {
      this.$validator.reset()
      let index = this.$searchValueObject(this.optionsCustom, 'value', val)
      let obj = Object.assign({}, this.optionsCustom[index])
      obj['index'] = index
      this.manageOptionModel = Object.assign({}, obj)
      this.dialogManageOptions = true
    },
    addOption (txt, index) {
      this.$validator.validate('newOption').then(result => {
        if (result) {
          if (!this.$duplicatedValueObject(this.$formatName(this.newOption), 'value', this.optionsCustom)) {
            this.optionsCustom.push({ label: this.newOption, value: this.$formatName(this.newOption) })
            this.updateOptionsCustom()
            this.newOption = null
            this.$validator.reset()
            this.hasError = false
          } else {
            this.$errorVeeValidate('newOption', 'Esta opción ya existe')
          }
        }
      })
    },
    editOption (txt, index) {
      this.$validator.validate('options').then(result => {
        if (result) {
          this.optionsCustom[index] = { label: txt, value: this.$formatName(txt) }
          this.dialogManageOptions = false
          this.updateOptionsCustom()
        }
      })
    },
    edit (label, index) {
      this.newOption = label
      this.optionsCustom.splice(index, 1)
    },
    delOption (index) {
      this.optionsCustom.splice(index, 1)
      this.dialogManageOptions = false
    },
    updateOptionsCustom () {
      for (var i in this.optionsCustom) {
        this.$set(this.optionsCustom, i, this.optionsCustom[i])
      }
    }
  },
  watch: {
    optionsCustom: function (val, oldVal) {
      this.$emit('optionsUpdated', {
        options: this.optionsCustom
      })
    }
  },
  props: { data: Object }
}
</script>

<style scoped>
  .move {
    cursor: move
  }
  .close {
    cursor: pointer
  }
</style>
