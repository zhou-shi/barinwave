import fs from "fs";
import path from "path";

export type GenerateWrapperProps = {
    outputDir: string[];
    componentName: string;
    templateFile: string[];
}

export function GenerateWrapper({outputDir, componentName, templateFile}: GenerateWrapperProps): void {
    try {
        const destDir = path.join(process.cwd(), ...outputDir);
        const destFile = path.join(destDir, `${componentName}.html`);

        const srcTemplate = `${path.join(process.cwd(), ...templateFile)}.html`;

        if (!fs.existsSync(srcTemplate)) {
            throw new Error(`Template source not found: ${srcTemplate}`);
        }

        const template = fs.readFileSync(srcTemplate, 'utf-8');

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        fs.writeFileSync(destFile, template);

        console.log(`✅ Generated Wrapper: ${path.join(...outputDir, componentName + '.html')}`);
        
    } catch (err) {
        console.error(`❌ Error generating wrapper for ${componentName}:`, err);
        process.exit(1);
    }
}

