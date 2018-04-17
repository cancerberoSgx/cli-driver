module.exports = {
    src: [
        './lib/src/'
    ],
    'mode': "file",
  "includeDeclarations": true,
  "tsconfig": "tsconfig.json",
  'out': './docs',
  'excludePrivate': true,
  'excludeProtected': true,
  'excludeExternals': true,
  'readme': './README.md',
  'name': 'cli-driver'
}
