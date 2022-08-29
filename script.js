// Const and variables declarations

const inputTextFieldEl = document.querySelector('.input-area input');
const addButtonEl = document.querySelector('.input-area #add');

// Functions

function getInputText (inputField) {
  const inputContent = inputField.value
  if (inputContent === '') {
    inputField.focus()
    return null
  }
  inputField.value = ''
  inputField.focus()
  return inputContent
};

function createNewitem (item) {
  if (item === null || item === '') return

  const listItem = document.createElement('li');
  const para = document.createElement('p');
  const span = document.createElement('span');

  para.textContent = item;
  span.textContent = '❌';
  span.classList.add('delete-cross')
  listItem.appendChild(para);
  listItem.appendChild(span);
  return listItem;
};

// Local storage functions

let arrayList = []

function readFromLocal () {
  let tempArr = localStorage.getItem('key');
  if (tempArr === null) return
  tempArr = tempArr.split(',')  
  if (tempArr !== []) {
    arrayList = tempArr;
  }
}

function displayList (arr) {
  const itemsNodeList = document.querySelector('.items ul');
  if (arr !== []) {
    for (let i of arr) {
      if (i === '') return
      itemsNodeList.appendChild(createNewitem(i));
    }
  }
}

function writeLocal (item) {
  if (arrayList[0] === '') {
    arrayList[0] = item;
    localStorage.setItem('key', arrayList)
    return
  }
  arrayList.push(item);
  localStorage.setItem('key', arrayList)
}

function deleteFromLocal (item) {
  if (arrayList.includes(item)) {
    let index = arrayList.indexOf(item);
    arrayList.splice(index, 1);
  }
  localStorage.setItem('key', arrayList)
}

readFromLocal()
displayList(arrayList)

// Event listeners

function addNewItem () {
  const itemsNodeList = document.querySelector('.items ul');
  let inputText = getInputText(inputTextFieldEl);
  if (inputText === '') return
  writeLocal(inputText);
  itemsNodeList.appendChild(createNewitem(inputText));
}


addButtonEl.addEventListener('click', addNewItem);
inputTextFieldEl.addEventListener('keydown', (e) => {
  if (e.keyCode === 13) {
    addNewItem()
  }
})

// event listener to delete items

document.addEventListener('click', (e) => {
  let cross = e.target;
  if (cross.className === 'delete-cross') {
    cross.parentNode.remove()
    let itemToDelete = cross.parentNode.firstChild.textContent;
    deleteFromLocal(itemToDelete)
  }
})