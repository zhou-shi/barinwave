import fs from "fs";
import path from "path";

export type IslandConfig = {
    outputDir: string[];
    name: string;
    templateSource: string[];
}

export const buildIsland = (config: IslandConfig): void => {
    try {
        console.log(`🔨 Building Island: ${config.name}...`);

        const destDir = path.join(process.cwd(), ...config.outputDir);
        const destFile = path.join(destDir, `${config.name}.html`);

        const srcTemplate = `${path.join(process.cwd(), ...config.templateSource)}.html`;

        if (!fs.existsSync(srcTemplate)) {
            throw new Error(`Template source not found: ${srcTemplate}`);
        }

        const template = fs.readFileSync(srcTemplate, 'utf-8');

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        fs.writeFileSync(destFile, template);

        console.log(`✅ Island: ${config.name} deployed to Hugo partials at ${destFile}`);
        
    } catch (err) {
        console.error(`❌ Error building island for ${config.name}:`, err);
        process.exit(1);
    }
}

