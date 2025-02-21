// Get references to DOM elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseIcon = document.getElementById('playPauseIcon');
const songTitleElement = document.getElementById('songTitle');
const songArtistElement = document.getElementById('songArtist');
const songArtwork = document.getElementById('songArtwork');
let isPlaying = false;

// Set the MP3 stream URL as the source for the audio player
audioPlayer.src = 'https://azura.peaksoundsmediagroup.co.uk/listen/demo_station/radio.mp3';

// Define the API URL for now playing data
const nowPlayingUrl = 'https://azura.peaksoundsmediagroup.co.uk/api/nowplaying/4';

// Spotify API Credentials (REPLACE WITH YOUR ACTUAL CREDENTIALS - THIS IS INSECURE, SEE WARNING BELOW)
const spotifyClientId = '54ed4b6f8f0a40dda74c1f58bc480ae7';
const spotifyClientSecret = 'ef1a42032df4427f8281486398b935eb'; // INSECURE: DO NOT USE IN PRODUCTION. Handle on server.

// Function to fetch Spotify album art (INSECURE: SEE WARNING BELOW)
async function fetchSpotifyAlbumArt(artist, title) {
    if (!artist || !title) return null;

    try {
        const accessToken = await getSpotifyAccessToken(); // Get access token (INSECURE)
        if (!accessToken) return null;

        const query = encodeURIComponent(`${artist} ${title}`);
        const searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`; // Use HTTPS

        const response = await fetch(searchUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            console.error("Error fetching Spotify data:", response.status);
            return null;
        }

        const data = await response.json();

        if (data.tracks.items.length > 0) {
            return data.tracks.items[0].album.images[0].url; // Return largest image URL
        } else {
            console.log("No Spotify track found for:", artist, title);
            return null;
        }

    } catch (error) {
        console.error("Error fetching Spotify album art:", error);
        return null;
    }
}

// Function to get a Spotify access token (INSECURE: DO NOT USE IN PRODUCTION)
async function getSpotifyAccessToken() {
    const authString = btoa(`${spotifyClientId}:${spotifyClientSecret}`);

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', { // Use HTTPS
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            console.error("Error getting Spotify access token:", response.status);
            return null;
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error getting Spotify access token:", error);
        return null;
    }
}


// Fetch Now Playing Data from the API
async function fetchNowPlaying() {
    try {
        const response = await fetch(nowPlayingUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            songTitleElement.innerText = `Error: ${response.status}`;
            songArtistElement.innerText = "";
            songArtwork.src = 'default-image.jpg';
            return;
        }

        const jsonData = await response.json();
        console.log("Now Playing Data:", jsonData);

        if (!jsonData || !jsonData.now_playing || !jsonData.now_playing.song) {
            console.error("Invalid JSON structure:", jsonData);
            songTitleElement.innerText = "Invalid now playing data.";
            songArtistElement.innerText = "";
            songArtwork.src = 'default-image.jpg';
            return;
        }

        const song = jsonData.now_playing.song.title || "Unknown Song";
        const artist = jsonData.now_playing.song.artist || "Unknown Artist";
        const artworkUrl = jsonData.now_playing.song.art || 'default-image.jpg';

        songTitleElement.innerText = song;
        songArtistElement.innerText = artist;

        const spotifyArtwork = await fetchSpotifyAlbumArt(artist, song);
        if (spotifyArtwork) {
            songArtwork.src = spotifyArtwork;
        } else {
            songArtwork.src = artworkUrl;
        }

    } catch (error) {
        console.error("Error fetching or parsing now playing data:", error);
        songTitleElement.innerText = "Error loading song title.";
        songArtistElement.innerText = "";
        songArtwork.src = 'default-image.jpg';
    }
}

// Fetch now playing data every 10 seconds
setInterval(fetchNowPlaying, 10000);
fetchNowPlaying();

// ... (Rest of your existing code - togglePlay, volume control, modals, etc.)
// ... (No changes needed in these parts)

// Function to toggle play/pause state
function togglePlay() {
    if (isPlaying) {
        audioPlayer.pause();
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
    } else {
        audioPlayer.play();
        playPauseIcon.classList.remove('fa-play');
        playPauseIcon.classList.add('fa-pause');
    }
    isPlaying = !isPlaying;
}

// Volume control with slider
document.querySelector('.volume-slider').addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value / 100;
});

// Handle request modal
function openModal() {
    document.getElementById('requestModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('requestModal').style.display = 'none';
}

// Detect if the audio player is playing
audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    playPauseIcon.classList.remove('fa-play');
    playPauseIcon.classList.add('fa-pause');
});

audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    playPauseIcon.classList.remove('fa-pause');
    playPauseIcon.classList.add('fa-play');
});
