// flexible-css.js
!(function() {
  var cssText =
    '@charset "utf-8";html{color:#000;background:#fff;overflow-y:scroll;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}html *{outline:0;-webkit-text-size-adjust:none;-webkit-tap-highlight-color:rgba(0,0,0,0)}html,body{font-family:sans-serif}body,div,dl,dt,dd,ul,ol,li,h1,h2,h3,h4,h5,h6,pre,code,form,fieldset,legend,input,textarea,p,blockquote,th,td,hr,button,article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{margin:0;padding:0}input,select,textarea{font-size:100%}table{border-collapse:collapse;border-spacing:0}fieldset,img{border:0}abbr,acronym{border:0;font-variant:normal}del{text-decoration:line-through}address,caption,cite,code,dfn,em,th,var{font-style:normal;font-weight:500}ol,ul{list-style:none}caption,th{text-align:left}h1,h2,h3,h4,h5,h6{font-size:100%;font-weight:500}q:before,q:after{content:\'\'}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sup{top:-.5em}sub{bottom:-.25em}a:hover{text-decoration:underline}ins,a{text-decoration:none}'
  var style = document.createElement('style')
  document.getElementsByTagName('head')[0].appendChild(style)

  if (style.styleSheet) {
    style.styleSheet.disabled || (style.styleSheet.cssText = cssText)
  } else {
    try {
      style.innerHTML = cssText
    } catch (e) {
      style.innerText = cssText
    }
  }
})()

// flexible.js
!(function(win, lib) {
  var timer,
    doc = win.document,
    docEl = doc.documentElement,
    viewportNode = document.querySelector('meta[name="viewport"]'),
    flexibleNode = document.querySelector('meta[name="flexible"]'),
    dpr = 0,
    scale = 0,
    flexible = lib.flexible || (lib.flexible = {})

  function main() {
    var width = docEl.getBoundingClientRect().width
    if (width / dpr > 540) {
      width = 540 * dpr
    }

    var fontSize = width / 10
    docEl.style.fontSize = fontSize + 'px'
    flexible.rem = win.rem = fontSize
  }

  if (viewportNode) {
    console.log('将根据已有的 meta 标签来设置缩放比例')
    var initialScale = viewportNode
      .getAttribute('content')
      .match(/initial\-scale=([\d\.]+)/)
    if (initialScale) {
      scale = parseFloat(initialScale[1])
    }

    dpr = parseInt(1 / scale)
  } else if (flexibleNode) {
    var content = flexibleNode.getAttribute('content')
    if (content) {
      var initialDpr = content.match(/initial\-dpr=([\d\.]+)/)
      var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/)
      if (initialDpr) {
        dpr = parseFloat(initialDpr[1])
        scale = parseFloat((1 / dpr).toFixed(2))
      }

      if (maximumDpr) {
        dpr = parseFloat(maximumDpr[1])
        scale = parseFloat((1 / dpr).toFixed(2))
      }
    }
  }

  if (!dpr && !scale) {
    var version =
      (win.navigator.appVersion.match(/android/gi),
      win.navigator.appVersion.match(/iphone/gi))
    var devicePixelRatio = win.devicePixelRatio

    dpr = version
      ? devicePixelRatio >= 3 && (!dpr || dpr >= 3)
        ? 3
        : devicePixelRatio >= 2 && (!dpr || dpr >= 2)
        ? 2
        : 1
      : 1
    scale = 1 / dpr
  }

  docEl.setAttribute('data-dpr', dpr)

  if (!viewportNode) {
    viewportNode = doc.createElement('meta')
    viewportNode.setAttribute('name', 'viewport')
    viewportNode.setAttribute(
      'content',
      'initial-scale=' +
        scale +
        ', maximum-scale=' +
        scale +
        ', minimum-scale=' +
        scale +
        ', user-scalable=no'
    )

    if (docEl.firstElementChild) {
      docEl.firstElementChild.appendChild(viewportNode)
    } else {
      var div = doc.createElement('div')
      div.appendChild(viewportNode)
      doc.write(div.innerHTML)
    }
  }

  win.addEventListener(
    'resize',
    function() {
      clearTimeout(timer)
      timer = setTimeout(main, 300)
    },
    !1
  )

  win.addEventListener(
    'pageshow',
    function(e) {
      if (e.persisted) {
        clearTimeout(timer)
        timer = setTimeout(main, 300)
      }
    },
    !1
  )

  'complete' === doc.readyState
    ? (doc.body.style.fontSize = 12 * dpr + 'px')
    : doc.addEventListener(
        'DOMContentLoaded',
        function() {
          doc.body.style.fontSize = 12 * dpr + 'px'
        },
        !1
      )

  main()

  flexible.dpr = win.dpr = dpr
  flexible.refreshRem = main
  flexible.rem2px = function(val) {
    var num = parseFloat(val) * this.rem

    'string' == typeof win && win.match(/rem$/) && (num += 'px')

    return num
  }

  flexible.px2rem = function(val) {
    var num = parseFloat(val) / this.rem

    'string' == typeof a && a.match(/px$/) && (num += 'rem')

    return num
  }
})(window, window.lib || (window.lib = {}))
