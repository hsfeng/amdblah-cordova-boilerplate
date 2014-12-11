(function() {
	'use strict';
	var cordova = require('cordova');

	module.exports = function(grunt) {
		// load all grunt tasks
		require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

		var path = require('path');

		// configurable paths
		var yeomanConfig = {
			app: 'src',
			dist: 'www'
		};

		try {
			yeomanConfig.app = require('./component.json').appPath || yeomanConfig.app;
		} catch (e) {}

		var device = {
			platform: grunt.option('platform') || 'all',
			family: grunt.option('family') || 'default',
			target: grunt.option('target') || 'emulator'
		};

		var rjsOptions = require('./r.build')(yeomanConfig);

		grunt.initConfig({
			yeoman: yeomanConfig,
			jshint: {
				gruntfile: ['Gruntfile.js'],
				options: {
					jshintrc: '.jshintrc'
				},
				client: {
					expand: true,
					cwd: '<%=  yeoman.app %>',
					src: ['js/**/*.js', '!js/libs/vendor/**/*.js']
				},
			},
			watchfiles: {
				all: [
					'<%= yeoman.app %>/{,*/}*.html',
					'<%= yeoman.app %>/js/{,*/,*/}*.js',
					'<%= yeoman.app %>/css/{,*/}*.css',
					'<%= yeoman.app %>/bundle/{,*/}*.json',
					'<%= yeoman.app %>/templates/{,*/}*.html',
					'<%= yeoman.app %>/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
				]
			},
			watch: {
				scripts: {
					files: [
						'<%= yeoman.app %>/js/**/*.js',
						'<%= yeoman.app %>/css/**/*.css'
					],
					tasks: ['jshint']
				},
				liveserve: {
					options: {
						livereload: true,
					},
					files: ['<%=watchfiles.all %>'],
					tasks: ['shell:serveend', 'cordova-prepareserve']
				},
				liveemulate: {
					files: ['<%=watchfiles.all %>'],
					tasks: ['cordova-emulate-end', 'cordova-buildemulate']
				},
				livedevice: {
					files: ['<%=watchfiles.all %>'],
					tasks: ['cordova-buildrun']
				}
			},
			shell: {
				iossimstart: {
					command: 'ios-sim launch platforms/ios/build/Plazine.app --exit' + (
						device.family !== 'default' ? ' --family ' + device.family : ''),
					options: {
						stdout: true
					}
				},
				iossimend: {
					command: 'killall -9 "iPhone Simulator"'
				},
				serveend: {
					command: 'killall -9 "cordova serve"'
				},
				rippleend: {
					command: 'killall -9 "cordova ripple"'
				}
			},
			clean: {
				dist: ['<%= yeoman.dist %>'],
				optimized: {
					expand: true,
					cwd: '<%= yeoman.dist %>',
					src: ['bower_components', 'build.txt', 'js/*.*', '!js/main.js',
						'js/libs/{,*/}*', '!js/libs/vendor/**',
						'js/apps/{,*/}*', '!js/apps/*.js',
						'js/views/{,*/}*', '!js/views/*.js',
						'js/ctls',
						'js/models',
						'templates',
						'css/**/*.less'
					]
				},
				bower: ['<%= yeoman.app %>/bower_components',
					'<%= yeoman.app %>/css/libs/vendor',
					'<%= yeoman.app %>/js/libs/vendor'
				]
			},
			bower: {
				install: {
					options: {
						layout: function(type, component) {
							grunt.log.write('layout type:' + type + ' component:' + component +
								'\n');

							if (type.indexOf('css/') === 0) {
								var types = type.split('/'),
									newType = types[0],
									subType;
								if (types.length < 3) {
									subType = types[1];
									return path.join(newType, 'libs', 'vendor', component, subType);
								}
								subType = types[types.length - 1];
								return path.join(newType, 'libs', 'vendor', subType);
							}

							return path.join(type, 'libs', 'vendor', component);
						},
						targetDir: '<%= yeoman.app %>',
						cleanTargetDir: false,
						cleanBowerDir: false,
						verbose: true
					}
				}
			},
			requirejs: {
				dist: {
					// Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
					options: rjsOptions
				}
			},
			less: {
				production: {
					options: {
						paths: ['<%= yeoman.dist %>/css/libs/bootstrap',
							'<%= yeoman.dist %>/css'
						],
						compress: true,
						yuicompress: true,
						strictImports: true
					},

					files: [{
						// no need for files, the config below should work
						expand: true,
						cwd: '<%= yeoman.dist %>/css',
						src: ['*.less', '!_*.less'],
						ext: '.css',
						dest: '<%= yeoman.dist %>/css'
					}]

				}
			},
			processhtml: {
				options: {
					data: {
						version: '1.0.0.<%= gitinfo.local.branch.current.shortSHA %>',
					}
				},
				dist: {
					files: [{
						expand: true,
						cwd: '<%= yeoman.dist %>',
						src: '*.html',
						dest: '<%= yeoman.dist %>'
					}]
				}
			},
			cssmin: {
				minify: {
					expand: true,
					cwd: '<%= yeoman.dist %>/css/',
					src: ['libs/*/*.css',
						'libs/vendor/*/*.css', '!libs/vendor/**/*.min.css'
					],
					dest: '<%= yeoman.dist %>/css/'
				}
			},
			htmlmin: {
				dist: {
					options: {
						removeComments: true,
						collapseWhitespace: true
							/*removeCommentsFromCDATA: true,
							// https://github.com/yeoman/grunt-usemin/issues/44
							//collapseWhitespace: true,
							collapseBooleanAttributes: true,
							removeAttributeQuotes: true,
							removeRedundantAttributes: true,
							useShortDoctype: true,
							removeEmptyAttributes: true,
							removeOptionalTags: true*/
					},
					files: [{
						expand: true,
						cwd: '<%= yeoman.dist %>',
						src: '**/*.html',
						dest: '<%= yeoman.dist %>'
					}]
				}
			},
			imagemin: {
				dist: {
					files: [{
						expand: true,
						cwd: '<%= yeoman.dist %>',
						src: ['img/**/*.{png,jpg,jpeg}',
							'css/**/*.{png,jpg,jpeg}',
							'res/**/*.{png,jpg,jpeg}'
						],
						dest: '<%= yeoman.dist %>'
					}]
				}
			},
			gitinfo: {
				'local': {
					'branch': {
						'current': {
							'shortSHA': new Date().getTime()
						}
					}
				}
			},
			'json-minify': {
				build: {
					files: '<%=  yeoman.dist %>/**/*.json'
				}
			},
			copy: {
				dev: {
					expand: true,
					cwd: '<%= yeoman.app %>',
					src: '**',
					dest: '<%= yeoman.dist %>/',
				},
			},
		});

		// Cordova Tasks
		grunt.registerTask('cordova-prepare', 'Cordova prepare tasks', function() {
			var done = this.async();

			if (device.platform === 'all') {
				// Prepare all platforms
				cordova.prepare(done);
			} else {
				cordova.prepare(device.platform, done);
			}
		});

		grunt.registerTask('cordova-build', 'Cordova building tasks', function() {
			var done = this.async();

			if (device.platform === 'all') {
				// Build all platforms
				cordova.build(done);
			} else {
				cordova.build(device.platform, done);
			}
		});

		grunt.registerTask('cordova-run', 'Cordova running tasks', function() {
			var done = this.async();

			if (device.platform === 'all') {
				// Build all platforms
				cordova.run();
			} else {
				cordova.run(device.platform);
			}

			done();
		});

		grunt.registerTask('cordova-emulate', 'Cordova emulation tasks', function() {
			var done = this.async();

			if (device.platform === 'all') {
				// Emulate all platforms
				cordova.emulate();
			} else {
				if (device.platform === 'ios') {
					grunt.task.run('shell:iossimstart');
				} else {
					cordova.emulate(device.platform, function() {
						grunt.task.run('cordova-emulate-end');
					});
				}
			}

			done();
		});

		grunt.registerTask('cordova-serve', 'Cordova serve tasks', function() {
			var done = this.async();

			if (device.platform === 'all') {
				// Emulate all platforms
				grunt.fatal('Platform required. Eg. ` --platform=ios`');
			} else {
				cordova.serve(device.platform);
				done();
			}
		});

		grunt.registerTask('cordova-ripple', 'Cordova ripple tasks', function() {
			var done = this.async();

			if (device.platform === 'all') {
				// Emulate all platforms
				grunt.fatal('Platform required. Eg. ` --platform=ios`');
			} else {
				cordova.ripple(device.platform);
				done();
			}
		});

		grunt.registerTask('cordova-emulate-end', 'Cordova emulation tasks',
			function() {
				if (device.platform === 'all' || device.platform === 'ios') {
					grunt.task.run('shell:iossimend');
				}
			});

		grunt.registerTask('cordova-buildemulate', [
			'cordova-build',
			'cordova-emulate'
		]);

		grunt.registerTask('cordova-buildrun', [
			'clean:dist',
			'copy:dev',
			'cordova-build',
			'cordova-run'
		]);

		grunt.registerTask('cordova-releaserun', [
			'default',
			'cordova-build',
			'cordova-run'
		]);

		grunt.registerTask('cordova-prepareserve', [
			'cordova-prepare',
			'cordova-serve'
		]);

		grunt.registerTask('serve', ['cordova-prepareserve', 'watch:liveserve']);
		grunt.registerTask('ripple', ['cordova-prepare', 'cordova-ripple',
			'watch:liveripple'
		]);

		grunt.registerTask('emulate', ['cordova-buildemulate']);
		grunt.registerTask('live-emulate', ['cordova-buildemulate',
			'watch:liveemulate'
		]);

		grunt.registerTask('device', ['cordova-buildrun']);

		grunt.registerTask('release', ['cordova-releaserun']);

		grunt.registerTask('live-device', ['cordova-buildrun', 'watch:livedevice']);

		grunt.registerTask('bower-install', ['clean:bower', 'bower:install']);

		grunt.registerTask('web-build', [
			'requirejs',
			'less:production',
			'clean:optimized',
			/*'gitinfo',*/
			'processhtml:dist',
			'htmlmin:dist',
			'json-minify',
			'cssmin:minify',
			'imagemin'
		]);

		grunt.registerTask('default', [
			'clean:dist',
			'bower-install',
			'jshint',
			/*'test',*/
			'web-build'
		]);
	};
}());
