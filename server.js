var importedFunc = require('./sat1')
var package = require('./package.json')
var async = require('async')

var fs = require('fs')
var express = require('express')
var app = express()



var logger = (req, res, next) => {
  console.log("Request:", req.originalUrl)
  next()
}

var logger2 = (req, res, next) => {
  console.log("Log2 Request:", req.originalUrl)
  next()
}

var errorLog = (req, res, next) => {
  console.log("Error in Request:", req.originalUrl)
  next()
}

var bizLogic = (req, res, next) => {
  console.log(req.query)
  var ok = true
  if (ok) {
    return res.json({ result : importedFunc(parseInt(req.query.a), parseInt(req.query.b)) })
  }
  var error = new Error("something is not good")
  next(error)
}


function networkResult1() {
  return "evening";
}


function networkResult2() {
  return "Hajni"
}

function createResultFunction(result) {
  return () => result
}
// function createDelayedResult(resultFn, delay, handler) {
//   ///1
//   setTimeout(() => {
//     ///3
//     var result = resultFn()
//     handler(result)
//   }, delay)
//   ////2
// }

function createDelayedJob(resultFn, delay) {
  return function(handler) {
    setTimeout(() => {
      var result = resultFn()
      handler(undefined, result)
    }, delay)
  }
}


app.use("/api/greetPerson/:name/:greeting", (req, res) => {
    console.log("handler started sync code")
    var job1 = createDelayedJob(createResultFunction(req.params.name), 2000)
    var job2 = createDelayedJob(createResultFunction(req.params.greeting), 1000)

    job1( (error, result) => {
      console.log("job1 result is", result)
    })

    job2( (error, result) => {
      console.log("job2 result is", result)
    })

    async.series([job1, job2], (err, results) => {
      res.json(results)
    })

    // var jobs = [job1, job2]
    //     async.paralell(jobs, done => { })
    // // createDelayedResult(networkResult1, 1000, (result) => {
    // //   createDelayedResult(networkResult2, 2000, (result2) => {
    // //       res.json({result: `Good ${result} ${result2}`})
    // //   })
    // // })
    console.log("handler exited sync code")
})


// app.use("/api/greetPerson/:name/:greeting", (req, res) => {
//     console.log("handler started sync code")
//     createDelayedResult(networkResult1, 1000, (result) => {
//       createDelayedResult(networkResult2, 2000, (result2) => {
//           res.json({result: `Good ${result} ${result2}`})
//       })
//     })
//     console.log("handler exited sync code")
// })


var fileServerMiddleware = express.static('public')
app.use(fileServerMiddleware);

app.get("/:pagename", (req, res) => {
  console.log("url: ", req.url, req.params)
  var pagename = "./public/" + req.params.pagename
  var pageContent = fs.readFileSync(pagename).toString()
  res.send(pageContent)
})

function errorHandler(err, req, res, next) {
  console.log("Error in request", err.message, err.stack)
  if (err) {
    res.status(500).send(err.message + "in:" + err.stack)
  }
}

app.use(errorHandler)



var port = process.env.PORT || 5000


var server = app.listen(port, (err) => {
  console.log("Our server listening on " + port)
})

