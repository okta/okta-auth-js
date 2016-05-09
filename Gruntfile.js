/* globals module */
module.exports = function(grunt) {

  grunt.initConfig({

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
    },

    shell: {
      AMDJqueryQ: {
        command: 'npm run build:AMDJqueryQ'
      },
      UMDNoDependencies: {
        command: 'npm run build'
      }
    }
  });

  grunt.loadTasks('buildtools/bumpprereleaseversion');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('test', ['jshint', 'buildAMDWithoutJqueryOrQ', 'connect:server', 'jasmine:phantom']);
  grunt.registerTask('default', ['test', 'buildUMDWithNoDependencies']);

  // Builds an AMD version that requires jQuery and Q
  grunt.registerTask('buildAMDWithoutJqueryOrQ', ['shell:AMDJqueryQ']);

  // Builds a UMD version that has no dependencies
  grunt.registerTask('buildUMDWithNoDependencies', ['shell:UMDNoDependencies']);
};
