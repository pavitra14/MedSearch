var rank="";
var sub="";
var sub_price="";
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
  a.fetchPresData(JSON.stringify(data));
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
      path: '(.*)',
      component: 'page-not-found',
    },
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
              a.fetchPresData(JSON.stringify(data));
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
      fetchPresData: function (data) {
        console.log(data);
        data = JSON.parse(data);
    
        var html = "";

        for(var count1 = 0; count1 < data.length; count1++)
        {
            var qrcode=data[count1][1];//store the qr code in this variable as a string
            var requestUrl="https://sih.pbehre.in/api/v2/qrcode/"+qrcode;
            jQuery.ajax({
              type: "GET",
              crossdomain: true,
              url: requestUrl,
              data: data,
              success: function(response) {
                console.log(response);
              },
              error: function(err) {
                console.log("fetchPresData AJAX failed : " + err);
              }
            });

        }

      },
      findAhead: function(){
        var sub = jQuery('input:radio[name=sub_ahead]:checked').closest('td').next('td').map(function(){
          return jQuery(this).text();
        }).get();
        var sub_price = jQuery('input:radio[name=sub_ahead]:checked').closest('td').next('td').next('td').map(function(){
          return jQuery(this).text();
        }).get();
        jQuery.ajax({
          type: "GET",
          crossdomain: true,
          url: "https://sih.pbehre.in/api/v3/findAhead/"+sub,
          data: {key: sub},
          success: function(response){
            data = showObject(response);
            console.log(data);
            var html = "";
            for(var i=0; i<data.length; i++){
              var storeName = data[i][0]['name'] + ", ";
              var storeAdd = data[i][0]['address'] + ", India";
              var full_add = storeName + storeAdd;

              html +="<tr><td><label class='radio'><input type='radio' name='stores_ahead'><i class='icon-radio'></i></label></td><td>";
              html += full_add;
              html += "</td></tr>";
            }
            jQuery('#ahead-data-stores').html(html);
            jQuery('#results').hide();
            jQuery('#results2').show();
          },
          error: function(err){
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
      url: "https://sih.pbehre.in/api/v3/alt/"+key,
      crossdomain: true,
      data: {key: key},
      success: function(response){
        data = showObject(response);
        data = data[0];
        html= "";
        console.log(data);
        for(var i=0; i<data.length; i++){
          var name = data[i]['name'];
          var price = data[i]['price'];
          html += "<tr><td><label class='radio'><input type='radio' name='sub_ahead' value='find'><i class='icon-radio'></i></label></td>";
          html += "<td>" + name + "</td>";
          html += "<td>" + price + "</td></tr>";
        }
        jQuery('#ahead-data').html(html);
        jQuery("#results").show();
      },
      error: function(err){
        console.log('typeahead:selected ajax failed : ' + err);
      }
    });
    
  }).keyup(function() {

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
  var it=0;
  for (var p in JSONobj) {
      if( JSONobj.hasOwnProperty(p) ) {
          // result = JSONobj[p];
          result[it]=JSONobj[p];
          it++;
      }
  }
  return result;
}
function navigate(){
  var store_add = jQuery('input:radio[name=stores_ahead]:checked').closest('td').next('td').text();
  //alert(store_add);
  console.log(store_add);
  launchnavigator.navigate("" + store_add);
}