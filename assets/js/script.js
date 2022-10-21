const language = 'pt-br';
const endpoint = 'http://dataservice.accuweather.com';
const apikey = 'mAOouOTheS4Ujswtr0lBhS8S9lu3qpSg';

let city, currentConditionsCity, forecastCity;

(async () => {

    let nameCity = storageGet('nameCity');

    if(nameCity){
        nameCity = nameCity.replaceAll('"', ' ');
        meteorological(nameCity);
    }

})();

$('#form').submit(function( event ) {
    event.preventDefault();
    searchMeteorological();
});

$('#button-search').click(function(event){
    event.preventDefault();
    searchMeteorological();
});

async function searchMeteorological(){
    
    let search = $('#input-search').val();
    
    if(search.length <= 3){
        return;
    }

    meteorological(search);

    $('#input-search').blur();
}

async function meteorological(search){

    city = await getCity(search);
    if(!city){
        return;
    }

    currentConditionsCity = await getCurrentConditionsCity(city.Key);
    if(!currentConditionsCity){
        return;
    }

    forecastCity = await getForecastCity(city.Key);
    if(!forecastCity){
        return;
    }

    storageSet('nameCity', city.EnglishName);
    storageSet('keyCity', city.Key);

    await template();

}

async function template(){

    $('.day').hide();
    $('.night').hide();
    
    const momentjs = moment(currentConditionsCity.EpochTime).add(city.TimeZone.GmtOffset, 'hours');
    let time = momentjs.format('LT');
    let wind = forecastCity.DailyForecasts[0].Day.Wind; 
    let windGust = forecastCity.DailyForecasts[0].Day.WindGust;
    
    let rain = forecastCity.DailyForecasts[0].Day.Rain;
    
    let min =  forecastCity.DailyForecasts[0].Temperature.Minimum.Value;
    let max = forecastCity.DailyForecasts[0].Temperature.Maximum.Value;

    if(!currentConditionsCity.IsDayTime){

        $('.night').show();

        wind = forecastCity.DailyForecasts[0].Night.Wind; 
        windGust = forecastCity.DailyForecasts[0].Night.WindGust;
        rain = forecastCity.DailyForecasts[0].Night.Rain;

    }
    else{
        $('.day').show();
    }

    $('.time').html(time);
    $('.title-city').html(`${city.EnglishName} - ${city.AdministrativeArea.ID}`);
    $('.weather-icon').attr('src', `https://www.accuweather.com/images/weathericons/${currentConditionsCity.WeatherIcon}.svg`);
    $('.temp').html(`${Math.round(currentConditionsCity.Temperature.Metric.Value)}°`);
    $('.weather-text').html(currentConditionsCity.WeatherText);

    $('.min-temp').html(`${Math.round(min)}°`);
    $('.max-temp').html(`${Math.round(max)}°`);
    

    $('.temp-real').html(`${currentConditionsCity.Temperature.Metric.Value}° C`);
    $('.rain').html(`${rain.Value} ${rain.Unit}`);
    $('.wind-speed').html(`${wind.Speed.Value} ${wind.Speed.Unit}`);
    $('.wind-gust-speed').html(`${windGust.Speed.Value} ${windGust.Speed.Unit}`);

    $('.container-meteorological').show();
    
}

async function getCity(search){

    let result = null;
    let resultCity = await httpGet('locations/v1/cities/search', {q: search});

    if(resultCity.length > 0){
        result = resultCity[0];
    }

    return result;
}

async function getCurrentConditionsCity(key){

    let result = null;
    let resultCurrentConditionsCity = await httpGet(`currentconditions/v1/${key}`, {language: language});

    if(resultCurrentConditionsCity.length > 0){
        result = resultCurrentConditionsCity[0];
    }

    return result;
}

async function getForecastCity(key){

    let result = null;
    let resultForecastCity = await httpGet(`forecasts/v1/daily/1day/${key}`, {language: language, details: true, metric: true});

    if(resultForecastCity){
        result = resultForecastCity;
    }

    return result;
}

async function httpGet(url, queryParameters = {}){
    
    queryParameters.apikey = apikey;
    
    let result = await $.get(`${endpoint}/${url}`, queryParameters);
    
    return result;
    
}