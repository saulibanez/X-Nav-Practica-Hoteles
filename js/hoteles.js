var collection = new Object ();
var collectionUser = new Object ();
var nameHotel = "";
var apiKey = 'AIzaSyBYWVrkrCDrCGEqe-QQi3reE9Spmp3yH8w';
var datos = [];

function viewStar(){
	console.log("veo estrellas");
	var cpylist = list;
	$('#attr').html(cpylist);
}

function handleClientLoad() {
	gapi.client.setApiKey(apiKey);
}

// Load the API and make an API call.  Display the results on the screen.
function makeApiCall(id_user, mode) {
	gapi.client.load('plus', 'v1', function() {
		var request = gapi.client.plus.people.get({
			'userId': id_user
		});

		request.execute(function(resp) {
			var heading = document.createElement('h4');
			var image = document.createElement('img');
			image.src = resp.image.url;
			heading.appendChild(image);
			heading.appendChild(document.createTextNode(resp.displayName));

			if (mode == "new"){
				collectionUser[nameHotel].push(id_user);
			}
			document.getElementById('profile').appendChild(heading);
		});
	});
}

function show_accomodation(){

	var accomodation = accomodations[$(this).attr('no')];
	var lat = accomodation.geoData.latitude;
	var lon = accomodation.geoData.longitude;
	var url = accomodation.basicData.web;
	var name = accomodation.basicData.name;
	nameHotel = name;
	var desc = accomodation.basicData.body;
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
	$('#name_prof').html('<h2>' + name + '</h2>'	+ '<p>Type: ' + cat + ', subtype: ' + subcat + '</p>' + desc);
	
	var img = new Array();
	if(accomodation.multimedia != null){
    	for(i in accomodation.multimedia.media){
    		img[i] = accomodation.multimedia.media[i].url;
    	}
    }

    $('#im1').html('<img src="' + img[0] + '"">');
    $('#im2').html('<img src="' + img[1] + '"">');
    $('#im3').html('<img src="' + img[2] + '"">');
    $('#im4').html('<img src="' + img[4] + '"">');


	$("#profile").html("");
	collectionUser[name].forEach(function(n){
		makeApiCall(n,"null");
	});
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
				var googleplus = [];
				collectionUser[accomodations[i].basicData.title] = googleplus;
			}
			list = list + '</ul>';
			$('#list').html(list);
			$('li').click(show_accomodation);
			$('.category').click(viewStar);
			$("#list li").draggable({revert:true,appendTo:"body",helper:"clone"});
		});
	};

$(document).ready(function() {
	map = L.map('map').setView([40.4175, -3.708], 11);
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	$("#get").click(get_accomodations);

	$("#form").submit(function(event) {
		event.preventDefault();
		var new_col = $("#date")[0].value;
		$("#date")[0].value = "";
		if (new_col == ""){ 
			return;
		}
		$("#attr ul").append("<li>" + new_col + "</li>");
		var alojamiento = [];
		collection[new_col] = alojamiento;

		$("#attr").click(function(event){
			var coll = event.target.textContent;
			$("#name_col ul").html(coll)

			$("#list_hoteles ul").html("");
			var hotel;
			collection[coll].forEach(function(n){
				hotel = n.basicData.name;
				$("#list_hoteles ul").append("<li>" + hotel + "</li>");
			});
		});

		$("#save").click(function(event){
			var token = $("#token").val();
			var repo = $("#repo").val();
			var file = $("#file").val();
			var github = new Github({token:token,auth:"oauth"});

			var texto = JSON.stringify(collection);
			var repository = github.getRepo("saulibanez", repo);
			repository.write("gh-pages", file, texto, "file", function(err){});
		});
	});

	$("#load").click(function(event){
		var token = $("#token2").val();
		var repo = $("#repo2").val();
		var file = $("#file2").val();
		var github = new Github({token:token,auth:"oauth"});
		var repository = github.getRepo("saulibanez", repo);

		var url = "https://api.github.com/repos/saulibanez/" + repo + "/contents/" + file;
		$.getJSON(url).done(function(data){
			var json_parse = JSON.parse(decodeURIComponent(escape(atob(data.content))));
			
			$.each(json_parse,function(key,value){
				collection[key] = value;
				$("#attr ul").html("<li>" + key + "</li>");
			});

			$("#attr li").click(function(event){
				var coll = event.target.textContent;
				$("#name_col").html(coll);
				$("#list_hoteles ul").html("");
				var hotel;
				collection[coll].forEach(function(n){
					hotel = n.basicData.name;
					$("#list_hoteles ul").append("<li>" + hotel + "</li>");
				});
			});
		});
	});

	$("#list_hoteles").droppable({
		accept: "#list li",
		activeClass: "ui-state-hover",
		hoverClass: "ui-state-active",
		drop: function(event, ui) {
			var name = $("#name_col")[0].textContent;
			
			if (name == ""){
				return;
			}

			var no = ui.draggable[0].attributes[0].value;
			var hotel = accomodations[no].basicData.name;
			collection[name].push(accomodations[no]);
			$("#list_hoteles ul").append("<li>" + hotel + "</li>");
		}
	});

	$("#form2").submit(function(event) {
		event.preventDefault();

		var id_user = $("#perfil")[0].value;
		$("#perfil")[0].value = "";
		if (id_user == ""){
			return;
		}
		if(nameHotel == ""){
			return;
		}
		makeApiCall(id_user, "new");

	});

	$('#Carousel').carousel({
        interval: 5000
    });

});