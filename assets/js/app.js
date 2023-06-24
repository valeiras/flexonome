"use strict";

const MS_PER_MIN = 60000;
const QUAVERS_PER_BAR = 4;

// Variables for buttons
const playBtn = document.querySelector('#play-btn');
const stopBtn = document.querySelector('#stop-btn');
const addBtn = document.querySelector('#add-btn');

// Variables for input
const bpmInput = document.querySelector('#bpm');

// Variables for time values
let currInterval = 0;

// Variables for iterating the array
let currMeasureIdx = -1;
let currNoteIdx = -1;

// Variables for set interval and metronome status
let metronomeInterval = null;

let softSound = new Audio('./assets/sounds/softSound.mp3');
let strongSound = new Audio('./assets/sounds/strongSound.mp3');

// Next note function
function playNote() {

   // We unplay the last note and increase the indexes
   if (currNoteIdx >= 0) {
      toggleCurrentNote();
      let nbNotes = getNbNotes(currMeasureIdx);
      currNoteIdx = ++currNoteIdx % nbNotes;
   } else {
      currNoteIdx = 0;
   }

   if (currNoteIdx === 0) {
      let nbMeasures = document.querySelectorAll('.measure').length;
      currMeasureIdx = ++currMeasureIdx % nbMeasures;
   }

   // We play the current one
   toggleCurrentNote();
   if (getCurrNote().classList.contains('strong')) {
      strongSound.pause();
      strongSound.currentTime = 0
      strongSound.play();
   } else {
      softSound.pause();
      softSound.currentTime = 0
      softSound.play();
   }

   if (currNoteIdx === 0) {
      let newInterval = getCurrentInterval(currMeasureIdx);
      if (newInterval !== currInterval) {
         currInterval = newInterval;
         window.clearInterval(metronomeInterval);
         metronomeInterval = window.setInterval(playNote, currInterval);
      }
   }
}

function getNbNotes(measureIdx) {
   let noteContainer = document.querySelectorAll('.note-container')[measureIdx];
   return noteContainer.querySelectorAll('.note').length;
}

function getCurrNote() {
   let currNoteContainer = document.querySelectorAll('.note-container')[currMeasureIdx];
   return currNoteContainer.querySelectorAll('.note')[currNoteIdx];
}

function toggleCurrentNote() {
   getCurrNote().classList.toggle("active");
}

function removeRow(e) {
   let rowToRemove = e.target.parentElement.parentElement;
   let rowList = Array.prototype.slice.call(document.querySelectorAll('.row.measure'));
   let idxToRemove = rowList.indexOf(rowToRemove);

   if (idxToRemove === currMeasureIdx) {
      currNoteIdx = -1;
      currMeasureIdx--;
   } else if (idxToRemove < currMeasureIdx) {
      currMeasureIdx--;
   }

   rowToRemove.remove();
   let nbMeasures = document.querySelectorAll('.measure').length;
   if (nbMeasures === 1) {
      let removeBtn = document.querySelector('.remove-btn');
      removeBtn.disabled = true;
   }
}

function createNoteContainer(beatsPerBar) {
   let noteContainer = document.createElement('div');
   noteContainer.classList.add('note-container');
   noteContainer.addEventListener('click', function (e) {
      e.target.classList.toggle("strong");
   })
   for (let ii = 0; ii < beatsPerBar; ii++) {
      let newNote = document.createElement('div');
      newNote.classList.add('note');
      if (ii === 0) newNote.classList.add('strong');
      noteContainer.appendChild(newNote);
   }
   return noteContainer;
}

function createBeatsPerBarInput(beatsPerBar) {
   let beatsPerBarInput = document.createElement('input');

   beatsPerBarInput.classList.add('beats-per-bar');
   beatsPerBarInput.setAttribute('type', 'number');
   beatsPerBarInput.setAttribute('value', beatsPerBar);
   beatsPerBarInput.setAttribute('min', 1);
   beatsPerBarInput.setAttribute('max', 12);
   beatsPerBarInput.addEventListener('change', changeBeatsPerBar);

   return beatsPerBarInput;
}

function createNoteValueInput(noteValue) {
   let noteValueInput = document.createElement('input');
   noteValueInput.classList.add('note-value');
   noteValueInput.setAttribute('type', 'number');
   noteValueInput.setAttribute('value', noteValue);
   return noteValueInput;
}

function createSignatureContainer(beatsPerBar, noteValue) {
   let signatureContainer = document.createElement('div');
   signatureContainer.classList.add('signature-container');

   let beatsPerBarInput = createBeatsPerBarInput(beatsPerBar);
   signatureContainer.appendChild(beatsPerBarInput);

   let span = document.createElement('span');
   span.innerText = "/";
   signatureContainer.appendChild(span);

   let noteValueInput = createNoteValueInput(noteValue);
   signatureContainer.appendChild(noteValueInput);

   return signatureContainer;
}

function createRemoveButton() {
   let removeButton = document.createElement('button');
   removeButton.classList.add('remove-btn');
   removeButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

   removeButton.addEventListener("click", removeRow);

   // If this is the first (and thus only) measure, it cannot be removed
   let nbMeasures = document.querySelectorAll('.measure').length;
   if (nbMeasures > 1) {
      let firstRemoveBtn = document.querySelector('.remove-btn');
      firstRemoveBtn.disabled = false;
   } else {
      removeButton.disabled = true;
   }

   return removeButton;
}

function changeBeatsPerBar(e) {
   let desiredNbNotes = e.target.value;

   let currRow = e.target.parentElement.parentElement;
   let noteContainer = currRow.querySelector('.note-container');
   let currNbNotes = noteContainer.querySelectorAll('.note').length;
   let notes = noteContainer.querySelectorAll('.note');

   while (currNbNotes < desiredNbNotes) {
      let newNote = document.createElement('div');
      newNote.classList.add('note');
      noteContainer.appendChild(newNote);
      currNbNotes = noteContainer.querySelectorAll('.note').length
   }
   let currDeleteIdx = currNbNotes - 1;
   while (currNbNotes > desiredNbNotes) {
      // If we are removing the active note we reset the metronome
      if (notes[currDeleteIdx].classList.contains('active')) {
         currNoteIdx = -1;
      }
      notes[currDeleteIdx].remove();
      currNbNotes = noteContainer.querySelectorAll('.note').length
      currDeleteIdx--;
   }
}

function addNewRow() {
   let beatsPerBar = 4;
   let noteValue = 4;
   let measureContainer = document.querySelector('#measure-container');

   let newRow = document.createElement('div');
   newRow.classList.add('row');
   newRow.classList.add('measure');
   measureContainer.appendChild(newRow);

   let noteContainer = createNoteContainer(beatsPerBar);
   newRow.appendChild(noteContainer);

   let signatureContainer = createSignatureContainer(beatsPerBar, noteValue);
   newRow.appendChild(signatureContainer);

   let removeButton = createRemoveButton();
   newRow.appendChild(removeButton);
}

function getCurrentInterval(measureIdx) {
   let noteValues = document.querySelectorAll('.note-value');
   // We verify that we are within bounds
   let idx = measureIdx < noteValues.length ? measureIdx : 0;

   let currNoteValue = noteValues[idx].value;
   let bpm = bpmInput.value;

   return (MS_PER_MIN / bpm) * (QUAVERS_PER_BAR / currNoteValue);
}

playBtn.addEventListener('click', function () {
   currMeasureIdx = -1;
   currNoteIdx = -1;
   currInterval = 0;

   playNote();
   playBtn.disabled = true;
   stopBtn.disabled = false;
});

stopBtn.addEventListener('click', function () {
   window.clearInterval(metronomeInterval);
   toggleCurrentNote();
   playBtn.disabled = false;
   stopBtn.disabled = true;
})

addBtn.addEventListener("click", addNewRow);
document.addEventListener("DOMContentLoaded", addNewRow);