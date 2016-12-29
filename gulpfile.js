// 开发时 gulp watch 编译scss，js/css修改后自动刷新浏览器
// 上线前 gulp build img压缩，js压缩打包，css压缩打包，给 static files 添加版本号
// 警告： 在 build 之前必须先 watch

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var rev = require('gulp-rev');
var runSequence = require('run-sequence');
var revCollector = require('gulp-rev-collector');

var uglify = require('gulp-uglify');

// autoprefixer设置
var autoprefixerOptions = {
    browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};

gulp.task('sass', function() {
    return gulp.src('app/scss/**/*.+(scss|css)')
        .pipe(sass())
        .pipe(concat('all.css'))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
})
gulp.task('comcatjs', function() {
    return gulp.src('app/js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('app/js/build'));
});
// 浏览器自动刷新配置
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'app'
        },
    })
});

// 自动编译，再刷新浏览器
gulp.task('watch', ['browserSync', 'sass', 'comcatjs'], function() {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    // Other watchers
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});

// 图片压缩
gulp.task('images', function() {
    return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
});

// 给css加上版本号
gulp.task('revcss', function() {
    return gulp.src('app/css/*.css')
        .pipe(concat('all.css'))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rev())
        .pipe(gulp.dest('dist/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/css'));
});

// 给all.js 加上版本号
gulp.task('revjs', function() {
    return gulp.src('app/js/*.js')
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js/build'))
        .pipe(rev())
        .pipe(gulp.dest('dist/js/build'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/js/build'));
});

// 从lib的js里导入到dist
gulp.task('linkjs', function() {
    return gulp.src('app/js/lib/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js/lib'));
});

gulp.task('rev', function() {
    return gulp.src(['dist/**/*.json', 'app/*.html'])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                'css': 'css',
                'js': 'js',
                'cdn': function(manifest_value) {
                    return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
                }
            }
        }))
        .pipe(htmlmin({
            empty: true,
            spare: true
        }))
        .pipe(gulp.dest('dist'));
});

// (批量任务),上线之前build
gulp.task('build', function(callback) {
    runSequence('images', ['revcss', 'revjs', 'linkjs'],
        'rev',
        callback);
});