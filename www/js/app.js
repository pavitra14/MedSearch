var rank = "";
var sub = "";
var sub_price = "";
if (localStorage.getItem("LocalData") == null) {
  var data = [];
  data = JSON.stringify(data);
  localStorage.setItem("LocalData", data);
}
//custom URL plugin code
function handleOpenURL(url) {
  var qr = url.slice(8);
  //alert(qr);
  if (localStorage.getItem("LocalData") == null) {
    var data = [];
    data = JSON.stringify(data);
    localStorage.setItem("LocalData", data);
  }
  var data = localStorage.getItem("LocalData");
  data = JSON.parse(data);
  data[data.length] = [moment().format('lll'), qr];
  localStorage.setItem("LocalData", JSON.stringify(data));
  a.fetchPresData();
  app.f7.router.navigate({
    url: '/prescriptions/'
  });
}

jQuery.noConflict();
// jQuery Code
jQuery(document).ready(function () {
  //Hide the search Results
  jQuery('#results').hide();
  jQuery('#results2').hide();

  // Init F7 Vue Plugin
  Vue.use(Framework7Vue, Framework7);

  // Init Page Components
  Vue.component('page-about', {
    template: '#page-about'
  });
  Vue.component('prescriptions', {
    template: '#prescriptions'
  });
  Vue.component('page-dynamic-routing', {
    template: '#page-dynamic-routing'
  });
  Vue.component('page-not-found', {
    template: '#page-not-found'
  });
  Vue.component('stores', {
    template: '#stores'
  });
  //Routes for the application
  var routes = [{
      path: '/about/',
      component: 'page-about'
    },
    {
      name: 'prescriptions',
      path: '/prescriptions/',
      component: 'prescriptions'
    },
    {
      name: 'sih_login',
      path: '/login/',
      url: 'https://sih.pbehre.in/'
    },
    {
      path: '/stores/',
      component: 'stores'
    },
    {
      path: '(.*)',
      component: 'page-not-found',
    }
  ];
  // Init App
  var a = new Vue({
    el: '#app',
    // Init Framework7 by passing parameters here
    framework7: {
      root: '#app', // App root element
      id: 'com.pbehre.medsearch', // App bundle ID
      name: 'MedSearch', // App name
      theme: 'auto', // Automatic theme detection
      // App routes
      routes: routes,
    },
    methods: {
      greet: function () {
        alert('Hello, World!')
        // console.log(cordova.plugins);
      },
      scanNow: function (event) {
        cordova.plugins.barcodeScanner.scan(
          function (result) {
            if (!result.cancelled) {
              // alert("We got a barcode\n" +
              //       "Result: " + result.text + "\n" +
              //       "Format: " + result.format + "\n" +
              //       "Cancelled: " + result.cancelled);
              var value = result.text;
              if (localStorage.getItem("LocalData") == null) {
                var data = [];
                data = JSON.stringify(data);
                localStorage.setItem("LocalData", data);
              }
              var data = localStorage.getItem("LocalData");

              // if(data != null) {
              //   data = JSON.parse(data);
              // } else {
              //   data = JSON.parse("[]");
              // }
              data = JSON.parse(data);
              data[data.length] = [moment().format('lll'), value];
              localStorage.setItem("LocalData", JSON.stringify(data));
              alert("Scan successful, fetching data. ");
              a.fetchPresData();
              app.f7.router.navigate({
                url: '/prescriptions/'
              });
            }
          },
          function (error) {
            alert("Scanning failed: " + error);
          }, {
            preferFrontCamera: false, // iOS and Android
            showFlipCameraButton: true, // iOS and Android
            showTorchButton: true, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            saveHistory: true, // Android, save scan history (default false)
            prompt: "Place a barcode inside the scan area", // Android
            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
            orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations: true, // iOS
            disableSuccessBeep: true // iOS and Android
          }
        );
      },
      openLogin: function (event) {
        cordova.InAppBrowser.open('https://sih.pbehre.in/login.php', '_blank', 'location=yes');
      },
      fetchPresData: function () {
        jQuery("table#allTable tbody").empty();

        var data = localStorage.getItem("LocalData");
        console.log(data);
        data = JSON.parse(data);

        //let's see what all things we need to display in each prescription here

        var html = "";

        for (var count1 = 0; count1 < data.length; count1++) {
          var qrcode = data[count1][1]; //store the qr code in this variable as a string
          //var requestUrl="http://192.168.43.105/sih/api/v2/qrcode/"+qrcode;
          var requestUrl = "https://sih.pbehre.in/api/v2/qrcode/" + qrcode;

          // alert("requestUrl :::::"+requestUrl);    
          sendAjaxPres(requestUrl, 'GET', data, count1);
        }

      },
      findAhead: function () {
        var sub = jQuery('input:radio[name=sub_ahead]:checked').closest('td').next('td').map(function () {
          return jQuery(this).text();
        }).get();
        var sub_price = jQuery('input:radio[name=sub_ahead]:checked').closest('td').next('td').next('td').map(function () {
          return jQuery(this).text();
        }).get();
        jQuery.ajax({
          type: "GET",
          crossdomain: true,
          url: "https://sih.pbehre.in/api/v3/findAhead/" + sub,
          data: {
            key: sub
          },
          success: function (response) {
            data = showObject(response);
            console.log(data);
            var html = "";
            for (var i = 0; i < data.length; i++) {
              var storeName = data[i][0]['name'] + ", ";
              var storeAdd = data[i][0]['address'] + ", India";
              var full_add = storeName + storeAdd;

              html += "<tr><td><label class='radio'><input type='radio' name='stores_ahead'><i class='icon-radio'></i></label></td><td>";
              html += full_add;
              html += "</td></tr>";
            }
            jQuery('#ahead-data-stores').html(html);
            jQuery('#results').hide();
            jQuery('#results2').show();
          },
          error: function (err) {
            console.log("findAhead AJAX failed : " + err);
          }
        });
      }
    }
  });
  console.log("DOM Ready.");
  var engine = new Bloodhound({
    remote: {
      url: 'https://sih.pbehre.in/api/v3/ahead/%QUERY%',
      wildcard: '%QUERY%'
    },
    datumTokenizer: Bloodhound.tokenizers.whitespace('q'),
    queryTokenizer: Bloodhound.tokenizers.whitespace
  });
  jQuery("#ahead_search.typeahead").typeahead({
    hint: true,
    highlight: true,
    minLength: 1,
  }, {
    source: engine.ttAdapter(),

    // This will be appended to "tt-dataset-" to form the class name of the suggestion menu.
    name: 'medList',

    display: 'name',

    // the key from the array we want to display (name,id,email,etc...)
    templates: {
      empty: [
        '<div class="list-group search-results-dropdown"><div class="list-group-item">Nothing found.</div></div>'
      ],
      header: [
        '<div class="list-group search-results-dropdown">'
      ],
      suggestion: function (data) {
        return '<a href="#" class="list-group-item list-group-item-action">' + data.name + '</a>'
      }
    }
  }).on('typeahead:selected', function () {
    var key = jQuery("#ahead_search.typeahead").val();
    jQuery("#image1").hide();
    jQuery.ajax({
      type: "GET",
      url: "https://sih.pbehre.in/api/v3/alt/" + key,
      crossdomain: true,
      data: {
        key: key
      },
      success: function (response) {
        data = showObject(response);
        data = data[0];
        html = "";
        console.log(data);
        for (var i = 0; i < data.length; i++) {
          var name = data[i]['name'];
          var price = data[i]['price'];
          html += "<tr><td><label class='radio'><input type='radio' name='sub_ahead' value='find'><i class='icon-radio'></i></label></td>";
          html += "<td>" + name + "</td>";
          html += "<td>" + price + "</td></tr>";
        }
        jQuery('#ahead-data').html(html);
        jQuery("#results").show();
      },
      error: function (err) {
        console.log('typeahead:selected ajax failed : ' + err);
      }
    });

  }).keyup(function () {

    if (!this.value) {
      jQuery("#results").hide();
      jQuery("#results2").hide();
      jQuery("#image1").show();
    }

  });
  //line to fix typeahead padding issues
  jQuery('.twitter-typeahead').attr("style", "");
  //Search Code End
});
//iterate thru a json object having key:value
function showObject(JSONobj) {
  var result = [];
  var it = 0;
  for (var p in JSONobj) {
    if (JSONobj.hasOwnProperty(p)) {
      // result = JSONobj[p];
      result[it] = JSONobj[p];
      it++;
    }
  }
  return result;
}

function navigate() {
  var store_add = jQuery('input:radio[name=stores_ahead]:checked').closest('td').next('td').text();
  //alert(store_add);
  console.log(store_add);
  launchnavigator.navigate("" + store_add);
}

function sendAjaxPres(url, method, data, count1) {
  //alert(url);
  jQuery.ajax({
    type: method,
    crossDomain: true,
    url: url,
    data: data,
    success: function (response) {

      var html = "";

      var arrJSON = JSON.parse(response);

      var valuesArrForMedicine = showObject(arrJSON.medicines);
      var valuesArrForMedicinePrice = showObject(arrJSON.m_price);
      var valuesArrForSubstitutes = showObject(arrJSON.subtitutes);

      var prescribedMedicine = "";
      for (var i = 0; i < valuesArrForMedicine.length; i++) {
        prescribedMedicine += "<strong><tr>" +
          "<strong><td colspan='2'>(" + (i + 1) + ")&nbsp;&nbsp;" + valuesArrForMedicine[i] + "</td>" +
          "<td>" + valuesArrForMedicinePrice[i] + "</td></strong></tr></strong><tr><td>Substitutes:</td><td></td></tr>";

        for (var j = 0; j < valuesArrForSubstitutes[i].length; j++) {

          prescribedMedicine += "(" + (j + 1) + ")<tr><td><label class='checkbox'><input type='checkbox' name='sub' value='find'><i class='icon-checkbox'></i>" + valuesArrForSubstitutes[i][j].name + "</label></td>" +
            "<td>" + valuesArrForSubstitutes[i][j].price + "</td></tr>";

        }


      }


      var storeAddress = arrJSON.stores_details["1"][0].name + ", ";
      storeAddress += arrJSON.stores_details["1"][0].address + ", India";

      var valuesArrForStoresAvail = showObject(arrJSON.stores_av);
      var valuesArrForStoreDetails = showObject(arrJSON.stores_details);

      html +=

        +"<tr><td></td></tr>" +
        "<tr><td><label class='radio'>"+(count1+1)+"<input type='radio' name='finding' value='find'><i class='icon-radio'></i></td><td>" + data[count1][0] + "</td></label></tr>" +
        "<tr><td>Name</td><td>Price</td></tr>" +
        prescribedMedicine;


      if (count1 == data.length - 1) {
        html += "<tr/><td><br></td><tr/>";
      }
      jQuery("table#allTable tbody").append(html);


    },
    error: function (response) {
      return response;
    }
  });
}
function findStores(){
  var findThisIndex=jQuery('input:radio[name=finding]:checked').closest('td').text();
        //sub = $('input:radio[name=sub]:checked').closest('td').text();
        sub = jQuery('input:checkbox[name=sub]:checked').closest('td').map(function(){
            return jQuery(this).text();
          }).get(); // <----
        sub_price = jQuery('input:checkbox[name=sub]:checked').closest('td').next('td').map(function(){
            return jQuery(this).text();
          }).get(); // <----
       
        var trueIndex=findThisIndex-1;
        var data = localStorage.getItem("LocalData");
        data = JSON.parse(data);
        rank=data[trueIndex];
        var requestUrl="https://sih.pbehre.in/api/v2/qrcode/"+rank[1];
        sendAjaxStores(requestUrl,'GET',data);
        app.f7.router.navigate({
          url: '/stores/'
        });

}
function sendAjaxStores(url, method, data) {
  //alert(url);
  jQuery.ajax({
    type: method,
    crossDomain: true,
    url: url,
    data: data,
    success: function (response) {
      //alert(response);
      // alert("just below success function_alert3");
      var html = "";

      var arrJSON = JSON.parse(response);

      var valuesArrForMedicine = showObject(arrJSON.medicines);
      var valuesArrForMedicinePrice = showObject(arrJSON.m_price);

      var prescribedMedicine = "";


      var storeAddress = arrJSON.stores_details["1"][0].name + ", ";
      storeAddress += arrJSON.stores_details["1"][0].address + ", India";

      var valuesArrForStoresAvail = showObject(arrJSON.stores_av);
      var valuesArrForStoreDetails = showObject(arrJSON.stores_details);

      var store1 = [],
        store2 = [],
        k = 0,
        l = 0;

      var storesDetails = [
        [],
        []
      ];

      for (var i = 0; i < valuesArrForStoresAvail.length; i++) {
        for (var j = 0; j < valuesArrForStoresAvail[i].length; j++) {
          for (var m = 0; m < valuesArrForStoreDetails.length; m++) {
            if (valuesArrForStoresAvail[i][j] == m + 1) {
              storesDetails[m].push(valuesArrForMedicine[i]);
            }
          }
        }
      }
      var htmlRadioEdit = numberOfStores1(showObject(arrJSON.stores_details), storesDetails, sub, sub_price, arrJSON);

      html += +"<tr><td></td></tr>" +
        htmlRadioEdit;

      // if(count1==data.length-1){
      //     html+="<tr/><td><br></td><tr/>";
      // }
      jQuery("table#allTableNew tbody").append(html);


    },
    error: function (response) {
      return response;
    }
  });
}

function calcQTY(consumption, number, duration) {
  var cons;
  cons = {
    "Once in a day": 1,
    "Empty stomach": 1,
    "After breakfast": 1,
    "After lunch": 1,
    "Before lunch": 1,
    "After dinner": 1,
    "Before dinner": 1,
    "Twice daily after meal": 2,
    "Twice daily before meal": 2,
    "Thrice daily after meal": 3,
    "Thrice daily before meal": 3,
    "Four times daily after meal": 4,
    "Four times daily before meal": 4,
    "Once in a week": 1
  };
  var dur;
  dur = {
    "Days": 1,
    "Weeks": 7,
    "Months": 30
  };
  var dailyNo;
  dailyNo = cons[consumption];
  var qty;
  qty = dailyNo * number * dur[duration];
  return qty;
}

function getSum(total, num) {
  return total + num;
}

function numberOfStores1(valuesArrForStoreDetail, storesDetails, sub, sub_price, arrJSON) {
  var htmlRadioEdit = "<thead><tr>" +
    "<th><strong>Medicines</strong></th> <th><strong>Price<strong></th><th><strong>Quantity</strong></th><th><strong>Amount</strong></th>" +
    "</tr>";

  var cons = arrJSON['pres_details']['consumption'];
  var no = arrJSON['pres_details']['number'];
  var dur = arrJSON['pres_details']['duration'];
  var total = [];
  for (var i = 0; i < sub.length; i++) {
    var qty = calcQTY(cons[i], no[i], dur[i]);
    var amt = qty * sub_price[i];
    total.push(amt);
    htmlRadioEdit += "<tr><td>" + sub[i] + "</td><td>Rs. " + sub_price[i] + "</td><td>" + qty + "</td><td>Rs. " + amt + "</td></tr>";
  }
  var sum = total.reduce(getSum);
  htmlRadioEdit += "<tr><td colspan='3'><strong>Approximate Total: </strong></td><td>Rs. " + sum + "</td></tr>";
  for (var i = 0; i < valuesArrForStoreDetail.length; i++) {
    var name = valuesArrForStoreDetail[i][0].name;
    var storeAddress = valuesArrForStoreDetail[i][0].name + ", ";
    storeAddress += valuesArrForStoreDetail[i][0].address + ", India";
    htmlRadioEdit += "";
    htmlRadioEdit += "<tr><td><label class='radio'><input type='radio' name='finding_stores'><i class='icon-radio'></i></label></td><td>";
    htmlRadioEdit += storeAddress;
    htmlRadioEdit += "</td></tr>";
    /*if(valuesArrForStoreDetail[i+1][0].name == name) {
        break;
    }*/
    if (i == valuesArrForStoreDetail.length - 1) {
      htmlRadioEdit += "<tr style='border-bottom:4px solid black'><td colspan='100%'></td></tr><br><br><br>"
    }
  }
  return htmlRadioEdit;
}
function navigatePres() {
  var store_add = jQuery('input:radio[name=finding_stores]:checked').closest('td').next('td').text();
  
  //console.log(store_add);
  launchnavigator.navigate("" + store_add);
}