"use strict";

const MS_PER_MIN = 60000;
const QUAVERS_PER_BAR = 4;

// Main container
const mainContainer = document.querySelector('#main-container');

// Variables for buttons
const playBtn = document.querySelector('#play-btn');
const stopBtn = document.querySelector('#stop-btn');

// Variables for input
const bpmInput = document.querySelector('#bpm');

let isPlaying = false;

// ---------------------- Main play note function -----------------------------
function playNote(measureContainer) {
   // We unplay the last note and increase the indexes
   if (measureContainer.currNoteIdx >= 0) {
      toggleCurrentNote(measureContainer);
      let nbNotes = getNbNotes(measureContainer, measureContainer.currMeasureIdx);
      measureContainer.currNoteIdx = ++measureContainer.currNoteIdx % nbNotes;
   } else {
      measureContainer.currNoteIdx = 0;
   }

   if (measureContainer.currNoteIdx === 0) {
      let nbMeasures = measureContainer.querySelectorAll('.measure').length;
      measureContainer.currMeasureIdx = ++measureContainer.currMeasureIdx % nbMeasures;
   }

   // We play the current one
   toggleCurrentNote(measureContainer);
   if (getCurrentNote(measureContainer).classList.contains('strong')) {
      playSound(measureContainer.strongSound);
   } else {
      playSound(measureContainer.softSound);
   }

   // If we are reaching a new measure, we verify if the note value has changed
   if (measureContainer.currNoteIdx === 0) {
      let newInterval = getCurrentInterval(measureContainer);
      if (newInterval !== measureContainer.currInterval) {
         measureContainer.currInterval = newInterval;
         window.clearInterval(measureContainer.metronomeInterval);
         measureContainer.metronomeInterval = window.setInterval(playNote, measureContainer.currInterval, measureContainer);
      }
   }
}

function playSound(sound) {
   sound.pause();
   sound.currentTime = 0;
   sound.play();
}

// ----------------------------------------- Getters ---------------------------------
function getNbNotes(measureContainer, measureIdx) {
   let noteContainer = measureContainer.querySelectorAll('.note-container')[measureIdx];
   return noteContainer.querySelectorAll('.note').length;
}

function getCurrentNote(measureContainer) {
   let currNoteContainer = measureContainer.querySelectorAll('.note-container')[measureContainer.currMeasureIdx];
   return currNoteContainer.querySelectorAll('.note')[measureContainer.currNoteIdx];
}

function getCurrentInterval(measureContainer) {
   let noteValues = measureContainer.querySelectorAll('.note-value');

   // We verify that we are within bounds
   let idx = measureContainer.currMeasureIdx < noteValues.length ? measureContainer.currMeasureIdx : 0;

   let currNoteValue = noteValues[idx].value;
   let bpm = bpmInput.value;

   return (MS_PER_MIN / bpm) * (QUAVERS_PER_BAR / currNoteValue);
}

function toggleCurrentNote(measureContainer) {
   getCurrentNote(measureContainer).classList.toggle("active");
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

// Auxiliary functions for the creation of a new row -----------------------------------------------
function createNoteContainer(beatsPerBar) {
   let noteContainer = document.createElement('div');
   noteContainer.classList.add('note-container');
   noteContainer.addEventListener('click', function (evt) {
      if (evt.target.classList.contains('note')) {
         evt.target.classList.toggle("strong");
         if (!isPlaying) {
            let measureContainer = evt.target.parentElement.parentElement.parentElement;
            if (evt.target.classList.contains('strong')) {
               playSound(measureContainer.strongSound);
            } else {
               playSound(measureContainer.softSound);
            }
         }
      }
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

function createRemoveButton(measureContainer) {
   let removeButton = document.createElement('button');
   removeButton.classList.add('remove-row-btn');
   removeButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

   removeButton.addEventListener("click", removeRow);

   // If this is the first (and thus only) measure, it cannot be removed
   let nbMeasures = measureContainer.querySelectorAll('.measure').length;
   if (nbMeasures > 1) {
      let firstRemoveBtn = measureContainer.querySelector('.remove-row-btn');
      firstRemoveBtn.disabled = false;
   } else {
      removeButton.disabled = true;
   }

   return removeButton;
}

// Auxiliary functions for the creation of a new measure container --------------------------------------
function createAddRowButton() {
   let addRowButton = document.createElement('button');
   addRowButton.classList.add('add-row-btn', 'add-btn', 'round');
   addRowButton.innerHTML = '<i class="fa-solid fa-plus small"></i>';
   return addRowButton;
}

function createAddColButton() {
   let addColButton = document.createElement('button');
   addColButton.classList.add('add-col-btn', 'add-btn', 'round');
   addColButton.innerHTML = '<i class="fa-solid fa-plus small"></i>';
   return addColButton;
}

function createRemoveColButton() {
   let removeColButton = document.createElement('button');
   removeColButton.classList.add('remove-col-btn', 'round');
   removeColButton.innerHTML = '<i class="fa-solid fa-minus small"></i>';

   let nbCols = mainContainer.querySelectorAll('.measure-container').length;
   if (nbCols === 1) {
      removeColButton.disabled = true;
   }

   return removeColButton;
}

// Event listener for the MeasureContainer buttons ---------------------------------------
function manageMeasureContainerButtons(evt) {
   let btn = evt.target.parentElement;
   if (btn.classList.contains('add-row-btn')) {
      addRow(this);
   } else if (btn.classList.contains('add-col-btn')) {
      addMeasureContainer();
      enableRemoveColButton();
   } else if (btn.classList.contains('remove-col-btn')) {
      removeMeasureContainer(this);
   }
}

function enableRemoveColButton() {
   let firstRemoveBtn = document.querySelector('.remove-col-btn');
   firstRemoveBtn.disabled = false;
}

function disableRemoveColButton() {
   let firstRemoveBtn = document.querySelector('.remove-col-btn');
   firstRemoveBtn.disabled = true;
}

function addRow(measureContainer) {
   let beatsPerBar = 4;
   let noteValue = 4;

   let newRow = document.createElement('div');
   newRow.classList.add('row', 'measure');
   measureContainer.appendChild(newRow);

   let noteContainer = createNoteContainer(beatsPerBar);
   newRow.appendChild(noteContainer);

   let signatureContainer = createSignatureContainer(beatsPerBar, noteValue);
   newRow.appendChild(signatureContainer);

   let removeButton = createRemoveButton(measureContainer);
   newRow.appendChild(removeButton);
}

function addMeasureContainer() {
   let newMeasureContainer = document.createElement('div');
   newMeasureContainer.classList.add('row-container', 'measure-container');
   mainContainer.appendChild(newMeasureContainer);

   let addRowButton = createAddRowButton();
   let addColButton = createAddColButton();
   let removeColButton = createRemoveColButton();

   newMeasureContainer.appendChild(addRowButton);
   newMeasureContainer.appendChild(addColButton);
   newMeasureContainer.appendChild(removeColButton);

   addRow(newMeasureContainer);

   newMeasureContainer.currMeasureIdx = -1;
   newMeasureContainer.currNoteIdx = -1;
   newMeasureContainer.currInterval = 0;
   newMeasureContainer.isPlaying = false;
   newMeasureContainer.metronomeInterval = null;
   newMeasureContainer.softSound = new Audio('./assets/sounds/softSound.mp3');
   newMeasureContainer.strongSound = new Audio('./assets/sounds/strongSound.mp3');

   newMeasureContainer.addEventListener('click', manageMeasureContainerButtons);
}

function removeRow(evt) {
   let rowToRemove = evt.target.parentElement.parentElement;
   let measureContainer = rowToRemove.parentElement;
   console.log(measureContainer);
   let rowList = Array.prototype.slice.call(measureContainer.querySelectorAll('.measure'));
   let idxToRemove = rowList.indexOf(rowToRemove);

   if (idxToRemove === measureContainer.currMeasureIdx) {
      measureContainer.currNoteIdx = -1;
      measureContainer.currMeasureIdx--;
   } else if (idxToRemove < measureContainer.currMeasureIdx) {
      measureContainer.currMeasureIdx--;
   }

   rowToRemove.remove();
   let nbMeasures = measureContainer.querySelectorAll('.measure').length;
   if (nbMeasures === 1) {
      let removeBtn = measureContainer.querySelector('.remove-row-btn');
      removeBtn.disabled = true;
   }
}

function removeMeasureContainer(measureContainer) {
   measureContainer.remove();
   let nbCols = mainContainer.querySelectorAll('.measure-container').length;
   if (nbCols === 1) {
      disableRemoveColButton();
   }
}

playBtn.addEventListener('click', function () {
   let measureContainerList = document.querySelectorAll('.measure-container');
   measureContainerList.forEach(measureContainer => {
      measureContainer.currMeasureIdx = -1;
      measureContainer.currNoteIdx = -1;
      measureContainer.currInterval = 0;
      measureContainer.isPlaying = true;
      playNote(measureContainer);
   });

   if (measureContainerList.length > 1) {
      bpmInput.disabled = true;
   }

   playBtn.disabled = true;
   stopBtn.disabled = false;

   isPlaying = true;
});

stopBtn.addEventListener('click', function () {
   let measureContainerList = document.querySelectorAll('.measure-container');
   measureContainerList.forEach(measureContainer => {
      if (measureContainer.isPlaying) {
         window.clearInterval(measureContainer.metronomeInterval);
         toggleCurrentNote(measureContainer);
      }
   });

   playBtn.disabled = false;
   stopBtn.disabled = true;
   bpmInput.disabled = false;

   isPlaying = false;
})

document.addEventListener("DOMContentLoaded", addMeasureContainer);