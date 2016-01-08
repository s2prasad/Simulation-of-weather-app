var Weather = {
	config: {
		
		weatherAPIBaseURL: 'https://api.forecast.io/forecast/',
		weatherAPIKey: 'e7e24b0c2ed28d21902c654dccb5a073',
	},
	
	selectedCityId:'',
	
	cities:[
		{
			id:'sanjose',
			name: 'San Jose',
			lat: 37.3382082,
			lng: -121.88632860000001
		
		},{
			id:'sydney',
			name: 'Sydney',
		  	lat: -33.8674869,
		  	lng: 151.20699020000006
		
		}
	],
	
    formatTemperature: function(temp) {
      // If using US units, then convert from Celsius.
      // See: http://fahrenheittocelsius.com
      return Math.round(this.useUSUnits ?  (temp * 9/5 + 32) : temp) +"˚";
    },
	
	 formatPercentage: function(value) {
    return Math.round(value * 100) + "%";
  		},

    formatTime: function(time, showMinutes) {
		var date= new Date(0);
		date.setUTCSeconds(time);
		
      var hours    = date.getHours(),
          meridian = 'AM';
    
      if(hours >= 12) {
        if(hours > 12) {
          hours -= 12;
        }
        meridian = 'PM';
      }
    
      if (hours == 0) {
        hours = 12;
      }
    
      if(showMinutes) {
        var minutes = date.getMinutes();
        if(minutes < 10) {
          minutes = '0'+minutes;
        }
      
        return hours + ':' + minutes + ' ' + meridian;
      }
      return hours +  ' ' + meridian;
  },
	
	showCitiesList: function(){
		var cities=this.cities;

		var html='';
		if(cities){
			for(var i=0; i<cities.length; i++){

				var city=cities[i];
				if(city.weatherData){
					var classes=this.conditionClassname(city.weatherData);
					console.log(city);
					html+='<li id="'+city.id+'" class="'+classes+'"><a href="#city/'+city.id+'"><div class="city-list"><span>'+ this.formatTime(this.getLocalDate(city.weatherData.currently.time, city.weatherData.offset,new Date().getTime()), true)+'</span><p>'+city.name+'</p></div><p class="temp">'+this.formatTemperature(city.weatherData.currently.temperature)+'</p></a></li>'
				}
			}
		}

		$(".cities-list ul").html(html);
		
	},
	conditionClassname: function(data) {
	    var classNames = '';

	    if(data) {
	      var conditionsNow = data.hourly.data[0],
	          date          = new Date(conditionsNow.time * 1000);
	          
	      // It is day if you're between sunrise and sunset. Then add the is-day class. Otherwise, add is-night
	      if(conditionsNow.time >= data.daily.data[0].sunriseTime && conditionsNow.time <= data.daily.data[0].sunsetTime) {
	        classNames += 'is-day ';
	      } else {
	        classNames += 'is-night ';
	      }

	      if(conditionsNow.icon.indexOf('cloudy') != -1 || conditionsNow.cloudCover > 0.2) {
        		classNames += 'is-cloudy ';
      		}
	    }
	    return classNames;
	 },

	renderSelectedCity: function(){
		var dataSelectedCity= this.cityDataForId(this.selectedCityId);
		if(dataSelectedCity.weatherData){
			this.renderSelectedCityBackground(dataSelectedCity);
			this.renderCityHeader(dataSelectedCity);
			this.renderCityNav(dataSelectedCity);
			this.renderTodayTemp(dataSelectedCity);
			this.renderWeekDays(dataSelectedCity);
			this.renderSummary(dataSelectedCity);
			this.renderHighlights(dataSelectedCity);
			this.renderNav(dataSelectedCity, this.selectedCityId);
		}
	},

	renderNav: function(city, cityId){
		var index=-1, prev, next, cur, prevHtml='', nextHtml='';
		for(var i=0, iLen=this.cities.length; i<iLen; i++) {
     		 if(this.cities[i].id === cityId) {
       		 	index=i;
      		}
    	}
    	if(index==0)
    	{
    		prev=index;
    		next=index+1;
    	}
    	else if(index==this.cities.length-1){
    		prev=index-1;
    		next=index;
    	}else
    	{
    		prev=index-1;
    		next=index+1;
    	}
    	console.log("prev"+prev);
    	console.log("index"+index);
    	prevHtml="#city/"+this.cities[prev].id;
    	nextHtml="#city/"+this.cities[next].id;
    	$('.prev-button a').attr('href',prevHtml);
    	$('.next-button a').attr('href',nextHtml);

	},
	renderSelectedCityBackground: function(city) {
    	$('body').removeClass('is-cloudy').removeClass('is-night').removeClass('is-day').addClass(this.conditionClassname(city.weatherData));
    	$('nav').removeClass('is-cloudy').removeClass('is-night').removeClass('is-day').addClass(this.conditionClassname(city.weatherData));
  	},

	renderCityHeader: function(city){
		var html="<h2 class='city-name'>"+ city.name+ "</h2>";
		html+="<h4 class='report'>"+ city.weatherData.currently.summary+"</h4>";
		html+="<h1 class='temperature'>"+ this.formatTemperature(city.weatherData.currently.temperature)+"</h1>";
		$('.city-header').html(html);
	},

	renderCityNav: function(city){
		var cityNavHtml='';
		var localDate  = this.getLocalDate(city.weatherData.currently.time, city.weatherData.offset),
	    diff           = Math.round((localDate.getTime() - new Date().getTime())/(24*3600*1000)),
	    relativeDate   = 'Today';
	    if(diff < 0) {
	      relativeDate = 'Yesterday';
	    } else if(diff > 0) {
	      relativeDate = 'Tomorrow';
	    }
	    cityNavHtml="<ul><li class='day'>";
	    cityNavHtml+=this.weekDayForDate(localDate)+"</li>";
	    cityNavHtml+="<li class='yest'>"+relativeDate+"</li>";
	    cityNavHtml+="<li class='now-temp'>"+city.weatherData.daily.data[0].temperatureMax+"</li>";
	    cityNavHtml+="<li class='yest-temp'>"+city.weatherData.daily.data[0].temperatureMin+"</li>";
	    cityNavHtml+="</ul>";
	    $('.city-navigation').html(cityNavHtml);
	},

	renderTodayTemp: function(city){
		var tbody='',todayTimeHtml='',todayImgHtml='', todayTimeTempHtml='';
		tbody= "<table><tbody></tbody></table>";
		todayTimeHtml= "<tr class='today-time'>";
		todayImgHtml="<tr class='today-img'>";
		todayTimeTempHtml= "<tr class='today-time-temp'>";
		var hourlyData= city.weatherData.hourly.data;
		var dataLength= Math.min(hourlyData.length, 24);

		for(var i = 0; i < dataLength; i++ )
		{
			if(i==0){
				todayTimeHtml+="<th>Now</th>";
				todayImgHtml+="<td><img class='weather-img' src='icons/"+hourlyData[i].icon+".png' alt='Weather image'/></td>";
				todayTimeTempHtml+="<td>"+this.formatTemperature(hourlyData[i].temperature, false) +"</td>";
			}
			else
				todayTimeHtml+="<th>"+this.formatTime(hourlyData[i].time) +"</th>";
			   	todayImgHtml+="<td><img class='weather-img' src='icons/"+hourlyData[i].icon+".png' alt='Weather image'/></td>";
				todayTimeTempHtml+="<td>"+this.formatTemperature(hourlyData[i].temperature, false) +"</td>";
		}
		todayTimeHtml+="</tr>";
		todayImgHtml+="</tr>";
		todayTimeTempHtml+="</tr>";
		$('.today-temp').html(tbody);
		$('.today-temp table tbody').append(todayTimeHtml);
		$('.today-temp table tbody').append(todayImgHtml);
		$('.today-temp table tbody').append(todayTimeTempHtml);
	},

	getLocalDate: function(time, timezoneOffset, timeOffsetSinceLastRefresh) {
	    timeOffsetSinceLastRefresh = timeOffsetSinceLastRefresh ? timeOffsetSinceLastRefresh : 0;
	    var date  = new Date(time * 1000 + timeOffsetSinceLastRefresh);
	    var utc   = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes());
	    
	    utc.setHours(utc.getHours() + timezoneOffset);
	    return utc;
	  },
	weekDayForDate: function(date) {
		    return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][date.getDay()];
	 },

	renderWeekDays: function(city){
		var tbody= "<table class='week-table'><tbody></tbody></table>";
		var dailyData=city.weatherData.daily.data;
		var tableRow="";
		var dataLength= Math.min(city.weatherData.hourly.data.length, 7);
		for( var i = 1; i <= dataLength; i++){
			var dailyForecastDate = this.getLocalDate(dailyData[i].time, city.weatherData.offset);
			 tableRow+="<tr><td>"+this.weekDayForDate(dailyForecastDate)+"</td>";
			 tableRow+="<td><img class='weather-img' src='icons/"+dailyData[i].icon+".png' alt='Weather image'/></td>";
			 tableRow+="<td>"+dailyData[i].temperatureMax+"</td>";
			tableRow+="<td>"+dailyData[i].temperatureMin+"</td></tr>";
		}
		
		$('.week-days').html(tbody);
		$('.week-table tbody').append(tableRow);
	},

	renderSummary: function(city){
		var todayData= city.weatherData.daily.summary;
		var summaryHtml="<p>Today: "+todayData+"</p>";
		$('div.summary').html(summaryHtml);
	},

	renderHighlights: function(city){
		var hourlyData= city.weatherData.hourly.data[0];
		var dailyData= city.weatherData.daily.data[0];
		var data= "<table><tbody></table></tbody>";
		var highlightData="<tr><td>Sunrise:</td><td>"+this.formatTime(dailyData.sunriseTime)+"</td></tr>";
		highlightData+="<tr><td>Sunset:</td><td>"+this.formatTime(dailyData.sunsetTime)+"</td></tr>";
		highlightData+="<tr><td> </td><td><td/></tr>";
		highlightData+="<tr><td>Chance of rain:</td><td>"+this.formatPercentage(hourlyData.precipProbability)+"</td>";
		highlightData+="<tr><td>Humidity:</td><td>"+this.formatPercentage(hourlyData.humidity)+"</td></tr>";
		highlightData+="<tr><td> </td><td><td/></tr>";
		highlightData+="<tr><td>Wind:</td><td>"+this.formatTime(hourlyData.sunsetTime)+"</td></tr>";
		highlightData+="<tr><td>Feels like:</td><td>"+this.formatTime(dailyData.sunsetTime)+"</td></tr>";
		highlightData+="<tr><td> </td><td><td/></tr>";
		highlightData+="<tr><td>Precipitation:</td><td>"+this.formatTime(hourlyData.sunsetTime)+"</td></tr>";
		highlightData+="<tr><td>Pressure:</td><td>"+this.formatTime(dailyData.sunsetTime)+"</td></tr>";
		highlightData+="<tr><td> </td><td><td/></tr>";
		highlightData+="<tr><td>Visibility:</td><td>"+this.formatTime(hourlyData.sunsetTime)+"</td></tr>";
		$('.highlights').html(data);
		$('.highlights table tbody').append(highlightData);
	},

	getWeatherDataForCityId: function(city, context){
		var self = this;
		$.ajax({
			url: this.config.weatherAPIBaseURL + this.config.weatherAPIKey + '/'+ city.lat +","+city.lng+"?units=si",
			jsonp: 'callback',
			dataType: 'jsonp',
			success: function(data){
				console.log("success");
				city.weatherData=data;
				if(context=='list'){
					self.showCitiesList();
				} else if(context=='detail'){
					self.renderSelectedCity();
				}
			}
		})
	},
	getDataForCities: function(){
		var cities=this.cities;
		if(cities){
			for(var i=0; i< cities.length; i++){
				console.log('cities[i]'+cities[i]);
				this.getWeatherDataForCityId(cities[i], 'list');
			}
		}	
	},

	 // Return for a given id, the city
  cityDataForId: function(id) {
    var cities = this.cities;
    for(var i=0, iLen=cities.length; i<iLen; i++) {
      if(cities[i].id === id) {
        return cities[i];
      }
    }
    return null;
  },


	showCity: function(id){
		$('body').removeClass().addClass(id);
		$('.cities-list').css('display','none');
		$('div.city').css('display','block');
		this.selectedCityId = id;
		this.getWeatherDataForCityId(this.cityDataForId(id),'detail');
		
	},

	parseRoute: function(){
		var hash= window.location.hash;
		this.selectedCityId= null;
		console.log(hash.indexOf('#city/'));
		if(hash.indexOf('#city/')!==-1){
			this.showCity(hash.split('#city/')[1]);
		}
		else{
			this.getDataForCities();
		}
	},
	
	showPosition: function(position) {
	    console.log( "Latitude: " + position.coords.latitude +  "<br>Longitude: " + position.coords.longitude); 
	},

	init: function() {
		var self=this;
	    if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(this.showPosition);
	    }
		self.parseRoute();
	    $(window).on('hashchange', function() {
	      self.parseRoute();
	    });
	}	
	
};

$(window).ready(function(){
	Weather.init();
})
