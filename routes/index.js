var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
      res.render('index', {
          message: getDays,
      });
});

function getDays(){
  function datediff(first, second) {
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
  }

  let days = datediff(new Date('2022-2-24'), new Date)
  return days
}

module.exports = router;
