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

var WindowService = require('europa-core/lib/service/window-service').WindowService
var jsdom = require('jsdom').jsdom

/**
 * A Node-based implementation of {@link WindowService} uses the jsdom library to create a virtual <code>Window</code>
 * object to be used for transforming HTML into Markdown.
 *
 * @public
 * @constructor NodeWindowService
 * @extends {WindowService}
 */
var NodeWindowService = WindowService.extend({

  /**
   * @override
   */
  getBaseUri: function(window) {
    return 'file:///' + process.cwd().replace(/\\/g, '/')
  },

  /**
   * @override
   */
  getWindow: function() {
    return jsdom(null, {
      features: { FetchExternalResources: false },
      url: this.getBaseUri(null)
    }).defaultView
  },

  /**
   * @override
   */
  isCloseable: function(window) {
    return true
  }

})

exports.NodeWindowService = NodeWindowService
