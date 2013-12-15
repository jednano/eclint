module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: tsFiles.map(function(glob) {
            return glob.replace(/\.ts$/, '.js');
        }),
        typescript: {
            base: {
                src: ['lib/**/*.ts', 'test/**/*.ts'],
                dest: '',
                options: {
                    module: 'commonjs',
                    target: 'es5'
                }
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    clearRequireCache: true
                },
                src: ['test/**/*.js']
            }
        },
        watch: {
            ts: {
                files: '**/*.ts',
                tasks: ['test']
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-typescript');

    // Default task(s).
    grunt.registerTask('default', ['test']);
    grunt.registerTask('test', ['build', 'mochaTest']);
    grunt.registerTask('build', ['clean', 'typescript']);

};

var tsFiles = [
    'lib/**/*.ts',
    'test/**/*.ts'
];
