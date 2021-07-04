// flexible.js
function main(win: Window, lib: Lib) {
    var timer,
        doc = win.document,
        docEl = doc.documentElement,
        viewportNode = document.querySelector('meta[name="viewport"]'),
        flexibleNode = document.querySelector('meta[name="flexible"]'),
        dpr = 0,
        scale = 0,
        flexible = lib.flexible || (lib.flexible = {});

    function main() {
        var width = docEl.getBoundingClientRect().width;
        if (width / dpr > 540) {
            width = 540 * dpr;
        }

        var fontSize = width / 10;
        docEl.style.fontSize = fontSize + 'px';
        flexible.rem = win.rem = fontSize;
    }

    if (viewportNode) {
        console.log('将根据已有的 meta 标签来设置缩放比例');
        var initialScale = viewportNode
            ?.getAttribute('content')
            ?.match(/initial\-scale=([\d\.]+)/);
        if (initialScale) {
            scale = parseFloat(initialScale[1]);
        }

        dpr = parseInt(String(1 / scale), 10);
    } else if (flexibleNode) {
        var content = flexibleNode.getAttribute('content');
        if (content) {
            var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
            var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
            if (initialDpr) {
                dpr = parseFloat(initialDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));
            }

            if (maximumDpr) {
                dpr = parseFloat(maximumDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));
            }
        }
    }

    if (!dpr && !scale) {
        var version =
            (win.navigator.appVersion.match(/android/gi),
            win.navigator.appVersion.match(/iphone/gi));
        var devicePixelRatio = win.devicePixelRatio;

        dpr = version
            ? devicePixelRatio >= 3 && (!dpr || dpr >= 3)
                ? 3
                : devicePixelRatio >= 2 && (!dpr || dpr >= 2)
                ? 2
                : 1
            : 1;
        scale = 1 / dpr;
    }

    docEl.setAttribute('data-dpr', String(dpr));

    if (!viewportNode) {
        viewportNode = doc.createElement('meta');
        viewportNode.setAttribute('name', 'viewport');
        viewportNode.setAttribute(
            'content',
            'initial-scale=' +
                scale +
                ', maximum-scale=' +
                scale +
                ', minimum-scale=' +
                scale +
                ', user-scalable=no'
        );

        if (docEl.firstElementChild) {
            docEl.firstElementChild.appendChild(viewportNode);
        } else {
            var div = doc.createElement('div');
            div.appendChild(viewportNode);
            doc.write(div.innerHTML);
        }
    }

    win.addEventListener(
        'resize',
        function () {
            clearTimeout(timer);
            timer = setTimeout(main, 300);
        },
        !1
    );

    win.addEventListener(
        'pageshow',
        function (e) {
            if (e.persisted) {
                clearTimeout(timer);
                timer = setTimeout(main, 300);
            }
        },
        !1
    );

    'complete' === doc.readyState
        ? (doc.body.style.fontSize = 12 * dpr + 'px')
        : doc.addEventListener(
              'DOMContentLoaded',
              function () {
                  doc.body.style.fontSize = 12 * dpr + 'px';
              },
              !1
          );

    main();

    flexible.dpr = win.dpr = dpr;
    flexible.refreshRem = main;
    flexible.rem2px = function (this: any, oldVal: string): string {
        var newVal: string | number = parseFloat(oldVal) * this.rem;
        if ('string' == typeof oldVal && oldVal.match(/rem$/)) {
            newVal = newVal + 'px';
        }

        return String(newVal);
    };

    flexible.px2rem = function (this: any, oldVal: string): string {
        var newVal: string | number = parseFloat(oldVal) / this.rem;
        if ('string' === typeof oldVal && oldVal.match(/px$/)) {
            newVal = newVal + 'rem';
        }

        return String(newVal);
    };
}

interface Lib {
    flexible?: {
        rem?: number;
        dpr?: number;
        refreshRem?: (win: Window, lib: Lib) => void;
        rem2px?: (this: any, oldVal: string) => string;
        px2rem?: (this: any, oldVal: string) => string;
    };
}

interface Window {
    dpr: number;
    rem: number;
    lib?: Lib;
}

window.lib = window.lib || {};
main(window, window.lib);
