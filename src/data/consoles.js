export const consoles = [
  {
    id: 'switch',
    name: 'Switch',
    fullName: 'Nintendo Switch',
    color: '#e60012',
    gradient: 'linear-gradient(135deg, #ff5a5f 0%, #c4001e 100%)',
    video: '/videos/switch-trailer.mp4?v=1',
  },
  {
    id: 'ps4',
    name: 'PS4',
    color: '#2e6de0',
    gradient: 'linear-gradient(135deg, #5a9dff 0%, #1e4fb4 100%)',
    video: '/videos/ps4-trailer.mp4?v=1',
  },
  {
    id: 'ps3',
    name: 'PS3',
    color: '#4a90d9',
    gradient: 'linear-gradient(135deg, #8fb9ff 0%, #2c5696 100%)',
  },
  {
    id: 'xbox360',
    name: 'Xbox 360',
    color: '#107c10',
    gradient: 'linear-gradient(135deg, #3ecf3e 0%, #0a5a0a 100%)',
  },
]

export const getConsole = (id) => consoles.find((c) => c.id === id)
