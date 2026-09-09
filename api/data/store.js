const fs = require("fs");
const path = require("path");

const filePath = (name) => path.join(__dirname, `${name}.json`);

const readData = (name) => {
  const raw = fs.readFileSync(filePath(name), "utf-8");
  return JSON.parse(raw);
};

const writeData = (name, data) => {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
};

module.exports = { readData, writeData };
