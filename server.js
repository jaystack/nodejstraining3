var importedFunc = require('./sat1')
var package = require('./package.json')
var async = require('async')
var request = require('request')
var debug = require('debug')('myservice1')
var debugStep1 = require('debug')('myservice1.step1')
var debugStep2 = require('debug')('myservice1.step2')
var debugEntry = require('debug')('myservice1.entry')

var fs = require('fs')
var express = require('express')
var app = express()



app.use("/step1", (req, res) => {
  debugStep1("request received to step1")
  setTimeout( () => {
    if (req.query.throw) {
      debugStep1("request errored on server", {message: "some error"})
      return res.status(500).json({message: "some error"})
    }
    res.json({step1: "OK", data: req.query.data || "42"})
  }, parseInt(req.query.timeout, 10) )
})

app.use("/step2", (req, res) => {
  debugStep2("request received to step2")
  setTimeout( () => {
    res.json({step2: "OK", data: req.query.data || "42"})
  }, parseInt(req.query.timeout, 10) )
})


app.use("/entry", (req, res) => {
  debugEntry("request received to entry")

  console.time("execution of entry")

  // function createJob(step, timeout) {
  //   function(done) {
  //     //request.get(`http://localhost:${port}/step1?timeout=2345`, done)
  //     request.get(`http://localhost:${port}/${step}?timeout=${timeout}&throw=true`, function(err, result) {
  //       if (err || result.statusCode >= 500) {
  //         var _err =  err || { message: `status ${result.statusCode}`}
  //         debugStep1("request errored on client", _err)
  //         return done(_err)
  //       }
  //       debugStep1("request completed on client")
  //       done(undefined, JSON.parse(result.body))
  //     })
  //   }
  // }



  function step2Job(done) {
    //request.get(`http://localhost:${port}/step1?timeout=2345`, done)
    request.get(`http://localhost:${port}/${step}?timeout=${timeout}&throw=true`, function(err, result) {
      if (err || result.statusCode >= 500) {
        var _err =  err || { message: `status ${result.statusCode}`}
        debugStep1("request errored on client", _err)
        return done(_err)
      }
      debugStep1("request completed on client")
      done(undefined, JSON.parse(result.body))
    })
  }

  function step2Job(done) {
    request.get(`http://localhost:${port}/step2?timeout=1234`, function(err, result) {
      debugStep2("sterequest completed on client")
      if (err) return done(err)
      done(undefined, JSON.parse(result.body))
    })
  }


  var jobDefs = [
    { step:'step1', timeout:2500, debug: debugStep1 },
    { step:'step2', timeout:1500, debug: debugStep2 },
    { step:'step1', timeout:2500, debug: debugStep1 },
    { step:'step2', timeout:1500, debug: debugStep2 },
    { step:'step1', timeout:2500, debug: debugStep1 },
    { step:'step2', timeout:1500, debug: debugStep2 },
    { step:'step1', timeout:2500, debug: debugStep1 },
    { step:'step2', timeout:1500, debug: debugStep2 },
    { step:'step1', timeout:2500, debug: debugStep1 },
    { step:'step2', timeout:1500, debug: debugStep2 },
    { step:'step1', timeout:2500, debug: debugStep1 },
    { step:'step2', timeout:1500, debug: debugStep2 },
    { step:'step1', timeout:2500, debug: debugStep1 },
    { step:'step2', timeout:1500, debug: debugStep2 },
    { step:'step1', timeout:2500, debug: debugStep1 },
    { step:'step2', timeout:1500, debug: debugStep2 },
    { step:'step1', timeout:2500, debug: debugStep1 },
    { step:'step2', timeout:1500, debug: debugStep2 }
  ]

  function step(data, done) {
    request.get(`http://localhost:${port}/${data.step}?timeout=${data.timeout || 0}`, function(err, result) {
      if (err || result.statusCode >= 500) {
        var _err =  err || { message: `status ${result.statusCode}`}
        data.debug("request errored on client", _err)
        return done(_err)
      }
      data.debug("request completed on client", JSON.parse(result.body))
      data.result = JSON.parse(result.body)
      done(undefined, JSON.parse(result.body))
    })
  }

  async.eachLimit(jobDefs, 2, step, (err, result) => {
    if (err) {
      debugEntry("jobs errored", err)
      return res.status(500).json(err)
    }
    debugEntry("jobs complete", err, result, jobDefs)
    console.timeEnd("execution of entry")
    res.json(jobDefs)
  })

  // async.each(jobDefs, step, (err, result) => {
  //   if (err) {
  //     debugEntry("jobs errored", err)
  //     return res.status(500).json(err)
  //   }
  //   debugEntry("jobs complete", err, result, jobDefs)
  //   console.timeEnd("execution of entry")
  //   res.json(jobDefs)
  // })

  // async.each(jobDefs, step, (err, result) => {
  //   if (err) {
  //     debugEntry("jobs errored", err)
  //     return res.status(500).json(err)
  //   }
  //   debugEntry("jobs complete", err, result, jobDefs)
  //   console.timeEnd("execution of entry")
  //   res.json(jobDefs)
  // })

  // async.series( [step1Job, step2Job], (err, results) => {
  //   if (err) {
  //     debugEntry("jobs errored", err)
  //     return res.status(500).json(err)
  //   }
  //   debugEntry("jobs complete", err, results)
  //   console.timeEnd("execution of entry")
  //   res.json(results)
  // })

  // async.parallel( [step1Job, step2Job], (err, results) => {
  //   debugEntry("jobs complete err obj", err)
  //   debugEntry("jobs complete", results)
  //   console.timeEnd("execution of entry")
  //   res.json(results)
  // })

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

