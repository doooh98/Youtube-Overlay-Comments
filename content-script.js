const query_params = new URLSearchParams(location.search);
let comments = [];
let timestamp_comments = [];
let videoCurrentSec = 0.0;
let interval_id = null;

chrome.runtime.sendMessage({
  message: 'load_comments',
  videoId: query_params.get('v')
});
const bodyList = document.querySelector("body");
console.log("send Message to load comments");

let currentComment = null; // Keep track of the current comment being displayed

function hideComment() {
  if (currentComment) {
    currentComment.remove(); // Remove the comment element from the DOM
    currentComment = null;
  }
}

function show_comment (author, comment) {
  console.log("show comment");
  // Calculate the duration for which the comment will be displayed
  let duration = 3 + (comment.length / 12.4 * 1000); // reading speed 12.4 CPS by subtitle paper + dragging time
  // let youtube_video = document.querySelector('.video-stream').getBoundingClientRect();
  let overlay_comment = document.createElement('div');
  // // Hide any existing comment
  hideComment();
  // Add the new comment
  currentComment = overlay_comment;
  // Set a timeout to hide the comment after the duration
  setTimeout(hideComment, duration);

  overlay_comment.classList.add('popup-comment');

  // const center={
  //   x: youtube_video.left + (youtube_video.width/5),
  //   y: youtube_video.top + youtube_video.height
  // }
//current tab
  // let new_x = 0.0;
  // let new_y = 0.0;
  // let motion_sway = 0.01;
  // let natural_sway = 0.1;
  // let animated_value = 0.1;

  inside_Video = document.getElementsByClassName('html5-video-container')[0];
  overlay_comment.className = "ytp-button" + "comment_overlay"
  overlay_comment.style = "padding: 30px; position: absolute; cursor: move; z-index: 50000; margin: auto; border: 3px solid green;"
  // overlay_comment.style.left = `${center.x}px`;
  // overlay_comment.style.top = `${center.y}px`;
  let commentText = document.createTextNode(`${author}: ${comment}`);
  overlay_comment.appendChild(commentText);
  document.querySelector('body').append(overlay_comment);
  
  // let new_opacity = 0.1;
  // let opacity_speed = 0.007;

  function onDrag(e) {
    console.log('Comment moving');
    let originalStyles = window.getComputedStyle(overlay_comment)
    overlay_comment.style.left = parseInt(originalStyles.left) + e.movementX + 'px'
    overlay_comment.style.top = parseInt(originalStyles.top) + e.movementY + 'px'
  }

  function onLetGo() {
    console.log("comment stopped dragging");
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', onLetGo)
  }

  function onGrab() {
    console.log("comment started dragging");
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', onLetGo)
  }

  overlay_comment.addEventListener('mousedown', onGrab)

  function addNewCommentEventHandler() {

    event.stopPropagation();
    // Handle the bookmark functionality here
    
  }

  overlay_comment.addEventListener('click', addNewCommentEventHandler);
     
  inside_Video.appendChild(overlay_comment);
  
  // function animate() {
  //   console.log("comment animate(fg)");
  //   console.log(author);
  //   console.log(comment);
  //   new_y = center.y - animated_value;
  //   new_x = center.x + (60.0 * Math.sin(motion_sway * animated_value)) + natural_sway;

  //   overlay_comment.style.top = `${new_y}px`;
  //   overlay_comment.style.left = `${new_x}px`;

  //   new_opacity = Math.sin(opacity_speed*animated_value);
  //   overlay_comment.style.opacity = new_opacity;

  //   animated_value = (animated_value + 1);

  //   if (overlay_comment.style.opacity < 0) {
  //     return;
  //   } else {
  //     requestAnimationFrame(animate);
  //   }
  // }

  // animate();
}


document.addEventListener('keyup', event => {
  console.log("keyup a(fg)(stopped program)");
  if(event.key === 'a') clearInterval(interval_id);
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("onMessage(fg)");
  if (request.message === 'here_are_comments') {
    console.log("comments are loaded. results below");
    console.log(request.comments);//console can see the comments
    comments = request.comments;

    interval_id = setInterval(()=> {
      videoCurrentSec = Math.floor(document.querySelector('.video-stream').currentTime);
      console.log(videoCurrentSec);

      comments.forEach(comment => {
        if(videoCurrentSec < comment.timestamp) {
          if(!timestamp_comments.includes(comment)) {
            console.log("TimeStamp comments are added on showing comments list");
            timestamp_comments.push(comment);
          }
        }
      });

      timestamp_comments.forEach(timestamp_comment => {
        if (videoCurrentSec == timestamp_comment.timestamp) {
            console.log("below is the timestamp_comment will be shown soon")
            console.log(timestamp_comment);
            // Check if there's a comment currently being displayed
            if (!currentComment) {
              // If no comment is being displayed, show the new comment
              show_comment(timestamp_comment.author, timestamp_comment.comment);
              timestamp_comments.splice(timestamp_comments.indexOf(timestamp_comment), 1);
            }
        }
      });
    }, 100);
  }
});

console.log("content-script.js running", window.location.href);