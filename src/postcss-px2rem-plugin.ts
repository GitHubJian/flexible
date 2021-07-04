/**
 * 计算数据
 *
 * @param {number} value 原始数据
 * @param {number} precision 精确度
 *
 * @returns 计算后数值
 */
function calc(value: number, precision: number): number {
    const multiplier = Math.pow(10, precision + 1);
    const wholeNumber = Math.floor(value * multiplier);

    return (Math.round(wholeNumber / 10) * 10) / multiplier;
}

type replace = (raw: string, $1: string) => string;

/**
 * 生成替换函数
 *
 * @param {number} baseUnit 原始数据
 * @param {number} unitPrecision 精确度
 *
 * @returns 函数
 */
function createReplace(baseUnit, unitPrecision): replace {
    return function (raw, $1) {
        if (!$1) {
            return raw;
        }

        const pixels = parseFloat($1);
        const fixedVal = calc(pixels / baseUnit, unitPrecision);

        return `${fixedVal}rem`;
    };
}

interface CreatorOptions {
    baseUnit: number;
    unitPrecision: number;
}

/**
 * postcss creator
 *
 * @param {CreatorOptions} options
 *
 * @returns 返回 postcss plugin 接口对象
 */
function creator(options: Partial<CreatorOptions> = {}): {
    postcssPlugin: string;
    Once: (root) => void;
} {
    options = Object.assign(
        {},
        {
            baseUnit: 100,
            unitPrecision: 6,
        },
        options
    );

    const replace = createReplace(options.baseUnit, options.unitPrecision);

    const unit = 'px';
    const unitRE = new RegExp(
        `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|(\\d*\\.?\\d+)(${unit})`,
        'ig'
    );
    // 由于到 postcss 的时候已经成css片段了，就没有注释了，只能用比较 hack 的手法，自定义单位 tx 会被转成 px
    const customUnit = 'tx';
    const customUnitRE = new RegExp(
        `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|(\\d*\\.?\\d+)(${customUnit})`,
        'ig'
    );

    return {
        postcssPlugin: 'postcss-px2rem',
        Once: root => {
            root.walkDecls(decl => {
                if (decl.value.indexOf(unit) > -1) {
                    decl.value = decl.value.replace(unitRE, replace);
                }

                if (decl.value.indexOf(customUnit) > -1) {
                    decl.value = decl.value.replace(
                        customUnitRE,
                        function (raw, $1) {
                            if (!$1) {
                                return raw;
                            }

                            return `${$1}px`;
                        }
                    );
                }
            });

            root.walkAtRules('media', rule => {
                if (rule.params.indexOf(unit) > -1) {
                    rule.params = rule.params.replace(unitRE, replace);
                    return;
                }

                if (rule.params.indexOf(customUnit) > -1) {
                    rule.params = rule.params.replace(
                        customUnitRE,
                        function (raw, $1) {
                            if (!$1) {
                                return raw;
                            }

                            return `${$1}px`;
                        }
                    );
                }
            });
        },
    };
}

creator.postcss = true;

export default creator;
