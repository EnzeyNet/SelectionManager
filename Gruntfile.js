module.exports = function (grunt) {

    var matchdep = require('matchdep'); // dependencies from package
	var repoLocation = /(https:\/\/github.com)(.*)/.exec(grunt.file.read('.git/config'))[0];	
	var srcdir = 'src';
	var distdir = 'dist';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        distdir: distdir,
        projectName: 'SelectionManager',
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				runnerPort: 9999,
				browsers: ['Chrome', 'Firefox']
			}
		},
        concat: {
            options: {
                separator: '\n//End of file\n'
            },
            dev: {
                src: [
                    srcdir + '/**/*.js'
                ],
                dest: '<%= distdir %>/<%= projectName %>.js'
            }
        },
        uglify: {
            production: {
                files: {
                    '<%= distdir %>/<%= projectName %>.min.js': [srcdir + '/**/*.js']
                }
            }
        },
		gitclone: {
			'gh-pages': {
				options: {
					branch: 'gh-pages',
					repository: repoLocation,
					directory: 'gh-pages'
				}
			}
		},
        clean: ['<%= distdir %>', 'gh-pages']
    });
    matchdep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('get-dependencies', 'Install js packages listed in bower.json', function() {
		var bower = require('bower');
		var done = this.async();

		bower.commands.install()
		.on('data', function(data){
			grunt.log.write(data);
		})
		.on('error', function(data){
			grunt.log.write(data);
			done(false);
		})
		.on('end', function (data) {
			done();
		});
	});

    grunt.registerTask('all', ['get-dependencies', 'build', 'test']);
    grunt.registerTask('build', ['concat', 'uglify']);
    grunt.registerTask('test', ['karma:unit']);

    grunt.registerTask('build-examples', 'Build gh-pages branch of examples.', function() {
		grunt.task.run('build', 'update-examples', 'update-examples-dist');
	});

    grunt.registerTask('update-examples', function() {
		if (!grunt.file.exists('gh-pages')) {
			grunt.task.run('gitclone:gh-pages');
		}
		grunt.task.run('update-examples-dist');
	});

    grunt.registerTask('update-examples-dist', function() {
		var examplesDist = 'gh-pages/' + distdir + '/';
		grunt.file.mkdir(examplesDist);
		grunt.file.recurse(distdir, function (abspath, rootdir, subdir, filename) {
			grunt.log.error(abspath);
			grunt.file.copy(abspath, examplesDist + filename);
		});
	});

};
