function formatForStorage(content) {
  const preContent = "const currentSelection = ";
  const exportContent = "\n\nmodule.exports = currentSelection;\n";
  const formattedContent = Array.from(content).map(text => `\n"${text}"`);
  const contentInArray = `[${formattedContent}];`;
  return  preContent + contentInArray + exportContent;
}

function isWhiskey(text) {
  // currently, most whiskeys have ABV with %. Some do not, but they all have at least a price.
  return (text.includes('%') || text.match(/\d/)) && !text.includes('©');
}

module.exports = { formatForStorage, isWhiskey };
