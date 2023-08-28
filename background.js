importScripts('api.js');
let youtube_api_options = {
  part: 'snippet',
  maxResults: '100',
  order: 'relevance',
  textFormat: 'plainText',
  key: config.API_KEY
};
let filtered_comments = [];
let filtered_and_sorted_comments = [];

//new tab reset the fetch string

function get_comments(videoId) {
  console.log("getting Comments...");
  //reset for the new tab or new page
  filtered_comments = [];
  filtered_and_sorted_comments = [];

  let fetch_string = 'https://youtube.googleapis.com/youtube/v3/commentThreads?';

  fetch_string += `part=${youtube_api_options.part}&`;
  fetch_string += `maxResults=${youtube_api_options.maxResults}&`;
  fetch_string += `order=${youtube_api_options.order}&`;
  fetch_string += `textFormat=${youtube_api_options.textFormat}&`;
  fetch_string += `videoId=${videoId}&`;
  fetch_string += `key=${youtube_api_options.key}`;
  console.log(fetch_string);
  console.log("comments are loaded above!");

  return fetch(fetch_string)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error, fetch string of response did not worked');
      }
      return response.json();
    })
    .then(package => {
      console.log(package);
      console.log("parse sort comments function is running...")
      return parseSortComments(package);
    })
    .catch(error => {
      console.log("error occured while parse sort comments function is running")
      console.error(error);
    });
}

function parseSortComments(comments) {
  console.log("starting of sorting timestamp comments...)");
  const timestamp_regexp = new RegExp('[0-9]{0,2}:[0-9]{1,2}', 'g');
  
  filtered_comments = comments.items.map(item => {
    console.log("getting author and comment data from the comments...");
    return {
      author: item.snippet.topLevelComment.snippet.authorDisplayName,
      comment:item.snippet.topLevelComment.snippet.textDisplay
    }
  })
  
  

  filtered_comments.forEach(comment => {
    let matches = comment.comment.match(timestamp_regexp);
    if(matches) {
      console.log("pushing timestamp comments on the Overlay list...")
      matches.forEach(timestamp => {
        filtered_and_sorted_comments.push({
          timestamp: timestamp,
          author: comment.author,
          comment: comment.comment
        });
      });
    }
  });

  filtered_and_sorted_comments = filtered_and_sorted_comments.map(comment => {
    console.log("converting timestamp of comments to seconds(for overlay function)");
    let temp_array = [];
    let converted_into_seconds = 0.0;

    if (typeof comment.timestamp === 'string') {
    temp_array = comment.timestamp.split(':');
} else {
    console.error("Timestamp is not a string: ", comment.timestamp);
}

    converted_into_seconds = (parseFloat(temp_array[0]) * 60) + (parseFloat(temp_array[1]));

    return {
      timestamp: converted_into_seconds,
      author: comment.author,
      comment: comment.comment
    }
  });
  filtered_and_sorted_comments = filtered_and_sorted_comments.sort((a, b) => a.timestamp - b.timestamp);

  console.log("returned filtered comments to the contentscript.js");
  return filtered_and_sorted_comments;
  
}

// chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
//   console.log("onUpdated(bg)");
//   // Look for any change in the URL, not just for a completed load
//   if(changeInfo.url) {
//     if(/^https:\/\/www\.youtube\.com\/watch/.test(tab.url)) {
//       chrome.scripting.insertCSS(
//         {
//           target:{
//             tabId:tabId
//           }, 
//           files: ['./commentStyle.css']
//         }
//       );
//       // chrome.scripting.executeScript(
//       //   {
//       //     target:{
//       //       tabId:tabId
//       //     }, 
//       //     files: ['./content-script.js']
//       //   }
//       // );
//     }

//   }
// })

// chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {
//   console.log("onCreated(bg)");
//   if(changeInfo.url) {
//     if(/^https:\/\/www\.youtube\.com\/watch/.test(tab.url)) {
//       chrome.scripting.insertCSS(tabId, {file: './commentStyle.css'});
//       chrome.scripting.executeScript(tabId, {file: './foreground.js'});
//     }
//   }
// })


chrome.webNavigation.onHistoryStateUpdated.addListener(async function(details) {
  if(/^https:\/\/www\.youtube\.com\/watch/.test(details.url)) {
    console.log("video URL checked!");
    const url = new URL(details.url);
    const videoId = url.searchParams.get("v");
    console.log("getting comments...");
    await get_comments(videoId);
    chrome.tabs.sendMessage(details.tabId, {message: 'here_are_comments', comments: filtered_and_sorted_comments});
    chrome.scripting.insertCSS({target:{tabId: details.tabId}, files: ['./commentStyle.css']});
    console.log("sent result to content-script.js");
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("onMessage");
  if (request.message === 'load_comments') {
    console.log("received request from content-script.js");
    console.log("getting comments...");
    await get_comments(request.videoId);
    chrome.tabs.sendMessage(sender.tab.id, {message: 'here_are_comments', comments: filtered_and_sorted_comments});
    chrome.scripting.insertCSS({target:{tabId: sender.tab.id}, files: ['./commentStyle.css']});
    console.log("sent result to content-script.js");
  }
});

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//   console.log("onUpdated(bg)");
//   if(changeInfo.status === 'complete') {
//     if(/^https:\/\/www\.youtube\/.com\/watch/.test(tab.url)) {
//       chrome.tabs.insertCSS(tabId, {file: './commentStyle.css'});
//     }
//   }
// })

// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//   console.log("onMessage(bg)");
//   if (request.message === 'load_comments') {
//     await get_comments(request.videoId);
//     chrome.tabs.sendMessage(sender.tab.id,
//        {message: 'here_are_comments', comments: filtered_and_sorted_comments});
//   }
// });