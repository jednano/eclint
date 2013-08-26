module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['lib/**/*.js', 'test/**/*.js'],
        typescript: {
            base: {
                src: ['lib/**/*.ts', 'test/**/*.ts'],
                dest: '',
                options: {
                    module: 'commonjs',
                    target: 'es5'
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-typescript');

    // Default task(s).
    grunt.registerTask('default', ['typescript']);

};
