var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var runSequence = require('run-sequence');
var revCollector = require('gulp-rev-collector');
var htmlmin = require('gulp-htmlmin');
var del = require('del');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var uglifycss = require('gulp-uglifycss');
var uglify = require('gulp-uglify');
var plugins = [
    autoprefixer({browsers: ['last 1 version']}),
    cssnano()
];

// process JS files and return the stream.
gulp.task('serve', function() {

    browserSync.init({
        server: "./src"
    });

    gulp.watch("src/html/*.html").on('change', browserSync.reload);
});



gulp.task('default', ['serve']);


gulp.task('clean', function() {
    return del(['dist']);
});
gulp.task('scripts', function() {
    return gulp.src('src/javascript/*.js')
        // .pipe(concat('all.js'))
        .pipe(rev())
        .pipe(gulp.dest('dist/javascript'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/javascript'));
});


gulp.task('styles', function() {
    return gulp.src(['src/styles/*.css'])
        .pipe(postcss(plugins))
        .pipe(uglifycss({
            "maxLineLen": 80,
            "uglyComments": true
          }))
        .pipe(rev())
        .pipe(gulp.dest('dist/styles'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/styles'))  
});

gulp.task('revCollectorCss', function () {
    return gulp.src(['dist/**/*.json', 'dist/styles/*.css'])
        .pipe(revCollector())
        .pipe(gulp.dest('dist/styles/'));
});


gulp.task('images', function() {
    return gulp.src('src/images/*')
        .pipe(rev())
        .pipe(gulp.dest('dist/images'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/images'));
});
gulp.task('rev', function() {
    return gulp.src(['dist/**/*.json', 'src/html/*.html'])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                'styles': 'styles',
                'javascript': 'javascript',
                'images':'images',
                'cdn': function(manifest_value) {
                    return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
                }
            }
        }))
        .pipe(htmlmin({
            empty: true,
            spare: true
        }))
        .pipe(gulp.dest('dist/html'));
});

gulp.task('build', function(callback) {
    runSequence('clean',['scripts','images','styles'], ['revCollectorCss'],
        'rev',
        callback);
});