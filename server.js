const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express();
const knex = require('knex')({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }
});
    

const initialPath = path.join(__dirname, '/public')
app.use(cors())
app.use(express.json())
app.use(express.static(initialPath))
// MOCK DATABASE
const database = [
    {
        id: "1",
        tittle: 'Project1',
        status: 'do',
        importance: 'low',
        started: new Date(),
        deliver:new Date(01-01-2023)
    },
    {
        id: "2",
        tittle: 'Project2',
        status: 'doing',
        importance: 'medium',
        started: new Date(),
        deliver:new Date(01-02-2023)
    },
    {
        id: "3",
        tittle: 'Project3',
        status: 'done',
        importance: 'high',
        started: new Date(),
        deliver:new Date(01-03-2023)
    },
    {
        id: "4",
        tittle: 'Project4',
        status: 'do',
        importance: 'high',
        started: new Date(),
        deliver:new Date(01-01-2023)
    },
    {
        id: "5",
        tittle: 'Project5',
        status: 'do',
        importance: 'medium',
        started: new Date(),
        deliver:new Date(01-02-2023)
    },
    {
        id: "6",
        tittle: 'Project6',
        status: 'doing',
        importance: 'high',
        started: new Date(),
        deliver:new Date(01-03-2023)
    }
];

const tasksdb = [
    {
        id: "1",
        task: "buy oranges",
        tittle: 'Project1',
        status: 'do',
        importance: 'low',
        started: new Date(),
        deliver:new Date(01-01-2023)
    },
    {
        id: "2",
        task: "buy grapes",
        tittle: 'Project2',
        status: 'doing',
        importance: 'medium',
        started: new Date(),
        deliver:new Date(01-02-2023)
    },
    {
        id: "3",
        task: "buy bananas",
        tittle: 'Project2',
        status: 'done',
        importance: 'high',
        started: new Date(),
        deliver:new Date(01-03-2023)
    }
];


app.get('/', (req, res) => {
    res.sendFile(path.join(initialPath, 'index.html'))
    res.status(400).json('worked')
})

app.get('/projects', (req, res) => {
    // res.json(database)
    knex.select()
    .table('projects')
    .then(data => res.json(data))
    .catch(e => res.json(e, "error getting items for index (serverside)"))
})

app.post('/projects', (req, res) => {
    const {tittle, importance, deliver} = req.body
    knex('projects')
    .returning("*")
    .insert({
        tittle,
        importance,
        deliver: deliver || '01-01-2022',
        started: new Date()
    })
    .then(data => res.json(data))  
    .catch(e => res.status(400).json("error posdting project"))
})

app.put('/projects', (req, res) => {
    const {status, id} = req.body;
    knex('projects')
    .where('id', '=', id)
    .update({
        status,
  })
  .then(res.json('Status Updated'))
  .catch(e => res.status(400).json('Unable to update your project'))
})

app.get('/projects/:projectid', (req, res) => {
    res.sendFile(path.join(initialPath, 'project.html'))
})
app.delete('/projects/:projectid', (req, res) => {
    knex('projects')
    .where('id', req.params.projectid)
    .del()
    .then(data => res.json("Project Removed"))
    .catch(e => res.json(e, "error deleting project"))
})

app.get('/projects/:projectid/tasks', (req, res) => {
    knex.select()
    .table('tasks')
    .where('project_id', req.params.projectid)
    .then(data => res.json(data))
    // .then(items => {
    //     if(!items.length) {
    //         console.log("not length")
    //     } else {
    //         console.log('length')
    //     }
    // })
    .catch(e => res.json(e, "error getting items for index (serverside)"))
})

app.post('/projects/:projectid/tasks', (req,res) => {
    console.log(req.body)
    const {task, importance, deliver, project_id} = req.body;
    knex('tasks')
    .returning("*")
    .insert({
        task,
        importance,
        project_id,
        deliver: deliver || '01-01-2022',
        started: new Date(),
    })
    .then(data => res.json(data))  
    .catch(e => res.status(400).json("error posdting task"))
})

app.put('/projects/:projectid/tasks', (req, res) => {
    const {status, id} = req.body;
    knex('tasks')
    .where('id', '=', id)
    .update({
        status,
  })
  .then(res.json('Status Updated'))
  .catch(e => res.status(400).json('Unable to update your project'))
})

app.get('/projects/:projectid/tasks/:tasksid', (req, res) => {
    res.sendFile(path.join(initialPath, 'canvas.html'))
})

app.post('/projects/:projectid/tasks/:tasksid', (req, res) => {
    const {taskid, attachment_name, attachment} = req.body
    console.log(taskid)
    knex('attachments')
    .returning("*")
    .insert({
        task_id: taskid,
        attachment_name,
        attachment,
        type: "png"
    })
    .then(data => res.json('inserted'))
    .catch(e => console.log('back', e))
})

app.delete('/projects/:projectid/tasks/:tasksid', (req, res) => {
    knex('tasks')
    .where('id', req.params.tasksid)
    .del()
    .then(data => res.json("Removed"))
    .catch(e => res.json(e, "error updating attachment for canvas (serverside)"))
})

app.get('/projects/:projectid/tasks/:tasksid/attachments', (req, res) => {
    console.log(req.params.projectid)
    console.log(req.params.tasksid)
    knex.select()
    .table('attachments')
    .where('task_id', req.params.tasksid)
    .then(data => res.json(data))
    .catch(e => res.json(e, "error getting attachments for index (serverside)"))
})

app.get('/projects/:projectid/tasks/:tasksid/attachments/:attachmentid', (req, res) => {
    res.sendFile(path.join(initialPath, 'canvas.html'))
})

app.get('/projects/:projectid/tasks/:tasksid/attachments/:attachmentid/notes', (req, res) => {
    knex.select()
    .table('attachments')
    .where('id', req.params.attachmentid)
    .then(data => res.json(data))
    .catch(e => res.json(e, "error getting attachment for canvas (serverside)"))
})


app.put('/projects/:projectid/tasks/:tasksid/attachments/:attachmentid', (req, res) => {
    const {attachment} = req.body;
    console.log(req.params.attachmentid)
    console.log(attachment)
    knex('attachments')
    .update({
        attachment
    })
    .where('id', req.params.attachmentid)
    .then(data => res.json("updated"))
    .catch(e => res.json(e, "error updating attachment for canvas (serverside)"))
})

app.delete('/projects/:projectid/tasks/:tasksid/attachments/:attachmentid', (req, res) => {
    knex('attachments')
    .where('id', req.params.attachmentid)
    .del()
    .then(data => res.json("Removed"))
    .catch(e => res.json(e, "error updating attachment for canvas (serverside)"))
})

app.listen(process.env.PORT || 3001, ()=> {
    console.log('listening....')
})