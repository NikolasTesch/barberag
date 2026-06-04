'use client'

import { LayoutDashboard, Calendar, Scissors, List, DollarSign, Users, BarChart2, Settings, Star } from 'lucide-react'
import { SidebarNav, type NavItem } from './SidebarNav'

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Agendamentos', href: '/agendamentos-admin', icon: Calendar },
  { label: 'Barbeiros', href: '/barbeiros', icon: Scissors },
  { label: 'Serviços', href: '/servicos', icon: List },
  { label: 'Comissões', href: '/comissoes-admin', icon: DollarSign },
  { label: 'Clientes', href: '/clientes-admin', icon: Users },
  { label: 'Avaliações', href: '/avaliacoes-admin', icon: Star },
  { label: 'Relatórios', href: '/relatorios', icon: BarChart2 },
  { label: 'Configurações', href: '/configuracoes', icon: Settings },
]

export function AdminNav({ user }: { user: { name: string } }) {
  return (
    <SidebarNav user={user} items={navItems} homeHref="/dashboard" roleLabel="dono" subtitle="Gestão" />
  )
}
