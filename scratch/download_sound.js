const https = require('https')
const fs = require('fs')

const urls = [
  'https://cdn.myinstants.com/media/sounds/urna-eletronica-confirma.mp3',
  'https://www.myinstants.com/media/sounds/urna-eletronica-confirma.mp3',
]

function download(urlIndex) {
  if (urlIndex >= urls.length) {
    console.log('All URLs failed')
    return
  }
  const url = urls[urlIndex]
  const file = fs.createWriteStream('public/fim.mp3')

  const options = {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
      Referer: 'https://www.myinstants.com/',
    },
  }

  https
    .get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(urlIndex)
      }
      if (response.statusCode !== 200) {
        console.log(`Failed with status ${response.statusCode}`)
        file.close()
        fs.unlinkSync('public/fim.mp3')
        return download(urlIndex + 1)
      }
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log('Download complete!')
        // copiar para fim.wav também para garantia total
        fs.copyFileSync('public/fim.mp3', 'public/fim.wav')
      })
    })
    .on('error', (err) => {
      fs.unlinkSync('public/fim.mp3')
      download(urlIndex + 1)
    })
}

download(0)
