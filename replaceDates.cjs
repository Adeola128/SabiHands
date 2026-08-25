const fs = require("fs");
const path = require("path");

const utilsPath = path.join(__dirname, "src", "utils", "date.ts");
const dateUtils = `export const formatNigerianDate = (date, options) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", ...options });
};
export const formatNigerianTime = (date, options) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos", ...options });
};
`;

if (!fs.existsSync(path.dirname(utilsPath))) {
  fs.mkdirSync(path.dirname(utilsPath), { recursive: true });
}
fs.writeFileSync(utilsPath, dateUtils);

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, "src"));
files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  if (content.includes("toLocaleDateString")) {
    content = content.replace(/\.toLocaleDateString\(([^)]*)\)/g, (match, args) => {
       if (args.includes("en-NG") && args.includes("Africa/Lagos")) return match;
       if (!args) return `.toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" })`;
       if (args.includes("en-US") || args.includes("[]")) {
          return match.replace(/en-US/g, "en-NG").replace(/\[\]/g, "\"en-NG\"").replace(/\}$/, ", timeZone: \"Africa/Lagos\" }");
       }
       return `.toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", ...(${args || "{}"}) })`;
    });
  }
  if (content.includes("toLocaleTimeString")) {
    content = content.replace(/\.toLocaleTimeString\(([^)]*)\)/g, (match, args) => {
       if (args.includes("en-NG") && args.includes("Africa/Lagos")) return match;
       if (!args) return `.toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos" })`;
       if (args.includes("en-US") || args.includes("[]")) {
          return match.replace(/en-US/g, "en-NG").replace(/\[\]/g, "\"en-NG\"").replace(/\}$/, ", timeZone: \"Africa/Lagos\" }");
       }
       return `.toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos", ...(${args || "{}"}) })`;
    });
  }
  fs.writeFileSync(file, content);
});
console.log("Done");

