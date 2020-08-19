import Plugin from './index'
// @ts-ignore
import * as babel from '@babel/core'

describe('plugin', () => {
  it('transforms the import statement into a variable with the intended content', () => {
    const transformedCode = babel.transform(
      "import queries from '../sql/example.sql'",
      {
        filename: __filename,
        plugins: [Plugin]
      }
    )

    expect(transformedCode?.code).toEqual(`"use strict";

/*yepsql-import-babel-plugin ../sql/example.sql*/
const queries = {
  "publishBlog": (params, ...rest) => {
    const positionalParameter = require("yepsql").positionalParameter;

    const Executor = require("yepsql").Executor;

    return Executor.execute({
      "name": "publishBlog",
      "docs": "",
      "operation": "InsertReturning",
      "queryString": "insert into blogs (\\n  userid,\\n  title,\\n  content,\\n  published\\n)\\nvalues (\\n  :userid,\\n  :title,\\n  :content,\\n  :published,\\n)",
      "params": [{
        "name": "userid"
      }, {
        "name": "title"
      }, {
        "name": "content"
      }, {
        "name": "published"
      }]
    }, {
      "positional": [],
      "keyword": params
    });
  },
  "removeBlog": (params, ...rest) => {
    const positionalParameter = require("yepsql").positionalParameter;

    const Executor = require("yepsql").Executor;

    return Executor.execute({
      "name": "removeBlog",
      "docs": "Remove a blog from the database\\n",
      "operation": "InsertUpdateDelete",
      "queryString": "delete from blogs where blogid = :blogid;",
      "params": [{
        "name": "blogid"
      }]
    }, {
      "positional": [],
      "keyword": params
    });
  },
  "getUserBlogs": (params, ...rest) => {
    const positionalParameter = require("yepsql").positionalParameter;

    const Executor = require("yepsql").Executor;

    return Executor.execute({
      "name": "getUserBlogs",
      "docs": "Get blogs authored by a user.\\n",
      "operation": "Select",
      "queryString": "select title,\\n         published\\n    from blogs\\n   where userid = :userid\\norder by published desc;",
      "params": [{
        "name": "userid"
      }]
    }, {
      "positional": [],
      "keyword": params
    });
  }
};`)
  })
})