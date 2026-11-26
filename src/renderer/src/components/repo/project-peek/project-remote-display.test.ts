import { describe, expect, it } from 'vitest'
import { getProjectRemoteDisplay } from './project-remote-display'

function remote(remoteUrl: string) {
  return {
    gitRemoteIdentity: {
      canonicalKey: 'unused',
      remoteName: 'origin',
      remoteUrl
    }
  }
}

describe('getProjectRemoteDisplay', () => {
  it('keeps the scheme and port of an http forge remote', () => {
    const display = getProjectRemoteDisplay(remote('http://git.example.lan:3500/acme/widgets.git'))
    expect(display).toMatchObject({
      provider: 'other',
      slug: 'acme/widgets',
      host: 'git.example.lan',
      webUrl: 'http://git.example.lan:3500/acme/widgets'
    })
  })

  it('keeps a non-default https port and a nested path', () => {
    expect(
      getProjectRemoteDisplay(remote('https://gitlab.example.com:8929/group/team/repo.git'))
    ).toMatchObject({
      provider: 'gitlab',
      slug: 'group/team/repo',
      webUrl: 'https://gitlab.example.com:8929/group/team/repo'
    })
  })

  it('drops userinfo from the link', () => {
    expect(
      getProjectRemoteDisplay(remote('http://token@git.example.lan:3500/acme/widgets.git'))?.webUrl
    ).toBe('http://git.example.lan:3500/acme/widgets')
  })

  it('still links gitlab.com and ssh remotes over https without a port', () => {
    expect(getProjectRemoteDisplay(remote('https://gitlab.com/group/repo.git'))).toMatchObject({
      provider: 'gitlab',
      host: null,
      slug: 'group/repo',
      webUrl: 'https://gitlab.com/group/repo'
    })
    expect(getProjectRemoteDisplay(remote('git@git.example.lan:acme/widgets.git'))?.webUrl).toBe(
      'https://git.example.lan/acme/widgets'
    )
    expect(
      getProjectRemoteDisplay(remote('ssh://git@git.example.lan:2222/acme/widgets.git'))?.webUrl
    ).toBe('https://git.example.lan/acme/widgets')
  })

  it('keeps GitHub remotes on the GitHub link', () => {
    expect(getProjectRemoteDisplay(remote('https://github.com/acme/widgets.git'))).toMatchObject({
      provider: 'github',
      slug: 'acme/widgets',
      webUrl: 'https://github.com/acme/widgets'
    })
  })
})
