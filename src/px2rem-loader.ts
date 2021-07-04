import css from 'css';
import {getOptions} from 'loader-utils';

const DISABLE = 'px2rem-disable';
const DISABLE_NEXT_LINE = 'px2rem-disable-next-line';
const PX_RE = /\b(\d+(\.\d+)?)px\b/;
const TX_RE = /\b(\d+(\.\d+)?)tx\b/;

export interface Px2RemOptions {
    dpr: number;
    unit: number;
    precision: number;
}

const DEFAULTS: Px2RemOptions = {
    dpr: 2,
    unit: 75,
    precision: 6,
};

export class Px2Rem {
    options: Px2RemOptions;

    constructor(options: Partial<Px2RemOptions> = {}) {
        this.options = Object.assign({}, DEFAULTS, options);
    }

    generateRem(text: string): string {
        const self = this;
        const ast = css.parse(text);

        function process(
            rules: Array<css.Rule | css.Comment | css.AtRule> = []
        ) {
            for (let i = 0; i < rules.length; i++) {
                const rule = rules[i];

                if (rule.type === 'media') {
                    process((rule as css.Media).rules);

                    continue;
                } else if (rule.type === 'keyframes') {
                    process((rule as css.KeyFrames).keyframes);

                    continue;
                } else if (rule.type === 'comment') {
                    const comment = (rule as css.Comment)?.comment?.trim();

                    if (comment === DISABLE) {
                        i = rules.length; // 跳过之后所有的转换
                    }

                    continue;
                } else if (rule.type !== 'rule' && rule.type !== 'keyframe') {
                    continue;
                }
                debugger;
                const declarations = (rule as css.Rule).declarations;
                const len = declarations?.length || 0;
                for (let j = 0; j < len; j++) {
                    const item = declarations?.[j];

                    // 如果是 declaration

                    const declaration = item as css.Declaration;
                    if (declaration && declaration.type === 'declaration') {
                        const oldValues = (declaration.value || '').split(
                            /\s+/
                        );
                        debugger;
                        const newValues = oldValues.map(v => {
                            debugger;
                            if (PX_RE.test(v)) {
                                return self.resolveCalcValue('rem', v);
                            }

                            if (TX_RE.test(v)) {
                                return v.replace('tx', 'px');
                            }
                        });
                        debugger;

                        declaration.value = newValues.join(' ');
                    }
                    // 如果是 comment
                    const comment = item as css.Comment;
                    if (
                        comment.type === 'comment' &&
                        comment.comment?.trim() === DISABLE_NEXT_LINE
                    ) {
                        j++;
                    }
                }
            }
        }

        process(ast.stylesheet?.rules);

        return css.stringify(ast);
    }

    /**
     * 将 oldVal 转成 newVal
     *
     * @param {'rem' | 'px'} type  转换类型
     * @param {string} value 原始内容
     * @param {numer} dpr 适配
     *
     * @returns {string} 转换后的内容
     */
    resolveCalcValue(
        type: 'rem' | 'px',
        value: string = '',
        dpr: number = 2
    ): string {
        const options = this.options;
        const reG = new RegExp(PX_RE.source, 'g');
        if (value.startsWith('.')) {
            value = '0' + value;
        }

        function calc(val) {
            val = parseFloat(val.toFixed(options.precision));

            if (val === 0) {
                return val;
            }

            return `${val}${type}`;
        }

        return value.replace(reG, function ($0, $1) {
            if (type === 'px') {
                return calc(($1 * dpr) / (options.dpr as number));
            }

            if (type === 'rem') {
                return calc($1 / (options.unit as number));
            }
        });
    }
}

export default function loader(this: any, source: string): string {
    const options = getOptions(this);
    const ins = new Px2Rem(options);

    return ins.generateRem(source);
}
