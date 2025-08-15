import fs from "fs";
import path from "path";

const SKIP_DIRS = new Set(["node_modules", ".git", ".vercel", "dist"]);
const exts = new Set([".ts", ".tsx"]);

// จับ string literal ของ import/require ที่เป็นชื่อแพ็กเกจตามด้วย @<version> แล้วตัดออก
const rx = /(["'])(?:(@[^\/"']+\/)?)([^"'@\/][^"'@]*?)@\d[\w.+-]*\1/g;

function fixText(s) {
  return s.replace(rx, (_, q, scope = "", name) => `${q}${scope ?? ""}${name}${q}`);
}

function walk(dir) {
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (!SKIP_DIRS.has(dirent.name)) walk(p);
    } else if (exts.has(path.extname(dirent.name))) {
      const old = fs.readFileSync(p, "utf8");
      const neu  = fixText(old);
      if (neu !== old) {
        fs.writeFileSync(p, neu);
        console.log("fixed:", p);
      }
    }
  }
}

walk(process.cwd());
console.log("done.");
