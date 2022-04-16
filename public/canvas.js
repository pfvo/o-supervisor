const myCanvas = document.getElementById('myCanvas')
const ctx = myCanvas.getContext('2d')
const container = document.querySelector('.canvas-container')
const colors = document.querySelectorAll('.color');
const customColor = document.querySelector('.color-custom')
const brushSize = document.querySelector('#brushSize')
const brushInfo = document.querySelector('.brush-info')
const options = document.querySelector(".options")
const clearCanvas = document.querySelector('.clear')
const eraser = document.querySelector('.eraser')
const undo = document.querySelector('.undo')
const uploadBtn = document.querySelector(".upload")
const updateBtn = document.querySelector(".update")
const taskid = decodeURI(location.pathname.split('/').pop())
const img = new Image;

if (location.href.includes('/attachments/')) {
    uploadBtn.style.display = "none";
    updateBtn.style.display = "block";
    fetch(location.href + '/notes')
    .then(dat => dat.json())
    .then(imgdata => {
   
        img.src = `${imgdata[0].attachment}`
    })
    .then(item=>ctx.drawImage(img, 0, 0))
    .catch(e => e)
} else {
    uploadBtn.style.display = "block";
    updateBtn.style.display = "none";
}
console.log(location.href)

let imageArray = [];
let drawing = false;

const defaults = () => {
    myCanvas.height = window.innerHeight;
    myCanvas.width = window.innerWidth
    ctx.lineWidth = "4";
    ctx.lineCap = 'round';
    
}

const changeColorClick = (event) => {
        ctx.strokeStyle = `${event.target.style.backgroundColor}`

}

const changeColorInput = (event) => {
    ctx.strokeStyle = `${event.target.value}`
}

const changeBrushSize = (e) => {
    brushInfo.textContent = `Brush Size: ${e.target.value}px`;
    ctx.lineWidth = e.target.value;
}

// const canvasResize =() => {
//     myCanvas.height = window.innerHeight;
//     myCanvas.width = window.innerWidth
// }

const drawStart = (event) => {
    drawing = true;
    draw(event)
}

const drawEnd = (event) => {
    drawing = false
    ctx.beginPath()
 if (event.type !== 'mouseout')
    imageArray.push(ctx.getImageData(0,0, myCanvas.width, myCanvas.height));
}

const draw = (event) => {
    if(!drawing) return;
    ctx.lineCap = 'round'
    ctx.lineTo(event.clientX, event.clientY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(event.clientX, event.clientY)
}

const canvasClear = () => {
    ctx.fillStyle = myCanvas.style.backgroundColor;
    ctx.clearRect(0,0,myCanvas.width, myCanvas.height)
    ctx.fillRect(0,0,myCanvas.width, myCanvas.height)
    
    if (ctx.strokeStyle === '#a29b79') {
        ctx.strokeStyle = 'black'
    }
}

const selectEraser = () => {
    ctx.strokeStyle = myCanvas.style.backgroundColor;
}

const undoLast = () => {
    imageArray.pop();
    if(imageArray.length < 1) {
        canvasClear()
    } else {
        ctx.putImageData(imageArray[imageArray.length-1], 0, 0)
    }
}


const uploadCanvas = () => {
    fetch('/projects/:projectid/tasks/:tasksid', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            taskid,
            attachment_name: new Date().getTime(),
            attachment: myCanvas.toDataURL(),
        })  
    })
    .then(data => data.json())
    .then(da => {
        let loc = location.href.split('/');
        loc.splice(5,2)
        location.href = loc.join("/")
    })
    .catch(e => console.log('front', e))
}

const updateImage = () => {
    fetch(location.href, {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            attachment: myCanvas.toDataURL()
        })  
    })
    .then(data => data.json())
    .then(item => {
        let loc = location.href.split('/');
        loc.splice(5,4)
        location.href = loc.join("/")
    })
}


// DOWNLOADIMAGE
// const link = document.createElement('a');
// link.download = 'filename.png';
// link.href = myCanvas.toDataURL()
// link.click();

myCanvas.addEventListener('mousedown', drawStart)
myCanvas.addEventListener('mouseup', drawEnd)
myCanvas.addEventListener('mousemove', draw)
myCanvas.addEventListener('mouseout', drawEnd)

window.addEventListener('touchstart', drawStart)
window.addEventListener('touchend', drawEnd)
window.addEventListener('touchmove', draw)
window.addEventListener('touchcancel', drawEnd)

colors.forEach(color => color.addEventListener('click', changeColorClick))
brushSize.addEventListener('input', changeBrushSize)
customColor.addEventListener('input', changeColorInput)
window.addEventListener('load',  defaults)
// window.addEventListener('resize', canvasResize)
clearCanvas.addEventListener('click', canvasClear)
eraser.addEventListener('click', selectEraser)
undo.addEventListener('click', undoLast)
uploadBtn.addEventListener('click', uploadCanvas)
updateBtn.addEventListener('click', updateImage)