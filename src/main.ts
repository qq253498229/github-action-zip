import * as core from '@actions/core'
import { getInput, info } from '@actions/core'
import { env as processEnv } from 'process'
import { createWriteStream, readFileSync, statSync } from 'node:fs'
import { basename } from 'node:path'
import archiver from 'archiver'

type Env = { [key: string]: string | undefined }

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const files: string = getInput('files')
    info(`files:${files}`)
    const fileList = files.split('\n').map((line: string) => line)
    info(`fileList:${fileList}`)
    for (const string of fileList) {
      const splits = string.trim().split('->')
      const from = splits[0].trim()
      // zip name:1so.zip
      info(`zip name:${from}`)
      const fList = splits[1].trim()
      const to = fList.split(',').map((s) => s.trim())
      // to:./tests/一搜.app,./tess/1.txt
      info(`to:${to}`)

      const zipper = new Zipper(from)
      for (const string1 of to) {
        zipper.addFile(string1)
      }
      await zipper.zip()
    }

    const draft: boolean = getInput('draft') === 'true'
    info(`draft:${draft}`)

    const env: Env = processEnv
    const envJson = JSON.stringify(env, null, 2)
    info(`envJson:${envJson}`)

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

class Zipper {
  name: string
  files: string[]

  constructor(name: string) {
    this.name = name
    this.files = []
  }

  addFile(filename: string) {
    this.files.push(filename)
  }

  async zip() {
    info('------------')
    info(`zipper name:${this.name}`)
    info(`zipper files:${this.files}`)
    const output = createWriteStream(this.name)
    const archive = archiver('zip', { zlib: { level: 9 } })
    archive.pipe(output)
    for (const file of this.files) {
      info(`file:${file}`)
      const fileStat = statSync(file)
      const subFolderName = basename(file)
      info(`subFolderName:${subFolderName}`)
      info(`isDirectory:${fileStat.isDirectory()}`)
      if (fileStat.isDirectory()) {
        archive.directory(file, subFolderName)
      } else {
        const buf = readFileSync(file)
        archive.append(buf, { name: subFolderName })
      }
    }
    await archive.finalize()
  }
}
