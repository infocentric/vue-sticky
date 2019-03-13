import throttle from './throttle'

const ATTR_PREFIX = 'data-vue-sticky'
let instances = {}
let supportCSSSticky

const getInitialConfig = el => {
  return {
    zIndex: el.style.zIndex
  }
}

const getBindingConfig = binding => {
  const params = binding.value || {}
  const stickyTop = params.stickyTop || 0
  const zIndex = params.zIndex || 1000
  const disabled = params.disabled
  const forceFixed = params.forceFixed || false

  return { stickyTop, zIndex, disabled, forceFixed }
}

const getInstanceId = el => {
  for (let attr of el.attributes) {
    if (attr.name.includes(ATTR_PREFIX)) {
      return attr.name
    }
  }
}

const unwatch = callback => {
  window.removeEventListener('scroll', callback)
}

const watch = callback => {
  window.addEventListener('scroll', callback)
}

export default {
  bind (el, binding) {
    const dataAttr = `${ATTR_PREFIX}-${(new Date()).getTime()}`

    el.setAttribute(dataAttr, '')

    instances[dataAttr] = {
      bindingConfig: getBindingConfig(binding),
      initialConfig: getInitialConfig(el)
    }

    const elStyle = el.style
    const instance = instances[dataAttr]
    const { stickyTop, zIndex, forceFixed } = instance.bindingConfig

    // test if the browser support css sticky
    supportCSSSticky = forceFixed ? false : ~elStyle.position.indexOf('sticky')

    if (!forceFixed) {
      elStyle.position = '-webkit-sticky'
      elStyle.position = 'sticky'
    }

    let childStyle = el.firstElementChild.style

    if (supportCSSSticky) {
      elStyle.top = `${stickyTop}px`
      elStyle.zIndex = zIndex
    }

    instance.active = false

    const sticky = () => {
      if (supportCSSSticky || instance.active) return

      const { disabled, stickyTop, zIndex } = instance.bindingConfig

      if (disabled) return

      if (!elStyle.height) {
        elStyle.height = `${el.offsetHeight}px`
      }

      if (childStyle) {
        childStyle.position = 'fixed'
        childStyle.cssText = `top: ${stickyTop}px; z-index: ${zIndex}; ${childStyle.cssText}`
      }

      instance.active = true
      el.classList.add('is-sticky')
    }

    const reset = () => {
      if (supportCSSSticky || !instance.active) return

      const { disabled } = instance.bindingConfig

      if (disabled) return

      childStyle.position = 'static'
      childStyle.cssText = childStyle
      elStyle.height = ''

      instance.active = false
      el.classList.remove('is-sticky')
    }

    instance.listenAction = throttle(() => {
      const offsetTop = el.getBoundingClientRect().top
      if (offsetTop <= stickyTop) return sticky()
      reset()
    })

    watch(instance.listenAction)
  },

  unbind (el) {
    const instanceId = getInstanceId(el)
    unwatch(instances[instanceId].listenAction)
    delete instances[instanceId]
  },

  update (el, binding) {
    const instanceId = getInstanceId(el)
    const instance = instances[instanceId]

    instance.bindingConfig = getBindingConfig(binding)

    const { stickyTop, zIndex } = instance.bindingConfig
    let childStyle = el.firstElementChild.style

    if (supportCSSSticky) {
      el.style.top = `${stickyTop}px`
      el.style.zIndex = zIndex
    } else if (instance.active) {
      childStyle.top = `${stickyTop}px`
      childStyle.zIndex = zIndex
      el.style.height = ''
    }

    if (instance.bindingConfig.disabled) {
      if (supportCSSSticky) {
        el.style.position = ''
      } else {
        childStyle.position = ''
        childStyle.top = ''
        childStyle.zIndex = instance.initialConfig.zIndex
        el.classList.remove('is-sticky')
      }

      return
    }

    if (supportCSSSticky) {
      el.style.position = '-webkit-sticky'
      el.style.position = 'sticky'
    }
  }
}