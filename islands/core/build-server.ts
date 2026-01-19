import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import chokidar from 'chokidar';
import { render } from 'preact-render-to-string';
import UIEngineServer from '@/modules/core/ui-engine-server';

// --- KONFIGURASI PATH ---
const THEME_CONTENT_DIR = path.resolve(process.cwd(), 'content');
const PROJECT_CONTENT_DIR = path.resolve(process.cwd(), '../../content');
const TARGET_DIRS = [THEME_CONTENT_DIR, PROJECT_CONTENT_DIR];
const OUTPUT_DIR = path.resolve(process.cwd(), 'layouts/partials/islands/generated');
const isWatchMode = process.argv.includes('--watch');

async function processFile(filePath: string) {
    try {
        const fileName = path.basename(filePath, '.md');
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(rawContent);

        // 1. Cari Node Pemicu
        const serverNode = data.sections && data.sections.find((s: any) => 
            s.component === 'core/ui-engine-server'
        );

        if (!serverNode) return; 

        const sourceLabel = filePath.includes(PROJECT_CONTENT_DIR) ? "[PROJECT]" : "[THEME]";
        console.log(`\n⚡ Processing ${sourceLabel}: ${fileName}.md`);

        // --- DEBUG POINT 1: INSPEKSI NODE ---
        // Kita intip apa isi serverNode sebenarnya
        // console.log("🔍 INSPEKSI DATA MENTAH:", JSON.stringify(serverNode, null, 2));

        // 2. AMBIL ISI TREE (UNWRAPPING)
        let actualTree = [];

        // Cek Struktur Data: Apakah ada di props.Data.tree?
        if (serverNode.props && serverNode.props.Data && serverNode.props.Data.tree) {
            actualTree = serverNode.props.Data.tree;
        } 
        // Fallback: Siapa tau user lupa indentasi 'Data'
        else if (serverNode.props && serverNode.props.tree) {
             actualTree = serverNode.props.tree;
        }

        console.log(`   👉 Found ${actualTree.length} items in tree.`);

        if (actualTree.length === 0) {
            console.warn(`   ⚠️ WARNING: Tree is empty! Check demo.md indentation.`);
            // Debugging Extra: Tampilkan keys yang ditemukan
            if (serverNode.props) console.log("   Keys in props:", Object.keys(serverNode.props));
        }

        // 3. Render
        const html = render(UIEngineServer({ Data: { tree: actualTree } }));
        const cleanHtml = html.replace(/\s+/g, ' ').trim();

        if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        
        const destPath = path.join(OUTPUT_DIR, `${fileName}.html`);
        fs.writeFileSync(destPath, cleanHtml);
        
        console.log(`   ✅ Saved: ${fileName}.html (Size: ${cleanHtml.length} chars)`);
        
        // --- DEBUG POINT 2: CEK HASIL RENDER ---
        if (cleanHtml.length < 60) {
            console.warn(`   ⚠️ HASIL RENDER MENCURIGAKAN (TERLALU PENDEK):`);
            console.warn(`   "${cleanHtml}"`);
        }

    } catch (err) {
        console.error(`❌ Error processing ${filePath}:`, err);
    }
};

async function generateServerManifest() {
    console.log("🚀 Starting Server Content Generation (Debug Mode)...");
    for (const dir of TARGET_DIRS) {
        if (fs.existsSync(dir)) {
            const files = await glob(`${dir}/**/*.md`);
            for (const file of files) await processFile(file);
        }
    }
    if (isWatchMode) {
        console.log("\n👀 Watching...");
        const watchPaths = TARGET_DIRS.filter(d => fs.existsSync(d)).map(d => `${d}/**/*.md`);
        chokidar.watch(watchPaths, { ignoreInitial: true }).on('change', processFile).on('add', processFile);
    }
};

generateServerManifest();