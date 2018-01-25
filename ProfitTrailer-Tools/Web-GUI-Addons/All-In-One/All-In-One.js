//Binance-Advanced-Exchange.js
//Binance-Advanced-Exchange.js
//Binance-Advanced-Exchange.js
function binanceAdvancedExchange() {
  $("table td.market.all a").each(function() {
    var value = $(this).attr("href");
    var queryParams = new URLSearchParams($(this).prop("search"));
    var symbolParam = queryParams.get("symbol");
    var exchanges = ["BTC", "ETH", "BNB", "USDT"];
    var newSymbol = "";

    $.each(exchanges, (function(i, exchange) {
      var parts = symbolParam.split(exchange);
      
      if(parts[1] === "") {
        newSymbol = parts[0].replace("_", "") + "_" + exchange;
        return false;
      }
    }));

    queryParams.set("symbol", newSymbol);
    
    $(this).attr("href", value.replace("www.binance.com/trade.html","www.binance.com/tradeDetail.html"));
    $(this).prop("search", "?" + queryParams.toString());
  });
}

$("body").on('DOMSubtreeModified', "#dvLastUpdatedOn", function() {
  binanceAdvancedExchange();
});
$(".dca-log, .pairs-log, .dust-log, .sales-log, .pending-log, .possible-buys-log").on("click", function() {
  setTimeout(function(){ binanceAdvancedExchange(); }, 100 );
});

//Binance-Advanced-Exchange.js
//Binance-Advanced-Exchange.js
//Binance-Advanced-Exchange.js
function estimatePercent() {
    var todayPercentCalc = ($("#mTodayProfit").text()/$("#mTotalCurrentVal").text()*100).toFixed(2);
    var todayPercent = todayPercentCalc + '%';
    $(".usd-value").css({'margin-bottom':'0px'});
    if ($("#mTodayProfit").text() !== "")
    { 
        if ($("#mTodayProfitPCTValue").text() === "") {
        $("span.market-price-calculations.text-profittd").append('<label class="usd-value"><span class="full-text">Estimated Percent Gain&nbsp;</span><span class="short-text">Est. % Gain&nbsp;</span></label><span class="mb-0  main-text" id="mTodayProfitPCTValue" title="'+todayPercent+'">'+todayPercent+'</span>');
        } else {
            $("#mTodayProfitPCTValue").attr("title",todayPercent);
            $("#mTodayProfitPCTValue").text(todayPercent);
        }
    }
}

estimatePercent();
$("body").on('DOMSubtreeModified', "#mTodayProfitUSDValue", function() {
    estimatePercent();
});

//Graphing-Tracker.js
//Graphing-Tracker.js
//Graphing-Tracker.js
(function(){
	var util = {};

	util.createHiDPICanvas = function( w, h, ratio, elementUse ) {
		if( !window.PIXEL_RATIO ) {
		    window.PIXEL_RATIO = ( function () {
				var ctx = document.createElement( "canvas" ).getContext( "2d" ),
				dpr = window.devicePixelRatio || 1,
				bsr = ctx.webkitBackingStorePixelRatio ||
						ctx.mozBackingStorePixelRatio ||
						ctx.msBackingStorePixelRatio ||
						ctx.oBackingStorePixelRatio ||
						ctx.backingStorePixelRatio || 1;

			    return dpr / bsr;
			})();
		}
	    if ( !ratio ) { ratio = window.PIXEL_RATIO; }
	    var can = ( Array.isArray( elementUse ) ? elementUse[0] : elementUse );
	    can.width = w * ratio;
	    can.height = h * ratio;
	    can.style.width = w + "px";
	    can.style.height = h + "px";
	    can.getContext( "2d" ).setTransform( ratio, 0, 0, ratio, 0, 0 );
	    return can;
	};

	util.graph = function() {
		this.stats = {
			totalSamples: 30,
			data: []
		};
		this.stats.data = new Array( this.stats.totalSamples );
		this.stats.data = this.stats.data.join( ',' ).split( ',' ).map( function() { return null; });
	};

	util.graph.prototype.setSelector = function( selector ) {
		this.destination = selector[0];

		var width = selector.width();
		var height = selector.height();

		var canvas = $( '#myCanvas' );
		var self = this;
		if( canvas.length < 1 ) {
			$( 'body' ).append( '<div style="position:absolute;display:none;"><canvas id="myCanvas"></canvas></div>' );
			var canvas = $( '#myCanvas' );
			canvas = util.createHiDPICanvas( width, height, 1, canvas[0] );
			util.canvas = canvas;
			util.canvasContext = canvas.getContext( '2d' );
		}
		this.canvas = canvas;
	};

	util.graph.prototype.rangePad = .02;

	util.graph.prototype.updateStats = function( value ) {
		this.stats.data.push( value );
		this.stats.data.shift(); // remove the oldest value
	};

	util.graph.prototype.drawStats = function() {
		var ctx = util.canvasContext;
		var size = this.destination.getBoundingClientRect()

		if( util.canvas == undefined || util.canvas.height == undefined ) {
			return;
		}

		if( size.width != util.canvas.width || size.height != util.canvas.height ) {
			util.canvas = util.createHiDPICanvas(size.width, size.height, 1, $( '#myCanvas' )[0] );
			util.canvasContext = util.canvas.getContext( '2d' );
		}
		ctx.clearRect( 0, 0, size.width, size.height );
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		ctx.beginPath();
		var first = true;
		var totalRun = this.stats.totalSamples;
		var range = { min: 1e8, max: -1e8, size: 0 };
		this.stats.data.forEach( function( c ){
			if( c !== null ) {
				range.min = Math.min( c, range.min );
				range.max = Math.max( c, range.max );
			}
		});

		range.min -= this.rangePad; //pad range size
		range.max += this.rangePad; //pad range size
		range.size = range.max - range.min;

		var first = true;
		var index = 0;
		for( var i = 0; i < totalRun; i++ ) {
			if( this.stats.data[i] != null ) {
				if( first ) {
					first = false;
					ctx.moveTo( index/totalRun * size.width, size.height - (( this.stats.data[i] - range.min ) / range.size * size.height ));
				} else {
					ctx.lineTo( index/totalRun * size.width, size.height - (( this.stats.data[i] - range.min ) / range.size * size.height ));
				}
				index++;
			}
		}
		ctx.stroke();
		var res = 'url(' + util.canvas.toDataURL() + ')';

		this.destination.style['backgroundImage'] = res;
		this.destination.style['backgroundRepeat'] = 'no-repeat';

	};

	var containers = {
		dca: {
			dataName: 'dcaLogData',
			name: 'dtDcaLogs',
			statName: 'profit',
			childDestination: 'profit',
			pairAppend: ''
		},
		pairs: {
			dataName: 'gainLogData',
			name: 'dtPairsLogs',
			statName: 'profit',
			childDestination: 'profit',
			pairAppend: ''
		},
		pbl: {
			dataName: 'bbBuyLogData',
			name: 'dtPossibleBuysLog',
			statName: 'currentValue',
			childDestination: 'current-value',
			pairAppend: '_PBL'
		},
		dust: {
			dataName: 'dustLogData',
			name: 'dtDustLogs',
			statName: 'profit',
			childDestination: 'profit',
			pairAppend: '_DUST'
		},
		pending: {
			dataName: 'pendingLogData',
			name: 'dtPendingLogs',
			statName: 'profit',
			childDestination: 'profit',
			pairAppend: '_PEND'
		}
	};

	var pairData = {};

	var freshPairCutoff = 30000;
	function tick( data ) {
		var now = Date.now();
		var keys = Object.keys( pairData );
		for( var i = 0; i < keys.length; i++ ) {
			if( now - pairData[keys[i]].lastTick > freshPairCutoff ) {
				delete pairData[keys[i]];
			}
		}

		var dataTypes = Object.keys( containers );
		for( var i = 0; i < dataTypes.length; i++ ) {
			var source = data[containers[dataTypes[i]].dataName];
			for( var j = 0; j < source.length; j++ ) {
				var pair = source[j].market + containers[dataTypes[i]].pairAppend;
				if( pairData[pair] == undefined ) {
					pairData[pair] = {
						lastTick: now,
						graph: new util.graph()
					};
				} else {
					pairData[pair].lastTick = now;
				}
				pairData[pair].graph.updateStats( source[j][containers[dataTypes[i]].statName] / 100 );
			}
		}
	}

	function render() {

		var renderTypes = Object.keys( containers );
		for( var i = 0; i < renderTypes.length; i++ ) {
			var curContainer = containers[renderTypes[i]];
			var curParent = $( '#' + curContainer.name );
			if( curParent.width() != 100 ) {
				var curParent = $( '#' + curContainer.name + ' tbody tr' );
				for( var j = 0; j < curParent.length; j++ ) {
					var curType = $( curParent[j] ).children( '.market' ).children( 'a' ).html();
					var cur = pairData[curType+curContainer.pairAppend];
					if( cur !== undefined ) {
						//we can render it!
						cur.graph.setSelector( $( curParent[j] ).children( '.' + curContainer.childDestination ));
						cur.graph.drawStats();
					}
				}
				return; // --- we rendered this one, dont render any others.
			}
		}
	}

	// listen to AJAX requests:

	function addXMLRequestCallback( callback ) {
	    var oldSend, i;
	    if( XMLHttpRequest.callbacks ) {
	        // we've already overridden send() so just add the callback
	        XMLHttpRequest.callbacks.push( callback );
	    } else {
	        // create a callback queue
	        XMLHttpRequest.callbacks = [callback];
	        // store the native send()
	        oldSend = XMLHttpRequest.prototype.send;
	        // override the native send()
	        XMLHttpRequest.prototype.send = function() {

	            for( i = 0; i < XMLHttpRequest.callbacks.length; i++ ) {
	                XMLHttpRequest.callbacks[i]( this );
	            }
	            // call the native send()
	            oldSend.apply( this, arguments );
	        }
	    }
	}

	addXMLRequestCallback( function( xhr ) {
		xhr.onreadystatechange = function() {
			if( xhr.readyState == 4 && xhr.status == 200 ) {
			    if( xhr.responseURL.indexOf( 'data' ) > -1 ) {
			    	var data = JSON.parse( xhr.response );
			    	tick( data );
			    }
			}
		};
	});

	$( "body" ).on( 'DOMSubtreeModified', "#dvLastUpdatedOn", function() {
		render();
	});
	$( ".dca-log,.dust-log,.pairs-log,.possible-buys-log,.pending-log" ).on( "click", function(){
		setTimeout( function(){ render(); }, 100 );
	});
})();

//USD-Estimate.js
//USD-Estimate.js
//USD-Estimate.js
var currency = "btc"; //btc or eth

function estimate() {
	$("#dtDcaLogs th.total-cost").text('Estimated Value');
	$('.summary-table').removeClass('col-md-3').removeClass('col-md-4').addClass('col-md-4');
	$.getJSON("https://www.cryptonator.com/api/ticker/" + currency + "-usd", function(data) {
		var btc1 = data.ticker.price;
		//DCA
		if (!$('#dtDcaLogs thead .est-usd').length) {
			$('#dtDcaLogs thead tr').append('<th class="text-right est-usd all sorting" rowspan="1" colspan="1" style="width: 92px;">Estimated Value</th>');
		}
		$('#dtDcaLogs tbody tr').each(function() {
			$(this).find('.est-usd').remove();
			$(this).append('<td class="text-right est-usd all"></td>');
			var num1 = $(this).find('.current-value').html().split("<br>")[1];
			var num2 = $(this).find('.current-value').html().split("<br>")[0];
			var calc = num2 - num1;
			var btc = calc.toFixed(8);
			var usd = btc * btc1;
			var difference = usd.toFixed(2);
			var sta = num2 * btc1;
			var total = sta.toFixed(2);
			if (difference > 0) {
				$(this).find('.est-usd').html('<span style="color:#05b16f;"><i style="color:#98a6ad;font-style:normal;">$' + total + '</i><br>$' + difference + '</span>');
			} else {
				$(this).find('.est-usd').html('<span style="color:#d85353;"><i style="color:#98a6ad;font-style:normal;">$' + total + '</i><br>$' + difference + '</span>');
			}
		});
		$("#dcLogDifference").find('b').remove();
		$("#dcLogTotalCurrentVal").find('b').remove();
		$("#dcLogRealCost").find('b').remove();
		var val = $('#dcLogTotalCurrentVal').text();
		var bou = $('#dcLogRealCost').text();
		var calc = val - bou;
		var btc = calc.toFixed(8);
		var est = bou * btc1;
		var bought = est.toFixed(2);
		var usd = btc * btc1;
		var difference = usd.toFixed(2);
		var sta = val * btc1;
		var total = sta.toFixed(2);
		$("#dcLogDifference").prepend('<b style="color:#98a6ad;font-weight:400;margin-right:5px">($' + difference + ')</b>');
		$("#dcLogTotalCurrentVal").prepend('<b style="color:#98a6ad;font-weight:400;margin-right:8px">($' + total + ')</b>');
		$("#dcLogRealCost").prepend('<b style="color:#98a6ad;font-weight:400;margin-right:8px">($' + bought + ')</b>');
		//Pairs
		if (!$('#dtPairsLogs thead .est-usd').length) {
			$('#dtPairsLogs thead tr').append('<th class="text-right est-usd all sorting" rowspan="1" colspan="1" style="width: 92px;">Estimated Value</th>');
		}
		$('#dtPairsLogs tbody tr').each(function() {
			$(this).find('.est-usd').remove();
			$(this).append('<td class=" text-right est-usd all"></td>');
			var num1 = $(this).find('.bought-cost').text();
			var num2 = $(this).find('.current-value').text();
			var calc = num2 - num1;
			var btc = calc.toFixed(8);
			var usd = btc * btc1;
			var difference = usd.toFixed(2);
			var sta = num2 * btc1;
			var total = sta.toFixed(2);
			if (difference > 0) {
				$(this).find('.est-usd').html('<span style="color:#05b16f;"><i style="color:#98a6ad;font-style:normal;">$' + total + '</i><br>$' + difference + '</span>');
			} else {
				$(this).find('.est-usd').html('<span style="color:#d85353;"><i style="color:#98a6ad;font-style:normal;">$' + total + '</i><br>$' + difference + '</span>');
			}
		});
		$("#pairsLogDifference").find('b').remove();
		$("#pairsLogTotalCurrentVal").find('b').remove();
		$("#pairsLogRealCost").find('b').remove();
		var val = $('#pairsLogTotalCurrentVal').text();
		var bou = $('#pairsLogRealCost').text();
		var calc = val - bou;
		var btc = calc.toFixed(8);
		var est = bou * btc1;
		var bought = est.toFixed(2);
		var usd = btc * btc1;
		var difference = usd.toFixed(2);
		var sta = val * btc1;
		var total = sta.toFixed(2);
		$("#pairsLogDifference").prepend('<b style="color:#98a6ad;font-weight:400;margin-right:5px">($' + difference + ')</b>');
		$("#pairsLogTotalCurrentVal").prepend('<b style="color:#98a6ad;font-weight:400;margin-right:8px">($' + total + ')</b>');
		$("#pairsLogRealCost").prepend('<b style="color:#98a6ad;font-weight:400;margin-right:8px">($' + bought + ')</b>');
		//Dust
		if (!$('#dtDustLogs thead .est-usd').length) {
			$('#dtDustLogs thead tr').append('<th class="text-right est-usd all sorting" rowspan="1" colspan="1" style="width: 92px;">Estimated Value</th>');
		}
		$('#dtDustLogs tbody tr').each(function() {
			$(this).find('.est-usd').remove();
			$(this).append('<td class=" text-right est-usd all"></td>');
			var num1 = $(this).find('.bought-cost').text();
			var num2 = $(this).find('.current-value').text();
			var calc = num2 - num1;
			var btc = calc.toFixed(8);
			var usd = btc * btc1;
			var difference = usd.toFixed(2);
			var sta = num2 * btc1;
			var total = sta.toFixed(2);
			if (difference > 0) {
				$(this).find('.est-usd').html('<span style="color:#05b16f;"><i style="color:#98a6ad;font-style:normal;">$' + total + '</i><br>$' + difference + '</span>');
			} else {
				$(this).find('.est-usd').html('<span style="color:#d85353;"><i style="color:#98a6ad;font-style:normal;">$' + total + '</i><br>$' + difference + '</span>');
			}
		});
		$("#dustLogDifference").find('b').remove();
		$("#dustLogTotalCurrentVal").find('b').remove();
		$("#dustLogRealCost").find('b').remove();
		var val = $('#dustLogTotalCurrentVal').text();
		var bou = $('#dustLogRealCost').text();
		var calc = val - bou;
		var btc = calc.toFixed(8);
		var est = bou * btc1;
		var bought = est.toFixed(2);
		var usd = btc * btc1;
		var difference = usd.toFixed(2);
		var sta = val * btc1;
		var total = sta.toFixed(2);
		$("#dustLogDifference").prepend('<b style="color:#98a6ad;font-weight:400;margin-right:5px">($' + difference + ')</b>');
		$("#dustLogTotalCurrentVal").prepend('<b style="color:#98a6ad;font-weight:400;margin-right:8px">($' + total + ')</b>');
		$("#dustLogRealCost").prepend('<b style="color:#98a6ad;font-weight:400;margin-right:8px">($' + bought + ')</b>');
		//Sales
		$("#salesLogDifference").find('b').remove();
		$("#salesLogTotalCurrentVal").find('b').remove();
		$("#salesLogBoughtCost").find('b').remove();
		var val = $('#salesLogTotalCurrentVal').text();
		var bou = $('#salesLogBoughtCost').text();
		var calc = val - bou;
		var btc = calc.toFixed(8);
		var est = bou * btc1;
		var bought = est.toFixed(2);
		var usd = btc * btc1;
		var difference = usd.toFixed(2);
		var sta = val * btc1;
		var total = sta.toFixed(2);
		$("#salesLogDifference").prepend('<b style="color:#98a6ad;font-weight:400;margin-right:5px">($' + difference + ')</b>');
		$("#salesLogTotalCurrentVal").prepend('<b style="color:#98a6ad;font-weight:400;margin-right:8px">($' + total + ')</b>');
		$("#salesLogBoughtCost").prepend('<b style="color:#98a6ad;font-weight:400;margin-right:8px">($' + bought + ')</b>');
	});
}
$("body").on('DOMSubtreeModified', "#dvLastUpdatedOn", function() {
	estimate();
});
$(".dca-log, .pairs-log, .dust-log, .sales-log").on("click", function() {
	estimate();
});
