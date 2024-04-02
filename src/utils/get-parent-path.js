const path = require("path");
function getParentPath(url, level = 1) {
  const args = url.split(path.sep);
  args.splice(-level, level);
  return args.join(path.sep);
}

module.exports = getParentPath;
