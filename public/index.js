const btn = document.querySelector(".btn");
const template = document.querySelector('#template')
const lists = document.querySelectorAll('.list')
const modalSubmit = document.querySelector('.modal-submit')
const modalBtn = document.getElementById("modal-btn")
const modal = document.querySelector(".modal")
const closeBtn = document.querySelector(".close-btn")
const modalCancel = document.querySelector('.modal-cancel')
// let itemContainer = [];

const modalOpenner = () => {
  modal.style.display = "block"
}

const modalCloserWindow = (e) => {
  if(e.target === modal){
    modal.style.display = "none"
  }
}

const modalCloser = () => {
  modal.style.display = "none"
}

const clearTasks = () => {
    lists.forEach(list => {
        while (list.children.length > 1) {
            list.removeChild(list.lastChild)
        }
    })
}

const dragStart = (event) => {
  console.log(event.target.getAttribute("projectid"))
  event.dataTransfer.setData("text", event.target.getAttribute("projectid"))
}

const dataDrop = (event) => {
  if (event.target.classList.contains('list')) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    console.log(event.target)
    console.log(document.querySelectorAll(`[projectid="${data}"]`))
    event.target.appendChild(document.querySelectorAll(`[projectid="${data}"]`)[0])

    console.log(event.target.id)
    fetch('http://localhost:3001/projects', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: data,
        status: event.target.id 
      })
    })
    .then(data => data.json())
    .then(console.log)
  }
}

const loadIndex = () => {
    clearTasks();
    fetch('http://localhost:3001/projects')
    .then(data => data.json())
    .then(projects => {
        projects.forEach(project => {
            const clone = template.content.cloneNode(true);
            const tittle = clone.querySelector('.item');
            const itemCont = clone.querySelector('.item-cont')
            const container = document.querySelector(`#${project.status}`);
            tittle.textContent = project.tittle
            itemCont.setAttribute("projectid", project.id)
            itemCont.classList.add(project.importance)
            container.append(clone)
        })
        const itemContainer = document.querySelectorAll('.item-cont')
        itemContainer.forEach(container => container.addEventListener('dragstart', dragStart))
    })
    .catch(err =>  console.log("failed to fetch projects", err))
}

const goProjectPage = (event) => {
    if (event.target.classList.contains('item-cont')) {
        location.href = location.href + "projects/" + event.target.getAttribute("projectid")
        
    } else if (event.target.parentElement.classList.contains('item-cont') && event.target.classList.contains('item')) {
      location.href = location.href + "projects/" + event.target.parentElement.getAttribute("projectid")
    } else if (event.target.classList.contains('remove-project')) {
        fetch(location.href + "projects/" + event.target.parentElement.getAttribute("projectid"), {
          method: 'delete'
        })
        .then(response => response.json())
        .then(item => loadIndex());
    }
}

const addProject = () => {
  const selectedImportance = document.querySelector('input[name="importance"]:checked').value;
  const selectedTittle = document.querySelector('#tittle').value.replaceAll(' ', "-");
  const selectedDeliver = document.querySelector('.deliver-date').value;
  fetch('http://localhost:3001/projects', {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      tittle: selectedTittle,
      importance: selectedImportance,
      deliver: selectedDeliver
    })
  })
  .then(time => loadIndex())
  .catch(e => console.log('error on addProject', e))
  modalCloser()
}

window.addEventListener('load', loadIndex)
lists.forEach(list => list.addEventListener("click", goProjectPage))
modalCancel.addEventListener('click' , modalCloser)
closeBtn.addEventListener('click' , modalCloser)
window.addEventListener('click', modalCloserWindow)
modalBtn.addEventListener('click', modalOpenner)
modalSubmit.addEventListener('click', addProject)
lists.forEach(list => list.addEventListener("dragover", (ev)=> ev.preventDefault()))
lists.forEach(list => list.addEventListener("drop", dataDrop))
