import throttle from './throttle'

const ATTR_PREFIX = 'data-vue-sticky'
let instances = {}
let supportCSSSticky

const getInitialConfig = el => {
  return {
    zIndex: el.style.zIndex
  }
}

const stickySides = [ 'top', 'bottom', 'both' ]

const getBindingConfig = binding => {
  const params = binding.value || {}
  const stickyTop = params.stickyTop || 0
  const stickyBottom = params.stickyBottom || 0
  const zIndex = params.zIndex || 1000
  const disabled = params.disabled
  const forceFixed = params.forceFixed || false

  let stickySide = 'top'
  if (stickySides.includes(params.stickySide)) {
    stickySide = params.stickySide
  }
  return { stickySide, stickyTop, stickyBottom, zIndex, disabled, forceFixed }
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
    const { stickySide, stickyTop, stickyBottom, zIndex, forceFixed } = instance.bindingConfig

    // test if the browser support css sticky
    supportCSSSticky = forceFixed ? false : ~elStyle.position.indexOf('sticky')

    if (!forceFixed) {
      elStyle.position = '-webkit-sticky'
      elStyle.position = 'sticky'
    }

    let childStyle = el.firstElementChild.style

    if (supportCSSSticky) {
      if (stickySide === 'bottom') {
        el.style.top = 'auto'
        el.style.bottom = `${stickyBottom}px`
      } else {
        el.style.top = `${stickyTop}px`
      }
      elStyle.zIndex = zIndex
    }

    instance.active = false

    const sticky = (side) => {
      if (supportCSSSticky || instance.active) return

      const { disabled, stickyTop, stickyBottom, zIndex } = instance.bindingConfig

      if (disabled) return

      if (!elStyle.height) {
        elStyle.height = `${el.offsetHeight}px`
      }

      if (childStyle) {
        childStyle.position = 'fixed'
        childStyle.zIndex = zIndex

        if (side === 'bottom') {
          childStyle.top = 'auto'
          childStyle.bottom = `${stickyBottom}px`
        } else {
          childStyle.top = `${stickyTop}px`
        }
      }

      instance.active = true
      el.classList.add('is-sticky')
      el.classList.add('is-sticky--' + side)
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
      el.classList.remove('is-sticky--bottom')
      el.classList.remove('is-sticky--top')
    }

    instance.listenAction = throttle(() => {
      const offsetTop = el.getBoundingClientRect().top
      const isTop = offsetTop <= stickyTop
      const isBottom = window.innerHeight - offsetTop <= 0

      let isSticky
      let side = stickySide

      if (stickySide === 'bottom') {
        isSticky = isBottom && offsetTop > 0
      } else if (stickySide === 'both') {
        isSticky = isBottom || isTop
        side = offsetTop > 0 ? 'bottom' : 'top'
      } else if (stickySide === 'top') {
        isSticky = isTop
      }

      if (isSticky) {
        return sticky(side)
      }
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

    const { disabled, stickySide, stickyTop, stickyBottom, zIndex } = instance.bindingConfig
    const childStyle = el.firstElementChild.style

    if (supportCSSSticky) {
      if (stickySide === 'bottom') {
        el.style.top = 'auto'
        el.style.bottom = `${stickyBottom}px`
      } else {
        el.style.top = `${stickyTop}px`
      }
      el.style.zIndex = zIndex
    } else if (instance.active) {
      if (stickySide === 'bottom') {
        childStyle.top = 'auto'
        childStyle.bottom = `${stickyBottom}px`
      } else {
        childStyle.top = `${stickyTop}px`
      }
      childStyle.zIndex = zIndex
      el.style.height = ''
    }

    if (disabled) {
      if (supportCSSSticky) {
        el.style.position = ''
      } else {
        childStyle.position = ''
        childStyle.top = ''
        childStyle.bottom = ''
        childStyle.zIndex = instance.initialConfig.zIndex
        el.classList.remove('is-sticky')
        el.classList.remove('is-sticky--bottom')
        el.classList.remove('is-sticky--top')
      }

      return
    }

    if (supportCSSSticky) {
      el.style.position = '-webkit-sticky'
      el.style.position = 'sticky'
    }
  }
}
