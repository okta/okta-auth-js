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
  });
  grunt.loadNpmTasks('grunt-contrib-jasmine');
};
