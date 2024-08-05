let currentsong = new Audio();
let songs = [];
let thumb = [];

// Function to get songs from server
async function getsongs() {
    try {
        let response = await fetch('/api/songs');
        let songList = await response.json();
        songs = songList.map(song => {
            let a = document.createElement('a');
            a.href = `/Songs/${song}`;
            a.innerText = song;
            return a;
        });
        console.log(songs)
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

// Function to get the cover images from server
async function getThumbnails() {
    try {
        let response = await fetch('/api/thumbnails');
        let thumbList = await response.json();
        thumb = thumbList.map(thumbFile => {
            let a = document.createElement('a');
            a.href = `/Thumbnail/${thumbFile}`;
            return a;
        });
    } catch (error) {
        console.error('Error fetching thumbnails:', error);
    }
}

// Function to play the song
async function playsong(songName) {
    let play = document.getElementById('play');
    let songLink = songs.find(element => element.innerText.trim() === songName.trim());

    if (songLink) {
        play.src = "pause-stroke-rounded1.svg";
        currentsong.src = songLink.href;
        currentsong.play();

        let index = songs.indexOf(songLink);
        document.querySelector(".songname").innerHTML = songName.replace('.mp3', '');
        document.querySelector('.songinfo').querySelector('img').src = thumb[index]?.href || '';
    }
}

function convertSecondsToMinutes(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
}

async function main() {
    await getsongs();
    await getThumbnails();

    let play = document.getElementById('play');
    let list = document.getElementsByClassName('list');
    let card = document.getElementsByClassName('card');

    currentsong.src = songs[0]?.href || '';

    for (let index = 0; index < list.length; index++) {
        let songinfo = songs[index]?.innerText.replace('.mp3', '').split('-');
        if (songinfo) {
            list[index].querySelector('.song').innerHTML = songinfo[0];
            list[index].querySelector('.artist').innerHTML = songinfo[1];
            list[index].querySelector('img').src = thumb[index]?.href || '';
        }
    }

    for (let index = 0; index < card.length; index++) {
        let songinfo = songs[index]?.innerText.replace('.mp3', '').split('-');
        if (songinfo) {
            card[index].querySelector('h3').innerHTML = songinfo[0];
            card[index].querySelector('p').innerHTML = songinfo[1];
            card[index].querySelector('img').src = thumb[index]?.href || '';
        }
    }

    document.querySelector(".songstart").innerHTML = "-:--";
    document.querySelector(".songend").innerHTML = "-:--";

    Array.from(document.querySelector('.playlist').getElementsByClassName('list')).forEach(e => {
        e.addEventListener('click', element => {
            let songName = e.querySelector('.song').innerHTML + '- ' + e.querySelector('.artist').innerHTML.trim() + '.mp3';
            playsong(songName);
        });
    });

    Array.from(document.querySelector('.cardContainer').getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', element => {
            let songName = e.querySelector('h3').innerHTML + '- ' + e.querySelector('p').innerHTML.trim() + '.mp3';
            playsong(songName);
        });
    });

    play.addEventListener('click', () => {
        if (currentsong.paused && currentsong.src !== "") {
            for (const currentindex of songs) {
                if (currentsong.src === currentindex.href) {
                    playsong(currentindex.innerText);
                    break;
                }
            }
        } else {
            currentsong.pause();
            play.src = "play-circle-02-stroke-rounded.svg";
        }
    });

    let next = document.getElementById('next');
    next.addEventListener('click', () => {
        let i = 1;
        for (const currentindex of songs) {
            if (i === songs.length) {
                playsong(songs[0]?.innerText || '');
                break;
            }
            if (currentsong.src === currentindex.href) {
                playsong(songs[i]?.innerText || '');
                break;
            }
            i += 1;
        }
    });

    let prev = document.getElementById('prev');
    prev.addEventListener('click', () => {
        for (let index = (songs.length - 1); index > 0; index--) {
            if (currentsong.src === songs[index]?.href) {
                playsong(songs[index - 1]?.innerText || '');
                break;
            }
        }
    });

    currentsong.addEventListener('timeupdate', () => {
        document.querySelector(".songend").innerHTML = `${convertSecondsToMinutes(currentsong.duration)}`;
        document.querySelector(".songstart").innerHTML = `${convertSecondsToMinutes(currentsong.currentTime)}`;
        let circle = document.getElementById("circle");
        circle.style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
        if (currentsong.ended && currentsong.src !== "") {
            let i = 1;
            for (const currentindex of songs) {
                if (i === songs.length) {
                    playsong(songs[1]?.innerText || '');
                    break;
                }
                if (currentsong.src === currentindex.href) {
                    playsong(songs[i]?.innerText || '');
                    break;
                }
                i += 1;
            }
        }
    });

    document.querySelector('.seekbar').addEventListener('click', (e) => {
        let time = e.offsetX / e.target.getBoundingClientRect().width;
        document.getElementById('circle').style.left = time * 100 + "%";
        currentsong.currentTime = currentsong.duration * time;
    });

    document.querySelector('.volume').addEventListener('click', (e) => {
        let vol = document.getElementById('speaker');
        let left = e.offsetX / e.target.getBoundingClientRect().width * 100;
        document.querySelector('#volume').style.left = left + "%";
        if (left >= 70 && left <= 100) {
            vol.src = "volume.svg";
        }
        if (left < 70 && left > 30) {
            vol.src = "speaker.svg";
        }
        if (left <= 30 && left > 0) {
            vol.src = "low.svg";
        }
        if (left === 0) {
            vol.src = "mute.svg";
        }
        currentsong.volume = left / 100;
    });

    document.querySelector('#speaker').addEventListener('click', () => {
        let vol = document.getElementById('speaker');
        if (currentsong.volume > 0) {
            currentsong.volume = 0;
            vol.src = "mute.svg";
            document.querySelector('#volume').style.left = "0%";
        } else {
            currentsong.volume = 1;
            vol.src = "volume.svg";
            document.querySelector('#volume').style.left = "100%";
        }
    });

    document.querySelector('.menu').addEventListener('click', () => {
        document.querySelector('.left').style.left = 0;
    });

    document.querySelector('.collapse').addEventListener('click', () => {
        document.querySelector('.left').style.left = "-125%";
    });
    document.getElementById('login').addEventListener('click',()=>{
        document.querySelector('#profile').classList.remove('show')
    })
    document.getElementById('profile').addEventListener('click',()=>{
        document.querySelector('.user-info').classList.toggle('show')
    })
}

// Call the main function to execute
main();
