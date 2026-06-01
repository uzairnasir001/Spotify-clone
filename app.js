let container = document.querySelector(".cards-row");
const prevButton = document.querySelector(".cards-prev");
const nextButton = document.querySelector(".cards-next");
const backButton = document.querySelector(".back-btn");
const playButton = document.querySelector(".play-btn");
const forwardButton = document.querySelector(".forward-btn");
const volumeButton = document.querySelector(".volume-btn");
const volumeBar = document.querySelector(".volume-bar");
const volumeFill = document.querySelector(".volume");
const progressBar = document.querySelector(".progress-bar");
const progressFill = document.querySelector(".progress");
const progressTimes = document.querySelectorAll(".progress-area span");
const CARD_SCROLL_GAP = 16;
const playIconHTML = playButton.innerHTML;
const audio = new Audio();
let currentSong = 0;
let lastVolume = 0.7;

function renderSongs() {
  container.innerHTML = ""; // clear existing UI

  songs.forEach((song, index) => {
    const card = document.createElement("div");
    card.classList.add("song-card");
    card.dataset.index = index;

    card.innerHTML = `
      <div class="card-thumb">
        <div class="poster">
          <img src="${song.cover}" alt="${song.title}" />
        </div>
      </div>

      <div class="song-name">
        ${song.title}
      </div>

      <div class="song-artists">
        ${song.artist}
      </div>
    `;

    container.appendChild(card);
  });
}

function updateNavButtons() {
  const maxScroll = container.scrollWidth - container.clientWidth;
  prevButton.disabled = container.scrollLeft <= 8;
  nextButton.disabled = container.scrollLeft >= maxScroll - 8;
}

function scrollCards(direction) {
  const firstCard = container.querySelector('.song-card');
  if (!firstCard) return;

  const delta = direction === 'next'
    ? firstCard.offsetWidth + CARD_SCROLL_GAP
    : -(firstCard.offsetWidth + CARD_SCROLL_GAP);

  container.scrollBy({ left: delta, behavior: 'smooth' });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateProgress() {
  const current = audio.currentTime || 0;
  const duration = audio.duration || 0;
  const percent = duration ? (current / duration) * 100 : 0;

  progressFill.style.width = `${percent}%`;
  if (progressTimes.length >= 2) {
    progressTimes[0].textContent = formatTime(current);
    progressTimes[1].textContent = duration ? formatTime(duration) : '0:00';
  }
}

function updateVolumeUI() {
  volumeFill.style.width = `${audio.volume * 100}%`;
}

function setPlayState(isPlaying) {
  if (isPlaying) {
    playButton.innerHTML = '❚❚';
    playButton.setAttribute('aria-label', 'Pause');
  } else {
    playButton.innerHTML = playIconHTML;
    playButton.setAttribute('aria-label', 'Play');
  }
}

function playSong(index) {
  currentSong = Number(index);
  if (currentSong < 0) currentSong = songs.length - 1;
  if (currentSong >= songs.length) currentSong = 0;

  const song = songs[currentSong];
  audio.src = song.file;
  audio.play().catch(() => {
    // autoplay may fail; still update UI
  });
  updatePlaybar(song);
  setPlayState(true);
}

function togglePlayPause() {
  if (!audio.src) {
    playSong(currentSong);
    return;
  }

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function nextSong() {
  playSong(currentSong + 1);
}

function previousSong() {
  playSong(currentSong - 1);
}

function seekAudio(event) {
  const rect = progressBar.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
  audio.currentTime = percent * audio.duration;
}

function changeVolume(event) {
  const rect = volumeBar.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
  audio.volume = percent;
  lastVolume = percent;
  audio.muted = false;
  updateVolumeUI();
}

function toggleMute() {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    audio.volume = lastVolume || 0.7;
  } else {
    audio.muted = true;
  }
  updateVolumeUI();
}

prevButton.addEventListener('click', () => scrollCards('prev'));
nextButton.addEventListener('click', () => scrollCards('next'));
container.addEventListener('scroll', updateNavButtons);

backButton.addEventListener('click', (e) => {
  e.preventDefault();
  previousSong();
});

playButton.addEventListener('click', (e) => {
  e.preventDefault();
  togglePlayPause();
});

forwardButton.addEventListener('click', (e) => {
  e.preventDefault();
  nextSong();
});

volumeButton.addEventListener('click', (e) => {
  e.preventDefault();
  toggleMute();
});

progressBar.addEventListener('click', seekAudio);
volumeBar.addEventListener('click', changeVolume);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('durationchange', updateProgress);
audio.addEventListener('play', () => setPlayState(true));
audio.addEventListener('pause', () => setPlayState(false));
audio.addEventListener('ended', nextSong);

audio.volume = lastVolume;
updateVolumeUI();

renderSongs();
updateNavButtons();

container.addEventListener("click", (e) => {
  const card = e.target.closest(".song-card");
  if (!card) return;

  const index = card.dataset.index;
  playSong(index);
});

function updatePlaybar(song) {
  document.querySelector(".song-text h4").textContent = song.title;
  document.querySelector(".song-text p").textContent = song.artist;
  document.querySelector(".song-info img").src = song.cover;
}

