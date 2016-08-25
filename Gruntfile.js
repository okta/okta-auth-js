/* globals module */
module.exports = function(grunt) {

  grunt.initConfig({

    jasmine: {
      phantom: {
        options: {
          specs: [
            'target/test/tests.js'
          ],
          outfile: 'test/SpecRunner.html',
          junit: {
            path: 'build2/reports/jasmine'
          },
          keepRunner: true,
          summary: true
        }
      }
    },

    shell: {
      lint: {
        command: 'npm run lint'
      },
      test: {
        command: 'npm run test'
      },
      buildTests: {
        command: 'npm run build:tests'
      },
      // Builds a UMD version that has no dependencies
      UMDNoDependencies: {
        command: 'npm run build'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('test', ['shell:lint', 'shell:buildTests', 'jasmine:phantom']);
};
