import fetch from 'node-fetch'
import { savePlaylistToFirebase, selectANewTheme } from '../firebase'

const getName = async () => {
  try {
    const data = await fetch(`https://random-word-api.herokuapp.com/word?number=${Math.trunc(Math.random() * (4 - 2) + 2)}&swear=0`)
    const text = await data.text()
    const names = JSON.parse(text)
    return names.join(' ')
  } catch (error) {
    console.error(error)
    return 'J. Doe'
  }
}

export const getPlaylists = async (access_token) => {
 const data = await fetch(`https://api.spotify.com/v1/users/e7ermk7v6qi3y0mbqibh5do2k/playlists`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'content-type': 'application/json',
    },
  })
  return data.ok ? data.text().then((text) => JSON.parse(text)) : data
}

export const getPlaylist = async (access_token, playlist_id) => {
  try {
    const data = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'content-type': 'application/json', // this was .json for a second and didn't have issues?
      },
    })
    return data.ok ? data.text().then(text => JSON.parse(text)) : data
  } catch (error) {
    console.error(error)
  }
}

export const makePlaylist = async (access_token, date) => {
  const name = await getName()
  const theme = await selectANewTheme() || 'Test theme'
  try {
    const data = await fetch('https://api.spotify.com/v1/users/e7ermk7v6qi3y0mbqibh5do2k/playlists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        description: theme
      }),
    })
    if (!data.ok) return console.error(data)
    return data.ok && data.text().then(text => JSON.parse(text)).then(data => {
      savePlaylistToFirebase(data.id, data.name, date, theme)
      return { id: data.id, theme }
    })
  } catch (error) {
    console.error('make-playlist-error', error)
  }
}

export const submitToPlaylist = async (access_token, { spotify_playlist_id, submission_uri }) => {
  console.log
  try {
    return await fetch(`https://api.spotify.com/v1/playlists/${spotify_playlist_id}/tracks`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify({uris: [submission_uri]})
    })
  } catch (error) {
    console.error('submit-to-spotify-playlist:', error)
  }
}
