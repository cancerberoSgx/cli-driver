module.exports = {
    src: [
        './lib/src/',
        './node_modules/ansi-escape-sequences/types/ansi-escape-sequences.d.ts',
        './node_modules/node-pty/typings/node-pty.d.ts'
    ],
    "mode": "file",
    "includeDeclarations": true,
    "tsconfig": "tsconfig.json",
    "out": "../../docs",
    "excludePrivate": true,
    "excludeProtected": true,
    "excludeExternals": true,
    "readme": "../../README.md",
    "name": "cli-driver"
}
