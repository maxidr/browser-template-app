'use strict';

var conf = {
	in: './src',
	out: './dist'
};
conf.indexPage = './index.html';
conf.bundleJsFile = 'bundle.js';

var gulp = require('gulp');
var util = require('gulp-util');

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('js:browserify', browserifyTask()); // so you can run `gulp js` to build the file
gulp.task('html:moveIndex', moveIndexPage);
gulp.task('watch', ['sync-browser', 'build'], watchFileChanges);
gulp.task('sync-browser', syncBrowser);
gulp.task('build', [ 'html:moveIndex', 'js:browserify' ]);



function syncBrowser(){
	var browserSync = require('browser-sync');
	browserSync({
		server: { baseDir: conf.out },
		files: [ conf.out + '/**',  '!' + conf.out + '/**.map' ]
		//injectChanges: true
	});
}

function watchFileChanges(){
	//gulp.watch(conf.src + '/less/app.less', ['less']);
	gulp.watch(conf.indexPage, ['html:moveIndex']);
	//gulp.watch(conf.in + '/js/**', ['js:browserify']);
}

function moveIndexPage(){
	util.log('Moving index page');
	return gulp
		.src(conf.indexPage)
		.pipe(gulp.dest(conf.out));
}

function browserifyTask(){
	var watchify = require('watchify');
	var browserify = require('browserify');
	var notify = require('gulp-notify');
	var source = require('vinyl-source-stream');
	var buffer = require('vinyl-buffer');
	var sourcemaps = require('gulp-sourcemaps');
	var assign = require('lodash.assign');

	// add custom browserify options here
	var customOpts = {
	  entries: [conf.in + '/js/app.js'],
	  debug: true
	};
	var opts = assign({}, watchify.args, customOpts);
	var b = watchify(browserify(opts)); 

	// add transformations here
	// i.e. b.transform(coffeeify);
	
	b.on('update', bundle); // on any dep update, runs the bundler
	b.on('log', util.log); // output build logs to terminal

	function bundle() {
		util.log('Running bundle for browserify');
	  return b.bundle()
		  .on('error', notify.onError({ message: 'Error with Browserify', sound: false }))
	    .on('error', function(error){
	      util.log(util.colors.red.underline('Error with Browserify:'), util.colors.red(error.message));
	    })
	    .pipe(source(conf.bundleJsFile))
	    // optional, remove if you don't need to buffer file contents
	    .pipe(buffer())
	    // optional, remove if you dont want sourcemaps
	    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
	       // Add transformation tasks to the pipeline here.
	    .pipe(sourcemaps.write('./')) // writes .map file
	    .pipe(gulp.dest(conf.out + '/js'));
	}

	return bundle;
}