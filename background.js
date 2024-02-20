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
    });
}

//rank comments have same timestamps
function prioritizeComments(comments) {
    let groupedComments = {};

    comments.forEach(comment => {
        let time = comment.timestamp;
        if (!groupedComments[time]) groupedComments[time] = [];
        groupedComments[time].push(comment);
    });

    let prioritizedComments = [];
    for (let time in groupedComments) {
        let group = groupedComments[time];
        if (group.length === 1) {
            prioritizedComments.push(group[0]);
        } else {
            let highestPriorityComment = group.reduce((prev, current) => {
                let prevPriority = prev.likeCount * 2 + prev.totalReplyCount;
                let currentPriority = current.likeCount * 2 + current.totalReplyCount;
                return prevPriority > currentPriority ? prev : current;
            });
            prioritizedComments.push(highestPriorityComment);
        }
    }

    return prioritizedComments;
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
  }).filter(comment => comment.comment.length <= 68); // Filter comments based on length (blocking too long comments (bad for UI))

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
  // Use the prioritizeComments function
  filtered_and_sorted_comments = prioritizeComments(filtered_and_sorted_comments);

  console.log("returned filtered comments to the contentscript.js");
  // Send both timestamped and non-timestamped comments
  return {
    timestampComments: filtered_and_sorted_comments
  };
  
}

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
    let sortedComments = await get_comments(request.videoId);
    chrome.tabs.sendMessage(sender.tab.id, {
      message: 'here_are_comments',
      comments: sortedComments.timestampComments
    });
    chrome.scripting.insertCSS({target:{tabId: sender.tab.id}, files: ['./commentStyle.css']});
    console.log("sent result to content-script.js");
  }
});