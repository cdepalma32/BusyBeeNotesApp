let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

if (window.location.pathname === '/notes') {
  noteForm = document.querySelector('.note-form');
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  clearBtn = document.querySelector('.clear-btn');
  noteList = document.querySelectorAll('.list-container .list-group');
}

const show = (elem) => {
  elem.style.display = 'inline';
};

const hide = (elem) => {
  elem.style.display = 'none';
};

let activeNote = {};

const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

const getNote = (id) => 
  fetch(`/api/notes/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  }); 

const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(note)
  });

const deleteNote = (id) => {
  return fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to delete note');
    }
    return response.json();
  })
  .catch(error => {
    console.error('Error deleting note:', error);
  });
};

const renderActiveNote = () => {
  hide(saveNoteBtn);
  hide(clearBtn);

  if (activeNote.id) {
    show(newNoteBtn);
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    hide(newNoteBtn);
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value
  };
  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

const handleNoteDelete = (e) => {
  e.stopPropagation();

  const note = e.target;
  const dataNote = note.parentElement.getAttribute('data-note');

  if (dataNote) {
    const { note_id } = JSON.parse(dataNote);

    if (activeNote.id === note_id) {
      activeNote = {}; // Clear active note when deleted
    }

    deleteNote(note_id)
      .then(() => {
        getAndRenderNotes();
        renderActiveNote();
      })
      .catch(error => {
        console.error('Error deleting note:', error);
      });
  }
};

const handleNoteView = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const targetElement = e.target.classList.contains('list-item-title') ? e.target : e.target.closest('.list-item-title');
  
  if (targetElement) {
    activeNote = JSON.parse(targetElement.parentElement.dataset.note);
    renderActiveNote();
  }
};

const handleNewNoteView = (e) => {
  activeNote = {};
  show(clearBtn);
  renderActiveNote();
};

const handleRenderBtns = () => {
  show(clearBtn);
  if (!noteTitle.value.trim() && !noteText.value.trim()) {
    hide(clearBtn);
  } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  noteList.forEach((el) => (el.innerHTML = ''));

  let noteListItems = jsonNotes.map(note => {
    return createLi(note);
  });

  if (jsonNotes.length === 0) {
    noteListItems.push(createLi({title: 'No saved Notes'}, false));
  }

  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

const createLi = (note, delBtn = true) => {
  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item');
  liEl.dataset.note = JSON.stringify({ ...note, note_id: note.id }); // added to include id in datea-note attribute

  // liEl.dataset.note = JSON.stringify(note);

  const spanEl = document.createElement('span');
  spanEl.classList.add('list-item-title');
  spanEl.innerText = note.title;
  spanEl.addEventListener('click', handleNoteView);

  liEl.append(spanEl);

  if (delBtn) {
    const delBtnEl = document.createElement('i');
    delBtnEl.classList.add('fas', 'fa-trash-alt', 'float-right', 'text-danger', 'delete-note');
    delBtnEl.addEventListener('click', handleNoteDelete);
    liEl.append(delBtnEl);
  }
  return liEl;
};

const getAndRenderNotes = () => getNotes().then(renderNoteList);

if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  clearBtn.addEventListener('click', renderActiveNote);
  noteForm.addEventListener('input', handleRenderBtns);
}

getAndRenderNotes();
