import { Behavior } from 'backbone.marionette'

function toNull (value) {
  return ((typeof value === 'string' && value.trim() === '') || value == null) ? null : value
}

function parseNumber (value) {
  const n = parseFloat(value)
  const isNumeric = value == n // eslint-disable-line eqeqeq
  return isNumeric ? n : toNull(value)
}

const FormBind = Behavior.extend({
  constructor (options) {
    if (!this) {
      return Object.assign({}, options || {}, {behaviorClass: FormBind})
    }
    Behavior.prototype.constructor.apply(this, arguments)
  },

  events: {
    'input input': 'updateModel',
    'change input[type=radio]': 'updateModel',
    'changeDate input': 'updateModel'
  },

  updateModel (e) {
    const inputEl = e.target
    const prop = inputEl.name
    const propType = inputEl.dataset.propType || inputEl.type
    const modelProp = inputEl.dataset.modelName || 'model'
    const model = this.view[modelProp]
    if (!model) {
      console.warn(`FormBind: could not find model "${modelProp}" in view "${this.view.cid}"`)
      return
    }

    let value
    if (!prop) return
    switch (propType) {
      case 'number':
        value = parseNumber(inputEl.value)
        break
      default:
        value = inputEl.value
    }
    model.set(prop, value, {validate: true})
  }
})

export default FormBind
