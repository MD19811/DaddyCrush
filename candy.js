var candies = ["Blue", "Orange", "Green", "Yellow", "Red", "Purple"];
var board = [];
var rows = 9;
var columns = 9;
var score = 0;
var targetScore = 1000;

var currTile;
var otherTile;

var gameActive = true;
var gameInterval;
var startTime;
var timerActive = false;

window.onload = function() {
    initGameSession();
}

function initGameSession() {
    // 1. Setup Random Image
    let randomNum = Math.floor(Math.random() * 200) + 1;
    let imgName = randomNum.toString().padStart(2, '0');
    let imgUrl = `https://md19811.github.io/Manillen/randomM/${imgName}.jpg`;

    const targetImg = document.getElementById("target-image");
    targetImg.style.backgroundImage = `url("${imgUrl}")`;
    targetImg.style.filter = "blur(40px) brightness(0)";

    // 2. Reset Game Stats
    score = 0;
    gameActive = true;
    timerActive = false;
    startTime = null;

    // 3. Reset UI Elements
    document.getElementById("score").innerText = "0";
    document.getElementById("win-message").style.display = "none";
    document.getElementById("reset-btn").style.display = "none";
    document.getElementById("fullscreen-btn").style.display = "none";
    document.getElementById("status-text").innerHTML = 'Score: <span id="score">0</span>';
    displayBestTime();

    // 4. Build Board
    document.getElementById("board").innerHTML = "";
    board = [];
    startGame();

    // 5. Game Loop
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = window.setInterval(function() {
        if (!gameActive) return;
        crushCandy();
        slideCandy();
        generateCandy();
        updateReveal();
    }, 100);
}

function startGame() {
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = r.toString() + "-" + c.toString();
            tile.src = "./images/" + randomCandy() + ".png";

            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("dragenter", dragEnter);
            tile.addEventListener("dragleave", dragLeave);
            tile.addEventListener("drop", dragDrop);
            tile.addEventListener("dragend", dragEnd);

            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }
}

function updateReveal() {
    if (score > 0 && !timerActive) {
        startTime = Date.now();
        timerActive = true;
    }

    let revealPercentage = score / targetScore;
    if (revealPercentage > 1) revealPercentage = 1;

    // Filter Math
    let currentBlur = 40 - (40 * revealPercentage);
    let currentBrightness = revealPercentage;

    const targetImg = document.getElementById("target-image");
    if (targetImg) {
        targetImg.style.filter = `blur(${currentBlur}px) brightness(${currentBrightness})`;
    }

    // Win Logic
    if (score >= targetScore) {
        gameActive = false;
        timerActive = false;
        let timeTaken = Math.floor((Date.now() - startTime) / 1000);
        saveHighScore(timeTaken);

        document.getElementById("win-message").style.display = "block";
        document.getElementById("reset-btn").style.display = "inline-block";
        document.getElementById("fullscreen-btn").style.display = "inline-block";
        document.getElementById("status-text").innerText = `Unlocked in ${timeTaken}s!`;
    }
}

function openFullscreen() {
    const elem = document.getElementById("target-image");
    if (elem.requestFullscreen) { elem.requestFullscreen(); }
    else if (elem.webkitRequestFullscreen) { elem.webkitRequestFullscreen(); }
    else if (elem.msRequestFullscreen) { elem.msRequestFullscreen(); }
}

function saveHighScore(time) {
    let currentBest = localStorage.getItem("candyBestTime");
    if (currentBest === null || time < parseInt(currentBest)) {
        localStorage.setItem("candyBestTime", time);
    }
    displayBestTime();
}

function displayBestTime() {
    let best = localStorage.getItem("candyBestTime");
    document.getElementById("best-time").innerText = best ? best : "--";
}

function resetGame() {
    initGameSession();
}

// --- Drag and Drop / Logic ---

function randomCandy() { return candies[Math.floor(Math.random() * candies.length)]; }
function dragStart() { currTile = this; }
function dragOver(e) { e.preventDefault(); }
function dragEnter(e) { e.preventDefault(); }
function dragLeave() {}
function dragDrop() { otherTile = this; }
function dragEnd() {
    if (currTile.src.includes("blank") || otherTile.src.includes("blank")) return;
    let c1 = currTile.id.split("-").map(Number);
    let c2 = otherTile.id.split("-").map(Number);
    if (Math.abs(c1[0] - c2[0]) + Math.abs(c1[1] - c2[1]) === 1) {
        let t = currTile.src; currTile.src = otherTile.src; otherTile.src = t;
        if (!checkValid()) { let x = currTile.src; currTile.src = otherTile.src; otherTile.src = x; }
    }
}

function crushCandy() {
    crushThree();
    document.getElementById("score").innerText = score;
}

function crushThree() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            if (board[r][c].src === board[r][c+1].src && board[r][c+1].src === board[r][c+2].src && !board[r][c].src.includes("blank")) {
                board[r][c].src = board[r][c+1].src = board[r][c+2].src = "./images/blank.png";
                score += 30;
            }
        }
    }
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            if (board[r][c].src === board[r+1][c].src && board[r+1][c].src === board[r+2][c].src && !board[r][c].src.includes("blank")) {
                board[r][c].src = board[r+1][c].src = board[r+2][c].src = "./images/blank.png";
                score += 30;
            }
        }
    }
}

function checkValid() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            if (board[r][c].src === board[r][c+1].src && board[r][c+1].src === board[r][c+2].src && !board[r][c].src.includes("blank")) return true;
        }
    }
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            if (board[r][c].src === board[r+1][c].src && board[r+1][c].src === board[r+2][c].src && !board[r][c].src.includes("blank")) return true;
        }
    }
    return false;
}

function slideCandy() {
    for (let c = 0; c < columns; c++) {
        let ind = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][c].src.includes("blank")) {
                board[ind][c].src = board[r][c].src;
                ind--;
            }
        }
        for (let r = ind; r >= 0; r--) board[r][c].src = "./images/blank.png";
    }
}

function generateCandy() {
    for (let c = 0; c < columns; c++) {
        if (board[0][c].src.includes("blank")) board[0][c].src = "./images/" + randomCandy() + ".png";
    }
}
