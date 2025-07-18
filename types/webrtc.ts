export interface MediaState {
  audio: boolean
  video: boolean
  screenShare: boolean
}

export interface Participant {
  id: string 
  name: string
  email: string
  avatar?: string
  isHost: boolean
  joinedAt: Date
  mediaState: MediaState
}

export interface Message {
  id: number
  text: string
  sender: {
    name: string
    email: string
    avatar?: string
  }
  timestamp: Date
}