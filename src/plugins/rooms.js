import createDebug from 'debug'

const debug = createDebug('miniplug:rooms')

export default function roomsPlugin () {
  const currentRoom = Symbol('Current room')

  return (mp) => {
    mp[currentRoom] = null

    mp.on('roomState', (state) => {
      mp[currentRoom] = mp.wrapRoom(state.meta)
    })

    // Add a handler to process a room property update.
    //
    //  * `eventName` - Plug.dj socket event name for the property.
    //  * `sockProp` - Property name of the new value on the plug.dj socket
    //        event parameter.
    //  * `roomProp` - Property name for the value on the miniplug room object.
    function addUpdateHandler (eventName, sockProp, roomProp) {
      mp.ws.on(eventName, (data, targetSlug) => {
        const user = mp.user(data.u) || mp.wrapUser({ id: data.u })
        const value = data[sockProp]

        debug(eventName, user && user.id, value)

        if (mp[currentRoom] && mp[currentRoom].slug === targetSlug) {
          mp[currentRoom][roomProp] = value
        }

        mp.emit(eventName, value, user)
        mp.emit('roomUpdate', {
          [roomProp]: value
        }, user)
      })
    }

    mp.on('connected', () => {
      addUpdateHandler('roomNameUpdate', 'n', 'name')
      addUpdateHandler('roomDescriptionUpdate', 'd', 'description')
      addUpdateHandler('roomWelcomeUpdate', 'w', 'welcome')
      addUpdateHandler('roomMinChatLevelUpdate', 'm', 'minChatLevel')
    })

    const room = () => mp[currentRoom]

    const getRooms = (query = '', page = 0, limit = 50) =>
      mp.get('rooms', { q: query, page, limit })
        .map(mp.wrapRoom)
    const getFavorites = (query = '', page = 0, limit = 50) =>
      mp.get('rooms/favorites', { q: query, page, limit })
        .map(mp.wrapRoom)
    const createRoom = (name, isPrivate = false) =>
      mp.post('rooms', { name: name, private: isPrivate }).get(0)
    const getMyRooms = () =>
      mp.get('rooms/me').map(mp.wrapRoom)

    const favoriteRoom = (rid) =>
      mp.post('rooms/favorites', { id: rid })
    const unfavoriteRoom = (rid) =>
      mp.del(`rooms/favorites/${rid}`)
    const join = (slug) =>
      mp.post('rooms/join', { slug: slug }).then(getRoomState)
    const getRoomState = () =>
      mp.get('rooms/state').get(0)
        .tap(mp.emit.bind(mp, 'roomState'))

    const updateRoom = (patch) => {
      if (!room()) {
        return Promise.reject(new Error('You are not currently in a room.'))
      }
      // TODO check keys used in `patch`? Only 'name', 'description', 'welcome'
      // and 'minChatLevel' can be updated.
      return mp.post('rooms/update', patch)
    }

    const setRoomWelcome = (welcome) => updateRoom({ welcome })
    const setRoomDescription = (description) => updateRoom({ description })
    const setRoomName = (name) => updateRoom({ name })
    const setRoomMinChatLevel = (minChatLevel) => updateRoom({ minChatLevel })

    const validateRoomName = (name) =>
      mp.get(`rooms/validate/${encodeURIComponent(name)}`)
        .get(0)
        .catch(() => Promise.reject(new Error('Room name unavailable.')))

    Object.assign(mp, {
      // local
      room,
      // remote
      getRooms,
      getFavorites,
      getMyRooms,
      createRoom,
      validateRoomName,
      setRoomWelcome,
      setRoomDescription,
      setRoomName,
      setRoomMinChatLevel,
      // favorites
      favoriteRoom,
      unfavoriteRoom,
      // joining
      join,
      getRoomState
    })
  }
}
