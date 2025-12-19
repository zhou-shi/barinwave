import { GenerateWrapper } from "@/helper/generate-wrapper";
import { wrapper } from "./wrapper";

wrapper.forEach(({ outputDir, componentName, templateFile }) => {
    GenerateWrapper({ outputDir, componentName, templateFile });
});
