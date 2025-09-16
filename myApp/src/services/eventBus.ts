import mitt from 'mitt'

type Events = {
  bookmarkChanged: void   // no payload needed
}

export const eventBus = mitt<Events>()
