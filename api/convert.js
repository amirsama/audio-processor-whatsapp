import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { Readable } from 'stream';
import { Writable } from 'stream';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'فقط متد POST مجاز است' });
  }

  try {
    let inputBuffer;
    if (typeof req.body === 'string') {
      inputBuffer = Buffer.from(req.body, 'base64');
    } else if (req.body && req.body.audioBase64) {
      inputBuffer = Buffer.from(req.body.audioBase64, 'base64');
    } else {
      return res.status(400).json({ error: 'بدنه درخواست: base64 یا { audioBase64 }' });
    }

    const inputStream = new Readable();
    inputStream.push(inputBuffer);
    inputStream.push(null);

    const chunks = [];
    const outputStream = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk);
        cb();
      },
    });

    await new Promise((resolve, reject) => {
      ffmpeg(inputStream)
        .toFormat('ogg')
        .audioCodec('libopus')
        .on('error', reject)
        .on('end', resolve)
        .pipe(outputStream, { end: true });
    });

    const oggBuffer = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'audio/ogg');
    res.setHeader('Content-Length', oggBuffer.length);
    return res.status(200).send(oggBuffer);
  } catch (error) {
    console.error('خطا در تبدیل:', error);
    return res.status(500).json({ error: error.message || 'خطای تبدیل فرمت' });
  }
}
