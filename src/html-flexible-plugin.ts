import fs from 'fs';
import path from 'path';
import uglify from 'uglify-js';
import webpack from 'webpack';
import safeRequire from 'safe-require';
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

const FLEXIBLE_FILE_PATH = path.resolve(__dirname, './index.js');

interface CreateScriptTagOptions {
    isUglify?: boolean;
}

/**
 * 创建一个 script 标记插入
 *
 * @param {CreateScriptTagOptions} options 参数
 *
 * @returns {string} script fragment
 */
function createScriptTag(options: CreateScriptTagOptions = {}): string {
    let content = fs.readFileSync(FLEXIBLE_FILE_PATH, 'utf-8');

    let isUglify = false;
    if (options.isUglify === undefined) {
        isUglify = isProd;
    } else {
        isUglify = options.isUglify;
    }

    if (!isUglify && isProd) {
        // eslint-disable-next-line no-console
        console.warn(
            '⚠ [create-script-tag] 生产环境已经关闭代码混淆压缩，请悉知！！！'
        );
    }

    if (isUglify) {
        content = uglify.minify(content).code;
    }

    return `<script type="javascript">${content}</script>`;
}

const OUTLET = '<!-- html-flexible-outlet -->';
const PLUGIN_NAME = 'HTMLFlexiblePlugin';

interface HTMLFlexiblePluginOptions {
    isUglify: boolean;
}

/**
 * 构造函数
 *
 * @constructor
 * @param {Partial<HTMLFlexiblePluginOptions>} options
 */
export default class HTMLFlexiblePlugin {
    isUglify?: boolean;

    constructor(options: Partial<HTMLFlexiblePluginOptions> = {}) {
        this.isUglify = options.isUglify;
    }

    /**
     * webpack 钩子函数
     *
     * @param {webpack.Compiler} compiler 编译对象
     *
     * @returns {void}
     */
    apply(compiler: webpack.Compiler): void {
        let replacement = createScriptTag({
            isUglify: this.isUglify,
        });

        compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
            const HTMLWebpackPlugin = safeRequire('html-webpack-plugin');
            const emit = HTMLWebpackPlugin.getHooks(compilation).beforeEmit;

            emit.tapAsync(PLUGIN_NAME, (data, cb) => {
                try {
                    data.html = this.convert(data.html, replacement);

                    cb(null, data);
                } catch (e) {
                    return cb(e, data);
                }
            });
        });
    }

    /**
     *  转换函数
     *
     * @param {string} content 源内容
     * @param {string} replacement 替换内容
     * @returns {string} 被替换后的内容
     */
    private convert(content: string, replacement: string): string {
        if (content.indexOf(OUTLET) > -1) {
            return content.replace(OUTLET, replacement);
        } else {
            throw new Error(`${PLUGIN_NAME}: Not Found Outlet Tag.`);
        }
    }
}
