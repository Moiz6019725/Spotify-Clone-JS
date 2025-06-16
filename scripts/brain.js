const basePath = "/Spotify-Clone-JS";
let index = 0;
let currentSong = new Audio();
let songs;
let currFolder;

async function fetchSongs(folder) {
    let a = await fetch(`${basePath}/${folder}/`);
    let response = await a.text();
    currFolder = folder;

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUl = document.querySelector(".songsList").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML += `
            <li class="hoverEle">
                <img class="invert" src="${basePath}/svg/music.svg" alt="">
                <div class="Info">
                    <marquee scrollmount="1">${song.replaceAll("%20", " ")}</marquee>
                    <div>Harry</div>
                </div>
                <div class="playNow">
                    <span>Play now</span>
                    <img class="invert" src="${basePath}/svg/pause.svg" alt="">
                </div>
            </li>`;
    }

    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach((ele) => {
        ele.addEventListener("click", (e) => {
            playMusic(ele.getElementsByTagName("div")[0].firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

function convertSecondsToMinutes(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" + minutes : minutes}:${remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds}`;
}

const playMusic = (songUrl, pause = false) => {
    currentSong.src = `${basePath}/${currFolder}/` + songUrl;
    if (!pause) {
        play.src = `${basePath}/svg/play.svg`;
        currentSong.play();
    }
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
    document.querySelector(".songInfo").innerHTML = `${songUrl.replaceAll("%20", " ")}`;
};

async function fetchAlbums() {
    let a = await fetch(`${basePath}/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let cardContainer = document.querySelector(".cardContainer");
    let links = Array.from(div.getElementsByTagName("a")).filter(el => el.href.includes("/songs/"));

    for (let element of links) {
        let folder = element.href.split("/").splice(-2)[0];

        try {
            let res = await fetch(`${basePath}/songs/${folder}/info.json`);
            if (!res.ok) throw new Error("info.json missing");
            let data = await res.json();

            cardContainer.innerHTML += `
                <div data-folder="${data.folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                            <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                        </svg>
                    </div>
                    <img src="${basePath}/songs/${folder}/cover.jpg" alt="">
                    <h3>${data.title}</h3>
                    <p>${data.description}</p>
                </div>`;
        } catch (err) {
            console.warn(`Skipping folder '${folder}': ${err.message}`);
        }
    }

    document.querySelectorAll(".card").forEach(element => {
        element.addEventListener("click", async (e) => {
            songs = await fetchSongs(`songs/${e.currentTarget.dataset.folder}`);
            play.src = `${basePath}/svg/pause.svg`;
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await fetchSongs("songs/ArijitSingh");
    playMusic(songs[0], true);

    await fetchAlbums();

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.cssText = `left:0%`;
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    let play = document.getElementById("play");
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            play.src = `${basePath}/svg/play.svg`;
            currentSong.play();
        } else {
            play.src = `${basePath}/svg/pause.svg`;
            currentSong.pause();
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(Math.floor(currentSong.currentTime))}/${convertSecondsToMinutes(Math.floor(currentSong.duration))}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekBar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (percent * currentSong.duration) / 100;
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.currentSrc.split(`/${currFolder}/`)[1]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.currentSrc.split(`/${currFolder}/`)[1]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    volRange.addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            volRange.value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.10;
            volRange.value = 10;
        }
    });
}

main();
