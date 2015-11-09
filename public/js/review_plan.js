'user strict';

$(document).ready(function(){
    $("#delete").click(function(){
        var ident = $("#ident").val();
        $.delete("/v1/plan/delete",ident).success(
            function(){
                console.log("Plan deleted.");
            }
        );
    });
    var getQueryString = function ( field, url ) {
        var href = url ? url : window.location.href;
        var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
        var string = reg.exec(href);
        return string ? string[1] : null;
    };
    var final_id = getQueryString("id",document.URL);

    var dsturl = "/v1/plan/"+final_id;
    $.get(dsturl,function(data){
            $("#type").text(data.type);
            $("#ident").text(data.ident);
            $("#special_equip").text(data.special_equip);
            $("#true_airspeed").text(data.true_airspeed);
            $("#departure").text(data.departure);
            $("#dept_time_proposed").text(data.dept_time_proposed);
            $("#dept_time_actual").text(data.dept_time_actua);
            $("#cruise_alt").text(data.cruise_alt);
            $("#route").text(data.route);
            $("#dst").text(data.dst);
            $("#ete").text(data.ete);
            $("#remarks").text(data.remarks);
            $("#fuel").text(data.fuel);
            $("#alt_airports").text(data.alt_airports);
            $("#name").text(data.name);
            $("#dst_contact").text(data.dst_contact);
            $("#num_aboard").text(data.num_aboard);
            $("#color").text(data.color);
        }
    )
});