//artists 
  const shortArtistsList = '{{#each artistsInfoShort}}<li><a href="/artist/{{this.id}}">{{this.name}}</a></li>{{/each}}';
  const longArtistsList = '{{#each artistsInfoLong}}<li><a href="/artist/{{this.id}}">{{this.name}}</a></li>{{/each}}';
  const showAllArtistsButton = document.querySelector('#show-all-artists');
  const showLessArtistsButton = document.querySelector('#show-less-artists')

  showAllArtistsButton.addEventListener('click', () => {
    document.querySelector('#artists-list').innerHTML = longArtistsList;

    showAllArtistsButton.style.display = 'none';
    showLessArtistsButton.style.display = 'block'
  });

  showLessArtistsButton.addEventListener('click', () => {
    document.querySelector('#artists-list').innerHTML = shortArtistsList;

    showAllArtistsButton.style.display = 'block';
    showLessArtistsButton.style.display = 'none'
  })

  //songs 
  const shortSongsList = '{{#each songsInfoShort}}<li><a href="/song/{{this.id}}"><p>{{this.name}}, by {{this.artists}}</p></a></li>{{/each}}';
  const longSongsList = '{{#each songsInfoLong}}<li><a href="/song/{{this.id}}"><p>{{this.name}}, by {{this.artists}}</p></a></li>{{/each}}';
  const showAllSongsButton = document.querySelector('#show-all-songs');
  const showLessSongsButton = document.querySelector('#show-less-songs');

  showAllSongsButton.addEventListener('click', () => {
    document.querySelector('#songs-list').innerHTML = longSongsList;
    showAllSongsButton.style.display = 'none';
    showLessSongsButton.style.display = 'block';
  });

  showLessSongsButton.addEventListener('click', () => {
    document.querySelector('#songs-list').innerHTML = shortSongsList;
    showLessSongsButton.style.display = 'none';
    showAllSongsButton.style.display = 'block';
  });

  // concerts
  const shortConcertsList = '{{#each concertsInfoShort}}<li><a href="/concert/{{this.id}}"><p>{{this.name}} en {{this.city}} - {{this.date}}</p></a></li>{{/each}}';
  const longConcertsList = '{{#each concertsInfoLong}}<li><a href="/concert/{{this.id}}"><p>{{this.name}} en {{this.city}} - {{this.date}}</p></a></li>{{/each}}';
  const showAllConcertsButton = document.querySelector('#show-all-concerts');
  const showLessConcertsButton = document.querySelector('#show-less-concerts');

  showAllConcertsButton.addEventListener('click', () => {
    document.querySelector('#concerts-list').innerHTML = longConcertsList;
    showAllConcertsButton.style.display = 'none';
    showLessConcertsButton.style.display = 'block';
  });

  showLessConcertsButton.addEventListener('click', () => {
    document.querySelector('#concerts-list').innerHTML = shortConcertsList;
    showLessConcertsButton.style.display = 'none';
    showAllConcertsButton.style.display = 'block';
  });