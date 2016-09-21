/*
 * Copyright (C) 2016 Alasdair Mercer, Skelp
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict'

var fs = require('fs')
var glob = require('glob')
var mkdirp = require('mkdirp')
var Oopsy = require('oopsy')
var path = require('path')
var program = require('commander')
var readline = require('readline')

var version = require('../package.json').version

/**
 * A command-line interface for transforming HTML into Markdown.
 *
 * @param {Europa} europa - the {@link Europa} to be used
 * @param {Readable} input - the <code>Readable</code> from which to read the HTML to be transformed if no files or
 * evaluation string is provided
 * @param {Writable} output - the <code>Writable</code> to which the generated Markdown is to be written if no files
 * or output path is provided
 * @public
 * @constructor CLI
 * @extends {Oopsy}
 */
var CLI = Oopsy.extend(function(europa, input, output) {
  /**
   * The {@link Europa} instance for this {@link CLI}.
   *
   * @private
   * @type {Europa}
   */
  this._europa = europa

  /**
   * The input stream for this {@link CLI}.
   *
   * This is used to read the HTML to be transformed if no files or evaluation string is provided.
   *
   * @private
   * @type {Readable}
   */
  this._input = input

  /**
   * The output stream for this {@link CLI}.
   *
   * This is used to write the generated Markdown if no files or output path is provided.
   *
   * @private
   * @type {Writable}
   */
  this._output = output

  /**
   * The command for this {@link CLI}.
   *
   * @private
   * @type {Command}
   */
  this._program = program
    .version(version)
    .usage('europa [options] [file ...]')
    .option('-a, --absolute', 'use absolute URLs for anchors/images')
    .option('-b, --base-uri <uri>', 'base URI for anchors/images')
    .option('-e, --eval <html>', 'evaluate HTML string')
    .option('-i, --inline', 'insert anchor/image URLs inline')
    .option('-o, --output <path>', 'output directory (for files) or file (for eval/stdin)')
}, {

  /**
   * Parses the specified <code>args</code> and determines what is to be transformed into Markdown and where the
   * generated Markdown is to be output.
   *
   * @param {string[]} [args=[]] - the command-line arguments to be parsed
   * @return {void}
   * @public
   */
  parse: function(args) {
    if (args == null) {
      args = []
    }

    this._program.parse(args)

    var files
    var options = this._createTransformationOptions()

    if (this._program.eval) {
      this._readString(this._program.eval, options)
    } else if (this._program.args.length) {
      files = glob.sync(this._program.args, {
        nodir: true,
        nosort: true
      })

      this._readFiles(files, options)
    } else {
      this._readInput(options)
    }
  },

  /**
   * Creates the options to be used for the transformation process based on the parsed command-line arguments.
   *
   * @return {Transformation~Options} The derived options.
   * @private
   */
  _createTransformationOptions: function() {
    var baseUri = this._program.baseUri
    var options = {
      absolute: this._program.absolute,
      inline: this._program.inline
    }

    if (baseUri) {
      options.baseUri = baseUri
    }

    return options
  },

  /**
   * Transforms the specified HTML <code>files</code> into Markdown files based on the <code>options</code> provided.
   * The generated Markdown file will have the same names as the original <code>files</code> except that the file
   * extension will be <code>.md</code>.
   *
   * If a path has been specified via the <code>output</code> command-line option, then the generated Markdown files
   * will all be written to that directory. Otherwise, each file will be written to the same directory as the original
   * file.
   *
   * @param {string[]} files - the HTML files for which Markdown files are to be generated
   * @param {Transformation~Options} options - the options to be used
   * @return {void}
   * @private
   */
  _readFiles: function(files, options) {
    if (!files.length) {
      return
    }

    var file
    var html
    var markdown
    var output = this._program.output && path.normalize(this._program.output)
    var targetDirectory
    var targetFile

    for (var i = 0; i < files.length; i++) {
      file = files[i]
      html = fs.readFileSync(file, CLI.encoding)
      markdown = this._europa.transform(html, options)
      targetDirectory = output || path.dirname(file)
      targetFile = path.join(targetDirectory, path.basename(file, path.extname(file)) + '.md')

      mkdirp.sync(targetDirectory)

      fs.writeFileSync(targetFile, markdown, CLI.encoding)
    }
  },

  /**
   * Transforms the HTML read from the specified input stream into Markdown based on the <code>options</code> provided.
   *
   * If a path has been specified via the <code>output</code> command-line option, then the generated Markdown will be
   * written to that file. Otherwise, it will be written to the specified output stream.
   *
   * @param {Transformation~Options} options - the options to be used
   * @return {void}
   * @private
   */
  _readInput: function(options) {
    var buffer = []
    var reader = readline.createInterface({
      input: this._input,
      output: this._output,
      terminal: false
    })
    var that = this

    reader.on('line', function(line) {
      buffer.push(line)
    })
    reader.on('close', function() {
      if (buffer.length) {
        that._readString(buffer.join('\n'), options)
      }
    })
  },

  /**
   * Transforms the specified <code>html</code> into Markdown based on the <code>options</code> provided.
   *
   * If a path has been specified via the <code>output</code> command-line option, then the generated Markdown will be
   * written to that file. Otherwise, it will be written to the specified output stream.
   *
   * @param {string} html - the HTML to be transformed into Markdown
   * @param {Transformation~Options} options - the options to be used
   * @return {void}
   * @private
   */
  _readString: function(html, options) {
    var markdown = this._europa.transform(html, options)
    var output
    var target

    if (this._program.output) {
      target = path.normalize(this._program.output)
      output = path.dirname(target)

      mkdirp.sync(output)

      fs.writeFileSync(target, markdown, CLI.encoding)
    } else {
      this._output.end(markdown, CLI.encoding)
    }
  }

}, {

  /**
   * The character set encoding to be used to read/write files.
   *
   * @public
   * @static
   * @type {string}
   */
  encoding: 'utf8'

})

Object.defineProperty(CLI.prototype, 'europa', {
  get: function() {
    return this._europa
  }
})

exports.CLI = CLI
