var packageJson = require('./package.json');

/* globals module */
module.exports = function(grunt) {

  var COPYRIGHT_TEXT = grunt.file.read('lib/copyright.frag');
  var SDK_VERSION_TEXT = '<%= sdkversion %>';

  function escapeRegexText(text) {
    return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
  }

  function removeCopyrights(content) {
    var copyrightRegex = new RegExp(escapeRegexText(COPYRIGHT_TEXT), 'g');
    return content.replace(copyrightRegex, '');
  }

  function addCopyright(content) {
    return COPYRIGHT_TEXT + content;
  }

  function singleCopyright(content, srcpath) {
    if (srcpath.indexOf('copyright.frag') > 0) {
      return content;
    } else {
      return addCopyright(removeCopyrights(content));
    }
  }

  function substituteSdkVersion(content) {
    var sdkVersionRegex = new RegExp(escapeRegexText(SDK_VERSION_TEXT));
    return content.replace(sdkVersionRegex, packageJson.version);
  }

  function processFile(content, srcpath) {
    return substituteSdkVersion(singleCopyright(content, srcpath));
  }

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: '\n\n'
      },
      browser: {
        src: [
          'lib/copyright.frag',
          'lib/browser_start.frag',
          'lib/vendor/polyfills.js',
          'lib/browser_crypto.frag',
          'lib/index.js',
          'lib/browser_end.frag'
        ],
        dest: 'target/OktaAuth.js'
      },
      browserJquery: {
        src: [
          'lib/copyright.frag',
          'lib/browser_jquery_start.frag',
          'lib/vendor/polyfills.js',
          'lib/browser_crypto.frag',
          'lib/index.js',
          'lib/browser_jquery_end.frag'
        ],
        dest: 'target/OktaAuthRequireJquery.js'
      },
      browserRequireReqwest: {
        src: [
          'lib/copyright.frag',
          'lib/browser_reqwest_start.frag',
          'lib/vendor/polyfills.js',
          'lib/browser_crypto.frag',
          'lib/index.js',
          'lib/browser_reqwest_end.frag'
        ],
        dest: 'target/OktaAuthRequireReqwest.js'
      }
    },

    copy: {
      browser: {
        files: [
          {
            src: 'node_modules/q/q.js',
            dest: 'target/q.js'
          },
          {
            src: 'node_modules/almond/almond.js',
            dest: 'target/almond.js'
          },
          {
            src: 'lib/umd_start.frag',
            dest: 'target/umd_start.frag'
          },
          {
            src: 'lib/umd_end.frag',
            dest: 'target/umd_end.frag'
          }
        ]
      },
      reqwest: {
        files: [
          {
            src: 'node_modules/reqwest/reqwest.js',
            dest: 'target/reqwest.js'
          }
        ]
      },
      browserRequireReqwest: {
        files: [
          {
            src: 'target/OktaAuthRequireReqwest.js',
            dest: 'dist/browser/OktaAuthRequireReqwest.js'
          }
        ],
        options: {
          process: processFile
        }
      },
      browserReqwest: {
        files: [
          {
            src: 'target/OktaAuthReqwest.js',
            dest: 'dist/browser/OktaAuthReqwest.min.js'
          }
        ],
        options: {
          process: processFile
        }
      },
      browserRequire: {
        files: [
          {
            src: 'target/OktaAuth.js',
            dest: 'dist/browser/OktaAuth.require.js'
          }
        ],
        options: {
          process: processFile
        }
      },
      browserJquery: {
        files: [
          {
            src: 'target/OktaAuthRequireJquery.js',
            dest: 'dist/browser/OktaAuthRequireJquery.js'
          }
        ],
        options: {
          process: processFile
        }
      }
    },

    rename: {
      OktaAuthRequireReqwest: {
        files: [{
          src: ['target/OktaAuthRequireReqwest.js'],
          dest: 'target/OktaAuth.js'
        }]
      }
    },

    requirejs: {
      options: {
        baseUrl: 'target/',
        include: [
          'OktaAuth'
        ],
        name: 'almond', // assumes a production build using almond
        out: 'dist/browser/OktaAuth.js',
        wrap: {
          startFile: 'target/umd_start.frag',
          endFile: 'target/umd_end.frag'
        }
      },
      dev: {
        options: {
          optimize: 'none'
        }
      },
      compile: {
        options: {
          out: 'dist/browser/OktaAuth.min.js',
          optimize: 'uglify2'
        }
      },
      compileReqwest: {
        options: {
          out: 'target/OktaAuthReqwest.js',
          optimize: 'uglify2'
        }
      }
    },

    jasmine: {
      phantom: {
        options: {
          specs: [
            'test/util/jasmine-extensions.js', // Included here for lodash
            'test/spec/*.js'
          ],
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfigFile: 'test/main.js'
          },
          outfile: 'test/SpecRunner.html',
          junit: {
            path: 'build2/reports/jasmine'
          },
          keepRunner: true,
          summary: true,
          host: 'http://localhost:9696'
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: 'checkstyle',
        reportOutput: 'build2/loginjs-checkstyle-result.xml',
        force: true
      },
      all: [
        'Gruntfile.js',
        'lib/index.js',
        'test/specs/*',
        'test/util/*'
      ]
    },

    connect: {
      server: {
        options: {
          port: 9696
        }
      }
    }
  });

  grunt.loadTasks('buildtools/bumpprereleaseversion');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-rename');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('test', ['jshint', 'buildBrowserRequireJquery', 'connect:server', 'jasmine:phantom']);

  grunt.registerTask('default',
    ['jshint', 'copy:browser',
    'buildBrowserRequireJquery', 'connect:server', 'jasmine:phantom',
    'buildBrowserRequire', 'buildBrowserRequireReqwest',
    'buildBrowserUMD', 'buildBrowserUMDReqwest']);

  grunt.registerTask('buildBrowserRequire', ['concat:browser', 'copy:browserRequire']);
  grunt.registerTask('buildBrowserRequireReqwest', ['concat:browserRequireReqwest', 'copy:browserRequireReqwest']);
  grunt.registerTask('buildBrowserRequireJquery', ['concat:browserJquery', 'copy:browserJquery']);
  grunt.registerTask('buildBrowserUMD', ['buildBrowserRequire', 'requirejs:compile']);
  grunt.registerTask('buildBrowserUMDReqwest',
    ['buildBrowserRequireReqwest',
    'copy:browser', 'copy:reqwest', 'rename:OktaAuthRequireReqwest',
    'requirejs:compileReqwest', 'copy:browserReqwest']);
};
