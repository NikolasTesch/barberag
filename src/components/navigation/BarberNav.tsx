'use client'

import { Calendar, Scissors, DollarSign, Clock, Users } from 'lucide-react'
import { SidebarNav, type NavItem } from './SidebarNav'

const navItems: NavItem[] = [
  { label: 'Agenda', href: '/agenda', icon: Calendar },
  { label: 'Atendimento', href: '/atendimento', icon: Scissors },
  { label: 'Comissões', href: '/comissoes', icon: DollarSign },
  { label: 'Disponibilidade', href: '/disponibilidade', icon: Clock },
  { label: 'Clientes', href: '/clientes', icon: Users },
]

export function BarberNav({ user }: { user: { name: string } }) {
  return <SidebarNav user={user} items={navItems} homeHref="/agenda" roleLabel="barbeiro" />
}
