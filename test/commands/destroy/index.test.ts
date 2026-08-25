import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('destroy:index', () => {
  it('runs destroy:index cmd', async () => {
    const {stdout} = await runCommand('destroy:index')
    expect(stdout).to.contain('hello world')
  })

  it('runs destroy:index --name oclif', async () => {
    const {stdout} = await runCommand('destroy:index --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
