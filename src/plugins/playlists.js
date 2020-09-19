import { getId, getIds, partial } from '../util.js'

export default function playlistsPlugin () {
  return (mp) => {
    mp.on('connected', () => {
      mp.ws.on('playlistCycle', (id) => {
        mp.emit('playlistCycle', id)
      })
    })

    Object.assign(mp, {
      getPlaylists: () =>
        mp.get('playlists').map(mp.wrapPlaylist),
      getActivePlaylist: () =>
        mp.get('playlists')
          .filter((playlist) => playlist.active)
          .get(0).then(mp.wrapPlaylist),
      createPlaylist: (name/*, initialMedia */) =>
        mp.post('playlists', { name: name }),
      deletePlaylist: (pid) =>
        mp.del(`playlists/${pid}`),
      activatePlaylist: (pid) =>
        mp.put(`playlists/${pid}/activate`),
      renamePlaylist: (pid, name) =>
        mp.put(`playlists/${pid}/rename`, { name: name }),
      shufflePlaylist: (pid) =>
        mp.put(`playlists/${pid}/shuffle`),

      getMedia: (pid) =>
        mp.get(`playlists/${pid}/media`).map(partial(mp.wrapMedia, pid)),
      updateMedia: (pid, mid, author, title) =>
        mp.put(`playlists/${pid}/media/update`, {
          id: mid,
          author: author,
          title: title
        }).get(0),
      moveMedia: (pid, mids, before) =>
        mp.put(`playlists/${pid}/media/move`, {
          ids: getIds(mids),
          beforeID: getId(before)
        }),
      insertMedia: (pid, media, append = true) =>
        mp.post(`playlists/${pid}/media/insert`, {
          media: media,
          append: append
        }),
      deleteMedia: (pid, mids) =>
        mp.post(`playlists/${pid}/media/delete`, {
          ids: getIds(mids)
        })
    })
  }
}
