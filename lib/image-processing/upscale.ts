import Replicate from 'replicate'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

export async function upscaleImage(imageUrl: string): Promise<string> {
  const output = await replicate.run(
    'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
    {
      input: {
        image: imageUrl,
        scale: 4,
        face_enhance: false,
      },
    }
  )

  if (!output || typeof output !== 'string') {
    throw new Error('Upscale falhou: resposta inválida da API')
  }

  return output
}
