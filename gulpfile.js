'use strict';
		
var gulp = require('gulp'),
	$    = require('gulp-load-plugins')();

// because gulp-load-$ loads plugins only with prefix gulp-. Shit.
$.browserSync = require('browser-sync');
$.pngquant = require('imagemin-pngquant');

var path = {
	build: {
		html:  'example/',
		php:   'example/',
		js:    'example/js/',
		css:   'example/',
		img:   'example/images/',
		fonts: 'example/fonts/',
		ufi:   'dist/',
		vendor: 'example/vendor/'
	},
	src:   {
		html:  'src/*.html',
		php:   'src/**/*.php',
		js:    'src/js/**/*.js',
		css:   'src/**/*.scss',
		img:   'src/images/**/*.*',
		fonts: 'src/fonts/**/*.*',
		ufi:   {
			js:  'src/js/ufi/jquery.ufi.js',
			css: 'src/js/ufi/jquery.ufi.scss'
		},
		vendor: 'src/vendor/**/*.*'
	},
	watch: {
		html:  'src/**/*.html',
		php:   'src/**/*.php',
		js:    'src/js/**/*.js',
		css:   'src/**/*.scss',
		img:   'src/images/**/*.*',
		fonts: 'src/fonts/**/*.*',
		ufi:   {
			js:  'src/js/ufi/*.js',
			css: 'src/js/ufi/*.css'
		},
		vendor: 'src/vendor/**/*.*'
	},
	clean: './example'
};

var config = {
	proxy:     'localhost/ufi/example/',
	logPrefix: 'Frontend'
};

var notifyConfig = {
	title: '<%= error.plugin %>',
	message: '<%= error.message %> in file <%= error.fileName %>:<%= error.lineNumber %>'
};

gulp.task('html:build', function () {
	gulp.src(path.src.html)
		.pipe($.plumber({
			errorHandler: $.notify.onError(notifyConfig)
		}))
		.pipe($.rigger())
		.pipe(gulp.dest(path.build.html))
		.pipe($.browserSync.reload({stream: true}));
});

gulp.task('php:build', function() {
	gulp.src(path.src.php)
		.pipe(gulp.dest(path.build.php))
		.pipe($.browserSync.reload({stream: true}));

});

gulp.task('js:build', function () {
	gulp.src(path.src.js)
		.pipe($.plumber({
			errorHandler: $.notify.onError(notifyConfig)
		}))
		.pipe($.rigger())
		.pipe(gulp.dest(path.build.js))
		.pipe($.browserSync.reload({stream: true}));
});

gulp.task('css:build', function () {
	gulp.src(path.src.css)
		.pipe($.plumber({
			errorHandler: $.notify.onError(notifyConfig)
		}))
		.pipe($.sass({sourcemap: true}))
        .pipe($.sourcemaps.init({loadMaps: true}))
		.pipe($.autoprefixer({
			browsers: ['last 5 versions']
		}))
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest(path.build.css))
		.pipe($.browserSync.reload({stream: true}));
});

gulp.task('img:build', function () {
	gulp.src(path.src.img)
		.pipe($.plumber({
			errorHandler: $.notify.onError(notifyConfig)
		}))
		.pipe($.imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use:         [$.pngquant()],
			interlaced:  true
		}))
		.pipe(gulp.dest(path.build.img))
		.pipe($.browserSync.reload({stream: true}));
});

gulp.task('fonts:build', function () {
	gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts));
});

gulp.task('ufi.js:build', function() {
	gulp.src(path.src.ufi.js)
		.pipe($.plumber({
			errorHandler: $.notify.onError(notifyConfig)
		}))
		.pipe(gulp.dest(path.build.ufi))
		.pipe($.rename(function(path) {
			path.basename += '.min'
		}))
		.pipe($.sourcemaps.init())
		.pipe($.uglify())
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest(path.build.ufi))
		.pipe($.browserSync.reload({stream: true}));
});

gulp.task('ufi.css:build', function() {
	gulp.src(path.src.ufi.css)
		.pipe($.plumber({
			errorHandler: $.notify.onError(notifyConfig)
		}))
		.pipe($.sass({sourcemap: true}))
		.pipe($.sourcemaps.init({loadMaps: true}))
		.pipe($.autoprefixer({
			browsers: ['last 5 versions']
		}))
		.pipe(gulp.dest(path.build.ufi))
		.pipe($.minifyCss())
		.pipe($.sourcemaps.write('.'))
		.pipe($.rename(function(path) {
			path.basename += '.min'
		}))
		.pipe(gulp.dest(path.build.ufi))
		.pipe($.browserSync.reload({stream: true}));
});

gulp.task('vendor:build', function () {
	gulp.src(path.src.vendor)
		.pipe(gulp.dest(path.build.vendor));
});

gulp.task('build', [
	'html:build',
	'php:build',
	'js:build',
	'css:build',
	'img:build',
	'fonts:build',
	'ufi.js:build',
	'ufi.css:build',
	'vendor:build'
]);

gulp.task('watch', function () {
	$.watch([path.watch.html], function (event, cb) {
		gulp.start('html:build');
	});

	$.watch([path.watch.php], function (event, cb) {
		gulp.start('php:build');
	});

	$.watch([path.watch.js], function (event, cb) {
		gulp.start('js:build');
	});

	$.watch([path.watch.css], function (event, cb) {
		gulp.start('css:build');
	});

	$.watch([path.watch.img], function (event, cb) {
		gulp.start('img:build');
	});

	$.watch([path.watch.fonts], function (event, cb) {
		gulp.start('fonts:build');
	});

	$.watch([path.watch.ufi.js], function (event, cb) {
		gulp.start('ufi.js:build');
	});

	$.watch([path.watch.ufi.css], function (event, cb) {
		gulp.start('ufi.css:build');
	});

	$.watch([path.watch.vendor], function (event, cb) {
		gulp.start('vendor:build');
	});
});

gulp.task('webserver', function () {
	$.browserSync(config);
});

gulp.task('clean', function (cb) {
	$.rimraf(path.clean, cb);
});

gulp.task('default', ['clean', 'build', 'webserver', 'watch']);
