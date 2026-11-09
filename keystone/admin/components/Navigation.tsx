import {
  getHrefFromList,
  NavContainer,
  NavItem,
  NavList,
  NavFooter,
} from '@keystone-6/core/admin-ui/components'
import type { NavigationProps } from '@keystone-6/core/admin-ui/components'

export function Navigation({ lists }: NavigationProps) {
  return (
    <NavContainer>
      <NavList>
        <NavItem href="/dashboard">Course dashboard</NavItem>
        <NavItem href="/showcase">Public showcase</NavItem>
        {lists.map((list) => (
          <NavItem key={list.key} href={getHrefFromList(list)}>
            {list.label}
          </NavItem>
        ))}
      </NavList>
      <NavFooter>
        <span style={{ color: 'var(--theme-elevation-500)', fontSize: 11 }}>
          Advanced KeystoneJS · Level 7
        </span>
      </NavFooter>
    </NavContainer>
  )
}
