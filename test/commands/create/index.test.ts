import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('create:index', () => {
  it('runs create:index cmd', async () => {
    const {stdout} = await runCommand('create:index')
    expect(stdout).to.contain('hello world')
  })

  it('runs create:index --name oclif', async () => {
    const {stdout} = await runCommand('create:index --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
