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

var expect = require('chai').expect
var Europa = require('europa-core/lib/europa').Europa
var fs = require('fs')
var glob = require('glob')
var path = require('path')

var europa = require('../lib/index')
var NodeWindowService = require('../lib/service/node-window-service').NodeWindowService

describe('index', function() {
  describe('default', function() {
    var fixture
    var htmlFile
    var htmlFiles = glob.sync('test/fixtures/**.html')

    it('should be an instance of Europa', function() {
      expect(europa).to.be.an.instanceof(Europa)
    })

    it('should be using NodeWindowService', function() {
      expect(europa.windowService).to.be.an.instanceof(NodeWindowService)
    })

    function testTransform() {
      var markdownFile = path.join(path.dirname(htmlFile), fixture) + '.md'
      var html = fs.readFileSync(htmlFile, 'utf8')
      var expected = fs.readFileSync(markdownFile, 'utf8')

      expect(europa.transform(html)).to.equal(expected)
    }

    for (var i = 0; i < htmlFiles.length; i++) {
      htmlFile = htmlFiles[i]
      fixture = path.basename(htmlFile, '.html')

      it('should transform HTML to Markdown for fixture "' + fixture + '"', testTransform)
    }
  })
})
