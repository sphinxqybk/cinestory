// scripts/strip-import-versions.mjs
import fs from "fs";
import path from "path";

const ROOT = "src";
const exts = new Set([".ts", ".tsx"]);

// จับ string literal ที่เป็นชื่อแพ็กเกจตามด้วย @<ตัวเลข...> แล้วตัดทิ้งเวอร์ชัน
const rx = /(["'])(?:(@[^\/"']+\/)?)([^"'\@\/][^"'\@]*?)@\d[\w.+-]*\1/g;

function fixText(s) {
  return s.replace(rx, (_, q, scope = "", name) => `${q}${scope}${name}${q}`);
}

function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (exts.has(path.extname(f.name))) {
      const old = fs.readFileSync(p, "utf8");
      const neu = fixText(old);
      if (neu !== old) {
        fs.writeFileSync(p, neu);
        console.log("fixed:", p);
      }
    }
  }
}

walk(ROOT);
console.log("done.");
