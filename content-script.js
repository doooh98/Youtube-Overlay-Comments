const query_params = new URLSearchParams(location.search);
let comments = [];
let timestamp_comments = [];
let videoCurrentSec = 0.0;
let interval_id = null;
let isCommentShowing = false;
let commentStartTime = null;


chrome.runtime.sendMessage({
  message: 'load_comments',
  videoId: query_params.get('v')
});
const bodyList = document.querySelector("body");
console.log("send Message to load comments");


let currentComment = null; // Keep track of the current comment being displayed
let commentEndTime = null;  // This will hold when the comment is supposed to be hidden.


function hideComment() {
  if (currentComment) {
    currentComment.remove(); // Remove the comment element from the DOM
    currentComment = null;
    commentEndTime = null;
    isCommentShowing = false;
  }
}

//for the closing comment box
let isGloballyMinimized = false;

function show_comment (author, comment) {
  console.log("show comment");
  // Calculate the duration for which the comment will be displayed
  let duration = 3 * (3 + (comment.length / 12.4 * 1000)); // reading speed 12.4 CPS by subtitle paper + dragging time
  commentStartTime = videoCurrentSec; // Current video time is the comment's start time
  
  let overlay_comment = document.createElement('div');
  // // Hide any existing comment
  hideComment();
  // Add the new comment
  currentComment = overlay_comment;
  commentEndTime = videoCurrentSec + duration / 1000;  // Set when the comment should be hidden.

  // Set flag to show that a comment is currently being displayed
  isCommentShowing = true;
  overlay_comment.classList.add('popup-comment');


  

  //below is the css part of comment box(buttons functionality shoudl be implemented)
  inside_Video = document.getElementsByClassName('html5-video-container')[0];
  overlay_comment.className = "comment";
    // Create and append the author span
    let authorSpan = document.createElement('span');
    authorSpan.className = 'author';  
    authorSpan.textContent = author;
    overlay_comment.appendChild(authorSpan);

    // Add a line break
    overlay_comment.appendChild(document.createElement('br'));  

    // Create and append the comment text
    let commentText = document.createElement('p');
    commentText.className = 'string'; 
    commentText.textContent = comment;
    overlay_comment.appendChild(commentText);


    // Create the close button
    let closeButton = document.createElement('div');
    closeButton.className = 'close-btn';
    // Set initial state based on isGloballyMinimized
    closeButton.innerHTML = isGloballyMinimized ? '+' : '-';
    closeButton.style.backgroundColor = isGloballyMinimized ? 'blue' : 'red';

    // Apply initial minimized state if needed
    if (isGloballyMinimized) {
        authorSpan.style.display = 'none';
        commentText.style.display = 'none';
        overlay_comment.style.width = '0px';
        overlay_comment.style.height = '0px';
    } else {
        // Ensure everything is visible if not minimized
        authorSpan.style.display = '';
        commentText.style.display = '';
        overlay_comment.style.width = ''; // Reset to default or specify a size
        overlay_comment.style.height = ''; // Reset to default or specify a size
    }

    closeButton.onclick = function() {
        isGloballyMinimized = !isGloballyMinimized; // Toggle the global state
        if (isGloballyMinimized) {
            // Change to minimized state
            this.innerHTML = '+';
            this.style.backgroundColor = 'blue';
            authorSpan.style.display = 'none';
            commentText.style.display = 'none';
            overlay_comment.style.width = '20px';
            overlay_comment.style.height = '20px';
        } else {
            // Expand back
            this.innerHTML = '-';
            this.style.backgroundColor = 'red';
            authorSpan.style.display = '';
            commentText.style.display = '';
            overlay_comment.style.width = ''; // Reset to default or specify
            overlay_comment.style.height = ''; // Reset to default or specify
        }
    };

    overlay_comment.appendChild(closeButton);

//------




  //below are letting comment dragable----
  function onDrag(e) {
    console.log('Comment moving');let originalStyles = window.getComputedStyle(overlay_comment);
    overlay_comment.style.left = parseInt(originalStyles.left) + e.movementX + 'px';
    overlay_comment.style.top = parseInt(originalStyles.top) + e.movementY + 'px';}
  function onLetGo() {console.log("comment stopped dragging");document.removeEventListener('mousemove', onDrag);document.removeEventListener('mouseup', onLetGo);}
  function onGrab() {console.log("comment started dragging");document.addEventListener('mousemove', onDrag);document.addEventListener('mouseup', onLetGo);}
  overlay_comment.addEventListener('mousedown', onGrab);
  //-----




  function addNewCommentEventHandler() {event.stopPropagation();}
  overlay_comment.addEventListener('click', addNewCommentEventHandler);

  inside_Video.appendChild(overlay_comment);
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("onMessage(fg)");
  if (request.message === 'here_are_comments') {
    console.log("comments are loaded. results below");
    console.log(request.comments);
    timestamp_comments = request.comments;

    interval_id = setInterval(()=> {
      let video = document.querySelector('.video-stream');
      videoCurrentSec = video.currentTime;
      console.log(videoCurrentSec);

      // If a comment is showing, we check if it's time to hide it
      if (isCommentShowing && commentEndTime <= videoCurrentSec || commentStartTime >=videoCurrentSec) {
        hideComment();
      }

      // If video is not playing, we don't proceed to show comments
      if (video.paused) {
        return;
      }

      // Process timestamp comments
      timestamp_comments.forEach((timestamp_comment, index) => {
        let commentTime = timestamp_comment.timestamp;
        let duration = 3 * (3 + (timestamp_comment.comment.length / 12.4 * 1000)) / 1000; // convert to seconds

        // Check if the video time is within the comment's display duration
        if (videoCurrentSec >= commentTime && videoCurrentSec < (commentTime + duration)) {
          console.log("below is the timestamp_comment will be shown soon")
          console.log(timestamp_comment);
          console.log(duration);
          // If no comment is being displayed, or if a different comment was being displayed, show the new comment
          if (!isCommentShowing || commentStartTime !== commentTime) {
            show_comment(timestamp_comment.author, timestamp_comment.comment);
            commentStartTime = commentTime;
            commentEndTime = commentTime + duration;
          }
        }
      });
    }, 100);
  }
});


console.log("content-script.js running", window.location.href);
