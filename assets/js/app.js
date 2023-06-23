// // Variables for buttons
// const startStopBtn = document.querySelector('#startStopBtn');
// const resetBtn = document.querySelector('#resetBtn');

// // Variables for time values
// let seconds = 0;
// let minutes = 0;
// let hours = 0;

// // Variables for set interval and timer status
// let timerInterval = null;
// let timerStatus = 'stopped';

// // Stop Watch function
// function stopWatch() {
//    seconds++;
//    if (seconds / 60 === 1) {
//       seconds = 0;
//       minutes++;

//       if (minutes / 60 === 1) {
//          minutes = 0;
//          hours++;
//       }
//    }

//    updateTimer();
// }

// startStopBtn.addEventListener('click', function () {
//    if (timerStatus === 'stopped') {
//       timerInterval = window.setInterval(stopWatch, 1000);
//       document.getElementById('startStopBtn').innerHTML = '<i class="fa-solid fa-pause" id="pause"></i>';
//       timerStatus = 'started';
//    } else {
//       window.clearInterval(timerInterval);
//       document.getElementById('startStopBtn').innerHTML = '<i class="fa-solid fa-play" id="play"></i>';
//       timerStatus = 'stopped';
//    }
// })

// resetBtn.addEventListener('click', function () {
//    seconds = 0;
//    minutes = 0;
//    hours = 0;

//    window.clearInterval(timerInterval);
//    updateTimer();

//    if (timerStatus === 'started') {
//       timerInterval = window.setInterval(stopWatch, 1000);
//    }
// })

// function updateTimer() {
//    let timeStr = hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
//    document.getElementById('timer').innerText = timeStr;
// }