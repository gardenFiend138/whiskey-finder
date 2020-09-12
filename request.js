const axios = require('/Users/guywassather/projects/whiskey-finder/node_modules/axios');
const { parse } = require('/Users/guywassather/projects/whiskey-finder/node_modules/node-html-parser');
const fs = require('fs');

const { dbFile, url } = require('/Users/guywassather/projects/whiskey-finder/constants.js');
const currentSelection = require('/Users/guywassather/projects/whiskey-finder/currentSelection.js');
const mailer = require('/Users/guywassather/projects/whiskey-finder/mailer.js');
const { formatForStorage, isWhiskey } = require('/Users/guywassather/projects/whiskey-finder/utils.js');

function checkBottleListForUpdates() {
  const { sendEmail, sendLog } = mailer();
  const existingSelection = new Set(currentSelection);

  axios.get(url).then(resp => {
    const parsedHtml = parse(resp.data);
    const content = parsedHtml.querySelectorAll("strong");
    const newContents = [];
    const updatedList = new Set([]);
    const droppedItems = [];

    if (!content.length) {
      sendLog('No parsed content -- check site markup for changes');
    }

    content.forEach((node) => {
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
        console.log('File saved');
      });

      // if new items exist, notify subscribers
      if (newContents.length) {
        sendEmail(newContents.join("\n"));
      }

      // if item is no longer available, send log message
      if (droppedItems.length) {
        sendLog(`No longer available:\n ${droppedItems.join('\n')}`);
      }
    } else {
      sendLog('No new bottles found');
    }
  })
  .catch(err => {
    if (err) {
      throw err;
    }
  });
}

module.exports = checkBottleListForUpdates;




