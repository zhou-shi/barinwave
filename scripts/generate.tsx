import fs from 'fs';
import path from 'path';

// Kita tidak merender React-nya ke string di sini karena terlalu kompleks.
// Kita hanya membuat "Wadah Pintar" (Smart Container) untuk Hugo.

const outputDir = path.join(process.cwd(), 'layouts', 'partials', 'radix-layouts');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const componentName = "navigation-menu";

const template = `{{/* Auto-generated Smart Wrapper for Radix Navigation Menu */}}
{{ $data := .data }} {{/* Data Menu (Array of Objects) dari Hugo */}}
{{ $class := .class | default "" }}
{{ $id := delimit (slice "radix-nav" (now.UnixNano)) "-" }}

<nav id="{{ $id }}" class="{{ $class }} no-js-nav">
  <ul class="flex gap-4">
    {{ range $data }}
      <li><a href="{{ .URL }}">{{ .Name }}</a></li>
    {{ end }}
  </ul>
</nav>

<script id="data-{{ $id }}" type="application/json">
  {{ dict "items" $data | jsonify | safeJS }}
</script>

<script>
  window.requestHydration = window.requestHydration || [];
  window.requestHydration.push({
    component: "RadixNavigation",
    targetId: "{{ $id }}",
    dataId: "data-{{ $id }}"
  });
</script>
`;

fs.writeFileSync(path.join(outputDir, `${componentName}.html`), template);
console.log(`✅ Generated Wrapper: radix-layouts/${componentName}.html`);