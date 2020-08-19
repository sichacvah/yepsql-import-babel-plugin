import babelTypes from 'babel-types'
import { BabelHelper } from './BabelHelper'
import { parseString, Parameter, NamedParameter } from 'yepsql'

const isNamed = (param: Parameter) => (typeof param === 'object' && typeof param.name === 'string')
export default function init({ types: t }: { types: typeof babelTypes }): any {
  class BabelYepSQLImport {
    constructor() {
      return {
        visitor: {
          ImportDeclaration: {
            exit(path: any, state: any) {
              const givenPath = path.node.source.value

              let reference = state && state.file && state.file.opts.filename


              if (BabelHelper.shouldBeInlined(givenPath)) {
                if (path.node.specifiers.length > 1) {
                  throw new Error(`Destructuring inlined import is not allowed. Check the import statement for '${givenPath}'`)
                }

                const id = path.node.specifiers[0].local.name
                const content = BabelHelper.getContents(givenPath, reference);
                const queries = parseString(content)
                const objectProperties = Object.keys(queries).map(key => {
                  const query = queries[key]
                  const namedParams = query.params.filter(param => isNamed(param))

                  const args = namedParams.length === 0 ? [t.restElement(t.identifier('rest'))] : [t.identifier('params'), t.restElement(t.identifier('rest'))]
                  return t.objectProperty(
                    t.stringLiteral(key),
                    t.arrowFunctionExpression(
                      query.params.length > 0 ? args : undefined,
                      t.blockStatement([
                        t.variableDeclaration('const', [
                          t.variableDeclarator(
                            t.identifier('positionalParameter'),
                            t.memberExpression(
                              t.callExpression(
                                t.identifier('require'),
                                [
                                  t.stringLiteral('yepsql')
                                ],
                              ),
                              t.identifier('positionalParameter')
                            )
                          )
                        ]),
                        t.variableDeclaration('const', [
                          t.variableDeclarator(
                            t.identifier('Executor'),
                            t.memberExpression(
                              t.callExpression(
                                t.identifier('require'),
                                [
                                  t.stringLiteral('yepsql')
                                ]
                              ),
                              t.identifier('Executor')
                            )
                          )
                        ]),
                        t.returnStatement(t.callExpression(
                          t.memberExpression(t.identifier('Executor'), t.identifier('execute')),
                          [
                            t.objectExpression([
                              t.objectProperty(t.stringLiteral('name'), t.stringLiteral(query.name)),
                              t.objectProperty(t.stringLiteral('docs'), t.stringLiteral(query.docs)),
                              t.objectProperty(t.stringLiteral('operation'), t.stringLiteral(query.operation)),
                              t.objectProperty(t.stringLiteral('queryString'), t.stringLiteral(query.queryString)),
                              t.objectProperty(t.stringLiteral('params'), t.arrayExpression(query.params.map(param => {
                                if (isNamed(param)) return t.objectExpression([t.objectProperty(t.stringLiteral('name'), t.stringLiteral((param as NamedParameter).name))])
                                return t.identifier('positionalParameter')
                              })))
                            ]),
                            t.objectExpression([
                              t.objectProperty(t.stringLiteral('positional'), namedParams.length === query.params.length ? t.arrayExpression() : t.identifier('rest')),
                              t.objectProperty(t.stringLiteral('keyword'), namedParams.length === 0 ? t.objectExpression() : t.identifier('params'))
                            ].filter(i => Boolean(i)))
                          ]
                        ))
                      ])
                    )
                  )
                })

                const objectDefinition = t.objectExpression(objectProperties)
                const variableDeclarator = t.variableDeclarator(t.identifier(id), objectDefinition)
                const variableDeclaration = t.variableDeclaration('const', [variableDeclarator])
                path.replaceWith({
                  ...variableDeclaration,
                  leadingComments: [
                    {
                      type: 'CommentBlock',
                      value: `yepsql-import-babel-plugin ${givenPath}`
                    }
                  ]
                })
              }
            }
          }
        }
      }
    }
  }

  return new BabelYepSQLImport()
}

