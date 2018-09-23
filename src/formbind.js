import { Behavior } from 'backbone.marionette'
import _ from 'underscore'
import setPath from 'lodash/set'

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
    'input select': 'updateModel',
    'input input': 'updateModel',
    'change input[type=radio]': 'updateModel',
    'changeDate input': 'updateModel'
  },

  updateModel (e) {
    const inputEl = e.target
    const prop = inputEl.name
    if (!prop) return
    const propType = inputEl.dataset.propType || inputEl.type
    const modelName = inputEl.dataset.modelName || this.getOption('modelName') || 'model'
    let model = inputEl.model
    if (!model) {
      model = this.view[modelName]
    }
    if (!model) {
      console.warn(`FormBind: could not find model "${modelName}" in view "${this.view.cid}"`)
      return
    }

    let value
    switch (inputEl.type) {
      case 'checkbox':
        value = Boolean(inputEl.checked)
        break
      default:
        value = inputEl.value
    }
    switch (propType) {
      case 'number':
        value = parseNumber(inputEl.value)
        break
    }
    // handle nested attributes
    if (prop.indexOf('.') !== -1) {
      const attrs = _.clone(model.attributes)
      setPath(attrs, prop, value)
      model.set(attrs, {validate: true, attributes: [prop]})
    } else {
      model.set(prop, value, {validate: true, attributes: [prop]})
    }
  }
})

export default FormBind
