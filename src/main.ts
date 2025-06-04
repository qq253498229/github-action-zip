import * as core from '@actions/core'
import { debug, getInput, info } from '@actions/core'
import { createWriteStream, readFileSync, statSync } from 'node:fs'
import { basename } from 'node:path'
import archiver from 'archiver'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const files: string = getInput('files')
    debug(`input files:${files}`)
    const fileList = files.split('\n').map((line: string) => line)
    debug(`fileList:${fileList}`)
    for (const string of fileList) {
      const splits = string.trim().split('->')
      const from = splits[0].trim()
      // zip name:1so.zip
      debug(`zip name:${from}`)
      const fList = splits[1].trim()
      const to = fList.split(',').map((s) => s.trim())
      // to:./tests/一搜.app,./tess/1.txt
      debug(`to:${to}`)

      const zipper = new Zipper(from)
      for (const string1 of to) {
        zipper.addFile(string1)
      }
      await zipper.zip()
    }
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
    info(`压缩包:${this.name}`)
    debug(`zipper files:${this.files}`)
    const output = createWriteStream(this.name)
    const archive = archiver('zip', { zlib: { level: 9 } })
    archive.pipe(output)
    for (const file of this.files) {
      info(`添加文件:${file}`)
      const fileStat = statSync(file)
      const subFolderName = basename(file)
      info(`文件名:${subFolderName}`)
      info(`是否是文件夹:${fileStat.isDirectory()}`)
      if (fileStat.isDirectory()) {
        archive.directory(file, subFolderName)
      } else {
        const buf = readFileSync(file)
        archive.append(buf, { name: subFolderName })
      }
    }
    await archive.finalize()
    info('------------')
  }
}
