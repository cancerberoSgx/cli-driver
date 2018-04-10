module.exports = {
    src: [
        './src/interfaces.d.ts',
        './src/driver.d.ts',
        './src/index.d.ts',
        './node_modules/ansi-escape-sequences/types/ansi-escape-sequences.d.ts',
        "./node_modules/node-pty/lib/interfaces.d.ts"
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