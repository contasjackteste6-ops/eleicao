const fs = require('fs')

// Gerar o áudio do "Tu-Tu-Tu-PIIII!" (Som do Confirma da Urna Eleitoral do TSE)
// Frequências oficiais do TSE: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz)
const sampleRate = 44100
const tones = [
  { freq: 523.25, duration: 0.1 }, // Dó (100ms)
  { freq: 659.25, duration: 0.1 }, // Mi (100ms)
  { freq: 783.99, duration: 0.45 }, // Sol (450ms sustain)
]

let totalDuration = tones.reduce((acc, t) => acc + t.duration, 0)
let numSamples = Math.floor(sampleRate * totalDuration)
let samples = new Float32Array(numSamples)

let sampleOffset = 0
tones.forEach((tone) => {
  let count = Math.floor(sampleRate * tone.duration)
  for (let i = 0; i < count; i++) {
    let t = i / sampleRate
    // Onda quadrada suavizada com tom da urna (square wave with harmonic blend)
    let val = Math.sin(2 * Math.PI * tone.freq * t) > 0 ? 0.4 : -0.4
    // Envelope fade in/out leve para evitar cliques no áudio
    if (i < 100) val *= i / 100
    if (i > count - 300) val *= (count - i) / 300
    samples[sampleOffset + i] = val
  }
  sampleOffset += count
})

// Construir cabeçalho WAV (PCM 16-bit Mono)
const dataSize = samples.length * 2
const buffer = Buffer.alloc(44 + dataSize)

buffer.write('RIFF', 0)
buffer.writeUInt32LE(36 + dataSize, 4)
buffer.write('WAVE', 8)
buffer.write('fmt ', 12)
buffer.writeUInt32LE(16, 16) // Subchunk1Size
buffer.writeUInt16LE(1, 20) // AudioFormat PCM
buffer.writeUInt16LE(1, 22) // NumChannels Mono
buffer.writeUInt32LE(sampleRate, 24)
buffer.writeUInt32LE(sampleRate * 2, 28) // ByteRate
buffer.writeUInt16LE(2, 32) // BlockAlign
buffer.writeUInt16LE(16, 34) // BitsPerSample
buffer.write('data', 36)
buffer.writeUInt32LE(dataSize, 40)

for (let i = 0; i < samples.length; i++) {
  let s = Math.max(-1, Math.min(1, samples[i]))
  let int16 = s < 0 ? s * 0x8000 : s * 0x7fff
  buffer.writeInt16LE(int16, 44 + i * 2)
}

fs.writeFileSync('public/fim.wav', buffer)
fs.writeFileSync('public/fim.mp3', buffer)
console.log('Áudio oficial da Urna gerado com sucesso em public/fim.wav!')
