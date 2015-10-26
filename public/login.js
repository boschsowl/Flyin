'use strict';

var execAjax = function() {
    var username = $("#username").val();
    var password = $("#password").val();

    $.post("/v1/session",{username:username,password:password}).success(
        function(){
            localStorage.setItem("status","in");
            localStorage.setItem("username", username);
            $('#logform').fadeOut(function () {
                window.location.href = "/map.html";
            });
        }
    ).fail(
        function(err){
            console.log(err);
        }
    )

};
