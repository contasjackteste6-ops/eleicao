import type { DashboardChannelDTO, DashboardStatDTO } from '../../shared/types/DashboardDTO'

export function useDashboardMock(): {
  stats: DashboardStatDTO[]
  channels: DashboardChannelDTO[]
} {
  const stats: DashboardStatDTO[] = [
    { label: 'Conversas abertas', value: '128', colorClass: 'text-primary-600 dark:text-primary-300' },
    { label: 'Aguardando resposta', value: '24', colorClass: 'text-warning-600 dark:text-warning-300' },
    { label: 'Resolvidas hoje', value: '89', colorClass: 'text-success-600 dark:text-success-300' },
  ]

  const channels: DashboardChannelDTO[] = [
    {
      id: 'sales-channel',
      name: 'Vendas',
      status: 'Online',
      description: 'WhatsApp Business conectado',
      toneClass: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-200',
    },
    {
      id: 'support-channel',
      name: 'Suporte',
      status: 'Fila alta',
      description: 'Tempo medio de espera em observacao',
      toneClass: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-200',
    },
    {
      id: 'billing-channel',
      name: 'Financeiro',
      status: 'Pausado',
      description: 'Atendimento retomado no proximo turno',
      toneClass: 'bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-200',
    },
  ]

  return {
    stats,
    channels,
  }
}
