/**
 * Manage register/login/forgot password
 */
jQuery(function ($) {

    var keeper = '';

    // Set form listeners since buttons and form submits
    // are different
    $( "#regform" ).submit(function( event ) {
      event.preventDefault();
      $('.sign-up').trigger('click');
      $('.login').trigger('click');
    });

    $( "#logform" ).submit(function( event ) {
      event.preventDefault();
      $('.login-button').trigger('click');
    });

    $( "#pasform" ).submit(function( event ) {
      event.preventDefault();
      $('.reset-button').trigger('click');
    });


    // Handle signup
    $('.sign-up').on('click', function( e ){
        e.preventDefault();

        var user = $('.username.reg').val();
        var pass = $('.password.reg').val();

        $.ajax({
            url: "/account/registerlp",
            type: "POST",
            data: {
                UserName: user ,
                Password: pass
            },
            success: function(data, status, xhr){

                if ( data.indexOf('Success') != -1 ){
                    // window.location.href = "/" + presentationId;
                  //  $(window).triggerHandler('loginSuccess');
                    window.location.href = "/" + presentationId;
                    //TODO: hide login form and all the overlays
                } else {

                    if ( data.indexOf('mail') != -1 ||  data.indexOf('exist') != -1) {
                        $('.field-validation-error-user').popError(data);

                        $('.sign-up').prop('disabled', false);
                    }
                    if ( data.indexOf('Fail') != -1) {
                        $('.field-validation-error-user').popError("An error has occurred, please verify your email address");

                        $('.sign-up').prop('disabled', false);
                    } 
                    if ( data.indexOf('pass') != -1 || data.indexOf('Pass') != -1) {
                        $('.field-validation-error-password').popError(data);

                        $('.sign-up').prop('disabled', false);
                    }
                    if ( data.indexOf('login') != -1) {
                        login();
                    }
                }           
            }
        });

        return false;
    });


    // Handle login
    $('.login').on('click', login);

    function login (e) {
        // e.preventDefault();
        var user = $('.username.reg').val();
        var pass = $('.password.reg').val();

        $.ajax({
            url: "/account/LogOnLP",
            type: "POST",
            data: {
                UserName: user,
                Password: pass
            },
            success: function(data, status, xhr){

                if ( data.indexOf('Success') != -1 ){
                    // window.location.href = "/" + presentationId; //why reload and not re-fetch presentation data? by not re-loading we can call a function on sucess of login, such as duplicate or download

                    window.parent.postMessage('loggedin', '*');

                    window.location.href = "/" + presentationId;
                    //$(window).triggerHandler('loginSuccess');
                    //TODO: hide login form and all the overlays
                } else {                    

                    if ( data.indexOf('mail') != -1 || data.indexOf('exist') != -1) {
                        $('.field-validation-error-user').popError(data);
                        $('.login-button').prop('disabled', false);
                    }
                    if ( data.indexOf('Fail') != -1) {
                        $('.field-validation-error-user').popError( "An error has occurred, please verify your email address");
                        $('.login-button').prop('disabled', false);
                    } 
                    if ( data.indexOf('pass') != -1 || data.indexOf('Pass') != -1) {
                        $('.field-validation-error-password').popError(data);
                        $('.login-button').prop('disabled', false);
                    }
                }
            }
        });

        return false;
    }

    // error pop up controling method
    $.fn.popError = function(msg){
        // pop the error
        $(this)
        .hide()
        .text( msg )
        .show()
        .animate({'bottom': '0px'}, 300, 'easeOutBounce');

        // Hide error messages on input focus
        $('input').one('focus', function(){
            $('.field-validation-error-password')
            .add('.field-validation-error-user')
            .delay(300)
            .animate({'bottom': '-40px'}, 300).empty();
        });
    }

});