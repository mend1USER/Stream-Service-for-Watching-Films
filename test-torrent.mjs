import WebTorrent from 'webtorrent'

const client = new WebTorrent()

// Это публичный тестовый торрент от WebTorrent (всегда живой)
const magnet = 'magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-tm.com%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent'
console.log('Adding torrent...')

client.on('error', (err) => {
  console.error('CLIENT ERROR:', err)
})

client.add(magnet, (torrent) => {
  console.log('Callback fired! peers:', torrent.numPeers)

  torrent.on('error', (err) => console.error('TORRENT ERROR:', err))
  torrent.on('warning', (w) => console.warn('WARNING:', w))
  
  torrent.on('metadata', () => {
    console.log('METADATA! Files:', torrent.files.map(f => f.name))
  })

  torrent.on('ready', () => {
    console.log('READY! Files:', torrent.files.map(f => f.name))
  })

  torrent.on('noPeers', (announceType) => {
    console.log('NO PEERS for:', announceType)
  })
})

setInterval(() => {
  if (client.torrents[0]) {
    const t = client.torrents[0]
    console.log(`peers: ${t.numPeers} | ready: ${t.ready} | files: ${t.files.length}`)
  }
}, 5000)