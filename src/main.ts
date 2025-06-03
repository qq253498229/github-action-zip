import * as core from '@actions/core'
import { getInput, info } from '@actions/core'
import { env as processEnv } from 'process'

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
