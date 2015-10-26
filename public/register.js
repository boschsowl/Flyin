'use strict';

var validate = function() {

    var username = $("#username").val();
    var first_name = $("#first_name").val();
    var last_name = $("#last_name").val();
    var password = $("#password").val();
    var dob = $("#dob").val();
    var address_street = $("#address_street").val();
    var address_city = $("#address_city").val();
    var address_state = $("#address_state").val();
    var address_zip = $("#address_zip").val();
    var primary_phone = $("#primary_phone").val();
    var primary_email = $("#primary_email").val();

    var ready = false;

    $('#form').validate({
        rules: {
            username: {
                required: true,
                rangelength:[6,16],
                alphanumeric: true
            },
            first_name: {
                required:true,
                rangelength:[6,16],
                alphanumeric: true
            },
            last_name: {
                required:true,
                rangelength:[6,16],
                alphanumeric: true
            },
            password: {
                required: true,
                minlength: 8
            },
            address_street:{
                required:true
            },
            address_city:{
                required:true
            },
            address_state:{
                required:true,
                stateUS:true
            },
            address_zip:{
                minlength:5,
                digits: true
            },
            primary_phone:{
                phoneUS:true
            },
            primary_email:{
                required:true,
                email:true
            }
        }
    });
    function checkStrength(password)
    {
        var count = 0;
        //if password contains both lower and uppercase characters, increase strength value
        if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))  count += 1

        //if it has numbers and characters, increase strength value
        if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/))  count += 1

        //if it has one special character, increase strength value
        if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))  count += 1

        if (count<3) {
            alert("Your password should be greater than 8 characters and contain a lower-case, an upper-case, a number and a symbol.");
            return false;
        }
        else{
            return true;
        }
    }
    ready = checkStrength(password);

    var data = {
        username: username,
        password: password,
        first_name: first_name,
        last_name: last_name,
        primary_email: primary_email,
        dob: dob,
        address_street: address_street,
        address_city: address_city,
        address_state: address_state,
        address_zip: address_zip,
        primary_phone: primary_phone
    };
    if(ready) {

        $("#form").submit(function (elem) {
            elem.preventDefault();
            $.post("/v1/user", data).success(
                function () {
                    localStorage.setItem("status","in");
                    localStorage.setItem("username",data.username);
                    var redirect = "/v1/user/" + data.username;
                    $('#form').fadeOut(function () {
                        window.location.href = redirect;
                    });
                }
            ).fail(
                function (err) {
                    console.log(err);
                }
            );
        });
    }
};