const Generator = require('yeoman-generator')

const shell = require('shelljs')
const path = require('path')

module.exports = class extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.answers = {}
  }
  async prompting () {
    Object.assign(
      this.answers,
      await this.prompt([
        {
          type: 'list',
          name: 'projectType',
          message: 'Select Project Type',
          choices: [
            {
              name: 'Web application with express',
              value: 'webapp'
            },
            {
              name: 'Static HTML pages',
              value: 'static'
            },
            {
              name: 'Import existing project',
              value: 'import'
            }
          ],
          default: 'webapp'
        }
      ])
    )
    return Promise.resolve()
  }


  async promptNewProject () {
    Object.assign(
      this.answers,
      await this.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Enter a project name',
          default: this.appname // Default to current folder name
        },
        {
          type: 'input',
          name: 'projectDescription',
          message: 'Project description',
          default: ''
        }
      ])
    )
    if (this.answers.projectType === 'webapp') {
      Object.assign(
        this.answers,
        await this.prompt([
          {
            type: 'input',
            name: 'publisherId',
            message: 'Enter publisher ID',
            default: 'com.yourname'
          },
          {
            type: 'input',
            name: 'projectId',
            message: 'Enter project ID',
            default: this.answers.projectName.replace(/\s+/gi, '')
          },
          {
            type: 'input',
            name: 'projectVersion',
            message: 'Enter project version',
            default: '1.0.0' // TODO validate
          }
        ])
      )
    }
    Object.assign(
      this.answers,
      await this.prompt([
        {
          type: 'confirm',
          name: 'includeSamples',
          message: 'Include sample objects and scripts?',
          default: true
        },
        {
          type: 'confirm',
          name: 'devtools',
          message: 'Include developer tools?',
          default: true
        },
        {
          type: 'list',
          name: 'language',
          message: 'What language do you prefer?',
          choices: [
            { name: 'JavaScript (no transpiling)', value: 'js' },
            { name: 'TypeScript', value: 'typescript' },
            { name: 'Ecma 7', value: 'ecma7' } 
          ],
          default: 'typescript'
        }
      ])
    )
    return Promise.resolve()
  }

  async write () {
    shell
      .ls('-Ra', path.join(__dirname, 'templates', 'template1'))
      .forEach(file => {
        const inputFile = this.templatePath(
          path.join('template1', file)
        )
        const outputFile = this.destinationPath(file)
        if (shell.test('-d', inputFile)) {
          shell.mkdir('-p', outputFile)
        } else {
          this.fs.copyTpl(inputFile, outputFile, this.answers)
        }
      })
    return Promise.resolve()
  }

}
