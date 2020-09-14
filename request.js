const { parse } = require('/Users/guywassather/projects/whiskey-finder/node_modules/node-html-parser');
const fs = require('fs');

const { dbFile } = require('/Users/guywassather/projects/whiskey-finder/constants.js');
const currentSelection = require('/Users/guywassather/projects/whiskey-finder/currentSelection.js');
const Request = require('/Users/guywassather/projects/whiskey-finder/api/client.js');
const { formatForStorage, isWhiskey } = require('/Users/guywassather/projects/whiskey-finder/utils.js');

function checkBottleListForUpdates() {
  const existingSelection = new Set(currentSelection || []);
  const onSuccess = resp => {
    const parsedHtml = parse(resp.data);
    // there are no class names on the elements we need; for now, use tag type since this has been
    // consistent so far
    const content = parsedHtml.querySelectorAll("strong");
    const newContents = [];
    const updatedList = new Set([]);
    const droppedItems = [];

    if (!content.length) {
      Request.sendLogMessage("No parsed content -- check site markup for changes");
      return;
    }
    content.forEach(node => {
      // TODO: error handling here in case childNodes is empty
      let text = node.childNodes[0].rawText;
      // TODO: why?
      text = text.replace("&nbsp", " ");
      if (isWhiskey(text)) {
        updatedList.add(text);
        if (!existingSelection.has(text)) {
          newContents.push(text);
        }
      }
    });
    currentSelection.forEach(item => {
      if (!updatedList.has(item)) {
        droppedItems.push(item);
      }
    });
    if (newContents.length || droppedItems.length) {
      const contentToWrite = formatForStorage(updatedList);
      fs.writeFile(dbFile, contentToWrite, err => {
        if (err) {
          throw err;
        }
        console.log("File saved");
      });
      // if new items exist, notify subscribers
      if (newContents.length) {
        Request.sendUpdateMessage(newContents.join("\n"));
      }
      // if item is no longer available, send log message
      if (droppedItems.length) {
        Request.sendLogMessage(`No longer available:\n ${droppedItems.join("\n")}`);
      }
    } else {
      Request.sendLogMessage("No new bottles found");
    }
  };

  Request.getBottleList()
    .then(onSuccess)
    .catch(err => {
      if (err) {
        throw err;
      }
    });
}

module.exports = checkBottleListForUpdates;




