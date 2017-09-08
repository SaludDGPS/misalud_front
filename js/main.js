var GobMXMiSalud    = {
    init            : function () {
        moment.locale( 'es' );

        GobMXMiSalud.setupCalendar();
        GobMXMiSalud.setupCustomSelect();
        GobMXMiSalud.setupRegister();
        GobMXMiSalud.setupVideoModal();
    },

    setupCalendar   : function () {
        var pickerOpts  = {
            format              : 'DD/MM/YYYY',
            collapse            : false,
            allowInputToggle    : true,
            tooltips: {
                selectMonth: 'Selecciona un mes',
                prevMonth: 'Mes anterior',
                nextMonth: 'Mes siguiente',
                selectYear: 'Selecciona un año',
                prevYear: 'Año anterior',
                nextYear: 'Año siguiente',
            }
        };

        var jQ          = $;
        var messages    = $( '#messages-container .messages' );
        var setData     = function ( dateSet, ignoreDueDate ) {
            // Define el valor de ignoreDueDate desde la función en vez que desde el atributo
            ignoreDueDate = ignoreDueDate === undefined || ignoreDueDate === false ? false : true;

            $.getJSON( 'data/misalud.json', function ( data ) {
                var valid           = _.filter( data, function ( d ) {
                        return d.flow != 'null' && ( !ignoreDueDate || ( ignoreDueDate && d.relative_to != 'rp_duedate' ) );
                    }),
                    types           = _.uniq( _.pluck( valid, 'relative_to' ) );
                    calendarData    = _.map( valid, function ( v, i ) {
                    var flowDate    = moment( dateSet ).add( v.offset, 'days' );
                    var color       = '#000000';

                    if ( v.flow_name.indexOf( 'consejo' ) != -1 || v.flow_name.indexOf( 'milk' ) != -1 ||
                        v.flow_name.indexOf( 'mosquitos' ) != -1 || v.flow_name.indexOf( 'nutrition' ) != -1 ||
                        v.flow_name.indexOf( 'development' ) != -1 || v.flow_name.indexOf( 'extra' ) != -1 ||
                        v.flow_name.indexOf( 'lineaMaterna' ) != -1 || v.flow_name.indexOf( 'labor' ) != -1 ) { // consejos
                        color       = '#2bd6ce';
                    } else if ( v.flow_name.indexOf( 'reto' ) != -1 ) { // retos
                        color       = '#da48ef';
                    } else if ( v.flow_name.indexOf( 'reminders' ) != -1 || v.flow_name.indexOf( 'freePD' ) != -1 ||
                        v.flow_name.indexOf( 'getBirth' ) != -1 || v.flow_name.indexOf( 'miAlerta' ) != -1 ) { // recordatorios
                        color       = '#8de530';
                    } else if ( v.flow_name.indexOf( 'planning' ) != -1 || v.flow_name.indexOf( 'miAlerta_followUp' ) != -1 || v.flow_name.indexOf( 'miAlta' ) != -1 ) { // planificacion
	                    color 		= '#f4e52c';
                    } else if ( v.flow_name.indexOf( 'incentives' ) != -1 ) { // incentivos
	                    color 		= '#986ae2';
                    } else if ( v.flow_name.indexOf( 'prevent' ) != -1 || v.flow_name.indexOf( 'concerns' ) != -1 ||
                    			v.flow_name.indexOf( 'miscarriage' ) != -1 || v.flow_name.indexOf( 'prematuro' ) != -1 ) { // preocupaciones
	                    color 		= '#f9a35d';
                    }

                    return {
                        id          : v.flow,
                        color       : color,
                        name        : v.flow,
                        startDate   : flowDate.toDate(),
                        endDate     : flowDate.add( 1, 'days' ).toDate()
                    }
                }),
                    vars_replace    = {
                        '@contact.rp_babyname'          : 'tu bebe',
                        '@contact.rp_apptdate'          : moment( dateSet ).add( 5, 'days' ).format( 'dddd, MMMM Do' ),
                        '@contact.rp_duedate'           : moment( dateSet ).format( 'dddd, MMMM Do' ),
                        '@contact.rp_name'              : 'Maria',
                        '@contact.rp_planhospital'      : 'Clinica de salud',
                        '@contact.tel_e164'             : 'tel_e164',
                        '@contact.rp_alerta_time'       : moment().format( 'dddd, MMMM Do, h:mm' ),
                        '@contact.rp_deliverydate'      : moment( dateSet ).format( 'dddd, MMMM Do' ),
                        '@contact.rp_duedate'           : moment( dateSet ).format( 'dddd, MMMM Do' ),
                        '@contact.rp_mialerta_time'     : moment().format( 'dddd, MMMM Do, h:mm' ),
                        '@contact.rp_mialta_apptdate'   : moment( dateSet ).add( 5, 'days' ).format( 'dddd, MMMM Do' ),
                        '@contact.rp_mialta_duedate'    : moment().format( 'dddd, MMMM Do' ),
                        '@contact.rp_mialta_init'       : moment().format( 'dddd, MMMM Do' ),
                    };

                jQ( '#tryit-calendar' ).calendar({
                    language        : 'es',
                    clickDay        : function ( e ) {

                        // Muestra el teléfono en el móvil
                        if ($(window).width() < 768) {
                            $('#simulator-phone').css('display', 'block');
                        }

                        if ( e.events && e.events.length > 0 ) {
                            var id      = e.events[0].id,
                                form    = $( '#chat-form' );

                            form.fadeOut();
                            form.unbind( 'submit' );
                            $.getJSON( 'data/flows/' + id + '.json', function ( flow ) {
                                var actions_sets    = flow.flows[0].action_sets,
                                    rules           = flow.flows[0].rule_sets && Array.isArray( flow.flows[0].rule_sets ) && flow.flows[0].rule_sets.length > 0 && flow.flows[0].rule_sets[0].rules;
                                var msg             = "";
                                to_append           = "";
                                for (var i = 0; i < actions_sets[0].actions.length; i++) {
                                   msg              = actions_sets[0].actions[i].msg.spa;
                                   for ( var key in vars_replace ) {
                                     msg     = msg.split( key ).join( vars_replace[key] );
                                   } 
                                   to_append += '<div class="message"><p>' + msg + '</p>'+"</div>";
                                }
                                messages.html( $( to_append));
                                if ( actions_sets.length > 0 ) {
                                    form.fadeIn();
                                    form.on( 'submit', function ( e ) {
                                        e.preventDefault();
                                        var response    = $( '#chat-input' ).val();

                                        if ( response && response != '' ) {
                                            var evaluated   = false;
                                            messages.append( $( '<div class="message response-message"><p>' + response + '</p></div>' ) );
                                            $( '#chat-input' ).val( '' );

                                            _.each( rules, function ( r ) {
                                                if ( evaluated ) return;

                                                var supported   = r.test && r.test.test && r.test.test.spa.split( ' ' );
                                                if ( supported.indexOf( response.toLowerCase() ) != -1 ) {
                                                    evaluated   = true;

                                                    var system_r    = _.find( actions_sets, function ( a ) {
                                                            return a.uuid == r.destination;
                                                        }),
                                                        system_msg  = system_r.actions[0].msg.spa;
                                                    for ( var key in vars_replace ) {
                                                        system_msg  = system_msg.split( key ).join( vars_replace[key] );
                                                    }

                                                    messages.append( $( '<div class="message"><p>' + system_msg + '</p></div>' ) );
                                                }
                                            });
                                        }

                                        return false;
                                    });
                                }
                            });
                        }
                    },
                    dataSource      : calendarData
                });
                $( '#tryit-tool-container' ).fadeIn( function () {
                    if ( $( window ).width() > 761 ) {
                        var element         = $( '#simulator-phone' ),
                            elementHeight   = element.height(),
                            parentHeight    = $( '#tryit-calendar' ).height() + 50,
                            originalY       = element.offset().top;

                        // Space between element and top of screen (when scrolling)
                        var topMargin   = 100;

                        // Should probably be set in CSS; but here just for emphasis
                        element.css( 'position', 'relative' );

                        $( window ).on( 'scroll', function() {
                            var scrollTop = $( window ).scrollTop();
                            if ( ( scrollTop - originalY + topMargin + elementHeight ) > parentHeight ) {
                                return;
                            }

                            element.stop( false, false ).animate({
                                top     : ( scrollTop < originalY ) ? 0 : scrollTop - originalY + topMargin
                            }, 300 );
                        });
                    }
                });
            });
        };
        var date_period     = $( '#date-period-picker' ).datetimepicker( pickerOpts );
        var date_baby       = $( '#date-baby-picker' ).datetimepicker( pickerOpts );
        var date_baby_alt   = $( '#date-baby-alt-picker' ).datetimepicker( pickerOpts );

        $( '.control-calendar' ).click( function ( e ) {
            var $el     = $( e.currentTarget ),
                type    = $el.data( 'type' );

            if ( $el.hasClass( 'active' ) ) return;

            $( '.control-calendar.active' ).removeClass( 'active' );
            $el.addClass( 'active' );

            if ( type == 'pregnant' ) {
                $( '#datepickers_baby' ).css({
                    position    : 'absolute',
                    opacity     : 0,
                    display: 'none'
                });
                $( '#datepickers_pregnant' ).css({
                    position    : 'relative',
                    opacity     : 1,
                    display: 'block'
                });

                date_period.on( 'dp.change', function ( e ) {
                    // No permite seleccionar fechas futuras
                    date_period.data('DateTimePicker').maxDate(new Date());
                    $( '#date-baby' ).val( '' );

                    setData( moment( e.date._d ).add( 280, 'days' ).toDate() );
                });
                date_baby.on( 'dp.change', function ( e ) {
                    $( '#date-period' ).val( '' );

                    setData(e.date._d);
                });
            } else {
                $( '#datepickers_pregnant' ).css({
                    position    : 'absolute',
                    opacity     : 0,
                    display: 'none'
                });
                $( '#datepickers_baby' ).css({
                    position    : 'relative',
                    opacity     : 1,
                    display: 'block'
                });

                date_baby_alt.on( 'dp.change', function ( e ) {
                    setData( e.date._d, true );
                });
            }
        });
    },

    setupCustomSelect 	: function () {
	    $('.custom-select').each(function(){
		    var $this = $(this), numberOfOptions = $(this).children('option').length;

		    $this.addClass('select-hidden');
		    $this.wrap('<div class="select"></div>');
		    $this.after('<div class="select-styled"></div>');

		    var $styledSelect = $this.next('div.select-styled');
		    $styledSelect.text($this.children('option').eq(0).text());

		    var $list = $('<ul />', {
		        'class': 'select-options'
		    }).insertAfter($styledSelect);

		    for (var i = 0; i < numberOfOptions; i++) {
		        $('<li />', {
		            text: $this.children('option').eq(i).text(),
		            rel: $this.children('option').eq(i).val()
		        }).appendTo($list);
		    }

		    var $listItems = $list.children('li');

		    $styledSelect.click(function(e) {
		        e.stopPropagation();
		        $('div.select-styled.active').not(this).each(function(){
		            $(this).removeClass('active').next('ul.select-options').hide();
		        });
		        $(this).toggleClass('active').next('ul.select-options').toggle();
		    });

		    $listItems.click(function(e) {
		        e.stopPropagation();
		        $styledSelect.text($(this).text()).removeClass('active');
		        $this.val($(this).attr('rel'));
		        $this.trigger('change');
		        $list.hide();
		        //console.log($this.val());
		    });

		    $(document).click(function() {
		        $styledSelect.removeClass('active');
		        $list.hide();
		    });

		});
    },

    setupRegister   : function () {
        var mediaEl = $( '#media' ),
            nameEl  = $( '#contact-name' ),
            phoneEl = $( '#phone-number' ),
            formEl  = $( '#register-form' ),
            self = this;

        formEl.submit( function ( e ) {
            e.preventDefault();
            var media   = mediaEl.val();
            if ( media == 'facebook' ) {
                window.open( 'http://m.me/gobmxmisalud', '_blank' );
            } else if ( media == 'sms' ) {
                var captchaResponse     = grecaptcha.getResponse();
                if ( captchaResponse == '' ) {
                    $('#messageModal .modal-body p').text( "No pudimos completar tu registro. Por favor revisa que todos los datos sean correctos." );
                    $('#messageModal').modal('show');
                } else if ( !nameEl.val() || nameEl.val() == '' ) {
                    $('#messageModal .modal-body p').text("Ingrese el nombre de contacto.");
                    $('#messageModal').modal('show');
                } else if ( !phoneEl.val() || phoneEl.val() == '' ) {
                    $('#messageModal .modal-body p').text("Ingrese su número telefónico.");
                    $('#messageModal').modal('show');
                } else if (!/^\d{10}$/.test(phoneEl.val()) ) {
                    $('#messageModal .modal-body p').text("Ingrese un número telefónico correcto (de 10 dígitos).");
                    $('#messageModal').modal('show');
                } else {
                    $('#loader-container').css('display', 'block');
                    var contact_url = "https://rapidpro.datos.gob.mx/api/v2/contacts.json";
                    var contact_uuid;
                    var flow_to_run;
                    //Register new contact
                    $.ajax({
                        url         : contact_url,
                        type        : 'POST',
                        headers     : { "Authorization": "Token " +
                                         "436d7fcbf36d026aba085a8adfa7f14796c06a38"},
                        data        : {"name" : nameEl.val(),
                                        "urns": 'tel:+52'+phoneEl.val()},
                        dataType    : 'json',
                       error : function(res) {
                             $('#loader-container').css('display', 'none');
                              //Ask uuid contact
                              $('#confirmRegModal .modal-body p').text('').append('' +
                                '<span>Tu número ya está registrado en misalud.</span>' +
                                '<span>¿Deseas registrarte de nuevo?</span>' +
                                '<span>Esto borrará la información de tu último registro.</span>')
                              ;
                              $('#confirmRegModal').modal('show');
                              $('#confirmRegModal .btn-prima').on('click', function() {
                                  //Ask to rapidpro uuid
                                  $.ajax({
                                      url: contact_url+"?urn=tel%3A%2B52"+phoneEl.val(),
                                      type: 'GET',
                                      headers: { "Authorization": "Token " +
                                             "436d7fcbf36d026aba085a8adfa7f14796c06a38"},
                                      dateType: 'json',
                                      success: function(data) {
                                         contact_uuid = data['results'][0]['uuid'];
                                         flow_to_run = "20308c47-002a-446c-a4f8-a21482f66bc8" ;
                                        beginFlow(flow_to_run, contact_uuid);
                                      }
                                 });
                                  $('#confirmRegModal').modal('hide');
                              });
                        },
                        success     : function ( res ) {
                            nameEl.val( '' );
                            phoneEl.val( '' );
                            $( '.btn-primary', formEl ).addClass( 'disabled' ).attr( 'disabled', true );

                            $( '#loader-container' ).css( 'display', 'none' );
                            var contact_uuid = res['uuid'];
                            flow_to_run= "dc950557-3519-4fd7-8385-52187cf84df9";
                            beginFlow(flow_to_run,contact_uuid);
                            $( '#messageModal .modal-body p' ).text( "¡Registro exitoso! Pronto recibirás un mensaje de misalud a tu celular" );
                            $( '#messageModal' ).modal('show');
                        },
                    })
            }
         }
            return false;
        });

        mediaEl.change( function () {
            if ( mediaEl.val() == 'sms' ) {
	            $( '.form-submit' ).removeClass( 'submit-fixed' );
                phoneEl.fadeIn();
                nameEl.fadeIn();
            } else {
	            $( '.form-submit' ).addClass( 'submit-fixed' );
                phoneEl.fadeOut();
                nameEl.fadeOut();
            }
        });
    },

    setupVideoModal : function () {
        $( '#videoModal' ).on( 'hide.bs.modal', function () {
            $( "#videoModal iframe" ).attr( "src", jQuery( "#videoModal iframe" ).attr( "src" ) );
        })
    },
};

$( document ).ready( GobMXMiSalud.init )

// Funtion to begin a rapidpro flow
function beginFlow (flow_to_run, contact_uuid) {
  var flow_url    = "https://rapidpro.datos.gob.mx/api/v2/flow_starts.json";
  $.ajax({
      url         : flow_url,
      type        : 'POST',
      headers     : { "Authorization": "Token " +
                      "436d7fcbf36d026aba085a8adfa7f14796c06a38"},
      data        : {"flow" : flow_to_run,
                     "contacts": contact_uuid,
                     "restart_participants":"true"},
      dataType    : 'json',
   });
}

  // Cierra el simulador al seleccionar el botón de cerrar
  $('#simulator-phone .close.rounded').on('click', function() {
    if ($(window).width() < 768) {
        $('#simulator-phone').css('display', 'none');
    }
  });
