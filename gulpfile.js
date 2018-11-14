'use strict';

var gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    autoprefixer = require('gulp-autoprefixer'),
    del = require('del'),
    browserSync = require('browser-sync'),
    uglify = require('gulp-uglify'),
    mergeStream = require('merge-stream'),
    concat = require('gulp-concat');

    const webp = require('gulp-webp');
    const babel = require('gulp-babel');

    const inlinesource = require('gulp-inline-source');
     
    gulp.task('inlinesource', function () {
        return gulp.src('./*.js')
            .pipe(inlinesource())
            .pipe(gulp.dest('./dist/js'));
    });


    gulp.task('es15', () => {
        return gulp.src('./js/**/*.js')
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(gulp.dest('./dist/js'));
    });

       

        // styles
        gulp.task('styles', () => {
        return gulp.src('./css/*.css')
                .pipe(autoprefixer('last 2 version'))
                .pipe(gulp.dest('./dist/css'));
        });

        // copy
        gulp.task('copy', () => {
            return mergeStream(
                gulp.src('./img/**/*.{png,jpg,gif,ico}')
                    .pipe(webp())
                    .pipe(gulp.dest('dist/img')),
                gulp.src('./*.{txt,json,md,js,ico}')
                    .pipe(gulp.dest('./dist'))
            );
        });
         
        gulp.task('lazyImage', () =>
            gulp.src('img/*.{png,jpg,gif}')
                .pipe(webp())
                .pipe(gulp.dest('dist/img'))
        );
        // html task
        gulp.task('html', () => {
            return gulp.src('./*.html')
                    .pipe(gulp.dest('./dist'));
          });
       
            
        // Images
        gulp.task('imagemin', () => {
            return gulp.src('img/**/*.{png,jpg,gif}')
            .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
            .pipe(gulp.dest('./dist/img'));
     
        });
        

        // javascript files
        gulp.task('js', () => {
            return gulp.src('./js/**/*.js')
                    .pipe(gulp.dest('./dist/js'));
                    
         });

        gulp.task('scripts', () => {
           return gulp.src('./js/**/*.js')
                        .pipe(concat('all.js'))
                        .pipe(gulp.dest('dist/js'));
         });
        // minify js files 
        gulp.task('minify', () => {
            return gulp.src('./css/*.js')
                    .pipe(uglify())
                    .pipe(gulp.dest('dist/css'));
       
        });
         
        
        // browser-sync
        gulp.task('browser-sync', () => {
            var files = [
            './*.html',
            './css/*.css',
            './img/*.{png,jpg,gif}',
            './js/*.js'
            ];
        
            browserSync.init(files, {
            server: {
                baseDir: "./"
            }
            });
        
        });
       

        // clean
        gulp.task('clean', () => {
            return del(['dist']);
        });
        
          
           
        // Default task
        gulp.task('default', ['browser-sync'], () => {
            gulp.start('watch');
        });

        
        // build task #build, clean, copy, imagemin, js, html, styles.
        gulp.task('build',['clean'], () => {
              gulp.start('copy','imagemin','js', 'html','styles','minify','lazyImage');
         });

         // styles watch
        gulp.task('watch', () => {
            //  Watch .css files
            gulp.watch('./css/*.css', ['styles']);

            // Watch js files
            gulp.watch('./js/*.js', ['js']);

            // Watch img files
            gulp.watch('./img/*.jpg', ['imagemin']);

            // Watch html files
             // Watch img files
             gulp.watch('./*.html', ['html']);
        });
