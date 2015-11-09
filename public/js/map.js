'use strict';
var status = localStorage.getItem("status");
var username = localStorage.getItem("username");
var email = null;

$(document).ready(function(){
    // Render the navigation bar
    if(status=="in"){
        $("#login").hide();
        $("#signup").hide();
        var dsturl = "/v1/user/"+username;
        $.get(dsturl,function(data){
                email = data.primary_email;
            }
        )
        // create a new image with the src pointing to the user's gravatar
        var gravatar = $('<img>').attr({src: 'http://www.gravatar.com/avatar/' + md5(email)});
        // append this new image to some div, or whatever
        $('#gravatar').replaceWith(gravatar);
        // update the profile.jade link when logged in
        //var link = "/profile.jade.html?username=" + username;
        var link = "/v1/user/" + username;
        $("#profile.jade").attr("href", link);
    }
    else{
        $("#gravatar").hide();
        $("#logout").hide();
    }

    // Define logout behaviour
    $("#logout").click(function(){
        localStorage.setItem("status","out");
        localStorage.removeItem("username");
        window.location.href = "/map.html";
    }).mouseover(function(){
        $(this).css({ "color": "black"});
    }).mouseleave(function(){
        $(this).css({ "color": "lightblue" });
    });

    // Get the map tiles
    var map = L.map('map').setView([36.1667, -86.7833], 9);
    L.tileLayer('/v1/tile?type=vfr&z={z}&x={x}&y={y}',{tms: 'true'}).addTo(map);

    // Callback function after click
    map.on('click', function(e) {
        var lat = e.latlng.lat,
            lng = e.latlng.lng;
        console.log("Longitude: " + lng + " Latitude: " + lat);
        $.get('v1/airport/?lat=' + lat + 'long=' + lng + 'maxDist=10000',function(res,req){
            console.log("Nearest airport and distance: " + req.body.nearestAirport);
        });
    });
});
