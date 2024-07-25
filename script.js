//the song to be played stored in this variable
let currentsong = new Audio()
let songs =[]
let thumb=[]
//function to get songs from server/file
async function getsongs(){
    let lists = await fetch('/songs');
    let response = await lists.text();
    let div=document.createElement('div');
    div.innerHTML=response;
    let as = div.getElementsByTagName('a');    
    //add only those files that are mp3
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element)
        }
    }   
}


//function to get the cover images from server/file
async function getThumbnails(){
    let lists = await fetch('/Thumbnail/');
    let response = await lists.text();
    console.log(response)
    let div=document.createElement('div');
    div.innerHTML=response;
    let as = div.getElementsByTagName('a');
    //add only jpeg files
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".jpeg")) {
            thumb.push(element)
        }
    }
}

//function to play the songs 
async function playsong(songName){
    let play=document.getElementById('play');
    for (let index = 0; index < songs.length; index++) {
        const element = songs[index];
        if(element.innerText.trim()===songName.trim()){
            //changing the pause button
            play.src="pause-stroke-rounded1.svg"
            currentsong.src= element.href
            currentsong.play()
            //setting the player at the bottom to show the name and thumbnail 
            document.querySelector(".songname").innerHTML=songName.replace('.mp3','')
            document.querySelector('.songinfo').querySelector('img').src=thumb[index].href
        }
    }
}

function convertSecondsToMinutes(seconds) {
    // Calculate the number of minutes
    const minutes = Math.floor(seconds / 60);
    // Calculate the remaining seconds
    const remainingSeconds = Math.floor(seconds % 60);

    // Format seconds to always be two digits
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    
    // Return the formatted time
    return `${minutes}:${formattedSeconds}`;
}
async function main(){
    await getsongs();
    await getThumbnails();
    let play=document.getElementById('play');
    let list= document.getElementsByClassName('list')
    let card= document.getElementsByClassName('card')
    currentsong.src=songs[0].href
    //setting the songs on the left bottom 
    for (let index = 0; index < list.length; index++) {
        songinfo=songs[index].innerText.replace('.mp3','').split('-')
        list[index].querySelector('.song').innerHTML=songinfo[0];
        list[index].querySelector('.artist').innerHTML=songinfo[1];
        list[index].querySelector('img').src=thumb[index].href
    }
   //setting Spotify playlist cards
    for (let index = 0; index < card.length; index++) {
        songinfo=songs[index].innerText.replace('.mp3','').split('-')
        card[index].querySelector('h3').innerHTML=songinfo[0];
        card[index].querySelector('p').innerHTML=songinfo[1];
        card[index].querySelector('img').src=thumb[index].href
    }
    //time at bottom
    document.querySelector(".songstart").innerHTML="-\--"
    document.querySelector(".songend").innerHTML="-\--"
    //press and click
    //assigning a event listener to the songs to play when clicked
    Array.from(document.querySelector('.playlist').getElementsByClassName('list')).forEach(e=>{
        e.addEventListener('click',element=>{
            //getting the song name
            songName=e.querySelector('.song').innerHTML+'- '+e.querySelector('.artist').innerHTML.trim();
            songName+='.mp3'
           playsong(songName)
        })  
    })
    //assigning event listenets to card to play when clicked
    Array.from(document.querySelector('.cardContainer').getElementsByClassName('card')).forEach(e=>{
        e.addEventListener('click',element=>{
            //getting the song name
            songName=e.querySelector('h3').innerHTML+'- '+e.querySelector('p').innerHTML.trim()
            songName+='.mp3'
             playsong(songName)
        })  
    })
    //play button in player
    play.addEventListener('click',()=>{
        //play the song when clicked
        if(currentsong.paused && currentsong.src!=""){
            for (const currentindex of songs) {
                if (currentsong.src===currentindex.href) {
                    playsong(currentindex.innerText)
                    break       
                }
            }
        }
        //pause the song if already playing
        else{
            currentsong.pause()
            play.src="play-circle-02-stroke-rounded.svg"
        }
    })
    //next button
    let next = document.getElementById('next');
    next.addEventListener('click',()=>{
        let i=1;//keep track of next song
        for (const currentindex of songs) {
            if(i==songs.length){//if last song go back to first
                playsong(songs[0].innerText)
                break
            }
            if (currentsong.src==currentindex.href) {//if matched play next (i)th song
                playsong(songs[i].innerText)
                break
            }
            i+=1
        }
    });
    //prev button
    let prev = document.getElementById('prev');
    prev.addEventListener('click',()=>{
        for (let index = (songs.length-1); index > 0; index--){
            //play previous song
            if (currentsong.src===songs[index].href) {
                playsong(songs[index-1].innerText)
                break       
            }
            
        }
    });

    currentsong.addEventListener('timeupdate', ()=>{
        //set duration
        document.querySelector(".songend").innerHTML=`${convertSecondsToMinutes(currentsong.duration)}`;
        //set current time
        document.querySelector(".songstart").innerHTML=`${convertSecondsToMinutes(currentsong.currentTime)}`;
        let circle = document.getElementById("circle");
        //set the circle to be at current time
        circle.style.left=(currentsong.currentTime/currentsong.duration)*100+"%";
        if(currentsong.ended && currentsong.src!=""){
            //autoplay next song
            let i=1;
            for (const currentindex of songs) {
                if(i==songs.length){
                    playsong(songs[1].innerText)
                    break
                }
                if (currentsong.src===currentindex.href) {
                     playsong(songs[i].innerText)
                    break       
                }
                i=(i+1)
            }
        }
    });
    //move the circle on click
    document.querySelector('.seekbar').addEventListener('click',(e)=>{
        //move the circle where you click
        let time = e.offsetX/e.target.getBoundingClientRect().width
        document.getElementById('circle').style.left = time*100+"%";
        currentsong.currentTime=currentsong.duration*time
    })
    document.querySelector('.volume').addEventListener('click',(e)=>{
        vol = document.getElementById('speaker')
        let left = e.offsetX/e.target.getBoundingClientRect().width*100
        document.querySelector('#volume').style.left=left+"%"
        console.log(left/100)
        if(left>=70 && left <= 100){
            vol.src = "volume.svg"
        }
        if(left < 70 && left > 30){
            vol.src = "speaker.svg"
        }
        if(left <= 30 && left > 0){
            vol.src = "low.svg"
        }
        if(left==0){
            vol.src="mute.svg"
        }
        currentsong.volume = left/100
    })
    document.querySelector('#speaker').addEventListener('click',()=>{
        vol = document.getElementById('speaker')
        if(currentsong.volume>0){
            currentsong.volume =0
            vol.src="mute.svg"
             document.querySelector('#volume').style.left="0%"
        }
        else{
            currentsong.volume=1
            vol.src="volume.svg"
            document.querySelector('#volume').style.left="100%"
        }
    })
    document.querySelector('.menu').addEventListener('click',()=>{
        document.querySelector('.left').style.left = 0
    })
    document.querySelector('.collapse').addEventListener('click',()=>{
        document.querySelector('.left').style.left = "-125%";
    })
}
//call the main function to execute
main()