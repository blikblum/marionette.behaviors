import { Model, Collection } from 'backbone'
import { Behavior } from 'backbone.marionette'
import _ from 'underscore'

const AutoRender = Behavior.extend({
  constructor (options) {
    if (!this) {
      return Object.assign({}, options || {}, {regionClass: AutoRender})
    }
    Behavior.prototype.constructor.apply(this, arguments)
  },

  onInitialize (view) {
    const rerender = _.debounce(view.render, 0)
    if (view.model) view.listenTo(view.model, 'change', rerender)
    if (view.collection) view.listenTo(view.collection, 'sort update reset change', rerender)
    const {tracked = []} = this.options
    tracked.forEach((prop) => {
      let propValue = view[prop]
      if (propValue instanceof Model) {
        view.listenTo(propValue, 'change', rerender)
      } else if (propValue instanceof Collection) {
        view.listenTo(propValue, 'sort update reset change', rerender)
      } else {
        Object.defineProperty(view, prop, {
          enumerable: true,
          configurable: true,
          get () {
            return propValue
          },
          set (newValue) {
            if (propValue !== newValue) {
              if (propValue && _.isFunction(propValue.listenTo)) {
                view.stopListening(propValue, 'sort update reset change', rerender)
              }
              propValue = newValue
              if (propValue instanceof Model) {
                view.listenTo(propValue, 'change', rerender)
              } else if (propValue instanceof Collection) {
                view.listenTo(propValue, 'sort update reset change', rerender)
              }
              rerender.call(view)
            }
          }
        })
      }
    })
  }
})

export default AutoRender
