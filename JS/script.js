// Create a new Audio object to play and control the audio files
let currentSong = new Audio();
let songs;
let currFolder;

//! Convert seconds to a formatted string of minutes and seconds (MM:SS)
function secondsToMinutesSeconds(seconds) {
    // If the input is not a number or less than 0, return "00:00"
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Calculate the number of minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds to always have two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return the formatted time string
    return `${formattedMinutes}:${formattedSeconds}`;
}

//! Asynchronously fetch the list of songs from the server
async function getSongs(folder) {
    currFolder = folder;
    console.log(currFolder);
    // Fetch the song list from the specified URL
    let a = await fetch(`/${folder}/`)
    // Get the response text
    let response = await a.text();

    // console.log(response);

    // Create a temporary div element to parse the HTML response
    let div = document.createElement("div");
    div.innerHTML = response;

    // Get all anchor tags from the parsed HTML
    let as = div.getElementsByTagName("a");


    // Initialize an array to store song file names
    songs = [];

    // Loop through all anchor tags
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        // If the anchor tag's href ends with ".mp3", it's a song file
        if (element.href.endsWith(".mp3")) {
            // Extract the song file name and add it to the songs array
            songs.push(element.href.split(`/${folder}/`)[1]);
        }

    }

    // Show all the songs in the playlist
    let songsUL = document.querySelector(".songList").getElementsByTagName("ul")[0];

    songsUL.innerHTML = "";//It is making the ul empty again after clicking album 
    // Loop through the list of songs and add them to the playlist
    for (const song of songs) {
        songsUL.innerHTML = songsUL.innerHTML +
            `<li>
                <img class="invert" src="img/music.svg" alt="music">
                <div class="info">
                <div class="songName">${song.replaceAll("%20", " ")}</div>
                <div class="songArtist"></div>
                </div>
                <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/playBar.svg" alt="PlayNow">
                </div>     
                </li>`;
    }

    // Attach an event listener to each song in the playlist
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // Get the song name from the clicked element and play it
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs;


}

//! Play the specified music track, with an option to pause
const playMusic = (track, pause = false) => {
    // Set the source of the currentSong object to the specified track
    currentSong.src = `/${currFolder}/` + track;

    // If not pausing, play the song and update the play button to show pause icon
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    // Update the song info display with the current track name
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    // Reset the song time display
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}


async function displayAlbum() {
    let a = await fetch(`./Songs/`);
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    // let folders = []
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("./Songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            // console.log(folder);
            //Get the metadata of the folder
            let a = await fetch(`./Songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
                                fill="none">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>



                        </div>
                        <img src="./Songs/${folder}/cover.jpg" alt="">                       
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // Load the Playlist whenever the card is clicked
    // yaha pe mene jab sirf target liya toh me jaha pe card pe clik kar rha tha wo wo aarha tha aur cuurent se jaha pe bhi me click karu jo event ham listen karrhe ha sirf wo hi aayega
    // Use target when you need to specifically identify the element that triggered the event (e.g., for delegation or event delegation).
    // Use currentTarget when you want to handle events at a higher level (e.g., on a container) and need information about the container itself.
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
}

//! Main function to initialize the playlist and event listeners
async function main() {
    // Get the list of all songs
    await getSongs("./Songs/MIX");

    // Load the first song without playing it
    playMusic(songs[0], true);


    //Display all the albums on the page
    displayAlbum();

    // Attach an event listener to the play/pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            // If the song is paused, play it and update the button to show pause icon
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            // If the song is playing, pause it and update the button to show play icon
            currentSong.pause();
            play.src = "img/playBar.svg";
        }
    });

    // Listen for the timeupdate event to update the seek bar and time display
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Attach an event listener to the seek bar for seeking
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Attach an event listener to the hamburger menu button to show the sidebar
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Attach an event listener to the close button to hide the sidebar
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    //Add an event Listener for next and prev button
    previous.addEventListener("click", () => {
        currentSong.pause();

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }

    })
    next.addEventListener("click", () => {
        currentSong.pause();

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })
    //Add an event to mute
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {

            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })
}
// Call the main function to initialize everything
main();
