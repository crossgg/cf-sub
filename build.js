import fs from 'node:fs';
import { minify } from 'terser';

async function build() {
    console.log('⚡ [Build] 正在混淆与压缩 Worker 代码...');
    const sourcePath = '_worker.js';
    const outputPath = 'dist/_worker.js';

    if (!fs.existsSync(sourcePath)) {
        throw new Error(`找不到源码文件: ${sourcePath}`);
    }

    const source = fs.readFileSync(sourcePath, 'utf8');
    const result = await minify(source, {
        module: true,
        compress: {
            dead_code: true,
            passes: 2,
            drop_debugger: true
        },
        mangle: {
            toplevel: true
        },
        format: {
            comments: false // 彻底去除所有敏感中英文注释与关键词
        }
    });

    if (result.error) {
        throw result.error;
    }

    fs.mkdirSync('dist', { recursive: true });
    fs.writeFileSync(outputPath, result.code, 'utf8');

    const origKb = (source.length / 1024).toFixed(1);
    const minKb = (result.code.length / 1024).toFixed(1);
    console.log(`✅ [Build] 混淆压缩成功！原体积: ${origKb} KB -> 混淆后: ${minKb} KB (已输出至 ${outputPath})`);
}

build().catch(err => {
    console.error('❌ [Build] 混淆构建失败:', err);
    process.exit(1);
});
