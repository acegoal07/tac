import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('destroy:all', () => {
  it('runs destroy:all cmd', async () => {
    const {stdout} = await runCommand('destroy:all')
    expect(stdout).to.contain('hello world')
  })

  it('runs destroy:all --name oclif', async () => {
    const {stdout} = await runCommand('destroy:all --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
