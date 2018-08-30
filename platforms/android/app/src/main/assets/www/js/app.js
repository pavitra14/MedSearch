//custom URL plugin code
function handleOpenURL(url) {
  var qr = url.slice(8);
  //alert(qr);
  var data = localStorage.getItem("LocalData");
  data = JSON.parse(data);
  data[data.length] = [moment().format('lll'), qr];
  localStorage.setItem("LocalData", JSON.stringify(data));
  location.href = '/prescriptions/';
}

jQuery.noConflict();
// jQuery Code
jQuery(document).ready(function () {
  // Init F7 Vue Plugin
  Vue.use(Framework7Vue, Framework7)

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

  // Init App
  new Vue({
    el: '#app',
    // Init Framework7 by passing parameters here
    framework7: {
      root: '#app', // App root element
      id: 'com.pbehre.medsearch', // App bundle ID
      name: 'MedSearch', // App name
      theme: 'auto', // Automatic theme detection
      // App routes
      routes: [{
          path: '/about/',
          component: 'page-about'
        },
        {
          path: '/prescriptions/',
          component: 'prescriptions'
        },
        {
          path: '(.*)',
          component: 'page-not-found',
        },
      ],
    },
    methods: {
      greet: function (event) {
        alert('Hello, World!')
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
              var data = localStorage.getItem("LocalData");
              data = JSON.parse(data);

              data[data.length] = [moment().format('lll'), value];
              localStorage.setItem("LocalData", JSON.stringify(data));
              //alert("Scan successful ");
              location.href = '/prescriptions/'; //Change this
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
    minLength: 1
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

  });
  //line to fix typeahead padding issues
  jQuery('.twitter-typeahead').attr("style", "");
  //Search Code End
});