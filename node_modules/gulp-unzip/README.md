![travis](https://travis-ci.org/suisho/gulp-unzip.svg)
# gulp-unzip
> gulp plugin for unzip file.

# simple usage

- this sample is extract all files.

```js
gulp.task('filter_sample', function(){
  var minimatch = require('minimatch')
  gulp.src("./download/bootstrap-3.1.1-dist.zip")
    .pipe(unzip())
    .pipe(gulp.dest('./tmp'))
})
```

# filter option usage.
- If you want some pattern of file in zip. you can use `filter` option.
- filter function can get `entry` as parameter.

## sample

- below sample is extract only css and concat with `gulp-concat`

```js
var concat = require('gulp-concat')
var minimatch = require('minimatch')
gulp.task('filter_sample', function(){
  gulp.src("./download/bootstrap-3.1.1-dist.zip")
    .pipe(unzip({
      filter : function(entry){
        return minimatch(entry.path, "**/*.min.css")
      }
    }))
    .pipe(concat("bootstrap.css"))
    .pipe(gulp.dest('./tmp'))
})
```

## entry params
- If you want more info, show [node-unzip](https://github.com/EvanOxfeld/node-unzip)

### entry.size
- get file size.

### entry.type
- get `Directory` or `File`

### entry.path
- file path in zip file.

# Known issue
- Cause `RangeError: Maximum call stack size exceeded` when open large zip file
  - https://github.com/suisho/gulp-unzip/issues/2
