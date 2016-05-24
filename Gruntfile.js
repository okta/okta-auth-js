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

    connect: {
      server: {
        options: {
          port: 9696
        }
      }
    },

    shell: {
      lint: {
        command: 'npm run lint'
      },
      AMDJqueryQ: {
        command: 'npm run build:AMDJqueryQ'
      },
      UMDNoDependencies: {
        command: 'npm run build'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('test', ['shell:lint', 'buildAMDWithoutJqueryOrQ', 'connect:server', 'jasmine:phantom']);
  grunt.registerTask('default', ['test', 'buildUMDWithNoDependencies']);

  // Builds an AMD version that requires jQuery and Q
  grunt.registerTask('buildAMDWithoutJqueryOrQ', ['shell:AMDJqueryQ']);

  // Builds a UMD version that has no dependencies
  grunt.registerTask('buildUMDWithNoDependencies', ['shell:UMDNoDependencies']);
};
