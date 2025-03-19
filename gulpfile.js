const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');

// compile scss into css
function style(){
    return gulp.src('assets/sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('assets/css'))
    .pipe(browserSync.stream());
}

function watch(){
    browserSync.init({
        server:{
            baseDir: './',
        }
    });
    gulp.watch('./assets/sass/*.scss', style);
    gulp.watch('./assets/sass/component/*.scss', style);
    gulp.watch('./assets/sass/import/*.scss', style);
    gulp.watch('./assets/sass/page/*.scss', style);
    gulp.watch('./*.html').on('change', browserSync.reload);
    gulp.watch('./assets/css/*.css').on('change', browserSync.reload);
    gulp.watch('./assets/js/*.js').on('change', browserSync.reload);
}



exports.style = style;
exports.watch = watch;
