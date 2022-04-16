const btn = document.querySelector(".btn");
const template = document.querySelector('#template')
const itemContainer = document.querySelectorAll('.item-cont')
const lists = document.querySelectorAll('.list')
// possivel problema com projectid quando adicionar tasks id! Testar:
// const projectid = decodeURI(location.pathname.split("/")[2])
const projectid = decodeURI(location.pathname.split('/').pop());
// const taskid = decodeURI(location.pathname.split('/').pop());
const projectName = document.querySelector('.project-name')
const addDo = document.createElement('p');
const addDoDiv = document.createElement('div');

// modal
const modalSubmit = document.querySelector('.modal-submit')
const modalBtn = document.getElementById("modal-btn")
const modal = document.querySelector(".modal")
const closeBtn = document.querySelector(".close-btn")
const modalCancel = document.querySelector('.modal-cancel')


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
    console.log(event.target.getAttribute("taskid"))
    event.dataTransfer.setData("text", event.target.getAttribute("taskid"))
  }
  
  const dataDrop = (event) => {
    if (event.target.classList.contains('list')) {
      event.preventDefault();
      const data = event.dataTransfer.getData('text');
      console.log(event.target)
      console.log(document.querySelectorAll(`[taskid="${data}"]`))
      event.target.appendChild(document.querySelectorAll(`[taskid="${data}"]`)[0])
  
      console.log(event.target.id)
      fetch('http://localhost:3001/projects/:projectid/tasks', {
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

const loadProjectName = () => {
    fetch('http://localhost:3001/projects')
    .then(data => data.json())
    .then(projects => projects.filter(projectArray => projectArray.id === Number(projectid)))
    .then(project => {
        if(project.length) {
            projectName.textContent = project[0].tittle;
        }
    })
}

const loadTasks = () => {
    clearTasks()
    fetch("http://localhost:3001/projects/" + projectid + "/tasks")
    .then(data => data.json())
    .then(tasks => {   
        if (!tasks.length) {
            fetch('http://localhost:3001/projects')
            .then(data => data.json())
            .then(projects => projects.filter(projectArray => projectArray.id === Number(projectid)))
            .then(project => loadProjectName(project))
            addDo.textContent = "Add"
            lists[0].appendChild(addDoDiv).appendChild(addDo);                        
        } else {
            loadProjectName()        
            tasks.forEach(task => {
                const clone = template.content.cloneNode(true);
                const tittle = clone.querySelector('.item');
                const container = document.querySelector(`#${task.status}`);
                const itemCont = clone.querySelector('.item-cont')
                tittle.textContent = task.task
                itemCont.setAttribute("taskid", task.id)
                itemCont.classList.add(task.importance)
                
                fetch('http://localhost:3001/projects/' + projectid + '/tasks/' + task.id + '/attachments')
                .then(response => response.json())
                .then(data => {
                    if(!data.length) {
                    } else {
                        data.forEach(att => {
                            const addDo2 = document.createElement('div');
                            const addClose = document.createElement('p');
                            addClose.textContent = "Remove"
                            addClose.classList.add('remove-attachment')
                            addDo2.setAttribute('attachmentid', att.id)
                            addDo2.textContent = att.attachment_name
                            addDo2.classList.add('attachment')
                            addDo2.appendChild(addClose)
                            itemCont.appendChild(addDo2)
                        })
                    }
                    const addDo3 = document.createElement("p")
                    addDo3.classList.add("new-attachment")
                    addDo3.textContent = "Add Notes"
                    const addDo4 = document.createElement("p")
                    addDo4.classList = ("remove-task")
                    addDo4.textContent = 'Remove Task';
                    itemCont.appendChild(addDo3)
                    itemCont.appendChild(addDo4)
                })
                container.append(clone)
            })
        }
        const itemContainer = document.querySelectorAll('.item-cont')
        itemContainer.forEach(container => container.addEventListener('dragstart', dragStart))
    })
    .catch(err =>  console.log("failed to fetch projects", err))
}

const addTask = () => {
    const selectedImportance = document.querySelector('input[name="importance"]:checked').value;
    const selectedTittle = document.querySelector('#tittle').value.replaceAll(' ', "-");
    const selectedDeliver = document.querySelector('.deliver-date').value;
    fetch('http://localhost:3001/projects/:projectid/tasks', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify ({
            task: selectedTittle,
            project_id: projectid,
            importance: selectedImportance,
            deliver: selectedDeliver
        })
    })
    .then(task => loadTasks())
    .catch(e => console.log('error adding task'))
    modalCloser()
}

const attachment = (event) => {
    if (event.target.classList.contains('new-attachment')) {
        location.href = location.href + "/tasks/" + event.target.parentElement.getAttribute("taskid")
    } else if (event.target.classList.contains('attachment')) {
        location.href = location.href + "/tasks/" + event.target.parentElement.getAttribute("taskid") + "/attachments/" + event.target.getAttribute('attachmentid')
    } else if (event.target.classList.contains('remove-attachment')) {
        fetch(location.href + "/tasks/" + event.target.parentElement.parentElement.getAttribute("taskid") + "/attachments/" + event.target.parentElement.getAttribute('attachmentid'), {
            method: 'delete'
        })
        .then(data => data.json())
        .then(item => console.log(item))
        loadTasks()
    } else if (event.target.classList.contains('remove-task')) {
        fetch(location.href + "/tasks/" + event.target.parentElement.getAttribute("taskid"), {
            method: 'delete'
        })
        .then(item => loadTasks())
    }
}




window.addEventListener('load', loadTasks)
addDoDiv.addEventListener('click', modalOpenner)
modalBtn.addEventListener('click', modalOpenner)
closeBtn.addEventListener('click', modalCloser)
modalCancel.addEventListener('click', modalCloser)
window.addEventListener('click', modalCloserWindow)
modalSubmit.addEventListener('click', addTask)
lists.forEach(att => att.addEventListener('click', attachment))
lists.forEach(list => list.addEventListener("dragover", (ev)=> ev.preventDefault()))
lists.forEach(list => list.addEventListener("drop", dataDrop))


