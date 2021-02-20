const fs = require('fs')
 
function deleteMaps(dir) {
  fs.readdir(dir, function(err, files) {
    files.forEach((file) => {
      if(/\.map$/.test(file)) {
        fs.unlinkSync(dir+file)
      } else {
        fs.readFile(dir+file, 'utf8', (err, data) => {
          let result = data.split('\n')
          if (result[1] !== undefined) {
            fs.writeFileSync(dir+file, result[0])
          }
        })
      }
    })
  })
}
 
['./build/static/css/', './build/static/js/'].map(deleteMaps)