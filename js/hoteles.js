
function viewStar(){
	console.log("veo estrellas");

	// $('#attr').html(list);
}

function show_accomodation(){

	var accomodation = accomodations[$(this).attr('no')];
	var lat = accomodation.geoData.latitude;
	var lon = accomodation.geoData.longitude;
	var url = accomodation.basicData.web;
	var name = accomodation.basicData.name;
	var desc = accomodation.basicData.body;
	//var img = accomodation.multimedia.media[0].url;
	// console.log(accomodation.multimedia.media);
	var cat = accomodation.extradata.categorias.categoria.item[1]['#text'];
	var subcat = accomodation.extradata.categorias.categoria.subcategorias.subcategoria.item[1]['#text'];
	var marker = L.marker([lat, lon]).addTo(map).bindPopup('<a href="' + url + '">' + name + '</a><br/>').openPopup();

	if($(this).css("color")=="rgb(0, 128, 0)"){
		map.removeLayer(marker);
		$($(this)).css("color","rgb(51, 51, 51)");
	}else{
		$($(this)).css("color","rgb(0, 128, 0)");
	}

	marker.on("popupclose", function(){
		map.removeLayer(marker);
	})

	map.setView([lat, lon], 15);
	$('#desc').html('<h2>' + name + '</h2>'	+ '<p>Type: ' + cat + ', subtype: ' + subcat + '</p>' + desc); // + '<img src="' + img + '"">');
	
	var img = new Array();
	if(accomodation.multimedia != null){
    	for(i in accomodation.multimedia.media){
    		img[i] = accomodation.multimedia.media[i].url;
    	}
    }
    // console.log(img);
    $('#carousel').html('<img src="' + img[1] + '"">');

};

function get_accomodations(){
  $.getJSON("alojamientos.json", function(data) {
    $('#get').html('');
    accomodations = data.serviceList.service
    var list = '<p>Hotels found: ' + accomodations.length
     + ' (click on any of them for details and location in the map)</p>'
    list = list + '<ul>'
    for (var i = 0; i < accomodations.length; i++) {
      list = list + '<li no=' + i + '>' + accomodations[i].basicData.title + '</li>';
    }
    list = list + '</ul>';
    $('#list').html(list);
    $('li').click(show_accomodation);
	$('.category').click(viewStar);
  });
};

$(document).ready(function() {
	map = L.map('map').setView([40.4175, -3.708], 11);
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	$("#get").click(get_accomodations);
});