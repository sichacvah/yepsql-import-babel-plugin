import fs from 'fs'
import path from 'path'
// @ts-ignore
import requireResolve from 'require-resolve'

export class BabelHelper {
  static shouldBeInlined(givenPath: string, extension = '.sql') {
    return givenPath.endsWith(extension) 
  }

  static getContents(givenPath: string, reference: string) {
    if (!reference) {
      throw new Error('"reference" argument must be specified');
    }

    const mod = requireResolve(givenPath, path.resolve(reference));

    if (!mod || !mod.src) {
      throw new Error(`Path '${givenPath}' could not be found for '${reference}'`);
    }

    return fs.readFileSync(mod.src).toString();
  }
}