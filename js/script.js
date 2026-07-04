// ================================
// JAM DIGITAL REALTIME
// ================================

// Mengambil elemen HTML berdasarkan id
const clockElement = document.getElementById("clock");

// Fungsi untuk memperbarui jam
function updateClock() {

    // Membuat objek tanggal dan waktu saat ini
    const now = new Date();

    // Mengambil jam, menit, dan detik
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // Menambahkan angka 0 di depan jika kurang dari 10
    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    // Menampilkan ke halaman
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;

}

// Menjalankan fungsi sekali saat halaman dibuka
updateClock();

// Memperbarui jam setiap 1 detik
setInterval(updateClock, 1000);

// ================================
// TANGGAL DAN GREETING
// ================================

// Mengambil elemen HTML
const dateElement = document.getElementById("date");
const greetingElement = document.getElementById("greeting");

function updateDateAndGreeting() {

    const now = new Date();

    // ======================
    // Nama Hari
    // ======================

    const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu"
    ];

    // ======================
    // Nama Bulan
    // ======================

    const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"
    ];

    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    dateElement.textContent =
        `${dayName}, ${date} ${month} ${year}`;

    // ======================
    // Greeting
    // ======================

    const hour = now.getHours();

    let greeting = "";

    if (hour < 12) {

        greeting = "Selamat Pagi 🌞";

    } else if (hour < 15) {

        greeting = "Selamat Siang ☀️";

    } else if (hour < 18) {

        greeting = "Selamat Sore 🌤️";

    } else {

        greeting = "Selamat Malam 🌙";

    }

    greetingElement.textContent = `${greeting}, ${username} 👋`;
}
updateDateAndGreeting();

// ================================
// POMODORO TIMER
// ================================

const timerElement = document.getElementById("timer");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

let timeLeft = 25 * 60; // 1500 detik

let timerInterval = null;
function updateTimerDisplay(){

    const minutes = Math.floor(timeLeft / 60);

    const seconds = timeLeft % 60;

    timerElement.textContent =
        `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

}
function startTimer(){

    if(timerInterval){

        return;

    }

    timerInterval = setInterval(function(){

        if(timeLeft > 0){

            timeLeft--;

            updateTimerDisplay();

        }else{

            clearInterval(timerInterval);

            timerInterval = null;

            alert("Pomodoro selesai! 🎉");

        }

    },1000);

}
function stopTimer(){
    clearInterval(timerInterval);
    timerInterval = null;
}
function resetTimer(){
    stopTimer();
    timeLeft = 25 * 60;
    updateTimerDisplay();
}
startBtn.addEventListener("click",startTimer);
stopBtn.addEventListener("click",stopTimer);
resetBtn.addEventListener("click",resetTimer);
updateTimerDisplay();

// ================================
// TO DO LIST
// ================================

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");

let tasks = [];

function renderTasks() {

    taskList.innerHTML = "";

    tasks.forEach((task, index) => {

        const li = document.createElement("li");

        li.innerHTML = `
            <span style="text-decoration:${task.done ? 'line-through' : 'none'}">
                ${task.text}
            </span>

            <button onclick="toggleTask(${index})">
                ${task.done ? "Batal" : "Selesai"}
            </button>

            <button onclick="editTask(${index})">
                Edit
            </button>

            <button onclick="deleteTask(${index})">
                Hapus
            </button>
        `;

        taskList.appendChild(li);

    });

}

function addTask(){

    const text = taskInput.value.trim();

    if(text === ""){

        alert("Masukkan kegiatan!");

        return;

    }
    const isDuplicate = tasks.some(task =>
          task.text.toLowerCase() === text.toLowerCase()
    );

if (isDuplicate) {
    alert("Kegiatan tersebut sudah ada di daftar.");
    return;
}
const duplicate=

tasks.some(task=>

task.text.toLowerCase()

===

text.toLowerCase()

);

if(duplicate){

alert(

"Kegiatan sudah ada."

);

return;

}
    tasks.push({

        text:text,

        done:false

    });

    taskInput.value = "";

    renderTasks();

}

function toggleTask(index){

    tasks[index].done = !tasks[index].done;

    renderTasks();
    saveTasks();

}

function editTask(index){

    const newTask = prompt(

        "Edit kegiatan",

        tasks[index].text

    );

    if(newTask){

        tasks[index].text = newTask.trim();

        renderTasks();
        saveTasks();

    }

}

function deleteTask(index){

    if(confirm("Hapus kegiatan ini?")){

        tasks.splice(index,1);

        renderTasks();
        saveTasks();

    }

}

addTaskBtn.addEventListener(

    "click",

    addTask

);

taskInput.addEventListener(

    "keypress",

    function(event){

        if(event.key==="Enter"){

            addTask();

        }

    }

);

// ================================
// LOCAL STORAGE
// ================================

function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}

function loadTasks(){

    const savedTasks = localStorage.getItem("tasks");

    if(savedTasks){

        tasks = JSON.parse(savedTasks);

        renderTasks();
        saveTasks();
    }

}

loadTasks();

// =========================
// QUICK LINKS
// =========================

const linksContainer =
document.getElementById("linksContainer");

const addLinkBtn =
document.getElementById("addLinkBtn");

let links =
JSON.parse(localStorage.getItem("quickLinks")) || [];
function renderLinks(){

    linksContainer.innerHTML="";

    links.forEach((link,index)=>{

        const div=document.createElement("div");

        div.innerHTML=`

        <a href="${link.url}"
        target="_blank">

        ${link.name}

        </a>

        <button onclick="deleteLink(${index})">

        ❌

        </button>

        `;

        linksContainer.appendChild(div);

    });

}
function addLink(){

    const name=
    prompt("Nama Website");

    if(!name) return;

    const url=
    prompt("URL Website");

    if(!url) return;

    links.push({

        name:name,

        url:url

    });

    saveLinks();

    renderLinks();

}
function saveLinks(){

    localStorage.setItem(

        "quickLinks",

        JSON.stringify(links)

    );

}
function deleteLink(index){

    links.splice(index,1);

    saveLinks();

    renderLinks();

}
addLinkBtn.addEventListener(

"click",

addLink

);
const themeBtn=

document.getElementById("themeBtn");

themeBtn.addEventListener("click",()=>{

document.body.classList.toggle("dark");

});
let username=

localStorage.getItem("username");
if(!username){

username=

prompt("Siapa nama Anda?");

localStorage.setItem(

"username",

username

);

}