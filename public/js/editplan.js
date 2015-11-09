'use strict';

var review = function() {
    var ident = $("#ident").val();
    var special_equip = $("#special_equip").val();
    var true_airspeed = $("#true_airspeed").val();
    var departure = $("#departure").val();
    var dept_time_proposed = $("#dept_time_proposed").val();
    var dept_time_actual= $("#dept_time_actual").val();
    var cruise_alt = $("#cruise_alt").val();
    var route = $("#route").val();
    var dst = $("#dst").val();
    var ete= $("#ete").val();
    var remarks = $("#remarks").val();
    var fuel = $("#fuel").val();
    var alt_airports = $("#alt_airports").val();
    var name = $("#name").val();
    var num_aboard = $("#num_aboard").val();
    var color = $("#color").val();
    var dst_contact = $("#dst_contact").val();

    $(document).ready(function () {
        $( "#planform" ).validate({
            rules: {
                depature: {
                    required: true
                },
                dst: {
                    required: true
                }
            }
        });
    });

    var data = {
        type:type,
        ident: ident,
        special_equip: special_equip,
        true_airspeed: true_airspeed,
        departure: departure,
        dept_time_proposed: dept_time_proposed,
        dept_time_actual: dept_time_actual,
        cruise_alt: cruise_alt,
        route: route,
        dst: dst,
        ete:ete,
        remarks: remarks,
        fuel: fuel,
        alt_airports: alt_airports,
        name: name,
        dst_contact:dst_contact,
        num_aboard: num_aboard,
        color: color

    }

    $("#planform").submit(function(elem){
        elem.preventDefault();
        $.post("/v1/plan",data).success(
            function(data) {
                var redirect = "/review_plan.html?id=" + data.planid;
                $('#planform').fadeOut(function () {
                    window.location.href = redirect;
                });
            }
        ).fail(
            function(err){
                // For debug use
                console.log(!data ||
                !data.type ||
                !data.ident ||
                !data.special_equip ||
                !data.true_airspeed ||
                !data.departure ||
                !data.dept_time_proposed ||
                !data.dept_time_actual ||
                !data.cruise_alt ||
                !data.route ||
                !data.dst ||
                !data.ete ||
                !data.remarks ||
                !data.fuel ||
                !data.alt_airports ||
                !data.name ||
                !data.num_aboard ||
                !data.color ||
                !data.dst_contact);
                console.log(err);
            }
        );
    });
};
