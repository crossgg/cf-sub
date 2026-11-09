import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { minify } from 'terser';

function prepareWranglerConfig() {
    if (!fs.existsSync('wrangler.toml')) return;
    let content = fs.readFileSync('wrangler.toml', 'utf8');

    if (!content.includes('<YOUR_KV_NAMESPACE_ID>')) return;

    try {
        console.log('🔍 [Build] 正在尝试自动检测/创建 Cloudflare KV 命名空间 (XS_SUB_KV)...');
        let raw = execSync('npx wrangler kv namespace list', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 5000 });
        let list = JSON.parse(raw || '[]');
        let kv = list.find(k => k.title && k.title.includes('XS_SUB_KV'));
        if (!kv) {
            console.log('📦 [Build] 未找到 XS_SUB_KV，尝试自动创建...');
            execSync('npx wrangler kv namespace create XS_SUB_KV', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 8000 });
            raw = execSync('npx wrangler kv namespace list', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 5000 });
            list = JSON.parse(raw || '[]');
            kv = list.find(k => k.title && k.title.includes('XS_SUB_KV'));
        }
        if (kv && kv.id && /^[a-f0-9]{32}$/i.test(kv.id)) {
            console.log(`✅ [Build] 成功自动关联 KV 数据库 ID: ${kv.id}`);
            content = content.replace(/id\s*=\s*["']<YOUR_KV_NAMESPACE_ID>["']/, `id = "${kv.id}"`);
            fs.writeFileSync('wrangler.toml', content, 'utf8');
            return;
        }
    } catch (err) {
        // 构建环境可能权限受限或非交互式环境无法创建 KV
    }

    console.log('ℹ️ [Build] 检测到未配置的 KV 占位符，已自动安全跳过绑定以防止 10042 报错（Worker 将在内存安全模式下运行）');
    content = content.replace(
        /\[\[kv_namespaces\]\][\s\S]*?id\s*=\s*["']<YOUR_KV_NAMESPACE_ID>["']/,
        '# [[kv_namespaces]]\n# binding = "XS_SUB_KV"\n# 提示：可在 Cloudflare 控制台 Worker -> Settings -> Bindings 中手动添加名为 XS_SUB_KV 的绑定'
    );
    fs.writeFileSync('wrangler.toml', content, 'utf8');
}

async function build() {
    prepareWranglerConfig();

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
