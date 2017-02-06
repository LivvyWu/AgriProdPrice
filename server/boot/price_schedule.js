var Cronjob = require('cron').CronJob;
var http = require('http');
var commonCode = require('../../lib/util/commonCode');
var url = "http://data.coa.gov.tw/Service/OpenData/FromM/FarmTransData.aspx";
var loopback = require('loopback');
var veg_price = loopback.getModel("veg_price");
var fruit_price = loopback.getModel("fruit_price");

new Cronjob("00 */1 * * * *", function () {

  http.get(url, function (res) {
    var data="";
    res.on("data", function (result) {
      data += result;
    });

    res.on("err", function (e) {
      callback(e, null);
    });

    res.on("timeout", function (e) {
      callback(e, null);
    });

    res.on("end", function () {

      var datas = JSON.parse(data);
      var vegs = [];
      var fruits = [];
      datas.forEach(function (data) {

        var date = data["交易日期"];
        console.log("date = " + date);
        var trans_date = "";
        if (date) {
          var year = parseInt(date.split(".")[0])+1911;
          var month = date.split(".")[1];
          var day = date.split(".")[2];
          trans_date = year + "-" + month + "-" + day;
        }

        var d_code = data["作物代號"];
        var d_name = "";
        var m_code ="";
        var m_name ="";
        var mkt_code = data["市場代號"];
        var mkt_name = commonCode.market_code[mkt_code];
        var u_price = parseFloat(data["上價"]);
        var m_price = parseFloat(data["中價"]);
        var l_price = parseFloat(data["下價"]);
        var avg_price = parseFloat(data["平均價"]);
        var qty = parseInt(data["交易量"]);

        if(commonCode.veg_code[d_code]){
          d_name = commonCode.veg_code[d_code]["detail_name"];
          m_code = commonCode.veg_code[d_code]["master_code"];
          m_name = commonCode.veg_code[d_code]["master_name"];

          vegs.push({
            trans_date : trans_date,
            master_code : m_code,
            master_name : m_name,
            detail_code : d_code,
            detail_name : d_name,
            market_code : mkt_code,
            market_name : mkt_name,
            u_price : u_price,
            m_price : m_price,
            l_price : l_price,
            avg_price : avg_price,
            qty : qty
          });

        } else if(commonCode.fruit_code[d_code]){
          d_name = commonCode.fruit_code[d_code]["detail_name"];
          m_code = commonCode.fruit_code[d_code]["master_code"];
          m_name = commonCode.fruit_code[d_code]["master_name"];

          fruits.push({
            trans_date : trans_date,
            master_code : m_code,
            master_name : m_name,
            detail_code : d_code,
            detail_name : d_name,
            market_code : mkt_code,
            market_name : mkt_name,
            u_price : u_price,
            m_price : m_price,
            l_price : l_price,
            avg_price : avg_price,
            qty : qty
          });

        }


      });

      veg_price.create(vegs);
      fruit_price.create(fruits);

    });
  })

}, function () {
          //辨別schedule是否已註冊
}, true); //schedule啟動
