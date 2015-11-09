'user strict';
var status = localStorage.getItem("status");
var username = localStorage.getItem("username");
var email = null;

$(document).ready(function(){
    // get id from url string
    var getQueryString = function ( field, url ) {
        var href = url ? url : window.location.href;
        var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
        var string = reg.exec(href);
        return string ? string[1] : null;
    };
    var final_id = getQueryString("username",document.URL);

    if(status=="in"){
        $("#login").hide();
        $("#signup").hide();
        var dsturl = "/v1/user/"+final_id;
        $.get(dsturl,function(data){
                email = data.primary_email;
            }
        )
        // create a new image with the src pointing to the user's gravatar
        var gravatar = $('<img>').attr({src: 'http://www.gravatar.com/avatar/' + md5(email)});
        // append this new image to some div, or whatever
        $('#gravatar').replaceWith(gravatar);
    }
    else{
        $("#edit").hide();
        $("#gravatar").hide();
        $("#logout").hide();
        $("#plan").hide();
    }

    $("#logout").click(function(){
        localStorage.setItem("status","out");
        localStorage.removeItem("username");
        window.location.href = "/map.html";
    }).mouseover(function(){
        $(this).css({ "color": "black"});
    }).mouseleave(function(){
        $(this).css({ "color": "lightblue" });
    });

    // The flight plans should be fetched with an AJAX call and rendered with an Underscore template on the client.
    var dsturl = "/v1/user/"+final_id;
    console.log(dsturl);
    $.get(dsturl,{username:username},function(plans){
        plans.forEach(function(plan){
            var tmpl = _.template("<h1><a href=<%= review_plan.html %>><%= id %></a></h1> <p><%=date%></p> <p><%=from%></p> <p><%=to%></p>");
            var data = tmpl({
                id: plan._id,
                date: plan.date,
                from: plan.from,
                to: plan.to
            });
            $('#plans').append(data);
        });
    });

});

