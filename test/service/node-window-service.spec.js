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
var os = require('os')
var sinon = require('sinon')
var WindowService = require('europa-core/lib/service/window-service').WindowService

var NodeWindowService = require('../../lib/service/node-window-service').NodeWindowService

describe('service/node-window-service', function() {
  describe('NodeWindowService', function() {
    var windowService

    beforeEach(function() {
      windowService = new NodeWindowService()
    })

    it('should extend from WindowService', function() {
      expect(windowService).to.be.an.instanceof(WindowService)
    })

    describe('.closeWindow', function() {
      it('should close the window', function() {
        var stubWindow = sinon.stub({ close: function() {} })

        windowService.closeWindow(stubWindow)

        expect(stubWindow.close.called).to.be.true
      })
    })

    describe('.getBaseUri', function() {
      var previousWorkingDirectory

      afterEach(function() {
        process.chdir(previousWorkingDirectory)
      })

      beforeEach(function() {
        previousWorkingDirectory = process.cwd()

        process.chdir(os.homedir())
      })

      it('should return file URI for current working directory', function() {
        expect(windowService.getBaseUri(null)).to.equal('file:///' + os.homedir().replace(/\\/g, '/'))
      })
    })

    describe('.getWindow', function() {
      var previousWorkingDirectory
      var window

      afterEach(function() {
        process.chdir(previousWorkingDirectory)

        window.close()
      })

      beforeEach(function() {
        previousWorkingDirectory = process.cwd()

        process.chdir(os.homedir())
      })

      it('should current window', function() {
        window = windowService.getWindow()

        expect(window).not.to.be.null
        expect(window.document).not.to.be.null
        expect(window.document.baseURI).to.equal('file:///' + os.homedir().replace(/\\/g, '/'))
      })
    })

    describe('.isCloseable', function() {
      it('should return true', function() {
        expect(windowService.isCloseable(null)).to.be.true
      })
    })
  })
})
