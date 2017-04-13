var gulp =  require('gulp'),
    // css
    sass = require('gulp-ruby-sass'),
    px3rem = require('gulp-px3rem'),
    // img4dpr 用的较少，不作为默认安装项，具体介绍: http://web.npm.alibaba-inc.com/package/@ali/gulp-img4dpr
    //img4dpr = require('@ali/gulp-img4dpr'),
    // js
    jshint = require('gulp-jshint'),
    // combo
    htmlone = require('gulp-htmlone'),
    // utils
    rename = require('gulp-rename'),
    del = require('del');

var src = './src/',
    build = './build/',
    path_html = '**/*.html',
    path_scss = 'css/**/*.scss',
    path_css = 'css/**/*.css',
    path_js = 'js/**/*.js';

// css
gulp.task('sass', function () {
    // gulp-ruby-sass 不支持 **/*.scss 的方式，只能指定单个文件或者目录
    return sass(src + 'css/')
               .on('error', function (err) {
                    console.error('Sass Error!', err.message);
                })
               .pipe(px3rem({
                    threeVersion: false,
                    // XXX: 以下两项根据项目实际情况做修改
                    remUnit: 75,
                    baseDpr: 2,
                    forcePxComment: 'px',
                    keepComment: 'no'
                }))
                // px3rem 默认输出的文件带有 .debug 后缀
               .pipe(rename(function (path) {
                    path.basename = path.basename.replace('.debug', '');
                }))
               /*
               .pipe(img4dpr({
                   dpr: 3,
                   q: 'q50',
                   s: '150',
                   keepComment: 'noimg4dpr'
                }))
               */
               .pipe(gulp.dest(src + 'css/'));
});

// js
gulp.task('jshint', function () {
    return gulp.src(src + path_js, {base: src})
               .pipe(jshint())
               .pipe(jshint.reporter('default'));
});

// combo
// 1. 不再将 css/js 文件放到 build 目录下，build 只生成最终 MT 使用的代码文件
// 2. htmlone 集成了 uglify-js 和 ycssmin 插件，所以不再使用 gulp-uglify 和 gulp-minify-css
gulp.task('htmlone:debug', ['sass', 'jshint'], function () {
    return gulp.src(src + path_html, {base: src})
               .pipe(htmlone({
                   cssminify: false,
                   jsminify: false
                }))
               .pipe(rename({
                   suffix: '.debug'
                }))
               .pipe(gulp.dest(build));
});

gulp.task('htmlone', ['sass', 'jshint', 'htmlone:debug'], function () {
    return gulp.src(src + path_html, {base: src})
               .pipe(htmlone({
                   cssminify: true,
                   jsminify: true
                }))
               .pipe(gulp.dest(build));
});

// clean
gulp.task('clean', function () {
    del(build);
});

gulp.task('watch', function () {
    //gulp.watch([src + path_js], ['jshint']);
    gulp.watch([src + path_scss], ['sass']);
});

gulp.task('build', ['clean', 'sass', 'jshint', 'htmlone:debug', 'htmlone']);
gulp.task('default', ['build', 'watch']);
