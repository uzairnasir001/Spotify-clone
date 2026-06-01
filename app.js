let container = document.querySelector(".cards-row");

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

renderSongs();


container.addEventListener("click", (e) => {
  const card = e.target.closest(".song-card");

  if (!card) return;

  const index = card.dataset.index;

  playSong(index);
});

const audio = new Audio();
let currentSong = 0;

function playSong(index) {
  currentSong = index;

  const song = songs[index];

  audio.src = song.file;
  audio.play();

  updatePlaybar(song);
}


function updatePlaybar(song) {
  document.querySelector(".song-text h4").textContent = song.title;
  document.querySelector(".song-text p").textContent = song.artist;
  document.querySelector(".song-info img").src = song.cover;
}

