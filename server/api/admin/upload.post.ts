import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado.' })
  }

  const fileItem = formData.find((item) => item.name === 'file' || item.filename)
  if (!fileItem || !fileItem.data) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo inválido.' })
  }

  const client = await serverSupabaseServiceRole(event)

  // Assegurar que o bucket 'candidatos' existe e é público
  const BUCKET_NAME = 'candidatos'
  const { data: buckets } = await client.storage.listBuckets()
  const exists = buckets?.some((b) => b.name === BUCKET_NAME)

  if (!exists) {
    await client.storage.createBucket(BUCKET_NAME, { public: true })
  }

  const fileExt = fileItem.filename?.split('.').pop() || 'png'
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
  const filePath = fileName

  const { error: uploadError } = await client.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileItem.data, {
      contentType: fileItem.type || 'image/png',
      upsert: true,
    })

  if (uploadError) {
    // Se falhar upload no storage (ex: permissões de bucket no supabase), fallback para base64 data URL
    const base64 = fileItem.data.toString('base64')
    const mime = fileItem.type || 'image/png'
    return { url: `data:${mime};base64,${base64}` }
  }

  const { data: publicUrlData } = client.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  return { url: publicUrlData.publicUrl }
})
