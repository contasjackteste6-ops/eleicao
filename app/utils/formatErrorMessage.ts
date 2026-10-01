/**
 * Utilitário centralizado para formatação amigável e segura de erros nas páginas administrativas.
 * Mapeia estritamente status HTTP para mensagens claras sem expor detalhes internos, SQL ou stack trace.
 */
export function formatErrorMessage(err: any, defaultMsg = 'Não foi possível carregar os dados. Tente novamente.'): string {
  if (!err) return defaultMsg

  const statusCode = err.statusCode || err.status || err.response?.status

  if (statusCode === 401) {
    return 'Você não está autenticado.'
  }

  if (statusCode === 403) {
    return 'Você não possui permissão administrativa.'
  }

  if (statusCode === 400 || statusCode === 422) {
    const msg = err.statusMessage || err.message || err.data?.message
    if (msg && typeof msg === 'string' && !msg.toLowerCase().includes('pgrst') && !msg.toLowerCase().includes('sql')) {
      return msg
    }
    return 'Requisição inválida. Verifique os dados e tente novamente.'
  }

  if (statusCode >= 500) {
    return 'Não foi possível carregar os dados. Tente novamente.'
  }

  // Fallback seguro se houver statusMessage limpa
  if (err.statusMessage && typeof err.statusMessage === 'string' && !err.statusMessage.toLowerCase().includes('pgrst')) {
    return err.statusMessage
  }

  return defaultMsg
}
