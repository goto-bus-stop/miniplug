import assign from 'object-assign'
import partial from 'lodash.partial'
import { stringify as stringifyQS } from 'querystring'
import _wrapRoom from '../data/room'

const debug = require('debug')('miniplug:rooms')

export default function rooms() {

  return function (mp) {
    const wrapRoom = partial(_wrapRoom, mp)

    const room = () => mp._room

    const getRooms = (query = '', page = 0, limit = 50) => {
      return mp.get(`rooms?${stringifyQS({ q: query, page, limit })}`)
        .map(wrapRoom)
    }
    const getFavorites = (query = '', page = 0, limit = 50) => {
      return mp.get(`rooms/favorites?${stringifyQS({ q: query, page, limit })}`)
        .map(wrapRoom)
    }
    const createRoom = (name, isPrivate = false) => {
      return mp.post('rooms', { name: name, private: isPrivate }).get(0)
    }
    const favoriteRoom = rid => mp.post('rooms/favorites', { id: rid })
    const unfavoriteRoom = rid => mp.del(`rooms/favorites/${rid}`)
    const join = slug => mp.post('rooms/join', { slug: slug }).then(getRoomState)
    const getRoomState = () => mp.get('rooms/state').get(0)
      .then(wrapRoom)
      .tap(room => mp._room = room)
      .tap(mp.emit.bind(mp, 'roomState'))

    assign(mp, { room // local
               , getRooms, getFavorites, createRoom // remote
               , favoriteRoom, unfavoriteRoom // favorites
               , join, getRoomState // joining
               })
  }

}